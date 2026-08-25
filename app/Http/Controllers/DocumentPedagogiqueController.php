<?php

namespace App\Http\Controllers;

use App\Models\DocumentPedagogique;
use App\Models\Classe;
use App\Models\Matiere;
use App\Models\AnneeScolaire;
use App\Models\Enseignant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Traits\HandlesStudentAccess;
use App\Traits\HandlesTeacherAccess;

class DocumentPedagogiqueController extends Controller
{
    use HandlesStudentAccess, HandlesTeacherAccess;

    public function __construct()
    {
        $this->middleware('permission:voir_documents')->only('index');
        $this->middleware('permission:ajouter_documents')->only('store');
        $this->middleware('permission:supprimer_documents')->only('destroy');
    }

    public function index(Request $request)
    {
        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        if (!$currentYear) return back()->with('error', 'Année scolaire non configurée.');

        // 🎓 VUE ÉLÈVE
        if ($this->isStudent()) {
            $inscription = $this->getStudentInscription();
            if (!$inscription) return back()->with('error', 'Non inscrit.');

            $params = $request->only(['matiere_id', 'type']);
            
            $query = DocumentPedagogique::with(['matiere', 'enseignant.user'])
                ->where('classe_id', $inscription->classe_id)
                ->where('annee_scolaire_id', $currentYear->id);

            if ($request->matiere_id) {
                $query->where('matiere_id', $request->matiere_id);
            }
            if ($request->type) {
                $query->where('type', $request->type);
            }

            $documents = $query->latest()->get();
            $matieres = Matiere::whereHas('cours', function($q) use ($inscription) {
                $q->where('classe_id', $inscription->classe_id);
            })->orderBy('nom')->get();

            return Inertia::render('Documents/StudentIndex', [
                'documents' => $documents,
                'matieres' => $matieres,
                'filters' => $params
            ]);
        }

        // 👨‍🏫 VUE ENSEIGNANT
        if ($this->isTeacher()) {
             // ... (Keep Teacher Logic)
             // I'll re-include the teacher logic here to ensure it's not lost or do I need to rewrite it?
             // Since I am replacing a block, I should output the full new block.
             
            $enseignant = $this->getTeacher();
            
            $classeId = $request->input('classe_id');
            $type = $request->input('type');

            $query = DocumentPedagogique::with(['classe', 'matiere'])
                ->where('enseignant_id', $enseignant->id)
                ->where('annee_scolaire_id', $currentYear->id);
            
            if ($classeId) $query->where('classe_id', $classeId);
            if ($type) $query->where('type', $type);

            $documents = $query->latest()->get();

            // Classes & Matieres for dropdowns
            // We fetch classes AND the matieres the teacher teaches in them
            $myClasses = Classe::whereHas('cours', function($q) use ($enseignant, $currentYear) {
                $q->where('enseignant_id', $enseignant->id)
                  ->where('annee_scolaire_id', $currentYear->id);
            })->with(['cours' => function($q) use ($enseignant, $currentYear) {
                $q->where('enseignant_id', $enseignant->id)
                  ->where('annee_scolaire_id', $currentYear->id)
                  ->with('matiere');
            }])->orderBy('nom')->get()
            ->map(function($classe) {
                return [
                    'id' => $classe->id,
                    'nom' => $classe->nom,
                    'matieres' => $classe->cours->pluck('matiere')->unique('id')->values()->sortBy('nom')->values()
                ];
            });

            // Flatten all matieres for the filter (if we want to filter by Matiere across all classes)
            $allMatieres = $myClasses->pluck('matieres')->flatten(1)->unique('id')->sortBy('nom')->values();

            return Inertia::render('Documents/TeacherIndex', [
                'documents' => $documents,
                'classes' => $myClasses, // Now contains nested 'matieres'
                'matieres' => $allMatieres, // For global filter
                'filters' => ['classe_id' => $classeId, 'type' => $type]
            ]);
        }
        
        // 👮‍♂️ VUE ADMIN
        // The user implied "Where do we consult this?" likely as an Admin.
        if (auth()->user()->hasRole(['super-admin', 'directeur'])) {
             $classeId = $request->input('classe_id');
             $type = $request->input('type');
             $matiereId = $request->input('matiere_id');

             $query = DocumentPedagogique::with(['classe', 'matiere', 'enseignant.user'])
                ->where('annee_scolaire_id', $currentYear->id);
            
             if ($classeId) $query->where('classe_id', $classeId);
             if ($type) $query->where('type', $type);
             if ($matiereId) $query->where('matiere_id', $matiereId);

             $documents = $query->latest()->paginate(20); // Pagination for admins as there might be many

             $classes = Classe::orderBy('nom')->get();
             $matieres = Matiere::orderBy('nom')->get();

             return Inertia::render('Documents/AdminIndex', [
                 'documents' => $documents,
                 'classes' => $classes,
                 'matieres' => $matieres,
                 'filters' => $request->only(['classe_id', 'matiere_id', 'type'])
             ]);
        }

        abort(403, 'Accès réservé.');
    }

    public function store(Request $request)
    {
        if (!$this->isTeacher()) abort(403);

        $request->validate([
            'titre' => 'required|string|max:255',
            'type' => 'required|in:cours,exercice,devoir',
            'classe_id' => 'required|exists:classes,id',
            'matiere_id' => 'required|exists:matieres,id',
            'fichier' => 'required|file|max:10240', // 10MB max
            'date_limite' => 'nullable|date',
        ]);

        $enseignant = $this->getTeacher();
        $currentYear = AnneeScolaire::where('en_cours', true)->first();

        $path = $request->file('fichier')->store('documents_pedagogiques', 'public');

        $document = DocumentPedagogique::create([
            'titre' => $request->titre,
            'description' => $request->description,
            'type' => $request->type,
            'classe_id' => $request->classe_id,
            'matiere_id' => $request->matiere_id,
            'enseignant_id' => $enseignant->id,
            'annee_scolaire_id' => $currentYear->id,
            'fichier_path' => $path,
            'date_limite' => $request->date_limite,
        ]);

        // Notify Students
        $studentsToNotify = \App\Models\User::whereHas('eleve.inscriptions', function($q) use ($request, $currentYear) {
            $q->where('classe_id', $request->classe_id)
              ->where('annee_scolaire_id', $currentYear->id);
        })->get();

        // Notify Parents of those students
        $parentsToNotify = \App\Models\User::whereHas('parent.eleves.inscriptions', function($q) use ($request, $currentYear) {
            $q->where('classe_id', $request->classe_id)
              ->where('annee_scolaire_id', $currentYear->id);
        })->get();

        $usersToNotify = $studentsToNotify->merge($parentsToNotify)->unique('id');

        if ($usersToNotify->count() > 0) {
            \Illuminate\Support\Facades\Notification::send($usersToNotify, new \App\Notifications\NouveauDocumentPedagogique($document));
        }

        return back()->with('success', 'Document publié avec succès.');
    }

    public function destroy($id)
    {
        $user = auth()->user();
        if ($this->isTeacher()) {
             $enseignant = $this->getTeacher();
             $doc = DocumentPedagogique::where('id', $id)->where('enseignant_id', $enseignant->id)->firstOrFail();
        } elseif ($user->hasRole(['super-admin', 'directeur'])) {
             $doc = DocumentPedagogique::findOrFail($id);
        } else {
            abort(403);
        }
        
        if ($doc->fichier_path) {
            Storage::disk('public')->delete($doc->fichier_path);
        }
        
        $doc->delete();

        return back()->with('success', 'Document supprimé.');
    }

    public function download($id)
    {
       // Any auth user (student of class, or teacher owner, or admin)
       $doc = DocumentPedagogique::findOrFail($id);
       $user = auth()->user();

       // Check access
       $canDownload = false;
       if ($user->hasRole('super-admin') || $user->hasRole('directeur')) $canDownload = true;
       if ($this->isTeacher() && $doc->enseignant_id == $this->getTeacher()->id) $canDownload = true;
       if ($this->isStudent()) {
           $insc = $this->getStudentInscription();
           if ($insc && $insc->classe_id == $doc->classe_id) $canDownload = true;
       }

       if (!$canDownload) abort(403);

       return Storage::disk('public')->download($doc->fichier_path, $doc->titre . '.' . pathinfo($doc->fichier_path, PATHINFO_EXTENSION));
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Traits\HandlesStudentAccess;

class NoteController extends Controller
{
    use HandlesStudentAccess, \App\Traits\HandlesTeacherAccess;

    public function __construct()
    {
        // On utilise la permission 'voir_notes' pour l'index et la vue classe
        $this->middleware('permission:voir_notes')->only(['index', 'classe']);
    }

    public function index()
    {
        // 🎓 VUE ÉLÈVE
        if ($this->isStudent()) {
            $inscription = $this->getStudentInscription();
            
            if (!$inscription) {
                return back()->with('error', 'Non inscrit cette année.');
            }

            // Récupérer toutes les notes groupées par matière
            $notes = \App\Models\Note::where('inscription_id', $inscription->id)
                ->with(['evaluation.cours.matiere', 'evaluation.periode'])
                ->get()
                ->groupBy(function($note) {
                    return $note->evaluation->cours->matiere->nom;
                });

            return \Inertia\Inertia::render('Notes/Student', [
                'groupedNotes' => $notes,
                'periodes' => \App\Models\Periode::where('annee_scolaire_id', $inscription->annee_scolaire_id)->get()
            ]);
        }

        // 🛡️ VUE ADMIN / ENSEIGNANT
        $query = \App\Models\Classe::orderBy('nom');

        // 🔒 SCOPING ENSEIGNANT
        if ($this->isTeacher()) {
            $myClassIds = $this->getTeacherClassIds();
            $query->whereIn('id', $myClassIds);
        }

        $classes = $query->get();

        return \Inertia\Inertia::render('Notes/Index', [
            'classes' => $classes
        ]);
    }

    public function classe(\App\Models\Classe $classe)
    {
        if ($this->isStudent()) abort(403, 'Accès réservé aux enseignants et administrateurs.');

        $currentYear = \App\Models\AnneeScolaire::where('en_cours', true)->first();
        if (!$currentYear) return back()->with('error', 'Année scolaire introuvable.');

        // Récupérer les cours de cette classe
        $cours = \App\Models\Cours::where('classe_id', $classe->id)
            ->where('annee_scolaire_id', $currentYear->id)
            ->with(['matiere', 'enseignant'])
            ->get();

        // Si Enseignant connecté, filtrer ses cours
        if ($this->isTeacher()) {
            $teacher = $this->getTeacher();
            // L'enseignant ne doit voir QUE les cours qu'il dispense dans cette classe
            // Sauf s'il est titulaire ? (A définir, pour l'instant on restreint strict)
             $cours->where('enseignant_id', $teacher->id);
             
             // Vérification que l'enseignant a bien le droit d'accéder à CETTE classe
             if (!in_array($classe->id, $this->getTeacherClassIds())) {
                 abort(403, 'Accès non autorisé à cette classe.');
             }
        }
        
        // Récupérer les évaluations liées à ces cours
        $evaluations = \App\Models\Evaluation::whereIn('cours_id', $cours->pluck('id'))
            ->with('cours.matiere', 'cours.enseignant')
            ->orderByDesc('date_evaluation')
            ->get();

        $periodes = \App\Models\Periode::where('annee_scolaire_id', $currentYear->id)
            ->where('actif', true)
            ->get();

        return \Inertia\Inertia::render('Notes/Classe', [
            'classe' => $classe,
            'cours' => $cours,
            'evaluations' => $evaluations,
            'periodes' => $periodes
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

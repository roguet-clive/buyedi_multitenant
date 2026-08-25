<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Sanction;
use App\Models\TypeSanction;
use App\Models\Classe;
use App\Models\AnneeScolaire;
use App\Models\Eleve;
use App\Models\Inscription;

use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

use App\Traits\HandlesStudentAccess;

class SanctionController extends Controller
{
    use HandlesStudentAccess;

    public function __construct()
    {
        $this->middleware('permission:voir_sanctions')->only('index');
        $this->middleware('permission:ajouter_sanctions')->only('store');
        $this->middleware('permission:supprimer_sanctions')->only('destroy');
    }

    public function index(Request $request)
    {
        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        if (!$currentYear) return back()->with('error', 'Année scolaire non configurée.');

        // 🛡️ VUE ADMIN / STAFF
        $classeId = $request->input('classe_id');
        $search = $request->input('search');

        $query = Sanction::with(['eleve.user', 'type', 'decideur', 'eleve.inscriptionActuelle.classe'])
            ->where('annee_scolaire_id', $currentYear->id);

        if ($classeId) {
            $query->whereHas('eleve.inscriptions', function($q) use ($classeId, $currentYear) {
                $q->where('classe_id', $classeId)
                  ->where('annee_scolaire_id', $currentYear->id);
            });
        }

        if ($search) {
            $query->whereHas('eleve.user', function($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenom', 'like', "%{$search}%");
            });
        }

        $sanctions = $query->latest('date_sanction')->paginate(15)->withQueryString();

        $classes = Classe::orderBy('nom')->get();
        $types = TypeSanction::orderBy('gravite')->get();
        // Load students for the "Add Sanction" modal dropdown (if a class is selected)
        $eleves = [];
        if ($classeId) {
            $eleves = Inscription::where('classe_id', $classeId)
                ->where('annee_scolaire_id', $currentYear->id)
                ->with('eleve.user')
                ->get()
                ->map(function($i) {
                    return [
                        'id' => $i->eleve->id,
                        'nom' => $i->eleve->user->full_name
                    ];
                });
        }

        return Inertia::render('Sanctions/Index', [
            'sanctions' => $sanctions,
            'classes' => $classes,
            'types' => $types,
            'eleves' => $eleves, // Only populated if class selected
            'filters' => $request->only(['classe_id', 'search'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'eleve_id' => 'required|exists:eleves,id',
            'type_sanction_id' => 'required|exists:types_sanctions,id',
            'date_sanction' => 'required|date',
            'motif' => 'required|string|min:5',
        ]);

        $currentYear = AnneeScolaire::where('en_cours', true)->first();

        Sanction::create([
            'eleve_id' => $request->eleve_id,
            'type_sanction_id' => $request->type_sanction_id,
            'annee_scolaire_id' => $currentYear->id,
            'decideur_id' => auth()->id(),
            'date_sanction' => $request->date_sanction,
            'date_fin' => $request->date_fin,
            'motif' => $request->motif,
        ]);

        return back()->with('success', 'Sanction enregistrée.');
    }

    public function destroy(Sanction $sanction)
    {
        $sanction->delete();
        return back()->with('success', 'Sanction supprimée.');
    }
}

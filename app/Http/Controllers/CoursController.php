<?php

namespace App\Http\Controllers;

use App\Models\Cours;
use App\Models\Classe;
use App\Models\Enseignant;
use App\Models\AnneeScolaire;
use App\Models\Matiere;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CoursController extends Controller
{
    use \App\Traits\HandlesTeacherAccess;

    public function __construct()
    {
        $this->middleware('permission:voir_cours')->only(['index']);
        $this->middleware('permission:ajouter_cours')->only(['store']);
        $this->middleware('permission:supprimer_cours')->only(['destroy']);
    }

    public function index(Request $request)
    {
        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        if (!$currentYear) {
            return redirect()->back()->with('error', 'Aucune année scolaire active.');
        }

        $classeId = $request->input('classe_id');
        $selectedClasse = null;
        $cours = [];

        if ($classeId) {
            // 🔒 Vérifier accès enseignant
            if ($this->isTeacher() && !in_array($classeId, $this->getTeacherClassIds())) {
                 $selectedClasse = null; // Ou abort(403)
            } else {
                $selectedClasse = Classe::find($classeId);
            }
            
            if ($selectedClasse) {
                // Charger les cours existants pour cette classe et cette année
                $cours = Cours::with(['enseignant.user', 'matiere', 'periode'])
                    ->where('classe_id', $classeId)
                    ->where('annee_scolaire_id', $currentYear->id)
                    ->get();
            }
        }

        // Pour la sélection : liste de tous les enseignants et matières (Seulement ceux avec un compte User valide)
        $enseignants = Enseignant::with('user')
            ->whereHas('user')
            ->get()
            ->map(function($e) {
                return [
                    'id' => $e->id,
                    'nom_complet' => $e->user ? $e->user->nom . ' ' . $e->user->prenom : 'Inconnu',
                    'specialite' => $e->specialite,
                ];
            });

        $matieres = Matiere::all();
        $classes = Classe::all();
        $periodes = $currentYear->periodes;

        return Inertia::render('Cours/Index', [
            'cours' => $cours,
            'classes' => $classes,
            'enseignants' => $enseignants,
            'matieres' => $matieres,
            'periodes' => $periodes,
            'classeActuelle' => $selectedClasse,
            'filters' => ['classe_id' => $classeId]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'classe_id' => 'required|exists:classes,id',
            'enseignant_id' => 'required|exists:enseignants,id',
            'matiere_id' => 'nullable|exists:matieres,id',
            'periode_id' => 'nullable|exists:periodes,id',
            'coefficient' => 'required|numeric|min:1',
        ]);

        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        $classe = Classe::findOrFail($request->classe_id);

        // Validation logique selon le cycle
        $isMaternelleOrPrimaire = $classe->isPrimaire();

        if ($isMaternelleOrPrimaire && $request->matiere_id) {
            return back()->with('error', 'En maternelle et primaire, l\'affectation est globale (pas de matière).');
        }

        if ($classe->isSecondaire() && !$request->matiere_id) {
            return back()->with('error', 'En secondaire, vous devez spécifier une matière.');
        }

        // Unicité et Mise à jour
        
        // Clé d'unicité définie dans la migration : ['annee_scolaire_id', 'classe_id', 'matiere_id', 'periode_id']
        // Note: pour le primaire/maternelle, matiere_id et periode_id sont NULL.

        if ($isMaternelleOrPrimaire) {
             // 1. Vérifier si L'ENSEIGNANT est déjà titulaire ailleurs "Toute l'année" 
             $alreadyTitulaire = Cours::where('enseignant_id', $request->enseignant_id)
                ->where('annee_scolaire_id', $currentYear->id)
                ->where('is_titulaire', true)
                ->whereNull('periode_id') // Check if they are titulaire for the whole year
                ->where('classe_id', '!=', $classe->id) // Sauf si on ré-assigne à la même classe
                ->with('classe')
                ->first();

            if ($alreadyTitulaire) {
                return back()->with('error', "Cet enseignant est déjà titulaire de la classe {$alreadyTitulaire->classe->nom} pour toute l'année. Impossible de l'affecter à plusieurs classes principales.");
            }

             // 2. Vérifier s'il y a déjà un enseignant titulaire pour cette classe cette année principale
            $existing = Cours::where('classe_id', $classe->id)
                ->where('annee_scolaire_id', $currentYear->id)
                ->whereNull('matiere_id')
                ->whereNull('periode_id')
                ->first();

            if ($existing) {
                // Option : Mettre à jour l'enseignant (changement de titulaire)
                $existing->update(['enseignant_id' => $request->enseignant_id]);
                return back()->with('success', 'Enseignant titulaire mis à jour.');
            }
        }
        
        // Secondary specific check: Conflict between Full year and Specific Period assignment
        if (!$isMaternelleOrPrimaire) {
            // Un prof différent ne peut pas enseigner la matière X à la classe C sur "Toute l'année" ET un autre sur "Période P"
            // Let's rely on business logic or simply UI to manage these overlapping assignments.
            // A basic check: if assigning a period, delete full year? No, keep it flexible.
            
            // Check if there is already a full year assignment for this class/matière but different teacher
            if ($request->periode_id) {
                 $fullYearAssigned = Cours::where('classe_id', $classe->id)
                     ->where('annee_scolaire_id', $currentYear->id)
                     ->where('matiere_id', $request->matiere_id)
                     ->whereNull('periode_id')
                     ->first();
                 if ($fullYearAssigned && $fullYearAssigned->enseignant_id != $request->enseignant_id) {
                     return back()->with('error', "Un autre enseignant est déjà affecté à cette matière pour toute l'année.");
                 }
            } else {
                 $periodAssigned = Cours::where('classe_id', $classe->id)
                     ->where('annee_scolaire_id', $currentYear->id)
                     ->where('matiere_id', $request->matiere_id)
                     ->whereNotNull('periode_id')
                     ->first();
                 if ($periodAssigned) {
                     return back()->with('error', "Des enseignants sont déjà affectés à des périodes spécifiques pour cette matière. Veuillez désaffecter ou affecter par période.");
                 }
            }
        }

        Cours::updateOrCreate(
            [
                'annee_scolaire_id' => $currentYear->id,
                'classe_id' => $request->classe_id,
                'matiere_id' => $request->matiere_id,
                'periode_id' => $isMaternelleOrPrimaire ? null : ($request->periode_id ?: null),
            ],
            [
                'enseignant_id' => $request->enseignant_id,
                'is_titulaire' => $isMaternelleOrPrimaire,
                'coefficient' => $request->coefficient ?? 1
            ]
        );

        return back()->with('success', 'Affectation enregistrée ✅');
    }

    public function destroy(Cours $cours)
    {
        $cours->delete();
        return back()->with('success', 'Affectation retirée 🗑️');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\Cours;
use App\Models\Note;
use App\Models\Inscription;
use App\Models\AnneeScolaire;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class EvaluationController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_evaluations')->only(['index', 'show']);
        $this->middleware('permission:ajouter_evaluations')->only(['store']);
        $this->middleware('permission:modifier_evaluations')->only(['updateGrades']);
        $this->middleware('permission:supprimer_evaluations')->only(['destroy']);
    }

    /**
     * Liste des évaluations pour un cours donné.
     * Route attendue: /cours/{cours}/evaluations
     */
    public function index(Cours $cours)
    {
        $currentYear = AnneeScolaire::where('en_cours', true)->first();

        // Sécurité : Vérifier que le cours appartient à l'année en cours ?? 
        // Pas strictement nécessaire si on navigue via l'UI année courante, mais bon.
        // On charge les évals
        $evaluations = $cours->evaluations()->orderBy('date_evaluation', 'desc')->get();
        
        $cours->load(['matiere', 'classe', 'enseignant.user']);

        return Inertia::render('Notes/Index', [
            'cours' => $cours,
            'evaluations' => $evaluations
        ]);
    }

    /**
     * Enregistrer une nouvelle évaluation.
     */
    public function store(Request $request, Cours $cours)
    {
        $request->validate([
            'titre' => 'required|string|max:255',
            'type' => 'required|string',
            'coefficient' => 'required|integer|min:1',
            'note_max' => 'required|integer|min:1',
            'date_evaluation' => 'required|date',
            'periode_id' => 'required|exists:periodes,id', // replaced 'periode' => 'nullable|string'
        ]);

        $cours->evaluations()->create($request->all());

        return back()->with('success', __('Évaluation créée avec succès.'));
    }

    /**
     * Voir le carnet de notes pour une évaluation spécifique.
     * Permet de saisir les notes.
     */
    public function show(Evaluation $evaluation)
    {
        $evaluation->load('cours.classe', 'cours.matiere');
        
        // Récupérer les élèves inscrits dans la classe pour l'année du cours
        $classeId = $evaluation->cours->classe_id;
        $anneeId = $evaluation->cours->annee_scolaire_id;

        $eleves = Inscription::with('eleve.user')
            ->where('classe_id', $classeId)
            ->where('annee_scolaire_id', $anneeId)
            ->get()
            ->map(function ($insc) {
                return [
                    'inscription_id' => $insc->id,
                    'nom_complet' => $insc->eleve->user->nom . ' ' . $insc->eleve->user->prenom,
                    'matricule' => $insc->eleve->matricule,
                    // Note existante ?
                ];
            });

        // Charger les notes existantes
        $notes = $evaluation->notes()->pluck('valeur', 'inscription_id');
        $appreciations = $evaluation->notes()->pluck('appreciation', 'inscription_id');

        return Inertia::render('Notes/Show', [
            'evaluation' => $evaluation,
            'eleves' => $eleves,
            'notes' => $notes,
            'appreciations' => $appreciations,
        ]);
    }

    /**
     * Mettre à jour les notes en masse pour une évaluation.
     */
    public function updateGrades(Request $request, Evaluation $evaluation)
    {
        $data = $request->validate([
            'notes' => 'array',
            'notes.*' => 'nullable|numeric|min:0|max:' . $evaluation->note_max,
            'appreciations' => 'array',
            'appreciations.*' => 'nullable|string'
        ]);

        // 🛡️ SECURITY: Fetch valid students for this course/class
        $classeId = $evaluation->cours->classe_id;
        $validInscriptionIds = Inscription::where('classe_id', $classeId)
            // ->where('annee_scolaire_id', ...) // Optionnel si on assume que l'eval est liée au cours qui est lié à l'année
            ->pluck('id')
            ->toArray();

        DB::transaction(function () use ($evaluation, $data, $validInscriptionIds) {
            $notesInput = $data['notes'] ?? [];
            $appreciationsInput = $data['appreciations'] ?? [];

            foreach ($notesInput as $inscriptionId => $valeur) {
                
                // 🛡️ Verify ID ownership
                if (!in_array($inscriptionId, $validInscriptionIds)) {
                     continue; 
                }

                // Si la note est null/vide, on peut soit supprimer l'entrée, soit mettre null.
                // Le modèle Note a 'valeur' nullable.
                
                Note::updateOrCreate(
                    [
                        'evaluation_id' => $evaluation->id,
                        'inscription_id' => $inscriptionId
                    ],
                    [
                        'valeur' => $valeur,
                        'appreciation' => $appreciationsInput[$inscriptionId] ?? null
                    ]
                );
            }
        });

        return back()->with('success', __('Notes enregistrées.'));
    }

    public function destroy(Evaluation $evaluation)
    {
        $evaluation->delete();
        return redirect()->route('cours.evaluations.index', $evaluation->cours_id)
            ->with('success', 'Évaluation supprimée.');
    }
}

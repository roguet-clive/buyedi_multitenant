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

    /**
     * Espace "Mes Cours" dédié pour les enseignants
     */
    public function mesCours(Request $request)
    {
        $user = $request->user();
        $teacher = $this->getTeacher();
        
        if (!$teacher && !$user->hasRole(['super-admin', 'directeur'])) {
            abort(403, "Accès réservé aux enseignants.");
        }

        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        if (!$currentYear) {
            return back()->with('error', 'Aucune année scolaire active.');
        }

        $query = Cours::with(['classe.inscriptions' => function($q) use ($currentYear) {
                $q->where('annee_scolaire_id', $currentYear->id);
            }, 'matiere', 'periode'])
            ->where('annee_scolaire_id', $currentYear->id);

        if ($teacher) {
            $query->where('enseignant_id', $teacher->id);
        }

        $cours = $query->get()->map(function($c) {
            return [
                'id' => $c->id,
                'classe_id' => $c->classe_id,
                'classe_nom' => $c->classe ? $c->classe->nom : 'Classe inconnue',
                'classe_niveau' => $c->classe ? $c->classe->niveau : null,
                'classe_type' => $c->classe ? $c->classe->type : null,
                'eleves_count' => $c->classe && $c->classe->inscriptions ? $c->classe->inscriptions->count() : 0,
                'matiere_nom' => $c->matiere ? $c->matiere->nom : ($c->is_titulaire ? 'Enseignement Général (Titulaire)' : 'Matière générale'),
                'matiere_code' => $c->matiere ? $c->matiere->code : null,
                'coefficient' => $c->coefficient,
                'periode_nom' => $c->periode ? $c->periode->nom : 'Annuel',
                'is_titulaire' => (bool)$c->is_titulaire,
            ];
        });

        return Inertia::render('Cours/MesCours', [
            'cours' => $cours,
            'anneeScolaire' => $currentYear->nom,
        ]);
    }

    public function index(Request $request)
    {
        // 🔒 Sécurité : La gestion administrative des affectations est réservée à la direction
        if ($this->isTeacher()) {
            return redirect()->route('cours.mes-cours');
        }

        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        if (!$currentYear) {
            return redirect()->back()->with('error', 'Aucune année scolaire active.');
        }

        $classeId = $request->input('classe_id');
        $selectedClasse = null;
        $cours = [];

        if ($classeId) {
            $selectedClasse = Classe::find($classeId);
            
            if ($selectedClasse) {
                // Charger les cours existants pour cette classe et cette année
                $cours = Cours::with(['enseignant.user', 'matiere', 'periode'])
                    ->where('classe_id', $classeId)
                    ->where('annee_scolaire_id', $currentYear->id)
                    ->get();
            }
        }

        // Liste des enseignants avec informations complètes
        $enseignants = Enseignant::with('user')
            ->whereHas('user')
            ->get()
            ->map(function($e) {
                return [
                    'id' => $e->id,
                    'nom_complet' => $e->user ? $e->user->nom . ' ' . $e->user->prenom : ($e->nom . ' ' . $e->prenom),
                    'specialite' => $e->specialite,
                    'telephone' => $e->telephone,
                    'email' => $e->user?->email,
                ];
            });

        $matieres = Matiere::orderBy('nom')->get();
        $classes = Classe::orderBy('nom')->get();
        $periodes = $currentYear->periodes;

        return Inertia::render('Cours/Index', [
            'cours' => $cours,
            'classes' => $classes,
            'enseignants' => $enseignants,
            'matieres' => $matieres,
            'periodes' => $periodes,
            'classeActuelle' => $selectedClasse,
            'filters' => ['classe_id' => $classeId ? (int)$classeId : null]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'classe_id' => 'required|exists:classes,id',
            'enseignant_id' => 'required|exists:enseignants,id',
            'matiere_id' => 'nullable|exists:matieres,id',
            'periode_id' => 'nullable|exists:periodes,id',
            'coefficient' => 'required|numeric|min:0.5',
        ]);

        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        $classe = Classe::findOrFail($request->classe_id);
        $isMaternelleOrPrimaire = $classe->isPrimaire();

        if ($isMaternelleOrPrimaire && $request->matiere_id) {
            return back()->with('error', 'En maternelle et primaire, l\'affectation est globale (pas de matière).');
        }

        if ($classe->isSecondaire() && !$request->matiere_id) {
            return back()->with('error', 'En secondaire, vous devez spécifier une matière.');
        }

        // Cycle Maternelle & Primaire : Maître/Maîtresse titulaire unique
        if ($isMaternelleOrPrimaire) {
            Cours::updateOrCreate(
                [
                    'annee_scolaire_id' => $currentYear->id,
                    'classe_id' => $classe->id,
                    'matiere_id' => null,
                    'periode_id' => null,
                ],
                [
                    'enseignant_id' => $request->enseignant_id,
                    'is_titulaire' => true,
                    'coefficient' => $request->coefficient ?? 1
                ]
            );

            return back()->with('success', 'Enseignant titulaire affecté avec succès ✅');
        }

        // Cycle Secondaire :
        // Un même enseignant PEUT enseigner plusieurs matières dans la même classe (ex: Maths et SVT)
        if ($request->periode_id) {
            Cours::updateOrCreate(
                [
                    'annee_scolaire_id' => $currentYear->id,
                    'classe_id' => $classe->id,
                    'matiere_id' => $request->matiere_id,
                    'periode_id' => $request->periode_id,
                ],
                [
                    'enseignant_id' => $request->enseignant_id,
                    'is_titulaire' => false,
                    'coefficient' => $request->coefficient ?? 1
                ]
            );
        } else {
            $existingCourses = Cours::where('annee_scolaire_id', $currentYear->id)
                ->where('classe_id', $classe->id)
                ->where('matiere_id', $request->matiere_id)
                ->get();

            if ($existingCourses->count() > 0) {
                foreach ($existingCourses as $c) {
                    $c->update([
                        'enseignant_id' => $request->enseignant_id,
                        'coefficient' => $request->coefficient ?? $c->coefficient,
                    ]);
                }
            } else {
                Cours::create([
                    'annee_scolaire_id' => $currentYear->id,
                    'classe_id' => $classe->id,
                    'matiere_id' => $request->matiere_id,
                    'periode_id' => null,
                    'enseignant_id' => $request->enseignant_id,
                    'is_titulaire' => false,
                    'coefficient' => $request->coefficient ?? 1
                ]);
            }
        }

        return back()->with('success', 'Affectation de la matière enregistrée avec succès ✅');
    }

    public function destroy(Request $request, $id)
    {
        $cours = Cours::findOrFail($id);
        $matiereId = $cours->matiere_id;
        $classeId = $cours->classe_id;
        $anneeId = $cours->annee_scolaire_id;

        if ($matiereId) {
            Cours::where('annee_scolaire_id', $anneeId)
                ->where('classe_id', $classeId)
                ->where('matiere_id', $matiereId)
                ->delete();
        } else {
            $cours->delete();
        }

        return back()->with('success', 'Affectation retirée avec succès 🗑️');
    }
}

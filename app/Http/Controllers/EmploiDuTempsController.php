<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\EmploiDuTemps;
use App\Models\Classe;
use App\Models\Matiere;
use App\Models\Enseignant;
use App\Models\AnneeScolaire;
use Inertia\Inertia;
use Carbon\Carbon;

use App\Traits\HandlesStudentAccess;

class EmploiDuTempsController extends Controller
{
    use HandlesStudentAccess, \App\Traits\HandlesTeacherAccess;

    public function __construct()
    {
        $this->middleware('permission:voir_emplois_du_temps')->only(['index']);
        $this->middleware('permission:ajouter_emplois_du_temps')->only(['store']);
        $this->middleware('permission:supprimer_emplois_du_temps')->only(['destroy']);
    }

    public function index(Request $request)
    {
        // 🎓 VUE ÉLÈVE
        if ($this->isStudent()) {
            $inscription = $this->getStudentInscription();

            if (!$inscription) {
                return back()->with('error', 'Vous n\'êtes pas inscrit cette année.');
            }

            $emplois = EmploiDuTemps::with(['matiere', 'enseignant.user'])
                ->where('classe_id', $inscription->classe_id)
                ->where('annee_scolaire_id', $inscription->annee_scolaire_id)
                ->orderBy('jour')
                ->orderBy('heure_debut')
                ->get();

            return Inertia::render('EmploiDuTemps/Student', [
                'emplois' => $emplois
            ]);
        }

        // 👨‍🏫 VUE ENSEIGNANT (Mon Emploi du temps)
        // 👨‍🏫 VUE ENSEIGNANT (Mon Emploi du temps)
        if ($this->isTeacher()) {
           $user = auth()->user();
           $enseignant = \App\Models\Enseignant::where('user_id', $user->id)->first();
           
           if ($enseignant) {
                $anneeScolaire = AnneeScolaire::where('en_cours', true)->first();
                $emplois = EmploiDuTemps::with(['matiere', 'classe'])
                    ->where('enseignant_id', $enseignant->id)
                    ->where('annee_scolaire_id', $anneeScolaire ? $anneeScolaire->id : 0)
                    ->orderBy('jour')
                    ->orderBy('heure_debut')
                    ->get();

                return Inertia::render('EmploiDuTemps/Student', [ // Reusing the student view (My Schedule)
                    'emplois' => $emplois
                ]);
           }
        }

        // 👨‍👩‍👧 VUE PARENT
        if (auth()->user()->hasRole('parent')) {
            $parent = auth()->user()->parent;
            if (!$parent) {
                return back()->with('error', 'Profil parent introuvable.');
            }
            $eleveIds = $parent->eleves()->pluck('eleves.id');
            $currentYear = AnneeScolaire::where('en_cours', true)->first();
            
            $classeIds = \App\Models\Inscription::whereIn('eleve_id', $eleveIds)
                ->where('annee_scolaire_id', $currentYear?->id)
                ->pluck('classe_id');

            $emplois = EmploiDuTemps::with(['matiere', 'enseignant.user', 'classe'])
                ->whereIn('classe_id', $classeIds)
                ->where('annee_scolaire_id', $currentYear ? $currentYear->id : 0)
                ->orderBy('jour')
                ->orderBy('heure_debut')
                ->get();

            return Inertia::render('EmploiDuTemps/Student', [
                'emplois' => $emplois
            ]);
        }

        // 🛡️ VUE ADMIN
        $classeId = $request->input('classe_id');
        
        $classes = Classe::orderBy('nom')->get();
        $enseignants = Enseignant::with('user')->get();
        $matieres = Matiere::orderBy('nom')->get();

        $emplois = [];
        $classe = null;

        if ($classeId) {
            $classe = Classe::find($classeId);
            if ($classe) {
                // Get active school year
                $anneeScolaire = AnneeScolaire::where('en_cours', true)->first();
                if ($anneeScolaire) {
                    $emplois = EmploiDuTemps::with(['matiere', 'enseignant', 'periode'])
                        ->where('classe_id', $classeId)
                        ->where('annee_scolaire_id', $anneeScolaire->id)
                        ->get();
                }
            }
        }
        
        $anneeScolaire = AnneeScolaire::where('en_cours', true)->first();
        $periodes = $anneeScolaire ? $anneeScolaire->periodes : [];

        return Inertia::render('EmploiDuTemps/Index', [
            'classes' => $classes,
            'enseignants' => $enseignants,
            'matieres' => $matieres,
            'periodes' => $periodes,
            'emplois' => $emplois,
            'selectedClasse' => $classe,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'classe_id' => 'required|exists:classes,id',
            'matiere_id' => 'required|exists:matieres,id',
            'enseignant_id' => 'nullable|exists:enseignants,id',
            'periode_id' => 'nullable|exists:periodes,id',
            'jour' => 'required|string',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut',
            'salle' => 'nullable|string',
        ]);

        $anneeScolaire = AnneeScolaire::where('en_cours', true)->first();
        if (!$anneeScolaire) {
            return back()->with('error', 'Aucune année scolaire active.');
        }

        $debut = $request->heure_debut;
        $fin = $request->heure_fin;
        $jour = $request->jour;
        $classeId = $request->classe_id;
        $enseignantId = $request->enseignant_id;
        $salle = $request->salle;
        $periodeId = $request->periode_id;

        // Condition flexible pour trouver les conflits de période (Année entière croise tout, ou période X croise Année entière)
        $periodeConflictQuery = function ($q) use ($periodeId) {
            if ($periodeId) {
                $q->whereNull('periode_id')->orWhere('periode_id', $periodeId);
            }
            // Si pas de periodeId en request (Toute l'année), ça conflict avec n'importe quoi donc on ne met pas de where.
        };

        // 1. Conflict Check: CLASSE (Cannot be in two places)
        $classeConflict = EmploiDuTemps::where('annee_scolaire_id', $anneeScolaire->id)
            ->where('classe_id', $classeId)
            ->where('jour', $jour)
            ->where($periodeConflictQuery)
            ->where(function ($query) use ($debut, $fin) {
                $query->where(function ($q) use ($debut, $fin) {
                    $q->where('heure_debut', '<', $fin)
                      ->where('heure_fin', '>', $debut);
                });
            })
            ->exists();

        if ($classeConflict) {
            return back()->with('error', "La classe a déjà un cours sur ce créneau ($jour $debut-$fin).");
        }

        // 2. Conflict Check: ENSEIGNANT (Cannot vary ubiquity)
        if ($enseignantId) {
            $profConflict = EmploiDuTemps::where('annee_scolaire_id', $anneeScolaire->id)
                ->where('enseignant_id', $enseignantId)
                ->where('jour', $jour)
                ->where($periodeConflictQuery)
                ->where(function ($query) use ($debut, $fin) {
                    $query->where(function ($q) use ($debut, $fin) {
                        $q->where('heure_debut', '<', $fin)
                          ->where('heure_fin', '>', $debut);
                    });
                })
                ->exists();

            if ($profConflict) {
                 // Get teacher name for clearer error
                 $prof = Enseignant::find($enseignantId);
                 return back()->with('error', "L'enseignant {$prof->prenom} {$prof->nom} a déjà cours sur ce créneau.");
            }
        }

        // 3. Conflict Check: SALLE (Cannot be double booked)
        if ($salle) {
            $salleConflict = EmploiDuTemps::where('annee_scolaire_id', $anneeScolaire->id)
                ->where('salle', $salle)
                ->where('jour', $jour)
                ->where($periodeConflictQuery)
                ->where(function ($query) use ($debut, $fin) {
                    $query->where(function ($q) use ($debut, $fin) {
                        $q->where('heure_debut', '<', $fin)
                          ->where('heure_fin', '>', $debut);
                    });
                })
                ->exists();

            if ($salleConflict) {
                return back()->with('error', "La salle '$salle' est déjà occupée sur ce créneau.");
            }
        }

        EmploiDuTemps::create([
            'classe_id' => $classeId,
            'matiere_id' => $request->matiere_id,
            'enseignant_id' => $enseignantId,
            'annee_scolaire_id' => $anneeScolaire->id,
            'periode_id' => $periodeId,
            'jour' => $jour,
            'heure_debut' => $debut,
            'heure_fin' => $fin,
            'salle' => $salle,
        ]);

        return back()->with('success', 'Cours ajouté à l\'emploi du temps.');
    }

    public function destroy($id)
    {
        $slot = EmploiDuTemps::findOrFail($id);
        $slot->delete();

        return back()->with('success', 'Cours supprimé.');
    }
}

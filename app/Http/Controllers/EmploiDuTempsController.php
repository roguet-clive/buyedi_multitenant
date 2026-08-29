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

use App\Notifications\EmploiDuTempsNotification;
use App\Models\Inscription;
use App\Models\ParentModel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class EmploiDuTempsController extends Controller
{
    use HandlesStudentAccess, \App\Traits\HandlesTeacherAccess;

    public function __construct()
    {
        $this->middleware('permission:voir_emplois_du_temps')->only(['index', 'downloadPdf']);
        $this->middleware('permission:ajouter_emplois_du_temps')->only(['store', 'publier']);
        $this->middleware('permission:supprimer_emplois_du_temps')->only(['destroy']);
    }

    public function index(Request $request)
    {
        $currentYear = AnneeScolaire::where('en_cours', true)->first();

        // 🎓 VUE ÉLÈVE
        if ($this->isStudent()) {
            $inscription = $this->getStudentInscription();

            if (!$inscription) {
                return back()->with('error', 'Vous n\'êtes pas inscrit cette année.');
            }

            $emplois = EmploiDuTemps::with(['matiere', 'enseignant.user', 'classe'])
                ->where('classe_id', $inscription->classe_id)
                ->where('annee_scolaire_id', $inscription->annee_scolaire_id)
                ->orderBy('jour')
                ->orderBy('heure_debut')
                ->get();

            return Inertia::render('EmploiDuTemps/Student', [
                'emplois' => $emplois,
                'classe' => $inscription->classe,
                'role' => 'eleve',
            ]);
        }

        // 👨‍🏫 VUE ENSEIGNANT (Mon planning ou Emploi du temps d'une classe spécifique)
        if ($this->isTeacher()) {
            $user = auth()->user();
            $enseignant = \App\Models\Enseignant::where('user_id', $user->id)->first();
           
            if ($enseignant) {
                $myClassIds = $this->getTeacherClassIds();
                $classesEnseignant = Classe::whereIn('id', $myClassIds)->orderBy('nom')->get();

                $requestedClasseId = $request->input('classe_id');

                // Si une classe spécifique est demandée (ex: /emploi_du_temps?classe_id=3)
                if ($requestedClasseId) {
                    $selectedClasse = Classe::find($requestedClasseId);

                    $emplois = EmploiDuTemps::with(['matiere', 'enseignant.user', 'classe'])
                        ->where('classe_id', $requestedClasseId)
                        ->where('annee_scolaire_id', $currentYear ? $currentYear->id : 0)
                        ->orderBy('jour')
                        ->orderBy('heure_debut')
                        ->get();

                    return Inertia::render('EmploiDuTemps/Student', [
                        'emplois' => $emplois,
                        'enseignant' => $enseignant,
                        'classe' => $selectedClasse,
                        'classesEnseignant' => $classesEnseignant,
                        'selectedClasseId' => (int)$requestedClasseId,
                        'role' => 'enseignant',
                    ]);
                }

                // Vue par défaut : Mon planning personnel (tous mes cours de toutes mes classes)
                $coursAffectes = \App\Models\Cours::where('enseignant_id', $enseignant->id)
                    ->where('annee_scolaire_id', $currentYear ? $currentYear->id : 0)
                    ->get();

                $emplois = EmploiDuTemps::with(['matiere', 'classe', 'enseignant.user'])
                    ->where('annee_scolaire_id', $currentYear ? $currentYear->id : 0)
                    ->where(function ($q) use ($enseignant, $coursAffectes) {
                        $q->where('enseignant_id', $enseignant->id);
                        foreach ($coursAffectes as $ca) {
                            $q->orWhere(function ($sub) use ($ca) {
                                $sub->where('classe_id', $ca->classe_id)
                                    ->where('matiere_id', $ca->matiere_id);
                            });
                        }
                    })
                    ->orderBy('jour')
                    ->orderBy('heure_debut')
                    ->get();

                return Inertia::render('EmploiDuTemps/Student', [
                    'emplois' => $emplois,
                    'enseignant' => $enseignant,
                    'classesEnseignant' => $classesEnseignant,
                    'selectedClasseId' => null,
                    'role' => 'enseignant',
                ]);
            }
        }

        // 👨‍👩‍👧 VUE PARENT
        if (auth()->user()->hasRole('parent')) {
            $parent = auth()->user()->parent;
            if (!$parent) {
                return back()->with('error', 'Profil parent introuvable.');
            }

            $eleves = $parent->eleves()->with(['user', 'inscriptions' => function($q) use ($currentYear) {
                if ($currentYear) {
                    $q->where('annee_scolaire_id', $currentYear->id)->with('classe');
                }
            }])->get();

            $selectedEleveId = $request->input('eleve_id', $eleves->first()?->id);
            $selectedEleve = $eleves->firstWhere('id', $selectedEleveId) ?? $eleves->first();

            $inscription = $selectedEleve?->inscriptions->first();
            $emplois = [];

            if ($inscription && $inscription->classe_id) {
                $emplois = EmploiDuTemps::with(['matiere', 'enseignant.user', 'classe'])
                    ->where('classe_id', $inscription->classe_id)
                    ->where('annee_scolaire_id', $currentYear ? $currentYear->id : 0)
                    ->orderBy('jour')
                    ->orderBy('heure_debut')
                    ->get();
            }

            return Inertia::render('EmploiDuTemps/Student', [
                'emplois' => $emplois,
                'eleves' => $eleves,
                'selectedEleve' => $selectedEleve,
                'classe' => $inscription?->classe,
                'role' => 'parent',
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
            if ($classe && $currentYear) {
                $emplois = EmploiDuTemps::with(['matiere', 'enseignant', 'periode'])
                    ->where('classe_id', $classeId)
                    ->where('annee_scolaire_id', $currentYear->id)
                    ->get();
            }
        }
        
        $periodes = $currentYear ? $currentYear->periodes : [];

        $affectations = \App\Models\Cours::where('annee_scolaire_id', $currentYear?->id)
            ->get(['classe_id', 'matiere_id', 'enseignant_id']);

        return Inertia::render('EmploiDuTemps/Index', [
            'classes' => $classes,
            'enseignants' => $enseignants,
            'matieres' => $matieres,
            'periodes' => $periodes,
            'emplois' => $emplois,
            'selectedClasse' => $classe,
            'affectations' => $affectations,
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

        // Si enseignant non spécifié, chercher l'affectation par défaut dans la table cours
        if (!$enseignantId) {
            $enseignantId = \App\Models\Cours::where('classe_id', $classeId)
                ->where('matiere_id', $request->matiere_id)
                ->where('annee_scolaire_id', $anneeScolaire->id)
                ->value('enseignant_id');
        }

        $periodeConflictQuery = function ($q) use ($periodeId) {
            if ($periodeId) {
                $q->whereNull('periode_id')->orWhere('periode_id', $periodeId);
            }
        };

        // 1. Conflict Check: CLASSE
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

        // 2. Conflict Check: ENSEIGNANT
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
                 $prof = Enseignant::find($enseignantId);
                 return back()->with('error', "L'enseignant {$prof->prenom} {$prof->nom} a déjà cours sur ce créneau.");
            }
        }

        // 3. Conflict Check: SALLE
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

    /**
     * Publier l'emploi du temps d'une classe et envoyer les notifications
     * aux enseignants, élèves et parents concernés.
     */
    public function publier(Request $request, Classe $classe)
    {
        $anneeScolaire = AnneeScolaire::where('en_cours', true)->first();
        if (!$anneeScolaire) {
            return back()->with('error', 'Aucune année scolaire active.');
        }

        // Vérifier qu'il y a des créneaux
        $slots = EmploiDuTemps::with(['enseignant.user', 'matiere'])
            ->where('classe_id', $classe->id)
            ->where('annee_scolaire_id', $anneeScolaire->id)
            ->get();

        if ($slots->isEmpty()) {
            return back()->with('error', "Aucun cours n'est encore programmé pour la classe {$classe->nom}.");
        }

        $notifiedProfCount = 0;
        $notifiedEleveCount = 0;
        $notifiedParentCount = 0;

        // 1. Notifier les enseignants ayant cours dans cette classe
        $profs = $slots->pluck('enseignant')->filter()->unique('id');
        foreach ($profs as $prof) {
            if ($prof->user) {
                $prof->user->notify(new EmploiDuTempsNotification($classe, $anneeScolaire, 'enseignant'));
                $notifiedProfCount++;
            }
        }

        // 2. Notifier les élèves inscrits dans cette classe et leurs parents
        $inscriptions = Inscription::where('classe_id', $classe->id)
            ->where('annee_scolaire_id', $anneeScolaire->id)
            ->with(['eleve.user', 'eleve.parents.user'])
            ->get();

        $notifiedParentUsers = collect();

        foreach ($inscriptions as $insc) {
            $eleve = $insc->eleve;
            if ($eleve && $eleve->user) {
                $eleve->user->notify(new EmploiDuTempsNotification($classe, $anneeScolaire, 'eleve'));
                $notifiedEleveCount++;
            }

            if ($eleve && $eleve->parents) {
                foreach ($eleve->parents as $parent) {
                    if ($parent->user && !$notifiedParentUsers->contains($parent->user->id)) {
                        $parent->user->notify(new EmploiDuTempsNotification($classe, $anneeScolaire, 'parent'));
                        $notifiedParentUsers->push($parent->user->id);
                        $notifiedParentCount++;
                    }
                }
            }
        }

        return back()->with('success', "📢 Emploi du temps de {$classe->nom} diffusé avec succès ! ($notifiedProfCount enseignant(s), $notifiedEleveCount élève(s) et $notifiedParentCount parent(s) notifiés)");
    }

    /**
     * Télécharger l'emploi du temps officiel au format PDF (A4 Paysage)
     */
    public function downloadPdf(Request $request)
    {
        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        $user = auth()->user();

        $emplois = collect();
        $titre = "Emploi du Temps";
        $typeVue = "classe";

        // Détermination du contexte selon les paramètres et le rôle
        if ($request->has('classe_id') && ($user->hasRole(['super-admin', 'directeur', 'personnel']) || $user->hasRole('parent') || $user->hasRole('eleve') || $user->hasRole('enseignant'))) {
            $classe = Classe::find($request->classe_id);
            if ($classe) {
                $emplois = EmploiDuTemps::with(['matiere', 'enseignant.user'])
                    ->where('classe_id', $classe->id)
                    ->where('annee_scolaire_id', $currentYear?->id ?? 0)
                    ->get();
                $titre = "Classe : " . $classe->nom;
                $typeVue = "classe";
            }
        } elseif ($this->isTeacher() && !$request->has('classe_id')) {
            $enseignant = Enseignant::where('user_id', $user->id)->first();
            if ($enseignant) {
                $emplois = EmploiDuTemps::with(['matiere', 'classe'])
                    ->where('enseignant_id', $enseignant->id)
                    ->where('annee_scolaire_id', $currentYear?->id ?? 0)
                    ->get();
                $titre = "Enseignant : " . $user->full_name;
                $typeVue = "enseignant";
            }
        } elseif ($this->isStudent()) {
            $inscription = $this->getStudentInscription();
            if ($inscription) {
                $emplois = EmploiDuTemps::with(['matiere', 'enseignant.user'])
                    ->where('classe_id', $inscription->classe_id)
                    ->where('annee_scolaire_id', $inscription->annee_scolaire_id)
                    ->get();
                $titre = "Classe : " . ($inscription->classe->nom ?? 'Ma Classe');
                $typeVue = "classe";
            }
        } elseif ($user->hasRole('parent')) {
            $parent = $user->parent;
            $firstEleve = $parent?->eleves()->first();
            $inscription = $firstEleve?->inscriptionActuelle ?? $firstEleve?->inscriptions()->latest()->first();
            if ($inscription) {
                $emplois = EmploiDuTemps::with(['matiere', 'enseignant.user'])
                    ->where('classe_id', $inscription->classe_id)
                    ->where('annee_scolaire_id', $currentYear?->id ?? 0)
                    ->get();
                $titre = "Classe : " . ($inscription->classe->nom ?? 'Classe');
                $typeVue = "classe";
            }
        }

        // Construire la grille [jour_heure => [slots]]
        $grid = [];
        foreach ($emplois as $slot) {
            $startHour = intval(explode(':', $slot->heure_debut)[0]);
            $key = strtolower($slot->jour) . '_' . $startHour;
            if (!isset($grid[$key])) {
                $grid[$key] = [];
            }
            $grid[$key][] = $slot;
        }

        $jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        $heures = range(7, 17);

        $pdf = Pdf::loadView('documents.emploi_du_temps', [
            'etablissement' => $this->getEtablissementData(),
            'anneeScolaire' => $currentYear,
            'titre' => $titre,
            'typeVue' => $typeVue,
            'grid' => $grid,
            'jours' => $jours,
            'heures' => $heures,
        ])->setPaper('a4', 'landscape');

        $fileName = 'emploi_du_temps_' . Str::slug($titre) . '.pdf';

        return $pdf->download($fileName);
    }

    private function getEtablissementData(): array
    {
        $etablissement = \App\Models\Etablissement::first();
        return [
            'nom' => $etablissement->nom ?? config('app.name', 'École Buyedi'),
            'adresse' => $etablissement->adresse ?? 'Adresse non configurée',
            'telephone' => $etablissement->telephone ?? '',
            'email' => $etablissement->email ?? '',
            'logo' => $etablissement->logo ? public_path('storage/' . $etablissement->logo) : public_path('images/logo.png'),
        ];
    }
}


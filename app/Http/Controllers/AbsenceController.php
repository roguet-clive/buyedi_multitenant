<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Traits\HandlesStudentAccess;

class AbsenceController extends Controller
{
    use HandlesStudentAccess, \App\Traits\HandlesTeacherAccess;

    public function __construct()
    {
        $this->middleware('permission:voir_absences')->only(['index']);
        $this->middleware('permission:ajouter_absences')->only(['saisie', 'storeBulk']);
    }

    public function index()
    {
        // 🎓 VUE ÉLÈVE
        if ($this->isStudent()) {
            $inscription = $this->getStudentInscription();
            
            if (!$inscription) {
                return back()->with('error', 'Non inscrit pour cette année.');
            }

            $absences = \App\Models\Absence::where('inscription_id', $inscription->id)
                ->orderByDesc('date')
                ->get();

            return \Inertia\Inertia::render('Absences/Student', [
                'absences' => $absences
            ]);
        }

        // 👨‍👩‍👧 VUE PARENT
        if (auth()->user()->hasRole('parent')) {
            $parent = auth()->user()->parent;
            if (!$parent) {
                return back()->with('error', 'Profil parent introuvable.');
            }
            $eleveIds = $parent->eleves()->pluck('eleves.id');
            // Get current year inscriptions for these students (or all if we want history)
            $inscriptionIds = \App\Models\Inscription::whereIn('eleve_id', $eleveIds)->pluck('id');

            $absences = \App\Models\Absence::with('inscription.eleve.user')
                ->whereIn('inscription_id', $inscriptionIds)
                ->orderByDesc('date')
                ->get();

            return \Inertia\Inertia::render('Absences/Student', [
                'absences' => $absences
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

        return \Inertia\Inertia::render('Absences/Index', [
            'classes' => $classes
        ]);
    }

    public function saisie(\App\Models\Classe $classe, \Illuminate\Http\Request $request)
    {
        // 🔒 Vérification Enseignant
        if ($this->isTeacher() && !in_array($classe->id, $this->getTeacherClassIds())) {
            abort(403, 'Accès non autorisé à cette classe.');
        }

        $date = $request->input('date', now()->format('Y-m-d'));
        
        $currentYear = \App\Models\AnneeScolaire::where('en_cours', true)->first();
        if (!$currentYear) {
            return back()->with('error', __('Aucune année scolaire active.'));
        }

        // Récupérer les inscriptions pour cette classe et année
        $inscriptions = \App\Models\Inscription::where('classe_id', $classe->id)
            ->where('annee_scolaire_id', $currentYear->id)
            ->with(['eleve.user'])
            ->get();

        // Récupérer les absences existantes pour cette date
        $absences = \App\Models\Absence::whereIn('inscription_id', $inscriptions->pluck('id'))
            ->where('date', $date)
            ->get()
            ->keyBy('inscription_id');

        // Vérifier si l'appel a été clôturé et verrouillé pour cette date
        $appel = \App\Models\Appel::with('user')
            ->where('classe_id', $classe->id)
            ->where('date', $date)
            ->first();

        $isLocked = $appel ? (bool)$appel->verrouille : false;
        $lockedBy = $appel && $appel->user ? ($appel->user->prenom . ' ' . $appel->user->nom) : null;
        $lockedAt = $appel ? $appel->updated_at->format('d/m/Y à H:i') : null;
        $canUnlock = $request->user()->hasRole(['super-admin', 'directeur', 'personnel']);

        // 📅 Analyse de l'Emploi du Temps pour cette date
        $carbon = \Carbon\Carbon::parse($date);
        $daysMap = [0 => 'Dimanche', 1 => 'Lundi', 2 => 'Mardi', 3 => 'Mercredi', 4 => 'Jeudi', 5 => 'Vendredi', 6 => 'Samedi'];
        $jourNom = $daysMap[$carbon->dayOfWeek];

        $totalSlotsForClass = \App\Models\EmploiDuTemps::where('classe_id', $classe->id)
            ->where('annee_scolaire_id', $currentYear->id)
            ->count();

        $coursesToday = \App\Models\EmploiDuTemps::with(['matiere', 'enseignant.user'])
            ->where('classe_id', $classe->id)
            ->where('annee_scolaire_id', $currentYear->id)
            ->whereRaw('LOWER(jour) = ?', [strtolower($jourNom)])
            ->orderBy('heure_debut')
            ->get();

        $hasScheduleConfigured = $totalSlotsForClass > 0;
        $hasCoursesToday = $coursesToday->count() > 0;

        $user = $request->user();
        $isTeacher = $this->isTeacher();
        $isAdmin = $user->hasRole(['super-admin', 'directeur', 'personnel', 'admin']);

        $teacherHasCourseToday = false;
        if ($isTeacher) {
            $enseignant = \App\Models\Enseignant::where('user_id', $user->id)->first();
            if ($enseignant) {
                $directSlot = $coursesToday->first(function ($slot) use ($enseignant) {
                    return $slot->enseignant_id == $enseignant->id || $slot->enseignant?->user_id == $enseignant->user_id;
                });

                $assignedSubjectIds = \App\Models\Cours::where('classe_id', $classe->id)
                    ->where('enseignant_id', $enseignant->id)
                    ->where('annee_scolaire_id', $currentYear->id)
                    ->pluck('matiere_id')
                    ->toArray();

                $subjectSlot = $coursesToday->first(function ($slot) use ($assignedSubjectIds) {
                    return in_array($slot->matiere_id, $assignedSubjectIds);
                });

                $teacherHasCourseToday = ($directSlot !== null) || ($subjectSlot !== null);
            }
        }

        $scheduleStatus = [
            'hasScheduleConfigured' => $hasScheduleConfigured,
            'hasCoursesToday' => $hasCoursesToday,
            'dayName' => $jourNom,
            'coursesToday' => $coursesToday,
            'teacherHasCourseToday' => $teacherHasCourseToday,
            'isTeacher' => $isTeacher,
            'isAdmin' => $isAdmin,
            'canTakeAttendance' => true,
            'warningMessage' => null,
            'blockReason' => null,
        ];

        if ($hasScheduleConfigured) {
            if (!$hasCoursesToday) {
                if ($isTeacher) {
                    $scheduleStatus['canTakeAttendance'] = false;
                    $scheduleStatus['blockReason'] = "Aucun cours n'est programmé pour la classe de {$classe->nom} le {$jourNom}.";
                } else {
                    $scheduleStatus['warningMessage'] = "Attention : Aucun cours régulier n'est programmé pour cette classe le {$jourNom}. En tant qu'administrateur, vous pouvez effectuer une saisie exceptionnelle.";
                }
            } elseif ($isTeacher && !$teacherHasCourseToday) {
                $scheduleStatus['canTakeAttendance'] = false;
                $scheduleStatus['blockReason'] = "Vous n'avez aucun cours programmé avec la classe de {$classe->nom} le {$jourNom}.";
            }
        } else {
            $scheduleStatus['warningMessage'] = "L'emploi du temps de cette classe n'a pas encore été configuré. La saisie libre est autorisée.";
        }

        return \Inertia\Inertia::render('Absences/Saisie', [
            'classe' => $classe,
            'inscriptions' => $inscriptions,
            'absences' => $absences,
            'date' => $date,
            'isLocked' => $isLocked,
            'lockedBy' => $lockedBy,
            'lockedAt' => $lockedAt,
            'canUnlock' => $canUnlock,
            'scheduleStatus' => $scheduleStatus,
        ]);
    }

    public function history(\App\Models\Classe $classe, \Illuminate\Http\Request $request) 
    {
        if ($this->isStudent()) abort(403);

        // 🔒 Vérification Enseignant
        if ($this->isTeacher() && !in_array($classe->id, $this->getTeacherClassIds())) {
            abort(403, 'Accès non autorisé à cette classe.');
        }

        $type = $request->input('type', 'week'); // week, month, year
        $refDate = \Carbon\Carbon::parse($request->input('date', now()->format('Y-m-d')));

        $currentYear = \App\Models\AnneeScolaire::where('en_cours', true)->first();
        if (!$currentYear) return back()->with('error', __('Aucune année scolaire active.'));

        // 1. Définir la plage de dates
        if ($type === 'month') {
            $start = $refDate->copy()->startOfMonth();
            $end = $refDate->copy()->endOfMonth();
            $periodLabel = $start->translatedFormat('F Y');
            $prevDate = $start->copy()->subMonth()->format('Y-m-d');
            $nextDate = $start->copy()->addMonth()->format('Y-m-d');
        } elseif ($type === 'year') {
            $start = \Carbon\Carbon::parse($currentYear->date_debut ?? now()->startOfYear());
            $end = \Carbon\Carbon::parse($currentYear->date_fin ?? now()->endOfYear());
            $periodLabel = "Année Scolaire " . $currentYear->nom;
            $prevDate = null; 
            $nextDate = null;
        } else { // week
            $start = $refDate->copy()->startOfWeek(\Carbon\Carbon::MONDAY);
            $end = $refDate->copy()->endOfWeek(\Carbon\Carbon::SUNDAY);
            $periodLabel = "Semaine du " . $start->format('d/m') . " au " . $end->format('d/m');
            $prevDate = $start->copy()->subWeek()->format('Y-m-d');
            $nextDate = $start->copy()->addWeek()->format('Y-m-d');
        }

        // 2. Générer les jours (colonnes) pour la grille (sauf si View Année)
        $dates = [];
        if ($type !== 'year') {
            $curr = $start->copy();
            while ($curr <= $end) {
                if ($curr->dayOfWeek !== \Carbon\Carbon::SUNDAY) {
                    $dates[] = [
                        'date' => $curr->format('Y-m-d'),
                        'day_name' => $curr->translatedFormat('D'),
                        'day_num' => $curr->format('d')
                    ];
                }
                $curr->addDay();
            }
        }

        // 3. Récupérer les élèves triés par nom
        $inscriptions = \App\Models\Inscription::where('classe_id', $classe->id)
            ->where('annee_scolaire_id', $currentYear->id)
            ->with(['eleve.user'])
            ->get()
            ->sortBy(function ($insc) {
                return ($insc->eleve?->user?->nom ?? '') . ' ' . ($insc->eleve?->user?->prenom ?? '');
            })
            ->values();

        // 4. Récupérer les absences
        $absences = \App\Models\Absence::whereIn('inscription_id', $inscriptions->pluck('id'))
            ->whereBetween('date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->get();

        // 5. Mapper les données avec comparaison de date au format Y-m-d
        $students = $inscriptions->map(function ($insc) use ($absences, $type, $dates) {
            $studentAbsences = $absences->where('inscription_id', $insc->id);
            
            $data = [
                'id' => $insc->id,
                'name' => ($insc->eleve?->user?->prenom ?? '') . ' ' . ($insc->eleve?->user?->nom ?? ''),
                'matricule' => $insc->eleve?->matricule ?? '',
            ];

            if ($type === 'year') {
                // Vue Stats
                $data['stats'] = [
                    'absences' => $studentAbsences->where('type', 'absence')->count(),
                    'retards' => $studentAbsences->where('type', 'retard')->count(),
                    'justified' => $studentAbsences->filter(fn($a) => (bool)$a->justifiee)->count(),
                ];
            } else {
                // Vue Grille
                $attendance = [];
                foreach ($dates as $d) {
                    $abs = $studentAbsences->first(function ($a) use ($d) {
                        return $a->date?->format('Y-m-d') === $d['date'];
                    });

                    $attendance[$d['date']] = $abs ? [
                        'type' => $abs->type,
                        'justifiee' => (bool)$abs->justifiee,
                        'motif' => $abs->motif
                    ] : null; // Présent
                }
                $data['attendance'] = $attendance;
                // Stats pour la période affichée
                $data['stats'] = [
                    'absences' => $studentAbsences->where('type', 'absence')->count(),
                    'retards' => $studentAbsences->where('type', 'retard')->count(),
                ];
            }

            return $data;
        });

        return \Inertia\Inertia::render('Absences/History', [
            'classe' => $classe,
            'students' => $students,
            'dates' => $dates,
            'filters' => [
                'type' => $type,
                'date' => $refDate->format('Y-m-d'),
                'periodLabel' => $periodLabel,
                'prevDate' => $prevDate,
                'nextDate' => $nextDate
            ]
        ]);
    }
    public function storeBulk(\App\Models\Classe $classe, \Illuminate\Http\Request $request) 
    {
        $request->validate([
            'date' => 'required|date',
            'absences' => 'array'
        ]);

        $date = $request->input('date');
        $donnees = $request->input('absences', []); // [inscription_id => {type, justifiee, motif...}]
        $user = $request->user();

        // 🔒 Sécurité : Vérifier si l'appel est déjà verrouillé pour cette date
        $existingAppel = \App\Models\Appel::where('classe_id', $classe->id)
            ->where('date', $date)
            ->first();

        if ($existingAppel && $existingAppel->verrouille && $this->isTeacher()) {
            return back()->with('error', "🔒 L'appel pour le {$date} a déjà été validé et verrouillé. Toute modification ultérieure doit être effectuée par la Direction.");
        }

        // 📅 Sécurité : Contrôle de l'Emploi du Temps pour les Enseignants
        $currentYear = \App\Models\AnneeScolaire::where('en_cours', true)->first();
        if (!$currentYear) return back()->with('error', __('Année scolaire introuvable'));

        if ($this->isTeacher()) {
            $carbon = \Carbon\Carbon::parse($date);
            $daysMap = [0 => 'Dimanche', 1 => 'Lundi', 2 => 'Mardi', 3 => 'Mercredi', 4 => 'Jeudi', 5 => 'Vendredi', 6 => 'Samedi'];
            $jourNom = $daysMap[$carbon->dayOfWeek];

            $totalSlotsForClass = \App\Models\EmploiDuTemps::where('classe_id', $classe->id)
                ->where('annee_scolaire_id', $currentYear->id)
                ->count();

            // Si l'emploi du temps est configuré pour cette classe, on applique le contrôle strict pour l'enseignant
            if ($totalSlotsForClass > 0) {
                $coursesToday = \App\Models\EmploiDuTemps::where('classe_id', $classe->id)
                    ->where('annee_scolaire_id', $currentYear->id)
                    ->whereRaw('LOWER(jour) = ?', [strtolower($jourNom)])
                    ->get();

                if ($coursesToday->count() === 0) {
                    return back()->with('error', "⛔ Impossible d'enregistrer l'appel : aucun cours n'est programmé pour la classe de {$classe->nom} le {$jourNom}.");
                }

                $enseignant = \App\Models\Enseignant::where('user_id', $user->id)->first();
                if ($enseignant) {
                    $hasDirect = $coursesToday->contains(fn($c) => $c->enseignant_id == $enseignant->id);
                    $assignedSubjects = \App\Models\Cours::where('classe_id', $classe->id)
                        ->where('enseignant_id', $enseignant->id)
                        ->where('annee_scolaire_id', $currentYear->id)
                        ->pluck('matiere_id')
                        ->toArray();
                    $hasSubject = $coursesToday->contains(fn($c) => in_array($c->matiere_id, $assignedSubjects));

                    if (!$hasDirect && !$hasSubject) {
                        return back()->with('error', "⛔ Vous n'avez aucun cours programmé avec la classe de {$classe->nom} le {$jourNom}.");
                    }
                }
            }
        }

        // 🛡️ Sécurité : Récupérer les IDs valides pour cette classe
        $validInscriptionIds = \App\Models\Inscription::where('classe_id', $classe->id)
            ->where('annee_scolaire_id', $currentYear->id)
            ->pluck('id')
            ->toArray();

        \Illuminate\Support\Facades\DB::transaction(function () use ($donnees, $date, $validInscriptionIds) {
            foreach ($donnees as $inscriptionId => $data) {
                
                // 🛡️ Vérification d'appartenance
                if (!in_array($inscriptionId, $validInscriptionIds)) {
                    continue; // Ignorer les IDs frauduleux ou hors contexte
                }

                // Si data est vide ou marked=false, supprimer l'absence si elle existe
                if (empty($data['marked']) || $data['marked'] === false) {
                    \App\Models\Absence::where('inscription_id', $inscriptionId)
                        ->where('date', $date)
                        ->delete();
                    continue;
                }

                \App\Models\Absence::updateOrCreate(
                    [
                        'inscription_id' => $inscriptionId,
                        'date' => $date
                    ],
                    [
                        'type' => $data['type'] ?? 'absence',
                        'justifiee' => $data['justifiee'] ?? false,
                        'motif' => $data['motif'] ?? null
                    ]
                );

                // 🔔 NOTIFICATION PARENTS
                $inscription = \App\Models\Inscription::find($inscriptionId);
                if ($inscription && $inscription->eleve) {
                    $parents = $inscription->eleve->parents;
                    foreach ($parents as $parent) {
                        if ($parent->user) {
                            $parent->user->notify(new \App\Notifications\AbsenceNotification(
                                $inscription->eleve,
                                $date,
                                $data['type'] ?? 'absence',
                                $data['motif'] ?? null
                            ));
                        }
                    }
                }
            }
        });

        // 🔒 Clôturer et verrouiller l'appel pour cette date
        \App\Models\Appel::updateOrCreate(
            [
                'classe_id' => $classe->id,
                'date' => $date,
            ],
            [
                'annee_scolaire_id' => $currentYear->id,
                'user_id' => $user->id,
                'verrouille' => true,
                'statut' => 'cloture',
            ]
        );

        return back()->with('success', "✅ Appel du jour validé et verrouillé avec succès.");
    }

    /**
     * Déverrouiller ou reverrouiller un appel (Direction / Personnel)
     */
    public function toggleLock(\App\Models\Classe $classe, \Illuminate\Http\Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole(['super-admin', 'directeur', 'personnel'])) {
            abort(403, "Cette action est réservée à la Direction.");
        }

        $date = $request->input('date', now()->format('Y-m-d'));
        $currentYear = \App\Models\AnneeScolaire::where('en_cours', true)->first();
        if (!$currentYear) return back()->with('error', __('Aucune année scolaire active.'));

        $appel = \App\Models\Appel::where('classe_id', $classe->id)
            ->where('date', $date)
            ->first();

        if ($appel) {
            $appel->verrouille = !$appel->verrouille;
            $appel->save();
            $msg = $appel->verrouille 
                ? "🔒 L'appel du {$date} a été verrouillé." 
                : "🔓 L'appel du {$date} a été déverrouillé avec succès. La modification est désormais possible.";
        } else {
            \App\Models\Appel::create([
                'classe_id' => $classe->id,
                'annee_scolaire_id' => $currentYear->id,
                'user_id' => $user->id,
                'date' => $date,
                'verrouille' => false,
                'statut' => 'ouvert',
            ]);
            $msg = "🔓 L'appel du {$date} est désormais ouvert.";
        }

        return back()->with('success', $msg);
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

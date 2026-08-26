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

        return \Inertia\Inertia::render('Absences/Saisie', [
            'classe' => $classe,
            'inscriptions' => $inscriptions,
            'absences' => $absences,
            'date' => $date,
            'isLocked' => $isLocked,
            'lockedBy' => $lockedBy,
            'lockedAt' => $lockedAt,
            'canUnlock' => $canUnlock,
        ]);
    }

    public function history(\App\Models\Classe $classe, \Illuminate\Http\Request $request) 
    {
        if ($this->isStudent()) abort(403);

        $type = $request->input('type', 'week'); // week, month, year
        $refDate = \Carbon\Carbon::parse($request->input('date', now()));

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
            // Pour l'année scolaire, on pourrait utiliser les dates de début/fin de l'année scolaire
            // Mais pour simplifier, disons l'année civile ou une plage large
            $start = \Carbon\Carbon::parse($currentYear->date_debut ?? now()->startOfYear());
            $end = \Carbon\Carbon::parse($currentYear->date_fin ?? now()->endOfYear());
            $periodLabel = "Année Scolaire " . $currentYear->nom;
            // Pas de navigation simple pour l'année scolaire ici sans changer d'ID
            $prevDate = null; 
            $nextDate = null;
        } else { // week
            $start = $refDate->copy()->startOfWeek();
            $end = $refDate->copy()->endOfWeek(); // Vendredi ou Dimanche ? Disons Dimanche pour couvrir tout.
            $periodLabel = "Semaine du " . $start->format('d/m') . " au " . $end->format('d/m');
            $prevDate = $start->copy()->subWeek()->format('Y-m-d');
            $nextDate = $start->copy()->addWeek()->format('Y-m-d');
        }

        // 2. Générer les jours (colonnes) pour la grille (sauf si View Année)
        $dates = [];
        if ($type !== 'year') {
            $curr = $start->copy();
            while ($curr <= $end) {
                // On exclut le dimanche par défaut ? Gardons Lundi-Samedi
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

        // 3. Récupérer les élèves
        $inscriptions = \App\Models\Inscription::where('classe_id', $classe->id)
            ->where('annee_scolaire_id', $currentYear->id)
            ->with(['eleve.user'])
            ->orderBy('id') // Ou par nom
            ->get();

        // 4. Récupérer les absences
        $absences = \App\Models\Absence::whereIn('inscription_id', $inscriptions->pluck('id'))
            ->whereBetween('date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->get();

        // 5. Mapper les données
        $students = $inscriptions->map(function ($insc) use ($absences, $type, $dates) {
            $studentAbsences = $absences->where('inscription_id', $insc->id);
            
            $data = [
                'id' => $insc->id,
                'name' => $insc->eleve->user->nom . ' ' . $insc->eleve->user->prenom,
                'matricule' => $insc->eleve->matricule,
            ];

            if ($type === 'year') {
                // Vue Stats
                $data['stats'] = [
                    'absences' => $studentAbsences->where('type', 'absence')->count(),
                    'retards' => $studentAbsences->where('type', 'retard')->count(),
                    'justified' => $studentAbsences->where('justifiee', true)->count(),
                ];
            } else {
                // Vue Grille
                $attendance = [];
                foreach ($dates as $d) {
                    $abs = $studentAbsences->firstWhere('date', $d['date']);
                    $attendance[$d['date']] = $abs ? [
                        'type' => $abs->type,
                        'justifiee' => (bool)$abs->justifiee,
                        'motif' => $abs->motif
                    ] : null; // Présent
                }
                $data['attendance'] = $attendance;
                // Petites stats pour la ligne aussi
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

        // 🛡️ Sécurité : Récupérer les IDs valides pour cette classe
        $currentYear = \App\Models\AnneeScolaire::where('en_cours', true)->first();
        if (!$currentYear) return back()->with('error', __('Année scolaire introuvable'));

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

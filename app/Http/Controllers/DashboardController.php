<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Eleve;
use App\Models\Enseignant;
use App\Models\Classe;
use App\Models\User;
use App\Models\AnneeScolaire;
use App\Models\Inscription;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        $anneeId = $currentYear ? $currentYear->id : null;

        // 🛑 DASHBOARD ÉLÈVE
        if ($user->hasRole('eleve')) {
            // Récupérer l'élève lié
            $eleve = Eleve::where('user_id', $user->id)->first();
            
            if (!$eleve || !$anneeId) {
                return Inertia::render('Dashboard/Student', [
                    'error' => 'Aucune inscription active trouvée.',
                    'eleve' => $eleve,
                ]);
            }

            $inscription = Inscription::where('eleve_id', $eleve->id)
                ->where('annee_scolaire_id', $anneeId)
                ->with(['classe'])
                ->first();

            if (!$inscription) {
                return Inertia::render('Dashboard/Student', [
                    'error' => 'Non inscrit pour cette année scolaire.',
                    'eleve' => $eleve
                ]);
            }

            // 1. Moyenne Générale (Via BulletinSvc ou approx)
            // On peut appeler le BulletinService ici
            $bulletinService = new \App\Services\BulletinService();
            // On prend la période active
            $periodeActive = \App\Models\Periode::where('annee_scolaire_id', $anneeId)->where('actif', true)->first();
            
            $moyenneGenerale = 0;
            $rang = 0;
            
            if ($periodeActive) {
                $bulletin = $bulletinService->calculerBulletin($inscription, $periodeActive);
                $moyenneGenerale = $bulletin['moyenne_generale'];
                // Pour le rang, c'est lourd de recalculer toute la classe à chaque refresh dashboard.
                // On peut le laisser à 0 ou le cacher pour l'instant.
            }

            // 2. Dernières Notes (5 dernières)
            $recentGrades = \App\Models\Note::where('inscription_id', $inscription->id)
                ->with(['evaluation.cours.matiere'])
                ->latest()
                ->take(5)
                ->get()
                ->map(function($note) {
                    return [
                        'id' => $note->id,
                        'matiere' => $note->evaluation->cours->matiere->nom ?? 'Matière',
                        'valeur' => $note->valeur,
                        'sur' => $note->evaluation->note_max,
                        'date' => $note->evaluation->date_evaluation,
                        'type' => $note->evaluation->type
                    ];
                });

            // 3. Absences
            $absencesCount = \App\Models\Absence::where('inscription_id', $inscription->id)->count();

            // 4. Emploi du temps (Aujourd'hui)
            $today = strtolower(now()->locale('fr')->dayName);
            // Mapping jours fr -> DB if needed, but standardizing on simple strings usually
            // Assuming DB stores 'lundi', 'mardi'...
            
            $schedule = \App\Models\EmploiDuTemps::where('classe_id', $inscription->classe_id)
                ->where('jour', $today)
                ->where('annee_scolaire_id', $anneeId)
                ->with(['matiere', 'enseignant.user'])
                ->orderBy('heure_debut')
                ->get()
                ->map(function($edt) {
                    return [
                        'id' => $edt->id,
                        'heure' => substr($edt->heure_debut, 0, 5) . ' - ' . substr($edt->heure_fin, 0, 5),
                        'matiere' => $edt->matiere->nom,
                        'salle' => $edt->salle ?? 'N/A',
                        'prof' => $edt->enseignant->user->nom ?? ''
                    ];
                });

            return Inertia::render('Dashboard/Student', [
                'eleve' => $user, // User details
                'inscription' => $inscription,
                'stats' => [
                    'moyenne' => $moyenneGenerale,
                    'absences' => $absencesCount,
                    'rang' => $rang
                ],
                'recentGrades' => $recentGrades,
                'schedule' => $schedule,
                'periode' => $periodeActive ? $periodeActive->nom : 'Période Inconnue'
            ]);
        }

        // 🛑 DASHBOARD ENSEIGNANT
        if ($user->hasRole('enseignant')) {
            $enseignant = Enseignant::where('user_id', $user->id)->first();
            
            if (!$enseignant || !$anneeId) {
                return Inertia::render('Dashboard', ['error' => 'Profil enseignant non trouvé ou année non configurée.']);
            }

            // 1. Emploi du temps (Aujourd'hui)
            $today = strtolower(now()->locale('fr')->dayName);
            $schedule = \App\Models\EmploiDuTemps::where('enseignant_id', $enseignant->id)
                ->where('jour', $today)
                ->where('annee_scolaire_id', $anneeId)
                ->with(['matiere', 'classe'])
                ->orderBy('heure_debut')
                ->get()
                ->map(function($edt) {
                    return [
                        'id' => $edt->id,
                        'heure' => substr($edt->heure_debut, 0, 5) . ' - ' . substr($edt->heure_fin, 0, 5),
                        'matiere' => $edt->matiere->nom,
                        'classe' => $edt->classe->nom,
                        'salle' => $edt->salle ?? 'N/A',
                        // Status could be derived (e.g., past, current, upcoming)
                    ];
                });

            // 2. Mes Classes (celles où il enseigne)
            // On combine les classes de l'emploi du temps ET les cours assignés directement
            $timetableClassIds = \App\Models\EmploiDuTemps::where('enseignant_id', $enseignant->id)
                ->where('annee_scolaire_id', $anneeId)
                ->pluck('classe_id')
                ->toArray();
            
            $courseClassIds = \App\Models\Cours::where('enseignant_id', $enseignant->id)
                ->where('annee_scolaire_id', $anneeId)
                ->pluck('classe_id')
                ->toArray();

            $allClassIds = array_unique(array_merge($timetableClassIds, $courseClassIds));
            
            $myClasses = \App\Models\Classe::whereIn('id', $allClassIds)
                ->orderBy('nom')
                ->get()
                ->map(function($c) use ($anneeId) {
                    return [
                        'id' => $c->id,
                        'nom' => $c->nom,
                        'type' => $c->type,
                        'students_count' => $c->inscriptions()
                            ->where('annee_scolaire_id', $anneeId)
                            ->count()
                    ];
                });

            // 3. Données Profil (Pour l'onglet "Mon Profil")
            $enseignant->load([
                'user',
                'cours.matiere',
                'cours.classe',
                'cours.anneeScolaire'
            ]);

            return Inertia::render('Dashboard/Teacher', [
                'schedule' => $schedule,
                'myClasses' => $myClasses,
                'todayDate' => now()->locale('fr')->isoFormat('LL'),
                'teacherProfile' => $enseignant, // Profil complet
                'teacherCourses' => $enseignant->cours, // Cours pour l'onglet profil
            ]);
        }

        // 🛑 DASHBOARD PARENT
        if ($user->hasRole('parent')) {
            $parent = \App\Models\ParentModel::where('user_id', $user->id)->first();
            
            $children = collect();
            if ($parent) {
                // On charge les enfants avec leur user et leur inscription courante
                $children = $parent->eleves()
                    ->with(['user', 'inscriptions' => function($q) use ($anneeId) {
                        $q->where('annee_scolaire_id', $anneeId)->with('classe');
                    }])
                    ->get()
                    ->map(function($child) {
                        $inscription = $child->inscriptions->first(); // Grâce au filtre ci-dessus
                        return [
                            'id' => $child->id,
                            'matricule' => $child->matricule,
                            'nom_complet' => $child->user->nom . ' ' . $child->user->prenom,
                            'photo' => $child->photo ? \Illuminate\Support\Facades\Storage::url($child->photo) : null,
                            'classe' => $inscription ? $inscription->classe->nom : 'Non inscrit',
                            'inscription_id' => $inscription ? $inscription->id : null,
                            'statut' => $inscription ? $inscription->statut : 'N/A',
                        ];
                    });
            }

            return Inertia::render('Dashboard/Parent', [
                'children' => $children,
                'parentName' => $user->nom . ' ' . $user->prenom,
            ]);
        }

        // 🛑 DASHBOARD ADMIN / PROF
        // ... (Code existant pour Admin)
        $totalEleves = $anneeId 
            ? Inscription::where('annee_scolaire_id', $anneeId)->count() 
            : 0;

        $totalEnseignants = Enseignant::count();
        $totalClasses = Classe::count();
        $totalParents = User::role('parent')->count();

        // 2. Derni?res Inscriptions
        $recentRegistrations = [];
        if ($anneeId) {
             $recentRegistrations = Inscription::with(['eleve.user', 'classe'])
                ->where('annee_scolaire_id', $anneeId)
                ->latest()
                ->take(5)
                ->get()
                ->map(function($insc) {
                    return [
                        'id' => $insc->id,
                        'name' => $insc->eleve->user->nom . ' ' . $insc->eleve->user->prenom,
                        'classe' => $insc->classe ? ($insc->classe->nom . ' (' . ucfirst($insc->classe->type) . ')') : 'N/A',
                        'date' => $insc->created_at->format('d M, H:i'),
                        'avatar' => mb_substr($insc->eleve->user->nom, 0, 1) . mb_substr($insc->eleve->user->prenom, 0, 1),
                        'status' => $insc->statut ?? 'validee'
                    ];
                });
        }

        // 3. KPI Financiers (Mois en cours)
        // 3. KPI Financiers (Mois en cours)
        $canSeeFinances = $user->can('voir_paiements') && $user->can('voir_depenses');
        $financialStats = null;
        $financialChart = [];

        if ($canSeeFinances) {
            $startOfMonth = now()->startOfMonth();
            $endOfMonth = now()->endOfMonth();

            $recettesMois = \App\Models\Paiement::whereBetween('date_paiement', [$startOfMonth, $endOfMonth])->sum('montant');
            
            // Dépenses Opérationnelles + Salaires (désormais inclus dans Depense)
            $depensesMois = \App\Models\Depense::whereBetween('date_depense', [$startOfMonth, $endOfMonth])->sum('montant');
            $soldeMois = $recettesMois - $depensesMois;

            $financialStats = [
                'income' => $recettesMois,
                'expense' => $depensesMois,
                'balance' => $soldeMois
            ];

            // 4. Graphique (6 derniers mois)
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $monthName = $date->translatedFormat('M');
                $year = $date->year;
                $month = $date->month;

                $income = \App\Models\Paiement::whereYear('date_paiement', $year)
                    ->whereMonth('date_paiement', $month)
                    ->sum('montant');
                
                $expense = \App\Models\Depense::whereYear('date_depense', $year)
                    ->whereMonth('date_depense', $month)
                    ->sum('montant');

                $financialChart[] = [
                    'name' => $monthName,
                    'Revenus' => $income,
                    'Dépenses' => $expense
                ];
            }
        }

        return Inertia::render('Dashboard', [
            'counts' => [
                'students' => $totalEleves,
                'teachers' => $totalEnseignants,
                'classes' => $totalClasses,
                'parents' => $totalParents
            ],
            'recentRegistrations' => $recentRegistrations,
            'currentYear' => $currentYear,
            'financialStats' => $financialStats,
            'financialChart' => $financialChart,
        ]);
    }
}

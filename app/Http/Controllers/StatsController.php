<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AnneeScolaire;
use App\Models\Inscription;
use App\Models\Paiement;
use App\Models\Depense;
use App\Models\Classe;
use App\Models\FraisType;
use App\Models\FraisClasse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatsController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_stats')->only(['index']);
    }

    public function index(Request $request) 
    {
        // 1. Filtres
        $anneeId = $request->input('annee_id');
        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        
        if (!$anneeId && $currentYear) {
            $anneeId = $currentYear->id;
        }

        $selectedAnnee = AnneeScolaire::find($anneeId) ?? $currentYear;
        $startDate = $request->input('start_date', Carbon::now()->startOfYear()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfYear()->toDateString());

        // 2. KPIS SYNTHÈSE GLOBAUX
        $totalInscrits = Inscription::where('annee_scolaire_id', $anneeId)->count();
        $garcons = Inscription::where('annee_scolaire_id', $anneeId)->whereHas('eleve', fn($q) => $q->where('sexe', 'M'))->count();
        $filles = Inscription::where('annee_scolaire_id', $anneeId)->whereHas('eleve', fn($q) => $q->where('sexe', 'F'))->count();
        $nouveaux = Inscription::where('annee_scolaire_id', $anneeId)->where('reinscription', false)->count();
        $reinscrits = Inscription::where('annee_scolaire_id', $anneeId)->where('reinscription', true)->count();
        
        $totalPaiements = (float) Paiement::whereHas('inscription', fn($q) => $q->where('annee_scolaire_id', $anneeId))->sum('montant');
        $totalDepenses = (float) Depense::sum('montant');
        $soldeNet = $totalPaiements - $totalDepenses;
        $totalClasses = Classe::count();

        // 3. DÉMOGRAPHIE
        // Répartition Filles/Garçons
        $genreStats = Inscription::where('annee_scolaire_id', $anneeId)
            ->join('eleves', 'inscriptions.eleve_id', '=', 'eleves.id')
            ->select('eleves.sexe', DB::raw('count(*) as total'))
            ->groupBy('eleves.sexe')
            ->get();

        // Répartition par Cycle/Section
        $sectionStats = Inscription::where('annee_scolaire_id', $anneeId)
            ->join('classes', 'inscriptions.classe_id', '=', 'classes.id')
            ->select('classes.type as section', DB::raw('count(*) as total'))
            ->groupBy('classes.type')
            ->get()
            ->map(function ($s) {
                return [
                    'section' => ucfirst(strtolower($s->section)),
                    'total' => (int) $s->total,
                ];
            });

        // Effectifs détaillés par classe avec modalité de scolarité dynamique
        $fraisScolariteMap = FraisClasse::where('annee_scolaire_id', $anneeId)
            ->whereHas('fraisType', fn($q) => $q->where('is_scolarite', true))
            ->with(['echeances' => fn($q) => $q->orderBy('ordre')])
            ->get()
            ->keyBy('classe_id');

        $classesStats = Classe::withCount([
            'inscriptions as total_eleves' => function($q) use ($anneeId) {
                $q->where('annee_scolaire_id', $anneeId);
            },
            'inscriptions as filles' => function($q) use ($anneeId) {
                $q->where('annee_scolaire_id', $anneeId)
                  ->whereHas('eleve', fn($e) => $e->where('sexe', 'F'));
            },
            'inscriptions as garcons' => function($q) use ($anneeId) {
                $q->where('annee_scolaire_id', $anneeId)
                  ->whereHas('eleve', fn($e) => $e->where('sexe', 'M'));
            }
        ])
        ->get()
        ->map(function ($c) use ($totalInscrits, $fraisScolariteMap) {
            $pct = $totalInscrits > 0 ? round(($c->total_eleves / $totalInscrits) * 100, 1) : 0;
            
            // Résolution dynamique de la modalité configurée dans Frais de Classe
            $fraisConfig = $fraisScolariteMap[$c->id] ?? null;
            $nombreEcheances = 0;

            if ($fraisConfig) {
                $modePaiement = $fraisConfig->mode_paiement;
                $nombreEcheances = $fraisConfig->echeances->count();

                if ($modePaiement === 'mensuel') {
                    $modaliteLabel = $nombreEcheances > 0 ? "{$nombreEcheances} Mois" : "Mensuel";
                } elseif ($modePaiement === 'tranches') {
                    $modaliteLabel = $nombreEcheances > 0 ? "{$nombreEcheances} Tranches" : "Tranches";
                } elseif ($modePaiement === 'unique') {
                    $modaliteLabel = "Paiement unique";
                } else {
                    $modaliteLabel = ucfirst($modePaiement);
                }
            } else {
                // Fallback selon le cycle si pas encore paramétré dans Frais de classe
                $modePaiement = $c->mode_paiement_scolarite ?? ($c->isSecondaire() ? 'tranches' : 'mensuel');
                $modaliteLabel = $modePaiement === 'mensuel' ? '10 Mois' : '3 Tranches';
            }

            return [
                'id' => $c->id,
                'nom' => $c->nom,
                'type' => ucfirst(strtolower($c->type)),
                'total_eleves' => (int) $c->total_eleves,
                'filles' => (int) $c->filles,
                'garcons' => (int) $c->garcons,
                'pourcentage' => $pct,
                'mode_paiement' => $modePaiement,
                'modalite_scolarite' => $modaliteLabel,
                'nombre_echeances' => $nombreEcheances,
                'is_dynamique' => $fraisConfig !== null,
            ];
        });

        // 4. FINANCES
        // Revenus par Type de Frais (Scolarité, Cantine, Transport, Inscription...)
        $revenueByType = Paiement::whereHas('inscription', function($q) use ($anneeId) {
                $q->where('annee_scolaire_id', $anneeId);
            })
            ->join('frais_types', 'paiements.frais_type_id', '=', 'frais_types.id')
            ->select('frais_types.nom', DB::raw('sum(paiements.montant) as total'))
            ->groupBy('frais_types.nom')
            ->orderByDesc('total')
            ->get();

        // Répartition par Mode de Paiement
        $modesPaiement = Paiement::whereHas('inscription', function($q) use ($anneeId) {
                $q->where('annee_scolaire_id', $anneeId);
            })
            ->select('mode_paiement', DB::raw('count(*) as count'), DB::raw('sum(montant) as total'))
            ->groupBy('mode_paiement')
            ->get()
            ->map(function ($m) {
                $cleanMode = strtolower($m->mode_paiement ?? 'especes');
                $label = match($cleanMode) {
                    'especes' => 'Espèces',
                    'virement' => 'Virement bancaire',
                    'cheque' => 'Chèque',
                    'airtel_money' => 'Airtel Money',
                    'moov_money' => 'Moov Money',
                    default => ucfirst($m->mode_paiement ?? 'Espèces')
                };
                return [
                    'mode' => $cleanMode,
                    'label' => $label,
                    'count' => (int) $m->count,
                    'total' => (float) $m->total,
                ];
            });

        // Dépenses par catégorie
        $depensesByCat = Depense::select('categorie as label', DB::raw('sum(montant) as total'))
            ->groupBy('categorie')
            ->orderByDesc('total')
            ->get()
            ->map(function ($d) {
                return [
                    'label' => $d->label ?: 'Général',
                    'value' => (float) $d->total,
                ];
            });

        // Évolution mensuelle Recettes vs Dépenses
        $months = [
            9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc',
            1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr', 5 => 'Mai', 6 => 'Juin',
            7 => 'Juil', 8 => 'Août'
        ];

        $monthlyPayments = Paiement::whereHas('inscription', fn($q) => $q->where('annee_scolaire_id', $anneeId))
            ->select(DB::raw('MONTH(date_paiement) as mois'), DB::raw('sum(montant) as total'))
            ->groupBy(DB::raw('MONTH(date_paiement)'))
            ->pluck('total', 'mois')
            ->toArray();

        $monthlyExpenses = Depense::select(DB::raw('MONTH(date_depense) as mois'), DB::raw('sum(montant) as total'))
            ->groupBy(DB::raw('MONTH(date_depense)'))
            ->pluck('total', 'mois')
            ->toArray();

        $monthlyEvolution = [];
        foreach ($months as $num => $label) {
            $rev = (float) ($monthlyPayments[$num] ?? 0);
            $dep = (float) ($monthlyExpenses[$num] ?? 0);
            $monthlyEvolution[] = [
                'name' => $label,
                'recettes' => $rev,
                'depenses' => $dep,
                'solde' => $rev - $dep
            ];
        }

        // 5. VIE SCOLAIRE & ASSIDUITÉ
        $absencesCount = \App\Models\Absence::count();
        $sanctionsCount = \App\Models\Sanction::count();
        $enseignantsCount = \App\Models\Enseignant::count();

        return Inertia::render('Stats/Index', [
            'filters' => [
                'annee_id' => (int) $anneeId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'selectedAnnee' => $selectedAnnee,
            'annees' => AnneeScolaire::all(['id', 'nom']),
            'kpis' => [
                'total_eleves' => $totalInscrits,
                'garcons' => $garcons,
                'filles' => $filles,
                'pct_garcons' => $totalInscrits > 0 ? round(($garcons / $totalInscrits) * 100) : 0,
                'pct_filles' => $totalInscrits > 0 ? round(($filles / $totalInscrits) * 100) : 0,
                'nouveaux' => $nouveaux,
                'reinscrits' => $reinscrits,
                'total_classes' => $totalClasses,
                'moyenne_par_classe' => $totalClasses > 0 ? round($totalInscrits / $totalClasses, 1) : 0,
                'total_revenus' => $totalPaiements,
                'total_depenses' => $totalDepenses,
                'solde_net' => $soldeNet,
                'marge_pourcentage' => $totalPaiements > 0 ? round(($soldeNet / $totalPaiements) * 100, 1) : 0,
            ],
            'demographie' => [
                'genre' => $genreStats,
                'sections' => $sectionStats,
                'classes' => $classesStats,
            ],
            'finances' => [
                'byType' => $revenueByType,
                'modesPaiement' => $modesPaiement,
                'depensesByCat' => $depensesByCat,
                'totalRevenus' => $totalPaiements,
                'totalDepenses' => $totalDepenses,
                'soldeNet' => $soldeNet,
                'monthlyEvolution' => $monthlyEvolution,
            ],
            'vieScolaire' => [
                'absences' => $absencesCount,
                'sanctions' => $sanctionsCount,
                'enseignants' => $enseignantsCount,
            ],
            'performance' => [
                'topStudents' => [],
                'classRanking' => []
            ]
        ]);
    }
}

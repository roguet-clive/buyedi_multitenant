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

        $startDate = $request->input('start_date', Carbon::now()->startOfYear()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfYear()->toDateString());

        // 2. Data Aggregation
        
        // A. DÉMOGRAPHIE
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
            ->get();

        // B. FINANCES
        // Revenus par Type de Frais (Scolarité, Cantine, Transport...)
        $revenueByType = Paiement::whereHas('inscription', function($q) use ($anneeId) {
                $q->where('annee_scolaire_id', $anneeId);
            })
            ->join('frais_types', 'paiements.frais_type_id', '=', 'frais_types.id')
            ->select('frais_types.nom', DB::raw('sum(paiements.montant) as total'))
            ->groupBy('frais_types.nom')
            ->get();
        
        // Évolution des paiements (Graphique mensuel)
        // ... (Similaire au dashboard mais plus granulaire si filtre date activé)

        // C. PERFORMANCE ACADÉMIQUE
        // Feature "Notes" non encore implémentée. On commente pour éviter le crash.
        /*
        $inscriptions = Inscription::where('annee_scolaire_id', $anneeId)
            ->with(['eleve.user', 'classe', 'notes.evaluation'])
            ->get();

        $studentPerformances = $inscriptions->map(function ($inscription) {
            // ... (Calculs)
            return [...];
        });

        $topStudents = $studentPerformances->sortByDesc('average')->take(5)->values();
        $classStats = $studentPerformances->groupBy('classe')->map(function ($students, $classeName) {
            // ...
        })->sortByDesc('success_rate')->values();
        */
        
        $topStudents = [];
        $classStats = [];

        return Inertia::render('Stats/Index', [
            'filters' => [
                'annee_id' => $anneeId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'annees' => AnneeScolaire::all(['id', 'nom']), // Pour le selecteur
            'demographie' => [
                'genre' => $genreStats,
                'sections' => $sectionStats
            ],
            'finances' => [
                'byType' => $revenueByType,
            ],
            'performance' => [
                'topStudents' => $topStudents,
                'classRanking' => $classStats
            ]
        ]);
    }
}

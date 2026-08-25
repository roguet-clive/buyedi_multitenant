<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Inertia\Inertia;
use App\Models\Paiement;
use App\Models\PaiementSalaire;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FinanceController extends Controller
{
    public function index()
    {
        // Require Director Permission
        // if (!auth()->user()->hasRole('directeur')) { abort(403); }

        $year = Carbon::now()->year;

        // 1. Revenus (Scolarité)
        $revenus = Paiement::whereYear('date_paiement', $year)
            ->get()
            ->groupBy(function($val) {
                return Carbon::parse($val->date_paiement)->format('n');
            })
            ->map(function($group) {
                return $group->sum('montant');
            })
            ->toArray();

        // 2. Dépenses (Intègre désormais les Salaires via Depense)
        $depensesOps = \App\Models\Depense::whereYear('date_depense', $year)
            ->get()
            ->groupBy(function($val) {
                return Carbon::parse($val->date_depense)->format('n');
            })
            ->map(function($group) {
                return $group->sum('montant');
            })
            ->toArray();

        // 3. Synthèse Mensuelle
        $data = [];
        $months = [
            1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr', 5 => 'Mai', 6 => 'Juin',
            7 => 'Juil', 8 => 'Août', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc'
        ];

        $totalRevenus = 0;
        $totalDepenses = 0;

        foreach ($months as $num => $name) {
            $rev = $revenus[$num] ?? 0;
            $monthlyDepense = $depensesOps[$num] ?? 0; // Seule source de dépense

            $totalRevenus += $rev;
            $totalDepenses += $monthlyDepense;

            $data[] = [
                'name' => $name,
                'revenus' => (float) $rev,
                'depenses' => (float) $monthlyDepense,
                'solde' => (float) ($rev - $monthlyDepense)
            ];
        }

        // 4. Breakdown Revenus (Par Type de Frais)
        $incomeBreakdown = Paiement::select(
            'frais_types.nom as label',
            DB::raw('SUM(paiements.montant) as value')
        )
        ->join('frais_types', 'paiements.frais_type_id', '=', 'frais_types.id')
        ->whereYear('paiements.date_paiement', $year)
        ->groupBy('frais_types.nom')
        ->orderByDesc('value')
        ->get();

        // 5. Breakdown Dépenses
        // Autres Dépenses par Catégorie (Salaires inclus si catégorie='Salaire')
        $expenseBreakdown = \App\Models\Depense::select(
            'categorie as label',
            DB::raw('SUM(montant) as value')
        )
        ->whereYear('date_depense', $year)
        ->groupBy('categorie')
        ->orderByDesc('value')
        ->get();

        // Sort expenses again
        $expenseBreakdown = $expenseBreakdown->sortByDesc('value')->values();

        return Inertia::render('Finances/Index', [
            'stats' => $data,
            'totals' => [
                'revenus' => $totalRevenus,
                'depenses' => $totalDepenses,
                'solde' => $totalRevenus - $totalDepenses
            ],
            'incomeBreakdown' => $incomeBreakdown,
            'expenseBreakdown' => $expenseBreakdown,
            'year' => $year
        ]);
    }
}

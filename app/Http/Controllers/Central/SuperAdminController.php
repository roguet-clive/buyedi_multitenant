<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\SubscriptionPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class SuperAdminController extends Controller
{
    /**
     * Dashboard du Super-Admin SaaS Buyedi Solutions avec pilotage financier complet
     */
    public function index()
    {
        $tenantsModels = Tenant::with('domains')
            ->orderByDesc('created_at')
            ->get();

        $totalSchoolVolume = 0;

        $tenants = $tenantsModels->map(function ($tenant) use (&$totalSchoolVolume) {
            $elevesCount = 0;
            $schoolPaymentsSum = 0;

            try {
                tenancy()->initialize($tenant);
                $elevesCount = \App\Models\Eleve::count();
                $schoolPaymentsSum = (float) (\App\Models\Paiement::sum('montant') ?? 0);
                $totalSchoolVolume += $schoolPaymentsSum;
            } catch (\Throwable $e) {
                $elevesCount = 0;
                $schoolPaymentsSum = 0;
            } finally {
                tenancy()->end();
            }

            return [
                'id' => $tenant->id,
                'nom' => $tenant->nom,
                'email' => $tenant->email,
                'telephone' => $tenant->telephone,
                'statut' => $tenant->statut,
                'formule' => $tenant->formule,
                'trial_ends_at' => $tenant->trial_ends_at?->format('d/m/Y'),
                'actif_jusqu_a' => $tenant->actif_jusqu_a?->format('d/m/Y'),
                'is_active' => $tenant->isActive(),
                'domain' => $tenant->domains->first()?->domain ?? "{$tenant->id}.localhost",
                'eleves_count' => $elevesCount,
                'school_volume' => $schoolPaymentsSum,
                'created_at' => $tenant->created_at?->format('d/m/Y'),
            ];
        });

        // Calculs des KPIs généraux
        $activeSchools = $tenants->where('statut', 'actif');
        $trialSchools = $tenants->where('statut', 'essai');
        $suspendedSchools = $tenants->where('statut', 'suspendu');

        // Calcul du MRR (Monthly Recurring Revenue)
        $mrr = $activeSchools->sum(function ($t) {
            return match ($t['formule']) {
                'starter' => 45000,
                'pro' => 85000,
                'enterprise' => 150000,
                default => 85000,
            };
        });

        $arr = $mrr * 12;

        // Récupération des paiements d'abonnement SaaS
        $payments = SubscriptionPayment::with('tenant')
            ->orderByDesc('paye_le')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'reference' => $p->reference,
                    'tenant_id' => $p->tenant_id,
                    'tenant_nom' => $p->tenant?->nom ?? $p->tenant_id,
                    'montant' => (float) $p->montant,
                    'formule' => $p->formule,
                    'periode' => $p->periode,
                    'mois' => $p->mois,
                    'methode_paiement' => $p->methode_paiement,
                    'statut' => $p->statut,
                    'notes' => $p->notes,
                    'paye_le' => $p->paye_le?->format('d/m/Y H:i'),
                ];
            });

        $totalRevenue = (float) SubscriptionPayment::where('statut', 'paye')->sum('montant');

        // Répartition par formule
        $planDistribution = [
            'starter' => $tenants->where('formule', 'starter')->count(),
            'pro' => $tenants->where('formule', 'pro')->count(),
            'enterprise' => $tenants->where('formule', 'enterprise')->count(),
        ];

        // Évolution des 6 derniers mois pour les graphiques
        $monthlyTrend = [];
        $monthsFr = [
            1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr', 5 => 'Mai', 6 => 'Juin',
            7 => 'Juil', 8 => 'Août', 9 => 'Sept', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc'
        ];

        for ($i = 5; $i >= 0; $i--) {
            $targetDate = now()->subMonths($i);
            $monthNum = (int) $targetDate->format('n');
            $yearNum = (int) $targetDate->format('Y');

            $monthRevenue = (float) SubscriptionPayment::where('statut', 'paye')
                ->whereYear('paye_le', $yearNum)
                ->whereMonth('paye_le', $monthNum)
                ->sum('montant');

            $monthlyTrend[] = [
                'mois' => $monthsFr[$monthNum] . ' ' . $targetDate->format('y'),
                'revenu_saas' => $monthRevenue,
                'mrr_estime' => round($mrr * (0.7 + (5 - $i) * 0.06)),
            ];
        }

        $stats = [
            'total_schools' => $tenants->count(),
            'active_schools' => $activeSchools->count(),
            'trial_schools' => $trialSchools->count(),
            'suspended_schools' => $suspendedSchools->count(),
            'total_eleves' => $tenants->sum('eleves_count'),
            'total_revenue' => $totalRevenue,
            'mrr' => $mrr,
            'arr' => $arr,
            'total_school_volume' => $totalSchoolVolume,
            'arpu' => $activeSchools->count() > 0 ? round($mrr / $activeSchools->count()) : 0,
            'plan_distribution' => $planDistribution,
            'monthly_trend' => $monthlyTrend,
        ];

        return Inertia::render('Central/SuperAdmin/Index', [
            'tenants' => $tenants,
            'payments' => $payments,
            'stats' => $stats,
        ]);
    }

    /**
     * Enregistrer un nouvel encaissement d'abonnement (Airtel Money, Moov, Virement, etc.)
     */
    public function storePayment(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'montant' => 'required|numeric|min:1000',
            'formule' => 'required|in:starter,pro,enterprise',
            'periode' => 'required|in:mensuel,semestriel,annuel',
            'mois' => 'required|integer|min:1|max:36',
            'methode_paiement' => 'required|in:airtel_money,moov_money,virement_bancaire,especes,cheque',
            'notes' => 'nullable|string|max:500',
        ]);

        $tenant = Tenant::findOrFail($validated['tenant_id']);

        // Génération de la référence unique
        $refIndex = SubscriptionPayment::count() + 1;
        $reference = 'FAC-' . date('Y') . '-' . str_pad((string) $refIndex, 3, '0', STR_PAD_LEFT);

        SubscriptionPayment::create([
            'tenant_id' => $tenant->id,
            'reference' => $reference,
            'montant' => $validated['montant'],
            'formule' => $validated['formule'],
            'periode' => $validated['periode'],
            'mois' => (int) $validated['mois'],
            'methode_paiement' => $validated['methode_paiement'],
            'statut' => 'paye',
            'notes' => $validated['notes'],
            'paye_le' => now(),
        ]);

        // Prolonger l'abonnement du tenant et l'activer
        $baseDate = $tenant->actif_jusqu_a && $tenant->actif_jusqu_a->isFuture()
            ? $tenant->actif_jusqu_a
            : now();

        $tenant->actif_jusqu_a = $baseDate->addMonths((int) $validated['mois']);
        $tenant->statut = 'actif';
        $tenant->formule = $validated['formule'];
        $tenant->save();

        return back()->with('success', "Encaissement de " . number_format($validated['montant'], 0, ',', ' ') . " F CFA enregistré avec succès (Réf: {$reference}) pour '{$tenant->nom}'. Abonnement prolongé jusqu'au " . $tenant->actif_jusqu_a->format('d/m/Y') . ".");
    }

    /**
     * Mise à jour du statut d'une école (actif, suspendu, prolongation)
     */
    public function updateStatus(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'statut' => 'required|in:actif,essai,suspendu,expire',
            'formule' => 'required|in:starter,pro,enterprise',
            'mois_supplementaires' => 'nullable|integer|min:1|max:36',
        ]);

        $tenant->statut = $validated['statut'];
        $tenant->formule = $validated['formule'];

        if (!empty($validated['mois_supplementaires'])) {
            $baseDate = $tenant->actif_jusqu_a && $tenant->actif_jusqu_a->isFuture()
                ? $tenant->actif_jusqu_a
                : now();
            $tenant->actif_jusqu_a = $baseDate->addMonths((int) $validated['mois_supplementaires']);
        }

        $tenant->save();

        return back()->with('success', "Le statut de l'établissement '{$tenant->nom}' a été mis à jour avec succès.");
    }

    /**
     * Connexion directe (Impersonation) vers l'espace de l'école
     */
    public function impersonate(Request $request, Tenant $tenant)
    {
        $adminUserId = null;
        try {
            tenancy()->initialize($tenant);
            $adminUser = \App\Models\User::first();
            $adminUserId = $adminUser?->id;
        } finally {
            tenancy()->end();
        }

        if (!$adminUserId) {
            return back()->with('error', "Aucun utilisateur trouvé dans l'école pour l'impersonation.");
        }

        if (function_exists('activity')) {
            try {
                activity('security')
                    ->causedBy($request->user())
                    ->performedOn($tenant)
                    ->log("Connexion Super-Admin (Impersonation) vers l'établissement {$tenant->nom} ({$tenant->id})");
            } catch (\Throwable $e) {
                // Silently continue if log fails
            }
        }

        $token = tenancy()->impersonate($tenant, (string) $adminUserId, '/dashboard');

        $port = parse_url(config('app.url', 'http://localhost'), PHP_URL_PORT);
        $portStr = $port ? ":{$port}" : ($request->getPort() && !in_array($request->getPort(), [80, 443]) ? ":{$request->getPort()}" : '');
        $domain = $tenant->domains->first()?->domain ?? "{$tenant->id}.localhost";

        $redirectUrl = "http://{$domain}{$portStr}/impersonate/{$token->token}";

        return redirect()->away($redirectUrl);
    }
}

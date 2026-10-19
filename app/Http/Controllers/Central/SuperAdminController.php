<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SuperAdminController extends Controller
{
    /**
     * Dashboard du Super-Admin SaaS Buyedi
     */
    public function index()
    {
        $tenants = Tenant::with('domains')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($tenant) {
                // Tenter de compter les élèves dans la base du tenant
                $elevesCount = 0;
                try {
                    tenancy()->initialize($tenant);
                    $elevesCount = \App\Models\Eleve::count();
                } catch (\Throwable $e) {
                    $elevesCount = 0;
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
                    'domain' => $tenant->domains->first()?->domain ?? "{$tenant->id}.localhost",
                    'eleves_count' => $elevesCount,
                    'created_at' => $tenant->created_at?->format('d/m/Y'),
                ];
            });

        $stats = [
            'total_schools' => $tenants->count(),
            'active_schools' => $tenants->where('statut', 'actif')->count(),
            'trial_schools' => $tenants->where('statut', 'essai')->count(),
            'suspended_schools' => $tenants->where('statut', 'suspendu')->count(),
            'total_eleves' => $tenants->sum('eleves_count'),
        ];

        return Inertia::render('Central/SuperAdmin/Index', [
            'tenants' => $tenants,
            'stats' => $stats,
        ]);
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
        // Récupérer le premier administrateur dans la base de l'école
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

        // Utiliser la fonctionnalité impersonate de Stancl
        $token = tenancy()->impersonate($tenant, (string) $adminUserId, '/dashboard');

        $port = parse_url(config('app.url', 'http://localhost'), PHP_URL_PORT);
        $portStr = $port ? ":{$port}" : ($request->getPort() && !in_array($request->getPort(), [80, 443]) ? ":{$request->getPort()}" : '');
        $domain = $tenant->domains->first()?->domain ?? "{$tenant->id}.localhost";

        $redirectUrl = "http://{$domain}{$portStr}/impersonate/{$token->token}";

        return redirect()->away($redirectUrl);
    }
}

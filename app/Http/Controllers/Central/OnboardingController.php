<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Services\TenantProvisioningService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function __construct(
        protected TenantProvisioningService $provisioningService
    ) {}

    /**
     * Affiche la page de création d'un nouvel établissement
     */
    public function create()
    {
        return Inertia::render('Central/Onboarding', [
            'centralHost' => parse_url(config('app.url', 'http://localhost'), PHP_URL_HOST) ?: 'localhost',
        ]);
    }

    /**
     * Vérification asynchrone de la disponibilité du sous-domaine
     */
    public function checkSubdomain(Request $request)
    {
        $raw = $request->query('subdomain', '');
        $slug = Str::slug($raw);

        if (empty($slug)) {
            return response()->json(['available' => false, 'message' => 'Sous-domaine requis']);
        }

        if (in_array($slug, TenantProvisioningService::RESERVED_SUBDOMAINS, true)) {
            return response()->json(['available' => false, 'message' => 'Ce nom est réservé par le système']);
        }

        $exists = Tenant::where('id', $slug)->exists();

        return response()->json([
            'available' => !$exists,
            'slug' => $slug,
            'message' => $exists ? 'Ce sous-domaine est déjà occupé' : 'Disponible !'
        ]);
    }

    /**
     * Traite l'inscription et provisionne l'école
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'subdomain' => 'required|string|max:50|alpha_dash',
            'ville' => 'nullable|string|max:100',
            'telephone' => 'required|string|max:30',
            'formule' => 'required|string|in:starter,pro,enterprise',
            'admin_nom' => 'required|string|max:100',
            'admin_prenom' => 'nullable|string|max:100',
            'admin_email' => 'required|email|max:255',
            'admin_password' => 'required|string|min:8|confirmed',
        ]);

        $tenant = $this->provisioningService->provision([
            'nom' => $validated['nom'],
            'subdomain' => $validated['subdomain'],
            'ville' => $validated['ville'] ?? 'Libreville',
            'telephone' => $validated['telephone'],
            'formule' => $validated['formule'],
            'admin_nom' => $validated['admin_nom'],
            'admin_prenom' => $validated['admin_prenom'],
            'admin_email' => $validated['admin_email'],
            'admin_password' => $validated['admin_password'],
        ]);

        // Construire l'URL de redirection vers l'espace de la nouvelle école
        $port = parse_url(config('app.url', 'http://localhost'), PHP_URL_PORT);
        $portStr = $port ? ":{$port}" : ($request->getPort() && !in_array($request->getPort(), [80, 443]) ? ":{$request->getPort()}" : '');
        
        $subdomainHost = "{$tenant->id}.localhost{$portStr}";
        $tenantLoginUrl = "http://{$subdomainHost}/login";

        return Inertia::render('Central/Onboarding', [
            'centralHost' => parse_url(config('app.url', 'http://localhost'), PHP_URL_HOST) ?: 'localhost',
            'createdSchool' => [
                'id' => $tenant->id,
                'nom' => $tenant->nom,
                'subdomain' => $tenant->id,
                'domain' => $subdomainHost,
                'login_url' => $tenantLoginUrl,
                'admin_email' => $validated['admin_email'],
                'formule' => $validated['formule'],
                'telephone' => $validated['telephone'],
                'ville' => $validated['ville'] ?? 'Libreville',
                'statut' => $tenant->statut,
            ],
        ]);
    }
}

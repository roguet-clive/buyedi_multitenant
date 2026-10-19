<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class TenantProvisioningService
{
    /**
     * Liste des sous-domaines réservés par le système SaaS
     */
    public const RESERVED_SUBDOMAINS = [
        'www', 'admin', 'superadmin', 'app', 'api', 'mail', 'smtp',
        'ftp', 'cpanel', 'webmail', 'staging', 'dev', 'test', 'demo',
        'billing', 'support', 'help', 'buyedi', 'central', 'saas'
    ];

    /**
     * Provisionne un nouvel établissement SaaS de manière automatisée
     */
    public function provision(array $data): Tenant
    {
        // 1. Nettoyer et valider le slug/sous-domaine
        $rawSlug = $data['slug'] ?? $data['subdomain'] ?? $data['nom'];
        $slug = Str::slug($rawSlug);

        if (empty($slug)) {
            throw ValidationException::withMessages([
                'subdomain' => 'Le sous-domaine spécifié est invalide.',
            ]);
        }

        if (in_array($slug, self::RESERVED_SUBDOMAINS, true)) {
            throw ValidationException::withMessages([
                'subdomain' => "Le sous-domaine '{$slug}' est réservé par la plateforme.",
            ]);
        }

        if (Tenant::where('id', $slug)->exists()) {
            throw ValidationException::withMessages([
                'subdomain' => "Le sous-domaine '{$slug}' est déjà réservé par un autre établissement.",
            ]);
        }

        // 2. Créer l'enregistrement Tenant dans la base centrale
        $tenant = Tenant::create([
            'id' => $slug,
            'nom' => $data['nom'],
            'email' => $data['email'] ?? $data['admin_email'] ?? null,
            'telephone' => $data['telephone'] ?? null,
            'statut' => 'essai', // 14 jours d'essai offerts
            'formule' => $data['formule'] ?? 'pro',
            'trial_ends_at' => now()->addDays(14),
            'actif_jusqu_a' => now()->addDays(14),
        ]);

        // 3. Associer les sous-domaines (local + central host)
        $centralHost = parse_url(config('app.url', 'http://localhost'), PHP_URL_HOST) ?: 'localhost';

        $tenant->domains()->create(['domain' => "{$slug}.localhost"]);
        $tenant->domains()->create(['domain' => "{$slug}.buyedi.test"]);

        if ($centralHost !== 'localhost' && $centralHost !== '127.0.0.1' && $centralHost !== 'buyedi.test') {
            $tenant->domains()->create(['domain' => "{$slug}.{$centralHost}"]);
        }

        // 4. Initialiser le contexte Tenant pour injecter les données initiales de l'école
        tenancy()->initialize($tenant);

        try {
            // Créer les rôles et permissions Spatie dans la base du tenant
            if (class_exists(\Database\Seeders\RolePermissionSeeder::class)) {
                Artisan::call('db:seed', [
                    '--class' => \Database\Seeders\RolePermissionSeeder::class,
                    '--force' => true,
                ]);
            }

            // Créer les réglages initiaux de l'établissement
            \App\Models\Etablissement::updateOrCreate(
                ['id' => 1],
                [
                    'nom' => $data['nom'],
                    'sigle' => $data['sigle'] ?? strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $data['nom']), 0, 4)),
                    'ville' => $data['ville'] ?? 'Libreville',
                    'telephone' => $data['telephone'] ?? null,
                    'email' => $data['email'] ?? $data['admin_email'] ?? null,
                    'modules_actifs' => ['scolarite', 'finances', 'bulletins', 'rh_paie', 'arrieres', 'demandes_documents'],
                    'formule_licence' => $data['formule'] ?? 'pro',
                ]
            );

            // Créer l'année scolaire par défaut si absente
            $anneeDebut = (int) date('Y');
            $anneeFin = $anneeDebut + 1;
            \App\Models\AnneeScolaire::firstOrCreate(
                ['nom' => "{$anneeDebut}-{$anneeFin}"],
                [
                    'date_debut' => "{$anneeDebut}-09-01",
                    'date_fin' => "{$anneeFin}-06-30",
                    'en_cours' => true,
                ]
            );

            // Créer le compte Super-Admin / Fondateur de l'établissement
            $adminEmail = $data['admin_email'] ?? $data['email'] ?? null;
            $adminPassword = $data['admin_password'] ?? $data['password'] ?? 'password';

            if ($adminEmail) {
                $user = \App\Models\User::firstOrCreate(
                    ['email' => $adminEmail],
                    [
                        'nom' => $data['admin_nom'] ?? 'Directeur',
                        'prenom' => $data['admin_prenom'] ?? 'Fondateur',
                        'telephone' => $data['telephone'] ?? null,
                        'password' => Hash::make($adminPassword),
                    ]
                );

                if (\Spatie\Permission\Models\Role::where('name', 'super-admin')->exists()) {
                    $user->assignRole('super-admin');
                }
            }
        } finally {
            tenancy()->end();
        }

        return $tenant;
    }
}

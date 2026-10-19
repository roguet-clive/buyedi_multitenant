<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('tenancy:test {tenant=sagesse}', function (string $tenant) {
    $t = \App\Models\Tenant::findOrFail($tenant);
    tenancy()->initialize($t);
    $this->info("Tenant Initialisé: " . tenant('id'));
    $this->info("Base de données active: " . \Illuminate\Support\Facades\DB::connection()->getDatabaseName());
    $this->info("Nombre d'élèves: " . \App\Models\Eleve::count());
    $this->info("Établissement: " . (\App\Models\Etablissement::first()?->nom ?? 'Aucun'));
    tenancy()->end();
    $this->info("Contexte central restauré: " . \Illuminate\Support\Facades\DB::connection()->getDatabaseName());
})->purpose('Tester le basculement multi-tenant');

Artisan::command('tenancy:provision {name} {subdomain}', function (string $name, string $subdomain) {
    $service = app(\App\Services\TenantProvisioningService::class);
    $tenant = $service->provision([
        'nom' => $name,
        'subdomain' => $subdomain,
        'ville' => 'Port-Gentil',
        'telephone' => '+24177112233',
        'formule' => 'pro',
        'admin_nom' => 'Directeur',
        'admin_prenom' => $name,
        'admin_email' => "admin@{$subdomain}.ga",
        'admin_password' => 'password123',
    ]);

    $this->info("✨ Établissement provisionné avec succès !");
    $this->info("ID: " . $tenant->id);
    $this->info("Nom: " . $tenant->nom);
    $this->info("Base de données créée: " . $tenant->tenancy_db_name);
    $this->info("Domaines: " . $tenant->domains->pluck('domain')->implode(', '));
})->purpose('Provisionner un nouvel établissement scolaire');

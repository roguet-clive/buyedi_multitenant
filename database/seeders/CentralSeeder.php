<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CentralSeeder extends Seeder
{
    /**
     * Run the database seeds on the central database.
     */
    public function run(): void
    {
        // 1. Super-Admin de la Plateforme SaaS Buyedi
        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@buyedi.com'],
            [
                'nom' => 'Admin',
                'prenom' => 'Buyedi',
                'password' => Hash::make('password'),
                'telephone' => '+24100000000',
            ]
        );

        // 2. Tenant Pilote : Complexe Scolaire Sagesse Divine
        $tenantSagesse = Tenant::firstOrNew(['id' => 'sagesse']);
        $tenantSagesse->nom = 'Complexe Scolaire Sagesse Divine';
        $tenantSagesse->email = 'contact@sagesse-divine.com';
        $tenantSagesse->telephone = '+24177000001';
        $tenantSagesse->statut = 'actif';
        $tenantSagesse->formule = 'enterprise';
        $tenantSagesse->tenancy_db_name = 'buyedi_sagesse_divine';
        $tenantSagesse->trial_ends_at = null;
        $tenantSagesse->actif_jusqu_a = now()->addYear();
        $tenantSagesse->save();

        if (!$tenantSagesse->domains()->where('domain', 'sagesse.localhost')->exists()) {
            $tenantSagesse->domains()->create(['domain' => 'sagesse.localhost']);
        }
        if (!$tenantSagesse->domains()->where('domain', 'sagesse.buyedi.test')->exists()) {
            $tenantSagesse->domains()->create(['domain' => 'sagesse.buyedi.test']);
        }

        // 3. Tenant Pilote : École Oguemwet (si sa base existe déjà)
        $tenantOguemwet = Tenant::firstOrNew(['id' => 'oguemwet']);
        $tenantOguemwet->nom = 'Groupe Scolaire Oguemwet';
        $tenantOguemwet->email = 'direction@oguemwet.com';
        $tenantOguemwet->telephone = '+24177000002';
        $tenantOguemwet->statut = 'actif';
        $tenantOguemwet->formule = 'pro';
        $tenantOguemwet->tenancy_db_name = 'buyedi_oguemwet';
        $tenantOguemwet->trial_ends_at = null;
        $tenantOguemwet->actif_jusqu_a = now()->addMonths(6);
        $tenantOguemwet->save();

        if (!$tenantOguemwet->domains()->where('domain', 'oguemwet.localhost')->exists()) {
            $tenantOguemwet->domains()->create(['domain' => 'oguemwet.localhost']);
        }
        if (!$tenantOguemwet->domains()->where('domain', 'oguemwet.buyedi.test')->exists()) {
            $tenantOguemwet->domains()->create(['domain' => 'oguemwet.buyedi.test']);
        }
    }
}

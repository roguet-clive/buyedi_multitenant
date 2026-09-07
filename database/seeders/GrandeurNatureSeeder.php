<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Etablissement;

class GrandeurNatureSeeder extends Seeder
{
    public function run()
    {
        $this->command->info("🚀 Démarrage de l'initialisation de la base de données...");

        // 1. Initialiser le Super Admin, les Rôles et Permissions
        $this->call(RolePermissionSeeder::class);

        // 2. Établissement par défaut
        $etablissement = Etablissement::firstOrCreate(
            ['id' => 1],
            [
                'nom' => 'COMPLEXE SCOLAIRE BUYEDI',
                'sigle' => 'CS-BUYEDI',
                'adresse' => 'Boulevard Triomphal, Libreville',
                'telephone' => '+241 77 00 00 00',
                'email' => 'contact@buyedi.com',
                'modele_bulletin' => 'standard',
                'modele_fiche_etudiant' => 'standard',
            ]
        );
        $this->command->info("🏫 Établissement configuré : {$etablissement->nom}");

        $this->command->info("✅ Base de données prête pour la production !");
    }
}


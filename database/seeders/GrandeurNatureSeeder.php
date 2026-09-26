<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Etablissement;
use App\Models\AnneeScolaire;
use App\Models\FraisType;
use App\Models\Classe;
use App\Models\FraisClasse;
use App\Models\FraisEcheance;

class GrandeurNatureSeeder extends Seeder
{
    public function run()
    {
        $this->command->info("🚀 Démarrage de l'initialisation de la base de données (Départ à blanc)...");

        // 1. Initialiser le Super Admin, l'Admin, les Rôles et Permissions
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

        // 3. Année Scolaire active
        $anneeActive = AnneeScolaire::firstOrCreate(
            ['nom' => '2026-2027'],
            ['en_cours' => true]
        );
        $anneeActive->setAsCurrent();
        $this->command->info("📅 Année scolaire active : {$anneeActive->nom}");

        // 4. Frais Types proposés par défaut
        $fraisTypes = [
            'inscription' => FraisType::updateOrCreate(
                ['code' => 'inscription'],
                ['nom' => "Frais d'Inscription", 'montant' => 10000.00, 'globale' => true, 'is_scolarite' => false]
            ),
            'reinscription' => FraisType::updateOrCreate(
                ['code' => 'reinscription'],
                ['nom' => "Frais de Réinscription", 'montant' => 10000.00, 'globale' => true, 'is_scolarite' => false]
            ),
            'tenue' => FraisType::updateOrCreate(
                ['code' => 'tenue'],
                ['nom' => "Tenue Scolaire", 'montant' => 5000.00, 'globale' => true, 'is_scolarite' => false]
            ),
            'bulletin_assurance' => FraisType::updateOrCreate(
                ['code' => 'bulletin_assurance'],
                ['nom' => "Bulletin + Assurance", 'montant' => 5000.00, 'globale' => true, 'is_scolarite' => false]
            ),
            'tenue_sport' => FraisType::updateOrCreate(
                ['code' => 'tenue_sport'],
                ['nom' => "Tenue de sport", 'montant' => 5000.00, 'globale' => true, 'is_scolarite' => false]
            ),
            'tee_shirt' => FraisType::updateOrCreate(
                ['code' => 'tee_shirt'],
                ['nom' => "Tee-Shirt", 'montant' => 5000.00, 'globale' => true, 'is_scolarite' => false]
            ),
            'scolarite' => FraisType::updateOrCreate(
                ['code' => 'scolarite'],
                ['nom' => "Scolarité", 'montant' => 0.00, 'globale' => false, 'is_scolarite' => true]
            ),
            'ape' => FraisType::updateOrCreate(
                ['code' => 'ape'],
                ['nom' => 'APE', 'montant' => 2000.00, 'globale' => true, 'is_scolarite' => false]
            ),
        ];
        $this->command->info("💰 Frais types configurés (Inscription 10k, Réinscription 10k, Tenue 12k, Bulletin+Assurance 5k, Tenue sport 5k, Tee-Shirt 5k, Scolarité, APE).");

        // 5. Classes & Grille tarifaire de scolarité
        $startYear = 2026;
        if (preg_match('/^(\d{4})/', $anneeActive->nom, $m)) {
            $startYear = (int)$m[1];
        }
        $nextYear = $startYear + 1;

        $moisScolaires = [
            ['nom' => 'Septembre', 'date' => "{$startYear}-09-10"],
            ['nom' => 'Octobre',   'date' => "{$startYear}-10-10"],
            ['nom' => 'Novembre',  'date' => "{$startYear}-11-10"],
            ['nom' => 'Décembre',  'date' => "{$startYear}-12-10"],
            ['nom' => 'Janvier',   'date' => "{$nextYear}-01-10"],
            ['nom' => 'Février',   'date' => "{$nextYear}-02-10"],
            ['nom' => 'Mars',      'date' => "{$nextYear}-03-10"],
            ['nom' => 'Avril',     'date' => "{$nextYear}-04-10"],
            ['nom' => 'Mai',       'date' => "{$nextYear}-05-10"],
        ];

        $classesDefinitions = [
            // Crèche
            ['nom' => 'Crèche de 8h à 13h', 'type' => 'creche',     'mensualite' => 20000.0],
            ['nom' => 'Crèche de 8h à 16h', 'type' => 'creche',     'mensualite' => 30000.0],

            // Maternelle
            ['nom' => '3 ans',              'type' => 'maternelle', 'mensualite' => 20000.0],
            ['nom' => '4 ans',              'type' => 'maternelle', 'mensualite' => 20000.0],
            ['nom' => '5 ans',              'type' => 'maternelle', 'mensualite' => 20000.0],

            // Primaire
            ['nom' => '1ère Année',         'type' => 'primaire',   'mensualite' => 20000.0],
            ['nom' => '2ème Année',         'type' => 'primaire',   'mensualite' => 20000.0],
            ['nom' => '3ème Année',         'type' => 'primaire',   'mensualite' => 20000.0],
            ['nom' => '4ème Année',         'type' => 'primaire',   'mensualite' => 25000.0],
            ['nom' => '5ème Année',         'type' => 'primaire',   'mensualite' => 30000.0],
        ];

        foreach ($classesDefinitions as $def) {
            $classe = Classe::updateOrCreate(
                ['nom' => $def['nom']],
                ['type' => $def['type']]
            );

            // Montant annuel sur 9 mois
            $montantAnnuel = $def['mensualite'] * 9;

            $fraisClasse = FraisClasse::updateOrCreate(
                [
                    'classe_id' => $classe->id,
                    'annee_scolaire_id' => $anneeActive->id,
                    'frais_type_id' => $fraisTypes['scolarite']->id,
                ],
                [
                    'montant' => $montantAnnuel,
                ]
            );

            // Synchroniser les 9 échéances mensuelles
            $fraisClasse->echeances()->delete();
            foreach ($moisScolaires as $idx => $mois) {
                $fraisClasse->echeances()->create([
                    'nom' => $mois['nom'],
                    'montant' => $def['mensualite'],
                    'date_limite' => $mois['date'],
                    'ordre' => $idx + 1,
                    'type' => 'mensualite',
                ]);
            }
        }
        $this->command->info("🎓 10 Classes et tarifs de scolarité configurés avec succès (Crèche, Maternelle, Primaire).");

        $this->command->info("✅ Base de données initialisée avec succès (Classes et Frais de scolarité opérationnels).");
    }
}


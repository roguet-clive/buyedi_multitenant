<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Eleve;
use App\Models\Enseignant;
use App\Models\Personnel;
use App\Models\ParentModel;
use App\Models\Classe;
use App\Models\AnneeScolaire;
use App\Models\Inscription;
use App\Models\Etablissement;
use App\Models\FraisType;
use App\Models\FraisClasse;
use App\Models\Periode;
use App\Models\Matiere;
use App\Models\Cours;
use App\Models\Evaluation;
use App\Models\Paiement;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class GrandeurNatureSeeder extends Seeder
{
    public function run()
    {
        $this->command->info("🚀 Démarrage du seed 'Grandeur Nature'...");

        // 0. Initialiser les Rôles et Permissions
        $this->call(RolePermissionSeeder::class);
        $this->command->info("🔑 Rôles et Permissions créés.");

        // 0b. Établissement par défaut
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

        // 1. Année Scolaire en cours
        $anneeNom = date('Y') . '-' . (date('Y') + 1);
        $annee = AnneeScolaire::firstOrCreate(
            ['nom' => $anneeNom],
            ['en_cours' => true]
        );
        $this->command->info("📅 Année scolaire : {$annee->nom}");

        // 1b. Frais Types (Finances)
        $fraisInscription = FraisType::firstOrCreate(
            ['code' => 'inscription'],
            [
                'nom' => 'Frais d\'inscription',
                'montant' => 50000,
                'globale' => true,
                'is_scolarite' => false,
                'annee_scolaire_id' => $annee->id
            ]
        );

        $fraisScolarite = FraisType::firstOrCreate(
            ['code' => 'scolarite'],
            [
                'nom' => 'Scolarité Mensuelle',
                'montant' => 35000,
                'globale' => true,
                'is_scolarite' => true,
                'annee_scolaire_id' => $annee->id
            ]
        );

        $fraisCantine = FraisType::firstOrCreate(
            ['code' => 'cantine'],
            [
                'nom' => 'Cantine',
                'montant' => 15000,
                'globale' => true,
                'is_scolarite' => false,
                'annee_scolaire_id' => $annee->id
            ]
        );

        $fraisTransport = FraisType::firstOrCreate(
            ['code' => 'transport'],
            [
                'nom' => 'Transport',
                'montant' => 20000,
                'globale' => true,
                'is_scolarite' => false,
                'annee_scolaire_id' => $annee->id
            ]
        );

        $this->command->info("💰 Types de frais configurés.");

        // 2. Structure des Classes
        $classesListe = [
            ['nom' => 'Maternelle (Grande Section)', 'type' => 'maternelle', 'scolarite' => 30000],
            ['nom' => '3ème Année (CE2)', 'type' => 'primaire', 'scolarite' => 35000],
            ['nom' => '6ème', 'type' => 'secondaire', 'scolarite' => 45000],
        ];

        $classesMap = [];
        foreach ($classesListe as $c) {
            $classe = Classe::firstOrCreate(
                ['nom' => $c['nom']],
                ['type' => $c['type']]
            );
            $classesMap[$c['nom']] = $classe;

            // Grille de scolarité par classe
            FraisClasse::firstOrCreate(
                [
                    'classe_id' => $classe->id,
                    'annee_scolaire_id' => $annee->id,
                    'frais_type_id' => $fraisScolarite->id
                ],
                ['montant' => $c['scolarite']]
            );

            // Frais d'inscription par classe
            FraisClasse::firstOrCreate(
                [
                    'classe_id' => $classe->id,
                    'annee_scolaire_id' => $annee->id,
                    'frais_type_id' => $fraisInscription->id
                ],
                ['montant' => $fraisInscription->montant]
            );
        }
        $this->command->info("🏫 3 Classes cibles configurées (Maternelle, 3ème Année, 6ème).");

        // 2c. Périodes (Trimestres)
        $periodes = collect();
        $trimestres = [
            ['nom' => 'Trimestre 1', 'code' => 'T1', 'date_debut' => (date('Y')) . '-09-15', 'date_fin' => (date('Y')) . '-12-20', 'actif' => true],
            ['nom' => 'Trimestre 2', 'code' => 'T2', 'date_debut' => (date('Y') + 1) . '-01-05', 'date_fin' => (date('Y') + 1) . '-03-31', 'actif' => false],
            ['nom' => 'Trimestre 3', 'code' => 'T3', 'date_debut' => (date('Y') + 1) . '-04-15', 'date_fin' => (date('Y') + 1) . '-06-15', 'actif' => false],
        ];
        foreach ($trimestres as $t) {
            $periodes->push(Periode::firstOrCreate(
                ['code' => $t['code'], 'annee_scolaire_id' => $annee->id],
                $t
            ));
        }
        $this->command->info("⏱️ 3 Trimestres créés.");

        // 2d. Matières
        $matiereNoms = ['Français', 'Mathématiques', 'Histoire-Géo', 'Sciences & Éveil', 'Anglais', 'Éducation Physique'];
        $matieres = collect();
        foreach ($matiereNoms as $nom) {
            $matieres->push(Matiere::firstOrCreate(['nom' => $nom]));
        }
        $this->command->info("📖 " . $matieres->count() . " matières créées.");

        // 3. Personnel
        $this->command->info("👥 Création du personnel administratif...");
        Personnel::factory()
            ->count(5)
            ->create()
            ->each(function ($personnel) {
                $personnel->user->assignRole('personnel');
            });

        // 4. Enseignants
        $this->command->info("👨‍🏫 Création des enseignants...");
        $enseignants = Enseignant::factory()
            ->count(8)
            ->create()
            ->each(function ($enseignant) {
                $enseignant->user->assignRole('enseignant');
            });

        // 5. Parents (Pool de 50 parents)
        $this->command->info("👪 Création de 50 parents d'élèves...");
        $parents = ParentModel::factory()
            ->count(50)
            ->create()
            ->each(function ($parent) {
                $parent->user->assignRole('parent');
            });

        // 5b. Cours & Évaluations pour chaque classe
        $this->command->info("📝 Configuration des cours...");
        foreach ($classesMap as $classe) {
            foreach ($matieres as $matiere) {
                $enseignant = $enseignants->random();
                foreach ($periodes as $periode) {
                    $cours = Cours::create([
                        'annee_scolaire_id' => $annee->id,
                        'classe_id' => $classe->id,
                        'matiere_id' => $matiere->id,
                        'enseignant_id' => $enseignant->id,
                        'periode_id' => $periode->id,
                        'coefficient' => $classe->type === 'maternelle' ? 1 : ($classe->type === 'primaire' ? rand(1, 3) : rand(2, 5)),
                        'is_titulaire' => rand(0, 100) < 20,
                    ]);

                    if ($periode->code === 'T1') {
                        Evaluation::create([
                            'cours_id' => $cours->id,
                            'periode_id' => $periode->id,
                            'titre' => 'Devoir 1',
                            'type' => 'devoir',
                            'coefficient' => 1,
                            'note_max' => 20,
                            'date_evaluation' => now()->subDays(rand(1, 20)),
                        ]);
                        Evaluation::create([
                            'cours_id' => $cours->id,
                            'periode_id' => $periode->id,
                            'titre' => 'Composition Trimestre 1',
                            'type' => 'composition',
                            'coefficient' => 2,
                            'note_max' => 20,
                            'date_evaluation' => now()->subDays(rand(1, 5)),
                        ]);
                    }
                }
            }
        }

        // 6. CRÉATION DES ÉLÈVES ET INSCRIPTIONS SELON LES QUOTAS DEMANDÉS :
        // - 20 élèves en Maternelle
        // - 25 élèves en 3ème Année
        // - 30 élèves en 6ème
        $repartition = [
            ['classe' => $classesMap['Maternelle (Grande Section)'], 'count' => 20, 'label' => 'Maternelle (Grande Section)'],
            ['classe' => $classesMap['3ème Année (CE2)'], 'count' => 25, 'label' => '3ème Année (CE2)'],
            ['classe' => $classesMap['6ème'], 'count' => 30, 'label' => '6ème'],
        ];

        $totalEleves = 0;
        $adminUser = User::first(); // Caissier par défaut

        foreach ($repartition as $rep) {
            $classe = $rep['classe'];
            $count = $rep['count'];
            $this->command->info("🎓 Création de {$count} élèves pour la classe : {$rep['label']}...");

            $eleves = Eleve::factory()
                ->count($count)
                ->create()
                ->each(function ($eleve) use ($classe, $parents, $annee, $fraisInscription, $fraisScolarite, $adminUser) {
                    $eleve->user->assignRole('eleve');

                    // 1. Inscription officielle dans sa classe
                    $montantScolariteAnnuelle = $fraisScolarite->montant * 9;
                    $totalTheorique = $fraisInscription->montant + $montantScolariteAnnuelle;

                    $inscription = Inscription::create([
                        'eleve_id' => $eleve->id,
                        'classe_id' => $classe->id,
                        'annee_scolaire_id' => $annee->id,
                        'date_inscription' => now()->subDays(rand(5, 60)),
                        'statut' => 'validee',
                        'total_frais' => $totalTheorique,
                        'numero_recu' => 'REC-' . strtoupper(uniqid()),
                        'code_securite' => strtoupper(uniqid()),
                    ]);

                    // 2. Paiement des Frais d'Inscription (100% des élèves inscrits)
                    Paiement::create([
                        'inscription_id' => $inscription->id,
                        'frais_type_id' => $fraisInscription->id,
                        'user_id' => $adminUser ? $adminUser->id : 1,
                        'montant' => $fraisInscription->montant,
                        'date_paiement' => $inscription->date_inscription,
                        'mode_paiement' => fake()->randomElement(['especes', 'mobile', 'virement']),
                        'commentaire' => 'Frais d\'inscription validés'
                    ]);

                    // 3. Paiements de Scolarité (Simuler 1 à 3 mois déjà réglés pour 75% des élèves)
                    if (rand(0, 100) < 75) {
                        $moisList = ['Septembre', 'Octobre', 'Novembre', 'Décembre'];
                        $nbMois = rand(1, 3);
                        for ($i = 0; $i < $nbMois; $i++) {
                            Paiement::create([
                                'inscription_id' => $inscription->id,
                                'frais_type_id' => $fraisScolarite->id,
                                'user_id' => $adminUser ? $adminUser->id : 1,
                                'montant' => $fraisScolarite->montant,
                                'date_paiement' => now()->subDays(rand(1, 30)),
                                'mode_paiement' => fake()->randomElement(['especes', 'mobile']),
                                'mois' => $moisList[$i],
                                'commentaire' => "Scolarité mois de {$moisList[$i]}"
                            ]);
                        }
                    }

                    // 4. Lier à 1 ou 2 parents
                    $parentsEleve = $parents->random(rand(1, 2));
                    foreach ($parentsEleve as $parent) {
                        DB::table('eleve_parent')->insertOrIgnore([
                            'eleve_id' => $eleve->id,
                            'parent_id' => $parent->id,
                            'lien' => fake()->randomElement(['Père', 'Mère', 'Tuteur']),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                });

            $totalEleves += $count;
        }

        $this->command->info("✅ Grand ménage et Seed terminés avec succès !");
        $this->command->info("   - 20 Élèves inscrits en Maternelle (Grande Section)");
        $this->command->info("   - 25 Élèves inscrits en 3ème Année (CE2)");
        $this->command->info("   - 30 Élèves inscrits en 6ème");
        $this->command->info("   - Total : {$totalEleves} élèves avec parents et paiements de caisse associés.");
    }
}

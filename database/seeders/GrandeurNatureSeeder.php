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

        // 1. Année Scolaire
        $annee = AnneeScolaire::firstOrCreate(
            ['nom' => (date('Y')).'-'.(date('Y')+1)],
            ['en_cours' => true]
        );
        $this->command->info("📅 Année scolaire : {$annee->nom}");

        // 1b. Frais Types (Finances)
        $fraisInscription = \App\Models\FraisType::firstOrCreate(
            ['code' => 'inscription', 'annee_scolaire_id' => $annee->id],
            ['nom' => 'Frais d\'inscription', 'montant' => 50000, 'globale' => true]
        );
        $fraisScolarite = \App\Models\FraisType::firstOrCreate(
            ['code' => 'scolarite', 'annee_scolaire_id' => $annee->id],
            ['nom' => 'Scolarité Mensuelle', 'montant' => 35000, 'globale' => true, 'is_scolarite' => true]
        );
        $fraisCantine = \App\Models\FraisType::firstOrCreate(
            ['code' => 'cantine', 'annee_scolaire_id' => $annee->id],
            ['nom' => 'Cantine', 'montant' => 15000, 'globale' => true]
        );
        $fraisTransport = \App\Models\FraisType::firstOrCreate(
            ['code' => 'transport', 'annee_scolaire_id' => $annee->id],
            ['nom' => 'Transport', 'montant' => 20000, 'globale' => true]
        );

        $this->command->info("💰 Types de frais configurés.");

        // 2. Classes (Maternelle, Primaire, Collège)
        $classesListe = [
            ['nom' => 'Petite Section', 'type' => 'maternelle'],
            ['nom' => 'Moyenne Section', 'type' => 'maternelle'],
            ['nom' => 'Grande Section', 'type' => 'maternelle'],
            ['nom' => 'CP', 'type' => 'primaire'],
            ['nom' => 'CE1', 'type' => 'primaire'],
            ['nom' => 'CE2', 'type' => 'primaire'],
            ['nom' => 'CM1', 'type' => 'primaire'],
            ['nom' => 'CM2', 'type' => 'primaire'],
            ['nom' => '6ème', 'type' => 'secondaire'],
            ['nom' => '5ème', 'type' => 'secondaire'],
            ['nom' => '4ème', 'type' => 'secondaire'],
            ['nom' => '3ème', 'type' => 'secondaire'],
        ];

        $classes = collect();
        foreach ($classesListe as $c) {
            $classe = Classe::firstOrCreate(['nom' => $c['nom'], 'type' => $c['type']]);
            $classes->push($classe);

            // 2b. Lier Frais à la Classe (FraisClasse)
            // Tous paient l'inscription et la scolarité
            \App\Models\FraisClasse::firstOrCreate(
                ['classe_id' => $classe->id, 'annee_scolaire_id' => $annee->id, 'frais_type_id' => $fraisInscription->id],
                ['montant' => $fraisInscription->montant]
            );
            \App\Models\FraisClasse::firstOrCreate(
                ['classe_id' => $classe->id, 'annee_scolaire_id' => $annee->id, 'frais_type_id' => $fraisScolarite->id],
                ['montant' => $fraisScolarite->montant]
            );
            
            // Cantine pour Maternelle et Primaire
            if (in_array($c['type'], ['maternelle', 'primaire'])) {
                \App\Models\FraisClasse::firstOrCreate(
                    ['classe_id' => $classe->id, 'annee_scolaire_id' => $annee->id, 'frais_type_id' => $fraisCantine->id],
                    ['montant' => $fraisCantine->montant]
                );
            }
            
            // Transport pour tous (optionnel mais on le met disponible)
            \App\Models\FraisClasse::firstOrCreate(
                ['classe_id' => $classe->id, 'annee_scolaire_id' => $annee->id, 'frais_type_id' => $fraisTransport->id],
                ['montant' => $fraisTransport->montant]
            );
        }
        $this->command->info("🏫 " . $classes->count() . " classes créées et frais associés.");

        // 2c. Périodes (Trimestres)
        $periodes = collect();
        $trimestres = [
            ['nom' => 'Trimestre 1', 'code' => 'T1', 'date_debut' => (date('Y')).'-09-15', 'date_fin' => (date('Y')).'-12-20', 'actif' => true],
            ['nom' => 'Trimestre 2', 'code' => 'T2', 'date_debut' => (date('Y')+1).'-01-05', 'date_fin' => (date('Y')+1).'-03-31', 'actif' => false],
            ['nom' => 'Trimestre 3', 'code' => 'T3', 'date_debut' => (date('Y')+1).'-04-15', 'date_fin' => (date('Y')+1).'-06-15', 'actif' => false],
        ];
        foreach ($trimestres as $t) {
            $periodes->push(\App\Models\Periode::create(array_merge($t, ['annee_scolaire_id' => $annee->id])));
        }
        $this->command->info("⏱️ 3 Trimestres créés.");

        // 2d. Matières (Subjects)
        $matiereNoms = ['Français', 'Mathématiques', 'Histoire-Géo', 'Sciences', 'Anglais', 'Physique-Chimie', 'Éducation Physique', 'Informatique'];
        $matieres = collect();
        foreach ($matiereNoms as $nom) {
            $matieres->push(\App\Models\Matiere::create(['nom' => $nom]));
        }
        $this->command->info("📖 " . $matieres->count() . " matières créées.");

        // 3. Personnel (10)
        $this->command->info("👥 Création des 10 membres du personnel...");
        try {
            Personnel::factory()
                ->count(10)
                ->create()
                ->each(function ($personnel) {
                    $personnel->user->assignRole('personnel');
                });
        } catch (\Exception $e) {
            $this->command->error("❌ Erreur lors de la création du personnel : " . $e->getMessage());
        }

        // 4. Enseignants (20)
        $this->command->info("👨‍🏫 Création des 20 enseignants...");
        Enseignant::factory()
            ->count(20)
            ->create()
            ->each(function ($enseignant) {
                $enseignant->user->assignRole('enseignant');
            });

        // 5. Parents (Pool de 80 parents pour 150 élèves, certains auront plusieurs enfants)
        $this->command->info("👪 Création de 80 parents...");
        $parents = ParentModel::factory()
            ->count(80)
            ->create()
            ->each(function ($parent) {
                $parent->user->assignRole('parent');
            });

        // 5b. Création des COURS (Lien entre Classes, Matières, Enseignants et Périodes)
        $this->command->info("📝 Création des cours et assignation des coefficients...");
        $enseignants = \App\Models\Enseignant::all();
        $coursCrees = collect();
        
        foreach ($classes as $classe) {
            // On assigne 5 à 8 matières par classe
            $matieresClasse = $matieres->random(rand(5, 8));
            foreach ($matieresClasse as $matiere) {
                $enseignant = $enseignants->random();
                
                // Pour chaque trimestre, on crée un cours (car le prof ou le coef peut changer, même si ici on simplifie)
                foreach ($periodes as $periode) {
                    $cours = \App\Models\Cours::create([
                        'annee_scolaire_id' => $annee->id,
                        'classe_id' => $classe->id,
                        'matiere_id' => $matiere->id,
                        'enseignant_id' => $enseignant->id,
                        'periode_id' => $periode->id,
                        'coefficient' => in_array($classe->type, ['primaire']) ? rand(1, 5) : rand(2, 6),
                        'is_titulaire' => rand(0, 100) < 10, // 10% de chance d'être titulaire
                    ]);
                    $coursCrees->push($cours);

                    // 5c. Création d'ÉVALUATIONS pour le premier trimestre (actif)
                    if ($periode->code === 'T1') {
                        $evals = [
                            ['titre' => 'Interrogation 1', 'type' => 'devoir', 'coef' => 1],
                            ['titre' => 'Interrogation 2', 'type' => 'devoir', 'coef' => 1],
                            ['titre' => 'Composition T1', 'type' => 'composition', 'coef' => 2],
                        ];
                        foreach ($evals as $e) {
                            \App\Models\Evaluation::create([
                                'cours_id' => $cours->id,
                                'periode_id' => $periode->id,
                                'titre' => $e['titre'],
                                'type' => $e['type'],
                                'coefficient' => $e['coef'],
                                'note_max' => 20,
                                'date_evaluation' => now()->subDays(rand(1, 30)),
                            ]);
                        }
                    }
                }
            }
        }
        $this->command->info("📊 " . $coursCrees->count() . " cours et évaluations générés.");

        // 6. Élèves (150)
        $this->command->info("🎓 Création de 150 élèves et inscriptions...");
        $eleves = Eleve::factory()
            ->count(150)
            ->create()
            ->each(function ($eleve) use ($classes, $parents, $annee, $fraisInscription, $fraisScolarite, $fraisCantine, $fraisTransport) {
                $eleve->user->assignRole('eleve');

                // A. Inscription dans une classe au hasard
                $classe = $classes->random();
                
                // Calcul du Total Frais Théorique (Inscription + 9 mois scolarité)
                // On simplifie : Inscription + (Scolarité * 9)
                $montantScolariteAnnuelle = $fraisScolarite->montant * 9;
                $totalTheorique = $fraisInscription->montant + $montantScolariteAnnuelle;
                
                // Vérifier si déjà inscrit (au cas où seed relancé)
                $exists = Inscription::where('eleve_id', $eleve->id)
                            ->where('annee_scolaire_id', $annee->id)
                            ->exists();

                if (!$exists) {
                    $inscription = Inscription::create([
                        'eleve_id' => $eleve->id,
                        'classe_id' => $classe->id,
                        'annee_scolaire_id' => $annee->id,
                        'date_inscription' => now(),
                        'total_frais' => $totalTheorique, // Montant total dû pour l'année
                        'numero_recu' => 'REC-'.strtoupper(uniqid()),
                        'code_securite' => strtoupper(uniqid()),
                    ]);

                    // B. Génération de Paiements Réalistes
                    
                    // 1. Paiement Inscription (Obligatoire pour 95% des élèves)
                    if (rand(0, 100) < 95) {
                        \App\Models\Paiement::create([
                            'inscription_id' => $inscription->id,
                            'frais_type_id' => $fraisInscription->id,
                            'user_id' => 1, // Admin (Clive) a encaissé
                            'montant' => $fraisInscription->montant,
                            'date_paiement' => now()->subDays(rand(1, 60)),
                            'mode_paiement' => fake()->randomElement(['especes', 'mobile', 'virement']),
                            'reference' => strtoupper(uniqid('PAY-')),
                            'commentaire' => 'Inscription standard'
                        ]);
                    }

                    // 2. Paiement Scolarité (Quelques mois d'avance ou en retard)
                    // Disons que nous sommes en cours d'année, on simule 3 mois de paiements pour 70% des élèves
                    if (rand(0, 100) < 70) {
                        $moisPayes = rand(1, 5);
                        for ($i = 0; $i < $moisPayes; $i++) {
                            \App\Models\Paiement::create([
                                'inscription_id' => $inscription->id,
                                'frais_type_id' => $fraisScolarite->id,
                                'user_id' => 1,
                                'montant' => $fraisScolarite->montant,
                                'date_paiement' => now()->subMonths($i), // Paiements rétroactifs
                                'mode_paiement' => 'especes',
                                'reference' => strtoupper(uniqid('SCO-')),
                                'mois' => now()->subMonths($i)->format('F'), // Mois concerné
                                'commentaire' => 'Mensualité scolarité'
                            ]);
                        }
                    }

                    // 3. Paiement Cantine/Transport (Optionnel 30%)
                    if (rand(0, 100) < 30) {
                        \App\Models\Paiement::create([
                            'inscription_id' => $inscription->id,
                            'frais_type_id' => fake()->randomElement([$fraisCantine->id, $fraisTransport->id]),
                            'user_id' => 1,
                            'montant' => 15000,
                            'date_paiement' => now()->subDays(rand(1, 10)),
                            'mode_paiement' => 'mobile',
                            'reference' => strtoupper(uniqid('AUT-')),
                            'commentaire' => 'Frais annexes'
                        ]);
                    }
                }

                // C. Lier à 1 ou 2 parents
                $parentsEleve = $parents->random(rand(1, 2));
                foreach ($parentsEleve as $parent) {
                    $hasPivot = DB::table('eleve_parent')
                        ->where('eleve_id', $eleve->id)
                        ->where('parent_id', $parent->id)
                        ->exists();

                    if (!$hasPivot) {
                        $eleve->parents()->attach($parent->id, [
                            'lien' => fake()->randomElement(['Père', 'Mère', 'Tuteur'])
                        ]);
                    }
                }
            });

        $this->command->info("✅ Seed 'Grandeur Nature' terminé avec succès !");
        $this->command->info("   - 10 Personnels");
        $this->command->info("   - 20 Enseignants");
        $this->command->info("   - 80 Parents");
        $this->command->info("   - 150 Élèves inscrits");
        $this->command->info("   - Transactions financières générées pour le dashboard");

        $this->command->info("\n🔑 COMPTES DE TEST (Mot de passe pour tous : password) :");
        if ($personnel = \App\Models\Personnel::first()) $this->command->info("   - Personnel  : {$personnel->user->email}");
        if ($enseignant = \App\Models\Enseignant::first()) $this->command->info("   - Enseignant : {$enseignant->user->email}");
        
        $eleveTest = \App\Models\Eleve::first();
        if ($eleveTest) {
            $this->command->info("   - Élève      : {$eleveTest->user->email}");
            if ($parentTest = $eleveTest->parents->first()) {
                $this->command->info("   - Parent lié : {$parentTest->user->email}");
            }
        }
        $this->command->info("\n");
    }
}

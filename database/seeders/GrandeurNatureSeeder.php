<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Etablissement;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\FraisType;
use App\Models\FraisClasse;
use App\Models\FraisEcheance;
use App\Models\Enseignant;
use App\Models\ParentModel;
use App\Models\Eleve;

class GrandeurNatureSeeder extends Seeder
{
    public function run()
    {
        $this->command->info("🚀 Démarrage de l'initialisation de la base de données (Grandeur Nature)...");

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

        // 3. Année Scolaire active
        $anneeActive = AnneeScolaire::firstOrCreate(
            ['nom' => '2026-2027'],
            ['en_cours' => true]
        );
        $anneeActive->setAsCurrent();
        $this->command->info("📅 Année scolaire active : {$anneeActive->nom}");

        // 4. Utilisateur Directeur avec toutes ses permissions
        $directeur = User::firstOrCreate(
            ['email' => 'directeur@buyedi.com'],
            [
                'nom' => 'OWONO',
                'prenom' => 'Jean-Pierre',
                'telephone' => '+241 77 12 34 56',
                'password' => Hash::make('12345678'),
            ]
        );
        $directeur->assignRole('directeur');
        $this->command->info("👤 Directeur configuré : {$directeur->prenom} {$directeur->nom} ({$directeur->email})");

        // 5. 6 Classes (2 par section : Maternelle, Primaire, Secondaire)
        $classesConfig = [
            // Maternelle
            ['nom' => 'Petite Section', 'type' => 'maternelle'],
            ['nom' => 'Grande Section', 'type' => 'maternelle'],
            // Primaire
            ['nom' => 'CP', 'type' => 'primaire'],
            ['nom' => 'CM2', 'type' => 'primaire'],
            // Secondaire
            ['nom' => '6ème', 'type' => 'secondaire'],
            ['nom' => '3ème', 'type' => 'secondaire'],
        ];

        $classes = [];
        foreach ($classesConfig as $cfg) {
            $classes[$cfg['nom']] = Classe::firstOrCreate(
                ['nom' => $cfg['nom'], 'type' => $cfg['type']]
            );
        }
        $this->command->info("📚 6 Classes créées (2 Maternelle, 2 Primaire, 2 Secondaire).");

        // 6. Frais Types proposés
        $fraisTypes = [
            'inscription' => FraisType::firstOrCreate(
                ['code' => 'inscription'],
                ['nom' => "Frais d'Inscription", 'montant' => 10000.00, 'globale' => true, 'is_scolarite' => false]
            ),
            'reinscription' => FraisType::firstOrCreate(
                ['code' => 'reinscription'],
                ['nom' => "Frais de Réinscription", 'montant' => 5000.00, 'globale' => true, 'is_scolarite' => false]
            ),
            'tenue' => FraisType::firstOrCreate(
                ['code' => 'tenue'],
                ['nom' => "Tenue Scolaire", 'montant' => 10000.00, 'globale' => true, 'is_scolarite' => false]
            ),
            'bulletin' => FraisType::firstOrCreate(
                ['nom' => "Bulletin"],
                ['code' => 'bulletin', 'montant' => 1000.00, 'globale' => true, 'is_scolarite' => false]
            ),
            'scolarite' => FraisType::firstOrCreate(
                ['code' => 'scolarite'],
                ['nom' => "Scolarité", 'montant' => 0.00, 'globale' => true, 'is_scolarite' => true]
            ),
            'ape' => FraisType::updateOrCreate(
                ['nom' => 'APE'],
                ['code' => 'ape', 'montant' => 2000.00, 'globale' => true, 'is_scolarite' => false]
            ),
        ];
        $this->command->info("💰 Frais types configurés (Inscription, Réinscription, Tenue, Bulletin, Scolarité, APE).");

        // 7. Grille de Scolarité & Échéanciers par classe
        $startYear = 2026;
        $nextYear = 2027;
        $moisMaternellePrimaire = [
            ['nom' => 'Septembre', 'date' => "{$startYear}-09-30"],
            ['nom' => 'Octobre', 'date' => "{$startYear}-10-31"],
            ['nom' => 'Novembre', 'date' => "{$startYear}-11-30"],
            ['nom' => 'Décembre', 'date' => "{$startYear}-12-31"],
            ['nom' => 'Janvier', 'date' => "{$nextYear}-01-31"],
            ['nom' => 'Février', 'date' => "{$nextYear}-02-28"],
            ['nom' => 'Mars', 'date' => "{$nextYear}-03-31"],
            ['nom' => 'Avril', 'date' => "{$nextYear}-04-30"],
            ['nom' => 'Mai', 'date' => "{$nextYear}-05-31"],
        ];

        foreach ($classes as $classe) {
            if ($classe->isMaternelle()) {
                $totalScolarite = 117000.00;
                $mensualite = 13000.00;
            } elseif ($classe->isCinquiemeAnneePrimaire()) { // CM2
                $totalScolarite = 135000.00;
                $mensualite = 15000.00;
            } elseif ($classe->isPrimaire()) { // CP
                $totalScolarite = 121500.00;
                $mensualite = 13500.00;
            } elseif ($classe->isClasseExamen()) { // 3ème
                $totalScolarite = 145000.00;
                $mensualite = null;
            } else { // 6ème
                $totalScolarite = 135000.00;
                $mensualite = null;
            }

            $fraisClasse = FraisClasse::firstOrCreate(
                [
                    'classe_id' => $classe->id,
                    'annee_scolaire_id' => $anneeActive->id,
                    'frais_type_id' => $fraisTypes['scolarite']->id,
                ],
                ['montant' => $totalScolarite]
            );

            $fraisClasse->echeances()->delete();

            if ($classe->isMaternelleOuPrimaire()) {
                foreach ($moisMaternellePrimaire as $idx => $m) {
                    $fraisClasse->echeances()->create([
                        'nom' => $m['nom'],
                        'montant' => $mensualite,
                        'date_limite' => $m['date'],
                        'ordre' => $idx + 1,
                        'type' => 'mensualite',
                    ]);
                }
            } else {
                // Secondaire par Tranches
                $t1 = 70000.00;
                $t2 = ($totalScolarite == 145000.00) ? 37500.00 : 32500.00;
                $t3 = $t2;

                $tranches = [
                    ['nom' => '1ère Tranche', 'montant' => $t1, 'date_limite' => "{$startYear}-09-30", 'ordre' => 1],
                    ['nom' => '2ème Tranche', 'montant' => $t2, 'date_limite' => "{$startYear}-11-30", 'ordre' => 2],
                    ['nom' => '3ème Tranche', 'montant' => $t3, 'date_limite' => "{$nextYear}-01-31", 'ordre' => 3],
                ];

                foreach ($tranches as $tr) {
                    $fraisClasse->echeances()->create([
                        'nom' => $tr['nom'],
                        'montant' => $tr['montant'],
                        'date_limite' => $tr['date_limite'],
                        'ordre' => $tr['ordre'],
                        'type' => 'tranche',
                    ]);
                }
            }
        }
        $this->command->info("📊 Barèmes et échéanciers de scolarité associés aux 6 classes.");

        // 8. 4 Enseignants
        $enseignantsData = [
            [
                'nom' => 'OBAME',
                'prenom' => 'François',
                'email' => 'francois.obame@buyedi.com',
                'sexe' => 'M',
                'specialite' => 'Mathématiques',
                'telephone' => '+241 74 11 22 33',
                'adresse' => 'Nzeng-Ayong, Libreville',
                'matricule' => 'ENS-2026-001',
            ],
            [
                'nom' => 'BEKALE',
                'prenom' => 'Sylvie',
                'email' => 'sylvie.bekale@buyedi.com',
                'sexe' => 'F',
                'specialite' => 'Français / Lettres',
                'telephone' => '+241 74 22 33 44',
                'adresse' => 'Alibandeng, Libreville',
                'matricule' => 'ENS-2026-002',
            ],
            [
                'nom' => 'NGUEMA',
                'prenom' => 'Patrice',
                'email' => 'patrice.nguema@buyedi.com',
                'sexe' => 'M',
                'specialite' => 'Sciences Physiques',
                'telephone' => '+241 74 33 44 55',
                'adresse' => 'Louis, Libreville',
                'matricule' => 'ENS-2026-003',
            ],
            [
                'nom' => 'NZAMBA',
                'prenom' => 'Hortense',
                'email' => 'hortense.nzamba@buyedi.com',
                'sexe' => 'F',
                'specialite' => 'Histoire-Géographie',
                'telephone' => '+241 74 44 55 66',
                'adresse' => 'Oloumi, Libreville',
                'matricule' => 'ENS-2026-004',
            ],
        ];

        foreach ($enseignantsData as $ens) {
            $userEns = User::firstOrCreate(
                ['email' => $ens['email']],
                [
                    'nom' => $ens['nom'],
                    'prenom' => $ens['prenom'],
                    'telephone' => $ens['telephone'],
                    'password' => Hash::make('12345678'),
                ]
            );
            $userEns->assignRole('enseignant');

            Enseignant::firstOrCreate(
                ['matricule' => $ens['matricule']],
                [
                    'nom' => $ens['nom'],
                    'prenom' => $ens['prenom'],
                    'sexe' => $ens['sexe'],
                    'telephone' => $ens['telephone'],
                    'adresse' => $ens['adresse'],
                    'specialite' => $ens['specialite'],
                    'user_id' => $userEns->id,
                ]
            );
        }
        $this->command->info("👨‍🏫 4 Enseignants créés avec comptes d'accès et profils.");

        // 9. 5 Parents
        $parentsData = [
            [
                'nom' => 'MINKO',
                'prenom' => 'Arnaud',
                'email' => 'arnaud.minko@buyedi.com',
                'sexe' => 'M',
                'profession' => 'Ingénieur Télécoms',
                'telephone' => '+241 77 10 20 30',
                'adresse' => 'Angondjé, Libreville',
            ],
            [
                'nom' => 'BIYOGO',
                'prenom' => 'Marcelle',
                'email' => 'marcelle.biyogo@buyedi.com',
                'sexe' => 'F',
                'profession' => 'Médecin',
                'telephone' => '+241 77 20 30 40',
                'adresse' => 'Haut de Gué-Gué, Libreville',
            ],
            [
                'nom' => 'MBOUMBA',
                'prenom' => 'Christian',
                'email' => 'christian.mboumba@buyedi.com',
                'sexe' => 'M',
                'profession' => 'Expert-Comptable',
                'telephone' => '+241 77 30 40 50',
                'adresse' => 'Akanda, Libreville',
            ],
            [
                'nom' => 'ONDOUA',
                'prenom' => 'Carine',
                'email' => 'carine.ondoua@buyedi.com',
                'sexe' => 'F',
                'profession' => 'Chef d\'Entreprise',
                'telephone' => '+241 77 40 50 60',
                'adresse' => 'La Sablière, Libreville',
            ],
            [
                'nom' => 'KOUMBA',
                'prenom' => 'Serge',
                'email' => 'serge.koumba@buyedi.com',
                'sexe' => 'M',
                'profession' => 'Magistrat',
                'telephone' => '+241 77 50 60 70',
                'adresse' => 'Batterie IV, Libreville',
            ],
        ];

        $parents = [];
        foreach ($parentsData as $pData) {
            $userParent = User::firstOrCreate(
                ['email' => $pData['email']],
                [
                    'nom' => $pData['nom'],
                    'prenom' => $pData['prenom'],
                    'telephone' => $pData['telephone'],
                    'password' => Hash::make('12345678'),
                ]
            );
            $userParent->assignRole('parent');

            $parents[] = ParentModel::firstOrCreate(
                ['user_id' => $userParent->id],
                [
                    'profession' => $pData['profession'],
                    'telephone' => $pData['telephone'],
                    'adresse' => $pData['adresse'],
                    'sexe' => $pData['sexe'],
                ]
            );
        }
        $this->command->info("👨‍👩‍👧‍👦 5 Parents créés avec comptes d'accès et profils.");

        // 10. 12 Élèves NON INSCRITS rattachés aux 5 parents (aucun enregistrement dans la table inscriptions)
        $elevesData = [
            // Famille MINKO (3 enfants)
            [
                'nom' => 'MINKO',
                'prenom' => 'Kevin',
                'sexe' => 'M',
                'date_naissance' => '2021-04-12',
                'lieu_naissance' => 'Libreville',
                'parent_idx' => 0,
                'lien' => 'Père',
            ],
            [
                'nom' => 'MINKO',
                'prenom' => 'Sarah',
                'sexe' => 'F',
                'date_naissance' => '2018-09-25',
                'lieu_naissance' => 'Libreville',
                'parent_idx' => 0,
                'lien' => 'Père',
            ],
            [
                'nom' => 'MINKO',
                'prenom' => 'Bryan',
                'sexe' => 'M',
                'date_naissance' => '2014-02-18',
                'lieu_naissance' => 'Libreville',
                'parent_idx' => 0,
                'lien' => 'Père',
            ],

            // Famille BIYOGO (3 enfants)
            [
                'nom' => 'BIYOGO',
                'prenom' => 'Yann',
                'sexe' => 'M',
                'date_naissance' => '2022-01-10',
                'lieu_naissance' => 'Port-Gentil',
                'parent_idx' => 1,
                'lien' => 'Mère',
            ],
            [
                'nom' => 'BIYOGO',
                'prenom' => 'Léa',
                'sexe' => 'F',
                'date_naissance' => '2019-11-05',
                'lieu_naissance' => 'Port-Gentil',
                'parent_idx' => 1,
                'lien' => 'Mère',
            ],
            [
                'nom' => 'BIYOGO',
                'prenom' => 'Nathan',
                'sexe' => 'M',
                'date_naissance' => '2012-07-30',
                'lieu_naissance' => 'Port-Gentil',
                'parent_idx' => 1,
                'lien' => 'Mère',
            ],

            // Famille MBOUMBA (2 enfants)
            [
                'nom' => 'MBOUMBA',
                'prenom' => 'Grâce',
                'sexe' => 'F',
                'date_naissance' => '2020-06-15',
                'lieu_naissance' => 'Franceville',
                'parent_idx' => 2,
                'lien' => 'Père',
            ],
            [
                'nom' => 'MBOUMBA',
                'prenom' => 'Junior',
                'sexe' => 'M',
                'date_naissance' => '2015-10-08',
                'lieu_naissance' => 'Franceville',
                'parent_idx' => 2,
                'lien' => 'Père',
            ],

            // Famille ONDOUA (2 enfants)
            [
                'nom' => 'ONDOUA',
                'prenom' => 'Estelle',
                'sexe' => 'F',
                'date_naissance' => '2019-03-22',
                'lieu_naissance' => 'Oyem',
                'parent_idx' => 3,
                'lien' => 'Mère',
            ],
            [
                'nom' => 'ONDOUA',
                'prenom' => 'Axel',
                'sexe' => 'M',
                'date_naissance' => '2013-12-14',
                'lieu_naissance' => 'Oyem',
                'parent_idx' => 3,
                'lien' => 'Mère',
            ],

            // Famille KOUMBA (2 enfants)
            [
                'nom' => 'KOUMBA',
                'prenom' => 'Brenda',
                'sexe' => 'F',
                'date_naissance' => '2018-08-19',
                'lieu_naissance' => 'Mouila',
                'parent_idx' => 4,
                'lien' => 'Père',
            ],
            [
                'nom' => 'KOUMBA',
                'prenom' => 'David',
                'sexe' => 'M',
                'date_naissance' => '2011-05-03',
                'lieu_naissance' => 'Mouila',
                'parent_idx' => 4,
                'lien' => 'Père',
            ],
        ];

        foreach ($elevesData as $idx => $elData) {
            $email = strtolower("eleve.{$elData['prenom']}.{$elData['nom']}@buyedi.com");
            $email = str_replace(['é', 'è', 'ê', ' '], ['e', 'e', 'e', ''], $email);

            $userEl = User::firstOrCreate(
                ['email' => $email],
                [
                    'nom' => $elData['nom'],
                    'prenom' => $elData['prenom'],
                    'password' => Hash::make('12345678'),
                ]
            );
            $userEl->assignRole('eleve');

            $eleve = Eleve::firstOrCreate(
                ['user_id' => $userEl->id],
                [
                    'sexe' => $elData['sexe'],
                    'date_naissance' => $elData['date_naissance'],
                    'lieu_naissance' => $elData['lieu_naissance'],
                ]
            );

            // Rattachement au parent dans eleve_parent
            $parent = $parents[$elData['parent_idx']];
            $eleve->parents()->syncWithoutDetaching([
                $parent->id => ['lien' => $elData['lien']]
            ]);
        }
        $this->command->info("🎓 12 Élèves non inscrits créés et rattachés à leurs parents.");

        $this->command->info("✅ Base de données prête avec données de test cohérentes et réalistes !");
    }
}

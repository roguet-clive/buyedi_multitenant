<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // 1️⃣ Créer ou récupérer l'utilisateur Super Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'nom' => 'ROGUET DE NDONG',
                'prenom' => 'Clive Lybeyrt',
                'password' => Hash::make('12345678'),
            ]
        );

        // 2️⃣ Créer l'utilisateur Directeur
        $directeur = User::firstOrCreate(
            ['email' => 'directeur@buyedi.com'],
            [
                'nom' => 'Directeur',
                'prenom' => 'General',
                'password' => Hash::make('12345678'),
            ]
        );

        // 3️⃣ Modules et actions dynamiques
        $modules = [
            'dashboard' => ['voir'],
            'logs' => ['voir', 'exporter'],
            'users' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'roles' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'etablissement' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'classes' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'matieres' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'annee_scolaire' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'enseignants' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'eleves' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'parents' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'inscriptions' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'personnels' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'emplois_du_temps' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'notes' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'bulletins' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'absences' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'depenses' => ['voir', 'ajouter', 'modifier', 'supprimer'],

            // 👉 Gestion des frais (pas de "frais" global)
            'frais_inscription' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'frais_classes' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'frais_types' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'paiements' => ['voir', 'ajouter', 'modifier', 'supprimer'],

            // 👉 Périodes
            'periodes' => ['voir', 'ajouter', 'modifier', 'supprimer'],

            // 👉 Nouveaux modules
            'cours' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'evaluations' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'communications' => ['voir', 'creer', 'expedier', 'supprimer'], 
            'stats' => ['voir'], 
            'documents' => ['voir', 'ajouter', 'modifier', 'supprimer', 'telecharger'], // 📚 NEW MODULE
            'sanctions' => ['voir', 'ajouter', 'modifier', 'supprimer'], // 👮 NEW MODULE
            'archives' => ['voir'], // 🔍 NEW MODULE (Multi-year)
        ];

        // 4️⃣ Créer toutes les permissions dynamiquement
        $allPermissions = [];
        foreach ($modules as $module => $actions) {
            foreach ($actions as $action) {
                $permissionName = strtolower("{$action}_{$module}");
                Permission::firstOrCreate([
                    'name' => $permissionName,
                    'guard_name' => 'web'
                ]);
                $allPermissions[] = $permissionName;
            }
        }

        // 5️⃣ Créer le rôle Super Admin et lui assigner toutes les permissions
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $superAdminRole->syncPermissions($allPermissions);
        $admin->assignRole($superAdminRole);

        // 6️⃣ Créer le rôle Directeur et lui assigner toutes les permissions (ou presque)
        // Pour l'instant, on donne TOUT au directeur aussi
        $directeurRole = Role::firstOrCreate(['name' => 'directeur', 'guard_name' => 'web']);
        $directeurRole->syncPermissions($allPermissions);
        $directeur->assignRole($directeurRole);

        // 7️⃣ Créer les rôles Élève et Parent avec permissions limitées
        $eleveRole = Role::firstOrCreate(['name' => 'eleve', 'guard_name' => 'web']);
        $eleveRole->syncPermissions([
            'voir_dashboard',
            'voir_inscriptions', // ✅ Crucial pour Inscriptions
            'voir_emplois_du_temps',
            'voir_communications', 
            'voir_notes', 
            'voir_bulletins',
            'voir_absences',
            'voir_paiements', // ✅ Crucial pour Caisse
            'voir_documents', // 📚 Accès aux cours
            'telecharger_documents',
        ]);

        $parentRole = Role::firstOrCreate(['name' => 'parent', 'guard_name' => 'web']);
        $parentRole->syncPermissions([
            'voir_dashboard',
            'voir_eleves', // Pour voir ses propres enfants
            'voir_inscriptions',
            'voir_communications', 
            'creer_communications',
            'voir_notes',
            'voir_bulletins',
            'voir_absences',
            'voir_paiements',
            'telecharger_documents',
            'voir_emplois_du_temps',
        ]);

        $personnelRole = Role::firstOrCreate(['name' => 'personnel', 'guard_name' => 'web']);
        $personnelRole->syncPermissions([
            'voir_dashboard',
            'voir_personnels',
            'telecharger_documents',
        ]);

        // Création du Rôle Enseignant
        $enseignantRole = Role::firstOrCreate(['name' => 'enseignant', 'guard_name' => 'web']);
        $enseignantRole->syncPermissions([
            'voir_dashboard',
            'voir_cours',
            'voir_emplois_du_temps',
            'voir_eleves',
            'voir_classes', // ✅ Ajouté
            'voir_matieres', // ✅ Ajouté
            'voir_notes',
            'ajouter_notes',
            'modifier_notes',
            'voir_bulletins',
            'voir_evaluations',
            'ajouter_evaluations',
            'modifier_evaluations',
            'supprimer_evaluations',
            'voir_absences',
            'ajouter_absences',
            'modifier_absences',
            'telecharger_documents',
            'creer_communications', // ✅ Ajouté
            'expedier_communications', // ✅ Ajouté
            'voir_communications', // ✅ Ajouté (Manquant précédemment)
            'voir_periodes', // ✅ Ajouté (Utile pour Evaluations)
            'voir_documents', // 📚 Ajouté
            'ajouter_documents', // 📚 Ajouté
            'supprimer_documents', // 📚 Ajouté
            'voir_parents', // ✅ Ajouté (Utile pour Contact)
        ]);

        $this->command->info("✅ Admin (Clive) et Directeur créés avec succès !");
    }
}

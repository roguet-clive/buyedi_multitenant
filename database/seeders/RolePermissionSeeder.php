<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // 0️⃣ Réinitialiser le cache des permissions Spatie
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1️⃣ Créer ou récupérer l'utilisateur Super Admin
        $admin = User::firstOrCreate(
            ['email' => 'superadmin@buyedi.com'],
            [
                'nom' => 'BUYEDI',
                'prenom' => 'Solutions',
                'password' => Hash::make('12345678'),
            ]
        );

        // 2️⃣ Modules et actions dynamiques
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

            // 👉 Gestion des frais
            'frais_inscription' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'frais_classes' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'frais_types' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'paiements' => ['voir', 'ajouter', 'modifier', 'supprimer'],

            // 👉 Périodes
            'periodes' => ['voir', 'ajouter', 'modifier', 'supprimer'],

            // 👉 Modules avancés
            'cours' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'evaluations' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'communications' => ['voir', 'creer', 'expedier', 'supprimer'], 
            'stats' => ['voir'], 
            'documents' => ['voir', 'ajouter', 'modifier', 'supprimer', 'telecharger'],
            'sanctions' => ['voir', 'ajouter', 'modifier', 'supprimer'],
            'archives' => ['voir'],
            'sauvegardes' => ['voir', 'ajouter', 'supprimer', 'telecharger', 'restaurer'],
            'arrieres' => ['voir', 'ajouter', 'modifier', 'supprimer', 'encaisser'],
        ];

        // 3️⃣ Créer toutes les permissions dynamiquement
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

        // 4️⃣ RÔLE : SUPER ADMIN (Accès total absolu avec toutes les permissions)
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $superAdminRole->syncPermissions($allPermissions);
        $admin->assignRole($superAdminRole);

        // 5️⃣ RÔLE : DIRECTEUR (Direction de l'établissement - aucun utilisateur factice créé)
        $directeurRole = Role::firstOrCreate(['name' => 'directeur', 'guard_name' => 'web']);
        $directeurRole->syncPermissions($allPermissions);

        // 6️⃣ RÔLE : COMPTABLE / ÉCONOME (Gestion Financière & Caisse)
        $comptableRole = Role::firstOrCreate(['name' => 'comptable', 'guard_name' => 'web']);
        $comptableRole->syncPermissions([
            'voir_dashboard',
            'voir_stats',
            'voir_paiements', 'ajouter_paiements', 'modifier_paiements', 'supprimer_paiements',
            'voir_arrieres', 'ajouter_arrieres', 'modifier_arrieres', 'supprimer_arrieres', 'encaisser_arrieres',
            'voir_depenses', 'ajouter_depenses', 'modifier_depenses', 'supprimer_depenses',
            'voir_frais_classes', 'ajouter_frais_classes', 'modifier_frais_classes',
            'voir_frais_types', 'ajouter_frais_types', 'modifier_frais_types',
            'voir_frais_inscription',
            'voir_eleves',
            'voir_inscriptions',
            'voir_classes',
            'voir_parents',
            'voir_personnels',
            'voir_communications', 'creer_communications', 'expedier_communications',
            'voir_documents', 'telecharger_documents',
            'voir_annee_scolaire',
            'voir_periodes',
        ]);

        // 7️⃣ RÔLE : PERSONNEL ADMINISTRATIF / SECRÉTARIAT
        $personnelRole = Role::firstOrCreate(['name' => 'personnel', 'guard_name' => 'web']);
        $personnelRole->syncPermissions([
            'voir_dashboard',
            'voir_inscriptions', 'ajouter_inscriptions', 'modifier_inscriptions',
            'voir_eleves', 'ajouter_eleves', 'modifier_eleves',
            'voir_parents', 'ajouter_parents', 'modifier_parents',
            'voir_classes',
            'voir_matieres',
            'voir_emplois_du_temps',
            'voir_absences', 'ajouter_absences', 'modifier_absences',
            'voir_sanctions', 'ajouter_sanctions', 'modifier_sanctions',
            'voir_documents', 'ajouter_documents', 'modifier_documents', 'telecharger_documents',
            'voir_paiements',
            'voir_personnels',
            'voir_enseignants',
            'voir_communications', 'creer_communications', 'expedier_communications',
            'voir_annee_scolaire',
            'voir_periodes',
        ]);

        // 8️⃣ RÔLE : ENSEIGNANT
        $enseignantRole = Role::firstOrCreate(['name' => 'enseignant', 'guard_name' => 'web']);
        $enseignantRole->syncPermissions([
            'voir_dashboard',
            'voir_emplois_du_temps',
            'voir_classes',
            'voir_matieres',
            'voir_cours',
            'voir_notes', 'ajouter_notes', 'modifier_notes',
            'voir_bulletins',
            'voir_evaluations', 'ajouter_evaluations', 'modifier_evaluations', 'supprimer_evaluations',
            'voir_absences', 'ajouter_absences', 'modifier_absences',
            'voir_sanctions', 'ajouter_sanctions',
            'telecharger_documents', 'voir_documents', 'ajouter_documents', 'supprimer_documents',
            'voir_communications', 'creer_communications', 'expedier_communications',
            'voir_periodes',
            'voir_parents',
        ]);

        // 9️⃣ RÔLE : ÉLÈVE
        $eleveRole = Role::firstOrCreate(['name' => 'eleve', 'guard_name' => 'web']);
        $eleveRole->syncPermissions([
            'voir_dashboard',
            'voir_inscriptions',
            'voir_emplois_du_temps',
            'voir_communications', 
            'voir_notes', 
            'voir_bulletins',
            'voir_absences',
            'voir_paiements',
            'voir_documents',
            'ajouter_documents',
            'telecharger_documents',
        ]);

        // 🔟 RÔLE : PARENT
        $parentRole = Role::firstOrCreate(['name' => 'parent', 'guard_name' => 'web']);
        $parentRole->syncPermissions([
            'voir_dashboard',
            'voir_eleves',
            'voir_inscriptions',
            'voir_communications', 
            'creer_communications',
            'voir_notes',
            'voir_bulletins',
            'voir_absences',
            'voir_paiements',
            'voir_documents',
            'ajouter_documents',
            'telecharger_documents',
            'voir_emplois_du_temps',
        ]);

        $this->command->info("✅ Super-Admin (superadmin@buyedi.com), rôles système et permissions initialisés avec succès !");
    }
}

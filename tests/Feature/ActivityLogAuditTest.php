<?php

namespace Tests\Feature;

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\FraisType;
use App\Models\Inscription;
use App\Models\Paiement;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

class ActivityLogAuditTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $lambdaUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create([
            'nom' => 'Admin',
            'prenom' => 'Auditeur',
            'email' => 'audit_admin@buyedi.com',
        ]);
        $this->admin->assignRole('super-admin');

        $this->lambdaUser = User::factory()->create([
            'nom' => 'Lambda',
            'prenom' => 'User',
            'email' => 'lambda@buyedi.com',
        ]);
        $this->lambdaUser->assignRole('eleve');
    }

    public function test_logs_index_requires_voir_logs_permission(): void
    {
        $response = $this->actingAs($this->lambdaUser)->get('/logs');
        $response->assertStatus(403);

        $responseAdmin = $this->actingAs($this->admin)->get('/logs');
        $responseAdmin->assertStatus(200);
    }

    public function test_eleve_actions_are_tracked_with_causer_and_properties(): void
    {
        $userEleve = User::factory()->create(['nom' => 'LogTest', 'prenom' => 'Student']);

        $this->actingAs($this->admin);

        $eleve = Eleve::create([
            'user_id' => $userEleve->id,
            'sexe' => 'M',
            'matricule' => 'CSSD-2026-9999',
            'date_naissance' => '2015-05-10',
            'lieu_naissance' => 'Libreville',
        ]);

        $log = Activity::where('subject_type', Eleve::class)
            ->where('subject_id', $eleve->id)
            ->first();

        $this->assertNotNull($log, "L'activité de création de l'élève doit être enregistrée");
        $this->assertEquals($this->admin->id, $log->causer_id, "L'auteur (causer_id) doit être l'admin connecté");
        $this->assertNotNull($log->created_at, "L'horodatage précis doit être présent");
    }

    public function test_financial_actions_are_tracked_in_activity_log(): void
    {
        $userStudent = User::factory()->create(['nom' => 'Finance', 'prenom' => 'Test']);
        $eleve = Eleve::create([
            'user_id' => $userStudent->id,
            'sexe' => 'F',
            'matricule' => 'CSSD-2026-8888',
        ]);

        $annee = \App\Models\AnneeScolaire::create([
            'nom' => '2025-2026',
            'date_debut' => '2025-09-01',
            'date_fin' => '2026-06-30',
            'en_cours' => true,
        ]);

        $classe = Classe::create(['nom' => '6e A', 'type' => 'secondaire']);

        $fraisType = FraisType::create([
            'nom' => 'Frais Inscription',
            'code' => 'inscription',
            'montant' => 10000,
            'annee_scolaire_id' => $annee->id,
            'is_scolarite' => false,
        ]);

        $this->actingAs($this->admin);

        $inscription = Inscription::create([
            'eleve_id' => $eleve->id,
            'classe_id' => $classe->id,
            'annee_scolaire_id' => $annee->id,
            'date_inscription' => '2026-09-04',
            'numero_recu' => 'REC-LOG-01',
            'total_frais' => 10000,
            'has_remise' => false,
            'statut' => 'validee',
        ]);

        $inscriptionLog = Activity::where('subject_type', Inscription::class)
            ->where('subject_id', $inscription->id)
            ->first();

        $this->assertNotNull($inscriptionLog, "L'inscription doit gÃ©nÃ©rer un log d'activitÃ©");
        $this->assertEquals($this->admin->id, $inscriptionLog->causer_id);

        $paiement = Paiement::create([
            'inscription_id' => $inscription->id,
            'frais_type_id' => $fraisType->id,
            'user_id' => $this->admin->id,
            'montant' => 10000,
            'date_paiement' => '2026-09-04',
            'mode_paiement' => 'especes',
        ]);

        $paiementLog = Activity::where('subject_type', Paiement::class)
            ->where('subject_id', $paiement->id)
            ->first();

        $this->assertNotNull($paiementLog, "Le paiement doit générer un log d'activité");
        $this->assertEquals($this->admin->id, $paiementLog->causer_id);
    }

    public function test_user_login_is_tracked_in_activity_log(): void
    {
        $password = 'secret-password-123';
        $user = User::factory()->create([
            'email' => 'login_test@buyedi.com',
            'password' => bcrypt($password),
        ]);

        $response = $this->post('/login', [
            'email' => 'login_test@buyedi.com',
            'password' => $password,
        ]);

        $response->assertRedirect('/dashboard');

        $log = Activity::where('log_name', 'authentification')
            ->where('description', 'Connexion réussie')
            ->where('causer_id', $user->id)
            ->latest()
            ->first();

        $this->assertNotNull($log, "La connexion d'un utilisateur doit générer un log d'authentification");
        $this->assertEquals($user->id, $log->causer_id);
        $this->assertArrayHasKey('ip', $log->properties->toArray());
    }

    public function test_user_logout_is_tracked_in_activity_log(): void
    {
        $user = User::factory()->create(['email' => 'logout_test@buyedi.com']);

        $response = $this->actingAs($user)->post('/logout');
        $response->assertRedirect('/');

        $log = Activity::where('log_name', 'authentification')
            ->where('description', 'Déconnexion')
            ->where('causer_id', $user->id)
            ->latest()
            ->first();

        $this->assertNotNull($log, "La déconnexion doit générer un log d'activité");
        $this->assertEquals($user->id, $log->causer_id);
    }

    public function test_failed_login_is_tracked_in_activity_log(): void
    {
        $response = $this->post('/login', [
            'email' => 'pirate@hacker.com',
            'password' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors('email');

        $log = Activity::where('log_name', 'securite')
            ->where('description', 'Échec de connexion')
            ->latest()
            ->first();

        $this->assertNotNull($log, "L'échec de connexion doit générer un log de sécurité");
        $this->assertEquals('pirate@hacker.com', $log->properties['email_tente']);
        $this->assertArrayHasKey('ip', $log->properties->toArray());
    }

    public function test_superadmin_activities_are_hidden_from_non_superadmin_users(): void
    {
        // Créer un utilisateur directeur avec la permission voir_logs mais sans rôle super-admin
        $directeur = User::factory()->create([
            'nom' => 'Directeur',
            'prenom' => 'Audit',
            'email' => 'directeur@buyedi.com',
        ]);
        $directeur->givePermissionTo('voir_logs');

        // Nettoyer les logs générés lors du seeding et de la création des users
        Activity::truncate();

        // Créer un log d'action par le super-admin
        activity('systeme')
            ->causedBy($this->admin)
            ->log('Action ultra-confidentielle du Super-Admin');

        // Créer un log d'action par le directeur
        activity('systeme')
            ->causedBy($directeur)
            ->log('Action standard du Directeur');

        // 1. Accès classique du directeur : le log super-admin doit être invisible
        $response = $this->actingAs($directeur)->get('/logs');
        $response->assertStatus(200);

        $response->assertInertia(fn ($page) => 
            $page->component('Logs/Index')
                ->where('isSuperAdmin', false)
                ->where('filters.show_superadmin', false)
                ->has('logs.data', 1)
                ->where('logs.data.0.description', 'Action standard du Directeur')
        );

        // 2. Le directeur tente de forcer l'affichage avec des paramètres URL
        $responseHack = $this->actingAs($directeur)->get("/logs?show_superadmin=1&causer_id={$this->admin->id}");
        $responseHack->assertStatus(200);

        $responseHack->assertInertia(fn ($page) => 
            $page->component('Logs/Index')
                ->where('isSuperAdmin', false)
                ->where('filters.show_superadmin', false)
                ->where('logs.total', 1) // Ne doit pas contenir l'action super-admin
        );
    }

    public function test_superadmin_can_toggle_incognito_mode(): void
    {
        $directeur = User::factory()->create([
            'nom' => 'Directeur',
            'prenom' => 'Audit',
            'email' => 'directeur2@buyedi.com',
        ]);
        $directeur->givePermissionTo('voir_logs');

        // Nettoyer les logs de création d'utilisateurs
        Activity::truncate();

        activity('systeme')
            ->causedBy($this->admin)
            ->log('Action Super-Admin');

        activity('systeme')
            ->causedBy($directeur)
            ->log('Action Directeur');

        // 1. Par défaut pour le super-admin : tout est visible
        $response = $this->actingAs($this->admin)->get('/logs');
        $response->assertStatus(200);

        $response->assertInertia(fn ($page) => 
            $page->component('Logs/Index')
                ->where('isSuperAdmin', true)
                ->where('filters.show_superadmin', true)
                ->has('logs.data', 2)
        );

        // 2. Mode Incognito activé par le super-admin (?show_superadmin=0)
        $responseIncognito = $this->actingAs($this->admin)->get('/logs?show_superadmin=0');
        $responseIncognito->assertStatus(200);

        $responseIncognito->assertInertia(fn ($page) => 
            $page->component('Logs/Index')
                ->where('isSuperAdmin', true)
                ->where('filters.show_superadmin', false)
                ->has('logs.data', 1)
                ->where('logs.data.0.description', 'Action Directeur')
        );
    }
}

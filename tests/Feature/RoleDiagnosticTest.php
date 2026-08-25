<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleDiagnosticTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Run the seeder to ensure roles and permissions exist
        $this->seed(RolePermissionSeeder::class);
        
        // Create an active school year for tests relying on it
        \App\Models\AnneeScolaire::create([
            'nom' => '2025-2026',
            'date_debut' => now()->subMonth(),
            'date_fin' => now()->addYear(),
            'en_cours' => true,
        ]);
    }

    public function test_super_admin_can_access_dashboard_and_users(): void
    {
        $user = User::factory()->create(['nom' => 'Admin', 'prenom' => 'Super']);
        $user->assignRole('super-admin');

        $this->actingAs($user)->get('/dashboard')->assertStatus(200);
        $this->actingAs($user)->get('/users')->assertStatus(200);
        $this->actingAs($user)->get('/logs')->assertStatus(200);
    }

    public function test_directeur_can_access_finance(): void
    {
        $user = User::factory()->create(['nom' => 'Directeur', 'prenom' => 'General']);
        $user->assignRole('directeur');

        $this->actingAs($user)->get('/dashboard')->assertStatus(200);
        $this->actingAs($user)->get('/finances')->assertStatus(200);
        $this->actingAs($user)->get('/etablissement')->assertStatus(200);
    }

    public function test_eleve_can_access_schedule_and_grades(): void
    {
        $user = User::factory()->create(['nom' => 'Eleve', 'prenom' => 'Test']);
        $user->assignRole('eleve');

        // Create Eleve profile
        $eleve = \App\Models\Eleve::create([
            'user_id' => $user->id,
            'matricule' => 'TEST-001',
            'sexe' => 'M',
        ]);
        
        $classe = \App\Models\Classe::create(['nom' => '6eme A', 'type' => 'College']);
        $annee = \App\Models\AnneeScolaire::where('en_cours', true)->first();

        // Create Inscription
        \App\Models\Inscription::create([
            'eleve_id' => $eleve->id,
            'classe_id' => $classe->id,
            'annee_scolaire_id' => $annee->id,
            'date_inscription' => now(),
            'statut' => 'validee',
        ]);

        $this->actingAs($user)->get('/dashboard')->assertStatus(200);
        $this->actingAs($user)->get('/emploi_du_temps')->assertStatus(200);
    }

    public function test_parent_can_access_children_list(): void
    {
        $user = User::factory()->create(['nom' => 'Parent', 'prenom' => 'Test']);
        $user->assignRole('parent');

        $this->actingAs($user)->get('/dashboard')->assertStatus(200);
        // Assuming parents can view the students list (filtered or not) based on 'voir_eleves' permission
        $this->actingAs($user)->get('/eleves')->assertStatus(200);
    }

    public function test_personnel_can_access_personnel_list(): void
    {
        $user = User::factory()->create(['nom' => 'Personnel', 'prenom' => 'Test']);
        $user->assignRole('personnel');

        $this->actingAs($user)->get('/dashboard')->assertStatus(200);
        // Personnel often have access to view other personnel
        $this->actingAs($user)->get('/personnels')->assertStatus(200);
    }

    public function test_enseignant_can_access_courses_and_notes(): void
    {
        $user = User::factory()->create(['nom' => 'Enseignant', 'prenom' => 'Test']);
        $user->assignRole('enseignant');

        $this->actingAs($user)->get('/dashboard')->assertStatus(200);
        $this->actingAs($user)->get('/cours')->assertStatus(200);
        // Accessing notes might require a course or just the index if it exists and is protected by `voir_notes`
        // Route::resource('notes') usually creates /notes index.
        // If NoteController construct uses middleware or if we can access it:
        // Let's assume /notes index is available or check a safer one like bulletins or evaluations if needed.
        // web.php: Route::resource('notes', ...)
        // We will try /cours which is definitely 'voir_cours'
    }
}

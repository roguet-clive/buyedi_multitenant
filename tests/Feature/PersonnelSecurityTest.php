<?php

namespace Tests\Feature;

use App\Models\Personnel;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PersonnelSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $directeur;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->superAdmin = User::factory()->create(['email' => 'sa@buyedi.com']);
        $this->superAdmin->assignRole('super-admin');

        $this->directeur = User::factory()->create(['email' => 'dir@buyedi.com']);
        $this->directeur->assignRole('directeur');
    }

    public function test_non_superadmin_cannot_see_superadmin_role_in_dropdown(): void
    {
        $response = $this->actingAs($this->directeur)->get('/personnels');
        $response->assertStatus(200);

        $response->assertInertia(fn ($page) => 
            $page->component('Personnels/Index')
                ->where('roles', fn ($roles) => 
                    collect($roles)->pluck('name')->doesntContain('super-admin')
                )
        );
    }

    public function test_superadmin_sees_superadmin_role_in_dropdown(): void
    {
        $response = $this->actingAs($this->superAdmin)->get('/personnels');
        $response->assertStatus(200);

        $response->assertInertia(fn ($page) => 
            $page->component('Personnels/Index')
                ->where('roles', fn ($roles) => 
                    collect($roles)->pluck('name')->contains('super-admin')
                )
        );
    }

    public function test_non_superadmin_cannot_assign_superadmin_role(): void
    {
        $payload = [
            'nom' => 'Hacker',
            'prenom' => 'Tentative',
            'email' => 'hacker@buyedi.com',
            'role' => 'super-admin',
            'poste' => 'Chef Sécurité',
            'sexe' => 'M',
        ];

        $response = $this->actingAs($this->directeur)->post(route('personnels.store'), $payload);
        $response->assertStatus(403);

        $this->assertDatabaseMissing('users', ['email' => 'hacker@buyedi.com']);
    }

    public function test_superadmin_can_assign_superadmin_role(): void
    {
        $payload = [
            'nom' => 'Admin2',
            'prenom' => 'Legitime',
            'email' => 'admin2@buyedi.com',
            'role' => 'super-admin',
            'poste' => 'Co-Administrateur',
            'sexe' => 'M',
        ];

        $response = $this->actingAs($this->superAdmin)->post(route('personnels.store'), $payload);
        $response->assertRedirect(route('personnels.index'));

        $newUser = User::where('email', 'admin2@buyedi.com')->first();
        $this->assertNotNull($newUser);
        $this->assertTrue($newUser->hasRole('super-admin'));
    }

    public function test_non_superadmin_cannot_modify_or_delete_superadmin_personnel(): void
    {
        $saUser = User::factory()->create(['email' => 'target_sa@buyedi.com']);
        $saUser->assignRole('super-admin');

        $saPersonnel = Personnel::create([
            'user_id' => $saUser->id,
            'poste' => 'CTO',
            'sexe' => 'M',
        ]);

        // Tentative de modification
        $responseUpdate = $this->actingAs($this->directeur)->put(route('personnels.update', $saPersonnel->id), [
            'nom' => 'Modif',
            'prenom' => 'Interdite',
            'email' => 'target_sa@buyedi.com',
            'poste' => 'Gardien',
            'sexe' => 'M',
        ]);
        $responseUpdate->assertStatus(403);

        // Tentative de suppression
        $responseDelete = $this->actingAs($this->directeur)->delete(route('personnels.destroy', $saPersonnel->id));
        $responseDelete->assertStatus(403);

        $this->assertDatabaseHas('personnels', ['id' => $saPersonnel->id]);
        $this->assertDatabaseHas('users', ['id' => $saUser->id]);
    }
}

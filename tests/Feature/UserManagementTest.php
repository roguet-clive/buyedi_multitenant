<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $directeur;
    protected User $enseignant;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->superAdmin = User::role('super-admin')->first();

        $this->directeur = User::factory()->create([
            'nom' => 'Directeur',
            'prenom' => 'Paul',
            'email' => 'directeur@test.com',
        ]);
        $this->directeur->assignRole('directeur');

        $this->enseignant = User::factory()->create([
            'nom' => 'Professeur',
            'prenom' => 'Luc',
            'email' => 'prof@test.com',
        ]);
        $this->enseignant->assignRole('enseignant');
    }

    public function test_users_index_can_be_accessed_with_filters(): void
    {
        $response = $this->actingAs($this->superAdmin)->get('/users?role=&search=');
        $response->assertStatus(200);

        // Test search filter
        $responseSearch = $this->actingAs($this->superAdmin)->get('/users?role=&search=Paul');
        $responseSearch->assertStatus(200);

        // Test role filter
        $responseRole = $this->actingAs($this->superAdmin)->get('/users?role=directeur&search=');
        $responseRole->assertStatus(200);
    }

    public function test_unauthorized_user_cannot_access_users_index(): void
    {
        $response = $this->actingAs($this->enseignant)->get('/users');
        $response->assertStatus(403);
    }

    public function test_super_admin_can_create_user_with_explicit_password_and_roles(): void
    {
        Mail::fake();

        $response = $this->actingAs($this->superAdmin)->post(route('users.store'), [
            'nom' => 'Ndong',
            'prenom' => 'Marc',
            'email' => 'ndong.marc@test.com',
            'telephone' => '+24107112233',
            'password' => 'secret123',
            'roles' => ['comptable', 'personnel'],
        ]);

        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('success');

        $user = User::where('email', 'ndong.marc@test.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('Ndong', $user->nom);
        $this->assertEquals('Marc', $user->prenom);
        $this->assertEquals('+24107112233', $user->telephone);
        $this->assertTrue(Hash::check('secret123', $user->password));

        $this->assertTrue($user->hasRole('comptable'));
        $this->assertTrue($user->hasRole('personnel'));
    }

    public function test_super_admin_can_create_user_with_auto_generated_password(): void
    {
        Mail::fake();

        $response = $this->actingAs($this->superAdmin)->post(route('users.store'), [
            'nom' => 'Kombila',
            'prenom' => 'Sophie',
            'email' => 'sophie.kombila@test.com',
            'password' => '', // Auto-généré
            'roles' => ['enseignant'],
        ]);

        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('success');

        $user = User::where('email', 'sophie.kombila@test.com')->first();
        $this->assertNotNull($user);
        $this->assertNotEmpty($user->password);
        $this->assertTrue($user->hasRole('enseignant'));
    }

    public function test_create_user_fails_if_email_already_exists(): void
    {
        $response = $this->actingAs($this->superAdmin)->post(route('users.store'), [
            'nom' => 'Clone',
            'email' => $this->directeur->email,
            'roles' => ['directeur'],
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    public function test_super_admin_can_update_user_and_reassign_roles(): void
    {
        $targetUser = User::factory()->create([
            'nom' => 'AncienNom',
            'prenom' => 'AncienPrenom',
            'email' => 'target@test.com',
            'password' => Hash::make('oldpassword'),
        ]);
        $targetUser->assignRole('personnel');

        $response = $this->actingAs($this->superAdmin)->put(route('users.update', $targetUser->id), [
            'nom' => 'NouveauNom',
            'prenom' => 'NouveauPrenom',
            'email' => 'target.updated@test.com',
            'telephone' => '+24106554433',
            'password' => '', // Conserver l'ancien mot de passe
            'roles' => ['comptable'], // Remplacer personnel par comptable
        ]);

        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('success');

        $targetUser->refresh();
        $this->assertEquals('NouveauNom', $targetUser->nom);
        $this->assertEquals('NouveauPrenom', $targetUser->prenom);
        $this->assertEquals('target.updated@test.com', $targetUser->email);
        $this->assertEquals('+24106554433', $targetUser->telephone);
        $this->assertTrue(Hash::check('oldpassword', $targetUser->password));

        $this->assertTrue($targetUser->hasRole('comptable'));
        $this->assertFalse($targetUser->hasRole('personnel'));
    }

    public function test_update_can_change_password_when_provided(): void
    {
        $targetUser = User::factory()->create([
            'nom' => 'Test',
            'email' => 'passchange@test.com',
            'password' => Hash::make('oldpass123'),
        ]);

        $response = $this->actingAs($this->superAdmin)->put(route('users.update', $targetUser->id), [
            'nom' => 'Test',
            'email' => 'passchange@test.com',
            'password' => 'newsuperpass456',
            'roles' => ['comptable'],
        ]);

        $response->assertRedirect(route('users.index'));
        $targetUser->refresh();
        $this->assertTrue(Hash::check('newsuperpass456', $targetUser->password));
    }

    public function test_user_cannot_delete_themselves(): void
    {
        $response = $this->actingAs($this->superAdmin)->delete(route('users.destroy', $this->superAdmin->id));
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('users', ['id' => $this->superAdmin->id]);
    }

    public function test_super_admin_can_delete_another_user(): void
    {
        $userToDelete = User::factory()->create([
            'nom' => 'ToDelete',
            'email' => 'delete.me@test.com',
        ]);

        $response = $this->actingAs($this->superAdmin)->delete(route('users.destroy', $userToDelete->id));
        $response->assertRedirect(route('users.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('users', ['id' => $userToDelete->id]);
    }
}

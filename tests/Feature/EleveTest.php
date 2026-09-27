<?php

namespace Tests\Feature;

use App\Models\Eleve;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class EleveTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::firstOrCreate(['name' => 'voir_eleves']);
        Permission::firstOrCreate(['name' => 'ajouter_eleves']);
        Permission::firstOrCreate(['name' => 'modifier_eleves']);
        Permission::firstOrCreate(['name' => 'supprimer_eleves']);

        Role::firstOrCreate(['name' => 'eleve']);
        $adminRole = Role::firstOrCreate(['name' => 'directeur']);
        $adminRole->givePermissionTo(['voir_eleves', 'ajouter_eleves', 'modifier_eleves', 'supprimer_eleves']);

        $this->admin = User::factory()->create([
            'nom' => 'Directeur',
            'prenom' => 'Test',
            'email' => 'directeur@buyedi.ga',
        ]);
        $this->admin->assignRole('directeur');
    }

    public function test_can_create_a_student_with_transaction_and_roles(): void
    {
        $payload = [
            'nom' => 'NGOUA',
            'prenom' => 'Fabrice',
            'sexe' => 'M',
            'date_naissance' => '2010-05-15',
            'lieu_naissance' => 'Libreville',
        ];

        $response = $this->actingAs($this->admin)->post(route('eleves.store'), $payload);

        $response->assertRedirect();
        
        $eleve = Eleve::latest()->first();
        $this->assertNotNull($eleve);
        $this->assertEquals('NGOUA', $eleve->user->nom);
        $this->assertEquals('Fabrice', $eleve->user->prenom);
        $this->assertTrue($eleve->user->hasRole('eleve'));
        $sigle = \App\Models\Etablissement::first()?->sigle ?: 'CS-BUYEDI';
        $currentYear = date('Y');
        $this->assertStringStartsWith("{$sigle}-{$currentYear}-", $eleve->matricule);
        $this->assertMatchesRegularExpression("/^{$sigle}-{$currentYear}-\\d{4}$/", $eleve->matricule);
    }

    public function test_matricule_increments_sequentially_per_year(): void
    {
        $sigle = \App\Models\Etablissement::first()?->sigle ?: 'CS-BUYEDI';
        $currentYear = date('Y');

        $payload1 = [
            'nom' => 'OBAME',
            'prenom' => 'Junior',
            'sexe' => 'M',
            'date_naissance' => '2012-01-10',
            'lieu_naissance' => 'Oyem',
        ];
        $this->actingAs($this->admin)->post(route('eleves.store'), $payload1);
        $eleve1 = Eleve::latest('id')->first();

        $payload2 = [
            'nom' => 'NDONG',
            'prenom' => 'Clara',
            'sexe' => 'F',
            'date_naissance' => '2013-03-22',
            'lieu_naissance' => 'Bitam',
        ];
        $this->actingAs($this->admin)->post(route('eleves.store'), $payload2);
        $eleve2 = Eleve::latest('id')->first();

        $this->assertStringStartsWith("{$sigle}-{$currentYear}-", $eleve1->matricule);
        $this->assertStringStartsWith("{$sigle}-{$currentYear}-", $eleve2->matricule);
        $num1 = (int) substr($eleve1->matricule, -4);
        $num2 = (int) substr($eleve2->matricule, -4);
        $this->assertEquals($num1 + 1, $num2);
    }
}

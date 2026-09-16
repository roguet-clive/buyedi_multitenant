<?php

namespace Tests\Feature;

use App\Models\Depense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DepenseTest extends TestCase
{
    use RefreshDatabase;

    protected User $comptable;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::firstOrCreate(['name' => 'voir_depenses']);
        Permission::firstOrCreate(['name' => 'ajouter_depenses']);
        Permission::firstOrCreate(['name' => 'supprimer_depenses']);

        $role = Role::firstOrCreate(['name' => 'comptable']);
        $role->givePermissionTo(['voir_depenses', 'ajouter_depenses', 'supprimer_depenses']);

        $this->comptable = User::factory()->create([
            'nom' => 'Kombila',
            'prenom' => 'Comptable',
        ]);
        $this->comptable->assignRole('comptable');
    }

    public function test_can_access_depenses_index_and_gets_dynamic_categories(): void
    {
        // Créer une dépense avec une catégorie existante spéciale
        Depense::create([
            'user_id' => $this->comptable->id,
            'categorie' => 'Carburant Générateur',
            'montant' => 45000,
            'description' => 'Achat gasoil',
            'date_depense' => now()->format('Y-m-d'),
        ]);

        $response = $this->actingAs($this->comptable)->get(route('depenses.index'));
        $response->assertStatus(200);

        // Vérifier que 'Carburant Générateur' est injecté dans les catégories envoyées à Inertia
        $response->assertInertia(function ($page) {
            $page->component('Depenses/Index')
                ->has('categories')
                ->where('categories', function ($categories) {
                    $c = collect($categories);
                    return $c->contains('Carburant Générateur')
                        && $c->contains('Loyer')
                        && $c->contains('Autre');
                });
        });
    }

    public function test_can_create_expense_with_custom_dynamic_category(): void
    {
        $payload = [
            'categorie' => '__custom__',
            'custom_categorie' => 'Frais de Pharmacie',
            'montant' => 12500,
            'description' => 'Achat trousse de premiers secours',
            'date_depense' => now()->format('Y-m-d'),
        ];

        $response = $this->actingAs($this->comptable)->post(route('depenses.store'), $payload);
        $response->assertRedirect();

        // Vérifier en base que la dépense a bien la catégorie saisie
        $this->assertDatabaseHas('depenses', [
            'categorie' => 'Frais de Pharmacie',
            'montant' => 12500,
            'description' => 'Achat trousse de premiers secours',
            'user_id' => $this->comptable->id,
        ]);

        // Vérifier que le prochain affichage de la page contient maintenant cette nouvelle catégorie
        $indexResponse = $this->actingAs($this->comptable)->get(route('depenses.index'));
        $indexResponse->assertInertia(function ($page) {
            $page->where('categories', function ($categories) {
                return collect($categories)->contains('Frais de Pharmacie');
            });
        });
    }

    public function test_can_delete_expense(): void
    {
        $depense = Depense::create([
            'user_id' => $this->comptable->id,
            'categorie' => 'Entretien',
            'montant' => 10000,
            'date_depense' => now()->format('Y-m-d'),
        ]);

        $response = $this->actingAs($this->comptable)->delete(route('depenses.destroy', $depense->id));
        $response->assertRedirect();

        $this->assertDatabaseMissing('depenses', ['id' => $depense->id]);
    }
}

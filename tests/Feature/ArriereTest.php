<?php

namespace Tests\Feature;

use App\Models\Arriere;
use App\Models\ArrierePaiement;
use App\Models\Eleve;
use App\Models\FraisType;
use App\Models\Paiement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ArriereTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer les permissions nécessaires
        Permission::firstOrCreate(['name' => 'voir_arrieres']);
        Permission::firstOrCreate(['name' => 'ajouter_arrieres']);
        Permission::firstOrCreate(['name' => 'modifier_arrieres']);
        Permission::firstOrCreate(['name' => 'supprimer_arrieres']);
        Permission::firstOrCreate(['name' => 'encaisser_arrieres']);

        $role = Role::firstOrCreate(['name' => 'comptable']);
        $role->givePermissionTo([
            'voir_arrieres',
            'ajouter_arrieres',
            'modifier_arrieres',
            'supprimer_arrieres',
            'encaisser_arrieres',
        ]);

        $this->user = User::factory()->create([
            'nom' => 'Comptable',
            'prenom' => 'Test',
            'email' => 'comptable@buyedi.ga',
        ]);
        $this->user->assignRole('comptable');
    }

    public function test_can_access_arrieres_index(): void
    {
        $response = $this->actingAs($this->user)->get(route('arrieres.index'));
        $response->assertStatus(200);
    }

    public function test_can_search_students_asynchronously(): void
    {
        $studentUser = User::factory()->create([
            'nom' => 'MBOUMBA',
            'prenom' => 'Patrick',
        ]);

        Eleve::create([
            'user_id' => $studentUser->id,
            'matricule' => 'EL-2025-PAT99',
            'sexe' => 'M',
        ]);

        $response = $this->actingAs($this->user)->getJson(route('arrieres.search-eleves', ['q' => 'MBOUMBA']));

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'nom' => 'MBOUMBA',
            'prenom' => 'Patrick',
            'matricule' => 'EL-2025-PAT99',
        ]);
    }

    public function test_can_create_an_arriere_record(): void
    {
        $payload = [
            'nom_eleve' => 'ONDO',
            'prenom_eleve' => 'Michel',
            'classe_origine' => 'Terminale A1',
            'annee_scolaire_dette' => '2023-2024',
            'montant_total' => 150000,
            'observations' => 'Arriéré non soldé.',
        ];

        $response = $this->actingAs($this->user)->post(route('arrieres.store'), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('arrieres', [
            'nom_eleve' => 'ONDO',
            'prenom_eleve' => 'Michel',
            'annee_scolaire_dette' => '2023-2024',
            'montant_total' => 150000,
            'montant_paye' => 0,
            'montant_restant' => 150000,
            'statut' => 'non_solde',
        ]);

        // Vérifier la création automatique du FraisType lié
        $this->assertDatabaseHas('frais_types', [
            'nom' => "Arriéré de l'année 2023-2024",
        ]);
    }

    public function test_can_pay_an_arriere_and_generates_safe_receipt_number(): void
    {
        $fraisType = FraisType::create([
            'nom' => "Arriéré de l'année 2023-2024",
            'code' => 'arriere_2023-2024',
            'montant' => 0,
            'globale' => true,
            'is_scolarite' => false,
        ]);

        $arriere = Arriere::create([
            'nom_eleve' => 'BIYOGHE',
            'prenom_eleve' => 'Alain',
            'annee_scolaire_dette' => '2023-2024',
            'montant_total' => 100000,
            'montant_paye' => 0,
            'montant_restant' => 100000,
            'statut' => 'non_solde',
            'frais_type_id' => $fraisType->id,
            'created_by' => $this->user->id,
        ]);

        // 1. Versement partiel de 40 000 FCFA
        $response1 = $this->actingAs($this->user)->post(route('arrieres.payer', $arriere->id), [
            'montant' => 40000,
            'date_paiement' => now()->format('Y-m-d'),
            'mode_paiement' => 'especes',
            'commentaire' => 'Premier acompte',
        ]);

        $response1->assertRedirect();

        $arriere->refresh();
        $this->assertEquals(40000, (float) $arriere->montant_paye);
        $this->assertEquals(60000, (float) $arriere->montant_restant);
        $this->assertEquals('partiellement_solde', $arriere->statut);

        // Vérifier le versement créé et son reçu au bon format sans collision
        $paiement1 = ArrierePaiement::where('arriere_id', $arriere->id)->first();
        $this->assertNotNull($paiement1);
        $this->assertStringStartsWith('REC-ARR-', $paiement1->numero_recu);
        $this->assertEquals(str_pad($paiement1->id, 6, '0', STR_PAD_LEFT), substr($paiement1->numero_recu, 8));

        // Vérifier l'intégration dans la table comptable globale 'paiements'
        $this->assertDatabaseHas('paiements', [
            'arriere_paiement_id' => $paiement1->id,
            'montant' => 40000,
            'mois' => 'Arriéré 2023-2024',
        ]);

        // 2. Solde du reste dû (60 000 FCFA)
        $response2 = $this->actingAs($this->user)->post(route('arrieres.payer', $arriere->id), [
            'montant' => 60000,
            'date_paiement' => now()->format('Y-m-d'),
            'mode_paiement' => 'mobile',
            'reference_paiement' => 'AIRTEL-982187',
        ]);

        $response2->assertRedirect();

        $arriere->refresh();
        $this->assertEquals(100000, (float) $arriere->montant_paye);
        $this->assertEquals(0, (float) $arriere->montant_restant);
        $this->assertEquals('solde', $arriere->statut);
    }
}

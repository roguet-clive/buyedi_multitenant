<?php

namespace Tests\Feature;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\FraisType;
use App\Models\Inscription;
use App\Models\Paiement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PaiementConsolidationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected AnneeScolaire $annee;
    protected Classe $classe;
    protected Eleve $eleve;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::firstOrCreate(['name' => 'voir_paiements']);
        Permission::firstOrCreate(['name' => 'ajouter_paiements']);
        Permission::firstOrCreate(['name' => 'voir_inscriptions']);
        Permission::firstOrCreate(['name' => 'ajouter_inscriptions']);

        $role = Role::firstOrCreate(['name' => 'directeur']);
        $role->givePermissionTo([
            'voir_paiements',
            'ajouter_paiements',
            'voir_inscriptions',
            'ajouter_inscriptions',
        ]);

        $this->admin = User::factory()->create([
            'nom' => 'Directeur',
            'prenom' => 'Comptable',
            'email' => 'compta@buyedi.ga',
        ]);
        $this->admin->assignRole('directeur');

        $this->annee = AnneeScolaire::create([
            'nom' => '2026-2027',
            'date_debut' => '2026-09-01',
            'date_fin' => '2027-06-30',
            'en_cours' => true,
        ]);

        $this->classe = Classe::create([
            'nom' => 'CP1 A',
            'type' => 'primaire',
        ]);

        $studentUser = User::factory()->create([
            'nom' => 'Mba',
            'prenom' => 'Jean',
        ]);

        $this->eleve = Eleve::create([
            'user_id' => $studentUser->id,
            'matricule' => 'BUY-2026-0001',
            'date_naissance' => '2019-01-01',
            'sexe' => 'M',
            'statut' => 'actif',
        ]);
    }

    public function test_inscription_payments_share_same_reference_recu(): void
    {
        $fraisInsc = FraisType::firstOrCreate(['code' => 'inscription'], ['nom' => "Frais d'Inscription", 'montant' => 10000, 'globale' => true]);
        $fraisTenue = FraisType::firstOrCreate(['code' => 'tenue'], ['nom' => 'Tenue Scolaire', 'montant' => 10000, 'globale' => true]);
        $fraisCarte = FraisType::firstOrCreate(['code' => 'carte'], ['nom' => "Carte d'Identité Scolaire", 'montant' => 2000, 'globale' => true]);

        $response = $this->actingAs($this->admin)->post(route('inscriptions.store'), [
            'eleve_id' => $this->eleve->id,
            'classe_id' => $this->classe->id,
            'date_inscription' => '2026-09-09',
            'admission_type' => 'inscription',
            'statut' => 'validee',
            'frais' => [
                $fraisInsc->id => ['selected' => true, 'montant' => 10000],
                $fraisTenue->id => ['selected' => true, 'montant' => 10000],
                $fraisCarte->id => ['selected' => true, 'montant' => 2000],
            ],
            'mode_paiement' => 'especes',
        ]);

        $response->assertRedirect();

        $inscription = Inscription::first();
        $this->assertNotNull($inscription);
        $this->assertNotEmpty($inscription->numero_recu);

        $paiements = Paiement::where('inscription_id', $inscription->id)->get();
        $this->assertCount(3, $paiements);

        // All 3 payments share the exact same reference_recu
        foreach ($paiements as $p) {
            $this->assertEquals($inscription->numero_recu, $p->reference_recu);
        }

        // Check paiements index stats
        $indexResponse = $this->actingAs($this->admin)->get(route('paiements.index', [
            'annee_scolaire_id' => $this->annee->id,
        ]));

        $indexResponse->assertOk();
        $stats = $indexResponse->viewData('page')['props']['stats'];

        $this->assertEquals(22000, $stats['total_annee']);
        $this->assertEquals(1, $stats['nb_operations']);
        $this->assertEquals(3, $stats['nb_flux']);
    }

    public function test_standalone_payment_gets_generated_reference_recu(): void
    {
        $fraisScol = FraisType::firstOrCreate(['code' => 'scolarite'], ['nom' => 'Scolarité Septembre', 'montant' => 15000, 'globale' => true, 'is_scolarite' => true]);

        $inscription = Inscription::create([
            'eleve_id' => $this->eleve->id,
            'classe_id' => $this->classe->id,
            'annee_scolaire_id' => $this->annee->id,
            'date_inscription' => '2026-09-01',
            'admission_type' => 'inscription',
            'statut' => 'validee',
            'total_frais' => 15000,
            'frais_payes' => 0,
            'reste_a_payer' => 15000,
            'numero_recu' => 'REC-20260901-TEST',
            'code_securite' => 'SEC123',
        ]);

        $response = $this->actingAs($this->admin)->post(route('paiements.store'), [
            'inscription_id' => $inscription->id,
            'frais_type_id' => $fraisScol->id,
            'montant' => 15000,
            'mode_paiement' => 'especes',
            'date_paiement' => '2026-09-09',
            'mois' => 'Septembre',
        ]);

        $response->assertRedirect();

        $paiement = Paiement::where('frais_type_id', $fraisScol->id)->first();
        $this->assertNotNull($paiement);
        $this->assertNotEmpty($paiement->reference_recu);
        $this->assertStringStartsWith('REC-', $paiement->reference_recu);
    }
}

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

class InscriptionApeTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected AnneeScolaire $anneeEnCours;
    protected FraisType $fraisApe;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::firstOrCreate(['name' => 'ajouter_inscriptions']);
        Permission::firstOrCreate(['name' => 'voir_inscriptions']);
        $role = Role::firstOrCreate(['name' => 'admin']);
        $role->givePermissionTo(['ajouter_inscriptions', 'voir_inscriptions']);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->anneeEnCours = AnneeScolaire::create([
            'nom' => '2026-2027',
            'date_debut' => '2026-09-01',
            'date_fin' => '2027-06-30',
            'en_cours' => true,
        ]);

        $this->fraisApe = FraisType::firstOrCreate(
            ['nom' => 'APE'],
            ['code' => 'ape', 'montant' => 2000.00, 'globale' => true, 'is_scolarite' => false]
        );

        FraisType::firstOrCreate(
            ['code' => 'inscription'],
            ['nom' => "Frais d'Inscription", 'montant' => 10000.00, 'globale' => true, 'is_scolarite' => false]
        );
        FraisType::firstOrCreate(
            ['code' => 'scolarite'],
            ['nom' => "Scolarité", 'montant' => 0.00, 'globale' => true, 'is_scolarite' => true]
        );
    }

    public function test_ape_is_strictly_fixed_to_2000_fcfa_in_primaire(): void
    {
        $classePrimaire = Classe::create([
            'nom' => 'CM2 A',
            'type' => 'primaire',
            'niveau' => 'CM2',
            'montant_scolarite' => 135000,
            'montant_tenue' => 10000,
            'montant_bulletin' => 1000,
        ]);

        $eleveUser = User::factory()->create();
        $eleve = Eleve::create([
            'user_id' => $eleveUser->id,
            'matricule' => 'EL-PRIM-01',
            'sexe' => 'M',
        ]);

        // Tentative d'envoyer 5000 FCFA dans la requête
        $response = $this->actingAs($this->admin)->post(route('inscriptions.store'), [
            'eleve_id' => $eleve->id,
            'classe_id' => $classePrimaire->id,
            'date_inscription' => now()->format('Y-m-d'),
            'admission_type' => 'inscription',
            'statut' => 'validee',
            'frais' => [
                $this->fraisApe->id => [
                    'selected' => true,
                    'montant' => 5000, // Forcé à 5000 dans la requête
                ],
            ],
        ]);

        $response->assertRedirect(route('inscriptions.index'));

        $inscription = Inscription::where('eleve_id', $eleve->id)->first();
        $this->assertNotNull($inscription);

        // Le paiement APE doit être STRICTEMENT de 2000 FCFA
        $paiementApe = Paiement::where('inscription_id', $inscription->id)
            ->where('frais_type_id', $this->fraisApe->id)
            ->first();

        $this->assertNotNull($paiementApe, 'Le paiement APE doit exister');
        $this->assertEquals(2000.0, (float) $paiementApe->montant, 'Le montant de l\'APE doit être verrouillé à 2000 FCFA');
    }

    public function test_ape_is_strictly_fixed_to_2000_fcfa_in_secondaire(): void
    {
        $classeSecondaire = Classe::create([
            'nom' => '6ème A',
            'type' => 'secondaire',
            'niveau' => '6eme',
            'montant_scolarite' => 200000,
            'montant_tenue' => 15000,
            'montant_bulletin' => 0,
        ]);

        $eleveUser = User::factory()->create();
        $eleve = Eleve::create([
            'user_id' => $eleveUser->id,
            'matricule' => 'EL-SEC-01',
            'sexe' => 'F',
        ]);

        // Tentative d'envoyer 10 000 FCFA dans la requête
        $response = $this->actingAs($this->admin)->post(route('inscriptions.store'), [
            'eleve_id' => $eleve->id,
            'classe_id' => $classeSecondaire->id,
            'date_inscription' => now()->format('Y-m-d'),
            'admission_type' => 'inscription',
            'statut' => 'validee',
            'frais' => [
                $this->fraisApe->id => [
                    'selected' => true,
                    'montant' => 10000, // Forcé à 10000 dans la requête
                ],
            ],
        ]);

        $response->assertRedirect(route('inscriptions.index'));

        $inscription = Inscription::where('eleve_id', $eleve->id)->first();
        $this->assertNotNull($inscription);

        // Forfait secondaire (70 000 F) + APE (2 000 F) = 72 000 F total
        $paiementApe = Paiement::where('inscription_id', $inscription->id)
            ->where('frais_type_id', $this->fraisApe->id)
            ->first();

        $this->assertNotNull($paiementApe, 'Le paiement APE doit exister');
        $this->assertEquals(2000.0, (float) $inscription->total_frais, 'Total frais = APE 2 000 FCFA (grille uniforme sans forfait obligatoire)');
    }

    public function test_ape_is_strictly_fixed_to_2000_fcfa_on_update(): void
    {
        Permission::firstOrCreate(['name' => 'modifier_inscriptions']);
        $this->admin->givePermissionTo('modifier_inscriptions');

        $classe = Classe::create([
            'nom' => '5ème A',
            'type' => 'secondaire',
            'niveau' => '5eme',
            'montant_scolarite' => 220000,
            'montant_tenue' => 15000,
            'montant_bulletin' => 0,
        ]);

        $eleveUser = User::factory()->create();
        $eleve = Eleve::create([
            'user_id' => $eleveUser->id,
            'matricule' => 'EL-SEC-UPDATE',
            'sexe' => 'M',
        ]);

        $inscription = Inscription::create([
            'eleve_id' => $eleve->id,
            'classe_id' => $classe->id,
            'annee_scolaire_id' => $this->anneeEnCours->id,
            'date_inscription' => now(),
            'total_frais' => 70000,
            'numero_recu' => 'REC-UPDATE-001',
            'code_securite' => 'SEC-001',
            'reinscription' => false,
            'has_remise' => false,
            'statut' => 'validee',
        ]);

        // Mise à jour de l'inscription en cochant l'APE avec un montant erroné de 9 000 F
        $response = $this->actingAs($this->admin)->put(route('inscriptions.update', $inscription->id), [
            'eleve_id' => $eleve->id,
            'classe_id' => $classe->id,
            'date_inscription' => now()->format('Y-m-d'),
            'statut' => 'validee',
            'frais' => [
                $this->fraisApe->id => [
                    'selected' => true,
                    'montant' => 9000, // tentative de surcharger
                ],
            ],
        ]);

        $response->assertRedirect(route('inscriptions.index'));

        $paiementApe = Paiement::where('inscription_id', $inscription->id)
            ->where('frais_type_id', $this->fraisApe->id)
            ->first();

        $this->assertNotNull($paiementApe);
        $this->assertEquals(2000.0, (float) $paiementApe->montant, 'Lors de la mise à jour, l\'APE doit également être verrouillé à 2000 FCFA');
    }
}


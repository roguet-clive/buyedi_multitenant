<?php

namespace Tests\Feature;

use App\Models\Classe;
use App\Models\AnneeScolaire;
use App\Models\FraisClasse;
use App\Models\FraisEcheance;
use App\Models\FraisType;
use App\Models\Inscription;
use App\Models\Eleve;
use App\Models\Paiement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class FraisScolariteTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected AnneeScolaire $anneeScolaire;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::firstOrCreate(['name' => 'voir_frais_classes']);
        Permission::firstOrCreate(['name' => 'ajouter_frais_classes']);
        Permission::firstOrCreate(['name' => 'modifier_frais_classes']);
        Permission::firstOrCreate(['name' => 'supprimer_frais_classes']);
        Permission::firstOrCreate(['name' => 'voir_paiements']);
        Permission::firstOrCreate(['name' => 'ajouter_paiements']);

        $role = Role::firstOrCreate(['name' => 'admin']);
        $role->givePermissionTo([
            'voir_frais_classes',
            'ajouter_frais_classes',
            'modifier_frais_classes',
            'supprimer_frais_classes',
            'voir_paiements',
            'ajouter_paiements',
        ]);

        $this->admin = User::factory()->create([
            'nom' => 'Admin',
            'prenom' => 'Buyedi',
            'email' => 'admin@buyedi.ga',
        ]);
        $this->admin->assignRole('admin');

        $this->anneeScolaire = AnneeScolaire::create([
            'nom' => '2026-2027',
            'date_debut' => '2026-09-01',
            'date_fin' => '2027-06-30',
            'en_cours' => true,
        ]);
    }

    public function test_bareme_officiel_configures_creche_maternelle_primaire_and_secondaire(): void
    {
        $classeCreche13h = Classe::create(['nom' => 'Crèche (8h - 13h)', 'type' => 'creche']);
        $classeCreche16h = Classe::create(['nom' => 'Crèche (8h - 16h)', 'type' => 'creche']);
        $classeMaternelle = Classe::create(['nom' => 'Petite Section - 3 ans', 'type' => 'maternelle']);
        $classePrimaire1 = Classe::create(['nom' => '1ère Année', 'type' => 'primaire']);
        $classePrimaire4 = Classe::create(['nom' => '4ème Année', 'type' => 'primaire']);
        $classePrimaire5 = Classe::create(['nom' => '5ème Année', 'type' => 'primaire']);
        $classe6e = Classe::create(['nom' => '6e', 'type' => 'secondaire']);
        $classe3e = Classe::create(['nom' => '3e', 'type' => 'secondaire']);
        $classeTle = Classe::create(['nom' => 'Tle', 'type' => 'secondaire']);

        $response = $this->actingAs($this->admin)->post(route('frais_classes.appliquerBaremeOfficiel'));
        $response->assertRedirect(route('frais_classes.index'));
        $response->assertSessionHas('success');

        // 1. Crèche 13h : 180 000 FCFA total & 9 mensualités de 20 000 FCFA
        $fcCreche13h = FraisClasse::where('classe_id', $classeCreche13h->id)->first();
        $this->assertNotNull($fcCreche13h);
        $this->assertEquals(180000, (float) $fcCreche13h->montant);
        $this->assertCount(9, $fcCreche13h->echeances);
        $this->assertEquals(20000, (float) $fcCreche13h->echeances->first()->montant);

        // 2. Crèche 16h : 270 000 FCFA total & 9 mensualités de 30 000 FCFA
        $fcCreche16h = FraisClasse::where('classe_id', $classeCreche16h->id)->first();
        $this->assertNotNull($fcCreche16h);
        $this->assertEquals(270000, (float) $fcCreche16h->montant);
        $this->assertCount(9, $fcCreche16h->echeances);
        $this->assertEquals(30000, (float) $fcCreche16h->echeances->first()->montant);

        // 3. Maternelle : 180 000 FCFA total & 9 mensualités de 20 000 FCFA
        $fcMaternelle = FraisClasse::where('classe_id', $classeMaternelle->id)->first();
        $this->assertNotNull($fcMaternelle);
        $this->assertEquals(180000, (float) $fcMaternelle->montant);
        $this->assertCount(9, $fcMaternelle->echeances);
        $this->assertEquals(20000, (float) $fcMaternelle->echeances->first()->montant);
        $this->assertEquals('Septembre', $fcMaternelle->echeances->first()->nom);
        $this->assertEquals('Mai', $fcMaternelle->echeances->last()->nom);

        // 4. Primaire 1ère Année (1ère à 3ème) : 180 000 FCFA total & 9 mensualités de 20 000 FCFA
        $fcPrimaire1 = FraisClasse::where('classe_id', $classePrimaire1->id)->first();
        $this->assertNotNull($fcPrimaire1);
        $this->assertEquals(180000, (float) $fcPrimaire1->montant);
        $this->assertCount(9, $fcPrimaire1->echeances);
        $this->assertEquals(20000, (float) $fcPrimaire1->echeances->first()->montant);

        // 5. Primaire 4ème Année : 225 000 FCFA total & 9 mensualités de 25 000 FCFA
        $fcPrimaire4 = FraisClasse::where('classe_id', $classePrimaire4->id)->first();
        $this->assertNotNull($fcPrimaire4);
        $this->assertEquals(225000, (float) $fcPrimaire4->montant);
        $this->assertCount(9, $fcPrimaire4->echeances);
        $this->assertEquals(25000, (float) $fcPrimaire4->echeances->first()->montant);

        // 6. Primaire 5ème Année : 270 000 FCFA total & 9 mensualités de 30 000 FCFA
        $fcPrimaire5 = FraisClasse::where('classe_id', $classePrimaire5->id)->first();
        $this->assertNotNull($fcPrimaire5);
        $this->assertEquals(270000, (float) $fcPrimaire5->montant);
        $this->assertCount(9, $fcPrimaire5->echeances);
        $this->assertEquals(30000, (float) $fcPrimaire5->echeances->first()->montant);

        // 7. 6e (Secondaire Général) : 135 000 FCFA total (70k, 32.5k, 32.5k)
        $fc6e = FraisClasse::where('classe_id', $classe6e->id)->first();
        $this->assertNotNull($fc6e);
        $this->assertEquals(135000, (float) $fc6e->montant);
        $this->assertCount(3, $fc6e->echeances);
        $this->assertEquals(70000, (float) $fc6e->echeances[0]->montant);
        $this->assertEquals(32500, (float) $fc6e->echeances[1]->montant);
        $this->assertEquals(32500, (float) $fc6e->echeances[2]->montant);

        // 8. 3e (Classe d'examen) : 145 000 FCFA total (70k, 37.5k, 37.5k)
        $fc3e = FraisClasse::where('classe_id', $classe3e->id)->first();
        $this->assertNotNull($fc3e);
        $this->assertEquals(145000, (float) $fc3e->montant);
        $this->assertCount(3, $fc3e->echeances);
        $this->assertEquals(70000, (float) $fc3e->echeances[0]->montant);
        $this->assertEquals(37500, (float) $fc3e->echeances[1]->montant);
        $this->assertEquals(37500, (float) $fc3e->echeances[2]->montant);

        // 9. Terminale (Classe d'examen) : 145 000 FCFA total (70k, 37.5k, 37.5k)
        $fcTle = FraisClasse::where('classe_id', $classeTle->id)->first();
        $this->assertNotNull($fcTle);
        $this->assertEquals(145000, (float) $fcTle->montant);
        $this->assertCount(3, $fcTle->echeances);
        $this->assertEquals(70000, (float) $fcTle->echeances[0]->montant);
        $this->assertEquals(37500, (float) $fcTle->echeances[1]->montant);
        $this->assertEquals(37500, (float) $fcTle->echeances[2]->montant);
    }

    public function test_can_record_monthly_and_tranche_payments(): void
    {
        $fraisType = FraisType::create([
            'nom' => 'Scolarité',
            'code' => 'scolarite',
            'is_scolarite' => true,
            'globale' => true,
            'montant' => 0,
        ]);

        $classePrimaire = Classe::create(['nom' => '3ème Année', 'type' => 'primaire']);
        $classe6e = Classe::create(['nom' => '6e', 'type' => 'secondaire']);

        $userStudent1 = User::factory()->create();
        $elevePrimaire = Eleve::create([
            'user_id' => $userStudent1->id,
            'matricule' => 'BUY-PRI-001',
            'sexe' => 'M',
            'date_naissance' => '2018-05-12',
        ]);
        $inscriptionPrimaire = Inscription::create([
            'eleve_id' => $elevePrimaire->id,
            'classe_id' => $classePrimaire->id,
            'annee_scolaire_id' => $this->anneeScolaire->id,
            'date_inscription' => now(),
            'statut' => 'inscrit',
        ]);

        $userStudent2 = User::factory()->create();
        $eleveSecondaire = Eleve::create([
            'user_id' => $userStudent2->id,
            'matricule' => 'BUY-SEC-001',
            'sexe' => 'F',
            'date_naissance' => '2014-03-20',
        ]);
        $inscriptionSecondaire = Inscription::create([
            'eleve_id' => $eleveSecondaire->id,
            'classe_id' => $classe6e->id,
            'annee_scolaire_id' => $this->anneeScolaire->id,
            'date_inscription' => now(),
            'statut' => 'inscrit',
        ]);

        // 1. Encaissement Primaire : 2 mois de scolarité (Septembre, Octobre = 40 000 FCFA)
        $responsePrimaire = $this->actingAs($this->admin)->post(route('paiements.store'), [
            'inscription_id' => $inscriptionPrimaire->id,
            'frais_type_id' => $fraisType->id,
            'montant' => 40000,
            'mode_paiement' => 'especes',
            'mois' => 'Septembre, Octobre',
            'commentaire' => 'Scolarité (Septembre, Octobre)',
        ]);
        $responsePrimaire->assertRedirect();
        $this->assertDatabaseHas('paiements', [
            'inscription_id' => $inscriptionPrimaire->id,
            'montant' => 40000,
            'mois' => 'Septembre, Octobre',
        ]);

        // 2. Encaissement Secondaire : 1ère Tranche (70 000 FCFA)
        $responseSecondaire = $this->actingAs($this->admin)->post(route('paiements.store'), [
            'inscription_id' => $inscriptionSecondaire->id,
            'frais_type_id' => $fraisType->id,
            'montant' => 70000,
            'mode_paiement' => 'mobile',
            'mois' => '1ère Tranche',
            'commentaire' => 'Règlement 1ère Tranche Scolarité',
        ]);
        $responseSecondaire->assertRedirect();
        $this->assertDatabaseHas('paiements', [
            'inscription_id' => $inscriptionSecondaire->id,
            'montant' => 70000,
            'mois' => '1ère Tranche',
        ]);
    }

    public function test_frais_classes_index_renders_successfully_with_props(): void
    {
        Classe::create(['nom' => 'Crèche (8h - 13h)', 'type' => 'creche']);
        Classe::create(['nom' => 'Petite Section', 'type' => 'maternelle']);
        Classe::create(['nom' => '1ère Année', 'type' => 'primaire']);
        Classe::create(['nom' => '6e', 'type' => 'secondaire']);

        FraisType::create([
            'nom' => 'Scolarité',
            'code' => 'scolarite',
            'is_scolarite' => true,
            'globale' => true,
            'montant' => 0,
        ]);

        $response = $this->actingAs($this->admin)->get(route('frais_classes.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('FraisClasses/Index')
            ->has('sections', 4)
            ->has('fraisTypes', 1)
            ->has('currentSchoolYear')
        );
    }
}

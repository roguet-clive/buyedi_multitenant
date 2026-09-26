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

class InscriptionAdmissionTenueTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected AnneeScolaire $annee;
    protected Classe $classe;
    protected FraisType $fraisInscription;
    protected FraisType $fraisReinscription;
    protected FraisType $fraisTenue;
    protected FraisType $fraisBulletinAssurance;

    protected function setUp(): void
    {
        parent::setUp();

        // Permissions & Roles
        Permission::firstOrCreate(['name' => 'voir_inscriptions']);
        Permission::firstOrCreate(['name' => 'ajouter_inscriptions']);
        Permission::firstOrCreate(['name' => 'modifier_inscriptions']);
        Permission::firstOrCreate(['name' => 'supprimer_inscriptions']);
        Permission::firstOrCreate(['name' => 'voir_paiements']);
        Permission::firstOrCreate(['name' => 'ajouter_paiements']);

        $role = Role::firstOrCreate(['name' => 'directeur']);
        $role->givePermissionTo([
            'voir_inscriptions',
            'ajouter_inscriptions',
            'modifier_inscriptions',
            'supprimer_inscriptions',
            'voir_paiements',
            'ajouter_paiements',
        ]);

        $this->admin = User::factory()->create([
            'nom' => 'Directeur',
            'prenom' => 'Test',
            'email' => 'directeur@buyedi.ga',
        ]);
        $this->admin->assignRole('directeur');

        // Année scolaire en cours
        $this->annee = AnneeScolaire::create([
            'nom' => '2026-2027',
            'date_debut' => '2026-09-01',
            'date_fin' => '2027-06-30',
            'en_cours' => true,
        ]);

        // Classe
        $this->classe = Classe::create([
            'nom' => '6ème A',
            'type' => 'secondaire',
        ]);

        // FraisTypes harmonisés (aucun écart primaire/secondaire)
        $this->fraisInscription = FraisType::firstOrCreate(
            ['code' => 'inscription'],
            ['nom' => "Frais d'Inscription", 'montant' => 10000.00, 'is_scolarite' => false, 'globale' => true]
        );

        $this->fraisReinscription = FraisType::firstOrCreate(
            ['code' => 'reinscription'],
            ['nom' => 'Frais de Réinscription', 'montant' => 10000.00, 'is_scolarite' => false, 'globale' => true]
        );

        $this->fraisTenue = FraisType::firstOrCreate(
            ['code' => 'tenue'],
            ['nom' => 'Tenue Scolaire', 'montant' => 12000.00, 'is_scolarite' => false, 'globale' => true]
        );

        $this->fraisBulletinAssurance = FraisType::firstOrCreate(
            ['code' => 'bulletin_assurance'],
            ['nom' => 'Bulletin + Assurance', 'montant' => 5000.00, 'is_scolarite' => false, 'globale' => true]
        );
    }

    /**
     * Test 1 : Une nouvelle inscription (10 000 FCFA) exclut formellement les frais de réinscription (10 000 FCFA)
     */
    public function test_nouvelle_inscription_encaisse_10000_et_exclut_reinscription(): void
    {
        $user = User::factory()->create(['nom' => 'Mba', 'prenom' => 'Jean']);
        $eleve = Eleve::create([
            'user_id' => $user->id,
            'matricule' => 'EL-001',
            'sexe' => 'M',
            'date_naissance' => '2014-01-01',
            'lieu_naissance' => 'Libreville',
        ]);

        $payload = [
            'eleve_id' => $eleve->id,
            'classe_id' => $this->classe->id,
            'date_inscription' => '2026-09-04',
            'admission_type' => 'inscription',
            'statut' => 'validee',
            'frais' => [
                $this->fraisInscription->id => ['selected' => true, 'montant' => 10000],
                $this->fraisReinscription->id => ['selected' => true, 'montant' => 10000], // Tentative d'envoyer les 2
                $this->fraisTenue->id => ['selected' => true, 'montant' => 12000], // 12 000 FCFA tarif unique
            ],
        ];

        $response = $this->actingAs($this->admin)->post(route('inscriptions.store'), $payload);
        $response->assertRedirect(route('inscriptions.index'));

        $inscription = Inscription::where('eleve_id', $eleve->id)->first();
        $this->assertNotNull($inscription);
        $this->assertFalse($inscription->reinscription, 'L\'inscription doit avoir reinscription = false');

        // Vérification de l'exclusion mutuelle dans les paiements
        $paiements = Paiement::where('inscription_id', $inscription->id)->get();
        $hasInscription = $paiements->contains('frais_type_id', $this->fraisInscription->id);
        $hasReinscription = $paiements->contains('frais_type_id', $this->fraisReinscription->id);
        $hasTenue = $paiements->contains('frais_type_id', $this->fraisTenue->id);

        $this->assertTrue($hasInscription, 'Le paiement de 10 000 FCFA d\'inscription doit être enregistré');
        $this->assertFalse($hasReinscription, 'Le paiement de réinscription doit être exclu formellement');
        $this->assertTrue($hasTenue, 'La tenue doit être enregistrée car cochée');
        $this->assertEquals(22000, (float) $inscription->total_frais, 'Total frais = 10000 (inscription) + 12000 (tenue)');
        $this->assertTrue($inscription->tenue_payee, 'L\'attribut tenue_payee doit être true');
        $this->assertEquals(12000, (float) $inscription->montant_tenue_exigible);
        $this->assertEquals(0, (float) $inscription->reste_tenue);
    }

    /**
     * Test 2 : Une réinscription (10 000 FCFA) exclut formellement les frais d'inscription
     */
    public function test_reinscription_encaisse_10000_et_exclut_inscription(): void
    {
        $user = User::factory()->create(['nom' => 'Ondo', 'prenom' => 'Paul']);
        $eleve = Eleve::create([
            'user_id' => $user->id,
            'matricule' => 'EL-002',
            'sexe' => 'M',
            'date_naissance' => '2013-05-12',
            'lieu_naissance' => 'Oyem',
        ]);

        $payload = [
            'eleve_id' => $eleve->id,
            'classe_id' => $this->classe->id,
            'date_inscription' => '2026-09-04',
            'admission_type' => 'reinscription',
            'statut' => 'validee',
            'frais' => [
                $this->fraisInscription->id => ['selected' => true, 'montant' => 10000], // Même si envoyé
                $this->fraisReinscription->id => ['selected' => true, 'montant' => 10000],
                $this->fraisTenue->id => ['selected' => false, 'montant' => 12000], // Tenue non payée
            ],
        ];

        $response = $this->actingAs($this->admin)->post(route('inscriptions.store'), $payload);
        $response->assertRedirect(route('inscriptions.index'));

        $inscription = Inscription::where('eleve_id', $eleve->id)->first();
        $this->assertNotNull($inscription);
        $this->assertTrue($inscription->reinscription, 'L\'inscription doit avoir reinscription = true');

        $paiements = Paiement::where('inscription_id', $inscription->id)->get();
        $this->assertFalse($paiements->contains('frais_type_id', $this->fraisInscription->id), 'Inscription 10000 exclue');
        $this->assertTrue($paiements->contains('frais_type_id', $this->fraisReinscription->id), 'Réinscription 10000 enregistrée');
        $this->assertFalse($paiements->contains('frais_type_id', $this->fraisTenue->id), 'Tenue non payée');

        $this->assertEquals(10000, (float) $inscription->total_frais);
        $this->assertFalse($inscription->tenue_payee, 'L\'attribut tenue_payee doit être false car non réglée');
    }

    /**
     * Test 3 : Suivi de la tenue scolaire payée plus tard
     */
    public function test_tenue_scolaire_non_payee_a_l_inscription_puis_payee_plus_tard(): void
    {
        $user = User::factory()->create(['nom' => 'Biveghe', 'prenom' => 'Marc']);
        $eleve = Eleve::create([
            'user_id' => $user->id,
            'matricule' => 'EL-003',
            'sexe' => 'M',
            'date_naissance' => '2012-10-20',
            'lieu_naissance' => 'Port-Gentil',
        ]);

        // Inscription sans payer la tenue
        $payloadInscription = [
            'eleve_id' => $eleve->id,
            'classe_id' => $this->classe->id,
            'date_inscription' => '2026-09-04',
            'admission_type' => 'inscription',
            'statut' => 'validee',
            'frais' => [
                $this->fraisInscription->id => ['selected' => true, 'montant' => 10000],
                $this->fraisTenue->id => ['selected' => false, 'montant' => 12000],
            ],
        ];

        $this->actingAs($this->admin)->post(route('inscriptions.store'), $payloadInscription);

        $inscription = Inscription::where('eleve_id', $eleve->id)->first();
        $this->assertFalse($inscription->tenue_payee, 'Initialement, la tenue est impayée');

        // Le parent vient plus tard payer la tenue au guichet (12 000 FCFA)
        $payloadPaiementTenue = [
            'inscription_id' => $inscription->id,
            'frais_type_id' => $this->fraisTenue->id,
            'montant' => 12000,
            'mode_paiement' => 'especes',
            'date_paiement' => '2026-09-15',
            'commentaire' => 'Règlement Tenue Scolaire (Paiement différé)',
        ];

        $responsePaiement = $this->actingAs($this->admin)->post(route('paiements.store'), $payloadPaiementTenue);
        $responsePaiement->assertRedirect();

        // Rafraîchir l'inscription
        $inscription->refresh();
        $this->assertTrue($inscription->tenue_payee, 'Après paiement différé, tenue_payee doit être true');
        $this->assertNotNull($inscription->paiement_tenue, 'Le paiement de tenue est maintenant associé');
        $this->assertEquals(12000, (float) $inscription->paiement_tenue->montant);
    }

    /**
     * Test 4 : Tous les cycles ont un montant de tenue unifié à 12 000 FCFA
     */
    public function test_tenue_cycle_maternelle_primaire_et_secondaire_est_12000(): void
    {
        $classePrimaire = Classe::create(['nom' => 'CM2 A', 'type' => 'primaire']);
        $classeMaternelle = Classe::create(['nom' => 'Grande Section', 'type' => 'maternelle']);
        $classeSecondaire = Classe::create(['nom' => 'Terminale S', 'type' => 'secondaire']);

        $this->assertEquals(12000.0, (float) $classePrimaire->montant_tenue);
        $this->assertEquals(12000.0, (float) $classeMaternelle->montant_tenue);
        $this->assertEquals(12000.0, (float) $classeSecondaire->montant_tenue);

        $user = User::factory()->create(['nom' => 'Ngoua', 'prenom' => 'Alain']);
        $eleve = Eleve::create([
            'user_id' => $user->id,
            'matricule' => 'EL-PRIM-01',
            'sexe' => 'M',
            'date_naissance' => '2016-04-10',
            'lieu_naissance' => 'Oyem',
        ]);

        $inscription = Inscription::create([
            'eleve_id' => $eleve->id,
            'classe_id' => $classePrimaire->id,
            'annee_scolaire_id' => $this->annee->id,
            'date_inscription' => '2026-09-04',
            'total_frais' => 0,
            'statut' => 'validee',
        ]);

        $this->assertEquals(12000.0, (float) $inscription->montant_tenue_exigible);
        $this->assertEquals(12000.0, (float) $inscription->reste_tenue);
        $this->assertFalse($inscription->tenue_payee);
    }

    /**
     * Test 5 : Lors de l'enregistrement sans montant explicite, le tarif uniforme de 12 000 FCFA est appliqué
     */
    public function test_fallback_automatique_montant_tenue_uniforme(): void
    {
        $classePrimaire = Classe::create(['nom' => 'CE2 B', 'type' => 'primaire']);
        $classeSecondaire = Classe::create(['nom' => '3ème B', 'type' => 'secondaire']);

        // 1. Primaire sans montant explicite
        $user1 = User::factory()->create(['nom' => 'Prim', 'prenom' => 'Child']);
        $eleve1 = Eleve::create([
            'user_id' => $user1->id,
            'matricule' => 'EL-AUTO-1',
            'sexe' => 'M',
            'date_naissance' => '2017-01-01',
            'lieu_naissance' => 'Libreville',
        ]);

        $this->actingAs($this->admin)->post(route('inscriptions.store'), [
            'eleve_id' => $eleve1->id,
            'classe_id' => $classePrimaire->id,
            'admission_type' => 'inscription',
            'statut' => 'validee',
            'frais' => [
                $this->fraisInscription->id => ['selected' => true, 'montant' => 10000],
                $this->fraisTenue->id => ['selected' => true, 'montant' => null],
            ],
        ]);

        $insc1 = Inscription::where('eleve_id', $eleve1->id)->first();
        $this->assertNotNull($insc1);
        $pTenue1 = Paiement::where('inscription_id', $insc1->id)->where('frais_type_id', $this->fraisTenue->id)->first();
        $this->assertNotNull($pTenue1);
        $this->assertEquals(12000.0, (float) $pTenue1->montant, 'Le montant de la tenue doit être 12 000 FCFA pour primaire');

        // 2. Secondaire sans montant explicite
        $user2 = User::factory()->create(['nom' => 'Sec', 'prenom' => 'Student']);
        $eleve2 = Eleve::create([
            'user_id' => $user2->id,
            'matricule' => 'EL-AUTO-2',
            'sexe' => 'F',
            'date_naissance' => '2011-01-01',
            'lieu_naissance' => 'Libreville',
        ]);

        $this->actingAs($this->admin)->post(route('inscriptions.store'), [
            'eleve_id' => $eleve2->id,
            'classe_id' => $classeSecondaire->id,
            'admission_type' => 'inscription',
            'statut' => 'validee',
            'frais' => [
                $this->fraisInscription->id => ['selected' => true, 'montant' => 10000],
                $this->fraisTenue->id => ['selected' => true, 'montant' => null],
            ],
        ]);

        $insc2 = Inscription::where('eleve_id', $eleve2->id)->first();
        $this->assertNotNull($insc2);
        $pTenue2 = Paiement::where('inscription_id', $insc2->id)->where('frais_type_id', $this->fraisTenue->id)->first();
        $this->assertNotNull($pTenue2);
        $this->assertEquals(12000.0, (float) $pTenue2->montant, 'Le montant de la tenue doit être 12 000 FCFA pour secondaire');
    }

    /**
     * Test 6 : Vérifier qu'aucune remise de 50% n'est accordée à l'inscription (montant 100% plein)
     */
    public function test_aucune_remise_a_l_inscription(): void
    {
        $user = User::factory()->create(['nom' => 'InscSansRemise', 'prenom' => 'PleinTarif']);
        $eleve = Eleve::create([
            'user_id' => $user->id,
            'matricule' => 'EL-SANS-REMISE',
            'sexe' => 'M',
            'date_naissance' => '2015-05-15',
            'lieu_naissance' => 'Libreville',
        ]);

        $payload = [
            'eleve_id' => $eleve->id,
            'classe_id' => $this->classe->id,
            'date_inscription' => '2026-09-04',
            'admission_type' => 'inscription',
            'has_remise' => true,
            'remise_pourcentage' => 50,
            'remise_montant' => 5000,
            'statut' => 'validee',
            'frais' => [
                $this->fraisInscription->id => ['selected' => true, 'montant' => 10000],
                $this->fraisTenue->id => ['selected' => true, 'montant' => 12000],
            ],
        ];

        $response = $this->actingAs($this->admin)->post(route('inscriptions.store'), $payload);
        $response->assertRedirect(route('inscriptions.index'));

        $inscription = Inscription::where('eleve_id', $eleve->id)->first();
        $this->assertNotNull($inscription);
        $this->assertEquals(22000.0, (float) $inscription->total_frais, 'Les frais annexes d\'inscription ne subissent aucune remise');

        $pInscription = Paiement::where('inscription_id', $inscription->id)->where('frais_type_id', $this->fraisInscription->id)->first();
        $this->assertNotNull($pInscription);
        $this->assertEquals(10000.0, (float) $pInscription->montant, 'L\'inscription est toujours au tarif plein de 10 000 FCFA sans remise');

        $pTenue = Paiement::where('inscription_id', $inscription->id)->where('frais_type_id', $this->fraisTenue->id)->first();
        $this->assertNotNull($pTenue);
        $this->assertEquals(12000.0, (float) $pTenue->montant);
        $this->assertTrue($inscription->tenue_payee);
    }

    /**
     * Test 7 : Vérifier que les frais de réinscription ne subissent aucune remise (10 000 FCFA plein)
     */
    public function test_reinscription_refuse_toute_remise(): void
    {
        $user = User::factory()->create(['nom' => 'Reinscr', 'prenom' => 'RemiseRefus']);
        $eleve = Eleve::create([
            'user_id' => $user->id,
            'matricule' => 'EL-REINSC-02',
            'sexe' => 'F',
            'date_naissance' => '2014-06-10',
            'lieu_naissance' => 'Port-Gentil',
        ]);

        $payload = [
            'eleve_id' => $eleve->id,
            'classe_id' => $this->classe->id,
            'date_inscription' => '2026-09-04',
            'admission_type' => 'reinscription',
            'has_remise' => true,
            'remise_pourcentage' => 50,
            'remise_montant' => 5000,
            'statut' => 'validee',
            'frais' => [
                $this->fraisReinscription->id => ['selected' => true, 'montant' => 10000],
            ],
        ];

        $response = $this->actingAs($this->admin)->post(route('inscriptions.store'), $payload);
        $response->assertRedirect(route('inscriptions.index'));

        $inscription = Inscription::where('eleve_id', $eleve->id)->first();
        $this->assertNotNull($inscription);
        $this->assertTrue($inscription->reinscription);
        $this->assertEquals(10000.0, (float)$inscription->total_frais, 'Les frais de réinscription restent strictement à 10 000 FCFA sans réduction');
    }

    /**
     * Test 8 : Bulletin + Assurance est facturé à 5 000 FCFA pour tous les cycles
     */
    public function test_bulletin_assurance_est_5000_tous_cycles(): void
    {
        $classePrimaire = Classe::create(['nom' => 'CM1 A', 'type' => 'primaire']);
        $classeSecondaire = Classe::create(['nom' => '5ème B', 'type' => 'secondaire']);

        $this->assertEquals(5000.0, (float) $classePrimaire->montant_bulletin);
        $this->assertEquals(5000.0, (float) $classeSecondaire->montant_bulletin);

        $user = User::factory()->create(['nom' => 'Sec', 'prenom' => 'EleveBulletin']);
        $eleve = Eleve::create([
            'user_id' => $user->id,
            'matricule' => 'EL-SEC-01',
            'sexe' => 'M',
            'date_naissance' => '2012-05-15',
            'lieu_naissance' => 'Libreville',
        ]);

        $payload = [
            'eleve_id' => $eleve->id,
            'classe_id' => $classeSecondaire->id,
            'date_inscription' => '2026-09-04',
            'admission_type' => 'inscription',
            'has_remise' => false,
            'remise_pourcentage' => 0,
            'remise_montant' => 0,
            'statut' => 'validee',
            'frais' => [
                $this->fraisInscription->id => ['selected' => true, 'montant' => 10000],
                $this->fraisBulletinAssurance->id => ['selected' => true, 'montant' => 5000],
            ],
        ];

        $response = $this->actingAs($this->admin)->post(route('inscriptions.store'), $payload);
        $response->assertRedirect(route('inscriptions.index'));

        $inscription = Inscription::where('eleve_id', $eleve->id)->first();
        $this->assertNotNull($inscription);
        // 10 000 F d'inscription + 5 000 F Bulletin+Assurance = 15 000 F
        $this->assertEquals(15000.0, (float) $inscription->total_frais);

        $pBulletinAssurance = Paiement::where('inscription_id', $inscription->id)
            ->where('frais_type_id', $this->fraisBulletinAssurance->id)
            ->first();
        $this->assertNotNull($pBulletinAssurance);
        $this->assertEquals(5000.0, (float) $pBulletinAssurance->montant);
    }
}

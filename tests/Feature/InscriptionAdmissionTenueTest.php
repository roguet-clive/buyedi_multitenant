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

        // FraisTypes
        $this->fraisInscription = FraisType::firstOrCreate(
            ['code' => 'inscription'],
            ['nom' => "Frais d'Inscription", 'montant' => 10000.00, 'is_scolarite' => false, 'globale' => true]
        );

        $this->fraisReinscription = FraisType::firstOrCreate(
            ['code' => 'reinscription'],
            ['nom' => 'Frais de Réinscription', 'montant' => 5000.00, 'is_scolarite' => false, 'globale' => true]
        );

        $this->fraisTenue = FraisType::firstOrCreate(
            ['code' => 'tenue'],
            ['nom' => 'Tenue Scolaire', 'montant' => 10000.00, 'is_scolarite' => false, 'globale' => true]
        );
    }

    /**
     * Test 1 : Une nouvelle inscription (10 000 FCFA) exclut formellement les frais de réinscription (5 000 FCFA)
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
                $this->fraisReinscription->id => ['selected' => true, 'montant' => 5000], // Tentative d'envoyer les 2
                $this->fraisTenue->id => ['selected' => true, 'montant' => 15000], // 15 000 FCFA pour Secondaire
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
        $this->assertEquals(25000, (float) $inscription->total_frais, 'Total frais = 10000 (inscription) + 15000 (tenue secondaire)');
        $this->assertTrue($inscription->tenue_payee, 'L\'attribut tenue_payee doit être true');
        $this->assertEquals(15000, (float) $inscription->montant_tenue_exigible);
        $this->assertEquals(0, (float) $inscription->reste_tenue);
    }

    /**
     * Test 2 : Une réinscription (5 000 FCFA) exclut formellement les frais d'inscription (10 000 FCFA)
     */
    public function test_reinscription_encaisse_5000_et_exclut_inscription(): void
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
                $this->fraisReinscription->id => ['selected' => true, 'montant' => 5000],
                $this->fraisTenue->id => ['selected' => false, 'montant' => 10000], // Tenue non payée
            ],
        ];

        $response = $this->actingAs($this->admin)->post(route('inscriptions.store'), $payload);
        $response->assertRedirect(route('inscriptions.index'));

        $inscription = Inscription::where('eleve_id', $eleve->id)->first();
        $this->assertNotNull($inscription);
        $this->assertTrue($inscription->reinscription, 'L\'inscription doit avoir reinscription = true');

        $paiements = Paiement::where('inscription_id', $inscription->id)->get();
        $this->assertFalse($paiements->contains('frais_type_id', $this->fraisInscription->id), 'Inscription 10000 exclue');
        $this->assertTrue($paiements->contains('frais_type_id', $this->fraisReinscription->id), 'Réinscription 5000 enregistrée');
        $this->assertFalse($paiements->contains('frais_type_id', $this->fraisTenue->id), 'Tenue non payée');

        $this->assertEquals(5000, (float) $inscription->total_frais);
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
                $this->fraisTenue->id => ['selected' => false, 'montant' => 10000],
            ],
        ];

        $this->actingAs($this->admin)->post(route('inscriptions.store'), $payloadInscription);

        $inscription = Inscription::where('eleve_id', $eleve->id)->first();
        $this->assertFalse($inscription->tenue_payee, 'Initialement, la tenue est impayée');

        // Le parent vient plus tard payer la tenue au guichet
        $payloadPaiementTenue = [
            'inscription_id' => $inscription->id,
            'frais_type_id' => $this->fraisTenue->id,
            'montant' => 10000,
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
        $this->assertEquals(10000, (float) $inscription->paiement_tenue->montant);
    }

    /**
     * Test 4 : Maternelle & Primaire ont un montant de tenue à 10 000 FCFA
     */
    public function test_tenue_cycle_maternelle_primaire_est_10000(): void
    {
        $classePrimaire = Classe::create([
            'nom' => 'CM2 A',
            'type' => 'primaire',
        ]);
        $this->assertEquals(10000.0, (float) $classePrimaire->montant_tenue);

        $classeMaternelle = Classe::create([
            'nom' => 'Grande Section',
            'type' => 'maternelle',
        ]);
        $this->assertEquals(10000.0, (float) $classeMaternelle->montant_tenue);

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

        $this->assertEquals(10000.0, (float) $inscription->montant_tenue_exigible);
        $this->assertEquals(10000.0, (float) $inscription->reste_tenue);
        $this->assertFalse($inscription->tenue_payee);
    }

    /**
     * Test 5 : Tout le Secondaire (6e à Terminale) a un montant de tenue à 15 000 FCFA
     */
    public function test_tenue_cycle_secondaire_est_15000(): void
    {
        $classeSecondaire = Classe::create([
            'nom' => 'Terminale S',
            'type' => 'secondaire',
        ]);
        $this->assertEquals(15000.0, (float) $classeSecondaire->montant_tenue);

        $user = User::factory()->create(['nom' => 'Kombila', 'prenom' => 'Grace']);
        $eleve = Eleve::create([
            'user_id' => $user->id,
            'matricule' => 'EL-SEC-01',
            'sexe' => 'F',
            'date_naissance' => '2009-08-15',
            'lieu_naissance' => 'Franceville',
        ]);

        $inscription = Inscription::create([
            'eleve_id' => $eleve->id,
            'classe_id' => $classeSecondaire->id,
            'annee_scolaire_id' => $this->annee->id,
            'date_inscription' => '2026-09-04',
            'total_frais' => 0,
            'statut' => 'validee',
        ]);

        $this->assertEquals(15000.0, (float) $inscription->montant_tenue_exigible);
        $this->assertEquals(15000.0, (float) $inscription->reste_tenue);
        $this->assertFalse($inscription->tenue_payee);

        // Paiement complet de 15 000 FCFA
        Paiement::create([
            'inscription_id' => $inscription->id,
            'frais_type_id' => $this->fraisTenue->id,
            'user_id' => $this->admin->id,
            'montant' => 15000,
            'date_paiement' => '2026-09-04',
            'mode_paiement' => 'especes',
        ]);

        $inscription->refresh();
        $this->assertTrue($inscription->tenue_payee);
        $this->assertEquals(0.0, (float) $inscription->reste_tenue);
    }

    /**
     * Test 6 : Lors de l'enregistrement sans montant explicite, le contrôleur applique 15000 F en secondaire et 10000 F en primaire
     */
    public function test_fallback_automatique_montant_tenue_selon_cycle(): void
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
                $this->fraisTenue->id => ['selected' => true, 'montant' => null], // pas de montant fourni
            ],
        ]);

        $insc1 = Inscription::where('eleve_id', $eleve1->id)->first();
        $this->assertNotNull($insc1);
        $pTenue1 = Paiement::where('inscription_id', $insc1->id)->where('frais_type_id', $this->fraisTenue->id)->first();
        $this->assertNotNull($pTenue1);
        $this->assertEquals(10000.0, (float) $pTenue1->montant, 'Le fallback primaire doit être 10 000 FCFA');

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
                $this->fraisTenue->id => ['selected' => true, 'montant' => null], // pas de montant fourni
            ],
        ]);

        $insc2 = Inscription::where('eleve_id', $eleve2->id)->first();
        $this->assertNotNull($insc2);
        $pTenue2 = Paiement::where('inscription_id', $insc2->id)->where('frais_type_id', $this->fraisTenue->id)->first();
        $this->assertNotNull($pTenue2);
        $this->assertEquals(15000.0, (float) $pTenue2->montant, 'Le fallback secondaire doit être 15 000 FCFA');
    }

    /**
     * Test 7 : Application d'une remise de 50% STRICTEMENT sur les frais d'inscription (10 000 -> 5 000), nulle part ailleurs
     */
    public function test_application_remise_50_pourcent_inscription_uniquement(): void
    {
        $user = User::factory()->create(['nom' => 'Remise', 'prenom' => 'Test']);
        $eleve = Eleve::create([
            'user_id' => $user->id,
            'matricule' => 'EL-REM-50',
            'sexe' => 'M',
            'date_naissance' => '2015-02-14',
            'lieu_naissance' => 'Libreville',
        ]);

        // Inscription en 6ème (secondaire : Inscription standard 10 000, Tenue standard 15 000 = Brut 25 000)
        // Avec remise de 50% sur l'inscription UNIQUEMENT : Inscription = 5 000 F, Tenue = 15 000 F (pleine), Total net = 20 000 F, Économie = 5 000 F
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
                $this->fraisInscription->id => ['selected' => true, 'montant' => 5000],
                $this->fraisTenue->id => ['selected' => true, 'montant' => 15000],
            ],
        ];

        $response = $this->actingAs($this->admin)->post(route('inscriptions.store'), $payload);
        $response->assertRedirect(route('inscriptions.index'));

        $inscription = Inscription::where('eleve_id', $eleve->id)->first();
        $this->assertNotNull($inscription);
        $this->assertTrue($inscription->has_remise);
        $this->assertEquals(50.0, (float) $inscription->remise_pourcentage);
        $this->assertEquals(5000.0, (float) $inscription->remise_montant);
        $this->assertEquals(20000.0, (float) $inscription->total_frais);

        // Vérifier les paiements individuels : Inscription remisée à 5 000 F, Tenue reste à 15 000 F
        $pInscription = Paiement::where('inscription_id', $inscription->id)->where('frais_type_id', $this->fraisInscription->id)->first();
        $this->assertNotNull($pInscription);
        $this->assertEquals(5000.0, (float) $pInscription->montant);

        $pTenue = Paiement::where('inscription_id', $inscription->id)->where('frais_type_id', $this->fraisTenue->id)->first();
        $this->assertNotNull($pTenue);
        $this->assertEquals(15000.0, (float) $pTenue->montant);
        $this->assertTrue($inscription->tenue_payee);
    }

    /**
     * Test 8 : Vérifier que la réinscription ne peut JAMAIS avoir de remise
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
            'has_remise' => true, // Tentative frauduleuse ou accidentelle d'activer la remise
            'remise_pourcentage' => 50,
            'remise_montant' => 2500,
            'statut' => 'validee',
            'frais' => [
                $this->fraisReinscription->id => ['selected' => true, 'montant' => 5000],
            ],
        ];

        $response = $this->actingAs($this->admin)->post(route('inscriptions.store'), $payload);
        $response->assertRedirect(route('inscriptions.index'));

        $inscription = Inscription::where('eleve_id', $eleve->id)->first();
        $this->assertNotNull($inscription);
        $this->assertTrue($inscription->reinscription);
        $this->assertFalse((bool)$inscription->has_remise, 'La remise doit être strictement désactivée en réinscription');
        $this->assertEquals(0.0, (float)$inscription->remise_montant);
        $this->assertEquals(5000.0, (float)$inscription->total_frais);
    }
}

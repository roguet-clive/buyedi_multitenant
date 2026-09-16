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

class JournalCaisseParClasseTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected AnneeScolaire $annee;
    protected Classe $classeA;
    protected Classe $classeB;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::firstOrCreate(['name' => 'voir_paiements']);
        $role = Role::firstOrCreate(['name' => 'directeur']);
        $role->givePermissionTo('voir_paiements');

        $this->admin = User::factory()->create([
            'nom' => 'Directeur',
            'prenom' => 'Admin',
            'email' => 'directeur@buyedi.ga',
        ]);
        $this->admin->assignRole('directeur');

        $this->annee = AnneeScolaire::create([
            'nom' => '2026-2027',
            'date_debut' => '2026-09-01',
            'date_fin' => '2027-06-30',
            'en_cours' => true,
        ]);

        $this->classeA = Classe::create(['nom' => '6e A', 'type' => 'secondaire']);
        $this->classeB = Classe::create(['nom' => 'CP1 B', 'type' => 'primaire']);
    }

    public function test_journal_de_caisse_retourne_la_synthese_par_classe(): void
    {
        $fraisSco = FraisType::create(['nom' => 'Scolarité', 'is_scolarite' => true]);
        $fraisTenue = FraisType::create(['nom' => 'Tenue scolaire', 'is_scolarite' => false]);

        // Élève 1 en 6e A
        $user1 = User::factory()->create(['nom' => 'Kombila', 'prenom' => 'Jean']);
        $eleve1 = Eleve::create(['user_id' => $user1->id, 'matricule' => 'MAT-001', 'sexe' => 'M', 'date_naissance' => '2012-05-10']);
        $insc1 = Inscription::create([
            'eleve_id' => $eleve1->id,
            'classe_id' => $this->classeA->id,
            'annee_scolaire_id' => $this->annee->id,
            'date_inscription' => now(),
            'statut' => 'actif',
        ]);

        // Élève 2 en CP1 B
        $user2 = User::factory()->create(['nom' => 'Ndong', 'prenom' => 'Marie']);
        $eleve2 = Eleve::create(['user_id' => $user2->id, 'matricule' => 'MAT-002', 'sexe' => 'F', 'date_naissance' => '2018-09-12']);
        $insc2 = Inscription::create([
            'eleve_id' => $eleve2->id,
            'classe_id' => $this->classeB->id,
            'annee_scolaire_id' => $this->annee->id,
            'date_inscription' => now(),
            'statut' => 'actif',
        ]);

        // Paiements pour 6e A : 50 000 (scolarité) + 15 000 (tenue) = 65 000
        Paiement::create([
            'inscription_id' => $insc1->id,
            'frais_type_id' => $fraisSco->id,
            'montant' => 50000,
            'mode_paiement' => 'especes',
            'date_paiement' => now(),
            'user_id' => $this->admin->id,
        ]);
        Paiement::create([
            'inscription_id' => $insc1->id,
            'frais_type_id' => $fraisTenue->id,
            'montant' => 15000,
            'mode_paiement' => 'especes',
            'date_paiement' => now(),
            'user_id' => $this->admin->id,
        ]);

        // Paiements pour CP1 B : 35 000 (scolarité)
        Paiement::create([
            'inscription_id' => $insc2->id,
            'frais_type_id' => $fraisSco->id,
            'montant' => 35000,
            'mode_paiement' => 'mobile',
            'date_paiement' => now(),
            'user_id' => $this->admin->id,
        ]);

        // Total = 100 000 FCFA
        // Test sur la route d'impression du Journal (/paiements/journal)
        $response = $this->actingAs($this->admin)->get(route('paiements.journal', [
            'annee_scolaire_id' => $this->annee->id,
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Paiements/Journal')
            ->has('par_classe', 2)
            ->where('par_classe.0.classe_nom', '6e A')
            ->where('par_classe.0.total', 65000)
            ->where('par_classe.0.scolarite', 50000)
            ->where('par_classe.0.annexes', 15000)
            ->where('par_classe.0.pourcentage', 65)
            ->where('par_classe.1.classe_nom', 'CP1 B')
            ->where('par_classe.1.total', 35000)
            ->where('par_classe.1.scolarite', 35000)
            ->where('par_classe.1.annexes', 0)
            ->where('par_classe.1.pourcentage', 35)
        );

        // Test sur la route principale (/paiements)
        $responseIndex = $this->actingAs($this->admin)->get(route('paiements.index', [
            'annee_scolaire_id' => $this->annee->id,
        ]));

        $responseIndex->assertStatus(200);
        $responseIndex->assertInertia(fn ($page) => $page
            ->component('Paiements/Index')
            ->has('recapClasses', 2)
            ->where('recapClasses.0.classe_nom', '6e A')
            ->where('recapClasses.0.total', 65000)
            ->where('recapClasses.1.classe_nom', 'CP1 B')
            ->where('recapClasses.1.total', 35000)
        );
    }
}

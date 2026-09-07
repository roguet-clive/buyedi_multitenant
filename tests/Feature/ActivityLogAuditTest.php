<?php

namespace Tests\Feature;

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\FraisType;
use App\Models\Inscription;
use App\Models\Paiement;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

class ActivityLogAuditTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $lambdaUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create([
            'nom' => 'Admin',
            'prenom' => 'Auditeur',
            'email' => 'audit_admin@buyedi.com',
        ]);
        $this->admin->assignRole('super-admin');

        $this->lambdaUser = User::factory()->create([
            'nom' => 'Lambda',
            'prenom' => 'User',
            'email' => 'lambda@buyedi.com',
        ]);
        $this->lambdaUser->assignRole('eleve');
    }

    public function test_logs_index_requires_voir_logs_permission(): void
    {
        $response = $this->actingAs($this->lambdaUser)->get('/logs');
        $response->assertStatus(403);

        $responseAdmin = $this->actingAs($this->admin)->get('/logs');
        $responseAdmin->assertStatus(200);
    }

    public function test_eleve_actions_are_tracked_with_causer_and_properties(): void
    {
        $userEleve = User::factory()->create(['nom' => 'LogTest', 'prenom' => 'Student']);

        $this->actingAs($this->admin);

        $eleve = Eleve::create([
            'user_id' => $userEleve->id,
            'sexe' => 'M',
            'matricule' => 'CSPBO-2026-9999',
            'date_naissance' => '2015-05-10',
            'lieu_naissance' => 'Libreville',
        ]);

        $log = Activity::where('subject_type', Eleve::class)
            ->where('subject_id', $eleve->id)
            ->first();

        $this->assertNotNull($log, "L'activitÃ© de crÃ©ation de l'Ã©lÃ¨ve doit Ãªtre enregistrÃ©e");
        $this->assertEquals($this->admin->id, $log->causer_id, "L'auteur (causer_id) doit Ãªtre l'admin connectÃ©");
        $this->assertNotNull($log->created_at, "L'horodatage prÃ©cis doit Ãªtre prÃ©sent");
    }

    public function test_financial_actions_are_tracked_in_activity_log(): void
    {
        $userStudent = User::factory()->create(['nom' => 'Finance', 'prenom' => 'Test']);
        $eleve = Eleve::create([
            'user_id' => $userStudent->id,
            'sexe' => 'F',
            'matricule' => 'CSPBO-2026-8888',
        ]);

        $annee = \App\Models\AnneeScolaire::create([
            'nom' => '2025-2026',
            'date_debut' => '2025-09-01',
            'date_fin' => '2026-06-30',
            'en_cours' => true,
        ]);

        $classe = Classe::create(['nom' => '6e A', 'type' => 'secondaire']);

        $fraisType = FraisType::create([
            'nom' => 'Frais Inscription',
            'code' => 'inscription',
            'montant' => 10000,
            'annee_scolaire_id' => $annee->id,
            'is_scolarite' => false,
        ]);

        $this->actingAs($this->admin);

        $inscription = Inscription::create([
            'eleve_id' => $eleve->id,
            'classe_id' => $classe->id,
            'annee_scolaire_id' => $annee->id,
            'date_inscription' => '2026-09-04',
            'numero_recu' => 'REC-LOG-01',
            'total_frais' => 10000,
            'has_remise' => false,
            'statut' => 'validee',
        ]);

        $inscriptionLog = Activity::where('subject_type', Inscription::class)
            ->where('subject_id', $inscription->id)
            ->first();

        $this->assertNotNull($inscriptionLog, "L'inscription doit gÃ©nÃ©rer un log d'activitÃ©");
        $this->assertEquals($this->admin->id, $inscriptionLog->causer_id);

        $paiement = Paiement::create([
            'inscription_id' => $inscription->id,
            'frais_type_id' => $fraisType->id,
            'user_id' => $this->admin->id,
            'montant' => 10000,
            'date_paiement' => '2026-09-04',
            'mode_paiement' => 'especes',
        ]);

        $paiementLog = Activity::where('subject_type', Paiement::class)
            ->where('subject_id', $paiement->id)
            ->first();

        $this->assertNotNull($paiementLog, "Le paiement doit gÃ©nÃ©rer un log d'activitÃ©");
        $this->assertEquals($this->admin->id, $paiementLog->causer_id);
    }
}

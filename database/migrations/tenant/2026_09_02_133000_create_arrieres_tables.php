<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Table des arriérés scolaires antérieurs
        Schema::create('arrieres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('eleve_id')->nullable()->constrained('eleves')->onDelete('set null');
            $table->string('nom_eleve');
            $table->string('prenom_eleve')->nullable();
            $table->string('matricule')->nullable();
            $table->string('classe_origine')->nullable(); // Ex: 3ème A, Terminale
            $table->string('annee_scolaire_dette'); // Ex: 2025-2026, 2024-2025
            $table->decimal('montant_total', 15, 2);
            $table->decimal('montant_paye', 15, 2)->default(0);
            $table->decimal('montant_restant', 15, 2);
            $table->enum('statut', ['non_solde', 'partiellement_solde', 'solde'])->default('non_solde');
            $table->foreignId('frais_type_id')->nullable()->constrained('frais_types')->onDelete('set null');
            $table->text('observations')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        // 2. Table des paiements / versements liés aux arriérés
        Schema::create('arriere_paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('arriere_id')->constrained('arrieres')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // Caissier
            $table->string('numero_recu')->unique(); // Ex: REC-ARR-000001
            $table->decimal('montant', 15, 2);
            $table->date('date_paiement');
            $table->enum('mode_paiement', ['especes', 'virement', 'mobile', 'cheque'])->default('especes');
            $table->string('reference_paiement')->nullable();
            $table->text('commentaire')->nullable();
            $table->timestamps();
        });

        // 3. Modifier la table paiements pour rendre inscription_id nullable et lier arriere_paiement_id si existant
        Schema::table('paiements', function (Blueprint $table) {
            $table->foreignId('inscription_id')->nullable()->change();
            $table->foreignId('arriere_paiement_id')->nullable()->constrained('arriere_paiements')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('paiements', function (Blueprint $table) {
            $table->dropForeign(['arriere_paiement_id']);
            $table->dropColumn('arriere_paiement_id');
        });

        Schema::dropIfExists('arriere_paiements');
        Schema::dropIfExists('arrieres');
    }
};

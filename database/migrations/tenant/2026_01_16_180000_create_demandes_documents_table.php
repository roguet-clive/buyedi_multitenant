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
        Schema::create('demandes_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('eleve_id')->constrained('eleves')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Demandeur (parent ou élève)
            $table->string('type_document'); // 'certificat_scolarite', 'carte_scolaire', 'fiche_synthese', 'attestation_inscription', 'autre'
            $table->text('motif')->nullable();
            $table->string('statut')->default('en_attente'); // 'en_attente', 'approuve', 'rejete'
            $table->text('motif_rejet')->nullable();
            $table->foreignId('traite_par_id')->nullable()->constrained('users')->onDelete('set null'); // Secrétaire / Directeur
            $table->timestamp('date_traitement')->nullable();
            $table->foreignId('annee_scolaire_id')->nullable()->constrained('annee_scolaires')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demandes_documents');
    }
};

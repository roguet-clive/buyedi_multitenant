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
        Schema::create('inscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('numero_recu')->unique()->nullable();
            $table->string('code_securite')->unique()->nullable();

            $table->foreignId('eleve_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('classe_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('annee_scolaire_id')
                ->constrained()
                ->onDelete('cascade');

            $table->date('date_inscription')->nullable();
            $table->boolean('reinscription')->default(false);
            $table->boolean('has_remise')->default(false);
            $table->decimal('remise_pourcentage', 5, 2)->default(0);
            $table->decimal('remise_montant', 10, 2)->default(0);
            // Statut: brouillon, en_attente (préinscription), validee (inscription), rejete, abandon
            $table->string('statut')->default('validee');

            // Paiement de l'inscription de base
            $table->decimal('total_frais', 10, 2)->default(0);

            $table->timestamps();

            // 🔹 Index unique pour éviter doublons par élève et année
            $table->unique(['eleve_id', 'annee_scolaire_id']);
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inscriptions');
    }
};

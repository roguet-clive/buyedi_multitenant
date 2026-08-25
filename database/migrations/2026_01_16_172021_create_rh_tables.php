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
        Schema::create('contrats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('CDI'); // CDI, CDD, Vacataire
            $table->decimal('salaire_base', 12, 2);
            $table->decimal('taux_horaire', 10, 2)->nullable();
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });

        Schema::create('paiements_salaires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained(); // L'employé
            $table->foreignId('auteur_id')->constrained('users'); // Le comptable/RH qui a payé
            
            $table->integer('mois'); // 1-12
            $table->integer('annee'); // 2026
            
            $table->decimal('salaire_brut', 12, 2);
            $table->decimal('primes', 12, 2)->default(0);
            $table->decimal('retenues', 12, 2)->default(0); // Avances, Cotisations
            $table->decimal('net_a_payer', 12, 2);
            
            $table->date('date_paiement');
            $table->text('commentaire')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements_salaires');
        Schema::dropIfExists('contrats');
    }
};

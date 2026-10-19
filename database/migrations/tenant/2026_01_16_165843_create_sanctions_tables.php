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
        Schema::create('types_sanctions', function (Blueprint $table) {
            $table->id();
            $table->string('nom'); // Ex: Avertissement, Blâme, Exclusion
            $table->integer('gravite')->default(1); // 1 = faible, 5 = exclusion définitive
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('sanctions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('eleve_id')->constrained()->cascadeOnDelete();
            $table->foreignId('type_sanction_id')->constrained('types_sanctions');
            $table->foreignId('annee_scolaire_id')->constrained();
            $table->foreignId('decideur_id')->constrained('users'); // Qui a donné la sanction
            
            $table->text('motif');
            $table->date('date_sanction');
            $table->date('date_fin')->nullable(); // Pour les exclusions temporaires
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sanctions');
        Schema::dropIfExists('types_sanctions');
    }
};

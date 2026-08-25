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
        Schema::create('emploi_du_temps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classe_id')->constrained()->onDelete('cascade');
            $table->foreignId('matiere_id')->constrained()->onDelete('cascade');
            $table->foreignId('enseignant_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('annee_scolaire_id')->constrained()->onDelete('cascade');
            $table->string('jour'); // Lundi, Mardi...
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->foreignId('periode_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('salle')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emploi_du_temps');
    }
};

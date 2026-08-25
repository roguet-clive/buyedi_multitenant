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
        Schema::create('cours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('annee_scolaire_id')->constrained()->onDelete('cascade');
            $table->foreignId('classe_id')->constrained()->onDelete('cascade');
            $table->foreignId('enseignant_id')->constrained()->onDelete('cascade'); // Utiliser 'enseignants' table ou 'users' with role? 
            // Checking Demoseeder, Enseignant model exists and linked to user_id. Usually assignment is to Enseignant entity.
            
            $table->foreignId('matiere_id')->nullable()->constrained()->onDelete('cascade');
            // Si matiere_id est null => Enseignant titulaire global (Primaire)
            
            $table->boolean('is_titulaire')->default(false); // Pour marquer le prof principal en secondaire si besoin
            $table->decimal('coefficient', 5, 2)->default(1.00);
            $table->foreignId('periode_id')->nullable()->constrained()->onDelete('cascade');
            
            $table->timestamps();

            // Unicité : Un enseignant ne peut pas avoir 2 fois le même cours (matière+classe+année)
            // Mais un cours (matière+classe+année) ne peut avoir qu'un seul enseignant actif?
            // Règle: Une matière dans une classe pour une année donnée = 1 Enseignant.
            $table->unique(['annee_scolaire_id', 'classe_id', 'matiere_id', 'periode_id'], 'unique_cours_periode');
            
            // Pour le primaire (matiere_id is null): une classe ne peut avoir qu'un enseignant principal (titulaire) ?
            // On peut gérer ça via validation ou un index partiel si supporté (pas standard en migration Laravel simple).
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cours');
    }
};

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
        Schema::create('eleves', function (Blueprint $table) {
            $table->id();

            // Relation avec user pour l'authentification
            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');

            // Infos personnelles
            $table->string('matricule')->unique();     // Numéro unique d’élève
            $table->enum('sexe', ['M', 'F']);
            $table->date('date_naissance')->nullable();
            $table->string('lieu_naissance')->nullable();
            $table->string('probleme_particulier')->nullable();
            $table->string('photo')->nullable(); // 🔹 chemin vers la photo de l'élève

            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eleves');
    }
};

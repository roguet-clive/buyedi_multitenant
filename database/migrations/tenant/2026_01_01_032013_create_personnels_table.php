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
        Schema::create('personnels', function (Blueprint $table) {
            $table->id();
            
            // Relation avec user
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('matricule')->nullable()->unique();
            $table->string('cnss')->nullable();
            
            // Info perso
            $table->string('poste'); // "Secrétaire", "Comptable", "Gardien"
            $table->string('telephone')->nullable();
            $table->string('adresse')->nullable();
            $table->enum('sexe', ['M', 'F'])->nullable();
            $table->date('date_naissance')->nullable();
            $table->string('lieu_naissance')->nullable();
            $table->date('date_embauche')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personnels');
    }
};

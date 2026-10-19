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
        Schema::create('absences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inscription_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->enum('type', ['absence', 'retard'])->default('absence');
            $table->boolean('justifiee')->default(false);
            $table->string('motif')->nullable();
            $table->timestamps();
        });

        Schema::create('appels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classe_id')->constrained('classes')->onDelete('cascade');
            $table->foreignId('annee_scolaire_id')->constrained('annee_scolaires')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // Auteur de l'appel
            $table->date('date');
            $table->boolean('verrouille')->default(true);
            $table->string('statut')->default('cloture');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['classe_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appels');
        Schema::dropIfExists('absences');
    }
};

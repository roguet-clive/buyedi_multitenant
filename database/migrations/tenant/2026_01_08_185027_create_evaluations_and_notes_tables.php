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
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cours_id')->constrained()->onDelete('cascade');
            $table->string('titre'); // Ex: Interro 1
            $table->string('type')->default('devoir'); // devoir, composition
            $table->decimal('coefficient', 5, 2)->default(1.00);
            $table->integer('note_max')->default(20);
            $table->date('date_evaluation');
            $table->foreignId('periode_id')->constrained('periodes')->onDelete('cascade');
            $table->timestamps();

            // Unicité : Une évaluation avec le même titre par période pour un cours donné
            $table->unique(['cours_id', 'titre', 'periode_id'], 'unique_eval_cours_titre_periode');
        });

        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_id')->constrained()->onDelete('cascade');
            $table->foreignId('inscription_id')->constrained()->onDelete('cascade');
            $table->decimal('valeur', 5, 2)->nullable(); // Null = absent ou pas noté
            $table->string('appreciation')->nullable();
            $table->timestamps();
            
            // Unicité : Une note par élève par évaluation
            $table->unique(['evaluation_id', 'inscription_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notes');
        Schema::dropIfExists('evaluations');
    }
};

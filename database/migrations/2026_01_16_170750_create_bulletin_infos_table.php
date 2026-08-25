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
        Schema::create('bulletin_infos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inscription_id')->constrained()->cascadeOnDelete();
            $table->foreignId('periode_id')->constrained()->cascadeOnDelete();
            
            $table->text('appreciation_generale')->nullable(); // Saisie par le conseil
            $table->string('decision_conseil')->nullable(); // Passage, Redoublement...
            $table->string('mention')->nullable(); // Félicitations, Encouragements, Avertissement Conduite...
            $table->float('note_conduite')->nullable(); // Si géré manuellement ici
            
            $table->timestamps();
            
            // Un élève a une seule entrée par période
            $table->unique(['inscription_id', 'periode_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bulletin_infos');
    }
};

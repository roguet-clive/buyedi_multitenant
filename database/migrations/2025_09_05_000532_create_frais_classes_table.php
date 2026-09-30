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
        Schema::create('frais_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classe_id')->constrained()->onDelete('cascade');
            $table->foreignId('annee_scolaire_id')->constrained()->onDelete('cascade');
            $table->foreignId('frais_type_id')->constrained()->onDelete('cascade');
            $table->decimal('montant', 10, 2)->default(0);
            $table->string('mode_paiement')->default('unique'); // unique, tranches, mensuel
            $table->string('description')->nullable();
            $table->date('date_limite')->nullable();
            $table->timestamps();

            $table->unique(['classe_id', 'annee_scolaire_id', 'frais_type_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('frais_classes');
    }
};

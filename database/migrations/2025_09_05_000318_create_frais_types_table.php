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
        Schema::create('frais_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable()->unique(); // Code unique pour identification (ex: 'inscription', 'tenue')
            $table->string('nom')->unique();
            $table->decimal('montant', 15, 2)->default(0);
            $table->foreignId('annee_scolaire_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('globale')->default(true);
            $table->boolean('is_scolarite')->default(false); // Pour distinguer la scolarité mensuelle
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('frais_types');
    }
};

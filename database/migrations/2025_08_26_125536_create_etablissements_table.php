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
        if (!Schema::hasTable('etablissements')) {
            Schema::create('etablissements', function (Blueprint $table) {
                $table->id();
                $table->string('nom')->default('Buyedi');
                $table->string('sigle')->nullable();
                $table->string('logo')->nullable();
                $table->string('modele_bulletin')->nullable();
                $table->string('modele_fiche_etudiant')->nullable();
                $table->string('adresse')->nullable();
                $table->string('telephone')->nullable();
                $table->string('email')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('etablissements');
    }
};

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
        Schema::create('depenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Auteur de la dépense
            $table->string('categorie'); // Loyer, Salaire, Materiel, Autre...
            $table->decimal('montant', 10, 2);
            $table->text('description')->nullable();
            $table->date('date_depense');
            $table->string('facture_path')->nullable();
            $table->string('numero_facture', 100)->nullable();
            $table->string('mode_paiement', 50)->default('especes');
            $table->string('beneficiaire')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('depenses');
    }
};

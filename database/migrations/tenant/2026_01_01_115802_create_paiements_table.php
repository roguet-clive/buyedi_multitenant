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
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inscription_id')->constrained()->onDelete('restrict');
            $table->foreignId('frais_type_id')->constrained()->onDelete('restrict');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // Caissier
            $table->decimal('montant', 10, 2);
            $table->date('date_paiement');
            $table->enum('mode_paiement', ['especes', 'virement', 'mobile', 'cheque'])->default('especes');
            $table->string('mois')->nullable(); // Pour les frais mensuels (ex: "Octobre")
            $table->text('commentaire')->nullable();
            $table->string('reference_recu')->nullable()->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};

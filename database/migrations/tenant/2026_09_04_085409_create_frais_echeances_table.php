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
        Schema::create('frais_echeances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('frais_classe_id')->constrained('frais_classes')->onDelete('cascade');
            $table->string('nom');
            $table->decimal('montant', 10, 2)->default(0);
            $table->date('date_limite')->nullable();
            $table->unsignedSmallInteger('ordre')->default(1);
            $table->string('type')->default('mensualite'); // mensualite, tranche
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('frais_echeances');
    }
};

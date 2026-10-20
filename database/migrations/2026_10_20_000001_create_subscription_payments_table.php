<?php

declare(strict_types=1);

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
        Schema::create('subscription_payments', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('reference')->unique(); // Ex: FAC-2026-001
            $table->decimal('montant', 12, 2);    // Montant en F CFA
            $table->string('formule')->default('pro'); // starter, pro, enterprise
            $table->string('periode')->default('annuel'); // mensuel, semestriel, annuel
            $table->integer('mois')->default(12);
            $table->string('methode_paiement')->default('virement_bancaire'); // airtel_money, moov_money, virement_bancaire, especes, cheque
            $table->string('statut')->default('paye'); // paye, en_attente, annule
            $table->text('notes')->nullable();
            $table->timestamp('paye_le')->useCurrent();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_payments');
    }
};

<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTenantsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->string('id')->primary(); // Identifiant unique / slug du tenant (ex: sagesse)

            // Informations SaaS de l'établissement
            $table->string('nom')->nullable();
            $table->string('email')->nullable();
            $table->string('telephone')->nullable();
            $table->string('statut')->default('essai'); // essai, actif, suspendu, expire
            $table->string('formule')->default('pro');  // starter, pro, enterprise
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('actif_jusqu_a')->nullable();

            $table->timestamps();
            $table->json('data')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
}

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
        Schema::table('personnels', function (Blueprint $table) {
            $table->dropColumn('salaire'); // 🗑️ Déprécié
            
            $table->date('date_naissance')->nullable()->after('sexe');
            $table->string('lieu_naissance')->nullable()->after('date_naissance');
            $table->string('matricule')->nullable()->unique()->after('user_id'); // 🆔 Unique
            $table->string('cnss')->nullable()->after('matricule'); // 🏥 Sécu
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personnels', function (Blueprint $table) {
            $table->decimal('salaire', 10, 2)->nullable();
            
            $table->dropColumn(['date_naissance', 'lieu_naissance', 'matricule', 'cnss']);
        });
    }
};

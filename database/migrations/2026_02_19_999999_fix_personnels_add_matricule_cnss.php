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
            if (!Schema::hasColumn('personnels', 'matricule')) {
                $table->string('matricule')->nullable()->unique()->after('user_id');
            }
            if (!Schema::hasColumn('personnels', 'cnss')) {
                $table->string('cnss')->nullable()->after('matricule');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personnels', function (Blueprint $table) {
            $table->dropColumn(['matricule', 'cnss']);
        });
    }
};

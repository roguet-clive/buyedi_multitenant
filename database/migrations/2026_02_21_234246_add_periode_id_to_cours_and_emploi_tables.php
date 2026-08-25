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
        Schema::disableForeignKeyConstraints();

        Schema::table('cours', function (Blueprint $table) {
            $table->foreignId('periode_id')->nullable()->constrained()->onDelete('cascade');
            // Add the new flexible unique index FIRST to satisfy foreign key requirement
            $table->unique(['annee_scolaire_id', 'classe_id', 'matiere_id', 'periode_id'], 'unique_cours_periode');
            // Remove the old rigid unique index
            $table->dropUnique('unique_cours_matiere');
        });

        Schema::table('emploi_du_temps', function (Blueprint $table) {
            $table->foreignId('periode_id')->nullable()->constrained()->onDelete('cascade');
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('emploi_du_temps', function (Blueprint $table) {
            $table->dropForeign(['periode_id']);
            $table->dropColumn('periode_id');
        });

        Schema::table('cours', function (Blueprint $table) {
            $table->dropUnique('unique_cours_periode');
            $table->unique(['annee_scolaire_id', 'classe_id', 'matiere_id'], 'unique_cours_matiere');
            $table->dropForeign(['periode_id']);
            $table->dropColumn('periode_id');
        });
    }
};

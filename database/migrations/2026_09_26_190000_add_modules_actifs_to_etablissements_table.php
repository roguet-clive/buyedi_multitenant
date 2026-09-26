<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('etablissements', function (Blueprint $table) {
            if (!Schema::hasColumn('etablissements', 'modules_actifs')) {
                $table->json('modules_actifs')->nullable()->after('email');
            }
            if (!Schema::hasColumn('etablissements', 'formule_licence')) {
                $table->string('formule_licence')->default('integral')->after('modules_actifs');
            }
        });

        // Par défaut, activer tous les modules pour l'établissement existant afin de garantir une continuité totale
        $allModules = [
            'notes_bulletins',
            'communication',
            'rh_paie',
            'emploi_du_temps',
            'documents_pedagogiques',
            'depenses',
            'arrieres',
            'ia_statistiques',
        ];

        DB::table('etablissements')->update([
            'modules_actifs' => json_encode($allModules),
            'formule_licence' => 'integral',
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('etablissements', function (Blueprint $table) {
            if (Schema::hasColumn('etablissements', 'formule_licence')) {
                $table->dropColumn('formule_licence');
            }
            if (Schema::hasColumn('etablissements', 'modules_actifs')) {
                $table->dropColumn('modules_actifs');
            }
        });
    }
};

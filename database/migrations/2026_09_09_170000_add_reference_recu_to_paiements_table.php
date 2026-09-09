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
        Schema::table('paiements', function (Blueprint $table) {
            $table->string('reference_recu')->nullable()->after('commentaire')->index();
        });

        // Rattrapage sécurisé des enregistrements existants (Backfill)
        // 1. Pour les paiements liés à une inscription, assigner le numéro de reçu de l'inscription
        $inscriptions = DB::table('inscriptions')
            ->whereNotNull('numero_recu')
            ->select('id', 'numero_recu')
            ->get();

        foreach ($inscriptions as $insc) {
            DB::table('paiements')
                ->where('inscription_id', $insc->id)
                ->whereNull('reference_recu')
                ->update(['reference_recu' => $insc->numero_recu]);
        }

        // 2. Pour les autres paiements éventuels, assigner un numéro de reçu déterministe
        $autresPaiements = DB::table('paiements')->whereNull('reference_recu')->get();
        foreach ($autresPaiements as $p) {
            $ref = 'REC-' . str_pad($p->id, 6, '0', STR_PAD_LEFT);
            DB::table('paiements')->where('id', $p->id)->update(['reference_recu' => $ref]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('paiements', function (Blueprint $table) {
            $table->dropIndex(['reference_recu']);
            $table->dropColumn('reference_recu');
        });
    }
};

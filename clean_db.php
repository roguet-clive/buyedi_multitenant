<?php
use Illuminate\Support\Facades\Schema;

Schema::disableForeignKeyConstraints();

if (Schema::hasColumn('cours', 'periode_id')) {
    try {
        Schema::table('cours', function ($table) {
            $table->dropForeign(['periode_id']);
        });
    } catch (\Exception $e) {
        // FK might not exist
    }
    Schema::table('cours', function ($table) {
        $table->dropColumn('periode_id');
    });
    echo "Removed periode_id from cours.\n";
}

if (Schema::hasColumn('emploi_du_temps', 'periode_id')) {
     try {
        Schema::table('emploi_du_temps', function ($table) {
            $table->dropForeign(['periode_id']);
        });
    } catch (\Exception $e) {
        // FK might not exist
    }
    Schema::table('emploi_du_temps', function ($table) {
        $table->dropColumn('periode_id');
    });
    echo "Removed periode_id from emploi_du_temps.\n";
}

Schema::enableForeignKeyConstraints();
echo "Cleanup complete.\n";

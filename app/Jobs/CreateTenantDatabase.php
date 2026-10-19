<?php

namespace App\Jobs;

use Stancl\Tenancy\Jobs\CreateDatabase as BaseCreateDatabase;
use Stancl\Tenancy\Database\DatabaseManager;

class CreateTenantDatabase extends BaseCreateDatabase
{
    public function handle(DatabaseManager $databaseManager)
    {
        $manager = $this->tenant->database()->manager();
        $databaseName = $this->tenant->database()->getName();

        // Si la base de données existe déjà (cas de migration d'un établissement existant),
        // on ne tente pas de la recréer pour éviter une exception.
        if ($manager->databaseExists($databaseName)) {
            return;
        }

        parent::handle($databaseManager);
    }
}

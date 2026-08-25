<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Personnel : " . \App\Models\Personnel::first()->user->email . "\n";
echo "Enseignant : " . \App\Models\Enseignant::first()->user->email . "\n";
echo "Parent : " . \App\Models\ParentModel::first()->user->email . "\n";
echo "Eleve : " . \App\Models\Eleve::first()->user->email . "\n";

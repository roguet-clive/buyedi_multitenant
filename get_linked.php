<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$eleveTest = \App\Models\Eleve::first();
if ($eleveTest) {
    echo "Eleve : {$eleveTest->user->email}\n";
    if ($parentTest = $eleveTest->parents->first()) {
        echo "Parent lie : {$parentTest->user->email}\n";
    }
}

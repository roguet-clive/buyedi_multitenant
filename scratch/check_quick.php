<?php
require 'c:/laragon/www/buyedi_sagesse_divine/vendor/autoload.php';
$app = require_once 'c:/laragon/www/buyedi_sagesse_divine/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();
$request = \Illuminate\Http\Request::create('http://127.0.0.1:8000', 'GET');
$app->instance('request', $request);

$eleve = \App\Models\Eleve::first();
$controller = app(\App\Http\Controllers\EleveController::class);
$reflection = new ReflectionClass($controller);
$method = $reflection->getMethod('getEtablissementData');
$method->setAccessible(true);
$etablissement = $method->invoke($controller);

$inscription = $eleve->inscriptionActuelle;

// Let's test with the updated template
$html = view('documents.certificat_scolarite', [
    'eleve' => $eleve,
    'inscription' => $inscription,
    'etablissement' => $etablissement,
    'qrCode' => '',
    'reference' => 'CS/2026/0001',
])->render();

$dompdf = new \Dompdf\Dompdf(['isPhpEnabled' => true]);
$dompdf->setPaper('a4', 'portrait');
$dompdf->loadHtml($html);
$dompdf->render();

echo "Page count: " . $dompdf->getCanvas()->get_page_count() . "\n";

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

$cpdf = $dompdf->getCanvas()->get_cpdf();
$stream = $cpdf->objects[7]['c'];

// In stream, let's find Y positions of text
preg_match_all('/(?:BT\s+([\d\.]+)\s+([\d\.]+)\s+Td.*?\[\((.*?)\)\]\s+TJ\s+ET)/s', $stream, $matches, PREG_SET_ORDER);
echo "Total text blocks: " . count($matches) . "\n";
foreach ($matches as $m) {
    $x = $m[1];
    $y = $m[2];
    $sample = substr(str_replace(' ', '', $m[3]), 0, 35);
    echo "Y = " . sprintf("%6.1f", $y) . " (from bottom) | X = " . sprintf("%5.1f", $x) . " | Text: {$sample}\n";
}

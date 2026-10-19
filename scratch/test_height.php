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
if (!$inscription->code_securite) {
    $inscription->update(['code_securite' => (string) \Illuminate\Support\Str::uuid()]);
}

$qrData = route('inscriptions.verify', $inscription->code_securite);
$qrCode = base64_encode(
    \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')
        ->size(150)
        ->margin(0)
        ->errorCorrection('M')
        ->generate($qrData)
);

$html = view('documents.certificat_scolarite', [
    'eleve' => $eleve,
    'inscription' => $inscription,
    'etablissement' => $etablissement,
    'qrCode' => $qrCode,
    'reference' => 'CS/2026-2027/' . $eleve->matricule,
])->render();

$pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->setPaper('a4', 'portrait');
$pdfContent = $pdf->output();

preg_match_all('/\/Count\s+(\d+)/', $pdfContent, $matches);
$pages = !empty($matches[1]) ? max($matches[1]) : 'unknown';

echo "Pages: {$pages}\n";

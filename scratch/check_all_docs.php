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

$docs = [
    'certificat_scolarite' => [
        'eleve' => $eleve,
        'inscription' => $inscription,
        'etablissement' => $etablissement,
        'qrCode' => base64_encode('<svg width="100" height="100"></svg>'),
        'reference' => 'CS/2026/0001',
    ],
    'attestation_conduite' => [
        'eleve' => $eleve,
        'inscription' => $inscription,
        'etablissement' => $etablissement,
        'qrCode' => base64_encode('<svg width="100" height="100"></svg>'),
        'reference' => 'AC/2026/0001',
    ],
    'fiche_renseignements' => [
        'eleve' => $eleve,
        'inscription' => $inscription,
        'etablissement' => $etablissement,
        'qrCode' => base64_encode('<svg width="100" height="100"></svg>'),
        'reference' => 'FR/2026/0001',
    ],
    'billet_sortie' => [
        'billet' => (object)[
            'id' => 1,
            'numero' => 'BS-001',
            'eleve' => $eleve,
            'motif' => 'Raison médicale',
            'date_heure_sortie' => now(),
            'date_heure_retour_prevue' => now()->addHours(2),
            'statut' => 'valide',
            'created_at' => now(),
            'accompagnateur_nom' => 'Parent',
            'accompagnateur_contact' => '+241 00 00 00',
            'autorisation_par' => 'CPE',
        ],
        'etablissement' => $etablissement,
        'qrCode' => base64_encode('<svg width="100" height="100"></svg>'),
    ]
];

foreach ($docs as $name => $data) {
    $html = view('documents.' . $name, $data)->render();
    $dompdf = new \Dompdf\Dompdf(['isPhpEnabled' => true]);
    $dompdf->setPaper('a4', 'portrait');
    $dompdf->loadHtml($html);
    $dompdf->render();
    $pageCount = $dompdf->getCanvas()->get_page_count();
    
    // Find lowest text element inside the document
    $cpdf = $dompdf->getCanvas()->get_cpdf();
    $stream = $cpdf->objects[7]['c'] ?? '';
    preg_match_all('/(?:BT\s+([\d\.]+)\s+([\d\.]+)\s+Td.*?\[\((.*?)\)\]\s+TJ\s+ET)/s', $stream, $matches, PREG_SET_ORDER);
    $lowestNonFooterY = 9999;
    $lowestText = '';
    foreach ($matches as $m) {
        $y = (float)$m[2];
        $text = $m[3];
        // Footer text is below 35 pt
        if ($y > 35 && $y < $lowestNonFooterY) {
            $lowestNonFooterY = $y;
            $lowestText = substr(str_replace(' ', '', $text), 0, 30);
        }
    }
    
    echo sprintf("%-25s: %d page(s) | Lowest doc text Y = %6.1f pt from bottom (text: %s)\n", $name, $pageCount, $lowestNonFooterY, $lowestText);
}

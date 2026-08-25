<?php

use App\Models\Inscription;
use App\Models\Eleve;
use App\Models\Paiement;
use App\Models\Depense;
use App\Models\AnneeScolaire;

try {
    echo "Testing Recent Inscriptions (Dashboard Data)...\n";
    $annee = AnneeScolaire::where('en_cours', true)->first();
    if ($annee) {
        $inscriptions = Inscription::with(['eleve.user', 'classe'])
            ->where('annee_scolaire_id', $annee->id)
            ->latest()
            ->take(20) // Check more than just 5
            ->get();
            
        foreach ($inscriptions as $insc) {
            // Mimic Dashboard Resource transformation
            $data = [
                'id' => $insc->id,
                'name' => $insc->eleve->user->nom . ' ' . $insc->eleve->user->prenom,
                'classe' => $insc->classe ? ($insc->classe->nom . ' (' . ucfirst($insc->classe->type) . ')') : 'N/A',
                'date' => $insc->created_at->format('d M, H:i'),
                'avatar' => substr($insc->eleve->user->nom, 0, 1) . substr($insc->eleve->user->prenom, 0, 1),
                'status' => $insc->statut ?? 'validee'
            ];
            
            if (json_encode($data) === false) {
                 echo "❌ Failed Inscription ID: " . $insc->id . " Error: " . json_last_error_msg() . "\n";
                 print_r($data);
            }
        }
    }
    echo "Inscriptions OK\n";

    echo "Testing Eleve Table...\n";
    Eleve::chunk(100, function($eleves) {
        foreach($eleves as $e) {
            if (json_encode($e->toArray()) === false) {
                echo "❌ Failed Eleve ID: " . $e->id . " Error: " . json_last_error_msg() . "\n";
            }
        }
    });
    echo "Eleves OK\n";
    
    echo "Testing Financial Data (Chart)...\n";
    // Check Paiements and Depenses for the last 6 months
    $start = now()->subMonths(6)->startOfMonth();
    
    $paiements = Paiement::where('date_paiement', '>=', $start)->get();
    foreach($paiements as $p) {
        if (json_encode($p->toArray()) === false) {
            echo "❌ Failed Paiement ID: " . $p->id . " Error: " . json_last_error_msg() . "\n";
        }
    }
    
    $depenses = Depense::where('date_depense', '>=', $start)->get();
    foreach($depenses as $d) {
        if (json_encode($d->toArray()) === false) {
            echo "❌ Failed Depense ID: " . $d->id . " Error: " . json_last_error_msg() . "\n";
            print_r($d->toArray());
        }
    }
    echo "Financials OK\n";

} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}

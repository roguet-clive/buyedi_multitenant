<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class RunAIAnalysis extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:run-ia-analysis';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Analyse les données de l\'école et génère des alertes IA';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Début de l'analyse IA...");

        $admins = \App\Models\User::role(['super-admin', 'Directeur'])->get();

        // 1. ANALYSE FINANCIÈRE (Solde Négatif)
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();
        $recettes = \App\Models\Paiement::whereBetween('date_paiement', [$startOfMonth, $endOfMonth])->sum('montant');
        $depenses = \App\Models\Depense::whereBetween('date_depense', [$startOfMonth, $endOfMonth])->sum('montant');

        if ($depenses > $recettes) {
            $deficit = $depenses - $recettes;
            $this->warn("Déficit détecté : $deficit");
            
            foreach ($admins as $admin) {
                $admin->notify(new \App\Notifications\AlertNotification([
                    'title' => '⚠️ Alerte Financière (IA)',
                    'message' => "Le solde de ce mois est négatif (-$deficit FCFA). Les dépenses dépassent les recettes.",
                    'type' => 'dangerAlert'
                ]));
            }
        }

        // 2. ANALYSE PÉDAGOGIQUE (Classes avec peu d'élèves)
        $classes = \App\Models\Classe::withCount('inscriptions')->get();
        foreach ($classes as $classe) {
            // Seuil arbitraire de 5 pour l'exemple
            if ($classe->inscriptions_count > 0 && $classe->inscriptions_count < 5) {
                $this->info("Classe faible effectif : " . $classe->nom);
                foreach ($admins as $admin) {
                     $admin->notify(new \App\Notifications\AlertNotification([
                        'title' => '📉 Optimisation des Classes (IA)',
                        'message' => "La classe {$classe->nom} a un effectif très faible ({$classe->inscriptions_count} élèves). Envisagez de la fusionner.",
                        'type' => 'warningAlert'
                    ]));
                }
            }
        }

        $this->info("Analyse terminée.");
    }
}

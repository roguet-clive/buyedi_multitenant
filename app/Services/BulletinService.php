<?php

namespace App\Services;

use App\Models\Inscription;
use App\Models\Periode;
use App\Models\Note;
use App\Models\Cours;
use App\Models\Evaluation;
use App\Models\Matiere;
use Illuminate\Support\Collection;

class BulletinService
{
    /**
     * Calcule toutes les moyennes pour un bulletin donné.
     *
     * @param Inscription $inscription
     * @param Periode $periode
     * @return array
     */
    public function calculerBulletin(Inscription $inscription, Periode $periode)
    {
        // 1. Récupérer tous les cours de la classe de l'élève
        $cours = Cours::where('classe_id', $inscription->classe_id)
            ->where('annee_scolaire_id', $periode->annee_scolaire_id)
            ->with(['matiere', 'enseignant.user'])
            ->get();

        $lignesBulletin = [];
        $totalPoints = 0;
        $totalCoefficients = 0;

        foreach ($cours as $c) {
            // Calculer la moyenne de l'élève pour ce cours
            $moyenneData = $this->calculerMoyenneCours($c, $inscription, $periode);

            if ($moyenneData) {
                $matiereNom = $c->matiere ? $c->matiere->nom : ($c->nom ?? 'Cours Général');
                
                // Pour le bulletin, on a besoin de :
                // - Nom Matière + Prof
                // - Moyenne Élève
                // - Coeff Matière
                // - Points (Moyenne * Coeff)
                // - Rang dans la matière (Optionnel, lourd à calculer ici)
                
                // Pour les stats de classe (Min, Max, Moyenne Classe), c'est lourd de le faire élève par élève.
                // Idéalement, on calcule tout pour la classe une fois, puis on extrait.
                // MAIS pour l'instant, faisons simple et robuste.

                // Coefficient du cours/matière (Par défaut 1 si non défini)
                // Note: Le modèle Cours a-t-il un champ 'coefficient'? Sinon Matiere?
                // Supposons Cours has coefficient, sinon 1.
                $coeffMatiere = $c->coefficient ?? 1;

                $ligne = [
                    'cours_id' => $c->id,
                    'matiere' => $matiereNom,
                    'enseignant' => $c->enseignant ? ($c->enseignant->nom . ' ' . $c->enseignant->prenom) : 'N/A',
                    'moyenne' => $moyenneData['moyenne'],
                    'coefficient' => $coeffMatiere,
                    'points' => $moyenneData['moyenne'] * $coeffMatiere,
                    'appreciation' => $this->getAppreciation($moyenneData['moyenne']),
                    // Placeholders for class stats
                    'min' => 0,
                    'max' => 0,
                    'avg' => 0,
                    'rang' => 0
                ];

                $lignesBulletin[] = $ligne;
                $totalPoints += $ligne['points'];
                $totalCoefficients += $coeffMatiere;
            }
        }

        $moyenneGenerale = $totalCoefficients > 0 ? ($totalPoints / $totalCoefficients) : 0;

        // 🆕 Récupérer les infos manuelles (Conseil de classe)
        $bulletinInfo = \App\Models\BulletinInfo::where('inscription_id', $inscription->id)
            ->where('periode_id', $periode->id)
            ->first();

        // 🧠 Logique Premium : Priorité au manuel
        $appreciationFinale = $bulletinInfo?->appreciation_generale ?? $this->getAppreciation($moyenneGenerale);
        $decision = $bulletinInfo?->decision_conseil ?? null;
        $mention = $bulletinInfo?->mention ?? null;

        return [
            'inscription' => $inscription,
            'periode' => $periode,
            'lignes' => $lignesBulletin,
            'total_points' => $totalPoints,
            'total_coefficients' => $totalCoefficients,
            'moyenne_generale' => round($moyenneGenerale, 2),
            'appreciation_generale' => $appreciationFinale,
            'decision' => $decision,
            'mention' => $mention,
            'bulletin_info_id' => $bulletinInfo?->id // Utile pour l'édition ultérieure
        ];
    }

    /**
     * Calcule la moyenne d'un élève pour un cours et une période donnés.
     */
    public function calculerMoyenneCours(Cours $cours, Inscription $inscription, Periode $periode)
    {
        // Récupérer les évals de ce cours pour cette période
        $evaluations = Evaluation::where('cours_id', $cours->id)
            ->where('periode_id', $periode->id)
            ->get();

        if ($evaluations->isEmpty()) {
            return null; // Pas de note pour cette matière
        }

        $totalPointsMatiere = 0;
        $totalCoeffsMatiere = 0;

        foreach ($evaluations as $eval) {
            // Note de l'élève
            $note = Note::where('evaluation_id', $eval->id)
                ->where('inscription_id', $inscription->id)
                ->first();

            if ($note && !is_null($note->valeur)) {
                $totalPointsMatiere += ($note->valeur / $eval->note_max) * 20 * $eval->coefficient; // Ramené sur 20
                $totalCoeffsMatiere += $eval->coefficient;
            }
        }

        if ($totalCoeffsMatiere == 0) return null;

        return [
            'moyenne' => round($totalPointsMatiere / $totalCoeffsMatiere, 2)
        ];
    }

    /**
     * Calcule les bulletins pour toute une classe (avec rangs et stats).
     */
    public function calculerClasseComplet($classeId, $periodeId)
    {
        $classe = \App\Models\Classe::find($classeId);
        $periode = Periode::find($periodeId);
        
        // 1. Élèves inscrits
        $inscriptions = Inscription::where('classe_id', $classeId)
            ->where('annee_scolaire_id', $periode->annee_scolaire_id)
            ->with(['eleve.user'])
            ->get();

        $bulletins = new Collection();

        // 2. Calculs individuels
        foreach ($inscriptions as $insc) {
            $bulletins->push($this->calculerBulletin($insc, $periode));
        }

        // 3. Calcul des statistiques de classe par matière
        // On regroupe toutes les lignes de tous les bulletins
        $allLignes = $bulletins->pluck('lignes')->flatten(1);
        
        $statsMatiere = $allLignes->groupBy('cours_id')->map(function ($items) {
            $moyennes = $items->pluck('moyenne');
            return [
                'min' => $moyennes->min(),
                'max' => $moyennes->max(),
                'avg' => round($moyennes->avg(), 2)
            ];
        });

        // 4. Injecter les stats et calculer les rangs par matière
        $bulletins = $bulletins->map(function ($b) use ($statsMatiere) {
             foreach ($b['lignes'] as &$ligne) {
                 $stats = $statsMatiere[$ligne['cours_id']] ?? ['min'=>0, 'max'=>0, 'avg'=>0];
                 $ligne['min'] = $stats['min'];
                 $ligne['max'] = $stats['max'];
                 $ligne['avg'] = $stats['avg'];
             }
             return $b;
        });

        // 5. Calcul du Rang Général
        // Trier par moyenne générale décroissante
        $bulletins = $bulletins->sortByDesc('moyenne_generale')->values();
        
        $bulletins = $bulletins->map(function ($b, $index) {
             $b['rang'] = $index + 1;
             return $b;
        });

        return $bulletins;
    }

    private function getAppreciation($note)
    {
        if ($note >= 18) return 'Excellent';
        if ($note >= 16) return 'Très Bien';
        if ($note >= 14) return 'Bien';
        if ($note >= 12) return 'Assez Bien';
        if ($note >= 10) return 'Passable';
        if ($note >= 8)  return 'Insuffisant';
        return 'Faible';
    }
}

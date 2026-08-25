<?php
$inscription = \App\Models\Inscription::first();
if ($inscription && $inscription->eleve) {
    echo "Eleve trouvé: " . $inscription->eleve->id . "\n";
    $parents = $inscription->eleve->parents;
    if ($parents->isEmpty()) {
        echo "Aucun parent trouvé pour cet élève.\n";
    }
    foreach ($parents as $parent) {
        if ($parent->user) {
            echo "Parent (User ID: " . $parent->user->id . ", Email: " . $parent->user->email . ") va recevoir une notification.\n";
            try {
                $parent->user->notify(new \App\Notifications\AbsenceNotification(
                    $inscription->eleve,
                    date('Y-m-d'),
                    'absence',
                    'Test motif'
                ));
                echo "Notification envoyée.\n";
            } catch (\Exception $e) {
                echo "Erreur notification: " . $e->getMessage() . "\n";
            }
        } else {
            echo "Parent n'a pas de User lié.\n";
        }
    }
} else {
    echo "Aucune inscription/élève.\n";
}

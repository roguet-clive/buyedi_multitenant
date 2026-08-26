<?php

namespace App\Notifications;

use App\Models\DemandeDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DemandeDocumentTraitee extends Notification
{
    use Queueable;

    public function __construct(public DemandeDocument $demande)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $typeDoc = $this->demande->type_label;
        $isApproved = $this->demande->statut === 'approuve';

        $title = $isApproved ? "Document disponible : {$typeDoc}" : "Demande de document refusée";
        $message = $isApproved 
            ? "Votre demande de {$typeDoc} a été validée par l'administration. Vous pouvez dès maintenant le télécharger en PDF."
            : "Votre demande de {$typeDoc} n'a pas pu être validée. Motif : " . ($this->demande->motif_rejet ?: "Non spécifié.");

        $data = [
            'type' => 'demande_document_traitee',
            'title' => $title,
            'message' => $message,
            'statut' => $this->demande->statut,
            'demande_id' => $this->demande->id,
            'action_url' => route('demandes-documents.index', [], false),
            'action_label' => 'Consulter mes demandes',
            'url' => route('demandes-documents.index', [], false),
            'icon' => $isApproved ? 'CheckCircle2' : 'AlertCircle',
        ];

        if ($isApproved) {
            $data['download_url'] = route('demandes-documents.download', $this->demande->id, false);
            $data['download_label'] = 'Télécharger le PDF';
        }

        return $data;
    }
}

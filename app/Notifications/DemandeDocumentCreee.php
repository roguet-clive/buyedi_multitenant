<?php

namespace App\Notifications;

use App\Models\DemandeDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DemandeDocumentCreee extends Notification
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
        $eleveNom = $this->demande->eleve->user->nom_complet ?? ($this->demande->eleve->user->nom . ' ' . $this->demande->eleve->user->prenom);
        $typeDoc = $this->demande->type_label;
        $classe = $this->demande->eleve->inscriptionActuelle?->classe?->nom ?? 'Non assigné';

        return [
            'type' => 'demande_document',
            'title' => 'Nouvelle Demande de Document',
            'message' => "{$eleveNom} ({$classe}) a déposé une demande de {$typeDoc}.",
            'demande_id' => $this->demande->id,
            'eleve_id' => $this->demande->eleve_id,
            'type_document' => $this->demande->type_document,
            'action_url' => route('demandes-documents.index', [], false),
            'action_label' => 'Traiter la demande',
            'url' => route('demandes-documents.index', [], false),
            'icon' => 'FileText',
        ];
    }
}

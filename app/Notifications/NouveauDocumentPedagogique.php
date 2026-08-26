<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NouveauDocumentPedagogique extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public $document)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $matiereNom = $this->document->matiere->nom ?? 'Matière';
        $classeNom = $this->document->classe->nom ?? 'Classe';
        $enseignantNom = $this->document->enseignant->user->full_name ?? 'L\'enseignant';
        
        $typeLabel = match($this->document->type) {
            'cours' => 'un nouveau cours',
            'exercice' => 'un nouvel exercice',
            'devoir' => 'un devoir à rendre',
            default => 'un nouveau document pédagogique',
        };

        $message = "{$enseignantNom} a publié {$typeLabel} en {$matiereNom} pour la classe {$classeNom}.";
        if (!empty($this->document->date_limite)) {
            $message .= " Date limite : " . \Carbon\Carbon::parse($this->document->date_limite)->format('d/m/Y') . ".";
        }

        return [
            'title' => '📚 ' . ucfirst($this->document->type) . ' : ' . $this->document->titre,
            'message' => $message,
            'action_url' => route('documents.index'),
            'download_url' => route('documents.download', $this->document->id),
            'type' => 'document_pedagogique',
            'document_id' => $this->document->id,
            'document_type' => $this->document->type,
            'matiere' => $matiereNom,
            'classe' => $classeNom,
            'enseignant' => $enseignantNom,
        ];
    }
}

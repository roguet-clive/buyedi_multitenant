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
        return [
            'title' => 'Nouveau document : ' . $this->document->titre,
            'message' => 'Un nouveau ' . $this->document->type . ' a été publié en ' . $this->document->matiere->nom . '.',
            'action_url' => route('documents.index'),
            'type' => 'document_pedagogique',
            'document_id' => $this->document->id,
        ];
    }
}

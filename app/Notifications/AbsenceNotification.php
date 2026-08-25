<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Eleve;
use App\Mail\AbsenceNotificationMail;

class AbsenceNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $eleve;
    protected $date;
    protected $type;
    protected $motif;

    /**
     * Create a new notification instance.
     */
    public function __construct(Eleve $eleve, $date, $type, $motif = null)
    {
        $this->eleve = $eleve;
        $this->date = $date;
        $this->type = $type;
        $this->motif = $motif;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable)
    {
        return (new AbsenceNotificationMail($this->eleve, $this->date, $this->type, $this->motif))
            ->to($notifiable->email);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        // Formatage pour la notification DB (affichée dans l'app)
        return [
            'title' => 'Nouvelle ' . ucfirst($this->type),
            'message' => "Votre enfant {$this->eleve->full_name} a été marqué " . ($this->type == 'retard' ? 'en retard' : 'absent') . " le " . \Carbon\Carbon::parse($this->date)->translatedFormat('d/m/Y'),
            'type' => $this->type,
            'eleve_id' => $this->eleve->id,
            'date' => $this->date,
        ];
    }
}

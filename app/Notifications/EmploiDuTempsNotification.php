<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmploiDuTempsNotification extends Notification
{
    use Queueable;

    public function __construct(
        public $classe,
        public $anneeScolaire,
        public string $role = 'eleve', // 'enseignant', 'eleve', 'parent'
        public ?string $details = null
    ) {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // Notification via base de données (cloche dans l'application)
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $classeNom = $this->classe->nom ?? 'votre classe';
        $anneeNom = $this->anneeScolaire->nom ?? date('Y');

        $mail = (new MailMessage)
            ->subject("📅 Emploi du temps mis à jour - {$classeNom}")
            ->greeting("Bonjour {$notifiable->prenom} {$notifiable->nom},");

        if ($this->role === 'enseignant') {
            $mail->line("L'emploi du temps pour la classe **{$classeNom}** ({$anneeNom}) a été publié ou mis à jour.")
                 ->line("Vous y êtes programmé(e) pour dispenser vos cours.");
        } elseif ($this->role === 'parent') {
            $mail->line("L'emploi du temps de la classe **{$classeNom}** de votre enfant a été publié pour l'année scolaire {$anneeNom}.");
        } else {
            $mail->line("Le planning hebdomadaire de votre classe **{$classeNom}** a été mis à jour.");
        }

        if ($this->details) {
            $mail->line($this->details);
        }

        return $mail->action('Consulter mon emploi du temps', route('emploi_du_temps.index'))
                    ->line('Vous pouvez le consulter et le télécharger en PDF dès maintenant.');
    }

    /**
     * Get the array representation of the notification (Database).
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $classeNom = $this->classe->nom ?? 'Classe';
        $anneeNom = $this->anneeScolaire->nom ?? '';

        if ($this->role === 'enseignant') {
            $title = "👨‍🏫 Emploi du temps - {$classeNom}";
            $message = "L'emploi du temps de la classe {$classeNom} a été mis à jour. Consultez vos nouveaux créneaux de cours.";
        } elseif ($this->role === 'parent') {
            $title = "👨‍👩‍👧 Emploi du temps - {$classeNom}";
            $message = "Le planning des cours de la classe {$classeNom} est maintenant disponible et téléchargeable.";
        } else {
            $title = "🎓 Emploi du temps publié ({$classeNom})";
            $message = "Votre emploi du temps pour la classe {$classeNom} est disponible. Vous pouvez le consulter et le télécharger en PDF.";
        }

        return [
            'title' => $title,
            'message' => $message,
            'action_url' => route('emploi_du_temps.index'),
            'type' => 'emploi_du_temps',
            'classe_id' => $this->classe->id ?? null,
            'classe_nom' => $classeNom,
            'annee_scolaire' => $anneeNom,
            'role_destinataire' => $this->role,
        ];
    }
}

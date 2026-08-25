<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Eleve;
use Carbon\Carbon;

class AbsenceNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $eleve;
    public $date;
    public $type;
    public $motif;

    /**
     * Create a new message instance.
     */
    public function __construct(Eleve $eleve, $date, $type, $motif = null)
    {
        $this->eleve = $eleve;
        $this->date = Carbon::parse($date)->translatedFormat('l d F Y');
        $this->type = ucfirst($type);
        $this->motif = $motif;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nouvelle ' . $this->type . ' de ' . $this->eleve->full_name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.absences.notification',
            with: [
                'eleveName' => $this->eleve->full_name,
                'date' => $this->date,
                'type' => $this->type,
                'motif' => $this->motif,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

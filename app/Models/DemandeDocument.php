<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeDocument extends Model
{
    use HasFactory;

    protected $table = 'demandes_documents';

    protected $fillable = [
        'eleve_id',
        'user_id',
        'type_document',
        'motif',
        'statut',
        'motif_rejet',
        'traite_par_id',
        'date_traitement',
        'annee_scolaire_id',
    ];

    protected $casts = [
        'date_traitement' => 'datetime',
    ];

    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function traitePar()
    {
        return $this->belongsTo(User::class, 'traite_par_id');
    }

    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    public function getTypeLabelAttribute()
    {
        return match ($this->type_document) {
            'certificat_scolarite' => 'Certificat de Scolarité',
            'carte_scolaire' => 'Carte Scolaire Officielle',
            'fiche_synthese' => 'Fiche de Synthèse & Dossier',
            'attestation_inscription' => 'Attestation d\'Inscription',
            default => ucfirst(str_replace('_', ' ', $this->type_document)),
        };
    }
}

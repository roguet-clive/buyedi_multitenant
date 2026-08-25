<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmploiDuTemps extends Model
{
    protected $fillable = [
        'classe_id',
        'matiere_id',
        'enseignant_id',
        'annee_scolaire_id',
        'periode_id',
        'jour',
        'heure_debut',
        'heure_fin',
        'salle',
    ];

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    public function periode()
    {
        return $this->belongsTo(Periode::class);
    }
}

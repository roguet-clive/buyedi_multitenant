<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Enseignant;
use App\Models\Matiere;

class Cours extends Model
{
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
        ->logOnly(['is_titulaire'])
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs();
    }
    protected $fillable = [
        'annee_scolaire_id',
        'classe_id',
        'enseignant_id',
        'matiere_id',
        'periode_id',
        'is_titulaire',
        'coefficient'
    ];

    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }

    public function evaluations()
    {
        return $this->hasMany(Evaluation::class);
    }

    public function periode()
    {
        return $this->belongsTo(Periode::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FraisClasse extends Model
{
    use HasFactory;
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logOnly(['classe_id', 'annee_scolaire_id', 'frais_type_id', 'montant'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Frais de Classe {$eventName}");
    }

    protected $fillable = [
        'classe_id',
        'annee_scolaire_id',
        'frais_type_id',
        'montant',
    ];

    // Relation vers la classe
    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    // Relation vers l'année scolaire
    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    // Relation vers le type de frais
    public function fraisType()
    {
        return $this->belongsTo(FraisType::class);
    }

    // Échéances associées à ce frais de classe
    public function echeances()
    {
        return $this->hasMany(FraisEcheance::class)->orderBy('ordre');
    }
}

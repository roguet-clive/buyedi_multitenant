<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FraisType extends Model
{
    use HasFactory;
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logOnly(['nom', 'code', 'montant', 'annee_scolaire_id', 'globale', 'is_scolarite'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Type de Frais {$eventName}");
    }

    protected $fillable = ['nom', 'code', 'montant', 'annee_scolaire_id', 'globale', 'is_scolarite'];

    // Relation avec frais d’inscription
    public function fraisInscriptions()
    {
        return $this->hasMany(FraisInscription::class);
    }

    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    // Relation avec frais par classe
    public function fraisClasses()
    {
        return $this->hasMany(FraisClasse::class);
    }
}

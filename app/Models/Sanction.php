<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sanction extends Model
{
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logOnly(['eleve_id', 'type_sanction_id', 'decideur_id', 'motif', 'date_sanction', 'date_fin'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Sanction {$eventName}");
    }

    protected $fillable = [
        'eleve_id', 'type_sanction_id', 'annee_scolaire_id', 'decideur_id',
        'motif', 'date_sanction', 'date_fin'
    ];

    protected $casts = [
        'date_sanction' => 'date',
        'date_fin' => 'date',
    ];

    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }

    public function type()
    {
        return $this->belongsTo(TypeSanction::class, 'type_sanction_id');
    }

    public function decideur()
    {
        return $this->belongsTo(User::class, 'decideur_id');
    }

    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }
}

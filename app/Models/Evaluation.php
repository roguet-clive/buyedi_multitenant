<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logOnly(['cours_id', 'titre', 'type', 'coefficient', 'note_max', 'date_evaluation', 'periode_id'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Évaluation {$eventName}");
    }

    protected $fillable = [
        'cours_id',
        'titre',
        'type',
        'coefficient',
        'note_max',
        'date_evaluation',
        'periode', // On garde temporairement pour compatibilité
        'periode_id'
    ];

    protected $casts = [
        'date_evaluation' => 'date',
    ];

    public function cours()
    {
        return $this->belongsTo(Cours::class);
    }

    public function periode()
    {
        return $this->belongsTo(Periode::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
        ->logOnly(['date', 'type', 'justifiee'])
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs();
    }
    protected $fillable = ['inscription_id', 'date', 'type', 'justifiee', 'motif'];

    protected $casts = [
        'date' => 'date',
        'justifiee' => 'boolean',
    ];

    public function inscription()
    {
        return $this->belongsTo(Inscription::class);
    }
}

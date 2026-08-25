<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
        ->logOnly(['valeur', 'appreciation'])
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs();
    }
    protected $fillable = [
        'evaluation_id',
        'inscription_id',
        'valeur',
        'appreciation'
    ];

    public function evaluation()
    {
        return $this->belongsTo(Evaluation::class);
    }

    public function inscription()
    {
        return $this->belongsTo(Inscription::class);
    }
}

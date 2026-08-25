<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Personnel extends Model
{
    use HasFactory;
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
        ->logOnly(['poste', 'telephone', 'salaire'])
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs();
    }

    protected $fillable = [
        'user_id',
        'poste',
        'telephone',
        'adresse',
        'sexe',
        'date_embauche',
        'date_naissance',
        'lieu_naissance',
        'matricule',
        'cnss',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

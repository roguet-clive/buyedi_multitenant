<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParentModel extends Model
{
    use HasFactory;
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
        ->logOnly(['telephone', 'adresse'])
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs();
    }

    protected $table = 'parents';

    protected $fillable = [
        'user_id',
        'telephone',
        'adresse',
        'profession',
        'sexe',
        'date_naissance',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // 🔹 Relation avec les élèves via la table pivot eleve_parent
    public function eleves()
    {
        return $this->belongsToMany(Eleve::class, 'eleve_parent', 'parent_id', 'eleve_id')
                    ->withPivot('lien')
                    ->withTimestamps();
    }
}

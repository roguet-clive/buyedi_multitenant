<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    use HasFactory;
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
        ->logOnly(['montant', 'date_paiement', 'reference'])
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs();
    }

    protected $fillable = [
        'inscription_id',
        'frais_type_id',
        'user_id',
        'montant',
        'date_paiement',
        'mode_paiement',
        'reference',
        'mois',
        'commentaire'
    ];

    protected $casts = [
        'date_paiement' => 'date',
        'montant' => 'decimal:2',
    ];

    // Relations
    public function inscription()
    {
        return $this->belongsTo(Inscription::class);
    }

    public function fraisType()
    {
        return $this->belongsTo(FraisType::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Accessors
    public function getEleveAttribute()
    {
        return $this->inscription->eleve ?? null;
    }

    public function getAnneeScolaireAttribute()
    {
        return $this->inscription->anneeScolaire ?? null;
    }
}

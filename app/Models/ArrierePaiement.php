<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class ArrierePaiement extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'arriere_paiements';

    protected $fillable = [
        'arriere_id',
        'user_id',
        'numero_recu',
        'montant',
        'date_paiement',
        'mode_paiement',
        'reference_paiement',
        'commentaire',
    ];

    protected $casts = [
        'date_paiement' => 'date',
        'montant' => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['numero_recu', 'montant', 'date_paiement', 'mode_paiement'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relations
    public function arriere()
    {
        return $this->belongsTo(Arriere::class, 'arriere_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id'); // Caissier
    }

    public function paiement()
    {
        return $this->hasOne(Paiement::class, 'arriere_paiement_id');
    }
}

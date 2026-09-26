<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Depense extends Model
{
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
        ->logOnly(['montant', 'description', 'date_depense', 'categorie', 'numero_facture', 'mode_paiement', 'beneficiaire'])
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs();
    }

    protected $fillable = [
        'user_id',
        'categorie',
        'montant',
        'description',
        'date_depense',
        'facture_path',
        'numero_facture',
        'mode_paiement',
        'beneficiaire',
    ];

    protected $casts = [
        'date_depense' => 'date',
        'montant' => 'decimal:2',
    ];

    protected $appends = [
        'facture_url',
    ];

    public function getFactureUrlAttribute()
    {
        return $this->facture_path ? asset('storage/' . $this->facture_path) : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

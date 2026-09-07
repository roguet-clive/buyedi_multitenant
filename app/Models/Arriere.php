<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Arriere extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'arrieres';

    protected $fillable = [
        'eleve_id',
        'nom_eleve',
        'prenom_eleve',
        'matricule',
        'classe_origine',
        'annee_scolaire_dette',
        'montant_total',
        'montant_paye',
        'montant_restant',
        'statut',
        'frais_type_id',
        'observations',
        'created_by',
    ];

    protected $casts = [
        'montant_total' => 'decimal:2',
        'montant_paye' => 'decimal:2',
        'montant_restant' => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['nom_eleve', 'montant_total', 'montant_paye', 'montant_restant', 'statut', 'annee_scolaire_dette'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relations
    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }

    public function fraisType()
    {
        return $this->belongsTo(FraisType::class);
    }

    public function paiements()
    {
        return $this->hasMany(ArrierePaiement::class, 'arriere_id')->orderBy('date_paiement', 'desc');
    }

    public function createur()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Accessors
    public function getNomCompletAttribute(): string
    {
        return trim(($this->nom_eleve ?? '') . ' ' . ($this->prenom_eleve ?? ''));
    }

    public function getPourcentagePayeAttribute(): float
    {
        if ($this->montant_total <= 0) return 100;
        return round(($this->montant_paye / $this->montant_total) * 100, 1);
    }
}

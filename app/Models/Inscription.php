<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Inscription extends Model
{
    use HasFactory;
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logOnly(['eleve_id', 'classe_id', 'numero_recu', 'total_frais', 'date_inscription', 'statut', 'reinscription', 'has_remise', 'remise_montant', 'remise_pourcentage'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Inscription {$eventName}");
    }

    protected $fillable = [
        'eleve_id',
        'classe_id',
        'annee_scolaire_id',
        'numero_recu',
        'code_securite',
        'total_frais',      // Informations Bulletin (Appréciations, Décisions)
        'date_inscription',
        'reinscription',
        'has_remise',
        'remise_pourcentage',
        'remise_montant',
        'statut', // brouillon, en_attente, validee, rejete
    ];

    protected $casts = [
        'total_frais' => 'decimal:2',
        'date_inscription' => 'date',
        'reinscription' => 'boolean',
        'has_remise' => 'boolean',
        'remise_pourcentage' => 'decimal:2',
        'remise_montant' => 'decimal:2',
    ];

    protected $appends = [
        'tenue_payee',
        'montant_tenue_exigible',
        'reste_tenue',
    ];

    // -------------------------
    // RELATIONS
    // -------------------------

    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class);
    }

    public function bulletinInfos()
    {
        return $this->hasMany(BulletinInfo::class);
    }

    // -------------------------
    // SCOPES / UTILITAIRES
    // -------------------------

    /**
     * Récupère l'inscription de l'année scolaire en cours pour un élève
     */
    public static function enCours(Eleve $eleve)
    {
        return self::where('eleve_id', $eleve->id)
            ->whereHas('anneeScolaire', fn($q) => $q->where('en_cours', true))
            ->first();
    }

    /**
     * Vérifie si la tenue scolaire a été réglée pour cette inscription
     */
    public function getTenuePayeeAttribute(): bool
    {
        if ($this->relationLoaded('paiements')) {
            return $this->paiements->contains(function ($p) {
                return $p->fraisType && ($p->fraisType->code === 'tenue' || stripos($p->fraisType->nom, 'tenue') !== false);
            });
        }

        return $this->paiements()->whereHas('fraisType', function ($ft) {
            $ft->where('code', 'tenue')->orWhere('nom', 'like', '%tenue%');
        })->exists();
    }

    /**
     * Récupère le paiement correspondant à la tenue scolaire
     */
    public function getPaiementTenueAttribute()
    {
        if ($this->relationLoaded('paiements')) {
            return $this->paiements->first(function ($p) {
                return $p->fraisType && ($p->fraisType->code === 'tenue' || stripos($p->fraisType->nom, 'tenue') !== false);
            });
        }

        return $this->paiements()->whereHas('fraisType', function ($ft) {
            $ft->where('code', 'tenue')->orWhere('nom', 'like', '%tenue%');
        })->first();
    }

    /**
     * Montant exigible pour la tenue scolaire selon la classe (10 000 ou 15 000 FCFA)
     */
    public function getMontantTenueExigibleAttribute(): float
    {
        return $this->classe ? (float) $this->classe->montant_tenue : 10000.00;
    }

    /**
     * Reste à payer pour la tenue scolaire
     */
    public function getResteTenueAttribute(): float
    {
        if ($this->tenue_payee) {
            return 0.00;
        }

        $exigible = $this->montant_tenue_exigible;
        $paye = $this->paiement_tenue ? (float) $this->paiement_tenue->montant : 0.00;
        return max(0.00, $exigible - $paye);
    }
}

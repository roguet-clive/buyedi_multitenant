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
        ->logOnly(['numero_recu', 'total_frais', 'date_inscription'])
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs();
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
        'statut', // brouillon, en_attente, validee, rejete
    ];

    protected $casts = [
        'total_frais' => 'decimal:2',
        'date_inscription' => 'date',
        'reinscription' => 'boolean',
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
}

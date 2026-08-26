<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Eleve extends Model
{
    use HasFactory;
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
        ->logOnly(['matricule', 'sexe', 'date_naissance'])
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs();
    }

    protected $fillable = [
        'user_id',
        'matricule',
        'sexe',
        'date_naissance',
        'lieu_naissance',
        'probleme_particulier',
        'photo', // chemin vers la photo de l'élève
    ];

    protected $casts = [
        'date_naissance' => 'date',
    ];

    // Relation avec User pour l'authentification
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Documents liés à l'élève
    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    // Historique des inscriptions
    public function inscriptions()
    {
        return $this->hasMany(Inscription::class);
    }

    public function sanctions()
    {
        return $this->hasMany(Sanction::class);
    }

    // Inscription pour l'année scolaire en cours
    public function inscriptionEnCours()
    {
        return $this->hasOne(Inscription::class)->whereHas('anneeScolaire', function($q) {
            $q->where('en_cours', true);
        });
    }

    // Dernière inscription (historique ou actuelle)
    public function inscriptionActuelle()
    {
        return $this->hasOne(Inscription::class)->latestOfMany('date_inscription');
    }

    // Classe actuelle (priorité à l'année en cours, sinon la plus récente)
    public function classeActuelle()
    {
        $inscription = $this->inscriptionEnCours()->first() ?? $this->inscriptionActuelle()->first();
        return $inscription?->classe;
    }

    // Parents via pivot eleve_parent
    public function parents()
    {
        return $this->belongsToMany(ParentModel::class, 'eleve_parent', 'eleve_id', 'parent_id')
                    ->withPivot('lien')
                    ->withTimestamps();
    }

    // Helper pour le nom complet
    public function getFullNameAttribute(): string
    {
        if ($this->relationLoaded('user') && $this->user) {
            return trim(($this->user->prenom ?? '') . ' ' . ($this->user->nom ?? ''));
        }
        return $this->matricule;
    }
}

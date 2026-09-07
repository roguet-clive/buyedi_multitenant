<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Classe extends Model
{
    use HasFactory;
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logOnly(['nom', 'type'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Classe {$eventName}");
    }

    protected $fillable = ['nom', 'type'];

    protected $appends = ['mode_paiement_scolarite', 'is_examen', 'montant_tenue'];

    public function inscriptions()
    {
        return $this->hasMany(Inscription::class);
    }

    public function cours()
    {
        return $this->hasMany(Cours::class);
    }

    public function emploisDuTemps()
    {
        return $this->hasMany(EmploiDuTemps::class);
    }
    
    // Helpers pour simplifier la logique
    public function isMaternelle()
    {
        return $this->type === 'maternelle';
    }

    public function isPrimaire()
    {
        return $this->type === 'primaire';
    }

    public function isMaternelleOuPrimaire()
    {
        return in_array($this->type, ['maternelle', 'primaire']);
    }
    
    public function isSecondaire()
    {
        return $this->type === 'secondaire';
    }

    public function isCinquiemeAnneePrimaire(): bool
    {
        if ($this->type !== 'primaire') {
            return false;
        }
        $nom = trim(mb_strtolower($this->nom));
        return str_contains($nom, '5') || str_contains($nom, 'cinquieme') || str_contains($nom, 'cinquième') || str_contains($nom, 'cm2');
    }

    public function isClasseExamen(): bool
    {
        $nom = trim(mb_strtolower($this->nom));
        return in_array($nom, ['3e', '3ème', '3eme', 'troisieme', 'troisième', 'tle', 'terminale']);
    }

    public function getIsExamenAttribute(): bool
    {
        return $this->isClasseExamen();
    }

    public function getModePaiementScolariteAttribute(): string
    {
        return $this->isSecondaire() ? 'tranches' : 'mensuel';
    }

    /**
     * Montant de la tenue scolaire selon le cycle
     * Maternelle & Primaire : 10 000 FCFA
     * Secondaire : 15 000 FCFA
     */
    public function getMontantTenueAttribute(): float
    {
        return $this->isSecondaire() ? 15000.00 : 10000.00;
    }
}

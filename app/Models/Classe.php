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

    protected $appends = ['mode_paiement_scolarite', 'is_examen', 'montant_tenue', 'montant_bulletin', 'montant_mensuel_officiel'];

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
    public function isCreche(): bool
    {
        return $this->type === 'creche' || str_contains(mb_strtolower($this->nom), 'crèche') || str_contains(mb_strtolower($this->nom), 'creche');
    }

    public function isMaternelle(): bool
    {
        return $this->type === 'maternelle';
    }

    public function isPrimaire(): bool
    {
        return $this->type === 'primaire';
    }

    public function isMaternelleOuPrimaire(): bool
    {
        return in_array($this->type, ['creche', 'maternelle', 'primaire']);
    }
    
    public function isSecondaire(): bool
    {
        return $this->type === 'secondaire';
    }

    public function isQuatriemeAnneePrimaire(): bool
    {
        if ($this->type !== 'primaire') {
            return false;
        }
        $nom = trim(mb_strtolower($this->nom));
        return str_contains($nom, '4') || str_contains($nom, 'quatrieme') || str_contains($nom, 'quatrième') || str_contains($nom, 'ce2');
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
     * Résout la mensualité officielle selon la grille tarifaire CSSD ou le paramétrage FraisClasse
     */
    public function getMontantMensuelOfficielAttribute(): float
    {
        // 1. Vérifier si un paramétrage de scolarité par classe existe pour l'année en cours
        $anneeId = AnneeScolaire::where('en_cours', true)->value('id');
        if ($anneeId) {
            $fraisClasse = FraisClasse::where('classe_id', $this->id)
                ->where('annee_scolaire_id', $anneeId)
                ->whereHas('fraisType', fn($q) => $q->where('is_scolarite', true))
                ->first();

            if ($fraisClasse && (float)$fraisClasse->montant > 0) {
                if ($fraisClasse->mode_paiement === 'mensuel' && $fraisClasse->echeances()->count() > 0) {
                    return (float) $fraisClasse->echeances()->first()->montant;
                }
                return round((float)$fraisClasse->montant / 9, 2);
            }
        }

        $nom = mb_strtolower($this->nom);

        // Crèche
        if ($this->isCreche()) {
            if (str_contains($nom, '16h')) {
                return 30000.0;
            }
            return 20000.0;
        }

        // Maternelle (3 ans, 4 ans, 5 ans)
        if ($this->isMaternelle()) {
            return 20000.0;
        }

        // Primaire
        if ($this->isPrimaire()) {
            if ($this->isCinquiemeAnneePrimaire()) {
                return 30000.0;
            }
            if ($this->isQuatriemeAnneePrimaire()) {
                return 25000.0;
            }
            return 20000.0;
        }

        // Secondaire
        if ($this->isClasseExamen()) {
            return 16111.0; // 145 000 / 9
        }
        return 15000.0; // 135 000 / 9
    }

    /**
     * Montant de la tenue scolaire (priorité au paramétrage de classe, repli sur frais_types)
     */
    public function getMontantTenueAttribute(): float
    {
        $anneeId = AnneeScolaire::where('en_cours', true)->value('id');
        if ($anneeId) {
            $fc = FraisClasse::where('classe_id', $this->id)
                ->where('annee_scolaire_id', $anneeId)
                ->whereHas('fraisType', fn($q) => $q->where('code', 'tenue')->orWhere('nom', 'like', '%tenue%')->where('code', '!=', 'tenue_sport')->where('nom', 'not like', '%sport%'))
                ->first();
            if ($fc && (float)$fc->montant > 0) {
                return (float)$fc->montant;
            }
        }

        $montant = FraisType::where('code', 'tenue')
            ->orWhere('nom', 'like', '%tenue%')
            ->where('code', '!=', 'tenue_sport')
            ->where('nom', 'not like', '%sport%')
            ->value('montant');

        return (float) ($montant ?? 0.0);
    }

    /**
     * Montant Bulletin / Assurance (priorité au paramétrage de classe, repli sur frais_types)
     */
    public function getMontantBulletinAttribute(): float
    {
        $anneeId = AnneeScolaire::where('en_cours', true)->value('id');
        if ($anneeId) {
            $fc = FraisClasse::where('classe_id', $this->id)
                ->where('annee_scolaire_id', $anneeId)
                ->whereHas('fraisType', fn($q) => $q->where('code', 'bulletin_assurance')->orWhere('code', 'bulletin')->orWhere('nom', 'like', '%bulletin%'))
                ->first();
            if ($fc && (float)$fc->montant > 0) {
                return (float)$fc->montant;
            }
        }

        $montant = FraisType::where('code', 'bulletin_assurance')
            ->orWhere('code', 'bulletin')
            ->orWhere('nom', 'like', '%bulletin%')
            ->value('montant');

        return (float) ($montant ?? 0.0);
    }
}

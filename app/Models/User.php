<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
        ->logOnly(['nom', 'prenom', 'email', 'telephone'])
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs();
    }

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'telephone',
        'password',
        'is_super_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_super_admin' => 'boolean',
        ];
    }

    /**
     * Détermine si l'utilisateur est Super-Administrateur.
     */
    public function isSuperAdmin(): bool
    {
        if (!tenancy()->initialized) {
            return (bool) ($this->is_super_admin || $this->email === 'admin@buyedi.com');
        }

        try {
            return $this->hasRole('super-admin') || $this->hasRole('superadmin');
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Retourne le nom complet de l'utilisateur (prenom + nom).
     */
    public function getFullNameAttribute(): string
    {
        return trim("{$this->prenom} {$this->nom}");
    }

    /**
     * Ajoute automatiquement full_name dans les réponses JSON / Inertia.
     */
    protected $appends = ['full_name'];

    public function eleve()
    {
        return $this->hasOne(Eleve::class);
    }

    public function enseignant()
    {
        return $this->hasOne(Enseignant::class);
    }

    public function personnel()
    {
        return $this->hasOne(Personnel::class);
    }

    public function contrat()
    {
        return $this->hasOne(Contrat::class);
    }

    public function paiementsSalaires()
    {
        return $this->hasMany(PaiementSalaire::class);
    }

    public function parent()
    {
        return $this->hasOne(ParentModel::class);
    }
}

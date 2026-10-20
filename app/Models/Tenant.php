<?php

namespace App\Models;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'actif_jusqu_a' => 'datetime',
    ];

    /**
     * Colonnes personnalisées stockées directement dans la table tenants
     */
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'nom',
            'email',
            'telephone',
            'statut',
            'formule',
            'trial_ends_at',
            'actif_jusqu_a',
        ];
    }

    /**
     * Récupère le premier sous-domaine lié au tenant
     */
    public function getSubdomainAttribute(): ?string
    {
        return $this->domains->first()?->domain;
    }

    /**
     * Vérifie si l'établissement est actif
     */
    public function isActive(): bool
    {
        if ($this->statut === 'suspendu') {
            return false;
        }

        if ($this->statut === 'actif') {
            return $this->actif_jusqu_a === null || $this->actif_jusqu_a->isFuture();
        }

        if ($this->statut === 'essai') {
            return $this->trial_ends_at === null || $this->trial_ends_at->isFuture();
        }

        return false;
    }

    /**
     * Vérifie si l'établissement est en période d'essai
     */
    public function isTrial(): bool
    {
        return $this->statut === 'essai';
    }

    /**
     * Vérifie si l'établissement est suspendu
     */
    public function isSuspended(): bool
    {
        return $this->statut === 'suspendu';
    }

    /**
     * Historique des paiements d'abonnement SaaS
     */
    public function subscriptionPayments()
    {
        return $this->hasMany(SubscriptionPayment::class, 'tenant_id', 'id');
    }
}

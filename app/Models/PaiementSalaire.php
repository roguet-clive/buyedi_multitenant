<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaiementSalaire extends Model
{
    protected $table = 'paiements_salaires';

    protected $fillable = [
        'user_id', 'auteur_id', 'mois', 'annee',
        'salaire_brut', 'primes', 'retenues', 'net_a_payer',
        'date_paiement', 'commentaire'
    ];

    protected $casts = [
        'date_paiement' => 'date',
        'salaire_brut' => 'decimal:2',
        'primes' => 'decimal:2',
        'retenues' => 'decimal:2',
        'net_a_payer' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function auteur()
    {
        return $this->belongsTo(User::class, 'auteur_id');
    }
}

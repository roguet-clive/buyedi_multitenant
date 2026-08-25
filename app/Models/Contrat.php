<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class Contrat extends Model
{
    protected $fillable = ['user_id', 'type', 'salaire_base', 'taux_horaire', 'date_debut', 'date_fin', 'actif'];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'actif' => 'boolean',
        'salaire_base' => 'decimal:2',
        'taux_horaire' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

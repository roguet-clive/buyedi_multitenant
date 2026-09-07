<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FraisEcheance extends Model
{
    use HasFactory;

    protected $fillable = [
        'frais_classe_id',
        'nom',
        'montant',
        'date_limite',
        'ordre',
        'type',
    ];

    protected $casts = [
        'montant' => 'float',
        'date_limite' => 'date',
        'ordre' => 'integer',
    ];

    public function fraisClasse()
    {
        return $this->belongsTo(FraisClasse::class);
    }
}

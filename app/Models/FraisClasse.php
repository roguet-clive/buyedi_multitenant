<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FraisClasse extends Model
{
    use HasFactory;

    protected $fillable = [
        'classe_id',
        'annee_scolaire_id',
        'frais_type_id',
        'montant',
    ];

    // Relation vers la classe
    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    // Relation vers l'année scolaire
    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    // Relation vers le type de frais
    public function fraisType()
    {
        return $this->belongsTo(FraisType::class);
    }
}

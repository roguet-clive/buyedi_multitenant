<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appel extends Model
{
    use HasFactory;

    protected $fillable = [
        'classe_id',
        'annee_scolaire_id',
        'user_id',
        'date',
        'verrouille',
        'statut',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'verrouille' => 'boolean',
    ];

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

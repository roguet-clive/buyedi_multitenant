<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sanction extends Model
{
    protected $fillable = [
        'eleve_id', 'type_sanction_id', 'annee_scolaire_id', 'decideur_id',
        'motif', 'date_sanction', 'date_fin'
    ];

    protected $casts = [
        'date_sanction' => 'date',
        'date_fin' => 'date',
    ];

    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }

    public function type()
    {
        return $this->belongsTo(TypeSanction::class, 'type_sanction_id');
    }

    public function decideur()
    {
        return $this->belongsTo(User::class, 'decideur_id');
    }

    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }
}

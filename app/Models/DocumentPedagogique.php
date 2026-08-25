<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentPedagogique extends Model
{
    use HasFactory;

    protected $table = 'documents_pedagogiques';

    protected $fillable = [
        'titre',
        'description',
        'type',
        'fichier_path',
        'date_limite',
        'classe_id',
        'matiere_id',
        'enseignant_id',
        'annee_scolaire_id',
    ];

    protected $casts = [
        'date_limite' => 'date',
    ];

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }
}

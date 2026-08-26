<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'eleve_id',    // Lien avec l'élève
        'nom',         // Nom du document (ex: "Bulletin", "Certificat", "Photo")
        'fichier',     // Chemin du fichier stocké
        'type',        // Optionnel : type mime ou catégorie
        'description', // Optionnel : description du document
        'date_upload', // Date de dépôt
    ];

    /**
     * Relation vers l'élève
     */
    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }

    /**
     * Accesseur pour obtenir l'URL complète du document
     */
    public function getUrlAttribute(): ?string
    {
        return $this->fichier ? asset('storage/' . $this->fichier) : null;
    }
}

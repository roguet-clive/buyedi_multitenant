<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etablissement extends Model
{
    protected $table = 'etablissements';

    protected $fillable = ['nom', 'sigle', 'logo', 'modele_bulletin', 'modele_fiche_etudiant', 'adresse', 'telephone', 'email'];

    // Relation logique vers les années scolaires
    public function anneesScolaires()
    {
        return AnneeScolaire::all();
    }

    // Récupérer l'année en cours
    public function anneeEnCours()
    {
        return AnneeScolaire::enCours()->first();
    }
}

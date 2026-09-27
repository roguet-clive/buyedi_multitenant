<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etablissement extends Model
{
    protected $table = 'etablissements';

    protected $fillable = [
        'nom',
        'sigle',
        'logo',
        'adresse',
        'ville',
        'telephone',
        'email',
        'modules_actifs',
        'formule_licence',
    ];

    protected $casts = [
        'modules_actifs' => 'array',
    ];

    /**
     * Vérifie si un module spécifique est activé pour l'établissement.
     */
    public function hasModule(string $module): bool
    {
        $actifs = $this->modules_actifs ?? [];
        if (!is_array($actifs)) {
            $actifs = json_decode($actifs, true) ?? [];
        }
        return in_array($module, $actifs, true);
    }

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

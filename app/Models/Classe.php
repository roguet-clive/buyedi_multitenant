<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Classe extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'type'];

    public function inscriptions()
    {
        return $this->hasMany(Inscription::class);
    }

    public function cours()
    {
        return $this->hasMany(Cours::class);
    }

    public function emploisDuTemps()
    {
        return $this->hasMany(EmploiDuTemps::class);
    }
    
    // Helpers pour simplifier la logique
    public function isMaternelle()
    {
        return $this->type === 'maternelle';
    }

    public function isPrimaire()
    {
        return $this->type === 'primaire' || $this->type === 'maternelle';
    }
    
    public function isSecondaire()
    {
        return $this->type === 'secondaire';
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\DB;

class AnneeScolaire extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'en_cours'];

    protected $casts = [
        'en_cours' => 'boolean',
    ];

    public function scopeEnCours($query)
    {
        return $query->where('en_cours', true);
    }

    // Définir cette année comme en cours (une seule à la fois)
    public function setAsCurrent(): void
    {
        DB::transaction(function () {
            self::query()
                ->where('en_cours', true)
                ->where('id', '!=', $this->id)
                ->update(['en_cours' => false]);

            $this->forceFill(['en_cours' => true])->save();
        });
    }

    public function periodes()
    {
        return $this->hasMany(Periode::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BulletinInfo extends Model
{
    protected $fillable = [
        'inscription_id', 'periode_id', 'appreciation_generale',
        'decision_conseil', 'mention', 'note_conduite'
    ];

    public function inscription()
    {
        return $this->belongsTo(Inscription::class);
    }

    public function periode()
    {
        return $this->belongsTo(Periode::class);
    }
}

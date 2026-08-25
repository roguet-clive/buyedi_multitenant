<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TypeSanction extends Model
{
    protected $table = 'types_sanctions';
    protected $fillable = ['nom', 'gravite', 'description'];

    public function sanctions()
    {
        return $this->hasMany(Sanction::class);
    }
}

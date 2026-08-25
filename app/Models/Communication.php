<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Communication extends Model
{
    protected $fillable = [
        'sender_id',
        'subject',
        'message',
        'type',
        'target_type',
        'target_id'
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipients()
    {
        return $this->belongsToMany(User::class, 'communication_user')
            ->withPivot('read_at')
            ->withTimestamps();
    }
}

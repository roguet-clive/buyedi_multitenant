<?php

namespace App\Traits;

use App\Models\Enseignant;
use Illuminate\Support\Facades\Auth;

trait HandlesTeacherAccess
{
    /**
     * Check if the authenticated user is a teacher.
     */
    public function isTeacher(): bool
    {
        return Auth::check() && Auth::user()->hasRole('enseignant');
    }

    /**
     * Get the Enseignant model for the authenticated user.
     */
    public function getTeacher()
    {
        if (!$this->isTeacher()) {
            return null;
        }

        return Enseignant::where('user_id', Auth::id())->first();
    }

    /**
     * Get IDs of classes where the teacher intervenes.
     */
    public function getTeacherClassIds()
    {
        $teacher = $this->getTeacher();

        if (!$teacher) {
            return [];
        }

        $currentYear = \App\Models\AnneeScolaire::where('en_cours', true)->first();

        return \App\Models\Cours::where('enseignant_id', $teacher->id)
            ->where('annee_scolaire_id', $currentYear->id)
            ->pluck('classe_id')
            ->unique()
            ->toArray();
    }
}

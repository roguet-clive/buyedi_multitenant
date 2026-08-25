<?php

namespace App\Traits;

use App\Models\Eleve;
use App\Models\AnneeScolaire;
use App\Models\Inscription;
use Illuminate\Http\Request;

trait HandlesStudentAccess
{
    /**
     * Check if current user is a student.
     */
    protected function isStudent(): bool
    {
        return auth()->check() && auth()->user()->hasRole('eleve');
    }

    /**
     * Get the current Student profile and active Inscription.
     * Throws or redirects if missing (optional).
     */
    protected function getStudentInscription()
    {
        $user = auth()->user();
        $eleve = Eleve::where('user_id', $user->id)->first();
        
        if (!$eleve) {
            return null;
        }

        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        if (!$currentYear) {
            return null; // Handle error elsewhere if needed
        }

        return Inscription::where('eleve_id', $eleve->id)
            ->where('annee_scolaire_id', $currentYear->id)
            ->first();
    }
}

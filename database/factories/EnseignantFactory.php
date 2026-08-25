<?php

namespace Database\Factories;

use App\Models\Enseignant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EnseignantFactory extends Factory
{
    protected $model = Enseignant::class;

    public function definition(): array
    {
        $sexe = fake()->randomElement(['M', 'F']);

        // Generate names here to be consistent if not using User
        $nom = fake()->lastName();
        $prenom = fake()->firstName($sexe === 'M' ? 'male' : 'female');

        return [
            'nom' => $nom,
            'prenom' => $prenom,
            'sexe' => $sexe,
            'telephone' => fake()->phoneNumber(),
            'adresse' => fake()->address(),
            'specialite' => fake()->randomElement(['Français', 'Mathématiques', 'Histoire-Géo', 'SVT', 'Anglais', 'Physique-Chimie', 'EPS', 'Philosophie']),
            'matricule' => fake()->unique()->bothify('ENS-####-????'),
            'cv' => null,
            'user_id' => User::factory()->state([
                'nom' => $nom,
                'prenom' => $prenom,
            ]), // Each enseignant gets a user account matching their name
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}

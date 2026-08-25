<?php

namespace Database\Factories;

use App\Models\Personnel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonnelFactory extends Factory
{
    protected $model = Personnel::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'poste' => fake()->randomElement(['Secrétaire', 'Comptable', 'Surveillant', 'Bibliothécaire', 'Infirmier', 'Technicien de surface', 'Gardien']),
            'telephone' => fake()->phoneNumber(),
            'adresse' => fake()->address(),
            'sexe' => fake()->randomElement(['M', 'F']),
            'date_embauche' => fake()->dateTimeBetween('-10 years', 'now')->format('Y-m-d'),
            // 'salaire' removed
            'date_naissance' => fake()->dateTimeBetween('-60 years', '-20 years')->format('Y-m-d'),
            'lieu_naissance' => fake()->city(),
            'matricule' => fake()->unique()->bothify('PRS-####-????'),
            'cnss' => fake()->optional()->numerify('###-###-###'),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}

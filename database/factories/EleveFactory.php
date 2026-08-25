<?php

namespace Database\Factories;

use App\Models\Eleve;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EleveFactory extends Factory
{
    protected $model = Eleve::class;

    public function definition(): array
    {
        $sexe = fake()->randomElement(['M', 'F']);
        
        return [
            'user_id' => User::factory(),
            'matricule' => fake()->unique()->bothify('ELV-####-????'),
            'sexe' => $sexe,
            'date_naissance' => fake()->dateTimeBetween('-18 years', '-5 years'),
            'lieu_naissance' => fake()->city(),
            'probleme_particulier' => fake()->optional(0.1)->sentence(), // 10% chance
            'photo' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}

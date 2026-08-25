<?php

namespace Database\Factories;

use App\Models\ParentModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ParentModelFactory extends Factory
{
    protected $model = ParentModel::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'profession' => fake()->jobTitle(),
            'telephone' => fake()->phoneNumber(),
            'adresse' => fake()->address(),
            'sexe' => fake()->randomElement(['M', 'F']),
            'date_naissance' => fake()->dateTimeBetween('-60 years', '-25 years'),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}

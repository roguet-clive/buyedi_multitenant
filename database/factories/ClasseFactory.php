<?php

namespace Database\Factories;

use App\Models\Classe;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClasseFactory extends Factory
{
    protected $model = Classe::class;

    public function definition(): array
    {
        return [
            'nom' => fake()->unique()->bothify('Classe ??-#'),
            'type' => fake()->randomElement(['primaire', 'secondaire', 'maternelle']),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}

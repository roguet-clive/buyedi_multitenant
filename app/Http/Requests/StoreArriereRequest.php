<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArriereRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->can('ajouter_arrieres');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'eleve_id' => 'nullable|exists:eleves,id',
            'nom_eleve' => 'required|string|max:255',
            'prenom_eleve' => 'nullable|string|max:255',
            'classe_origine' => 'nullable|string|max:100',
            'annee_scolaire_dette' => 'required|string|max:50',
            'montant_total' => 'required|numeric|min:1',
            'observations' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Custom validation messages
     */
    public function messages(): array
    {
        return [
            'nom_eleve.required' => 'Le nom de l\'élève est obligatoire.',
            'annee_scolaire_dette.required' => 'L\'année scolaire de la dette est obligatoire.',
            'montant_total.required' => 'Le montant total de la dette est obligatoire.',
            'montant_total.min' => 'Le montant doit être supérieur à 0.',
        ];
    }
}

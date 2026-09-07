<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEleveRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->can('ajouter_eleves');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email',
            'sexe' => 'required|in:M,F',
            'date_naissance' => 'nullable|date',
            'lieu_naissance' => 'nullable|string|max:255',
            'probleme_particulier' => 'nullable|string',
            'photo' => 'nullable|image|max:2048',
        ];
    }

    /**
     * Custom validation messages
     */
    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom de famille de l\'élève est obligatoire.',
            'sexe.required' => 'Veuillez sélectionner le genre de l\'élève.',
            'email.email' => 'L\'adresse email saisie n\'est pas valide.',
            'email.unique' => 'Cette adresse email est déjà attribuée à un autre compte.',
            'photo.image' => 'Le fichier photo doit être une image valide (JPG, PNG).',
            'photo.max' => 'La photo ne doit pas dépasser 2 Mo.',
        ];
    }
}

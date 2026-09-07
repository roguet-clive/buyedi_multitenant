<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PayerArriereRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->can('encaisser_arrieres');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $arriere = $this->route('arriere');
        $maxMontant = $arriere ? ((float) $arriere->montant_restant + 0.01) : 999999999;

        return [
            'montant' => 'required|numeric|min:1|max:' . $maxMontant,
            'date_paiement' => 'required|date',
            'mode_paiement' => 'required|in:especes,virement,mobile,cheque',
            'reference_paiement' => 'nullable|string|max:255',
            'commentaire' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Custom validation messages
     */
    public function messages(): array
    {
        return [
            'montant.required' => 'Le montant du versement est obligatoire.',
            'montant.min' => 'Le montant doit être au moins de 1 FCFA.',
            'montant.max' => 'Le versement ne peut pas excéder le reste dû sur cette dette.',
            'date_paiement.required' => 'La date de versement est obligatoire.',
            'mode_paiement.required' => 'Le mode de paiement est obligatoire.',
            'mode_paiement.in' => 'Le mode de paiement sélectionné est invalide.',
        ];
    }
}

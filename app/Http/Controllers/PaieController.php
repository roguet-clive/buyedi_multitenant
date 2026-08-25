<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Models\Contrat;
use App\Models\PaiementSalaire;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class PaieController extends Controller
{
    public function __construct()
    {
        // Require explicit HR permission
        // $this->middleware('permission:gerer_paie');
    }

    public function index()
    {
        // Employees: Role Personnel or Enseignant
        // We'll fetch users who have those roles, AND their contracts.
        // Or simpler: fetch all contracts, and associated users.
        
        $employees = User::role(['enseignant', 'personnel', 'directeur'])
            ->with(['contrat', 'personnel', 'paiementsSalaires' => function($q) {
                $q->latest()->limit(5); // Show last 5 payments
            }])
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'nom' => $user->full_name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                    'poste' => $user->personnel?->poste ?? 'Enseignant', // Fallback logic
                    'contrat' => $user->contrat ? [
                        'type' => $user->contrat->type,
                        'salaire_base' => $user->contrat->salaire_base,
                        'taux_horaire' => $user->contrat->taux_horaire,
                        'date_debut' => $user->contrat->date_debut->format('Y-m-d'),
                        'actif' => $user->contrat->actif
                    ] : null,
                    'last_payment' => $user->paiementsSalaires->first() ? [
                        'mois' => $user->paiementsSalaires->first()->mois,
                        'annee' => $user->paiementsSalaires->first()->annee,
                        'net' => $user->paiementsSalaires->first()->net_a_payer,
                    ] : null
                ];
            });

        return Inertia::render('Paie/Index', [
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'mois' => 'required|integer|min:1|max:12',
            'annee' => 'required|integer',
            'salaire_brut' => 'required|numeric',
            'primes' => 'nullable|numeric',
            'retenues' => 'nullable|numeric',
            'commentaire' => 'nullable|string'
        ]);

        $primes = $request->primes ?? 0;
        $retenues = $request->retenues ?? 0;
        $net = $request->salaire_brut + $primes - $retenues;

        // Check for existing payment
        $existingPayment = PaiementSalaire::where('user_id', $request->user_id)
            ->where('mois', $request->mois)
            ->where('annee', $request->annee)
            ->exists();

        if ($existingPayment) {
            return back()->with('error', 'Un paiement de salaire existe déjà pour ce mois et cette année.');
        }

        $paiement = PaiementSalaire::create([
            'user_id' => $request->user_id,
            'auteur_id' => auth()->id(),
            'mois' => $request->mois,
            'annee' => $request->annee,
            'salaire_brut' => $request->salaire_brut,
            'primes' => $primes,
            'retenues' => $retenues,
            'net_a_payer' => $net,
            'date_paiement' => now(),
            'commentaire' => $request->commentaire
        ]);

        // AUTOMATISATION : CRÉATION DÉPENSE
        $beneficiaire = User::find($request->user_id);
        $nomBeneficiaire = $beneficiaire ? $beneficiaire->name : 'Employé #' . $request->user_id;

        \App\Models\Depense::create([
            'user_id' => auth()->id(), // L'auteur de la dépense (celui qui paie)
            'categorie' => 'Salaire',
            'montant' => $net,
            'description' => "Paiement Salaire : $nomBeneficiaire (" . \Carbon\Carbon::createFromDate($request->annee, $request->mois, 1)->translatedFormat('F Y') . ")",
            'date_depense' => now(),
        ]);

        return back()->with('success', 'Paiement effectué avec succès.');
    }

    public function contract(Request $request)
    {
        // Update or Create Contract
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|string',
            'salaire_base' => 'required|numeric',
            'taux_horaire' => 'nullable|numeric',
            'date_debut' => 'required|date'
        ]);

        Contrat::updateOrCreate(
            ['user_id' => $request->user_id],
            [
                'type' => $request->type,
                'salaire_base' => $request->salaire_base,
                'taux_horaire' => $request->taux_horaire,
                'date_debut' => $request->date_debut,
                'actif' => true
            ]
        );

        return back()->with('success', 'Contrat mis à jour.');
    }

    public function bulletin(PaiementSalaire $paiement)
    {
        // Check access
        if (auth()->id() !== $paiement->user_id && !auth()->user()->hasRole(['directeur', 'super-admin'])) {
            abort(403);
        }

        $pdf = Pdf::loadView('pdf.fiches_paie', [
            'paiement' => $paiement->load('user'),
        ]);

        return $pdf->download('Fiche_Paie_' . $paiement->mois . '_' . $paiement->annee . '.pdf');
    }
}

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
                        'id' => $user->paiementsSalaires->first()->id,
                        'mois' => $user->paiementsSalaires->first()->mois,
                        'annee' => $user->paiementsSalaires->first()->annee,
                        'net' => $user->paiementsSalaires->first()->net_a_payer,
                        'date' => $user->paiementsSalaires->first()->date_paiement ? $user->paiementsSalaires->first()->date_paiement->format('d/m/Y') : null,
                    ] : null,
                    'all_payments' => $user->paiementsSalaires->map(function($p) {
                        return [
                            'id' => $p->id,
                            'mois' => $p->mois,
                            'annee' => $p->annee,
                            'salaire_brut' => $p->salaire_brut,
                            'primes' => $p->primes,
                            'retenues' => $p->retenues,
                            'net' => $p->net_a_payer,
                            'date' => $p->date_paiement ? $p->date_paiement->format('d/m/Y') : $p->created_at->format('d/m/Y'),
                        ];
                    })
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
        $currentUser = auth()->user();
        $canAccess = $currentUser->id === $paiement->user_id 
            || $currentUser->hasRole(['directeur', 'super-admin', 'admin']) 
            || $currentUser->can('gerer_paie')
            || $currentUser->can('voir_paiements');

        if (!$canAccess) {
            abort(403, 'Accès réservé au bulletin de paie.');
        }

        $paiement->load(['user.contrat', 'user.personnel', 'auteur']);
        $user = $paiement->user;
        $contrat = $user->contrat;
        $etablissement = \App\Models\Etablissement::first();

        $moisNoms = [
            1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril',
            5 => 'Mai', 6 => 'Juin', 7 => 'Juillet', 8 => 'Août',
            9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre'
        ];
        $moisNom = $moisNoms[$paiement->mois] ?? 'Mois ' . $paiement->mois;
        $datePaiement = $paiement->date_paiement ? \Carbon\Carbon::parse($paiement->date_paiement)->format('d/m/Y') : now()->format('d/m/Y');
        $dateEmbauche = $contrat && $contrat->date_debut ? \Carbon\Carbon::parse($contrat->date_debut)->format('d/m/Y') : 'Non renseignée';
        $poste = $user->personnel?->poste ?? ($user->hasRole('enseignant') ? 'Enseignant' : 'Personnel');

        $pdf = Pdf::loadView('pdf.fiches_paie', [
            'paiement' => $paiement,
            'contrat' => $contrat,
            'etablissement' => $etablissement,
            'moisNom' => $moisNom,
            'datePaiement' => $datePaiement,
            'dateEmbauche' => $dateEmbauche,
            'poste' => $poste
        ]);

        return $pdf->stream('Bulletin_Paie_' . ($user->nom ?? 'Employe') . '_' . $moisNom . '_' . $paiement->annee . '.pdf');
    }
}

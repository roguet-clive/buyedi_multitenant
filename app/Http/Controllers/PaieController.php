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
        $this->middleware('permission:voir_paie')->only(['index', 'bulletin']);
        $this->middleware('permission:gerer_paie|modifier_paie')->only(['update']);
        $this->middleware('permission:gerer_paie|supprimer_paie')->only(['destroy', 'destroyContract']);
        $this->middleware('permission:gerer_paie')->only(['store', 'contract']);
    }

    public function index()
    {
        $employees = User::role(['enseignant', 'personnel', 'directeur'])
            ->with(['contrat', 'personnel', 'paiementsSalaires' => function($q) {
                $q->latest('annee')->latest('mois')->limit(10);
            }])
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'nom' => $user->nom ?? $user->name,
                    'prenom' => $user->prenom,
                    'full_name' => $user->full_name ?? ($user->prenom . ' ' . ($user->nom ?? $user->name)),
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                    'poste' => $user->personnel?->poste ?? ($user->hasRole('enseignant') ? 'Enseignant' : 'Personnel'),
                    'contrat' => $user->contrat ? [
                        'id' => $user->contrat->id,
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
                        'salaire_brut' => $user->paiementsSalaires->first()->salaire_brut,
                        'primes' => $user->paiementsSalaires->first()->primes,
                        'retenues' => $user->paiementsSalaires->first()->retenues,
                        'net' => $user->paiementsSalaires->first()->net_a_payer,
                        'commentaire' => $user->paiementsSalaires->first()->commentaire,
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
                            'commentaire' => $p->commentaire,
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
            'salaire_brut' => 'required|numeric|min:0',
            'primes' => 'nullable|numeric|min:0',
            'retenues' => 'nullable|numeric|min:0',
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
        $nomBeneficiaire = $beneficiaire ? ($beneficiaire->prenom . ' ' . $beneficiaire->nom) : ('Employé #' . $request->user_id);

        \App\Models\Depense::create([
            'user_id' => auth()->id(),
            'categorie' => 'Salaire',
            'montant' => $net,
            'description' => "Paiement Salaire : $nomBeneficiaire (" . \Carbon\Carbon::createFromDate($request->annee, $request->mois, 1)->translatedFormat('F Y') . ")",
            'date_depense' => now(),
        ]);

        return back()->with('success', 'Paiement de salaire enregistré avec succès ✅');
    }

    public function update(Request $request, PaiementSalaire $paiement)
    {
        $request->validate([
            'mois' => 'required|integer|min:1|max:12',
            'annee' => 'required|integer',
            'salaire_brut' => 'required|numeric|min:0',
            'primes' => 'nullable|numeric|min:0',
            'retenues' => 'nullable|numeric|min:0',
            'commentaire' => 'nullable|string'
        ]);

        // Vérifier s'il y a un conflit sur un autre paiement de cet employé
        $conflict = PaiementSalaire::where('user_id', $paiement->user_id)
            ->where('mois', $request->mois)
            ->where('annee', $request->annee)
            ->where('id', '!=', $paiement->id)
            ->exists();

        if ($conflict) {
            return back()->with('error', 'Un autre paiement existe déjà pour cette période pour cet employé.');
        }

        $primes = $request->primes ?? 0;
        $retenues = $request->retenues ?? 0;
        $net = $request->salaire_brut + $primes - $retenues;

        $beneficiaire = $paiement->user;
        $nomBeneficiaire = $beneficiaire ? ($beneficiaire->prenom . ' ' . $beneficiaire->nom) : ('Employé #' . $paiement->user_id);
        $oldDesc = "Paiement Salaire : $nomBeneficiaire (" . \Carbon\Carbon::createFromDate($paiement->annee, $paiement->mois, 1)->translatedFormat('F Y') . ")";
        $newDesc = "Paiement Salaire : $nomBeneficiaire (" . \Carbon\Carbon::createFromDate($request->annee, $request->mois, 1)->translatedFormat('F Y') . ")";

        $paiement->update([
            'mois' => $request->mois,
            'annee' => $request->annee,
            'salaire_brut' => $request->salaire_brut,
            'primes' => $primes,
            'retenues' => $retenues,
            'net_a_payer' => $net,
            'commentaire' => $request->commentaire
        ]);

        // Mettre à jour la dépense associée si trouvée
        $depense = \App\Models\Depense::where('categorie', 'Salaire')
            ->where(function($q) use ($oldDesc, $nomBeneficiaire) {
                $q->where('description', $oldDesc)
                  ->orWhere('description', 'like', "%{$nomBeneficiaire}%");
            })
            ->latest('id')
            ->first();

        if ($depense) {
            $depense->update([
                'montant' => $net,
                'description' => $newDesc,
            ]);
        }

        return back()->with('success', 'Bulletin de paie modifié avec succès ✅');
    }

    public function destroy(PaiementSalaire $paiement)
    {
        $beneficiaire = $paiement->user;
        $nomBeneficiaire = $beneficiaire ? ($beneficiaire->prenom . ' ' . $beneficiaire->nom) : ('Employé #' . $paiement->user_id);
        $desc = "Paiement Salaire : $nomBeneficiaire (" . \Carbon\Carbon::createFromDate($paiement->annee, $paiement->mois, 1)->translatedFormat('F Y') . ")";

        // Supprimer la dépense liée
        \App\Models\Depense::where('categorie', 'Salaire')
            ->where(function($q) use ($desc, $nomBeneficiaire) {
                $q->where('description', $desc)
                  ->orWhere('description', 'like', "%{$nomBeneficiaire}%");
            })
            ->delete();

        $paiement->delete();

        return back()->with('success', 'Bulletin de paie supprimé avec succès ✅');
    }

    public function contract(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|string',
            'salaire_base' => 'required|numeric|min:0',
            'taux_horaire' => 'nullable|numeric|min:0',
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

        return back()->with('success', 'Dossier contractuel mis à jour avec succès ✅');
    }

    public function destroyContract(Contrat $contrat)
    {
        $contrat->delete();
        return back()->with('success', 'Contrat supprimé avec succès ✅');
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

        // Récupération sécurisée du logo en Base64 pour DomPDF
        $logoBase64 = null;
        if ($etablissement && !empty($etablissement->logo)) {
            $logoPath = public_path('storage/' . $etablissement->logo);
            if (!file_exists($logoPath)) {
                $logoPath = storage_path('app/public/' . $etablissement->logo);
            }
            if (file_exists($logoPath)) {
                $ext = pathinfo($logoPath, PATHINFO_EXTENSION);
                $logoBase64 = 'data:image/' . $ext . ';base64,' . base64_encode(file_get_contents($logoPath));
            }
        }
        if (!$logoBase64 && file_exists(public_path('images/logo.png'))) {
            $logoBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents(public_path('images/logo.png')));
        }

        $moisNoms = [
            1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril',
            5 => 'Mai', 6 => 'Juin', 7 => 'Juillet', 8 => 'Août',
            9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre'
        ];
        $moisNom = $moisNoms[$paiement->mois] ?? 'Mois ' . $paiement->mois;
        $datePaiement = $paiement->date_paiement ? \Carbon\Carbon::parse($paiement->date_paiement)->format('d/m/Y') : now()->format('d/m/Y');
        $dateEmbauche = $contrat && $contrat->date_debut ? \Carbon\Carbon::parse($contrat->date_debut)->format('d/m/Y') : 'Non renseignée';
        $poste = $user->personnel?->poste ?? ($user->hasRole('enseignant') ? 'Enseignant' : 'Personnel Administratif');

        // Conversion du montant net en toutes lettres
        $netEnLettres = '';
        if (class_exists('NumberFormatter')) {
            try {
                $formatter = new \NumberFormatter('fr', \NumberFormatter::SPELLOUT);
                $netEnLettres = ucfirst($formatter->format((float) $paiement->net_a_payer)) . ' Francs CFA';
            } catch (\Throwable $e) {
                $netEnLettres = number_format($paiement->net_a_payer, 0, ',', ' ') . ' FCFA';
            }
        }

        $pdf = Pdf::loadView('pdf.fiches_paie', [
            'paiement' => $paiement,
            'contrat' => $contrat,
            'etablissement' => $etablissement,
            'logoBase64' => $logoBase64,
            'moisNom' => $moisNom,
            'datePaiement' => $datePaiement,
            'dateEmbauche' => $dateEmbauche,
            'poste' => $poste,
            'netEnLettres' => $netEnLettres,
        ]);

        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('Bulletin_Paie_' . ($user->nom ?? 'Employe') . '_' . $moisNom . '_' . $paiement->annee . '.pdf');
    }
}

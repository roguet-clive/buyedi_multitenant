<?php

namespace App\Http\Controllers;

use App\Models\DemandeDocument;
use App\Models\Eleve;
use App\Models\User;
use App\Models\AnneeScolaire;
use App\Models\FraisClasse;
use App\Models\Paiement;
use App\Notifications\DemandeDocumentCreee;
use App\Notifications\DemandeDocumentTraitee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class DemandeDocumentController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $isStudent = $user->hasRole('eleve');
        $isParent = $user->hasRole('parent');
        $isStaff = $user->hasRole(['super-admin', 'directeur', 'personnel', 'comptable']);

        $anneeCourante = AnneeScolaire::where('en_cours', true)->first();

        // Récupération des enfants pour le parent
        $children = [];
        if ($isParent && $user->parent) {
            $children = $user->parent->eleves()->with(['inscriptions.classe'])->get()->map(function ($c) {
                return [
                    'id' => $c->id,
                    'nom_complet' => $c->user->nom_complet ?? ($c->user->nom . ' ' . $c->user->prenom),
                    'matricule' => $c->matricule,
                    'classe' => $c->inscriptionActuelle?->classe?->nom ?? 'Non assigné',
                ];
            });
        }

        // Profil élève connecté
        $studentProfile = null;
        if ($isStudent && $user->eleve) {
            $studentProfile = [
                'id' => $user->eleve->id,
                'nom_complet' => $user->nom_complet ?? ($user->nom . ' ' . $user->prenom),
                'matricule' => $user->eleve->matricule,
                'classe' => $user->eleve->inscriptionActuelle?->classe?->nom ?? 'Non assigné',
            ];
        }

        // Requête des demandes
        $query = DemandeDocument::with([
            'eleve.user', 
            'eleve.inscriptions.classe',
            'user', 
            'traitePar',
            'anneeScolaire'
        ])->latest();

        if ($isStudent && $user->eleve) {
            $query->where('eleve_id', $user->eleve->id);
        } elseif ($isParent && $user->parent) {
            $childIds = $user->parent->eleves()->pluck('eleves.id')->toArray();
            $query->whereIn('eleve_id', $childIds);
        } else {
            // Vue Administration : filtres
            if ($request->filled('statut') && $request->statut !== 'all') {
                $query->where('statut', $request->statut);
            }
            if ($request->filled('type_document') && $request->type_document !== 'all') {
                $query->where('type_document', $request->type_document);
            }
            if ($request->filled('search')) {
                $search = $request->search;
                $query->whereHas('eleve.user', function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('prenom', 'like', "%{$search}%");
                })->orWhereHas('eleve', function ($q) use ($search) {
                    $q->where('matricule', 'like', "%{$search}%");
                });
            }
        }

        $demandes = $query->paginate(15)->withQueryString();

        // Pour l'administration : enrichir chaque demande avec l'état financier instantané de l'élève
        if ($isStaff) {
            $demandes->getCollection()->transform(function ($demande) use ($anneeCourante) {
                $inscription = $demande->eleve->inscriptionActuelle;
                $totalDu = 0;
                $totalPaye = 0;

                if ($inscription) {
                    $totalDu = FraisClasse::where('classe_id', $inscription->classe_id)->sum('montant');
                    $totalPaye = Paiement::where('inscription_id', $inscription->id)->sum('montant');
                }

                $reste = max(0, $totalDu - $totalPaye);
                $isSolde = $reste == 0 && $totalDu > 0;

                $demande->finance = [
                    'total_du' => $totalDu,
                    'total_paye' => $totalPaye,
                    'reste' => $reste,
                    'is_solde' => $isSolde,
                ];

                return $demande;
            });
        }

        return Inertia::render('DemandesDocuments/Index', [
            'demandes' => $demandes,
            'isStaff' => $isStaff,
            'isParent' => $isParent,
            'isStudent' => $isStudent,
            'children' => $children,
            'studentProfile' => $studentProfile,
            'filters' => $request->only(['statut', 'type_document', 'search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'eleve_id' => 'required|exists:eleves,id',
            'type_document' => 'required|in:certificat_scolarite,carte_scolaire,fiche_synthese,attestation_inscription,autre',
            'motif' => 'nullable|string|max:500',
        ], [
            'eleve_id.required' => 'Veuillez sélectionner un élève.',
            'type_document.required' => 'Veuillez choisir le type de document souhaité.',
        ]);

        $user = Auth::user();
        $eleve = Eleve::findOrFail($validated['eleve_id']);

        // Vérification de sécurité des droits
        if ($user->hasRole('eleve') && $user->eleve?->id !== $eleve->id) {
            abort(403, 'Vous ne pouvez faire une demande que pour votre propre dossier.');
        }

        if ($user->hasRole('parent')) {
            $childIds = $user->parent?->eleves()->pluck('eleves.id')->toArray() ?? [];
            if (!in_array($eleve->id, $childIds)) {
                abort(403, 'Vous ne pouvez faire une demande que pour l\'un de vos enfants inscrits.');
            }
        }

        $anneeCourante = AnneeScolaire::where('en_cours', true)->first();

        // Création de la demande
        $demande = DemandeDocument::create([
            'eleve_id' => $eleve->id,
            'user_id' => $user->id,
            'type_document' => $validated['type_document'],
            'motif' => $validated['motif'] ?? null,
            'statut' => 'en_attente',
            'annee_scolaire_id' => $anneeCourante?->id,
        ]);

        // Notification de l'équipe administrative
        $staffUsers = User::role(['super-admin', 'directeur', 'personnel'])->get();
        if ($staffUsers->isNotEmpty()) {
            Notification::send($staffUsers, new DemandeDocumentCreee($demande));
        }

        return redirect()->route('demandes-documents.index')
            ->with('success', 'Votre demande de document officiel a été transmise au secrétariat avec succès.');
    }

    public function traiter(Request $request, DemandeDocument $demandeDocument)
    {
        $user = Auth::user();
        if (!$user->hasRole(['super-admin', 'directeur', 'personnel'])) {
            abort(403, 'Action réservée au personnel administratif et à la direction.');
        }

        $validated = $request->validate([
            'statut' => 'required|in:approuve,rejete',
            'motif_rejet' => 'required_if:statut,rejete|nullable|string|max:500',
        ], [
            'motif_rejet.required_if' => 'Veuillez préciser le motif du refus pour informer l\'élève/parent.',
        ]);

        $demandeDocument->update([
            'statut' => $validated['statut'],
            'motif_rejet' => $validated['statut'] === 'rejete' ? $validated['motif_rejet'] : null,
            'traite_par_id' => $user->id,
            'date_traitement' => now(),
        ]);

        // Notification en temps réel du demandeur et de toutes les personnes concernées (Élève et Parents)
        $notifiables = collect();
        if ($demandeDocument->user) {
            $notifiables->push($demandeDocument->user);
        }
        if ($demandeDocument->eleve?->user) {
            $notifiables->push($demandeDocument->eleve->user);
        }
        if ($demandeDocument->eleve?->parents) {
            foreach ($demandeDocument->eleve->parents as $parent) {
                if ($parent->user) {
                    $notifiables->push($parent->user);
                }
            }
        }

        $notifiables = $notifiables->unique('id');
        Notification::send($notifiables, new DemandeDocumentTraitee($demandeDocument));

        $message = $validated['statut'] === 'approuve' 
            ? 'Demande approuvée. Le document est désormais téléchargeable.' 
            : 'Demande rejetée avec notification transmise au demandeur.';

        return back()->with('success', $message);
    }

    public function download(DemandeDocument $demandeDocument)
    {
        $user = Auth::user();
        $isStaff = $user->hasRole(['super-admin', 'directeur', 'personnel', 'comptable']);

        // Vérification de sécurité
        if (!$isStaff) {
            // Doit être l'élève ou le parent demandeur
            $isAuthorizedUser = $demandeDocument->user_id === $user->id 
                || ($user->hasRole('eleve') && $user->eleve?->id === $demandeDocument->eleve_id)
                || ($user->hasRole('parent') && in_array($demandeDocument->eleve_id, $user->parent?->eleves()->pluck('eleves.id')->toArray() ?? []));

            if (!$isAuthorizedUser) {
                abort(403, 'Accès non autorisé à ce document.');
            }

            if ($demandeDocument->statut !== 'approuve') {
                return redirect()->route('demandes-documents.index')
                    ->with('error', 'Ce document n\'a pas encore été validé par l\'administration.');
            }
        }

        $eleveController = app(EleveController::class);

        return match ($demandeDocument->type_document) {
            'certificat_scolarite' => $eleveController->downloadCertificate($demandeDocument->eleve),
            'carte_scolaire' => $eleveController->downloadCarte($demandeDocument->eleve),
            'fiche_synthese' => $eleveController->downloadSynthese($demandeDocument->eleve),
            default => $eleveController->downloadCertificate($demandeDocument->eleve),
        };
    }
}

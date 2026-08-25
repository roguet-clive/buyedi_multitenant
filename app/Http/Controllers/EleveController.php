<?php

namespace App\Http\Controllers;

use App\Models\Eleve;
use App\Models\User;
use App\Models\Classe;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Mail\NewUserCredentials;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class EleveController extends Controller
{
    use \App\Traits\HandlesTeacherAccess;

    public function __construct()
    {
        $this->middleware('permission:voir_eleves')->only(['index', 'show']);
        $this->middleware('permission:ajouter_eleves')->only(['create', 'store']);
        $this->middleware('permission:modifier_eleves')->only(['edit', 'update']);
        $this->middleware('permission:supprimer_eleves')->only('destroy');
    }

    public function index(Request $request)
    {
        $search = $request->input('search');
        $sexe = $request->input('sexe');
        $classe_id = $request->input('classe_id');
        $user = $request->user();

        $anneeEnCours = \App\Models\AnneeScolaire::where('en_cours', true)->first();

        $query = Eleve::with(['user', 'inscriptions.classe', 'parents.user'])
            // Filtrer par année scolaire en cours par défaut (Isolation des données)
            ->whereHas('inscriptions', function($q) use ($anneeEnCours) {
                if ($anneeEnCours) {
                    $q->where('annee_scolaire_id', $anneeEnCours->id);
                }
            })
            ->when($search, fn($query, $search) =>
                $query->whereHas('user', fn($q) =>
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('prenom', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                )
            )
            ->when($sexe, fn($q) => $q->where('sexe', $sexe))
            ->when($classe_id, fn($q) => 
                $q->whereHas('inscriptions', fn($query) =>
                    $query->where('classe_id', $classe_id)
                          ->when($anneeEnCours, fn($q2) => $q2->where('annee_scolaire_id', $anneeEnCours->id))
                )
            );

        // 🔒 SCOPING DE DONNÉES PAR RÔLE
        if (!$user->hasRole(['super-admin', 'directeur'])) {
            if ($user->hasRole('parent')) {
                // Les parents ne voient que leurs propres enfants
                $query->whereHas('parents', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            } elseif ($this->isTeacher()) {
                // Les enseignants ne voient que les élèves de leurs classes
                $myClassIds = $this->getTeacherClassIds();
                $query->whereHas('inscriptions', function ($q) use ($myClassIds) {
                    $q->whereIn('classe_id', $myClassIds);
                });
            }
        }

        $eleves = $query->paginate(10)->withQueryString();

        // Transformation sécurisée avec vérifications
        $elevesTransformed = $eleves->getCollection()->map(function($eleve){
            return [
                'id' => $eleve->id,
                'matricule' => $eleve->matricule ?? 'N/A',
                'sexe' => $eleve->sexe ?? 'N/A',
                'date_naissance' => $eleve->date_naissance ?? null,
                'lieu_naissance' => $eleve->lieu_naissance ?? null,
                'probleme_particulier' => $eleve->probleme_particulier ?? null,
                'photo' => $eleve->photo ? Storage::url($eleve->photo) : null,
                'nom' => $eleve->user->nom ?? 'N/A',
                'prenom' => $eleve->user->prenom ?? 'N/A',
                'email' => $eleve->user->email ?? 'N/A',
                'classe' => $eleve->classeActuelle()?->nom ?? 'Non assigné',
                'parents' => $eleve->parents->map(function($parent) {
                    return [
                        'id' => $parent->id,
                        'nom_complet' => ($parent->user->prenom ?? '') . ' ' . ($parent->user->nom ?? ''),
                        'telephone' => $parent->telephone ?? '-',
                        'lien' => $parent->pivot->lien ?? '',
                    ];
                }),
            ];
        });

        // Remets la collection transformée dans le paginator
        $eleves->setCollection($elevesTransformed);

        // Récupérer toutes les classes pour les filtres
        $classes = Classe::select('id', 'nom')->get();

        return Inertia::render('Eleves/Index', [
            'eleves' => $eleves,
            'classes' => $classes,
            'filters' => [
                'search' => $search,
                'sexe' => $sexe,
                'classe_id' => $classe_id,
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Eleves/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'sexe' => 'required|in:M,F',
            'date_naissance' => 'nullable|date',
            'lieu_naissance' => 'nullable|string|max:255',
            'probleme_particulier' => 'nullable|string',
            'photo' => 'nullable|image|max:2048',
        ]);

        $defaultPassword = Str::random(10);

        $user = User::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'] ?? null,
            'email' => $validated['email'],
            'password' => bcrypt($defaultPassword),
        ]);
        $user->assignRole('eleve');

        $path = $request->hasFile('photo')
            ? $request->file('photo')->store('eleves', 'public')
            : null;

        $eleve = Eleve::create([
            'user_id' => $user->id,
            'sexe' => $validated['sexe'],
            'date_naissance' => $validated['date_naissance'] ?? null,
            'lieu_naissance' => $validated['lieu_naissance'] ?? null,
            'probleme_particulier' => $validated['probleme_particulier'] ?? null,
            'matricule' => 'ELEVE-' . strtoupper(Str::random(6)),
            'photo' => $path,
        ]);

        Mail::to($user->email)->send(new NewUserCredentials($user, $defaultPassword));

        return redirect()->route('eleves.index')->with('success', 'Élève créé avec succès ✅');
    }

    public function show($id)
    {
        $eleve = Eleve::with(['user', 'inscriptions.classe', 'inscriptions.anneeScolaire', 'documents'])
            ->findOrFail($id);

        $paiements = \App\Models\Paiement::whereIn('inscription_id', $eleve->inscriptions->pluck('id'))
            ->with('fraisType', 'inscription.anneeScolaire')
            ->latest('date_paiement')
            ->get();

        $absences = \App\Models\Absence::whereIn('inscription_id', $eleve->inscriptions->pluck('id'))
            ->latest('date')
            ->get();

        return Inertia::render('Eleves/Show', [
            'eleve' => [
                'id' => $eleve->id,
                'matricule' => $eleve->matricule ?? 'N/A',
                'sexe' => $eleve->sexe ?? 'N/A',
                'date_naissance' => $eleve->date_naissance ? $eleve->date_naissance->format('d/m/Y') : null,
                'lieu_naissance' => $eleve->lieu_naissance ?? null,
                'probleme_particulier' => $eleve->probleme_particulier ?? null,
                'photo' => $eleve->photo ? Storage::url($eleve->photo) : null,
                'nom' => $eleve->user->nom ?? 'N/A',
                'prenom' => $eleve->user->prenom ?? 'N/A',
                'email' => $eleve->user->email ?? 'N/A',
                'classe' => $eleve->classeActuelle()?->nom ?? 'Non assigné', // Priorité année en cours
                'annee_actuelle' => $eleve->inscriptionEnCours?->anneeScolaire?->nom ?? ($eleve->inscriptionActuelle?->anneeScolaire?->nom ?? '-'),
            ],
            'inscriptions' => $eleve->inscriptions->map(function ($insc) {
                return [
                    'id' => $insc->id,
                    'annee' => $insc->anneeScolaire->nom,
                    'classe' => $insc->classe->nom,
                    'date' => $insc->date_inscription->format('d/m/Y'),
                    'total_frais' => $insc->total_frais,
                    'en_cours' => $insc->anneeScolaire->en_cours
                ];
            }),
            'paiements' => $paiements->map(function ($p) {
                return [
                    'id' => $p->id,
                    'date' => $p->date_paiement->format('d/m/Y'),
                    'montant' => $p->montant,
                    'type' => $p->fraisType->nom,
                    'annee' => $p->inscription->anneeScolaire->nom,
                    'reference' => $p->reference,
                ];
            }),
            'documents' => $eleve->documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'nom' => $doc->nom,
                    'type' => $doc->type,
                    'url' => $doc->url,
                    'date' => $doc->created_at->format('d/m/Y'),
                ];
            }),
            'absences' => $absences->map(function ($abs) {
                return [
                    'id' => $abs->id,
                    'date' => $abs->date->format('d/m/Y'),
                    'type' => $abs->type,
                    'justifiee' => (bool)$abs->justifiee,
                    'motif' => $abs->motif,
                ];
            }),
        ]);
    }

    public function edit($id)
    {
        $eleve = Eleve::with('user', 'inscriptions.classe')->findOrFail($id);

        return Inertia::render('Eleves/Edit', [
            'eleve' => $eleve,
        ]);
    }

    public function update(Request $request, Eleve $eleve)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'email' => "required|email|unique:users,email,{$eleve->user_id}",
            'sexe' => 'required|in:M,F',
            'date_naissance' => 'nullable|date',
            'lieu_naissance' => 'nullable|string|max:255',
            'probleme_particulier' => 'nullable|string',
            'photo' => 'nullable|image|max:2048',
        ]);

        $eleve->user->update([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'] ?? null,
            'email' => $validated['email'],
        ]);

        if ($request->hasFile('photo')) {
            if ($eleve->photo) {
                Storage::disk('public')->delete($eleve->photo);
            }
            $eleve->photo = $request->file('photo')->store('eleves', 'public');
        }

        $eleve->update([
            'sexe' => $validated['sexe'],
            'date_naissance' => $validated['date_naissance'] ?? null,
            'lieu_naissance' => $validated['lieu_naissance'] ?? null,
            'probleme_particulier' => $validated['probleme_particulier'] ?? null,
        ]);

        return redirect()->route('eleves.index')->with('success', 'Élève mis à jour ✅');
    }

    public function destroy(Eleve $eleve)
    {
        if ($eleve->photo) {
            Storage::disk('public')->delete($eleve->photo);
        }

        $eleve->user->delete();

        return redirect()->route('eleves.index')->with('success', 'Élève supprimé ✅');
    }

    private function getEtablissementData()
    {
        $etablissement = \App\Models\Etablissement::first();
        return [
            'nom' => $etablissement->nom ?? config('app.name', 'École Buyedi'),
            'adresse' => $etablissement->adresse ?? 'Adresse non configurée',
            'telephone' => $etablissement->telephone ?? '',
            'email' => $etablissement->email ?? '',
            'logo' => $etablissement->logo ? public_path('storage/' . $etablissement->logo) : public_path('images/logo.png'),
        ];
    }

    public function downloadCertificate(Eleve $eleve)
    {
        $eleve->load(['user', 'inscriptions.classe', 'inscriptions.anneeScolaire']);
        if (!$eleve->inscriptionActuelle) return back()->with('error', 'L\'élève n\'est pas inscrit cette année.');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('documents.certificat_scolarite', [
            'eleve' => $eleve,
            'inscription' => $eleve->inscriptionActuelle,
            'etablissement' => $this->getEtablissementData()
        ]);
        return $pdf->download('certificat_' . $eleve->matricule . '.pdf');
    }

    public function downloadCarte(Eleve $eleve)
    {
        $eleve->load(['user', 'inscriptions.classe', 'inscriptions.anneeScolaire']);
        if (!$eleve->inscriptionActuelle) return back()->with('error', 'L\'élève n\'est pas inscrit cette année.');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('documents.carte_eleve', [
            'eleve' => $eleve,
            'inscription' => $eleve->inscriptionActuelle,
            'etablissement' => $this->getEtablissementData()
        ])->setPaper([0, 0, 241, 153], 'landscape'); // Format CR80 (Carte de crédit) 85.6mm x 54mm approx en points

        return $pdf->download('carte_' . $eleve->matricule . '.pdf');
    }

    public function downloadAttestation(Eleve $eleve)
    {
        $eleve->load(['user', 'inscriptions.classe', 'inscriptions.anneeScolaire']);
        if (!$eleve->inscriptionActuelle) return back()->with('error', 'L\'élève n\'est pas inscrit cette année.');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('documents.attestation_conduite', [
            'eleve' => $eleve,
            'inscription' => $eleve->inscriptionActuelle,
            'etablissement' => $this->getEtablissementData()
        ]);
        return $pdf->download('attestation_conduite_' . $eleve->matricule . '.pdf');
    }

    public function downloadFiche(Eleve $eleve)
    {
        $eleve->load(['user', 'inscriptions.classe', 'inscriptions.anneeScolaire', 'parents.user']);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('documents.fiche_renseignements', [
            'eleve' => $eleve,
            'inscription' => $eleve->inscriptionActuelle,
            'etablissement' => $this->getEtablissementData()
        ]);
        return $pdf->download('fiche_renseignements_' . $eleve->matricule . '.pdf');
    }

    public function downloadSortie(Eleve $eleve)
    {
        $eleve->load(['user', 'inscriptions.classe', 'inscriptions.anneeScolaire']);
        
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('documents.billet_sortie', [
            'eleve' => $eleve,
            'inscription' => $eleve->inscriptionActuelle ?? null, // Peut être généré même sans inscription active pour test ? Non, mieux vaut être safe.
            'etablissement' => $this->getEtablissementData()
        ]);
        return $pdf->download('billet_sortie_' . $eleve->matricule . '.pdf');
    }
}
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
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreEleveRequest;

class EleveController extends Controller
{
    use \App\Traits\HandlesTeacherAccess;

    public function __construct()
    {
        $this->middleware('permission:voir_eleves')->only(['index']);
        $this->middleware('permission:ajouter_eleves')->only(['create', 'store']);
        $this->middleware('permission:modifier_eleves')->only(['edit', 'update']);
        $this->middleware('permission:supprimer_eleves')->only('destroy');
    }

    public function index(Request $request)
    {
        $user = $request->user();

        // 🔒 Sécurité : Un élève ne doit jamais accéder à l'annuaire administratif complet des élèves
        if ($user->hasRole('eleve')) {
            return redirect()->route('eleves.mon-dossier');
        }

        $search = $request->input('search');
        $sexe = $request->input('sexe');
        $classe_id = $request->input('classe_id');

        $anneeEnCours = \App\Models\AnneeScolaire::where('en_cours', true)->first();

        $query = Eleve::with(['user', 'inscriptions.classe', 'parents.user'])
            ->when($classe_id, function ($q) use ($classe_id, $anneeEnCours) {
                $q->whereHas('inscriptions', function ($query) use ($classe_id, $anneeEnCours) {
                    $query->where('classe_id', $classe_id);
                    if ($anneeEnCours) {
                        $query->where('annee_scolaire_id', $anneeEnCours->id);
                    }
                });
            }, function ($q) use ($anneeEnCours) {
                if ($anneeEnCours) {
                    // Afficher les élèves inscrits dans l'année en cours OU les élèves pas encore assignés
                    $q->where(function ($sub) use ($anneeEnCours) {
                        $sub->whereHas('inscriptions', function ($i) use ($anneeEnCours) {
                            $i->where('annee_scolaire_id', $anneeEnCours->id);
                        })->orWhereDoesntHave('inscriptions');
                    });
                }
            })
            ->when($search, function($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->whereHas('user', function($qu) use ($search) {
                        $qu->where('nom', 'like', "%{$search}%")
                           ->orWhere('prenom', 'like', "%{$search}%")
                           ->orWhere('email', 'like', "%{$search}%");
                    })->orWhere('matricule', 'like', "%{$search}%");
                });
            })
            ->when($sexe, fn($q) => $q->where('sexe', $sexe));

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

        $eleves = $query->latest()->paginate(10)->withQueryString();

        // Transformation sécurisée avec vérifications
        $elevesTransformed = $eleves->getCollection()->map(function($eleve) use ($anneeEnCours) {
            $inscriptionEnCours = $anneeEnCours ? $eleve->inscriptions->firstWhere('annee_scolaire_id', $anneeEnCours->id) : null;
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
                'is_inscrit' => (bool)$inscriptionEnCours,
                'classe_annee' => $inscriptionEnCours?->classe?->nom ?? null,
                'classe_actuelle' => $eleve->classeActuelle()?->nom ?? 'Non assigné',
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
        $classes = Classe::select('id', 'nom')->orderBy('nom')->get();

        return Inertia::render('Eleves/Index', [
            'eleves' => $eleves,
            'classes' => $classes,
            'anneeEnCours' => $anneeEnCours,
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

    public function store(StoreEleveRequest $request)
    {
        $validated = $request->validated();
        $defaultPassword = Str::random(10);

        // Auto-génération d'un email système si non fourni
        $email = $validated['email'] ?? null;
        if (empty($email)) {
            $baseSlug = Str::slug(($validated['prenom'] ?? '') . '.' . $validated['nom']);
            if (empty($baseSlug)) {
                $baseSlug = 'eleve';
            }
            $email = strtolower($baseSlug . '.' . rand(100, 999) . '@buyedi.ga');
            while (User::where('email', $email)->exists()) {
                $email = strtolower($baseSlug . '.' . rand(1000, 9999) . '@buyedi.ga');
            }
        }

        $path = $request->hasFile('photo')
            ? $request->file('photo')->store('eleves', 'public')
            : null;

        $matricule = Eleve::generateMatricule();

        DB::beginTransaction();
        try {
            $user = User::create([
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'] ?? null,
                'email' => $email,
                'password' => bcrypt($defaultPassword),
            ]);
            $user->assignRole('eleve');

            $eleve = Eleve::create([
                'user_id' => $user->id,
                'sexe' => $validated['sexe'],
                'date_naissance' => $validated['date_naissance'] ?? null,
                'lieu_naissance' => $validated['lieu_naissance'] ?? null,
                'probleme_particulier' => $validated['probleme_particulier'] ?? null,
                'matricule' => $matricule,
                'photo' => $path,
            ]);

            DB::commit();

            try {
                if (!empty($validated['email'])) {
                    Mail::to($user->email)->queue(new NewUserCredentials($user, $defaultPassword));
                }
            } catch (\Exception $e) {
                // Si la file d'attente ou mailer échoue, on ne bloque pas l'utilisateur
            }

            return redirect()->route('inscriptions.create.eleve', $eleve->id)
                ->with('success', "Dossier de l'élève {$user->nom} {$user->prenom} créé avec succès ✅ Vous pouvez maintenant choisir sa classe et finaliser son inscription.");
        } catch (\Exception $e) {
            DB::rollBack();
            if ($path && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
            return redirect()->back()
                ->withInput()
                ->with('error', "Une erreur est survenue lors de la création de l'élève : " . $e->getMessage());
        }
    }

    /**
     * Accès direct au dossier de l'élève ou parent connecté
     */
    public function monDossier(Request $request)
    {
        $user = $request->user();
        if ($user->hasRole('eleve')) {
            $eleve = Eleve::where('user_id', $user->id)->first();
            if (!$eleve) {
                return redirect()->route('dashboard')->with('error', "Aucun dossier élève associé à votre compte.");
            }
            return $this->show($request, $eleve->id);
        }

        if ($user->hasRole('parent')) {
            $parent = \App\Models\ParentModel::where('user_id', $user->id)->first();
            $firstStudent = $parent?->eleves()->first();
            if ($firstStudent) {
                return $this->show($request, $firstStudent->id);
            }
            return redirect()->route('dashboard')->with('error', "Aucun élève rattaché à votre compte parent.");
        }

        return redirect()->route('eleves.index');
    }

    public function show(Request $request, $id)
    {
        $eleve = Eleve::with(['user', 'inscriptions.classe', 'inscriptions.anneeScolaire', 'documents'])
            ->findOrFail($id);

        $user = $request->user();

        // 🔒 Sécurité : Un élève ne peut voir que son propre dossier
        if ($user->hasRole('eleve') && !$user->hasRole(['super-admin', 'directeur'])) {
            if ($eleve->user_id !== $user->id) {
                abort(403, "Accès refusé : vous ne pouvez consulter que votre propre dossier scolaire.");
            }
        }

        // 🔒 Sécurité : Un parent ne peut voir que les dossiers de ses enfants
        if ($user->hasRole('parent') && !$user->hasRole(['super-admin', 'directeur', 'enseignant'])) {
            $hasChild = $eleve->parents()->where('user_id', $user->id)->exists();
            if (!$hasChild) {
                abort(403, "Accès refusé : cet élève n'est pas associé à votre compte parent.");
            }
        }

        // 🔒 Sécurité d'accès : Un enseignant ne peut consulter que les élèves de ses classes
        if ($this->isTeacher() && !$user->hasRole(['super-admin', 'directeur'])) {
            $myClassIds = $this->getTeacherClassIds();
            $hasStudent = $eleve->inscriptions()->whereIn('classe_id', $myClassIds)->exists();
            if (!$hasStudent) {
                abort(403, "Accès refusé : cet élève ne fait pas partie de vos classes.");
            }
        }

        $canViewFinances = $user && ($user->can('voir_paiements') || $user->hasRole(['super-admin', 'directeur']));

        $currentInscription = $eleve->inscriptionEnCours ?: $eleve->inscriptions->sortByDesc('id')->first();

        $paiements = collect();
        $financeStats = null;

        if ($canViewFinances) {
            $paiements = \App\Models\Paiement::whereIn('inscription_id', $eleve->inscriptions->pluck('id'))
                ->with(['fraisType', 'inscription.anneeScolaire', 'user'])
                ->latest('date_paiement')
                ->latest('id')
                ->get();

            // Calculs financiers approfondis pour l'année scolaire en cours harmonisés avec le barème officiel
            if ($currentInscription) {
                $currentInscription->loadMissing(['classe', 'anneeScolaire', 'eleve.user']);
                $classe = $currentInscription->classe;
                $classeNom = $classe ? $classe->nom : '';
                $isSecondaire = $classe ? $classe->isSecondaire() : false;
                $isMaternelle = $classe ? ($classe->type === 'maternelle') : false;
                $isPrimaire = $classe ? ($classe->type === 'primaire') : false;
                $isCinquiemePrimaire = $isPrimaire && (
                    (method_exists($classe, 'isCinquiemeAnneePrimaire') && $classe->isCinquiemeAnneePrimaire()) ||
                    \Illuminate\Support\Str::contains(mb_strtolower($classeNom), ['5', 'cinquieme', 'cinquième', 'cm2'])
                );
                $isExamen = $classe ? (
                    $classe->is_examen ||
                    in_array(mb_strtolower(trim($classeNom)), ['3e', 'tle', 'terminale', 'cm2'])
                ) : false;

                $fraisClasse = \App\Models\FraisClasse::where('classe_id', $currentInscription->classe_id)
                    ->where('annee_scolaire_id', $currentInscription->annee_scolaire_id)
                    ->with('echeances')
                    ->first();
                
                $fraisTypeScolarite = \App\Models\FraisType::where('is_scolarite', true)
                    ->where(function($q) use ($currentInscription) {
                        $q->where('annee_scolaire_id', $currentInscription->annee_scolaire_id)
                          ->orWhereNull('annee_scolaire_id');
                    })
                    ->first();

                // Barème officiel de scolarité
                $defaultMontant = $isMaternelle
                    ? 117000
                    : ($isCinquiemePrimaire
                        ? 135000
                        : ($isPrimaire
                            ? 121500
                            : ($isExamen ? 145000 : 135000)));

                $montantAnnuel = $fraisClasse ? (float)$fraisClasse->montant : ($fraisTypeScolarite ? (float)$fraisTypeScolarite->montant : $defaultMontant);
                
                // Paiements de scolarité de cette inscription
                $paiementsScolarite = $paiements->filter(fn($p) => $p->inscription_id == $currentInscription->id && $p->fraisType && $p->fraisType->is_scolarite);
                $totalScolaritePayee = (float)$paiementsScolarite->sum('montant');
                $resteAPayer = max(0, $montantAnnuel - $totalScolaritePayee);
                $pourcentage = $montantAnnuel > 0 ? min(100, round(($totalScolaritePayee / $montantAnnuel) * 100)) : 0;

                // Mensualité de référence (pour Maternelle & Primaire : sur 9 mois de Septembre à Mai)
                $defaultMensuel = $isMaternelle ? 13000 : ($isCinquiemePrimaire ? 15000 : 13500);
                $montantMensuel = $montantAnnuel > 0 ? (int)round($montantAnnuel / 9) : $defaultMensuel;

                // Extraire tous les mois / tranches enregistrés dans les règlements
                $moisPayesMap = [];
                $moisReglesList = [];
                foreach ($paiementsScolarite as $p) {
                    if (!empty($p->mois)) {
                        $liste = array_map('trim', explode(',', $p->mois));
                        foreach ($liste as $m) {
                            $cle = mb_strtolower($m);
                            $moisReglesList[] = $m;
                            $moisPayesMap[$cle] = [
                                'date' => $p->date_paiement ? $p->date_paiement->format('d/m/Y') : null,
                                'montant' => (float)$p->montant,
                                'paiement_id' => $p->id,
                            ];
                        }
                    }
                }

                // 9 mois scolaires officiels (Maternelle & Primaire)
                $schoolMonths = [
                    'Septembre', 'Octobre', 'Novembre', 'Décembre',
                    'Janvier', 'Février', 'Mars', 'Avril', 'Mai'
                ];

                // Mois courant de l'année scolaire (1 = Sept, 2 = Oct, ..., 9 = Mai)
                $curMonthReal = (int) date('n');
                $moisScolaireActuel = match ($curMonthReal) {
                    9 => 1,
                    10 => 2,
                    11 => 3,
                    12 => 4,
                    1 => 5,
                    2 => 6,
                    3 => 7,
                    4 => 8,
                    5 => 9,
                    default => (in_array($curMonthReal, [6, 7, 8]) ? 9 : 1),
                };

                $moisDetails = [];
                $nbMoisEnRetard = 0;
                $montantEnRetard = 0;

                foreach ($schoolMonths as $idx => $nomMois) {
                    $cle = mb_strtolower($nomMois);
                    $seuilCumule = ($idx + 1) * $montantMensuel;
                    $isPaid = isset($moisPayesMap[$cle]) || ($totalScolaritePayee >= $seuilCumule && $montantMensuel > 0);
                    $isDue = ($idx + 1) <= $moisScolaireActuel;

                    $statut = 'a_venir';
                    $isRetard = false;

                    if ($isPaid) {
                        $statut = 'paye';
                    } elseif ($isDue) {
                        $statut = 'en_retard';
                        $isRetard = true;
                        $nbMoisEnRetard++;
                        $montantEnRetard += $montantMensuel;
                    }

                    $moisDetails[] = [
                        'mois' => $nomMois,
                        'numero' => $idx + 1,
                        'statut' => $statut, // 'paye' | 'en_retard' | 'a_venir'
                        'est_paye' => $isPaid,
                        'est_retard' => $isRetard,
                        'montant' => $montantMensuel,
                        'info_reglement' => $moisPayesMap[$cle] ?? null,
                    ];
                }

                // Tranches trimestrielles pour Secondaire
                $tranchesConfig = [
                    ['nom' => '1ère Tranche', 'montant' => 70000, 'date_limite' => 'Septembre'],
                    ['nom' => '2ème Tranche', 'montant' => ($isExamen ? 37500 : 32500), 'date_limite' => 'Fin Novembre'],
                    ['nom' => '3ème Tranche', 'montant' => ($isExamen ? 37500 : 32500), 'date_limite' => 'Fin Janvier'],
                ];

                $tranchesDetails = [];
                $cumulAttendu = 0;
                $nbTranchesEnRetard = 0;
                $montantTranchesEnRetard = 0;

                foreach ($tranchesConfig as $idx => $tr) {
                    $cumulAttendu += $tr['montant'];
                    $cleNom = mb_strtolower($tr['nom']);
                    $cleCourt = 'tranche ' . ($idx + 1);
                    $isPaid = isset($moisPayesMap[$cleNom]) || isset($moisPayesMap[$cleCourt]) || ($totalScolaritePayee >= $cumulAttendu);
                    
                    $isDue = match($idx) {
                        0 => true,
                        1 => in_array($curMonthReal, [12, 1, 2, 3, 4, 5, 6, 7, 8]),
                        2 => in_array($curMonthReal, [2, 3, 4, 5, 6, 7, 8]),
                        default => true
                    };

                    $statut = 'a_venir';
                    $isRetard = false;

                    if ($isPaid) {
                        $statut = 'paye';
                    } elseif ($isDue) {
                        $statut = 'en_retard';
                        $isRetard = true;
                        $nbTranchesEnRetard++;
                        $montantTranchesEnRetard += $tr['montant'];
                    }

                    $tranchesDetails[] = [
                        'numero' => $idx + 1,
                        'nom' => $tr['nom'],
                        'montant' => $tr['montant'],
                        'date_limite' => $tr['date_limite'],
                        'statut' => $statut,
                        'est_paye' => $isPaid,
                        'est_retard' => $isRetard,
                        'info_reglement' => $moisPayesMap[$cleNom] ?? ($moisPayesMap[$cleCourt] ?? null),
                    ];
                }

                $financeStats = [
                    'is_secondaire' => $isSecondaire,
                    'is_maternelle' => $isMaternelle,
                    'is_primaire' => $isPrimaire,
                    'is_cinquieme_primaire' => $isCinquiemePrimaire,
                    'is_examen' => $isExamen,
                    'regime' => $isSecondaire ? 'tranches' : 'mensuel',
                    'montant_annuel' => $montantAnnuel,
                    'total_paye' => $totalScolaritePayee,
                    'reste_a_payer' => $resteAPayer,
                    'pourcentage' => $pourcentage,
                    'montant_mensuel' => $montantMensuel,
                    'mois_details' => $isSecondaire ? [] : $moisDetails,
                    'tranches_details' => $isSecondaire ? $tranchesDetails : [],
                    'nb_mois_en_retard' => $isSecondaire ? $nbTranchesEnRetard : $nbMoisEnRetard,
                    'montant_en_retard' => $isSecondaire ? $montantTranchesEnRetard : $montantEnRetard,
                    'est_a_jour' => $isSecondaire ? ($nbTranchesEnRetard === 0) : ($nbMoisEnRetard === 0),
                    'mois_actuel_nom' => $isSecondaire ? ($tranchesConfig[min(2, max(0, $nbTranchesEnRetard))]['nom'] ?? 'Tranche') : $schoolMonths[min(8, max(0, $moisScolaireActuel - 1))],
                ];

                $currentInscriptionData = [
                    'id' => $currentInscription->id,
                    'label' => ($eleve->user->nom ?? '') . ' ' . ($eleve->user->prenom ?? '') . ' (' . ($classeNom) . ')',
                    'eleve_nom_complet' => ($eleve->user->nom ?? '') . ' ' . ($eleve->user->prenom ?? ''),
                    'matricule' => $eleve->matricule ?? '',
                    'classe_id' => $currentInscription->classe_id,
                    'classe_nom' => $classeNom,
                    'classe_type' => $classe ? $classe->type : '',
                    'is_secondaire' => $isSecondaire,
                    'montant_tenue_exigible' => (float) $currentInscription->montant_tenue_exigible,
                    'total_scolarite_payee' => (float) $totalScolaritePayee,
                    'mois_regles' => array_values(array_unique($moisReglesList)),
                    'tenue_payee' => (bool) $currentInscription->tenue_payee,
                ];
            }
        }

        $absences = \App\Models\Absence::whereIn('inscription_id', $eleve->inscriptions->pluck('id'))
            ->latest('date')
            ->get();

        $anneeId = $currentInscription?->annee_scolaire_id;
        $fraisTypes = \App\Models\FraisType::where(function($q) use ($anneeId) {
            if ($anneeId) {
                $q->where('annee_scolaire_id', $anneeId)->orWhereNull('annee_scolaire_id');
            }
        })->get();
        $fraisClasses = $anneeId ? \App\Models\FraisClasse::where('annee_scolaire_id', $anneeId)->with(['echeances', 'classe'])->get() : [];
        $classesList = \App\Models\Classe::orderBy('nom')->get();

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
                'is_inscrit_annee_en_cours' => (bool)$currentInscription,
                'inscription_en_cours_id' => $currentInscription?->id,
            ],
            'financeStats' => $financeStats,
            'currentInscriptionData' => $currentInscriptionData ?? null,
            'classes' => $classesList,
            'fraisTypes' => $fraisTypes,
            'fraisClasses' => $fraisClasses,
            'inscriptions' => $eleve->inscriptions->map(function ($insc) use ($canViewFinances) {
                return [
                    'id' => $insc->id,
                    'annee' => $insc->anneeScolaire->nom,
                    'classe' => $insc->classe->nom,
                    'date' => $insc->date_inscription->format('d/m/Y'),
                    'total_frais' => $canViewFinances ? $insc->total_frais : null,
                    'en_cours' => $insc->anneeScolaire->en_cours
                ];
            }),
            'paiements' => $paiements->map(function ($p) {
                return [
                    'id' => $p->id,
                    'date' => $p->date_paiement ? $p->date_paiement->format('d/m/Y') : '-',
                    'montant' => (float)$p->montant,
                    'type' => $p->fraisType?->nom ?? 'Frais',
                    'is_scolarite' => (bool)($p->fraisType?->is_scolarite),
                    'mois' => $p->mois,
                    'mode' => $p->mode_paiement,
                    'annee' => $p->inscription?->anneeScolaire?->nom ?? '-',
                    'caissier' => $p->user ? ($p->user->nom . ' ' . ($p->user->prenom ? $p->user->prenom[0] . '.' : '')) : 'Caisse',
                ];
            }),
            'documents' => $eleve->documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'nom' => $doc->nom,
                    'type' => $doc->type,
                    'description' => $doc->description,
                    'url' => $doc->url,
                    'date' => $doc->created_at->format('d/m/Y'),
                ];
            }),
            'absences' => $absences->map(function ($abs) {
                return [
                    'id' => $abs->id,
                    'date' => $abs->date->format('d/m/Y'),
                    'type' => $abs->type,
                    'justifiee' => $abs->justifiee,
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
        $user = auth()->user();
        if ($user && $user->hasRole(['eleve', 'parent', 'enseignant'])) {
            $hasApproved = \App\Models\DemandeDocument::where('eleve_id', $eleve->id)
                ->where('type_document', 'certificat_scolarite')
                ->where('statut', 'approuve')
                ->exists();

            if (!$hasApproved) {
                return redirect()->route('demandes-documents.index')
                    ->with('error', 'Le téléchargement direct des documents administratifs est restreint. Veuillez soumettre une demande au secrétariat.');
            }
        }

        $eleve->load(['user', 'inscriptions.classe', 'inscriptions.anneeScolaire']);
        if (!$eleve->inscriptionActuelle) return back()->with('error', 'L\'élève n\'est pas inscrit cette année.');

        $inscription = $eleve->inscriptionActuelle;

        // S'assurer qu'un code de sécurité existe pour la vérification du QR Code
        if (!$inscription->code_securite) {
            $inscription->update([
                'code_securite' => (string) \Illuminate\Support\Str::uuid(),
            ]);
        }

        $qrData = route('inscriptions.verify', $inscription->code_securite);

        $qrCode = base64_encode(
            \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')
                ->size(150)
                ->margin(0)
                ->errorCorrection('M')
                ->generate($qrData)
        );

        $reference = 'CS/' . ($inscription->anneeScolaire->nom ?? date('Y')) . '/' . $eleve->matricule;

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('documents.certificat_scolarite', [
            'eleve' => $eleve,
            'inscription' => $inscription,
            'etablissement' => $this->getEtablissementData(),
            'qrCode' => $qrCode,
            'reference' => $reference,
        ])->setPaper('a4', 'portrait');

        return $pdf->download('certificat_' . $eleve->matricule . '.pdf');
    }

    public function downloadCarte(Eleve $eleve)
    {
        $user = auth()->user();
        if ($user && $user->hasRole(['eleve', 'parent', 'enseignant'])) {
            $hasApproved = \App\Models\DemandeDocument::where('eleve_id', $eleve->id)
                ->where('type_document', 'carte_scolaire')
                ->where('statut', 'approuve')
                ->exists();

            if (!$hasApproved) {
                return redirect()->route('demandes-documents.index')
                    ->with('error', 'Le téléchargement direct des documents administratifs est restreint. Veuillez soumettre une demande au secrétariat.');
            }
        }

        $eleve->load(['user', 'inscriptions.classe', 'inscriptions.anneeScolaire']);
        if (!$eleve->inscriptionActuelle) return back()->with('error', 'L\'élève n\'est pas inscrit cette année.');

        $inscription = $eleve->inscriptionActuelle;

        // S'assurer qu'un code de sécurité existe pour la vérification du QR Code
        if (!$inscription->code_securite) {
            $inscription->update([
                'code_securite' => (string) \Illuminate\Support\Str::uuid(),
            ]);
        }

        $qrData = route('inscriptions.verify', $inscription->code_securite);

        $qrCode = base64_encode(
            \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')
                ->size(160)
                ->margin(0)
                ->errorCorrection('M')
                ->generate($qrData)
        );

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('documents.carte_eleve', [
            'eleve' => $eleve,
            'inscription' => $inscription,
            'etablissement' => $this->getEtablissementData(),
            'qrCode' => $qrCode,
        ])->setPaper([0, 0, 242.64, 153.01], 'landscape'); // Format CR80 (Carte de crédit) 85.6mm x 54mm

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
        $user = auth()->user();
        if ($user && $user->hasRole(['eleve', 'parent', 'enseignant'])) {
            $hasApproved = \App\Models\DemandeDocument::where('eleve_id', $eleve->id)
                ->where('type_document', 'fiche_synthese')
                ->where('statut', 'approuve')
                ->exists();

            if (!$hasApproved) {
                return redirect()->route('demandes-documents.index')
                    ->with('error', 'Le téléchargement direct des documents administratifs est restreint. Veuillez soumettre une demande au secrétariat.');
            }
        }

        $eleve->load(['user', 'inscriptions.classe', 'inscriptions.anneeScolaire', 'parents.user']);

        $inscription = $eleve->inscriptionActuelle ?? $eleve->inscriptions()->latest()->first();

        // S'assurer qu'un code de sécurité existe pour le QR Code
        if ($inscription && !$inscription->code_securite) {
            $inscription->update([
                'code_securite' => (string) \Illuminate\Support\Str::uuid(),
            ]);
        }

        $qrData = $inscription && $inscription->code_securite
            ? route('inscriptions.verify', $inscription->code_securite)
            : route('eleves.show', $eleve->id);

        $qrCode = base64_encode(
            \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')
                ->size(150)
                ->margin(0)
                ->errorCorrection('M')
                ->generate($qrData)
        );

        $reference = 'FICHE/' . ($inscription->anneeScolaire->nom ?? date('Y')) . '/' . $eleve->matricule;

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('documents.fiche_renseignements', [
            'eleve' => $eleve,
            'inscription' => $inscription,
            'etablissement' => $this->getEtablissementData(),
            'qrCode' => $qrCode,
            'reference' => $reference,
        ])->setPaper('a4', 'portrait');

        return $pdf->download('fiche_renseignements_' . $eleve->matricule . '.pdf');
    }

    public function downloadSortie(Eleve $eleve)
    {
        $eleve->load(['user', 'inscriptions.classe', 'inscriptions.anneeScolaire']);
        
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('documents.billet_sortie', [
            'eleve' => $eleve,
            'inscription' => $eleve->inscriptionActuelle ?? null,
            'etablissement' => $this->getEtablissementData()
        ]);
        return $pdf->download('billet_sortie_' . $eleve->matricule . '.pdf');
    }

    /**
     * Téléversement d'une pièce justificative dans le dossier de l'élève
     */
    public function storeDocument(Request $request, Eleve $eleve)
    {
        $user = $request->user();

        // 🔒 Sécurité : élève propriétaire, parent associé, ou admin/directeur/personnel
        $isSelf = $user->hasRole('eleve') && $eleve->user_id === $user->id;
        $isParentOf = $user->hasRole('parent') && $eleve->parents()->where('user_id', $user->id)->exists();
        $isAdmin = $user->hasRole(['super-admin', 'directeur', 'personnel']);

        if (!$isSelf && !$isParentOf && !$isAdmin) {
            abort(403, "Vous n'avez pas l'autorisation d'ajouter un document à ce dossier.");
        }

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'type' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'fichier' => 'required|file|mimes:pdf,jpg,jpeg,png,webp|max:5120',
        ], [
            'nom.required' => 'Le libellé du document est obligatoire.',
            'fichier.required' => 'Veuillez sélectionner un fichier à téléverser.',
            'fichier.mimes' => 'Le format doit être un PDF, une image JPG, PNG ou WEBP.',
            'fichier.max' => 'La taille maximale autorisée est de 5 Mo.',
        ]);

        $path = $request->file('fichier')->store('documents_eleves', 'public');

        $eleve->documents()->create([
            'nom' => $validated['nom'],
            'fichier' => $path,
            'type' => $validated['type'] ?? 'Pièce justificative',
            'description' => $validated['description'] ?? null,
            'date_upload' => now(),
        ]);

        return back()->with('success', "Le document '{$validated['nom']}' a été téléversé avec succès dans le dossier ✅");
    }

    /**
     * Suppression d'une pièce justificative du dossier de l'élève
     */
    public function destroyDocument(Request $request, \App\Models\Document $document)
    {
        $user = $request->user();
        $eleve = $document->eleve;

        $isSelf = $user->hasRole('eleve') && $eleve && $eleve->user_id === $user->id;
        $isParentOf = $user->hasRole('parent') && $eleve && $eleve->parents()->where('user_id', $user->id)->exists();
        $isAdmin = $user->hasRole(['super-admin', 'directeur', 'personnel']);

        if (!$isSelf && !$isParentOf && !$isAdmin) {
            abort(403, "Vous n'avez pas l'autorisation de supprimer ce document.");
        }

        if ($document->fichier) {
            Storage::disk('public')->delete($document->fichier);
        }

        $document->delete();

        return back()->with('success', 'Document retiré du dossier avec succès 🗑️');
    }
}
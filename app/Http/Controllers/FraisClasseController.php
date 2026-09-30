<?php

namespace App\Http\Controllers;

use App\Models\FraisClasse;
use App\Models\Classe;
use App\Models\AnneeScolaire;
use App\Models\FraisType;
use App\Models\FraisEcheance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FraisClasseController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_frais_classes')->only('index');
        $this->middleware('permission:ajouter_frais_classes')->only(['store', 'storeBulk', 'appliquerBaremeOfficiel']);
        $this->middleware('permission:modifier_frais_classes')->only(['update', 'updateMontant']);
        $this->middleware('permission:supprimer_frais_classes')->only('destroy');
    }

    public function index(Request $request)
    {
        $currentSchoolYear = AnneeScolaire::where('en_cours', true)->first(['id', 'nom']);
        
        // 1. Récupérer TOUS les types de frais (Scolarité, Examens, Informatique, etc.)
        $fraisTypes = FraisType::orderBy('is_scolarite', 'desc')
            ->orderBy('nom')
            ->get();

        // 2. Structurer les classes par sections
        $classes = Classe::orderBy('id')->get();
        $sections = [
            ['id' => 'creche', 'nom' => 'Crèche', 'classes' => $classes->filter(fn($c) => $c->isCreche())->values()],
            ['id' => 'maternelle', 'nom' => 'Maternelle (3-5 ans)', 'classes' => $classes->filter(fn($c) => $c->isMaternelle() && !$c->isCreche())->values()],
            ['id' => 'primaire', 'nom' => 'Primaire', 'classes' => $classes->filter(fn($c) => $c->isPrimaire())->values()],
            ['id' => 'secondaire', 'nom' => 'Secondaire', 'classes' => $classes->filter(fn($c) => $c->isSecondaire())->values()],
        ];
        $sections = array_values(array_filter($sections, fn($s) => count($s['classes']) > 0));

        // 3. Récupérer tous les frais de classe avec leurs échéances et types pour l'année en cours
        $existingFrais = [];
        $allFraisClassesList = [];
        if ($currentSchoolYear) {
            $allFrais = FraisClasse::where('annee_scolaire_id', $currentSchoolYear->id)
                ->with(['fraisType', 'echeances', 'classe'])
                ->get();

            $existingFrais = $allFrais->groupBy('classe_id');
            $allFraisClassesList = $allFrais;
        }

        return Inertia::render('FraisClasses/Index', [
            'sections' => $sections,
            'classes' => $classes,
            'fraisTypes' => $fraisTypes,
            'existingFrais' => $existingFrais,
            'allFraisClassesList' => $allFraisClassesList,
            'currentSchoolYear' => $currentSchoolYear,
        ]);
    }

    /**
     * Enregistrer ou mettre à jour un frais pour une ou plusieurs classes
     */
    public function store(Request $request)
    {
        $currentSchoolYear = AnneeScolaire::where('en_cours', true)->first();
        if (!$currentSchoolYear) {
            return redirect()->back()->with('error', 'Aucune année scolaire active.');
        }

        $validated = $request->validate([
            'classe_ids' => 'required|array|min:1',
            'classe_ids.*' => 'exists:classes,id',
            'frais_type_id' => 'required|exists:frais_types,id',
            'montant' => 'required|numeric|min:0',
            'mode_paiement' => 'required|in:unique,tranches,mensuel',
            'description' => 'nullable|string|max:255',
            'date_limite' => 'nullable|date',
            'echeances' => 'nullable|array',
            'echeances.*.nom' => 'required_with:echeances|string|max:100',
            'echeances.*.montant' => 'required_with:echeances|numeric|min:0',
            'echeances.*.date_limite' => 'nullable|date',
            'echeances.*.ordre' => 'nullable|integer',
            'echeances.*.type' => 'nullable|string',
        ]);

        $classes = Classe::whereIn('id', $validated['classe_ids'])->get();
        $count = 0;

        DB::beginTransaction();
        try {
            foreach ($classes as $classe) {
                $fraisClasse = FraisClasse::updateOrCreate(
                    [
                        'classe_id' => $classe->id,
                        'frais_type_id' => $validated['frais_type_id'],
                        'annee_scolaire_id' => $currentSchoolYear->id,
                    ],
                    [
                        'montant' => $validated['montant'],
                        'mode_paiement' => $validated['mode_paiement'],
                        'description' => $validated['description'] ?? null,
                        'date_limite' => $validated['date_limite'] ?? null,
                    ]
                );

                $this->syncEcheancesForFraisClasse(
                    $fraisClasse,
                    (float) $validated['montant'],
                    $validated['mode_paiement'],
                    $classe,
                    $currentSchoolYear,
                    $validated['echeances'] ?? null
                );

                $count++;
            }

            DB::commit();

            return redirect()->route('frais_classes.index')
                ->with('success', "Frais configuré avec succès pour {$count} classe(s) ✅");
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', "Erreur lors de l'enregistrement : " . $e->getMessage());
        }
    }

    /**
     * Mettre à jour un frais de classe existant et ses échéances
     */
    public function update(Request $request, FraisClasse $fraisClasse)
    {
        $currentSchoolYear = $fraisClasse->anneeScolaire ?? AnneeScolaire::where('en_cours', true)->first();

        $validated = $request->validate([
            'montant' => 'required|numeric|min:0',
            'mode_paiement' => 'required|in:unique,tranches,mensuel',
            'description' => 'nullable|string|max:255',
            'date_limite' => 'nullable|date',
            'echeances' => 'nullable|array',
            'echeances.*.nom' => 'required_with:echeances|string|max:100',
            'echeances.*.montant' => 'required_with:echeances|numeric|min:0',
            'echeances.*.date_limite' => 'nullable|date',
            'echeances.*.ordre' => 'nullable|integer',
            'echeances.*.type' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $fraisClasse->update([
                'montant' => $validated['montant'],
                'mode_paiement' => $validated['mode_paiement'],
                'description' => $validated['description'] ?? null,
                'date_limite' => $validated['date_limite'] ?? null,
            ]);

            $this->syncEcheancesForFraisClasse(
                $fraisClasse,
                (float) $validated['montant'],
                $validated['mode_paiement'],
                $fraisClasse->classe,
                $currentSchoolYear,
                $validated['echeances'] ?? null
            );

            DB::commit();

            return redirect()->route('frais_classes.index')
                ->with('success', "Frais de classe et échéances mis à jour avec succès ✅");
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', "Erreur lors de la mise à jour : " . $e->getMessage());
        }
    }

    /**
     * Suppression d'un frais de classe
     */
    public function destroy(FraisClasse $fraisClasse)
    {
        $nomFrais = $fraisClasse->fraisType->nom ?? 'Frais';
        $nomClasse = $fraisClasse->classe->nom ?? 'Classe';

        $fraisClasse->delete();

        return redirect()->route('frais_classes.index')
            ->with('success', "Le frais « {$nomFrais} » de la classe {$nomClasse} a été supprimé ✅");
    }

    /**
     * Mise à jour rapide du montant seul (rétrocompatibilité)
     */
    public function updateMontant(Request $request, FraisClasse $fraisClasse)
    {
        $request->validate([
            'montant' => 'required|numeric|min:0',
        ]);

        $currentSchoolYear = $fraisClasse->anneeScolaire ?? AnneeScolaire::where('en_cours', true)->first();
        $montant = (float) $request->montant;

        DB::beginTransaction();
        try {
            $fraisClasse->update(['montant' => $montant]);
            $this->syncEcheancesForFraisClasse(
                $fraisClasse,
                $montant,
                $fraisClasse->mode_paiement ?? 'unique',
                $fraisClasse->classe,
                $currentSchoolYear
            );
            DB::commit();

            return response()->json(['success' => true, 'message' => 'Montant mis à jour.', 'fraisClasse' => $fraisClasse]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Enregistrement en masse pour la grille rapide de scolarité
     */
    public function storeBulk(Request $request)
    {
        $currentSchoolYear = AnneeScolaire::where('en_cours', true)->first();
        if (!$currentSchoolYear) {
            return redirect()->back()->with('error', 'Aucune année scolaire active.');
        }
        
        $request->validate([
            'updates' => 'required|array',
            'updates.*.classe_id' => 'required|exists:classes,id',
            'updates.*.frais_type_id' => 'required|exists:frais_types,id',
            'updates.*.montant' => 'required|numeric|min:0',
        ]);

        $classes = Classe::whereIn('id', collect($request->updates)->pluck('classe_id'))->get()->keyBy('id');
        $count = 0;

        DB::beginTransaction();
        try {
            foreach ($request->updates as $update) {
                $montant = (float) $update['montant'];
                $classe = $classes->get($update['classe_id']);
                $modePaiement = ($classe && $classe->isMaternelleOuPrimaire()) ? 'mensuel' : 'tranches';

                $fraisClasse = FraisClasse::updateOrCreate(
                    [
                        'classe_id' => $update['classe_id'],
                        'frais_type_id' => $update['frais_type_id'],
                        'annee_scolaire_id' => $currentSchoolYear->id,
                    ],
                    [
                        'montant' => $montant,
                        'mode_paiement' => $modePaiement,
                    ]
                );

                if ($classe) {
                    $this->syncEcheancesForFraisClasse($fraisClasse, $montant, $modePaiement, $classe, $currentSchoolYear);
                }

                $count++;
            }

            DB::commit();

            return redirect()->route('frais_classes.index')->with('success', "Grille de scolarité mise à jour ($count classes).");
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', "Erreur lors de la mise à jour : " . $e->getMessage());
        }
    }

    /**
     * Applique en 1 clic la grille tarifaire officielle du Complexe Scolaire Sagesse Divine
     */
    public function appliquerBaremeOfficiel(Request $request)
    {
        $currentSchoolYear = AnneeScolaire::where('en_cours', true)->first();
        if (!$currentSchoolYear) {
            return redirect()->back()->with('error', 'Aucune année scolaire active trouvée.');
        }

        $fraisType = FraisType::where('is_scolarite', true)->first();
        if (!$fraisType) {
            $fraisType = FraisType::create([
                'nom' => 'Scolarité',
                'code' => 'scolarite',
                'is_scolarite' => true,
                'globale' => true,
                'montant' => 0,
            ]);
        }

        $classes = Classe::all();
        $count = 0;

        DB::beginTransaction();
        try {
            foreach ($classes as $classe) {
                $nom = mb_strtolower($classe->nom);

                if ($classe->isCreche()) {
                    $montantTotal = str_contains($nom, '16h') ? 270000 : 180000;
                    $modePaiement = 'mensuel';
                } elseif ($classe->isMaternelle()) {
                    $montantTotal = 180000;
                    $modePaiement = 'mensuel';
                } elseif ($classe->isPrimaire()) {
                    if ($classe->isCinquiemeAnneePrimaire()) {
                        $montantTotal = 270000;
                    } elseif ($classe->isQuatriemeAnneePrimaire()) {
                        $montantTotal = 225000;
                    } else {
                        $montantTotal = 180000;
                    }
                    $modePaiement = 'mensuel';
                } elseif ($classe->isClasseExamen()) {
                    $montantTotal = 145000;
                    $modePaiement = 'tranches';
                } else {
                    $montantTotal = 135000;
                    $modePaiement = 'tranches';
                }

                $fraisClasse = FraisClasse::updateOrCreate(
                    [
                        'classe_id' => $classe->id,
                        'annee_scolaire_id' => $currentSchoolYear->id,
                        'frais_type_id' => $fraisType->id,
                    ],
                    [
                        'montant' => $montantTotal,
                        'mode_paiement' => $modePaiement,
                    ]
                );

                $this->syncEcheancesForFraisClasse($fraisClasse, $montantTotal, $modePaiement, $classe, $currentSchoolYear);
                $count++;
            }

            DB::commit();

            return redirect()->route('frais_classes.index')->with('success', "Le barème officiel a été appliqué avec succès à {$count} classes.");
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', "Erreur lors de l'application du barème officiel : " . $e->getMessage());
        }
    }

    /**
     * Synchronise les échéances d'un frais de classe selon son mode de paiement
     */
    private function syncEcheancesForFraisClasse(
        FraisClasse $fraisClasse,
        float $montant,
        string $modePaiement,
        Classe $classe,
        AnneeScolaire $schoolYear,
        ?array $customEcheances = null
    ) {
        $startYear = now()->year;
        if (preg_match('/^(\d{4})/', $schoolYear->nom ?? '', $matches)) {
            $startYear = (int) $matches[1];
        }
        $nextYear = $startYear + 1;

        $echeances = [];

        // 1. Échéances personnalisées fournies directement par l'utilisateur
        if (!empty($customEcheances)) {
            foreach ($customEcheances as $idx => $custom) {
                $echeances[] = [
                    'nom' => $custom['nom'] ?? ("Échéance " . ($idx + 1)),
                    'montant' => (float) ($custom['montant'] ?? 0),
                    'date_limite' => !empty($custom['date_limite']) ? $custom['date_limite'] : null,
                    'ordre' => (int) ($custom['ordre'] ?? ($idx + 1)),
                    'type' => $custom['type'] ?? $modePaiement,
                ];
            }
        } 
        // 2. Mode Paiement Unique (Comptant, Ex: Frais d'examen)
        elseif ($modePaiement === 'unique') {
            $nomFrais = $fraisClasse->fraisType->nom ?? 'Paiement Unique';
            $echeances[] = [
                'nom' => $nomFrais,
                'montant' => $montant,
                'date_limite' => $fraisClasse->date_limite ? $fraisClasse->date_limite->format('Y-m-d') : "{$startYear}-11-30",
                'ordre' => 1,
                'type' => 'unique',
            ];
        }
        // 3. Mode Mensuel (9 mois par défaut de Septembre à Mai)
        elseif ($modePaiement === 'mensuel') {
            $mensualite = $montant > 0 ? round($montant / 9) : 0;
            $moisNoms = [
                ['nom' => 'Septembre', 'date' => "{$startYear}-09-10"],
                ['nom' => 'Octobre',   'date' => "{$startYear}-10-10"],
                ['nom' => 'Novembre',  'date' => "{$startYear}-11-10"],
                ['nom' => 'Décembre',  'date' => "{$startYear}-12-10"],
                ['nom' => 'Janvier',   'date' => "{$nextYear}-01-10"],
                ['nom' => 'Février',   'date' => "{$nextYear}-02-10"],
                ['nom' => 'Mars',      'date' => "{$nextYear}-03-10"],
                ['nom' => 'Avril',     'date' => "{$nextYear}-04-10"],
                ['nom' => 'Mai',       'date' => "{$nextYear}-05-10"],
            ];

            foreach ($moisNoms as $idx => $m) {
                $echeances[] = [
                    'nom' => $m['nom'],
                    'montant' => $mensualite,
                    'date_limite' => $m['date'],
                    'ordre' => $idx + 1,
                    'type' => 'mensualite',
                ];
            }
        } 
        // 4. Mode Tranches (3 tranches par défaut)
        elseif ($modePaiement === 'tranches') {
            if ($montant == 145000 && $classe->isClasseExamen()) {
                $t1 = 70000;
                $t2 = 37500;
                $t3 = 37500;
            } elseif ($montant == 135000) {
                $t1 = 70000;
                $t2 = 32500;
                $t3 = 32500;
            } else {
                $t1 = min(70000, $montant);
                $reste = max(0, $montant - $t1);
                $t2 = round($reste / 2);
                $t3 = $reste - $t2;
            }

            $echeances = [
                [
                    'nom' => '1ère Tranche',
                    'montant' => $t1,
                    'date_limite' => "{$startYear}-09-30",
                    'ordre' => 1,
                    'type' => 'tranche',
                ],
                [
                    'nom' => '2ème Tranche',
                    'montant' => $t2,
                    'date_limite' => "{$startYear}-11-30",
                    'ordre' => 2,
                    'type' => 'tranche',
                ],
                [
                    'nom' => '3ème Tranche',
                    'montant' => $t3,
                    'date_limite' => "{$nextYear}-01-31",
                    'ordre' => 3,
                    'type' => 'tranche',
                ],
            ];
        }

        // Sauvegarder les échéances
        $fraisClasse->echeances()->delete();
        foreach ($echeances as $ech) {
            $fraisClasse->echeances()->create($ech);
        }
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\FraisClasse;
use App\Models\Classe;
use App\Models\AnneeScolaire;

use App\Models\FraisType;
use App\Models\FraisEcheance;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FraisClasseController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_frais_classes')->only('index');
        $this->middleware('permission:ajouter_frais_classes')->only(['store', 'storeBulk', 'updateMontant', 'appliquerBaremeOfficiel']);
        $this->middleware('permission:supprimer_frais_classes')->only('destroy');
    }

    public function index(Request $request)
    {
        $currentSchoolYear = AnneeScolaire::where('en_cours', true)->first(['id', 'nom']);
        
        // 1. Get all Tuition Types
        $fraisTypes = FraisType::where('is_scolarite', true)->get(['id', 'nom', 'montant']);

        // 2. Get Sections structure (grouped by type)
        $classes = Classe::orderBy('nom')->get();
        $sections = [
            ['id' => 'maternelle', 'nom' => 'Maternelle', 'classes' => $classes->where('type', 'maternelle')->values()],
            ['id' => 'primaire', 'nom' => 'Primaire', 'classes' => $classes->where('type', 'primaire')->values()],
            ['id' => 'secondaire', 'nom' => 'Secondaire', 'classes' => $classes->where('type', 'secondaire')->values()],
        ];
        $sections = array_values(array_filter($sections, fn($s) => count($s['classes']) > 0));

        // 3. Get existing FraisClasses with echeances for the current year
        $existingFrais = [];
        if ($currentSchoolYear) {
            $existingFrais = FraisClasse::where('annee_scolaire_id', $currentSchoolYear->id)
                ->whereIn('frais_type_id', $fraisTypes->pluck('id'))
                ->with('echeances')
                ->get()
                ->groupBy('classe_id');
        }

        return Inertia::render('FraisClasses/Index', [
            'sections' => $sections,
            'fraisTypes' => $fraisTypes,
            'existingFrais' => $existingFrais,
            'currentSchoolYear' => $currentSchoolYear,
        ]);
    }

    /**
     * Applique en 1 clic la grille tarifaire officielle et génère les échéanciers :
     * - Maternelle & Primaire : 13 000 FCFA / mois de Septembre à Mai (9 mois = 117 000 FCFA)
     * - Secondaire Général (6e à 1ère hors 3e) : 3 Tranches (70 000, 32 500, 32 500 = 135 000 FCFA)
     * - Secondaire Examen (3e et Terminale) : 3 Tranches (70 000, 37 500, 37 500 = 145 000 FCFA)
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

        $startYear = now()->year;
        if (preg_match('/^(\d{4})/', $currentSchoolYear->nom ?? '', $matches)) {
            $startYear = (int) $matches[1];
        }

        $classes = Classe::all();
        $count = 0;

        DB::beginTransaction();
        try {
            foreach ($classes as $classe) {
                if ($classe->isMaternelle()) {
                    // Maternelle (Petite, Moyenne, Grande Section) : 13 000 FCFA / mois × 9 = 117 000 FCFA
                    $montantTotal = 117000;
                } elseif ($classe->isPrimaire()) {
                    if ($classe->isCinquiemeAnneePrimaire()) {
                        // 5ème Année : 15 000 FCFA / mois × 9 = 135 000 FCFA
                        $montantTotal = 135000;
                    } else {
                        // 1ère Année à 4ème Année : 13 500 FCFA / mois × 9 = 121 500 FCFA
                        $montantTotal = 121500;
                    }
                } elseif ($classe->isClasseExamen()) {
                    // Secondaire Examen (3e et Terminale) : 145 000 FCFA
                    $montantTotal = 145000;
                } else {
                    // Secondaire Général (6e, 5e, 4e, 2nde, 1ère) : 135 000 FCFA
                    $montantTotal = 135000;
                }

                $fraisClasse = FraisClasse::updateOrCreate(
                    [
                        'classe_id' => $classe->id,
                        'annee_scolaire_id' => $currentSchoolYear->id,
                        'frais_type_id' => $fraisType->id,
                    ],
                    [
                        'montant' => $montantTotal,
                    ]
                );

                $this->syncEcheancesForFraisClasse($fraisClasse, $montantTotal, $classe, $currentSchoolYear);
                $count++;
            }

            DB::commit();

            return redirect()->route('frais_classes.index')->with('success', "Le barème officiel a été appliqué avec succès à {$count} classes.");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', "Erreur lors de l'application du barème officiel : " . $e->getMessage());
        }
    }

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

                $fraisClasse = FraisClasse::updateOrCreate(
                    [
                        'classe_id' => $update['classe_id'],
                        'frais_type_id' => $update['frais_type_id'],
                        'annee_scolaire_id' => $currentSchoolYear->id,
                    ],
                    [
                        'montant' => $montant,
                    ]
                );

                if ($classe) {
                    $this->syncEcheancesForFraisClasse($fraisClasse, $montant, $classe, $currentSchoolYear);
                }

                $count++;
            }

            DB::commit();

            return redirect()->route('frais_classes.index')->with('success', "Grille de scolarité mise à jour ($count classes).");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', "Erreur lors de la mise à jour : " . $e->getMessage());
        }
    }

    /**
     * Synchronise les échéances d'un frais de classe selon son cycle et son montant
     */
    private function syncEcheancesForFraisClasse(FraisClasse $fraisClasse, float $montant, Classe $classe, AnneeScolaire $schoolYear)
    {
        $startYear = now()->year;
        if (preg_match('/^(\d{4})/', $schoolYear->nom ?? '', $matches)) {
            $startYear = (int) $matches[1];
        }
        $nextYear = $startYear + 1;

        $echeances = [];

        if ($classe->isMaternelleOuPrimaire()) {
            // Modèle Mensuel : 9 mois de Septembre à Mai
            $mensualite = $montant > 0 ? round($montant / 9) : 0;
            $moisNoms = [
                ['nom' => 'Septembre', 'date' => "{$startYear}-09-30"],
                ['nom' => 'Octobre', 'date' => "{$startYear}-10-31"],
                ['nom' => 'Novembre', 'date' => "{$startYear}-11-30"],
                ['nom' => 'Décembre', 'date' => "{$startYear}-12-31"],
                ['nom' => 'Janvier', 'date' => "{$nextYear}-01-31"],
                ['nom' => 'Février', 'date' => "{$nextYear}-02-28"],
                ['nom' => 'Mars', 'date' => "{$nextYear}-03-31"],
                ['nom' => 'Avril', 'date' => "{$nextYear}-04-30"],
                ['nom' => 'Mai', 'date' => "{$nextYear}-05-31"],
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
        } else {
            // Modèle Secondaire : 3 Tranches
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

        $fraisClasse->echeances()->delete();
        foreach ($echeances as $ech) {
            $fraisClasse->echeances()->create($ech);
        }
    }

    public function store(Request $request)
    {
        $currentSchoolYearId = AnneeScolaire::where('en_cours', true)->value('id');

        $request->validate([
            'classe_ids' => 'required|array|min:1',
            'classe_ids.*' => 'exists:classes,id',
            'frais_type_id' => 'required|exists:frais_types,id',
            'montant' => 'required|numeric|min:0',
        ]);

        // Note: Unique validation is trickier with array. We'll skip existing ones silently or fail?
        // Let's create only if not exists to avoid duplicates error.

        $count = 0;
        foreach ($request->classe_ids as $classeId) {
            // Check uniqueness manually to prevent crash
            $exists = FraisClasse::where('classe_id', $classeId)
                ->where('frais_type_id', $request->frais_type_id)
                ->where('annee_scolaire_id', $currentSchoolYearId)
                ->exists();

            if (!$exists) {
                FraisClasse::create([
                    'classe_id' => $classeId,
                    'frais_type_id' => $request->frais_type_id,
                    'montant' => $request->montant,
                    'annee_scolaire_id' => $currentSchoolYearId,
                ]);
                $count++;
            }
        }

        return request()->wantsJson()
            ? response()->json(['success' => true, 'message' => "$count frais de classe créés."])
            : redirect()->route('frais_classes.index')->with('success', "$count frais de classe créés.");
    }

    // public function update(Request $request, FraisClasse $fraisClasse)
    // {
    //     $request->validate([
    //         'classe_id' => 'sometimes|required|exists:classes,id',
    //         'frais_type_id' => 'sometimes|required|exists:frais_types,id',
    //         'montant' => 'required|numeric|min:0',
    //     ]);

    //     // Seul le montant est modifiable, les autres champs sont ignorés s'ils ne sont pas présents
    //     $fraisClasse->update([
    //         'montant' => $request->montant,
    //         // Les autres champs restent inchangés
    //     ]);

    //     return $request->wantsJson()
    //         ? response()->json(['success' => true, 'message' => 'Frais par classe mis à jour.', 'fraisClasse' => $fraisClasse])
    //         : redirect()->route('frais_classes.index')->with('success', 'Frais par classe mis à jour.');
    // }
    public function updateMontant(Request $request, FraisClasse $fraisClasse)
    {
        $request->validate([
            'montant' => 'required|numeric|min:0',
        ]);

        $fraisClasse->update([
            'montant' => $request->montant,
        ]);

        return $request->wantsJson()
            ? response()->json(['success' => true, 'message' => 'Montant mis à jour.', 'fraisClasse' => $fraisClasse])
            : redirect()->route('frais_classes.index')->with('success', 'Montant mis à jour.');
    }


    public function destroy(FraisClasse $fraisClasse)
    {
        $fraisClasse->delete();

        return request()->wantsJson()
            ? response()->json(['success' => true, 'message' => 'Frais par classe supprimé.'])
            : redirect()->route('frais_classes.index')->with('success', 'Frais par classe supprimé.');
    }
}
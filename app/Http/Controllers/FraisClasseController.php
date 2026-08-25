<?php

namespace App\Http\Controllers;

use App\Models\FraisClasse;
use App\Models\Classe;
use App\Models\AnneeScolaire;

use App\Models\FraisType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class FraisClasseController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_frais_classes')->only('index');
        $this->middleware('permission:ajouter_frais_classes')->only(['store', 'storeBulk', 'updateMontant']);
        $this->middleware('permission:supprimer_frais_classes')->only('destroy');
    }

    public function index(Request $request)
    {
        $currentSchoolYear = AnneeScolaire::where('en_cours', true)->first(['id', 'nom']);
        
        // 1. Get all Tuition Types
        $fraisTypes = FraisType::where('is_scolarite', true)->get(['id', 'nom', 'montant']);

        // 2. Get Sections structure (grouped by type)
        $classes = Classe::orderBy('nom')->get();
        // Construire une structure simulant les sections pour l'interface existante ou simplifiée
        $sections = [
            ['id' => 'maternelle', 'nom' => 'Maternelle', 'classes' => $classes->where('type', 'maternelle')->values()],
            ['id' => 'primaire', 'nom' => 'Primaire', 'classes' => $classes->where('type', 'primaire')->values()],
            ['id' => 'secondaire', 'nom' => 'Secondaire', 'classes' => $classes->where('type', 'secondaire')->values()],
        ];
        // Filtrer les sections vides si nécessaire, ou on les laisse pour l'ajout
        $sections = array_values(array_filter($sections, fn($s) => count($s['classes']) > 0));

        // 3. Get existing FraisClasses for the current year
        $existingFrais = [];
        if ($currentSchoolYear) {
            $existingFrais = FraisClasse::where('annee_scolaire_id', $currentSchoolYear->id)
                ->whereIn('frais_type_id', $fraisTypes->pluck('id'))
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

    public function storeBulk(Request $request)
    {
        $currentSchoolYearId = AnneeScolaire::where('en_cours', true)->value('id');
        
        $request->validate([
            'updates' => 'required|array',
            'updates.*.classe_id' => 'required|exists:classes,id',
            'updates.*.frais_type_id' => 'required|exists:frais_types,id',
            'updates.*.montant' => 'required|numeric|min:0',
        ]);

        $count = 0;

        foreach ($request->updates as $update) {
            FraisClasse::updateOrCreate(
                [
                    'classe_id' => $update['classe_id'],
                    'frais_type_id' => $update['frais_type_id'],
                    'annee_scolaire_id' => $currentSchoolYearId,
                ],
                [
                    'montant' => $update['montant']
                ]
            );
            $count++;
        }

        return redirect()->route('frais_classes.index')->with('success', "Grille de scolarité mise à jour ($count classes).");
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
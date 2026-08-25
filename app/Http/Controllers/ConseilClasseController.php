<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Classe;
use App\Models\Periode;
use App\Models\AnneeScolaire;
use App\Models\BulletinInfo;
use App\Services\BulletinService;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ConseilClasseController extends Controller
{
    protected $bulletinService;

    public function __construct(BulletinService $bulletinService)
    {
        $this->bulletinService = $bulletinService;
        // Permissions : Directeur, Admin, Prof Principal (To be refined)
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $classeId = $request->input('classe_id');
        $periodeId = $request->input('periode_id');

        $classes = Classe::orderBy('nom')->get();
        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        $periodes = $currentYear ? Periode::where('annee_scolaire_id', $currentYear->id)->get() : [];

        $studentsData = [];
        $classe = null;
        $periode = null;

        if ($classeId && $periodeId) {
            $classe = Classe::find($classeId);
            $periode = Periode::find($periodeId);

            if ($classe && $periode) {
                // 1. Calculer les moyennes (service)
                $bulletins = $this->bulletinService->calculerClasseComplet($classeId, $periodeId);

                // 2. Mapper pour le frontend avec les infos existantes (BulletinInfo)
                $studentsData = $bulletins->map(function($b) use ($periodeId) {
                    // Les infos 'appreciation_generale', 'decision' sont déjà injectées par le service 
                    // via la modif précédente (step 429), mais pas directement l'objet BulletinInfo pour édition brute.
                    // Cependant, le service retourne 'bulletin_info_id', 'appreciation_generale', etc.
                    // On va s'assurer d'envoyer tout ça.
                    
                    return [
                        'inscription_id' => $b['inscription']->id,
                        'eleve_nom' => $b['inscription']->eleve->user->full_name,
                        'moyenne' => $b['moyenne_generale'],
                        'rang' => $b['rang'],
                        'appreciation' => $b['appreciation_generale'], // Valeur finale (Manuel ou Auto)
                        'decision' => $b['decision'],
                        'mention' => $b['mention'],
                        'is_manual' => !is_null($b['bulletin_info_id']), // Pour savoir si c'est déjà saisi
                    ];
                })->values();
            }
        }

        return Inertia::render('Conseil/Index', [
            'classes' => $classes,
            'periodes' => $periodes,
            'students' => $studentsData,
            'filters' => ['classe_id' => $classeId, 'periode_id' => $periodeId],
            'selectedClasse' => $classe,
            'selectedPeriode' => $periode
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'classe_id' => 'required',
            'periode_id' => 'required',
            'students' => 'required|array',
            'students.*.inscription_id' => 'required',
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->students as $studentData) {
                // On update ou create
                BulletinInfo::updateOrCreate(
                    [
                        'inscription_id' => $studentData['inscription_id'],
                        'periode_id' => $request->periode_id
                    ],
                    [
                        'appreciation_generale' => $studentData['appreciation'],
                        'decision_conseil' => $studentData['decision'],
                        'mention' => $studentData['mention']
                    ]
                );
            }
            DB::commit();
            return back()->with('success', 'Délibérations enregistrées avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erreur lors de l\'enregistrement : ' . $e->getMessage());
        }
    }
}

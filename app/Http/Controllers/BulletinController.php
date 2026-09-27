<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\Periode;
use App\Models\AnneeScolaire;
use App\Services\BulletinService;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Traits\HandlesStudentAccess;

class BulletinController extends Controller
{
    use HandlesStudentAccess;

    protected $bulletinService;

    public function __construct(BulletinService $bulletinService)
    {
        $this->bulletinService = $bulletinService;
        $this->middleware('permission:voir_bulletins')->only(['index']);
    }

    public function index(Request $request)
    {
        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        
        // 🎓 VUE ÉLÈVE
        if ($this->isStudent()) {
             $inscription = $this->getStudentInscription();
                
            if (!$inscription) {
                return back()->with('error', 'Non inscrit pour cette année.');
            }

            // Récupérer les bulletins disponibles
            $periodes = Periode::where('annee_scolaire_id', $inscription->annee_scolaire_id)
                ->orderBy('date_fin') 
                ->get();
            
            return Inertia::render('Bulletins/Student', [
                'periodes' => $periodes,
                'inscription_id' => $inscription->id
            ]);
        }

        // 🛡️ VUE ADMIN
        $classeId = $request->input('classe_id');
        $periodeId = $request->input('periode_id');

        $classes = Classe::orderBy('nom')->get();
        // $currentYear already fetched
        
        $periodes = [];
        if ($currentYear) {
            $periodes = Periode::where('annee_scolaire_id', $currentYear->id)
                ->where('actif', true)
                ->get();
        }

        $bulletins = [];
        // $selectedClasse & $selectedPeriode logic...

        if ($classeId && $periodeId) {
            $selectedClasse = Classe::find($classeId);
            $selectedPeriode = Periode::find($periodeId);

            if ($selectedClasse && $selectedPeriode) {
                // Calculer les bulletins pour toute la classe
                $bulletins = $this->bulletinService->calculerClasseComplet($classeId, $periodeId);
            }
        }

        return Inertia::render('Bulletins/Index', [
            'classes' => $classes,
            'periodes' => $periodes,
            'bulletins' => $bulletins,
            'filters' => [
                'classe_id' => $classeId,
                'periode_id' => $periodeId
            ]
        ]);
    }

    private function getEtablissementData()
    {
        $etablissement = \App\Models\Etablissement::first();
        $logoPath = null;
        if ($etablissement && $etablissement->logo && file_exists(public_path('storage/' . $etablissement->logo))) {
            $logoPath = public_path('storage/' . $etablissement->logo);
        } elseif (file_exists(public_path('images/logo.png'))) {
            $logoPath = public_path('images/logo.png');
        }

        return [
            'nom' => $etablissement->nom ?? config('app.name', 'Buyedi'),
            'sigle' => $etablissement->sigle ?? 'BUYEDI',
            'adresse' => $etablissement->adresse ?? 'Libreville, Gabon',
            'ville' => $etablissement->ville ?? 'Libreville',
            'telephone' => $etablissement->telephone ?? '',
            'email' => $etablissement->email ?? '',
            'logo' => $logoPath,
        ];
    }

    public function pv(Request $request)
    {
        $classeId = $request->input('classe_id');
        $periodeId = $request->input('periode_id');

        if (!$classeId || !$periodeId) {
            return back()->with('error', 'Veuillez sélectionner une classe et une période.');
        }

        $classe = Classe::with(['eleves.user'])->findOrFail($classeId);
        $periode = Periode::findOrFail($periodeId);

        $matieres = $this->bulletinService->getMatieresForClasse($classe);
        $bulletins = $this->bulletinService->calculerMoyennesClasse($classe, $periode);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.pv', [
            'classe' => $classe,
            'periode' => $periode,
            'bulletins' => $bulletins,
            'matieres' => $matieres,
            'etablissement' => $this->getEtablissementData(),
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('PV_' . str_replace(' ', '_', $classe->nom) . '.pdf');
    }

    public function download($id)
    {
        // $id est l'ID de l'inscription
        $inscription = \App\Models\Inscription::with(['eleve.user', 'classe', 'anneeScolaire'])->findOrFail($id);
        
        // 🔒 SECURITY CHECK: Ensure the auth user owns this inscription (if not admin)
        if (auth()->user()->hasRole('eleve')) {
            $eleve = \App\Models\Eleve::where('user_id', auth()->id())->first();
            if (!$eleve || $inscription->eleve_id !== $eleve->id) {
                abort(403, 'Accès non autorisé à ce bulletin.');
            }
        }

        $periodeId = request('periode_id');
        $periode = Periode::findOrFail($periodeId);

        $bulletin = $this->bulletinService->calculerBulletin($inscription, $periode);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.bulletin', [
            'bulletin' => $bulletin,
            'etablissement' => $this->getEtablissementData(),
        ]);

        return $pdf->stream('bulletin_' . $inscription->eleve->matricule . '.pdf');
    }
}

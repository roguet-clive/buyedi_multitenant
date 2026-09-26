<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Depense;
use Illuminate\Support\Facades\Storage;

class DepenseController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_depenses')->only('index');
        $this->middleware('permission:ajouter_depenses')->only(['create', 'store']);
        $this->middleware('permission:modifier_depenses')->only(['edit', 'update']);
        $this->middleware('permission:supprimer_depenses')->only('destroy');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $defaultCategories = [
            'Loyer',
            'Fourniture',
            'Electricité/Eau',
            'Transport',
            'Entretien',
            'Salaire',
            'Carburant',
            'Pédagogie & Examens',
            'Communication & Internet',
            'Pharmacie & Soins',
            'Autre',
        ];

        // Récupérer les catégories déjà créées et enregistrées en base
        $dbCategories = Depense::whereNotNull('categorie')
            ->where('categorie', '!=', '')
            ->distinct()
            ->pluck('categorie')
            ->toArray();

        // Fusionner et dédupliquer
        $allCategories = array_values(array_filter(array_unique(array_merge($defaultCategories, $dbCategories))));
        $sortedCategories = array_values(array_diff($allCategories, ['Autre']));
        sort($sortedCategories, SORT_STRING | SORT_FLAG_CASE);
        $sortedCategories[] = 'Autre';

        $query = Depense::with('user')->orderBy('date_depense', 'desc')->orderBy('id', 'desc');

        // Filtre par catégorie
        if ($request->filled('categorie') && $request->categorie !== 'all') {
            $query->where('categorie', $request->categorie);
        }

        // Filtre par mode de paiement
        if ($request->filled('mode_paiement') && $request->mode_paiement !== 'all') {
            $query->where('mode_paiement', $request->mode_paiement);
        }

        // Filtre par présence de justificatif
        if ($request->filled('justificatif')) {
            if ($request->justificatif === 'avec') {
                $query->whereNotNull('facture_path');
            } elseif ($request->justificatif === 'sans') {
                $query->whereNull('facture_path');
            }
        }

        // Filtre par recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('categorie', 'like', "%{$search}%")
                  ->orWhere('numero_facture', 'like', "%{$search}%")
                  ->orWhere('beneficiaire', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($u) use ($search) {
                      $u->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%");
                  });
            });
        }

        $depenses = $query->paginate(15)->withQueryString();

        $totalGlobal = (float) Depense::sum('montant');
        $totalMois = (float) Depense::whereMonth('date_depense', now()->month)
            ->whereYear('date_depense', now()->year)
            ->sum('montant');

        $nbTotal = Depense::count();
        $nbAvecFacture = Depense::whereNotNull('facture_path')->count();
            
        return Inertia::render('Depenses/Index', [
            'depenses' => $depenses,
            'categories' => $sortedCategories,
            'filters' => $request->only(['categorie', 'search', 'mode_paiement', 'justificatif']),
            'stats' => [
                'total_global' => $totalGlobal,
                'total_mois' => $totalMois,
                'nb_total' => $nbTotal,
                'nb_avec_facture' => $nbAvecFacture,
            ],
        ]);
    }

    public function create()
    {
        // Not used, modal in index
    }

    public function store(Request $request)
    {
        $request->validate([
            'categorie' => 'required|string|max:100',
            'custom_categorie' => 'nullable|string|max:100',
            'montant' => 'required|numeric|min:1',
            'description' => 'nullable|string|max:1000',
            'date_depense' => 'required|date',
            'numero_facture' => 'nullable|string|max:100',
            'mode_paiement' => 'nullable|string|in:especes,virement,cheque,mobile_money',
            'beneficiaire' => 'nullable|string|max:255',
            'facture' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240', // Max 10 Mo
        ]);

        $categorie = trim($request->categorie);
        if ($categorie === '__custom__' || $categorie === 'NOUVELLE_CATEGORIE') {
            $custom = trim($request->custom_categorie ?? '');
            if (!empty($custom)) {
                $categorie = ucfirst($custom);
            } else {
                $categorie = 'Autre';
            }
        }

        $facturePath = null;
        if ($request->hasFile('facture')) {
            $facturePath = $request->file('facture')->store('depenses', 'public');
        }

        Depense::create([
            'user_id' => auth()->id(),
            'categorie' => $categorie,
            'montant' => $request->montant,
            'description' => $request->description,
            'date_depense' => $request->date_depense,
            'numero_facture' => $request->numero_facture,
            'mode_paiement' => $request->mode_paiement ?? 'especes',
            'beneficiaire' => $request->beneficiaire,
            'facture_path' => $facturePath,
        ]);

        return redirect()->back()->with('success', "Dépense « {$categorie} » enregistrée avec succès ✅");
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        //
    }

    public function update(Request $request, string $id)
    {
        //
    }

    public function destroy(string $id)
    {
        $depense = Depense::findOrFail($id);
        
        // Supprimer la facture du disque si elle existe
        if ($depense->facture_path) {
            Storage::disk('public')->delete($depense->facture_path);
        }

        $depense->delete();
        return redirect()->back()->with('success', 'Dépense et sa pièce justificative supprimées 🗑️');
    }
}

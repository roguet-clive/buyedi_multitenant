<?php

namespace App\Http\Controllers;

use App\Models\Classe;

use App\Models\AnneeScolaire;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClasseController extends Controller
{
    use \App\Traits\HandlesTeacherAccess;

    public function index(Request $request)
    {
        $search = $request->input('search');
        $type = $request->input('type');

        $query = Classe::query()
            ->when($search, fn($q) => $q->where('nom', 'like', "%{$search}%"))
            ->withCount(['inscriptions' => function ($query) {
                $query->whereHas('anneeScolaire', function ($q) {
                    $q->where('en_cours', true);
                });
            }])
            ->when($type, fn($q) => $q->where('type', $type));

        // 🔒 SCOPING ENSEIGNANT
        if (!\Illuminate\Support\Facades\Auth::user()->hasRole(['super-admin', 'directeur']) && $this->isTeacher()) {
            $myClassIds = $this->getTeacherClassIds();
            $query->whereIn('id', $myClassIds);
        }

        $classes = $query->paginate(10)->withQueryString();

        return Inertia::render('Classes/Index', [
            'classes' => $classes,
            'filters' => [
                'search' => $search,
                'type' => $type,
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'can' => [
                'create_classes' => $request->user() ? $request->user()->can('ajouter_classes') : false,
                'edit_classes' => $request->user() ? $request->user()->can('modifier_classes') : false,
                'delete_classes' => $request->user() ? $request->user()->can('supprimer_classes') : false,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|unique:classes,nom',
            'type' => 'required|in:creche,maternelle,primaire,secondaire',
        ]);

        Classe::create($validated);

        return redirect()->route('classes.index')
                         ->with('success', __('Classe créée avec succès ✅'));
    }

    public function update(Request $request, Classe $classe)
    {
        $validated = $request->validate([
            'nom' => "required|string|unique:classes,nom,{$classe->id},id",
            'type' => 'required|in:creche,maternelle,primaire,secondaire',
        ]);

        $classe->update($validated);

        return redirect()->route('classes.index')
                        ->with('success', __('Classe mise à jour ✅'));
    }

    public function destroy(Classe $classe)
    {
        $classe->delete();

        return redirect()->route('classes.index')
                         ->with('success', __('Classe supprimée ✅'));
    }
}

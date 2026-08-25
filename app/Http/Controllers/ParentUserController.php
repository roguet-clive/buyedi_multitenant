<?php

namespace App\Http\Controllers;

use App\Models\ParentModel;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Mail\NewUserCredentials;
use Illuminate\Support\Facades\Mail;

class ParentUserController extends Controller
{
    use \App\Traits\HandlesTeacherAccess;

    public function __construct()
    {
        $this->middleware('permission:voir_parents')->only(['index', 'searchEleves']);
        $this->middleware('permission:ajouter_parents')->only(['create', 'store']);
        $this->middleware('permission:modifier_parents')->only(['edit', 'update']);
        $this->middleware('permission:supprimer_parents')->only('destroy');
    }

    public function index(Request $request)
    {
        $search = $request->input('search');
        $user = $request->user();

        $query = ParentModel::with(['user', 'eleves.user'])
            ->when($search, fn($query, $search) =>
                $query->whereHas('user', fn($q) =>
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('prenom', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                )
            );

        // 🔒 SCOPING DE DONNÉES PAR RÔLE
        if (!$user->hasRole(['super-admin', 'directeur'])) {
            if ($this->isTeacher()) {
                // Les enseignants ne voient que les parents qui ont des enfants dans leurs classes
                $myClassIds = $this->getTeacherClassIds();
                $query->whereHas('eleves.inscriptions', function ($q) use ($myClassIds) {
                    $q->whereIn('classe_id', $myClassIds);
                });
            }
        }

        $parents = $query->paginate(10)->withQueryString();

        return Inertia::render('Parents/Index', [
            'parents' => $parents,
            'filters' => ['search' => $search],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function searchEleves(Request $request)
    {
        $query = $request->input('query');
        
        $eleves = \App\Models\Eleve::with('user')
            ->where('matricule', 'like', "%{$query}%")
            ->orWhereHas('user', fn($q) => 
                $q->where('nom', 'like', "%{$query}%")
                  ->orWhere('prenom', 'like', "%{$query}%")
            )
            ->limit(20)
            ->get()
            ->map(fn($eleve) => [
                'value' => $eleve->id,
                'label' => $eleve->matricule . ' - ' . ($eleve->user->prenom ?? '') . ' ' . ($eleve->user->nom ?? '')
            ]);
            
        return response()->json($eleves);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'eleve_ids' => 'nullable|array',
            'eleve_ids.*' => 'exists:eleves,id',
        ]);

        // 🔹 Créer le user associé
        $defaultPassword = Str::random(10);
        $user = User::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'] ?? null,
            'email' => $validated['email'],
            'password' => bcrypt($defaultPassword),
        ]);

        // Assigner le rôle 'parent'
        $user->assignRole('parent');

        // 🔹 Créer le parent
        $parent = ParentModel::create([
            'user_id' => $user->id,
            'telephone' => $validated['telephone'] ?? null,
            'adresse' => $validated['adresse'] ?? null,
        ]);

        // 🔹 Attacher les élèves
        if (!empty($validated['eleve_ids'])) {
            $parent->eleves()->sync($validated['eleve_ids']);
        }

        // 🔹 Envoyer email avec mot de passe
        Mail::to($user->email)->send(new NewUserCredentials($user, $defaultPassword));

        return redirect()->route('parents.index')
            ->with('success', 'Parent créé avec succès ✅');
    }

    public function update(Request $request, ParentModel $parent)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'email' => "required|email|unique:users,email,{$parent->user_id}",
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'eleve_ids' => 'nullable|array',
            'eleve_ids.*' => 'exists:eleves,id',
        ]);

        // 🔹 Mettre à jour le user
        $parent->user->update([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'] ?? null,
            'email' => $validated['email'],
        ]);

        // 🔹 Mettre à jour le parent
        $parent->update([
            'telephone' => $validated['telephone'] ?? null,
            'adresse' => $validated['adresse'] ?? null,
        ]);

        // 🔹 Mettre à jour les élèves
        if (isset($validated['eleve_ids'])) {
            $parent->eleves()->sync($validated['eleve_ids']);
        }

        return redirect()->route('parents.index')
            ->with('success', 'Parent mis à jour ✅');
    }

    public function destroy(ParentModel $parent)
    {
        // Supprimer le user supprimera le parent via la relation
        $parent->user->delete();

        return redirect()->route('parents.index')
            ->with('success', 'Parent supprimé ✅');
    }
}

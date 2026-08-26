<?php

namespace App\Http\Controllers;

use App\Models\Communication;
use App\Models\User;
use App\Models\Classe;
use App\Models\AnneeScolaire;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Notification;
use App\Notifications\MessageNotification;

class CommunicationController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_communications')->only(['index', 'show', 'inbox']);
        $this->middleware('permission:creer_communications')->only(['create', 'store']);
    }

    public function index()
    {
        $user = auth()->user();

        // 🎓 Si l'utilisateur est un élève, redirection directe vers la boîte de réception
        if ($user->hasRole('eleve')) {
            return redirect()->route('communications.inbox');
        }

        $communications = Communication::with('recipients:id,nom,prenom')
            ->where('sender_id', $user->id)
            ->latest()
            ->paginate(10);

        return Inertia::render('Communications/Index', [
            'communications' => $communications,
            'canCreate' => $user->can('creer_communications') && !$user->hasRole('eleve'),
        ]);
    }

    public function inbox()
    {
        $user = auth()->user();

        $messages = $user->notifications()
            ->where('type', MessageNotification::class)
            ->latest()
            ->paginate(15);

        return Inertia::render('Communications/Inbox', [
            'messages' => $messages,
            'canCreate' => $user->can('creer_communications') && !$user->hasRole('eleve'),
            'userRole' => $user->roles->pluck('name')->first() ?? 'user',
        ]);
    }

    public function create()
    {
        $user = auth()->user();

        // 🎓 Sécurité : Les élèves sont en lecture seule
        if ($user->hasRole('eleve')) {
            return redirect()->route('communications.inbox')->with('error', 'Les élèves ne sont pas autorisés à rédiger des messages.');
        }

        $currentYear = AnneeScolaire::where('en_cours', true)->first() ?? AnneeScolaire::latest()->first();
        $adminRoles = Role::whereIn('name', ['super-admin', 'directeur', 'personnel'])->get();

        // 👨‍👩‍👧 VUE & DONNÉES POUR LES PARENTS
        if ($user->hasRole('parent')) {
            $parent = $user->parent;
            $children = $parent ? $parent->eleves()->with(['inscriptions' => function($q) use ($currentYear) {
                if ($currentYear) $q->where('annee_scolaire_id', $currentYear->id);
            }])->get() : collect();

            $classIds = $children->pluck('inscriptions')->flatten()->pluck('classe_id')->filter()->unique();

            // Professeurs ayant en charge les enfants du parent
            $teachers = User::whereHas('enseignant.cours', function($q) use ($classIds, $currentYear) {
                $q->whereIn('classe_id', $classIds);
                if ($currentYear) $q->where('annee_scolaire_id', $currentYear->id);
            })->with(['enseignant.cours.matiere'])->get()->map(function($u) {
                $matieres = $u->enseignant?->cours->pluck('matiere.nom')->filter()->unique()->join(', ');
                return [
                    'value' => $u->id,
                    'label' => "Prof. {$u->nom} {$u->prenom}" . ($matieres ? " ({$matieres})" : ""),
                ];
            });

            return Inertia::render('Communications/Create', [
                'roleType' => 'parent',
                'adminRoles' => $adminRoles,
                'teachers' => $teachers,
                'classes' => collect(),
                'roles' => $adminRoles,
            ]);
        }

        // 👨‍🏫 VUE & DONNÉES POUR LES ENSEIGNANTS
        if ($user->hasRole('enseignant')) {
            $enseignant = $user->enseignant;
            
            // Classes assignées à cet enseignant cette année
            $classes = $enseignant ? Classe::whereHas('cours', function($q) use ($enseignant, $currentYear) {
                $q->where('enseignant_id', $enseignant->id);
                if ($currentYear) $q->where('annee_scolaire_id', $currentYear->id);
            })->orderBy('nom')->get() : collect();

            $classIds = $classes->pluck('id');

            // Parents des élèves des classes de l'enseignant
            $parents = User::whereHas('parent.eleves.inscriptions', function($q) use ($classIds, $currentYear) {
                $q->whereIn('classe_id', $classIds);
                if ($currentYear) $q->where('annee_scolaire_id', $currentYear->id);
            })->with('parent.eleves')->get()->map(function($u) {
                $childrenNames = $u->parent?->eleves->map(fn($e) => "{$e->nom} {$e->prenom}")->join(', ');
                return [
                    'value' => $u->id,
                    'label' => "{$u->nom} {$u->prenom}" . ($childrenNames ? " (Parent de {$childrenNames})" : ""),
                ];
            });

            return Inertia::render('Communications/Create', [
                'roleType' => 'teacher',
                'adminRoles' => $adminRoles,
                'classes' => $classes,
                'parents' => $parents,
                'roles' => $adminRoles,
            ]);
        }

        // 👑 VUE SUPER-ADMIN / DIRECTION
        $roles = Role::all();
        $classes = Classe::orderBy('nom')->get();

        return Inertia::render('Communications/Create', [
            'roleType' => 'admin',
            'roles' => $roles,
            'classes' => $classes,
            'adminRoles' => $adminRoles,
        ]);
    }

    public function show(Communication $communication)
    {
        $user = auth()->user();
        $isRecipient = $communication->recipients()->where('user_id', $user->id)->exists();

        if ($communication->sender_id !== $user->id && !$isRecipient && !$user->hasRole(['super-admin', 'directeur'])) {
            abort(403, 'Accès non autorisé à cette communication.');
        }

        // Marquer comme lu si c'est un destinataire
        if ($isRecipient) {
            $communication->recipients()->updateExistingPivot($user->id, ['read_at' => now()]);
            
            $user->unreadNotifications
                ->where('data.communication_id', $communication->id)
                ->markAsRead();
        }

        $isSenderOrAdmin = ($communication->sender_id === $user->id) || $user->hasRole(['super-admin', 'directeur']);

        $communication->load('sender:id,nom,prenom,email');
        if ($isSenderOrAdmin) {
            $communication->load(['recipients' => function($query) {
                $query->select('users.id', 'users.nom', 'users.prenom', 'users.email');
            }]);
        } else {
            $communication->setRelation('recipients', collect([]));
        }

        return Inertia::render('Communications/Show', [
            'communication' => $communication,
            'isSenderOrAdmin' => $isSenderOrAdmin,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        // 🎓 1. Sécurité : Élèves non autorisés
        if ($user->hasRole('eleve')) {
            abort(403, 'Action non autorisée.');
        }

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'target_type' => 'required|string|in:all,role,classe,user',
            'target_id' => 'nullable|integer',
        ]);

        $currentYear = AnneeScolaire::where('en_cours', true)->first() ?? AnneeScolaire::latest()->first();
        $recipients = collect();

        // 👨‍👩‍👧 2. Restrictions Parent
        if ($user->hasRole('parent')) {
            if (!in_array($validated['target_type'], ['role', 'user'])) {
                return back()->with('error', 'Option de destinataire non autorisée pour un parent.');
            }

            if ($validated['target_type'] === 'role') {
                $targetRole = Role::find($validated['target_id']);
                if (!$targetRole || !in_array($targetRole->name, ['super-admin', 'directeur', 'personnel'])) {
                    return back()->with('error', 'Vous ne pouvez contacter que l\'Administration ou la Direction.');
                }
                $recipients = User::role($targetRole->name)->get();
            } else {
                // target_type === 'user' -> Vérifier que c'est un enseignant de ses enfants ou un admin
                $targetUser = User::find($validated['target_id']);
                if (!$targetUser) return back()->with('error', 'Destinataire introuvable.');

                $parent = $user->parent;
                $children = $parent ? $parent->eleves()->with(['inscriptions' => function($q) use ($currentYear) {
                    if ($currentYear) $q->where('annee_scolaire_id', $currentYear->id);
                }])->get() : collect();

                $classIds = $children->pluck('inscriptions')->flatten()->pluck('classe_id')->filter()->unique();

                $isTeacherOfChild = User::where('id', $targetUser->id)
                    ->whereHas('enseignant.cours', function($q) use ($classIds, $currentYear) {
                        $q->whereIn('classe_id', $classIds);
                        if ($currentYear) $q->where('annee_scolaire_id', $currentYear->id);
                    })->exists();

                $isAdmin = $targetUser->hasRole(['super-admin', 'directeur', 'personnel']);

                if (!$isTeacherOfChild && !$isAdmin) {
                    return back()->with('error', 'Vous ne pouvez écrire qu\'aux professeurs de vos enfants ou à l\'administration.');
                }

                $recipients->push($targetUser);
            }
        }

        // 👨‍🏫 3. Restrictions Enseignant
        elseif ($user->hasRole('enseignant')) {
            $enseignant = $user->enseignant;
            $allowedClasses = $enseignant ? Classe::whereHas('cours', function($q) use ($enseignant, $currentYear) {
                $q->where('enseignant_id', $enseignant->id);
                if ($currentYear) $q->where('annee_scolaire_id', $currentYear->id);
            })->pluck('id') : collect();

            if ($validated['target_type'] === 'all') {
                return back()->with('error', 'Les enseignants ne peuvent pas diffuser à tout l\'établissement.');
            }

            if ($validated['target_type'] === 'classe') {
                if (!$allowedClasses->contains($validated['target_id'])) {
                    return back()->with('error', 'Vous ne pouvez contacter que vos classes assignées.');
                }
                // Destinataires = Élèves de la classe + Parents des élèves
                $students = User::whereHas('eleve.inscriptions', function($q) use ($validated, $currentYear) {
                    $q->where('classe_id', $validated['target_id']);
                    if ($currentYear) $q->where('annee_scolaire_id', $currentYear->id);
                })->get();

                $parents = User::whereHas('parent.eleves.inscriptions', function($q) use ($validated, $currentYear) {
                    $q->where('classe_id', $validated['target_id']);
                    if ($currentYear) $q->where('annee_scolaire_id', $currentYear->id);
                })->get();

                $recipients = $students->merge($parents)->unique('id');
            } elseif ($validated['target_type'] === 'role') {
                $targetRole = Role::find($validated['target_id']);
                if (!$targetRole || !in_array($targetRole->name, ['super-admin', 'directeur', 'personnel'])) {
                    return back()->with('error', 'Rôle destinataire non autorisé.');
                }
                $recipients = User::role($targetRole->name)->get();
            } elseif ($validated['target_type'] === 'user') {
                $targetUser = User::find($validated['target_id']);
                if (!$targetUser) return back()->with('error', 'Destinataire introuvable.');

                $isParentOfClass = User::where('id', $targetUser->id)
                    ->whereHas('parent.eleves.inscriptions', function($q) use ($allowedClasses, $currentYear) {
                        $q->whereIn('classe_id', $allowedClasses);
                        if ($currentYear) $q->where('annee_scolaire_id', $currentYear->id);
                    })->exists();

                $isAdmin = $targetUser->hasRole(['super-admin', 'directeur', 'personnel']);

                if (!$isParentOfClass && !$isAdmin) {
                    return back()->with('error', 'Vous ne pouvez contacter que les parents de vos classes ou la direction.');
                }

                $recipients->push($targetUser);
            }
        }

        // 👑 4. Super-Admin / Direction
        else {
            switch ($validated['target_type']) {
                case 'all':
                    $recipients = User::all();
                    break;
                case 'role':
                    $role = Role::find($validated['target_id']);
                    if ($role) {
                        $recipients = User::role($role->name)->get();
                    }
                    break;
                case 'classe':
                    $students = User::whereHas('eleve.inscriptions', function($q) use ($validated, $currentYear) {
                        $q->where('classe_id', $validated['target_id']);
                        if ($currentYear) $q->where('annee_scolaire_id', $currentYear->id);
                    })->get();

                    $parents = User::whereHas('parent.eleves.inscriptions', function($q) use ($validated, $currentYear) {
                        $q->where('classe_id', $validated['target_id']);
                        if ($currentYear) $q->where('annee_scolaire_id', $currentYear->id);
                    })->get();

                    $recipients = $students->merge($parents)->unique('id');
                    break;
                case 'user':
                    $targetUser = User::find($validated['target_id']);
                    if ($targetUser) $recipients->push($targetUser);
                    break;
            }
        }

        if ($recipients->isEmpty()) {
            return back()->with('error', 'Aucun destinataire trouvé pour ce critère.');
        }

        // Création de la communication
        $communication = Communication::create([
            'sender_id' => $user->id,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'type' => 'notification',
            'target_type' => $validated['target_type'],
            'target_id' => $validated['target_id'] ?? 0
        ]);

        // Attacher les destinataires
        $communication->recipients()->attach($recipients->pluck('id'));

        // Envoyer les notifications
        $senderName = "{$user->prenom} {$user->nom}";
        Notification::send($recipients, new MessageNotification([
            'title' => "📩 Message de {$senderName} : " . $validated['subject'],
            'message' => str($validated['message'])->limit(120),
            'communication_id' => $communication->id,
            'link' => route('communications.show', $communication->id),
            'action_url' => route('communications.show', $communication->id),
        ]));

        return redirect()->route('communications.index')->with('success', 'Message envoyé avec succès à ' . $recipients->count() . ' destinataire(s).');
    }
}

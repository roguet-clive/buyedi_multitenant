<?php

namespace App\Http\Controllers;

use App\Models\Communication;
use App\Models\User;
use App\Models\Classe;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Notification;
use App\Notifications\MessageNotification;

class CommunicationController extends Controller
{
    public function __construct()
    {
        // Require permission for all actions, or fine-tune
        $this->middleware('permission:voir_communications')->only(['index', 'show', 'inbox']);
        $this->middleware('permission:creer_communications')->only(['create', 'store']);
    }

    public function index()
    {
        $communications = Communication::with('recipients:id,nom,prenom')
            ->where('sender_id', auth()->id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Communications/Index', [
            'communications' => $communications
        ]);
    }

    public function inbox()
    {
        $messages = auth()->user()->notifications()
            ->where('type', 'App\Notifications\MessageNotification')
            ->latest()
            ->paginate(15);

        return Inertia::render('Communications/Inbox', [
            'messages' => $messages
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        $roles = Role::all();
        $classes = Classe::all();

        // Si c'est un parent, il ne peut contacter que l'Admin, la Direction, ou le Secrétariat
        if ($user->hasRole('parent')) {
            $roles = Role::whereIn('name', ['super-admin', 'directeur', 'personnel'])->get(); 
            // On ne lui permet pas de contacter des classes entières
            $classes = collect(); 
        }

        return Inertia::render('Communications/Create', [
            'roles' => $roles,
            'classes' => $classes,
            'isParent' => $user->hasRole('parent')
        ]);
    }

    public function show(Communication $communication)
    {
        // Vérifier que l'utilisateur est l'expéditeur OU un destinataire (ou admin)
        $isRecipient = $communication->recipients()->where('user_id', auth()->id())->exists();

        if ($communication->sender_id !== auth()->id() && !$isRecipient && !auth()->user()->hasRole('super-admin')) {
            abort(403);
        }

        // Marquer comme lu si c'est un destinataire
        if ($isRecipient) {
            // 1. Pivot Table (Logique métier)
            $communication->recipients()->updateExistingPivot(auth()->id(), ['read_at' => now()]);
            
            // 2. Database Notification (Badge Header)
            // On cherche la notification liée à ce message pour l'utilisateur courant et on la marque comme "lue"
            auth()->user()->unreadNotifications
                ->where('data.communication_id', $communication->id)
                ->markAsRead();
        }

        $communication->load(['recipients' => function($query) {
            $query->select('users.id', 'users.nom', 'users.prenom', 'users.email');
        }]);

        return Inertia::render('Communications/Show', [
            'communication' => $communication
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'target_type' => 'required|string', // role, classe, user, all
            'target_id' => 'nullable|integer', // role_id, classe_id, user_id
        ]);

        $user = auth()->user();

        // SECURITE : Restriction pour les Parents
        if ($user->hasRole('parent')) {
            // Forcer le type à 'role' ou 'user' (admin/prof), interdit 'all' ou 'classe'
            if (!in_array($validated['target_type'], ['role', 'user'])) {
                 return back()->with('error', 'Action non autorisée.');
            }
            
            // Si c'est un rôle, vérifier que c'est un rôle autorisé
            if ($validated['target_type'] === 'role') {
                 $targetRole = Role::find($validated['target_id']);
                 if (!$targetRole || !in_array($targetRole->name, ['super-admin', 'directeur', 'personnel'])) {
                     return back()->with('error', 'Destinataire non autorisé.');
                 }
            }
        }

        $recipients = collect();

        // 1. Résolution des destinataires
        switch ($validated['target_type']) {
            case 'all':
                $recipients = User::all();
                break;
            case 'role':
                // target_id = role_id. Mais User::role accept nom. Récupérer nom.
                $role = Role::find($validated['target_id']);
                if ($role) {
                    $recipients = User::role($role->name)->get();
                }
                break;
            case 'classe':
                // Tous les parents des élèves de la classe
                $classe = Classe::with('inscriptions.eleve.parents')->find($validated['target_id']);
                if ($classe) {
                    foreach ($classe->inscriptions as $inscription) {
                        if ($inscription->eleve && $inscription->eleve->parents) {
                            $recipients = $recipients->merge($inscription->eleve->parents); 
                        }
                    }
                }
                break;
            case 'user':
                $user = User::find($validated['target_id']);
                if ($user) $recipients->push($user);
                break;
        }

        // 2. Création de la Com
        $communication = Communication::create([
            'sender_id' => auth()->id(),
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'type' => 'notification',
            'target_type' => $validated['target_type'],
            'target_id' => $validated['target_id'] ?? 0
        ]);

        // 3. Attacher relations dans pivot
        $communication->recipients()->attach($recipients->pluck('id'));

        // 4. Envoyer Notifs
        Notification::send($recipients, new MessageNotification([
            'title' => 'Nouveau Message : ' . $validated['subject'],
            'message' => str($validated['message'])->limit(100),
            'communication_id' => $communication->id,
            'link' => route('communications.show', $communication->id)
        ]));

        return redirect()->route('communications.index')->with('success', 'Message envoyé à ' . $recipients->count() . ' destinataires.');
    }
}

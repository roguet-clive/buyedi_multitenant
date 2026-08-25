<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        // Récupérer les notifications de l'utilisateur connecté (EXCLURE les messages)
        // On pagine pour éviter de surcharger
        $notifications = Auth::user()->notifications()
            ->where('type', '!=', 'App\Notifications\MessageNotification')
            ->paginate(20);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications
        ]);
    }

    public function markAsRead($id)
    {
        $notification = Auth::user()->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
        }

        return back();
    }

    public function markAllAsRead()
    {
        Auth::user()->unreadNotifications()
            ->where('type', '!=', 'App\Notifications\MessageNotification')
            ->get()->each(function($n) {
                $n->markAsRead();
            });
        return back();
    }
}

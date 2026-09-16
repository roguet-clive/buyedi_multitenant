<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $filter = $request->input('filter', 'all'); // 'all' ou 'unread'

        $baseQuery = $user->notifications()
            ->where('type', '!=', 'App\Notifications\MessageNotification');

        $unreadCount = (clone $baseQuery)->whereNull('read_at')->count();
        $totalCount = (clone $baseQuery)->count();

        $query = clone $baseQuery;
        if ($filter === 'unread') {
            $query->whereNull('read_at');
        }

        $notifications = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
            'totalCount' => $totalCount,
            'currentFilter' => $filter,
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

    public function destroy($id)
    {
        $notification = Auth::user()->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->delete();
        }

        return back()->with('success', 'Notification supprimée.');
    }

    public function destroyAllRead()
    {
        Auth::user()->readNotifications()
            ->where('type', '!=', 'App\Notifications\MessageNotification')
            ->delete();

        return back()->with('success', 'Historique des notifications lues supprimé.');
    }
}

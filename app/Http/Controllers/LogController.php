<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;
use App\Models\User;

class LogController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_logs')->only(['index']);
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'date', 'causer_id', 'subject_type', 'categorie']);

        $logs = Activity::with('causer')
            ->orderBy('created_at', 'desc')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('description', 'like', "%{$search}%")
                      ->orWhere('properties', 'like', "%{$search}%")
                      ->orWhere('log_name', 'like', "%{$search}%");
                });
            })
            ->when($request->date, function ($query, $date) {
                $query->whereDate('created_at', $date);
            })
            ->when($request->causer_id, function ($query, $id) {
                $query->where('causer_id', $id);
            })
            ->when($request->categorie, function ($query, $cat) {
                if ($cat === 'auth') {
                    $query->whereIn('log_name', ['authentification', 'securite']);
                } elseif ($cat === 'data') {
                    $query->whereNotIn('log_name', ['authentification', 'securite']);
                }
            })
            ->when($request->subject_type, function ($query, $type) {
                if ($type === 'authentification' || $type === 'securite') {
                    $query->where('log_name', $type);
                } else {
                    $query->where('subject_type', 'like', "%{$type}%");
                }
            })
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Logs/Index', [
            'logs' => $logs,
            'filters' => $filters,
            'users' => User::orderBy('nom')->get(['id', 'nom', 'prenom']), // For filter dropdown
        ]);
    }
}

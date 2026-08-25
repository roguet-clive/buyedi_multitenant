<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;

class IAController extends Controller
{
    public function index()
    {
        // Récupérer uniquement les notifications de type "Alerte IA"
        // On filtre sur le json de la notif où title contient "IA"
        $alerts = Auth::user()->notifications()
            ->where('data->title', 'like', '%(IA)%')
            ->paginate(10);

        return Inertia::render('IA/Index', [
            'alerts' => $alerts
        ]);
    }

    public function runAnalysis()
    {
        // Lancer la commande
        Artisan::call('app:run-ia-analysis');
        
        return back()->with('success', 'Analyse IA lancée avec succès ! Vérifiez vos notifications.');
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LanguageController extends Controller
{
    public function __invoke(Request $request)
    {
        $locale = $request->input('locale');
        session(['locale' => $locale]);
        app()->setLocale(session('locale', config('app.locale')));
        return back();
    }
}

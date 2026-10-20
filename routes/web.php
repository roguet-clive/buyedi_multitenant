<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Central\LandingController;
use App\Http\Controllers\Central\OnboardingController;
use App\Http\Controllers\Central\SuperAdminController;

/*
|--------------------------------------------------------------------------
| Central Web Routes (Plateforme SaaS Buyedi)
|--------------------------------------------------------------------------
|
| Ces routes sont exécutées uniquement sur le domaine central (ex: buyedi.com, localhost)
| pour la vitrine commerciale, l'onboarding automatisé des écoles,
| et le tableau de bord Super-Admin de la plateforme.
|
*/

foreach (config('tenancy.central_domains', ['localhost', '127.0.0.1']) as $centralDomain) {
    Route::domain($centralDomain)->group(function () {
        // 🌐 Accueil Commercial / Landing page SaaS
        Route::get('/', [LandingController::class, 'index'])->name('central.landing');

        // 🚀 Onboarding automatisé (Création d'établissement en 1 clic)
        Route::get('/onboarding', [OnboardingController::class, 'create'])->name('central.onboarding');
        Route::post('/onboarding', [OnboardingController::class, 'store'])->name('central.onboarding.store');
        Route::get('/api/check-subdomain', [OnboardingController::class, 'checkSubdomain'])->name('central.api.check-subdomain');

        // 👑 Console Super-Admin SaaS Buyedi Solutions
        Route::prefix('super-admin')->group(function () {
            Route::get('/', [SuperAdminController::class, 'index'])->name('central.super-admin.index');
            Route::patch('/tenants/{tenant}/status', [SuperAdminController::class, 'updateStatus'])->name('central.super-admin.update-status');
            Route::post('/tenants/{tenant}/impersonate', [SuperAdminController::class, 'impersonate'])->name('central.super-admin.impersonate');
            Route::post('/payments', [SuperAdminController::class, 'storePayment'])->name('central.super-admin.store-payment');
        });
    });
}

<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;
use App\Http\Middleware\EnforceTenantActive;

/*
|--------------------------------------------------------------------------
| Tenant Routes (Espace Établissement Scolaire)
|--------------------------------------------------------------------------
|
| Ces routes sont exécutées uniquement dans le contexte d'un tenant
| (sous-domaine ou domaine personnalisé de l'école).
| Le middleware InitializeTenancyByDomain bascule automatiquement
| la connexion de base de données vers la base dédiée de l'école.
|
*/

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
    EnforceTenantActive::class,
])->group(base_path('routes/app_school.php'));

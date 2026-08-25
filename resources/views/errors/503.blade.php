@extends('errors.layout')

@section('title', 'Maintenance')

@section('content')
    <div class="mb-6">
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
            <svg class="h-10 w-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.703.127 1.5.876 2.199 3.303 1.639 5.86M12 4a3.973 3.973 0 00-4 4 .244.244 0 01-.019.091 10.375 10.375 0 01-3.13 6.948 10.38 10.38 0 0011.666-5.717 10.37 10.37 0 01-1.282-4.008A2.43 2.43 0 0112 4z" />
            </svg>
        </div>
    </div>
    
    <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">Maintenance</h1>
    <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">De retour bientôt</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-8">
        Nous effectuons actuellement une maintenance planifiée. Le service sera rétabli dans quelques instants.
    </p>
    
    <div class="flex flex-col gap-3">
        <div class="w-full text-center text-sm text-gray-500">
            Merci de votre patience.
        </div>
    </div>
@endsection

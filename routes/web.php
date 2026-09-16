<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AnneeScolaireController;
use App\Http\Controllers\ClasseController;
use App\Http\Controllers\EleveController;
use App\Http\Controllers\InscriptionController;
use App\Http\Controllers\ParentUserController;

use App\Http\Controllers\FraisTypeController;
use App\Http\Controllers\FraisClasseController;
use App\Http\Controllers\FraisInscriptionController;
use App\Http\Controllers\PaiementController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Middleware\SetLocale;

// 🌐 Changer la langue
Route::post('/lang', \App\Http\Controllers\LanguageController::class)->name('language.switch');

// 📦 Toutes les routes protégées par le middleware SetLocale
Route::middleware([SetLocale::class])->group(function () {

    Route::get('/', function () {
        return redirect()->route('login');
    });

    // 🏠 Tableau de bord
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
        ->middleware(['auth', 'verified'])
        ->name('dashboard');

    // 🚪 Routes pour les invités (Les routes auth sont dans auth.php)
    Route::middleware('guest')->group(function () {
        // ... handled in auth.php
    });

    // 🔒 Routes pour utilisateurs connectés
    Route::middleware('auth')->group(function () {
        // Profil de l'utilisateur (Requis par Breeze/layout)
        Route::get('/profile', [App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');

        // Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');


        // Gestion des utilisateurs
        Route::resource('users', UserController::class);

        // Gestion des personnels
        Route::resource('personnels', \App\Http\Controllers\PersonnelController::class);

        // Gestion des enseignants
        Route::resource('enseignants', \App\Http\Controllers\EnseignantController::class);

        // Gestion des rôles
        Route::resource('roles', RoleController::class);

        // Gestion des matières
        Route::resource('matieres', \App\Http\Controllers\MatiereController::class);



        // Gestion des classes
        Route::get('classes', [ClasseController::class, 'index'])
            ->name('classes.index')
            ->middleware('permission:voir_classes');
        Route::post('classes', [ClasseController::class, 'store'])
            ->name('classes.store')
            ->middleware('permission:ajouter_classes');
        Route::put('classes/{classe}', [ClasseController::class, 'update'])
            ->name('classes.update')
            ->middleware('permission:modifier_classes');
        Route::delete('classes/{classe}', [ClasseController::class, 'destroy'])
            ->name('classes.destroy')
            ->middleware('permission:supprimer_classes');

        // Gestion des années scolaires
        Route::get('annee_scolaires', [AnneeScolaireController::class, 'index'])
            ->name('annee_scolaires.index')
            ->middleware('permission:voir_annee_scolaire');
        Route::get('annee_scolaires/create', [AnneeScolaireController::class, 'create'])
            ->name('annee_scolaires.create')
            ->middleware('permission:ajouter_annee_scolaire');
        Route::post('annee_scolaires', [AnneeScolaireController::class, 'store'])
            ->name('annee_scolaires.store')
            ->middleware('permission:ajouter_annee_scolaire');
        Route::get('annee_scolaires/{annee_scolaire}/edit', [AnneeScolaireController::class, 'edit'])
            ->name('annee_scolaires.edit')
            ->middleware('permission:modifier_annee_scolaire');
        Route::put('annee_scolaires/{annee_scolaire}', [AnneeScolaireController::class, 'update'])
            ->name('annee_scolaires.update')
            ->middleware('permission:modifier_annee_scolaire');
        Route::delete('annee_scolaires/{annee_scolaire}', [AnneeScolaireController::class, 'destroy'])
            ->name('annee_scolaires.destroy')
            ->middleware('permission:supprimer_annee_scolaire');
        Route::post('annee_scolaires/{annee_scolaire}/set-current', [AnneeScolaireController::class, 'setCurrent'])
            ->name('annee_scolaires.setCurrent')
            ->middleware('permission:modifier_annee_scolaire');

        // Gestion des Périodes (Trimestres/Semestres)
        Route::resource('periodes', \App\Http\Controllers\PeriodeController::class);

        // Gestion des élèves (Documents & Profil Élève)
        Route::get('mon-dossier', [EleveController::class, 'monDossier'])->name('eleves.mon-dossier');
        Route::post('eleves/{eleve}/documents', [EleveController::class, 'storeDocument'])->name('eleves.documents.store');
        Route::delete('eleves/documents/{document}', [EleveController::class, 'destroyDocument'])->name('eleves.documents.destroy');
        Route::get('eleves/{eleve}/certificat', [EleveController::class, 'downloadCertificate'])->name('eleves.certificat');
        Route::get('eleves/{eleve}/carte', [EleveController::class, 'downloadCarte'])->name('eleves.carte');
        Route::get('eleves/{eleve}/attestation', [EleveController::class, 'downloadAttestation'])->name('eleves.attestation');
        Route::get('eleves/{eleve}/fiche', [EleveController::class, 'downloadFiche'])->name('eleves.fiche');
        Route::get('eleves/{eleve}/sortie', [EleveController::class, 'downloadSortie'])->name('eleves.sortie');
        Route::resource('eleves', EleveController::class);

        // Gestion des parents
        Route::resource('parents', ParentUserController::class);
        Route::get('/parents/search/eleves', [ParentUserController::class, 'searchEleves'])
            ->name('parents.search.eleves')
            ->middleware('auth');

        // Gestion des inscriptions
        Route::resource('inscriptions', InscriptionController::class);
        Route::get('/inscriptions/create/eleve/{eleve}', [InscriptionController::class, 'createForEleve'])
            ->name('inscriptions.create.eleve')
            ->middleware('permission:ajouter_inscriptions');
        
        // Reçu d'inscription (Imprimable)
        Route::get('/inscriptions/{inscription}/recu', [InscriptionController::class, 'recu'])
            ->name('inscriptions.recu');


        // 🔹 Routes pour les frais

        // Types de frais
        Route::resource('frais_types', FraisTypeController::class);

        // Frais par classe
        Route::post('frais_classes/appliquer-bareme-officiel', [FraisClasseController::class, 'appliquerBaremeOfficiel'])
            ->name('frais_classes.appliquerBaremeOfficiel')
            ->middleware('permission:ajouter_frais_classes');

        Route::post('frais_classes/bulk', [FraisClasseController::class, 'storeBulk'])
            ->name('frais_classes.storeBulk')
            ->middleware('permission:ajouter_frais_classes');

        Route::resource('frais_classes', FraisClasseController::class);
        // web.php
        Route::patch('frais_classes/{fraisClasse}/montant', [FraisClasseController::class, 'updateMontant'])
            ->name('frais_classes.updateMontant')
            ->middleware('permission:modifier_frais_classes');



        // Gestion des paiements (Caisse)
        Route::get('/paiements/journal', [PaiementController::class, 'journal'])->name('paiements.journal');
        Route::get('/paiements/{paiement}/recu', [PaiementController::class, 'recu'])->name('paiements.recu');
        Route::resource('paiements', PaiementController::class);

        // 💰 Gestion des Arriérés de scolarité antérieurs (Dettes Pré-Installation)
        Route::get('/arrieres', [\App\Http\Controllers\ArriereController::class, 'index'])
            ->name('arrieres.index')
            ->middleware('permission:voir_arrieres');
        Route::post('/arrieres', [\App\Http\Controllers\ArriereController::class, 'store'])
            ->name('arrieres.store')
            ->middleware('permission:ajouter_arrieres');
        Route::put('/arrieres/{arriere}', [\App\Http\Controllers\ArriereController::class, 'update'])
            ->name('arrieres.update')
            ->middleware('permission:modifier_arrieres');
        Route::delete('/arrieres/{arriere}', [\App\Http\Controllers\ArriereController::class, 'destroy'])
            ->name('arrieres.destroy')
            ->middleware('permission:supprimer_arrieres');
        Route::post('/arrieres/{arriere}/payer', [\App\Http\Controllers\ArriereController::class, 'payer'])
            ->name('arrieres.payer')
            ->middleware('permission:encaisser_arrieres');
        Route::get('/arrieres/search-eleves', [\App\Http\Controllers\ArriereController::class, 'searchEleves'])
            ->name('arrieres.search-eleves')
            ->middleware('permission:voir_arrieres|ajouter_arrieres');
        Route::get('/arrieres/paiements/{arrierePaiement}/recu', [\App\Http\Controllers\ArriereController::class, 'recu'])
            ->name('arrieres.recu')
            ->middleware('permission:voir_arrieres|encaisser_arrieres');

        Route::resource('depenses', \App\Http\Controllers\DepenseController::class)
             ->only(['index', 'store', 'destroy']);

        // Espace Enseignant : Mes Cours
        Route::get('mes-cours', [\App\Http\Controllers\CoursController::class, 'mesCours'])->name('cours.mes-cours');

        // Gestion des affectations (Cours - Direction)
        Route::resource('cours', \App\Http\Controllers\CoursController::class)
             ->only(['index', 'store', 'destroy'])
             ->parameters(['cours' => 'cours']);

        // Gestion des Évaluations (Notes)
        Route::get('cours/{cours}/evaluations', [App\Http\Controllers\EvaluationController::class, 'index'])
             ->name('cours.evaluations.index')
             ->middleware('permission:voir_evaluations');
        
        Route::post('cours/{cours}/evaluations', [App\Http\Controllers\EvaluationController::class, 'store'])
             ->name('cours.evaluations.store')
             ->middleware('permission:ajouter_evaluations');

        Route::get('evaluations/{evaluation}', [App\Http\Controllers\EvaluationController::class, 'show'])
             ->name('evaluations.show')
             ->middleware('permission:voir_evaluations'); // Ou modifier_evaluations si accès à la saisie
             
        Route::post('evaluations/{evaluation}/grades', [App\Http\Controllers\EvaluationController::class, 'updateGrades'])
             ->name('evaluations.update_grades')
             ->middleware('permission:modifier_evaluations');

        Route::delete('evaluations/{evaluation}', [App\Http\Controllers\EvaluationController::class, 'destroy'])
             ->name('evaluations.destroy')
             ->middleware('permission:supprimer_evaluations');

        // Gestion de l'établissement (Paramètres)
        Route::get('etablissement', [App\Http\Controllers\EtablissementController::class, 'edit'])
            ->name('etablissement.edit')
            ->middleware('permission:modifier_etablissement');
        
        Route::post('etablissement', [App\Http\Controllers\EtablissementController::class, 'update'])
            ->name('etablissement.update')
            ->middleware('permission:modifier_etablissement');

        // 📊 STATISTIQUES AVANCÉES
        Route::get('/stats', [App\Http\Controllers\StatsController::class, 'index'])
            ->name('stats.index')
            ->middleware(['auth', 'verified', 'permission:voir_stats']); 
        
        // 💰 FINANCE DASHBOARD
        Route::get('/finances', [App\Http\Controllers\FinanceController::class, 'index'])
             ->name('finances.index')
             ->middleware(['auth', 'verified', 'role:directeur|super-admin|comptable']); 

        // 🔔 NOTIFICATIONS
        Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::post('/notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.readAll');
        Route::delete('/notifications/destroy-all-read', [App\Http\Controllers\NotificationController::class, 'destroyAllRead'])->name('notifications.destroyAllRead');
        Route::delete('/notifications/{id}', [App\Http\Controllers\NotificationController::class, 'destroy'])->name('notifications.destroy');

        // 🤖 IA DASHBOARD
        Route::get('/ia', [App\Http\Controllers\IAController::class, 'index'])->name('ia.index')
            ->middleware('permission:voir_stats'); // Utilise voir_stats pour le moment
        Route::post('/ia/run', [App\Http\Controllers\IAController::class, 'runAnalysis'])->name('ia.run')
            ->middleware('permission:voir_stats');

        // Gestion des Notes (Evaluations + Saisie)
        Route::get('notes/classe/{classe}', [\App\Http\Controllers\NoteController::class, 'classe'])->name('notes.classe');
        Route::resource('notes', \App\Http\Controllers\NoteController::class);

        // Gestion des Absences
        Route::get('absences/saisie/{classe}', [\App\Http\Controllers\AbsenceController::class, 'saisie'])->name('absences.saisie');
        Route::post('absences/saisie/{classe}', [\App\Http\Controllers\AbsenceController::class, 'storeBulk'])->name('absences.storeBulk');
        Route::post('absences/toggle-lock/{classe}', [\App\Http\Controllers\AbsenceController::class, 'toggleLock'])->name('absences.toggleLock');
        Route::get('absences/history/{classe}', [\App\Http\Controllers\AbsenceController::class, 'history'])->name('absences.history');
        Route::resource('absences', \App\Http\Controllers\AbsenceController::class);

        // Gestion des Bulletins
        Route::get('bulletins', [\App\Http\Controllers\BulletinController::class, 'index'])
            ->name('bulletins.index')
            ->middleware('permission:voir_bulletins');
            
        Route::get('bulletins/pv', [\App\Http\Controllers\BulletinController::class, 'pv'])
            ->name('bulletins.pv')
            ->middleware('permission:voir_bulletins');

        Route::get('bulletins/{inscription}/download', [\App\Http\Controllers\BulletinController::class, 'download'])
            ->name('bulletins.download')
            ->middleware('permission:voir_bulletins');

        // 🎓 Conseil de Classe (Délibérations)
        Route::get('conseil', [\App\Http\Controllers\ConseilClasseController::class, 'index'])
            ->name('conseil.index')
            ->middleware('permission:modifier_bulletins');
        Route::post('conseil', [\App\Http\Controllers\ConseilClasseController::class, 'store'])
            ->name('conseil.store')
            ->middleware('permission:modifier_bulletins');


        // Gestion de l'Emploi du Temps
        Route::get('emploi_du_temps/download', [\App\Http\Controllers\EmploiDuTempsController::class, 'downloadPdf'])
             ->name('emploi_du_temps.download');
        Route::post('emploi_du_temps/{classe}/publier', [\App\Http\Controllers\EmploiDuTempsController::class, 'publier'])
             ->name('emploi_du_temps.publier');
        Route::resource('emploi_du_temps', \App\Http\Controllers\EmploiDuTempsController::class)
             ->only(['index', 'store', 'destroy']);

        // 👮‍♂️ Discipline (Sanctions)
        Route::resource('sanctions', \App\Http\Controllers\SanctionController::class)
             ->only(['index', 'store', 'destroy']);
        
        // 💼 RH & Paie
        Route::get('rh/paie', [App\Http\Controllers\PaieController::class, 'index'])
            ->name('rh.paie.index')
            ->middleware('permission:voir_paie');
        Route::post('rh/paie', [App\Http\Controllers\PaieController::class, 'store'])
            ->name('rh.paie.store')
            ->middleware('permission:gerer_paie');
        Route::put('rh/paie/{paiement}', [App\Http\Controllers\PaieController::class, 'update'])
            ->name('rh.paie.update')
            ->middleware('permission:gerer_paie|modifier_paie');
        Route::delete('rh/paie/{paiement}', [App\Http\Controllers\PaieController::class, 'destroy'])
            ->name('rh.paie.destroy')
            ->middleware('permission:gerer_paie|supprimer_paie');
        Route::post('rh/contrat', [App\Http\Controllers\PaieController::class, 'contract'])
            ->name('rh.contrat.store')
            ->middleware('permission:gerer_paie');
        Route::delete('rh/contrat/{contrat}', [App\Http\Controllers\PaieController::class, 'destroyContract'])
            ->name('rh.contrat.destroy')
            ->middleware('permission:gerer_paie|supprimer_paie');
        Route::get('rh/bulletin/{paiement}', [App\Http\Controllers\PaieController::class, 'bulletin'])
            ->name('rh.bulletin.download')
            ->middleware('permission:voir_paie');

        // 📚 Documents Pédagogiques (Cours/Exos)
        Route::get('documents/download/{id}', [App\Http\Controllers\DocumentPedagogiqueController::class, 'download'])->name('documents.download');
        Route::resource('documents', App\Http\Controllers\DocumentPedagogiqueController::class)
             ->only(['index', 'store', 'destroy']);

        // 📑 DEMANDES DE DOCUMENTS ADMINISTRATIFS (Guichet Numérique)
        Route::get('demandes-documents', [App\Http\Controllers\DemandeDocumentController::class, 'index'])->name('demandes-documents.index');
        Route::post('demandes-documents', [App\Http\Controllers\DemandeDocumentController::class, 'store'])->name('demandes-documents.store');
        Route::patch('demandes-documents/{demandeDocument}/traiter', [App\Http\Controllers\DemandeDocumentController::class, 'traiter'])->name('demandes-documents.traiter');
        Route::get('demandes-documents/{demandeDocument}/download', [App\Http\Controllers\DemandeDocumentController::class, 'download'])->name('demandes-documents.download');

        Route::get('/communications/inbox', [App\Http\Controllers\CommunicationController::class, 'inbox'])->name('communications.inbox');
        Route::get('/communications', [App\Http\Controllers\CommunicationController::class, 'index'])->name('communications.index');
        Route::get('/communications/create', [App\Http\Controllers\CommunicationController::class, 'create'])->name('communications.create');
        Route::post('/communications', [App\Http\Controllers\CommunicationController::class, 'store'])->name('communications.store');
        Route::get('/communications/{communication}', [App\Http\Controllers\CommunicationController::class, 'show'])->name('communications.show');
        // 📜 LOGS D'ACTIVITÉ
        Route::get('/logs', [App\Http\Controllers\LogController::class, 'index'])
            ->name('logs.index')
            ->middleware('permission:voir_logs');

        // 🔍 CENTRE D'ARCHIVES (Multi-Années)
        Route::get('/archives', [App\Http\Controllers\ArchiveController::class, 'index'])
            ->name('archives.index')
            ->middleware('permission:voir_archives');

        // 💾 SAUVEGARDES DE LA BASE DE DONNÉES (Super-Admin)
        Route::middleware(['role:super-admin'])->group(function () {
            Route::get('/backups', [\App\Http\Controllers\BackupController::class, 'index'])->name('backups.index');
            Route::post('/backups', [\App\Http\Controllers\BackupController::class, 'store'])->name('backups.store');
            Route::get('/backups/{filename}/download', [\App\Http\Controllers\BackupController::class, 'download'])->name('backups.download');
            Route::delete('/backups/{filename}', [\App\Http\Controllers\BackupController::class, 'destroy'])->name('backups.destroy');
            Route::post('/backups/{filename}/restore', [\App\Http\Controllers\BackupController::class, 'restore'])->name('backups.restore');
            Route::post('/backups/upload', [\App\Http\Controllers\BackupController::class, 'upload'])->name('backups.upload');
        });
    });

    // Vérification de reçu (Public ou semi-public)
    Route::get('/verify/inscription/{code}', [InscriptionController::class, 'verify'])
        ->name('inscriptions.verify');
});

require __DIR__.'/auth.php';

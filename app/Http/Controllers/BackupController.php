<?php

namespace App\Http\Controllers;

use App\Services\DatabaseBackupService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Exception;

class BackupController extends Controller
{
    protected DatabaseBackupService $backupService;

    public function __construct(DatabaseBackupService $backupService)
    {
        $this->backupService = $backupService;
    }

    /**
     * Display the backups management page
     */
    public function index()
    {
        $databaseInfo = $this->backupService->getDatabaseInfo();
        $backups = $this->backupService->listBackups();

        return Inertia::render('Backup/Index', [
            'databaseInfo' => $databaseInfo,
            'backups' => $backups,
        ]);
    }

    /**
     * Create a new database backup
     */
    public function store(Request $request)
    {
        $request->validate([
            'compress' => 'nullable|boolean',
        ]);

        try {
            $compress = $request->boolean('compress', false);
            $backup = $this->backupService->createBackup($compress);

            if (function_exists('activity')) {
                activity()
                    ->causedBy($request->user())
                    ->log("A créé une sauvegarde de la base de données : {$backup['filename']} ({$backup['size']})");
            }

            return redirect()->back()->with('success', "Sauvegarde [{$backup['filename']}] créée avec succès ({$backup['size']}).");
        } catch (Exception $e) {
            return redirect()->back()->with('error', "Échec de la sauvegarde : " . $e->getMessage());
        }
    }

    /**
     * Download a specific backup file
     */
    public function download(string $filename)
    {
        $filepath = $this->backupService->getSecurePath($filename);

        if (!File::exists($filepath)) {
            return redirect()->back()->with('error', 'Fichier de sauvegarde introuvable.');
        }

        if (function_exists('activity') && auth()->user()) {
            activity()
                ->causedBy(auth()->user())
                ->log("A téléchargé la sauvegarde : {$filename}");
        }

        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $contentType = $extension === 'gz' ? 'application/gzip' : 'application/sql';

        return response()->download($filepath, $filename, [
            'Content-Type' => $contentType,
        ]);
    }

    /**
     * Delete a backup file
     */
    public function destroy(string $filename)
    {
        try {
            $filepath = $this->backupService->getSecurePath($filename);

            if (!File::exists($filepath)) {
                return redirect()->back()->with('error', 'Fichier de sauvegarde introuvable.');
            }

            $this->backupService->deleteBackup($filename);

            if (function_exists('activity') && auth()->user()) {
                activity()
                    ->causedBy(auth()->user())
                    ->log("A supprimé la sauvegarde de base de données : {$filename}");
            }

            return redirect()->back()->with('success', "La sauvegarde [{$filename}] a été supprimée avec succès.");
        } catch (Exception $e) {
            return redirect()->back()->with('error', "Impossible de supprimer le fichier : " . $e->getMessage());
        }
    }

    /**
     * Restore database from an existing backup
     */
    public function restore(Request $request, string $filename)
    {
        try {
            $this->backupService->restoreBackup($filename);

            if (function_exists('activity') && auth()->user()) {
                activity()
                    ->causedBy(auth()->user())
                    ->log("A restauré la base de données depuis la sauvegarde : {$filename}");
            }

            return redirect()->back()->with('success', "Base de données restaurée avec succès depuis [{$filename}].");
        } catch (Exception $e) {
            return redirect()->back()->with('error', "Erreur lors de la restauration : " . $e->getMessage());
        }
    }

    /**
     * Upload an existing SQL / GZ backup file
     */
    public function upload(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|file|max:102400', // 100MB Max
        ]);

        try {
            $file = $request->file('backup_file');
            $originalName = $file->getClientOriginalName();
            $extension = strtolower($file->getClientOriginalExtension());

            if (!in_array($extension, ['sql', 'gz'])) {
                return redirect()->back()->with('error', 'Seuls les fichiers .sql ou .sql.gz sont acceptés.');
            }

            $cleanName = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $originalName);
            $destinationDir = storage_path('app/backups');

            if (!File::exists($destinationDir)) {
                File::makeDirectory($destinationDir, 0755, true);
            }

            $file->move($destinationDir, $cleanName);

            if (function_exists('activity') && auth()->user()) {
                activity()
                    ->causedBy(auth()->user())
                    ->log("A importé manuellement une archive de sauvegarde : {$cleanName}");
            }

            return redirect()->back()->with('success', "Le fichier [{$cleanName}] a été importé avec succès.");
        } catch (Exception $e) {
            return redirect()->back()->with('error', "Erreur lors de l'importation : " . $e->getMessage());
        }
    }
}

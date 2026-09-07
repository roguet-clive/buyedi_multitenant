<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Exception;

class DatabaseBackupService
{
    protected string $backupDir;

    public function __construct()
    {
        $this->backupDir = storage_path('app/backups');
        if (!File::exists($this->backupDir)) {
            File::makeDirectory($this->backupDir, 0755, true);
        }
    }

    /**
     * Get Database Information & Statistics
     */
    public function getDatabaseInfo(): array
    {
        $connection = config('database.default');
        $dbName = config("database.connections.{$connection}.database");
        $driver = config("database.connections.{$connection}.driver");

        $totalTables = 0;
        $totalSizeMB = 0;
        $tablesList = [];

        try {
            if ($driver === 'mysql') {
                $tables = DB::select("SHOW TABLE STATUS FROM `{$dbName}`");
                $totalTables = count($tables);

                foreach ($tables as $table) {
                    $dataLength = $table->Data_length ?? 0;
                    $indexLength = $table->Index_length ?? 0;
                    $rows = $table->Rows ?? 0;
                    $sizeKB = ($dataLength + $indexLength) / 1024;
                    $totalSizeMB += ($sizeKB / 1024);

                    $tablesList[] = [
                        'name' => $table->Name,
                        'rows' => (int) $rows,
                        'size' => round($sizeKB, 2) . ' KB',
                        'engine' => $table->Engine ?? 'InnoDB',
                    ];
                }
            } elseif ($driver === 'sqlite') {
                $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
                $totalTables = count($tables);
                $sqliteFile = database_path('database.sqlite');
                if (File::exists($sqliteFile)) {
                    $totalSizeMB = File::size($sqliteFile) / (1024 * 1024);
                }

                foreach ($tables as $table) {
                    $tableName = $table->name;
                    $rows = DB::table($tableName)->count();
                    $tablesList[] = [
                        'name' => $tableName,
                        'rows' => $rows,
                        'size' => '-',
                        'engine' => 'SQLite',
                    ];
                }
            }
        } catch (Exception $e) {
            // Fallback gracefully if permissions or specifics fail
        }

        $backups = $this->listBackups();
        $lastBackup = !empty($backups) ? $backups[0]['created_at'] : null;

        return [
            'driver' => $driver,
            'connection' => $connection,
            'database' => basename((string) $dbName),
            'total_tables' => $totalTables,
            'total_size_mb' => round($totalSizeMB, 2),
            'tables' => $tablesList,
            'total_backups' => count($backups),
            'last_backup' => $lastBackup,
        ];
    }

    /**
     * List all existing backup files
     */
    public function listBackups(): array
    {
        if (!File::exists($this->backupDir)) {
            return [];
        }

        $files = File::files($this->backupDir);
        $backups = [];

        foreach ($files as $file) {
            $extension = $file->getExtension();
            if (in_array(strtolower($extension), ['sql', 'gz'])) {
                $sizeBytes = $file->getSize();
                $sizeFormatted = $this->formatBytes($sizeBytes);
                $createdAt = date('Y-m-d H:i:s', $file->getMTime());

                $backups[] = [
                    'filename' => $file->getFilename(),
                    'path' => $file->getPathname(),
                    'size' => $sizeFormatted,
                    'size_bytes' => $sizeBytes,
                    'is_compressed' => strtolower($extension) === 'gz',
                    'created_at' => $createdAt,
                    'timestamp' => $file->getMTime(),
                ];
            }
        }

        // Sort by most recent first
        usort($backups, fn ($a, $b) => $b['timestamp'] <=> $a['timestamp']);

        return $backups;
    }

    /**
     * Create a new database backup
     */
    public function createBackup(bool $compress = false): array
    {
        $connection = config('database.default');
        $driver = config("database.connections.{$connection}.driver");
        $timestamp = date('Y-m-d_H-i-s');
        $baseFilename = "backup_{$timestamp}";
        $filename = $compress ? "{$baseFilename}.sql.gz" : "{$baseFilename}.sql";
        $filepath = $this->backupDir . DIRECTORY_SEPARATOR . $filename;

        if ($driver === 'mysql') {
            $this->dumpMysql($filepath, $compress);
        } elseif ($driver === 'sqlite') {
            $this->dumpSqlite($filepath, $compress);
        } else {
            throw new Exception("Le driver de base de données [{$driver}] n'est pas supporté pour la sauvegarde automatique.");
        }

        $fileSize = File::size($filepath);

        return [
            'filename' => $filename,
            'size' => $this->formatBytes($fileSize),
            'path' => $filepath,
            'created_at' => date('Y-m-d H:i:s'),
        ];
    }

    /**
     * Dump MySQL database using high performance PHP stream
     */
    protected function dumpMysql(string $filepath, bool $compress): void
    {
        $handle = $compress ? gzopen($filepath, 'w9') : fopen($filepath, 'w');
        if (!$handle) {
            throw new Exception("Impossible d'ouvrir le fichier de destination pour la sauvegarde.");
        }

        $write = function ($content) use ($handle, $compress) {
            if ($compress) {
                gzwrite($handle, $content);
            } else {
                fwrite($handle, $content);
            }
        };

        // Header SQL
        $date = date('Y-m-d H:i:s');
        $dbName = config('database.connections.mysql.database');
        $write("-- --------------------------------------------------------\n");
        $write("-- Buyedi Database Backup\n");
        $write("-- Database: `{$dbName}`\n");
        $write("-- Generation Time: {$date}\n");
        $write("-- PHP Version: " . phpversion() . "\n");
        $write("-- --------------------------------------------------------\n\n");
        $write("SET FOREIGN_KEY_CHECKS=0;\n");
        $write("SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n");
        $write("SET time_zone = \"+00:00\";\n");
        $write("SET NAMES utf8mb4;\n\n");

        // Fetch tables
        $tables = DB::select('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"');
        $propName = 'Tables_in_' . $dbName;

        foreach ($tables as $tableObj) {
            $tableName = $tableObj->$propName ?? array_values((array)$tableObj)[0];

            $write("-- --------------------------------------------------------\n");
            $write("-- Structure de la table `{$tableName}`\n");
            $write("-- --------------------------------------------------------\n");
            $write("DROP TABLE IF EXISTS `{$tableName}`;\n");

            // Create table statement
            $showCreate = DB::select("SHOW CREATE TABLE `{$tableName}`");
            $createSql = $showCreate[0]->{'Create Table'} ?? null;
            if ($createSql) {
                $write($createSql . ";\n\n");
            }

            // Dump Table Data in Chunks
            $write("-- Données de la table `{$tableName}`\n");
            
            $pdo = DB::connection()->getPdo();
            $stmt = $pdo->prepare("SELECT * FROM `{$tableName}`");
            $stmt->execute();

            $chunkSize = 500;
            $rowsBuffer = [];

            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $escapedValues = [];
                foreach ($row as $val) {
                    if (is_null($val)) {
                        $escapedValues[] = 'NULL';
                    } elseif (is_numeric($val) && !is_string($val)) {
                        $escapedValues[] = $val;
                    } else {
                        $escapedValues[] = $pdo->quote($val);
                    }
                }
                $rowsBuffer[] = '(' . implode(', ', $escapedValues) . ')';

                if (count($rowsBuffer) >= $chunkSize) {
                    $write("INSERT INTO `{$tableName}` VALUES\n" . implode(",\n", $rowsBuffer) . ";\n");
                    $rowsBuffer = [];
                }
            }

            if (!empty($rowsBuffer)) {
                $write("INSERT INTO `{$tableName}` VALUES\n" . implode(",\n", $rowsBuffer) . ";\n");
            }

            $write("\n");
        }

        $write("SET FOREIGN_KEY_CHECKS=1;\n");

        if ($compress) {
            gzclose($handle);
        } else {
            fclose($handle);
        }
    }

    /**
     * Dump SQLite Database
     */
    protected function dumpSqlite(string $filepath, bool $compress): void
    {
        $sqliteFile = database_path('database.sqlite');
        if (!File::exists($sqliteFile)) {
            throw new Exception("Le fichier SQLite n'existe pas.");
        }

        if ($compress) {
            $handle = gzopen($filepath, 'w9');
            $sourceHandle = fopen($sqliteFile, 'rb');
            while (!feof($sourceHandle)) {
                gzwrite($handle, fread($sourceHandle, 1024 * 512));
            }
            fclose($sourceHandle);
            gzclose($handle);
        } else {
            File::copy($sqliteFile, $filepath);
        }
    }

    /**
     * Restore a backup file
     */
    public function restoreBackup(string $filename): void
    {
        $filepath = $this->getSecurePath($filename);
        if (!File::exists($filepath)) {
            throw new Exception("Le fichier de sauvegarde spécifié est introuvable.");
        }

        $isCompressed = str_ends_with(strtolower($filename), '.gz');

        // Read content
        if ($isCompressed) {
            $gz = gzopen($filepath, 'rb');
            if (!$gz) {
                throw new Exception("Impossible d'ouvrir l'archive compressée.");
            }
            $sqlContent = '';
            while (!gzeof($gz)) {
                $sqlContent .= gzread($gz, 1024 * 512);
            }
            gzclose($gz);
        } else {
            $sqlContent = File::get($filepath);
        }

        $connection = config('database.default');
        $driver = config("database.connections.{$connection}.driver");

        if ($driver === 'mysql') {
            DB::unprepared($sqlContent);
        } elseif ($driver === 'sqlite') {
            DB::unprepared($sqlContent);
        }
    }

    /**
     * Delete a backup file safely
     */
    public function deleteBackup(string $filename): bool
    {
        $filepath = $this->getSecurePath($filename);
        if (File::exists($filepath)) {
            return File::delete($filepath);
        }
        return false;
    }

    /**
     * Get absolute path with path traversal protection
     */
    public function getSecurePath(string $filename): string
    {
        $cleanName = basename($filename);
        return $this->backupDir . DIRECTORY_SEPARATOR . $cleanName;
    }

    /**
     * Format bytes to readable string
     */
    public function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}

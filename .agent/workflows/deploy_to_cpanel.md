---
description: Guide pour déployer l'application Laravel Buyedi sur cPanel
---

# Déploiement sur cPanel

Suivez ces étapes pour mettre votre application Buyedi en ligne.

## 1. Préparation Locale

1.  **Nettoyage et Optimisation**
    Assurez-vous que tout est propre :
    ```bash
    php artisan optimize:clear
    php artisan config:clear
    php artisan cache:clear
    ```

2.  **Compilation des Assets (Production)**
    Cela génère les fichiers CSS et JS minifiés dans `public/build`.
    ```bash
    npm run build
    ```

3.  **Création du ZIP**
    Créez une archive ZIP de tout le dossier de votre projet (`buyedi`), **SAUF** :
    *   Le dossier `node_modules` (trop lourd et inutile sur le serveur).
    *   Le dossier `.git` (si présent).
    *   Le dossier `.idea` ou `.vscode` (si présents).
    *   Le fichier `.env` (vous le créerez manuellement sur le serveur pour des raisons de sécurité, ou copiez `.env.example`).

## 2. Configuration cPanel - Base de Données

1.  Connectez-vous à votre cPanel.
2.  Allez dans **"Bases de données MySQL"**.
3.  Créez une nouvelle base de données (ex: `votrecompte_buyedi`).
4.  Créez un nouvel utilisateur MySQL (ex: `votrecompte_admin`) et notez le mot de passe.
5.  Ajoutez l'utilisateur à la base de données avec **TOUS LES PRIVILÈGES**.

## 3. Upload des Fichiers

1.  Allez dans le **"Gestionnaire de fichiers"** (File Manager) de cPanel.
2.  Naviguez vers le dossier racine de votre domaine (souvent `public_html`).
    *   *Si vous voulez que l'app soit à la racine (ex: mondomaine.com), videz ce dossier.*
    *   *Si vous voulez un sous-domaine (ex: app.mondomaine.com), créez un dossier correspondant.*
3.  Cliquez sur **"Charger"** (Upload) et envoyez votre fichier ZIP.
4.  Une fois chargé, faites un clic droit sur le ZIP -> **"Extraire"**.
5.  Déplacez le contenu extrait pour qu'il soit au bon endroit si nécessaire.

## 4. Configuration de l'Environnement (.env)

1.  Dans le Gestionnaire de fichiers, trouvez le fichier `.env.example`.
2.  Renommez-le en `.env` (ou créez un nouveau fichier `.env`).
3.  Éditez-le (Clic droit -> Edit) et modifiez ces lignes :

    ```ini
    APP_NAME=Buyedi
    APP_ENV=production
    APP_DEBUG=false
    APP_URL=https://votre-domaine.com

    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=votrecompte_buyedi     <-- Nom crée à l'étape 2
    DB_USERNAME=votrecompte_admin      <-- Utilisateur crée à l'étape 2
    DB_PASSWORD=votre_mot_de_passe     <-- Mot de passe de l'étape 2
    ```

## 5. Dossier Public (Très Important)

Sur cPanel, le dossier public par défaut est `public_html`. Laravel utilise le dossier `public`.
Deux méthodes :

**Méthode A (Si vous avez accès au terminal SSH)**
Créez un lien symbolique :
1.  Supprimez le dossier `public_html` existant (s'il est vide).
2.  `ln -s /chemin/vers/buyedi/public /chemin/vers/public_html`

**Méthode B (Classique cPanel - via .htaccess)**
Si vous avez mis vos fichiers directement dans `public_html`, Laravel s'attend à être servi depuis le dossier `public`.
1.  Dans `public_html`, créez un fichier `.htaccess` à la racine (à côté de `app`, `bootstrap`, etc.) avec ce contenu :

    ```apache
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteRule ^(.*)$ public/$1 [L]
    </IfModule>
    ```

## 6. Migration de la Base de Données

Si vous avez accès au terminal (SSH) dans cPanel :
```bash
cd /chemin/vers/votre/projet
php artisan migrate:fresh --seed --force
```
*(Attention : `--force` est nécessaire en production)*

**Sans accès SSH (via PHPMyAdmin) :**
1.  Sur votre ordi local, exportez votre base de données locale (via Laragon/HeidiSQL/PHPMyAdmin).
2.  Sur cPanel, ouvrez **PHPMyAdmin**.
3.  Sélectionnez votre base de données (`votrecompte_buyedi`).
4.  Cliquez sur **Importer** et choisissez votre fichier SQL exporté.

## 7. Lien Symbolique pour le Stockage

C'est crucial pour voir les photos de profil et les documents.
Si vous avez SSH :
```bash
php artisan storage:link
```
Si vous n'avez pas SSH :
Vous pouvez créer une route temporaire dans `routes/web.php` pour le faire :
```php
Route::get('/linkstorage', function () {
    Artisan::call('storage:link');
    return 'Lien symbolique créé !';
});
```
Visitez `votre-domaine.com/linkstorage`, puis supprimez cette route.

## 8. Permissions

Assurez-vous que les dossiers `storage` et `bootstrap/cache` ont les permissions d'écriture (souvent 755 ou 775).


## 9. ⚠️ ERREUR FRÉQUENTE (Vite / Localhost)

Si vous voyez des erreurs dans la console : `failed to load resource: net::ERR_CONNECTION_REFUSED http://[::1]:5173...` ou des problèmes CORS liés à localhost.

**LA SOLUTION :**
1.  Allez dans votre gestionnaire de fichiers cPanel.
2.  Allez dans le dossier `public` (ou `public_html` selon votre installation).
3.  **SUPPRIMEZ le fichier nommé `hot`**.

*Explication : Ce fichier `hot` dit à Laravel "Je suis en mode développement sur mon PC". S'il est présent sur le serveur, le site essaie de se connecter à votre ordinateur, ce qui échoue.*


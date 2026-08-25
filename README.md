# 🎓 Buyedi Platform

Une application web moderne construite avec **Laravel 12** (backend) et **React 18** (frontend), pensée pour l'éducation ou la gestion scolaire. Ce projet met l'accent sur la modularité, l'accessibilité, et l'expérience utilisateur.

## 🔧 Technologies utilisées

- **Laravel 12** – pour une API REST sécurisée et performante
- **React 18** – interface réactive avec composants dynamiques
- **Vite** – build ultra rapide pour React
- **Tailwind CSS** – stylisation rapide et responsive
- **i18n** – système de traduction multilingue
- **Dark Mode** – basculement de thème avec `localStorage` persistant
- **Toast notifications** – personnalisées avec animations et barre de progression
- **Ziggy** – utilisation des routes Laravel dans React
- **AJAX** – notifications et mise à jour en temps réel

## ⚙️ Installation

1. Clone le dépôt :

   ```bash
   git clone https://github.com/clive-dev/buyedi.git
   cd buyedi

2. Backend Laravel 

    composer install
    cp .env.example .env
    php artisan key:generate
    php artisan migrate --seed

3. Frontend React
    npm install
    npm run dev

4. Accès :
- Ouvrir http://localhost:8000
🧩 Modules clés
- Gestion des rôles et permissions
- Pages réactives avec animations
- Composants réutilisables
- Connexion responsive avec sélecteur de thème
- Traductions par fichier JSON
🚀 À venir
- Intégration PWA / accès hors ligne
- Système de notifications centralisé
- Tableau de bord interactif




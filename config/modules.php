<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Catalogue des Modules Fonctionnels Sous Licence (Buyedi)
    |--------------------------------------------------------------------------
    |
    | Seul le Super-Admin a les pleins pouvoirs d'activer ou désactiver
    | ces modules par établissement selon la formule d'abonnement souscrite.
    |
    */

    'modules' => [
        'notes_bulletins' => [
            'id' => 'notes_bulletins',
            'nom' => 'Notes, Évaluations & Bulletins',
            'description' => 'Saisie des notes, calculs automatiques des moyennes, PV de délibération, relevés et génération des bulletins scolaires officiels.',
            'categorie' => 'Pédagogie',
            'icon' => 'FileText',
            'is_core' => false,
        ],
        'communication' => [
            'id' => 'communication',
            'nom' => 'Communications & Messagerie',
            'description' => 'Boîte de messagerie interne, communications ciblées vers les parents, enseignants et personnels, et notifications.',
            'categorie' => 'Communication',
            'icon' => 'Mail',
            'is_core' => false,
        ],
        'rh_paie' => [
            'id' => 'rh_paie',
            'nom' => 'Ressources Humaines & Paie',
            'description' => 'Gestion des enseignants, employés, fiches de paie, bulletins de paie et contrats de travail.',
            'categorie' => 'Administration',
            'icon' => 'Users',
            'is_core' => false,
        ],
        'emploi_du_temps' => [
            'id' => 'emploi_du_temps',
            'nom' => 'Emplois du Temps & Salles',
            'description' => 'Création, gestion et publication des plannings hebdomadaires pour les classes et enseignants.',
            'categorie' => 'Pédagogie',
            'icon' => 'CalendarDays',
            'is_core' => false,
        ],
        'documents_pedagogiques' => [
            'id' => 'documents_pedagogiques',
            'nom' => 'Documents Pédagogiques & Demandes',
            'description' => 'Partage de cours/exercices numériques et traitement des demandes de documents administratifs (certificats, attestations).',
            'categorie' => 'Pédagogie',
            'icon' => 'UploadCloud',
            'is_core' => false,
        ],
        'depenses' => [
            'id' => 'depenses',
            'nom' => 'Gestion des Dépenses',
            'description' => 'Suivi des dépenses courantes de l\'établissement, charges d\'exploitation et états des sorties de caisse.',
            'categorie' => 'Finances',
            'icon' => 'CreditCard',
            'is_core' => false,
        ],
        'arrieres' => [
            'id' => 'arrieres',
            'nom' => 'Arriérés Antérieurs & Contentieux',
            'description' => 'Suivi spécifique des dettes des années scolaires précédentes et encaissement des reliquats.',
            'categorie' => 'Finances',
            'icon' => 'Clock',
            'is_core' => false,
        ],
        'ia_statistiques' => [
            'id' => 'ia_statistiques',
            'nom' => 'IA & Statistiques Décisionnelles',
            'description' => 'Tableaux de bord graphiques analytiques, détection prédictive de risque de décrochage et recommandations intelligentes.',
            'categorie' => 'Performance',
            'icon' => 'Brain',
            'is_core' => false,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Formules Pré-configurées (Packages d'Abonnement)
    |--------------------------------------------------------------------------
    */
    'formules' => [
        'starter' => [
            'nom' => 'Formule Starter (Base & Caisse)',
            'description' => 'Inscriptions, Élèves, Classes et Encaissements de Scolarité uniquement.',
            'modules' => [],
        ],
        'pro' => [
            'nom' => 'Formule Pro (Académique)',
            'description' => 'Starter + Notes & Bulletins, Emploi du Temps et Documents Pédagogiques.',
            'modules' => ['notes_bulletins', 'emploi_du_temps', 'documents_pedagogiques'],
        ],
        'elite' => [
            'nom' => 'Formule Élite (Intégrale)',
            'description' => 'Tous les modules sans restriction : Bulletins, Communication, RH & Paie, Dépenses, Arriérés et IA.',
            'modules' => [
                'notes_bulletins',
                'communication',
                'rh_paie',
                'emploi_du_temps',
                'documents_pedagogiques',
                'depenses',
                'arrieres',
                'ia_statistiques',
            ],
        ],
        'personnalise' => [
            'nom' => 'Formule Sur Mesure',
            'description' => 'Sélection personnalisée des modules négociée avec l\'établissement.',
            'modules' => null, // Défini au cas par cas
        ],
    ],
];

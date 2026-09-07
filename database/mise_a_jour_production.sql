-- =======================================================================
-- SCRIPT DE MISE À JOUR - BASE DE DONNÉES PRODUCTION (BUYEDI)
-- =======================================================================
-- Ce script :
-- 1. Met à jour les 5 matricules existants vers le nouveau format :
--    CSPBO-2026-0001, CSPBO-2026-0002, CSPBO-2026-0003, CSPBO-2026-0004, CSPBO-2026-0005
-- 2. Ajoute les colonnes de remise dans la table 'inscriptions' (has_remise, remise_pourcentage, remise_montant)
-- 3. Crée la nouvelle table 'frais_echeances' pour la gestion des échéances de paiement
-- 4. Enregistre les migrations dans la table 'migrations' de Laravel
-- 5. Préserve à 100% :
--    - Tous les utilisateurs (superadmin, directeur, comptable, etc.)
--    - Les 65 arriérés saisis
--    - Les classes et l'année scolaire
--    - Les reçus et historiques de paiement des 5 élèves
-- =======================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------
-- ÉTAPE 1 : Mise à jour du matricule des 5 élèves au nouveau format officiel
-- -----------------------------------------------------------------------
UPDATE `eleves` SET `matricule` = 'CSPBO-2026-0001' WHERE `id` = 1;
UPDATE `eleves` SET `matricule` = 'CSPBO-2026-0002' WHERE `id` = 2;
UPDATE `eleves` SET `matricule` = 'CSPBO-2026-0003' WHERE `id` = 3;
UPDATE `eleves` SET `matricule` = 'CSPBO-2026-0004' WHERE `id` = 4;
UPDATE `eleves` SET `matricule` = 'CSPBO-2026-0005' WHERE `id` = 5;

-- -----------------------------------------------------------------------
-- ÉTAPE 2 : Ajout des colonnes de gestion des remises dans 'inscriptions'
-- -----------------------------------------------------------------------
ALTER TABLE `inscriptions`
  ADD COLUMN `has_remise` tinyint(1) NOT NULL DEFAULT 0 AFTER `reinscription`,
  ADD COLUMN `remise_pourcentage` decimal(5,2) NOT NULL DEFAULT 0.00 AFTER `has_remise`,
  ADD COLUMN `remise_montant` decimal(10,2) NOT NULL DEFAULT 0.00 AFTER `remise_pourcentage`;

-- -----------------------------------------------------------------------
-- ÉTAPE 3 : Création de la table 'frais_echeances'
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `frais_echeances` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `frais_classe_id` bigint(20) UNSIGNED NOT NULL,
  `nom` varchar(255) NOT NULL,
  `montant` decimal(10,2) NOT NULL DEFAULT 0.00,
  `date_limite` date DEFAULT NULL,
  `ordre` smallint(5) UNSIGNED NOT NULL DEFAULT 1,
  `type` varchar(255) NOT NULL DEFAULT 'mensualite',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `frais_echeances_frais_classe_id_foreign` (`frais_classe_id`),
  CONSTRAINT `frais_echeances_frais_classe_id_foreign` 
    FOREIGN KEY (`frais_classe_id`) REFERENCES `frais_classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- ÉTAPE 4 : Enregistrement des migrations dans Laravel
-- (Permet d'éviter que Laravel tente de les rejouer lors d'un 'php artisan migrate')
-- -----------------------------------------------------------------------
INSERT IGNORE INTO `migrations` (`migration`, `batch`) VALUES
('2026_09_04_085409_create_frais_echeances_table', 4);

SET FOREIGN_KEY_CHECKS = 1;

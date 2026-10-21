-- ====================================================================
-- AutoCart Auth Service Schema (autocart_auth)
-- Tables: users, admins, dealers, dealer_brands, dealer_documents
-- ====================================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'CUSTOMER',
  `status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_email` (`email`),
  UNIQUE KEY `uq_user_mobile` (`mobile`),
  UNIQUE KEY `uq_user_reset_token` (`reset_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `admins` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'MODERATOR',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `dealers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `showroom_name` varchar(150) NOT NULL,
  `license_number` varchar(20) NOT NULL,
  `gst_number` varchar(15) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pin_code` varchar(10) DEFAULT NULL,
  `contact_phone` varchar(15) DEFAULT NULL,
  `working_hours` varchar(100) DEFAULT NULL,
  `rating` float DEFAULT '0',
  `status` varchar(50) NOT NULL DEFAULT 'PENDING',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dealer_user` (`user_id`),
  UNIQUE KEY `uq_dealer_gst` (`gst_number`),
  UNIQUE KEY `uq_dealer_license` (`license_number`),
  CONSTRAINT `fk_dealer_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `dealer_brands` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dealer_id` bigint NOT NULL,
  `brand_id` bigint NOT NULL,
  `auth_cert_url` varchar(500) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'PENDING',
  `approved_by_admin_id` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dealer_brand` (`dealer_id`,`brand_id`),
  KEY `fk_dealerbrand_brand` (`brand_id`),
  KEY `fk_dealerbrand_admin` (`approved_by_admin_id`),
  CONSTRAINT `fk_dealerbrand_admin` FOREIGN KEY (`approved_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_dealerbrand_dealer` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `dealer_documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dealer_id` bigint NOT NULL,
  `doc_type` varchar(50) NOT NULL,
  `doc_url` varchar(500) NOT NULL,
  `verification_status` varchar(50) NOT NULL DEFAULT 'PENDING',
  `verified_by_admin_id` bigint DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_doc_dealer` (`dealer_id`),
  KEY `fk_doc_admin` (`verified_by_admin_id`),
  CONSTRAINT `fk_doc_admin` FOREIGN KEY (`verified_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_doc_dealer` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ====================================================================
-- AutoCart Business Service Schema (autocart_business)
-- Tables: brands, car_models, car_variants, variant_colours,
--         variant_images, dealer_inventory, dealer_offers,
--         test_drive_bookings, ratings
-- ====================================================================

CREATE TABLE IF NOT EXISTS `brands` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `origin_country` varchar(100) DEFAULT NULL,
  `banner_url` varchar(255) DEFAULT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_brand_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `car_models` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `brand_id` bigint NOT NULL,
  `name` varchar(100) NOT NULL,
  `body_type` enum('HATCHBACK','SEDAN','SUV','MUV','COUPE','CONVERTIBLE','PICKUP') NOT NULL,
  `launch_year` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_model_brand` (`brand_id`),
  CONSTRAINT `fk_model_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `car_variants` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `model_id` bigint NOT NULL,
  `variant_name` varchar(150) NOT NULL,
  `fuel_type` enum('PETROL','DIESEL','ELECTRIC','CNG','HYBRID') NOT NULL,
  `transmission` enum('MANUAL','AUTOMATIC','AMT','CVT','DCT') NOT NULL,
  `engine_cc` int DEFAULT NULL,
  `power_bhp` float DEFAULT NULL,
  `torque_nm` float DEFAULT NULL,
  `mileage_kmpl` float DEFAULT NULL,
  `seating_capacity` int DEFAULT NULL,
  `length_mm` int DEFAULT NULL,
  `width_mm` int DEFAULT NULL,
  `height_mm` int DEFAULT NULL,
  `wheelbase_mm` int DEFAULT NULL,
  `boot_space_litres` int DEFAULT NULL,
  `airbags` int DEFAULT NULL,
  `abs` tinyint(1) DEFAULT '1',
  `ebd` tinyint(1) DEFAULT '1',
  `ncap_rating` varchar(10) DEFAULT NULL,
  `base_price` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_variant_model` (`model_id`),
  CONSTRAINT `fk_variant_model` FOREIGN KEY (`model_id`) REFERENCES `car_models` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `variant_colours` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `variant_id` bigint NOT NULL,
  `colour_name` varchar(50) NOT NULL,
  `hex_code` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_colour_variant` (`variant_id`),
  CONSTRAINT `fk_colour_variant` FOREIGN KEY (`variant_id`) REFERENCES `car_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `variant_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `variant_id` bigint NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `image_type` enum('EXTERIOR','INTERIOR','COLOUR','360') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_image_variant` (`variant_id`),
  CONSTRAINT `fk_image_variant` FOREIGN KEY (`variant_id`) REFERENCES `car_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `dealer_inventory` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dealer_id` bigint NOT NULL,
  `variant_id` bigint NOT NULL,
  `listed_price` decimal(12,2) NOT NULL,
  `discount_amount` decimal(12,2) DEFAULT '0.00',
  `discount_type` enum('FLAT','PERCENTAGE') DEFAULT NULL,
  `units_available` int NOT NULL DEFAULT '0',
  `delivery_days` int DEFAULT NULL,
  `discount_valid_until` date DEFAULT NULL,
  `approval_status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `listing_status` enum('ACTIVE','INACTIVE','OUT_OF_STOCK') NOT NULL DEFAULT 'ACTIVE',
  `rejection_reason` varchar(255) DEFAULT NULL,
  `approved_by_admin_id` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_inventory_dealer` (`dealer_id`),
  KEY `fk_inventory_variant` (`variant_id`),
  KEY `fk_inventory_admin` (`approved_by_admin_id`),
  CONSTRAINT `fk_inventory_variant` FOREIGN KEY (`variant_id`) REFERENCES `car_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `dealer_offers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `inventory_id` bigint NOT NULL,
  `offer_type` enum('EXCHANGE_BONUS','FESTIVE','CORPORATE','LOYALTY','OTHER') NOT NULL,
  `offer_description` varchar(255) DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_offer_inventory` (`inventory_id`),
  CONSTRAINT `fk_offer_inventory` FOREIGN KEY (`inventory_id`) REFERENCES `dealer_inventory` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `test_drive_bookings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `dealer_id` bigint NOT NULL,
  `variant_id` bigint NOT NULL,
  `preferred_date` date NOT NULL,
  `preferred_time` varchar(20) DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `cancellation_reason` varchar(255) DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `customer_mobile` varchar(20) DEFAULT NULL,
  `showroom_name` varchar(150) DEFAULT NULL,
  `booked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_tdb_user` (`user_id`),
  KEY `fk_tdb_dealer` (`dealer_id`),
  KEY `fk_tdb_variant` (`variant_id`),
  CONSTRAINT `fk_tdb_variant` FOREIGN KEY (`variant_id`) REFERENCES `car_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `ratings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `dealer_id` bigint NOT NULL,
  `rating_value` int NOT NULL,
  `review_text` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_dealer_rating` (`user_id`,`dealer_id`),
  KEY `fk_rating_dealer` (`dealer_id`),
  CONSTRAINT `ratings_chk_1` CHECK ((`rating_value` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

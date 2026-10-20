-- MySQL dump 10.13  Distrib 8.2.0, for Win64 (x86_64)
--
-- Host: localhost    Database: autocart_db
-- ------------------------------------------------------
-- Server version	8.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('SUPER_ADMIN','MODERATOR') NOT NULL DEFAULT 'MODERATOR',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bank_partners`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_partners` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(100) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bank_name` (`bank_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `brands`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `origin_country` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `banner_url` varchar(255) DEFAULT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `car_models`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `car_models` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `brand_id` bigint NOT NULL,
  `name` varchar(100) NOT NULL,
  `body_type` enum('HATCHBACK','SEDAN','SUV','MUV','COUPE','CONVERTIBLE','PICKUP') NOT NULL,
  `launch_year` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `thumbnail` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_model_brand` (`brand_id`),
  CONSTRAINT `fk_model_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `car_variants`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `car_variants` (
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
  `ncap_rating` varchar(255) DEFAULT NULL,
  `base_price` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_variant_model` (`model_id`),
  CONSTRAINT `fk_variant_model` FOREIGN KEY (`model_id`) REFERENCES `car_models` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `card_offers`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_offers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bank_id` bigint NOT NULL,
  `card_type` varchar(20) NOT NULL,
  `card_network` varchar(50) DEFAULT NULL,
  `discount_percent` float DEFAULT NULL,
  `max_discount_cap` decimal(10,2) DEFAULT NULL,
  `min_transaction` decimal(10,2) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_cardoffer_bank` (`bank_id`),
  CONSTRAINT `fk_cardoffer_bank` FOREIGN KEY (`bank_id`) REFERENCES `bank_partners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dealer_brands`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dealer_brands` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dealer_id` bigint NOT NULL,
  `brand_id` bigint NOT NULL,
  `auth_cert_url` varchar(500) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `approved_by_admin_id` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dealer_brand` (`dealer_id`,`brand_id`),
  KEY `fk_dealerbrand_brand` (`brand_id`),
  KEY `fk_dealerbrand_admin` (`approved_by_admin_id`),
  CONSTRAINT `fk_dealerbrand_admin` FOREIGN KEY (`approved_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_dealerbrand_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dealerbrand_dealer` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dealer_documents`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dealer_documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dealer_id` bigint NOT NULL,
  `doc_type` enum('GST_CERT','TRADE_LICENSE','PAN','AUTH_LETTER','OTHER') NOT NULL,
  `doc_url` varchar(500) NOT NULL,
  `verification_status` enum('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `verified_by_admin_id` bigint DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_doc_dealer` (`dealer_id`),
  KEY `fk_doc_admin` (`verified_by_admin_id`),
  CONSTRAINT `fk_doc_admin` FOREIGN KEY (`verified_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_doc_dealer` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dealer_inventory`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dealer_inventory` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dealer_id` bigint NOT NULL,
  `variant_id` bigint NOT NULL,
  `listed_price` decimal(12,2) NOT NULL,
  `discount_amount` decimal(12,2) DEFAULT '0.00',
  `discount_type` varchar(20) DEFAULT NULL,
  `units_available` int NOT NULL DEFAULT '0',
  `delivery_days` int DEFAULT NULL,
  `discount_valid_until` date DEFAULT NULL,
  `approval_status` varchar(20) NOT NULL,
  `listing_status` varchar(20) NOT NULL,
  `rejection_reason` varchar(255) DEFAULT NULL,
  `approved_by_admin_id` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_inventory_dealer` (`dealer_id`),
  KEY `fk_inventory_variant` (`variant_id`),
  KEY `fk_inventory_admin` (`approved_by_admin_id`),
  CONSTRAINT `fk_inventory_admin` FOREIGN KEY (`approved_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_inventory_dealer` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inventory_variant` FOREIGN KEY (`variant_id`) REFERENCES `car_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dealer_offers`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dealer_offers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `inventory_id` bigint NOT NULL,
  `offer_type` varchar(50) NOT NULL,
  `offer_description` varchar(255) DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_offer_inventory` (`inventory_id`),
  CONSTRAINT `fk_offer_inventory` FOREIGN KEY (`inventory_id`) REFERENCES `dealer_inventory` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dealers`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dealers` (
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
  `status` enum('PENDING','APPROVED','REJECTED','SUSPENDED') NOT NULL DEFAULT 'PENDING',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `gst_number` (`gst_number`),
  UNIQUE KEY `license_number` (`license_number`),
  CONSTRAINT `fk_dealer_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emi_products`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emi_products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bank_id` bigint NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `tenure_months` int NOT NULL,
  `interest_rate` float NOT NULL,
  `processing_fee` decimal(10,2) DEFAULT '0.00',
  `no_cost_emi` tinyint(1) DEFAULT '0',
  `min_loan_amount` decimal(12,2) DEFAULT NULL,
  `max_loan_amount` decimal(12,2) DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_emi_bank` (`bank_id`),
  CONSTRAINT `fk_emi_bank` FOREIGN KEY (`bank_id`) REFERENCES `bank_partners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` varchar(500) DEFAULT NULL,
  `type` enum('BOOKING','OFFER','SYSTEM','PAYMENT') NOT NULL DEFAULT 'SYSTEM',
  `channel` enum('EMAIL','SMS','PUSH','IN_APP') NOT NULL DEFAULT 'IN_APP',
  `is_read` tinyint(1) DEFAULT '0',
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notification_user` (`user_id`),
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `purchase_enquiries`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_enquiries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `dealer_id` bigint NOT NULL,
  `inventory_id` bigint NOT NULL,
  `selected_colour` varchar(50) DEFAULT NULL,
  `finance_preference` varchar(20) DEFAULT NULL,
  `emi_product_id` bigint DEFAULT NULL,
  `card_offer_id` bigint DEFAULT NULL,
  `card_offer_applied` varchar(255) DEFAULT NULL,
  `final_price_shown` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(20) DEFAULT 'PENDING',
  `payment_status` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_enquiry_user` (`user_id`),
  KEY `fk_enquiry_dealer` (`dealer_id`),
  KEY `fk_enquiry_inventory` (`inventory_id`),
  KEY `fk_enquiry_emi` (`emi_product_id`),
  KEY `fk_enquiry_card` (`card_offer_id`),
  CONSTRAINT `fk_enquiry_card` FOREIGN KEY (`card_offer_id`) REFERENCES `card_offers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_enquiry_dealer` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enquiry_emi` FOREIGN KEY (`emi_product_id`) REFERENCES `emi_products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_enquiry_inventory` FOREIGN KEY (`inventory_id`) REFERENCES `dealer_inventory` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enquiry_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ratings`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `dealer_id` bigint NOT NULL,
  `rating_value` int NOT NULL,
  `review_text` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_dealer_rating` (`user_id`,`dealer_id`),
  KEY `fk_rating_dealer` (`dealer_id`),
  CONSTRAINT `fk_rating_dealer` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rating_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_chk_1` CHECK ((`rating_value` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `test_drive_bookings`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test_drive_bookings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `dealer_id` bigint NOT NULL,
  `variant_id` bigint NOT NULL,
  `preferred_date` date NOT NULL,
  `preferred_time` varchar(20) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `cancellation_reason` varchar(255) DEFAULT NULL,
  `booked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_tdb_user` (`user_id`),
  KEY `fk_tdb_dealer` (`dealer_id`),
  KEY `fk_tdb_variant` (`variant_id`),
  CONSTRAINT `fk_tdb_dealer` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tdb_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tdb_variant` FOREIGN KEY (`variant_id`) REFERENCES `car_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('CUSTOMER','DEALER','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `status` enum('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `mobile` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `variant_colours`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variant_colours` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `variant_id` bigint NOT NULL,
  `colour_name` varchar(50) NOT NULL,
  `hex_code` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_colour_variant` (`variant_id`),
  CONSTRAINT `fk_colour_variant` FOREIGN KEY (`variant_id`) REFERENCES `car_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `variant_images`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variant_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `variant_id` bigint NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `image_type` enum('EXTERIOR','INTERIOR','COLOUR','360') NOT NULL,
  `colour_name` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_image_variant` (`variant_id`),
  CONSTRAINT `fk_image_variant` FOREIGN KEY (`variant_id`) REFERENCES `car_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-20 12:14:05

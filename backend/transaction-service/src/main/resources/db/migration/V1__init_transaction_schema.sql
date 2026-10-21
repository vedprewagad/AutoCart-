-- ====================================================================
-- AutoCart Transaction Service Schema (autocart_transaction)
-- Tables: bank_partners, emi_products, card_offers, purchase_enquiries
-- ====================================================================

CREATE TABLE IF NOT EXISTS `bank_partners` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(100) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bank_name` (`bank_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `emi_products` (
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

CREATE TABLE IF NOT EXISTS `card_offers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bank_id` bigint NOT NULL,
  `card_type` enum('CREDIT','DEBIT') NOT NULL,
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

CREATE TABLE IF NOT EXISTS `purchase_enquiries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `dealer_id` bigint NOT NULL,
  `inventory_id` bigint NOT NULL,
  `selected_colour` varchar(50) DEFAULT NULL,
  `finance_preference` varchar(20) DEFAULT 'CASH',
  `emi_product_id` bigint DEFAULT NULL,
  `card_offer_id` bigint DEFAULT NULL,
  `card_offer_applied` varchar(255) DEFAULT NULL,
  `final_price_shown` decimal(12,2) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'PENDING',
  `payment_status` varchar(50) DEFAULT 'UNPAID',
  `transaction_id` varchar(100) DEFAULT NULL,
  `stock_released` tinyint(1) NOT NULL DEFAULT 0,
  `customer_name` varchar(100) DEFAULT NULL,
  `customer_mobile` varchar(20) DEFAULT NULL,
  `showroom_name` varchar(150) DEFAULT NULL,
  `car_model_name` varchar(150) DEFAULT NULL,
  `variant_name` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_enquiry_user` (`user_id`),
  KEY `fk_enquiry_dealer` (`dealer_id`),
  KEY `fk_enquiry_inventory` (`inventory_id`),
  KEY `fk_enquiry_emi` (`emi_product_id`),
  KEY `fk_enquiry_card` (`card_offer_id`),
  CONSTRAINT `fk_enquiry_card` FOREIGN KEY (`card_offer_id`) REFERENCES `card_offers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_enquiry_emi` FOREIGN KEY (`emi_product_id`) REFERENCES `emi_products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

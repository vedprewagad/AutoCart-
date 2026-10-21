-- ====================================================================
-- AutoCart Microservices Database Split & Data Migration Script
-- Splits monolith autocart_db into:
--   1. autocart_auth
--   2. autocart_business
--   3. autocart_transaction
--
-- NOTE: autocart_db is kept UNTOUCHED as the golden baseline and rollback.
-- ====================================================================

-- STEP 1: CREATE TARGET DATABASES
CREATE DATABASE IF NOT EXISTS `autocart_auth` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS `autocart_business` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS `autocart_transaction` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- STEP 2: COPY DATA INTO autocart_auth
-- Tables: users, admins, dealers, dealer_brands, dealer_documents
INSERT INTO `autocart_auth`.`users` 
SELECT `id`, `first_name`, `last_name`, `email`, `mobile`, `password_hash`, `role`, `status`, `city`, `state`, `reset_token`, `reset_token_expiry`, `created_at`, `updated_at`
FROM `autocart_db`.`users`
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

INSERT INTO `autocart_auth`.`admins`
SELECT * FROM `autocart_db`.`admins`
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

INSERT INTO `autocart_auth`.`dealers`
SELECT * FROM `autocart_db`.`dealers`
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

INSERT INTO `autocart_auth`.`dealer_brands`
SELECT * FROM `autocart_db`.`dealer_brands`
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

INSERT INTO `autocart_auth`.`dealer_documents`
SELECT * FROM `autocart_db`.`dealer_documents`
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

-- STEP 3: COPY DATA INTO autocart_business
-- Tables: brands, car_models, car_variants, variant_colours, variant_images, dealer_inventory, dealer_offers, test_drive_bookings, ratings
INSERT INTO `autocart_business`.`brands`
SELECT * FROM `autocart_db`.`brands`
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `autocart_business`.`car_models`
SELECT * FROM `autocart_db`.`car_models`
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

INSERT INTO `autocart_business`.`car_variants`
SELECT * FROM `autocart_db`.`car_variants`
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

INSERT INTO `autocart_business`.`variant_colours`
SELECT * FROM `autocart_db`.`variant_colours`
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

INSERT INTO `autocart_business`.`variant_images`
SELECT * FROM `autocart_db`.`variant_images`
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

INSERT INTO `autocart_business`.`dealer_inventory`
SELECT * FROM `autocart_db`.`dealer_inventory`
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

INSERT INTO `autocart_business`.`dealer_offers`
SELECT * FROM `autocart_db`.`dealer_offers`
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

INSERT INTO `autocart_business`.`test_drive_bookings` (
  `id`, `user_id`, `dealer_id`, `variant_id`, `preferred_date`, `preferred_time`, `status`, `cancellation_reason`, `customer_name`, `customer_mobile`, `showroom_name`, `booked_at`
)
SELECT 
  tdb.`id`, tdb.`user_id`, tdb.`dealer_id`, tdb.`variant_id`, tdb.`preferred_date`, tdb.`preferred_time`, tdb.`status`, tdb.`cancellation_reason`,
  CONCAT(u.`first_name`, ' ', u.`last_name`), u.`mobile`, d.`showroom_name`, tdb.`booked_at`
FROM `autocart_db`.`test_drive_bookings` tdb
LEFT JOIN `autocart_db`.`users` u ON tdb.`user_id` = u.`id`
LEFT JOIN `autocart_db`.`dealers` d ON tdb.`dealer_id` = d.`id`
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

INSERT INTO `autocart_business`.`ratings`
SELECT * FROM `autocart_db`.`ratings`
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

-- STEP 4: COPY DATA INTO autocart_transaction
-- Tables: bank_partners, emi_products, card_offers, purchase_enquiries
INSERT INTO `autocart_transaction`.`bank_partners`
SELECT * FROM `autocart_db`.`bank_partners`
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

INSERT INTO `autocart_transaction`.`emi_products`
SELECT * FROM `autocart_db`.`emi_products`
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

INSERT INTO `autocart_transaction`.`card_offers`
SELECT * FROM `autocart_db`.`card_offers`
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

INSERT INTO `autocart_transaction`.`purchase_enquiries` (
  `id`, `user_id`, `dealer_id`, `inventory_id`, `selected_colour`, `finance_preference`,
  `emi_product_id`, `card_offer_id`, `card_offer_applied`, `final_price_shown`,
  `status`, `payment_status`, `transaction_id`, `stock_released`,
  `customer_name`, `customer_mobile`, `showroom_name`, `car_model_name`, `variant_name`,
  `created_at`
)
SELECT 
  pe.`id`, pe.`user_id`, pe.`dealer_id`, pe.`inventory_id`, pe.`selected_colour`, pe.`finance_preference`,
  pe.`emi_product_id`, pe.`card_offer_id`, pe.`card_offer_applied`, pe.`final_price_shown`,
  pe.`status`, pe.`payment_status`, pe.`transaction_id`, 
  CASE WHEN pe.`status` IN ('CANCELLED', 'REJECTED') THEN 1 ELSE 0 END as `stock_released`,
  CONCAT(u.`first_name`, ' ', u.`last_name`), u.`mobile`, d.`showroom_name`,
  CONCAT(b.`name`, ' ', m.`name`), v.`variant_name`,
  pe.`created_at`
FROM `autocart_db`.`purchase_enquiries` pe
LEFT JOIN `autocart_db`.`users` u ON pe.`user_id` = u.`id`
LEFT JOIN `autocart_db`.`dealers` d ON pe.`dealer_id` = d.`id`
LEFT JOIN `autocart_db`.`dealer_inventory` di ON pe.`inventory_id` = di.`id`
LEFT JOIN `autocart_db`.`car_variants` v ON di.`variant_id` = v.`id`
LEFT JOIN `autocart_db`.`car_models` m ON v.`model_id` = m.`id`
LEFT JOIN `autocart_db`.`brands` b ON m.`brand_id` = b.`id`
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

-- STEP 5: VERIFICATION ROW COUNT QUERY
-- Run this query to ensure zero data loss:
SELECT 'users' as table_name, (SELECT count(*) FROM `autocart_db`.`users`) as src_count, (SELECT count(*) FROM `autocart_auth`.`users`) as target_count
UNION ALL SELECT 'admins', (SELECT count(*) FROM `autocart_db`.`admins`), (SELECT count(*) FROM `autocart_auth`.`admins`)
UNION ALL SELECT 'dealers', (SELECT count(*) FROM `autocart_db`.`dealers`), (SELECT count(*) FROM `autocart_auth`.`dealers`)
UNION ALL SELECT 'dealer_brands', (SELECT count(*) FROM `autocart_db`.`dealer_brands`), (SELECT count(*) FROM `autocart_auth`.`dealer_brands`)
UNION ALL SELECT 'brands', (SELECT count(*) FROM `autocart_db`.`brands`), (SELECT count(*) FROM `autocart_business`.`brands`)
UNION ALL SELECT 'car_models', (SELECT count(*) FROM `autocart_db`.`car_models`), (SELECT count(*) FROM `autocart_business`.`car_models`)
UNION ALL SELECT 'car_variants', (SELECT count(*) FROM `autocart_db`.`car_variants`), (SELECT count(*) FROM `autocart_business`.`car_variants`)
UNION ALL SELECT 'dealer_inventory', (SELECT count(*) FROM `autocart_db`.`dealer_inventory`), (SELECT count(*) FROM `autocart_business`.`dealer_inventory`)
UNION ALL SELECT 'test_drive_bookings', (SELECT count(*) FROM `autocart_db`.`test_drive_bookings`), (SELECT count(*) FROM `autocart_business`.`test_drive_bookings`)
UNION ALL SELECT 'ratings', (SELECT count(*) FROM `autocart_db`.`ratings`), (SELECT count(*) FROM `autocart_business`.`ratings`)
UNION ALL SELECT 'bank_partners', (SELECT count(*) FROM `autocart_db`.`bank_partners`), (SELECT count(*) FROM `autocart_transaction`.`bank_partners`)
UNION ALL SELECT 'emi_products', (SELECT count(*) FROM `autocart_db`.`emi_products`), (SELECT count(*) FROM `autocart_transaction`.`emi_products`)
UNION ALL SELECT 'card_offers', (SELECT count(*) FROM `autocart_db`.`card_offers`), (SELECT count(*) FROM `autocart_transaction`.`card_offers`)
UNION ALL SELECT 'purchase_enquiries', (SELECT count(*) FROM `autocart_db`.`purchase_enquiries`), (SELECT count(*) FROM `autocart_transaction`.`purchase_enquiries`);

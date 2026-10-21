-- ====================================================================
-- AutoCart Microservices Database Split & Data Migration Script
-- Splits monolith autocart_db into:
--   1. autocart_auth
--   2. autocart_business
--   3. autocart_transaction
--
-- IMPORTANT: Run without --force (do NOT pass -f or --force to the mysql
-- client). If any table check fails or an error occurs, execution must
-- abort immediately.
--
-- NOTE: autocart_db is kept UNTOUCHED as the golden baseline and rollback.
-- ====================================================================

-- STEP 1: CREATE TARGET DATABASES
CREATE DATABASE IF NOT EXISTS `autocart_auth` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS `autocart_business` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS `autocart_transaction` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Select a target database before creating stored procedure (never autocart_db)
USE `autocart_auth`;

-- STEP 2: PRE-FLIGHT SAFETY CHECK
-- Abort immediately if any target table in any of the three databases already has rows.
DELIMITER $$
DROP PROCEDURE IF EXISTS `check_empty_targets`$$
CREATE PROCEDURE `check_empty_targets`()
BEGIN
    DECLARE total_rows INT DEFAULT 0;

    SELECT 
        (SELECT COUNT(*) FROM `autocart_auth`.`users`) +
        (SELECT COUNT(*) FROM `autocart_auth`.`admins`) +
        (SELECT COUNT(*) FROM `autocart_auth`.`dealers`) +
        (SELECT COUNT(*) FROM `autocart_auth`.`dealer_brands`) +
        (SELECT COUNT(*) FROM `autocart_auth`.`dealer_documents`) +
        (SELECT COUNT(*) FROM `autocart_business`.`brands`) +
        (SELECT COUNT(*) FROM `autocart_business`.`car_models`) +
        (SELECT COUNT(*) FROM `autocart_business`.`car_variants`) +
        (SELECT COUNT(*) FROM `autocart_business`.`variant_colours`) +
        (SELECT COUNT(*) FROM `autocart_business`.`variant_images`) +
        (SELECT COUNT(*) FROM `autocart_business`.`dealer_inventory`) +
        (SELECT COUNT(*) FROM `autocart_business`.`dealer_offers`) +
        (SELECT COUNT(*) FROM `autocart_business`.`test_drive_bookings`) +
        (SELECT COUNT(*) FROM `autocart_business`.`ratings`) +
        (SELECT COUNT(*) FROM `autocart_transaction`.`bank_partners`) +
        (SELECT COUNT(*) FROM `autocart_transaction`.`emi_products`) +
        (SELECT COUNT(*) FROM `autocart_transaction`.`card_offers`) +
        (SELECT COUNT(*) FROM `autocart_transaction`.`purchase_enquiries`)
    INTO total_rows;

    IF total_rows > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Migration aborted: One or more target tables in autocart_auth, autocart_business, or autocart_transaction already contain data.';
    END IF;
END$$
DELIMITER ;

CALL `check_empty_targets`();
DROP PROCEDURE IF EXISTS `check_empty_targets`;

-- STEP 3: TRANSACTIONAL DATA MIGRATION
START TRANSACTION;

-- COPY DATA INTO autocart_auth
-- Tables: users, admins, dealers, dealer_brands, dealer_documents

INSERT INTO `autocart_auth`.`users` (
  `id`, `first_name`, `last_name`, `email`, `mobile`, `password_hash`,
  `role`, `status`, `city`, `state`, `reset_token`, `reset_token_expiry`,
  `created_at`, `updated_at`
)
SELECT 
  `id`, `first_name`, `last_name`, `email`, `mobile`, `password_hash`,
  `role`, `status`, `city`, `state`, `reset_token`, `reset_token_expiry`,
  `created_at`, `updated_at`
FROM `autocart_db`.`users`;

INSERT INTO `autocart_auth`.`admins` (
  `id`, `first_name`, `last_name`, `email`, `password_hash`, `role`
)
SELECT 
  `id`, `first_name`, `last_name`, `email`, `password_hash`, `role`
FROM `autocart_db`.`admins`;

INSERT INTO `autocart_auth`.`dealers` (
  `id`, `user_id`, `showroom_name`, `license_number`, `gst_number`,
  `address`, `city`, `state`, `pin_code`, `contact_phone`,
  `working_hours`, `rating`, `status`
)
SELECT 
  `id`, `user_id`, `showroom_name`, `license_number`, `gst_number`,
  `address`, `city`, `state`, `pin_code`, `contact_phone`,
  `working_hours`, `rating`, `status`
FROM `autocart_db`.`dealers`;

INSERT INTO `autocart_auth`.`dealer_brands` (
  `id`, `dealer_id`, `brand_id`, `auth_cert_url`, `status`,
  `approved_by_admin_id`, `created_at`
)
SELECT 
  `id`, `dealer_id`, `brand_id`, `auth_cert_url`, `status`,
  `approved_by_admin_id`, `created_at`
FROM `autocart_db`.`dealer_brands`;

INSERT INTO `autocart_auth`.`dealer_documents` (
  `id`, `dealer_id`, `doc_type`, `doc_url`, `verification_status`,
  `verified_by_admin_id`, `uploaded_at`
)
SELECT 
  `id`, `dealer_id`, `doc_type`, `doc_url`, `verification_status`,
  `verified_by_admin_id`, `uploaded_at`
FROM `autocart_db`.`dealer_documents`;

-- COPY DATA INTO autocart_business
-- Tables: brands, car_models, car_variants, variant_colours, variant_images, dealer_inventory, dealer_offers, test_drive_bookings, ratings

INSERT INTO `autocart_business`.`brands` (
  `id`, `name`, `logo_url`, `origin_country`, `banner_url`, `tagline`, `created_at`
)
SELECT 
  `id`, `name`, `logo_url`, `origin_country`, `banner_url`, `tagline`, `created_at`
FROM `autocart_db`.`brands`;

INSERT INTO `autocart_business`.`car_models` (
  `id`, `brand_id`, `name`, `body_type`, `launch_year`, `thumbnail`, `created_at`
)
SELECT 
  `id`, `brand_id`, `name`, `body_type`, `launch_year`, `thumbnail`, `created_at`
FROM `autocart_db`.`car_models`;

INSERT INTO `autocart_business`.`car_variants` (
  `id`, `model_id`, `variant_name`, `fuel_type`, `transmission`,
  `engine_cc`, `power_bhp`, `torque_nm`, `mileage_kmpl`, `seating_capacity`,
  `length_mm`, `width_mm`, `height_mm`, `wheelbase_mm`, `boot_space_litres`,
  `airbags`, `abs`, `ebd`, `ncap_rating`, `base_price`, `created_at`
)
SELECT 
  `id`, `model_id`, `variant_name`, `fuel_type`, `transmission`,
  `engine_cc`, `power_bhp`, `torque_nm`, `mileage_kmpl`, `seating_capacity`,
  `length_mm`, `width_mm`, `height_mm`, `wheelbase_mm`, `boot_space_litres`,
  `airbags`, `abs`, `ebd`, `ncap_rating`, `base_price`, `created_at`
FROM `autocart_db`.`car_variants`;

INSERT INTO `autocart_business`.`variant_colours` (
  `id`, `variant_id`, `colour_name`, `hex_code`
)
SELECT 
  `id`, `variant_id`, `colour_name`, `hex_code`
FROM `autocart_db`.`variant_colours`;

INSERT INTO `autocart_business`.`variant_images` (
  `id`, `variant_id`, `image_url`, `image_type`, `colour_name`
)
SELECT 
  `id`, `variant_id`, `image_url`, `image_type`, `colour_name`
FROM `autocart_db`.`variant_images`;

INSERT INTO `autocart_business`.`dealer_inventory` (
  `id`, `dealer_id`, `variant_id`, `listed_price`, `discount_amount`,
  `discount_type`, `units_available`, `delivery_days`, `discount_valid_until`,
  `approval_status`, `listing_status`, `rejection_reason`, `approved_by_admin_id`,
  `created_at`, `updated_at`
)
SELECT 
  `id`, `dealer_id`, `variant_id`, `listed_price`, `discount_amount`,
  `discount_type`, `units_available`, `delivery_days`, `discount_valid_until`,
  `approval_status`, `listing_status`, `rejection_reason`, `approved_by_admin_id`,
  `created_at`, `updated_at`
FROM `autocart_db`.`dealer_inventory`;

INSERT INTO `autocart_business`.`dealer_offers` (
  `id`, `inventory_id`, `offer_type`, `offer_description`, `valid_until`
)
SELECT 
  `id`, `inventory_id`, `offer_type`, `offer_description`, `valid_until`
FROM `autocart_db`.`dealer_offers`;

INSERT INTO `autocart_business`.`test_drive_bookings` (
  `id`, `user_id`, `dealer_id`, `variant_id`, `preferred_date`,
  `preferred_time`, `status`, `cancellation_reason`,
  `customer_name`, `customer_mobile`, `showroom_name`, `booked_at`
)
SELECT 
  tdb.`id`, tdb.`user_id`, tdb.`dealer_id`, tdb.`variant_id`, tdb.`preferred_date`,
  tdb.`preferred_time`, tdb.`status`, tdb.`cancellation_reason`,
  CONCAT(u.`first_name`, ' ', u.`last_name`), u.`mobile`, d.`showroom_name`, tdb.`booked_at`
FROM `autocart_db`.`test_drive_bookings` tdb
LEFT JOIN `autocart_db`.`users` u ON tdb.`user_id` = u.`id`
LEFT JOIN `autocart_db`.`dealers` d ON tdb.`dealer_id` = d.`id`;

INSERT INTO `autocart_business`.`ratings` (
  `id`, `user_id`, `dealer_id`, `rating_value`, `review_text`, `created_at`
)
SELECT 
  `id`, `user_id`, `dealer_id`, `rating_value`, `review_text`, `created_at`
FROM `autocart_db`.`ratings`;

-- COPY DATA INTO autocart_transaction
-- Tables: bank_partners, emi_products, card_offers, purchase_enquiries

INSERT INTO `autocart_transaction`.`bank_partners` (
  `id`, `bank_name`, `logo_url`, `contact_email`, `created_at`
)
SELECT 
  `id`, `bank_name`, `logo_url`, `contact_email`, `created_at`
FROM `autocart_db`.`bank_partners`;

INSERT INTO `autocart_transaction`.`emi_products` (
  `id`, `bank_id`, `product_name`, `tenure_months`, `interest_rate`,
  `processing_fee`, `no_cost_emi`, `min_loan_amount`, `max_loan_amount`,
  `valid_until`
)
SELECT 
  `id`, `bank_id`, `product_name`, `tenure_months`, `interest_rate`,
  `processing_fee`, `no_cost_emi`, `min_loan_amount`, `max_loan_amount`,
  `valid_until`
FROM `autocart_db`.`emi_products`;

INSERT INTO `autocart_transaction`.`card_offers` (
  `id`, `bank_id`, `card_type`, `card_network`, `discount_percent`,
  `max_discount_cap`, `min_transaction`, `description`, `valid_from`,
  `valid_until`
)
SELECT 
  `id`, `bank_id`, `card_type`, `card_network`, `discount_percent`,
  `max_discount_cap`, `min_transaction`, `description`, `valid_from`,
  `valid_until`
FROM `autocart_db`.`card_offers`;

INSERT INTO `autocart_transaction`.`purchase_enquiries` (
  `id`, `user_id`, `dealer_id`, `inventory_id`, `selected_colour`,
  `finance_preference`, `emi_product_id`, `card_offer_id`,
  `card_offer_applied`, `final_price_shown`, `status`, `payment_status`,
  `transaction_id`, `stock_released`, `customer_name`, `customer_mobile`,
  `showroom_name`, `car_model_name`, `variant_name`, `created_at`
)
SELECT 
  pe.`id`, pe.`user_id`, pe.`dealer_id`, pe.`inventory_id`, pe.`selected_colour`,
  pe.`finance_preference`, pe.`emi_product_id`, pe.`card_offer_id`,
  pe.`card_offer_applied`, pe.`final_price_shown`, pe.`status`, pe.`payment_status`,
  pe.`transaction_id`, 
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
LEFT JOIN `autocart_db`.`brands` b ON m.`brand_id` = b.`id`;

COMMIT;

-- STEP 4: EXTENDED VERIFICATION QUERIES
-- Run these queries after migration to verify exact data integrity and snapshot completeness.

-- 4.1 Row counts for ALL 18 copied tables (src_count vs target_count)
SELECT 'users' as table_name, (SELECT count(*) FROM `autocart_db`.`users`) as src_count, (SELECT count(*) FROM `autocart_auth`.`users`) as target_count
UNION ALL SELECT 'admins', (SELECT count(*) FROM `autocart_db`.`admins`), (SELECT count(*) FROM `autocart_auth`.`admins`)
UNION ALL SELECT 'dealers', (SELECT count(*) FROM `autocart_db`.`dealers`), (SELECT count(*) FROM `autocart_auth`.`dealers`)
UNION ALL SELECT 'dealer_brands', (SELECT count(*) FROM `autocart_db`.`dealer_brands`), (SELECT count(*) FROM `autocart_auth`.`dealer_brands`)
UNION ALL SELECT 'dealer_documents', (SELECT count(*) FROM `autocart_db`.`dealer_documents`), (SELECT count(*) FROM `autocart_auth`.`dealer_documents`)
UNION ALL SELECT 'brands', (SELECT count(*) FROM `autocart_db`.`brands`), (SELECT count(*) FROM `autocart_business`.`brands`)
UNION ALL SELECT 'car_models', (SELECT count(*) FROM `autocart_db`.`car_models`), (SELECT count(*) FROM `autocart_business`.`car_models`)
UNION ALL SELECT 'car_variants', (SELECT count(*) FROM `autocart_db`.`car_variants`), (SELECT count(*) FROM `autocart_business`.`car_variants`)
UNION ALL SELECT 'variant_colours', (SELECT count(*) FROM `autocart_db`.`variant_colours`), (SELECT count(*) FROM `autocart_business`.`variant_colours`)
UNION ALL SELECT 'variant_images', (SELECT count(*) FROM `autocart_db`.`variant_images`), (SELECT count(*) FROM `autocart_business`.`variant_images`)
UNION ALL SELECT 'dealer_inventory', (SELECT count(*) FROM `autocart_db`.`dealer_inventory`), (SELECT count(*) FROM `autocart_business`.`dealer_inventory`)
UNION ALL SELECT 'dealer_offers', (SELECT count(*) FROM `autocart_db`.`dealer_offers`), (SELECT count(*) FROM `autocart_business`.`dealer_offers`)
UNION ALL SELECT 'test_drive_bookings', (SELECT count(*) FROM `autocart_db`.`test_drive_bookings`), (SELECT count(*) FROM `autocart_business`.`test_drive_bookings`)
UNION ALL SELECT 'ratings', (SELECT count(*) FROM `autocart_db`.`ratings`), (SELECT count(*) FROM `autocart_business`.`ratings`)
UNION ALL SELECT 'bank_partners', (SELECT count(*) FROM `autocart_db`.`bank_partners`), (SELECT count(*) FROM `autocart_transaction`.`bank_partners`)
UNION ALL SELECT 'emi_products', (SELECT count(*) FROM `autocart_db`.`emi_products`), (SELECT count(*) FROM `autocart_transaction`.`emi_products`)
UNION ALL SELECT 'card_offers', (SELECT count(*) FROM `autocart_db`.`card_offers`), (SELECT count(*) FROM `autocart_transaction`.`card_offers`)
UNION ALL SELECT 'purchase_enquiries', (SELECT count(*) FROM `autocart_db`.`purchase_enquiries`), (SELECT count(*) FROM `autocart_transaction`.`purchase_enquiries`);

-- 4.2 Units available total sum comparison
SELECT 
    'dealer_inventory_units_available' as metric,
    (SELECT SUM(units_available) FROM `autocart_db`.`dealer_inventory`) as src_total_units,
    (SELECT SUM(units_available) FROM `autocart_business`.`dealer_inventory`) as target_total_units;

-- 4.3 Enquiry count by status comparison
SELECT 
    status,
    (SELECT COUNT(*) FROM `autocart_db`.`purchase_enquiries` pe_src WHERE pe_src.status = s.status) AS src_count,
    (SELECT COUNT(*) FROM `autocart_transaction`.`purchase_enquiries` pe_tgt WHERE pe_tgt.status = s.status) AS target_count
FROM (
    SELECT DISTINCT status FROM `autocart_db`.`purchase_enquiries`
    UNION
    SELECT DISTINCT status FROM `autocart_transaction`.`purchase_enquiries`
) s;

-- 4.4 Count of snapshot columns that are NULL (validates snapshot integrity)
SELECT 
    'test_drive_bookings' AS entity,
    SUM(CASE WHEN customer_name IS NULL OR customer_name = '' THEN 1 ELSE 0 END) AS null_customer_name,
    SUM(CASE WHEN customer_mobile IS NULL OR customer_mobile = '' THEN 1 ELSE 0 END) AS null_customer_mobile,
    SUM(CASE WHEN showroom_name IS NULL OR showroom_name = '' THEN 1 ELSE 0 END) AS null_showroom_name,
    0 AS null_car_model_name,
    0 AS null_variant_name
FROM `autocart_business`.`test_drive_bookings`
UNION ALL
SELECT 
    'purchase_enquiries' AS entity,
    SUM(CASE WHEN customer_name IS NULL OR customer_name = '' THEN 1 ELSE 0 END) AS null_customer_name,
    SUM(CASE WHEN customer_mobile IS NULL OR customer_mobile = '' THEN 1 ELSE 0 END) AS null_customer_mobile,
    SUM(CASE WHEN showroom_name IS NULL OR showroom_name = '' THEN 1 ELSE 0 END) AS null_showroom_name,
    SUM(CASE WHEN car_model_name IS NULL OR car_model_name = '' THEN 1 ELSE 0 END) AS null_car_model_name,
    SUM(CASE WHEN variant_name IS NULL OR variant_name = '' THEN 1 ELSE 0 END) AS null_variant_name
FROM `autocart_transaction`.`purchase_enquiries`;

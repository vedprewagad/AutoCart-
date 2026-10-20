USE `autocart_db`;

-- ------------------------------------------------------
-- Seed Admins
-- ------------------------------------------------------
INSERT IGNORE INTO `admins` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `role`) VALUES
(1, 'System', 'Admin', 'admin@autocart.com', '$2a$10$e8wF5qLd7q93Yx35zW8N.e4f8G56vUj0f.Zl0hN63q1rK3M.g1f2S', 'SUPER_ADMIN');

-- ------------------------------------------------------
-- Seed Brands (Matching Image 1 & standard brands)
-- ------------------------------------------------------
INSERT IGNORE INTO `brands` (`id`, `name`, `logo_url`, `origin_country`) VALUES
(1, 'Maruti Suzuki', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=300&q=80', 'Japan/India'),
(2, 'Tata', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80', 'India'),
(3, 'Kia', 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=300&q=80', 'South Korea'),
(4, 'MG Motor', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=300&q=80', 'UK/China'),
(5, 'Skoda', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=300&q=80', 'Czech Republic'),
(6, 'Jeep', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=300&q=80', 'USA'),
(7, 'Nissan', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=300&q=80', 'Japan'),
(8, 'Volkswagen', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=300&q=80', 'Germany'),
(9, 'Citroen', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=80', 'France'),
(10, 'Mercedes-Benz', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=300&q=80', 'Germany'),
(11, 'Hyundai', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=300&q=80', 'South Korea'),
(12, 'Toyota', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=300&q=80', 'Japan');

-- ------------------------------------------------------
-- Seed Car Models (Matching Image 5)
-- ------------------------------------------------------
INSERT IGNORE INTO `car_models` (`id`, `brand_id`, `name`, `body_type`, `launch_year`) VALUES
(1, 1, 'Swift', 'HATCHBACK', 2024),
(2, 1, 'Brezza', 'SUV', 2024),
(3, 1, 'FRONX', 'SUV', 2024),
(4, 2, 'Nexon', 'SUV', 2024),
(5, 2, 'Punch', 'SUV', 2024);

-- ------------------------------------------------------
-- Seed Car Variants (Matching Image 2 & 3 specs)
-- ------------------------------------------------------
INSERT IGNORE INTO `car_variants` (`id`, `model_id`, `variant_name`, `fuel_type`, `transmission`, `engine_cc`, `power_bhp`, `torque_nm`, `mileage_kmpl`, `seating_capacity`, `length_mm`, `width_mm`, `height_mm`, `wheelbase_mm`, `boot_space_litres`, `airbags`, `abs`, `ebd`, `ncap_rating`, `base_price`) VALUES
(1, 1, 'Swift LXi', 'PETROL', 'MANUAL', 1197, 80.46, 111.7, 24.8, 5, 3860, 1735, 1520, 2450, 265, 6, 1, 1, '1 Star', 579000.00),
(2, 1, 'Swift VXi', 'PETROL', 'MANUAL', 1197, 80.46, 111.7, 24.8, 5, 3860, 1735, 1520, 2450, 265, 6, 1, 1, '1 Star', 663000.00),
(3, 1, 'Swift VXi Opt', 'PETROL', 'MANUAL', 1197, 80.46, 111.7, 24.8, 5, 3860, 1735, 1520, 2450, 265, 6, 1, 1, '1 Star', 689000.00),
(4, 1, 'Swift VXi AMT', 'PETROL', 'AMT', 1197, 80.46, 111.7, 25.75, 5, 3860, 1735, 1520, 2450, 265, 6, 1, 1, '1 Star', 704000.00),
(5, 1, 'Swift ZXi Plus AMT', 'PETROL', 'AMT', 1197, 80.46, 111.7, 25.75, 5, 3860, 1735, 1520, 2450, 265, 6, 1, 1, '1 Star', 865000.00),
(6, 1, 'Swift VXi CNG', 'CNG', 'MANUAL', 1197, 68.8, 101.8, 32.85, 5, 3860, 1735, 1520, 2450, 210, 6, 1, 1, '1 Star', 750000.00),
(7, 2, 'Brezza LXi', 'PETROL', 'MANUAL', 1462, 103.0, 137.0, 20.15, 5, 3995, 1790, 1685, 2500, 328, 6, 1, 1, '4 Star', 834000.00),
(8, 3, 'FRONX Sigma', 'PETROL', 'MANUAL', 1197, 88.5, 113.0, 21.79, 5, 3995, 1765, 1550, 2520, 308, 6, 1, 1, '4 Star', 751000.00),
(9, 4, 'Nexon Smart', 'PETROL', 'MANUAL', 1199, 118.2, 170.0, 17.44, 5, 3995, 1804, 1620, 2498, 382, 6, 1, 1, '5 Star', 799000.00);

-- ------------------------------------------------------
-- Seed Variant Images
-- ------------------------------------------------------
INSERT IGNORE INTO `variant_images` (`id`, `variant_id`, `image_url`, `image_type`) VALUES
(1, 1, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', 'EXTERIOR'),
(2, 2, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80', 'EXTERIOR'),
(3, 4, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', 'EXTERIOR'),
(4, 5, 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80', 'EXTERIOR'),
(5, 7, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', 'EXTERIOR'),
(6, 8, 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80', 'EXTERIOR'),
(7, 9, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', 'EXTERIOR');

-- ------------------------------------------------------
-- Seed Bank Partners
-- ------------------------------------------------------
INSERT IGNORE INTO `bank_partners` (`id`, `bank_name`, `logo_url`, `contact_email`) VALUES
(1, 'HDFC Bank', 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=200&q=80', 'auto@hdfcbank.com'),
(2, 'ICICI Bank', 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=200&q=80', 'autoloans@icicibank.com'),
(3, 'State Bank of India', 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=200&q=80', 'carloan@sbi.co.in'),
(4, 'Axis Bank', 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=200&q=80', 'support@axisbank.com');

-- ------------------------------------------------------
-- Seed EMI Products
-- ------------------------------------------------------
INSERT IGNORE INTO `emi_products` (`id`, `bank_id`, `product_name`, `tenure_months`, `interest_rate`, `processing_fee`, `no_cost_emi`, `min_loan_amount`, `max_loan_amount`, `valid_until`) VALUES
(1, 1, 'HDFC FastTrack Auto Loan 36M', 36, 8.75, 2500.00, 0, 300000.00, 5000000.00, '2026-12-31'),
(2, 1, 'HDFC Premium Auto Loan 60M', 60, 8.90, 3000.00, 0, 300000.00, 5000000.00, '2026-12-31'),
(3, 2, 'ICICI SmartDrive Loan 48M', 48, 8.80, 2000.00, 0, 250000.00, 4000000.00, '2026-12-31'),
(4, 3, 'SBI Yono Car Finance 84M', 84, 8.50, 1500.00, 0, 200000.00, 6000000.00, '2026-12-31'),
(5, 4, 'Axis Express Auto Loan 36M', 36, 9.10, 1999.00, 0, 300000.00, 3500000.00, '2026-12-31');

-- ------------------------------------------------------
-- Seed Card Offers
-- ------------------------------------------------------
INSERT IGNORE INTO `card_offers` (`id`, `bank_id`, `card_type`, `card_network`, `discount_percent`, `max_discount_cap`, `min_transaction`, `description`, `valid_from`, `valid_until`) VALUES
(1, 1, 'CREDIT', 'Visa/MasterCard', 5.0, 25000.00, 500000.00, 'Flat 5% Instant Cash Back up to ₹25,000 on HDFC Credit Cards', '2026-01-01', '2026-12-31'),
(2, 2, 'CREDIT', 'Visa', 4.5, 20000.00, 400000.00, 'Instant ₹20,000 Discount on ICICI Bank Credit Cards', '2026-01-01', '2026-12-31'),
(3, 3, 'DEBIT', 'RuPay/Visa', 3.0, 15000.00, 300000.00, 'Flat ₹15,000 Cashback on SBI Debit Card Down Payments', '2026-01-01', '2026-12-31');

-- ------------------------------------------------------
-- Seed Variant Colours
-- ------------------------------------------------------
INSERT IGNORE INTO `variant_colours` (`id`, `variant_id`, `colour_name`, `hex_code`) VALUES
(1, 1, 'Pearl Arctic White', '#FFFFFF'),
(2, 1, 'Splendid Silver', '#C0C0C0'),
(3, 1, 'Sizzling Red', '#D32F2F'),
(4, 2, 'Pearl Arctic White', '#FFFFFF'),
(5, 2, 'Luster Blue', '#1976D2'),
(6, 2, 'Novel Orange', '#F57C00'),
(7, 3, 'Magma Grey', '#616161'),
(8, 3, 'Midnight Black', '#212121'),
(9, 4, 'Sizzling Red', '#D32F2F'),
(10, 4, 'Pearl Arctic White', '#FFFFFF'),
(11, 5, 'Luster Blue', '#1976D2'),
(12, 5, 'Splendid Silver', '#C0C0C0'),
(13, 6, 'Magma Grey', '#616161'),
(14, 6, 'Pearl Arctic White', '#FFFFFF'),
(15, 7, 'Exuberant Blue', '#0D47A1'),
(16, 7, 'Brave Khaki', '#8D6E63'),
(17, 8, 'Atlas White', '#F5F5F5'),
(18, 8, 'Abyss Black', '#1A1A1A'),
(19, 9, 'Ranger Khaki', '#4E5340'),
(20, 9, 'Titan Grey', '#546E7A');


-- ============================================================================
-- AutoCart Seed Data — Hotlinkable Unsplash Photos & SVG Logos
-- WARNING / CAUTION: MANUAL EXECUTION ONLY!
-- DO NOT RUN AGAINST PRODUCTION OR LIVE POPULATED DATABASES.
-- This script contains TRUNCATE statements and disables FK checks for clean setup.
-- Note: Spring Boot does NOT execute this file automatically on application startup.
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE variant_images;
TRUNCATE TABLE car_variants;
TRUNCATE TABLE car_models;
TRUNCATE TABLE brands;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- BRANDS (Official Vector & Hotlinkable Logos)
-- ============================================================
INSERT INTO brands (id, name, logo_url, origin_country, banner_url, tagline) VALUES
(1,  'Maruti Suzuki', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Maruti_Suzuki_logo.svg/512px-Maruti_Suzuki_logo.svg.png', 'India', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=80', 'Way of Life!'),
(2,  'Hyundai',       'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Hyundai_Motor_Company_logo.svg/512px-Hyundai_Motor_Company_logo.svg.png', 'South Korea', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80', 'New Thinking. New Possibilities.'),
(3,  'Tata',          'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/512px-Tata_logo.svg.png', 'India', 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1200&q=80', 'Connecting Aspirations'),
(4,  'Mahindra',      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Mahindra_Logo.png/512px-Mahindra_Logo.png', 'India', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80', 'Rise'),
(5,  'Toyota',        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/512px-Toyota_carlogo.svg.png', 'Japan', 'https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=1200&q=80', 'Let''s Go Places'),
(6,  'Honda',         'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Honda.svg/512px-Honda.svg.png', 'Japan', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=80', 'The Power of Dreams'),
(7,  'Kia',           'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Kia-logo.svg/512px-Kia-logo.svg.png', 'South Korea', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80', 'Movement that Inspires'),
(8,  'Volkswagen',    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/512px-Volkswagen_logo_2019.svg.png', 'Germany', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&q=80', 'Das Auto'),
(9,  'BMW',           'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/512px-BMW.svg.png', 'Germany', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=80', 'Sheer Driving Pleasure'),
(10, 'Mercedes-Benz', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/512px-Mercedes-Logo.svg.png', 'Germany', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80', 'The Best or Nothing');

-- ============================================================
-- CAR MODELS (Hotlinkable High-Res Unsplash Car Photos)
-- ============================================================
INSERT INTO car_models (id, brand_id, name, body_type, launch_year, thumbnail) VALUES
-- Maruti Suzuki
(1,  1, 'Swift',      'HATCHBACK', 2024, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80'),
(2,  1, 'Baleno',     'HATCHBACK', 2023, 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80'),
(3,  1, 'Brezza',     'SUV',       2023, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80'),
(4,  1, 'Dzire',      'SEDAN',     2024, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80'),

-- Hyundai
(5,  2, 'Creta',      'SUV',       2024, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'),
(6,  2, 'i20',        'HATCHBACK', 2023, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80'),
(7,  2, 'Verna',      'SEDAN',     2023, 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80'),

-- Tata
(8,  3, 'Nexon',      'SUV',       2023, 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80'),
(9,  3, 'Punch',      'SUV',       2023, 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80'),
(10, 3, 'Harrier',    'SUV',       2023, 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800&q=80'),

-- Mahindra
(11, 4, 'Thar',       'SUV',       2023, 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80'),
(12, 4, 'Scorpio N',  'SUV',       2023, 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80'),
(13, 4, 'XUV700',     'SUV',       2023, 'https://images.unsplash.com/photo-1563720223523-0b90a37de2cd?w=800&q=80'),

-- Toyota
(14, 5, 'Fortuner',   'SUV',       2023, 'https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=800&q=80'),
(15, 5, 'Innova Crysta', 'MUV',   2023, 'https://images.unsplash.com/photo-1462396240927-52058a6a84ec?w=800&q=80'),

-- Honda
(16, 6, 'City',       'SEDAN',     2023, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80'),
(17, 6, 'Elevate',    'SUV',       2023, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'),

-- Kia
(18, 7, 'Seltos',     'SUV',       2023, 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80'),
(19, 7, 'Sonet',      'SUV',       2024, 'https://images.unsplash.com/photo-1622498278685-60bab81bbbd7?w=800&q=80'),

-- Volkswagen
(20, 8, 'Virtus',     'SEDAN',     2023, 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80'),
(21, 8, 'Taigun',     'SUV',       2023, 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80'),

-- BMW
(22, 9, '3 Series',   'SEDAN',     2023, 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80'),
(23, 9, 'X5',         'SUV',       2023, 'https://images.unsplash.com/photo-1617469767824-56c2a9a7e4d0?w=800&q=80'),

-- Mercedes-Benz
(24, 10, 'C-Class',   'SEDAN',     2023, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80');

-- ============================================================
-- CAR VARIANTS
-- ============================================================
INSERT INTO car_variants (
  id, model_id, variant_name, fuel_type, transmission, 
  engine_cc, power_bhp, torque_nm, mileage_kmpl, seating_capacity, 
  length_mm, width_mm, height_mm, wheelbase_mm, boot_space_litres, 
  airbags, abs, ebd, ncap_rating, base_price
) VALUES
-- Swift
(1,  1, 'VXi',          'PETROL', 'MANUAL',    1197, 80.4, 111.7, 24.8, 5, 3860, 1735, 1520, 2450, 265, 6, 1, 1, '5 Star', 649000.00),
(2,  1, 'ZXi AMT',      'PETROL', 'AUTOMATIC', 1197, 80.4, 111.7, 25.75, 5, 3860, 1735, 1520, 2450, 265, 6, 1, 1, '5 Star', 849000.00),

-- Baleno
(3,  2, 'Delta',        'PETROL', 'MANUAL',    1197, 88.5, 113.0, 22.35, 5, 3990, 1745, 1500, 2520, 318, 4, 1, 1, '4 Star', 749000.00),
(4,  2, 'Alpha AMT',    'PETROL', 'AUTOMATIC', 1197, 88.5, 113.0, 22.94, 5, 3990, 1745, 1500, 2520, 318, 6, 1, 1, '4 Star', 989000.00),

-- Brezza
(5,  3, 'VXi',          'PETROL', 'MANUAL',    1462, 101.6, 136.8, 17.38, 5, 3995, 1790, 1685, 2500, 328, 2, 1, 1, '4 Star', 929000.00),
(6,  3, 'ZXi AT',       'PETROL', 'AUTOMATIC', 1462, 101.6, 136.8, 19.80, 5, 3995, 1790, 1685, 2500, 328, 6, 1, 1, '4 Star', 1249000.00),

-- Dzire
(7,  4, 'VXi',          'PETROL', 'MANUAL',    1197, 80.4, 111.7, 24.7, 5, 3995, 1735, 1525, 2450, 382, 6, 1, 1, '5 Star', 779000.00),

-- Creta
(8,  5, 'EX',           'PETROL', 'MANUAL',    1497, 113.4, 143.8, 17.4, 5, 4330, 1790, 1635, 2610, 433, 6, 1, 1, '5 Star', 1219000.00),
(9,  5, 'SX (O) Diesel AT', 'DIESEL', 'AUTOMATIC', 1493, 114.7, 250.0, 19.1, 5, 4330, 1790, 1635, 2610, 433, 6, 1, 1, '5 Star', 2015000.00),

-- i20
(10, 6, 'Sportz',       'PETROL', 'MANUAL',    1197, 82.0, 114.0, 16.0, 5, 3995, 1775, 1505, 2570, 311, 6, 1, 1, '3 Star', 838000.00),

-- Verna
(11, 7, 'SX Turbo DCT', 'PETROL', 'AUTOMATIC', 1482, 157.5, 253.0, 20.6, 5, 4535, 1765, 1475, 2670, 528, 6, 1, 1, '5 Star', 1608000.00),

-- Nexon
(12, 8, 'Creative Plus', 'PETROL', 'MANUAL',   1199, 118.3, 170.0, 17.4, 5, 3995, 1804, 1620, 2498, 382, 6, 1, 1, '5 Star', 1170000.00),
(13, 8, 'Fearless Plus S Diesel AMT', 'DIESEL', 'AUTOMATIC', 1497, 113.3, 260.0, 23.2, 5, 3995, 1804, 1620, 2498, 382, 6, 1, 1, '5 Star', 1550000.00),

-- Punch
(14, 9, 'Adventure',    'PETROL', 'MANUAL',    1199, 86.6, 115.0, 20.09, 5, 3827, 1742, 1615, 2445, 366, 2, 1, 1, '5 Star', 700000.00),

-- Harrier
(15, 10, 'Fearless Plus Dark AT', 'DIESEL', 'AUTOMATIC', 1956, 167.6, 350.0, 14.6, 5, 4605, 1922, 1718, 2741, 445, 7, 1, 1, '5 Star', 2644000.00),

-- Thar
(16, 11, 'LX Hard Top Diesel MT', 'DIESEL', 'MANUAL', 2184, 130.0, 300.0, 15.2, 4, 3985, 1820, 1844, 2450, 219, 2, 1, 1, '4 Star', 1500000.00),

-- Scorpio N
(17, 12, 'Z8 L Diesel 4WD AT', 'DIESEL', 'AUTOMATIC', 2184, 172.4, 400.0, 14.0, 7, 4662, 1917, 1857, 2750, 460, 6, 1, 1, '5 Star', 2454000.00),

-- XUV700
(18, 13, 'AX7 L Diesel AT', 'DIESEL', 'AUTOMATIC', 2184, 182.4, 450.0, 16.0, 7, 4695, 1890, 1755, 2750, 450, 7, 1, 1, '5 Star', 2544000.00),

-- Fortuner
(19, 14, '2.8 4x4 AT',   'DIESEL', 'AUTOMATIC', 2755, 201.2, 500.0, 14.2, 7, 4795, 1855, 1835, 2745, 296, 7, 1, 1, '5 Star', 4232000.00),

-- Innova Crysta
(20, 15, 'VX 7 STR',     'DIESEL', 'MANUAL',    2393, 147.5, 343.0, 15.0, 7, 4735, 1830, 1795, 2750, 300, 7, 1, 1, '5 Star', 2384000.00),

-- City
(21, 16, 'ZX CVT',       'PETROL', 'AUTOMATIC', 1498, 119.4, 145.0, 18.4, 5, 4583, 1748, 1489, 2600, 506, 6, 1, 1, '5 Star', 1635000.00),

-- Elevate
(22, 17, 'ZX CVT',       'PETROL', 'AUTOMATIC', 1498, 119.4, 145.0, 16.9, 5, 4312, 1790, 1650, 2650, 458, 6, 1, 1, '5 Star', 1620000.00),

-- Seltos
(23, 18, 'GTX Plus Turbo DCT', 'PETROL', 'AUTOMATIC', 1482, 157.8, 253.0, 17.7, 5, 4365, 1800, 1620, 2610, 433, 6, 1, 1, '5 Star', 1940000.00),

-- Sonet
(24, 19, 'HTX Diesel AT', 'DIESEL', 'AUTOMATIC', 1493, 114.4, 250.0, 19.0, 5, 3995, 1790, 1642, 2500, 385, 6, 1, 1, '3 Star', 1300000.00),

-- Virtus
(25, 20, 'GT Plus Edge DCT', 'PETROL', 'AUTOMATIC', 1498, 147.5, 250.0, 19.6, 5, 4561, 1752, 1507, 2651, 521, 6, 1, 1, '5 Star', 1940000.00),

-- Taigun
(26, 21, 'Topline 1.0 TSI AT', 'PETROL', 'AUTOMATIC', 999, 113.9, 178.0, 18.15, 5, 4221, 1760, 1612, 2651, 385, 6, 1, 1, '5 Star', 1735000.00),

-- BMW 3 Series
(27, 22, '330Li M Sport', 'PETROL', 'AUTOMATIC', 1998, 254.7, 400.0, 15.39, 5, 4819, 1827, 1441, 2961, 480, 6, 1, 1, '5 Star', 6060000.00),

-- BMW X5
(28, 23, 'xDrive30d M Sport', 'DIESEL', 'AUTOMATIC', 2993, 281.6, 650.0, 12.0, 5, 4922, 2004, 1745, 2975, 650, 6, 1, 1, '5 Star', 9700000.00),

-- Mercedes-Benz C-Class
(29, 24, 'C 220d',        'DIESEL', 'AUTOMATIC', 1993, 197.3, 440.0, 23.0, 5, 4751, 1820, 1437, 2865, 455, 7, 1, 1, '5 Star', 6280000.00);

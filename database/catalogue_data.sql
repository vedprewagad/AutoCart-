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
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES (1,'Honda','/images/honda.png','Japan','2026-08-07 14:12:27',NULL,NULL),(2,'Mahindra','/images/mahindra.png','India','2026-08-07 14:12:27',NULL,NULL),(3,'MG Motor','/images/mg motor.png','UK/China','2026-08-07 14:12:27',NULL,NULL),(4,'Toyota','/images/toyota.png','Japan','2026-08-07 14:12:27',NULL,NULL),(5,'Volkswagen','/images/volkswagen.png','Germany','2026-08-07 14:12:27',NULL,NULL);
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `car_models`
--

LOCK TABLES `car_models` WRITE;
/*!40000 ALTER TABLE `car_models` DISABLE KEYS */;
INSERT INTO `car_models` VALUES (1,1,'Amaze','SEDAN',2024,'2026-08-07 14:14:12',NULL),(2,2,'Scorpio N','SUV',2024,'2026-08-07 14:14:12',NULL),(3,3,'Hector','SUV',2024,'2026-08-07 14:14:13',NULL),(4,4,'Urban Cruiser Taisor','SUV',2024,'2026-08-07 14:14:14',NULL),(5,5,'Virtus','SEDAN',2024,'2026-08-07 14:14:15',NULL);
/*!40000 ALTER TABLE `car_models` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `car_variants`
--

LOCK TABLES `car_variants` WRITE;
/*!40000 ALTER TABLE `car_variants` DISABLE KEYS */;
INSERT INTO `car_variants` VALUES (1,1,'Amaze V','PETROL','MANUAL',1199,88.5,110,18.65,5,3995,1750,1500,2500,350,6,1,1,'5 Star',765000.00,'2026-08-07 14:14:12'),(3,1,'Amaze V CVT','PETROL','AUTOMATIC',1199,88.5,110,19.46,5,3995,1750,1500,2500,350,6,1,1,'5 Star',870000.00,'2026-08-07 14:14:12'),(4,1,'Amaze ZX','PETROL','MANUAL',1199,88.5,110,18.65,5,3995,1750,1500,2500,350,6,1,1,'5 Star',939000.00,'2026-08-07 14:14:12'),(5,1,'Amaze VX CVT','PETROL','AUTOMATIC',1199,88.5,110,19.46,5,3995,1750,1500,2500,350,6,1,1,'5 Star',940000.00,'2026-08-07 14:14:12'),(6,2,'Scorpio N Z2 Petrol MT','PETROL','MANUAL',1997,200,370,14.5,7,3995,1750,1500,2500,350,6,1,1,'5 Star',1369000.00,'2026-08-07 14:14:13'),(7,2,'Scorpio N Z2 Diesel MT','DIESEL','MANUAL',2198,172.4,400,15.2,7,3995,1750,1500,2500,350,6,1,1,'5 Star',1419000.00,'2026-08-07 14:14:13'),(8,2,'Scorpio N Z4 Petrol MT','PETROL','MANUAL',1997,200,370,14.5,7,3995,1750,1500,2500,350,6,1,1,'5 Star',1557000.00,'2026-08-07 14:14:13'),(9,2,'Scorpio N Z4 Diesel MT','DIESEL','MANUAL',2198,172.4,400,15.2,7,3995,1750,1500,2500,350,6,1,1,'5 Star',1612000.00,'2026-08-07 14:14:13'),(10,2,'Scorpio N Z4 Petrol AT','PETROL','AUTOMATIC',1997,200,370,14.5,7,3995,1750,1500,2500,350,6,1,1,'5 Star',1716000.00,'2026-08-07 14:14:13'),(11,3,'MG Hector Style','PETROL','MANUAL',1451,141.1,250,13.79,5,3995,1750,1500,2500,350,6,1,1,'5 Star',1199000.00,'2026-08-07 14:14:13'),(12,3,'MG Hector Select Pro','PETROL','MANUAL',1451,141.1,250,13.79,5,3995,1750,1500,2500,350,6,1,1,'5 Star',1429000.00,'2026-08-07 14:14:13'),(13,3,'MG Hector Smart Pro','PETROL','MANUAL',1451,141.1,250,13.79,5,3995,1750,1500,2500,350,6,1,1,'5 Star',1529000.00,'2026-08-07 14:14:13'),(14,3,'MG Hector Smart Pro CVT','PETROL','AUTOMATIC',1451,141.1,250,13.79,5,3995,1750,1500,2500,350,6,1,1,'5 Star',1659000.00,'2026-08-07 14:14:13'),(15,3,'MG Hector Sharp Pro','PETROL','MANUAL',1451,141.1,250,13.79,5,3995,1750,1500,2500,350,6,1,1,'5 Star',1699000.00,'2026-08-07 14:14:13'),(16,4,'Taisor E','PETROL','MANUAL',1197,88.5,113,21.7,5,3995,1750,1500,2500,350,6,1,1,'5 Star',743000.00,'2026-08-07 14:14:14'),(17,4,'Taisor S','PETROL','MANUAL',1197,88.5,113,21.7,5,3995,1750,1500,2500,350,6,1,1,'5 Star',833000.00,'2026-08-07 14:14:14'),(18,4,'Taisor E CNG','CNG','MANUAL',1197,76.5,98.5,28.5,5,3995,1750,1500,2500,350,6,1,1,'5 Star',845000.00,'2026-08-07 14:14:14'),(19,4,'Taisor S Plus','PETROL','MANUAL',1197,88.5,113,21.7,5,3995,1750,1500,2500,350,6,1,1,'5 Star',868000.00,'2026-08-07 14:14:14'),(20,4,'Taisor S AMT','PETROL','AUTOMATIC',1197,88.5,113,22.8,5,3995,1750,1500,2500,350,6,1,1,'5 Star',894000.00,'2026-08-07 14:14:14'),(21,5,'Virtus Comfortline','PETROL','MANUAL',999,113.98,178,20.8,5,3995,1750,1500,2500,350,6,1,1,'5 Star',1050000.00,'2026-08-07 14:14:15'),(22,5,'Virtus Highline','PETROL','MANUAL',999,113.98,178,19.4,5,3995,1750,1500,2500,350,6,1,1,'5 Star',1346000.00,'2026-08-07 14:14:15'),(23,5,'Virtus Highline Plus','PETROL','MANUAL',999,113.98,178,19.4,5,3995,1750,1500,2500,350,6,1,1,'5 Star',1386000.00,'2026-08-07 14:14:15'),(24,5,'Virtus GT Line','PETROL','MANUAL',999,113.98,178,19.4,5,3995,1750,1500,2500,350,6,1,1,'5 Star',1410000.00,'2026-08-07 14:14:15'),(25,5,'Virtus Highline AT','PETROL','AUTOMATIC',999,113.98,178,18.12,5,3995,1750,1500,2500,350,6,1,1,'5 Star',1466000.00,'2026-08-07 14:14:15');
/*!40000 ALTER TABLE `car_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `variant_images`
--

LOCK TABLES `variant_images` WRITE;
/*!40000 ALTER TABLE `variant_images` DISABLE KEYS */;
INSERT INTO `variant_images` VALUES (1,1,'/images/models/amaze_interior.png','INTERIOR',NULL),(2,1,'/images/models/amaze_exterior_1.png','EXTERIOR',NULL),(3,1,'/images/models/amaze_exterior_2.png','EXTERIOR',NULL),(7,3,'/images/models/amaze_interior.png','INTERIOR',NULL),(8,3,'/images/models/amaze_exterior_1.png','EXTERIOR',NULL),(9,3,'/images/models/amaze_exterior_2.png','EXTERIOR',NULL),(10,4,'/images/models/amaze_interior.png','INTERIOR',NULL),(11,4,'/images/models/amaze_exterior_1.png','EXTERIOR',NULL),(12,4,'/images/models/amaze_exterior_2.png','EXTERIOR',NULL),(13,5,'/images/models/amaze_interior.png','INTERIOR',NULL),(14,5,'/images/models/amaze_exterior_1.png','EXTERIOR',NULL),(15,5,'/images/models/amaze_exterior_2.png','EXTERIOR',NULL),(16,6,'/images/models/scorpio_n_interior.png','INTERIOR',NULL),(17,6,'/images/models/scorpio_n_exterior_1.png','EXTERIOR',NULL),(18,6,'/images/models/scorpio_n_exterior_2.png','EXTERIOR',NULL),(19,7,'/images/models/scorpio_n_interior.png','INTERIOR',NULL),(20,7,'/images/models/scorpio_n_exterior_1.png','EXTERIOR',NULL),(21,7,'/images/models/scorpio_n_exterior_2.png','EXTERIOR',NULL),(22,8,'/images/models/scorpio_n_interior.png','INTERIOR',NULL),(23,8,'/images/models/scorpio_n_exterior_1.png','EXTERIOR',NULL),(24,8,'/images/models/scorpio_n_exterior_2.png','EXTERIOR',NULL),(25,9,'/images/models/scorpio_n_interior.png','INTERIOR',NULL),(26,9,'/images/models/scorpio_n_exterior_1.png','EXTERIOR',NULL),(27,9,'/images/models/scorpio_n_exterior_2.png','EXTERIOR',NULL),(28,10,'/images/models/scorpio_n_interior.png','INTERIOR',NULL),(29,10,'/images/models/scorpio_n_exterior_1.png','EXTERIOR',NULL),(30,10,'/images/models/scorpio_n_exterior_2.png','EXTERIOR',NULL),(31,11,'/images/models/hector_exterior_1.png','EXTERIOR',NULL),(32,11,'/images/models/hector_exterior_2.png','EXTERIOR',NULL),(33,11,'/images/models/hector_interior.png','INTERIOR',NULL),(34,12,'/images/models/hector_exterior_1.png','EXTERIOR',NULL),(35,12,'/images/models/hector_exterior_2.png','EXTERIOR',NULL),(36,12,'/images/models/hector_interior.png','INTERIOR',NULL),(37,13,'/images/models/hector_exterior_1.png','EXTERIOR',NULL),(38,13,'/images/models/hector_exterior_2.png','EXTERIOR',NULL),(39,13,'/images/models/hector_interior.png','INTERIOR',NULL),(40,14,'/images/models/hector_exterior_1.png','EXTERIOR',NULL),(41,14,'/images/models/hector_exterior_2.png','EXTERIOR',NULL),(42,14,'/images/models/hector_interior.png','INTERIOR',NULL),(43,15,'/images/models/hector_exterior_1.png','EXTERIOR',NULL),(44,15,'/images/models/hector_exterior_2.png','EXTERIOR',NULL),(45,15,'/images/models/hector_interior.png','INTERIOR',NULL),(46,16,'/images/models/urban_cruiser_taisor_interior.png','INTERIOR',NULL),(47,16,'/images/models/urban_cruiser_taisor_exterior_1.png','EXTERIOR',NULL),(48,16,'/images/models/urban_cruiser_taisor_exterior_2.png','EXTERIOR',NULL),(49,17,'/images/models/urban_cruiser_taisor_interior.png','INTERIOR',NULL),(50,17,'/images/models/urban_cruiser_taisor_exterior_1.png','EXTERIOR',NULL),(51,17,'/images/models/urban_cruiser_taisor_exterior_2.png','EXTERIOR',NULL),(52,18,'/images/models/urban_cruiser_taisor_interior.png','INTERIOR',NULL),(53,18,'/images/models/urban_cruiser_taisor_exterior_1.png','EXTERIOR',NULL),(54,18,'/images/models/urban_cruiser_taisor_exterior_2.png','EXTERIOR',NULL),(55,19,'/images/models/urban_cruiser_taisor_interior.png','INTERIOR',NULL),(56,19,'/images/models/urban_cruiser_taisor_exterior_1.png','EXTERIOR',NULL),(57,19,'/images/models/urban_cruiser_taisor_exterior_2.png','EXTERIOR',NULL),(58,20,'/images/models/urban_cruiser_taisor_interior.png','INTERIOR',NULL),(59,20,'/images/models/urban_cruiser_taisor_exterior_1.png','EXTERIOR',NULL),(60,20,'/images/models/urban_cruiser_taisor_exterior_2.png','EXTERIOR',NULL),(61,21,'/images/models/virtus_interior.png','INTERIOR',NULL),(62,21,'/images/models/virtus_exterior_1.png','EXTERIOR',NULL),(63,21,'/images/models/virtus_exterior_2.png','EXTERIOR',NULL),(64,22,'/images/models/virtus_interior.png','INTERIOR',NULL),(65,22,'/images/models/virtus_exterior_1.png','EXTERIOR',NULL),(66,22,'/images/models/virtus_exterior_2.png','EXTERIOR',NULL),(67,23,'/images/models/virtus_interior.png','INTERIOR',NULL),(68,23,'/images/models/virtus_exterior_1.png','EXTERIOR',NULL),(69,23,'/images/models/virtus_exterior_2.png','EXTERIOR',NULL),(70,24,'/images/models/virtus_interior.png','INTERIOR',NULL),(71,24,'/images/models/virtus_exterior_1.png','EXTERIOR',NULL),(72,24,'/images/models/virtus_exterior_2.png','EXTERIOR',NULL),(73,25,'/images/models/virtus_interior.png','INTERIOR',NULL),(74,25,'/images/models/virtus_exterior_1.png','EXTERIOR',NULL),(75,25,'/images/models/virtus_exterior_2.png','EXTERIOR',NULL);
/*!40000 ALTER TABLE `variant_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `variant_colours`
--

LOCK TABLES `variant_colours` WRITE;
/*!40000 ALTER TABLE `variant_colours` DISABLE KEYS */;
INSERT INTO `variant_colours` VALUES (1,1,'Pearl Arctic White','#F5F5F5'),(2,1,'Prime Sizzling Red','#D32F2F'),(3,1,'Midnight Black','#111111'),(4,1,'Luster Blue','#1976D2'),(5,1,'Splendid Silver','#B0BEC5'),(9,3,'Midnight Black','#111111'),(10,3,'Pearl Arctic White','#F5F5F5'),(11,4,'Luster Blue','#1976D2'),(12,4,'Splendid Silver','#B0BEC5'),(13,5,'Prime Sizzling Red','#D32F2F'),(14,5,'Midnight Black','#111111'),(15,6,'Pearl Arctic White','#F5F5F5'),(16,7,'Brave Khaki','#4E342E'),(17,7,'Exuberant Blue','#0D47A1'),(18,7,'Magma Grey','#424242'),(19,8,'Nexa Blue','#1A237E'),(20,8,'Grandeur Grey','#37474F'),(21,8,'Earthen Brown','#5D4037'),(22,9,'Creative Ocean','#006064'),(23,9,'Daytona Grey','#263238'),(24,9,'Flame Red','#C62828');
/*!40000 ALTER TABLE `variant_colours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `bank_partners`
--

LOCK TABLES `bank_partners` WRITE;
/*!40000 ALTER TABLE `bank_partners` DISABLE KEYS */;
INSERT INTO `bank_partners` VALUES (1,'HDFC Bank','https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=200&q=80','auto@hdfcbank.com','2026-08-04 07:13:55'),(2,'ICICI Bank','https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=200&q=80','autoloans@icicibank.com','2026-08-04 07:13:55'),(3,'State Bank of India','https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=200&q=80','carloan@sbi.co.in','2026-08-04 07:13:55'),(4,'Axis Bank','https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=200&q=80','support@axisbank.com','2026-08-04 07:13:55');
/*!40000 ALTER TABLE `bank_partners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `emi_products`
--

LOCK TABLES `emi_products` WRITE;
/*!40000 ALTER TABLE `emi_products` DISABLE KEYS */;
INSERT INTO `emi_products` VALUES (2,1,'HDFC Premium Auto Loan 60M',60,8.9,3000.00,0,300000.00,5000000.00,'2026-12-31'),(3,2,'ICICI SmartDrive Loan 48M',48,8.8,2000.00,0,250000.00,4000000.00,'2026-12-31'),(4,3,'SBI Yono Car Finance 84M',84,8.5,1500.00,0,200000.00,6000000.00,'2026-12-31'),(5,4,'Axis Express Auto Loan 36M',36,9.1,1999.00,0,300000.00,3500000.00,'2026-12-31');
/*!40000 ALTER TABLE `emi_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `card_offers`
--

LOCK TABLES `card_offers` WRITE;
/*!40000 ALTER TABLE `card_offers` DISABLE KEYS */;
INSERT INTO `card_offers` VALUES (2,2,'CREDIT','Visa',4.5,20000.00,400000.00,'Instant ₹20,000 Discount on ICICI Bank Credit Cards','2026-01-01','2026-12-31'),(4,4,'CREDIT','Visa',10,25000.00,NULL,'Instant Axis Bank Card Offer','2026-08-07','2027-08-07'),(5,2,'CREDIT','Visa',10,25000.00,NULL,'Instant Rs. 20,000 Discount on ICICI Bank Credit Cards','2026-08-07','2027-08-07');
/*!40000 ALTER TABLE `card_offers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-20 12:14:05

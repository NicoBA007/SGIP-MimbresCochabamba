CREATE DATABASE  IF NOT EXISTS `sgip_mimbrescochabamba` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `sgip_mimbrescochabamba`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: sgip_mimbrescochabamba
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre_categoria` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nombre_categoria` (`nombre_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'Muebles y almacenamiento grande','Artículos grandes para el hogar, como mesas, cofres y baúles de almacenaje.'),(2,'Decoración y uso doméstico','Artículos de cestería y decoración funcional para el hogar (paneros, papeleros, cestos grandes).'),(3,'Accesorios pequeños y contenedores pequeños','Artículos pequeños de escritorio, decoración o uso específico (portalápices, canastas pequeñas, camas para mascotas).');
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `nombre_pila_cliente` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellido_paterno_cliente` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellido_materno_cliente` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono_whatsapp` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `telefono_whatsapp` (`telefono_whatsapp`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'Juan','Perez',NULL,'70711111',NULL,'2025-10-24 00:45:55'),(3,'Cliente','Mostrador',NULL,'00000000',NULL,'2025-10-24 00:45:55'),(4,'Esteban','Quito','Quispe','12345678','EstebanQuitoQuispe@gmail.com','2025-10-24 19:23:37'),(5,'Nancy','Campero','Burgoa','78978978','nancycampero64@gmail.com','2025-10-25 17:08:00'),(6,'Jhosiro','Tapia','Mbappe','45645645','Tapiajunior@gmail.com','2025-10-26 20:58:10');
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compra`
--

DROP TABLE IF EXISTS `compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compra` (
  `id_compra` int NOT NULL AUTO_INCREMENT,
  `fecha_compra` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `monto_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `id_proveedor` int NOT NULL,
  `id_usuario_reg` int NOT NULL,
  PRIMARY KEY (`id_compra`),
  KEY `id_proveedor` (`id_proveedor`),
  KEY `id_usuario_reg` (`id_usuario_reg`),
  CONSTRAINT `compra_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`),
  CONSTRAINT `compra_ibfk_2` FOREIGN KEY (`id_usuario_reg`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `compra_chk_1` CHECK ((`monto_total` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compra`
--

LOCK TABLES `compra` WRITE;
/*!40000 ALTER TABLE `compra` DISABLE KEYS */;
INSERT INTO `compra` VALUES (1,'2025-10-25 02:53:09',0.00,1,5),(2,'2025-10-25 02:55:41',360.00,1,5);
/*!40000 ALTER TABLE `compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_compra`
--

DROP TABLE IF EXISTS `detalle_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_compra` (
  `id_detalle_compra` int NOT NULL AUTO_INCREMENT,
  `id_compra` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad_comprada` int NOT NULL,
  `costo_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle_compra`),
  KEY `id_compra` (`id_compra`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `detalle_compra_ibfk_1` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`),
  CONSTRAINT `detalle_compra_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `detalle_compra_chk_1` CHECK ((`cantidad_comprada` > 0)),
  CONSTRAINT `detalle_compra_chk_2` CHECK ((`costo_unitario` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_compra`
--

LOCK TABLES `detalle_compra` WRITE;
/*!40000 ALTER TABLE `detalle_compra` DISABLE KEYS */;
INSERT INTO `detalle_compra` VALUES (1,1,4,1,0.00),(2,2,4,2,180.00);
/*!40000 ALTER TABLE `detalle_compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_pedido_web`
--

DROP TABLE IF EXISTS `detalle_pedido_web`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_pedido_web` (
  `id_detalle_pedido` int NOT NULL AUTO_INCREMENT,
  `id_pedido_web` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad_solicitada` int NOT NULL,
  `precio_unitario_registro` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle_pedido`),
  KEY `id_pedido_web` (`id_pedido_web`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `detalle_pedido_web_ibfk_1` FOREIGN KEY (`id_pedido_web`) REFERENCES `pedido_web` (`id_pedido_web`),
  CONSTRAINT `detalle_pedido_web_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `detalle_pedido_web_chk_1` CHECK ((`cantidad_solicitada` > 0)),
  CONSTRAINT `detalle_pedido_web_chk_2` CHECK ((`precio_unitario_registro` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_pedido_web`
--

LOCK TABLES `detalle_pedido_web` WRITE;
/*!40000 ALTER TABLE `detalle_pedido_web` DISABLE KEYS */;
INSERT INTO `detalle_pedido_web` VALUES (1,1,3,2,60.00),(2,1,4,2,180.00),(3,2,2,1,300.00),(4,2,7,1,140.00),(5,2,6,1,300.00),(6,3,2,1,300.00),(7,3,6,1,300.00),(8,3,5,1,200.00),(9,3,4,1,180.00),(10,4,4,4,180.00),(11,5,3,3,60.00),(12,5,2,1,300.00),(13,5,8,1,120.00),(14,6,3,2,60.00),(15,6,7,1,140.00),(16,6,6,1,300.00);
/*!40000 ALTER TABLE `detalle_pedido_web` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_venta`
--

DROP TABLE IF EXISTS `detalle_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_venta` (
  `id_detalle_venta` int NOT NULL AUTO_INCREMENT,
  `id_venta` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad_vendida` int NOT NULL,
  `precio_venta_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle_venta`),
  KEY `id_venta` (`id_venta`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`),
  CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `detalle_venta_chk_1` CHECK ((`cantidad_vendida` > 0)),
  CONSTRAINT `detalle_venta_chk_2` CHECK ((`precio_venta_unitario` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_venta`
--

LOCK TABLES `detalle_venta` WRITE;
/*!40000 ALTER TABLE `detalle_venta` DISABLE KEYS */;
INSERT INTO `detalle_venta` VALUES (1,1,4,1,180.00),(2,2,4,3,180.00),(3,3,2,3,300.00);
/*!40000 ALTER TABLE `detalle_venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimiento_inventario`
--

DROP TABLE IF EXISTS `movimiento_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_inventario` (
  `id_movimiento` int NOT NULL AUTO_INCREMENT,
  `fecha_movimiento` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo_movimiento` enum('ENTRADA','SALIDA','AJUSTE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int NOT NULL,
  `referencia_doc` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_producto` int NOT NULL,
  `id_usuario_reg` int NOT NULL,
  PRIMARY KEY (`id_movimiento`),
  KEY `id_producto` (`id_producto`),
  KEY `id_usuario_reg` (`id_usuario_reg`),
  CONSTRAINT `movimiento_inventario_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `movimiento_inventario_ibfk_2` FOREIGN KEY (`id_usuario_reg`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_inventario`
--

LOCK TABLES `movimiento_inventario` WRITE;
/*!40000 ALTER TABLE `movimiento_inventario` DISABLE KEYS */;
INSERT INTO `movimiento_inventario` VALUES (1,'2025-10-24 00:59:15','SALIDA',1,'Venta #1',4,6),(2,'2025-10-25 02:53:10','ENTRADA',1,'Compra #1',4,5),(3,'2025-10-25 02:55:41','ENTRADA',2,'Compra #2',4,5),(4,'2025-10-25 17:23:01','SALIDA',3,'Venta #2',4,5),(5,'2025-10-25 19:59:26','ENTRADA',10,'Stock inicial producto #9',9,5),(6,'2025-10-26 20:58:49','SALIDA',3,'Venta #3',2,5);
/*!40000 ALTER TABLE `movimiento_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido_web`
--

DROP TABLE IF EXISTS `pedido_web`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido_web` (
  `id_pedido_web` int NOT NULL AUTO_INCREMENT,
  `fecha_pedido` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `monto_estimado` decimal(10,2) NOT NULL,
  `telefono_whatsapp` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('INICIADO','CONCRETADO','CANCELADO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INICIADO',
  PRIMARY KEY (`id_pedido_web`),
  CONSTRAINT `pedido_web_chk_1` CHECK ((`monto_estimado` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido_web`
--

LOCK TABLES `pedido_web` WRITE;
/*!40000 ALTER TABLE `pedido_web` DISABLE KEYS */;
INSERT INTO `pedido_web` VALUES (1,'2025-10-24 00:07:15',480.00,'63418018','CONCRETADO'),(2,'2025-10-24 00:17:54',740.00,'63418018','CONCRETADO'),(3,'2025-10-24 00:22:56',980.00,'63418018','CANCELADO'),(4,'2025-10-24 12:47:26',720.00,'63418018','CONCRETADO'),(5,'2025-10-25 21:41:07',600.00,'63418018','INICIADO'),(6,'2025-10-26 21:01:59',560.00,'63418018','INICIADO');
/*!40000 ALTER TABLE `pedido_web` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `nombre_producto` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `stock_actual` int NOT NULL DEFAULT '0',
  `precio_unitario` decimal(10,2) NOT NULL,
  `dimensiones` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `material` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unidad_medida` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO','AGOTADO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVO',
  `id_categoria` int NOT NULL,
  `url_imagen` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `id_categoria` (`id_categoria`),
  CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`),
  CONSTRAINT `producto_chk_1` CHECK ((`precio_unitario` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,'Triciclo de mimbre','Sirve para flores, chocolates, botellas, etc. Objeto decorativo y contenedor.',10,70.00,NULL,'Mimbre','Marrón Oscuro','Unidad','ACTIVO',3,'/products/img74-removebg-preview.png'),(2,'Cama para gato','Cama colgante para mascotas.',3,300.00,NULL,'Mimbre','Natural Claro','Unidad','ACTIVO',3,'/products/product-1761272586631.png'),(3,'Cilindro de mimbre','Porta lápices y porta peines. Contenedor pequeño de escritorio o baño.',20,60.00,NULL,'Mimbre','Marrón','Unidad','ACTIVO',3,'/products/img205-removebg-preview.png'),(4,'Mesita pequeña','Mesa de apoyo o revistero. Sirve para teléfono, plantas o botellones de agua.',7,180.00,NULL,'Mimbre y Caña Bambú','Bicolor','Unidad','ACTIVO',1,'/products/img279-removebg-preview.png'),(5,'Cofre de tacuara y mimbre','Baúl de almacenaje, generalmente para canastones.',7,200.00,NULL,'Tacuara y Mimbre','Marrón','Unidad','ACTIVO',1,'/products/img245-removebg-preview.png'),(6,'Cisne de mimbre','Objeto decorativo. Sirve de papelero o para flores.',6,300.00,NULL,'Mimbre','Marrón Oscuro','Unidad','ACTIVO',2,'/products/img56-removebg-preview.png'),(7,'Tachos de tacuara','Cesto con tapa. Para ropa, paraguas y flores. Cesto grande de almacenaje.',15,140.00,NULL,'Tacuara','Marrón','Unidad','ACTIVO',2,'/products/img128-removebg-preview.png'),(8,'Panero de mimbre','Cesta ovalada. Sirve para pan y fruta.',25,120.00,NULL,'Mimbre','Marrón Oscuro','Unidad','ACTIVO',2,'/products/img221-removebg-preview.png'),(9,'asdaASDJAFASF','sdfsdfdsdf',2,80.00,'','Mimbre','Natural Claro','Unidad','INACTIVO',3,'/products/product-1761517050412.png');
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `nombre_proveedor` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono_contacto` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
INSERT INTO `proveedor` VALUES (1,'Provedor','98765432','Quillacollo esquina noreste');
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre_pila` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_paterno` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_materno` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('ADMIN','VENDEDOR') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (5,'Dixie','Arze','Terceros','dixie.a','$2b$10$5a1m0elWav9t3CT9OrTlme8YsbgihyvtUjT/yTWio9PajeESMZxrq','ADMIN','2025-10-22 21:55:34'),(6,'Nicolas','Barrancos','Arze','nicolas.b','$2b$10$RXubaAVi6vR6YA6yT6oEju8CMFPrN39ziI/4zuAod5GpYWvDGBUWi','VENDEDOR','2025-10-22 21:55:40');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venta`
--

DROP TABLE IF EXISTS `venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venta` (
  `id_venta` int NOT NULL AUTO_INCREMENT,
  `fecha_venta` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `monto_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `descuento_aplicado` decimal(10,2) DEFAULT '0.00',
  `id_cliente` int NOT NULL,
  `id_usuario_reg` int NOT NULL,
  PRIMARY KEY (`id_venta`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_usuario_reg` (`id_usuario_reg`),
  CONSTRAINT `venta_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  CONSTRAINT `venta_ibfk_2` FOREIGN KEY (`id_usuario_reg`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `venta_chk_1` CHECK ((`monto_total` >= 0)),
  CONSTRAINT `venta_chk_2` CHECK ((`descuento_aplicado` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta`
--

LOCK TABLES `venta` WRITE;
/*!40000 ALTER TABLE `venta` DISABLE KEYS */;
INSERT INTO `venta` VALUES (1,'2025-10-24 00:59:15',180.00,0.00,3,6),(2,'2025-10-25 17:23:01',540.00,0.00,3,5),(3,'2025-10-26 20:58:49',900.00,0.00,6,5);
/*!40000 ALTER TABLE `venta` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-26 19:10:51

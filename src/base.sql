

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Дамп структуры базы данных prods
CREATE DATABASE IF NOT EXISTS `prods` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `prods`;

-- Дамп структуры для таблица prods.catalog_categories
CREATE TABLE IF NOT EXISTS `catalog_categories` (
  `cat_id` bigint NOT NULL,
  `name` varchar(2048) NOT NULL,
  PRIMARY KEY (`cat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Экспортируемые данные не выделены.

-- Дамп структуры для таблица prods.prods
CREATE TABLE IF NOT EXISTS `prods` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cz_id` bigint DEFAULT NULL COMMENT 'ID честного знака',
  `product_name` varchar(1024) DEFAULT NULL,
  `category` char(50) DEFAULT NULL,
  `exp_date` date DEFAULT NULL COMMENT 'Дата окончания срока годности',
  `is_trashed` bit(1) NOT NULL COMMENT 'Выброшен в мусор',
  `added_to_base_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `image_url` varchar(2048) DEFAULT NULL,
  `producer` varchar(1048) DEFAULT NULL COMMENT 'Производитель',
  `cis` varchar(1048) DEFAULT NULL,
  `code` varchar(1048) DEFAULT NULL,
  `gtin` varchar(1048) DEFAULT NULL,
  `sgtin` varchar(1048) DEFAULT NULL,
  `catalog_good_id` bigint DEFAULT NULL,
  `catalog_brand_id` bigint DEFAULT NULL,
  `is_individual` bit(1) NOT NULL,
  `ChesZnakDump` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=164 DEFAULT CHARSET=utf8mb3;

-- Экспортируемые данные не выделены.

-- Дамп структуры для таблица prods.prods_by_caterories
CREATE TABLE IF NOT EXISTS `prods_by_caterories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `prod` bigint NOT NULL,
  `category` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK__prods` (`prod`),
  KEY `FK__catalog_categories` (`category`),
  CONSTRAINT `FK__catalog_categories` FOREIGN KEY (`category`) REFERENCES `catalog_categories` (`cat_id`),
  CONSTRAINT `FK__prods` FOREIGN KEY (`prod`) REFERENCES `prods` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=214 DEFAULT CHARSET=utf8mb3;

-- Экспортируемые данные не выделены.

-- Дамп структуры для таблица prods.shopping_prods_by_groups
CREATE TABLE IF NOT EXISTS `shopping_prods_by_groups` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `GroupId` int NOT NULL DEFAULT '0',
  `ProdId` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `GroupId_ProdId` (`GroupId`,`ProdId`),
  KEY `FK__shopping_prods_prod` (`ProdId`),
  CONSTRAINT `FK__shopping_prods_group` FOREIGN KEY (`GroupId`) REFERENCES `shopping_prods_group` (`Id`),
  CONSTRAINT `FK__shopping_prods_prod` FOREIGN KEY (`ProdId`) REFERENCES `shopping_prods_prod` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COMMENT='Товары для покупки по категориям. Может быть товар в нескольких категориях';

-- Экспортируемые данные не выделены.

-- Дамп структуры для таблица prods.shopping_prods_group
CREATE TABLE IF NOT EXISTS `shopping_prods_group` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) NOT NULL DEFAULT '0',
  `Image` mediumblob,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COMMENT='Группы товарод для покупок';

-- Экспортируемые данные не выделены.

-- Дамп структуры для таблица prods.shopping_prods_prod
CREATE TABLE IF NOT EXISTS `shopping_prods_prod` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) NOT NULL,
  `Image` mediumtext,
  `AddCountType` INT,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COMMENT='Товары для покупок';

-- Экспортируемые данные не выделены.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

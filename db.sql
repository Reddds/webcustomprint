-- --------------------------------------------------------
-- Хост:                         192.168.88.181
-- Версия сервера:               5.7.36-0ubuntu0.18.04.1 - (Ubuntu)
-- Операционная система:         Linux
-- HeidiSQL Версия:              11.3.0.6295
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Дамп структуры базы данных prods
DROP DATABASE IF EXISTS `prods`;
CREATE DATABASE IF NOT EXISTS `prods` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `prods`;

-- Дамп структуры для таблица prods.catalog_categories
DROP TABLE IF EXISTS `catalog_categories`;
CREATE TABLE IF NOT EXISTS `catalog_categories` (
  `cat_id` bigint(20) NOT NULL DEFAULT '0',
  `name` varchar(2048) NOT NULL,
  PRIMARY KEY (`cat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Экспортируемые данные не выделены.

-- Дамп структуры для таблица prods.prods
DROP TABLE IF EXISTS `prods`;
CREATE TABLE IF NOT EXISTS `prods` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cz_id` bigint(20) DEFAULT NULL COMMENT 'ID честного знака',
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
  `catalog_good_id` bigint(20) DEFAULT NULL,
  `catalog_brand_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Экспортируемые данные не выделены.

-- Дамп структуры для таблица prods.prods_by_caterories
DROP TABLE IF EXISTS `prods_by_caterories`;
CREATE TABLE IF NOT EXISTS `prods_by_caterories` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `prod` bigint(20) NOT NULL,
  `category` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK__prods` (`prod`),
  KEY `FK__catalog_categories` (`category`),
  CONSTRAINT `FK__catalog_categories` FOREIGN KEY (`category`) REFERENCES `catalog_categories` (`cat_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK__prods` FOREIGN KEY (`prod`) REFERENCES `prods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Экспортируемые данные не выделены.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

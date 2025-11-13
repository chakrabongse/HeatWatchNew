-- phpMyAdmin SQL Dump
-- version 4.7.1
-- https://www.phpmyadmin.net/
--
-- Host: sql12.freesqldatabase.com
-- Generation Time: Nov 05, 2025 at 06:10 AM
-- Server version: 5.5.62-0ubuntu0.14.04.1
-- PHP Version: 7.0.33-0ubuntu0.16.04.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sql12805960`
--

-- --------------------------------------------------------

--
-- Table structure for table `temperature_log`
--

CREATE TABLE `temperature_log` (
  `id` int(11) NOT NULL,
  `temperature` decimal(5,2) NOT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `temperature_log`
--

INSERT INTO `temperature_log` (`id`, `temperature`, `recorded_at`) VALUES
(4, '20.00', '2025-11-04 05:01:51'),
(5, '30.00', '2025-11-04 05:01:51'),
(6, '50.00', '2025-11-04 05:12:31'),
(7, '33.00', '2025-11-04 05:20:55'),
(8, '20.00', '2025-11-05 05:05:32'),
(9, '50.00', '2025-11-05 05:05:59');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `temperature_log`
--
ALTER TABLE `temperature_log`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `temperature_log`
--
ALTER TABLE `temperature_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

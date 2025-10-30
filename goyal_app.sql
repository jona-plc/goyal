-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 30, 2025 at 02:29 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `goyal_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcement`
--

CREATE TABLE `announcement` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcement`
--

INSERT INTO `announcement` (`id`, `title`, `description`, `status`, `created_at`) VALUES
(1, 'power supply', 'mawawalan kuryente sa next week', '', '2025-05-31 00:14:21'),
(2, 'dkdk', 'ksjd', '', '2025-05-31 00:28:22'),
(3, 'ddd', 'dd', '', '2025-05-31 00:41:39'),
(4, 'ksjd', 'jdjd', 'active', '2025-05-31 00:58:54'),
(5, 'ss', 'ss', 'active', '2025-05-31 01:43:32');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `beds`
--

CREATE TABLE `beds` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `bed_number` int(11) NOT NULL,
  `status` enum('Available','Occupied','Maintenance') NOT NULL DEFAULT 'Available',
  `bed_position` varchar(10) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `beds`
--

INSERT INTO `beds` (`id`, `room_id`, `bed_number`, `status`, `bed_position`, `updated_at`, `created_at`) VALUES
(121, 1, 1, 'Available', 'upper', '2025-10-30 13:01:10', '2025-10-28 10:07:13'),
(122, 1, 2, 'Occupied', 'down', '2025-10-30 13:05:11', '2025-10-28 10:07:13'),
(123, 1, 3, 'Available', 'upper', '2025-10-29 03:38:34', '2025-10-28 10:07:13'),
(124, 1, 4, 'Available', 'down', '2025-10-29 03:38:34', '2025-10-28 10:07:13'),
(125, 2, 1, 'Available', 'upper', '2025-10-30 13:01:10', '2025-10-28 10:07:13'),
(126, 2, 2, 'Available', 'down', '2025-10-28 15:51:44', '2025-10-28 10:07:13'),
(127, 2, 3, 'Available', 'upper', '2025-10-28 20:54:47', '2025-10-28 10:07:13'),
(128, 2, 4, 'Available', 'down', '2025-10-28 15:51:44', '2025-10-28 10:07:13'),
(129, 3, 1, 'Available', 'upper', '2025-10-30 13:01:10', '2025-10-28 10:07:13'),
(130, 3, 2, 'Available', 'down', '2025-10-28 23:57:01', '2025-10-28 10:07:13'),
(131, 3, 3, 'Available', 'upper', '2025-10-28 23:57:01', '2025-10-28 10:07:13'),
(132, 3, 4, 'Available', 'down', '2025-10-28 23:57:01', '2025-10-28 10:07:13'),
(133, 4, 1, 'Available', 'upper', '2025-10-29 03:18:15', '2025-10-28 10:07:13'),
(134, 4, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(135, 4, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(136, 4, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(137, 5, 1, 'Available', 'upper', '2025-10-29 03:35:11', '2025-10-28 10:07:13'),
(138, 5, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(139, 5, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(140, 5, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(141, 6, 1, 'Available', 'upper', '2025-10-28 23:57:01', '2025-10-28 10:07:13'),
(142, 6, 2, 'Available', 'down', '2025-10-28 22:27:52', '2025-10-28 10:07:13'),
(143, 6, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(144, 6, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(145, 7, 1, 'Available', 'upper', '2025-10-29 03:35:34', '2025-10-28 10:07:13'),
(146, 7, 2, 'Available', 'down', '2025-10-28 15:51:44', '2025-10-28 10:07:13'),
(147, 7, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(148, 7, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(149, 8, 1, 'Available', 'upper', '2025-10-28 15:51:44', '2025-10-28 10:07:13'),
(150, 8, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(151, 8, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(152, 8, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(153, 9, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(154, 9, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(155, 9, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(156, 9, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(157, 10, 1, 'Available', 'upper', '2025-10-28 15:51:44', '2025-10-28 10:07:13'),
(158, 10, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(159, 10, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(160, 10, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(161, 11, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(162, 11, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(163, 11, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(164, 11, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(165, 12, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(166, 12, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(167, 12, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(168, 12, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(169, 13, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(170, 13, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(171, 13, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(172, 13, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(173, 14, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(174, 14, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(175, 14, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(176, 14, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(177, 15, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(178, 15, 2, 'Available', 'down', '2025-10-28 15:51:44', '2025-10-28 10:07:13'),
(179, 15, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(180, 15, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(181, 16, 1, 'Available', 'upper', '2025-10-28 23:57:01', '2025-10-28 10:07:13'),
(182, 16, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(183, 16, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(184, 16, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(185, 17, 1, 'Available', 'upper', '2025-10-29 02:04:51', '2025-10-28 10:07:13'),
(186, 17, 2, 'Available', 'down', '2025-10-28 21:03:46', '2025-10-28 10:07:13'),
(187, 17, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(188, 17, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(189, 18, 1, 'Available', 'upper', '2025-10-28 23:57:01', '2025-10-28 10:07:13'),
(190, 18, 2, 'Available', 'down', '2025-10-28 23:57:01', '2025-10-28 10:07:13'),
(191, 18, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(192, 18, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(193, 19, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(194, 19, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(195, 19, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(196, 19, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(197, 20, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(198, 20, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(199, 20, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(200, 20, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(201, 21, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(202, 21, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(203, 21, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(204, 21, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(205, 22, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(206, 22, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(207, 22, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(208, 22, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(209, 23, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(210, 23, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(211, 23, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(212, 23, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(213, 24, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(214, 24, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(215, 24, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(216, 24, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(217, 25, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(218, 25, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(219, 25, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(220, 25, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(221, 26, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(222, 26, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(223, 26, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(224, 26, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(225, 27, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(226, 27, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(227, 27, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(228, 27, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(229, 28, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(230, 28, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(231, 28, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(232, 28, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(233, 29, 1, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(234, 29, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(235, 29, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(236, 29, 4, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(237, 30, 1, 'Available', 'upper', '2025-10-29 02:09:35', '2025-10-28 10:07:13'),
(238, 30, 2, 'Available', 'down', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(239, 30, 3, 'Available', 'upper', '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(240, 30, 4, 'Available', 'down', '2025-10-28 15:51:44', '2025-10-28 10:07:13');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `expense_date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `issues`
--

CREATE TABLE `issues` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `room_number` varchar(10) DEFAULT NULL,
  `issue_type` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Pending','In Progress','Resolved') DEFAULT 'Pending',
  `date_reported` datetime DEFAULT current_timestamp(),
  `date_resolved` datetime DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `tenant_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `sender_role` enum('tenant','admin') NOT NULL,
  `message` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `sender_role`, `message`, `created_at`) VALUES
(1, 124, 0, 'tenant', 'v', '2025-10-29 12:09:54'),
(2, 0, 124, 'admin', 'h', '2025-10-29 12:10:46'),
(3, 0, 125, 'admin', 'hi', '2025-10-29 12:12:00'),
(4, 0, 124, 'admin', 'huy', '2025-10-29 12:12:07'),
(5, 124, 0, 'tenant', 'JONA', '2025-10-29 12:12:17'),
(6, 0, 124, 'admin', 'ok', '2025-10-29 12:12:24'),
(7, 0, 124, 'admin', 'huy', '2025-10-29 12:14:36'),
(8, 124, 0, 'tenant', 'hi', '2025-10-29 12:15:33'),
(9, 0, 124, 'admin', 'home', '2025-10-29 12:15:40'),
(10, 124, 0, 'tenant', 'ok', '2025-10-29 12:15:48'),
(11, 0, 124, 'admin', 'HOY', '2025-10-29 12:16:33'),
(12, 124, 0, 'tenant', 'HAHAHAHAH', '2025-10-29 12:16:38'),
(13, 0, 124, 'admin', 'BOANG', '2025-10-29 12:16:44'),
(14, 124, 0, 'tenant', 'OK', '2025-10-29 12:16:49'),
(15, 0, 124, 'admin', 'baby', '2025-10-29 12:20:43'),
(16, 124, 0, 'tenant', 'yes baby', '2025-10-29 12:20:57'),
(17, 0, 124, 'admin', 'baby', '2025-10-29 12:54:33'),
(18, 124, 0, 'tenant', 'yes baby', '2025-10-29 12:54:39'),
(19, 124, 0, 'tenant', 'hahaha', '2025-10-29 12:54:45'),
(20, 0, 124, 'admin', 'boang', '2025-10-29 12:54:49'),
(21, 0, 124, 'admin', 'hahahhhdhjjdjjdd', '2025-10-29 13:02:09'),
(22, 124, 0, 'tenant', 'dhd', '2025-10-29 13:07:10'),
(23, 0, 124, 'admin', 'hhhdhhdhd', '2025-10-29 13:07:15'),
(24, 0, 124, 'admin', 'ha', '2025-10-29 13:07:21'),
(25, 124, 0, 'tenant', 'hakdog', '2025-10-29 13:07:28'),
(26, 0, 124, 'admin', 'jkfdskfkkjkjkjkdfddfjdjdfjfdjdfdf', '2025-10-29 13:14:53'),
(27, 124, 0, 'tenant', 'ok', '2025-10-29 13:14:57'),
(28, 124, 0, 'tenant', 'ddddddd', '2025-10-29 13:25:05'),
(29, 0, 124, 'admin', 'ddddd', '2025-10-29 13:25:08'),
(30, 124, 0, 'tenant', 'ddd', '2025-10-29 13:25:12'),
(31, 0, 124, 'admin', 'ddddd', '2025-10-29 13:25:30'),
(32, 124, 0, 'tenant', 'dddd', '2025-10-29 13:25:33'),
(33, 0, 124, 'admin', 'hhhhh', '2025-10-29 13:38:02'),
(34, 0, 124, 'admin', 'ccc', '2025-10-29 13:38:41'),
(35, 0, 124, 'admin', 'xx', '2025-10-29 13:39:14'),
(36, 0, 124, 'admin', 'ggg', '2025-10-29 13:42:11'),
(37, 0, 124, 'admin', 'rr', '2025-10-29 13:42:11'),
(38, 0, 124, 'admin', 'xx', '2025-10-29 13:43:28'),
(39, 124, 0, 'tenant', 'xx', '2025-10-29 13:43:31'),
(40, 124, 0, 'tenant', 'yes baby', '2025-10-29 13:46:37'),
(41, 124, 0, 'tenant', 'kamusta', '2025-10-29 13:46:44'),
(42, 0, 124, 'admin', 'okay lang', '2025-10-29 13:46:55'),
(43, 124, 0, 'tenant', 'ha', '2025-10-29 13:51:06'),
(44, 124, 0, 'tenant', 'okay', '2025-10-29 13:51:13'),
(45, 0, 124, 'admin', 'baby', '2025-10-29 13:51:20'),
(46, 0, 124, 'admin', 'sdhaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaahueeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeewr', '2025-10-29 13:51:38'),
(47, 124, 0, 'tenant', 'jkookskskkxoxododosososoososososposososoosos', '2025-10-29 13:52:51'),
(48, 0, 124, 'admin', 'ncccccccccccccjerrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrfffffffffffffffffffffffffffffffffffffskllllllllllllllllll', '2025-10-29 13:53:07'),
(49, 124, 0, 'tenant', 'kalxociakxooxlxlxldlnanakalla ksloxocoosjwkwoowowowpwppwowlalkaksnnxnxncnbwkwkwopwpwpwppwocoic', '2025-10-29 13:53:58'),
(50, 0, 124, 'admin', 'dfffffffffffffffffffssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssrettttttttttttttttttttttt', '2025-10-29 13:54:54'),
(51, 124, 0, 'tenant', 'Text message examples include casual greetings like \"Hey! What are you up to?\", professional appointment reminders (e.g., \"Your interview with [Business Name] is scheduled for [Date] at [Time]\"), and sales promotions like \"Hi [Customer Name], thanks for signing up for exclusive promotional texts! To welcome you, here\'s a code for [DISCOUNT AMOUNT]% off your next purchase\". These examples can be categorized by purpose, such as social, professional, or business-related.', '2025-10-29 13:57:45'),
(52, 0, 124, 'admin', 'Text message examples include casual greetings like \"Hey! What are you up to?\", professional appointment reminders (e.g., \"Your interview with [Business Name] is scheduled for [Date] at [Time]\"), and sales promotions like \"Hi [Customer Name], thanks for signing up for exclusive promotional texts! To welcome you, here\'s a code for [DISCOUNT AMOUNT]% off your next purchase\". These examples can be categorized by purpose, such as social, professional, or business-related.', '2025-10-29 13:57:57'),
(53, 124, 0, 'tenant', 'ha okay', '2025-10-29 14:00:28'),
(54, 0, 124, 'admin', 'ok', '2025-10-29 14:00:36'),
(55, 124, 0, 'tenant', 'Text message examples include casual greetings like \"Hey! What are you up to?\", professional appointment reminders (e.g., \"Your interview with [Business Name] is scheduled for [Date] at [Time]\"), and sales promotions like \"Hi [Customer Name], thanks for signing up for exclusive promotional texts! To welcome you, here\'s a code for [DISCOUNT AMOUNT]% off your next purchase\". These examples can be categorized by purpose, such as social, professional, or business-related.', '2025-10-29 14:00:50'),
(56, 0, 124, 'admin', 'Text message examples include casual greetings like \"Hey! What are you up to?\", professional appointment reminders (e.g., \"Your interview with [Business Name] is scheduled for [Date] at [Time]\"), and sales promotions like \"Hi [Customer Name], thanks for signing up for exclusive promotional texts! To welcome you, here\'s a code for [DISCOUNT AMOUNT]% off your next purchase\". These examples can be categorized by purpose, such as social, professional, or business-related.', '2025-10-29 14:01:01'),
(57, 124, 0, 'tenant', 'Text message examples include casual greetings like \"Hey! What are you up to?\", professional appointment reminders (e.g., \"Your interview with [Business Name] is scheduled for [Date] at [Time]\"), and sales promotions like \"Hi [Customer Name], thanks for signing up for exclusive promotional texts! To welcome you, here\'s a code for [DISCOUNT AMOUNT]% off your next purchase\". These examples can be categorized by purpose, such as social, professional, or business-related.', '2025-10-29 14:03:04'),
(58, 124, 0, 'tenant', 'ha', '2025-10-29 14:04:01'),
(59, 124, 0, 'tenant', 'japxhs', '2025-10-29 14:04:05'),
(60, 0, 124, 'admin', 'ha', '2025-10-29 14:04:39'),
(61, 0, 124, 'admin', 'Just because you don\'t get a response immediately after sending a sweet text, try not to think the worst. Sometimes folks are just busy or maybe looking up articles like this to figure out the sweetest way to respond!', '2025-10-29 14:05:39'),
(62, 124, 0, 'tenant', 'okay', '2025-10-29 14:05:57'),
(63, 124, 0, 'tenant', 'hi baby', '2025-10-29 14:53:47'),
(64, 0, 124, 'admin', 'hi\\', '2025-10-29 18:48:44'),
(65, 124, 0, 'tenant', 'hi', '2025-10-29 20:43:45'),
(66, 0, 124, 'admin', 'ha', '2025-10-29 20:43:51'),
(67, 124, 0, 'tenant', 'ha', '2025-10-29 20:44:00'),
(68, 0, 124, 'admin', 'j', '2025-10-29 20:44:07'),
(69, 124, 0, 'tenant', 'ha', '2025-10-29 20:47:18'),
(70, 0, 124, 'admin', 'ha', '2025-10-29 20:47:25'),
(71, 124, 0, 'tenant', 'ha', '2025-10-29 20:48:06'),
(72, 0, 124, 'admin', 'ok', '2025-10-29 20:48:16'),
(73, 0, 124, 'admin', 'gj', '2025-10-29 20:52:59'),
(74, 0, 124, 'admin', 'jj', '2025-10-29 20:54:48'),
(75, 124, 0, 'tenant', 'bi', '2025-10-29 20:54:53'),
(76, 124, 0, 'tenant', 'hi', '2025-10-29 20:59:39'),
(77, 0, 124, 'admin', 'ha', '2025-10-29 20:59:50'),
(78, 124, 0, 'tenant', 'okay', '2025-10-29 20:59:54'),
(79, 0, 124, 'admin', 'hehe', '2025-10-29 21:00:00'),
(80, 124, 0, 'tenant', 'ha', '2025-10-29 21:01:17'),
(81, 0, 124, 'admin', 'ok', '2025-10-29 21:01:22'),
(82, 124, 0, 'tenant', 'goodevening', '2025-10-29 21:25:48'),
(83, 0, 124, 'admin', 'ha', '2025-10-29 21:34:56'),
(84, 124, 0, 'tenant', 'hi', '2025-10-29 21:49:39'),
(85, 0, 124, 'admin', 'hi', '2025-10-29 21:49:46'),
(86, 0, 124, 'admin', 'hi baby', '2025-10-29 21:55:45'),
(87, 124, 0, 'tenant', 'hi', '2025-10-29 21:55:49'),
(88, 124, 0, 'tenant', 'ganda', '2025-10-29 21:55:52'),
(89, 124, 0, 'tenant', 'f', '2025-10-29 22:48:01'),
(90, 0, 124, 'admin', 'hi', '2025-10-29 23:21:25'),
(91, 0, 124, 'admin', 'baby', '2025-10-29 23:22:19'),
(92, 124, 0, 'tenant', 'yes', '2025-10-29 23:22:24');

-- --------------------------------------------------------

--
-- Table structure for table `move_out_requests`
--

CREATE TABLE `move_out_requests` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `room_number` varchar(10) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `date_requested` datetime DEFAULT current_timestamp(),
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `reference_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `tenant_id`, `type`, `reference_id`, `message`, `is_read`, `created_at`) VALUES
(1, 34, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:24'),
(2, 41, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:24'),
(3, 36, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:24'),
(4, 32, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:24'),
(5, 33, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:24'),
(6, 37, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:24'),
(7, 39, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:24'),
(8, 19, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:24'),
(9, 40, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:24'),
(10, 35, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:24'),
(11, 38, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:24'),
(16, 34, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:44'),
(17, 41, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:44'),
(18, 36, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:44'),
(19, 32, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:44'),
(20, 33, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:44'),
(21, 37, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:44'),
(22, 39, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:44'),
(23, 19, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:44'),
(24, 40, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:44'),
(25, 35, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:44'),
(26, 38, 'announcement', 1, 'test test', 0, '2025-10-21 02:22:44');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` datetime NOT NULL DEFAULT current_timestamp(),
  `status` varchar(20) NOT NULL DEFAULT 'paid',
  `payment_method` varchar(100) DEFAULT NULL,
  `xendit_invoice_id` varchar(100) DEFAULT NULL,
  `transaction_ref_url` varchar(255) DEFAULT NULL,
  `coverage_period` varchar(50) DEFAULT NULL,
  `tenant_name` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `tenant_id`, `amount`, `payment_date`, `status`, `payment_method`, `xendit_invoice_id`, `transaction_ref_url`, `coverage_period`, `tenant_name`) VALUES
(427, 127, 1500.00, '2025-10-30 13:08:27', 'pending', 'GCASH', '6902f2cc08ee640873072775', 'https://checkout-staging.xendit.co/web/6902f2cc08ee640873072775', '2025-10', 'Jona Lagutin'),
(428, 127, 1500.00, '2025-10-30 13:09:33', 'unpaid', NULL, NULL, NULL, '2025-11', 'Jona Lagutin'),
(429, 127, 1500.00, '2025-10-30 13:09:39', 'pending', 'GCASH', '6902f3148a9cf659daaf1ec3', 'https://checkout-staging.xendit.co/web/6902f3148a9cf659daaf1ec3', '2025-10', 'Jona Lagutin'),
(430, 127, 1500.00, '2025-10-30 13:12:16', 'unpaid', NULL, NULL, NULL, '2025-12', 'Jona Lagutin'),
(431, 127, 1500.00, '2025-10-30 13:12:18', 'unpaid', NULL, NULL, NULL, '2026-01', 'Jona Lagutin'),
(432, 127, 1500.00, '2025-10-30 13:12:26', 'unpaid', NULL, NULL, NULL, '2026-02', 'Jona Lagutin'),
(433, 127, 1500.00, '2025-10-30 13:12:42', 'paid', 'GCASH', '6902f3bf8a9cf659daaf200a', 'https://checkout-staging.xendit.co/web/6902f3bf8a9cf659daaf200a', '2025-10', 'Jona Lagutin'),
(434, 127, 1500.00, '2025-10-30 13:12:43', 'unpaid', NULL, NULL, NULL, '2026-03', 'Jona Lagutin'),
(435, 127, 1500.00, '2025-10-30 13:13:17', 'unpaid', NULL, NULL, NULL, '2026-04', 'Jona Lagutin');

-- --------------------------------------------------------

--
-- Table structure for table `rent_records`
--

CREATE TABLE `rent_records` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `status` enum('pending','paid','late') DEFAULT 'pending',
  `payment_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `room_number` varchar(10) DEFAULT NULL,
  `type` enum('Single','Double','Double Deck') DEFAULT NULL,
  `status` enum('Available','Occupied','Maintenance') DEFAULT 'Available',
  `capacity` int(11) DEFAULT 4,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `room_number`, `type`, `status`, `capacity`, `updated_at`, `created_at`) VALUES
(1, 'RM01', 'Double Deck', 'Available', 4, '2025-10-29 03:37:53', '2025-10-28 10:07:13'),
(2, 'RM02', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(3, 'RM03', 'Double Deck', 'Available', 4, '2025-10-28 22:35:18', '2025-10-28 10:07:13'),
(4, 'RM04', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(5, 'RM05', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(6, 'RM06', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(7, 'RM07', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(8, 'RM08', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(9, 'RM09', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(10, 'RM10', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(11, 'RM11', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(12, 'RM12', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(13, 'RM13', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(14, 'RM14', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(15, 'RM15', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(16, 'RM16', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(17, 'RM17', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(18, 'RM18', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(19, 'RM19', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(20, 'RM20', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(21, 'RM21', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(22, 'RM22', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(23, 'RM23', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(24, 'RM24', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(25, 'RM25', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(26, 'RM26', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(27, 'RM27', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(28, 'RM28', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(29, 'RM29', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13'),
(30, 'RM30', 'Double Deck', 'Available', 4, '2025-10-28 10:03:43', '2025-10-28 10:07:13');

-- --------------------------------------------------------

--
-- Table structure for table `tenants`
--

CREATE TABLE `tenants` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `address` text DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `year_level` varchar(20) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `start_lease` date DEFAULT NULL,
  `monthly_rent` decimal(10,2) DEFAULT NULL,
  `next_due_date` date DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Active',
  `guardian_first_name` varchar(50) DEFAULT NULL,
  `guardian_middle_name` varchar(50) DEFAULT NULL,
  `guardian_last_name` varchar(50) DEFAULT NULL,
  `guardian_contact_number` varchar(20) DEFAULT NULL,
  `guardian_address` text DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `last_login` datetime DEFAULT NULL,
  `last_active` datetime DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `payment_status` varchar(20) DEFAULT 'Unpaid',
  `avatar_url` varchar(255) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `rents_full_room` tinyint(1) DEFAULT 0,
  `archived` tinyint(1) DEFAULT 0,
  `bed_id` int(11) DEFAULT NULL,
  `room_number` int(11) DEFAULT NULL,
  `bed` varchar(50) DEFAULT NULL,
  `deposit` decimal(10,2) DEFAULT 0.00,
  `is_student` tinyint(1) DEFAULT 0,
  `school_name` varchar(100) DEFAULT NULL,
  `work_place` varchar(100) DEFAULT NULL,
  `work_position` varchar(50) DEFAULT NULL,
  `bed_position` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tenants`
--

INSERT INTO `tenants` (`id`, `first_name`, `middle_name`, `last_name`, `address`, `age`, `year_level`, `contact_number`, `start_lease`, `monthly_rent`, `next_due_date`, `status`, `guardian_first_name`, `guardian_middle_name`, `guardian_last_name`, `guardian_contact_number`, `guardian_address`, `username`, `email`, `password`, `is_active`, `created_at`, `updated_at`, `last_login`, `last_active`, `due_date`, `payment_status`, `avatar_url`, `room_id`, `rents_full_room`, `archived`, `bed_id`, `room_number`, `bed`, `deposit`, `is_student`, `school_name`, `work_place`, `work_position`, `bed_position`) VALUES
(127, 'Jona', 'Palalcio', 'Lagutin', 'zone 8 bulan sorsogon', 22, '4th yr', '09560376568', '2025-10-01', 1500.00, '2025-11-01', 'Active', 'Imelda', 'Palacio', 'Lagutin', '09560376568', 'pantalan magallanes sorsogon', 'jonapalacio', 'jonapalacio06@gmail.com', '$2b$10$Uwxb1ooh5l7r2qIEHK2yvODgPkWqcmYz2LPu0Udv7CedC2lza/ywu', 1, '2025-10-30 05:05:11', '2025-10-30 05:13:17', '2025-10-30 13:12:15', '2025-10-30 13:13:17', NULL, 'Unpaid', NULL, 1, 0, 0, 122, NULL, NULL, 1500.00, 0, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tenant_history`
--

CREATE TABLE `tenant_history` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `payment_date` date NOT NULL,
  `amount_due` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `mode_of_payment` varchar(50) NOT NULL,
  `status` varchar(20) NOT NULL,
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tenant_notifications`
--

CREATE TABLE `tenant_notifications` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `message` varchar(255) NOT NULL,
  `read_status` tinyint(4) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcement`
--
ALTER TABLE `announcement`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `beds`
--
ALTER TABLE `beds`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `issues`
--
ALTER TABLE `issues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tenant_id` (`tenant_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `move_out_requests`
--
ALTER TABLE `move_out_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tenant_id` (`tenant_id`);

--
-- Indexes for table `rent_records`
--
ALTER TABLE `rent_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tenant_id` (`tenant_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `room_number` (`room_number`);

--
-- Indexes for table `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `tenant_history`
--
ALTER TABLE `tenant_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tenant_id` (`tenant_id`);

--
-- Indexes for table `tenant_notifications`
--
ALTER TABLE `tenant_notifications`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcement`
--
ALTER TABLE `announcement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `beds`
--
ALTER TABLE `beds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=241;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `issues`
--
ALTER TABLE `issues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `move_out_requests`
--
ALTER TABLE `move_out_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=436;

--
-- AUTO_INCREMENT for table `rent_records`
--
ALTER TABLE `rent_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `tenants`
--
ALTER TABLE `tenants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=128;

--
-- AUTO_INCREMENT for table `tenant_history`
--
ALTER TABLE `tenant_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tenant_notifications`
--
ALTER TABLE `tenant_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `beds`
--
ALTER TABLE `beds`
  ADD CONSTRAINT `beds_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `issues`
--
ALTER TABLE `issues`
  ADD CONSTRAINT `issues_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rent_records`
--
ALTER TABLE `rent_records`
  ADD CONSTRAINT `rent_records_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tenant_history`
--
ALTER TABLE `tenant_history`
  ADD CONSTRAINT `tenant_history_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 31, 2026 at 09:06 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `work_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`id`, `name`, `createdAt`) VALUES
('3fca899d-efba-4e5c-9f40-f4c9c57ae607', 'IBS Treatment', '2026-05-28 06:43:40'),
('63948f01-ee49-4618-a59e-8d4ada5e52a5', 'Gemma', '2026-05-28 06:46:21'),
('68c034b7-268f-4ce1-b09b-bc311ea0a6d3', 'Hi test', '2026-05-28 11:30:47');

-- --------------------------------------------------------

--
-- Table structure for table `account_members`
--

CREATE TABLE `account_members` (
  `userId` varchar(36) NOT NULL,
  `accountId` varchar(36) NOT NULL,
  `role` enum('admin','manager','member') NOT NULL DEFAULT 'member',
  `joinedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `account_members`
--

INSERT INTO `account_members` (`userId`, `accountId`, `role`, `joinedAt`) VALUES
('11e09772-5691-430f-aa84-f2841c754781', '3fca899d-efba-4e5c-9f40-f4c9c57ae607', 'admin', '2026-05-28 00:50:49'),
('11e09772-5691-430f-aa84-f2841c754781', '68c034b7-268f-4ce1-b09b-bc311ea0a6d3', 'admin', '2026-05-28 11:30:47'),
('1a5fc114-d742-4f9e-9aba-6e563416815b', '63948f01-ee49-4618-a59e-8d4ada5e52a5', 'admin', '2026-05-28 06:46:21');

-- --------------------------------------------------------

--
-- Table structure for table `invitations`
--

CREATE TABLE `invitations` (
  `id` varchar(36) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('admin','manager','member') NOT NULL DEFAULT 'member',
  `token` varchar(255) NOT NULL,
  `invitedBy` varchar(36) DEFAULT NULL,
  `status` enum('pending','accepted','expired') NOT NULL DEFAULT 'pending',
  `expiresAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `accountId` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invitations`
--

INSERT INTO `invitations` (`id`, `email`, `role`, `token`, `invitedBy`, `status`, `expiresAt`, `createdAt`, `accountId`) VALUES
('140a2bae-4edc-4172-a734-603d37f57afd', 'atevar75001@gmail.com', 'member', 'c4315d508cb746616065943c2e0883e41b3fd43e9cd1bedc236f94ada40d31af', '11e09772-5691-430f-aa84-f2841c754781', 'expired', '2026-05-28 09:50:26', '2026-05-28 09:44:12', '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('907c2d4f-a23c-4d86-bca2-a78032eb84ba', 'atevar75001@gmail.com', 'member', '489a0c0911d75e378e627ed2f14572925977d36333e96acedde5d0f3bec35ecc', '11e09772-5691-430f-aa84-f2841c754781', 'accepted', '2026-05-28 10:16:44', '2026-05-28 09:50:26', '3fca899d-efba-4e5c-9f40-f4c9c57ae607');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','in-progress','completed') DEFAULT 'pending',
  `assignedTo` varchar(36) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `completedAt` timestamp NULL DEFAULT NULL COMMENT 'Timestamp when task was completed',
  `timeSpent` int(11) DEFAULT 0 COMMENT 'Time spent in minutes',
  `accountId` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `status`, `assignedTo`, `createdAt`, `updatedAt`, `completedAt`, `timeSpent`, `accountId`) VALUES
('10f84ee4-9f98-4ff5-8277-e5427e93b8d3', '\"Basic IBS Treatment Group\" under Steve\'s First Search Campaign is not showing any conversions', 'Fixing this under google ads goals', 'completed', '11e09772-5691-430f-aa84-f2841c754781', '2026-05-28 22:47:52', '2026-05-29 18:44:51', '2026-05-08 02:22:00', 240, '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('185f4297-dfe8-4953-92eb-b670c184316a', 'Update Meta Titles (SEO Audit)', 'Update meta titles of the important pages of the website\n\nhttps://docs.google.com/document/d/1sTq15PXQCdMJt3Bcgtl61fiBvTwQnAFgYh03nY19NWM/edit?usp=sharing', 'completed', '11e09772-5691-430f-aa84-f2841c754781', '2026-05-29 18:59:06', '2026-05-29 19:48:13', '2026-05-11 11:10:00', 240, '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('32f4dd48-6e9d-4c14-aba3-e8306fdf2e32', 'Meta Descriptions (SEO Audit)', 'Update Meta Description of the Pages in website\n\nhttps://docs.google.com/document/d/1sTq15PXQCdMJt3Bcgtl61fiBvTwQnAFgYh03nY19NWM/edit?usp=sharing', 'completed', '11e09772-5691-430f-aa84-f2841c754781', '2026-05-29 18:59:32', '2026-05-29 19:48:24', '2026-05-12 19:10:00', 240, '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('34f47963-45c4-43bb-95b2-40a5271cbe10', 'Work With Angel', 'Work with angel for checking the Google Tag Manager and Google ads ', 'completed', '11e09772-5691-430f-aa84-f2841c754781', '2026-05-29 18:41:25', '2026-05-29 18:41:57', '2026-05-24 18:41:00', 60, '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('488a52f3-eba7-4173-966d-87ac3ec97f2c', 'Redirections Update (SEO Audit)', 'Add Redirect on the links that has 404 pages.\n\nhttps://docs.google.com/document/d/1sTq15PXQCdMJt3Bcgtl61fiBvTwQnAFgYh03nY19NWM/edit?usp=sharing', 'completed', '11e09772-5691-430f-aa84-f2841c754781', '2026-05-29 19:00:38', '2026-05-29 19:48:34', '2026-05-17 19:06:00', 240, '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('48a0050f-abe0-434a-aaa9-1410cafad168', 'Install GTM to Website From Scratch', 'Install GTM to Website From Scratch and testing the code using Tag Manager Assistant', 'completed', '11e09772-5691-430f-aa84-f2841c754781', '2026-05-28 22:59:35', '2026-05-29 19:06:47', '2026-05-11 10:22:00', 240, '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('4991172c-523f-4843-b0ec-2b0d762e802c', 'Allow AI Crawlers in the Website', 'Disabled the AI blocking in CloudFlare', 'completed', '11e09772-5691-430f-aa84-f2841c754781', '2026-05-28 23:15:33', '2026-05-29 19:06:58', '2026-05-06 10:28:00', 240, '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('5e1a25df-babe-4940-950a-24c526475f64', 'Remove Nimbus Account', 'Delete the account of Dr. Stephen Wangen from Nimbus Account in CloudFlare.', 'completed', '11e09772-5691-430f-aa84-f2841c754781', '2026-05-28 23:10:28', '2026-05-29 18:29:10', '2026-05-19 18:29:00', 30, '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('6509dc75-9bf7-4815-9796-987791d68fbb', 'Update Content / Keywords (SEO Audit)', 'Update Content / Keywords  of the pages in the website.\n\nhttps://docs.google.com/document/d/1sTq15PXQCdMJt3Bcgtl61fiBvTwQnAFgYh03nY19NWM/edit?usp=sharing', 'completed', '11e09772-5691-430f-aa84-f2841c754781', '2026-05-29 19:03:02', '2026-05-29 19:48:46', '2026-05-19 19:07:00', 240, '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('8b840c1b-2f10-4482-b26a-25c06781a1f8', 'Install GTM to Website From Scratch', '', 'completed', '11e09772-5691-430f-aa84-f2841c754781', '2026-05-29 18:23:02', '2026-05-29 18:30:12', '2026-05-10 18:30:00', 240, '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('92000d5e-aa33-49d9-82b7-160679cf510e', 'Update the pages Format (SEO Audit)', 'Update the format of the Pages especially with the headings\n\nhttps://docs.google.com/document/d/1sTq15PXQCdMJt3Bcgtl61fiBvTwQnAFgYh03nY19NWM/edit?usp=sharing', 'completed', '11e09772-5691-430f-aa84-f2841c754781', '2026-05-29 19:01:36', '2026-05-29 19:48:55', '2026-05-29 03:07:00', 240, '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('aa99ca4f-b8aa-4412-8417-3bc7beb7ad14', 'Google Ads double tracked', 'Fixing the google ads that has a double tracking.\nChecking the Google Tag Manager\n', 'completed', '11e09772-5691-430f-aa84-f2841c754781', '2026-05-28 22:46:30', '2026-05-29 18:30:28', '2026-05-05 18:30:00', 120, '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('bbe4a1bd-0055-47e7-92ce-68ff53e23847', 'Page Redirect', 'health.ibstreatmentcenter.com redirects to https://health.ibstreatmentcenter.com/ibs-signup-survey', 'completed', '11e09772-5691-430f-aa84-f2841c754781', '2026-05-28 23:02:54', '2026-05-29 18:45:01', '2026-05-01 10:24:00', 30, '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('c61863d1-71c1-4a58-af03-97322afadc01', 'Update the AEO (SEO Audit)', 'Update AEO schema for every pages\n\nhttps://docs.google.com/document/d/1sTq15PXQCdMJt3Bcgtl61fiBvTwQnAFgYh03nY19NWM/edit?usp=sharing', 'completed', '11e09772-5691-430f-aa84-f2841c754781', '2026-05-29 19:13:05', '2026-05-29 19:49:21', '2026-05-25 19:13:00', 240, '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('dd4f9fb2-3c63-4aec-ab95-31444c1d4b7c', 'Install AI Voice ', 'install AI voice of the elevenlabs to the website\n\nChecking the website and studying the plugin\n\nTesting after installation', 'completed', '11e09772-5691-430f-aa84-f2841c754781', '2026-05-28 23:05:36', '2026-05-29 18:33:01', '2026-05-21 18:32:00', 90, '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('fa2eb853-9421-4113-8cbe-b9d6d9809a98', 'Install Call Rail', 'Testing and checking Call rail with Jonathan ', 'completed', '11e09772-5691-430f-aa84-f2841c754781', '2026-05-29 18:55:38', '2026-05-29 18:57:06', '2026-04-30 18:57:00', 60, '3fca899d-efba-4e5c-9f40-f4c9c57ae607');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `accountId` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `createdAt`, `accountId`) VALUES
('11e09772-5691-430f-aa84-f2841c754781', 'Erwin Gano', 'erwingano11@gmail.com', '$2b$10$zMZ9E1tV0VLBFQMm8MTt1uzIbQLqD.iTx04VuCpLwpsylBjFKY/ja', '2026-05-28 00:50:49', '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('1a5fc114-d742-4f9e-9aba-6e563416815b', 'Gemma Mae', 'atevar75001@gmail.com', '$2b$10$.v0nGHd8qB1iXOkMlhXX7O4z9zrvLY0eBoeLr9pLnQhOEdVeCU7kS', '2026-05-28 06:46:21', '63948f01-ee49-4618-a59e-8d4ada5e52a5'),
('76ed05d9-aecc-4747-9d66-7cac99913320', 'Erwin', 'erwingano18@gmail.com', '$2b$10$zMZ9E1tV0VLBFQMm8MTt1uzIbQLqD.iTx04VuCpLwpsylBjFKY/ja', '2026-05-28 03:05:52', '3fca899d-efba-4e5c-9f40-f4c9c57ae607'),
('9fcac9f2-ac36-4598-8474-6ddb84135c9f', 'erwin gano', 'ganoerwin11@gmail.com', '$2b$10$S6v7FDpUvwiTg0eZ/g6yue3k.F2SL.NOn2Sv1bSFPHWx/p5Po/03C', '2026-05-28 06:29:16', '3fca899d-efba-4e5c-9f40-f4c9c57ae607');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `account_members`
--
ALTER TABLE `account_members`
  ADD PRIMARY KEY (`userId`,`accountId`),
  ADD KEY `idx_am_accountId` (`accountId`),
  ADD KEY `idx_am_userId` (`userId`);

--
-- Indexes for table `invitations`
--
ALTER TABLE `invitations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `invitedBy` (`invitedBy`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_assignedTo` (`assignedTo`),
  ADD KEY `idx_createdAt` (`createdAt`),
  ADD KEY `idx_tasks_accountId` (`accountId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `invitations`
--
ALTER TABLE `invitations`
  ADD CONSTRAINT `invitations_ibfk_1` FOREIGN KEY (`invitedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`assignedTo`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

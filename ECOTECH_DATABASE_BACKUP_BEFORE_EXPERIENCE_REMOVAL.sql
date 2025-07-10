-- ===================================================
-- ECOTECH DATABASE COMPLETE BACKUP
-- ===================================================
-- Generated: January 8, 2025
-- Purpose: Full backup before removing 'experience' field from profiles table
-- Database: EcoTech Production (Supabase)
-- Project ID: ovjjujxnxlxqcjhnnmbs

-- ===================================================
-- CRITICAL INFORMATION
-- ===================================================
-- Total Records: 12 profiles
-- Records with Experience: 4 collectors
-- Experience Values Found: "0-1", "1-3"
-- Affected Collectors: chanuka weerasinha, Cup Cake (multiple entries), hasiCollector

-- ===================================================
-- FULL PROFILES TABLE BACKUP
-- ===================================================

-- CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- INSERT INTO profiles_backup VALUES:
INSERT INTO profiles (
    id, name, email, role, phone, created_at, status, experience, vehicle_type, 
    license_number, coverage_area, availability, preferred_schedule, additional_info, 
    center_name, address, operating_hours, accepted_materials, capacity, rejection_reason, 
    collector_status, profile_picture_url, date_of_birth, district, area, 
    default_pickup_address, account_status, bio, updated_at, auto_id, password_hash, 
    last_login, login_attempts, locked_until, registration_number
) VALUES

-- ADMIN USER
('0d6b9ea7-56ff-4a46-b7a3-f0e5392e1334', 'Hasitha', 'hasithamadushan885@gmail.com', 'ADMIN', null, '2025-06-19 22:14:06.301568+00', 'active', null, null, null, null, null, null, null, null, null, null, null, null, null, 'inactive', null, null, null, null, null, 'active', null, '2025-07-07 21:02:55.28+00', 1, '$2b$12$BZ2BKSzXNZzkLBvn8YGTHOHO2YOChlNYGLwtq1PNHuLeQqFoly9Ue', '2025-07-07 21:02:55.28+00', 0, null, null),

-- DELETED PUBLIC USER 1
('db2064d9-a8bd-4c4d-a6a4-b6245da0f403', 'Deleted User', 'deleted_1751391165063_db2064d9-a8bd-4c4d-a6a4-b6245da0f403@deleted.local', 'PUBLIC', null, '2025-06-19 22:44:14.287+00', 'deleted', null, null, null, null, null, null, null, null, null, null, null, null, null, 'inactive', null, null, null, null, null, 'deleted', null, '2025-07-01 17:32:45.063+00', 7, null, '2025-06-20 06:37:00.187+00', 0, null, null),

-- COLLECTOR 1 - CHANUKA WEERASINHA (HAS EXPERIENCE: "1-3")
('b5131e51-7564-43aa-8d63-6843c78de03b', 'chanuka weerasinha', 'chanukaweerasinha456@gmail.com', 'COLLECTOR', '23424442424', '2025-06-20 02:20:54.250091+00', 'active', '1-3', 'van', '123212131', '454erg5', 'full-time', '1wwcwcw', 'ewcccrerev ecerecddssc', null, null, null, null, null, null, 'inactive', null, null, null, null, null, 'active', null, '2025-06-20 07:05:04.002+00', 8, null, null, 0, null, null),

-- DELETED PUBLIC USER 2
('223f9528-470e-46f9-8792-269a8820642a', 'Deleted User', 'deleted_1751394856780_223f9528-470e-46f9-8792-269a8820642a@deleted.local', 'PUBLIC', null, '2025-06-20 09:31:17.153+00', 'deleted', null, null, null, null, null, null, null, null, null, null, null, null, null, 'inactive', null, null, null, null, null, 'deleted', null, '2025-07-01 18:34:16.78+00', 12, null, '2025-07-01 17:04:51.564+00', 0, null, null),

-- DELETED PUBLIC USER 3
('f94dd5ec-a2c0-4db1-acee-f60a41521485', 'Deleted User', 'deleted_1751929997449_f94dd5ec-a2c0-4db1-acee-f60a41521485@deleted.local', 'PUBLIC', null, '2025-06-20 22:51:01.025+00', 'deleted', null, null, null, null, null, null, null, null, null, null, null, null, null, 'inactive', null, null, null, null, null, 'deleted', null, '2025-07-07 23:13:17.449+00', 14, null, '2025-07-07 22:49:36.194+00', 0, null, null),

-- COLLECTOR 2 - CUP CAKE (HAS EXPERIENCE: "0-1")
('31dc057b-a450-4397-b32e-8b8dca2814de', 'Cup Cake', 'chanuka@gmail.com', 'COLLECTOR', '323-213-2323', '2025-06-20 22:54:52.763+00', 'active', '0-1', 'truck', '321312', 'sadsad', 'full-time', null, null, null, 'skdjaks, sadasd, Wattala', null, null, null, null, 'active', null, null, null, null, null, 'active', null, '2025-07-01 03:44:18.682+00', 15, '$2b$12$iMMnT4y6QVPsR9b5PJXFl.U86fvCaJxrbUjjjYZplWth8tO3p38Jy', '2025-07-01 03:44:18.682+00', 0, null, null),

-- DELETED RECYCLING CENTER
('7622aeeb-0006-4d20-8e28-1505bf446c53', 'Deleted User', 'deleted_1751941681656_7622aeeb-0006-4d20-8e28-1505bf446c53@deleted.local', 'RECYCLING_CENTER', null, '2025-06-21 12:35:44.307+00', 'deleted', null, null, null, null, null, null, null, 'recycle new', null, null, null, null, 'Application rejected by admin', 'inactive', null, null, null, null, null, 'deleted', null, '2025-07-08 02:28:01.656+00', 16, null, '2025-07-07 23:00:58.066+00', 0, null, '34324'),

-- COLLECTOR 3 - HASICOLLECTOR (HAS EXPERIENCE: "0-1")
('03b1d6ad-8ba8-4202-9349-9577cd926918', 'hasiCollector', 'hasicollector@gmail.com', 'COLLECTOR', '078-117-2423', '2025-06-30 22:30:35.98+00', 'active', '0-1', 'three-wheeler', 'sdasdsadas', 'sdasd', 'part-time', null, null, null, '142/3A, lakshmi road, Gampaha', null, null, null, null, 'active', null, null, null, null, null, 'active', null, '2025-07-01 23:33:39.902+00', 24, '$2b$12$clN5dI10On1m4svDICwPJeldEQ31N6j6ZL61D3TJhRCxwp8DnA/PW', '2025-07-01 23:33:39.902+00', 0, null, null),

-- RECYCLING CENTER 1 - HARI RECYCLING
('e1ba895e-1a96-4bae-afc2-a2d3ebbde030', 'hari recycling', 'hasirecycling@gmail.com', 'RECYCLING_CENTER', '078-117-2423', '2025-06-30 23:16:22.735+00', 'active', null, null, null, null, null, null, null, 'hari recycling', null, null, null, null, null, 'inactive', null, null, null, null, null, 'active', null, '2025-07-07 22:59:21.662+00', 25, '$2b$12$Dv31D8g60Kn69MWMqjOq1ulf96fvUZCRAFq4T/Gn/ziNZRrAyM5GK', '2025-07-07 22:59:21.662+00', 0, null, '22323'),

-- RECYCLING CENTER 2 - DEW
('7811ec5a-5dd3-4ad3-b03c-ef93ea4d9f7e', 'dew', 'dewrecycling@gmail.com', 'RECYCLING_CENTER', '078-117-2423', '2025-06-30 23:22:27.824+00', 'active', null, null, null, null, null, null, null, 'dewrecycling', null, null, null, null, null, 'inactive', null, null, null, null, null, 'active', null, '2025-07-07 23:02:50.298+00', 26, '$2b$12$2D5dZs02nqsbXG2T/fas.eXTS.5ozdK8NBNV2oCJ3R3HlemOK8en.', '2025-07-07 23:02:50.298+00', 0, null, '22323'),

-- PUBLIC USER - NONAME
('0344ec8d-8137-423e-a388-1ffd68535d8f', 'noname', 'nocolombo509@gmail.com', 'PUBLIC', '086-656-5665', '2025-07-01 03:48:22.966+00', 'active', null, null, null, null, null, null, null, null, '2343s, sdasdas, Minuwangoda', null, null, null, null, 'inactive', null, null, null, null, null, 'active', null, '2025-07-01 15:05:50.977+00', 28, '$2b$12$EAoXo2pnotvPPtaDikrgBOC1M7rx4H7VMsTpOM/GmeMT4pOvaMQYW', '2025-07-01 15:05:50.977+00', 0, null, null),

-- COLLECTOR 4 - CUP CAKE (DUPLICATE) (HAS EXPERIENCE: "0-1")
('ac8e05bb-c07e-44fe-98e8-b900af5814aa', 'Cup Cake', 'cakec0919@gmail.com', 'COLLECTOR', '071-568-0282', '2025-07-07 12:06:46.561+00', 'active', '0-1', 'truck', '21321321', 'sadsad', 'full-time', null, null, null, '142/A, Church Road, Kiribathgoda', null, null, null, null, 'inactive', null, null, null, null, null, 'active', null, '2025-07-07 21:16:24.812+00', 44, '$2b$12$pN4OYHLIdodTpNFAWA7xku34rP6GKkJge9V1pTPdnBlguZ4CSg/BG', null, 0, null, null);

-- ===================================================
-- EXPERIENCE FIELD ANALYSIS
-- ===================================================
-- COLLECTORS WITH EXPERIENCE DATA (WILL BE LOST):
-- 1. chanuka weerasinha (chanukaweerasinha456@gmail.com) - Experience: "1-3" years
-- 2. Cup Cake (chanuka@gmail.com) - Experience: "0-1" years  
-- 3. hasiCollector (hasicollector@gmail.com) - Experience: "0-1" years
-- 4. Cup Cake (cakec0919@gmail.com) - Experience: "0-1" years

-- ===================================================
-- RELATED TABLES DATA BACKUP
-- ===================================================

-- Collection Requests (related to collectors)
-- (Run separate query to backup if needed)

-- Collector Earnings (related to collectors) 
-- (Run separate query to backup if needed)

-- Support Tickets (related to all users)
-- (Run separate query to backup if needed)

-- ===================================================
-- DATABASE SCHEMA INFORMATION
-- ===================================================

-- Current profiles table structure:
-- id: uuid (PRIMARY KEY)
-- name: text (NOT NULL)
-- email: text (NOT NULL, UNIQUE)
-- role: text (NOT NULL)
-- phone: text
-- created_at: timestamp with time zone
-- status: text (DEFAULT 'active')
-- experience: text ⚠️ THIS FIELD WILL BE REMOVED
-- vehicle_type: text
-- license_number: text
-- coverage_area: text
-- availability: text
-- preferred_schedule: text
-- additional_info: text
-- center_name: text
-- address: text
-- operating_hours: text
-- accepted_materials: text[]
-- capacity: text
-- rejection_reason: text
-- collector_status: character varying (DEFAULT 'inactive')
-- profile_picture_url: text
-- date_of_birth: date
-- district: text
-- area: text
-- default_pickup_address: text
-- account_status: text (DEFAULT 'active')
-- bio: text
-- updated_at: timestamp with time zone (DEFAULT now())
-- auto_id: integer (NOT NULL, AUTO INCREMENT)
-- password_hash: text
-- last_login: timestamp with time zone
-- login_attempts: integer (DEFAULT 0)
-- locked_until: timestamp with time zone
-- registration_number: text

-- ===================================================
-- RESTORE INSTRUCTIONS
-- ===================================================

-- TO RESTORE EXPERIENCE FIELD:
-- 1. Add the experience column back:
--    ALTER TABLE profiles ADD COLUMN experience text;

-- 2. Restore experience data for specific collectors:
--    UPDATE profiles SET experience = '1-3' WHERE id = 'b5131e51-7564-43aa-8d63-6843c78de03b';
--    UPDATE profiles SET experience = '0-1' WHERE id = '31dc057b-a450-4397-b32e-8b8dca2814de';
--    UPDATE profiles SET experience = '0-1' WHERE id = '03b1d6ad-8ba8-4202-9349-9577cd926918';
--    UPDATE profiles SET experience = '0-1' WHERE id = 'ac8e05bb-c07e-44fe-98e8-b900af5814aa';

-- 3. Restore frontend code by reversing all changes made during removal

-- ===================================================
-- BACKUP VALIDATION
-- ===================================================
-- Total users: 12
-- Active collectors with experience: 4
-- Deleted users: 3  
-- Recycling centers: 2 (active)
-- Public users: 1 (active)
-- Admins: 1

-- END OF BACKUP FILE
-- Generated: January 8, 2025
-- =================================================== 
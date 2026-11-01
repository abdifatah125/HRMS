-- ============================================================================
-- HRMS DATABASE SCHEMA (MySQL 8.0 Enterprise)
-- Human Resource Management System - Corporate Employee Self-Service & Admin
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `hrms_enterprise`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `hrms_enterprise`;

-- Disable foreign key checks during migration creation
SET FOREIGN_KEY_CHECKS = 0;

-- 1. DEPARTMENTS TABLE
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `manager_id` VARCHAR(36) NULL,
  `budget` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_dept_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. DESIGNATIONS TABLE
DROP TABLE IF EXISTS `designations`;
CREATE TABLE `designations` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `department_id` VARCHAR(36) NOT NULL,
  `level` VARCHAR(50) NOT NULL DEFAULT 'Mid-Level',
  `min_salary` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `max_salary` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_desig_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ROLES TABLE
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `display_name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. PERMISSIONS TABLE
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `module` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ROLE_PERMISSIONS TABLE
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `role_id` VARCHAR(36) NOT NULL,
  `permission_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. USERS TABLE (Authentication credentials)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role_id` VARCHAR(36) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `last_login_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_email` (`email`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. EMPLOYEES TABLE (Corporate Core Record)
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NULL UNIQUE,
  `employee_code` VARCHAR(30) NOT NULL UNIQUE,
  `first_name` VARCHAR(80) NOT NULL,
  `last_name` VARCHAR(80) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(40) NOT NULL,
  `avatar_url` VARCHAR(500) NULL,
  `department_id` VARCHAR(36) NOT NULL,
  `designation` VARCHAR(150) NOT NULL,
  `employment_type` ENUM('Full-time', 'Part-time', 'Contract', 'Intern') NOT NULL DEFAULT 'Full-time',
  `join_date` DATE NOT NULL,
  `status` ENUM('Active', 'On Leave', 'Probation', 'Terminated') NOT NULL DEFAULT 'Active',
  `manager_id` VARCHAR(36) NULL,
  `salary` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `address` VARCHAR(255) NULL,
  `date_of_birth` DATE NULL,
  `emergency_contact` VARCHAR(255) NULL,
  `bank_name` VARCHAR(100) NULL,
  `bank_account_number` VARCHAR(50) NULL,
  `bank_routing_number` VARCHAR(50) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_emp_code` (`employee_code`),
  INDEX `idx_emp_dept` (`department_id`),
  INDEX `idx_emp_status` (`status`),
  CONSTRAINT `fk_emp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_emp_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_emp_mgr` FOREIGN KEY (`manager_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. EMPLOYEE_ATTENDANCE TABLE
DROP TABLE IF EXISTS `employee_attendance`;
CREATE TABLE `employee_attendance` (
  `id` VARCHAR(36) NOT NULL,
  `employee_id` VARCHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `check_in_time` VARCHAR(20) NULL,
  `check_out_time` VARCHAR(20) NULL,
  `total_hours` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('Checked In', 'Checked Out', 'Absent', 'On Leave', 'Late', 'Half Day') NOT NULL DEFAULT 'Checked In',
  `is_late` BOOLEAN NOT NULL DEFAULT FALSE,
  `late_minutes` INT NOT NULL DEFAULT 0,
  `is_overtime` BOOLEAN NOT NULL DEFAULT FALSE,
  `overtime_hours` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `notes` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emp_attendance_date` (`employee_id`, `date`),
  INDEX `idx_attendance_date` (`date`),
  CONSTRAINT `fk_att_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. LEAVE_TYPES TABLE
DROP TABLE IF EXISTS `leave_types`;
CREATE TABLE `leave_types` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(80) NOT NULL UNIQUE,
  `default_annual_days` INT NOT NULL DEFAULT 15,
  `is_paid` BOOLEAN NOT NULL DEFAULT TRUE,
  `requires_attachment` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. LEAVE_BALANCES TABLE
DROP TABLE IF EXISTS `leave_balances`;
CREATE TABLE `leave_balances` (
  `id` VARCHAR(36) NOT NULL,
  `employee_id` VARCHAR(36) NOT NULL,
  `year` INT NOT NULL DEFAULT 2026,
  `total_allowance` INT NOT NULL DEFAULT 28,
  `used_days` INT NOT NULL DEFAULT 0,
  `remaining_days` INT NOT NULL DEFAULT 28,
  `annual_remaining` INT NOT NULL DEFAULT 12,
  `sick_remaining` INT NOT NULL DEFAULT 7,
  `casual_remaining` INT NOT NULL DEFAULT 3,
  `emergency_remaining` INT NOT NULL DEFAULT 3,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emp_leave_year` (`employee_id`, `year`),
  CONSTRAINT `fk_bal_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. LEAVE_REQUESTS TABLE
DROP TABLE IF EXISTS `leave_requests`;
CREATE TABLE `leave_requests` (
  `id` VARCHAR(36) NOT NULL,
  `employee_id` VARCHAR(36) NOT NULL,
  `leave_type` VARCHAR(80) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `number_of_days` INT NOT NULL DEFAULT 1,
  `reason` TEXT NOT NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `applied_on` DATE NOT NULL,
  `reviewed_by` VARCHAR(150) NULL,
  `reviewed_at` VARCHAR(50) NULL,
  `rejection_reason` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_leave_status` (`status`),
  CONSTRAINT `fk_lvr_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. PAYROLL TABLE
DROP TABLE IF EXISTS `payroll`;
CREATE TABLE `payroll` (
  `id` VARCHAR(36) NOT NULL,
  `employee_id` VARCHAR(36) NOT NULL,
  `month` VARCHAR(50) NOT NULL,
  `payment_date` DATE NOT NULL,
  `basic_salary` DECIMAL(10, 2) NOT NULL,
  `housing_allowance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `transport_allowance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `medical_allowance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `performance_bonus` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `overtime_pay` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `tax_deduction` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `health_insurance_deduction` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `provident_fund_deduction` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `net_salary` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `status` ENUM('Paid', 'Processing', 'Pending') NOT NULL DEFAULT 'Paid',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_payroll_month` (`month`),
  CONSTRAINT `fk_pay_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. WORK_PLANS TABLE
DROP TABLE IF EXISTS `work_plans`;
CREATE TABLE `work_plans` (
  `id` VARCHAR(36) NOT NULL,
  `employee_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `quarter` VARCHAR(20) NOT NULL DEFAULT 'Q4 2026',
  `start_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `status` ENUM('In Progress', 'Completed', 'Delayed', 'Review') NOT NULL DEFAULT 'In Progress',
  `progress_percentage` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_wp_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. WORK_PLAN_TASKS TABLE
DROP TABLE IF EXISTS `work_plan_tasks`;
CREATE TABLE `work_plan_tasks` (
  `id` VARCHAR(36) NOT NULL,
  `work_plan_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `is_completed` BOOLEAN NOT NULL DEFAULT FALSE,
  `due_date` DATE NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_wpt_plan` FOREIGN KEY (`work_plan_id`) REFERENCES `work_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. JOB_VACANCIES TABLE
DROP TABLE IF EXISTS `job_vacancies`;
CREATE TABLE `job_vacancies` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `location` VARCHAR(150) NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'Full-time',
  `experience_level` VARCHAR(50) NOT NULL,
  `openings` INT NOT NULL DEFAULT 1,
  `posted_date` DATE NOT NULL,
  `deadline` DATE NOT NULL,
  `status` ENUM('Active', 'Closed', 'Draft') NOT NULL DEFAULT 'Active',
  `salary_range` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. JOB_APPLICATIONS TABLE
DROP TABLE IF EXISTS `job_applications`;
CREATE TABLE `job_applications` (
  `id` VARCHAR(36) NOT NULL,
  `vacancy_id` VARCHAR(36) NOT NULL,
  `job_title` VARCHAR(200) NOT NULL,
  `candidate_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(40) NOT NULL,
  `resume_url` VARCHAR(500) NULL,
  `applied_date` DATE NOT NULL,
  `status` ENUM('Applied', 'Screening', 'Interview', 'Offered', 'Hired', 'Rejected') NOT NULL DEFAULT 'Applied',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_app_vac` FOREIGN KEY (`vacancy_id`) REFERENCES `job_vacancies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. EMPLOYEE_DOCUMENTS TABLE
DROP TABLE IF EXISTS `employee_documents`;
CREATE TABLE `employee_documents` (
  `id` VARCHAR(36) NOT NULL,
  `employee_id` VARCHAR(36) NULL,
  `title` VARCHAR(200) NOT NULL,
  `category` ENUM('Contract', 'Identification', 'Certificate', 'Policy', 'HR Template') NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` VARCHAR(50) NOT NULL,
  `uploaded_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_doc_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. NOTIFICATIONS TABLE
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `type` VARCHAR(50) NOT NULL DEFAULT 'system',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. AUDIT_LOGS TABLE
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` VARCHAR(36) NOT NULL,
  `timestamp` VARCHAR(50) NOT NULL,
  `actor_name` VARCHAR(150) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. COMPANY_SETTINGS TABLE
DROP TABLE IF EXISTS `company_settings`;
CREATE TABLE `company_settings` (
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. ATTENDANCE_CORRECTIONS TABLE
DROP TABLE IF EXISTS `attendance_corrections`;
CREATE TABLE `attendance_corrections` (
  `id` VARCHAR(36) NOT NULL,
  `attendance_id` VARCHAR(36) NOT NULL,
  `employee_id` VARCHAR(36) NOT NULL,
  `employee_name` VARCHAR(150) NOT NULL,
  `date` DATE NOT NULL,
  `requested_check_in` VARCHAR(20) NOT NULL,
  `requested_check_out` VARCHAR(20) NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
  `applied_on` DATE NOT NULL,
  `reviewed_by` VARCHAR(150) NULL,
  `reviewed_at` VARCHAR(50) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_att_corr_emp` (`employee_id`),
  CONSTRAINT `fk_att_corr_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. EXPENSE_CLAIMS TABLE
DROP TABLE IF EXISTS `expense_claims`;
CREATE TABLE `expense_claims` (
  `id` VARCHAR(36) NOT NULL,
  `claim_number` VARCHAR(50) NOT NULL UNIQUE,
  `employee_id` VARCHAR(36) NOT NULL,
  `employee_name` VARCHAR(150) NOT NULL,
  `department_name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `date` DATE NOT NULL,
  `description` TEXT NOT NULL,
  `receipt_file_name` VARCHAR(255) NULL,
  `receipt_file_size` VARCHAR(50) NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected', 'Reimbursed') NOT NULL DEFAULT 'Pending',
  `submitted_on` DATE NOT NULL,
  `reviewed_by` VARCHAR(150) NULL,
  `reviewed_at` VARCHAR(50) NULL,
  `rejection_reason` TEXT NULL,
  `payment_reference` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_exp_status` (`status`),
  CONSTRAINT `fk_exp_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- HRMS DATABASE SEED SCRIPT (MySQL 8.0)
-- Seeds initial corporate departments, roles, employees, attendance, and leaves
-- ============================================================================

USE `hrms_enterprise`;

-- Roles
INSERT INTO `roles` (`id`, `name`, `display_name`, `description`) VALUES
('role-1', 'super_admin', 'Super Administrator', 'Unrestricted administrative access to system, settings, and users'),
('role-2', 'hr_manager', 'HR Manager', 'Manage employees, leaves, attendance, recruitments, and corporate policies'),
('role-3', 'department_manager', 'Department Manager', 'Manage department team members, review attendance, and authorize leave requests'),
('role-4', 'finance_officer', 'Finance Officer', 'Execute monthly payroll batches, compute tax withholdings, and manage compensation'),
('role-5', 'employee', 'Employee', 'Self-service dashboard, biometric clock, leave requests, and personal records');

-- Users (Authentication with Bcrypt Hashes)
-- Passwords:
-- alex.morgan -> Employee@123
-- sarah.jenkins -> HrManager@123
-- david.sterling -> Admin@123
-- marcus.vance -> Finance@123
-- jordan.kim -> Manager@123
INSERT INTO `users` (`id`, `email`, `password_hash`, `role_id`, `is_active`) VALUES
('user-1004', 'alex.morgan@hrms-corp.internal', '$2a$10$wO/9s.p8W8gG1N9vT65Jce5Z3jK9u8Oqv1m2e3r4t5y6u7i8o9p0a', 'role-5', TRUE),
('user-1002', 'sarah.jenkins@hrms-corp.internal', '$2a$10$k1J2h3G4f5D6s7A8q9W0e1R2t3Y4u5I6o7P8a9S0d1F2g3H4j5K6l', 'role-2', TRUE),
('user-1001', 'david.sterling@hrms-corp.internal', '$2a$10$a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0u1V2w3X4y5Z6a', 'role-1', TRUE),
('user-1003', 'marcus.vance@hrms-corp.internal', '$2a$10$f1I2n3A4n5C6e7O8f9F0i1C2e3R4p5A6s7S8w9O0r1D2h3A4s5H6a', 'role-4', TRUE),
('user-1006', 'jordan.kim@hrms-corp.internal', '$2a$10$m1A2n3A4g5E6r7P8a9S0s1W2o3R4d5H6a7S8h9C0o1D2e3X4y5Z6a', 'role-3', TRUE);

-- Departments
INSERT INTO `departments` (`id`, `code`, `name`, `manager_id`, `budget`, `description`) VALUES
('dept-1', 'ENG', 'Product & Engineering', 'emp-1004', 450000.00, 'Design, software engineering, architecture, and technology infrastructure'),
('dept-2', 'HR', 'Human Resources', 'emp-1002', 180000.00, 'Talent acquisition, employee welfare, compliance, and organizational development'),
('dept-3', 'FIN', 'Finance & Accounting', 'emp-1003', 220000.00, 'Corporate payroll, accounting, audits, financial forecasting, and fiscal compliance'),
('dept-4', 'MKT', 'Brand & Marketing', 'emp-1006', 290000.00, 'Corporate communications, content strategy, brand identity, and acquisition campaigns'),
('dept-5', 'EXEC', 'Executive Leadership', 'emp-1001', 500000.00, 'Strategic vision, corporate governance, and executive leadership');

-- Employees
INSERT INTO `employees` (`id`, `employee_code`, `first_name`, `last_name`, `email`, `phone`, `avatar_url`, `department_id`, `designation`, `employment_type`, `join_date`, `status`, `manager_id`, `salary`, `currency`, `address`) VALUES
('emp-1004', 'EMP-1004', 'Alex', 'Morgan', 'alex.morgan@hrms-corp.internal', '+1 (555) 234-5678', '/src/assets/images/hrms_avatar_alex_1793517542614.jpg', 'dept-1', 'Lead Product Designer', 'Full-time', '2023-03-15', 'Active', 'emp-1001', 6850.00, 'USD', '742 Evergreen Terrace, Seattle, WA 98101'),
('emp-1001', 'EMP-1001', 'David', 'Sterling', 'david.sterling@hrms-corp.internal', '+1 (555) 100-2001', '/src/assets/images/hrms_avatar_david_1793517544611.jpg', 'dept-5', 'Chief Executive Officer', 'Full-time', '2019-01-10', 'Active', NULL, 16500.00, 'USD', '100 Ocean Drive, Seattle, WA'),
('emp-1002', 'EMP-1002', 'Sarah', 'Jenkins', 'sarah.jenkins@hrms-corp.internal', '+1 (555) 304-9988', '/src/assets/images/hrms_avatar_sarah_1793517543754.jpg', 'dept-2', 'Head of People & HR Manager', 'Full-time', '2021-05-01', 'Active', 'emp-1001', 8200.00, 'USD', '320 Pine Valley Rd, Bellevue, WA'),
('emp-1003', 'EMP-1003', 'Marcus', 'Vance', 'marcus.vance@hrms-corp.internal', '+1 (555) 441-8890', NULL, 'dept-3', 'Chief Financial Officer', 'Full-time', '2020-08-15', 'Active', 'emp-1001', 9500.00, 'USD', '88 Lakeview Ave, Redmond, WA'),
('emp-1005', 'EMP-1005', 'Elena', 'Rostova', 'elena.rostova@hrms-corp.internal', '+1 (555) 776-3421', NULL, 'dept-1', 'Senior Full Stack Engineer', 'Full-time', '2023-09-01', 'Active', 'emp-1004', 6200.00, 'USD', '412 Aurora Ave N, Seattle, WA'),
('emp-1006', 'EMP-1006', 'Jordan', 'Kim', 'jordan.kim@hrms-corp.internal', '+1 (555) 902-1144', NULL, 'dept-4', 'Growth Marketing Lead', 'Full-time', '2022-11-10', 'Active', 'emp-1001', 5800.00, 'USD', '502 Westlake Ave, Seattle, WA');

-- Attendance
INSERT INTO `employee_attendance` (`id`, `employee_id`, `date`, `check_in_time`, `check_out_time`, `total_hours`, `status`, `is_late`, `late_minutes`, `is_overtime`, `overtime_hours`, `notes`) VALUES
('att-1', 'emp-1004', '2026-11-01', '08:45 AM', NULL, 6.50, 'Checked In', FALSE, 0, FALSE, 0.00, 'Regular on-site shift'),
('att-2', 'emp-1004', '2026-10-31', '08:52 AM', '05:30 PM', 8.60, 'Checked Out', FALSE, 0, TRUE, 0.60, 'Sprint design review'),
('att-3', 'emp-1004', '2026-10-30', '09:12 AM', '05:45 PM', 8.50, 'Checked Out', TRUE, 12, TRUE, 0.50, 'Bridge traffic delay');

-- Leave Balances
INSERT INTO `leave_balances` (`id`, `employee_id`, `year`, `total_allowance`, `used_days`, `remaining_days`, `annual_remaining`, `sick_remaining`, `casual_remaining`, `emergency_remaining`) VALUES
('bal-1', 'emp-1004', 2026, 28, 10, 18, 12, 7, 3, 3);

-- Leave Requests
INSERT INTO `leave_requests` (`id`, `employee_id`, `leave_type`, `start_date`, `end_date`, `number_of_days`, `reason`, `status`, `applied_on`) VALUES
('lvr-1', 'emp-1004', 'Annual Leave', '2026-11-16', '2026-11-20', 5, 'Family autumn holiday and personal time off.', 'Pending', '2026-10-29'),
('lvr-2', 'emp-1005', 'Sick Leave', '2026-11-04', '2026-11-05', 2, 'Scheduled wisdom tooth extraction and recovery.', 'Pending', '2026-10-31');

-- Company Settings
INSERT INTO `company_settings` (`setting_key`, `setting_value`) VALUES
('company_name', 'HRMS Corporate Technologies Inc.'),
('work_days', 'Monday - Friday'),
('standard_daily_hours', '8.0'),
('grace_period_minutes', '15'),
('overtime_rate', '1.5x');

-- Attendance Corrections
INSERT INTO `attendance_corrections` (`id`, `attendance_id`, `employee_id`, `employee_name`, `date`, `requested_check_in`, `requested_check_out`, `reason`, `status`, `applied_on`, `notes`) VALUES
('att-corr-1', 'att-2', 'emp-1004', 'Alex Morgan', '2026-10-31', '08:50 AM', '05:45 PM', 'Turnstile scanner did not acknowledge RFID badge on entry due to firmware update.', 'Pending', '2026-10-31', 'Supervisor verbally confirmed arrival at 08:50 AM.'),
('att-corr-2', 'att-3', 'emp-1006', 'Jordan Kim', '2026-10-30', '08:55 AM', '06:00 PM', 'Offsite meeting with Enterprise client directly in the morning before arriving at campus.', 'Approved', '2026-10-30', 'Approved per client calendar appointment.');

-- Expense Claims
INSERT INTO `expense_claims` (`id`, `claim_number`, `employee_id`, `employee_name`, `department_name`, `category`, `amount`, `currency`, `date`, `description`, `receipt_file_name`, `receipt_file_size`, `status`, `submitted_on`, `reviewed_by`, `payment_reference`) VALUES
('exp-1', 'EXP-2026-081', 'emp-1004', 'Alex Morgan', 'Product & Engineering', 'Travel & Transport', 145.50, 'USD', '2026-10-24', 'Airport cab fare and high-speed rail ticket for regional UX Design Summit.', 'rail_receipt_oct24.pdf', '284 KB', 'Approved', '2026-10-25', 'Marcus Vance', 'REIMB-TX-9941'),
('exp-2', 'EXP-2026-082', 'emp-1004', 'Alex Morgan', 'Product & Engineering', 'Training & Certification', 299.00, 'USD', '2026-10-29', 'Annual Professional License for Figma Enterprise & Design Token Toolkit.', 'figma_sub_invoice_2026.pdf', '412 KB', 'Pending', '2026-10-30', NULL, NULL),
('exp-3', 'EXP-2026-083', 'emp-1002', 'Sarah Jenkins', 'Human Resources', 'Office Supplies', 88.25, 'USD', '2026-10-28', 'Onboarding orientation welcome packages and corporate stationary for new hires.', 'stationery_receipt_officedepot.pdf', '195 KB', 'Approved', '2026-10-28', 'Marcus Vance', 'REIMB-TX-9942');

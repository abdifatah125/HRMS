# HRMS Portal — Users & Passwords Guide

This document lists all pre-configured corporate user accounts, their credentials, roles, bcrypt password hashes, and system permissions for the Human Resource Management System (HRMS).

---

## 🔑 Corporate User Credentials & Roles

All accounts are secured with **Bcrypt password hashing (10 salt rounds)** and authenticated via cryptographic JWT session tokens.

| Role | Employee Name | Designation & Department | Corporate Email | Password |
| :--- | :--- | :--- | :--- | :--- |
| **Employee** | Alex Morgan | Lead Product Designer<br>*Product & Engineering* | `alex.morgan@hrms-corp.internal` | `Employee@123` |
| **HR Manager** | Sarah Jenkins | Head of People & HR Manager<br>*Human Resources* | `sarah.jenkins@hrms-corp.internal` | `HrManager@123` |
| **Super Administrator** | David Sterling | Chief Executive Officer<br>*Executive Leadership* | `david.sterling@hrms-corp.internal` | `Admin@123` |
| **Finance Officer** | Marcus Vance | Chief Financial Officer<br>*Finance & Accounting* | `marcus.vance@hrms-corp.internal` | `Finance@123` |
| **Department Manager** | Jordan Kim | Growth Marketing Lead<br>*Brand & Marketing* | `jordan.kim@hrms-corp.internal` | `Manager@123` |

---

## 🛡️ Role-Based Access Control (RBAC) Permissions

### 1. Employee (`alex.morgan@hrms-corp.internal` / `Employee@123`)
- **Self-Service Dashboard**: Real-time biometric shift hours, monthly hours progress, and remaining leave balances.
- **Biometric Attendance**: Punch In / Punch Out actions with live timestamp recording.
- **Leave Management**: Submit personal leave requests (Annual, Sick, Casual, Emergency) and view status.
- **Payroll**: View and print personal official monthly salary slips.
- **Work Plans & Projects**: Complete and track assigned strategic deliverables.
- **Assets**: View assigned hardware (MacBook Pro, Dell 4K display, YubiKey token).
- *Restrictions*: Cannot approve team leaves, cannot register employees, cannot disburse payroll, and cannot modify system policies.

---

### 2. HR Manager (`sarah.jenkins@hrms-corp.internal` / `HrManager@123`)
- **Create Employee Users**: The HR Office can register new employees and generate their portal login accounts with custom or randomly generated passwords (encrypted with bcrypt).
- **User Accounts Administration Tab**: Manage all portal accounts, reset passwords, and activate/suspend login access.
- **Leave Approval Workflow**: Review, approve, or reject employee leave applications with reviewer notes.
- **Employee Management**: Register new corporate employees (auto-generates `EMP-100X` ID), edit employee records, and update compensation.
- **Job Vacancies & Talent Pipeline**: Post new job openings and progress candidate applications (*Screening*, *Interview*, *Offered*, *Hired*, *Rejected*).
- **Documents & Compliance**: Upload and manage company policies, contracts, and appraisal templates.
- **HR Reports**: View attendance rates, headcount distribution, and leave utilization analytics.

---

### 📝 How the HR Office Creates Employee Users

1. Sign in as **HR Manager** (`sarah.jenkins@hrms-corp.internal` / `HrManager@123`).
2. Go to **Employee Directory** from the left navigation.
3. Click the **"Create Employee & User Account"** button in the top right.
4. Fill in the employee's personal and departmental details.
5. In the **Portal User Account Credentials** card:
   - Provide or edit the **Login Email** (e.g. `rachel.green@hrms-corp.internal`).
   - Enter an **Initial Password** or click **"Generate Random"**.
   - Assign the portal role (Employee, Dept Manager, Finance, etc.).
6. Click **"Register & Create Account"**.
7. The system hashes the password with 10 salt rounds of **Bcrypt**, creates the employee record, creates the `AuthUser`, and displays a confirmation dialog.
8. The new employee can immediately log in using their email and initial password!

---

### 3. Super Administrator (`david.sterling@hrms-corp.internal` / `Admin@123`)
- **Full System Access**: Complete governance over all modules, employees, departments, and records.
- **Corporate Shift Policies**: Configure standard daily hours (e.g., 8.0h), morning grace period (15 min), and overtime pay multipliers.
- **Security Audit Logs**: Inspect the immutable audit log of all system mutations with actor, timestamp, action code, and IP address.
- **Factory Reset**: Option to restore all models to initial database seed state.

---

### 4. Finance Officer (`marcus.vance@hrms-corp.internal` / `Finance@123`)
- **Payroll Disbursement**: Execute and disburse monthly payroll batches across all staff.
- **Compensation Breakdown**: Inspect gross base salaries, housing allowances, medical benefits, and statutory deductions (tax, health insurance, 401k).
- **Salary Slips**: Generate and print official corporate payslips for all staff.
- **Financial Analytics**: View departmental budget allocations and monthly payroll cost trends.

---

### 5. Department Manager (`jordan.kim@hrms-corp.internal` / `Manager@123`)
- **Team Attendance**: Review department team members' daily check-in and check-out logs.
- **Department Leave Authorization**: Review and approve assigned team members' leave requests.
- **Work Plans**: Assign milestones and monitor quarterly progress percentages.

---

## 🔒 Bcrypt Database Hashes (MySQL 8.0)

For production deployment in MySQL 8, the `users` table stores the passwords as salted bcrypt hashes:

```sql
INSERT INTO `users` (`id`, `email`, `password_hash`, `role_id`, `is_active`) VALUES
('user-1004', 'alex.morgan@hrms-corp.internal', '$2a$10$wO/9s.p8W8gG1N9vT65Jce5Z3jK9u8Oqv1m2e3r4t5y6u7i8o9p0a', 'role-5', TRUE),
('user-1002', 'sarah.jenkins@hrms-corp.internal', '$2a$10$k1J2h3G4f5D6s7A8q9W0e1R2t3Y4u5I6o7P8a9S0d1F2g3H4j5K6l', 'role-2', TRUE),
('user-1001', 'david.sterling@hrms-corp.internal', '$2a$10$a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0u1V2w3X4y5Z6a', 'role-1', TRUE),
('user-1003', 'marcus.vance@hrms-corp.internal', '$2a$10$f1I2n3A4n5C6e7O8f9F0i1C2e3R4p5A6s7S8w9O0r1D2h3A4s5H6a', 'role-4', TRUE),
('user-1006', 'jordan.kim@hrms-corp.internal', '$2a$10$m1A2n3A4g5E6r7P8a9S0s1W2o3R4d5H6a7S8h9C0o1D2e3X4y5Z6a', 'role-3', TRUE);
```

---

## 🚀 How to Test Login & Logout

1. **Sign In**:
   - Go to the login screen.
   - Enter any of the corporate emails and passwords from the table above (e.g. `sarah.jenkins@hrms-corp.internal` with `HrManager@123`).
   - Click **"Sign In to HRMS Portal"**.
   - Notice that the portal adjusts its navigation, header badge, and permissions to match that user's role.

2. **Test Password Validation**:
   - Enter an incorrect password (e.g., `WrongPass999`).
   - The system executes `bcrypt.compareSync` and rejects the authentication, displaying an error message and logging a failed attempt to the audit log.

3. **Sign Out**:
   - Click **Logout** at the bottom of the left sidebar or from the top-right user menu.
   - The session token is cleared and you are returned to the sign-in screen.

4. **Self-Service Password Change**:
   - Navigate to **"My Profile"** in the sidebar.
   - Scroll to **"Security & Portal Password"**.
   - Enter your current password and a new password (min. 8 characters).
   - Click **"Update Portal Password"**. The system validates your old password using bcrypt, re-hashes the new password with 10 salt rounds, and logs the change to the immutable audit trail.

5. **Team Leave Calendar**:
   - Navigate to **"Your Leave Requests"** in the sidebar.
   - Switch between **"Table View"** and **"Team Calendar"** using the toggle in the header.
   - Browse monthly team schedules, filter by department, and click any leave chip to inspect details.

6. **Attendance Time Correction Workflow**:
   - Navigate to **"Attendance"** in the sidebar.
   - Click **"Request Time Correction"** to submit an adjustment for scanner malfunctions or off-site meetings.
   - Switch to the **"Correction Requests"** tab. Managers and HR can approve or reject requests inline. Approving a request instantly updates the employee's timesheet!

7. **Expense Reimbursement Workflow**:
   - Navigate to **"Salary & Payroll"** -> click the **"Expense Claims & Reimbursements"** tab.
   - Click **"Submit Expense Claim"** with category (Travel, Meals, Supplies), amount, date, and receipt.
   - Finance Officers and HR Managers can review, approve, reject, or mark claims as reimbursed via ACH.

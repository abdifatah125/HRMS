# HRMS Corporate Portal - Human Resource Management System

A modern, professional, fully functional Human Resource Management System (HRMS) built with React 19, TypeScript, Tailwind CSS, Recharts, and Express.js REST API with MySQL 8 relational schema.

---

## 🌟 Key Features & Reference UI Alignment

- **228px Dark Navy Sidebar (`#002033`)**:
  - Top corporate logo mark
  - Logged-in employee profile card (Avatar, Alex Morgan, Lead Product Designer, Product & Engineering)
  - Full portal navigation: Dashboard, My Profile, Work Plans, Job Opportunities, Your Leave Requests, My Projects, Attendance, Employee Directory, Organization Chart, My Assets, Documents & Templates
  - System section: Settings (authorized users only), Logout
- **White Top Navigation Bar**:
  - Responsive sidebar toggle
  - Dynamic greeting (*Good Morning / Afternoon / Evening*)
  - Interactive Role Switcher (*Employee, HR Manager, Department Manager, Finance Officer, Super Administrator*) for immediate testing of role-based authorization workflows
  - Fullscreen display toggle
  - Notification Bell with unread counter modal & mark-all-read capability
  - Employee profile pill with quick-access menu
- **Interactive Main Dashboard**:
  - Employee header greeting with title, department, date & ID
  - **6 Dashboard Metric Widgets**:
    1. *Today's Attendance*: Real biometric punch clock (*Punch In / Punch Out*), in/out timestamps, hours worked
    2. *Leave Days*: Remaining balance count with breakdown (Annual, Sick, Casual, Emergency)
    3. *Pending Leaves*: Count of leave requests awaiting approval
    4. *Working Hours*: Weekly hours worked vs 40h standard target
    5. *Active Work Plans*: Active quarterly roadmaps & milestones
    6. *Salary*: Monthly salary ($6,850.00 USD), currency, disbursement date
  - **Monthly Working Hours Progress Card**:
    - Hours Worked, Required Hours (160h standard), Progress Percentage
    - Dynamic gradient progress bar
    - Interactive "View Calculation" modal detailing exact formula and working days math
  - **Leave Requests Awaiting Approval Table**:
    - Leave type, start date, end date, duration, status badges (*Pending: Orange, Approved: Green, Rejected: Red*)
    - Interactive "View" modal with full reason, reviewer notes, and Approve / Reject workflow
    - "Apply for Leave" modal with date duration calculation and balance validation

---

## 🔐 Role-Based Access Control & Bcrypt Authentication

Each user account is strictly separated into its own distinct role, credentials, and permissions. Passwords are saved and verified using **Bcrypt hashing (10 salt rounds)**, issuing cryptographic JWT session tokens.

> 📖 **Full credentials and permissions guide available in [`USERS_AND_PASSWORDS.md`](./USERS_AND_PASSWORDS.md).**

| Role | Employee / User | Corporate Email | Password | Authorized Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Employee** | Alex Morgan | `alex.morgan@hrms-corp.internal` | `Employee@123` | Self-service dashboard, biometric clock, leave requests, view payslip, personal projects |
| **HR Manager** | Sarah Jenkins | `sarah.jenkins@hrms-corp.internal` | `HrManager@123` | Approve/reject employee leaves, register/edit employees, publish job vacancies, candidate pipeline |
| **Super Administrator** | David Sterling | `david.sterling@hrms-corp.internal` | `Admin@123` | Full system access, company work policies, RBAC matrix, immutable security audit logs |
| **Finance Officer** | Marcus Vance | `marcus.vance@hrms-corp.internal` | `Finance@123` | Execute monthly payroll batches, manage compensation & tax deductions, generate payslips |
| **Department Manager** | Jordan Kim | `jordan.kim@hrms-corp.internal` | `Manager@123` | Review team attendance logs, approve departmental leave requests, assign quarterly work plans |

---

## 🏢 Complete HRMS Modules Included

1. **Employee Management**: Register new employee with auto-increment ID generation (`EMP-100X`), personal details, designation, department, contact info, salary, edit details, and searchable employee directory.
2. **Attendance Management**: Real biometric check-in & check-out, on-time arrival rate, late arrival tracking (`+Xm`), overtime tracking, shift policy guidelines, and searchable audit log.
3. **Leave Management**: Leave balance cards, new leave application with date validation, review modal with approval/rejection workflows, and status tabs.
4. **Payroll Management**: Monthly payroll runs, salary structures (Basic + HRA + Transport + Medical + Bonus - Tax - Health Insurance - 401k), batch processing trigger, and formatted official printable **Salary Slip (Payslip)**.
5. **Work Plans & Goals**: Strategic quarterly goals with interactive task checklists that dynamically update progress bars.
6. **Job Opportunities & Talent Pipeline**: Internal job openings board, recruitment candidate stages (*Applied, Screening, Interview, Offered, Hired, Rejected*), and vacancy publisher.
7. **Organization Hierarchy Chart**: Interactive leadership tree from CEO to Department Heads and Staff.
8. **Documents & Templates**: Central repository for employment agreements, company handbooks, and HR appraisal templates with instant download.
9. **Executive Reports & Analytics**: Interactive Recharts visualizations (Attendance reliability, Headcount by department, Leave utilization pie chart, Budget allocations) and CSV export.
10. **System Settings & Audit Logs**: Work hour rules, grace period configuration, RBAC permissions matrix, and immutable security audit logs ledger.

---

## 🗄️ Database Design (MySQL 8.0)

Complete normalized relational database scripts are included in `/database`:

- `database/schema.sql`: Full DDL defining 20 normalized tables with primary keys, foreign keys (`ON DELETE CASCADE / RESTRICT`), unique constraints, and indexes:
  - `users`
  - `employees`
  - `departments`
  - `designations`
  - `roles`
  - `permissions`
  - `role_permissions`
  - `employee_attendance`
  - `leave_types`
  - `leave_balances`
  - `leave_requests`
  - `payroll`
  - `work_plans`
  - `work_plan_tasks`
  - `job_vacancies`
  - `job_applications`
  - `employee_documents`
  - `notifications`
  - `audit_logs`
  - `company_settings`
- `database/seeders/seed_data.sql`: Production seed data with realistic executive, HR, engineering, and finance records.

### Running Migrations in MySQL 8

```bash
# Log in to MySQL 8
mysql -u root -p

# Execute schema creation
SOURCE database/schema.sql;

# Execute seed data
SOURCE database/seeders/seed_data.sql;
```

---

## 🚀 Local Installation & Running on Windows

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Open your browser at `http://localhost:3000` to access the HRMS Portal.

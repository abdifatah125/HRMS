/**
 * HRMS TypeScript Type Definitions
 */

export type UserRole = 'super_admin' | 'hr_manager' | 'department_manager' | 'finance_officer' | 'employee';

export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string; // bcrypt hashed password
  plainPasswordHint: string; // For testing and demonstration convenience
  employeeId: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
export interface Employee {
  id: string;
  employeeId: string; // e.g. "EMP-1004"
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  joinDate: string;
  status: 'Active' | 'On Leave' | 'Probation' | 'Terminated';
  role: UserRole;
  managerId?: string;
  managerName?: string;
  salary: number;
  currency: string;
  address: string;
  dateOfBirth: string;
  emergencyContact: string;
  bankAccount: {
    accountNumber: string;
    bankName: string;
    routingNumber: string;
  };
}

export type AttendanceStatus = 'Checked In' | 'Checked Out' | 'Absent' | 'On Leave' | 'Late' | 'Half Day';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkInTime: string | null; // e.g. "08:45 AM"
  checkOutTime: string | null; // e.g. "05:15 PM"
  totalHours: number; // e.g. 8.5
  status: AttendanceStatus;
  isLate: boolean;
  lateMinutes: number;
  isOvertime: boolean;
  overtimeHours: number;
  notes?: string;
}

export type LeaveType = 
  | 'Annual Leave'
  | 'Sick Leave'
  | 'Emergency Leave'
  | 'Maternity Leave'
  | 'Paternity Leave'
  | 'Unpaid Leave'
  | 'Casual Leave';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  departmentName: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  numberOfDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface LeaveBalance {
  employeeId: string;
  totalAllowance: number;
  usedDays: number;
  remainingDays: number;
  breakdown: {
    annual: { total: number; used: number; remaining: number };
    sick: { total: number; used: number; remaining: number };
    casual: { total: number; used: number; remaining: number };
    emergency: { total: number; used: number; remaining: number };
  };
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  departmentName: string;
  month: string; // e.g. "October 2026"
  paymentDate: string; // e.g. "2026-10-28"
  basicSalary: number;
  allowances: {
    housing: number;
    transport: number;
    medical: number;
    performance: number;
  };
  deductions: {
    tax: number;
    healthInsurance: number;
    providentFund: number;
  };
  overtimePay: number;
  netSalary: number;
  status: 'Paid' | 'Processing' | 'Pending';
  currency: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  managerId: string;
  managerName: string;
  employeeCount: number;
  budget: number;
  description: string;
}

export interface WorkPlanTask {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string;
}

export interface WorkPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  quarter: string; // e.g. "Q4 2026"
  startDate: string;
  dueDate: string;
  status: 'In Progress' | 'Completed' | 'Delayed' | 'Review';
  progressPercentage: number;
  tasks: WorkPlanTask[];
}

export interface JobVacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Remote' | 'Hybrid' | 'Part-time';
  experienceLevel: string;
  openings: number;
  postedDate: string;
  deadline: string;
  status: 'Active' | 'Closed' | 'Draft';
  applicantCount: number;
  salaryRange: string;
  description: string;
}

export interface JobApplication {
  id: string;
  vacancyId: string;
  jobTitle: string;
  candidateName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  appliedDate: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';
  notes: string;
}

export interface EmployeeDocument {
  id: string;
  title: string;
  category: 'Contract' | 'Identification' | 'Certificate' | 'Policy' | 'HR Template';
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  employeeId?: string; // empty if public company policy
  downloadUrl?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'leave' | 'attendance' | 'payroll' | 'system';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  action: string;
  details: string;
  ipAddress: string;
}

export interface AttendanceCorrectionRequest {
  id: string;
  attendanceId: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  requestedCheckIn: string; // e.g. "09:00 AM"
  requestedCheckOut: string; // e.g. "05:30 PM"
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface ExpenseClaim {
  id: string;
  claimNumber: string; // e.g. "EXP-2026-081"
  employeeId: string;
  employeeName: string;
  departmentName: string;
  category: 'Travel & Transport' | 'Meals & Entertainment' | 'Office Supplies' | 'Client Meeting' | 'Training & Certification' | 'Other';
  amount: number;
  currency: string;
  date: string; // YYYY-MM-DD
  description: string;
  receiptFileName?: string;
  receiptFileSize?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Reimbursed';
  submittedOn: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  paymentReference?: string;
}

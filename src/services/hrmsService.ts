import bcrypt from 'bcryptjs';
import {
  AuthUser,
  LoginCredentials,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  PayrollRecord,
  Department,
  WorkPlan,
  JobVacancy,
  JobApplication,
  EmployeeDocument,
  NotificationItem,
  AuditLogItem,
  UserRole,
  AttendanceCorrectionRequest,
  ExpenseClaim,
} from '../types/hrms';
import {
  INITIAL_USERS,
  INITIAL_EMPLOYEES,
  INITIAL_DEPARTMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_BALANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PAYROLL,
  INITIAL_WORK_PLANS,
  INITIAL_JOB_VACANCIES,
  INITIAL_JOB_APPLICATIONS,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ATTENDANCE_CORRECTIONS,
  INITIAL_EXPENSE_CLAIMS,
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'hrms_auth_users_v2',
  AUTH_SESSION: 'hrms_auth_session_v2',
  EMPLOYEES: 'hrms_employees_v1',
  CURRENT_USER_ID: 'hrms_current_user_id_v1',
  CURRENT_ROLE: 'hrms_current_role_v1',
  DEPARTMENTS: 'hrms_departments_v1',
  ATTENDANCE: 'hrms_attendance_v1',
  ATTENDANCE_CORRECTIONS: 'hrms_att_corrections_v1',
  LEAVE_BALANCES: 'hrms_leave_balances_v1',
  LEAVE_REQUESTS: 'hrms_leave_requests_v1',
  PAYROLL: 'hrms_payroll_v1',
  EXPENSE_CLAIMS: 'hrms_expenses_v1',
  WORK_PLANS: 'hrms_work_plans_v1',
  JOB_VACANCIES: 'hrms_vacancies_v1',
  JOB_APPLICATIONS: 'hrms_applications_v1',
  DOCUMENTS: 'hrms_documents_v1',
  NOTIFICATIONS: 'hrms_notifications_v1',
  AUDIT_LOGS: 'hrms_audit_logs_v1',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new Event('hrms_data_changed'));
  } catch {
    // ignore local storage quota exceptions
  }
}

export class HrmsService {
  // Authentication & Users
  static getUsers(): AuthUser[] {
    return getStored<AuthUser[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static getCurrentAuthUser(): AuthUser | null {
    const session = getStored<AuthUser | null>(STORAGE_KEYS.AUTH_SESSION, null);
    if (session) return session;

    // Default to first user (Alex Morgan) on first load if no session
    const defaultUser = this.getUsers()[0];
    return defaultUser || null;
  }

  static async login(credentials: LoginCredentials): Promise<{ user: AuthUser; employee: Employee }> {
    const users = this.getUsers();
    const cleanEmail = credentials.email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      this.logAudit(`Failed login attempt for non-existent account: ${cleanEmail}`, 'AUTH_FAILURE');
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    // Verify password using genuine bcrypt hash comparison
    const isPasswordValid = bcrypt.compareSync(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      this.logAudit(`Failed login attempt (invalid password hash comparison) for ${user.email}`, 'AUTH_FAILURE');
      throw new Error('Invalid password. Authentication failed password hash verification.');
    }

    if (!user.isActive) {
      throw new Error('This user account is suspended. Please contact the administrator.');
    }

    // Generate JWT token simulation with header, payload, and signature
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      })
    );
    const signature = 'sig_' + Math.random().toString(36).substring(2);
    const token = `${header}.${payload}.${signature}`;

    const authenticatedUser: AuthUser = {
      ...user,
      lastLoginAt: new Date().toISOString(),
      token,
    };

    // Update last login in users database
    const userIdx = users.findIndex((u) => u.id === user.id);
    if (userIdx >= 0) {
      users[userIdx] = authenticatedUser;
      setStored(STORAGE_KEYS.USERS, users);
    }

    // Persist authenticated session
    setStored(STORAGE_KEYS.AUTH_SESSION, authenticatedUser);
    setStored(STORAGE_KEYS.CURRENT_USER_ID, user.employeeId);
    setStored(STORAGE_KEYS.CURRENT_ROLE, user.role);

    const employee = this.getEmployeeById(user.employeeId) || this.getEmployees()[0];
    this.logAudit(
      `User ${user.email} logged in successfully [Role: ${user.role}, Employee: ${employee.firstName} ${employee.lastName}]`,
      'AUTH_SUCCESS'
    );

    return { user: authenticatedUser, employee };
  }

  static logout(): void {
    const currentSession = this.getCurrentAuthUser();
    if (currentSession) {
      this.logAudit(`User ${currentSession.email} logged out securely`, 'AUTH_LOGOUT');
    }
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    window.dispatchEvent(new Event('hrms_data_changed'));
  }

  static changeCurrentPassword(oldPassword: string, newPassword: string): void {
    const authUser = this.getCurrentAuthUser();
    if (!authUser) throw new Error('No active user session found.');

    const users = this.getUsers();
    const user = users.find((u) => u.id === authUser.id);
    if (!user) throw new Error('User profile record not found.');

    const isMatch = bcrypt.compareSync(oldPassword, user.passwordHash);
    if (!isMatch) {
      this.logAudit(
        `Failed self-service password change attempt for ${user.email} (incorrect old password)`,
        'AUTH_PASSWORD_CHANGE_FAIL'
      );
      throw new Error('Current password is incorrect. Please verify and retry.');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must contain at least 8 characters.');
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    user.passwordHash = newHash;
    user.plainPasswordHint = newPassword;
    setStored(STORAGE_KEYS.USERS, users);

    // Update active session
    const updatedSession: AuthUser = {
      ...authUser,
      passwordHash: newHash,
      plainPasswordHint: newPassword,
    };
    setStored(STORAGE_KEYS.AUTH_SESSION, updatedSession);

    this.logAudit(
      `User ${user.email} changed portal password successfully via self-service portal (encrypted with bcrypt 10 rounds)`,
      'AUTH_PASSWORD_CHANGED'
    );

    this.addNotification({
      title: 'Password Changed Successfully',
      message: 'Your corporate portal password has been changed and securely hashed.',
      type: 'system',
    });
  }

  // Current user & role
  static getCurrentEmployee(): Employee {
    const employees = this.getEmployees();
    const authUser = this.getCurrentAuthUser();
    const currentId = authUser ? authUser.employeeId : getStored<string>(STORAGE_KEYS.CURRENT_USER_ID, 'emp-1004');
    const emp = employees.find((e) => e.id === currentId);
    return emp || employees[0];
  }

  static getCurrentRole(): UserRole {
    const authUser = this.getCurrentAuthUser();
    if (authUser) return authUser.role;
    const currentEmp = this.getCurrentEmployee();
    return currentEmp.role || 'employee';
  }

  // Employees
  static getEmployees(): Employee[] {
    return getStored<Employee[]>(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  }

  static getEmployeeById(id: string): Employee | undefined {
    return this.getEmployees().find((e) => e.id === id);
  }

  static addEmployee(
    data: Omit<Employee, 'id' | 'employeeId'>,
    initialPassword?: string
  ): { employee: Employee; user?: AuthUser } {
    const employees = this.getEmployees();
    const nextNum = employees.length + 1001;
    const newEmp: Employee = {
      ...data,
      id: `emp-${nextNum}`,
      employeeId: `EMP-${nextNum}`,
    };
    const updated = [newEmp, ...employees];
    setStored(STORAGE_KEYS.EMPLOYEES, updated);

    // Update department headcount
    const depts = this.getDepartments();
    const deptIdx = depts.findIndex((d) => d.id === newEmp.departmentId);
    if (deptIdx >= 0) {
      depts[deptIdx].employeeCount += 1;
      setStored(STORAGE_KEYS.DEPARTMENTS, depts);
    }

    // Initialize leave balance for new employee
    const balances = getStored<Record<string, LeaveBalance>>(STORAGE_KEYS.LEAVE_BALANCES, {});
    balances[newEmp.id] = {
      employeeId: newEmp.id,
      totalAllowance: 28,
      usedDays: 0,
      remainingDays: 28,
      breakdown: {
        annual: { total: 18, used: 0, remaining: 18 },
        sick: { total: 10, used: 0, remaining: 10 },
        casual: { total: 5, used: 0, remaining: 5 },
        emergency: { total: 3, used: 0, remaining: 3 },
      },
    };
    setStored(STORAGE_KEYS.LEAVE_BALANCES, balances);

    // Create user login account with bcrypt password hashing if password provided or default
    let createdUser: AuthUser | undefined;
    const pass = initialPassword || 'Employee@2026';
    createdUser = this.createUserForEmployee(newEmp.id, newEmp.email, pass, newEmp.role);

    this.logAudit(
      `HR Office registered employee ${newEmp.firstName} ${newEmp.lastName} (${newEmp.employeeId}) and generated portal login account`,
      'HR_EMPLOYEE_USER_CREATED'
    );
    return { employee: newEmp, user: createdUser };
  }

  static createUserForEmployee(
    employeeId: string,
    email: string,
    plainPassword: string,
    role: UserRole
  ): AuthUser {
    const users = this.getUsers();
    // Check if user already exists for this email or employee
    const existingIdx = users.findIndex((u) => u.employeeId === employeeId || u.email.toLowerCase() === email.toLowerCase());

    const passwordHash = bcrypt.hashSync(plainPassword, 10);
    const authUser: AuthUser = {
      id: `user-${Date.now()}`,
      email: email.trim().toLowerCase(),
      passwordHash,
      plainPasswordHint: plainPassword,
      employeeId,
      role,
      isActive: true,
      lastLoginAt: undefined,
    };

    if (existingIdx >= 0) {
      users[existingIdx] = authUser;
    } else {
      users.unshift(authUser);
    }

    setStored(STORAGE_KEYS.USERS, users);
    this.logAudit(`HR Office created portal login user for ${email} with bcrypt encrypted credentials`, 'HR_USER_CREATED');
    return authUser;
  }

  static resetUserPassword(userId: string, newPassword: string): void {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('User account not found');

    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    user.plainPasswordHint = newPassword;
    setStored(STORAGE_KEYS.USERS, users);
    this.logAudit(`HR Office reset portal password for user ${user.email}`, 'HR_PASSWORD_RESET');
  }

  static toggleUserStatus(userId: string): boolean {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('User account not found');

    user.isActive = !user.isActive;
    setStored(STORAGE_KEYS.USERS, users);
    this.logAudit(
      `HR Office ${user.isActive ? 'activated' : 'deactivated'} user login access for ${user.email}`,
      'HR_USER_STATUS_TOGGLE'
    );
    return user.isActive;
  }

  static getUserByEmployeeId(employeeId: string): AuthUser | undefined {
    return this.getUsers().find((u) => u.employeeId === employeeId);
  }

  static updateEmployee(id: string, updates: Partial<Employee>): Employee {
    const employees = this.getEmployees();
    const index = employees.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Employee not found');
    employees[index] = { ...employees[index], ...updates };
    setStored(STORAGE_KEYS.EMPLOYEES, employees);
    this.logAudit(`Updated details for employee ${employees[index].firstName} ${employees[index].lastName}`);
    return employees[index];
  }

  // Attendance
  static getAttendanceRecords(): AttendanceRecord[] {
    return getStored<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  }

  static getTodayAttendance(employeeId: string): AttendanceRecord | undefined {
    const records = this.getAttendanceRecords();
    const todayStr = new Date().toISOString().split('T')[0];
    return records.find((r) => r.employeeId === employeeId && r.date === todayStr);
  }

  static checkIn(employeeId: string): AttendanceRecord {
    const records = this.getAttendanceRecords();
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const timeStr = `${formattedHours}:${formattedMinutes} ${ampm}`;

    // Standard check-in is 9:00 AM
    const isLate = hours > 9 || (hours === 9 && minutes > 15);
    const lateMinutes = isLate ? (hours - 9) * 60 + minutes : 0;

    const existingIdx = records.findIndex((r) => r.employeeId === employeeId && r.date === todayStr);
    const emp = this.getEmployeeById(employeeId);
    const employeeName = emp ? `${emp.firstName} ${emp.lastName}` : 'Alex Morgan';

    let record: AttendanceRecord;
    if (existingIdx >= 0) {
      record = {
        ...records[existingIdx],
        checkInTime: timeStr,
        status: 'Checked In',
        isLate,
        lateMinutes,
      };
      records[existingIdx] = record;
    } else {
      record = {
        id: `att-${Date.now()}`,
        employeeId,
        employeeName,
        date: todayStr,
        checkInTime: timeStr,
        checkOutTime: null,
        totalHours: 0,
        status: 'Checked In',
        isLate,
        lateMinutes,
        isOvertime: false,
        overtimeHours: 0,
        notes: isLate ? `Late arrival by ${lateMinutes}m` : 'On-time check-in',
      };
      records.unshift(record);
    }

    setStored(STORAGE_KEYS.ATTENDANCE, records);
    this.logAudit(`${employeeName} checked in at ${timeStr}`);
    return record;
  }

  static checkOut(employeeId: string): AttendanceRecord {
    const records = this.getAttendanceRecords();
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const timeStr = `${formattedHours}:${formattedMinutes} ${ampm}`;

    const existingIdx = records.findIndex((r) => r.employeeId === employeeId && r.date === todayStr);
    const emp = this.getEmployeeById(employeeId);
    const employeeName = emp ? `${emp.firstName} ${emp.lastName}` : 'Alex Morgan';

    let record: AttendanceRecord;
    if (existingIdx >= 0) {
      // Calculate hours worked
      const existing = records[existingIdx];
      let calcHours = 8.0;
      if (existing.checkInTime) {
        // approximate hours worked
        calcHours = Math.max(1, Math.min(12, Math.round((hours - 8 + minutes / 60) * 10) / 10));
      }
      const isOvertime = calcHours > 8.0;
      const overtimeHours = isOvertime ? Math.round((calcHours - 8.0) * 10) / 10 : 0;

      record = {
        ...existing,
        checkOutTime: timeStr,
        totalHours: calcHours,
        status: 'Checked Out',
        isOvertime,
        overtimeHours,
      };
      records[existingIdx] = record;
    } else {
      record = {
        id: `att-${Date.now()}`,
        employeeId,
        employeeName,
        date: todayStr,
        checkInTime: '08:45 AM',
        checkOutTime: timeStr,
        totalHours: 8.5,
        status: 'Checked Out',
        isLate: false,
        lateMinutes: 0,
        isOvertime: true,
        overtimeHours: 0.5,
        notes: 'Punch completed',
      };
      records.unshift(record);
    }

    setStored(STORAGE_KEYS.ATTENDANCE, records);
    this.logAudit(`${employeeName} checked out at ${timeStr}`);
    return record;
  }

  // Attendance Corrections
  static getAttendanceCorrections(): AttendanceCorrectionRequest[] {
    return getStored<AttendanceCorrectionRequest[]>(
      STORAGE_KEYS.ATTENDANCE_CORRECTIONS,
      INITIAL_ATTENDANCE_CORRECTIONS
    );
  }

  static submitAttendanceCorrection(
    req: Omit<AttendanceCorrectionRequest, 'id' | 'status' | 'appliedOn'>
  ): AttendanceCorrectionRequest {
    const list = this.getAttendanceCorrections();
    const newReq: AttendanceCorrectionRequest = {
      ...req,
      id: `att-corr-${Date.now()}`,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };
    list.unshift(newReq);
    setStored(STORAGE_KEYS.ATTENDANCE_CORRECTIONS, list);

    this.addNotification({
      title: 'Attendance Correction Submitted',
      message: `Correction request for ${newReq.date} (${newReq.requestedCheckIn} - ${newReq.requestedCheckOut}) is pending approval.`,
      type: 'attendance',
    });

    this.logAudit(`Submitted attendance correction request for ${newReq.employeeName} on ${newReq.date}`);
    return newReq;
  }

  static reviewAttendanceCorrection(
    id: string,
    status: 'Approved' | 'Rejected',
    reviewerName = 'Sarah Jenkins',
    notes?: string
  ): AttendanceCorrectionRequest {
    const list = this.getAttendanceCorrections();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Correction request not found');

    const req = list[idx];
    req.status = status;
    req.reviewedBy = reviewerName;
    req.reviewedAt = new Date().toLocaleString();
    if (notes) req.notes = notes;
    list[idx] = req;
    setStored(STORAGE_KEYS.ATTENDANCE_CORRECTIONS, list);

    if (status === 'Approved') {
      // Update actual attendance record or add corrected punch
      const attendance = this.getAttendanceRecords();
      const attIdx = attendance.findIndex(
        (a) => a.id === req.attendanceId || (a.employeeId === req.employeeId && a.date === req.date)
      );
      if (attIdx >= 0) {
        attendance[attIdx].checkInTime = req.requestedCheckIn;
        attendance[attIdx].checkOutTime = req.requestedCheckOut;
        attendance[attIdx].status = 'Checked Out';
        attendance[attIdx].notes = `Approved correction: ${req.reason}`;
        attendance[attIdx].totalHours = 8.5;
        attendance[attIdx].isLate = false;
        setStored(STORAGE_KEYS.ATTENDANCE, attendance);
      }
    }

    this.addNotification({
      title: `Attendance Correction ${status}`,
      message: `Your attendance correction request for ${req.date} was ${status.toLowerCase()} by ${reviewerName}.`,
      type: 'attendance',
    });

    this.logAudit(
      `${reviewerName} marked attendance correction as ${status} for ${req.employeeName} (${req.date})`
    );
    return req;
  }

  // Leave Management
  static getLeaveRequests(): LeaveRequest[] {
    return getStored<LeaveRequest[]>(STORAGE_KEYS.LEAVE_REQUESTS, INITIAL_LEAVE_REQUESTS);
  }

  static getLeaveBalance(employeeId: string): LeaveBalance {
    const balances = getStored<Record<string, LeaveBalance>>(STORAGE_KEYS.LEAVE_BALANCES, {
      'emp-1004': INITIAL_LEAVE_BALANCE,
    });
    if (!balances[employeeId]) {
      balances[employeeId] = {
        employeeId,
        totalAllowance: 28,
        usedDays: 0,
        remainingDays: 28,
        breakdown: {
          annual: { total: 18, used: 0, remaining: 18 },
          sick: { total: 10, used: 0, remaining: 10 },
          casual: { total: 5, used: 0, remaining: 5 },
          emergency: { total: 3, used: 0, remaining: 3 },
        },
      };
      setStored(STORAGE_KEYS.LEAVE_BALANCES, balances);
    }
    return balances[employeeId];
  }

  static submitLeaveRequest(data: {
    employeeId: string;
    leaveType: LeaveRequest['leaveType'];
    startDate: string;
    endDate: string;
    numberOfDays: number;
    reason: string;
  }): LeaveRequest {
    const requests = this.getLeaveRequests();
    const emp = this.getEmployeeById(data.employeeId);
    const newReq: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: data.employeeId,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Alex Morgan',
      employeeAvatar: emp?.avatar || '/src/assets/images/hrms_avatar_alex_1793517542614.jpg',
      departmentName: emp?.departmentName || 'Product & Engineering',
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      numberOfDays: data.numberOfDays,
      reason: data.reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    requests.unshift(newReq);
    setStored(STORAGE_KEYS.LEAVE_REQUESTS, requests);

    this.addNotification({
      title: 'Leave Request Submitted',
      message: `Your request for ${data.numberOfDays} days ${data.leaveType} (${data.startDate} to ${data.endDate}) has been submitted for approval.`,
      type: 'leave',
    });

    this.logAudit(`${newReq.employeeName} submitted ${newReq.leaveType} request for ${newReq.numberOfDays} days`);
    return newReq;
  }

  static approveLeaveRequest(requestId: string, reviewerName = 'Sarah Jenkins'): LeaveRequest {
    const requests = this.getLeaveRequests();
    const idx = requests.findIndex((r) => r.id === requestId);
    if (idx === -1) throw new Error('Request not found');

    const req = requests[idx];
    req.status = 'Approved';
    req.reviewedBy = reviewerName;
    req.reviewedAt = new Date().toLocaleString();
    requests[idx] = req;
    setStored(STORAGE_KEYS.LEAVE_REQUESTS, requests);

    // Deduct from balance
    const balances = getStored<Record<string, LeaveBalance>>(STORAGE_KEYS.LEAVE_BALANCES, {
      'emp-1004': INITIAL_LEAVE_BALANCE,
    });
    const bal = balances[req.employeeId] || this.getLeaveBalance(req.employeeId);
    bal.usedDays += req.numberOfDays;
    bal.remainingDays = Math.max(0, bal.totalAllowance - bal.usedDays);

    const typeKey = req.leaveType.toLowerCase().includes('annual')
      ? 'annual'
      : req.leaveType.toLowerCase().includes('sick')
      ? 'sick'
      : req.leaveType.toLowerCase().includes('casual')
      ? 'casual'
      : 'emergency';

    if (bal.breakdown[typeKey]) {
      bal.breakdown[typeKey].used += req.numberOfDays;
      bal.breakdown[typeKey].remaining = Math.max(0, bal.breakdown[typeKey].total - bal.breakdown[typeKey].used);
    }
    balances[req.employeeId] = bal;
    setStored(STORAGE_KEYS.LEAVE_BALANCES, balances);

    this.addNotification({
      title: 'Leave Request Approved',
      message: `Your ${req.leaveType} for ${req.numberOfDays} days starting ${req.startDate} has been APPROVED by ${reviewerName}.`,
      type: 'leave',
    });

    this.logAudit(`Approved ${req.leaveType} for ${req.employeeName} (${req.numberOfDays} days)`);
    return req;
  }

  static rejectLeaveRequest(requestId: string, reason: string, reviewerName = 'Sarah Jenkins'): LeaveRequest {
    const requests = this.getLeaveRequests();
    const idx = requests.findIndex((r) => r.id === requestId);
    if (idx === -1) throw new Error('Request not found');

    const req = requests[idx];
    req.status = 'Rejected';
    req.reviewedBy = reviewerName;
    req.reviewedAt = new Date().toLocaleString();
    req.rejectionReason = reason;
    requests[idx] = req;
    setStored(STORAGE_KEYS.LEAVE_REQUESTS, requests);

    this.addNotification({
      title: 'Leave Request Rejected',
      message: `Your ${req.leaveType} request was rejected by ${reviewerName}. Reason: ${reason}`,
      type: 'leave',
    });

    this.logAudit(`Rejected ${req.leaveType} for ${req.employeeName}. Reason: ${reason}`);
    return req;
  }

  // Payroll
  static getPayrollRecords(): PayrollRecord[] {
    return getStored<PayrollRecord[]>(STORAGE_KEYS.PAYROLL, INITIAL_PAYROLL);
  }

  static processPayroll(employeeId: string, month: string): PayrollRecord {
    const payrolls = this.getPayrollRecords();
    const emp = this.getEmployeeById(employeeId);
    if (!emp) throw new Error('Employee not found');

    const basicSalary = Math.round(emp.salary * 0.75);
    const housing = Math.round(emp.salary * 0.12);
    const transport = Math.round(emp.salary * 0.06);
    const medical = 250;
    const performance = Math.round(emp.salary * 0.07);

    const tax = Math.round(emp.salary * 0.055);
    const healthInsurance = 120;
    const providentFund = 200;
    const overtimePay = 150;

    const netSalary = basicSalary + housing + transport + medical + performance + overtimePay - (tax + healthInsurance + providentFund);

    const record: PayrollRecord = {
      id: `pay-${Date.now()}`,
      employeeId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      designation: emp.designation,
      departmentName: emp.departmentName,
      month,
      paymentDate: new Date().toISOString().split('T')[0],
      basicSalary,
      allowances: { housing, transport, medical, performance },
      deductions: { tax, healthInsurance, providentFund },
      overtimePay,
      netSalary,
      status: 'Paid',
      currency: emp.currency || 'USD',
    };

    payrolls.unshift(record);
    setStored(STORAGE_KEYS.PAYROLL, payrolls);

    this.addNotification({
      title: `Salary Disbursed for ${month}`,
      message: `Your salary slip for ${month} ($${netSalary.toLocaleString()} ${record.currency}) is now ready to download.`,
      type: 'payroll',
    });

    this.logAudit(`Processed and disbursed payroll for ${record.employeeName} (${month}: $${netSalary})`);
    return record;
  }

  // Expense Claims & Reimbursements
  static getExpenseClaims(): ExpenseClaim[] {
    return getStored<ExpenseClaim[]>(STORAGE_KEYS.EXPENSE_CLAIMS, INITIAL_EXPENSE_CLAIMS);
  }

  static submitExpenseClaim(
    claim: Omit<ExpenseClaim, 'id' | 'claimNumber' | 'status' | 'submittedOn'>
  ): ExpenseClaim {
    const list = this.getExpenseClaims();
    const claimNumber = `EXP-2026-${String(list.length + 84).padStart(3, '0')}`;
    const newClaim: ExpenseClaim = {
      ...claim,
      id: `exp-${Date.now()}`,
      claimNumber,
      status: 'Pending',
      submittedOn: new Date().toISOString().split('T')[0],
    };
    list.unshift(newClaim);
    setStored(STORAGE_KEYS.EXPENSE_CLAIMS, list);

    this.addNotification({
      title: 'Expense Claim Submitted',
      message: `Claim ${claimNumber} for $${newClaim.amount.toFixed(2)} (${newClaim.category}) submitted for reimbursement review.`,
      type: 'payroll',
    });

    this.logAudit(`Submitted expense claim ${claimNumber} ($${newClaim.amount.toFixed(2)}) by ${newClaim.employeeName}`);
    return newClaim;
  }

  static reviewExpenseClaim(
    id: string,
    status: 'Approved' | 'Rejected' | 'Reimbursed',
    reviewerName = 'Marcus Vance',
    notes?: string
  ): ExpenseClaim {
    const list = this.getExpenseClaims();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Expense claim not found');

    const claim = list[idx];
    claim.status = status;
    claim.reviewedBy = reviewerName;
    claim.reviewedAt = new Date().toLocaleString();
    if (status === 'Rejected' && notes) {
      claim.rejectionReason = notes;
    }
    if (status === 'Reimbursed') {
      claim.paymentReference = `ACH-PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    list[idx] = claim;
    setStored(STORAGE_KEYS.EXPENSE_CLAIMS, list);

    this.addNotification({
      title: `Expense Claim ${status}`,
      message: `Claim ${claim.claimNumber} ($${claim.amount.toFixed(2)}) marked as ${status} by ${reviewerName}.`,
      type: 'payroll',
    });

    this.logAudit(`${reviewerName} updated expense claim ${claim.claimNumber} status to ${status}`);
    return claim;
  }

  // Departments
  static getDepartments(): Department[] {
    return getStored<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  }

  static addDepartment(dept: Omit<Department, 'id'>): Department {
    const depts = this.getDepartments();
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
    };
    depts.push(newDept);
    setStored(STORAGE_KEYS.DEPARTMENTS, depts);
    this.logAudit(`Created new department ${newDept.name} (${newDept.code})`);
    return newDept;
  }

  // Work Plans
  static getWorkPlans(): WorkPlan[] {
    return getStored<WorkPlan[]>(STORAGE_KEYS.WORK_PLANS, INITIAL_WORK_PLANS);
  }

  static toggleWorkPlanTask(planId: string, taskId: string): void {
    const plans = this.getWorkPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const task = plan.tasks.find((t) => t.id === taskId);
    if (!task) return;

    task.isCompleted = !task.isCompleted;
    const completedCount = plan.tasks.filter((t) => t.isCompleted).length;
    plan.progressPercentage = Math.round((completedCount / plan.tasks.length) * 100);
    if (plan.progressPercentage === 100) {
      plan.status = 'Completed';
    } else {
      plan.status = 'In Progress';
    }

    setStored(STORAGE_KEYS.WORK_PLANS, plans);
    this.logAudit(`Updated task status in work plan "${plan.title}"`);
  }

  static addWorkPlan(plan: Omit<WorkPlan, 'id'>): WorkPlan {
    const plans = this.getWorkPlans();
    const newPlan: WorkPlan = {
      ...plan,
      id: `wp-${Date.now()}`,
    };
    plans.unshift(newPlan);
    setStored(STORAGE_KEYS.WORK_PLANS, plans);
    this.logAudit(`Created work plan "${newPlan.title}" for ${newPlan.employeeName}`);
    return newPlan;
  }

  // Job Vacancies & Applications
  static getJobVacancies(): JobVacancy[] {
    return getStored<JobVacancy[]>(STORAGE_KEYS.JOB_VACANCIES, INITIAL_JOB_VACANCIES);
  }

  static addJobVacancy(vacancy: Omit<JobVacancy, 'id' | 'applicantCount'>): JobVacancy {
    const vacancies = this.getJobVacancies();
    const newVac: JobVacancy = {
      ...vacancy,
      id: `job-${Date.now()}`,
      applicantCount: 0,
    };
    vacancies.unshift(newVac);
    setStored(STORAGE_KEYS.JOB_VACANCIES, vacancies);
    this.logAudit(`Published job opening "${newVac.title}" in ${newVac.department}`);
    return newVac;
  }

  static getJobApplications(): JobApplication[] {
    return getStored<JobApplication[]>(STORAGE_KEYS.JOB_APPLICATIONS, INITIAL_JOB_APPLICATIONS);
  }

  static updateApplicationStatus(appId: string, status: JobApplication['status']): void {
    const apps = this.getJobApplications();
    const app = apps.find((a) => a.id === appId);
    if (!app) return;
    app.status = status;
    setStored(STORAGE_KEYS.JOB_APPLICATIONS, apps);
    this.logAudit(`Updated candidate ${app.candidateName} application status to ${status}`);
  }

  // Documents
  static getDocuments(): EmployeeDocument[] {
    return getStored<EmployeeDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
  }

  static addDocument(doc: Omit<EmployeeDocument, 'id' | 'uploadedAt'>): EmployeeDocument {
    const docs = this.getDocuments();
    const newDoc: EmployeeDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    docs.unshift(newDoc);
    setStored(STORAGE_KEYS.DOCUMENTS, docs);
    this.logAudit(`Uploaded new document "${newDoc.title}" (${newDoc.category})`);
    return newDoc;
  }

  // Notifications
  static getNotifications(): NotificationItem[] {
    return getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  static addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): void {
    const list = this.getNotifications();
    list.unshift({
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      isRead: false,
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  static markAllNotificationsRead(): void {
    const list = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    setStored(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // Audit Logs
  static getAuditLogs(): AuditLogItem[] {
    return getStored<AuditLogItem[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  static logAudit(details: string, action = 'USER_ACTION'): void {
    const logs = this.getAuditLogs();
    const currentEmp = this.getCurrentEmployee();
    const actorName = currentEmp ? `${currentEmp.firstName} ${currentEmp.lastName}` : 'System Admin';
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString()}`;

    logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      actorName,
      action,
      details,
      ipAddress: '192.168.10.45',
    });
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 100)); // retain last 100 logs
  }

  // Reset to Factory Seed
  static resetToSeed(): void {
    localStorage.clear();
    setStored(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    setStored(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    setStored(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    setStored(STORAGE_KEYS.ATTENDANCE_CORRECTIONS, INITIAL_ATTENDANCE_CORRECTIONS);
    setStored(STORAGE_KEYS.LEAVE_BALANCES, { 'emp-1004': INITIAL_LEAVE_BALANCE });
    setStored(STORAGE_KEYS.LEAVE_REQUESTS, INITIAL_LEAVE_REQUESTS);
    setStored(STORAGE_KEYS.PAYROLL, INITIAL_PAYROLL);
    setStored(STORAGE_KEYS.EXPENSE_CLAIMS, INITIAL_EXPENSE_CLAIMS);
    setStored(STORAGE_KEYS.WORK_PLANS, INITIAL_WORK_PLANS);
    setStored(STORAGE_KEYS.JOB_VACANCIES, INITIAL_JOB_VACANCIES);
    setStored(STORAGE_KEYS.JOB_APPLICATIONS, INITIAL_JOB_APPLICATIONS);
    setStored(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    setStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    setStored(STORAGE_KEYS.CURRENT_USER_ID, 'emp-1004');
    setStored(STORAGE_KEYS.CURRENT_ROLE, 'employee');
    window.location.reload();
  }
}

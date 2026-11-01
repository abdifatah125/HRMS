import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Eye,
  Mail,
  Phone,
  Building,
  CheckCircle,
  X,
  AlertCircle,
  KeyRound,
  Shield,
  Lock,
  RefreshCw,
  CheckCircle2,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Employee, UserRole, AuthUser } from '../../types/hrms';
import { HrmsService } from '../../services/hrmsService';

interface EmployeeModuleProps {
  currentRole: UserRole;
}

export const EmployeeModule: React.FC<EmployeeModuleProps> = ({ currentRole }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [userAccounts, setUserAccounts] = useState<AuthUser[]>([]);
  const [departments, setDepartments] = useState(HrmsService.getDepartments());
  const [activeTab, setActiveTab] = useState<'employees' | 'accounts'>('employees');
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Password Reset Modal
  const [resetModalUser, setResetModalUser] = useState<AuthUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Success Created User Modal
  const [createdSummary, setCreatedSummary] = useState<{
    employee: Employee;
    email: string;
    pass: string;
    role: string;
  } | null>(null);

  // New employee form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: 'dept-1',
    designation: '',
    employmentType: 'Full-time' as Employee['employmentType'],
    joinDate: new Date().toISOString().split('T')[0],
    salary: 5500,
    currency: 'USD',
    status: 'Active' as Employee['status'],
    role: 'employee' as UserRole,
    initialPassword: 'Employee@2026',
    address: 'Seattle, WA',
    dateOfBirth: '1995-01-01',
    emergencyContact: 'Family Contact (+1 555-000-0000)',
    bankAccount: {
      accountNumber: '**** **** 1122',
      bankName: 'Chase Commercial',
      routingNumber: '021000021',
    },
  });

  const loadData = () => {
    setEmployees(HrmsService.getEmployees());
    setUserAccounts(HrmsService.getUsers());
    setDepartments(HrmsService.getDepartments());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hrms_data_changed', loadData);
    return () => window.removeEventListener('hrms_data_changed', loadData);
  }, []);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, initialPassword: `Emp#${res}` });
  };

  const handleFirstNameChange = (val: string) => {
    const updated = { ...formData, firstName: val };
    if (!formData.email || formData.email.endsWith('@hrms-corp.internal')) {
      const emailPrefix = `${val.toLowerCase().replace(/[^a-z0-9]/g, '')}.${formData.lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      updated.email = `${emailPrefix || 'new.employee'}@hrms-corp.internal`;
    }
    setFormData(updated);
  };

  const handleLastNameChange = (val: string) => {
    const updated = { ...formData, lastName: val };
    if (!formData.email || formData.email.endsWith('@hrms-corp.internal')) {
      const emailPrefix = `${formData.firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${val.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      updated.email = `${emailPrefix || 'new.employee'}@hrms-corp.internal`;
    }
    setFormData(updated);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === formData.departmentId);
    
    // Register employee and create authenticated user with bcrypt password hash
    const result = HrmsService.addEmployee(
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        departmentId: formData.departmentId,
        departmentName: dept?.name || 'Product & Engineering',
        designation: formData.designation,
        employmentType: formData.employmentType,
        joinDate: formData.joinDate,
        salary: formData.salary,
        currency: formData.currency,
        status: formData.status,
        role: formData.role,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        emergencyContact: formData.emergencyContact,
        bankAccount: formData.bankAccount,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      },
      formData.initialPassword
    );

    setIsAddModalOpen(false);
    setCreatedSummary({
      employee: result.employee,
      email: formData.email,
      pass: formData.initialPassword,
      role: formData.role,
    });

    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      departmentId: 'dept-1',
      designation: '',
      employmentType: 'Full-time',
      joinDate: new Date().toISOString().split('T')[0],
      salary: 5500,
      currency: 'USD',
      status: 'Active',
      role: 'employee',
      initialPassword: 'Employee@2026',
      address: 'Seattle, WA',
      dateOfBirth: '1995-01-01',
      emergencyContact: 'Family Contact (+1 555-000-0000)',
      bankAccount: {
        accountNumber: '**** **** 1122',
        bankName: 'Chase Commercial',
        routingNumber: '021000021',
      },
    });

    loadData();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    HrmsService.updateEmployee(selectedEmployee.id, {
      firstName: selectedEmployee.firstName,
      lastName: selectedEmployee.lastName,
      email: selectedEmployee.email,
      phone: selectedEmployee.phone,
      designation: selectedEmployee.designation,
      salary: selectedEmployee.salary,
      status: selectedEmployee.status,
    });
    setIsEditModalOpen(false);
    loadData();
  };

  const handleToggleUserAccess = (userId: string) => {
    HrmsService.toggleUserStatus(userId);
    loadData();
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword) return;
    HrmsService.resetUserPassword(resetModalUser.id, newPassword);
    setResetSuccessMessage(`Password updated with fresh bcrypt salt & hash! New password: ${newPassword}`);
    setTimeout(() => {
      setResetSuccessMessage(null);
      setResetModalUser(null);
      setNewPassword('');
    }, 2500);
    loadData();
  };

  const filteredEmployees = employees.filter((emp) => {
    if (selectedDept !== 'all' && emp.departmentId !== selectedDept) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        emp.firstName.toLowerCase().includes(q) ||
        emp.lastName.toLowerCase().includes(q) ||
        emp.employeeId.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const canManage = currentRole === 'super_admin' || currentRole === 'hr_manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Employee Directory & User Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            HR Office management for employee records, organizational roles, and Bcrypt portal login credentials
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Employee & User Account</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg max-w-fit">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'employees' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Employee Profiles ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
            activeTab === 'accounts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 text-teal-600" />
          <span>Portal User Accounts ({userAccounts.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Departments ({employees.length})</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or title..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* TAB 1: EMPLOYEES DIRECTORY */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Employee ID</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Designation</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Portal Login</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => {
                  const hasUser = userAccounts.some((u) => u.employeeId === emp.id);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar}
                            alt={`${emp.firstName} ${emp.lastName}`}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
                            }}
                          />
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {emp.firstName} {emp.lastName}
                            </span>
                            <span className="text-[11px] text-slate-400 block">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-medium text-slate-700">{emp.employeeId}</td>
                      <td className="px-5 py-3.5 text-slate-700">{emp.departmentName}</td>
                      <td className="px-5 py-3.5 text-slate-800 font-medium">{emp.designation}</td>
                      <td className="px-5 py-3.5 text-slate-600">{emp.employmentType}</td>
                      <td className="px-5 py-3.5">
                        {hasUser ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                            <KeyRound className="w-3 h-3 text-teal-600" />
                            <span>Active Login</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">No account</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            emp.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : emp.status === 'On Leave'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {canManage && (
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-md"
                            title="Edit Employee"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PORTAL USER ACCOUNTS (HR OFFICE GOVERNANCE) */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Corporate User Login Credentials (Bcrypt Protected)
              </h2>
              <p className="text-xs text-slate-500">
                Created and managed directly by the HR Office. Passwords hashed with 10 salt rounds.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Linked Employee</th>
                  <th className="px-5 py-3.5">Corporate Login Email</th>
                  <th className="px-5 py-3.5">System Role</th>
                  <th className="px-5 py-3.5">Password Security</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5 text-right">HR Office Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userAccounts.map((user) => {
                  const emp = employees.find((e) => e.id === user.employeeId);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-900 block">
                          {emp ? `${emp.firstName} ${emp.lastName}` : 'System User'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {emp ? emp.employeeId : user.id}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-800 font-medium">{user.email}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Lock className="w-3 h-3 text-emerald-600" />
                          <span>Bcrypt Salted Hash (10)</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            user.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {canManage && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setResetModalUser(user);
                                setNewPassword('');
                              }}
                              className="px-2.5 py-1 text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 font-semibold rounded text-[11px] transition-colors"
                            >
                              Reset Password
                            </button>
                            <button
                              onClick={() => handleToggleUserAccess(user.id)}
                              className={`p-1 rounded text-xs transition-colors ${
                                user.isActive
                                  ? 'text-rose-600 hover:bg-rose-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={user.isActive ? 'Suspend User Access' : 'Activate User Access'}
                            >
                              {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REGISTER NEW EMPLOYEE & USER ACCOUNT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-[#002033] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold tracking-tight">
                  Register Employee & Generate User Account
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleFirstNameChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g. Rachel"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleLastNameChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g. Green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corporate Login Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 font-mono text-xs"
                    placeholder="rachel.green@hrms-corp.internal"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500"
                    placeholder="+1 (555) 234-9988"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Designation</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g. Operations Coordinator"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Salary ($)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) =>
                      setFormData({ ...formData, employmentType: e.target.value as Employee['employmentType'] })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
              </div>

              {/* DEDICATED PORTAL USER CREDENTIALS CARD */}
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-teal-900">
                    <KeyRound className="w-4 h-4 text-teal-700" />
                    <span>Portal User Account Credentials (Bcrypt Protected)</span>
                  </div>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 underline"
                  >
                    Generate Random
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
                    <input
                      type="text"
                      required
                      value={formData.initialPassword}
                      onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-teal-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assigned Portal Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                      className="w-full px-3 py-2 bg-white border border-teal-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 font-semibold"
                    >
                      <option value="employee">Employee (Self-Service)</option>
                      <option value="department_manager">Department Manager</option>
                      <option value="hr_manager">HR Manager</option>
                      <option value="finance_officer">Finance Officer</option>
                      <option value="super_admin">Super Administrator</option>
                    </select>
                  </div>
                </div>

                <p className="text-[10px] text-teal-800">
                  🔒 The password will be hashed with 10 rounds of bcrypt salt. The employee can use this email and password to log in immediately.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Register & Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATED USER SUMMARY SUCCESS MODAL */}
      {createdSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Employee & User Account Created!</h3>
                <p className="text-xs text-slate-500">
                  Ready for immediate portal login with bcrypt verification.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee Name:</span>
                <span className="font-bold text-slate-900">
                  {createdSummary.employee.firstName} {createdSummary.employee.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Employee ID:</span>
                <span className="font-mono text-slate-800 font-semibold">{createdSummary.employee.employeeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Login Email:</span>
                <span className="font-mono text-teal-800 font-bold">{createdSummary.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Initial Password:</span>
                <span className="font-mono text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-300">
                  {createdSummary.pass}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Role:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {createdSummary.role.replace('_', ' ')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setCreatedSummary(null)}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Done & Return to Directory
            </button>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Reset User Password</h3>
              </div>
              <button
                onClick={() => setResetModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Reset login password for <span className="font-bold text-slate-800">{resetModalUser.email}</span>.
            </p>

            {resetSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
                {resetSuccessMessage}
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="e.g. NewSecret#2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Update with Bcrypt Hash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {isEditModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#002033] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight">Edit Employee ({selectedEmployee.employeeId})</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={selectedEmployee.firstName}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={selectedEmployee.lastName}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Designation</label>
                <input
                  type="text"
                  value={selectedEmployee.designation}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, designation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Salary ($/mo)</label>
                  <input
                    type="number"
                    value={selectedEmployee.salary}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={selectedEmployee.status}
                    onChange={(e) =>
                      setSelectedEmployee({ ...selectedEmployee, status: e.target.value as Employee['status'] })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Probation">Probation</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

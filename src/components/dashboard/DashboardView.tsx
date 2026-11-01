import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Hourglass,
  Briefcase,
  DollarSign,
  TrendingUp,
  ChevronRight,
  Eye,
  Plus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowUpRight,
  FileCheck,
} from 'lucide-react';
import { Employee, AttendanceRecord, LeaveBalance, LeaveRequest, UserRole } from '../../types/hrms';
import { HrmsService } from '../../services/hrmsService';
import { AttendanceCalcModal } from '../modals/AttendanceCalcModal';
import { LeaveRequestModal } from '../modals/LeaveRequestModal';
import { LeaveViewModal } from '../modals/LeaveViewModal';

interface DashboardViewProps {
  currentUser: Employee;
  currentRole: UserRole;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  currentRole,
  onNavigateTab,
}) => {
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | undefined>(undefined);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>(HrmsService.getLeaveBalance(currentUser.id));
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [activeWorkPlansCount, setActiveWorkPlansCount] = useState(0);
  const [weeklyHours, setWeeklyHours] = useState(38.5);

  // Modals state
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
  const [isViewLeaveOpen, setIsViewLeaveOpen] = useState(false);

  // Load and refresh state
  const refreshData = () => {
    const att = HrmsService.getTodayAttendance(currentUser.id);
    setTodayAttendance(att);
    setLeaveBalance(HrmsService.getLeaveBalance(currentUser.id));
    setLeaveRequests(HrmsService.getLeaveRequests());
    const plans = HrmsService.getWorkPlans().filter(
      (p) => p.employeeId === currentUser.id && p.status === 'In Progress'
    );
    setActiveWorkPlansCount(plans.length);

    // Sum past records for current user
    const records = HrmsService.getAttendanceRecords().filter((r) => r.employeeId === currentUser.id);
    const sumWeek = records.slice(0, 5).reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
    setWeeklyHours(Math.round(sumWeek * 10) / 10 || 38.5);
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('hrms_data_changed', refreshData);
    return () => window.removeEventListener('hrms_data_changed', refreshData);
  }, [currentUser.id]);

  // Today's Date formatted
  const todayDateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Attendance Punch handlers
  const handleCheckIn = () => {
    HrmsService.checkIn(currentUser.id);
    refreshData();
  };

  const handleCheckOut = () => {
    HrmsService.checkOut(currentUser.id);
    refreshData();
  };

  // Calculations for Monthly Working Hours Progress
  const requiredHours = 160.0;
  // Calculate total hours worked in month
  const currentMonthRecords = HrmsService.getAttendanceRecords().filter((r) => r.employeeId === currentUser.id);
  const totalWorkedThisMonth =
    120 + currentMonthRecords.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
  const dynamicHoursWorked = Math.min(160, Math.round(totalWorkedThisMonth * 10) / 10);
  const progressPercent = Math.min(100, Math.round((dynamicHoursWorked / requiredHours) * 1000) / 10);

  // Leave requests awaiting approval
  const pendingLeaves = leaveRequests.filter((r) => r.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* C. MAIN DASHBOARD TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {currentUser.firstName} {currentUser.lastName}!
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">{currentUser.designation}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{currentUser.departmentName}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              ID: {currentUser.employeeId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-medium block">Today's Date</span>
            <span className="text-xs md:text-sm font-semibold text-slate-800">{todayDateStr}</span>
          </div>
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Leave</span>
          </button>
        </div>
      </div>

      {/* D. DASHBOARD WIDGETS (6 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Widget 1: Today's Attendance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Today's Attendance
              </span>
              <Clock className="w-4 h-4 text-teal-600" />
            </div>

            <div className="mt-1">
              <span
                className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                  todayAttendance?.status === 'Checked In'
                    ? 'bg-emerald-100 text-emerald-800'
                    : todayAttendance?.status === 'Checked Out'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {todayAttendance?.status || 'Not Checked In'}
              </span>
            </div>

            <div className="mt-3 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">In:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {todayAttendance?.checkInTime || '--:--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Out:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {todayAttendance?.checkOutTime || '--:--'}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-400">Total:</span>
                <span className="font-bold text-teal-700 font-mono">
                  {todayAttendance?.totalHours ? `${todayAttendance.totalHours} hrs` : '0.0 hrs'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
            {!todayAttendance || todayAttendance.status !== 'Checked In' ? (
              <button
                onClick={handleCheckIn}
                className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold rounded-md transition-colors"
              >
                Punch In
              </button>
            ) : (
              <button
                onClick={handleCheckOut}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-semibold rounded-md transition-colors"
              >
                Punch Out
              </button>
            )}
            <button
              onClick={() => onNavigateTab('attendance')}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
              title="View Full Attendance Log"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Widget 2: Leave Days */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Leave Days
              </span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>

            <div className="mt-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {leaveBalance.remainingDays}
              </span>
              <span className="text-xs text-slate-500 ml-1">Days Left</span>
            </div>

            <div className="mt-3 space-y-1 text-[11px] text-slate-500">
              <div className="flex justify-between">
                <span>Annual:</span>
                <span className="font-semibold text-slate-800 font-mono">{leaveBalance.breakdown.annual.remaining}d</span>
              </div>
              <div className="flex justify-between">
                <span>Sick:</span>
                <span className="font-semibold text-slate-800 font-mono">{leaveBalance.breakdown.sick.remaining}d</span>
              </div>
              <div className="flex justify-between">
                <span>Casual:</span>
                <span className="font-semibold text-slate-800 font-mono">{leaveBalance.breakdown.casual.remaining}d</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('leave-requests')}
            className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center justify-between w-full"
          >
            <span>Leave Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Widget 3: Pending Leaves */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Pending Leaves
              </span>
              <Hourglass className="w-4 h-4 text-amber-500" />
            </div>

            <div className="mt-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {pendingLeaves.length}
              </span>
              <span className="text-xs text-slate-500 ml-1">Requests</span>
            </div>

            <p className="mt-3 text-[11px] text-slate-500 leading-snug">
              {pendingLeaves.length > 0
                ? `${pendingLeaves.length} leave application(s) awaiting manager authorization.`
                : 'All submitted leave requests have been processed.'}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('leave-requests')}
            className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-amber-700 hover:text-amber-900 flex items-center justify-between w-full"
          >
            <span>Review Requests</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Widget 4: Working Hours */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Working Hours
              </span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>

            <div className="mt-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {weeklyHours}
              </span>
              <span className="text-xs text-slate-500 ml-1">hrs this week</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Target: 40.0 hrs</span>
              <span className="font-semibold text-emerald-600">
                {Math.round((weeklyHours / 40) * 100)}% met
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('attendance')}
            className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 flex items-center justify-between w-full"
          >
            <span>View Timesheet</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Widget 5: Active Work Plans */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Active Work Plans
              </span>
              <Briefcase className="w-4 h-4 text-teal-600" />
            </div>

            <div className="mt-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {activeWorkPlansCount}
              </span>
              <span className="text-xs text-slate-500 ml-1">Plans</span>
            </div>

            <p className="mt-3 text-[11px] text-slate-500 leading-snug">
              Milestones tracking Q4 strategic design initiatives and architecture.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('work-plans')}
            className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center justify-between w-full"
          >
            <span>Manage Plans</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Widget 6: Salary */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Salary
              </span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="mt-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                ${currentUser.salary.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 ml-1">{currentUser.currency}</span>
            </div>

            <p className="mt-3 text-[11px] text-emerald-700 font-medium">
              Disbursed on Oct 28, 2026
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('payroll')}
            className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-between w-full"
          >
            <span>View Payslip</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* E. MONTHLY WORKING HOURS PROGRESS (LARGE CARD) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Monthly Working Hours Progress
            </h2>
            <p className="text-xs text-slate-500">
              Attendance tracking cycle for Current Period (Standard 160h required)
            </p>
          </div>

          <button
            onClick={() => setIsCalcModalOpen(true)}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 self-start sm:self-auto hover:underline"
          >
            <span>View Calculation</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-xs text-slate-500 font-medium block">Hours Worked</span>
            <span className="text-xl md:text-2xl font-bold text-slate-900 font-mono mt-1 block tabular-nums">
              {dynamicHoursWorked} <span className="text-xs font-normal text-slate-500">Hours</span>
            </span>
            <span className="text-[11px] text-teal-700 font-medium mt-1 block">
              Logged across regular working shifts
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-xs text-slate-500 font-medium block">Required Hours</span>
            <span className="text-xl md:text-2xl font-bold text-slate-900 font-mono mt-1 block tabular-nums">
              {requiredHours.toFixed(1)} <span className="text-xs font-normal text-slate-500">Hours</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              20 working days × 8.0 hrs/day
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-xs text-slate-500 font-medium block">Progress Percentage</span>
            <span className="text-xl md:text-2xl font-bold text-teal-700 font-mono mt-1 block tabular-nums">
              {progressPercent}%
            </span>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
              On track for standard monthly quota
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-teal-700 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 font-mono">
            <span>0%</span>
            <span>50%</span>
            <span>100% Target ({requiredHours} hrs)</span>
          </div>
        </div>
      </div>

      {/* F. LEAVE REQUESTS AWAITING APPROVAL (TABLE) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Leave Requests Awaiting Approval
            </h2>
            <p className="text-xs text-slate-500">
              Pending and recent employee time-off applications under review
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('leave-requests')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-50 transition-colors"
            >
              View All Leaves
            </button>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Request</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Leave Type</th>
                <th className="px-5 py-3.5">Start Date</th>
                <th className="px-5 py-3.5">End Date</th>
                <th className="px-5 py-3.5 text-center">Number of Days</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaveRequests.slice(0, 5).map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={req.employeeAvatar}
                        alt={req.employeeName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
                        }}
                      />
                      <div>
                        <span className="font-semibold text-slate-800 block">{req.employeeName}</span>
                        <span className="text-[10px] text-slate-400 block">{req.departmentName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-700">{req.leaveType}</td>
                  <td className="px-5 py-3.5 text-slate-600 font-mono tabular-nums">{req.startDate}</td>
                  <td className="px-5 py-3.5 text-slate-600 font-mono tabular-nums">{req.endDate}</td>
                  <td className="px-5 py-3.5 text-center font-bold text-slate-800 font-mono tabular-nums">
                    {req.numberOfDays}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedLeaveRequest(req);
                        setIsViewLeaveOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium rounded-md transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AttendanceCalcModal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
        hoursWorked={dynamicHoursWorked}
        requiredHours={requiredHours}
        progressPercent={progressPercent}
      />

      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        employeeId={currentUser.id}
        leaveBalance={leaveBalance}
        onSuccess={refreshData}
      />

      <LeaveViewModal
        isOpen={isViewLeaveOpen}
        onClose={() => setIsViewLeaveOpen(false)}
        request={selectedLeaveRequest}
        currentRole={currentRole}
        onActionComplete={refreshData}
      />
    </div>
  );
};

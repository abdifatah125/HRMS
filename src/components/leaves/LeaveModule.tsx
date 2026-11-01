import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  List,
  CalendarRange,
  Users,
} from 'lucide-react';
import { LeaveRequest, LeaveBalance, Employee, UserRole } from '../../types/hrms';
import { HrmsService } from '../../services/hrmsService';
import { LeaveRequestModal } from '../modals/LeaveRequestModal';
import { LeaveViewModal } from '../modals/LeaveViewModal';

interface LeaveModuleProps {
  currentUser: Employee;
  currentRole: UserRole;
}

export const LeaveModule: React.FC<LeaveModuleProps> = ({ currentUser, currentRole }) => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance>(HrmsService.getLeaveBalance(currentUser.id));
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'pending' | 'approved' | 'rejected'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');

  // Calendar month state (defaults to November 2026)
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 10, 1)); // Nov 2026

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const loadData = () => {
    setRequests(HrmsService.getLeaveRequests());
    setBalance(HrmsService.getLeaveBalance(currentUser.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hrms_data_changed', loadData);
    return () => window.removeEventListener('hrms_data_changed', loadData);
  }, [currentUser.id]);

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'my') return r.employeeId === currentUser.id;
    if (activeTab === 'pending') return r.status === 'Pending';
    if (activeTab === 'approved') return r.status === 'Approved';
    if (activeTab === 'rejected') return r.status === 'Rejected';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Leave Management & Team Schedule</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit leave requests, check entitlement balances, view team time-off calendar, and process workflows
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* View switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Team Calendar</span>
            </button>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Leave Request</span>
          </button>
        </div>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Annual Leave */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-700">Annual Leave</span>
            <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold">
              Paid
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {balance.breakdown.annual.remaining}
            </span>
            <span className="text-xs text-slate-400">/ {balance.breakdown.annual.total} days</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-600 h-1.5 rounded-full"
              style={{
                width: `${(balance.breakdown.annual.used / balance.breakdown.annual.total) * 100}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {balance.breakdown.annual.used} days used this year
          </span>
        </div>

        {/* Sick Leave */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-700">Sick Leave</span>
            <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">
              Medical
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {balance.breakdown.sick.remaining}
            </span>
            <span className="text-xs text-slate-400">/ {balance.breakdown.sick.total} days</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{
                width: `${(balance.breakdown.sick.used / balance.breakdown.sick.total) * 100}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {balance.breakdown.sick.used} days used
          </span>
        </div>

        {/* Casual Leave */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-700">Casual Leave</span>
            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-semibold">
              Personal
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {balance.breakdown.casual.remaining}
            </span>
            <span className="text-xs text-slate-400">/ {balance.breakdown.casual.total} days</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full"
              style={{
                width: `${(balance.breakdown.casual.used / balance.breakdown.casual.total) * 100}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {balance.breakdown.casual.used} days used
          </span>
        </div>

        {/* Emergency Leave */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-700">Emergency Leave</span>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
              Urgent
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {balance.breakdown.emergency.remaining}
            </span>
            <span className="text-xs text-slate-400">/ {balance.breakdown.emergency.total} days</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full"
              style={{
                width: `${(balance.breakdown.emergency.used / balance.breakdown.emergency.total) * 100}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {balance.breakdown.emergency.used} days used
          </span>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        /* Team Leave Calendar View */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-slate-900">
                {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))
                  }
                  className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCalendarDate(new Date(2026, 10, 1))}
                  className="px-2.5 py-1 text-xs border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 font-semibold transition-colors"
                >
                  Today (Nov 2026)
                </button>
                <button
                  onClick={() =>
                    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))
                  }
                  className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden"
              >
                <option value="All">All Departments</option>
                <option value="Product & Engineering">Product & Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance & Accounting">Finance & Accounting</option>
                <option value="Executive Management">Executive Management</option>
              </select>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                className="bg-slate-50 py-2 text-center text-[11px] font-bold text-slate-600 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}

            {/* Days grid */}
            {(() => {
              const year = calendarDate.getFullYear();
              const month = calendarDate.getMonth();
              const firstDayOffset = new Date(year, month, 1).getDay();
              const totalDays = new Date(year, month + 1, 0).getDate();

              const cells = [];
              for (let i = 0; i < firstDayOffset; i++) {
                cells.push(
                  <div key={`empty-${i}`} className="bg-slate-50/50 min-h-[95px] p-1.5 border-t border-slate-100" />
                );
              }

              for (let d = 1; d <= totalDays; d++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const isToday = dateStr === '2026-11-01';

                const dayLeaves = requests.filter((r) => {
                  if (r.status === 'Rejected') return false;
                  if (selectedDeptFilter !== 'All' && r.departmentName !== selectedDeptFilter) return false;
                  return r.startDate <= dateStr && r.endDate >= dateStr;
                });

                cells.push(
                  <div
                    key={`day-${d}`}
                    className={`bg-white min-h-[95px] p-1.5 flex flex-col justify-between border-t border-slate-100 ${
                      isToday ? 'bg-teal-50/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-mono font-semibold ${
                          isToday
                            ? 'w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]'
                            : 'text-slate-700'
                        }`}
                      >
                        {d}
                      </span>
                      {dayLeaves.length > 0 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {dayLeaves.length} away
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[70px] pr-0.5">
                      {dayLeaves.slice(0, 3).map((r) => {
                        const isAnnual = r.leaveType.includes('Annual');
                        const isSick = r.leaveType.includes('Sick');
                        const isEmergency = r.leaveType.includes('Emergency');

                        const badgeColor = isAnnual
                          ? 'bg-teal-50 border-teal-200 text-teal-800'
                          : isSick
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : isEmergency
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-indigo-50 border-indigo-200 text-indigo-800';

                        return (
                          <button
                            key={r.id}
                            onClick={() => {
                              setSelectedRequest(r);
                              setIsViewModalOpen(true);
                            }}
                            className={`w-full text-left p-1 rounded border text-[10px] font-medium leading-tight truncate transition-all hover:scale-[1.02] shadow-2xs ${badgeColor}`}
                            title={`${r.employeeName} (${r.leaveType}) - ${r.status}`}
                          >
                            <span className="font-semibold">{r.employeeName.split(' ')[0]}</span>: {r.leaveType.replace(' Leave', '')}
                            {r.status === 'Pending' && <span className="ml-1 text-[9px] text-amber-600 font-bold">(?)</span>}
                          </button>
                        );
                      })}
                      {dayLeaves.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-medium block text-center">
                          +{dayLeaves.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              return cells;
            })()}
          </div>

          {/* Calendar Legend & Summary */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-slate-700">Leave Types:</span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded bg-teal-500" /> Annual Leave
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Sick Leave
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Emergency Leave
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500" /> Casual / Other
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Click any schedule chip to review, approve, or inspect full request details
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'my' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Leaves
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'pending'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({requests.filter((r) => r.status === 'Pending').length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'approved'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'rejected'
                ? 'bg-white text-rose-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Leave Type</th>
                <th className="px-5 py-3.5">Start Date</th>
                <th className="px-5 py-3.5">End Date</th>
                <th className="px-5 py-3.5 text-center">Days</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Applied Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
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
                        <span className="font-semibold text-slate-900 block">{req.employeeName}</span>
                        <span className="text-[10px] text-slate-400 block">{req.departmentName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{req.leaveType}</td>
                  <td className="px-5 py-3.5 text-slate-600 font-mono tabular-nums">{req.startDate}</td>
                  <td className="px-5 py-3.5 text-slate-600 font-mono tabular-nums">{req.endDate}</td>
                  <td className="px-5 py-3.5 text-center font-bold text-slate-900 font-mono tabular-nums">
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
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">{req.appliedOn}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setIsViewModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium rounded-md transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{req.status === 'Pending' && currentRole !== 'employee' ? 'Review' : 'View'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

      {/* Modals */}
      <LeaveRequestModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        employeeId={currentUser.id}
        leaveBalance={balance}
        onSuccess={loadData}
      />

      <LeaveViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        request={selectedRequest}
        currentRole={currentRole}
        onActionComplete={loadData}
      />
    </div>
  );
};

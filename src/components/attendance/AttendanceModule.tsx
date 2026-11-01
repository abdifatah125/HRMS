import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Plus,
  X,
  FileEdit,
  Check,
  XCircle,
} from 'lucide-react';
import { AttendanceRecord, AttendanceCorrectionRequest, Employee, UserRole } from '../../types/hrms';
import { HrmsService } from '../../services/hrmsService';

interface AttendanceModuleProps {
  currentUser: Employee;
  currentRole?: UserRole;
}

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({ currentUser, currentRole = 'employee' }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [corrections, setCorrections] = useState<AttendanceCorrectionRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'mine' | 'late' | 'overtime' | 'corrections'>('all');
  const [search, setSearch] = useState('');

  // Correction request modal
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [corrDate, setCorrDate] = useState('2026-10-31');
  const [corrCheckIn, setCorrCheckIn] = useState('08:45 AM');
  const [corrCheckOut, setCorrCheckOut] = useState('05:15 PM');
  const [corrReason, setCorrReason] = useState('');
  const [corrError, setCorrError] = useState<string | null>(null);

  const loadData = () => {
    setRecords(HrmsService.getAttendanceRecords());
    setCorrections(HrmsService.getAttendanceCorrections());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hrms_data_changed', loadData);
    return () => window.removeEventListener('hrms_data_changed', loadData);
  }, []);

  const todayRecord = records.find(
    (r) => r.employeeId === currentUser.id && r.date === new Date().toISOString().split('T')[0]
  );

  const handleCheckIn = () => {
    HrmsService.checkIn(currentUser.id);
    loadData();
  };

  const handleCheckOut = () => {
    HrmsService.checkOut(currentUser.id);
    loadData();
  };

  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    setCorrError(null);

    if (!corrReason.trim()) {
      setCorrError('Please provide a business justification or explanation for the punch correction.');
      return;
    }

    // Find if there is an existing record for that date
    const existingRec = records.find((r) => r.employeeId === currentUser.id && r.date === corrDate);

    HrmsService.submitAttendanceCorrection({
      attendanceId: existingRec ? existingRec.id : `att-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
      date: corrDate,
      requestedCheckIn: corrCheckIn,
      requestedCheckOut: corrCheckOut,
      reason: corrReason.trim(),
    });

    setIsCorrectionModalOpen(false);
    setCorrReason('');
    setFilter('corrections');
    loadData();
  };

  const handleReviewCorrection = (id: string, status: 'Approved' | 'Rejected') => {
    const reviewerName = `${currentUser.firstName} ${currentUser.lastName}`;
    HrmsService.reviewAttendanceCorrection(id, status, reviewerName);
    loadData();
  };

  const filteredRecords = records.filter((r) => {
    if (filter === 'mine' && r.employeeId !== currentUser.id) return false;
    if (filter === 'late' && !r.isLate) return false;
    if (filter === 'overtime' && !r.isOvertime) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.employeeName.toLowerCase().includes(q) || r.date.includes(q);
    }
    return true;
  });

  const pendingCorrectionsCount = corrections.filter((c) => c.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Attendance Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time biometric punch tracking, timesheets, overtime logs, and attendance corrections
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsCorrectionModalOpen(true)}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <FileEdit className="w-3.5 h-3.5 text-teal-600" />
            <span>Request Time Correction</span>
          </button>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Today's Punch</span>
            <span
              className={`text-xs font-bold ${
                todayRecord?.status === 'Checked In'
                  ? 'text-emerald-700'
                  : todayRecord?.status === 'Checked Out'
                  ? 'text-blue-700'
                  : 'text-amber-700'
              }`}
            >
              {todayRecord?.status || 'Not Checked In'}
            </span>
          </div>

          {!todayRecord || todayRecord.status !== 'Checked In' ? (
            <button
              onClick={handleCheckIn}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>Punch In Now</span>
            </button>
          ) : (
            <button
              onClick={handleCheckOut}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>Punch Out Now</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Total Monthly Hours</span>
          <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">154.2 hrs</span>
          <span className="text-[11px] text-emerald-600 mt-1 block">96.3% of 160h required</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">On-Time Arrival Rate</span>
          <span className="text-2xl font-bold text-teal-700 font-mono mt-1 block">95.0%</span>
          <span className="text-[11px] text-slate-500 mt-1 block">1 minor delay recorded</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Overtime Logged</span>
          <span className="text-2xl font-bold text-indigo-700 font-mono mt-1 block">4.8 hrs</span>
          <span className="text-[11px] text-indigo-600 mt-1 block">Calculated at 1.5x rate</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Current Shift Policy</span>
          <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">09:00 - 17:00</span>
          <span className="text-[11px] text-slate-500 mt-1 block">15 min grace window</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg max-w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Logs ({records.length})
          </button>
          <button
            onClick={() => setFilter('mine')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'mine' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Attendance
          </button>
          <button
            onClick={() => setFilter('late')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'late' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Late Arrivals
          </button>
          <button
            onClick={() => setFilter('overtime')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'overtime' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overtime
          </button>
          <button
            onClick={() => setFilter('corrections')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'corrections' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Correction Requests {pendingCorrectionsCount > 0 && `(${pendingCorrectionsCount} pending)`}
          </button>
        </div>

        {filter !== 'corrections' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee or date..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}
      </div>

      {/* Content: Either Logs Table or Corrections Table */}
      {filter === 'corrections' ? (
        /* Correction Requests Table */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Attendance Punch Correction Requests</h2>
              <p className="text-xs text-slate-500">
                Staff adjustment requests for biometric reader errors, off-site meetings, or missed punches
              </p>
            </div>
            <button
              onClick={() => setIsCorrectionModalOpen(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Request</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Target Date</th>
                  <th className="px-5 py-3.5">Requested Check-In</th>
                  <th className="px-5 py-3.5">Requested Check-Out</th>
                  <th className="px-5 py-3.5">Reason / Justification</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {corrections.map((corr) => (
                  <tr key={corr.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{corr.employeeName}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 tabular-nums">{corr.date}</td>
                    <td className="px-5 py-3.5 font-mono text-emerald-700 font-semibold">{corr.requestedCheckIn}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">{corr.requestedCheckOut}</td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate" title={corr.reason}>
                      {corr.reason}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          corr.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : corr.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {corr.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {corr.status === 'Pending' && currentRole !== 'employee' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleReviewCorrection(corr.id, 'Approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReviewCorrection(corr.id, 'Rejected')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {corr.reviewedBy ? `Reviewed by ${corr.reviewedBy.split(' ')[0]}` : 'Under Review'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Attendance Records Table */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Check In</th>
                  <th className="px-5 py-3.5">Check Out</th>
                  <th className="px-5 py-3.5">Hours Worked</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{r.employeeName}</td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono tabular-nums">{r.date}</td>
                    <td className="px-5 py-3.5 font-mono tabular-nums">
                      <span className={r.isLate ? 'text-amber-600 font-semibold' : 'text-slate-700'}>
                        {r.checkInTime || '--:--'}
                      </span>
                      {r.isLate && (
                        <span className="ml-1 text-[10px] text-amber-700 font-sans">
                          (+{r.lateMinutes}m)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-mono tabular-nums">
                      {r.checkOutTime || '--:--'}
                    </td>
                    <td className="px-5 py-3.5 font-bold font-mono text-slate-900 tabular-nums">
                      {r.totalHours ? `${r.totalHours.toFixed(1)} hrs` : '0.0 hrs'}
                      {r.isOvertime && (
                        <span className="ml-1 text-[10px] font-normal text-indigo-600">
                          (+{r.overtimeHours}h OT)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'Checked In'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'Checked Out'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-[11px]">{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Correction Request Modal */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Request Attendance Correction</h3>
                <p className="text-xs text-slate-500">Submit adjustment for review by HR or Supervisor</p>
              </div>
              <button
                onClick={() => setIsCorrectionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCorrection} className="p-5 space-y-4 text-xs">
              {corrError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                  {corrError}
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Date</label>
                <input
                  type="date"
                  value={corrDate}
                  onChange={(e) => setCorrDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Correct Check-In</label>
                  <input
                    type="text"
                    value={corrCheckIn}
                    onChange={(e) => setCorrCheckIn(e.target.value)}
                    placeholder="08:45 AM"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Correct Check-Out</label>
                  <input
                    type="text"
                    value={corrCheckOut}
                    onChange={(e) => setCorrCheckOut(e.target.value)}
                    placeholder="05:15 PM"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason / Business Justification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={corrReason}
                  onChange={(e) => setCorrReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Turnstile scanner error, offsite client presentation, or biometric reader glitch..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Submit Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

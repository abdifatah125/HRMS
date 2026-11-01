import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  FileCheck,
  Building,
  RotateCcw,
  Clock,
  CheckCircle2,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { AuditLogItem, UserRole } from '../../types/hrms';
import { HrmsService } from '../../services/hrmsService';

interface SettingsModuleProps {
  currentRole: UserRole;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ currentRole }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeTab, setActiveTab] = useState<'general' | 'rbac' | 'audit'>('general');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings form state
  const [companyName, setCompanyName] = useState('HRMS Corporate Technologies Inc.');
  const [workDays, setWorkDays] = useState('Monday - Friday');
  const [standardHours, setStandardHours] = useState('8.0');
  const [gracePeriod, setGracePeriod] = useState('15');
  const [overtimeRate, setOvertimeRate] = useState('1.5x');

  const loadData = () => {
    setAuditLogs(HrmsService.getAuditLogs());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hrms_data_changed', loadData);
    return () => window.removeEventListener('hrms_data_changed', loadData);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    HrmsService.logAudit(
      `Updated company working hours policy (Grace: ${gracePeriod}m, Shift: ${standardHours}h/day)`
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFactoryReset = () => {
    if (
      window.confirm(
        'Are you sure you want to restore all employees, attendance, leaves, and payroll records to original factory seed data?'
      )
    ) {
      HrmsService.resetToSeed();
    }
  };

  const permissionsMatrix = [
    { module: 'Personal Dashboard & Self-Service', emp: true, dept: true, hr: true, fin: true, admin: true },
    { module: 'Clock In / Clock Out Attendance', emp: true, dept: true, hr: true, fin: true, admin: true },
    { module: 'Submit Time-Off & Leave Requests', emp: true, dept: true, hr: true, fin: true, admin: true },
    { module: 'Approve Department Leave Requests', emp: false, dept: true, hr: true, fin: false, admin: true },
    { module: 'Employee Directory & Profiles', emp: true, dept: true, hr: true, fin: true, admin: true },
    { module: 'Register & Edit Employee Data', emp: false, dept: false, hr: true, fin: false, admin: true },
    { module: 'Monthly Payroll Batch Processing', emp: false, dept: false, hr: false, fin: true, admin: true },
    { module: 'View & Download Personal Payslips', emp: true, dept: true, hr: true, fin: true, admin: true },
    { module: 'Executive Reports & Analytics', emp: false, dept: true, hr: true, fin: true, admin: true },
    { module: 'System Configuration & Audit Logs', emp: false, dept: false, hr: true, fin: false, admin: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Governance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Shift policies, role-based authorization matrix, and real-time security audit trails
          </p>
        </div>

        <button
          onClick={handleFactoryReset}
          className="flex items-center gap-1.5 px-3 py-2 border border-rose-300 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Factory Seed</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg max-w-fit">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'general' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Shift & Working Policy
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'rbac' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Role-Based Access (RBAC)
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs max-w-3xl">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-1">Company Working Hours Policy</h2>
          <p className="text-xs text-slate-500 mb-5">
            Configure default working day shifts, biometric grace minutes, and overtime multipliers
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Configuration policies saved successfully and recorded in audit log.</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Organization Legal Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Work Days</label>
                <input
                  type="text"
                  value={workDays}
                  onChange={(e) => setWorkDays(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Daily Hours Target</label>
                <input
                  type="number"
                  step="0.5"
                  value={standardHours}
                  onChange={(e) => setStandardHours(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Morning Late Grace Period (Minutes)
                </label>
                <input
                  type="number"
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Overtime Pay Multiplier</label>
                <input
                  type="text"
                  value={overtimeRate}
                  onChange={(e) => setOvertimeRate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Save Policies
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RBAC Matrix Tab */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Role-Based Access Control (RBAC) Matrix</h2>
              <p className="text-xs text-slate-500">Fine-grained permission mapping across all HRMS modules</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Current Role:</span>
              <span className="px-2.5 py-1 bg-teal-50 border border-teal-200 rounded text-xs font-bold text-teal-800 capitalize">
                {currentRole.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">System Capability / Module</th>
                  <th className="px-4 py-3.5 text-center">Employee</th>
                  <th className="px-4 py-3.5 text-center">Dept Manager</th>
                  <th className="px-4 py-3.5 text-center">HR Manager</th>
                  <th className="px-4 py-3.5 text-center">Finance Officer</th>
                  <th className="px-4 py-3.5 text-center">Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{row.module}</td>
                    <td className="px-4 py-3.5 text-center">
                      {row.emp ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {row.dept ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {row.hr ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {row.fin ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {row.admin ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200/80">
            <h2 className="text-base font-bold text-slate-900">System Security & Mutation Audit Logs</h2>
            <p className="text-xs text-slate-500">
              Immutable ledger of sensitive operations including attendance punches, leaves, and payroll runs
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Actor</th>
                  <th className="px-5 py-3.5">Action Code</th>
                  <th className="px-5 py-3.5">Details</th>
                  <th className="px-5 py-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-mono text-slate-600 text-[11px] tabular-nums whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{log.actorName}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{log.details}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-400 text-[11px]">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

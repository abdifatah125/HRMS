import React from 'react';
import { X, Calculator, Calendar, Clock, CheckCircle } from 'lucide-react';

interface AttendanceCalcModalProps {
  isOpen: boolean;
  onClose: () => void;
  hoursWorked: number;
  requiredHours: number;
  progressPercent: number;
}

export const AttendanceCalcModal: React.FC<AttendanceCalcModalProps> = ({
  isOpen,
  onClose,
  hoursWorked,
  requiredHours,
  progressPercent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#002033] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold tracking-tight">Monthly Working Hours Calculation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-700">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
            <div className="flex justify-between items-center text-slate-600">
              <span>Standard Monthly Working Days:</span>
              <span className="font-semibold text-slate-900 font-mono">20 Days</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Daily Shift Requirement:</span>
              <span className="font-semibold text-slate-900 font-mono">8.0 Hours / Day</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Gross Required Hours (20 × 8h):</span>
              <span className="font-semibold text-slate-900 font-mono">160.0 Hours</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Approved Leave Deductions:</span>
              <span className="font-semibold text-emerald-600 font-mono">0.0 Hours</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold text-slate-900">
              <span>Net Standard Hours Target:</span>
              <span className="text-teal-700 font-mono text-sm">{requiredHours.toFixed(1)} Hours</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Actual Attendance Progress
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center">
                <span className="text-[10px] text-teal-700 font-semibold uppercase block">Logged Hours</span>
                <span className="text-base font-bold text-teal-900 font-mono">{hoursWorked.toFixed(1)} h</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-600 font-semibold uppercase block">Required</span>
                <span className="text-base font-bold text-slate-900 font-mono">{requiredHours.toFixed(1)} h</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-700 font-semibold uppercase block">Completion</span>
                <span className="text-base font-bold text-emerald-900 font-mono">{progressPercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-[11px] leading-relaxed flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Calculated automatically using biometric punch-in and check-out logs stored in the relational database. Overtime beyond 8 hours is tracked separately in payroll.
            </p>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-lg transition-colors"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};

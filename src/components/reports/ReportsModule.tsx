import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download, Printer, Filter, Calendar } from 'lucide-react';
import { HrmsService } from '../../services/hrmsService';

const ATTENDANCE_TREND = [
  { month: 'Jun', attendanceRate: 94.2, overtimeHours: 18 },
  { month: 'Jul', attendanceRate: 96.5, overtimeHours: 22 },
  { month: 'Aug', attendanceRate: 95.1, overtimeHours: 19 },
  { month: 'Sep', attendanceRate: 97.4, overtimeHours: 25 },
  { month: 'Oct', attendanceRate: 98.2, overtimeHours: 28 },
  { month: 'Nov', attendanceRate: 97.0, overtimeHours: 14 },
];

const DEPT_HEADCOUNT = [
  { name: 'Engineering', count: 18, budget: 450 },
  { name: 'Marketing', count: 8, budget: 290 },
  { name: 'HR', count: 6, budget: 180 },
  { name: 'Finance', count: 5, budget: 220 },
  { name: 'Executive', count: 3, budget: 500 },
];

const LEAVE_UTILIZATION = [
  { name: 'Annual Leave', value: 48, color: '#0d9488' },
  { name: 'Sick Leave', value: 24, color: '#2563eb' },
  { name: 'Casual Leave', value: 16, color: '#4f46e5' },
  { name: 'Emergency', value: 8, color: '#d97706' },
  { name: 'Unpaid Leave', value: 4, color: '#64748b' },
];

export const ReportsModule: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState('2026-Q4');

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Month,AttendanceRate,OvertimeHours,EngineeringStaff,MarketingStaff,HRStaff,FinanceStaff\n' +
      ATTENDANCE_TREND.map((row) => `${row.month},${row.attendanceRate}%,${row.overtimeHours}h,18,8,6,5`).join(
        '\n'
      );
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HRMS_Executive_Analytics_Report_${selectedRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive HR Analytics & Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-departmental attendance metrics, leave utilization, headcount distribution, and fiscal costs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Total Headcount</span>
          <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">40 Employees</span>
          <span className="text-[11px] text-teal-700 mt-1 block">Across 5 departments</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Average Attendance Rate</span>
          <span className="text-2xl font-bold text-emerald-700 font-mono mt-1 block">97.4%</span>
          <span className="text-[11px] text-slate-500 mt-1 block">+1.2% higher vs Q3</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Annual Leave Burn Rate</span>
          <span className="text-2xl font-bold text-blue-700 font-mono mt-1 block">42.8%</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Optimal for year-end target</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Total Monthly Payroll</span>
          <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">$248,500</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Within 3.5% budget margin</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Monthly Attendance Reliability (%)</h3>
          <p className="text-xs text-slate-500 mb-4">6-month trend of biometric shift compliance</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ATTENDANCE_TREND}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="attendanceRate"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#attGrad)"
                  name="Attendance %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Headcount by Department */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Department Headcount Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Full-time staff allocated by operational function</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_HEADCOUNT}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f766e" radius={[6, 6, 0, 0]} name="Headcount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave Type Utilization */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Leave Utilization by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Proportion of approved employee time-off days</p>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={LEAVE_UTILIZATION}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {LEAVE_UTILIZATION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Budget vs Expenses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Annual Budget Allocation ($k)</h3>
          <p className="text-xs text-slate-500 mb-4">Departmental annual capital and operating funds</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_HEADCOUNT}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `$${value}k`} />
                <Bar dataKey="budget" fill="#1e293b" radius={[6, 6, 0, 0]} name="Budget ($k)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

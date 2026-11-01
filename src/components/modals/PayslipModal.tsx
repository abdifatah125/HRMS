import React from 'react';
import { X, Printer, Download, CheckCircle, Building } from 'lucide-react';
import { PayrollRecord } from '../../types/hrms';

interface PayslipModalProps {
  payroll: PayrollRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ payroll, isOpen, onClose }) => {
  if (!isOpen || !payroll) return null;

  const totalEarnings =
    payroll.basicSalary +
    payroll.allowances.housing +
    payroll.allowances.transport +
    payroll.allowances.medical +
    payroll.allowances.performance +
    payroll.overtimePay;

  const totalDeductions =
    payroll.deductions.tax +
    payroll.deductions.healthInsurance +
    payroll.deductions.providentFund;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header toolbar */}
        <div className="px-6 py-4 bg-[#002033] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold tracking-tight">Official Salary Slip - {payroll.month}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Payslip Paper Content */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-800 bg-white">
          {/* Company branding & invoice stamp */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-md bg-[#002033] text-teal-400 font-bold flex items-center justify-center text-xs">
                  HR
                </div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">HRMS ENTERPRISE CORP</h2>
              </div>
              <p className="text-[11px] text-slate-500">100 Technology Plaza, Suite 400</p>
              <p className="text-[11px] text-slate-500">Seattle, WA 98101 · hr-payroll@hrms-corp.internal</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                DISBURSED
              </span>
              <p className="text-xs font-mono font-semibold text-slate-900 mt-2">Ref: SLIP-{payroll.id.toUpperCase()}</p>
              <p className="text-[11px] text-slate-500">Disbursed: {payroll.paymentDate}</p>
            </div>
          </div>

          {/* Employee Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Employee Name</span>
              <span className="font-bold text-slate-900 block mt-0.5">{payroll.employeeName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Designation</span>
              <span className="font-semibold text-slate-800 block mt-0.5">{payroll.designation}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
              <span className="font-semibold text-slate-800 block mt-0.5">{payroll.departmentName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pay Period</span>
              <span className="font-bold text-teal-700 block mt-0.5">{payroll.month}</span>
            </div>
          </div>

          {/* Earnings vs Deductions Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 text-[11px] uppercase tracking-wider flex justify-between">
                <span>Earnings & Allowances</span>
                <span>Amount ({payroll.currency})</span>
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex justify-between text-slate-600">
                  <span>Basic Salary</span>
                  <span className="font-mono font-semibold text-slate-900">${payroll.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="font-mono font-semibold text-slate-900">${payroll.allowances.housing.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Conveyance & Transport</span>
                  <span className="font-mono font-semibold text-slate-900">${payroll.allowances.transport.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Medical Allowance</span>
                  <span className="font-mono font-semibold text-slate-900">${payroll.allowances.medical.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Performance Incentive</span>
                  <span className="font-mono font-semibold text-slate-900">${payroll.allowances.performance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Overtime Hours Payout</span>
                  <span className="font-mono font-semibold text-slate-900">${payroll.overtimePay.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Total Gross Earnings:</span>
                  <span className="font-mono text-teal-700">${totalEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 text-[11px] uppercase tracking-wider flex justify-between">
                <span>Statutory Deductions</span>
                <span>Amount ({payroll.currency})</span>
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex justify-between text-slate-600">
                  <span>Income Tax Withholding</span>
                  <span className="font-mono font-semibold text-rose-600">-${payroll.deductions.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Corporate Health Insurance</span>
                  <span className="font-mono font-semibold text-rose-600">-${payroll.deductions.healthInsurance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Provident / Retirement Fund (401k)</span>
                  <span className="font-mono font-semibold text-rose-600">-${payroll.deductions.providentFund.toLocaleString()}</span>
                </div>
                <div className="pt-16 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Total Deductions:</span>
                  <span className="font-mono text-rose-600">-${totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Box */}
          <div className="p-4 bg-teal-50 border-2 border-teal-500/40 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block">
                Net Take-Home Salary
              </span>
              <span className="text-[11px] text-teal-700">Credited via Direct Deposit</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-teal-900">
                ${payroll.netSalary.toLocaleString()}
              </span>
              <span className="text-xs text-teal-700 font-semibold ml-1">{payroll.currency}</span>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-[10px] text-slate-400">
            This is a computer-generated official payroll voucher requiring no manual signature. Generated by HRMS Enterprise.
          </p>
        </div>
      </div>
    </div>
  );
};

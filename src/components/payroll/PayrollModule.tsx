import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  FileText,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  RefreshCw,
  TrendingUp,
  CreditCard,
  Plus,
  Receipt,
  Check,
  X,
  FileCheck,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { PayrollRecord, ExpenseClaim, Employee, UserRole } from '../../types/hrms';
import { HrmsService } from '../../services/hrmsService';
import { PayslipModal } from '../modals/PayslipModal';

interface PayrollModuleProps {
  currentUser: Employee;
  currentRole: UserRole;
}

export const PayrollModule: React.FC<PayrollModuleProps> = ({ currentUser, currentRole }) => {
  const [activeSubTab, setActiveSubTab] = useState<'payroll' | 'expenses'>('payroll');
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expenseClaims, setExpenseClaims] = useState<ExpenseClaim[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Expense Claim Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseClaim['category']>('Travel & Transport');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('2026-10-31');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('uber_receipt_nov2026.pdf');
  const [expenseError, setExpenseError] = useState<string | null>(null);

  const loadData = () => {
    setPayrolls(HrmsService.getPayrollRecords());
    setEmployees(HrmsService.getEmployees());
    setExpenseClaims(HrmsService.getExpenseClaims());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hrms_data_changed', loadData);
    return () => window.removeEventListener('hrms_data_changed', loadData);
  }, []);

  const handleProcessPayroll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      employees.forEach((emp) => {
        HrmsService.processPayroll(emp.id, 'November 2026');
      });
      setIsProcessing(false);
      loadData();
    }, 600);
  };

  const handleCreateExpenseClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError(null);

    const amountNum = parseFloat(expenseAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setExpenseError('Please enter a valid expense amount greater than 0.');
      return;
    }
    if (!expenseDescription.trim()) {
      setExpenseError('Please provide a description of the business expense.');
      return;
    }

    HrmsService.submitExpenseClaim({
      employeeId: currentUser.id,
      employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
      departmentName: currentUser.departmentName,
      category: expenseCategory,
      amount: amountNum,
      currency: 'USD',
      date: expenseDate,
      description: expenseDescription.trim(),
      receiptFileName: receiptFileName || 'receipt_doc.pdf',
      receiptFileSize: '245 KB',
    });

    setIsExpenseModalOpen(false);
    setExpenseAmount('');
    setExpenseDescription('');
    loadData();
  };

  const handleReviewExpense = (id: string, status: 'Approved' | 'Rejected' | 'Reimbursed') => {
    const reviewerName = `${currentUser.firstName} ${currentUser.lastName}`;
    HrmsService.reviewExpenseClaim(id, status, reviewerName);
    loadData();
  };

  const totalPayrollExpense = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const pendingExpenses = expenseClaims.filter((c) => c.status === 'Pending');
  const totalPendingExpenseAmount = pendingExpenses.reduce((sum, c) => sum + c.amount, 0);
  const totalReimbursedAmount = expenseClaims
    .filter((c) => c.status === 'Reimbursed' || c.status === 'Approved')
    .reduce((sum, c) => sum + c.amount, 0);

  const canProcess =
    currentRole === 'super_admin' || currentRole === 'finance_officer' || currentRole === 'hr_manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Financial & Compensation Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated payroll runs, payslips, statutory deductions, and employee reimbursement expense claims
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {activeSubTab === 'expenses' ? (
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Expense Claim</span>
            </button>
          ) : (
            canProcess && (
              <button
                onClick={handleProcessPayroll}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Disbursing Batch...' : 'Process November Payroll'}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('payroll')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'payroll'
                ? 'bg-[#002033] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Payroll Disbursements & Payslips</span>
          </button>
          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'expenses'
                ? 'bg-[#002033] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Expense Claims & Reimbursements</span>
            {pendingExpenses.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold ml-1">
                {pendingExpenses.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeSubTab === 'payroll' ? (
        <>
          {/* KPI Cards Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Total Monthly Disbursement</span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">
                ${totalPayrollExpense.toLocaleString()}
              </span>
              <span className="text-[11px] text-teal-700 mt-1 block">Across all departmental staff</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">My Monthly Net Salary</span>
              <span className="text-2xl font-bold text-emerald-700 font-mono mt-1 block">
                ${currentUser.salary.toLocaleString()} USD
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">Direct deposit on the 28th</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Next Pay Cycle</span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">Nov 28, 2026</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Monthly automated ACH</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Tax Compliance</span>
              <span className="text-2xl font-bold text-teal-700 font-mono mt-1 block">100% Verified</span>
              <span className="text-[11px] text-slate-500 mt-1 block">W-2 / 1099 statutory compliant</span>
            </div>
          </div>

          {/* Current Salary Structure Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              Personal Compensation & Allowance Breakdown
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Breakdown of base pay, statutory allowances, and direct payroll deductions for {currentUser.firstName} {currentUser.lastName}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Salary */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-600 block">Base Pay & Rate</span>
                <div className="text-xl font-bold font-mono text-slate-900">
                  ${Math.round(currentUser.salary * 0.75).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500">Contractual monthly base compensation (75% ratio)</p>
              </div>

              {/* Allowances */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                <span className="text-xs font-bold text-emerald-800 block">Allowances & Benefits</span>
                <div className="text-xl font-bold font-mono text-emerald-700">
                  +${Math.round(currentUser.salary * 0.25).toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-700 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Housing Allowance:</span>
                    <span className="font-mono">${Math.round(currentUser.salary * 0.12)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transport Allowance:</span>
                    <span className="font-mono">${Math.round(currentUser.salary * 0.06)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical Care:</span>
                    <span className="font-mono">$250</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 space-y-2">
                <span className="text-xs font-bold text-rose-800 block">Statutory Deductions</span>
                <div className="text-xl font-bold font-mono text-rose-700">
                  -${Math.round(currentUser.salary * 0.08).toLocaleString()}
                </div>
                <div className="text-[11px] text-rose-700 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Withholding Tax:</span>
                    <span className="font-mono">5.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Health Insurance:</span>
                    <span className="font-mono">$120</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retirement / PF:</span>
                    <span className="font-mono">$150</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payroll History Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Payroll Processing History</h2>
                <p className="text-xs text-slate-500">Corporate disbursements, tax withholdings, and verified payslips</p>
              </div>
              <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                {payrolls.length} Records Logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Employee</th>
                    <th className="px-5 py-3.5">Pay Period</th>
                    <th className="px-5 py-3.5">Payment Date</th>
                    <th className="px-5 py-3.5">Basic</th>
                    <th className="px-5 py-3.5">Allowances</th>
                    <th className="px-5 py-3.5">Deductions</th>
                    <th className="px-5 py-3.5">Net Pay</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Payslip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrolls.map((p) => {
                    const totalAllowances =
                      p.allowances.housing +
                      p.allowances.transport +
                      p.allowances.medical +
                      p.allowances.performance +
                      p.overtimePay;
                    const totalDeds =
                      p.deductions.tax + p.deductions.healthInsurance + p.deductions.providentFund;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-900">{p.employeeName}</td>
                        <td className="px-5 py-3.5 font-medium text-slate-800">{p.month}</td>
                        <td className="px-5 py-3.5 text-slate-600 font-mono tabular-nums">{p.paymentDate}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-700">${p.basicSalary.toLocaleString()}</td>
                        <td className="px-5 py-3.5 font-mono text-emerald-600">+${totalAllowances.toLocaleString()}</td>
                        <td className="px-5 py-3.5 font-mono text-rose-600">-${totalDeds.toLocaleString()}</td>
                        <td className="px-5 py-3.5 font-bold font-mono text-slate-900">${p.netSalary.toLocaleString()}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedSlip(p);
                              setIsSlipOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-teal-700 bg-teal-50 hover:bg-teal-100 font-semibold rounded-md transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Slip</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Expense Claims Section */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Awaiting Approval</span>
              <span className="text-2xl font-bold text-amber-700 font-mono mt-1 block">
                ${totalPendingExpenseAmount.toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {pendingExpenses.length} claims submitted
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Approved & Disbursed</span>
              <span className="text-2xl font-bold text-emerald-700 font-mono mt-1 block">
                ${totalReimbursedAmount.toFixed(2)}
              </span>
              <span className="text-[11px] text-emerald-600 mt-1 block">Processed via ACH deposit</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Corporate Expense Policy</span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">Tier-1 Corp</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Receipt required for &gt;$25</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Employee Expense Reimbursement Claims
                </h2>
                <p className="text-xs text-slate-500">
                  Track travel receipts, meals, equipment purchases, and approval stages
                </p>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Claim</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Claim ID</th>
                    <th className="px-5 py-3.5">Employee</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Expense Date</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Receipt</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenseClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{claim.claimNumber}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-900 block">{claim.employeeName}</span>
                        <span className="text-[11px] text-slate-400">{claim.departmentName}</span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{claim.category}</td>
                      <td className="px-5 py-3.5 text-slate-600 font-mono tabular-nums">{claim.date}</td>
                      <td className="px-5 py-3.5 font-bold font-mono text-slate-900">
                        ${claim.amount.toFixed(2)} {claim.currency}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        <span className="inline-flex items-center gap-1 text-[11px] text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                          <Receipt className="w-3 h-3" />
                          <span>{claim.receiptFileName || 'receipt.pdf'}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            claim.status === 'Reimbursed'
                              ? 'bg-purple-100 text-purple-800'
                              : claim.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : claim.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {canProcess && claim.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleReviewExpense(claim.id, 'Approved')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                            >
                              <Check className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReviewExpense(claim.id, 'Rejected')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : canProcess && claim.status === 'Approved' ? (
                          <button
                            onClick={() => handleReviewExpense(claim.id, 'Reimbursed')}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Mark Paid</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {claim.reviewedBy ? `Reviewed by ${claim.reviewedBy.split(' ')[0]}` : 'Under Review'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Submit Expense Claim Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Submit Business Expense Claim</h3>
                <p className="text-xs text-slate-500">Provide category, amount, and attach your expense receipt</p>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpenseClaim} className="p-5 space-y-4 text-xs">
              {expenseError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                  {expenseError}
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expense Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as ExpenseClaim['category'])}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
                >
                  <option value="Travel & Transport">Travel & Transport (Cabs, Flights, Rail)</option>
                  <option value="Meals & Entertainment">Meals & Entertainment (Client lunch, team dinner)</option>
                  <option value="Office Supplies">Office Supplies & Stationery</option>
                  <option value="Client Meeting">Client Meeting & Hospitality</option>
                  <option value="Training & Certification">Training & Professional Certification</option>
                  <option value="Other">Other Reimbursable Expense</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="e.g. 145.50"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date Occurred</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Description / Justification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g. Taxi fare to client headquarters for Quarterly Business Review..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Attached Digital Receipt</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={receiptFileName}
                    onChange={(e) => setReceiptFileName(e.target.value)}
                    placeholder="receipt_scan.pdf"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px]"
                  />
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer hover:bg-slate-200">
                    Browse...
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Submit Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      <PayslipModal
        isOpen={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
        payroll={selectedSlip}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { LeaveRequest, UserRole } from '../../types/hrms';
import { HrmsService } from '../../services/hrmsService';

interface LeaveViewModalProps {
  request: LeaveRequest | null;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onActionComplete: () => void;
}

export const LeaveViewModal: React.FC<LeaveViewModalProps> = ({
  request,
  isOpen,
  onClose,
  currentRole,
  onActionComplete,
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!isOpen || !request) return null;

  const canApprove =
    request.status === 'Pending' &&
    (currentRole === 'super_admin' || currentRole === 'hr_manager' || currentRole === 'department_manager');

  const handleApprove = () => {
    HrmsService.approveLeaveRequest(request.id);
    onActionComplete();
    onClose();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }
    HrmsService.rejectLeaveRequest(request.id, rejectReason);
    onActionComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#002033] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold tracking-tight">Leave Request Details</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <img
              src={request.employeeAvatar}
              alt={request.employeeName}
              className="w-12 h-12 rounded-full object-cover border border-slate-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
              }}
            />
            <div>
              <h4 className="text-sm font-bold text-slate-900">{request.employeeName}</h4>
              <p className="text-slate-500 text-[11px]">{request.departmentName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    request.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : request.status === 'Pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {request.status}
                </span>
                <span className="text-slate-400 text-[10px]">Applied on {request.appliedOn}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Leave Type</span>
              <span className="font-semibold text-slate-900 text-xs mt-0.5 block">{request.leaveType}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Duration</span>
              <span className="font-semibold text-teal-700 text-xs mt-0.5 block font-mono">
                {request.numberOfDays} Days ({request.startDate} to {request.endDate})
              </span>
            </div>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Stated Reason</span>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed">
              {request.reason}
            </div>
          </div>

          {request.reviewedBy && (
            <div className="p-3 rounded-lg bg-slate-100/70 border border-slate-200 text-[11px]">
              <span className="text-slate-500 block">Reviewed by:</span>
              <span className="font-semibold text-slate-800">{request.reviewedBy}</span>
              <span className="text-slate-500 ml-1">at {request.reviewedAt}</span>
              {request.rejectionReason && (
                <p className="text-rose-600 mt-1 font-medium">Rejection Reason: {request.rejectionReason}</p>
              )}
            </div>
          )}

          {canApprove && (
            <div className="pt-2 border-t border-slate-100 space-y-3">
              {showRejectInput && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Rejection</label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter rejection reason for employee records..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                {!showRejectInput ? (
                  <>
                    <button
                      onClick={() => setShowRejectInput(true)}
                      className="px-4 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={handleApprove}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Request</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowRejectInput(false)}
                      className="px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Confirm Rejection
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

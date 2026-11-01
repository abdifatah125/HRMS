import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Shield,
  CreditCard,
  Edit2,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { Employee, UserRole } from '../../types/hrms';
import { HrmsService } from '../../services/hrmsService';

interface ProfileViewProps {
  currentUser: Employee;
  currentRole: UserRole;
  onUpdateUser: (updated: Employee) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onUpdateUser, currentRole }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(currentUser.phone);
  const [address, setAddress] = useState(currentUser.address);
  const [emergencyContact, setEmergencyContact] = useState(currentUser.emergencyContact);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const authUser = HrmsService.getCurrentAuthUser();

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!currentPassword) {
      setPassError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPassError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPass(true);
    try {
      HrmsService.changeCurrentPassword(currentPassword, newPassword);
      setPassSuccess('Your password has been changed successfully and re-hashed with bcrypt (10 rounds).');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(null), 6000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to change password. Please check your current password.';
      setPassError(message);
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = HrmsService.updateEmployee(currentUser.id, {
      phone,
      address,
      emergencyContact,
    });
    onUpdateUser(updated);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-[#002033] to-[#0a4163] relative" />
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4 -mt-12">
            <img
              src={currentUser.avatar}
              alt={currentUser.firstName}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-white shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
              }}
            />
            <div className="mb-1">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                {currentUser.firstName} {currentUser.lastName}
              </h1>
              <p className="text-xs text-teal-700 font-semibold mt-0.5">{currentUser.designation}</p>
              <p className="text-[11px] text-slate-500">{currentUser.departmentName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>Profile updated</span>
              </span>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Editing' : 'Edit Contact Details'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employment & Organization */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight pb-2 border-b border-slate-100">
            Corporate Employment Details
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Employee ID:</span>
              <span className="font-mono font-bold text-slate-800">{currentUser.employeeId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-slate-800">{currentUser.departmentName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Reporting Line Manager:</span>
              <span className="font-semibold text-slate-800">{currentUser.managerName || 'David Sterling (CEO)'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Employment Type:</span>
              <span className="font-semibold text-slate-800">{currentUser.employmentType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Date of Joining:</span>
              <span className="font-mono text-slate-800">{currentUser.joinDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Employment Status:</span>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {currentUser.status}
              </span>
            </div>
          </div>
        </div>

        {/* Contact & Personal Information */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight pb-2 border-b border-slate-100">
            Personal & Emergency Contact
          </h2>

          {!isEditing ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Official Email:</span>
                <span className="font-semibold text-slate-800">{currentUser.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-800">{currentUser.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Residential Address:</span>
                <span className="font-semibold text-slate-800 text-right">{currentUser.address}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Emergency Contact:</span>
                <span className="font-semibold text-slate-800">{currentUser.emergencyContact}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Direct Deposit Bank:</span>
                <span className="font-semibold text-slate-800">{currentUser.bankAccount.bankName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Account Number:</span>
                <span className="font-mono text-slate-800">{currentUser.bankAccount.accountNumber}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Emergency Contact</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Security & Password Management (Self-Service) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Security & Portal Password</h2>
              <p className="text-xs text-slate-500">
                Self-service password change. All credentials are encrypted with bcrypt (10 salt rounds).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span>RBAC Role: {currentRole}</span>
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Security Info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-3 text-xs">
            <span className="text-slate-800 font-bold block uppercase tracking-wider text-[10px]">
              Credential Telemetry
            </span>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Login Account:</span>
                <span className="font-mono text-slate-900 font-semibold">{authUser?.email || currentUser.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Encryption Method:</span>
                <span className="font-mono text-teal-700 font-bold">bcrypt (10 rounds)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Session Status:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active Token
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Account Access:</span>
                <span className="text-slate-800 font-semibold">Active Self-Service</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200/70 text-[11px] text-slate-500 leading-relaxed">
              <p className="font-semibold text-slate-700 mb-0.5">Password Policy:</p>
              • Minimum 8 alphanumeric characters
              <br />• Must not match your previous password
              <br />• Updates the relational database hash instantly
            </div>
          </div>

          {/* Password Change Form */}
          <form onSubmit={handlePasswordChange} className="lg:col-span-2 space-y-4 text-xs">
            {passError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <p className="font-semibold text-xs">Password Update Failed</p>
                  <p className="text-[11px] mt-0.5">{passError}</p>
                </div>
              </div>
            )}

            {passSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-emerald-800">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-xs">Password Updated Successfully</p>
                  <p className="text-[11px] mt-0.5">{passSuccess}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current portal password"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isChangingPass}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isChangingPass ? 'Hashing & Updating...' : 'Update Portal Password'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

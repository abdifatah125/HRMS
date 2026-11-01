import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { HrmsService } from '../../services/hrmsService';
import { AuthUser, Employee } from '../../types/hrms';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser, employee: Employee) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('alex.morgan@hrms-corp.internal');
  const [password, setPassword] = useState('Employee@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCredentialsHelper, setShowCredentialsHelper] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Authenticate using real bcrypt comparison
      const result = await HrmsService.login({ email, password });
      onLoginSuccess(result.user, result.employee);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#001726] flex items-center justify-center p-4 antialiased font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Login Card */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
        
        {/* Left Column: Brand & Security Guarantee */}
        <div className="md:col-span-5 bg-[#002033] p-8 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#082a40]">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center p-1">
                <img
                  src="/src/assets/images/hrms_portal_logo_1793517543713.jpg"
                  alt="HRMS"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white block">HRMS PORTAL</span>
                <span className="text-[11px] text-teal-400 font-medium">Enterprise Security</span>
              </div>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white leading-snug mb-3">
              Corporate Employee Portal
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Authorized personnel sign-in gateway. All sessions are encrypted with industry-standard TLS and bcrypt password hashing.
            </p>

            <div className="space-y-3.5 border-t border-[#082a40] pt-5">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Bcrypt password hashing (10 salt rounds)</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <KeyRound className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>JWT session tokens & cryptographic verification</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Strict role-based module authorization</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#082a40] flex items-center justify-between text-[11px] text-slate-400">
            <span>Corporate System v2.6</span>
            <span className="text-teal-400 font-mono">TLS 1.3 Active</span>
          </div>
        </div>

        {/* Right Column: Sign In Form */}
        <div className="md:col-span-7 p-6 md:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Sign in to your Account
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Enter your work email and password to access the portal
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Work Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@hrms-corp.internal"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold text-slate-700">Password</label>
                  <span className="text-[10px] text-slate-400">Secured with Bcrypt</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password..."
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                  />
                  <span>Remember my login on this device</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowCredentialsHelper(!showCredentialsHelper)}
                  className="text-teal-700 hover:text-teal-900 font-semibold text-[11px] hover:underline"
                >
                  {showCredentialsHelper ? 'Hide default credentials' : 'View default credentials'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-xs mt-2"
              >
                {isLoading ? (
                  <span>Verifying Credentials with Bcrypt...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sign In to HRMS Portal</span>
                  </>
                )}
              </button>
            </form>

            {/* Optional Collapsible Credentials Info for testing */}
            {showCredentialsHelper && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1.5 animate-in fade-in duration-150">
                <span className="font-bold text-slate-800 block text-[11px] mb-1">
                  Default System Accounts (Bcrypt Protected):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] font-mono">
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <span className="font-bold block text-slate-800">Employee (Alex):</span>
                    <span className="text-slate-600 block truncate">alex.morgan@hrms-corp.internal</span>
                    <span className="text-teal-700">Pass: Employee@123</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <span className="font-bold block text-slate-800">HR Manager (Sarah):</span>
                    <span className="text-slate-600 block truncate">sarah.jenkins@hrms-corp.internal</span>
                    <span className="text-teal-700">Pass: HrManager@123</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <span className="font-bold block text-slate-800">Super Admin (David):</span>
                    <span className="text-slate-600 block truncate">david.sterling@hrms-corp.internal</span>
                    <span className="text-teal-700">Pass: Admin@123</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <span className="font-bold block text-slate-800">Finance (Marcus):</span>
                    <span className="text-slate-600 block truncate">marcus.vance@hrms-corp.internal</span>
                    <span className="text-teal-700">Pass: Finance@123</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Human Resource Management System · Corporate Self-Service & Admin
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

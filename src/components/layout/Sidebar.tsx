import React from 'react';
import {
  LayoutDashboard,
  User,
  CalendarCheck2,
  Briefcase,
  CalendarClock,
  FolderKanban,
  Clock,
  Users,
  Network,
  Laptop,
  FileText,
  Settings,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Employee, UserRole } from '../../types/hrms';

export type NavItemKey =
  | 'dashboard'
  | 'profile'
  | 'work-plans'
  | 'job-opportunities'
  | 'leave-requests'
  | 'projects'
  | 'attendance'
  | 'directory'
  | 'org-chart'
  | 'assets'
  | 'documents'
  | 'payroll'
  | 'departments'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  currentUser: Employee;
  currentRole: UserRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  currentRole,
  isMobileOpen,
  onCloseMobile,
  onLogout,
}) => {
  const portalNavItems: { key: NavItemKey; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'profile', label: 'My Profile', icon: User },
    { key: 'work-plans', label: 'Work Plans', icon: CalendarCheck2 },
    { key: 'job-opportunities', label: 'Job Opportunities', icon: Briefcase },
    { key: 'leave-requests', label: 'Your Leave Requests', icon: CalendarClock },
    { key: 'projects', label: 'My Projects', icon: FolderKanban },
    { key: 'attendance', label: 'Attendance', icon: Clock },
    { key: 'directory', label: 'Employee Directory', icon: Users },
    { key: 'org-chart', label: 'Organization Chart', icon: Network },
    { key: 'assets', label: 'My Assets', icon: Laptop },
    { key: 'documents', label: 'Documents & Templates', icon: FileText },
    { key: 'payroll', label: 'Payroll & Salary', icon: ShieldCheck },
    { key: 'reports', label: 'Reports & Analytics', icon: CalendarCheck2 },
  ];

  const handleNavClick = (key: NavItemKey) => {
    onSelectTab(key);
    if (window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  const isSettingsAuthorized = currentRole === 'super_admin' || currentRole === 'hr_manager';

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[228px] bg-[#002033] text-slate-200 flex flex-col transition-transform duration-200 ease-in-out border-r border-[#082a40] ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Logo */}
        <div className="pt-4 pb-3 px-4 border-b border-[#082a40] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-teal-500/10 flex items-center justify-center p-0.5 border border-teal-500/30">
              <img
                src="/src/assets/images/hrms_portal_logo_1793517543713.jpg"
                alt="HRMS"
                className="w-full h-full object-cover rounded-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">HRMS PORTAL</span>
              <span className="text-[10px] text-teal-400 font-medium block">Enterprise v2.6</span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Employee Profile Card inside Sidebar */}
        <div className="px-3.5 py-3 border-b border-[#082a40] bg-[#021826]/60">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={`${currentUser.firstName} ${currentUser.lastName}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-teal-400/40 shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
                }}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#002033]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-semibold text-white truncate leading-tight">
                {currentUser.firstName} {currentUser.lastName}
              </h3>
              <p className="text-[11px] text-teal-300/90 truncate leading-tight mt-0.5">
                {currentUser.designation}
              </p>
              <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                {currentUser.departmentName}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {/* Section: PORTAL */}
          <div>
            <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              PORTAL
            </div>
            <nav className="space-y-0.5">
              {portalNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors text-left ${
                      isActive
                        ? 'bg-[#0b3856] text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#07283c]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                    {item.key === 'leave-requests' && (
                      <span className="ml-auto text-[10px] font-semibold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                        2
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section: SYSTEM */}
          <div>
            <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              SYSTEM
            </div>
            <nav className="space-y-0.5">
              <button
                onClick={() => handleNavClick('settings')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors text-left ${
                  currentTab === 'settings'
                    ? 'bg-[#0b3856] text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-[#07283c]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Settings
                    className={`w-4 h-4 shrink-0 ${
                      currentTab === 'settings' ? 'text-teal-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">Settings</span>
                </div>
                {!isSettingsAuthorized && (
                  <span className="text-[9px] text-slate-400 uppercase bg-slate-800 px-1 rounded">Admin</span>
                )}
              </button>

              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-950/30 rounded-md transition-colors text-left"
              >
                <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Footer info badge */}
        <div className="p-3 border-t border-[#082a40] text-[10px] text-slate-400 flex items-center justify-between">
          <span>Active Session</span>
          <span className="text-teal-400 font-mono text-[10px]">Secure SSL</span>
        </div>
      </aside>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { DashboardView } from './components/dashboard/DashboardView';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { LeaveModule } from './components/leaves/LeaveModule';
import { EmployeeModule } from './components/employees/EmployeeModule';
import { PayrollModule } from './components/payroll/PayrollModule';
import { WorkPlanModule } from './components/workplans/WorkPlanModule';
import { JobOpportunitiesModule } from './components/jobs/JobOpportunitiesModule';
import { OrgChartModule } from './components/orgchart/OrgChartModule';
import { DocumentsModule } from './components/documents/DocumentsModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { ProfileView } from './components/profile/ProfileView';
import { AssetsModule } from './components/assets/AssetsModule';
import { ProjectsModule } from './components/projects/ProjectsModule';
import { LoginView } from './components/auth/LoginView';
import { HrmsService } from './services/hrmsService';
import { Employee, UserRole, AuthUser } from './types/hrms';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Employee>(HrmsService.getCurrentEmployee());
  const [currentRole, setCurrentRole] = useState<UserRole>(HrmsService.getCurrentRole());
  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(HrmsService.getCurrentAuthUser()));

  // Sync state if localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentUser(HrmsService.getCurrentEmployee());
      setCurrentRole(HrmsService.getCurrentRole());
      setIsLoggedIn(Boolean(HrmsService.getCurrentAuthUser()));
    };
    window.addEventListener('hrms_data_changed', handleStorageChange);
    return () => window.removeEventListener('hrms_data_changed', handleStorageChange);
  }, []);

  const handleLogout = () => {
    HrmsService.logout();
    setIsLoggedIn(false);
  };

  const handleLoginSuccess = (user: AuthUser, employee: Employee) => {
    setCurrentUser(employee);
    setCurrentRole(user.role);
    setIsLoggedIn(true);
  };

  // If logged out or unauthenticated, render the Bcrypt secure LoginView
  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F7F9] flex text-slate-800 antialiased font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 228px Left Fixed Navy Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        currentRole={currentRole}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area (Offset by 228px on large screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[228px] transition-all duration-200">
        {/* Top Navigation Bar */}
        <TopHeader
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          currentUser={currentUser}
          currentRole={currentRole}
          onNavigateTab={setCurrentTab}
          onLogout={handleLogout}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              currentRole={currentRole}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              currentRole={currentRole}
              onUpdateUser={setCurrentUser}
            />
          )}

          {currentTab === 'attendance' && (
            <AttendanceModule
              currentUser={currentUser}
              currentRole={currentRole}
            />
          )}

          {currentTab === 'leave-requests' && (
            <LeaveModule
              currentUser={currentUser}
              currentRole={currentRole}
            />
          )}

          {currentTab === 'directory' && (
            <EmployeeModule currentRole={currentRole} />
          )}

          {currentTab === 'payroll' && (
            <PayrollModule
              currentUser={currentUser}
              currentRole={currentRole}
            />
          )}

          {currentTab === 'work-plans' && (
            <WorkPlanModule
              currentUser={currentUser}
              currentRole={currentRole}
            />
          )}

          {currentTab === 'job-opportunities' && (
            <JobOpportunitiesModule currentRole={currentRole} />
          )}

          {currentTab === 'org-chart' && (
            <OrgChartModule />
          )}

          {currentTab === 'documents' && (
            <DocumentsModule
              currentUser={currentUser}
              currentRole={currentRole}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsModule />
          )}

          {currentTab === 'assets' && (
            <AssetsModule currentUser={currentUser} />
          )}

          {currentTab === 'projects' && (
            <ProjectsModule currentUser={currentUser} />
          )}

          {currentTab === 'settings' && (
            <SettingsModule currentRole={currentRole} />
          )}
        </main>
      </div>
    </div>
  );
}

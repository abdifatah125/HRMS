import React from 'react';
import { Network, Building2, Mail, Phone, ChevronDown } from 'lucide-react';
import { HrmsService } from '../../services/hrmsService';

export const OrgChartModule: React.FC = () => {
  const employees = HrmsService.getEmployees();

  // CEO
  const ceo = employees.find((e) => e.role === 'super_admin') || employees[1];
  // Department heads
  const hrHead = employees.find((e) => e.role === 'hr_manager') || employees[2];
  const techLead = employees.find((e) => e.id === 'emp-1004') || employees[0];
  const financeHead = employees.find((e) => e.role === 'finance_officer') || employees[3];
  const marketingHead = employees.find((e) => e.role === 'department_manager') || employees[5];

  // Engineering staff under tech lead
  const engStaff = employees.filter((e) => e.departmentId === 'dept-1' && e.id !== techLead.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Organization Hierarchy Chart</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enterprise leadership reporting structure from Executive Suite to departmental staff
        </p>
      </div>

      {/* Visual Tree */}
      <div className="bg-white p-8 rounded-xl border border-slate-200/80 shadow-2xs overflow-x-auto flex flex-col items-center">
        {/* Tier 1: CEO */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-64 p-4 rounded-xl bg-slate-900 text-white shadow-md border border-slate-800 text-center relative group">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-teal-500 text-slate-950 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
              Executive
            </span>
            <img
              src={ceo.avatar}
              alt={ceo.firstName}
              className="w-14 h-14 rounded-full mx-auto object-cover border-2 border-teal-400 mt-1 mb-2"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256';
              }}
            />
            <h3 className="font-bold text-sm text-white">{ceo.firstName} {ceo.lastName}</h3>
            <p className="text-xs text-teal-300 font-medium">{ceo.designation}</p>
            <p className="text-[11px] text-slate-400 mt-1">{ceo.departmentName}</p>
          </div>
          {/* Vertical connecting line */}
          <div className="w-0.5 h-8 bg-slate-300 mt-0" />
        </div>

        {/* Tier 2: Horizontal Bar connecting Department Heads */}
        <div className="w-full max-w-4xl relative mb-6">
          <div className="h-0.5 bg-slate-300 w-full" />
          <div className="grid grid-cols-4 gap-4 pt-6">
            {/* Dept 1: Product & Engineering */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-slate-300 -mt-6 mb-0" />
              <div className="w-full p-3.5 rounded-xl bg-teal-50/70 border border-teal-300 shadow-xs text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">
                  Engineering
                </span>
                <img
                  src={techLead.avatar}
                  alt={techLead.firstName}
                  className="w-11 h-11 rounded-full mx-auto object-cover border-2 border-teal-500 mt-2 mb-1.5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
                  }}
                />
                <h4 className="font-bold text-xs text-slate-900">{techLead.firstName} {techLead.lastName}</h4>
                <p className="text-[11px] text-teal-800 font-medium leading-tight">{techLead.designation}</p>
                <span className="text-[10px] text-slate-500 mt-1 block">18 Staff</span>
              </div>

              {/* Connecting to Engineering staff */}
              <div className="w-0.5 h-6 bg-slate-300 my-0" />
              {engStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="w-full p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs text-center mt-2"
                >
                  <img
                    src={staff.avatar}
                    alt={staff.firstName}
                    className="w-8 h-8 rounded-full mx-auto object-cover border border-slate-200 mb-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
                    }}
                  />
                  <h5 className="font-semibold text-xs text-slate-900">{staff.firstName} {staff.lastName}</h5>
                  <p className="text-[10px] text-slate-500 leading-tight">{staff.designation}</p>
                </div>
              ))}
            </div>

            {/* Dept 2: Human Resources */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-slate-300 -mt-6 mb-0" />
              <div className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                  HR & People
                </span>
                <img
                  src={hrHead.avatar}
                  alt={hrHead.firstName}
                  className="w-11 h-11 rounded-full mx-auto object-cover border border-slate-300 mt-2 mb-1.5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
                  }}
                />
                <h4 className="font-bold text-xs text-slate-900">{hrHead.firstName} {hrHead.lastName}</h4>
                <p className="text-[11px] text-slate-600 font-medium leading-tight">{hrHead.designation}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">6 Staff</span>
              </div>
            </div>

            {/* Dept 3: Finance */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-slate-300 -mt-6 mb-0" />
              <div className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                  Finance & Fiscal
                </span>
                <img
                  src={financeHead.avatar}
                  alt={financeHead.firstName}
                  className="w-11 h-11 rounded-full mx-auto object-cover border border-slate-300 mt-2 mb-1.5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256';
                  }}
                />
                <h4 className="font-bold text-xs text-slate-900">{financeHead.firstName} {financeHead.lastName}</h4>
                <p className="text-[11px] text-slate-600 font-medium leading-tight">{financeHead.designation}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">5 Staff</span>
              </div>
            </div>

            {/* Dept 4: Marketing */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-slate-300 -mt-6 mb-0" />
              <div className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                  Marketing & Growth
                </span>
                <img
                  src={marketingHead.avatar}
                  alt={marketingHead.firstName}
                  className="w-11 h-11 rounded-full mx-auto object-cover border border-slate-300 mt-2 mb-1.5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256';
                  }}
                />
                <h4 className="font-bold text-xs text-slate-900">{marketingHead.firstName} {marketingHead.lastName}</h4>
                <p className="text-[11px] text-slate-600 font-medium leading-tight">{marketingHead.designation}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">8 Staff</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

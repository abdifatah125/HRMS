import React from 'react';
import { FolderKanban, Users, Calendar, CheckCircle2 } from 'lucide-react';
import { Employee } from '../../types/hrms';

interface ProjectsModuleProps {
  currentUser: Employee;
}

export const ProjectsModule: React.FC<ProjectsModuleProps> = ({ currentUser }) => {
  const projects = [
    {
      id: 'prj-1',
      title: 'Global HRMS Portal Core Migration',
      description: 'End-to-end rewrite of legacy employee portal into modern React 19 and Express REST architecture.',
      department: 'Product & Engineering',
      progress: 92,
      teamSize: 6,
      deadline: '2026-11-20',
      status: 'Active Sprint',
    },
    {
      id: 'prj-2',
      title: 'Automated Biometric Shift Synchronization',
      description: 'Zero-latency integration between physical office turnstile hardware and cloud attendance database.',
      department: 'Product & Engineering',
      progress: 75,
      teamSize: 4,
      deadline: '2026-12-15',
      status: 'In Progress',
    },
    {
      id: 'prj-3',
      title: 'Corporate Benefit Portal & Open Enrollment 2027',
      description: 'Annual employee benefits selection interface with medical, dental, and 401(k) election wizards.',
      department: 'Human Resources',
      progress: 40,
      teamSize: 5,
      deadline: '2027-01-10',
      status: 'Planning',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Assigned Strategic Projects</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Cross-functional deliverables and team roadmaps assigned to {currentUser.firstName} {currentUser.lastName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {projects.map((prj) => (
          <div
            key={prj.id}
            className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {prj.department}
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {prj.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2 mb-2 leading-snug">{prj.title}</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">{prj.description}</p>

              <div className="mb-4">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Milestone Progress</span>
                  <span className="font-mono text-slate-800">{prj.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${prj.progress}%` }} />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{prj.teamSize} Team Members</span>
              </span>
              <span>Due: {prj.deadline}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

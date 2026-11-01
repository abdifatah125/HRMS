import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Users,
  MapPin,
  Clock,
  DollarSign,
  ChevronRight,
  X,
  CheckCircle2,
} from 'lucide-react';
import { JobVacancy, JobApplication, UserRole } from '../../types/hrms';
import { HrmsService } from '../../services/hrmsService';

interface JobOpportunitiesModuleProps {
  currentRole: UserRole;
}

export const JobOpportunitiesModule: React.FC<JobOpportunitiesModuleProps> = ({ currentRole }) => {
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [activeTab, setActiveTab] = useState<'vacancies' | 'candidates'>('vacancies');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New vacancy state
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Product & Engineering');
  const [location, setLocation] = useState('Seattle, WA (Hybrid)');
  const [salaryRange, setSalaryRange] = useState('$120,000 - $150,000 / yr');
  const [description, setDescription] = useState('');

  const loadData = () => {
    setVacancies(HrmsService.getJobVacancies());
    setApplications(HrmsService.getJobApplications());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hrms_data_changed', loadData);
    return () => window.removeEventListener('hrms_data_changed', loadData);
  }, []);

  const handlePostVacancy = (e: React.FormEvent) => {
    e.preventDefault();
    HrmsService.addJobVacancy({
      title,
      department,
      location,
      type: 'Full-time',
      experienceLevel: '4+ Years',
      openings: 1,
      postedDate: new Date().toISOString().split('T')[0],
      deadline: '2026-12-31',
      status: 'Active',
      salaryRange,
      description,
    });
    setIsAddOpen(false);
    setTitle('');
    setDescription('');
    loadData();
  };

  const handleUpdateStatus = (appId: string, status: JobApplication['status']) => {
    HrmsService.updateApplicationStatus(appId, status);
    loadData();
  };

  const canManageRecruitment =
    currentRole === 'super_admin' || currentRole === 'hr_manager' || currentRole === 'department_manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Job Opportunities & Talent Recruitment
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal job board, open headcount requisitions, and applicant tracking pipeline
          </p>
        </div>

        {canManageRecruitment && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Vacancy</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg max-w-fit">
        <button
          onClick={() => setActiveTab('vacancies')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'vacancies' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Open Vacancies ({vacancies.length})
        </button>
        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'candidates' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Applicant Pipeline ({applications.length})
        </button>
      </div>

      {/* Vacancies Tab */}
      {activeTab === 'vacancies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vacancies.map((vac) => (
            <div
              key={vac.id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {vac.department}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {vac.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2 mb-2 leading-snug">{vac.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">{vac.description}</p>

                <div className="space-y-1.5 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{vac.location} · {vac.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-700 font-medium">{vac.salaryRange}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{vac.applicantCount} candidates applied</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Deadline: {vac.deadline}</span>
                <button
                  onClick={() => setActiveTab('candidates')}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                >
                  <span>View Pipeline</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidates Pipeline Tab */}
      {activeTab === 'candidates' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200/80">
            <h2 className="text-base font-bold text-slate-900">Active Candidates in Recruitment Funnel</h2>
            <p className="text-xs text-slate-500">Track interviews, offer stages, and hiring decisions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Candidate</th>
                  <th className="px-5 py-3.5">Position</th>
                  <th className="px-5 py-3.5">Applied Date</th>
                  <th className="px-5 py-3.5">Recruiter Notes</th>
                  <th className="px-5 py-3.5">Stage</th>
                  <th className="px-5 py-3.5 text-right">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-900 block">{app.candidateName}</span>
                      <span className="text-[11px] text-slate-400 block">{app.email} · {app.phone}</span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{app.jobTitle}</td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono">{app.appliedDate}</td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs">{app.notes}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          app.status === 'Offered' || app.status === 'Hired'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'Interview'
                            ? 'bg-blue-100 text-blue-800'
                            : app.status === 'Screening'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {canManageRecruitment && (
                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleUpdateStatus(app.id, e.target.value as JobApplication['status'])
                          }
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-slate-700"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Screening">Screening</option>
                          <option value="Interview">Interview</option>
                          <option value="Offered">Offered</option>
                          <option value="Hired">Hired</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Post Vacancy Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#002033] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight">Publish Job Requisition</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostVacancy} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Security Architect"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value="Product & Engineering">Product & Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                  <option value="Brand & Marketing">Brand & Marketing</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location & Format</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    required
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Description & Responsibilities</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize candidate expectations and qualification requirements..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-xs"
                >
                  Publish Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

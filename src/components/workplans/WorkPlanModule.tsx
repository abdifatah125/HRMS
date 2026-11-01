import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  CheckSquare,
  X,
  Target,
  ListTodo,
} from 'lucide-react';
import { WorkPlan, Employee, UserRole } from '../../types/hrms';
import { HrmsService } from '../../services/hrmsService';

interface WorkPlanModuleProps {
  currentUser: Employee;
  currentRole: UserRole;
}

export const WorkPlanModule: React.FC<WorkPlanModuleProps> = ({ currentUser, currentRole }) => {
  const [plans, setPlans] = useState<WorkPlan[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quarter, setQuarter] = useState('Q4 2026');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('2026-12-31');
  const [tasksText, setTasksText] = useState('Draft architectural proposal\nHost design team review\nFinalize tokens');

  const loadData = () => {
    setPlans(HrmsService.getWorkPlans());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hrms_data_changed', loadData);
    return () => window.removeEventListener('hrms_data_changed', loadData);
  }, []);

  const handleToggleTask = (planId: string, taskId: string) => {
    HrmsService.toggleWorkPlanTask(planId, taskId);
    loadData();
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const taskLines = tasksText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const tasks = taskLines.map((t, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      title: t,
      isCompleted: false,
      dueDate,
    }));

    HrmsService.addWorkPlan({
      employeeId: currentUser.id,
      employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
      title,
      description,
      quarter,
      startDate,
      dueDate,
      status: 'In Progress',
      progressPercentage: 0,
      tasks,
    });

    setIsAddOpen(false);
    setTitle('');
    setDescription('');
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Employee Work Plans & Goals</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quarterly strategic roadmaps, milestones, deliverables, and interactive task checklists
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Work Plan</span>
        </button>
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {plan.quarter}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">{plan.title}</h3>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    plan.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {plan.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">{plan.description}</p>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-500">Milestone Progress</span>
                  <span className="font-bold text-slate-800 font-mono">{plan.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${plan.progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Task list with interactive checkboxes */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Action Items ({plan.tasks.filter((t) => t.isCompleted).length}/{plan.tasks.length} Completed)
                </span>
                {plan.tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleToggleTask(plan.id, task.id)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left text-xs group"
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 group-hover:text-teal-600 shrink-0" />
                    )}
                    <span
                      className={`flex-1 ${
                        task.isCompleted ? 'line-through text-slate-400' : 'text-slate-700 font-medium'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">Due {task.dueDate}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Owner: {plan.employeeName}</span>
              <span>Deadline: {plan.dueDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Plan Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#002033] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold tracking-tight">Create Strategic Work Plan</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Plan Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cloud Security Audit & Hardening"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quarter & Cycle</label>
                <select
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value="Q4 2026">Q4 2026</option>
                  <option value="Q1 2027">Q1 2027</option>
                  <option value="Q2 2027">Q2 2027</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Objectives</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe target outcomes and measurable success criteria..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deliverable Tasks (One per line)
                </label>
                <textarea
                  rows={3}
                  required
                  value={tasksText}
                  onChange={(e) => setTasksText(e.target.value)}
                  placeholder="Task 1&#10;Task 2&#10;Task 3"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px]"
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
                  Publish Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

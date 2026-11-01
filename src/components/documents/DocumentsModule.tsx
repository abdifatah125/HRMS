import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, Search, Filter, CheckCircle2, X } from 'lucide-react';
import { EmployeeDocument, Employee, UserRole } from '../../types/hrms';
import { HrmsService } from '../../services/hrmsService';

interface DocumentsModuleProps {
  currentUser: Employee;
  currentRole: UserRole;
}

export const DocumentsModule: React.FC<DocumentsModuleProps> = ({ currentUser, currentRole }) => {
  const [docs, setDocs] = useState<EmployeeDocument[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EmployeeDocument['category']>('Contract');
  const [fileName, setFileName] = useState('');

  const loadData = () => {
    setDocs(HrmsService.getDocuments());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hrms_data_changed', loadData);
    return () => window.removeEventListener('hrms_data_changed', loadData);
  }, []);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    HrmsService.addDocument({
      title,
      category,
      fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
      fileSize: '1.8 MB',
      employeeId: currentUser.id,
    });
    setIsUploadOpen(false);
    setTitle('');
    setFileName('');
    loadData();
  };

  const handleDownload = (doc: EmployeeDocument) => {
    // Generate a simple text file download simulation with actual blob
    const element = document.createElement('a');
    const file = new Blob(
      [
        `============================================================\nHRMS ENTERPRISE OFFICIAL DOCUMENT ARCHIVE\nTitle: ${doc.title}\nCategory: ${doc.category}\nFile: ${doc.fileName}\nEmployee: ${currentUser.firstName} ${currentUser.lastName}\nDownloaded: ${new Date().toISOString()}\n============================================================\n[Official corporate records verified under HRMS ISO-27001 policy]`,
      ],
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = doc.fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredDocs = docs.filter((d) => {
    if (filter !== 'all' && d.category !== filter) return false;
    if (search) {
      return (
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.fileName.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Documents, Policies & HR Templates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Employment contracts, non-disclosure agreements, handbooks, and appraisal forms
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          {['all', 'Contract', 'Policy', 'HR Template', 'Certificate'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === cat ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? 'All Files' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between hover:border-teal-300 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-teal-700" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  {doc.category}
                </span>
                <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">{doc.title}</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">{doc.fileName}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">{doc.fileSize} · {doc.uploadedAt}</span>
              <button
                onClick={() => handleDownload(doc)}
                className="flex items-center gap-1 px-2.5 py-1 text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 font-semibold text-xs rounded-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#002033] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight">Upload Employee Document</h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 2026 Bonus Plan Addendum"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EmployeeDocument['category'])}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value="Contract">Contract</option>
                  <option value="Policy">Policy</option>
                  <option value="HR Template">HR Template</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Identification">Identification</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">File Name</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. signed_addendum_2026.pdf"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-center">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs text-slate-600 font-medium block">
                  Drag and drop PDF or DOCX file
                </span>
                <span className="text-[10px] text-slate-400">Up to 25 MB supported</span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-xs"
                >
                  Upload & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

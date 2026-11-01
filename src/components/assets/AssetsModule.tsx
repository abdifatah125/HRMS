import React from 'react';
import { Laptop, Monitor, Key, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Employee } from '../../types/hrms';

interface AssetsModuleProps {
  currentUser: Employee;
}

export const AssetsModule: React.FC<AssetsModuleProps> = ({ currentUser }) => {
  const assets = [
    {
      id: 'ast-101',
      name: 'Apple MacBook Pro 16" (M3 Max / 64GB / 1TB)',
      tag: 'AST-LPT-4921',
      category: 'Workstation Laptop',
      assignedDate: '2023-03-20',
      condition: 'Excellent',
      warrantyExpiry: '2027-03-20',
      serialNumber: 'C02G80P1MD6R',
    },
    {
      id: 'ast-102',
      name: 'Dell UltraSharp 32" 4K Video Conferencing Monitor',
      tag: 'AST-MON-1184',
      category: 'Display & Peripherals',
      assignedDate: '2023-03-22',
      condition: 'Excellent',
      warrantyExpiry: '2026-03-22',
      serialNumber: 'CN-0N86H0-74261',
    },
    {
      id: 'ast-103',
      name: 'Yubico YubiKey 5C NFC Security Key',
      tag: 'AST-SEC-9902',
      category: 'Hardware 2FA Token',
      assignedDate: '2023-03-15',
      condition: 'Active',
      warrantyExpiry: 'Lifetime',
      serialNumber: 'YK-5C-8812491',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Corporate Asset Management</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Company hardware, laptops, security authenticators, and peripheral inventory assigned to {currentUser.firstName} {currentUser.lastName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {asset.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{asset.condition}</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1 leading-snug">{asset.name}</h3>
              <p className="text-xs font-mono font-semibold text-slate-500 mb-4">Tag: {asset.tag}</p>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned On:</span>
                  <span className="font-mono text-slate-700">{asset.assignedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Warranty:</span>
                  <span className="font-mono text-slate-700">{asset.warrantyExpiry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Serial No:</span>
                  <span className="font-mono text-slate-800 font-semibold">{asset.serialNumber}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Custody: Personal Check-out</span>
              <span className="text-teal-700 font-medium">IT Verified</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

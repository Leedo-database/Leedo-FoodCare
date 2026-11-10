import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { FileClock, Search, ShieldCheck } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const { auditLogs } = useData();
  const { formatDate } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState<string>('all');

  const modules = [
    'all',
    'Procurement',
    'Distribution',
    'Receiving Confirmation',
    'Daily Consumption',
    'Requisitions',
    'Accounts',
    'HR Management',
    'Monthly Closing',
    'Master Catalog',
    'Wastage',
  ];

  const filtered = auditLogs.filter((log) => {
    const matchMod = filterModule === 'all' || log.module === filterModule;
    const matchSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.eid.includes(search) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    return matchMod && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileClock className="w-6 h-6 text-emerald-600" />
            Immutable System Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tamper-proof chronological trail of all database mutations, approvals, and security events (6-year retention)
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Append-Only Retention Enforced
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search audit trail by EID, user, action or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
        >
          {modules.map((m) => (
            <option key={m} value={m}>
              {m === 'all' ? 'All Modules' : m}
            </option>
          ))}
        </select>

        <span className="text-slate-400 ml-auto">
          {filtered.length} Log Entries Recorded
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-3">EID</th>
              <th className="py-3 px-3">Employee Name</th>
              <th className="py-3 px-3">Action Event</th>
              <th className="py-3 px-3">Module</th>
              <th className="py-3 px-3">Facility</th>
              <th className="py-3 px-3">Record Ref</th>
              <th className="py-3 px-4">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition text-[11px]">
                <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                <td className="py-2.5 px-3 font-bold text-slate-900">{log.eid}</td>
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 whitespace-nowrap">
                  {log.userName}
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800 font-sans">
                    {log.action}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-sans text-slate-600 whitespace-nowrap">{log.module}</td>
                <td className="py-2.5 px-3 uppercase text-slate-700">{log.facilityId || 'CENTRAL'}</td>
                <td className="py-2.5 px-3 text-emerald-700 font-bold whitespace-nowrap">
                  {log.recordId || '-'}
                </td>
                <td className="py-2.5 px-4 font-sans text-slate-700">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

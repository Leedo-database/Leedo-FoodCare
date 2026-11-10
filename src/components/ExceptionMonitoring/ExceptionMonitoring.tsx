import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ManagementException } from '../../types';
import { AlertOctagon, CheckCircle2, Search, Filter, ShieldAlert } from 'lucide-react';

export const ExceptionMonitoring: React.FC = () => {
  const { exceptions, resolveException } = useData();
  const { currentUser, canAccessFacility } = useAuth();
  const { formatDate } = useLanguage();

  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedExc, setSelectedExc] = useState<ManagementException | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const filtered = exceptions.filter((e) => {
    const matchFac = canAccessFacility(e.facilityId);
    const matchSev = filterSeverity === 'all' || e.severity === filterSeverity;
    const matchStat = filterStatus === 'all' || e.status === filterStatus;
    return matchFac && matchSev && matchStat;
  });

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExc || !resolutionNote.trim()) return;

    await resolveException(selectedExc.id, resolutionNote);
    setSelectedExc(null);
    setResolutionNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-rose-600" />
            Management Exception Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automated compliance audits: dispatch shortages, price spikes, food cost deviations & budget overruns
          </p>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open (Unresolved)</option>
          <option value="investigating">Under Investigation</option>
          <option value="resolved">Resolved</option>
        </select>

        <span className="ml-auto text-slate-400">
          Showing {filtered.length} Flagged Exceptions
        </span>
      </div>

      {/* Exceptions Grid */}
      <div className="space-y-3">
        {filtered.map((exc) => {
          const isResolved = exc.status === 'resolved';
          return (
            <div
              key={exc.id}
              className={`p-4 rounded-xl border text-xs transition ${
                isResolved
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : exc.severity === 'high' || exc.severity === 'critical'
                  ? 'bg-rose-50/50 border-rose-300 shadow-xs'
                  : 'bg-amber-50/50 border-amber-300 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      exc.severity === 'critical' || exc.severity === 'high'
                        ? 'bg-rose-200 text-rose-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {exc.severity}
                  </span>
                  <span className="font-mono text-slate-500 font-bold">{exc.id}</span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="font-bold text-slate-800 uppercase">
                    Facility: {exc.facilityId}
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-600 font-medium">Dept: {exc.responsibleDepartment}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{formatDate(exc.date)}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {exc.status}
                  </span>
                </div>
              </div>

              <div className="mt-2">
                <h3 className="font-bold text-slate-900 text-sm">{exc.title}</h3>
                <p className="text-slate-600 mt-1 leading-relaxed">{exc.description}</p>
              </div>

              {exc.resolutionNote && (
                <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
                  <strong>Management Resolution:</strong> {exc.resolutionNote} &bull;{' '}
                  <span className="text-[11px] text-emerald-700">Resolved on {exc.resolvedAt}</span>
                </div>
              )}

              {!isResolved && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedExc(exc);
                      setResolutionNote('');
                    }}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs transition"
                  >
                    Investigate & Resolve Exception
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            No management exceptions flagged for your facility scope.
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {selectedExc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Resolve Management Exception</h2>
            <p className="text-xs text-slate-500 mb-3">{selectedExc.title}</p>

            <form onSubmit={handleResolve} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Management Finding & Resolution Action Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Record justification, vendor credit adjustment, or corrective inventory action"
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedExc(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Mark as Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

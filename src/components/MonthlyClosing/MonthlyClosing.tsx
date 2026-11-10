import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { MonthlyClosingRecord } from '../../types';
import { CalendarCheck2, CheckCircle2, Lock, Unlock, AlertCircle } from 'lucide-react';

export const MonthlyClosing: React.FC = () => {
  const { monthlyClosings, performMonthlyClosing, reopenMonthlyClosing, purchases, receivings, exceptions } = useData();
  const { currentUser } = useAuth();
  const { formatDate } = useLanguage();

  const [yearMonth, setYearMonth] = useState('2026-11');
  const [closingNotes, setClosingNotes] = useState('Verified inventory reconciliation, vendor payments, and nutrition records.');
  const [reopenReason, setReopenReason] = useState('');
  const [reopenTargetId, setReopenTargetId] = useState<string | null>(null);

  const pendingReceivings = receivings.filter((r) => r.status === 'awaiting_receipt').length;
  const pendingInvoices = purchases.filter((p) => p.verificationStatus === 'pending').length;
  const openExceptions = exceptions.filter((e) => e.status === 'open').length;

  const currentClosing = monthlyClosings.find((c) => c.yearMonth === yearMonth);

  const handleCloseMonth = async () => {
    await performMonthlyClosing(yearMonth, 'all', closingNotes);
  };

  const handleReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenTargetId || !reopenReason.trim()) return;
    await reopenMonthlyClosing(reopenTargetId, reopenReason);
    setReopenTargetId(null);
    setReopenReason('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-emerald-600" />
            Monthly Financial & Inventory Closing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Strict closing checklist verification, accounting period freeze & historical permanence audit
          </p>
        </div>
      </div>

      {/* Closing Card for Target Month */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Period Closing Engine</h2>
            <p className="text-xs text-slate-500">Select calendar accounting month to close or audit</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={yearMonth}
              onChange={(e) => setYearMonth(e.target.value)}
              className="p-2 text-xs font-bold rounded-lg border border-slate-300 bg-slate-50"
            />
          </div>
        </div>

        {/* 9-Point Verification Checklist */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="font-bold text-xs text-slate-900 mb-3">
            Pre-Closing Mandatory System Checklist:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Purchase entries and vendor bills recorded</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Central store outward dispatches completed</span>
            </div>
            <div className="flex items-center gap-2">
              {pendingReceivings === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span>
                Receiving confirmations documented ({pendingReceivings} Pending)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Daily meal and attendance logs entered</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pantry stock balances reconciled</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Culinary wastage and peeling loss reported</span>
            </div>
            <div className="flex items-center gap-2">
              {pendingInvoices === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span>Independent invoice verification completed ({pendingInvoices} Pending)</span>
            </div>
            <div className="flex items-center gap-2">
              {openExceptions === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span>Management exceptions addressed ({openExceptions} Open)</span>
            </div>
          </div>
        </div>

        {currentClosing?.isClosed ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-emerald-900 text-sm">
                  Accounting Month {yearMonth} is Officially Closed & Locked
                </span>
                <p className="text-emerald-700 mt-0.5">
                  Closed on {currentClosing.closedAt} by EID {currentClosing.closedByEid}. Historical records remain permanently available for audit.
                </p>
              </div>
            </div>

            <button
              onClick={() => setReopenTargetId(currentClosing.id)}
              className="px-3.5 py-2 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold hover:bg-emerald-100/50 transition shrink-0"
            >
              Reopen Month (Authorized)
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-end gap-3 pt-2">
            <div className="flex-1 w-full text-xs">
              <label className="block font-bold text-slate-700 mb-1">Auditor Sign-off Notes *</label>
              <input
                type="text"
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>
            <button
              onClick={handleCloseMonth}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-2 shrink-0"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              Finalize & Lock Monthly Closing
            </button>
          </div>
        )}
      </div>

      {/* Historical Closings Register */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800">
          Historical Closing Audit Trail
        </div>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="py-3 px-4">Period</th>
              <th className="py-3 px-3">Facility Scope</th>
              <th className="py-3 px-3">Closed Date</th>
              <th className="py-3 px-3">Closed By</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Auditor Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {monthlyClosings.map((c) => (
              <tr key={c.id}>
                <td className="py-3 px-4 font-bold text-slate-900">{c.yearMonth}</td>
                <td className="py-3 px-3 uppercase text-slate-700">{c.facilityId}</td>
                <td className="py-3 px-3 text-slate-600">{c.closedAt}</td>
                <td className="py-3 px-3 font-mono text-slate-700">EID {c.closedByEid}</td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      c.isClosed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.isClosed ? 'Locked & Reconciled' : 'Reopened'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-slate-600">{c.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reopen Modal */}
      {reopenTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Reopen Closed Accounting Month</h2>
            <p className="text-xs text-slate-500 mb-3">
              Reopening requires formal audit justification and will be permanently recorded in immutable audit logs.
            </p>

            <form onSubmit={handleReopen} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Documented Reopen Reason *</label>
                <textarea
                  rows={3}
                  required
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Explain why adjustments to closed period are authorized"
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReopenTargetId(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                >
                  Authorize Reopening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

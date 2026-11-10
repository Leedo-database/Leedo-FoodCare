import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ReceivingConfirmation as RcvType, FacilityId } from '../../types';
import {
  PackageCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Boxes,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';

export const ReceivingConfirmation: React.FC = () => {
  const { receivings, confirmReceiving } = useData();
  const { currentUser, canAccessFacility } = useAuth();
  const { formatCurrency, formatDate } = useLanguage();

  const isHeadOffice = currentUser?.facilityId === 'central';
  const defaultFacility: FacilityId | 'all' = isHeadOffice ? 'all' : (currentUser?.facilityId || 'peace_home');
  const [filterFacility, setFilterFacility] = useState<FacilityId | 'all'>(defaultFacility);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeRcv, setActiveRcv] = useState<RcvType | null>(null);

  // Inspection form state
  const [actualQty, setActualQty] = useState(0);
  const [damagedQty, setDamagedQty] = useState(0);
  const [condition, setCondition] = useState<RcvType['condition']>('good');
  const [remarks, setRemarks] = useState('Weighed on digital scale. Physical goods matched challan.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openInspection = (rcv: RcvType) => {
    setActiveRcv(rcv);
    setActualQty(rcv.dispatchedQty);
    setDamagedQty(0);
    setCondition('good');
    setRemarks('Inspected and weighed by shelter staff. Quality verified.');
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRcv) return;

    setIsSubmitting(true);
    try {
      await confirmReceiving(activeRcv.id, actualQty, damagedQty, condition, remarks);
      setActiveRcv(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReceivings = receivings.filter((r) => {
    const matchFac =
      (filterFacility === 'all' || r.facilityId === filterFacility) &&
      canAccessFacility(r.facilityId);
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchFac && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-emerald-600" />
            Mandatory Receiving Confirmation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Physical Inspection &rarr; Weight Verification &rarr; Discrepancy Alert &rarr; Facility Inventory Increment
          </p>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        {isHeadOffice ? (
          <select
            value={filterFacility}
            onChange={(e) => setFilterFacility(e.target.value as FacilityId | 'all')}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
          >
            <option value="all">All Facilities</option>
            <option value="kamalapur">Kamalapur TSSB</option>
            <option value="kadamtali">Kadamtali TSSB</option>
            <option value="peace_home">LEEDO Peace Home</option>
          </select>
        ) : (
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-lg">
            Facility: {currentUser?.facilityId === 'peace_home' ? 'LEEDO Peace Home' : currentUser?.facilityId === 'kamalapur' ? 'Kamalapur TSSB' : 'Kadamtali TSSB'}
          </div>
        )}

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="awaiting_receipt">Awaiting Physical Receipt</option>
          <option value="received_full">Received in Full</option>
          <option value="shortage_reported">Shortage Reported</option>
          <option value="damage_reported">Damage Reported</option>
          <option value="disputed">Disputed</option>
        </select>

        <span className="ml-auto text-slate-400">
          Showing {filteredReceivings.length} Receiving Records
        </span>
      </div>

      {/* Receivings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="py-3 px-4">RCV No</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Facility</th>
              <th className="py-3 px-3">Challan No</th>
              <th className="py-3 px-3">Product</th>
              <th className="py-3 px-3">Dispatched Qty</th>
              <th className="py-3 px-3">Actual Received</th>
              <th className="py-3 px-3">Shortage / Damage</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReceivings.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.receivingNo}</td>
                <td className="py-3 px-3 text-slate-600">{formatDate(r.receivingDate)}</td>
                <td className="py-3 px-3 font-semibold text-slate-800 uppercase">
                  {r.facilityId.replace('_', ' ')}
                </td>
                <td className="py-3 px-3 font-mono text-slate-600">{r.distributionNo}</td>
                <td className="py-3 px-3 font-bold text-slate-900">{r.productName}</td>
                <td className="py-3 px-3 text-slate-700 font-medium">
                  {r.dispatchedQty} {r.unit}
                </td>
                <td className="py-3 px-3 font-bold text-emerald-700">
                  {r.actualReceivedQty > 0 ? `${r.actualReceivedQty} ${r.unit}` : '-'}
                </td>
                <td className="py-3 px-3">
                  {r.shortageQty > 0 ? (
                    <span className="text-rose-600 font-bold">
                      Shortage: {r.shortageQty} {r.unit}
                    </span>
                  ) : r.damagedQty > 0 ? (
                    <span className="text-amber-600 font-bold">
                      Damaged: {r.damagedQty} {r.unit}
                    </span>
                  ) : (
                    <span className="text-slate-400">None</span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.status === 'received_full'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.status === 'awaiting_receipt'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {r.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {r.status === 'awaiting_receipt' ? (
                    <button
                      onClick={() => openInspection(r)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] shadow-xs"
                    >
                      Inspect & Confirm
                    </button>
                  ) : (
                    <button
                      onClick={() => openInspection(r)}
                      className="text-slate-500 hover:text-slate-800 text-[11px] font-semibold"
                    >
                      View Record
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {filteredReceivings.length === 0 && (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                  No receiving records found for current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Physical Inspection & Confirmation Modal */}
      {activeRcv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 text-xs">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-mono text-emerald-700 font-bold">{activeRcv.receivingNo}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Physical Goods Inspection: {activeRcv.productName}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Facility: <strong>{activeRcv.facilityId.toUpperCase()}</strong> &bull; Challan:{' '}
                  <strong>{activeRcv.distributionNo}</strong>
                </p>
              </div>
              <button
                onClick={() => setActiveRcv(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">Head Office Dispatched:</span>
                  <span className="text-base font-black text-slate-900">
                    {activeRcv.dispatchedQty} {activeRcv.unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-semibold">Calculated Shortage:</span>
                  <span
                    className={`text-base font-black ${
                      activeRcv.dispatchedQty - actualQty > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {Math.max(0, activeRcv.dispatchedQty - actualQty)} {activeRcv.unit}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Actual Received Quantity ({activeRcv.unit}) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={actualQty}
                    onChange={(e) => setActualQty(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Damaged / Spoiled Qty ({activeRcv.unit})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={damagedQty}
                    onChange={(e) => setDamagedQty(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Physical Condition Inspection *</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50"
                >
                  <option value="good">Good (Clean, fresh, undamaged packages)</option>
                  <option value="acceptable">Acceptable (Minor wear, usable)</option>
                  <option value="damaged">Damaged (Packaging breached, moisture/spoilage)</option>
                  <option value="rejected">Rejected (Not accepted by facility)</option>
                </select>
              </div>

              {activeRcv.dispatchedQty !== actualQty && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
                  <strong>Notice:</strong> An automatic discrepancy alert will be logged to Management Exception Monitoring. Shortage:{' '}
                  <strong>{Math.max(0, activeRcv.dispatchedQty - actualQty)} {activeRcv.unit}</strong>.
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Inspection Remarks & Digital Scale Notes *</label>
                <textarea
                  rows={2}
                  required
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Record scale readings, bag conditions, or shortage explanation"
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveRcv(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  {isSubmitting ? 'Updating Inventory...' : 'Confirm Goods & Update Facility Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

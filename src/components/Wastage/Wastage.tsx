import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FacilityId, WastageRecord } from '../../types';
import { Trash2, Plus, AlertTriangle, ShieldCheck } from 'lucide-react';

export const Wastage: React.FC = () => {
  const { wastageRecords, recordWastage, products } = useData();
  const { currentUser, canAccessFacility } = useAuth();
  const { formatCurrency, formatDate } = useLanguage();

  const isHeadOffice = currentUser?.facilityId === 'central';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [facilityId, setFacilityId] = useState<FacilityId>(
    isHeadOffice ? 'peace_home' : (currentUser?.facilityId as FacilityId) || 'peace_home'
  );
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(2);
  const [reason, setReason] = useState<WastageRecord['reason']>('cooking_wastage');
  const [reasonDetails, setReasonDetails] = useState('Peeling and sorting rot removal');

  const scopedWastage = wastageRecords.filter((w) => canAccessFacility(w.facilityId));
  const selectedProduct = products.find((p) => p.id === selectedProdId);
  const estimatedCost = selectedProduct ? Math.round(quantity * selectedProduct.avgUnitPrice) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    await recordWastage({
      date,
      facilityId,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      unit: selectedProduct.unit,
      estimatedCost,
      reason,
      reasonDetails,
      reportedByEid: currentUser?.eid || '',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-rose-600" />
            Wastage & Spoilage Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Accountability logs for culinary peeling loss, moisture spoilage, transit damage and disposal
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Log Wastage Record
        </button>
      </div>

      {/* Wastage Register */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">
            Wastage Register ({scopedWastage.length} Incidents)
          </span>
          <span className="text-slate-500">
            Total Financial Loss: <strong>{formatCurrency(scopedWastage.reduce((acc, w) => acc + w.estimatedCost, 0))}</strong>
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-3">Facility</th>
              <th className="py-3 px-3">Commodity</th>
              <th className="py-3 px-3">Quantity</th>
              <th className="py-3 px-3">Estimated Cost</th>
              <th className="py-3 px-3">Reason Category</th>
              <th className="py-3 px-3">Details / Explanation</th>
              <th className="py-3 px-4 text-right">Logged By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {scopedWastage.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3 px-4 text-slate-600">{formatDate(w.date)}</td>
                <td className="py-3 px-3 font-semibold text-slate-800 uppercase">
                  {w.facilityId.replace('_', ' ')}
                </td>
                <td className="py-3 px-3 font-bold text-slate-900">{w.productName}</td>
                <td className="py-3 px-3 font-mono font-bold text-rose-700">
                  {w.quantity} {w.unit}
                </td>
                <td className="py-3 px-3 font-bold text-slate-800">{formatCurrency(w.estimatedCost)}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                    {w.reason.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-600">{w.reasonDetails}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">EID {w.reportedByEid}</td>
              </tr>
            ))}

            {scopedWastage.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                  Zero abnormal food wastage logged. Pantry and kitchen operations optimal.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Log Wastage Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Record Wastage / Spoilage</h2>
            <form onSubmit={handleSubmit} className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Facility *</label>
                  {isHeadOffice ? (
                    <select
                      value={facilityId}
                      onChange={(e) => setFacilityId(e.target.value as FacilityId)}
                      className="w-full p-1.5 rounded border border-slate-300 bg-slate-50"
                    >
                      <option value="kamalapur">Kamalapur TSSB</option>
                      <option value="kadamtali">Kadamtali TSSB</option>
                      <option value="peace_home">LEEDO Peace Home</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value={facilityId === 'peace_home' ? 'LEEDO Peace Home' : facilityId === 'kamalapur' ? 'Kamalapur TSSB' : 'Kadamtali TSSB'}
                      className="w-full p-1.5 rounded border border-slate-200 bg-slate-100 font-bold text-slate-700"
                    />
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Incident Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-1.5 rounded border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product *</label>
                <select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Wasted Qty ({selectedProduct?.unit}) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-1.5 rounded border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Cost</label>
                  <div className="p-1.5 font-black text-rose-700 bg-slate-50 rounded border border-slate-200">
                    {formatCurrency(estimatedCost)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Reason *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full p-1.5 rounded border border-slate-300 bg-slate-50"
                >
                  <option value="cooking_wastage">Cooking & Preparation Loss (Peeling/Cut)</option>
                  <option value="spoilage">Natural Spoilage / Moisture Decay</option>
                  <option value="transit_damage">Damaged in Transit</option>
                  <option value="pest_damage">Pest / Rodent Infestation</option>
                  <option value="expired">Date Expired</option>
                  <option value="other">Other Unforeseen Reason</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Specific Description & Circumstances *</label>
                <textarea
                  rows={2}
                  required
                  value={reasonDetails}
                  onChange={(e) => setReasonDetails(e.target.value)}
                  placeholder="Explain why the food was lost or disposed"
                  className="w-full p-2 rounded border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                >
                  Record Wastage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

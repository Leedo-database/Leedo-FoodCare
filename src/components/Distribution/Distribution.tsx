import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Truck, Plus, Warehouse, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Distribution: React.FC = () => {
  const { distributions, dispatchDistribution, centralInventory } = useData();
  const { currentUser } = useAuth();
  const { formatCurrency, formatDate } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProdId, setSelectedProdId] = useState(centralInventory[0]?.productId || '');
  const [kamalapurQty, setKamalapurQty] = useState(50);
  const [kadamtaliQty, setKadamtaliQty] = useState(50);
  const [peaceHomeQty, setPeaceHomeQty] = useState(150);
  const [deliveryPerson, setDeliveryPerson] = useState('Md. Dulal (LEEDO Logistics Driver)');
  const [remarks, setRemarks] = useState('Shelter grocery ration dispatch');
  const [error, setError] = useState<string | null>(null);

  const selectedItem = centralInventory.find((i) => i.productId === selectedProdId);
  const totalDispatch = Number(kamalapurQty) + Number(kadamtaliQty) + Number(peaceHomeQty);
  const availableCentralStock = selectedItem ? selectedItem.quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedItem) {
      setError('Please select a valid product.');
      return;
    }

    if (totalDispatch <= 0) {
      setError('Total dispatch quantity must be greater than zero.');
      return;
    }

    if (totalDispatch > availableCentralStock) {
      setError(`Cannot dispatch ${totalDispatch} ${selectedItem.unit}. Available central stock is only ${availableCentralStock} ${selectedItem.unit}.`);
      return;
    }

    try {
      await dispatchDistribution({
        dispatchDate: new Date().toISOString().substring(0, 10),
        productId: selectedItem.productId,
        productName: selectedItem.productName,
        category: selectedItem.category,
        unit: selectedItem.unit,
        totalQuantity: totalDispatch,
        allocations: {
          kamalapur: Number(kamalapurQty),
          kadamtali: Number(kadamtaliQty),
          peaceHome: Number(peaceHomeQty),
        },
        deliveryPerson,
        dispatchedByEid: currentUser?.eid || '1009',
        status: 'dispatched',
        remarks,
      });

      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dispatch failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-600" />
            Central Facility Distribution
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Head Office central stock allocation & challan dispatch to Kamalapur, Kadamtali and Peace Home
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Dispatch Goods from Central Store
        </button>
      </div>

      {/* Distribution Register */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">
            Dispatch Register ({distributions.length} Shipments)
          </span>
          <span className="text-slate-500">
            Mandatory actual receiving confirmation required at each shelter.
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="py-3 px-4">Challan No</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Product</th>
              <th className="py-3 px-3">Total Dispatched</th>
              <th className="py-3 px-3">Kamalapur</th>
              <th className="py-3 px-3">Kadamtali</th>
              <th className="py-3 px-3">Peace Home</th>
              <th className="py-3 px-3">Driver / Courier</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {distributions.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{d.distributionNo}</td>
                <td className="py-3 px-3 text-slate-600">{formatDate(d.dispatchDate)}</td>
                <td className="py-3 px-3 font-semibold text-slate-900">{d.productName}</td>
                <td className="py-3 px-3 font-bold text-emerald-700">
                  {d.totalQuantity} {d.unit}
                </td>
                <td className="py-3 px-3 text-slate-700">
                  {d.allocations.kamalapur} {d.unit}
                </td>
                <td className="py-3 px-3 text-slate-700">
                  {d.allocations.kadamtali} {d.unit}
                </td>
                <td className="py-3 px-3 text-slate-700">
                  {d.allocations.peaceHome} {d.unit}
                </td>
                <td className="py-3 px-3 text-slate-500">{d.deliveryPerson}</td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      d.status === 'received_full'
                        ? 'bg-emerald-100 text-emerald-800'
                        : d.status === 'received_partial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {d.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dispatch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Dispatch Goods to Shelters</h2>
            <p className="text-xs text-slate-500 mb-4">
              Select stock from Central Warehouse and allocate to the 3 residential facilities.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Item from Central Stock *</label>
                <select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50"
                >
                  {centralInventory.map((i) => (
                    <option key={i.productId} value={i.productId}>
                      {i.productName} (Available Stock: {i.quantity} {i.unit})
                    </option>
                  ))}
                </select>
                {selectedItem && (
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                    Central Warehouse Available: {selectedItem.quantity} {selectedItem.unit}
                  </p>
                )}
              </div>

              {/* Allocations */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800">Shelter Facility Allocations</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      1. Kamalapur TSSB
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={kamalapurQty}
                      onChange={(e) => setKamalapurQty(Number(e.target.value))}
                      className="w-full p-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      2. Kadamtali TSSB
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={kadamtaliQty}
                      onChange={(e) => setKadamtaliQty(Number(e.target.value))}
                      className="w-full p-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      3. LEEDO Peace Home
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={peaceHomeQty}
                      onChange={(e) => setPeaceHomeQty(Number(e.target.value))}
                      className="w-full p-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800">Total Dispatch Quantity:</span>
                  <span
                    className={`font-black text-sm ${
                      totalDispatch > availableCentralStock ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {totalDispatch} {selectedItem?.unit || 'units'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Person / Vehicle *</label>
                  <input
                    type="text"
                    required
                    value={deliveryPerson}
                    onChange={(e) => setDeliveryPerson(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Remarks</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
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
                  disabled={totalDispatch > availableCentralStock || totalDispatch === 0}
                  className="px-4 py-2 font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50"
                >
                  Dispatch Challan & Deduct Central Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

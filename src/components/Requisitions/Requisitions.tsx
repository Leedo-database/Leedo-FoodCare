import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FacilityId, RequisitionItem, Requisition } from '../../types';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Eye,
  AlertCircle,
  Truck,
} from 'lucide-react';

export const Requisitions: React.FC = () => {
  const { requisitions, submitRequisition, updateRequisitionStatus, products, getFacilityStock } = useData();
  const { currentUser, canAccessFacility } = useAuth();
  const { formatCurrency, formatDate } = useLanguage();

  const isHeadOffice = currentUser?.facilityId === 'central';
  const defaultFacility: FacilityId | 'all' = isHeadOffice ? 'all' : (currentUser?.facilityId || 'peace_home');

  const [filterFacility, setFilterFacility] = useState<FacilityId | 'all'>(defaultFacility);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<Requisition | null>(null);

  // New Requisition Form State
  const [reqFacility, setReqFacility] = useState<FacilityId>(isHeadOffice ? 'peace_home' : (currentUser?.facilityId as FacilityId) || 'peace_home');
  const [requiredDate, setRequiredDate] = useState(
    new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().substring(0, 10)
  );
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<RequisitionItem[]>([]);

  // Item form line state
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
  const [itemQty, setItemQty] = useState(25);
  const [dailyCons, setDailyCons] = useState(3);
  const [itemReason, setItemReason] = useState('Fortnightly shelter consumption replenishment');

  const handleAddItem = () => {
    const prod = products.find((p) => p.id === selectedProduct);
    if (!prod) return;

    const currStock = getFacilityStock(reqFacility, prod.id);
    const coverageDays = dailyCons > 0 ? Math.round(currStock / dailyCons) : 0;

    const newItem: RequisitionItem = {
      productId: prod.id,
      productName: prod.name,
      category: prod.category,
      unit: prod.unit,
      currentStock: currStock,
      requiredQty: itemQty,
      approvedQty: itemQty,
      unitPriceEst: prod.avgUnitPrice,
      dailyConsumption: dailyCons,
      stockCoverageDays: coverageDays,
      reason: itemReason,
    };

    setItems((prev) => [...prev, newItem]);
    setItemQty(25);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmitRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add at least one item to the requisition.');
      return;
    }

    await submitRequisition({
      facilityId: reqFacility,
      requestDate: new Date().toISOString().substring(0, 10),
      requiredDate,
      status: 'submitted',
      priority,
      requestingEid: currentUser?.eid || '1023',
      requestingName: currentUser?.name || 'Field In-charge',
      inChargeEid: currentUser?.eid || '1023',
      remarks,
      items,
    });

    setIsModalOpen(false);
    setItems([]);
    setRemarks('');
  };

  const filteredRequisitions = requisitions.filter((r) => {
    const matchFac =
      canAccessFacility(r.facilityId) &&
      (filterFacility === 'all' || r.facilityId === filterFacility);
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchFac && matchStatus;
  });

  const canApprove =
    currentUser &&
    ['founder', 'director', 'logistics', 'program_manager'].includes(currentUser.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-600" />
            Shelter Grocery Requisitions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Facility Request &rarr; In-Charge Review &rarr; Head Office Approval &rarr; Central Procurement
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Create New Requisition
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
          <Filter className="w-4 h-4" />
          Filter:
        </div>

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
          <option value="submitted">Submitted</option>
          <option value="incharge_approved">In-Charge Approved</option>
          <option value="approved">Approved for Purchase</option>
          <option value="procured">Procured & Dispatched</option>
          <option value="rejected">Rejected</option>
        </select>

        <span className="ml-auto text-slate-400">
          Showing {filteredRequisitions.length} Requisitions
        </span>
      </div>

      {/* Requisitions List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="py-3 px-4">Req No</th>
              <th className="py-3 px-3">Facility</th>
              <th className="py-3 px-3">Request Date</th>
              <th className="py-3 px-3">Required By</th>
              <th className="py-3 px-3">Items Count</th>
              <th className="py-3 px-3">Priority</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRequisitions.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{req.reqNo}</td>
                <td className="py-3 px-3 font-semibold text-slate-800 uppercase">
                  {req.facilityId.replace('_', ' ')}
                </td>
                <td className="py-3 px-3 text-slate-600">{formatDate(req.requestDate)}</td>
                <td className="py-3 px-3 text-slate-600">{formatDate(req.requiredDate)}</td>
                <td className="py-3 px-3 font-medium text-slate-700">
                  {req.items.length} Products
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      req.priority === 'urgent' || req.priority === 'emergency'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {req.priority}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      req.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'submitted'
                        ? 'bg-amber-100 text-amber-800'
                        : req.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {req.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-1">
                  <button
                    onClick={() => setSelectedReq(req)}
                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {canApprove && req.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => updateRequisitionStatus(req.id, 'approved', 'Approved by Head Office')}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateRequisitionStatus(req.id, 'rejected', 'Stock already available')}
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {filteredRequisitions.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                  No requisitions found matching current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Requisition Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Create Grocery Requisition</h2>
            <p className="text-xs text-slate-500 mb-4">
              Submit required food and consumable items for shelter nutrition needs
            </p>

            <form onSubmit={handleSubmitRequisition} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shelter Facility *</label>
                  {isHeadOffice ? (
                    <select
                      value={reqFacility}
                      onChange={(e) => setReqFacility(e.target.value as FacilityId)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 font-medium"
                    >
                      <option value="kamalapur">Kamalapur TSSB</option>
                      <option value="kadamtali">Kadamtali TSSB</option>
                      <option value="peace_home">LEEDO Peace Home</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value={reqFacility === 'peace_home' ? 'LEEDO Peace Home' : reqFacility === 'kamalapur' ? 'Kamalapur TSSB' : 'Kadamtali TSSB'}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-100 font-bold text-slate-700"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Required Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              {/* Line item add box */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-xs text-slate-800">Add Product Line Item</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Product</label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full p-1.5 rounded border border-slate-300 bg-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.unit}) - {p.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Required Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={(e) => setItemQty(Number(e.target.value))}
                      className="w-full p-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Daily Usage</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={dailyCons}
                      onChange={(e) => setDailyCons(Number(e.target.value))}
                      className="w-full p-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Reason / justification for quantity"
                    value={itemReason}
                    onChange={(e) => setItemReason(e.target.value)}
                    className="flex-1 p-1.5 text-xs rounded border border-slate-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shrink-0"
                  >
                    + Add Item
                  </button>
                </div>
              </div>

              {/* Added Items Table */}
              {items.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2">Item</th>
                        <th className="p-2">Current Stock</th>
                        <th className="p-2">Req Qty</th>
                        <th className="p-2">Coverage</th>
                        <th className="p-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-semibold text-slate-900">{it.productName}</td>
                          <td className="p-2 text-slate-600">
                            {it.currentStock} {it.unit}
                          </td>
                          <td className="p-2 font-bold text-emerald-700">
                            {it.requiredQty} {it.unit}
                          </td>
                          <td className="p-2 text-slate-600">{it.stockCoverageDays} days</td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-rose-600 hover:text-rose-800 font-bold"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Overall Remarks / Notes</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Additional context for procurement approval"
                  className="w-full p-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Submit Requisition to Head Office
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-700">{selectedReq.reqNo}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Requisition Details ({selectedReq.facilityId.toUpperCase()})
                </h3>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Requested By</span>
                  <span className="font-semibold text-slate-800">
                    {selectedReq.requestingName} (EID {selectedReq.requestingEid})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Required Delivery</span>
                  <span className="font-semibold text-slate-800">{formatDate(selectedReq.requiredDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Priority</span>
                  <span className="font-semibold uppercase text-slate-800">{selectedReq.priority}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Approval Status</span>
                  <span className="font-bold uppercase text-emerald-700">{selectedReq.status}</span>
                </div>
              </div>

              <div className="font-bold text-slate-800">Itemized Breakdown:</div>
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2">Current</th>
                      <th className="p-2">Requested</th>
                      <th className="p-2">Coverage</th>
                      <th className="p-2">Est Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReq.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-semibold text-slate-900">{it.productName}</td>
                        <td className="p-2 text-slate-600">
                          {it.currentStock} {it.unit}
                        </td>
                        <td className="p-2 font-bold text-emerald-700">
                          {it.requiredQty} {it.unit}
                        </td>
                        <td className="p-2 text-slate-600">{it.stockCoverageDays} days</td>
                        <td className="p-2 text-slate-700">{formatCurrency(it.unitPriceEst)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedReq.remarks && (
                <div className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <strong>Remarks:</strong> {selectedReq.remarks}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

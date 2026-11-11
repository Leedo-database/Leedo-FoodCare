import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FacilityId, DailyConsumptionItem, DailyConsumption as ConsType } from '../../types';
import {
  UtensilsCrossed,
  Plus,
  Calendar,
  Users2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const DailyConsumption: React.FC = () => {
  const { dailyConsumptions, recordDailyConsumption, products, facilityInventory, getFacilityStock } = useData();
  const { currentUser, canAccessFacility } = useAuth();
  const { formatCurrency, formatDate } = useLanguage();

  const isHeadOffice = currentUser?.facilityId === 'central';
  const defaultFacility: FacilityId | 'all' = isHeadOffice ? 'all' : (currentUser?.facilityId || 'peace_home');

  const [filterFacility, setFilterFacility] = useState<FacilityId | 'all'>(defaultFacility);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCons, setSelectedCons] = useState<ConsType | null>(null);

  // Form State locked to employee's assigned facility
  const [facilityId, setFacilityId] = useState<FacilityId>(isHeadOffice ? 'peace_home' : (currentUser?.facilityId as FacilityId) || 'peace_home');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [residentChildren, setResidentChildren] = useState(0);
  const [presentChildren, setPresentChildren] = useState(0);
  const [absentChildren, setAbsentChildren] = useState(0);
  const [breakfastServings, setBreakfastServings] = useState(0);
  const [lunchServings, setLunchServings] = useState(0);
  const [eveningSnackServings, setEveningSnackServings] = useState(0);
  const [dinnerServings, setDinnerServings] = useState(0);
  const [specialMealServings, setSpecialMealServings] = useState(0);
  const [remarks, setRemarks] = useState('');

  // Items consumed list
  const [consumedItems, setConsumedItems] = useState<DailyConsumptionItem[]>([]);
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || '');
  const [consumedQty, setConsumedQty] = useState(1);
  const [wastageQty, setWastageQty] = useState(0);
  const [wastageReason, setWastageReason] = useState('');

  const handleAddConsumedItem = () => {
    const prod = products.find((p) => p.id === selectedProdId);
    if (!prod) return;

    const opening = getFacilityStock(facilityId, prod.id);
    const closing = Math.max(0, opening - (consumedQty + wastageQty));

    const item: DailyConsumptionItem = {
      productId: prod.id,
      productName: prod.name,
      unit: prod.unit,
      isFood: prod.isFood,
      openingStock: opening,
      receivedQty: 0,
      consumedQty,
      wastageQty,
      closingStock: closing,
      unitCost: prod.avgUnitPrice,
      totalCost: consumedQty * prod.avgUnitPrice,
      wastageReason,
    };

    setConsumedItems((prev) => [...prev, item]);
    setConsumedQty(1);
    setWastageQty(0);
    setWastageReason('');
  };

  const handleRemoveItem = (index: number) => {
    setConsumedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const calculatedFoodSpend = consumedItems
    .filter((it) => it.isFood)
    .reduce((acc, curr) => acc + curr.totalCost, 0);

  const calculatedCostPerChild =
    presentChildren > 0 ? Math.round((calculatedFoodSpend / presentChildren) * 10) / 10 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (consumedItems.length === 0) {
      alert('Please add at least one consumed product.');
      return;
    }

    const effectiveResident = residentChildren > 0 ? residentChildren : presentChildren + absentChildren;
    await recordDailyConsumption({
      facilityId,
      date,
      residentChildren: effectiveResident,
      presentChildren,
      absentChildren,
      breakfastServings,
      lunchServings,
      eveningSnackServings,
      dinnerServings,
      specialMealServings,
      items: consumedItems,
      enteredByEid: currentUser?.eid || '',
      enteredByName: currentUser?.name || '',
      remarks,
    });

    setIsModalOpen(false);
    setConsumedItems([]);
  };

  const filtered = dailyConsumptions.filter(
    (c) => canAccessFacility(c.facilityId) && (filterFacility === 'all' || c.facilityId === filterFacility)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-emerald-600" />
            Daily Food Consumption & Child Nutrition
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Opening + Received &minus; Consumed &minus; Wastage = Closing Stock &bull; Food Cost per Child calculation
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Record Daily Food Log
        </button>
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
        <span className="ml-auto text-slate-400">
          Showing {filtered.length} Daily Consumption Records
        </span>
      </div>

      {/* Consumption Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-3">Facility</th>
              <th className="py-3 px-3">Children Present</th>
              <th className="py-3 px-3">Servings (B+L+S+D)</th>
              <th className="py-3 px-3">Food Spend</th>
              <th className="py-3 px-3">Cost / Child / Day</th>
              <th className="py-3 px-3">Cost / Meal</th>
              <th className="py-3 px-3">Logged By</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3 px-4 font-bold text-slate-900">{formatDate(c.date)}</td>
                <td className="py-3 px-3 font-semibold text-slate-800 uppercase">
                  {c.facilityId.replace('_', ' ')}
                </td>
                <td className="py-3 px-3 text-slate-800 font-medium">{c.presentChildren} Children</td>
                <td className="py-3 px-3 text-slate-600">
                  {c.breakfastServings + c.lunchServings + c.eveningSnackServings + c.dinnerServings} meals
                </td>
                <td className="py-3 px-3 font-bold text-slate-900">
                  {formatCurrency(c.totalFoodCost)}
                </td>
                <td className="py-3 px-3 font-black text-emerald-700">
                  {formatCurrency(c.costPerChild)}
                </td>
                <td className="py-3 px-3 text-slate-700 font-medium">{formatCurrency(c.costPerMeal)}</td>
                <td className="py-3 px-3 text-slate-500">{c.enteredByName}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setSelectedCons(c)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                  No daily food consumption logs recorded yet. Click "Record Daily Food Log" to add today&apos;s entry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record Consumption Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Record Daily Food Consumption</h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter attendance, meals prepared, and consumed ingredients for accurate child nutrition tracking.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Facility *</label>
                  {isHeadOffice ? (
                    <select
                      value={facilityId}
                      onChange={(e) => setFacilityId(e.target.value as FacilityId)}
                      className="w-full p-1.5 rounded border border-slate-300 bg-slate-50 font-medium"
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
                  <label className="block font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-1.5 rounded border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Children Present *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={presentChildren}
                    onChange={(e) => {
                      const count = Number(e.target.value);
                      setPresentChildren(count);
                      setBreakfastServings(count);
                      setLunchServings(count);
                      setEveningSnackServings(count);
                      setDinnerServings(count);
                    }}
                    className="w-full p-1.5 rounded border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Children Absent</label>
                  <input
                    type="number"
                    min="0"
                    value={absentChildren}
                    onChange={(e) => setAbsentChildren(Number(e.target.value))}
                    className="w-full p-1.5 rounded border border-slate-300"
                  />
                </div>
              </div>

              {/* Servings */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-800 mb-2">Meal Servings Count:</div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">Breakfast</label>
                    <input
                      type="number"
                      value={breakfastServings}
                      onChange={(e) => setBreakfastServings(Number(e.target.value))}
                      className="w-full p-1 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Lunch</label>
                    <input
                      type="number"
                      value={lunchServings}
                      onChange={(e) => setLunchServings(Number(e.target.value))}
                      className="w-full p-1 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Evening Snack</label>
                    <input
                      type="number"
                      value={eveningSnackServings}
                      onChange={(e) => setEveningSnackServings(Number(e.target.value))}
                      className="w-full p-1 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Dinner</label>
                    <input
                      type="number"
                      value={dinnerServings}
                      onChange={(e) => setDinnerServings(Number(e.target.value))}
                      className="w-full p-1 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Add Consumed Items */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800">Add Consumed Grocery Commodities</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-500">Product</label>
                    <select
                      value={selectedProdId}
                      onChange={(e) => setSelectedProdId(e.target.value)}
                      className="w-full p-1.5 rounded border border-slate-300 bg-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.unit}) {p.isFood ? '' : '[Non-Food]'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500">Consumed Qty</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={consumedQty}
                      onChange={(e) => setConsumedQty(Number(e.target.value))}
                      className="w-full p-1.5 rounded border border-slate-300 bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500">Wastage / Peeling Qty</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={wastageQty}
                      onChange={(e) => setWastageQty(Number(e.target.value))}
                      className="w-full p-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Wastage reason (if any, e.g. rotten peeling, moisture damage)"
                    value={wastageReason}
                    onChange={(e) => setWastageReason(e.target.value)}
                    className="flex-1 p-1.5 rounded border border-slate-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddConsumedItem}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shrink-0"
                  >
                    + Add Item
                  </button>
                </div>
              </div>

              {/* Consumed Items Table */}
              {consumedItems.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-44 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 font-bold">
                      <tr>
                        <th className="p-2">Item</th>
                        <th className="p-2">Opening</th>
                        <th className="p-2">Consumed</th>
                        <th className="p-2">Closing</th>
                        <th className="p-2">Food Spend</th>
                        <th className="p-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {consumedItems.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{it.productName}</td>
                          <td className="p-2 text-slate-500">{it.openingStock} {it.unit}</td>
                          <td className="p-2 font-bold text-slate-800">{it.consumedQty} {it.unit}</td>
                          <td className="p-2 text-slate-700 font-semibold">{it.closingStock} {it.unit}</td>
                          <td className="p-2 font-bold text-emerald-700">{formatCurrency(it.totalCost)}</td>
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

              {/* Automatic Food Cost per Child calculation display */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-800 block">Total Food Expenditure:</span>
                  <span className="text-base font-black text-emerald-900">{formatCurrency(calculatedFoodSpend)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-emerald-800 block">Food Cost Per Child Per Day:</span>
                  <span className="text-base font-black text-emerald-700">
                    {formatCurrency(calculatedCostPerChild)}
                  </span>
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
                  className="px-4 py-2 font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Save Daily Log & Deduct Shelter Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedCons && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 text-xs">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Daily Log: {formatDate(selectedCons.date)} ({selectedCons.facilityId.toUpperCase()})
                </h3>
                <span className="text-slate-500">
                  Attendance: {selectedCons.presentChildren} Present &bull; Logged by {selectedCons.enteredByName}
                </span>
              </div>
              <button onClick={() => setSelectedCons(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2">Opening</th>
                      <th className="p-2">Consumed</th>
                      <th className="p-2">Wastage</th>
                      <th className="p-2">Closing</th>
                      <th className="p-2">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedCons.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{it.productName}</td>
                        <td className="p-2">{it.openingStock} {it.unit}</td>
                        <td className="p-2 font-bold">{it.consumedQty} {it.unit}</td>
                        <td className="p-2 text-rose-600">{it.wastageQty > 0 ? `${it.wastageQty} ${it.unit}` : '-'}</td>
                        <td className="p-2 font-semibold text-emerald-700">{it.closingStock} {it.unit}</td>
                        <td className="p-2">{formatCurrency(it.totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between">
                <span>Food Cost / Child / Day:</span>
                <span className="font-bold text-emerald-800">{formatCurrency(selectedCons.costPerChild)}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedCons(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
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

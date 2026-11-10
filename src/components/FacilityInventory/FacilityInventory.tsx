import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FacilityId } from '../../types';
import { Boxes, Search, AlertCircle, Building2 } from 'lucide-react';

export const FacilityInventory: React.FC = () => {
  const { facilityInventory } = useData();
  const { currentUser, canAccessFacility } = useAuth();
  const { formatCurrency } = useLanguage();

  const isHeadOffice = currentUser?.facilityId === 'central';
  const initialFacility: FacilityId = isHeadOffice ? 'peace_home' : (currentUser?.facilityId as FacilityId) || 'peace_home';

  const [selectedFacility, setSelectedFacility] = useState<FacilityId>(initialFacility);
  const [search, setSearch] = useState('');

  const filteredItems = facilityInventory.filter((item) => {
    // Strict facility boundary: field staff cannot view other shelters
    if (!canAccessFacility(item.facilityId)) return false;
    const matchFac = item.facilityId === selectedFacility;
    const matchSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchFac && matchSearch;
  });

  const totalFacilityValue = filteredItems.reduce((acc, i) => acc + i.quantity * i.avgUnitPrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-600" />
            Shelter Facility Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Physical on-site grocery stock tracking for Kamalapur TSSB, Kadamtali TSSB, and Peace Home
          </p>
        </div>
      </div>

      {/* Facility Switcher Tabs: Only Head Office can switch; field workers are strictly locked */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {isHeadOffice ? (
          <>
            <button
              onClick={() => setSelectedFacility('peace_home')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                selectedFacility === 'peace_home'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              3. LEEDO Peace Home
            </button>
            <button
              onClick={() => setSelectedFacility('kamalapur')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                selectedFacility === 'kamalapur'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              1. Kamalapur TSSB
            </button>
            <button
              onClick={() => setSelectedFacility('kadamtali')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                selectedFacility === 'kadamtali'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              2. Kadamtali TSSB
            </button>
          </>
        ) : (
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>
              Shelter Pantry: {selectedFacility === 'peace_home' ? 'LEEDO Peace Home' : selectedFacility === 'kamalapur' ? 'Kamalapur TSSB' : 'Kadamtali TSSB'} (Access Restricted to Your Shelter)
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search facility pantry items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <span className="font-bold text-slate-700">
          Total Shelter Pantry Valuation: <span className="text-emerald-700">{formatCurrency(totalFacilityValue)}</span>
        </span>
      </div>

      {/* Facility Stock Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Current Stock</th>
              <th className="py-3 px-3">Min Safety Threshold</th>
              <th className="py-3 px-3">Estimated Unit Value</th>
              <th className="py-3 px-3">Total Value</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const isLow = item.quantity <= item.minStockLevel;
              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{item.productName}</td>
                  <td className="py-3 px-3 text-slate-600">{item.category}</td>
                  <td className="py-3 px-3 font-bold text-sm text-slate-900">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-medium">
                    {item.minStockLevel} {item.unit}
                  </td>
                  <td className="py-3 px-3 text-slate-700">{formatCurrency(item.avgUnitPrice)}</td>
                  <td className="py-3 px-3 font-black text-slate-900">
                    {formatCurrency(item.quantity * item.avgUnitPrice)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isLow ? 'Low Stock (Requisition Needed)' : 'Adequate'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

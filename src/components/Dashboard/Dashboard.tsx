import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FacilityId } from '../../types';
import { NavTab } from '../Sidebar';
import {
  TrendingUp,
  ClipboardList,
  PackageCheck,
  Warehouse,
  Receipt,
  UtensilsCrossed,
  Users2,
  AlertOctagon,
  ArrowUpRight,
  Gift,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const {
    purchases,
    requisitions,
    receivings,
    centralInventory,
    facilityInventory,
    dailyConsumptions,
    exceptions,
    donorContributions,
  } = useData();
  const { currentUser, canAccessFacility } = useAuth();
  const { formatCurrency } = useLanguage();

  const isHeadOffice = currentUser?.facilityId === 'central';

  // Metrics (Filtered strictly by facility access)
  const scopedRequisitions = requisitions.filter((r) => canAccessFacility(r.facilityId));
  const scopedReceivings = receivings.filter((r) => canAccessFacility(r.facilityId));
  const scopedConsumptions = dailyConsumptions.filter((c) => canAccessFacility(c.facilityId));
  const scopedFacilityStock = facilityInventory.filter((i) => canAccessFacility(i.facilityId));
  const scopedExceptions = exceptions.filter((e) => canAccessFacility(e.facilityId));
  const scopedDonorContributions = donorContributions.filter((d) => canAccessFacility(d.facilityId));

  const totalPurchaseSpend = purchases.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalDonorValue = scopedDonorContributions.reduce((acc, d) => acc + d.totalEstimatedValue, 0);
  const totalStockValue = isHeadOffice
    ? centralInventory.reduce((acc, i) => acc + i.quantity * i.avgUnitPrice, 0)
    : scopedFacilityStock.reduce((acc, i) => acc + i.quantity * i.avgUnitPrice, 0);

  const pendingReqs = scopedRequisitions.filter(
    (r) => r.status === 'submitted' || r.status === 'incharge_approved'
  ).length;
  const pendingReceiving = scopedReceivings.filter((r) => r.status === 'awaiting_receipt').length;
  const openExceptions = scopedExceptions.filter((e) => e.status === 'open').length;

  const getFacilityMetrics = (facId: FacilityId) => {
    const latest = dailyConsumptions.find((c) => c.facilityId === facId);
    return {
      presentChildren: latest ? latest.presentChildren : 0,
      dailyFoodSpend: latest ? latest.totalFoodCost : 0,
      costPerChild: latest ? latest.costPerChild : 0,
    };
  };

  const kamMetrics = getFacilityMetrics('kamalapur');
  const kadMetrics = getFacilityMetrics('kadamtali');
  const peaceMetrics = getFacilityMetrics('peace_home');

  const totalActiveChildren =
    (canAccessFacility('kamalapur') ? kamMetrics.presentChildren : 0) +
    (canAccessFacility('kadamtali') ? kadMetrics.presentChildren : 0) +
    (canAccessFacility('peace_home') ? peaceMetrics.presentChildren : 0);

  const latestConsumptions = scopedConsumptions.slice(0, 3);
  const avgCostPerChild =
    latestConsumptions.length > 0
      ? Math.round(
          (latestConsumptions.reduce((acc, c) => acc + c.costPerChild, 0) / latestConsumptions.length) * 10
        ) / 10
      : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-md">
              <img
                src="/leedo-logo.png"
                alt="LEEDO"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/assets/aistudio/.trashed-1796487643-Logo-of-LEEDO-Short-01-746x1024_a345b8a2.png';
                }}
              />
            </div>
            <div>
              <div className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1">
                {isHeadOffice
                  ? 'Head Office Central Oversight'
                  : currentUser?.facilityId === 'peace_home'
                  ? 'LEEDO Peace Home Portal'
                  : currentUser?.facilityId === 'kamalapur'
                  ? 'Kamalapur TSSB Portal'
                  : 'Kadamtali TSSB Portal'}
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Welcome, {currentUser?.name}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentUser?.designation} &bull; EID {currentUser?.eid} &bull;{' '}
                <span className="capitalize">{currentUser?.role.replace('_', ' ')}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('requisitions')}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <ClipboardList className="w-4 h-4" />
              Requisitions ({pendingReqs})
            </button>
            <button
              onClick={() => onNavigate('receiving')}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              Pending Receipt ({pendingReceiving})
            </button>
            <button
              onClick={() => onNavigate('reportCenter')}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Procurement (Head Office) or Donor Gifts & Local Bazar (Field) */}
        {isHeadOffice ? (
          <div
            onClick={() => onNavigate('purchases')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Central Procurement</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-2">
              {formatCurrency(totalPurchaseSpend)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>{purchases.length} Purchase Invoices</span>
              <span className="text-emerald-600 font-semibold flex items-center">
                View <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => onNavigate('donorContributions')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Donor Food & Local Bazar</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-2">
              {formatCurrency(totalDonorValue)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>{scopedDonorContributions.length} Entries Logged</span>
              <span className="text-emerald-600 font-semibold flex items-center">
                Add Entry <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        )}

        {/* Stock Value (Central Warehouse or Shelter Pantry) */}
        <div
          onClick={() => onNavigate(isHeadOffice ? 'centralStock' : 'facilityInventory')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{isHeadOffice ? 'Central Warehouse Stock' : 'Shelter Pantry Stock'}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 mt-2">
            {formatCurrency(totalStockValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{isHeadOffice ? centralInventory.length : scopedFacilityStock.length} Items Listed</span>
            <span className="text-slate-600 font-semibold">{isHeadOffice ? 'Head Office' : 'Assigned Shelter'}</span>
          </div>
        </div>

        {/* Active Street Children */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Latest Meal Headcount</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 mt-2">
            {totalActiveChildren} Children
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{scopedConsumptions.length} Daily Logs</span>
            <span className="text-emerald-600 font-semibold">
              {totalActiveChildren > 0 ? 'Logged' : 'No Logs Yet'}
            </span>
          </div>
        </div>

        {/* Avg Food Cost per Child */}
        <div
          onClick={() => onNavigate('consumption')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Food Cost / Child / Day</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-600 mt-2">
            {formatCurrency(avgCostPerChild)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Benchmark: 60 - 95 BDT</span>
            <span className="text-teal-700 font-bold">
              {avgCostPerChild > 0 ? 'Active Avg' : 'No Entries'}
            </span>
          </div>
        </div>
      </div>

      {/* Facilities Comparison Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
          Residential Facilities Status &amp; Daily Food Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Kamalapur TSSB */}
          {canAccessFacility('kamalapur') && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">1. Kamalapur TSSB</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Operational
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Kamalapur Railway Station Area, Motijheel</p>
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Latest Headcount</span>
                  <span className="font-bold text-slate-800">{kamMetrics.presentChildren} Children</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">In-Charge</span>
                  <span className="font-semibold text-slate-800">Md. Masud (1023)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Latest Daily Spend</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(kamMetrics.dailyFoodSpend)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cost / Child / Day</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(kamMetrics.costPerChild)}</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('facilityInventory')}
                className="mt-3 w-full py-1.5 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                View Kamalapur Stock &rarr;
              </button>
            </div>
          )}

          {/* 2. Kadamtali TSSB */}
          {canAccessFacility('kadamtali') && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">2. Kadamtali TSSB</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Operational
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Kadamtali, Shyampur, Dhaka</p>
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Latest Headcount</span>
                  <span className="font-bold text-slate-800">{kadMetrics.presentChildren} Children</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">In-Charge</span>
                  <span className="font-semibold text-slate-800">Saidur Rahman Sajan (1028)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Latest Daily Spend</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(kadMetrics.dailyFoodSpend)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cost / Child / Day</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(kadMetrics.costPerChild)}</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('facilityInventory')}
                className="mt-3 w-full py-1.5 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                View Kadamtali Stock &rarr;
              </button>
            </div>
          )}

          {/* 3. LEEDO Peace Home */}
          {canAccessFacility('peace_home') && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">3. LEEDO Peace Home</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Operational
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Washpur, Keraniganj Model Town, Dhaka</p>
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Latest Headcount</span>
                  <span className="font-bold text-slate-800">{peaceMetrics.presentChildren} Children</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Supervisor</span>
                  <span className="font-semibold text-slate-800">Anowar Hossain (1050)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Latest Daily Spend</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(peaceMetrics.dailyFoodSpend)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cost / Child / Day</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(peaceMetrics.costPerChild)}</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('facilityInventory')}
                className="mt-3 w-full py-1.5 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                View Peace Home Stock &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exception Monitoring and Stock Status Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Exceptions Alert Box */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Management Exceptions ({openExceptions})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('exceptions')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              View All &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {scopedExceptions.slice(0, 3).map((exc) => (
              <div
                key={exc.id}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        exc.severity === 'high' || exc.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {exc.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{exc.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{exc.description}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{exc.date}</span>
              </div>
            ))}

            {scopedExceptions.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">
                No exceptions flagged for your facility.
              </div>
            )}
          </div>
        </div>

        {/* Warehouse or Shelter Stock Reorder Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Warehouse className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {isHeadOffice ? 'Central Stock Reorder Status' : 'Shelter Pantry Stock Status'}
              </h3>
            </div>
            <button
              onClick={() => onNavigate(isHeadOffice ? 'centralStock' : 'facilityInventory')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              Manage Stock &rarr;
            </button>
          </div>

          <div className="space-y-2">
            {(isHeadOffice ? centralInventory : scopedFacilityStock).slice(0, 4).map((item) => {
              const isLow = item.quantity <= item.minStockLevel;
              return (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800">{item.productName}</span>
                    <span className="text-[11px] text-slate-400 block">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">
                      {item.quantity} {item.unit}
                    </span>
                    <span
                      className={`block text-[10px] font-semibold ${
                        isLow ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {isLow ? 'Low Stock (Reorder)' : 'Sufficient'}
                    </span>
                  </div>
                </div>
              );
            })}

            {(isHeadOffice ? centralInventory : scopedFacilityStock).length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">
                No stock items recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

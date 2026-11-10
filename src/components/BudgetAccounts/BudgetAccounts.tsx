import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FacilityId, FacilityBudget } from '../../types';
import { Landmark, CheckCircle2, AlertCircle, FileCheck, DollarSign } from 'lucide-react';

export const BudgetAccounts: React.FC = () => {
  const { budgets, purchases, verifyPurchaseInvoice } = useData();
  const { currentUser } = useAuth();
  const { formatCurrency } = useLanguage();

  const [activeTab, setActiveTab] = useState<'budgets' | 'invoices' | 'ledger'>('budgets');
  const [filterFacility, setFilterFacility] = useState<FacilityId | 'all'>('all');

  const pendingInvoices = purchases.filter((p) => p.verificationStatus === 'pending');
  const verifiedInvoices = purchases.filter((p) => p.verificationStatus === 'verified');

  const totalApproved = budgets.reduce((acc, b) => acc + b.approvedAmount, 0);
  const totalUtilized = budgets.reduce((acc, b) => acc + b.utilizedAmount, 0);
  const totalVariance = totalApproved - totalUtilized;
  const overallUtilization = totalApproved > 0 ? Math.round((totalUtilized / totalApproved) * 100) : 0;

  const canVerify =
    currentUser &&
    ['accountant', 'assistant_accountant', 'super_admin', 'director', 'founder'].includes(
      currentUser.role
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-600" />
            Budget & Accounts Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Facility monthly budgets, independent invoice audit verification & vendor accounts ledger
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('budgets')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'budgets'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Facility Monthly Budgets
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'invoices'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          Independent Bill Verification ({pendingInvoices.length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'ledger'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Procurement & Vendor Ledger
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold block text-[11px]">Approved Monthly Budget</span>
          <span className="text-lg font-black text-slate-900 mt-1 block">
            {formatCurrency(totalApproved)}
          </span>
          <span className="text-slate-500 text-[10px]">Fiscal Year 2026-2027</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold block text-[11px]">Utilized Expenditure</span>
          <span className="text-lg font-black text-emerald-700 mt-1 block">
            {formatCurrency(totalUtilized)}
          </span>
          <span className="text-slate-500 text-[10px]">Actual Incurred Spend</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold block text-[11px]">Remaining Budget Balance</span>
          <span className="text-lg font-black text-indigo-700 mt-1 block">
            {formatCurrency(totalVariance)}
          </span>
          <span className="text-slate-500 text-[10px]">Under-Budget Reserve</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold block text-[11px]">Budget Utilization %</span>
          <span className="text-lg font-black text-slate-900 mt-1 block">
            {overallUtilization}%
          </span>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${overallUtilization}%` }} />
          </div>
        </div>
      </div>

      {/* Tab 1: Budgets */}
      {activeTab === 'budgets' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Facility-Wise Category Budget Breakdown</span>
            <span className="text-slate-500 font-normal">Month: November 2026</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-3">Expense Category</th>
                <th className="py-3 px-3">Approved Budget</th>
                <th className="py-3 px-3">Utilized Amount</th>
                <th className="py-3 px-3">Remaining Balance</th>
                <th className="py-3 px-3">Utilization %</th>
                <th className="py-3 px-4 text-right">Budget Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgets.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 uppercase">
                    {b.facilityId.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{b.category}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {formatCurrency(b.approvedAmount)}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-700">
                    {formatCurrency(b.utilizedAmount)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-indigo-700">
                    {formatCurrency(b.variance)}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold">{b.utilizationPct}%</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        b.utilizationPct > 90
                          ? 'bg-rose-100 text-rose-800'
                          : b.utilizationPct > 70
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {b.utilizationPct > 90 ? 'Near Limit' : 'Within Budget'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Independent Bill Verification */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              Procurement Invoices Verification Queue (Accountant Audit)
            </span>
            <span className="text-slate-500">
              Independent audit check against store receipt notes and market rates
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="py-3 px-4">Purchase No</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Vendor</th>
                <th className="py-3 px-3">Invoice No</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Auditor Notes</th>
                <th className="py-3 px-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.purchaseNo}</td>
                  <td className="py-3 px-3 text-slate-600">{p.purchaseDate}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{p.vendor}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{p.invoiceNo}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{formatCurrency(p.totalAmount)}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.verificationStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.verificationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                    {p.verificationNotes || 'Pending audit certification'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {p.verificationStatus === 'pending' ? (
                      canVerify ? (
                        <button
                          onClick={() =>
                            verifyPurchaseInvoice(
                              p.id,
                              'verified',
                              'Verified against central goods receiving voucher and current market rates.'
                            )
                          }
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] shadow-xs"
                        >
                          Verify & Approve Bill
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Accountant Required</span>
                      )
                    ) : (
                      <span className="text-emerald-700 font-bold flex items-center justify-end gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Certified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Ledger */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Vendor Accounts & Settlement Ledger</span>
            <span className="text-slate-500 font-normal">All Transactions</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-3">Vendor</th>
                <th className="py-3 px-3">Ref Invoice</th>
                <th className="py-3 px-3">Commodities</th>
                <th className="py-3 px-3">Bill Subtotal</th>
                <th className="py-3 px-3">Transport</th>
                <th className="py-3 px-3">Net Payable</th>
                <th className="py-3 px-4 text-right">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-slate-600">{p.purchaseDate}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{p.vendor}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{p.invoiceNo}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {p.items.map((i) => i.productName).join(', ')}
                  </td>
                  <td className="py-3 px-3 text-slate-700">{formatCurrency(p.subtotal)}</td>
                  <td className="py-3 px-3 text-slate-500">{formatCurrency(p.transportCost)}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{formatCurrency(p.totalAmount)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {p.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

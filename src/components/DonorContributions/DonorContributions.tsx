import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { FacilityId, DonorItem, ProductCategory } from '../../types';
import {
  Gift,
  Plus,
  Search,
  ShoppingCart,
  Calendar,
  Building,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Sparkles,
  HeartHandshake,
  Trash2,
  Receipt,
  User,
  Phone,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const DonorContributions: React.FC = () => {
  const { currentUser, canAccessFacility } = useAuth();
  const { t, formatCurrency, formatDate } = useLanguage();
  const { donorContributions, recordDonorContribution, products } = useData();

  // Facility filter logic:
  // If field staff, lock to their own facility; if head office, default to 'all'
  const isHeadOffice = currentUser?.facilityId === 'central';
  const defaultFacility: FacilityId | 'all' = isHeadOffice ? 'all' : (currentUser?.facilityId || 'peace_home');

  const [selectedFacility, setSelectedFacility] = useState<FacilityId | 'all'>(defaultFacility);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<'all' | 'donor_inkind' | 'emergency_local_purchase' | 'community_gift'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const initialFacility = isHeadOffice ? 'peace_home' : (currentUser?.facilityId as FacilityId);
  const [formFacility, setFormFacility] = useState<FacilityId>(initialFacility);
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [formSourceType, setFormSourceType] = useState<'donor_inkind' | 'emergency_local_purchase' | 'community_gift'>('donor_inkind');
  const [formDonorName, setFormDonorName] = useState('');
  const [formDonorPhone, setFormDonorPhone] = useState('');
  const [formDonorOrg, setFormDonorOrg] = useState('');
  const [formPurpose, setFormPurpose] = useState('Special Nutrition & Daily Meals');
  const [formReceiptNo, setFormReceiptNo] = useState('');
  const [formRemarks, setFormRemarks] = useState('');

  // Item lines in form
  const [formItems, setFormItems] = useState<DonorItem[]>([
    {
      productId: products[0]?.id || 'p_miniket',
      productName: products[0]?.name || 'Miniket Rice (Standard)',
      category: products[0]?.category || 'Rice and Staples',
      unit: products[0]?.unit || 'kg',
      quantity: 25,
      estimatedUnitPrice: products[0]?.avgUnitPrice || 72,
      totalEstimatedValue: (products[0]?.avgUnitPrice || 72) * 25,
    },
  ]);

  // Handle line changes
  const handleItemProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    setFormItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        productId: prod.id,
        productName: prod.name,
        category: prod.category,
        unit: prod.unit,
        estimatedUnitPrice: prod.avgUnitPrice,
        totalEstimatedValue: prod.avgUnitPrice * copy[index].quantity,
      };
      return copy;
    });
  };

  const handleItemQtyChange = (index: number, qty: number) => {
    setFormItems((prev) => {
      const copy = [...prev];
      const validQty = Math.max(0, qty);
      copy[index] = {
        ...copy[index],
        quantity: validQty,
        totalEstimatedValue: validQty * copy[index].estimatedUnitPrice,
      };
      return copy;
    });
  };

  const handleItemPriceChange = (index: number, price: number) => {
    setFormItems((prev) => {
      const copy = [...prev];
      const validPrice = Math.max(0, price);
      copy[index] = {
        ...copy[index],
        estimatedUnitPrice: validPrice,
        totalEstimatedValue: copy[index].quantity * validPrice,
      };
      return copy;
    });
  };

  const addItemRow = () => {
    const fallbackProd = products[0];
    setFormItems((prev) => [
      ...prev,
      {
        productId: fallbackProd.id,
        productName: fallbackProd.name,
        category: fallbackProd.category,
        unit: fallbackProd.unit,
        quantity: 10,
        estimatedUnitPrice: fallbackProd.avgUnitPrice,
        totalEstimatedValue: fallbackProd.avgUnitPrice * 10,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (formItems.length === 1) return;
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalFormValue = formItems.reduce((acc, item) => acc + item.totalEstimatedValue, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDonorName.trim() && formSourceType === 'donor_inkind') {
      alert('Please enter Donor Name');
      return;
    }

    try {
      const entryId = await recordDonorContribution({
        facilityId: formFacility,
        date: formDate,
        sourceType: formSourceType,
        donorName: formDonorName.trim() || (formSourceType === 'emergency_local_purchase' ? 'Local Market Vendor' : 'Community Well-wisher'),
        donorPhone: formDonorPhone.trim(),
        donorOrganization: formDonorOrg.trim(),
        purpose: formPurpose.trim() || 'General Child Feeding',
        items: formItems,
        totalEstimatedValue: totalFormValue,
        receiptNumber: formReceiptNo.trim(),
        receivedByEid: currentUser?.eid || '1023',
        receivedByName: currentUser?.name || 'Staff In-charge',
        remarks: formRemarks.trim(),
      });

      setIsModalOpen(false);
      setSuccessToast(`Entry logged successfully! Shelter inventory updated immediately.`);
      setTimeout(() => setSuccessToast(null), 4000);

      // Reset Form
      setFormDonorName('');
      setFormDonorPhone('');
      setFormDonorOrg('');
      setFormReceiptNo('');
      setFormRemarks('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to record entry');
    }
  };

  // Filter records strictly by facility access
  const filteredRecords = donorContributions.filter((rec) => {
    // If field staff, can strictly ONLY view their own shelter
    if (!canAccessFacility(rec.facilityId)) {
      return false;
    }

    // Facility filter button
    if (selectedFacility !== 'all' && rec.facilityId !== selectedFacility) {
      return false;
    }

    // Source type filter
    if (sourceTypeFilter !== 'all' && rec.sourceType !== sourceTypeFilter) {
      return false;
    }

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchDonor = rec.donorName.toLowerCase().includes(q);
      const matchPurpose = rec.purpose.toLowerCase().includes(q);
      const matchNo = rec.entryNo.toLowerCase().includes(q);
      const matchItem = rec.items.some((i) => i.productName.toLowerCase().includes(q));
      return matchDonor || matchPurpose || matchNo || matchItem;
    }

    return true;
  });

  const exportExcel = () => {
    const rows = filteredRecords.flatMap((rec) =>
      rec.items.map((item) => ({
        'Entry No': rec.entryNo,
        Date: rec.date,
        Facility: rec.facilityId,
        'Source Type': rec.sourceType,
        'Donor / Vendor': rec.donorName,
        'Donor Phone': rec.donorPhone || '',
        Purpose: rec.purpose,
        'Item Name': item.productName,
        Quantity: item.quantity,
        Unit: item.unit,
        'Est. Unit Price (BDT)': item.estimatedUnitPrice,
        'Total Est. Value (BDT)': item.totalEstimatedValue,
        'Received By': `${rec.receivedByName} (${rec.receivedByEid})`,
        'Receipt No': rec.receiptNumber || '',
        Remarks: rec.remarks || '',
      }))
    );

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Donor_Contributions');
    XLSX.writeFile(wb, `LEEDO_Donor_Contributions_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-xs font-bold text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-rose-100 rounded-xl text-rose-700">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                দাতার খাদ্য অনুদান ও স্থানীয় বাজার ক্রয়
                <span className="text-xs font-normal text-slate-500 hidden sm:inline">
                  (Donor In-Kind Contributions & Local Purchases)
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct entry for grocery donations, feast sponsors, and emergency local market shopping. Stock updates shelter inventory automatically.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportExcel}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export Excel
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            নতুন খাদ্য অনুদান / স্থানীয় ক্রয় এন্ট্রি
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Facility Tabs (Only Head Office can switch; field staff view is locked) */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {isHeadOffice ? (
            <>
              <button
                onClick={() => setSelectedFacility('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedFacility === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Facilities
              </button>
              <button
                onClick={() => setSelectedFacility('peace_home')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedFacility === 'peace_home'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                LEEDO Peace Home
              </button>
              <button
                onClick={() => setSelectedFacility('kamalapur')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedFacility === 'kamalapur'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Kamalapur TSSB
              </button>
              <button
                onClick={() => setSelectedFacility('kadamtali')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedFacility === 'kadamtali'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Kadamtali TSSB
              </button>
            </>
          ) : (
            <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>
                Facility Scoped: {currentUser?.facilityId === 'peace_home' ? 'LEEDO Peace Home' : currentUser?.facilityId === 'kamalapur' ? 'Kamalapur TSSB' : 'Kadamtali TSSB'}
              </span>
            </div>
          )}
        </div>

        {/* Search & Source Type */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={sourceTypeFilter}
            onChange={(e) => setSourceTypeFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Sources (সকল উৎস)</option>
            <option value="donor_inkind">Donor In-Kind Gift (দাতার খাদ্য অনুদান)</option>
            <option value="emergency_local_purchase">Local Market Purchase (স্থানীয় ক্রয়)</option>
            <option value="community_gift">Community / Well-wisher Gift</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search donor, item, receipt..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* List / Table of Donor Contributions */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800">
            Recorded Food Contributions & Local Purchases ({filteredRecords.length})
          </div>
          <div className="text-xs font-bold text-slate-600">
            Total Estimated Value: {formatCurrency(filteredRecords.reduce((sum, r) => sum + r.totalEstimatedValue, 0))}
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Gift className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
            <p className="text-sm font-semibold text-slate-600">No food contributions or local purchases recorded yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Field workers can click "নতুন খাদ্য অনুদান / স্থানীয় ক্রয় এন্ট্রি" to record donor gifts or emergency market purchases.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Entry No & Date</th>
                  <th className="px-4 py-3">Facility</th>
                  <th className="px-4 py-3">Source & Donor</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Items Contributed</th>
                  <th className="px-4 py-3 text-right">Est. Value</th>
                  <th className="px-4 py-3">Received By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono">
                      <div className="font-bold text-slate-900">{rec.entryNo}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDate(rec.date)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 text-[11px]">
                        {rec.facilityId === 'peace_home'
                          ? 'Peace Home'
                          : rec.facilityId === 'kamalapur'
                          ? 'Kamalapur'
                          : 'Kadamtali'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {rec.sourceType === 'emergency_local_purchase' ? (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                            Local Purchase
                          </span>
                        ) : rec.sourceType === 'community_gift' ? (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                            Community Gift
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-bold">
                            Donor Gift
                          </span>
                        )}
                        <span>{rec.donorName}</span>
                      </div>
                      {rec.donorPhone && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {rec.donorPhone}
                        </div>
                      )}
                      {rec.donorOrganization && (
                        <div className="text-[11px] text-slate-500 mt-0.5 italic">{rec.donorOrganization}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs">
                      <div className="font-medium text-slate-800">{rec.purpose}</div>
                      {rec.receiptNumber && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Voucher/Receipt: {rec.receiptNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {rec.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] gap-2">
                            <span className="font-semibold text-slate-800">{item.productName}</span>
                            <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 font-bold rounded">
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatCurrency(rec.totalEstimatedValue)}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-600">
                      <div className="font-semibold">{rec.receivedByName}</div>
                      <div className="text-[10px] text-slate-400">EID {rec.receivedByEid}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    খাদ্য অনুদান বা স্থানীয় বাজার ক্রয় এন্ট্রি
                  </h2>
                  <p className="text-xs text-slate-500">
                    Direct entry for donated groceries or emergency local purchases. Increases shelter inventory immediately.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Top Row: Facility, Date, Source Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Facility (আশ্রয়কেন্দ্র) <span className="text-rose-500">*</span>
                  </label>
                  {isHeadOffice ? (
                    <select
                      value={formFacility}
                      onChange={(e) => setFormFacility(e.target.value as FacilityId)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    >
                      <option value="peace_home">LEEDO Peace Home</option>
                      <option value="kamalapur">Kamalapur TSSB</option>
                      <option value="kadamtali">Kadamtali TSSB</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value={formFacility === 'peace_home' ? 'LEEDO Peace Home' : formFacility === 'kamalapur' ? 'Kamalapur TSSB' : 'Kadamtali TSSB'}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-100 font-bold text-slate-700"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date (তারিখ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Source Type (উৎস) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formSourceType}
                    onChange={(e) => setFormSourceType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="donor_inkind">Donor In-Kind Gift (দাতার উপহার/খাদ্য)</option>
                    <option value="emergency_local_purchase">Emergency Local Purchase (জরুরি বাজার ক্রয়)</option>
                    <option value="community_gift">Community / Well-wisher Gift (সাদাকা/অনুদান)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Donor/Vendor info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {formSourceType === 'emergency_local_purchase' ? 'Vendor / Market Name' : 'Donor Name (দাতার নাম)'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formDonorName}
                    onChange={(e) => setFormDonorName(e.target.value)}
                    placeholder={formSourceType === 'emergency_local_purchase' ? 'e.g. Local Vegetable Stall' : 'e.g. Mr. Rafiqul Islam'}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Phone (ফোন নম্বর)
                  </label>
                  <input
                    type="text"
                    value={formDonorPhone}
                    onChange={(e) => setFormDonorPhone(e.target.value)}
                    placeholder="e.g. 01711XXXXXX"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Voucher / Cash Memo No. (ভাউচার নম্বর)
                  </label>
                  <input
                    type="text"
                    value={formReceiptNo}
                    onChange={(e) => setFormReceiptNo(e.target.value)}
                    placeholder="Optional receipt reference"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 3: Purpose */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Purpose / Occasion (উদ্দেশ্য বা উপলক্ষ্য)
                </label>
                <input
                  type="text"
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  placeholder="e.g. Special Friday Feast, Child Birthday Donation, Emergency Rice Shortage"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Food Items List */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Food Items (খাদ্যদ্রব্য ও পরিমাণ)
                  </span>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {formItems.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 items-center text-xs"
                    >
                      <div className="col-span-5">
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Product</label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemProductChange(index, e.target.value)}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs font-medium"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                          Qty ({item.unit})
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) => handleItemQtyChange(index, parseFloat(e.target.value) || 0)}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs font-bold"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                          Est. Price (৳)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.estimatedUnitPrice}
                          onChange={(e) => handleItemPriceChange(index, parseFloat(e.target.value) || 0)}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs"
                        />
                      </div>

                      <div className="col-span-2 text-right">
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Total</label>
                        <div className="font-bold text-slate-800 text-xs pt-1">
                          ৳ {Math.round(item.totalEstimatedValue)}
                        </div>
                      </div>

                      <div className="col-span-1 text-center pt-3">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          disabled={formItems.length === 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Total Estimated Value:</span>
                  <span className="text-emerald-700 text-sm">৳ {Math.round(totalFormValue).toLocaleString()}</span>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Remarks / Notes (মন্তব্য)
                </label>
                <textarea
                  rows={2}
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  placeholder="e.g. Received directly at gate. Quality verified by shelter cook."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  খাদ্য অনুদান সংরক্ষণ করুন ও স্টকে যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

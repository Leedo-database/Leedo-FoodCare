import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PurchaseItem, Purchase } from '../../types';
import {
  ShoppingCart,
  Plus,
  Receipt,
  FileCheck,
  Building2,
  DollarSign,
  Download,
  AlertCircle,
  Truck,
  CheckCircle2,
} from 'lucide-react';

export const Procurement: React.FC = () => {
  const { purchases, recordPurchase, verifyPurchaseInvoice, products } = useData();
  const { currentUser } = useAuth();
  const { formatCurrency, formatDate } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  // New Purchase Form
  const [vendor, setVendor] = useState('Haji Rice Agency');
  const [market, setMarket] = useState('Badamtoli Wholesale Market, Dhaka');
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().substring(6)}`);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().substring(0, 10));
  const [discount, setDiscount] = useState(0);
  const [transportCost, setTransportCost] = useState(1500);
  const [paymentStatus, setPaymentStatus] = useState<Purchase['paymentStatus']>('paid');
  const [approvalRef, setApprovalRef] = useState('ED/DIR/APP/2026-11');
  const [remarks, setRemarks] = useState('Central bulk grocery procurement');

  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || '');
  const [itemQty, setItemQty] = useState(100);
  const [unitPrice, setUnitPrice] = useState(products[0]?.avgUnitPrice || 70);

  const handleAddItem = () => {
    const prod = products.find((p) => p.id === selectedProdId);
    if (!prod) return;

    const newItem: PurchaseItem = {
      productId: prod.id,
      productName: prod.name,
      category: prod.category,
      unit: prod.unit,
      quantity: itemQty,
      unitPrice,
      totalPrice: itemQty * unitPrice,
    };

    setItems((prev) => [...prev, newItem]);
    setItemQty(50);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const subtotal = items.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const netTotal = subtotal - discount + transportCost;

  const handleSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add at least one line item to the purchase entry.');
      return;
    }

    await recordPurchase({
      purchaseDate,
      vendor,
      market,
      invoiceNo,
      items,
      subtotal,
      discount,
      transportCost,
      totalAmount: netTotal,
      paymentStatus,
      verificationStatus: 'pending',
      procurementOfficerEid: currentUser?.eid || '1009',
      procurementOfficerName: currentUser?.name || 'Rone Ahammed',
      approvalRef,
      receiptUrl: '/receipts/sample_voucher.pdf',
      receiptName: `${vendor.replace(/\s+/g, '_')}_${invoiceNo}.pdf`,
      remarks,
    });

    setIsModalOpen(false);
    setItems([]);
  };

  const isAccountant =
    currentUser && ['accountant', 'assistant_accountant', 'super_admin', 'director', 'founder'].includes(currentUser.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-600" />
            Central Grocery Procurement
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Head Office centralized purchasing, vendor billing, invoice audit & inventory stock increment
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Record Central Purchase
        </button>
      </div>

      {/* Procurement Register */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800">
            Purchases Register ({purchases.length} Records)
          </span>
          <span className="text-xs text-slate-500">
            Total Spend: <strong>{formatCurrency(purchases.reduce((acc, p) => acc + p.totalAmount, 0))}</strong>
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="py-3 px-4">Purchase No</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Vendor</th>
              <th className="py-3 px-3">Market</th>
              <th className="py-3 px-3">Invoice No</th>
              <th className="py-3 px-3">Items</th>
              <th className="py-3 px-3">Total Amount</th>
              <th className="py-3 px-3">Audit Verification</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.map((pur) => (
              <tr key={pur.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{pur.purchaseNo}</td>
                <td className="py-3 px-3 text-slate-600">{formatDate(pur.purchaseDate)}</td>
                <td className="py-3 px-3 font-semibold text-slate-900">{pur.vendor}</td>
                <td className="py-3 px-3 text-slate-500">{pur.market}</td>
                <td className="py-3 px-3 font-mono text-slate-700">{pur.invoiceNo}</td>
                <td className="py-3 px-3 font-medium text-slate-700">
                  {pur.items.map((i) => i.productName).join(', ')}
                </td>
                <td className="py-3 px-3 font-bold text-slate-900">
                  {formatCurrency(pur.totalAmount)}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      pur.verificationStatus === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {pur.verificationStatus === 'verified' ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <FileCheck className="w-3 h-3 text-amber-600" />
                    )}
                    {pur.verificationStatus}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-1">
                  <button
                    onClick={() => setSelectedPurchase(pur)}
                    className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-semibold"
                  >
                    View
                  </button>
                  {isAccountant && pur.verificationStatus === 'pending' && (
                    <button
                      onClick={() =>
                        verifyPurchaseInvoice(pur.id, 'verified', 'Physically inspected against central warehouse receipt.')
                      }
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold"
                    >
                      Verify Bill
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Record Central Purchase Entry</h2>
            <p className="text-xs text-slate-500 mb-4">
              All regular grocery procurement must be recorded centrally and increases Head Office stock.
            </p>

            <form onSubmit={handleSubmitPurchase} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Wholesale Market *</label>
                  <input
                    type="text"
                    required
                    value={market}
                    onChange={(e) => setMarket(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Invoice / Challan No *</label>
                  <input
                    type="text"
                    required
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              {/* Add Line Items Box */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800">Add Purchased Grocery Products</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Product</label>
                    <select
                      value={selectedProdId}
                      onChange={(e) => {
                        setSelectedProdId(e.target.value);
                        const match = products.find((p) => p.id === e.target.value);
                        if (match) setUnitPrice(match.avgUnitPrice);
                      }}
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
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={(e) => setItemQty(Number(e.target.value))}
                      className="w-full p-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Unit Rate (BDT)</label>
                    <input
                      type="number"
                      min="1"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      className="w-full p-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                  >
                    + Add Product to Purchase
                  </button>
                </div>
              </div>

              {/* Added Line Items Table */}
              {items.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-44 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2">Item</th>
                        <th className="p-2">Qty</th>
                        <th className="p-2">Rate</th>
                        <th className="p-2">Total</th>
                        <th className="p-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-semibold text-slate-900">{it.productName}</td>
                          <td className="p-2">
                            {it.quantity} {it.unit}
                          </td>
                          <td className="p-2">{formatCurrency(it.unitPrice)}</td>
                          <td className="p-2 font-bold text-slate-900">{formatCurrency(it.totalPrice)}</td>
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

              {/* Financial Calculation Strip */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <span className="text-slate-500 block text-[11px]">Subtotal:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500">Discount (BDT):</label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="p-1 rounded border border-slate-300 w-full"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500">Transport Cost (BDT):</label>
                  <input
                    type="number"
                    min="0"
                    value={transportCost}
                    onChange={(e) => setTransportCost(Number(e.target.value))}
                    className="p-1 rounded border border-slate-300 w-full"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="font-bold text-slate-900">Total Net Amount to Pay:</span>
                <span className="text-base font-black text-emerald-800">{formatCurrency(netTotal)}</span>
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
                  Record Purchase & Increase Central Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 text-xs">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-mono text-emerald-700 font-bold">{selectedPurchase.purchaseNo}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedPurchase.vendor}</h3>
              </div>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Market</span>
                  <span className="font-semibold text-slate-800">{selectedPurchase.market}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Invoice No</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedPurchase.invoiceNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Procurement Officer</span>
                  <span className="font-semibold text-slate-800">
                    {selectedPurchase.procurementOfficerName} ({selectedPurchase.procurementOfficerEid})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Verification</span>
                  <span className="font-bold text-emerald-700 uppercase">
                    {selectedPurchase.verificationStatus}
                  </span>
                </div>
              </div>

              <div className="font-bold text-slate-800">Items:</div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Rate</th>
                      <th className="p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPurchase.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{it.productName}</td>
                        <td className="p-2">
                          {it.quantity} {it.unit}
                        </td>
                        <td className="p-2">{formatCurrency(it.unitPrice)}</td>
                        <td className="p-2 font-bold">{formatCurrency(it.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-800">Total Purchase Value:</span>
                <span className="font-black text-slate-900 text-sm">
                  {formatCurrency(selectedPurchase.totalAmount)}
                </span>
              </div>

              {selectedPurchase.verificationNotes && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
                  <strong>Accountant Verification Note:</strong> {selectedPurchase.verificationNotes}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedPurchase(null)}
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

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { MarketPriceEntry } from '../../types';
import { TrendingUp, Plus, AlertCircle, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';

export const MarketPrice: React.FC = () => {
  const { marketPrices, recordMarketPrice, products } = useData();
  const { currentUser } = useAuth();
  const { formatCurrency, formatDate } = useLanguage();

  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New price log state
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [market, setMarket] = useState('Karwan Bazar Wholesale');
  const [vendor, setVendor] = useState('Sonar Bangla Agro');
  const [unitPrice, setUnitPrice] = useState(185);

  const prod = products.find((p) => p.id === selectedProduct);

  const productPrices = marketPrices.filter((p) => p.productId === selectedProduct);
  const latestPrice = productPrices[0]?.unitPrice || prod?.avgUnitPrice || 0;
  const rates = productPrices.map((p) => p.unitPrice);
  const minPrice = rates.length > 0 ? Math.min(...rates) : latestPrice;
  const maxPrice = rates.length > 0 ? Math.max(...rates) : latestPrice;
  const avgPrice = rates.length > 0 ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : latestPrice;

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prod) return;

    await recordMarketPrice({
      productId: prod.id,
      productName: prod.name,
      category: prod.category,
      market,
      vendor,
      date,
      unit: prod.unit,
      unitPrice,
      recordedByEid: currentUser?.eid || '1009',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Market Price History & Anomaly Detection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Wholesale commodity price tracking across 6-year archival history with multi-market price comparisons
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Record Market Price Point
        </button>
      </div>

      {/* Select Product for Deep Comparison */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <label className="font-bold text-slate-700">Analyze Commodity:</label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-bold text-slate-800 text-xs flex-1 max-w-sm"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.unit}) - {p.category}
            </option>
          ))}
        </select>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Current Benchmark Rate</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {formatCurrency(latestPrice)} / {prod?.unit}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">Active Market Rate</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block">12-Month Average</span>
          <span className="text-xl font-black text-indigo-600 mt-1 block">
            {formatCurrency(avgPrice)} / {prod?.unit}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Mean Procurement Base</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Lowest Recorded (12M)</span>
          <span className="text-xl font-black text-teal-600 mt-1 block">
            {formatCurrency(minPrice)} / {prod?.unit}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Best Buying Window</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Highest Recorded Peak</span>
          <span className="text-xl font-black text-rose-600 mt-1 block">
            {formatCurrency(maxPrice)} / {prod?.unit}
          </span>
          <span className="text-[11px] text-rose-500 font-semibold">Seasonal High</span>
        </div>
      </div>

      {/* Price Points History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
          <span>Recorded Market Price Observations</span>
          <span className="text-slate-500 font-normal">
            Automated alerts trigger when price change exceeds &plusmn;15%
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-3">Commodity</th>
              <th className="py-3 px-3">Wholesale Market</th>
              <th className="py-3 px-3">Vendor / Source</th>
              <th className="py-3 px-3">Unit Price (BDT)</th>
              <th className="py-3 px-3">Previous Rate</th>
              <th className="py-3 px-3">Change %</th>
              <th className="py-3 px-4 text-right">Price Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {marketPrices.map((mp) => (
              <tr key={mp.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3 px-4 text-slate-600">{formatDate(mp.date)}</td>
                <td className="py-3 px-3 font-bold text-slate-900">{mp.productName}</td>
                <td className="py-3 px-3 text-slate-700 font-medium">{mp.market}</td>
                <td className="py-3 px-3 text-slate-500">{mp.vendor}</td>
                <td className="py-3 px-3 font-mono font-bold text-slate-900">
                  {formatCurrency(mp.unitPrice)} / {mp.unit}
                </td>
                <td className="py-3 px-3 text-slate-500">
                  {mp.previousPrice ? `${formatCurrency(mp.previousPrice)} / ${mp.unit}` : '-'}
                </td>
                <td className="py-3 px-3">
                  {mp.priceChangePct !== undefined ? (
                    <span
                      className={`inline-flex items-center gap-0.5 font-bold ${
                        mp.priceChangePct > 0
                          ? 'text-rose-600'
                          : mp.priceChangePct < 0
                          ? 'text-emerald-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {mp.priceChangePct > 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {mp.priceChangePct}%
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {mp.isUnusual ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                      Spike Alert
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      Standard
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Record Market Price Entry</h2>
            <form onSubmit={handleRecord} className="space-y-3 mt-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product *</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 font-bold"
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
                  <label className="block font-bold text-slate-700 mb-1">Observation Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-1.5 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Rate (BDT) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full p-1.5 rounded border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Wholesale Market *</label>
                <input
                  type="text"
                  required
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vendor / Source Quotation *</label>
                <input
                  type="text"
                  required
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
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
                  className="px-4 py-2 font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Record Price Point
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

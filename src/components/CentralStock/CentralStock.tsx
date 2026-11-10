import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Warehouse, Search, AlertCircle, Plus } from 'lucide-react';
import { ProductCategory } from '../../types';

export const CentralStock: React.FC = () => {
  const { centralInventory, addProduct } = useData();
  const { formatCurrency } = useLanguage();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New product form
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Rice and Staples');
  const [unit, setUnit] = useState('kg');
  const [isFood, setIsFood] = useState(true);
  const [minStock, setMinStock] = useState(100);
  const [avgPrice, setAvgPrice] = useState(80);

  const categories = [
    'All',
    'Rice and Staples',
    'Pulses',
    'Vegetables',
    'Protein',
    'Dairy',
    'Fruits',
    'Cooking Ingredients',
    'Breakfast and Snacks',
    'Beverage',
    'Kitchen Fuel',
    'Kitchen Supplies',
    'Cleaning',
    'Child Personal Care',
    'Special Nutrition',
  ];

  const filteredItems = centralInventory.filter((item) => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalValue = filteredItems.reduce((acc, i) => acc + i.quantity * i.avgUnitPrice, 0);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProduct({
      name,
      nameBn,
      category,
      unit,
      isFood,
      minStockLevel: minStock,
      avgUnitPrice: avgPrice,
    });
    setIsModalOpen(false);
    setName('');
    setNameBn('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-emerald-600" />
            Head Office Central Stock
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Central warehouse inventory, procurement receipts and facility allocation balances
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Catalog Product
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search central inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <span className="font-bold text-slate-700">
          Total Valuation: <span className="text-emerald-700">{formatCurrency(totalValue)}</span>
        </span>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="py-3 px-4">Commodity Product</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Unit</th>
              <th className="py-3 px-3">Available Quantity</th>
              <th className="py-3 px-3">Min Reorder Level</th>
              <th className="py-3 px-3">Avg Rate (BDT)</th>
              <th className="py-3 px-3">Total Value</th>
              <th className="py-3 px-4 text-right">Stock Condition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const isLow = item.quantity <= item.minStockLevel;
              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{item.productName}</td>
                  <td className="py-3 px-3 text-slate-600">{item.category}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{item.unit}</td>
                  <td className="py-3 px-3 font-bold text-base text-slate-900">
                    {item.quantity.toLocaleString()} {item.unit}
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
                        isLow ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isLow ? 'Low Stock' : 'Optimal'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Catalog Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Add Master Product to Catalog</h2>
            <form onSubmit={handleCreateProduct} className="space-y-3 mt-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name (English) *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-1.5 rounded border border-slate-300 bg-slate-50"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="kg, liter, packet..."
                    className="w-full p-1.5 rounded border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isFood"
                  checked={isFood}
                  onChange={(e) => setIsFood(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="isFood" className="text-slate-700 font-semibold cursor-pointer">
                  Item is food (included in Child Food Cost calculation)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Reorder Level</label>
                  <input
                    type="number"
                    min="1"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full p-1.5 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Est Rate (BDT)</label>
                  <input
                    type="number"
                    min="1"
                    value={avgPrice}
                    onChange={(e) => setAvgPrice(Number(e.target.value))}
                    className="w-full p-1.5 rounded border border-slate-300"
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
                  className="px-4 py-2 font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

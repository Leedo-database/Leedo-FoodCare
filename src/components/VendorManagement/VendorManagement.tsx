import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Store, Phone, MapPin, Building, Plus } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  market: string;
  contactPerson: string;
  phone: string;
  categories: string[];
  status: 'active' | 'inactive';
}

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Haji Rice Agency',
    market: 'Badamtoli Wholesale Market, Dhaka',
    contactPerson: 'Haji Nurul Islam',
    phone: '+8801712345671',
    categories: ['Rice and Staples'],
    status: 'active',
  },
  {
    id: 'v2',
    name: 'Bismillah Oil & Grocery',
    market: 'Moulvibazar Wholesale Market',
    contactPerson: 'Md. Faruk Hossain',
    phone: '+8801712345672',
    categories: ['Cooking Ingredients', 'Pulses'],
    status: 'active',
  },
  {
    id: 'v3',
    name: 'Sonar Bangla Poultry & Agro',
    market: 'Kaptan Bazar, Dhaka',
    contactPerson: 'Abdur Rahim',
    phone: '+8801712345673',
    categories: ['Protein'],
    status: 'active',
  },
  {
    id: 'v4',
    name: 'Tejgaon Egg Supply Syndicate',
    market: 'Tejgaon Wholesale Egg Market',
    contactPerson: 'Kamal Ahmed',
    phone: '+8801712345674',
    categories: ['Protein'],
    status: 'active',
  },
  {
    id: 'v5',
    name: 'Karwan Bazar Fresh Produce',
    market: 'Karwan Bazar, Dhaka',
    contactPerson: 'Siraj Mia',
    phone: '+8801712345675',
    categories: ['Vegetables', 'Fruits'],
    status: 'active',
  },
  {
    id: 'v6',
    name: 'Bengal LP Gas Distributor',
    market: 'Mohammadpur, Dhaka',
    contactPerson: 'Nazmul Haque',
    phone: '+8801712345676',
    categories: ['Kitchen Fuel'],
    status: 'active',
  },
];

export const VendorManagement: React.FC = () => {
  const { purchases } = useData();
  const { formatCurrency } = useLanguage();
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [market, setMarket] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [categoriesInput, setCategoriesInput] = useState('Rice and Staples, Pulses');

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const newV: Vendor = {
      id: `v_${Date.now()}`,
      name,
      market,
      contactPerson,
      phone,
      categories: categoriesInput.split(',').map((c) => c.trim()),
      status: 'active',
    };
    setVendors((prev) => [...prev, newV]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-emerald-600" />
            Approved Wholesale Vendor Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Registered wholesale suppliers, wholesale market locations and procurement trade records
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Register New Vendor
        </button>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((v) => {
          const vendorPurchases = purchases.filter((p) => p.vendor === v.name);
          const totalSpent = vendorPurchases.reduce((acc, p) => acc + p.totalAmount, 0);

          return (
            <div key={v.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{v.name}</h3>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {v.market}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                  {v.status}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Contact:</span>
                  <span className="font-semibold text-slate-800">{v.contactPerson}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phone:</span>
                  <span className="font-mono text-slate-700">{v.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cumulative Procurement:</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(totalSpent)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100">
                {v.categories.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Register Wholesale Vendor</h2>
            <form onSubmit={handleAddVendor} className="space-y-3 mt-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Wholesale Market Location *</label>
                <input
                  type="text"
                  required
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full p-1.5 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-1.5 rounded border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Supplied Categories (comma separated)</label>
                <input
                  type="text"
                  value={categoriesInput}
                  onChange={(e) => setCategoriesInput(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
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
                  Register Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

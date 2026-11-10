import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [eid, setEid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!eid.trim()) {
      setError('Please enter your Employee ID (EID)');
      return;
    }

    setLoading(true);
    try {
      const res = await login(eid, password);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl p-2 shadow-md border border-slate-100 mb-3">
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
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            LEEDO <span className="text-emerald-600">FOODCARE</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Local Education and Economic Development Organization, Bangladesh
          </p>
          <div className="inline-block mt-2.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-[11px] font-semibold text-slate-700">
            দৈনিক কর্মী লগইন (Employee ID Authentication)
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Employee ID (EID / কর্মী আইডি) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                value={eid}
                onChange={(e) => setEid(e.target.value)}
                placeholder="আপনার EID নম্বর লিখুন"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password (পাসওয়ার্ড) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              প্রথমবার লগইনের ক্ষেত্রে আপনার <strong>EID নম্বরটিই</strong> প্রাথমিক পাসওয়ার্ড। প্রথম লগইনের সাথে সাথেই পাসওয়ার্ড পরিবর্তন করা বাধ্যতামূলক এবং পরিবর্তিত পাসওয়ার্ডটি স্থায়ীভাবে সংরক্ষিত থাকবে।
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন (Sign In)'}
          </button>
        </form>
      </div>
    </div>
  );
};

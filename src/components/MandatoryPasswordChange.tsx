import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, ShieldAlert, Check, AlertCircle } from 'lucide-react';

interface MandatoryPasswordChangeProps {
  onSuccess: () => void;
}

export const MandatoryPasswordChange: React.FC<MandatoryPasswordChangeProps> = ({ onSuccess }) => {
  const { currentUser, changePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) return;

    if (newPassword === currentUser.eid) {
      setError('Security Policy: Your new password cannot be the same as your Employee ID (EID).');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(newPassword);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Mandatory Password Change</h2>
            <p className="text-xs text-slate-500">LEEDO FOODCARE Organizational Security Policy</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 mb-5 text-xs text-amber-900 leading-relaxed">
          <strong>Employee Notice:</strong> You are logged in with default credentials for Employee ID{' '}
          <strong>{currentUser?.eid}</strong> ({currentUser?.name}). For security and accountability, you must set a permanent confidential password before accessing the dashboard.
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Minimum 6 characters. Must not equal EID {currentUser?.eid}.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Check className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Securing Account...' : 'Set Password & Enter Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

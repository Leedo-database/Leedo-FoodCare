import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Bell, Globe, LogOut, KeyRound } from 'lucide-react';

interface HeaderProps {
  onOpenPasswordChange: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPasswordChange,
  onOpenNotifications,
}) => {
  const { currentUser, logout, canAccessFacility } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { notifications, exceptions } = useData();

  const unreadNotifs = notifications.filter(
    (n) => !n.read && (!n.facilityId || canAccessFacility(n.facilityId))
  ).length;
  const openExceptions = exceptions.filter(
    (e) => e.status === 'open' && canAccessFacility(e.facilityId)
  ).length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Org Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center shadow-sm">
              <img
                src="/leedo-logo.png"
                alt="LEEDO Bangladesh"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/assets/aistudio/.trashed-1796487643-Logo-of-LEEDO-Short-01-746x1024_a345b8a2.png';
                }}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                  LEEDO <span className="text-emerald-400 font-black">FOODCARE</span>
                </span>
                <span className="hidden md:inline-block text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  Bangladesh
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate max-w-md">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-3">
            {/* Language Toggle (Bangla / English) */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Notifications & Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs + openExceptions > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                  {unreadNotifs + openExceptions}
                </span>
              )}
            </button>

            {/* Current User Badge & Menu */}
            {currentUser && (
              <div className="flex items-center space-x-3 border-l border-slate-700/80 pl-3">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-bold text-slate-100 flex items-center justify-end gap-1">
                    {currentUser.name}
                    <span className="text-slate-400 text-[11px] font-normal">
                      (EID {currentUser.eid})
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium truncate">
                    {currentUser.designation}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={onOpenPasswordChange}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                    title={t('changePassword')}
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>

                  <button
                    onClick={logout}
                    className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-slate-800 transition"
                    title={t('logout')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

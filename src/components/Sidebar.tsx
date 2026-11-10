import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
  Receipt,
  Warehouse,
  Truck,
  PackageCheck,
  Boxes,
  UtensilsCrossed,
  Users2,
  Trash2,
  TrendingUp,
  Landmark,
  Store,
  FileSpreadsheet,
  AlertOctagon,
  CalendarCheck2,
  UserCog,
  FileClock,
  Settings2,
  Gift,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'requisitions'
  | 'procurement'
  | 'purchases'
  | 'centralStock'
  | 'distribution'
  | 'receiving'
  | 'facilityInventory'
  | 'donorContributions'
  | 'consumption'
  | 'attendance'
  | 'wastage'
  | 'marketPrice'
  | 'budgetAccounts'
  | 'vendors'
  | 'reportCenter'
  | 'exceptions'
  | 'monthlyClosing'
  | 'hrManagement'
  | 'auditLogs'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { canAccessModule, canAccessFacility, currentUser } = useAuth();
  const { t } = useLanguage();
  const { requisitions, receivings, exceptions, purchases } = useData();

  const pendingReqs = requisitions.filter(
    (r) => canAccessFacility(r.facilityId) && (r.status === 'submitted' || r.status === 'incharge_approved')
  ).length;
  const pendingReceivings = receivings.filter(
    (r) => canAccessFacility(r.facilityId) && r.status === 'awaiting_receipt'
  ).length;
  const openExceptions = exceptions.filter(
    (e) => canAccessFacility(e.facilityId) && e.status === 'open'
  ).length;
  const pendingInvoices =
    currentUser?.facilityId === 'central'
      ? purchases.filter((p) => p.verificationStatus === 'pending').length
      : 0;

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'requisitions',
      label: t('requisitions'),
      icon: <ClipboardList className="w-4 h-4" />,
      badge: pendingReqs > 0 ? pendingReqs : undefined,
      badgeColor: 'bg-amber-500',
    },
    { id: 'procurement', label: t('procurement'), icon: <ShoppingCart className="w-4 h-4" /> },
    {
      id: 'purchases',
      label: t('purchases'),
      icon: <Receipt className="w-4 h-4" />,
      badge: pendingInvoices > 0 ? pendingInvoices : undefined,
      badgeColor: 'bg-indigo-500',
    },
    { id: 'centralStock', label: t('centralStock'), icon: <Warehouse className="w-4 h-4" /> },
    { id: 'distribution', label: t('distribution'), icon: <Truck className="w-4 h-4" /> },
    {
      id: 'receiving',
      label: t('receiving'),
      icon: <PackageCheck className="w-4 h-4" />,
      badge: pendingReceivings > 0 ? pendingReceivings : undefined,
      badgeColor: 'bg-emerald-500',
    },
    { id: 'facilityInventory', label: t('facilityInventory'), icon: <Boxes className="w-4 h-4" /> },
    { id: 'donorContributions', label: t('donorContributions'), icon: <Gift className="w-4 h-4" /> },
    { id: 'consumption', label: t('consumption'), icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'attendance', label: t('attendance'), icon: <Users2 className="w-4 h-4" /> },
    { id: 'wastage', label: t('wastage'), icon: <Trash2 className="w-4 h-4" /> },
    { id: 'marketPrice', label: t('marketPrice'), icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'budgetAccounts', label: t('budgetAccounts'), icon: <Landmark className="w-4 h-4" /> },
    { id: 'vendors', label: t('vendors'), icon: <Store className="w-4 h-4" /> },
    { id: 'reportCenter', label: t('reportCenter'), icon: <FileSpreadsheet className="w-4 h-4" /> },
    {
      id: 'exceptions',
      label: t('exceptions'),
      icon: <AlertOctagon className="w-4 h-4" />,
      badge: openExceptions > 0 ? openExceptions : undefined,
      badgeColor: 'bg-rose-500',
    },
    { id: 'monthlyClosing', label: t('monthlyClosing'), icon: <CalendarCheck2 className="w-4 h-4" /> },
    { id: 'hrManagement', label: t('hrManagement'), icon: <UserCog className="w-4 h-4" /> },
    { id: 'auditLogs', label: t('auditLogs'), icon: <FileClock className="w-4 h-4" /> },
    { id: 'settings', label: t('settings'), icon: <Settings2 className="w-4 h-4" /> },
  ];

  const visibleItems = navItems.filter((item) => canAccessModule(item.id));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Facility Info Banner */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800">
          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            Current Access
          </div>
          <div className="text-xs font-semibold text-emerald-400 truncate mt-0.5">
            {currentUser?.facilityId === 'central'
              ? 'Head Office Central Warehouse'
              : currentUser?.facilityId === 'kamalapur'
              ? 'Kamalapur TSSB'
              : currentUser?.facilityId === 'kadamtali'
              ? 'Kadamtali TSSB'
              : 'LEEDO Peace Home'}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Role: <span className="capitalize text-slate-200">{currentUser?.role.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 custom-scrollbar">
          {visibleItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <span
                    className={`${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white ${
                      item.badgeColor || 'bg-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
          <span>LEEDO FOODCARE v2.4</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Connected" />
        </div>
      </aside>
    </>
  );
};

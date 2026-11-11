import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider } from './context/DataContext';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { MandatoryPasswordChange } from './components/MandatoryPasswordChange';
import { NotificationsModal } from './components/NotificationsModal';

// Modules
import { Dashboard } from './components/Dashboard/Dashboard';
import { Requisitions } from './components/Requisitions/Requisitions';
import { Procurement } from './components/Procurement/Procurement';
import { CentralStock } from './components/CentralStock/CentralStock';
import { Distribution } from './components/Distribution/Distribution';
import { ReceivingConfirmation } from './components/ReceivingConfirmation/ReceivingConfirmation';
import { FacilityInventory } from './components/FacilityInventory/FacilityInventory';
import { DonorContributions } from './components/DonorContributions/DonorContributions';
import { DailyConsumption } from './components/DailyConsumption/DailyConsumption';
import { MealAttendance } from './components/MealAttendance/MealAttendance';
import { Wastage } from './components/Wastage/Wastage';
import { MarketPrice } from './components/MarketPrice/MarketPrice';
import { BudgetAccounts } from './components/BudgetAccounts/BudgetAccounts';
import { VendorManagement } from './components/VendorManagement/VendorManagement';
import { ReportCenter } from './components/ReportCenter/ReportCenter';
import { ExceptionMonitoring } from './components/ExceptionMonitoring/ExceptionMonitoring';
import { MonthlyClosing } from './components/MonthlyClosing/MonthlyClosing';
import { HRManagement } from './components/HRManagement/HRManagement';
import { AuditLogs } from './components/AuditLogs/AuditLogs';
import { Settings } from './components/Settings/Settings';

const MainLayout: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // If no logged in user, display Login Modal
  if (!currentUser) {
    return <LoginModal onSuccess={() => setActiveTab('dashboard')} />;
  }

  // Mandatory First Login Password Change Gate
  const requiresPasswordChange = !currentUser.passwordChanged || currentUser.requiresPasswordReset;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {requiresPasswordChange && (
        <MandatoryPasswordChange onSuccess={() => setActiveTab('dashboard')} />
      )}

      {/* App Header */}
      <Header
        onOpenPasswordChange={() => setIsPasswordChangeOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Mobile Menu Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold"
            >
              &#9776; Navigation Menu
            </button>
          </div>

          {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === 'requisitions' && <Requisitions />}
          {activeTab === 'procurement' && <Procurement />}
          {activeTab === 'purchases' && <Procurement />}
          {activeTab === 'centralStock' && <CentralStock />}
          {activeTab === 'distribution' && <Distribution />}
          {activeTab === 'receiving' && <ReceivingConfirmation />}
          {activeTab === 'facilityInventory' && <FacilityInventory />}
          {activeTab === 'donorContributions' && <DonorContributions />}
          {activeTab === 'consumption' && <DailyConsumption />}
          {activeTab === 'attendance' && <MealAttendance />}
          {activeTab === 'wastage' && <Wastage />}
          {activeTab === 'marketPrice' && <MarketPrice />}
          {activeTab === 'budgetAccounts' && <BudgetAccounts />}
          {activeTab === 'vendors' && <VendorManagement />}
          {activeTab === 'reportCenter' && <ReportCenter />}
          {activeTab === 'exceptions' && <ExceptionMonitoring />}
          {activeTab === 'monthlyClosing' && <MonthlyClosing />}
          {activeTab === 'hrManagement' && <HRManagement />}
          {activeTab === 'auditLogs' && <AuditLogs />}
          {activeTab === 'settings' && <Settings />}

          <footer className="mt-10 pt-4 border-t border-slate-200/80 text-center text-[11px] text-slate-400 print:hidden">
            Develop by shadowgili
          </footer>
        </main>
      </div>

      {/* Modals */}
      {isPasswordChangeOpen && (
        <MandatoryPasswordChange onSuccess={() => setIsPasswordChangeOpen(false)} />
      )}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToModule={(mod) => setActiveTab(mod as NavTab)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <MainLayout />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

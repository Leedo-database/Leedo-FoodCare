import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (dateStr: string) => string;
}

const translations: Record<string, { en: string; bn: string }> = {
  // App branding
  appName: { en: 'LEEDO FOODCARE', bn: 'লিডো ফুডকেয়ার' },
  orgName: {
    en: 'Local Education and Economic Development Organization (LEEDO), Bangladesh',
    bn: 'লোকাল এডুকেশন অ্যান্ড ইকোনমিক ডেভেলপমেন্ট অর্গানাইজেশন (লিডো), বাংলাদেশ',
  },
  tagline: {
    en: 'Centralized Grocery Procurement, Inventory & Child Nutrition Monitoring',
    bn: 'কেন্দ্রীয় খাদ্যদ্রব্য সংগ্রহ, ইনভেন্টরি ও শিশু পুষ্টি পর্যবেক্ষণ ব্যবস্থা',
  },

  // Navigation
  dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  requisitions: { en: 'Requisitions', bn: 'চাহিদাপত্র (রিকুইজিশন)' },
  procurement: { en: 'Procurement', bn: 'কেন্দ্রীয় সংগ্রহ' },
  purchases: { en: 'Purchase Records', bn: 'ক্রয় হিসাব ও চালান' },
  centralStock: { en: 'Central Stock', bn: 'কেন্দ্রীয় গুদাম' },
  distribution: { en: 'Facility Distribution', bn: 'আশ্রয়কেন্দ্র বিতরণ' },
  receiving: { en: 'Receiving Confirmation', bn: 'পণ্য গ্রহণ নিশ্চিতকরণ' },
  facilityInventory: { en: 'Facility Inventory', bn: 'আশ্রয়কেন্দ্র স্টক' },
  consumption: { en: 'Daily Consumption', bn: 'দৈনিক খাদ্য ভোগ' },
  attendance: { en: 'Meal & Attendance', bn: 'খাবার ও শিশুর উপস্থিতি' },
  wastage: { en: 'Wastage Tracking', bn: 'অপচয় ট্র্যাকিং' },
  marketPrice: { en: 'Market Price History', bn: 'বাজার দর ইতিহাস' },
  budgetAccounts: { en: 'Budget & Accounts', bn: 'বাজেট ও হিসাব' },
  vendors: { en: 'Vendor Management', bn: 'সরবরাহকারী (ভেন্ডর)' },
  reportCenter: { en: 'Reports & Print Center', bn: 'প্রতিবেদন ও প্রিন্ট সেন্টার' },
  exceptions: { en: 'Exception Monitoring', bn: 'অনিয়ম ও সতর্কতা' },
  donorContributions: { en: 'Donor Gifts & Local Purchase', bn: 'দাতার খাদ্য অনুদান ও স্থানীয় ক্রয়' },
  monthlyClosing: { en: 'Monthly Closing', bn: 'মাসিক হিসাব সমাপ্তি' },
  hrManagement: { en: 'HR & User Directory', bn: 'এইচআর ও ব্যবহারকারী' },
  auditLogs: { en: 'Audit Logs', bn: 'নিরীক্ষা লগ (অডিট লগ)' },
  settings: { en: 'Settings', bn: 'সেটিংস' },

  // Common terms
  facility: { en: 'Facility', bn: 'আশ্রয়কেন্দ্র/শাখা' },
  allFacilities: { en: 'All Facilities', bn: 'সকল আশ্রয়কেন্দ্র' },
  kamalapur: { en: 'Kamalapur TSSB', bn: 'কমলাপুর টিএসএসবি' },
  kadamtali: { en: 'Kadamtali TSSB', bn: 'কদমতলী টিএসএসবি' },
  peaceHome: { en: 'LEEDO Peace Home', bn: 'লিডো পিস হোম' },
  headOffice: { en: 'Head Office Central Warehouse', bn: 'প্রধান কার্যালয় কেন্দ্রীয় গুদাম' },
  search: { en: 'Search...', bn: 'অনুসন্ধান করুন...' },
  filter: { en: 'Filter', bn: 'ফিল্টার' },
  print: { en: 'Print Report', bn: 'প্রিন্ট করুন' },
  exportExcel: { en: 'Export Excel', bn: 'এক্সেলে ডাউনলোড' },
  exportCsv: { en: 'Export CSV', bn: 'সিএসভি ডাউনলোড' },
  save: { en: 'Save', bn: 'সংরক্ষণ করুন' },
  cancel: { en: 'Cancel', bn: 'বাতিল' },
  submit: { en: 'Submit', bn: 'জমা দিন' },
  approve: { en: 'Approve', bn: 'অনুমোদন করুন' },
  reject: { en: 'Reject', bn: 'প্রত্যাখ্যান করুন' },
  status: { en: 'Status', bn: 'অবস্থা' },
  date: { en: 'Date', bn: 'তারিখ' },
  action: { en: 'Action', bn: 'কার্যক্রম' },
  total: { en: 'Total', bn: 'সর্বমোট' },
  bdt: { en: 'BDT', bn: 'টাকা' },
  costPerChild: { en: 'Cost Per Child', bn: 'শিশু প্রতি খাদ্য খরচ' },
  childDays: { en: 'Child-Days', bn: 'শিশু-দিন' },
  logout: { en: 'Sign Out', bn: 'লগআউট' },
  changePassword: { en: 'Change Password', bn: 'পাসওয়ার্ড পরিবর্তন' },
  welcome: { en: 'Welcome', bn: 'স্বাগতম' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('leedo_lang') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('leedo_lang', language);
  }, [language]);

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    return key;
  };

  const formatCurrency = (amount: number): string => {
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return language === 'bn' ? `৳ ${formatted}` : `BDT ${formatted}`;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        // DD-MM-YYYY format as specified
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatCurrency, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

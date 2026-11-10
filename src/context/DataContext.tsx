import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  FacilityId,
  Product,
  Purchase,
  Requisition,
  Distribution,
  ReceivingConfirmation,
  DailyConsumption,
  MarketPriceEntry,
  FacilityBudget,
  ManagementException,
  AuditLog,
  InventoryItem,
  InAppNotification,
  MonthlyClosingRecord,
  WastageRecord,
  DonorContribution,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_PURCHASES,
  INITIAL_DISTRIBUTIONS,
  INITIAL_RECEIVINGS,
  INITIAL_REQUISITIONS,
  INITIAL_DAILY_CONSUMPTION,
  INITIAL_MARKET_PRICES,
  INITIAL_BUDGETS,
  INITIAL_EXCEPTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CENTRAL_INVENTORY,
  INITIAL_DONOR_CONTRIBUTIONS,
} from '../data/initialData';
import { useAuth } from './AuthContext';

interface DataContextType {
  products: Product[];
  centralInventory: InventoryItem[];
  facilityInventory: InventoryItem[];
  purchases: Purchase[];
  requisitions: Requisition[];
  distributions: Distribution[];
  receivings: ReceivingConfirmation[];
  dailyConsumptions: DailyConsumption[];
  wastageRecords: WastageRecord[];
  marketPrices: MarketPriceEntry[];
  budgets: FacilityBudget[];
  exceptions: ManagementException[];
  auditLogs: AuditLog[];
  notifications: InAppNotification[];
  monthlyClosings: MonthlyClosingRecord[];
  donorContributions: DonorContribution[];

  // Actions
  recordDonorContribution: (data: Omit<DonorContribution, 'id' | 'entryNo' | 'createdAt'>) => Promise<string>;
  submitRequisition: (req: Omit<Requisition, 'id' | 'reqNo' | 'createdAt'>) => Promise<string>;
  updateRequisitionStatus: (id: string, status: Requisition['status'], remarks?: string) => Promise<void>;
  recordPurchase: (purchase: Omit<Purchase, 'id' | 'purchaseNo' | 'createdAt'>) => Promise<string>;
  verifyPurchaseInvoice: (id: string, status: Purchase['verificationStatus'], notes?: string) => Promise<void>;
  dispatchDistribution: (dist: Omit<Distribution, 'id' | 'distributionNo' | 'createdAt'>) => Promise<string>;
  confirmReceiving: (
    id: string,
    actualQty: number,
    damagedQty: number,
    condition: ReceivingConfirmation['condition'],
    remarks: string
  ) => Promise<void>;
  recordDailyConsumption: (data: Omit<DailyConsumption, 'id' | 'createdAt' | 'totalFoodCost' | 'costPerChild' | 'costPerMeal'>) => Promise<string>;
  recordWastage: (wastage: Omit<WastageRecord, 'id' | 'createdAt'>) => Promise<string>;
  recordMarketPrice: (price: Omit<MarketPriceEntry, 'id' | 'createdAt'>) => Promise<string>;
  resolveException: (id: string, resolutionNote: string) => Promise<void>;
  performMonthlyClosing: (yearMonth: string, facilityId: FacilityId | 'all', notes: string) => Promise<void>;
  reopenMonthlyClosing: (id: string, reason: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  addAuditLog: (action: string, module: string, recordId?: string, facilityId?: FacilityId | 'all', details?: string) => void;
  markNotificationAsRead: (id: string) => void;
  getFacilityStock: (facilityId: FacilityId, productId: string) => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Production clean slate check: wipe out any previous mock data
  const CLEAN_SLATE_KEY = 'leedo_foodcare_v5_clean_production';
  if (typeof window !== 'undefined' && localStorage.getItem(CLEAN_SLATE_KEY) !== 'yes') {
    [
      'products',
      'central_inv',
      'facility_inv',
      'purchases',
      'requisitions',
      'distributions',
      'receivings',
      'daily_consumption',
      'wastage',
      'market_prices',
      'budgets',
      'exceptions',
      'audit_logs',
      'notifications',
      'monthly_closings',
      'donor_contributions',
    ].forEach((k) => localStorage.removeItem(`leedo_foodcare_${k}`));
    localStorage.setItem(CLEAN_SLATE_KEY, 'yes');
  }

  // Helper for local storage persistence
  const loadStored = <T,>(key: string, fallback: T): T => {
    const saved = localStorage.getItem(`leedo_foodcare_${key}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return fallback;
      }
    }
    return fallback;
  };

  const [products, setProducts] = useState<Product[]>(() => loadStored('products', INITIAL_PRODUCTS));
  const [centralInventory, setCentralInventory] = useState<InventoryItem[]>(() => loadStored('central_inv', INITIAL_CENTRAL_INVENTORY));

  // Initialize clean facility inventory with 0 stock
  const [facilityInventory, setFacilityInventory] = useState<InventoryItem[]>(() => {
    const saved = loadStored<InventoryItem[]>('facility_inv', []);
    if (saved && saved.length > 0) return saved;

    const items: InventoryItem[] = [];
    const facilities: FacilityId[] = ['kamalapur', 'kadamtali', 'peace_home'];
    facilities.forEach((fac) => {
      INITIAL_PRODUCTS.forEach((p) => {
        items.push({
          id: `fac_${fac}_${p.id}`,
          productId: p.id,
          facilityId: fac,
          productName: p.name,
          category: p.category,
          unit: p.unit,
          quantity: 0,
          lastUpdated: new Date().toISOString().substring(0, 10),
          minStockLevel: Math.round(p.minStockLevel * (fac === 'peace_home' ? 0.6 : 0.3)),
          avgUnitPrice: p.avgUnitPrice,
        });
      });
    });
    return items;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => loadStored('purchases', INITIAL_PURCHASES));
  const [requisitions, setRequisitions] = useState<Requisition[]>(() => loadStored('requisitions', INITIAL_REQUISITIONS));
  const [distributions, setDistributions] = useState<Distribution[]>(() => loadStored('distributions', INITIAL_DISTRIBUTIONS));
  const [receivings, setReceivings] = useState<ReceivingConfirmation[]>(() => loadStored('receivings', INITIAL_RECEIVINGS));
  const [dailyConsumptions, setDailyConsumptions] = useState<DailyConsumption[]>(() => loadStored('daily_consumption', INITIAL_DAILY_CONSUMPTION));
  const [wastageRecords, setWastageRecords] = useState<WastageRecord[]>(() => loadStored('wastage', []));
  const [marketPrices, setMarketPrices] = useState<MarketPriceEntry[]>(() => loadStored('market_prices', INITIAL_MARKET_PRICES));
  const [budgets, setBudgets] = useState<FacilityBudget[]>(() => loadStored('budgets', INITIAL_BUDGETS));
  const [exceptions, setExceptions] = useState<ManagementException[]>(() => loadStored('exceptions', INITIAL_EXCEPTIONS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStored('audit_logs', INITIAL_AUDIT_LOGS));
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => loadStored('notifications', []));
  const [monthlyClosings, setMonthlyClosings] = useState<MonthlyClosingRecord[]>(() => loadStored('monthly_closings', []));
  const [donorContributions, setDonorContributions] = useState<DonorContribution[]>(() => loadStored('donor_contributions', INITIAL_DONOR_CONTRIBUTIONS));

  // Auto-sync state to localStorage
  useEffect(() => {
    localStorage.setItem('leedo_foodcare_products', JSON.stringify(products));
    localStorage.setItem('leedo_foodcare_central_inv', JSON.stringify(centralInventory));
    localStorage.setItem('leedo_foodcare_facility_inv', JSON.stringify(facilityInventory));
    localStorage.setItem('leedo_foodcare_purchases', JSON.stringify(purchases));
    localStorage.setItem('leedo_foodcare_requisitions', JSON.stringify(requisitions));
    localStorage.setItem('leedo_foodcare_distributions', JSON.stringify(distributions));
    localStorage.setItem('leedo_foodcare_receivings', JSON.stringify(receivings));
    localStorage.setItem('leedo_foodcare_daily_consumption', JSON.stringify(dailyConsumptions));
    localStorage.setItem('leedo_foodcare_wastage', JSON.stringify(wastageRecords));
    localStorage.setItem('leedo_foodcare_market_prices', JSON.stringify(marketPrices));
    localStorage.setItem('leedo_foodcare_budgets', JSON.stringify(budgets));
    localStorage.setItem('leedo_foodcare_exceptions', JSON.stringify(exceptions));
    localStorage.setItem('leedo_foodcare_audit_logs', JSON.stringify(auditLogs));
    localStorage.setItem('leedo_foodcare_notifications', JSON.stringify(notifications));
    localStorage.setItem('leedo_foodcare_monthly_closings', JSON.stringify(monthlyClosings));
    localStorage.setItem('leedo_foodcare_donor_contributions', JSON.stringify(donorContributions));
  }, [
    products,
    centralInventory,
    facilityInventory,
    purchases,
    requisitions,
    distributions,
    receivings,
    dailyConsumptions,
    wastageRecords,
    marketPrices,
    budgets,
    exceptions,
    auditLogs,
    notifications,
    monthlyClosings,
    donorContributions,
  ]);

  const addAuditLog = (action: string, module: string, recordId?: string, facilityId: FacilityId | 'all' = 'central', details = '') => {
    const newLog: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eid: currentUser?.eid || '1001',
      userName: currentUser?.name || 'System',
      action,
      module,
      recordId,
      facilityId,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const getFacilityStock = (facilityId: FacilityId, productId: string): number => {
    if (facilityId === 'central') {
      const found = centralInventory.find((i) => i.productId === productId);
      return found ? found.quantity : 0;
    }
    const found = facilityInventory.find((i) => i.facilityId === facilityId && i.productId === productId);
    return found ? found.quantity : 0;
  };

  // Requisitions Workflow
  const submitRequisition = async (req: Omit<Requisition, 'id' | 'reqNo' | 'createdAt'>): Promise<string> => {
    const id = `req_${Date.now()}`;
    const facPrefix = req.facilityId === 'kamalapur' ? 'KAM' : req.facilityId === 'kadamtali' ? 'KAD' : 'PEACE';
    const reqNo = `REQ-${facPrefix}-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newReq: Requisition = {
      ...req,
      id,
      reqNo,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setRequisitions((prev) => [newReq, ...prev]);
    addAuditLog('SUBMIT_REQUISITION', 'Requisitions', reqNo, req.facilityId, `Submitted requisition for ${req.items.length} items`);

    // In-app notification to Logistics & Admin
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: 'New Requisition Submitted',
        message: `${req.requestingName} submitted ${reqNo} for ${req.facilityId}.`,
        type: req.priority === 'urgent' ? 'alert' : 'info',
        module: 'Requisitions',
        facilityId: req.facilityId,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        read: false,
      },
      ...prev,
    ]);

    return id;
  };

  const updateRequisitionStatus = async (id: string, status: Requisition['status'], remarks?: string) => {
    setRequisitions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, remarks: remarks || r.remarks, approvedByEid: currentUser?.eid } : r))
    );
    addAuditLog('UPDATE_REQUISITION_STATUS', 'Requisitions', id, 'central', `Status updated to ${status}. Notes: ${remarks || 'None'}`);
  };

  // Central Purchase Management
  const recordPurchase = async (purchase: Omit<Purchase, 'id' | 'purchaseNo' | 'createdAt'>): Promise<string> => {
    const id = `pur_${Date.now()}`;
    const purchaseNo = `PUR-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(purchases.length + 1).padStart(3, '0')}`;

    const newPurchase: Purchase = {
      ...purchase,
      id,
      purchaseNo,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setPurchases((prev) => [newPurchase, ...prev]);

    // INCREMENT Central Inventory
    setCentralInventory((prev) => {
      const updated = [...prev];
      newPurchase.items.forEach((item) => {
        const existingIdx = updated.findIndex((i) => i.productId === item.productId);
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + item.quantity,
            avgUnitPrice: item.unitPrice,
            lastUpdated: new Date().toISOString().substring(0, 10),
          };
        } else {
          updated.push({
            id: `cent_${item.productId}`,
            productId: item.productId,
            facilityId: 'central',
            productName: item.productName,
            category: item.category,
            unit: item.unit,
            quantity: item.quantity,
            lastUpdated: new Date().toISOString().substring(0, 10),
            minStockLevel: 50,
            avgUnitPrice: item.unitPrice,
          });
        }
      });
      return updated;
    });

    // Auto record market prices
    newPurchase.items.forEach((item) => {
      recordMarketPrice({
        productId: item.productId,
        productName: item.productName,
        category: item.category,
        market: newPurchase.market,
        vendor: newPurchase.vendor,
        date: newPurchase.purchaseDate,
        unit: item.unit,
        unitPrice: item.unitPrice,
        recordedByEid: currentUser?.eid || '1009',
      });
    });

    addAuditLog('RECORD_PURCHASE', 'Procurement', purchaseNo, 'central', `Recorded purchase of ${purchase.items.length} items from ${purchase.vendor}. Total: ${purchase.totalAmount} BDT.`);
    return id;
  };

  const verifyPurchaseInvoice = async (id: string, status: Purchase['verificationStatus'], notes?: string) => {
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              verificationStatus: status,
              verifiedByEid: currentUser?.eid,
              verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              verificationNotes: notes,
            }
          : p
      )
    );
    addAuditLog('VERIFY_INVOICE', 'Accounts', id, 'central', `Invoice verification status set to ${status}. Notes: ${notes || ''}`);
  };

  // Facility Distribution Workflow
  const dispatchDistribution = async (dist: Omit<Distribution, 'id' | 'distributionNo' | 'createdAt'>): Promise<string> => {
    // Check available central stock
    const available = getFacilityStock('central', dist.productId);
    if (dist.totalQuantity > available) {
      throw new Error(`Insufficient central stock for ${dist.productName}. Available: ${available} ${dist.unit}, requested dispatch: ${dist.totalQuantity} ${dist.unit}`);
    }

    const id = `dist_${Date.now()}`;
    const distributionNo = `DIS-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(distributions.length + 1).padStart(3, '0')}`;

    const newDist: Distribution = {
      ...dist,
      id,
      distributionNo,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setDistributions((prev) => [newDist, ...prev]);

    // DECREMENT Central Inventory
    setCentralInventory((prev) =>
      prev.map((item) =>
        item.productId === dist.productId ? { ...item, quantity: item.quantity - dist.totalQuantity } : item
      )
    );

    // Create pending ReceivingConfirmation records for each shelter with non-zero allocation
    const newReceivings: ReceivingConfirmation[] = [];
    const facilityKeys: { id: FacilityId; qty: number }[] = [
      { id: 'kamalapur', qty: dist.allocations.kamalapur },
      { id: 'kadamtali', qty: dist.allocations.kadamtali },
      { id: 'peace_home', qty: dist.allocations.peaceHome },
    ];

    facilityKeys.forEach(({ id: facId, qty }) => {
      if (qty > 0) {
        const rcvId = `rcv_${Date.now()}_${facId}`;
        newReceivings.push({
          id: rcvId,
          receivingNo: `RCV-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
          distributionId: id,
          distributionNo,
          facilityId: facId,
          receivingDate: new Date().toISOString().substring(0, 10),
          receivingTime: new Date().toTimeString().substring(0, 5),
          productId: dist.productId,
          productName: dist.productName,
          unit: dist.unit,
          dispatchedQty: qty,
          actualReceivedQty: 0,
          shortageQty: 0,
          damagedQty: 0,
          rejectedQty: 0,
          condition: 'good',
          status: 'awaiting_receipt',
          receivingEid: '',
          receivingName: '',
          inChargeReviewed: false,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        });
      }
    });

    setReceivings((prev) => [...newReceivings, ...prev]);
    addAuditLog('DISPATCH_DISTRIBUTION', 'Distribution', distributionNo, 'central', `Dispatched ${dist.totalQuantity} ${dist.unit} of ${dist.productName} to shelters via ${dist.deliveryPerson}`);

    return id;
  };

  // Mandatory Receiving Confirmation Workflow
  const confirmReceiving = async (
    id: string,
    actualQty: number,
    damagedQty: number,
    condition: ReceivingConfirmation['condition'],
    remarks: string
  ) => {
    const existing = receivings.find((r) => r.id === id);
    if (!existing) throw new Error('Receiving confirmation record not found');

    const shortage = Math.max(0, existing.dispatchedQty - actualQty);
    let status: ReceivingConfirmation['status'] = 'received_full';

    if (shortage > 0 && actualQty > 0) {
      status = 'shortage_reported';
    } else if (actualQty === 0) {
      status = 'disputed';
    } else if (damagedQty > 0) {
      status = 'damage_reported';
    }

    let discrepancyId: string | undefined = undefined;

    // Discrepancy Alert triggered automatically if quantities differ
    if (shortage > 0 || damagedQty > 0) {
      discrepancyId = `exc_${Date.now()}`;
      const exc: ManagementException = {
        id: discrepancyId,
        facilityId: existing.facilityId,
        type: shortage > 0 ? 'dispatch_discrepancy' : 'stock_mismatch',
        title: `Receiving Discrepancy at ${existing.facilityId}: ${existing.productName}`,
        description: `Dispatched: ${existing.dispatchedQty} ${existing.unit}, Actually Received: ${actualQty} ${existing.unit}. Shortage: ${shortage} ${existing.unit}, Damaged: ${damagedQty} ${existing.unit}. Remarks: ${remarks}`,
        severity: shortage > 5 ? 'high' : 'medium',
        date: new Date().toISOString().substring(0, 10),
        status: 'open',
        responsibleDepartment: 'Logistics & Shelter Operations',
        relatedRecordId: existing.distributionId,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setExceptions((prev) => [exc, ...prev]);

      setNotifications((prev) => [
        {
          id: `notif_${Date.now()}`,
          title: 'Shortage Discrepancy Reported',
          message: `${existing.facilityId} reported ${shortage} ${existing.unit} shortage on ${existing.productName}.`,
          type: 'warning',
          module: 'Receiving Confirmation',
          facilityId: existing.facilityId,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          read: false,
        },
        ...prev,
      ]);
    }

    const updatedReceiving: ReceivingConfirmation = {
      ...existing,
      actualReceivedQty: actualQty,
      shortageQty: shortage,
      damagedQty,
      condition,
      status,
      remarks,
      receivingEid: currentUser?.eid || '1023',
      receivingName: currentUser?.name || 'Field In-charge',
      inChargeReviewed: true,
      discrepancyAlertId: discrepancyId,
    };

    setReceivings((prev) => prev.map((r) => (r.id === id ? updatedReceiving : r)));

    // INCREMENT Facility Inventory ONLY with confirmed actual quantity
    setFacilityInventory((prev) => {
      const updated = [...prev];
      const matchIdx = updated.findIndex((i) => i.facilityId === existing.facilityId && i.productId === existing.productId);
      if (matchIdx >= 0) {
        updated[matchIdx] = {
          ...updated[matchIdx],
          quantity: updated[matchIdx].quantity + actualQty,
          lastUpdated: new Date().toISOString().substring(0, 10),
        };
      } else {
        const prod = products.find((p) => p.id === existing.productId);
        updated.push({
          id: `fac_${existing.facilityId}_${existing.productId}`,
          productId: existing.productId,
          facilityId: existing.facilityId,
          productName: existing.productName,
          category: prod?.category || 'Rice and Staples',
          unit: existing.unit,
          quantity: actualQty,
          lastUpdated: new Date().toISOString().substring(0, 10),
          minStockLevel: prod?.minStockLevel ? Math.round(prod.minStockLevel * 0.4) : 20,
          avgUnitPrice: prod?.avgUnitPrice || 50,
        });
      }
      return updated;
    });

    addAuditLog('CONFIRM_RECEIVING', 'Receiving Confirmation', existing.receivingNo, existing.facilityId, `Confirmed receipt of ${actualQty} ${existing.unit} (Dispatched: ${existing.dispatchedQty}). Condition: ${condition}`);
  };

  // Daily Consumption Workflow
  const recordDailyConsumption = async (
    data: Omit<DailyConsumption, 'id' | 'createdAt' | 'totalFoodCost' | 'costPerChild' | 'costPerMeal'>
  ): Promise<string> => {
    // Calculate total food expenditure (ONLY isFood === true items)
    let totalFoodCost = 0;
    data.items.forEach((item) => {
      if (item.isFood) {
        totalFoodCost += item.consumedQty * item.unitCost;
      }
    });

    const costPerChild = data.presentChildren > 0 ? Math.round((totalFoodCost / data.presentChildren) * 100) / 100 : 0;
    const totalMeals = data.breakfastServings + data.lunchServings + data.eveningSnackServings + data.dinnerServings;
    const costPerMeal = totalMeals > 0 ? Math.round((totalFoodCost / totalMeals) * 100) / 100 : 0;

    const id = `cons_${Date.now()}`;
    const newConsumption: DailyConsumption = {
      ...data,
      id,
      totalFoodCost,
      costPerChild,
      costPerMeal,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setDailyConsumptions((prev) => [newConsumption, ...prev]);

    // Update Facility Inventory: deduct (consumedQty + wastageQty)
    setFacilityInventory((prev) => {
      const updated = [...prev];
      data.items.forEach((item) => {
        const idx = updated.findIndex((i) => i.facilityId === data.facilityId && i.productId === item.productId);
        if (idx >= 0) {
          const newQty = Math.max(0, updated[idx].quantity - (item.consumedQty + item.wastageQty));
          updated[idx] = {
            ...updated[idx],
            quantity: Math.round(newQty * 10) / 10,
            lastUpdated: data.date,
          };
        }
      });
      return updated;
    });

    // Anomaly Check: Abnormal Cost per Child
    if (costPerChild > 120 || (costPerChild < 40 && costPerChild > 0)) {
      const exc: ManagementException = {
        id: `exc_${Date.now()}`,
        facilityId: data.facilityId,
        type: 'high_food_cost',
        title: `Abnormal Daily Food Cost Per Child: BDT ${costPerChild}`,
        description: `${data.facilityId} recorded ${costPerChild} BDT per child on ${data.date}. Total food spend: BDT ${totalFoodCost} for ${data.presentChildren} children. Target band: 60-95 BDT.`,
        severity: costPerChild > 140 ? 'high' : 'medium',
        date: data.date,
        status: 'open',
        responsibleDepartment: 'Child Nutrition & Kitchen',
        relatedRecordId: id,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setExceptions((prev) => [exc, ...prev]);
    }

    addAuditLog('RECORD_CONSUMPTION', 'Daily Consumption', id, data.facilityId, `Recorded daily consumption for ${data.presentChildren} children. Food Cost: ${totalFoodCost} BDT (${costPerChild} BDT/child).`);
    return id;
  };

  // Wastage Tracking
  const recordWastage = async (wastage: Omit<WastageRecord, 'id' | 'createdAt'>): Promise<string> => {
    const id = `wst_${Date.now()}`;
    const newRecord: WastageRecord = {
      ...wastage,
      id,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setWastageRecords((prev) => [newRecord, ...prev]);

    // Check if abnormal wastage
    if (wastage.estimatedCost > 1500) {
      const exc: ManagementException = {
        id: `exc_${Date.now()}`,
        facilityId: wastage.facilityId,
        type: 'abnormal_wastage',
        title: `High Wastage Reported: ${wastage.productName} (${wastage.quantity} ${wastage.unit})`,
        description: `Wastage value of BDT ${wastage.estimatedCost} reported at ${wastage.facilityId}. Reason: ${wastage.reason} - ${wastage.reasonDetails}`,
        severity: 'medium',
        date: wastage.date,
        status: 'open',
        responsibleDepartment: 'Inventory & Kitchen',
        relatedRecordId: id,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setExceptions((prev) => [exc, ...prev]);
    }

    addAuditLog('RECORD_WASTAGE', 'Wastage', id, wastage.facilityId, `Logged wastage of ${wastage.quantity} ${wastage.unit} ${wastage.productName}. Cost: ${wastage.estimatedCost} BDT.`);
    return id;
  };

  // Market Price Tracking & Anomaly Detection
  const recordMarketPrice = async (price: Omit<MarketPriceEntry, 'id' | 'createdAt'>): Promise<string> => {
    const previousEntries = marketPrices.filter((p) => p.productId === price.productId);
    let prevPrice = price.unitPrice;
    let changePct = 0;
    let isUnusual = false;

    if (previousEntries.length > 0) {
      const latest = previousEntries[0];
      prevPrice = latest.unitPrice;
      changePct = Math.round(((price.unitPrice - prevPrice) / prevPrice) * 1000) / 10;
      if (Math.abs(changePct) >= 15) {
        isUnusual = true;
      }
    }

    const id = `mp_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newPrice: MarketPriceEntry = {
      ...price,
      id,
      previousPrice: prevPrice,
      priceChangePct: changePct,
      isUnusual,
      createdAt: new Date().toISOString().substring(0, 10),
    };

    setMarketPrices((prev) => [newPrice, ...prev]);

    if (isUnusual) {
      const exc: ManagementException = {
        id: `exc_${Date.now()}`,
        facilityId: 'all',
        type: 'unusual_price',
        title: `Unusual Market Price Spike: ${price.productName} (${changePct > 0 ? '+' : ''}${changePct}%)`,
        description: `Price changed from ${prevPrice} BDT to ${price.unitPrice} BDT per ${price.unit} at ${price.market}. Alert flagged for procurement review.`,
        severity: Math.abs(changePct) > 25 ? 'high' : 'medium',
        date: price.date,
        status: 'open',
        responsibleDepartment: 'Procurement',
        relatedRecordId: id,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setExceptions((prev) => [exc, ...prev]);
    }

    return id;
  };

  const resolveException = async (id: string, resolutionNote: string) => {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'resolved',
              resolutionNote,
              resolvedByEid: currentUser?.eid,
              resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            }
          : e
      )
    );
    addAuditLog('RESOLVE_EXCEPTION', 'Exception Monitoring', id, 'all', `Resolved exception with note: ${resolutionNote}`);
  };

  // Monthly Financial & Inventory Closing
  const performMonthlyClosing = async (yearMonth: string, facilityId: FacilityId | 'all', notes: string) => {
    const id = `mc_${yearMonth}_${facilityId}`;
    const newClosing: MonthlyClosingRecord = {
      id,
      yearMonth,
      facilityId,
      isClosed: true,
      closedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      closedByEid: currentUser?.eid || '1004',
      checklist: {
        purchasesCompleted: true,
        billsUploaded: true,
        distributionsCompleted: true,
        receivingConfirmed: true,
        consumptionEntered: true,
        stockReconciled: true,
        wastageRecorded: true,
        accountsVerified: true,
        reportsSubmitted: true,
      },
      notes,
    };

    setMonthlyClosings((prev) => [newClosing, ...prev.filter((c) => c.id !== id)]);
    addAuditLog('MONTHLY_CLOSING', 'Monthly Closing', id, facilityId, `Finalized and locked monthly closing for ${yearMonth}. Notes: ${notes}`);
  };

  const reopenMonthlyClosing = async (id: string, reason: string) => {
    setMonthlyClosings((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isClosed: false,
              reopenedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              reopenedByEid: currentUser?.eid,
              reopenReason: reason,
            }
          : c
      )
    );
    addAuditLog('REOPEN_MONTHLY_CLOSING', 'Monthly Closing', id, 'all', `Reopened monthly closing. Reason: ${reason}`);
  };

  const recordDonorContribution = async (
    data: Omit<DonorContribution, 'id' | 'entryNo' | 'createdAt'>
  ): Promise<string> => {
    const id = `don_${Date.now()}`;
    const prefix = data.sourceType === 'emergency_local_purchase' ? 'LOC' : 'DON';
    const entryNo = `${prefix}-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newEntry: DonorContribution = {
      ...data,
      id,
      entryNo,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setDonorContributions((prev) => [newEntry, ...prev]);

    // INCREMENT shelter facility inventory immediately
    setFacilityInventory((prev) => {
      const updated = [...prev];
      data.items.forEach((item) => {
        const matchIdx = updated.findIndex(
          (i) => i.facilityId === data.facilityId && i.productId === item.productId
        );
        if (matchIdx >= 0) {
          updated[matchIdx] = {
            ...updated[matchIdx],
            quantity: updated[matchIdx].quantity + item.quantity,
            lastUpdated: data.date,
          };
        } else {
          updated.push({
            id: `fac_${data.facilityId}_${item.productId}`,
            productId: item.productId,
            facilityId: data.facilityId,
            productName: item.productName,
            category: item.category,
            unit: item.unit,
            quantity: item.quantity,
            lastUpdated: data.date,
            minStockLevel: 20,
            avgUnitPrice: item.estimatedUnitPrice,
          });
        }
      });
      return updated;
    });

    addAuditLog(
      'RECORD_DONOR_FOOD',
      'Donor Contributions',
      entryNo,
      data.facilityId,
      `Recorded ${data.sourceType === 'emergency_local_purchase' ? 'Emergency Local Purchase' : 'Donor In-Kind Gift'} from ${data.donorName || 'Local Vendor'}. Items: ${data.items.length}, Est Value: ${data.totalEstimatedValue} BDT`
    );

    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: data.sourceType === 'emergency_local_purchase' ? 'Local Purchase Entry' : 'Donor Food Gift Received',
        message: `${data.facilityId} logged ${data.items.length} items (${data.totalEstimatedValue} BDT) from ${data.donorName || 'Local Vendor'}.`,
        type: 'info',
        module: 'Donor Contributions',
        facilityId: data.facilityId,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        read: false,
      },
      ...prev,
    ]);

    return id;
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const id = `p_${Date.now()}`;
    const newProd: Product = { ...product, id };
    setProducts((prev) => [...prev, newProd]);
    addAuditLog('ADD_PRODUCT', 'Master Catalog', id, 'central', `Added new product ${product.name} (${product.category})`);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <DataContext.Provider
      value={{
        products,
        centralInventory,
        facilityInventory,
        purchases,
        requisitions,
        distributions,
        receivings,
        dailyConsumptions,
        wastageRecords,
        marketPrices,
        budgets,
        exceptions,
        auditLogs,
        notifications,
        monthlyClosings,
        donorContributions,
        recordDonorContribution,
        submitRequisition,
        updateRequisitionStatus,
        recordPurchase,
        verifyPurchaseInvoice,
        dispatchDistribution,
        confirmReceiving,
        recordDailyConsumption,
        recordWastage,
        recordMarketPrice,
        resolveException,
        performMonthlyClosing,
        reopenMonthlyClosing,
        addProduct,
        addAuditLog,
        markNotificationAsRead,
        getFacilityStock,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

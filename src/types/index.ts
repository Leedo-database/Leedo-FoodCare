/**
 * LEEDO FOODCARE - Types & Interfaces
 * Centralized Grocery & Food Management System for LEEDO Bangladesh
 */

export type UserRole =
  | 'founder'             // Forhad Hossain (1001) - Full organizational oversight
  | 'director'            // Murshida Akhter Kanta (1002) - Procurement & financial supervision
  | 'super_admin'         // Md. Omar Faruque (1057) - Super Admin & HR
  | 'hr'                  // HR Officer / HR Admin - Employee & role management
  | 'accountant'          // Md Habibur Rahman (1004) - Independent financial verification
  | 'assistant_accountant'// Sazzad Hosen (1079) - Accounts & procurement documentation
  | 'logistics'           // Rone Ahammed (1009) - Central purchasing, vendor & stock
  | 'program_manager'     // Md. Sohel Rana (1013) - Program & Operations monitoring
  | 'incharge'            // Field In-charge (e.g. 1023 Md. Masud, 1028 Saidur Rahman Sajan)
  | 'field_staff';        // Cook, Shelter Mother, Supervisor, etc.

export type FacilityId = 'central' | 'kamalapur' | 'kadamtali' | 'peace_home';

export interface Facility {
  id: FacilityId;
  name: string;
  nameBn: string;
  type: 'head_office' | 'shelter';
  location: string;
  capacity: number;
  inChargeEid: string;
  inChargeName: string;
  phone: string;
}

export interface Employee {
  eid: string;
  name: string;
  designation: string;
  department: string;
  facilityId: FacilityId;
  role: UserRole;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  passwordChanged: boolean;
  requiresPasswordReset?: boolean;
  passwordHash?: string;
  joinedDate: string;
  supervisorEid?: string;
}

export type ProductCategory =
  | 'Rice and Staples'
  | 'Pulses'
  | 'Vegetables'
  | 'Protein'
  | 'Dairy'
  | 'Fruits'
  | 'Cooking Ingredients'
  | 'Breakfast and Snacks'
  | 'Beverage'
  | 'Kitchen Fuel'
  | 'Kitchen Supplies'
  | 'Cleaning'
  | 'Child Personal Care'
  | 'Special Nutrition';

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  category: ProductCategory;
  unit: string; // kg, liter, piece, cylinder, packet, jar, dozen
  isFood: boolean; // Vital for Food Cost per Child calculation
  minStockLevel: number;
  avgUnitPrice: number;
  currentCentralStock?: number;
}

export interface RequisitionItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  unit: string;
  currentStock: number;
  requiredQty: number;
  approvedQty?: number;
  unitPriceEst: number;
  dailyConsumption: number;
  stockCoverageDays: number;
  reason: string;
}

export interface Requisition {
  id: string;
  reqNo: string;
  facilityId: FacilityId;
  requestDate: string;
  requiredDate: string;
  status: 'submitted' | 'incharge_approved' | 'approved' | 'rejected' | 'procured';
  priority: 'normal' | 'urgent' | 'emergency';
  requestingEid: string;
  requestingName: string;
  inChargeEid: string;
  approvedByEid?: string;
  remarks: string;
  items: RequisitionItem[];
  rejectionReason?: string;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Purchase {
  id: string;
  purchaseNo: string;
  purchaseDate: string;
  vendor: string;
  market: string;
  invoiceNo: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  transportCost: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  verificationStatus: 'pending' | 'verified' | 'returned' | 'disputed' | 'approved';
  procurementOfficerEid: string;
  procurementOfficerName: string;
  approvalRef?: string;
  receiptUrl?: string;
  receiptName?: string;
  remarks?: string;
  createdAt: string;
  verifiedByEid?: string;
  verifiedAt?: string;
  verificationNotes?: string;
}

export interface DistributionAllocation {
  kamalapur: number;
  kadamtali: number;
  peaceHome: number;
}

export interface Distribution {
  id: string;
  distributionNo: string;
  dispatchDate: string;
  purchaseId?: string;
  requisitionId?: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  unit: string;
  totalQuantity: number;
  allocations: DistributionAllocation;
  deliveryPerson: string;
  dispatchedByEid: string;
  status: 'dispatched' | 'received_full' | 'received_partial' | 'disputed';
  remarks?: string;
  createdAt: string;
}

export interface ReceivingConfirmation {
  id: string;
  receivingNo: string;
  distributionId: string;
  distributionNo: string;
  facilityId: FacilityId;
  receivingDate: string;
  receivingTime: string;
  productId: string;
  productName: string;
  unit: string;
  dispatchedQty: number;
  actualReceivedQty: number;
  shortageQty: number;
  damagedQty: number;
  rejectedQty: number;
  condition: 'good' | 'damaged' | 'acceptable' | 'rejected';
  status:
    | 'awaiting_receipt'
    | 'received_full'
    | 'partially_received'
    | 'shortage_reported'
    | 'damage_reported'
    | 'disputed'
    | 'confirmed';
  receivingEid: string;
  receivingName: string;
  inChargeReviewed: boolean;
  remarks?: string;
  discrepancyAlertId?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  facilityId: FacilityId;
  productName: string;
  category: ProductCategory;
  unit: string;
  quantity: number;
  lastUpdated: string;
  minStockLevel: number;
  avgUnitPrice: number;
}

export interface DailyConsumptionItem {
  productId: string;
  productName: string;
  unit: string;
  isFood: boolean;
  openingStock: number;
  receivedQty: number;
  consumedQty: number;
  wastageQty: number;
  closingStock: number;
  unitCost: number;
  totalCost: number;
  wastageReason?: string;
}

export interface DailyConsumption {
  id: string;
  facilityId: FacilityId;
  date: string; // YYYY-MM-DD
  residentChildren: number;
  presentChildren: number;
  absentChildren: number;
  breakfastServings: number;
  lunchServings: number;
  eveningSnackServings: number;
  dinnerServings: number;
  specialMealServings: number;
  items: DailyConsumptionItem[];
  totalFoodCost: number;
  costPerChild: number;
  costPerMeal: number;
  enteredByEid: string;
  enteredByName: string;
  reviewedByEid?: string;
  remarks?: string;
  createdAt: string;
}

export interface MealAttendance {
  id: string;
  facilityId: FacilityId;
  date: string;
  residentCount: number;
  presentCount: number;
  absentCount: number;
  childDays: number;
  breakfastCount: number;
  lunchCount: number;
  snackCount: number;
  dinnerCount: number;
  missedMealsCount: number;
  specialDietNote?: string;
  recordedByEid: string;
  createdAt: string;
}

export interface WastageRecord {
  id: string;
  date: string;
  facilityId: FacilityId;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  reason: 'spoilage' | 'pest_damage' | 'expired' | 'transit_damage' | 'cooking_wastage' | 'other';
  reasonDetails: string;
  reportedByEid: string;
  reviewedByEid?: string;
  createdAt: string;
}

export interface MarketPriceEntry {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  market: string; // Karwan Bazar, Jatrabari, Kamalapur Local, etc.
  vendor: string;
  date: string;
  unit: string;
  unitPrice: number;
  previousPrice?: number;
  priceChangePct?: number;
  recordedByEid: string;
  isUnusual?: boolean;
  createdAt: string;
}

export interface FacilityBudget {
  id: string;
  fiscalYear: string;
  month: string; // '2026-11'
  facilityId: FacilityId;
  category: ProductCategory;
  approvedAmount: number;
  utilizedAmount: number;
  variance: number;
  utilizationPct: number;
  updatedAt: string;
}

export interface ManagementException {
  id: string;
  facilityId: FacilityId | 'all';
  type:
    | 'excessive_purchase'
    | 'unusual_price'
    | 'duplicate_invoice'
    | 'missing_receipt'
    | 'missing_consumption'
    | 'missing_receiving'
    | 'dispatch_discrepancy'
    | 'stock_mismatch'
    | 'abnormal_wastage'
    | 'high_food_cost'
    | 'budget_exceeded'
    | 'late_reporting'
    | 'unauthorized_purchase';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  status: 'open' | 'investigating' | 'resolved';
  responsibleDepartment: string;
  relatedRecordId?: string;
  managementComments?: string;
  resolutionNote?: string;
  resolvedByEid?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface MonthlyClosingRecord {
  id: string;
  yearMonth: string; // '2026-10'
  facilityId: FacilityId | 'all';
  isClosed: boolean;
  closedAt?: string;
  closedByEid?: string;
  checklist: {
    purchasesCompleted: boolean;
    billsUploaded: boolean;
    distributionsCompleted: boolean;
    receivingConfirmed: boolean;
    consumptionEntered: boolean;
    stockReconciled: boolean;
    wastageRecorded: boolean;
    accountsVerified: boolean;
    reportsSubmitted: boolean;
  };
  notes?: string;
  reopenedAt?: string;
  reopenedByEid?: string;
  reopenReason?: string;
}

export interface AuditLog {
  id: string;
  eid: string;
  userName: string;
  action: string;
  module: string;
  recordId?: string;
  facilityId?: FacilityId | 'all';
  details: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  module: string;
  link?: string;
  facilityId?: FacilityId | 'all';
  createdAt: string;
  read: boolean;
}

export interface DonorItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  unit: string;
  quantity: number;
  estimatedUnitPrice: number;
  totalEstimatedValue: number;
}

export interface DonorContribution {
  id: string;
  entryNo: string;
  facilityId: FacilityId;
  date: string;
  sourceType: 'donor_inkind' | 'emergency_local_purchase' | 'community_gift';
  donorName: string;
  donorPhone?: string;
  donorOrganization?: string;
  purpose: string; // e.g. "Special Friday Feast", "Child Snack Nutrition", "Emergency Rice Supply"
  items: DonorItem[];
  totalEstimatedValue: number;
  receiptNumber?: string;
  receiptAttachmentUrl?: string;
  receivedByEid: string;
  receivedByName: string;
  remarks?: string;
  createdAt: string;
}


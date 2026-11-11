import {
  Facility,
  Employee,
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
} from '../types';

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 'central',
    name: 'Head Office Central Warehouse',
    nameBn: 'প্রধান কার্যালয় কেন্দ্রীয় গুদাম',
    type: 'head_office',
    location: 'Bosila, Mohammadpur, Dhaka-1207',
    capacity: 0,
    inChargeEid: '1009',
    inChargeName: 'Rone Ahammed',
    phone: '+8801711000001',
  },
  {
    id: 'kamalapur',
    name: 'Kamalapur TSSB',
    nameBn: 'কমলাপুর টিএসএসবি',
    type: 'shelter',
    location: 'Kamalapur Railway Station Area, Motijheel, Dhaka',
    capacity: 45,
    inChargeEid: '1023',
    inChargeName: 'Md. Masud',
    phone: '+8801711000023',
  },
  {
    id: 'kadamtali',
    name: 'Kadamtali TSSB',
    nameBn: 'কদমতলী টিএসএসবি',
    type: 'shelter',
    location: 'Kadamtali, Shyampur, Dhaka',
    capacity: 40,
    inChargeEid: '1028',
    inChargeName: 'Saidur Rahman Sajan',
    phone: '+8801711000028',
  },
  {
    id: 'peace_home',
    name: 'LEEDO Peace Home',
    nameBn: 'লিডো পিস হোম',
    type: 'shelter',
    location: 'Washpur, Keraniganj Model Town, Dhaka',
    capacity: 85,
    inChargeEid: '',
    inChargeName: 'Unassigned',
    phone: '+8801711000001',
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    eid: '1001',
    name: 'Forhad Hossain',
    designation: 'Founder & Executive Director',
    department: 'Executive Office',
    facilityId: 'central',
    role: 'founder',
    phone: '+8801711001001',
    email: 'forhad@leedo.org',
    status: 'active',
    passwordChanged: false,
    joinedDate: '2015-01-01',
  },
  {
    eid: '1002',
    name: 'Murshida Akhter Kanta',
    designation: 'Director Admin & Finance',
    department: 'Finance & Administration',
    facilityId: 'central',
    role: 'director',
    phone: '+8801711001002',
    email: 'kanta@leedo.org',
    status: 'active',
    passwordChanged: false,
    joinedDate: '2016-03-01',
    supervisorEid: '1001',
  },
  {
    eid: '1057',
    name: 'Md. Omar Faruque',
    designation: 'Manager HR & Admin',
    department: 'Human Resources',
    facilityId: 'central',
    role: 'super_admin',
    phone: '+8801711001057',
    email: 'hr.leedo2000@gmail.com',
    status: 'active',
    passwordChanged: false,
    joinedDate: '2017-06-15',
    supervisorEid: '1002',
  },
  {
    eid: '1004',
    name: 'Md Habibur Rahman',
    designation: 'Accountant',
    department: 'Accounts & Finance',
    facilityId: 'central',
    role: 'accountant',
    phone: '+8801711001004',
    email: 'habibur@leedo.org',
    status: 'active',
    passwordChanged: false,
    joinedDate: '2018-02-01',
    supervisorEid: '1002',
  },
  {
    eid: '1079',
    name: 'Sazzad Hosen',
    designation: 'Assistant Accountant',
    department: 'Accounts & Finance',
    facilityId: 'central',
    role: 'assistant_accountant',
    phone: '+8801711001079',
    email: 'sazzad@leedo.org',
    status: 'active',
    passwordChanged: false,
    joinedDate: '2021-08-10',
    supervisorEid: '1004',
  },
  {
    eid: '1009',
    name: 'Rone Ahammed',
    designation: 'Logistics Officer',
    department: 'Procurement & Logistics',
    facilityId: 'central',
    role: 'logistics',
    phone: '+8801711001009',
    email: 'rone@leedo.org',
    status: 'active',
    passwordChanged: false,
    joinedDate: '2019-04-12',
    supervisorEid: '1002',
  },
  {
    eid: '1013',
    name: 'Md. Sohel Rana',
    designation: 'Manager Program & Operation',
    department: 'Programs',
    facilityId: 'central',
    role: 'program_manager',
    phone: '+8801711001013',
    email: 'sohel@leedo.org',
    status: 'active',
    passwordChanged: false,
    joinedDate: '2018-11-01',
    supervisorEid: '1001',
  },
  {
    eid: '1023',
    name: 'Md. Masud',
    designation: 'Social Mobilizer In-charge',
    department: 'Shelter Operations',
    facilityId: 'kamalapur',
    role: 'incharge',
    phone: '+8801711001023',
    email: 'masud.kamalapur@leedo.org',
    status: 'active',
    passwordChanged: false,
    joinedDate: '2020-01-15',
    supervisorEid: '1013',
  },
  {
    eid: '1028',
    name: 'Saidur Rahman Sajan',
    designation: 'Social Mobilizer In-charge',
    department: 'Shelter Operations',
    facilityId: 'kadamtali',
    role: 'incharge',
    phone: '+8801711001028',
    email: 'sajan.kadamtali@leedo.org',
    status: 'active',
    passwordChanged: false,
    joinedDate: '2020-09-01',
    supervisorEid: '1013',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  // Rice & Staples
  { id: 'p_rice_miniket', name: 'Miniket Rice', nameBn: 'মিনিকেট চাল', category: 'Rice and Staples', unit: 'kg', isFood: true, minStockLevel: 250, avgUnitPrice: 72 },
  { id: 'p_rice_nazir', name: 'Nazirshail Rice', nameBn: 'নাজিরশাইল চাল', category: 'Rice and Staples', unit: 'kg', isFood: true, minStockLevel: 200, avgUnitPrice: 78 },
  { id: 'p_atta', name: 'Wheat Atta (Flour)', nameBn: 'গম আটা', category: 'Rice and Staples', unit: 'kg', isFood: true, minStockLevel: 100, avgUnitPrice: 55 },
  { id: 'p_maida', name: 'Maida', nameBn: 'ময়দা', category: 'Rice and Staples', unit: 'kg', isFood: true, minStockLevel: 50, avgUnitPrice: 62 },
  { id: 'p_suji', name: 'Semolina (Suji)', nameBn: 'সুজি', category: 'Rice and Staples', unit: 'kg', isFood: true, minStockLevel: 30, avgUnitPrice: 80 },
  { id: 'p_chira', name: 'Flattened Rice (Chira)', nameBn: 'চিড়া', category: 'Rice and Staples', unit: 'kg', isFood: true, minStockLevel: 40, avgUnitPrice: 65 },
  { id: 'p_muri', name: 'Puffed Rice (Muri)', nameBn: 'মুড়ি', category: 'Rice and Staples', unit: 'kg', isFood: true, minStockLevel: 40, avgUnitPrice: 70 },
  { id: 'p_noodles', name: 'Egg Noodles', nameBn: 'এগ নুডলস', category: 'Rice and Staples', unit: 'packet', isFood: true, minStockLevel: 80, avgUnitPrice: 25 },
  { id: 'p_bread', name: 'Sliced Bread (Family)', nameBn: 'পাউরুটি', category: 'Rice and Staples', unit: 'piece', isFood: true, minStockLevel: 20, avgUnitPrice: 60 },

  // Pulses
  { id: 'p_dal_masoor', name: 'Masoor Dal (Desi)', nameBn: 'মসুর ডাল (দেশি)', category: 'Pulses', unit: 'kg', isFood: true, minStockLevel: 80, avgUnitPrice: 140 },
  { id: 'p_dal_moong', name: 'Moong Dal', nameBn: 'মুগ ডাল', category: 'Pulses', unit: 'kg', isFood: true, minStockLevel: 40, avgUnitPrice: 160 },
  { id: 'p_chola', name: 'Chickpeas (Chola Boot)', nameBn: 'ছোলা বুট', category: 'Pulses', unit: 'kg', isFood: true, minStockLevel: 50, avgUnitPrice: 110 },

  // Vegetables
  { id: 'p_potato', name: 'Potato (Gol Alu)', nameBn: 'গোল আলু', category: 'Vegetables', unit: 'kg', isFood: true, minStockLevel: 150, avgUnitPrice: 38 },
  { id: 'p_onion', name: 'Onion (Desi Piaj)', nameBn: 'পেঁয়াজ', category: 'Vegetables', unit: 'kg', isFood: true, minStockLevel: 100, avgUnitPrice: 85 },
  { id: 'p_garlic', name: 'Garlic (Roshun)', nameBn: 'রসুন', category: 'Vegetables', unit: 'kg', isFood: true, minStockLevel: 30, avgUnitPrice: 210 },
  { id: 'p_ginger', name: 'Ginger (Ada)', nameBn: 'আদা', category: 'Vegetables', unit: 'kg', isFood: true, minStockLevel: 25, avgUnitPrice: 230 },
  { id: 'p_chili', name: 'Green Chili', nameBn: 'কাঁচা মরিচ', category: 'Vegetables', unit: 'kg', isFood: true, minStockLevel: 15, avgUnitPrice: 160 },
  { id: 'p_tomato', name: 'Fresh Tomato', nameBn: 'টমেটো', category: 'Vegetables', unit: 'kg', isFood: true, minStockLevel: 40, avgUnitPrice: 65 },
  { id: 'p_carrot', name: 'Carrot (Gajor)', nameBn: 'গাজর', category: 'Vegetables', unit: 'kg', isFood: true, minStockLevel: 30, avgUnitPrice: 55 },
  { id: 'p_cabbage', name: 'Cabbage (Bandhakopi)', nameBn: 'বাঁধাকপি', category: 'Vegetables', unit: 'kg', isFood: true, minStockLevel: 35, avgUnitPrice: 30 },
  { id: 'p_brinjal', name: 'Brinjal (Begun)', nameBn: 'বেগুন', category: 'Vegetables', unit: 'kg', isFood: true, minStockLevel: 30, avgUnitPrice: 50 },
  { id: 'p_pumpkin', name: 'Sweet Pumpkin (Misti Kumra)', nameBn: 'মিষ্টি কুমড়া', category: 'Vegetables', unit: 'kg', isFood: true, minStockLevel: 40, avgUnitPrice: 35 },
  { id: 'p_leafy_veg', name: 'Leafy Spinach (Shak)', nameBn: 'লাল/পালং শাক', category: 'Vegetables', unit: 'kg', isFood: true, minStockLevel: 20, avgUnitPrice: 30 },

  // Protein
  { id: 'p_chicken_broiler', name: 'Broiler Chicken', nameBn: 'ব্রয়লার মুরগি', category: 'Protein', unit: 'kg', isFood: true, minStockLevel: 60, avgUnitPrice: 190 },
  { id: 'p_chicken_sonali', name: 'Sonali Chicken', nameBn: 'সোনালি মুরগি', category: 'Protein', unit: 'kg', isFood: true, minStockLevel: 40, avgUnitPrice: 310 },
  { id: 'p_egg_farm', name: 'Farm Brown Eggs', nameBn: 'ফার্মের ডিম', category: 'Protein', unit: 'dozen', isFood: true, minStockLevel: 50, avgUnitPrice: 145 },
  { id: 'p_fish_rui', name: 'Rui Fish', nameBn: 'রুই মাছ', category: 'Protein', unit: 'kg', isFood: true, minStockLevel: 40, avgUnitPrice: 360 },
  { id: 'p_fish_pangash', name: 'Pangas Fish', nameBn: 'পাঙ্গাশ মাছ', category: 'Protein', unit: 'kg', isFood: true, minStockLevel: 40, avgUnitPrice: 190 },
  { id: 'p_beef', name: 'Fresh Beef (Gorur Mangsho)', nameBn: 'গরুর মাংস', category: 'Protein', unit: 'kg', isFood: true, minStockLevel: 25, avgUnitPrice: 750 },

  // Dairy
  { id: 'p_milk_liquid', name: 'Pasteurized Liquid Milk', nameBn: 'তরল দুধ', category: 'Dairy', unit: 'liter', isFood: true, minStockLevel: 50, avgUnitPrice: 90 },
  { id: 'p_milk_powder', name: 'Full Cream Milk Powder', nameBn: 'গুঁড়া দুধ', category: 'Dairy', unit: 'kg', isFood: true, minStockLevel: 20, avgUnitPrice: 880 },

  // Fruits
  { id: 'p_banana', name: 'Banana (Shobri/Champa)', nameBn: 'কলা (সবরি/চাঁপা)', category: 'Fruits', unit: 'dozen', isFood: true, minStockLevel: 30, avgUnitPrice: 90 },
  { id: 'p_apple', name: 'Fresh Apple', nameBn: 'আপেল', category: 'Fruits', unit: 'kg', isFood: true, minStockLevel: 20, avgUnitPrice: 260 },
  { id: 'p_papaya', name: 'Papaya (Ripe Paka Pepe)', nameBn: 'পাকা পেঁপে', category: 'Fruits', unit: 'kg', isFood: true, minStockLevel: 25, avgUnitPrice: 80 },

  // Cooking Ingredients
  { id: 'p_oil_soybean', name: 'Soybean Oil (Bottled)', nameBn: 'সয়াবিন তেল', category: 'Cooking Ingredients', unit: 'liter', isFood: true, minStockLevel: 80, avgUnitPrice: 175 },
  { id: 'p_oil_mustard', name: 'Mustard Oil (Shorisha)', nameBn: 'সরিষার তেল', category: 'Cooking Ingredients', unit: 'liter', isFood: true, minStockLevel: 20, avgUnitPrice: 280 },
  { id: 'p_salt', name: 'Iodized Table Salt', nameBn: 'আয়োডিনযুক্ত লবণ', category: 'Cooking Ingredients', unit: 'kg', isFood: true, minStockLevel: 60, avgUnitPrice: 38 },
  { id: 'p_sugar', name: 'Refined White Sugar', nameBn: 'চিনি', category: 'Cooking Ingredients', unit: 'kg', isFood: true, minStockLevel: 50, avgUnitPrice: 135 },
  { id: 'p_turmeric', name: 'Turmeric Powder (Halud)', nameBn: 'হলুদ গুঁড়া', category: 'Cooking Ingredients', unit: 'kg', isFood: true, minStockLevel: 20, avgUnitPrice: 320 },
  { id: 'p_chili_powder', name: 'Red Chili Powder (Morich)', nameBn: 'মরিচ গুঁড়া', category: 'Cooking Ingredients', unit: 'kg', isFood: true, minStockLevel: 20, avgUnitPrice: 420 },
  { id: 'p_coriander', name: 'Coriander Powder (Dhonia)', nameBn: 'ধনিয়া গুঁড়া', category: 'Cooking Ingredients', unit: 'kg', isFood: true, minStockLevel: 15, avgUnitPrice: 260 },
  { id: 'p_cumin', name: 'Cumin Powder (Jira)', nameBn: 'জিরা গুঁড়া', category: 'Cooking Ingredients', unit: 'kg', isFood: true, minStockLevel: 15, avgUnitPrice: 950 },

  // Breakfast & Snacks
  { id: 'p_biscuits', name: 'Energy / Glucose Biscuits', nameBn: 'এনার্জি বিস্কুট', category: 'Breakfast and Snacks', unit: 'packet', isFood: true, minStockLevel: 100, avgUnitPrice: 45 },

  // Beverage
  { id: 'p_tea_leaves', name: 'Black Tea Leaves', nameBn: 'চা পাতা', category: 'Beverage', unit: 'kg', isFood: true, minStockLevel: 15, avgUnitPrice: 460 },
  { id: 'p_water_jar', name: 'Drinking Mineral Water Jar 20L', nameBn: 'খাবার পানির জার ২০ লিটার', category: 'Beverage', unit: 'jar', isFood: true, minStockLevel: 20, avgUnitPrice: 60 },

  // Kitchen Fuel (Non-Food)
  { id: 'p_fuel_lpg', name: 'LP Gas Cylinder 12Kg', nameBn: 'এলপিজি সিলিন্ডার ১২ কেজি', category: 'Kitchen Fuel', unit: 'cylinder', isFood: false, minStockLevel: 4, avgUnitPrice: 1450 },
  { id: 'p_matchbox', name: 'Safety Matchbox Bundle', nameBn: 'ম্যাচবাক্স বান্ডিল', category: 'Kitchen Fuel', unit: 'bundle', isFood: false, minStockLevel: 5, avgUnitPrice: 60 },

  // Kitchen Supplies (Non-Food)
  { id: 'p_dishwash', name: 'Dishwashing Liquid 1L', nameBn: 'ডিশওয়াশিং লিকুইড', category: 'Kitchen Supplies', unit: 'piece', isFood: false, minStockLevel: 10, avgUnitPrice: 140 },
  { id: 'p_scrubber', name: 'Steel Wire Scrubber', nameBn: 'স্ক্রাবার', category: 'Kitchen Supplies', unit: 'piece', isFood: false, minStockLevel: 20, avgUnitPrice: 25 },

  // Cleaning (Non-Food)
  { id: 'p_detergent', name: 'Laundry Detergent Powder', nameBn: 'ডিটারজেন্ট পাউডার', category: 'Cleaning', unit: 'kg', isFood: false, minStockLevel: 40, avgUnitPrice: 160 },
  { id: 'p_toilet_cleaner', name: 'Harpic Toilet Cleaner 750ml', nameBn: 'টয়লেট ক্লিনার', category: 'Cleaning', unit: 'piece', isFood: false, minStockLevel: 15, avgUnitPrice: 175 },
  { id: 'p_floor_cleaner', name: 'Phenyl / Floor Cleaner 5L', nameBn: 'ফ্লোর ক্লিনার', category: 'Cleaning', unit: 'piece', isFood: false, minStockLevel: 6, avgUnitPrice: 320 },

  // Child Personal Care (Non-Food)
  { id: 'p_bath_soap', name: 'Antiseptic Bathing Soap', nameBn: 'গোসলের সাবান', category: 'Child Personal Care', unit: 'piece', isFood: false, minStockLevel: 80, avgUnitPrice: 55 },
  { id: 'p_toothpaste', name: 'Fluoride Toothpaste 150g', nameBn: 'টুথপেস্ট', category: 'Child Personal Care', unit: 'piece', isFood: false, minStockLevel: 40, avgUnitPrice: 120 },
  { id: 'p_sanitary_pad', name: 'Sanitary Napkins (Belt/Wings)', nameBn: 'স্যানিটারি ন্যাপকিন', category: 'Child Personal Care', unit: 'packet', isFood: false, minStockLevel: 50, avgUnitPrice: 110 },

  // Special Nutrition
  { id: 'p_ors_saline', name: 'Oral Rehydration Salts (ORS)', nameBn: 'ওআরএস স্যালাইন', category: 'Special Nutrition', unit: 'packet', isFood: true, minStockLevel: 100, avgUnitPrice: 7 },
  { id: 'p_horlicks', name: 'Nutritional Malt Drink 500g', nameBn: 'হরলিক্স / মাল্ট ফুড', category: 'Special Nutrition', unit: 'jar', isFood: true, minStockLevel: 12, avgUnitPrice: 380 },
];

export const INITIAL_CENTRAL_INVENTORY: InventoryItem[] = INITIAL_PRODUCTS.map((p) => ({
  id: `cent_${p.id}`,
  productId: p.id,
  facilityId: 'central',
  productName: p.name,
  category: p.category,
  unit: p.unit,
  quantity: 0, // Clean live database - starts at zero until real purchases or stock inward
  lastUpdated: new Date().toISOString().substring(0, 10),
  minStockLevel: p.minStockLevel,
  avgUnitPrice: p.avgUnitPrice,
}));

export const INITIAL_PURCHASES: Purchase[] = [];
export const INITIAL_DISTRIBUTIONS: Distribution[] = [];
export const INITIAL_RECEIVINGS: ReceivingConfirmation[] = [];
export const INITIAL_REQUISITIONS: Requisition[] = [];
export const INITIAL_DAILY_CONSUMPTION: DailyConsumption[] = [];
export const INITIAL_MARKET_PRICES: MarketPriceEntry[] = [];
export const INITIAL_BUDGETS: FacilityBudget[] = [];
export const INITIAL_EXCEPTIONS: ManagementException[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_DONOR_CONTRIBUTIONS: any[] = [];


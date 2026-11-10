export interface ReportDefinition {
  id: number;
  code: string;
  group:
    | 'Procurement'
    | 'Distribution'
    | 'Receiving'
    | 'Inventory'
    | 'Consumption & Meal'
    | 'Food Cost'
    | 'Market Price'
    | 'Accounts'
    | 'Management'
    | 'HR & System';
  title: string;
  titleBn: string;
  description: string;
}

export const ALL_REPORTS: ReportDefinition[] = [
  // A. Procurement Reports (1-10)
  { id: 1, code: 'R-01', group: 'Procurement', title: 'Purchase Register', titleBn: 'ক্রয় রেজিস্টার', description: 'Itemized register of all grocery procurement with invoice details and costs' },
  { id: 2, code: 'R-02', group: 'Procurement', title: 'Purchase Summary', titleBn: 'ক্রয় সারাংশ', description: 'Consolidated purchase expenditure grouped by period and categories' },
  { id: 3, code: 'R-03', group: 'Procurement', title: 'Vendor-wise Purchase', titleBn: 'সরবরাহকারী অনুযায়ী ক্রয়', description: 'Total purchase volume and bill amounts categorized by vendor' },
  { id: 4, code: 'R-04', group: 'Procurement', title: 'Product-wise Purchase', titleBn: 'পণ্য অনুযায়ী ক্রয়', description: 'Detailed volume and average unit rate for each grocery item' },
  { id: 5, code: 'R-05', group: 'Procurement', title: 'Category-wise Purchase', titleBn: 'ক্যাটাগরি অনুযায়ী ক্রয়', description: 'Staples, Protein, Vegetables, Cooking Ingredients comparison' },
  { id: 6, code: 'R-06', group: 'Procurement', title: 'Monthly Purchase', titleBn: 'মাসিক ক্রয় প্রতিবেদন', description: 'Month-over-month procurement trends and values' },
  { id: 7, code: 'R-07', group: 'Procurement', title: 'Annual Purchase', titleBn: 'বার্ষিক ক্রয় প্রতিবেদন', description: 'Annual cumulative grocery expenditure and volume' },
  { id: 8, code: 'R-08', group: 'Procurement', title: 'Requisition Status', titleBn: 'রিকুইজিশন স্ট্যাটাস', description: 'Tracking from shelter submission to in-charge review and approval' },
  { id: 9, code: 'R-09', group: 'Procurement', title: 'Approved versus Purchased Quantity', titleBn: 'অনুমোদিত বনাম প্রকৃত ক্রয়', description: 'Variance between requisition request and actual purchase' },
  { id: 10, code: 'R-10', group: 'Procurement', title: 'Purchase Price Comparison', titleBn: 'ক্রয়মূল্য তুলনা', description: 'Vendor pricing variance against market benchmarks' },

  // B. Distribution Reports (11-17)
  { id: 11, code: 'R-11', group: 'Distribution', title: 'Head Office Distribution Register', titleBn: 'প্রধান কার্যালয় বিতরণ রেজিস্টার', description: 'Master log of all dispatched stock from central warehouse' },
  { id: 12, code: 'R-12', group: 'Distribution', title: 'Facility-wise Distribution', titleBn: 'আশ্রয়কেন্দ্র অনুযায়ী বিতরণ', description: 'Breakdown of goods allocated to Kamalapur, Kadamtali and Peace Home' },
  { id: 13, code: 'R-13', group: 'Distribution', title: 'Purchase-wise Distribution', titleBn: 'ক্রয়ানুযায়ী বিতরণ', description: 'Traceability from purchase lot to shelter allocation' },
  { id: 14, code: 'R-14', group: 'Distribution', title: 'Product-wise Distribution', titleBn: 'পণ্যভিত্তিক বিতরণ', description: 'Total dispatched quantity per product across facilities' },
  { id: 15, code: 'R-15', group: 'Distribution', title: 'Monthly Distribution', titleBn: 'মাসিক বিতরণ হিসাব', description: 'Monthly dispatch volumes and values' },
  { id: 16, code: 'R-16', group: 'Distribution', title: 'Central Stock Movement', titleBn: 'কেন্দ্রীয় স্টক চলাচল', description: 'Inward purchase receipts vs outward dispatches' },
  { id: 17, code: 'R-17', group: 'Distribution', title: 'Dispatch Register', titleBn: 'চালান ও পরিবহন রেজিস্টার', description: 'Challan numbers, transport drivers, delivery timings' },

  // C. Receiving Reports (18-24)
  { id: 18, code: 'R-18', group: 'Receiving', title: 'Receiving Confirmation Register', titleBn: 'পণ্য গ্রহণ নিশ্চিতকরণ রেজিস্টার', description: 'Mandatory field receiving records and verification status' },
  { id: 19, code: 'R-19', group: 'Receiving', title: 'Dispatched versus Received', titleBn: 'প্রেরিত বনাম গৃহীত পরিমাণ', description: 'Detailed comparison of dispatched vs actual received quantity' },
  { id: 20, code: 'R-20', group: 'Receiving', title: 'Pending Receiving Confirmation', titleBn: 'অপেক্ষমাণ গ্রহণ তালিকা', description: 'Goods dispatched by Head Office but awaiting facility inspection' },
  { id: 21, code: 'R-21', group: 'Receiving', title: 'Shortage Report', titleBn: 'ঘাটতি প্রতিবেদন', description: 'Discrepancies where actual received is less than challan quantity' },
  { id: 22, code: 'R-22', group: 'Receiving', title: 'Damaged Goods Report', titleBn: 'ক্ষতিগ্রস্ত পণ্য প্রতিবেদন', description: 'Items rejected or spoiled in transit' },
  { id: 23, code: 'R-23', group: 'Receiving', title: 'Disputed Distribution Report', titleBn: 'বিতর্কিত বিতরণ হিসাব', description: 'Dispatches under active investigation' },
  { id: 24, code: 'R-24', group: 'Receiving', title: 'Facility Receiving History', titleBn: 'আশ্রয়কেন্দ্র পণ্য গ্রহণের ইতিহাস', description: 'Historical delivery track record for each shelter' },

  // D. Inventory Reports (25-34)
  { id: 25, code: 'R-25', group: 'Inventory', title: 'Head Office Central Stock', titleBn: 'প্রধান কার্যালয় গুদাম স্টক', description: 'Current available balances at central store' },
  { id: 26, code: 'R-26', group: 'Inventory', title: 'Kamalapur TSSB Stock', titleBn: 'কমলাপুর টিএসএসবি স্টক', description: 'Live physical inventory at Kamalapur shelter' },
  { id: 27, code: 'R-27', group: 'Inventory', title: 'Kadamtali TSSB Stock', titleBn: 'কদমতলী টিএসএসবি স্টক', description: 'Live physical inventory at Kadamtali shelter' },
  { id: 28, code: 'R-28', group: 'Inventory', title: 'LEEDO Peace Home Stock', titleBn: 'লিডো পিস হোম স্টক', description: 'Live physical inventory at Peace Home facility' },
  { id: 29, code: 'R-29', group: 'Inventory', title: 'Stock Movement Ledger', titleBn: 'স্টক চলাচল খতিয়ান', description: 'Complete chronological card of receipts, consumption and balances' },
  { id: 30, code: 'R-30', group: 'Inventory', title: 'Opening and Closing Stock', titleBn: 'প্রারম্ভিক ও সমাপনী স্টক', description: 'Daily and monthly stock balance reconciliation' },
  { id: 31, code: 'R-31', group: 'Inventory', title: 'Stock Reconciliation', titleBn: 'স্টক সমন্বয় প্রতিবেদন', description: 'Physical count audit vs system records' },
  { id: 32, code: 'R-32', group: 'Inventory', title: 'Minimum Stock Alert', titleBn: 'সর্বনিম্ন স্টক সতর্কতা', description: 'Items falling below reorder threshold levels' },
  { id: 33, code: 'R-33', group: 'Inventory', title: 'Stock Adjustment Register', titleBn: 'স্টক সমন্বয় রেজিস্টার', description: 'Authorized adjustments, spillages and stock corrections' },
  { id: 34, code: 'R-34', group: 'Inventory', title: 'Expired or Damaged Stock Report', titleBn: 'মেয়াদোত্তীর্ণ বা বিনষ্ট স্টক', description: 'Non-usable grocery items disposal logs' },

  // E. Consumption and Meal Reports (35-45)
  { id: 35, code: 'R-35', group: 'Consumption & Meal', title: 'Daily Consumption Register', titleBn: 'দৈনিক খাদ্য ভোগ রেজিস্টার', description: 'Daily ingredients used in cooking across all shelters' },
  { id: 36, code: 'R-36', group: 'Consumption & Meal', title: 'Monthly Consumption Summary', titleBn: 'মাসিক খাদ্য ভোগ সারাংশ', description: 'Total monthly usage per commodity' },
  { id: 37, code: 'R-37', group: 'Consumption & Meal', title: 'Product-wise Consumption', titleBn: 'পণ্যভিত্তিক ভোগ হিসাব', description: 'Quantity consumed for each grocery item' },
  { id: 38, code: 'R-38', group: 'Consumption & Meal', title: 'Facility-wise Consumption', titleBn: 'আশ্রয়কেন্দ্রভিত্তিক ভোগ হিসাব', description: 'Comparison of food consumed between the 3 facilities' },
  { id: 39, code: 'R-39', group: 'Consumption & Meal', title: 'Daily Meal Report', titleBn: 'দৈনিক খাবার পরিবেশন রিপোর্ট', description: 'Breakfast, lunch, evening snack and dinner counts' },
  { id: 40, code: 'R-40', group: 'Consumption & Meal', title: 'Monthly Meal Report', titleBn: 'মাসিক খাবার পরিবেশন রিপোর্ট', description: 'Aggregate monthly meal counts and distribution' },
  { id: 41, code: 'R-41', group: 'Consumption & Meal', title: 'Child Attendance Register', titleBn: 'শিশুর উপস্থিতি রেজিস্টার', description: 'Daily headcount of resident street children present' },
  { id: 42, code: 'R-42', group: 'Consumption & Meal', title: 'Child-Days Summary', titleBn: 'শিশু-দিন সারাংশ', description: 'Total cumulative child-days calculated per facility' },
  { id: 43, code: 'R-43', group: 'Consumption & Meal', title: 'Meal Coverage Report', titleBn: 'খাবার কভারেজ রিপোর্ট', description: 'Meal provision rate against resident population' },
  { id: 44, code: 'R-44', group: 'Consumption & Meal', title: 'Wastage Report', titleBn: 'খাদ্য অপচয় রিপোর্ট', description: 'Spoilage, peeling loss, and expired food analysis' },
  { id: 45, code: 'R-45', group: 'Consumption & Meal', title: 'Consumption versus Stock', titleBn: 'ভোগ বনাম স্টক বিশ্লেষণ', description: 'Ratio of stock run-rate against inventory on hand' },

  // F. Food Cost Reports (46-54)
  { id: 46, code: 'R-46', group: 'Food Cost', title: 'Food Cost per Child per Day', titleBn: 'শিশু প্রতি দৈনিক খাদ্য খরচ', description: 'Verified Food Expenditure / Total Child-Days' },
  { id: 47, code: 'R-47', group: 'Food Cost', title: 'Cost per Meal', titleBn: 'প্রতি বেলার খাবারের খরচ', description: 'Average expenditure per meal served' },
  { id: 48, code: 'R-48', group: 'Food Cost', title: 'Facility-wise Food Cost', titleBn: 'আশ্রয়কেন্দ্রভিত্তিক খাদ্য খরচ', description: 'Cost comparison across Kamalapur, Kadamtali and Peace Home' },
  { id: 49, code: 'R-49', group: 'Food Cost', title: 'Monthly Food Cost', titleBn: 'মাসিক খাদ্য ব্যয়', description: 'Month-by-month food expenditure trend' },
  { id: 50, code: 'R-50', group: 'Food Cost', title: 'Annual Food Cost', titleBn: 'বার্ষিক খাদ্য ব্যয়', description: 'Full year nutrition and grocery cost summary' },
  { id: 51, code: 'R-51', group: 'Food Cost', title: 'Child-Day versus Expenditure', titleBn: 'শিশু-দিন বনাম মোট ব্যয়', description: 'Correlation between child attendance and grocery spend' },
  { id: 52, code: 'R-52', group: 'Food Cost', title: 'Food Budget versus Actual', titleBn: 'খাদ্য বাজেট বনাম প্রকৃত ব্যয়', description: 'Variance of approved nutrition budget vs actual spent' },
  { id: 53, code: 'R-53', group: 'Food Cost', title: 'Food Cost Trend', titleBn: 'খাদ্য খরচের ধারা', description: 'Historical fluctuations in child nutrition cost' },
  { id: 54, code: 'R-54', group: 'Food Cost', title: 'Facility Comparative Cost', titleBn: 'আশ্রয়কেন্দ্রগুলোর তুলনামূলক ব্যয়', description: 'Side-by-side efficiency benchmarks for all 3 shelters' },

  // G. Market Price Reports (55-62)
  { id: 55, code: 'R-55', group: 'Market Price', title: 'Product Price History', titleBn: 'পণ্যের মূল্য ইতিহাস', description: 'Chronological price points for all catalog groceries' },
  { id: 56, code: 'R-56', group: 'Market Price', title: '3-Month Price Comparison', titleBn: '৩ মাসের মূল্য তুলনা', description: 'Quarterly price trajectory and volatility' },
  { id: 57, code: 'R-57', group: 'Market Price', title: '6-Month Price Comparison', titleBn: '৬ মাসের মূল্য তুলনা', description: 'Half-yearly market rates analysis' },
  { id: 58, code: 'R-58', group: 'Market Price', title: '12-Month Price Comparison', titleBn: '১২ মাসের মূল্য তুলনা', description: 'Full year inflation and seasonality patterns' },
  { id: 59, code: 'R-59', group: 'Market Price', title: 'Annual Price Comparison', titleBn: 'বার্ষিক মূল্য তুলনা', description: 'Multi-year commodity price movements' },
  { id: 60, code: 'R-60', group: 'Market Price', title: 'Vendor Price Comparison', titleBn: 'ভেন্ডরদের মূল্য তুলনা', description: 'Rate comparison among competing suppliers' },
  { id: 61, code: 'R-61', group: 'Market Price', title: 'Market Price Comparison', titleBn: 'পাইকারি বাজারের দর তুলনা', description: 'Karwan Bazar vs Badamtoli vs Moulvibazar rates' },
  { id: 62, code: 'R-62', group: 'Market Price', title: 'Price Increase/Decrease Report', titleBn: 'মূল্য হ্রাস-বৃদ্ধি রিপোর্ট', description: 'Percentage shifts and unusual price fluctuations' },

  // H. Accounts Reports (63-73)
  { id: 63, code: 'R-63', group: 'Accounts', title: 'Purchase Ledger', titleBn: 'ক্রয় খতিয়ান', description: 'Comprehensive accounting ledger of all procurement invoices' },
  { id: 64, code: 'R-64', group: 'Accounts', title: 'Vendor Ledger', titleBn: 'ভেন্ডর খতিয়ান', description: 'Accounts payable, invoices and payments per supplier' },
  { id: 65, code: 'R-65', group: 'Accounts', title: 'Facility Expense Ledger', titleBn: 'আশ্রয়কেন্দ্র ব্যয় খতিয়ান', description: 'Direct operational expenses attributed to each shelter' },
  { id: 66, code: 'R-66', group: 'Accounts', title: 'Invoice Register', titleBn: 'চালান ও বিল রেজিস্টার', description: 'Status of physical and digital vendor invoices' },
  { id: 67, code: 'R-67', group: 'Accounts', title: 'Pending Bill Verification', titleBn: 'অপেক্ষমাণ বিল যাচাই', description: 'Invoices awaiting audit review by Accountant' },
  { id: 68, code: 'R-68', group: 'Accounts', title: 'Verified Bill Register', titleBn: 'যাচাইকৃত বিল রেজিস্টার', description: 'Final verified and certified procurement bills' },
  { id: 69, code: 'R-69', group: 'Accounts', title: 'Budget Utilization', titleBn: 'বাজেট ব্যবহার শতাংশ', description: 'Percentage of allocated grocery budget utilized' },
  { id: 70, code: 'R-70', group: 'Accounts', title: 'Budget Variance', titleBn: 'বাজেট বিচ্যুতি হিসাব', description: 'Over-budget and under-budget deviations' },
  { id: 71, code: 'R-71', group: 'Accounts', title: 'Payment Status', titleBn: 'পরিশোধের অবস্থা', description: 'Paid, pending and partial invoice settlements' },
  { id: 72, code: 'R-72', group: 'Accounts', title: 'Monthly Financial Closing', titleBn: 'মাসিক আর্থিক সমাপ্তি বিবরণী', description: 'Reconciled closing accounts with sign-off' },
  { id: 73, code: 'R-73', group: 'Accounts', title: 'Annual Financial Summary', titleBn: 'বার্ষিক আর্থিক বিবরণী', description: 'Consolidated fiscal year grocery statements' },

  // I. Management Reports (74-85)
  { id: 74, code: 'R-74', group: 'Management', title: 'Management Exception Report', titleBn: 'ব্যবস্থাপনা অনিয়ম ও ব্যতিক্রম রিপোর্ট', description: 'Consolidated log of anomalies and action items' },
  { id: 75, code: 'R-75', group: 'Management', title: 'Unauthorized Purchase Report', titleBn: 'অননুমোদিত ক্রয় রিপোর্ট', description: 'Procurements made outside central authorization policy' },
  { id: 76, code: 'R-76', group: 'Management', title: 'Missing Receipt Report', titleBn: 'অনুপস্থিত ভাউচার রিপোর্ট', description: 'Purchases lacking uploaded invoice images or physical challans' },
  { id: 77, code: 'R-77', group: 'Management', title: 'Missing Daily Entry Report', titleBn: 'অনুপস্থিত দৈনিক এন্ট্রি রিপোর্ট', description: 'Shelters missing daily meal or consumption logs' },
  { id: 78, code: 'R-78', group: 'Management', title: 'Pending Requisition Report', titleBn: 'অপেক্ষমাণ রিকুইজিশন রিপোর্ট', description: 'Requisitions delayed past normal approval window' },
  { id: 79, code: 'R-79', group: 'Management', title: 'Pending Receiving Report', titleBn: 'অপেক্ষমাণ পণ্য গ্রহণ রিপোর্ট', description: 'Dispatches unconfirmed by shelter staff beyond 24 hours' },
  { id: 80, code: 'R-80', group: 'Management', title: 'Stock Discrepancy Report', titleBn: 'স্টক গরমিল রিপোর্ট', description: 'Differences between dispatch weight and received weight' },
  { id: 81, code: 'R-81', group: 'Management', title: 'Abnormal Consumption Report', titleBn: 'অস্বাভাবিক ভোগ রিপোর্ট', description: 'Daily consumption exceeding standard per-child ration' },
  { id: 82, code: 'R-82', group: 'Management', title: 'High Food Cost Report', titleBn: 'উচ্চ খাদ্য খরচ রিপোর্ট', description: 'Days where food cost per child breached upper threshold' },
  { id: 83, code: 'R-83', group: 'Management', title: 'Late Reporting Report', titleBn: 'বিলম্বিত প্রতিবেদন রিপোর্ট', description: 'Compliance audit on field reporting punctuality' },
  { id: 84, code: 'R-84', group: 'Management', title: 'Facility Performance Report', titleBn: 'আশ্রয়কেন্দ্র কার্যকারিতা মূল্যায়ন', description: 'Inventory management and compliance score per facility' },
  { id: 85, code: 'R-85', group: 'Management', title: 'Six-Year Historical Summary', titleBn: '৬ বছরের ঐতিহাসিক সারাংশ', description: 'Long-term nutritional and expenditure archival data' },

  // J. HR and System Reports (86-94)
  { id: 86, code: 'R-86', group: 'HR & System', title: 'Employee Directory', titleBn: 'কর্মকর্তা-কর্মচারী তালিকা', description: 'Full staff roster with EID, designation, role and facility' },
  { id: 87, code: 'R-87', group: 'HR & System', title: 'User Access Report', titleBn: 'ব্যবহারকারীর প্রবেশাধিকার রিপোর্ট', description: 'Role-based module permission assignments' },
  { id: 88, code: 'R-88', group: 'HR & System', title: 'Account Status Report', titleBn: 'অ্যাকাউন্ট অবস্থা রিপোর্ট', description: 'Active vs suspended employee accounts' },
  { id: 89, code: 'R-89', group: 'HR & System', title: 'Password Reset History', titleBn: 'পাসওয়ার্ড রিসেটের ইতিহাস', description: 'HR-initiated password resets and recovery logs' },
  { id: 90, code: 'R-90', group: 'HR & System', title: 'Login History', titleBn: 'লগইন ইতিহাস', description: 'Session timestamps and IP access records' },
  { id: 91, code: 'R-91', group: 'HR & System', title: 'Employee Transfer History', titleBn: 'কর্মচারী বদলি ইতিহাস', description: 'Inter-facility shelter postings and reassignments' },
  { id: 92, code: 'R-92', group: 'HR & System', title: 'Audit Log Report', titleBn: 'অডিট লগ রিপোর্ট', description: 'Immutable audit trail of all database mutations' },
  { id: 93, code: 'R-93', group: 'HR & System', title: 'User Activity Report', titleBn: 'ব্যবহারকারী কার্যক্রম রিপোর্ট', description: 'Frequency and actions logged by each employee' },
  { id: 94, code: 'R-94', group: 'HR & System', title: 'System Data Archive Report', titleBn: 'সিস্টেম ডেটা আর্কাইভ রিপোর্ট', description: 'Firebase storage volume, database count and 6-year retention status' },
];

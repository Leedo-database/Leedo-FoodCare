import React, { useState, useMemo } from 'react';
import { ALL_REPORTS, ReportDefinition } from './reportDefinitions';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FacilityId } from '../../types';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Calendar,
  Building2,
  Layers,
  ArrowRight,
  Eye,
} from 'lucide-react';

export const ReportCenter: React.FC = () => {
  const {
    purchases,
    requisitions,
    distributions,
    receivings,
    centralInventory,
    facilityInventory,
    dailyConsumptions,
    wastageRecords,
    marketPrices,
    budgets,
    exceptions,
    auditLogs,
  } = useData();
  const { currentUser, canAccessFacility, employees } = useAuth();
  const { language, formatCurrency, formatDate } = useLanguage();

  const isHeadOffice = currentUser?.facilityId === 'central';
  const defaultFacility: FacilityId | 'all' = isHeadOffice ? 'all' : (currentUser?.facilityId || 'peace_home');

  const shelterGroups = ['All', 'Receiving', 'Inventory', 'Consumption & Meal', 'Food Cost', 'Management'];
  const groups = isHeadOffice
    ? [
        'All',
        'Procurement',
        'Distribution',
        'Receiving',
        'Inventory',
        'Consumption & Meal',
        'Food Cost',
        'Market Price',
        'Accounts',
        'Management',
        'HR & System',
      ]
    : shelterGroups;

  const accessibleReports = useMemo(() => {
    return isHeadOffice ? ALL_REPORTS : ALL_REPORTS.filter((rep) => shelterGroups.includes(rep.group));
  }, [isHeadOffice]);

  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportDefinition>(
    () => (isHeadOffice ? ALL_REPORTS[0] : ALL_REPORTS.find((r) => shelterGroups.includes(r.group)) || ALL_REPORTS[0])
  );
  const [selectedFacility, setSelectedFacility] = useState<FacilityId | 'all'>(defaultFacility);
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));

  // Filtered reports list
  const filteredReports = useMemo(() => {
    return accessibleReports.filter((rep) => {
      const matchGroup = selectedGroup === 'All' || rep.group === selectedGroup;
      const matchSearch =
        rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [accessibleReports, selectedGroup, searchQuery]);

  // Compute actual report rows and columns dynamically from real state based on selected report
  const reportData = useMemo(() => {
    const code = selectedReport.code;
    let headers: string[] = ['SL', 'Date', 'Reference', 'Item / Details', 'Quantity', 'Amount (BDT)', 'Status'];
    let rows: (string | number)[][] = [];
    let totalQty = 0;
    let totalAmount = 0;

    // A. Procurement (Head Office Only)
    if (selectedReport.group === 'Procurement' || code === 'R-01' || code === 'R-02') {
      headers = ['SL', 'Purchase Date', 'Invoice No', 'Vendor', 'Items Purchased', 'Quantity', 'Total Amount', 'Status'];
      if (isHeadOffice) {
        purchases.forEach((p, idx) => {
          const itemNames = p.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ');
          const sumQty = p.items.reduce((acc, curr) => acc + curr.quantity, 0);
          rows.push([
            idx + 1,
            formatDate(p.purchaseDate),
            p.invoiceNo,
            p.vendor,
            itemNames,
            sumQty,
            formatCurrency(p.totalAmount),
            p.verificationStatus.toUpperCase(),
          ]);
          totalQty += sumQty;
          totalAmount += p.totalAmount;
        });
      }
    }

    // B. Distribution (Head Office Only)
    else if (selectedReport.group === 'Distribution') {
      headers = ['SL', 'Dispatch Date', 'Challan No', 'Product', 'Total Dispatched', 'Kamalapur', 'Kadamtali', 'Peace Home', 'Driver'];
      if (isHeadOffice) {
        distributions.forEach((d, idx) => {
        rows.push([
          idx + 1,
          formatDate(d.dispatchDate),
          d.distributionNo,
          d.productName,
          `${d.totalQuantity} ${d.unit}`,
          `${d.allocations.kamalapur} ${d.unit}`,
          `${d.allocations.kadamtali} ${d.unit}`,
          `${d.allocations.peaceHome} ${d.unit}`,
          d.deliveryPerson,
        ]);
        totalQty += d.totalQuantity;
        });
      }
    }

    // C. Receiving
    else if (selectedReport.group === 'Receiving') {
      headers = ['SL', 'Date', 'RCV No', 'Facility', 'Product', 'Dispatched', 'Actual Received', 'Shortage', 'Status'];
      const filtered = receivings.filter(
        (r) => canAccessFacility(r.facilityId) && (selectedFacility === 'all' || r.facilityId === selectedFacility)
      );
      filtered.forEach((r, idx) => {
        rows.push([
          idx + 1,
          formatDate(r.receivingDate),
          r.receivingNo,
          r.facilityId.toUpperCase(),
          r.productName,
          `${r.dispatchedQty} ${r.unit}`,
          `${r.actualReceivedQty} ${r.unit}`,
          r.shortageQty > 0 ? `${r.shortageQty} ${r.unit}` : '0',
          r.status.replace('_', ' ').toUpperCase(),
        ]);
        totalQty += r.actualReceivedQty;
      });
    }

    // D. Inventory
    else if (selectedReport.group === 'Inventory') {
      headers = ['SL', 'Facility', 'Product', 'Category', 'Unit', 'Current Stock', 'Min Threshold', 'Unit Price', 'Total Value'];
      let sourceInventory: typeof centralInventory = [];
      if (isHeadOffice) {
        if (selectedFacility === 'all') {
          sourceInventory = [...centralInventory, ...facilityInventory];
        } else if (selectedFacility === 'central') {
          sourceInventory = centralInventory;
        } else {
          sourceInventory = facilityInventory.filter((i) => i.facilityId === selectedFacility);
        }
      } else {
        sourceInventory = facilityInventory.filter((i) => canAccessFacility(i.facilityId));
      }

      sourceInventory.forEach((item, idx) => {
        const val = item.quantity * item.avgUnitPrice;
        rows.push([
          idx + 1,
          item.facilityId.toUpperCase(),
          item.productName,
          item.category,
          item.unit,
          item.quantity,
          item.minStockLevel,
          formatCurrency(item.avgUnitPrice),
          formatCurrency(val),
        ]);
        totalQty += item.quantity;
        totalAmount += val;
      });
    }

    // E. Consumption & Meal
    else if (selectedReport.group === 'Consumption & Meal') {
      headers = ['SL', 'Date', 'Facility', 'Present Children', 'Servings (B+L+S+D)', 'Total Food Cost', 'Cost / Child', 'Entered By'];
      const filtered = dailyConsumptions.filter(
        (c) => canAccessFacility(c.facilityId) && (selectedFacility === 'all' || c.facilityId === selectedFacility)
      );
      filtered.forEach((c, idx) => {
        const servings = c.breakfastServings + c.lunchServings + c.eveningSnackServings + c.dinnerServings;
        rows.push([
          idx + 1,
          formatDate(c.date),
          c.facilityId.toUpperCase(),
          c.presentChildren,
          servings,
          formatCurrency(c.totalFoodCost),
          formatCurrency(c.costPerChild),
          c.enteredByName,
        ]);
        totalAmount += c.totalFoodCost;
      });
    }

    // F. Food Cost
    else if (selectedReport.group === 'Food Cost') {
      headers = ['SL', 'Date', 'Facility', 'Resident Children', 'Present Child-Days', 'Verified Food Spend', 'Food Cost/Child/Day', 'Cost/Meal'];
      const filtered = dailyConsumptions.filter(
        (c) => canAccessFacility(c.facilityId) && (selectedFacility === 'all' || c.facilityId === selectedFacility)
      );
      filtered.forEach((c, idx) => {
        rows.push([
          idx + 1,
          formatDate(c.date),
          c.facilityId.toUpperCase(),
          c.residentChildren,
          c.presentChildren,
          formatCurrency(c.totalFoodCost),
          formatCurrency(c.costPerChild),
          formatCurrency(c.costPerMeal),
        ]);
        totalAmount += c.totalFoodCost;
      });
    }

    // G. Market Price (Head Office Only)
    else if (selectedReport.group === 'Market Price') {
      headers = ['SL', 'Date', 'Product', 'Market', 'Vendor', 'Unit Rate', 'Previous Rate', 'Change %', 'Anomaly'];
      if (isHeadOffice) {
        marketPrices.forEach((mp, idx) => {
          rows.push([
            idx + 1,
            formatDate(mp.date),
            mp.productName,
            mp.market,
            mp.vendor,
            formatCurrency(mp.unitPrice),
            formatCurrency(mp.previousPrice || mp.unitPrice),
            `${mp.priceChangePct || 0}%`,
            mp.isUnusual ? 'FLAGGED SPIKE' : 'Normal',
          ]);
        });
      }
    }

    // H. Accounts (Head Office Only)
    else if (selectedReport.group === 'Accounts') {
      headers = ['SL', 'Fiscal Year', 'Month', 'Facility', 'Category', 'Approved Budget', 'Utilized Amount', 'Variance', 'Utilization %'];
      if (isHeadOffice) {
        budgets.forEach((b, idx) => {
          rows.push([
            idx + 1,
            b.fiscalYear,
            b.month,
            b.facilityId.toUpperCase(),
            b.category,
            formatCurrency(b.approvedAmount),
            formatCurrency(b.utilizedAmount),
            formatCurrency(b.variance),
            `${b.utilizationPct}%`,
          ]);
          totalAmount += b.utilizedAmount;
        });
      }
    }

    // I. Management
    else if (selectedReport.group === 'Management') {
      headers = ['SL', 'Date', 'Facility', 'Type', 'Title / Description', 'Severity', 'Department', 'Status'];
      const filtered = exceptions.filter(
        (e) => canAccessFacility(e.facilityId) && (selectedFacility === 'all' || e.facilityId === selectedFacility)
      );
      filtered.forEach((e, idx) => {
        rows.push([
          idx + 1,
          formatDate(e.date),
          e.facilityId.toUpperCase(),
          e.type.replace('_', ' ').toUpperCase(),
          e.title,
          e.severity.toUpperCase(),
          e.responsibleDepartment,
          e.status.toUpperCase(),
        ]);
      });
    }

    // J. HR & System (Head Office Only)
    else {
      headers = ['SL', 'EID', 'Employee Name', 'Designation', 'Department', 'Facility', 'Role', 'Status', 'Pwd Changed'];
      if (isHeadOffice) {
        employees.forEach((emp, idx) => {
          rows.push([
            idx + 1,
            emp.eid,
            emp.name,
            emp.designation,
            emp.department,
            emp.facilityId.toUpperCase(),
            emp.role.replace('_', ' ').toUpperCase(),
            emp.status.toUpperCase(),
            emp.passwordChanged ? 'YES' : 'NO (Initial)',
          ]);
        });
      }
    }

    return { headers, rows, totalQty, totalAmount };
  }, [
    selectedReport,
    selectedFacility,
    isHeadOffice,
    canAccessFacility,
    startDate,
    endDate,
    purchases,
    distributions,
    receivings,
    centralInventory,
    facilityInventory,
    dailyConsumptions,
    marketPrices,
    budgets,
    exceptions,
    employees,
    formatCurrency,
    formatDate,
  ]);

  // Export to Excel (.xlsx) using the installed xlsx package
  const handleExportExcel = () => {
    const wsData = [
      ['LEEDO (Local Education and Economic Development Organization), Bangladesh'],
      ['LEEDO FOODCARE - Centralized Food Management System'],
      [`Report: ${selectedReport.code} - ${selectedReport.title}`],
      [`Facility: ${selectedFacility === 'all' ? 'All Facilities' : selectedFacility.toUpperCase()}`],
      [`Reporting Period: ${formatDate(startDate)} to ${formatDate(endDate)}`],
      [`Generated On: ${new Date().toLocaleString('en-GB')} | Generated By: ${currentUser?.name} (EID ${currentUser?.eid})`],
      [],
      reportData.headers,
      ...reportData.rows,
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `LEEDO_${selectedReport.code}_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        reportData.headers.join(','),
        ...reportData.rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LEEDO_${selectedReport.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Native Print (optimized for A4 layout with letterhead and signature blocks)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            Reports & Print Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Comprehensive reporting system with official print layouts, PDF generator and Excel exports ({accessibleReports.length} Available Reports)
          </p>
        </div>

        <div className="flex items-center space-x-2 print:hidden">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel (.xlsx)
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            Print Report
          </button>
        </div>
      </div>

      {/* Group Navigation Tabs (Hidden in Print) */}
      <div className="print:hidden flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 custom-scrollbar">
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => {
              setSelectedGroup(group);
              if (group !== 'All') {
                const firstInGroup = accessibleReports.find((r) => r.group === group);
                if (firstInGroup) setSelectedReport(firstInGroup);
              }
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition ${
              selectedGroup === group
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Filter and Report Selection Controls (Hidden in Print) */}
      <div className="print:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Select Report Dropdown */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Report ({filteredReports.length} Available)
            </label>
            <select
              value={selectedReport.code}
              onChange={(e) => {
                const found = ALL_REPORTS.find((r) => r.code === e.target.value);
                if (found) setSelectedReport(found);
              }}
              className="w-full text-xs font-medium rounded-lg border border-slate-300 px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {filteredReports.map((r) => (
                <option key={r.code} value={r.code}>
                  [{r.code}] {r.title} ({r.titleBn})
                </option>
              ))}
            </select>
          </div>

          {/* Facility Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Facility Filter</label>
            {isHeadOffice ? (
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value as FacilityId | 'all')}
                className="w-full text-xs font-medium rounded-lg border border-slate-300 px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Facilities (Consolidated)</option>
                <option value="central">Head Office Central Warehouse</option>
                <option value="kamalapur">Kamalapur TSSB</option>
                <option value="kadamtali">Kadamtali TSSB</option>
                <option value="peace_home">LEEDO Peace Home</option>
              </select>
            ) : (
              <div className="w-full text-xs font-bold rounded-lg border border-emerald-300 px-3 py-2 bg-emerald-50 text-emerald-800">
                {currentUser?.facilityId === 'peace_home'
                  ? 'LEEDO Peace Home (Locked)'
                  : currentUser?.facilityId === 'kamalapur'
                  ? 'Kamalapur TSSB (Locked)'
                  : 'Kadamtali TSSB (Locked)'}
              </div>
            )}
          </div>

          {/* Quick Search */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Search Reports</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search report name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Period:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded border border-slate-300"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded border border-slate-300"
            />
          </div>

          <div className="text-xs text-slate-500 ml-auto flex items-center gap-1.5">
            <span className="font-bold text-emerald-700">{selectedReport.code}:</span>
            <span>{selectedReport.description}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINTABLE REPORT DOCUMENT CONTAINER (Strict A4 Layout conforming to Sec 22) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 print:p-0 print:border-none print:shadow-none print:m-0">
        {/* Official LEEDO Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <img
                src="/leedo-logo.png"
                alt="LEEDO"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/assets/aistudio/.trashed-1796487643-Logo-of-LEEDO-Short-01-746x1024_a345b8a2.png';
                }}
              />
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                  Local Education and Economic Development Organization (LEEDO)
                </h2>
                <div className="text-xs font-semibold text-emerald-700 tracking-wide">
                  LEEDO FOODCARE - CENTRALIZED FOOD & NUTRITION MANAGEMENT SYSTEM
                </div>
                <div className="text-[11px] text-slate-500">
                  Head Office: Bosila, Mohammadpur, Dhaka-1207 | Phone: +880 1711-000001 | Web: leedo.org
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded">
                {selectedReport.code}
              </span>
              <div className="text-[11px] text-slate-500 mt-1">Official Master Report</div>
            </div>
          </div>

          {/* Report Meta Strip */}
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg print:bg-transparent">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Report Name</span>
              <span className="font-bold text-slate-900">{selectedReport.title}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Facility Scope</span>
              <span className="font-bold text-slate-900">
                {selectedFacility === 'all'
                  ? 'All Facilities (Consolidated)'
                  : selectedFacility.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Reporting Period</span>
              <span className="font-bold text-slate-900">
                {formatDate(startDate)} to {formatDate(endDate)}
              </span>
            </div>
            <div className="text-right sm:text-left">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Generated By / Date</span>
              <span className="font-bold text-slate-900">
                {currentUser?.name} (EID {currentUser?.eid}) | {new Date().toISOString().substring(0, 10)}
              </span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                {reportData.headers.map((h, i) => (
                  <th key={i} className="py-2.5 px-3 border border-slate-700 text-[11px] tracking-tight">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportData.rows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2 px-3 border border-slate-200 text-slate-800">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}

              {reportData.rows.length === 0 && (
                <tr>
                  <td colSpan={reportData.headers.length} className="text-center py-8 text-slate-400 text-xs">
                    No matching records found for the selected filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Metric Block */}
        {(reportData.totalQty > 0 || reportData.totalAmount > 0) && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-bold text-slate-800 print:bg-transparent">
            <span>Report Summary Totals:</span>
            <div className="space-x-6">
              {reportData.totalQty > 0 && <span>Total Quantity: {reportData.totalQty.toLocaleString()} units</span>}
              {reportData.totalAmount > 0 && <span>Total Financial Value: {formatCurrency(reportData.totalAmount)}</span>}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MANDATORY SIGNATURE SECTION (Conforming to Sec 22 Printing Requirements)  */}
        {/* ========================================================================= */}
        <div className="mt-14 pt-8 border-t border-slate-300 grid grid-cols-4 gap-4 text-center text-xs text-slate-700">
          <div>
            <div className="border-b border-slate-400 pb-1 mb-1 font-semibold">
              {currentUser?.name}
            </div>
            <div className="text-[11px] font-bold text-slate-800">Prepared By</div>
            <div className="text-[10px] text-slate-500">Procurement / Store Officer</div>
          </div>

          <div>
            <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-400">
              &nbsp;
            </div>
            <div className="text-[11px] font-bold text-slate-800">Checked By</div>
            <div className="text-[10px] text-slate-500">Accountant (EID 1004)</div>
          </div>

          <div>
            <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-400">
              &nbsp;
            </div>
            <div className="text-[11px] font-bold text-slate-800">Facility In-charge</div>
            <div className="text-[10px] text-slate-500">Kamalapur / Kadamtali / Peace Home</div>
          </div>

          <div>
            <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-400">
              &nbsp;
            </div>
            <div className="text-[11px] font-bold text-slate-800">Approved By</div>
            <div className="text-[10px] text-slate-500">Executive Director / Director Admin</div>
          </div>
        </div>

        {/* Report Footer */}
        <div className="mt-8 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 print:flex">
          <span>LEEDO FOODCARE &copy; 2026 LEEDO Bangladesh. Permanent 6-Year System Record.</span>
          <span>Confidential Institutional Audit Document - Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};

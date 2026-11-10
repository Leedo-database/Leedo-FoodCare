import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FacilityId } from '../../types';
import { Users2, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export const MealAttendance: React.FC = () => {
  const { dailyConsumptions } = useData();
  const { currentUser, canAccessFacility } = useAuth();
  const { formatDate } = useLanguage();

  const isHeadOffice = currentUser?.facilityId === 'central';
  const defaultFacility: FacilityId | 'all' = isHeadOffice ? 'all' : (currentUser?.facilityId || 'peace_home');

  const [filterFacility, setFilterFacility] = useState<FacilityId | 'all'>(defaultFacility);

  const filtered = dailyConsumptions.filter(
    (c) => canAccessFacility(c.facilityId) && (filterFacility === 'all' || c.facilityId === filterFacility)
  );

  const totalChildDays = filtered.reduce((acc, c) => acc + c.presentChildren, 0);
  const totalResidentDays = filtered.reduce((acc, c) => acc + c.residentChildren, 0);
  const totalMealsServed = filtered.reduce(
    (acc, c) =>
      acc + (c.breakfastServings + c.lunchServings + c.eveningSnackServings + c.dinnerServings),
    0
  );
  const attendancePct =
    totalResidentDays > 0 ? Math.round((totalChildDays / totalResidentDays) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users2 className="w-6 h-6 text-emerald-600" />
            Child Attendance & Meal Servings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daily resident headcount, child-days monitoring and 4-time meal coverage tracking
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-semibold block">Total Child-Days Logged</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {totalChildDays} Child-Days
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">
            {filtered.length > 0 ? 'Logged from Daily Consumption' : 'No Logs Yet'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-semibold block">Total Nutritious Meals Served</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">
            {totalMealsServed.toLocaleString()} Servings
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Breakfast, Lunch, Snacks, Dinner</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-semibold block">Attendance Rate</span>
          <span className="text-xl font-black text-indigo-600 mt-1 block">
            {attendancePct}%
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            {filtered.length > 0 ? `${filtered.length} Daily Logs` : 'No Attendance Logs Recorded'}
          </span>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3 text-xs">
        {isHeadOffice ? (
          <select
            value={filterFacility}
            onChange={(e) => setFilterFacility(e.target.value as FacilityId | 'all')}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
          >
            <option value="all">All Facilities</option>
            <option value="kamalapur">Kamalapur TSSB</option>
            <option value="kadamtali">Kadamtali TSSB</option>
            <option value="peace_home">LEEDO Peace Home</option>
          </select>
        ) : (
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-lg">
            Facility: {currentUser?.facilityId === 'peace_home' ? 'LEEDO Peace Home' : currentUser?.facilityId === 'kamalapur' ? 'Kamalapur TSSB' : 'Kadamtali TSSB'}
          </div>
        )}
        <span className="ml-auto text-slate-400">Showing {filtered.length} Attendance Logs</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-3">Facility</th>
              <th className="py-3 px-3">Resident Headcount</th>
              <th className="py-3 px-3">Present</th>
              <th className="py-3 px-3">Absent</th>
              <th className="py-3 px-3">Breakfast</th>
              <th className="py-3 px-3">Lunch</th>
              <th className="py-3 px-3">Evening Snack</th>
              <th className="py-3 px-3">Dinner</th>
              <th className="py-3 px-4 text-right">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3 px-4 font-bold text-slate-900">{formatDate(c.date)}</td>
                <td className="py-3 px-3 font-semibold text-slate-800 uppercase">
                  {c.facilityId.replace('_', ' ')}
                </td>
                <td className="py-3 px-3 text-slate-600">{c.residentChildren} Children</td>
                <td className="py-3 px-3 font-bold text-emerald-700">{c.presentChildren} Present</td>
                <td className="py-3 px-3 text-slate-500">{c.absentChildren}</td>
                <td className="py-3 px-3 font-medium text-slate-800">{c.breakfastServings}</td>
                <td className="py-3 px-3 font-medium text-slate-800">{c.lunchServings}</td>
                <td className="py-3 px-3 font-medium text-slate-800">{c.eveningSnackServings}</td>
                <td className="py-3 px-3 font-medium text-slate-800">{c.dinnerServings}</td>
                <td className="py-3 px-4 text-right text-slate-500 italic">{c.remarks || 'Standard day'}</td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                  No daily meal attendance logs recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

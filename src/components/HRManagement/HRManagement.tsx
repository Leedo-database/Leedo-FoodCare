import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Employee, UserRole, FacilityId } from '../../types';
import {
  UserCog,
  Plus,
  KeyRound,
  Search,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRightLeft,
  Building2,
} from 'lucide-react';

export const HRManagement: React.FC = () => {
  const { employees, updateEmployee, createEmployee, hrResetPassword, currentUser } = useAuth();
  const { addAuditLog } = useData();

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // New Employee Form State
  const [eid, setEid] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Shelter Operations');
  const [facilityId, setFacilityId] = useState<FacilityId>('kamalapur');
  const [role, setRole] = useState<UserRole>('field_staff');
  const [phone, setPhone] = useState('+8801711');
  const [email, setEmail] = useState('');

  const filteredEmployees = employees.filter((emp) => {
    const matchRole = filterRole === 'all' || emp.role === filterRole;
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.eid.includes(search) ||
      emp.designation.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eid.trim() || !name.trim()) return;

    if (employees.some((e) => e.eid === eid.trim())) {
      alert(`Employee ID ${eid} already exists! Every employee must have a unique EID.`);
      return;
    }

    await createEmployee({
      eid: eid.trim(),
      name: name.trim(),
      designation: designation.trim(),
      department,
      facilityId,
      role,
      phone,
      email: email.trim() || `${eid}@leedo.org`,
      status: 'active',
      joinedDate: new Date().toISOString().substring(0, 10),
    });

    addAuditLog('CREATE_EMPLOYEE', 'HR Management', eid, facilityId, `Created employee ${name} with role ${role}`);
    setIsModalOpen(false);
    setEid('');
    setName('');
    setDesignation('');
  };

  const handleResetPassword = async (targetEid: string) => {
    const res = await hrResetPassword(targetEid);
    setResetMessage(res.message);
    addAuditLog('HR_RESET_PASSWORD', 'HR Management', targetEid, 'all', res.message);
  };

  const handleToggleStatus = async (emp: Employee) => {
    const newStatus = emp.status === 'active' ? 'inactive' : 'active';
    await updateEmployee({ ...emp, status: newStatus });
    addAuditLog('TOGGLE_EMPLOYEE_STATUS', 'HR Management', emp.eid, emp.facilityId, `Set status to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCog className="w-6 h-6 text-emerald-600" />
            HR & User Access Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            EID management, role permissions assignment, secure credential resets and employee transfers
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add New Employee
        </button>
      </div>

      {resetMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center justify-between">
          <span>{resetMessage}</span>
          <button onClick={() => setResetMessage(null)} className="font-bold text-emerald-700">
            &times;
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search employees by name, EID or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
        >
          <option value="all">All Roles</option>
          <option value="founder">Founder & ED</option>
          <option value="director">Director Admin & Finance</option>
          <option value="super_admin">Manager HR & Admin</option>
          <option value="accountant">Accountant</option>
          <option value="assistant_accountant">Assistant Accountant</option>
          <option value="logistics">Logistics Officer</option>
          <option value="incharge">Field In-charge</option>
          <option value="field_staff">Field Staff</option>
        </select>

        <span className="text-slate-400 ml-auto">
          {filteredEmployees.length} Active Employee Profiles
        </span>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="py-3 px-4">EID</th>
              <th className="py-3 px-3">Employee Name</th>
              <th className="py-3 px-3">Designation</th>
              <th className="py-3 px-3">Department</th>
              <th className="py-3 px-3">Assigned Facility</th>
              <th className="py-3 px-3">System Role</th>
              <th className="py-3 px-3">Account Status</th>
              <th className="py-3 px-3">Password Status</th>
              <th className="py-3 px-4 text-right">HR Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.map((emp) => (
              <tr key={emp.eid} className="hover:bg-slate-50/80 transition">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{emp.eid}</td>
                <td className="py-3 px-3 font-semibold text-slate-900">{emp.name}</td>
                <td className="py-3 px-3 text-slate-600">{emp.designation}</td>
                <td className="py-3 px-3 text-slate-500">{emp.department}</td>
                <td className="py-3 px-3 uppercase text-slate-800 font-medium">
                  {emp.facilityId.replace('_', ' ')}
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                    {emp.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => handleToggleStatus(emp)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition ${
                      emp.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    {emp.status}
                  </button>
                </td>
                <td className="py-3 px-3">
                  {emp.passwordChanged ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Customized
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> Initial EID
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleResetPassword(emp.eid)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[11px] transition"
                    title="Reset employee password to EID with mandatory change upon login"
                  >
                    <KeyRound className="w-3 h-3 text-slate-600" />
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Add New Employee Profile</h2>
            <p className="text-xs text-slate-500 mb-4">
              Create employee credentials. Initial login password will automatically match their EID.
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unique Employee ID (EID) *</label>
                  <input
                    type="text"
                    required
                    value={eid}
                    onChange={(e) => setEid(e.target.value)}
                    placeholder="e.g. 1085"
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kamrul Islam"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Assistant Cook"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50"
                  >
                    <option value="Shelter Operations">Shelter Operations</option>
                    <option value="Kitchen Operations">Kitchen Operations</option>
                    <option value="Child Care">Child Care</option>
                    <option value="Procurement & Logistics">Procurement & Logistics</option>
                    <option value="Accounts & Finance">Accounts & Finance</option>
                    <option value="Executive Office">Executive Office</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Facility *</label>
                  <select
                    value={facilityId}
                    onChange={(e) => setFacilityId(e.target.value as FacilityId)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50"
                  >
                    <option value="kamalapur">1. Kamalapur TSSB</option>
                    <option value="kadamtali">2. Kadamtali TSSB</option>
                    <option value="peace_home">3. LEEDO Peace Home</option>
                    <option value="central">Head Office (Bosila)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role & Permissions *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50"
                  >
                    <option value="field_staff">Field Staff (Kitchen / Child Care)</option>
                    <option value="incharge">Field In-charge</option>
                    <option value="logistics">Logistics Officer</option>
                    <option value="assistant_accountant">Assistant Accountant</option>
                    <option value="accountant">Accountant</option>
                    <option value="program_manager">Manager Program & Operation</option>
                    <option value="director">Director Admin & Finance</option>
                    <option value="super_admin">Manager HR & Admin (Super Admin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@leedo.org"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Create Employee & Assign Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

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
  ShieldAlert,
  Pencil,
  Trash2,
  AlertCircle,
} from 'lucide-react';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'field_staff', label: 'Field Staff (Kitchen / Child Care)' },
  { value: 'incharge', label: 'Field In-charge' },
  { value: 'logistics', label: 'Logistics Officer' },
  { value: 'assistant_accountant', label: 'Assistant Accountant' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'program_manager', label: 'Manager Program & Operation' },
  { value: 'hr', label: 'HR Officer / HR Admin' },
  { value: 'director', label: 'Director Admin & Finance' },
  { value: 'super_admin', label: 'Manager HR & Admin (Super Admin)' },
  { value: 'founder', label: 'Founder & Executive Director' },
];

export const HRManagement: React.FC = () => {
  const { employees, updateEmployee, createEmployee, deleteEmployee, hrResetPassword, currentUser } = useAuth();
  const { addAuditLog } = useData();

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Employee Form State
  const [eid, setEid] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Shelter Operations');
  const [facilityId, setFacilityId] = useState<FacilityId>('kamalapur');
  const [role, setRole] = useState<UserRole>('field_staff');
  const [phone, setPhone] = useState('+8801711');
  const [email, setEmail] = useState('');
  const [initialPassword, setInitialPassword] = useState('');

  const canManageHR =
    currentUser && ['super_admin', 'hr', 'founder', 'director'].includes(currentUser.role);

  const filteredEmployees = employees.filter((emp) => {
    const matchRole = filterRole === 'all' || emp.role === filterRole;
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.eid.includes(search) ||
      emp.designation.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormError(null);
    setEid('');
    setName('');
    setDesignation('');
    setDepartment('Shelter Operations');
    setFacilityId('kamalapur');
    setRole('field_staff');
    setPhone('+8801711');
    setEmail('');
    setInitialPassword('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormError(null);
    setEid(emp.eid);
    setName(emp.name);
    setDesignation(emp.designation);
    setDepartment(emp.department);
    setFacilityId(emp.facilityId);
    setRole(emp.role);
    setPhone(emp.phone);
    setEmail(emp.email);
    setInitialPassword('');
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!eid.trim() || !name.trim() || !designation.trim()) {
      setFormError('Please fill in all required fields (EID, Name, Designation).');
      return;
    }

    if (editingEmployee) {
      const updatedEmp: Employee = {
        ...editingEmployee,
        name: name.trim(),
        designation: designation.trim(),
        department,
        facilityId,
        role,
        phone: phone.trim(),
        email: email.trim() || editingEmployee.email,
      };
      await updateEmployee(updatedEmp);
      addAuditLog(
        'UPDATE_EMPLOYEE',
        'HR Management',
        updatedEmp.eid,
        updatedEmp.facilityId,
        `Updated employee ${updatedEmp.name} — Role: ${updatedEmp.role}, Facility: ${updatedEmp.facilityId}`
      );
      setActionMessage({
        type: 'success',
        text: `Updated profile & role for ${updatedEmp.name} (EID ${updatedEmp.eid}).`,
      });
      setIsModalOpen(false);
    } else {
      if (employees.some((emp) => emp.eid === eid.trim())) {
        setFormError(`Employee ID ${eid.trim()} already exists! Every employee must have a unique EID.`);
        return;
      }
      if (initialPassword.trim() && initialPassword.trim().length < 4) {
        setFormError('Initial password must be at least 4 characters (or leave blank to use EID).');
        return;
      }

      await createEmployee(
        {
          eid: eid.trim(),
          name: name.trim(),
          designation: designation.trim(),
          department,
          facilityId,
          role,
          phone: phone.trim(),
          email: email.trim() || `${eid.trim()}@leedo.org`,
          status: 'active',
          joinedDate: new Date().toISOString().substring(0, 10),
        },
        initialPassword.trim() || undefined
      );

      addAuditLog(
        'CREATE_EMPLOYEE',
        'HR Management',
        eid.trim(),
        facilityId,
        `Created employee ${name.trim()} with role ${role}`
      );
      setActionMessage({
        type: 'success',
        text: `New employee ${name.trim()} (EID ${eid.trim()}) created with role ${role.replace('_', ' ')}.`,
      });
      setIsModalOpen(false);
    }
  };

  const handleResetPassword = async (targetEid: string) => {
    const res = await hrResetPassword(targetEid);
    setActionMessage({ type: res.success ? 'success' : 'error', text: res.message });
    if (res.success) {
      addAuditLog('HR_RESET_PASSWORD', 'HR Management', targetEid, 'all', res.message);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    if (emp.eid === currentUser?.eid) {
      setActionMessage({ type: 'error', text: 'You cannot deactivate your own active account.' });
      return;
    }
    const newStatus = emp.status === 'active' ? 'inactive' : 'active';
    await updateEmployee({ ...emp, status: newStatus });
    addAuditLog('TOGGLE_EMPLOYEE_STATUS', 'HR Management', emp.eid, emp.facilityId, `Set status to ${newStatus}`);
    setActionMessage({ type: 'success', text: `${emp.name} (EID ${emp.eid}) marked as ${newStatus}.` });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteEmployee(deleteTarget.eid);
    setActionMessage({ type: res.success ? 'success' : 'error', text: res.message });
    if (res.success) {
      addAuditLog(
        'DELETE_EMPLOYEE',
        'HR Management',
        deleteTarget.eid,
        deleteTarget.facilityId,
        `Deleted employee ${deleteTarget.name} (EID ${deleteTarget.eid})`
      );
    }
    setDeleteTarget(null);
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
            Add or delete employees, assign facility access & system roles, and reset passwords
          </p>
        </div>

        {canManageHR && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add New Employee
          </button>
        )}
      </div>

      {actionMessage && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="font-bold px-1.5">
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
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className="text-slate-400 ml-auto">
          {filteredEmployees.length} Employee Profiles
        </span>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
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
            {filteredEmployees.map((emp) => {
              const isSelf = emp.eid === currentUser?.eid;
              return (
                <tr key={emp.eid} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{emp.eid}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {emp.name}
                    {isSelf && (
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        You
                      </span>
                    )}
                  </td>
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
                      disabled={isSelf}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition disabled:opacity-60 ${
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
                        <ShieldAlert className="w-3.5 h-3.5" /> Initial Password
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded text-[11px] transition"
                        title="Edit employee profile, facility, and role"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit / Role
                      </button>
                      <button
                        onClick={() => handleResetPassword(emp.eid)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[11px] transition"
                        title="Reset employee password to EID with mandatory change upon login"
                      >
                        <KeyRound className="w-3 h-3 text-slate-600" />
                        Reset
                      </button>
                      <button
                        onClick={() => setDeleteTarget(emp)}
                        disabled={isSelf}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded text-[11px] transition disabled:opacity-40 disabled:cursor-not-allowed"
                        title={isSelf ? 'Cannot delete your own active account' : 'Delete employee'}
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                  No employees match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              {editingEmployee ? `Edit Employee & Role (${editingEmployee.eid})` : 'Add New Employee Profile'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {editingEmployee
                ? 'Update role permissions, facility assignment, or staff details.'
                : 'Create new employee credentials and assign their system role & facility access.'}
            </p>

            {formError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unique Employee ID (EID) *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingEmployee}
                    value={eid}
                    onChange={(e) => setEid(e.target.value)}
                    placeholder="e.g. 1085"
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold disabled:bg-slate-100 disabled:text-slate-500"
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
                    <option value="Human Resources">Human Resources</option>
                    <option value="Procurement & Logistics">Procurement & Logistics</option>
                    <option value="Accounts & Finance">Accounts & Finance</option>
                    <option value="Programs">Programs</option>
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
                    className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 font-semibold"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!editingEmployee && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Initial Password (Optional — defaults to EID if left blank)
                  </label>
                  <input
                    type="text"
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    placeholder="Leave blank to use EID as initial password"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              )}

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
                  {editingEmployee ? 'Save Changes & Role' : 'Create Employee & Assign Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-900">Delete Employee Account?</h3>
            <p className="text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <strong>
                {deleteTarget.name} (EID {deleteTarget.eid})
              </strong>{' '}
              from the system? They will no longer be able to log in.
            </p>
            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

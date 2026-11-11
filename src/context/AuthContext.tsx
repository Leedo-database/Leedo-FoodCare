import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, FacilityId } from '../types';
import { INITIAL_EMPLOYEES } from '../data/initialData';

interface AuthContextType {
  currentUser: Employee | null;
  employees: Employee[];
  loading: boolean;
  login: (eid: string, password: string) => Promise<{ success: boolean; message: string; requiresPasswordChange?: boolean }>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;
  hrResetPassword: (targetEid: string) => Promise<{ success: boolean; message: string }>;
  updateEmployee: (employee: Employee) => Promise<void>;
  createEmployee: (employeeData: Omit<Employee, 'passwordChanged'>, initialPassword?: string) => Promise<void>;
  deleteEmployee: (targetEid: string) => Promise<{ success: boolean; message: string }>;
  canAccessModule: (module: string) => boolean;
  canAccessFacility: (facilityId: FacilityId | 'all') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY_USER = 'leedo_foodcare_session_user';
const SESSION_KEY_DATE = 'leedo_foodcare_session_date';
const LOCAL_STORAGE_KEY_EMPLOYEES = 'leedo_foodcare_employees';
const CLEAN_AUTH_KEY = 'leedo_foodcare_auth_v6_clean';
const REMOVED_STAFF_CLEANUP_KEY = 'leedo_foodcare_removed_staff_v7';
const REMOVED_EIDS = ['1050', '1035', '1042'];

// Helper to hash passwords in browser using Web Crypto API SHA-256
async function hashPassword(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain + '_leedo_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // One-time clean reset of legacy demo employee cache
  if (typeof window !== 'undefined' && localStorage.getItem(CLEAN_AUTH_KEY) !== 'yes') {
    localStorage.removeItem(LOCAL_STORAGE_KEY_EMPLOYEES);
    localStorage.removeItem('leedo_foodcare_current_user');
    localStorage.setItem(CLEAN_AUTH_KEY, 'yes');
  }

  // One-time removal of EIDs 1050, 1035, 1042 from any cached roster while keeping real saved passwords
  if (typeof window !== 'undefined' && localStorage.getItem(REMOVED_STAFF_CLEANUP_KEY) !== 'yes') {
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY_EMPLOYEES);
    if (existingRaw) {
      try {
        const parsed = JSON.parse(existingRaw) as Employee[];
        const filtered = parsed.filter((e) => !REMOVED_EIDS.includes(e.eid));
        localStorage.setItem(LOCAL_STORAGE_KEY_EMPLOYEES, JSON.stringify(filtered));
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY_EMPLOYEES);
      }
    }
    const activeSessionRaw = sessionStorage.getItem(SESSION_KEY_USER);
    if (activeSessionRaw) {
      try {
        const activeUser = JSON.parse(activeSessionRaw) as Employee;
        if (REMOVED_EIDS.includes(activeUser.eid)) {
          sessionStorage.removeItem(SESSION_KEY_USER);
          sessionStorage.removeItem(SESSION_KEY_DATE);
        }
      } catch {
        sessionStorage.removeItem(SESSION_KEY_USER);
      }
    }
    localStorage.setItem(REMOVED_STAFF_CLEANUP_KEY, 'yes');
  }

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_EMPLOYEES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_EMPLOYEES;
      }
    }
    return INITIAL_EMPLOYEES;
  });

  // Daily session-based authentication: always asks for EID & Password on new session or new day
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    const today = new Date().toISOString().substring(0, 10);
    const savedDate = sessionStorage.getItem(SESSION_KEY_DATE);
    const savedUser = sessionStorage.getItem(SESSION_KEY_USER);
    if (savedUser && savedDate === today) {
      try {
        const parsed = JSON.parse(savedUser) as Employee;
        const storedEmployeesRaw = localStorage.getItem(LOCAL_STORAGE_KEY_EMPLOYEES);
        if (storedEmployeesRaw) {
          const storedEmployees = JSON.parse(storedEmployeesRaw) as Employee[];
          const latest = storedEmployees.find((e) => e.eid === parsed.eid);
          if (latest && latest.status === 'active') return latest;
          if (!latest) return null;
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    const today = new Date().toISOString().substring(0, 10);
    if (currentUser) {
      sessionStorage.setItem(SESSION_KEY_USER, JSON.stringify(currentUser));
      sessionStorage.setItem(SESSION_KEY_DATE, today);
    } else {
      sessionStorage.removeItem(SESSION_KEY_USER);
      sessionStorage.removeItem(SESSION_KEY_DATE);
    }
  }, [currentUser]);

  const isHRAdmin = (role?: Employee['role']) =>
    role === 'super_admin' || role === 'hr' || role === 'founder' || role === 'director';

  // EID-based login validation
  const login = async (eid: string, password: string): Promise<{ success: boolean; message: string; requiresPasswordChange?: boolean }> => {
    setLoading(true);
    try {
      const cleanEid = eid.trim();
      const emp = employees.find((e) => e.eid === cleanEid);

      if (!emp) {
        return { success: false, message: 'Invalid Employee ID (EID). Please check with HR Admin.' };
      }

      if (emp.status === 'inactive') {
        return { success: false, message: 'This employee account is deactivated. Contact HR Super Admin.' };
      }

      const inputHash = await hashPassword(password);
      const isDefaultInitialPass = password === cleanEid;

      const isValidPassword =
        (emp.passwordHash && emp.passwordHash === inputHash) ||
        (!emp.passwordHash && !emp.passwordChanged && isDefaultInitialPass);

      if (!isValidPassword) {
        return {
          success: false,
          message: emp.passwordChanged
            ? 'Incorrect password. Please enter your updated personal password.'
            : 'Incorrect password. Please check with HR Admin.',
        };
      }

      // Mandatory password change check on first login or HR reset
      if (!emp.passwordChanged || emp.requiresPasswordReset) {
        setCurrentUser(emp);
        return {
          success: true,
          message: 'Password update required to continue.',
          requiresPasswordChange: true,
        };
      }

      setCurrentUser(emp);
      return { success: true, message: 'Login successful' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setCurrentUser(null);
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'No active session' };

    if (newPassword === currentUser.eid) {
      return { success: false, message: 'New password cannot be your Employee ID (EID).' };
    }
    if (newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    const hashed = await hashPassword(newPassword);
    const updated: Employee = {
      ...currentUser,
      passwordHash: hashed,
      passwordChanged: true,
      requiresPasswordReset: false,
    };

    const nextEmployees = employees.map((e) => (e.eid === currentUser.eid ? updated : e));
    localStorage.setItem(LOCAL_STORAGE_KEY_EMPLOYEES, JSON.stringify(nextEmployees));
    setEmployees(nextEmployees);
    setCurrentUser(updated);

    return { success: true, message: 'Password updated and saved securely.' };
  };

  const hrResetPassword = async (targetEid: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || !isHRAdmin(currentUser.role)) {
      return { success: false, message: 'Unauthorized. Only HR / Admin can reset employee credentials.' };
    }

    const target = employees.find((e) => e.eid === targetEid);
    if (!target) return { success: false, message: 'Employee not found.' };

    const resetEmp: Employee = {
      ...target,
      passwordHash: undefined,
      passwordChanged: false,
      requiresPasswordReset: true,
    };

    const nextEmployees = employees.map((e) => (e.eid === targetEid ? resetEmp : e));
    localStorage.setItem(LOCAL_STORAGE_KEY_EMPLOYEES, JSON.stringify(nextEmployees));
    setEmployees(nextEmployees);

    if (currentUser.eid === targetEid) {
      setCurrentUser(resetEmp);
    }

    return {
      success: true,
      message: `Password for EID ${targetEid} (${target.name}) reset to default EID. Forced password change scheduled on next login.`,
    };
  };

  const updateEmployee = async (employee: Employee) => {
    if (!currentUser || !isHRAdmin(currentUser.role)) return;
    const nextEmployees = employees.map((e) => (e.eid === employee.eid ? employee : e));
    localStorage.setItem(LOCAL_STORAGE_KEY_EMPLOYEES, JSON.stringify(nextEmployees));
    setEmployees(nextEmployees);
    if (currentUser.eid === employee.eid) {
      setCurrentUser(employee);
    }
  };

  const createEmployee = async (employeeData: Omit<Employee, 'passwordChanged'>, initialPassword?: string) => {
    if (!currentUser || !isHRAdmin(currentUser.role)) return;
    const trimmedPass = initialPassword?.trim();
    const passwordHash = trimmedPass ? await hashPassword(trimmedPass) : undefined;
    const newEmp: Employee = {
      ...employeeData,
      passwordHash,
      passwordChanged: false,
      requiresPasswordReset: true,
    };
    const nextEmployees = [...employees, newEmp];
    localStorage.setItem(LOCAL_STORAGE_KEY_EMPLOYEES, JSON.stringify(nextEmployees));
    setEmployees(nextEmployees);
  };

  const deleteEmployee = async (targetEid: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || !isHRAdmin(currentUser.role)) {
      return { success: false, message: 'Unauthorized. Only HR / Admin can delete employees.' };
    }
    if (targetEid === currentUser.eid) {
      return { success: false, message: 'You cannot delete your own active account.' };
    }
    const target = employees.find((e) => e.eid === targetEid);
    if (!target) {
      return { success: false, message: 'Employee not found.' };
    }

    const nextEmployees = employees.filter((e) => e.eid !== targetEid);
    localStorage.setItem(LOCAL_STORAGE_KEY_EMPLOYEES, JSON.stringify(nextEmployees));
    setEmployees(nextEmployees);
    return {
      success: true,
      message: `Employee ${target.name} (EID ${target.eid}) has been permanently deleted.`,
    };
  };

  // Strict role-based permission gate
  const canAccessModule = (module: string): boolean => {
    if (!currentUser) return false;
    const { role } = currentUser;

    // Founder, Director, and HR Super Admin have full access
    if (role === 'founder' || role === 'director' || role === 'super_admin') return true;

    switch (module) {
      case 'dashboard':
        return true;
      case 'requisitions':
        return true;
      case 'procurement':
      case 'purchases':
      case 'centralStock':
      case 'distribution':
        return role === 'logistics' || role === 'accountant' || role === 'assistant_accountant';
      case 'receiving':
      case 'facilityInventory':
      case 'consumption':
      case 'attendance':
      case 'wastage':
      case 'donorContributions':
        return role === 'incharge' || role === 'field_staff' || role === 'program_manager' || role === 'logistics';
      case 'marketPrice':
        return role === 'logistics' || role === 'accountant' || role === 'program_manager';
      case 'budgetAccounts':
      case 'vendors':
        return role === 'accountant' || role === 'assistant_accountant';
      case 'reportCenter':
        return true;
      case 'exceptions':
        return role === 'program_manager' || role === 'accountant' || role === 'logistics';
      case 'monthlyClosing':
        return role === 'accountant';
      case 'hrManagement':
        return role === 'hr';
      case 'auditLogs':
        return role === 'accountant' || role === 'hr';
      case 'settings':
        return role === 'hr';
      default:
        return false;
    }
  };

  const canAccessFacility = (facilityId: FacilityId | 'all'): boolean => {
    if (!currentUser) return false;

    const isHeadOfficeStaff = currentUser.facilityId === 'central';
    const isCentralOversight = [
      'founder',
      'director',
      'super_admin',
      'hr',
      'accountant',
      'assistant_accountant',
      'logistics',
      'program_manager',
    ].includes(currentUser.role);

    if (isHeadOfficeStaff && isCentralOversight) {
      return true;
    }

    // Field staff (Peace Home, Kamalapur, Kadamtali) can strictly ONLY view their own shelter
    if (facilityId === 'all' || facilityId === 'central') {
      return false;
    }
    return currentUser.facilityId === facilityId;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        employees,
        loading,
        login,
        logout,
        changePassword,
        hrResetPassword,
        updateEmployee,
        createEmployee,
        deleteEmployee,
        canAccessModule,
        canAccessFacility,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

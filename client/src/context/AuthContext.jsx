import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

// =============================================================================
// ROLE-BASED ACCESS CONTROL CONFIGURATION
// Maps each role to the sidebar module IDs they are allowed to access.
// ADMIN sees everything. All other roles see only their relevant modules.
// =============================================================================
export const ROLE_PERMISSIONS = {
  ADMIN: '*', // wildcard = access to all modules
  SUPER_ADMIN: '*',

  // Gate Security / Weighbridge: ONLY Inward & Outward modules!
  GATE_SECURITY: [
    'gate-terminal', 'grn'
  ],

  // Furnace Operator: ONLY Operator Console & Furnace Board!
  // Operators must NOT be able to modify approved process specifications or batch creation!
  FURNACE_OPERATOR: [
    'operator', 'furnaces'
  ],

  // Quality & Metallurgy (Section 1: Incoming, In-process, Hardness, Case depth, Final QC, NCR, Rework, TC)
  QC_QUALITY: [
    'qc-lab', 'certificates', 'ncr', 'traceability'
  ],
  QUALITY_INSPECTOR: [
    'qc-lab', 'certificates', 'ncr', 'traceability'
  ],
  QC_MANAGER: [
    'qc-lab', 'certificates', 'ncr', 'traceability', 'inventory'
  ],
  METALLURGIST: [
    'recipes', 'batches', 'qc-lab', 'certificates', 'ncr', 'traceability'
  ],

  // Store & Dispatch (Section 1: Material receipt, Raw/customer material, Processed, Stock, Dispatch, DC)
  STORE_DISPATCH: [
    'grn', 'inventory', 'commercial', 'gate-terminal'
  ],

  // Maintenance & Calibration
  MAINTENANCE_ENGINEER: [
    'maintenance', 'furnaces'
  ],
  MAINTENANCE_MANAGER: [
    'maintenance', 'furnaces'
  ],

  // Stores & Warehouse
  STORE_KEEPER: [
    'grn', 'inventory'
  ],
  STORE_MANAGER: [
    'grn', 'inventory', 'job-orders', 'purchase'
  ],

  // Sales & Enquiry Pipeline
  SALES: [
    'dashboard', 'sales', 'job-orders', 'grn', 'commercial', 'tax-invoice'
  ],

  // Commercial & Accounts: Billing, Invoices, Services & Purchasing
  COMMERCIAL: [
    'commercial', 'tax-invoice', 'sales', 'certificates', 'purchase', 'services'
  ],
  ACCOUNTS: [
    'commercial', 'tax-invoice', 'sales', 'purchase'
  ],

  // Production Management
  PRODUCTION_MANAGER: [
    'dashboard', 'furnaces', 'operator', 'job-orders', 'batches',
    'recipes', 'qc-lab', 'ncr', 'inventory', 'traceability', 'sales'
  ],
  PLANT_MANAGER: [
    'dashboard', 'furnaces', 'operator', 'job-orders', 'batches',
    'recipes', 'qc-lab', 'certificates', 'ncr', 'inventory',
    'commercial', 'tax-invoice', 'maintenance', 'traceability', 'masters',
    'purchase', 'services', 'sales'
  ]
};

// Helper: check if a user's role allows access to a given module id
export const canAccess = (user, moduleId) => {
  if (!user || !user.role) return false;
  const perms = ROLE_PERMISSIONS[user.role];
  if (!perms) return false;
  if (perms === '*') return true;
  return perms.includes(moduleId);
};

// Helper: determine the default active tab based on user's authorized role
export const getDefaultTab = (user) => {
  if (!user || !user.role) return 'dashboard';
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return 'dashboard';
  if (user.role === 'GATE_SECURITY') return 'gate-terminal';
  if (user.role === 'FURNACE_OPERATOR') return 'operator';
  if (user.role === 'QUALITY_INSPECTOR' || user.role === 'QC_MANAGER' || user.role === 'QC_QUALITY') return 'qc-lab';
  if (user.role === 'STORE_DISPATCH') return 'grn';
  if (user.role === 'SALES') return 'sales';
  if (user.role === 'METALLURGIST') return 'recipes';
  if (user.role === 'COMMERCIAL' || user.role === 'ACCOUNTS') return 'commercial';
  if (user.role === 'STORE_KEEPER' || user.role === 'STORE_MANAGER') return 'grn';
  if (user.role === 'MAINTENANCE_ENGINEER' || user.role === 'MAINTENANCE_MANAGER') return 'furnaces';

  const perms = ROLE_PERMISSIONS[user.role];
  if (Array.isArray(perms) && perms.length > 0) {
    return perms[0];
  }
  return 'dashboard';
};

// Helper: determine default portal ('gate-terminal' vs 'main-office')
export const getDefaultPortal = (user) => {
  if (!user || !user.role) return 'main-office';
  if (user.role === 'GATE_SECURITY') return 'gate-terminal';
  return 'main-office';
};

// Helper: check if a user can switch to a specific portal
export const canAccessPortal = (user, portal) => {
  if (!user || !user.role) return false;
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return true;
  if (portal === 'gate-terminal') {
    return canAccess(user, 'gate-terminal');
  }
  if (portal === 'main-office') {
    const perms = ROLE_PERMISSIONS[user.role];
    if (perms === '*') return true;
    if (Array.isArray(perms)) {
      return perms.some((id) => id !== 'gate-terminal');
    }
    return false;
  }
  return true;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('matheat_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('matheat_token') || null);
  const [sessionNotice, setSessionNotice] = useState('');

  const logout = (notice = '') => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('matheat_user');
    localStorage.removeItem('matheat_token');
    if (notice) {
      setSessionNotice(notice);
    }
  };

  const clearSessionNotice = () => setSessionNotice('');

  // 1. Listen for automatic token expiration events from api/client
  useEffect(() => {
    const handleTokenExpired = (e) => {
      const reason = e?.detail?.message || 'Your session has expired. Please sign in again.';
      logout(reason);
    };

    window.addEventListener('matheat_token_expired', handleTokenExpired);

    // 2. On app mount, validate existing session against MongoDB backend if token exists
    const validateExistingSession = async () => {
      const savedToken = localStorage.getItem('matheat_token');
      if (!savedToken) return;

      try {
        const res = await api.auth.me();
        if (res && res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('matheat_user', JSON.stringify(res.user));
        } else {
          logout('Session invalid or user deactivated. Please log in.');
        }
      } catch (err) {
        // Token was invalid or expired
        console.warn('Initial session validation failed:', err.message);
        logout('Your session has expired. Please log in to continue.');
      }
    };

    validateExistingSession();

    return () => {
      window.removeEventListener('matheat_token_expired', handleTokenExpired);
    };
  }, []);

  const login = async (username, password) => {
    setSessionNotice('');
    const data = await api.auth.login({ username, password });
    if (data && data.success) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('matheat_user', JSON.stringify(data.user));
      localStorage.setItem('matheat_token', data.token);
      return { success: true };
    }
    throw new Error(data?.message || 'Invalid credentials');
  };

  return (
    <AuthContext.Provider value={{ user, token, sessionNotice, clearSessionNotice, login, logout, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

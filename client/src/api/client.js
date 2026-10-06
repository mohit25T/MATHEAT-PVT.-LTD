/**
 * =============================================================================
 * CENTRALIZED API ENGINE FOR MATHEAT HEAT TREATMENT ERP + MES
 * =============================================================================
 * Consolidates all industrial domain endpoints:
 * - Authentication & User Management (Staff Accounts & Roles)
 * - Job Work Orders (Heat Number, Drawing Specs, Delivery Dates)
 * - Maintenance & NABL Calibration (Safety lockout alerts)
 * - Furnace Master (Dynamic registration, capacity & real-time telemetry)
 * - Customer Entity Management & Instant GSTIN Lookup
 * - Gate Weighbridge Dual-Camera Captures
 * - Material Inward (GRN), Recipe Studio, Batch Scheduling, QC Lab, Invoicing
 */

export const API_BASE_URL = (() => {
  if (typeof window === 'undefined') return 'http://localhost:7000||https://matb.apexitworld.com';
  const hostname = window.location.hostname;
  const isHttps = window.location.protocol === 'https:';
  // When accessed via tunnels (ngrok, etc.) or HTTPS, use Vite dev server proxy to avoid mixed content & port issues
  if (isHttps || hostname.includes('ngrok') || hostname.includes('.dev') || hostname.includes('.app')) {
    return '';
  }
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:7000`;
  }
  return 'http://localhost:7000';
})();

export const API_ROOT = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';

let dbConnectionLogged = false;

// Display connected database name and status in browser console
export const logDatabaseName = async () => {
  if (dbConnectionLogged) return;
  try {
    const res = await fetch(`${API_ROOT}/health`);
    const data = await res.json();
    const dbName = data.dbName || 'MATHEAT';
    const dbHost = data.dbHost || 'apexit.2qbg0ge.mongodb.net';
    console.log(
      `%c🗄️ [DATABASE CONNECTED]: ${dbName} %c(${dbHost})`,
      'background: #022c22; color: #4ade80; font-size: 13px; font-weight: bold; padding: 4px 8px; border-radius: 4px; border: 1px solid #10b981;',
      'color: #94a3b8; font-size: 11px; font-weight: normal;'
    );
    dbConnectionLogged = true;
  } catch (err) {
    console.warn('[DATABASE] Could not fetch DB health info:', err.message);
  }
};

logDatabaseName();

const getHeaders = (customHeaders = {}) => {
  const token = localStorage.getItem('matheat_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders
  };
};

// =============================================================================
// FAST LOCALSTORAGE & MEMORY DATA-CACHE ENGINE (0ms Instant Loading)
// =============================================================================
const MEMORY_CACHE = new Map();
const CACHE_PREFIX = 'matheat_cache_';

const normalizeKey = (endpoint) => {
  if (!endpoint) return '';
  let clean = endpoint.replace(/^\/api/, '');
  if (clean.endsWith('?')) clean = clean.slice(0, -1);
  return clean;
};

export const getCachedData = (endpoint, fallback = null) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const cleanKey = normalizeKey(endpoint);
    if (MEMORY_CACHE.has(cleanKey)) {
      return MEMORY_CACHE.get(cleanKey);
    }
    const raw = localStorage.getItem(`${CACHE_PREFIX}${cleanKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data !== undefined) {
        MEMORY_CACHE.set(cleanKey, parsed.data);
        return parsed.data;
      }
    }
  } catch (err) {
    console.warn(`[CACHE] Read error for ${endpoint}:`, err);
  }
  return fallback;
};

export const setCachedData = (endpoint, data) => {
  if (typeof window === 'undefined' || !data) return;
  try {
    const cleanKey = normalizeKey(endpoint);
    MEMORY_CACHE.set(cleanKey, data);
    localStorage.setItem(
      `${CACHE_PREFIX}${cleanKey}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      try {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith(CACHE_PREFIX)) localStorage.removeItem(k);
        });
      } catch (_) {}
    }
  }
};

export const updateCacheWithEntity = (cacheKey, newEntity, idProp = '_id') => {
  if (!newEntity || typeof window === 'undefined') return;
  const cleanKey = normalizeKey(cacheKey);
  const current = getCachedData(cleanKey);
  if (!current) return;

  const entityId = newEntity[idProp] || newEntity.id || newEntity.batchId || newEntity.jobOrderNumber || newEntity.grnNumber || newEntity.invoiceNumber;

  if (Array.isArray(current)) {
    const exists = entityId ? current.findIndex(item => {
      const itemId = item[idProp] || item.id || item.batchId || item.jobOrderNumber || item.grnNumber || item.invoiceNumber;
      return itemId && itemId === entityId;
    }) : -1;

    let updated;
    if (exists >= 0) {
      updated = [...current];
      updated[exists] = { ...updated[exists], ...newEntity };
    } else {
      updated = [newEntity, ...current];
    }
    setCachedData(cleanKey, updated);
  } else if (typeof current === 'object') {
    const keysToCheck = ['batches', 'jobOrders', 'grns', 'invoices', 'dispatches', 'recipes', 'furnaces', 'entries', 'customers', 'parts', 'suppliers', 'data'];
    for (const key of keysToCheck) {
      if (Array.isArray(current[key])) {
        const exists = entityId ? current[key].findIndex(item => {
          const itemId = item[idProp] || item.id || item.batchId || item.jobOrderNumber || item.grnNumber || item.invoiceNumber;
          return itemId && itemId === entityId;
        }) : -1;

        let updatedList;
        if (exists >= 0) {
          updatedList = [...current[key]];
          updatedList[exists] = { ...updatedList[exists], ...newEntity };
        } else {
          updatedList = [newEntity, ...current[key]];
        }
        setCachedData(cleanKey, {
          ...current,
          [key]: updatedList,
          count: updatedList.length
        });
        break;
      }
    }
  }
};

export const clearCache = (pattern = '') => {
  if (typeof window === 'undefined') return;
  try {
    if (!pattern) {
      MEMORY_CACHE.clear();
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return;
    }

    const cleanPattern = normalizeKey(pattern);
    Array.from(MEMORY_CACHE.keys()).forEach((key) => {
      if (key.includes(cleanPattern)) {
        MEMORY_CACHE.delete(key);
      }
    });

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(CACHE_PREFIX) && key.includes(cleanPattern)) {
        localStorage.removeItem(key);
      }
    });
  } catch (err) {
    console.warn(`[CACHE] Clear error for pattern ${pattern}:`, err);
  }
};

// Global Prewarm Engine: Fetches all core ERP endpoints in parallel and stores in localStorage
export const prewarmAllCaches = async () => {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('matheat_token');
  if (!token) return;

  const coreEndpoints = [
    '/batches',
    '/job-orders',
    '/job-cards',
    '/grn',
    '/commercial/invoices',
    '/commercial/dispatch',
    '/commercial/costing',
    '/sales/enquiries',
    '/sales/quotations',
    '/payments',
    '/qc',
    '/instruments',
    '/rework',
    '/furnaces',
    '/customers',
    '/recipes',
    '/inventory',
    '/masters/parts',
    '/masters/processes',
    '/masters/suppliers',
    '/maintenance/calibration',
    '/ncr',
    '/dropdowns',
    '/gate/entries',
    '/notifications'
  ];

  try {
    await Promise.allSettled(coreEndpoints.map((ep) => request('GET', ep)));
    window.dispatchEvent(new CustomEvent('matheat_data_invalidated', { detail: { type: 'prewarm_complete' } }));
  } catch (e) {
    // Non-blocking prewarm
  }
};

// Run background pre-warm on initial script load if already logged in
if (typeof window !== 'undefined' && localStorage.getItem('matheat_token')) {
  setTimeout(() => prewarmAllCaches(), 200);
}

export const request = async (method, endpoint, data = null, customHeaders = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_ROOT}${endpoint}`;
  const upperMethod = method.toUpperCase();

  const options = {
    method: upperMethod,
    headers: getHeaders(customHeaders)
  };

  if (data && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
    options.body = typeof data === 'string' ? data : JSON.stringify(data);
  }

  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const errorMsg = errorBody.message || `Request failed with status ${res.status}`;

      // Automatic Logout on 401 Unauthorized (Expired or invalid token)
      if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/verify-admin-password')) {
        console.warn(`🔒 [AUTH] Token expired or unauthorized (${errorMsg}). Performing automatic logout...`);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('matheat_token');
          localStorage.removeItem('matheat_user');
          clearCache();
          window.dispatchEvent(new CustomEvent('matheat_token_expired', {
            detail: { message: errorMsg }
          }));
        }
      }

      console.error(
        `%c❌ [API ERROR ${res.status}]: ${upperMethod} ${endpoint}`,
        'background: #450a0a; color: #f87171; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        errorBody
      );
      throw new Error(errorMsg);
    }

    const contentType = res.headers.get('content-type');
    let result = null;
    if (contentType && contentType.includes('application/json')) {
      result = await res.json();
    } else {
      result = await res.text();
    }

    // Auto-cache successful GET responses
    if (upperMethod === 'GET' && result) {
      setCachedData(endpoint, result);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('matheat_cache_updated', {
            detail: { endpoint, data: result }
          })
        );
      }
    }

    // SWR Engine on Mutations: NEVER wipe cache! Immediately upsert entity and revalidate in background
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(upperMethod)) {
      const entity = result?.batch || result?.jobOrder || result?.grn || result?.invoice || result?.dispatch || result?.inspection || result?.furnace || result?.recipe || result?.customer || result?.entry || (result?.success && result?.data && !Array.isArray(result.data) ? result.data : null);

      if (entity) {
        if (endpoint.includes('batch')) updateCacheWithEntity('/batches', entity);
        else if (endpoint.includes('job-order')) updateCacheWithEntity('/job-orders', entity);
        else if (endpoint.includes('grn')) updateCacheWithEntity('/grn', entity);
        else if (endpoint.includes('invoices')) updateCacheWithEntity('/commercial/invoices', entity);
        else if (endpoint.includes('dispatch')) updateCacheWithEntity('/commercial/dispatch', entity);
        else if (endpoint.includes('qc')) updateCacheWithEntity('/qc', entity);
        else if (endpoint.includes('furnaces')) updateCacheWithEntity('/furnaces', entity);
        else if (endpoint.includes('recipes')) updateCacheWithEntity('/recipes', entity);
        else if (endpoint.includes('customers')) updateCacheWithEntity('/customers', entity);
        else if (endpoint.includes('gate')) updateCacheWithEntity('/gate/entries', entity);
      }

      // Revalidate affected endpoints in background to sync server truth into cache
      const revalidateEndpoints = [];
      if (endpoint.includes('batch')) revalidateEndpoints.push('/batches', '/commercial/costing', '/dashboard', '/qc');
      else if (endpoint.includes('job-order')) revalidateEndpoints.push('/job-orders', '/batches', '/dashboard');
      else if (endpoint.includes('grn')) revalidateEndpoints.push('/grn', '/inventory', '/batches', '/job-orders');
      else if (endpoint.includes('commercial')) revalidateEndpoints.push('/commercial/invoices', '/commercial/dispatch', '/commercial/costing', '/dashboard');
      else if (endpoint.includes('qc')) revalidateEndpoints.push('/qc', '/batches', '/dashboard');
      else if (endpoint.includes('furnace')) revalidateEndpoints.push('/furnaces', '/batches');
      else if (endpoint.includes('recipe')) revalidateEndpoints.push('/recipes', '/batches');
      else if (endpoint.includes('customer')) revalidateEndpoints.push('/customers');
      else if (endpoint.includes('inventory')) revalidateEndpoints.push('/inventory');

      // Silently fetch & update cache in background
      revalidateEndpoints.forEach((ep) => {
        request('GET', ep).catch(() => {});
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('matheat_data_invalidated', {
            detail: { endpoint, method: upperMethod, timestamp: Date.now() }
          })
        );
      }
    }

    return result;
  } catch (err) {
    console.error(
      `%c❌ [API FAILURE]: ${upperMethod} ${endpoint}`,
      'background: #450a0a; color: #f87171; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      err.message
    );
    throw err;
  }
};

// =============================================================================
// DOMAIN-SPECIFIC API SERVICES
// =============================================================================

// 1. Authentication & User Management
export const authApi = {
  login: (credentials) => request('POST', '/auth/login', credentials),
  me: () => request('GET', '/auth/me'),
  changePassword: (data) => request('POST', '/auth/change-password', data),
  getUsers: () => request('GET', '/auth/users'),
  createUser: (userData) => request('POST', '/auth/users', userData),
  updateUser: (id, userData) => request('PUT', `/auth/users/${id}`, userData),
  resetUserPassword: (id, data) => request('POST', `/auth/users/${id}/reset-password`, data),
  deleteUser: (id) => request('DELETE', `/auth/users/${id}`),
  verifyAdminPassword: (data) => request('POST', '/auth/verify-admin-password', data)
};

// Alias for User Management
export const usersApi = {
  getAll: () => request('GET', '/auth/users'),
  create: (userData) => request('POST', '/auth/users', userData),
  update: (id, userData) => request('PUT', `/auth/users/${id}`, userData),
  delete: (id) => request('DELETE', `/auth/users/${id}`)
};

// 2. Job Work Orders
export const jobOrdersApi = {
  getAll: () => request('GET', '/job-orders'),
  getById: (id) => request('GET', `/job-orders/${id}`),
  getNextJobOrderNumber: () => request('GET', '/job-orders/next-number'),
  create: (data) => request('POST', '/job-orders', data),
  update: (id, data) => request('PUT', `/job-orders/${id}`, data),
  delete: (id) => request('DELETE', `/job-orders/${id}`)
};

// 3. Maintenance & Instrument Calibration
export const maintenanceApi = {
  getCalibrations: () => request('GET', '/maintenance/calibration'),
  createCalibration: (data) => request('POST', '/maintenance/calibration', data),
  deleteCalibration: (id) => request('DELETE', `/maintenance/calibration/${id}`),
  getLogs: () => request('GET', '/maintenance/maintenance'),
  createLog: (data) => request('POST', '/maintenance/maintenance', data)
};

// 4. Furnaces Management
export const furnacesApi = {
  getAll: () => request('GET', '/furnaces'),
  getById: (id) => request('GET', `/furnaces/${id}`),
  create: (data) => request('POST', '/furnaces', data),
  update: (id, data) => request('PUT', `/furnaces/${id}`, data),
  delete: (id) => request('DELETE', `/furnaces/${id}`)
};

// 5. Customers Management & GST
export const customersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.type) query.append('type', params.type);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request('GET', `/customers${qs}`);
  },
  getById: (id) => request('GET', `/customers/${id}`),
  create: (data) => request('POST', '/customers', data),
  update: (id, data) => request('PUT', `/customers/${id}`, data),
  delete: (id) => request('DELETE', `/customers/${id}`)
};

export const gstApi = {
  lookup: (gstin) => request('GET', `/gst/lookup/${encodeURIComponent(gstin)}`)
};

// 6. Gate & Weighbridge Terminal
export const gateApi = {
  getEntries: () => request('GET', '/gate/entries'),
  createEntry: (data) => request('POST', '/gate/entry', data),
  clearAll: () => request('DELETE', '/gate/clear-all')
};

// 7. Material Inward (GRN)
export const grnApi = {
  getAll: () => request('GET', '/grn'),
  getNextGrnNumber: () => request('GET', '/grn/next-number'),
  create: (data) => request('POST', '/grn', data),
  delete: (id) => request('DELETE', `/grn/${id}`)
};

// 8. Batches & Furnace Loading
export const batchesApi = {
  getAll: () => request('GET', '/batches'),
  getById: (id) => request('GET', `/batches/${id}`),
  getNextBatchNumber: () => request('GET', '/batches/next-number'),
  getNextHeatNumber: () => request('GET', '/batches/next-heat-number'),
  create: (data) => request('POST', '/batches', data),
  loadFurnace: (id) => request('POST', `/batches/${id}/load-furnace`),
  startCycle: (id) => request('POST', `/batches/${id}/start-cycle`),
  recordCycle: (id, data) => request('POST', `/batches/${id}/record-cycle`, data),
  update: (id, data) => request('PUT', `/batches/${id}`, data),
  delete: (id) => request('DELETE', `/batches/${id}`)
};

// 9. QC Lab & Metallurgical Inspection
export const qcApi = {
  getAll: () => request('GET', '/qc'),
  getByBatchId: (batchId) => request('GET', `/qc/batch/${batchId}`),
  create: (data) => request('POST', '/qc', data),
  approve: (id) => request('POST', `/qc/${id}/approve`)
};

// 10. Recipe Studio
export const recipesApi = {
  getAll: () => request('GET', '/recipes'),
  create: (data) => request('POST', '/recipes', data),
  approve: (id) => request('POST', `/recipes/${id}/approve`),
  delete: (id) => request('DELETE', `/recipes/${id}`)
};

// 11. Inventory & Traceability
export const inventoryApi = {
  getAll: () => request('GET', '/inventory'),
  getTransactions: () => request('GET', '/inventory/transactions')
};

export const traceabilityApi = {
  search: (query) => request('GET', `/traceability/search?q=${encodeURIComponent(query)}`)
};

// 12. Commercial, Dispatch & Invoicing
export const commercialApi = {
  getInvoices: (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request('GET', `/commercial/invoices${query}`);
  },
  getInvoiceById: (id) => request('GET', `/commercial/invoices/${id}`),
  getNextInvoiceNumber: () => request('GET', '/commercial/invoices/next-number'),
  createInvoice: (data) => request('POST', '/commercial/invoices', data),
  updateInvoice: (id, data) => request('PUT', `/commercial/invoices/${id}`, data),
  deleteInvoice: (id) => request('DELETE', `/commercial/invoices/${id}`),
  getDispatches: () => request('GET', '/commercial/dispatch'),
  createDispatch: (data) => request('POST', '/commercial/dispatch', data),
  getCosting: () => request('GET', '/commercial/costing')
};

// 13. NCR Management
export const ncrApi = {
  getAll: () => request('GET', '/ncr'),
  disposition: (id, data) => request('POST', `/ncr/${id}/disposition`, data),
  delete: (id) => request('DELETE', `/ncr/${id}`)
};

// 14. Document Services
export const documentsApi = {
  getCertificateUrl: (batchId) => `${API_BASE_URL}/api/documents/certificate/${batchId}`,
  getInvoiceUrl: (fileName) => `${API_BASE_URL}/api/documents/invoice/${fileName}`
};

// 15. Purchase & Suppliers
export const purchaseApi = {
  getOrders: () => request('GET', '/purchase/orders'),
  createOrder: (data) => request('POST', '/purchase/orders', data),
  updateOrderStatus: (id, status) => request('PATCH', `/purchase/orders/${id}/status`, { status }),
  deleteOrder: (id) => request('DELETE', `/purchase/orders/${id}`)
};

export const suppliersApi = {
  getAll: () => request('GET', '/masters/suppliers'),
  create: (data) => request('POST', '/masters/suppliers', data),
  delete: (id) => request('DELETE', `/masters/suppliers/${id}`)
};

// 16. Services & Process Rates
export const servicesApi = {
  getAll: () => request('GET', '/masters/processes'),
  create: (data) => request('POST', '/masters/processes', data),
  update: (id, data) => request('PUT', `/masters/processes/${id}`, data),
  delete: (id) => request('DELETE', `/masters/processes/${id}`)
};

// 16.1 Parts Master
export const partsApi = {
  getAll: () => request('GET', '/masters/parts'),
  getById: (id) => request('GET', `/masters/parts/${id}`),
  create: (data) => request('POST', '/masters/parts', data),
  update: (id, data) => request('PUT', `/masters/parts/${id}`, data),
  delete: (id) => request('DELETE', `/masters/parts/${id}`)
};

// 17. Master Database Dropdowns (Dynamic Central Registry)
export const dropdownsApi = {
  getAll: () => request('GET', '/dropdowns'),
  getByKey: (key) => request('GET', `/dropdowns/${encodeURIComponent(String(key).toLowerCase().trim())}`),
};
// 18. Sales Pipeline: Enquiries & Quotations
export const salesApi = {
  getEnquiries: () => request('GET', '/sales/enquiries'),
  getNextEnquiryNumber: () => request('GET', '/sales/enquiries/next-number'),
  createEnquiry: (data) => request('POST', '/sales/enquiries', data),
  updateEnquiry: (id, data) => request('PUT', `/sales/enquiries/${id}`, data),
  deleteEnquiry: (id) => request('DELETE', `/sales/enquiries/${id}`),

  getQuotations: () => request('GET', '/sales/quotations'),
  getNextQuotationNumber: () => request('GET', '/sales/quotations/next-number'),
  createQuotation: (data) => request('POST', '/sales/quotations', data),
  updateQuotation: (id, data) => request('PUT', `/sales/quotations/${id}`, data),
  convertToJobOrder: (id) => request('POST', `/sales/quotations/${id}/convert-job-order`),
  deleteQuotation: (id) => request('DELETE', `/sales/quotations/${id}`)
};

// 19. Payments & Receivables
export const paymentApi = {
  getPayments: () => request('GET', '/payments'),
  getNextPaymentNumber: () => request('GET', '/payments/next-number'),
  getSummary: () => request('GET', '/payments/summary'),
  recordPayment: (data) => request('POST', '/payments', data),
  deletePayment: (id) => request('DELETE', `/payments/${id}`)
};

// 20. QC Instruments & NABL Calibration
export const instrumentsApi = {
  getAll: () => request('GET', '/instruments'),
  create: (data) => request('POST', '/instruments', data),
  update: (id, data) => request('PUT', `/instruments/${id}`, data),
  delete: (id) => request('DELETE', `/instruments/${id}`)
};

// 21. Re-treatment & Rework Records
export const reworkApi = {
  getAll: () => request('GET', '/rework'),
  getNextReworkNumber: () => request('GET', '/rework/next-number'),
  create: (data) => request('POST', '/rework', data),
  updateStatus: (id, data) => request('PATCH', `/rework/${id}/status`, data)
};

// 22. Job Cards with QR Code Traceability
export const jobCardsApi = {
  getAll: () => request('GET', '/job-cards'),
  getNextJobCardNumber: () => request('GET', '/job-cards/next-number'),
  getById: (id) => request('GET', `/job-cards/${id}`),
  create: (data) => request('POST', '/job-cards', data)
};

// 23. Real-time Notifications & Industrial Alerts
export const notificationsApi = {
  getAll: () => request('GET', '/notifications'),
  create: (data) => request('POST', '/notifications', data),
  markAllRead: () => request('POST', '/notifications/mark-read')
};

// =============================================================================
// UNIFIED MASTER API OBJECT EXPORT
// =============================================================================
export const api = {
  get: (endpoint, headers) => request('GET', endpoint, null, headers),
  post: (endpoint, data, headers) => request('POST', endpoint, data, headers),
  put: (endpoint, data, headers) => request('PUT', endpoint, data, headers),
  delete: (endpoint, headers) => request('DELETE', endpoint, null, headers),

  cache: {
    get: getCachedData,
    set: setCachedData,
    clear: clearCache
  },
  auth: authApi,
  users: usersApi,
  jobOrders: jobOrdersApi,
  jobCards: jobCardsApi,
  sales: salesApi,
  maintenance: maintenanceApi,
  furnaces: furnacesApi,
  customers: customersApi,
  gst: gstApi,
  gate: gateApi,
  grn: grnApi,
  batches: batchesApi,
  qc: qcApi,
  recipes: recipesApi,
  inventory: inventoryApi,
  commercial: commercialApi,
  payments: paymentApi,
  instruments: instrumentsApi,
  rework: reworkApi,
  ncr: ncrApi,
  traceability: traceabilityApi,
  documents: documentsApi,
  purchase: purchaseApi,
  suppliers: suppliersApi,
  services: servicesApi,
  parts: partsApi,
  dropdowns: dropdownsApi,
  notifications: notificationsApi
};

export default api;

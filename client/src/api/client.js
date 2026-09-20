/**
 * Centralized API Client for MATHEAT Heat Treatment ERP + MES
 * All frontend API calls are routed through this single module.
 * Logs every API call and connected database name to the browser console.
 */

export const API_BASE_URL = 'http://localhost:7000';
export const API_ROOT = `${API_BASE_URL}/api`;

let dbConnectionLogged = false;

// Display connected database name in browser console
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

// Automatically verify and show DB Name on client initialization
logDatabaseName();

const getHeaders = (customHeaders = {}) => {
  const token = localStorage.getItem('matheat_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders
  };
};

// Generic Request Handler with rich console logging
const request = async (method, endpoint, data = null, customHeaders = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_ROOT}${endpoint}`;

  // Log every API call in console
  console.log(
    `%c📡 [API CALL]: ${method.toUpperCase()} ${endpoint}`,
    'background: #1e1b4b; color: #818cf8; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    data ? { payload: data } : ''
  );

  const options = {
    method: method.toUpperCase(),
    headers: getHeaders(customHeaders)
  };

  if (data && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
    options.body = typeof data === 'string' ? data : JSON.stringify(data);
  }

  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const errorMsg = errorBody.message || `Request failed with HTTP status ${res.status}`;
      console.error(
        `%c❌ [API ERROR ${res.status}]: ${method.toUpperCase()} ${endpoint}`,
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

    // Log successful response in console
    console.log(
      `%c✅ [API SUCCESS (${res.status})]: ${method.toUpperCase()} ${endpoint}`,
      'background: #064e3b; color: #34d399; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      result
    );

    return result;
  } catch (err) {
    console.error(
      `%c❌ [API NETWORK/CLIENT ERROR]: ${method.toUpperCase()} ${endpoint}`,
      'background: #450a0a; color: #f87171; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      err.message
    );
    throw err;
  }
};

// =============================================================================
// CENTRALIZED API SERVICE EXPORT
// =============================================================================
export const api = {
  // Generic methods
  get: (endpoint, headers) => request('GET', endpoint, null, headers),
  post: (endpoint, data, headers) => request('POST', endpoint, data, headers),
  put: (endpoint, data, headers) => request('PUT', endpoint, data, headers),
  delete: (endpoint, headers) => request('DELETE', endpoint, null, headers),

  // Database Info
  getDbHealth: () => request('GET', '/health'),
  logDbName: logDatabaseName,

  // 1. Gate & Weighbridge Terminal APIs
  gate: {
    getEntries: () => request('GET', '/gate/entries'),
    createEntry: (entryData) => request('POST', '/gate/entry', entryData),
    clearAll: () => request('DELETE', '/gate/clear-all')
  },

  // 2. Authentication APIs
  auth: {
    login: (credentials) => request('POST', '/auth/login', credentials),
    me: () => request('GET', '/auth/me')
  },

  // 3. Document & Invoice APIs
  documents: {
    getInvoice: (fileName) => request('GET', `/documents/invoice/${fileName}`),
    getInvoiceUrl: (fileName) => `${API_BASE_URL}/api/documents/invoice/${fileName}`,
    getCertificateUrl: (batchId) => `${API_BASE_URL}/api/documents/certificate/${batchId}`
  },

  // 4. Operational Modules
  masters: {
    getAll: () => request('GET', '/masters')
  },
  grn: {
    getAll: () => request('GET', '/grn'),
    create: (data) => request('POST', '/grn', data)
  },
  batches: {
    getAll: () => request('GET', '/batches'),
    getById: (id) => request('GET', `/batches/${id}`)
  },
  commercial: {
    getInvoices: () => request('GET', '/commercial/invoices'),
    createInvoice: (data) => request('POST', '/commercial/invoices', data)
  }
};

export default api;

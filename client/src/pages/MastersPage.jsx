import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Cpu,
  Flame,
  Layers,
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  UserPlus,
  AlertCircle,
  UserCheck,
  Key,
  Shield,
  X,
  Lock
} from 'lucide-react';
import api from '../api/client';
import { CustomerFormModal } from '../components/CustomerFormModal';
import { useTheme } from '../context/ThemeContext';
import CreatableSelect from '../components/CreatableSelect';

export const MastersPage = () => {
  const { isLight } = useTheme();
  const [activeTab, setActiveTab] = useState('customers');

  // Customer Management States
  const [customers, setCustomers] = useState(() => {
    const cached = api.cache.get('/customers');
    return Array.isArray(cached) ? cached : (cached?.data || cached?.customers || []);
  });
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // User Management States
  const [users, setUsers] = useState(() => {
    const cached = api.cache.get('/auth/users');
    return Array.isArray(cached) ? cached : (cached?.users || []);
  });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userErrorMsg, setUserErrorMsg] = useState('');
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    badgeNumber: ''
  });

  // Part master dataset
  const [parts, setParts] = useState(() => {
    const cached = api.cache.get('/masters/parts');
    return Array.isArray(cached) ? cached : (cached?.parts || cached?.data || []);
  });
  const [loadingParts, setLoadingParts] = useState(false);
  const [partSearch, setPartSearch] = useState('');
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [partSubmitting, setPartSubmitting] = useState(false);
  const [partErrorMsg, setPartErrorMsg] = useState('');
  const [partFormData, setPartFormData] = useState({
    partNumber: '',
    partName: '',
    customer: '',
    drawingNumber: '',
    revision: 'R0',
    materialGrade: '20MnCr5',
    standard: 'IS 5517',
    componentType: 'Gear',
    weightPerPiece: '',
    requiredProcess: 'Carburizing + Hardening + Tempering',
    hardnessMin: 58,
    hardnessMax: 62,
    caseDepthMin: 0.8,
    caseDepthMax: 1.1,
    criticalDimensions: '',
    specialInstructions: '',
    drawingUrl: ''
  });

  const handleOpenAddPart = () => {
    setPartFormData({
      partNumber: '',
      partName: '',
      customer: customers[0]?._id || '',
      drawingNumber: '',
      revision: 'R0',
      materialGrade: '20MnCr5',
      standard: 'IS 5517',
      componentType: 'Gear',
      weightPerPiece: '',
      requiredProcess: 'Carburizing + Hardening + Tempering',
      hardnessMin: 58,
      hardnessMax: 62,
      caseDepthMin: 0.8,
      caseDepthMax: 1.1,
      criticalDimensions: '',
      specialInstructions: '',
      drawingUrl: ''
    });
    setPartErrorMsg('');
    setIsPartModalOpen(true);
  };

  const handleCreatePart = async (e) => {
    e.preventDefault();
    setPartSubmitting(true);
    setPartErrorMsg('');
    try {
      if (!partFormData.partNumber || !partFormData.partName || !partFormData.weightPerPiece) {
        throw new Error('Part Number, Part Name, and Weight per Piece are required.');
      }
      const payload = {
        partNumber: partFormData.partNumber.toUpperCase().trim(),
        partName: partFormData.partName.trim(),
        customer: partFormData.customer || undefined,
        drawingNumber: partFormData.drawingNumber.trim() || `DWG-${partFormData.partNumber}`,
        revision: partFormData.revision || 'R0',
        materialGrade: partFormData.materialGrade,
        standard: partFormData.standard,
        componentType: partFormData.componentType,
        weightPerPiece: parseFloat(partFormData.weightPerPiece),
        requiredProcess: partFormData.requiredProcess,
        hardnessSpec: {
          scale: 'HRC',
          min: parseFloat(partFormData.hardnessMin),
          max: parseFloat(partFormData.hardnessMax)
        },
        caseDepthSpec: {
          required: Boolean(partFormData.caseDepthMin),
          effectiveMin: parseFloat(partFormData.caseDepthMin) || 0,
          effectiveMax: parseFloat(partFormData.caseDepthMax) || 0
        },
        criticalDimensions: partFormData.criticalDimensions,
        specialInstructions: partFormData.specialInstructions,
        attachments: partFormData.drawingUrl ? [{
          name: `Drawing-${partFormData.drawingNumber || partFormData.partNumber}`,
          fileUrl: partFormData.drawingUrl,
          fileType: 'Drawing/PDF',
          uploadedAt: new Date()
        }] : []
      };
      await api.parts.create(payload);
      setIsPartModalOpen(false);
      fetchParts();
    } catch (err) {
      setPartErrorMsg(err.message || 'Failed to save part specification.');
    } finally {
      setPartSubmitting(false);
    }
  };

  // Fetch Users from API
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.users.getAll().catch(() => ({ users: [] }));
      const list = Array.isArray(res) ? res : (res?.users || []);
      setUsers(list);
    } catch (err) {
      console.warn('[MASTERS] User load error:', err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Customers from backend MongoDB Atlas
  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const res = await api.customers.getAll({
        search: customerSearch,
        type: customerTypeFilter
      });
      if (res && res.success && res.data) {
        setCustomers(res.data);
      } else if (Array.isArray(res)) {
        setCustomers(res);
      }
    } catch (err) {
      console.error('Error loading customers from API:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchParts = async () => {
    try {
      const res = await api.parts.getAll().catch(() => ({ parts: [] }));
      const list = Array.isArray(res) ? res : (res?.parts || res?.data || []);
      setParts(list);
    } catch (err) {
      console.warn('[MASTERS] Parts load error:', err.message);
    }
  };

  const handleDeletePart = async (id, partNumber) => {
    if (window.confirm(`Are you sure you want to delete Part "${partNumber}" from master registry?`)) {
      try {
        await api.parts.delete(id);
        fetchParts();
      } catch (err) {
        alert(`Failed to delete part: ${err.message}`);
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'customers') {
      fetchCustomers();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'parts') {
      fetchParts();
    }

    const handleSync = () => {
      if (activeTab === 'customers') fetchCustomers();
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'parts') fetchParts();
    };

    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [activeTab, customerTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  const handleDeleteCustomer = async (id, companyName) => {
    if (window.confirm(`Are you sure you want to remove customer "${companyName}"? This will delete the customer master from the database.`)) {
      try {
        await api.customers.delete(id);
        fetchCustomers();
      } catch (err) {
        alert(`Failed to delete customer: ${err.message}`);
      }
    }
  };

  const handleOpenAddUser = () => {
    setUserFormData({
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      role: '',
      badgeNumber: ''
    });
    setUserErrorMsg('');
    setIsUserModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserSubmitting(true);
    setUserErrorMsg('');
    try {
      if (!userFormData.username || !userFormData.password) {
        throw new Error('Username and Password are required');
      }
      await api.users.create(userFormData);
      setIsUserModalOpen(false);
      fetchUsers();
    } catch (err) {
      setUserErrorMsg(err.message || 'Failed to create user');
    } finally {
      setUserSubmitting(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      try {
        await api.users.delete(id);
        fetchUsers();
      } catch (err) {
        alert(`Failed to delete user: ${err.message}`);
      }
    }
  };

  return (
    <div className={`space-y-5 font-sans transition-colors duration-200 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
      {/* 1. TOP HEADER BANNER */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border shadow-sm ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div>
          <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            MASTER DATA &amp; CLIENT ENTITY MANAGEMENT
          </h1>
          <p className={`text-xs font-semibold mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Enterprise Client Registry with GSTIN Verification, Multi-Node Logistics Addresses, and Part Drawings
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={`flex items-center p-1 rounded-lg border text-xs font-semibold overflow-x-auto max-w-full shrink-0 ${
          isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-orange-600 text-white shadow'
                : isLight
                ? 'text-slate-700 hover:text-orange-600'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-orange-600 text-white shadow'
                : isLight
                ? 'text-slate-700 hover:text-orange-600'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Staff &amp; Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('parts')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'parts'
                ? 'bg-orange-600 text-white shadow'
                : isLight
                ? 'text-slate-700 hover:text-orange-600'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Part Master ({parts.length})
          </button>
        </div>
      </div>

      {/* 2. CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search by Company, GSTIN, State, Code..."
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow"
              >
                Search
              </button>
            </form>

            {/* Classification Filter Pills & Add Button */}
            <div className="flex flex-wrap items-center gap-2">
              <div className={`flex p-0.5 rounded-lg border text-[11px] font-semibold ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
              }`}>
                {['all', 'regular', 'job_work', 'scrap_buyer'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setCustomerTypeFilter(t)}
                    className={`px-2.5 py-1 rounded capitalize cursor-pointer transition-all ${
                      customerTypeFilter === t
                        ? 'bg-orange-600 text-white shadow'
                        : isLight
                        ? 'text-slate-700 hover:text-orange-600'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchCustomers}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200' : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Refresh Customer List"
              >
                <RefreshCw className={`h-4 w-4 ${loadingCustomers ? 'animate-spin text-orange-600' : ''}`} />
              </button>

              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-all"
              >
                <UserPlus className="h-4 w-4" />
                <span>+ Authorize New Customer</span>
              </button>
            </div>
          </div>

          {/* Customer Table */}
          <div className={`rounded-xl border overflow-hidden shadow-sm ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`text-[10px] uppercase font-bold tracking-wider border-b ${
                    isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    <th className="p-3">Customer UID</th>
                    <th className="p-3">Registered Business Entity</th>
                    <th className="p-3">GSTIN Master</th>
                    <th className="p-3">Fiscal State / Location</th>
                    <th className="p-3">Primary Contact</th>
                    <th className="p-3">Commercial Terms</th>
                    <th className="p-3 text-right">Credit Limit</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800 text-slate-200'
                }`}>
                  {loadingCustomers ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                        Loading customers from MongoDB database...
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-500">
                        <Building2 className="h-10 w-10 mx-auto mb-2 text-slate-400 opacity-60" />
                        <div className="font-bold text-slate-800 dark:text-slate-200">No customers found in database.</div>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                          Click "+ Authorize New Customer" to register your first client using instant GSTIN lookup.
                        </p>
                        <button
                          onClick={handleOpenAdd}
                          className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          <UserPlus className="h-4 w-4" /> Add Customer via GST
                        </button>
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr
                        key={c._id || c.customerCode}
                        className={`transition-colors ${
                          isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Customer Code */}
                        <td className="p-3 font-mono font-bold text-orange-600">
                          <div>{c.customerCode || 'CUST-000'}</div>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono uppercase ${
                            c.customerType === 'job_work'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : c.customerType === 'scrap_buyer'
                              ? 'bg-slate-200 text-slate-900 border-slate-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}>
                            {c.customerType || 'REGULAR'}
                          </span>
                        </td>

                        {/* Company Name */}
                        <td className="p-3">
                          <div className="font-bold text-sm text-slate-900 dark:text-white">{c.companyName}</div>
                          {c.tradeName && c.tradeName !== c.companyName && (
                            <div className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]" title={c.tradeName}>
                              Trade: {c.tradeName}
                            </div>
                          )}
                          {c.addresses && c.addresses.length > 0 && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" />
                              {c.addresses.length} Branch / Warehouse Nodes
                            </span>
                          )}
                        </td>

                        {/* GSTIN */}
                        <td className="p-3 font-mono">
                          {c.gstin ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-blue-700 dark:text-blue-400">{c.gstin}</span>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" title="GSTIN Verified" />
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Unregistered</span>
                          )}
                          {c.pan && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              PAN: {c.pan}
                            </div>
                          )}
                        </td>

                        {/* State & City */}
                        <td className="p-3 font-mono">
                          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            {c.stateCode && (
                              <span className="bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 text-[10px] px-1.5 py-0.5 rounded font-mono font-black border border-orange-300 dark:border-orange-800">
                                {c.stateCode}
                              </span>
                            )}
                            <span>{c.state || c.billingAddress?.state || 'N/A'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[180px]" title={c.address || c.billingAddress?.street}>
                            {c.city ? `${c.city} - ` : ''}{c.address || c.billingAddress?.street || 'Plant Location'}
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="p-3">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{c.name || (c.contacts && c.contacts[0]?.name) || 'Official Rep'}</div>
                          {(c.phone || (c.contacts && c.contacts[0]?.phone)) && (
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <Phone className="h-2.5 w-2.5" />
                              {c.phone || c.contacts[0]?.phone}
                            </div>
                          )}
                          {(c.email || (c.contacts && c.contacts[0]?.email)) && (
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <Mail className="h-2.5 w-2.5" />
                              {c.email || c.contacts[0]?.email}
                            </div>
                          )}
                        </td>

                        {/* Terms */}
                        <td className="p-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {c.paymentTerms || '30 Days Net'}
                        </td>

                        {/* Credit */}
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-right font-bold">
                          ₹ {(c.creditLimit || 500000).toLocaleString('en-IN')}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isLight
                                  ? 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300'
                                  : 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
                              }`}
                              title="Edit Customer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(c._id, c.companyName)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isLight
                                  ? 'bg-slate-100 hover:bg-rose-100 text-rose-700 border-slate-300'
                                  : 'bg-slate-800 hover:bg-rose-950 text-rose-400 border-slate-700'
                              }`}
                              title="Delete Customer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2.5. STAFF & USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                Staff Access &amp; Operational Roles Registry
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Configure operators, metallurgists, and supervisors with role-based access control.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchUsers}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200' : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Refresh Users"
              >
                <RefreshCw className={`h-4 w-4 ${loadingUsers ? 'animate-spin text-orange-600' : ''}`} />
              </button>
              <button
                onClick={handleOpenAddUser}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-all"
              >
                <UserPlus className="h-4 w-4" />
                <span>+ Register New User</span>
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className={`rounded-xl border overflow-hidden shadow-sm ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            {loadingUsers ? (
              <div className="p-12 text-center text-slate-500">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-orange-600" />
                <div className="font-semibold text-xs">Loading staff accounts...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Users className="h-10 w-10 mx-auto mb-2 text-slate-400 opacity-60" />
                <div className="font-bold text-slate-800 dark:text-slate-200">No Staff Users Registered</div>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click "+ Register New User" above to create furnace operators, metallurgists, or plant supervisors.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`text-[10px] uppercase font-bold tracking-wider border-b ${
                      isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}>
                      <th className="p-3">Staff Member</th>
                      <th className="p-3">Role &amp; Permission</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Badge / ID</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800 text-slate-200'
                  }`}>
                    {users.map((u) => {
                      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username;
                      return (
                        <tr key={u._id || u.username} className={`transition-colors ${
                          isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                        }`}>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-950 border border-orange-300 dark:border-orange-800 flex items-center justify-center font-bold text-orange-600 text-xs">
                                {fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  {fullName}
                                  {u.isActive === false && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 font-semibold">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] font-mono text-slate-500">@{u.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {u.role || 'USER'}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                            {u.department || 'Operations'}
                          </td>
                          <td className="p-3">
                            <div className="text-slate-700 dark:text-slate-300">{u.email || '-'}</div>
                            {u.phone && <div className="text-[10px] text-slate-500 font-mono">{u.phone}</div>}
                          </td>
                          <td className="p-3 font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {u.badgeNumber || u.employeeId || '-'}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteUser(u._id, fullName)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isLight
                                  ? 'bg-slate-100 hover:bg-rose-100 text-rose-700 border-slate-300'
                                  : 'bg-slate-800 hover:bg-rose-950 text-rose-400 border-slate-700'
                              }`}
                              title="Delete User"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. PART MASTER TAB */}
      {activeTab === 'parts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by part #, name, material grade, or customer..."
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border font-medium ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchParts}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200' : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Refresh Parts"
              >
                <RefreshCw className={`h-4 w-4 ${loadingParts ? 'animate-spin text-orange-600' : ''}`} />
              </button>
              <button
                onClick={handleOpenAddPart}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>+ Register Component / Part</span>
              </button>
            </div>
          </div>

          <div className={`rounded-xl border overflow-hidden shadow-sm ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
          {parts.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Layers className="h-10 w-10 mx-auto mb-2 text-slate-400 opacity-60" />
              <div className="font-bold text-slate-800 dark:text-slate-200">No Parts Registered in Part Master</div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Component drawing specifications, material grades, and nominal case depth tolerances will be listed here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`text-[10px] uppercase font-bold tracking-wider border-b ${
                    isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    <th className="p-3">Part Number</th>
                    <th className="p-3">Part Name &amp; Customer</th>
                    <th className="p-3">Grade &amp; Standard</th>
                    <th className="p-3">Drawing &amp; Rev</th>
                    <th className="p-3">Required Process</th>
                    <th className="p-3">Spec Tolerances</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800 text-slate-200'
                }`}>
                  {parts.map((p) => {
                    const custName = p.customer?.companyName || (typeof p.customer === 'string' ? p.customer : 'Standard Client');
                    const gradeVal = p.materialGrade || p.grade || 'EN31';
                    const stdVal = p.standard || 'IS 5517';
                    const dwgVal = p.drawingNumber || p.drawing || 'STD-DWG';
                    const revVal = p.revision || 'R0';
                    const procVal = p.requiredProcess || p.process || 'Heat Treatment';
                    const hardVal = p.hardnessSpec ? `${p.hardnessSpec.min}-${p.hardnessSpec.max} ${p.hardnessSpec.scale || 'HRC'}` : (p.hardness || '58-62 HRC');
                    const cdVal = p.caseDepthSpec?.effectiveMin ? `${p.caseDepthSpec.effectiveMin}-${p.caseDepthSpec.effectiveMax} mm` : (p.caseDepth || 'N/A');

                    return (
                      <tr key={p._id || p.partNumber} className={`transition-colors ${
                        isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                      }`}>
                        <td className="p-3 font-mono font-bold text-orange-600">{p.partNumber}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white">{p.partName || p.partNumber}</div>
                          <span className="text-[10px] text-slate-500 font-mono">{custName}</span>
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-blue-600 font-bold">{gradeVal}</div>
                          <span className="text-[10px] text-slate-400">{stdVal}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-700 dark:text-slate-300">
                          {dwgVal} <span className="text-[10px] text-slate-400">({revVal})</span>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">{procVal}</td>
                        <td className="p-3">
                          <div className="font-mono font-bold text-emerald-600">{hardVal}</div>
                          <span className="text-[10px] text-slate-500 font-mono">ECD: {cdVal}</span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeletePart(p._id, p.partNumber)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                            title="Delete Part"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      )}

      {/* 3.1 REGISTER PART MODAL */}
      {isPartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-600 text-white shadow-sm">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                    Register Component / Part Master
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Define metallurgical specifications, drawing tolerances, and approved processes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPartModalOpen(false)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isLight ? 'border-slate-300 hover:bg-slate-200 text-slate-700' : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePart} className="p-5 overflow-y-auto space-y-4 flex-1">
              {partErrorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{partErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Part Number / Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PRT-GEAR-20MNCR5"
                    value={partFormData.partNumber}
                    onChange={(e) => setPartFormData({ ...partFormData, partNumber: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border uppercase ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Part Name / Description *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Helical Pinion Shaft 14T"
                    value={partFormData.partName}
                    onChange={(e) => setPartFormData({ ...partFormData, partName: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Customer
                  </label>
                  <select
                    value={partFormData.customer}
                    onChange={(e) => setPartFormData({ ...partFormData, customer: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-medium rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  >
                    <option value="">-- Generic / Open --</option>
                    {customers.map((c) => (
                      <option key={c._id || c.customerCode} value={c._id || c.customerCode}>
                        {c.companyName || c.tradeName || c.customerCode}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Drawing Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DWG-7742-B"
                    value={partFormData.drawingNumber}
                    onChange={(e) => setPartFormData({ ...partFormData, drawingNumber: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-mono font-medium rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Drawing Revision
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. R0, R1"
                    value={partFormData.revision}
                    onChange={(e) => setPartFormData({ ...partFormData, revision: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Material Grade *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 20MnCr5, EN31, SAE 8620"
                    value={partFormData.materialGrade}
                    onChange={(e) => setPartFormData({ ...partFormData, materialGrade: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Standard
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IS 5517 / ASTM A29"
                    value={partFormData.standard}
                    onChange={(e) => setPartFormData({ ...partFormData, standard: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-medium rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Component Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gear, Shaft, Pinion"
                    value={partFormData.componentType}
                    onChange={(e) => setPartFormData({ ...partFormData, componentType: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-medium rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Weight per Piece (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="e.g. 1.850"
                    value={partFormData.weightPerPiece}
                    onChange={(e) => setPartFormData({ ...partFormData, weightPerPiece: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Required Heat Treatment Process
                  </label>
                  <select
                    value={partFormData.requiredProcess}
                    onChange={(e) => setPartFormData({ ...partFormData, requiredProcess: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-medium rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  >
                    <option value="Carburizing + Hardening + Tempering">Carburizing + Hardening + Tempering (SQF)</option>
                    <option value="Direct Hardening + Tempering">Direct Hardening + Tempering</option>
                    <option value="Case Hardening">Case Hardening / Carbonitriding</option>
                    <option value="Annealing">Isothermal Annealing</option>
                    <option value="Normalizing">Normalizing</option>
                    <option value="Stress Relieving">Stress Relieving</option>
                    <option value="Induction Hardening">Induction Hardening</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <span className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-orange-600">
                    Required Hardness Spec (HRC)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">Min HRC</span>
                      <input
                        type="number"
                        step="0.5"
                        value={partFormData.hardnessMin}
                        onChange={(e) => setPartFormData({ ...partFormData, hardnessMin: e.target.value })}
                        className={`w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border ${
                          isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                        }`}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">Max HRC</span>
                      <input
                        type="number"
                        step="0.5"
                        value={partFormData.hardnessMax}
                        onChange={(e) => setPartFormData({ ...partFormData, hardnessMax: e.target.value })}
                        className={`w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border ${
                          isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <span className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-blue-600">
                    Required Effective Case Depth (mm)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">Min (mm)</span>
                      <input
                        type="number"
                        step="0.05"
                        value={partFormData.caseDepthMin}
                        onChange={(e) => setPartFormData({ ...partFormData, caseDepthMin: e.target.value })}
                        className={`w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border ${
                          isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                        }`}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">Max (mm)</span>
                      <input
                        type="number"
                        step="0.05"
                        value={partFormData.caseDepthMax}
                        onChange={(e) => setPartFormData({ ...partFormData, caseDepthMax: e.target.value })}
                        className={`w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border ${
                          isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                  Drawing Document / Reference Attachment URL
                </label>
                <input
                  type="text"
                  placeholder="https://... or /uploads/drawings/dwg-7742.pdf"
                  value={partFormData.drawingUrl}
                  onChange={(e) => setPartFormData({ ...partFormData, drawingUrl: e.target.value })}
                  className={`w-full px-3 py-2 text-xs font-medium rounded-lg border ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                  Special Instructions / Quality Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Copper plating on bore before carburizing. Zero decarb permitted."
                  value={partFormData.specialInstructions}
                  onChange={(e) => setPartFormData({ ...partFormData, specialInstructions: e.target.value })}
                  className={`w-full px-3 py-2 text-xs font-medium rounded-lg border ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPartModalOpen(false)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors ${
                    isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={partSubmitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  {partSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving Part...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Save Component Master</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. CUSTOMER ADD / EDIT MODAL */}
      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        initialData={editingCustomer}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={fetchCustomers}
      />

      {/* 5. ADD USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-600 text-white shadow-sm">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                    Register New Enterprise User
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Create operational account with role-based dashboard permissions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateUser} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {userErrorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{userErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. jsmith"
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John"
                    value={userFormData.firstName}
                    onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Smith"
                    value={userFormData.lastName}
                    onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <CreatableSelect
                    dropdownKey="accessRole"
                    label="Access Role"
                    value={userFormData.role}
                    onChange={(val) => setUserFormData({ ...userFormData, role: val })}
                    placeholder="-- Select Access Role --"
                    addPlaceholder="Type custom role..."
                    isLight={isLight}
                    required
                  />
                </div>
                <div>
                  <CreatableSelect
                    dropdownKey="department"
                    label="Department"
                    value={userFormData.department}
                    onChange={(val) => setUserFormData({ ...userFormData, department: val })}
                    placeholder="-- Select Department --"
                    addPlaceholder="Type custom department..."
                    isLight={isLight}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="user@matheat.com"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Employee Badge #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MH-EMP-042"
                    value={userFormData.badgeNumber}
                    onChange={(e) => setUserFormData({ ...userFormData, badgeNumber: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors ${
                    isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userSubmitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  {userSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Save &amp; Grant Access</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MastersPage;

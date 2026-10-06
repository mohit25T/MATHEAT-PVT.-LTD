import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';
import CreatableSelect from '../components/CreatableSelect';
import { PurchaseOrderModal } from '../components/PurchaseOrderModal';
import { CreatePurchaseOrderModal } from '../components/CreatePurchaseOrderModal';
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Printer,
  Building2,
  Package,
  RefreshCw,
  Search,
  Loader2,
  FileText,
  Truck,
  DollarSign,
  Boxes,
  X
} from 'lucide-react';

export const PurchasePage = () => {
  const { isLight } = useTheme();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'suppliers', 'items'

  // Data states
  const [orders, setOrders] = useState(() => {
    const cached = api.cache.get('/purchase/orders');
    return cached?.orders || (Array.isArray(cached) ? cached : []);
  });
  const [suppliers, setSuppliers] = useState(() => {
    const cached = api.cache.get('/masters/suppliers');
    return cached?.suppliers || (Array.isArray(cached) ? cached : []);
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [printPoData, setPrintPoData] = useState(null);

  // Supplier form state for supplier modal
  const [supplierGstLoading, setSupplierGstLoading] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    supplierCode: `SUP-${Math.floor(10 + Math.random() * 90)}`,
    name: '',
    category: '',
    gstin: '',
    phone: '',
    email: '',
    address: { city: '', state: 'Gujarat', stateCode: '24', pincode: '', street: '' }
  });

  // Fetch orders and suppliers
  const fetchData = async () => {
    try {
      const [ordersRes, suppliersRes] = await Promise.all([
        api.purchase.getOrders().catch(() => ({ orders: [] })),
        api.suppliers.getAll().catch(() => ({ suppliers: [] }))
      ]);
      setOrders(ordersRes.orders || []);
      setSuppliers(suppliersRes.suppliers || []);
    } catch (err) {
      console.error('Failed to load purchase data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleSync = () => {
      fetchData();
    };

    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Submit PO
  const handleCreatePo = async (orderData) => {
    try {
      await api.purchase.createOrder(orderData);
      fetchData();
    } catch (err) {
      console.error('Error creating Purchase Order:', err);
      throw err;
    }
  };


  // Auto-fetch Supplier particulars from GSTIN
  const handleFetchSupplierGst = async () => {
    const cleanGst = (supplierForm.gstin || '').trim().toUpperCase();
    if (!cleanGst || cleanGst.length < 15) {
      alert('Please enter a valid 15-character GSTIN first.');
      return;
    }

    try {
      setSupplierGstLoading(true);
      const res = await api.gst.lookup(cleanGst);
      if (res && res.success && res.data) {
        const d = res.data;
        setSupplierForm((prev) => ({
          ...prev,
          name: d.companyName || d.tradeName || prev.name,
          address: {
            ...prev.address,
            city: d.city || prev.address.city,
            state: d.state || prev.address.state,
            stateCode: d.stateCode || cleanGst.slice(0, 2),
            pincode: d.pincode || prev.address.pincode,
            street: d.address || prev.address.street
          }
        }));
      } else {
        alert(res?.message || 'Could not fetch GST details.');
      }
    } catch (err) {
      console.error('Failed to fetch supplier GST:', err);
    } finally {
      setSupplierGstLoading(false);
    }
  };

  // Submit Supplier
  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      await api.suppliers.create(supplierForm);
      setIsSupplierModalOpen(false);
      setSupplierForm({
        supplierCode: `SUP-${Math.floor(10 + Math.random() * 90)}`,
        name: '',
        category: '',
        gstin: '',
        phone: '',
        email: '',
        address: { city: '', state: 'Gujarat', stateCode: '24', pincode: '', street: '' }
      });
      fetchData();
    } catch (err) {
      alert(`Error creating supplier: ${err.message}`);
    }
  };

  // Status toggle
  const handleToggleStatus = async (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'ORDERED' ? 'RECEIVED' : 'ORDERED';
    try {
      await api.purchase.updateOrderStatus(orderId, nextStatus);
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Delete
  const handleDeleteOrder = async (id, poNo) => {
    if (window.confirm(`Delete Purchase Order "${poNo}"?`)) {
      await api.purchase.deleteOrder(id);
      fetchData();
    }
  };

  const handleDeleteSupplier = async (id, name) => {
    if (window.confirm(`Delete Supplier "${name}"?`)) {
      await api.suppliers.delete(id);
      fetchData();
    }
  };

  // Filtered lists
  const filteredOrders = orders.filter((o) =>
    o.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.supplierCode && s.supplierCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={`space-y-5 font-sans transition-colors duration-200 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
      {/* WRAP ALL PAGE ELEMENTS IN no-print SO ONLY THE PURCHASE ORDER PRINTS */}
      <div className="no-print space-y-5">
        {/* 1. Header Banner */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border shadow-xs transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-600 dark:text-orange-500" />
              PURCHASE
            </h1>
            <p className={`text-xs font-semibold mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Purchase Orders, Suppliers &amp; Factory Material Buying
            </p>
          </div>

          {/* Tab Switcher */}
          <div className={`flex items-center p-1 rounded-lg border text-xs font-semibold ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-orange-600 text-white shadow font-bold'
                  : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              Purchase Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'suppliers'
                  ? 'bg-orange-600 text-white shadow font-bold'
                  : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              Suppliers ({suppliers.length})
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'items'
                  ? 'bg-orange-600 text-white shadow font-bold'
                  : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              Material Guide
            </button>
          </div>
        </div>

      {/* 2. Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3 top-2.5 h-4 w-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            placeholder={activeTab === 'orders' ? 'Search PO #, Supplier...' : 'Search Supplier Name, Code...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-orange-500 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                : 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'orders' && (
            <button
              onClick={() => setIsPoModalOpen(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>+ Create Purchase Order</span>
            </button>
          )}

          {activeTab === 'suppliers' && (
            <button
              onClick={() => setIsSupplierModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Building2 className="h-4 w-4" />
              <span>+ Add Supplier</span>
            </button>
          )}

          <button
            onClick={fetchData}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. TAB 1: PURCHASE ORDERS */}
      {activeTab === 'orders' && (
        <div className={`rounded-xl border overflow-hidden shadow-xs ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs font-semibold">Loading purchase orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <ShoppingCart className="h-10 w-10 mx-auto mb-2 text-slate-400 opacity-60" />
              <div className="font-bold text-slate-800 dark:text-slate-200">No Purchase Orders Found</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Click "+ Create Purchase Order" above to order quenching oils, gas cylinders, salts, or furnace heating elements.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`text-[10px] uppercase font-bold tracking-wider border-b ${
                    isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-950/80 text-slate-300 border-slate-800'
                  }`}>
                    <th className="p-3">PO Number</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Order Date</th>
                    <th className="p-3">Items Summary</th>
                    <th className="p-3 text-right">Total Amount</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800 text-slate-200'
                }`}>
                  {filteredOrders.map((po) => (
                    <tr key={po._id} className={isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}>
                      <td className="p-3 font-mono font-black text-blue-700 dark:text-blue-400 text-xs">
                        {po.poNumber}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        <div>{po.supplierName}</div>
                        {po.supplierPhone && (
                          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-normal">
                            {po.supplierPhone}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400 font-medium">
                        {po.orderDate}
                      </td>
                      <td className="p-3">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {po.items && po.items.length > 0 ? (
                            <span>{po.items[0].itemName} ({po.items[0].quantity} {po.items[0].unit})</span>
                          ) : (
                            <span>General Supplies</span>
                          )}
                        </div>
                        {po.items && po.items.length > 1 && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            + {po.items.length - 1} more item(s)
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-black text-sm text-slate-950 dark:text-white">
                        ₹ {po.grandTotal ? po.grandTotal.toLocaleString('en-IN') : '0.00'}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(po._id, po.status)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border cursor-pointer transition-colors ${
                            po.status === 'RECEIVED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800'
                          }`}
                          title="Click to toggle Received / Ordered status"
                        >
                          {po.status === 'RECEIVED' ? '✔ RECEIVED' : '⏳ ORDERED'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPrintPoData(po)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                            }`}
                            title="Print Purchase Order Slip"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(po._id, po.poNumber)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-slate-100 hover:bg-rose-100 text-rose-700 border-slate-300'
                                : 'bg-slate-800 hover:bg-rose-950/60 text-rose-400 border-slate-700'
                            }`}
                            title="Delete Order"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 2: SUPPLIERS / VENDORS */}
      {activeTab === 'suppliers' && (
        <div className={`rounded-xl border overflow-hidden shadow-xs ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          {filteredSuppliers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Building2 className="h-10 w-10 mx-auto mb-2 text-slate-400 opacity-60" />
              <div className="font-bold text-slate-800 dark:text-slate-200">No Suppliers Registered</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Click "+ Add Supplier" to register oil companies, industrial gas dealers, and spare parts vendors.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`text-[10px] uppercase font-bold tracking-wider border-b ${
                    isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-950/80 text-slate-300 border-slate-800'
                  }`}>
                    <th className="p-3">Supplier Code</th>
                    <th className="p-3">Company Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Contact Details</th>
                    <th className="p-3">GSTIN</th>
                    <th className="p-3">City / Location</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800 text-slate-200'
                }`}>
                  {filteredSuppliers.map((s) => (
                    <tr key={s._id} className={isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}>
                      <td className="p-3 font-mono font-black text-orange-600 dark:text-orange-400">
                        {s.supplierCode}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {s.name}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                          {s.category?.replace(/_/g, ' ') || 'GENERAL'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-800 dark:text-slate-200">{s.phone || '-'}</div>
                        {s.email && <div className="text-[10px] text-slate-500 dark:text-slate-400">{s.email}</div>}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-300">
                        {s.gstin || '-'}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {s.address?.city || 'Ahmedabad'}, {s.address?.state || 'Gujarat'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteSupplier(s._id, s.name)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isLight
                              ? 'bg-slate-100 hover:bg-rose-100 text-rose-700 border-slate-300'
                              : 'bg-slate-800 hover:bg-rose-950/60 text-rose-400 border-slate-700'
                          }`}
                          title="Delete Supplier"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 3: FACTORY CONSUMABLES & SPARES GUIDE */}
      {activeTab === 'items' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border space-y-2.5 transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900 shadow-xs' : 'bg-slate-900 border-slate-800 text-white shadow-xs'
          }`}>
            <div className="h-9 w-9 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              🛢️
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Quenching Oils &amp; Polymers</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Fast quench mineral oil, accelerated hot quenching oils (150°C), and synthetic polymer media.
            </p>
            <div className="text-[10.5px] font-mono font-bold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 p-1.5 rounded-lg border border-orange-200 dark:border-orange-800/60">
              Standard Unit: Litres / Barrels (210L)
            </div>
          </div>

          <div className={`p-4 rounded-xl border space-y-2.5 transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900 shadow-xs' : 'bg-slate-900 border-slate-800 text-white shadow-xs'
          }`}>
            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              💨
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Industrial Gases</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Liquid Nitrogen (N2), Anhydrous Ammonia (NH3), LPG/Propane for endothermic gas generators and purging.
            </p>
            <div className="text-[10.5px] font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 p-1.5 rounded-lg border border-blue-200 dark:border-blue-800/60">
              Standard Unit: Cylinders / Kg
            </div>
          </div>

          <div className={`p-4 rounded-xl border space-y-2.5 transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900 shadow-xs' : 'bg-slate-900 border-slate-800 text-white shadow-xs'
          }`}>
            <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              🧂
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Heat Treatment Salts</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Neutral salt baths, carburizing liquid salts, and nitrate tempering salts for distortion-free immersion hardening.
            </p>
            <div className="text-[10.5px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
              Standard Unit: Bags (50 Kg)
            </div>
          </div>

          <div className={`p-4 rounded-xl border space-y-2.5 transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900 shadow-xs' : 'bg-slate-900 border-slate-800 text-white shadow-xs'
          }`}>
            <div className="h-9 w-9 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              🔥
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Furnace Spares &amp; Sensors</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Type-K &amp; Type-S calibrated thermocouple probes, ceramic tubes, heating element coils, and oxygen probes.
            </p>
            <div className="text-[10.5px] font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 p-1.5 rounded-lg border border-purple-200 dark:border-purple-800/60">
              Standard Unit: Pieces / Sets
            </div>
          </div>
        </div>
      )}
      </div>

      {/* 6. MODAL: CREATE PURCHASE ORDER */}
      <CreatePurchaseOrderModal
        isOpen={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
        onSubmit={handleCreatePo}
        suppliers={suppliers}
        isLight={isLight}
        orders={orders}
      />


      {/* 7. MODAL: ADD SUPPLIER */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className={`border rounded-2xl max-w-lg w-full p-4 sm:p-5 space-y-4 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Building2 className="h-4 w-4" />
                Register New Supplier
              </h2>
              <button 
                onClick={() => setIsSupplierModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  Company / Supplier Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gujarat Industrial Gases Ltd."
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 focus:bg-white' : 'bg-slate-950 border-slate-700 focus:border-blue-500'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                    Supplier Code
                  </label>
                  <input
                    type="text"
                    value={supplierForm.supplierCode}
                    onChange={(e) => setSupplierForm({ ...supplierForm, supplierCode: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 focus:bg-white' : 'bg-slate-950 border-slate-700 focus:border-blue-500'
                    }`}
                  />
                </div>
                <CreatableSelect
                  dropdownKey="supplierCategory"
                  label="Category"
                  value={supplierForm.category}
                  onChange={(val) => setSupplierForm({ ...supplierForm, category: val })}
                  placeholder="-- Select Category --"
                  addPlaceholder="Type custom category..."
                  isLight={isLight}
                />
              </div>

              {/* GSTIN with Fetch Button */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  GSTIN Number (15 Digits)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="e.g. 24AAACM1234F1Z5"
                    value={supplierForm.gstin}
                    onChange={(e) => setSupplierForm({ ...supplierForm, gstin: e.target.value.toUpperCase() })}
                    className={`w-full pl-3 pr-24 py-2 text-xs font-mono font-bold rounded-lg border uppercase text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 focus:bg-white' : 'bg-slate-950 border-slate-700 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleFetchSupplierGst}
                    disabled={supplierGstLoading || !supplierForm.gstin || supplierForm.gstin.length < 15}
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-[11px] font-bold shadow flex items-center gap-1 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {supplierGstLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Search className="w-3 h-3" />
                    )}
                    <span>Fetch</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 focus:bg-white' : 'bg-slate-950 border-slate-700 focus:border-blue-500'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                    Email Relay
                  </label>
                  <input
                    type="email"
                    placeholder="supplier@company.com"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 focus:bg-white' : 'bg-slate-950 border-slate-700 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              {/* State Code, State, City, Pincode */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-orange-600 dark:text-orange-400">
                    State Code
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="24"
                    value={supplierForm.address.stateCode || ''}
                    onChange={(e) => setSupplierForm({
                      ...supplierForm,
                      address: { ...supplierForm.address, stateCode: e.target.value.slice(0, 2) }
                    })}
                    className={`w-full px-2 py-2 text-xs font-mono font-bold text-center rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 focus:bg-white' : 'bg-slate-950 border-slate-700 focus:border-blue-500'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="Gujarat"
                    value={supplierForm.address.state || ''}
                    onChange={(e) => setSupplierForm({
                      ...supplierForm,
                      address: { ...supplierForm.address, state: e.target.value }
                    })}
                    className={`w-full px-2 py-2 text-xs font-semibold rounded-lg border uppercase text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 focus:bg-white' : 'bg-slate-950 border-slate-700 focus:border-blue-500'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Ahmedabad"
                    value={supplierForm.address.city || ''}
                    onChange={(e) => setSupplierForm({
                      ...supplierForm,
                      address: { ...supplierForm.address, city: e.target.value }
                    })}
                    className={`w-full px-2 py-2 text-xs font-semibold rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 focus:bg-white' : 'bg-slate-950 border-slate-700 focus:border-blue-500'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                    Pincode
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="382445"
                    value={supplierForm.address.pincode || ''}
                    onChange={(e) => setSupplierForm({
                      ...supplierForm,
                      address: { ...supplierForm.address, pincode: e.target.value }
                    })}
                    className={`w-full px-2 py-2 text-xs font-mono font-bold rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 focus:bg-white' : 'bg-slate-950 border-slate-700 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  Plant / Street Address
                </label>
                <input
                  type="text"
                  placeholder="Plot No., Industrial Area / Estate..."
                  value={supplierForm.address.street || ''}
                  onChange={(e) => setSupplierForm({
                    ...supplierForm,
                    address: { ...supplierForm.address, street: e.target.value }
                  })}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 focus:bg-white' : 'bg-slate-950 border-slate-700 focus:border-blue-500'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className={`px-4 py-2 border rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    isLight 
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-100' 
                      : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow cursor-pointer transition-colors"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: OFFICIAL PURCHASE ORDER VIEW & PRINT */}
      {printPoData && (
        <PurchaseOrderModal
          po={printPoData}
          suppliers={suppliers}
          onClose={() => setPrintPoData(null)}
          isLight={isLight}
        />
      )}

    </div>
  );
};

export default PurchasePage;

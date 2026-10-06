import React, { useState, useEffect } from 'react';
import {
  PackagePlus,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import api from '../api/client';
import CreatableSelect from '../components/CreatableSelect';

export const GrnPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [inwardList, setInwardList] = useState(() => {
    const cached = api.cache.get('/grn');
    return Array.isArray(cached) ? cached : (cached?.grns || cached?.data || []);
  });
  const [customers, setCustomers] = useState(() => {
    const cached = api.cache.get('/customers');
    return Array.isArray(cached) ? cached : (cached?.data || cached?.customers || []);
  });
  const [jobOrders, setJobOrders] = useState(() => {
    const cached = api.cache.get('/job-orders');
    return Array.isArray(cached) ? cached : (cached?.jobOrders || cached?.data || []);
  });
  const [loading, setLoading] = useState(() => {
    const cached = api.cache.get('/grn');
    const list = Array.isArray(cached) ? cached : (cached?.grns || cached?.data || []);
    return list.length === 0;
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [modalError, setModalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadGrns = async () => {
    try {
      const res = await api.grn.getAll();
      const list = Array.isArray(res) ? res : (res?.grns || res?.data || []);
      setInwardList(list);
    } catch (err) {
      console.error('Failed to load GRN records:', err);
      setErrorMsg('Could not load GRN inward records from database');
    } finally {
      setLoading(false);
    }
  };

  const loadJobOrders = async () => {
    try {
      const res = await api.jobOrders.getAll().catch(() => []);
      const list = Array.isArray(res) ? res : (res?.jobOrders || res?.data || []);
      setJobOrders(list);
    } catch (err) {
      console.warn('Failed to load job orders for GRN:', err.message);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await api.customers.getAll().catch(() => []);
      const list = Array.isArray(res) ? res : (res?.data || res?.customers || []);
      setCustomers(list);
    } catch (err) {
      console.warn('Failed to load customers for GRN:', err.message);
    }
  };

  useEffect(() => {
    loadGrns();
    loadCustomers();
    loadJobOrders();

    const handleSync = () => {
      loadGrns();
      loadCustomers();
      loadJobOrders();
    };

    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const [form, setForm] = useState({
    grnNumber: '',
    ownership: 'CUSTOMER',
    customerName: '',
    jobOrderId: '',
    challanNumber: '',
    transporter: '',
    packageCount: '',
    materialCondition: 'GOOD',
    partNumber: '',
    materialGrade: '',
    heatNumber: '',
    castNumber: '',
    receivedWeightKg: '',
    receivedQuantity: '',
    storageLocation: 'CUSTOMER-BAY-A1'
  });

  const handleOpenModal = async () => {
    setModalError('');
    setShowModal(true);
    let nextGrn = 'GRN-00001';
    try {
      const res = await api.grn.getNextGrnNumber();
      if (res?.grnNumber) nextGrn = res.grnNumber;
    } catch (e) {
      console.warn('Could not fetch next GRN number:', e.message);
    }
    setForm((prev) => ({
      ...prev,
      grnNumber: nextGrn,
      customerName: '',
      jobOrderId: '',
      challanNumber: '',
      transporter: '',
      packageCount: '',
      materialCondition: 'GOOD',
      partNumber: '',
      materialGrade: '',
      heatNumber: '',
      castNumber: '',
      receivedWeightKg: '',
      receivedQuantity: ''
    }));
  };

  const handleJobOrderSelect = (joId) => {
    if (!joId) {
      setForm((prev) => ({ ...prev, jobOrderId: '' }));
      return;
    }
    const jo = jobOrders.find((j) => (j._id === joId || j.jobOrderNumber === joId));
    if (!jo) {
      setForm((prev) => ({ ...prev, jobOrderId: joId }));
      return;
    }
    const custName = jo.customer?.companyName || jo.customer || '';
    const partNum = jo.part?.partNumber || jo.partNumber || '';
    setForm((prev) => ({
      ...prev,
      jobOrderId: jo._id || joId,
      customerName: custName || prev.customerName,
      partNumber: partNum || prev.partNumber,
      heatNumber: jo.heatNumber || prev.heatNumber,
      materialGrade: jo.part?.materialGrade || prev.materialGrade,
      receivedWeightKg: jo.targetWeight ? String(jo.targetWeight) : prev.receivedWeightKg,
      receivedQuantity: jo.targetQuantity ? String(jo.targetQuantity) : prev.receivedQuantity
    }));
  };

  const handleCreateGrn = async (e) => {
    e.preventDefault();
    setModalError('');
    setErrorMsg('');

    if (!form.partNumber || !form.heatNumber || !form.receivedWeightKg) {
      setModalError('Please fill in all mandatory fields: Part Number, Heat Number, and Received Weight.');
      return;
    }

    setSubmitting(true);

    try {
      const weight = parseFloat(form.receivedWeightKg) || 0;
      const qty = parseInt(form.receivedQuantity) || 1;

      const payload = {
        grnNumber: form.grnNumber || undefined,
        ownership: form.ownership || 'CUSTOMER',
        customerName: form.customerName,
        customer: form.customerName,
        jobOrder: form.jobOrderId || undefined,
        challanNumber: form.challanNumber || `DC-${Date.now().toString().slice(-4)}`,
        transporter: form.transporter || undefined,
        packageCount: form.packageCount ? parseInt(form.packageCount, 10) : undefined,
        materialCondition: form.materialCondition || 'GOOD',
        partNumber: form.partNumber,
        materialGrade: form.materialGrade || 'EN31',
        heatNumber: form.heatNumber.toUpperCase().trim(),
        castNumber: form.castNumber || 'N/A',
        receivedWeightKg: weight,
        receivedWeight: weight,
        receivedQuantity: qty,
        acceptedWeightKg: weight,
        acceptedWeight: weight,
        acceptedQuantity: qty,
        storageLocation: form.storageLocation || 'RAW-MATERIAL-BAY-1',
        inspectionStatus: 'ACCEPTED'
      };

      const res = await api.grn.create(payload);

      if (res && (res.success || res.grn || res._id)) {
        await loadGrns();
        setShowModal(false);
        setForm({
          ownership: 'CUSTOMER',
          customerName: '',
          jobOrderId: '',
          challanNumber: '',
          transporter: '',
          packageCount: '',
          materialCondition: 'GOOD',
          partNumber: '',
          materialGrade: '',
          heatNumber: '',
          castNumber: '',
          receivedWeightKg: '',
          receivedQuantity: '',
          storageLocation: 'CUSTOMER-BAY-A1'
        });
        setSuccessMsg('Material Inward (GRN) successfully recorded in database!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        throw new Error(res?.message || 'Failed to save GRN record in database');
      }
    } catch (err) {
      console.error('Error creating GRN:', err);
      setModalError(err.response?.data?.message || err.message || 'Error saving GRN to database');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGrn = async (id, grnNumber) => {
    if (!window.confirm(`Are you sure you want to delete GRN record ${grnNumber || ''}?`)) {
      return;
    }
    try {
      await api.grn.delete(id);
      setSuccessMsg(`GRN record ${grnNumber || ''} deleted successfully`);
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadGrns();
    } catch (err) {
      console.error('Failed to delete GRN:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to delete GRN record');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const knownParts = Array.from(
    new Set([
      ...inwardList.map((g) => g.partNumber).filter(Boolean),
      ...customers.flatMap((c) => (c.parts || []).map((p) => p.partNumber || p.name)).filter(Boolean)
    ])
  );

  const customerStockKg = inwardList
    .filter(g => g.ownership === 'CUSTOMER')
    .reduce((sum, g) => sum + (Number(g.receivedWeightKg ?? g.receivedWeight ?? 0)), 0);

  const companyStockKg = inwardList
    .filter(g => g.ownership === 'COMPANY')
    .reduce((sum, g) => sum + (Number(g.receivedWeightKg ?? g.receivedWeight ?? 0)), 0);

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 p-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-700 hover:text-red-900 font-bold ml-2 cursor-pointer">✕</button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            Material Inward (GRN) &amp; Customer Stock Segregation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mandatory Heat Number verification, Mill Test Certificate (MTC) chemistry, and strict customer ownership isolation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadGrns}
            disabled={loading}
            title="Refresh GRN List from Database"
            className="flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Inward New Material (GRN)
          </button>
        </div>
      </div>

      {/* Customer Stock Segregation Callout */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/30 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-lg shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-blue-900 dark:text-blue-300">Strict Ownership Rule Active:</span>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
              Customer-owned material is segregated in dedicated bays. 100% weight reconciliation enforced: Input = Good + Rejection + Scrap.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:text-right shrink-0">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Customer Stock</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{customerStockKg.toLocaleString()} kg</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Company Stock</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{companyStockKg.toLocaleString()} kg</span>
          </div>
        </div>
      </div>

      {/* Material Inward Table or Loading or Empty State */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
          <Loader2 className="h-8 w-8 text-orange-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading GRN Inward records from database...</p>
        </div>
      ) : inwardList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
          <div className="h-14 w-14 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <PackagePlus className="h-7 w-7 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            No Material Inward (GRN) Records Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            Click "+ Inward New Material (GRN)" above to create and permanently store inward stock records into MongoDB with automatic heat traceability.
          </p>
          <button
            onClick={() => {
              setModalError('');
              setShowModal(true);
            }}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> + Inward New Material (GRN)
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Material Inward Register (Heat Number Linked)
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {inwardList.length} GRN Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">GRN No &amp; Date</th>
                  <th className="p-3">Ownership &amp; Customer</th>
                  <th className="p-3">Linked Job Order</th>
                  <th className="p-3">Part Details</th>
                  <th className="p-3">Raw Heat Number</th>
                  <th className="p-3">Inward Weight / Qty</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Location</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                {inwardList.map((g) => {
                  const displayDate = g.date
                    ? new Date(g.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'N/A';
                  const customerDisplay = g.customerName || g.customer?.companyName || g.supplierName || g.supplier?.name || (typeof g.customer === 'string' ? g.customer : 'N/A');
                  const weightDisplay = g.receivedWeightKg ?? g.receivedWeight ?? 0;
                  const qtyDisplay = g.receivedQuantity ?? 0;
                  const joDisplay = g.jobOrder?.jobOrderNumber || (typeof g.jobOrder === 'string' ? g.jobOrder : '—');
                  const condition = g.materialCondition || 'GOOD';

                  return (
                    <tr key={g._id || g.grnNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono">
                        <span className="font-bold text-slate-900 dark:text-white block">{g.grnNumber}</span>
                        <span className="text-[10px] text-slate-500">{displayDate} &bull; DC: {g.challanNumber || 'N/A'}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded inline-block mb-0.5">
                          {g.ownership}
                        </span>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{customerDisplay}</div>
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {joDisplay !== '—' ? (
                          <span className="font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-500/30 inline-block">
                            {joDisplay}
                          </span>
                        ) : (
                          <span className="text-slate-400">Direct Inward</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">{g.partNumber}</span>
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">Grade: {g.materialGrade || 'EN31'}</span>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-500/30 block w-fit">
                          {g.heatNumber}
                        </span>
                        <span className="text-[10px] text-slate-500">Cast: {g.castNumber || 'N/A'}</span>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="font-bold text-slate-900 dark:text-white block">{weightDisplay} kg</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{qtyDisplay} Pcs</span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          condition === 'GOOD'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                            : condition === 'DAMAGED' || condition === 'SHORT'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                        }`}>
                          {condition}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                        {g.storageLocation || 'BAY-A1'}
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded">
                          {g.inspectionStatus || g.status || 'ACCEPTED'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteGrn(g._id, g.grnNumber)}
                          title="Delete GRN record"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
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
        </div>
      )}

      {/* New GRN Inward Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PackagePlus className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                Material Inward (GRN Entry)
              </h3>
              <button
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 p-2.5 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateGrn} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">GRN Number (Auto)</label>
                  <input
                    type="text"
                    value={form.grnNumber}
                    onChange={(e) => setForm({ ...form, grnNumber: e.target.value })}
                    placeholder="GRN-00001"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-blue-900 dark:text-blue-400 font-mono font-bold"
                  />
                </div>

                <CreatableSelect
                  dropdownKey="ownership"
                  label="Ownership Type"
                  value={form.ownership}
                  onChange={(val) => setForm({ ...form, ownership: val })}
                  options={[
                    { value: 'CUSTOMER', label: 'CUSTOMER OWNED (Job Work)' },
                    { value: 'COMPANY', label: 'COMPANY OWNED' }
                  ]}
                  placeholder="-- Select Ownership Type --"
                  addPlaceholder="Add custom ownership..."
                  required
                />

                <CreatableSelect
                  dropdownKey="customer"
                  label={form.ownership === 'COMPANY' ? 'Supplier Name' : 'Customer Name'}
                  value={form.customerName}
                  onChange={(val) => setForm({ ...form, customerName: val })}
                  options={customers.map((c) => {
                    const name = c.companyName || c.name;
                    return {
                      value: name,
                      label: `${name}${c.customerCode ? ` (${c.customerCode})` : ''}`
                    };
                  })}
                  placeholder={form.ownership === 'COMPANY' ? '-- Select Supplier --' : '-- Select Customer --'}
                  addPlaceholder="Type new name to store in DB..."
                  required
                />

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Customer Delivery Challan No</label>
                  <input
                    type="text"
                    value={form.challanNumber}
                    onChange={(e) => setForm({ ...form, challanNumber: e.target.value })}
                    placeholder="e.g. DC-9988"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <CreatableSelect
                  dropdownKey="partNumber"
                  label="Part / Component Number"
                  value={form.partNumber}
                  onChange={(val) => setForm({ ...form, partNumber: val })}
                  options={knownParts}
                  placeholder="-- Select or Add Part Number --"
                  addPlaceholder="Type new part / drawing number..."
                  required
                />

                <div>
                  <label className="text-red-600 dark:text-red-400 font-bold block mb-1">
                    Raw Heat Number (MANDATORY) *
                  </label>
                  <input
                    type="text"
                    value={form.heatNumber}
                    onChange={(e) => setForm({ ...form, heatNumber: e.target.value })}
                    placeholder="e.g. H-45872"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-red-300 dark:border-red-500/60 rounded-lg p-2 text-slate-900 dark:text-white font-mono font-bold"
                    required
                  />
                </div>

                <CreatableSelect
                  dropdownKey="materialGrade"
                  label="Material Grade"
                  value={form.materialGrade}
                  onChange={(val) => setForm({ ...form, materialGrade: val })}
                  placeholder="-- Select Standard Steel Grade --"
                  addPlaceholder="Type custom steel grade (e.g. SCM415)..."
                />

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Received Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.receivedWeightKg}
                    onChange={(e) => setForm({ ...form, receivedWeightKg: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Received Quantity (Pcs) *</label>
                  <input
                    type="number"
                    value={form.receivedQuantity}
                    onChange={(e) => setForm({ ...form, receivedQuantity: e.target.value })}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <CreatableSelect
                  dropdownKey="jobOrder"
                  label="Link to Job Order (Optional)"
                  value={form.jobOrderId}
                  onChange={handleJobOrderSelect}
                  options={jobOrders.map((j) => ({
                    value: j._id,
                    label: `${j.jobOrderNumber} — ${j.customer?.companyName || j.customer || 'Customer'} (${j.partNumber || 'Part'})`
                  }))}
                  placeholder="-- Select Pending Job Order to Auto-fill --"
                  addPlaceholder="Or type custom Job Order No..."
                />

                <CreatableSelect
                  dropdownKey="materialCondition"
                  label="Material Condition at Receipt"
                  value={form.materialCondition}
                  onChange={(val) => setForm({ ...form, materialCondition: val })}
                  options={[
                    { value: 'GOOD', label: 'GOOD (Clean, No Defects)' },
                    { value: 'RUSTY', label: 'RUSTY (Surface Oxidation)' },
                    { value: 'DAMAGED', label: 'DAMAGED (Bent / Burrs / Cracks)' },
                    { value: 'SHORT', label: 'SHORT (Quantity Lower Than Challan)' },
                    { value: 'EXCESS', label: 'EXCESS (Quantity Higher Than Challan)' },
                    { value: 'MIXED', label: 'MIXED (Multiple Heats or Grades)' }
                  ]}
                  placeholder="-- Select Material Condition --"
                  addPlaceholder="Add custom condition..."
                />

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Transporter / Vehicle No</label>
                  <input
                    type="text"
                    value={form.transporter}
                    onChange={(e) => setForm({ ...form, transporter: e.target.value })}
                    placeholder="e.g. VRL Logistics / GJ-01-AB-1234"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Package / Bundle Count</label>
                  <input
                    type="number"
                    value={form.packageCount}
                    onChange={(e) => setForm({ ...form, packageCount: e.target.value })}
                    placeholder="e.g. 5 boxes / bins"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <CreatableSelect
                  dropdownKey="storageLocation"
                  label="Storage Bay / Yard"
                  value={form.storageLocation}
                  onChange={(val) => setForm({ ...form, storageLocation: val })}
                  placeholder="-- Select Storage Bay / Yard --"
                  addPlaceholder="Add custom storage bay..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving to Database...
                    </>
                  ) : (
                    'Accept & Allocate Inward Stock'
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

export default GrnPage;

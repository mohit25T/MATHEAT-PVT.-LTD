import React, { useState, useEffect } from 'react';
import {
  Layers,
  Flame,
  Plus,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  ArrowRight,
  ShieldAlert,
  Trash2,
  RefreshCw,
  Loader2,
  LayoutGrid,
  List,
  ChevronRight
} from 'lucide-react';
import api from '../api/client';
import CreatableSelect from '../components/CreatableSelect';

export const BatchesPage = ({ onSelectTab }) => {
  const [batches, setBatches] = useState(() => {
    const cached = api.cache.get('/batches');
    return Array.isArray(cached) ? cached : (cached?.batches || cached?.data || []);
  });
  const [loading, setLoading] = useState(() => {
    const cached = api.cache.get('/batches');
    const list = Array.isArray(cached) ? cached : (cached?.batches || cached?.data || []);
    return list.length === 0;
  });
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states & Master Dropdowns with Instant Cache Initialization
  const [availableFurnaces, setAvailableFurnaces] = useState(() => {
    const cached = api.cache.get('/furnaces');
    return Array.isArray(cached) ? cached : (cached?.furnaces || []);
  });
  const [customers, setCustomers] = useState(() => {
    const cached = api.cache.get('/customers');
    return Array.isArray(cached) ? cached : (cached?.data || cached?.customers || []);
  });
  const [jobOrders, setJobOrders] = useState(() => {
    const cached = api.cache.get('/job-orders');
    return Array.isArray(cached) ? cached : (cached?.jobOrders || cached?.data || []);
  });
  const [recipes, setRecipes] = useState(() => {
    const cached = api.cache.get('/recipes');
    return Array.isArray(cached) ? cached : (cached?.recipes || []);
  });
  const [furnaceCap, setFurnaceCap] = useState(600);
  const [selectedFurnace, setSelectedFurnace] = useState('');
  const [inputWeight, setInputWeight] = useState(0);
  const [batchForm, setBatchForm] = useState({
    batchId: '',
    jobOrder: '',
    customer: '',
    partNumber: '',
    heatNumber: '',
    recipe: ''
  });

  const loadBatches = async () => {
    try {
      const res = await api.batches.getAll().catch(() => ({ batches: [] }));
      const list = res?.batches || (Array.isArray(res) ? res : []);
      setBatches(list);
    } catch (err) {
      console.warn('[BATCHES] Failed to fetch batches:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFurnaces = async () => {
    try {
      const res = await api.furnaces.getAll().catch(() => ({ furnaces: [] }));
      const list = res?.furnaces || (Array.isArray(res) ? res : []);
      setAvailableFurnaces(list);
    } catch (err) {
      console.warn('[BATCHES] Failed to fetch furnaces:', err.message);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [custRes, joRes, rcpRes] = await Promise.all([
        api.customers.getAll().catch(() => []),
        api.jobOrders.getAll().catch(() => []),
        api.recipes.getAll().catch(() => [])
      ]);
      setCustomers(custRes?.data || custRes?.customers || (Array.isArray(custRes) ? custRes : []));
      setJobOrders(joRes?.jobOrders || (Array.isArray(joRes) ? joRes : []));
      setRecipes(rcpRes?.recipes || (Array.isArray(rcpRes) ? rcpRes : []));
    } catch (err) {
      console.warn('[BATCHES] Failed to load master dropdown data:', err.message);
    }
  };

  useEffect(() => {
    loadBatches();
    loadFurnaces();
    loadDropdowns();

    const handleSync = () => {
      loadBatches();
      loadFurnaces();
      loadDropdowns();
    };

    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const handleOpenModal = async () => {
    setShowModal(true);
    try {
      const [resBatch, resHeat] = await Promise.all([
        api.batches.getNextBatchNumber().catch(() => null),
        api.batches.getNextHeatNumber().catch(() => null)
      ]);
      setBatchForm((prev) => ({
        ...prev,
        batchId: resBatch?.batchId || prev.batchId,
        heatNumber: prev.heatNumber || resHeat?.heatNumber || ''
      }));
    } catch (err) {
      console.warn('Could not pre-fetch next batch/heat ID:', err.message);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        batchId: batchForm.batchId || undefined,
        jobOrder: batchForm.jobOrder || undefined,
        customer: batchForm.customer || undefined,
        partNumber: batchForm.partNumber || undefined,
        heatNumber: batchForm.heatNumber || undefined,
        furnace: selectedFurnace || undefined,
        furnaceId: selectedFurnace || undefined,
        inputWeightKg: Number(inputWeight) || 100,
        inputQuantity: 10,
        recipe: batchForm.recipe || undefined
      };

      await api.batches.create(payload);
      await loadBatches();
      setShowModal(false);
      setBatchForm({
        batchId: '',
        jobOrder: '',
        customer: '',
        partNumber: '',
        heatNumber: '',
        recipe: ''
      });
      setSelectedFurnace('');
      setInputWeight(0);
      setSuccessMsg('Heat Treatment Batch created and registered in database!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to create batch:', err);
      setErrorMsg(err.message || 'Failed to create batch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBatch = async (id, bId) => {
    if (!window.confirm(`Are you sure you want to delete batch ${bId}?`)) return;
    try {
      await api.batches.delete(id);
      setSuccessMsg(`Batch ${bId} deleted`);
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadBatches();
    } catch (err) {
      alert('Failed to delete batch: ' + err.message);
    }
  };

  const knownParts = Array.from(
    new Set([
      ...batches.map(b => b.partNumber || b.part?.partNumber).filter(Boolean),
      ...jobOrders.map(j => j.partNumber).filter(Boolean),
      ...customers.flatMap(c => (c.parts || []).map(p => p.partNumber || p.name)).filter(Boolean)
    ])
  );

  const availableWeight = Math.max(0, furnaceCap - inputWeight);
  const utilization = furnaceCap > 0 ? Math.round((inputWeight / furnaceCap) * 100) : 0;
  const isOverloaded = inputWeight > furnaceCap;

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 font-bold ml-2">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 p-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            Batch Management &amp; Furnace Loading Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Unique Batch IDs (BT-00001), unbroken Heat Number linkage, and furnace capacity validation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadBatches}
            disabled={loading}
            title="Refresh Batches"
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Plan &amp; Load New Batch
          </button>
        </div>
      </div>

      {/* Batches Table or Empty State */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
          <Loader2 className="h-8 w-8 text-orange-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading furnace batches from database...</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
          <div className="h-14 w-14 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Layers className="h-7 w-7 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            No Active Furnace Batches
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            All sample furnace batches have been cleared. Plan and load incoming parts into sealed quench, pit, or mesh belt furnaces with recipe parameters and real-time load capacity check.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> + Plan &amp; Load New Batch
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Active Batch Register
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {batches.length} Batches Loaded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Batch ID &amp; Job Order</th>
                  <th className="p-3">Customer &amp; Component</th>
                  <th className="p-3">Raw Heat Number</th>
                  <th className="p-3">Furnace &amp; Loading</th>
                  <th className="p-3">Approved Recipe</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                {batches.map((b) => {
                  const bId = b.batchId || b._id;
                  const joDisplay = b.jobOrder?.jobOrderNumber || (typeof b.jobOrder === 'string' ? b.jobOrder : 'Direct Load');
                  const pNum = b.part?.partNumber || b.partNumber || 'Component';
                  const custName = b.customer?.companyName || (typeof b.customer === 'string' ? b.customer : 'Customer Stock');
                  const fName = b.furnace?.furnaceId || b.furnaceId || 'FURNACE-01';
                  const rName = b.recipe?.recipeCode || (typeof b.recipe === 'string' ? b.recipe : 'Standard Recipe');
                  const weight = b.inputWeightKg || 0;
                  const cap = b.furnace?.capacityKg || b.furnaceCapacity || 600;

                  return (
                    <tr key={b._id || bId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono">
                        <span className="font-bold text-orange-600 dark:text-orange-400 block">{bId}</span>
                        <span className="text-[10px] text-slate-500">{joDisplay}</span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{pNum}</div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{custName}</span>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-500/30 inline-block">
                          {b.heatNumber}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold font-mono text-slate-900 dark:text-white">
                          {fName} ({weight} kg)
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Cap: {cap} kg &bull; {Math.round((weight / (cap || 1)) * 100)}% load
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {rName}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          b.status === 'HEATING'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30 animate-pulse'
                            : b.status === 'READY_FOR_DISPATCH'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30'
                        }`}>
                          {b.status || 'PLANNED'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.qcStatus === 'PASS' ? (
                            <button
                              onClick={() => onSelectTab && onSelectTab('certificates')}
                              className="text-orange-600 dark:text-orange-400 hover:underline font-bold text-xs cursor-pointer"
                            >
                              Certificate &rarr;
                            </button>
                          ) : (
                            <button
                              onClick={() => onSelectTab && onSelectTab('operator')}
                              className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-xs cursor-pointer"
                            >
                              Console &rarr;
                            </button>
                          )}
                          {b._id && (
                            <button
                              onClick={() => handleDeleteBatch(b._id, bId)}
                              title="Delete Batch"
                              className="text-slate-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Furnace Loading Calculator Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                Plan &amp; Load Furnace Batch
              </h3>
              <button onClick={() => setShowModal(false)} disabled={submitting} className="text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              {/* Optional Job Order Selection */}
              {jobOrders.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 dark:text-slate-300 font-bold block">
                      Select Customer Job Order (Auto-fills Data)
                    </label>
                    <span className="text-[10px] text-orange-600 font-bold">Quick Select</span>
                  </div>
                  <select
                    value={batchForm.jobOrder}
                    onChange={(e) => {
                      const joNum = e.target.value;
                      if (!joNum) {
                        setBatchForm(prev => ({ ...prev, jobOrder: '' }));
                      } else {
                        const found = jobOrders.find(j => j.jobOrderNumber === joNum || j._id === joNum);
                        if (found) {
                          setBatchForm(prev => ({
                            ...prev,
                            jobOrder: joNum,
                            customer: found.customer?.companyName || found.customer || prev.customer,
                            partNumber: found.part?.partNumber || found.partNumber || prev.partNumber,
                            heatNumber: found.heatNumber || prev.heatNumber
                          }));
                          if (found.targetWeight) {
                            setInputWeight(parseFloat(found.targetWeight) || 0);
                          }
                        }
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="">-- Choose from Open Job Orders (Optional) --</option>
                    {jobOrders.map((jo) => (
                      <option key={jo._id || jo.jobOrderNumber} value={jo.jobOrderNumber}>
                        {jo.jobOrderNumber} - {jo.customer?.companyName || (typeof jo.customer === 'string' ? jo.customer : 'Customer')} ({jo.partNumber || 'Part'}) [{jo.targetWeight}kg]
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Batch ID</label>
                  <input
                    type="text"
                    value={batchForm.batchId}
                    onChange={(e) => setBatchForm({ ...batchForm, batchId: e.target.value })}
                    placeholder="BT-00001"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <CreatableSelect
                  dropdownKey="customer"
                  label="Customer Name"
                  value={batchForm.customer}
                  onChange={(val) => setBatchForm({ ...batchForm, customer: val })}
                  options={customers.map((c) => {
                    const name = c.companyName || c.name;
                    return {
                      value: name,
                      label: `${name}${c.customerCode ? ` (${c.customerCode})` : ''}`
                    };
                  })}
                  placeholder="-- Select Customer --"
                  addPlaceholder="Type customer..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CreatableSelect
                  dropdownKey="partNumber"
                  label="Part Number / Component"
                  value={batchForm.partNumber}
                  onChange={(val) => setBatchForm({ ...batchForm, partNumber: val })}
                  options={knownParts}
                  placeholder="-- Select Part --"
                  addPlaceholder="Type part number..."
                />
                <div>
                  <label className="text-red-600 dark:text-red-400 font-bold block mb-1">
                    Raw Heat Number (Traceability) *
                  </label>
                  <input
                    type="text"
                    value={batchForm.heatNumber}
                    onChange={(e) => setBatchForm({ ...batchForm, heatNumber: e.target.value })}
                    placeholder="e.g. H-45892"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-red-300 dark:border-red-500/60 rounded-lg p-2 text-slate-900 dark:text-white font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Recipe Selector */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Approved Recipe</label>
                <select
                  value={batchForm.recipe}
                  onChange={(e) => setBatchForm({ ...batchForm, recipe: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                >
                  <option value="">-- Choose Standard Approved Recipe --</option>
                  {recipes.map((r) => (
                    <option key={r._id || r.recipeCode} value={r.recipeCode || r._id}>
                      {r.recipeCode || r.code} &bull; {r.recipeName || r.name} ({r.materialGrade}) [{r.targetTemperature || r.targetTemp}°C]
                    </option>
                  ))}
                </select>
              </div>

              {/* Furnace Selector with Capacity Enforcement */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Select Furnace Unit *</label>
                <select
                  value={selectedFurnace}
                  onChange={(e) => {
                    const fId = e.target.value;
                    setSelectedFurnace(fId);
                    const f = availableFurnaces.find(item => item.furnaceId === fId || item._id === fId);
                    if (f && f.capacityKg) {
                      setFurnaceCap(f.capacityKg);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-semibold"
                  required
                >
                  <option value="">-- Select Furnace Unit --</option>
                  {availableFurnaces.map((f) => (
                    <option key={f._id || f.furnaceId} value={f.furnaceId}>
                      {f.name} ({f.furnaceId}) - Max: {f.capacityKg} kg [{f.type}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Total Batch Weight (kg) *</label>
                <input
                  type="number"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono font-bold"
                  required
                />
              </div>

              {/* Live Capacity Feedback */}
              <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                isOverloaded
                  ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-300'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                <div className="flex justify-between font-mono text-xs">
                  <span>Furnace Rated Capacity:</span>
                  <strong className="text-slate-900 dark:text-white">{furnaceCap} kg</strong>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span>Planned Batch Load:</span>
                  <strong className={isOverloaded ? 'text-red-600 dark:text-red-400 font-black' : 'text-orange-600 dark:text-orange-400'}>
                    {inputWeight} kg
                  </strong>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span>Remaining Available:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">{availableWeight} kg</strong>
                </div>
                <div className="flex justify-between font-mono text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Furnace Utilization:</span>
                  <strong className="text-slate-900 dark:text-white">{utilization}%</strong>
                </div>

                {isOverloaded && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-bold pt-1.5 border-t border-red-200 dark:border-red-500/40">
                    <AlertTriangle className="h-4 w-4" />
                    OVERLOAD BLOCKED: Loaded weight exceeds furnace rating. Do not overload!
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOverloaded || inputWeight <= 0 || submitting}
                  className={`px-5 py-2 rounded-lg text-xs font-bold text-white shadow cursor-pointer flex items-center gap-1.5 ${
                    isOverloaded || inputWeight <= 0 ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-500'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading Batch...
                    </>
                  ) : (
                    'Confirm Furnace Load'
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
export default BatchesPage;

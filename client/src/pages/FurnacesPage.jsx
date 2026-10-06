import React, { useState, useEffect } from 'react';
import {
  Flame,
  Gauge,
  Layers,
  Clock,
  AlertTriangle,
  Activity,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  X,
  Building,
  Zap,
  Thermometer,
  ShieldCheck
} from 'lucide-react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';
import CreatableSelect from '../components/CreatableSelect';

export const FurnacesPage = ({ onSelectTab }) => {
  const { isLight } = useTheme();
  const [furnaces, setFurnaces] = useState(() => {
    const cached = api.cache.get('/furnaces');
    return Array.isArray(cached) ? cached : (cached?.furnaces || []);
  });
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State for Adding a New Furnace
  const [formData, setFormData] = useState({
    furnaceId: '',
    name: '',
    type: '',
    capacityKg: '',
    maxTemperature: '',
    quenchMedium: '',
    heatingType: '',
    ratedPowerKw: '',
    manufacturer: '',
    model: ''
  });

  const loadFurnaces = async () => {
    try {
      const res = await api.furnaces.getAll().catch(() => []);
      const furnaceList = Array.isArray(res) ? res : (res?.furnaces || []);
      setFurnaces(furnaceList);
    } catch (err) {
      console.warn('[FURNACES] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFurnaces();

    const handleSync = () => {
      loadFurnaces();
    };

    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      furnaceId: `F-0${furnaces.length + 1}`,
      name: '',
      type: '',
      capacityKg: '',
      maxTemperature: '',
      quenchMedium: '',
      heatingType: '',
      ratedPowerKw: '',
      manufacturer: '',
      model: ''
    });
    setErrorMsg('');
    setShowAddModal(true);
  };

  const handleCreateFurnace = async (e) => {
    e.preventDefault();
    if (!formData.furnaceId || !formData.name || !formData.capacityKg) {
      setErrorMsg('Please enter Furnace ID, Name, and Load Capacity.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.furnaces.create(formData);
      setShowAddModal(false);
      await loadFurnaces();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register furnace');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFurnace = async (id, furnaceId, name) => {
    if (window.confirm(`Are you sure you want to decommission and remove "${furnaceId} - ${name}" from plant registry?`)) {
      try {
        await api.furnaces.delete(id || furnaceId);
        await loadFurnaces();
      } catch (err) {
        alert(`Failed to delete furnace: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            Furnace Master &amp; Real-Time Status Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manually configure factory heating units, load capacities, carbon potential (%CP), and operating telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Register New Furnace
          </button>
          <button
            onClick={() => onSelectTab && onSelectTab('operator')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            Operator Console
          </button>
        </div>
      </div>

      {/* Furnace Grid or Clean Empty State */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Loading factory furnace registry...
          </div>
        </div>
      ) : furnaces.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
          <div className="h-16 w-16 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Flame className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            No Furnaces Registered in Plant Master
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            All default mock units have been cleared. Manually register your plant heat treatment units (e.g. Sealed Quench, Pit Carburizing, Continuous Mesh Belt, or Tempering Ovens) with custom load capacities.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Register New Furnace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {furnaces.map((f) => {
            const isRunning = f.currentStatus !== 'IDLE' && f.currentStatus !== 'MAINTENANCE';
            const capacity = f.capacityKg || 600;
            const loaded = f.loadedWeightKg || 0;
            const utilization = Math.round((loaded / capacity) * 100);

            return (
              <div
                key={f._id || f.furnaceId}
                className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm relative overflow-hidden transition-all ${
                  isRunning
                    ? 'border-orange-500/50 ring-1 ring-orange-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Top Banner */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg font-mono font-bold text-sm border ${
                      isRunning
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-600/20 dark:text-orange-400 border-orange-300 dark:border-orange-500/30'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}>
                      {f.furnaceId}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">{f.name}</h2>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        Type: {f.type?.replace(/_/g, ' ')} &bull; {f.heatingType || 'Electric'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      isRunning
                        ? 'bg-orange-600 text-white animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                    }`}>
                      {f.currentStatus || 'IDLE'}
                    </span>
                    <button
                      onClick={() => handleDeleteFurnace(f._id, f.furnaceId, f.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="Decommission Furnace"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-3 py-4 border-b border-slate-200 dark:border-slate-800 text-center font-mono">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 sm:p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                    <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block truncate">Temperature</span>
                    <strong className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {f.currentTemperature || 28} °C
                    </strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 sm:p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                    <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block truncate">Carbon (%CP)</span>
                    <strong className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {(f.currentCarbonPotential || 0).toFixed(2)} %
                    </strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 sm:p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                    <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block truncate">Quench Tank</span>
                    <strong className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate block">
                      {f.quenchMedium || 'OIL'}
                    </strong>
                  </div>
                </div>

                {/* Status and Loading Bar */}
                <div className="pt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Loading Capacity:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {loaded} / {capacity} kg ({utilization}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${utilization > 90 ? 'bg-red-500' : 'bg-orange-500'}`}
                      style={{ width: `${Math.min(100, utilization)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500 dark:text-slate-400 font-mono">
                      Batch: {f.currentBatchId || 'None'}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Max {f.maxTemperature || 1050} °C
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register New Furnace Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-600/20 text-orange-600 dark:text-orange-400">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">
                    Register New Heat Treatment Furnace
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Add custom factory furnace unit with dedicated load parameters
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateFurnace} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Furnace Tag / ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.furnaceId}
                    onChange={(e) => setFormData({ ...formData, furnaceId: e.target.value })}
                    placeholder="e.g. SQF-01, F-01"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Load Capacity (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacityKg}
                    onChange={(e) => setFormData({ ...formData, capacityKg: e.target.value })}
                    placeholder="e.g. 600"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Furnace Official Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sealed Quench Furnace #1 (SQF-01)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <CreatableSelect
                    dropdownKey="furnaceType"
                    label="Furnace Architectural Type"
                    value={formData.type}
                    onChange={(val) => setFormData({ ...formData, type: val })}
                    placeholder="-- Select Furnace Type --"
                    addPlaceholder="Type custom furnace type..."
                    isLight={isLight}
                  />
                </div>

                <div>
                  <CreatableSelect
                    dropdownKey="quenchMedium"
                    label="Quench Medium"
                    value={formData.quenchMedium}
                    onChange={(val) => setFormData({ ...formData, quenchMedium: val })}
                    placeholder="-- Select Quench Medium --"
                    addPlaceholder="Type custom quench medium..."
                    isLight={isLight}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Operating Temp (°C)
                  </label>
                  <input
                    type="number"
                    value={formData.maxTemperature}
                    onChange={(e) => setFormData({ ...formData, maxTemperature: e.target.value })}
                    placeholder="e.g. 1050"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rated Power (kW)
                  </label>
                  <input
                    type="number"
                    value={formData.ratedPowerKw}
                    onChange={(e) => setFormData({ ...formData, ratedPowerKw: e.target.value })}
                    placeholder="e.g. 95"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <CreatableSelect
                  dropdownKey="heatingSystem"
                  label="Heating System & Elements"
                  value={formData.heatingType}
                  onChange={(val) => setFormData({ ...formData, heatingType: val })}
                  placeholder="-- Select Heating System --"
                  addPlaceholder="Type custom heating system..."
                  isLight={isLight}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Furnace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default FurnacesPage;

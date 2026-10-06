import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';
import CreatableSelect from '../components/CreatableSelect';
import {
  Flame,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  FlaskConical,
  RefreshCw,
  Search,
  DollarSign,
  Layers,
  Sparkles,
  X
} from 'lucide-react';

export const ServicesPage = () => {
  const { isLight } = useTheme();
  const [activeTab, setActiveTab] = useState('services'); // 'services', 'guide'

  const [processes, setProcesses] = useState(() => {
    const cached = api.cache.get('/masters/processes');
    return cached?.processes || (Array.isArray(cached) ? cached : []);
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    processCode: `SRV-${Math.floor(10 + Math.random() * 90)}`,
    processName: '',
    category: '',
    ratePerKg: '',
    ratePerPc: '',
    minCharge: '',
    sacCode: '998873',
    defaultTempRange: { min: '', max: '' },
    quenchMedium: '',
    temperingTemp: '',
    temperingTime: ''
  });

  const fetchProcesses = async () => {
    try {
      const res = await api.services.getAll().catch(() => ({ processes: [] }));
      setProcesses(res.processes || []);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();

    const handleSync = () => {
      fetchProcesses();
    };

    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      processCode: `SRV-${Math.floor(10 + Math.random() * 90)}`,
      processName: '',
      category: '',
      ratePerKg: '',
      ratePerPc: '',
      minCharge: '',
      sacCode: '998873',
      defaultTempRange: { min: '', max: '' },
      quenchMedium: '',
      temperingTemp: '',
      temperingTime: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proc) => {
    setEditingId(proc._id);
    setForm({
      processCode: proc.processCode,
      processName: proc.processName,
      category: proc.category || 'THERMO_CHEMICAL',
      ratePerKg: proc.ratePerKg || 0,
      ratePerPc: proc.ratePerPc || 0,
      minCharge: proc.minCharge || 0,
      sacCode: proc.sacCode || '998873',
      defaultTempRange: proc.defaultTempRange || { min: 850, max: 920 },
      quenchMedium: proc.quenchMedium || 'OIL',
      temperingTemp: proc.temperingTemp || 180,
      temperingTime: proc.temperingTime || 120
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.services.update(editingId, form);
      } else {
        await api.services.create(form);
      }
      setIsModalOpen(false);
      fetchProcesses();
    } catch (err) {
      alert(`Error saving service: ${err.message}`);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete service "${name}"?`)) {
      await api.services.delete(id);
      fetchProcesses();
    }
  };

  const filtered = processes.filter((p) =>
    p.processName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.processCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-5 font-sans transition-colors duration-200 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
      {/* 1. Header Banner */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border shadow-sm ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div>
          <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-600" />
            SERVICE RATES
          </h1>
          <p className={`text-xs font-semibold mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Heat Treatment Services, Process List &amp; Rates (₹/Kg, ₹/Pc)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={`flex items-center p-1 rounded-lg border text-xs font-semibold ${
          isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'services'
                ? 'bg-orange-600 text-white shadow font-bold'
                : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            Rates &amp; Services ({processes.length})
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-orange-600 text-white shadow font-bold'
                : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            Process Guide
          </button>
        </div>
      </div>

      {/* 2. Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3 top-2.5 h-4 w-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            placeholder="Search service name, process code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-orange-500 ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add New Service</span>
          </button>

          <button
            onClick={fetchProcesses}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Refresh Services"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. TAB 1: SERVICES & RATES TABLE */}
      {activeTab === 'services' && (
        <div className={`rounded-xl border overflow-hidden shadow-sm ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs font-semibold">Loading services...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Flame className="h-10 w-10 mx-auto mb-2 text-slate-400 opacity-60" />
              <div className="font-bold text-slate-800 dark:text-slate-200">No Services Registered</div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Click "+ Add New Service" to create heat treatment service offerings and set rate per Kg (₹/Kg).
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`text-[10px] uppercase font-bold tracking-wider border-b ${
                    isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    <th className="p-3">Service Code</th>
                    <th className="p-3">Service Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Rate / Kg</th>
                    <th className="p-3 text-right">Rate / Piece</th>
                    <th className="p-3 text-right">Min Charge</th>
                    <th className="p-3">SAC Code</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800 text-slate-200'
                }`}>
                  {filtered.map((p) => (
                    <tr key={p._id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}>
                      <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                        {p.processCode}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {p.processName}
                        <div className="text-[10px] text-slate-500 font-mono">
                          {p.defaultTempRange ? `${p.defaultTempRange.min}°C - ${p.defaultTempRange.max}°C` : ''} &bull; Quench: {p.quenchMedium || 'OIL'}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                          {p.category?.replace(/_/g, ' ') || 'THERMO CHEMICAL'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                        ₹ {p.ratePerKg ? p.ratePerKg.toFixed(2) : '0.00'} / Kg
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        ₹ {p.ratePerPc ? p.ratePerPc.toFixed(2) : '0.00'}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-600 dark:text-slate-400">
                        ₹ {p.minCharge ? p.minCharge.toFixed(2) : '0.00'}
                      </td>
                      <td className="p-3 font-mono text-slate-500 text-[11px]">
                        {p.sacCode || '998873'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-blue-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-blue-400'
                            }`}
                            title="Edit Service & Rate"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, p.processName)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isLight ? 'bg-slate-100 hover:bg-rose-100 text-rose-700 border-slate-300' : 'bg-slate-800 hover:bg-rose-950 text-rose-400 border-slate-700'
                            }`}
                            title="Delete Service"
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

      {/* 4. TAB 2: TECHNICAL GUIDE */}
      {activeTab === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <div className="text-xl">🔥</div>
            <h3 className="font-bold text-sm">Gas Carburizing &amp; Hardening</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Diffuses carbon into low-carbon steel components (20MnCr5, EN353) at 900–930°C in endothermic gas atmosphere to create a glass-hard wear-resistant case with tough ductile core.
            </p>
            <div className="text-[11px] font-mono font-bold text-orange-600">Typical Rates: ₹ 16 - ₹ 26 / Kg</div>
          </div>

          <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <div className="text-xl">⚡</div>
            <h3 className="font-bold text-sm">Through Hardening &amp; Tempering</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Heats medium/high-carbon alloy steels (EN8, EN19, EN24) to austenitic range (840–880°C), followed by rapid oil quenching and controlled tempering to achieve specified HRC hardness.
            </p>
            <div className="text-[11px] font-mono font-bold text-blue-600">Typical Rates: ₹ 14 - ₹ 22 / Kg</div>
          </div>

          <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <div className="text-xl">🛡️</div>
            <h3 className="font-bold text-sm">Annealing &amp; Stress Relieving</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Slow heating and furnace cooling cycles to soften forged/cast metal, refine grain structures, and relieve internal stresses prior to machining.
            </p>
            <div className="text-[11px] font-mono font-bold text-emerald-600">Typical Rates: ₹ 10 - ₹ 18 / Kg</div>
          </div>
        </div>
      )}

      {/* 5. MODAL: ADD / EDIT SERVICE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className={`border rounded-2xl max-w-lg w-full p-4 sm:p-5 space-y-4 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-orange-600">
                <Flame className="h-4 w-4" />
                {editingId ? 'Edit Heat Treatment Service' : 'Add New Service & Rate'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-500 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <CreatableSelect
                  dropdownKey="serviceProcessName"
                  label="Service Name *"
                  value={form.processName}
                  onChange={(val) => setForm({ ...form, processName: val })}
                  placeholder="-- Select or Enter Service Name --"
                  addPlaceholder="Type custom heat treatment process name..."
                  isLight={isLight}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1">Service Code</label>
                  <input
                    type="text"
                    value={form.processCode}
                    onChange={(e) => setForm({ ...form, processCode: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                    }`}
                    required
                  />
                </div>
                <div>
                  <CreatableSelect
                    dropdownKey="serviceCategory"
                    label="Category"
                    value={form.category}
                    onChange={(val) => setForm({ ...form, category: val })}
                    placeholder="-- Select Category --"
                    addPlaceholder="Type custom category..."
                    isLight={isLight}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1">Rate / Kg (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 18.00"
                    value={form.ratePerKg}
                    onChange={(e) => setForm({ ...form, ratePerKg: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1">Rate / Piece (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 2.50"
                    value={form.ratePerPc}
                    onChange={(e) => setForm({ ...form, ratePerPc: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1">Min Batch Charge (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={form.minCharge}
                    onChange={(e) => setForm({ ...form, minCharge: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <CreatableSelect
                    dropdownKey="quenchMedium"
                    label="Quenching Medium"
                    value={form.quenchMedium}
                    onChange={(val) => setForm({ ...form, quenchMedium: val })}
                    placeholder="-- Select Quenching Medium --"
                    addPlaceholder="Type custom quench medium..."
                    isLight={isLight}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1">GST SAC Code</label>
                  <input
                    type="text"
                    value={form.sacCode}
                    onChange={(e) => setForm({ ...form, sacCode: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow cursor-pointer"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;

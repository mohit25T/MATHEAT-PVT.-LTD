import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  ShieldCheck,
  Plus,
  Lock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import api from '../api/client';
import CreatableSelect from '../components/CreatableSelect';

export const RecipesPage = () => {
  const [recipes, setRecipes] = useState(() => {
    const cached = api.cache.get('/recipes');
    return Array.isArray(cached) ? cached : (cached?.recipes || []);
  });
  const [loading, setLoading] = useState(() => {
    const cached = api.cache.get('/recipes');
    const list = Array.isArray(cached) ? cached : (cached?.recipes || []);
    return list.length === 0;
  });
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    code: '',
    name: '',
    materialGrade: '',
    targetTemp: '',
    soakMinutes: '',
    carbonPotential: '',
    quenchMedium: '',
    quenchTemp: '',
    transferTimeSeconds: '15',
    temperingTemp: '',
    temperingTime: '',
    requiredHardness: '58-62 HRC',
    requiredCaseDepth: '0.80 - 1.10 mm'
  });

  const loadRecipes = async () => {
    try {
      const res = await api.recipes.getAll().catch(() => ({ recipes: [] }));
      const list = res?.recipes || (Array.isArray(res) ? res : []);
      setRecipes(list);
    } catch (err) {
      console.warn('[RECIPES] Failed to load recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();

    const handleSync = () => {
      loadRecipes();
    };

    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const handleCreateRecipe = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = {
        recipeCode: form.code || `RCP-${(form.materialGrade || 'STD').toUpperCase()}`,
        code: form.code,
        recipeName: form.name || `${form.materialGrade || 'Standard'} Heat Treatment Cycle`,
        name: form.name,
        materialGrade: form.materialGrade || 'EN31',
        targetTemperature: parseFloat(form.targetTemp) || 850,
        targetTemp: parseFloat(form.targetTemp) || 850,
        soakingTimeMinutes: parseInt(form.soakMinutes) || 90,
        soakMinutes: parseInt(form.soakMinutes) || 90,
        carbonPotential: parseFloat(form.carbonPotential) || 0.9,
        quenchMedium: form.quenchMedium || 'OIL',
        targetQuenchTemperature: parseFloat(form.quenchTemp) || 60,
        quenchTemp: parseFloat(form.quenchTemp) || 60,
        transferTimeSeconds: parseInt(form.transferTimeSeconds) || 15,
        temperingTemperature: parseFloat(form.temperingTemp) || 180,
        temperingTemp: parseFloat(form.temperingTemp) || 180,
        temperingTimeMinutes: parseInt(form.temperingTime) || 120,
        temperingTime: parseInt(form.temperingTime) || 120,
        requiredHardness: form.requiredHardness || '58-62 HRC',
        requiredCaseDepth: form.requiredCaseDepth || '0.80 - 1.10 mm',
        isApproved: true
      };

      await api.recipes.create(payload);
      await loadRecipes();
      setShowModal(false);
      setForm({
        code: '',
        name: '',
        materialGrade: '',
        targetTemp: '',
        soakMinutes: '',
        carbonPotential: '',
        quenchMedium: '',
        quenchTemp: '',
        temperingTemp: '',
        temperingTime: ''
      });
      setSuccessMsg('Heat Treatment Recipe saved to database successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error creating recipe:', err);
      setErrorMsg(err.message || 'Failed to save recipe');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecipe = async (id, rCode) => {
    if (!window.confirm(`Are you sure you want to delete recipe ${rCode}?`)) return;
    try {
      await api.recipes.delete(id);
      setSuccessMsg(`Recipe ${rCode} deleted`);
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadRecipes();
    } catch (err) {
      console.error('Failed to delete recipe:', err);
      setErrorMsg(err.message || 'Failed to delete recipe');
    }
  };

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
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            Approved Recipe Studio &amp; Version Control (V1, V2...)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Strict metallurgical parameters: Target temperatures, soak times, atmosphere CP, quenching &amp; tempering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadRecipes}
            disabled={loading}
            title="Refresh Recipes"
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create New Recipe
          </button>
        </div>
      </div>

      {/* Recipes Cards or Loading or Empty State */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
          <Loader2 className="h-8 w-8 text-orange-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading recipes from database...</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
          <div className="h-14 w-14 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FlaskConical className="h-7 w-7 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            No Heat Treatment Recipes Defined
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            All sample recipe templates have been cleared. Standardize your furnace austenitizing, soak, carbon potential, and tempering cycles here for consistent metallurgical quality.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> + Create New Recipe
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recipes.map((r) => {
            const rCode = r.recipeCode || r.code || 'RCP-STD';
            const rName = r.recipeName || r.name || 'Standard Cycle';
            const rMat = r.materialGrade || 'EN31';
            const rTarget = r.targetTemperature ?? r.targetTemp ?? 850;
            const rSoak = r.soakingTimeMinutes ?? r.soakMinutes ?? 90;
            const rCp = r.carbonPotential ?? 0.9;
            const rQMed = r.quenchMedium || 'OIL';
            const rQTemp = r.targetQuenchTemperature ?? r.quenchTemp ?? 60;
            const rTTemp = r.temperingTemperature ?? r.temperingTemp ?? 180;
            const rTTime = r.temperingTimeMinutes ?? r.temperingTime ?? 120;
            const rRev = r.revision || 'V1';

            return (
              <div key={r._id || rCode} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-orange-600 dark:text-orange-400 text-sm">{rCode}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded">
                      {rRev}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded">
                      <Lock className="h-3 w-3" /> APPROVED
                    </span>
                    {r._id && (
                      <button
                        onClick={() => handleDeleteRecipe(r._id, rCode)}
                        title="Delete Recipe"
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{rName}</h3>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mt-1">Material: {rMat}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Hardening Temp</span>
                    <strong className="text-slate-900 dark:text-white">{rTarget} °C</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Soak Time</span>
                    <strong className="text-slate-900 dark:text-white">{rSoak} min</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Carbon Potential</span>
                    <strong className="text-slate-900 dark:text-white">{rCp}% CP</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Quench</span>
                    <strong className="text-slate-900 dark:text-white">{rQMed} @ {rQTemp}°C</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Tempering Spec:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{rTTemp}°C &bull; {rTTime} min</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Recipe Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                Define Metallurgical Heat Treatment Recipe
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRecipe} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Recipe Code</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. RCP-EN31-STD"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Recipe Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. EN31 Carburizing + Tempering"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <CreatableSelect
                  dropdownKey="materialGrade"
                  label="Steel Material Grade"
                  value={form.materialGrade}
                  onChange={(val) => setForm({ ...form, materialGrade: val })}
                  placeholder="-- Select Standard Steel Grade --"
                  addPlaceholder="Type custom steel grade (e.g. SCM415)..."
                  required
                />

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Hardening Temp (°C) *</label>
                  <input
                    type="number"
                    value={form.targetTemp}
                    onChange={(e) => setForm({ ...form, targetTemp: e.target.value })}
                    placeholder="850"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Soaking Time (Minutes) *</label>
                  <input
                    type="number"
                    value={form.soakMinutes}
                    onChange={(e) => setForm({ ...form, soakMinutes: e.target.value })}
                    placeholder="90"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Carbon Potential (%CP)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={form.carbonPotential}
                    onChange={(e) => setForm({ ...form, carbonPotential: e.target.value })}
                    placeholder="0.90"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <CreatableSelect
                  dropdownKey="quenchMedium"
                  label="Quenching Medium"
                  value={form.quenchMedium}
                  onChange={(val) => setForm({ ...form, quenchMedium: val })}
                  options={[
                    { value: 'OIL', label: 'OIL (Fast Quench ISO 32)' },
                    { value: 'WATER', label: 'WATER' },
                    { value: 'POLYMER', label: 'POLYMER' },
                    { value: 'AIR', label: 'AIR' }
                  ]}
                  placeholder="-- Select Quench Medium --"
                  addPlaceholder="Add custom medium..."
                />

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Quench Oil Temp (°C)</label>
                  <input
                    type="number"
                    value={form.quenchTemp}
                    onChange={(e) => setForm({ ...form, quenchTemp: e.target.value })}
                    placeholder="60"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Tempering Temp (°C) *</label>
                  <input
                    type="number"
                    value={form.temperingTemp}
                    onChange={(e) => setForm({ ...form, temperingTemp: e.target.value })}
                    placeholder="180"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Tempering Time (Minutes) *</label>
                  <input
                    type="number"
                    value={form.temperingTime}
                    onChange={(e) => setForm({ ...form, temperingTime: e.target.value })}
                    placeholder="120"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Door-to-Quench Transfer Time (Sec)</label>
                  <input
                    type="number"
                    value={form.transferTimeSeconds}
                    onChange={(e) => setForm({ ...form, transferTimeSeconds: e.target.value })}
                    placeholder="15"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Required Hardness Target</label>
                  <input
                    type="text"
                    value={form.requiredHardness}
                    onChange={(e) => setForm({ ...form, requiredHardness: e.target.value })}
                    placeholder="58-62 HRC"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Required Effective Case Depth</label>
                  <input
                    type="text"
                    value={form.requiredCaseDepth}
                    onChange={(e) => setForm({ ...form, requiredCaseDepth: e.target.value })}
                    placeholder="0.80 - 1.10 mm"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
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
                  disabled={submitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving Recipe...
                    </>
                  ) : (
                    'Save & Approve Recipe (V1)'
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
export default RecipesPage;

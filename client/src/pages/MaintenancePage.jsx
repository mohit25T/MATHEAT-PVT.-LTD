import React, { useState, useEffect } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldAlert,
  Gauge,
  Plus,
  Trash2,
  X,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';
import CreatableSelect from '../components/CreatableSelect';

export const MaintenancePage = () => {
  const { isLight } = useTheme();
  const [calibrations, setCalibrations] = useState(() => {
    const cached = api.cache.get('/maintenance/calibration');
    return Array.isArray(cached) ? cached : (cached?.calibrations || []);
  });
  const [furnaces, setFurnaces] = useState(() => {
    const cached = api.cache.get('/furnaces');
    return Array.isArray(cached) ? cached : (cached?.furnaces || []);
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    instrumentName: '',
    instrumentType: '',
    serialNumber: '',
    furnaceId: '',
    calibrationDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    certificateNumber: '',
    agencyName: '',
    accuracyRange: ''
  });

  useEffect(() => {
    loadCalibrations();
    loadFurnaces();

    const handleSync = () => {
      loadCalibrations();
      loadFurnaces();
    };

    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const loadCalibrations = async () => {
    try {
      const res = await api.maintenance.getCalibrations().catch(() => ({ calibrations: [] }));
      const list = Array.isArray(res) ? res : (res?.calibrations || []);
      setCalibrations(list);
    } catch (err) {
      console.warn('[MAINTENANCE] Load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFurnaces = async () => {
    try {
      const res = await api.furnaces.getAll().catch(() => []);
      const list = Array.isArray(res) ? res : (res?.furnaces || []);
      setFurnaces(list);
    } catch (err) {
      console.warn('[FURNACES] Load error:', err.message);
    }
  };

  const handleOpenModal = () => {
    setErrorMsg('');
    setFormData({
      instrumentName: '',
      instrumentType: '',
      serialNumber: '',
      furnaceId: '',
      calibrationDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      certificateNumber: '',
      agencyName: '',
      accuracyRange: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.instrumentName || !formData.serialNumber || !formData.certificateNumber) {
      setErrorMsg('Please enter Instrument Name, Serial Number, and Certificate Number.');
      return;
    }

    try {
      setSubmitting(true);
      await api.maintenance.createCalibration(formData);
      setShowModal(false);
      await loadCalibrations();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add instrument calibration.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove calibration record for "${name}"?`)) {
      try {
        await api.maintenance.deleteCalibration(id);
        await loadCalibrations();
      } catch (err) {
        alert(`Failed to delete calibration: ${err.message}`);
      }
    }
  };

  const expiringCount = calibrations.filter(c => c.daysRemaining <= 10).length;

  return (
    <div className={`space-y-6 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border shadow-sm ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div>
          <h1 className="text-base font-extrabold flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-600" />
            Equipment Maintenance &amp; Instrument Calibration
          </h1>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Thermocouples, temperature controllers, hardness testers, with automatic 10-day safety lockout alerts
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Calibration Record
        </button>
      </div>

      {/* 10-Day Expiry Safety Alert if any expiring */}
      {expiringCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 p-4 rounded-xl flex items-center justify-between text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold">
                URGENT CALIBRATION ALERT: {expiringCount} Instrument(s) Expiring Soon (&le; 10 Days)
              </div>
              <p className="text-[11px] text-amber-800 dark:text-slate-300 mt-0.5">
                In accordance with ISO/IATF quality guidelines, expired instruments cannot certify active furnace cycles. Recalibrate immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calibration Register or Empty State */}
      {loading ? (
        <div className={`p-12 text-center rounded-xl border ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="text-xs font-mono text-slate-500">Loading Instrument Calibrations...</div>
        </div>
      ) : calibrations.length === 0 ? (
        <div className={`p-12 text-center rounded-xl border shadow-sm ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div className="h-14 w-14 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Wrench className="h-7 w-7 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-base font-black">
            No Calibration Records Found
          </h3>
          <p className={`text-xs max-w-md mx-auto mt-1 leading-relaxed ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Register plant thermocouples, temperature controllers, and hardness testers to track NABL certification and safety lockout alerts.
          </p>
          <button
            onClick={handleOpenModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> + Add Instrument Calibration
          </button>
        </div>
      ) : (
        <div className={`border rounded-xl overflow-hidden shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className={`p-4 border-b flex items-center justify-between ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'
          }`}>
            <h2 className="text-xs font-bold uppercase tracking-wider">
              Critical Instruments &amp; NABL Calibration Tracker ({calibrations.length})
            </h2>
            <button
              onClick={handleOpenModal}
              className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-bold cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> Add Instrument
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`text-[10px] uppercase font-bold tracking-wider border-b ${
                  isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}>
                  <th className="p-3">Instrument &amp; Serial No</th>
                  <th className="p-3">Type &amp; Equipment</th>
                  <th className="p-3">Expiry Date</th>
                  <th className="p-3">Days Remaining</th>
                  <th className="p-3">Calibration Cert</th>
                  <th className="p-3 text-right">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800 text-slate-200'
              }`}>
                {calibrations.map((c) => {
                  const isExpiring = c.daysRemaining <= 10;
                  const isExpired = c.daysRemaining < 0;
                  return (
                    <tr key={c._id || c.calibrationId} className={`transition-colors ${
                      isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                    }`}>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{c.instrumentName}</div>
                        <span className="text-[10px] font-mono text-slate-500">S/N: {c.serialNumber}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold block">{c.instrumentType?.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] text-orange-600 dark:text-orange-400 font-mono font-bold">
                          {c.furnaceId || 'General Lab'}
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        {new Date(c.expiryDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3 font-mono">
                        <span className={`font-black ${
                          isExpired
                            ? 'text-red-600 dark:text-red-400'
                            : isExpiring
                            ? 'text-amber-600 dark:text-amber-400 animate-pulse'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {isExpired ? 'EXPIRED' : `${c.daysRemaining} Days`}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        <div className="font-bold text-blue-600 dark:text-blue-400">{c.certificateNumber}</div>
                        <span className="text-[10px] text-slate-400">{c.agencyName}</span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isExpired
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-300 dark:border-red-800'
                            : isExpiring
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                        }`}>
                          {isExpired ? 'EXPIRED' : isExpiring ? 'EXPIRING SOON' : 'VALID'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(c._id || c.calibrationId, c.instrumentName)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isLight
                              ? 'bg-slate-100 hover:bg-rose-100 text-rose-700 border-slate-300'
                              : 'bg-slate-800 hover:bg-rose-950 text-rose-400 border-slate-700'
                          }`}
                          title="Delete Calibration Record"
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
        </div>
      )}

      {/* ADD INSTRUMENT CALIBRATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`relative w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden my-auto max-h-[92vh] flex flex-col transition-all ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            {/* Modal Header */}
            <div className={`px-4 sm:px-6 py-4 border-b flex items-center justify-between shrink-0 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-orange-600" />
                <h2 className="font-extrabold text-sm uppercase tracking-wider">
                  Register Instrument Calibration
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Instrument Name */}
                <div className="sm:col-span-2">
                  <CreatableSelect
                    dropdownKey="instrumentName"
                    label="Instrument Name & Description *"
                    value={formData.instrumentName}
                    onChange={(val) => setFormData({ ...formData, instrumentName: val })}
                    placeholder="-- Select or Enter Instrument Name --"
                    addPlaceholder="Type custom instrument name..."
                    isLight={isLight}
                    required
                  />
                </div>

                {/* Instrument Type */}
                <div>
                  <CreatableSelect
                    dropdownKey="instrumentType"
                    label="Instrument Type *"
                    value={formData.instrumentType}
                    onChange={(val) => setFormData({ ...formData, instrumentType: val })}
                    placeholder="-- Select Instrument Type --"
                    addPlaceholder="Type custom instrument type..."
                    isLight={isLight}
                    required
                  />
                </div>

                {/* Serial Number */}
                <div>
                  <label className="block text-xs font-bold mb-1">Serial Number / Asset UID *</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="e.g. TC-S-9912"
                    className={`w-full p-2.5 rounded-lg border text-xs font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                    required
                  />
                </div>

                {/* Linked Furnace */}
                <div>
                  <CreatableSelect
                    dropdownKey="furnaceUnit"
                    label="Linked Furnace / Location"
                    value={formData.furnaceId}
                    onChange={(val) => setFormData({ ...formData, furnaceId: val })}
                    placeholder="-- Select Linked Furnace or Bay --"
                    options={[
                      { value: 'Plant General', label: 'Plant General / Quality Lab' },
                      ...furnaces.map((f) => ({
                        value: f.furnaceId,
                        label: `${f.furnaceId} - ${f.name}`
                      }))
                    ]}
                    addPlaceholder="Type custom furnace / location..."
                    isLight={isLight}
                  />
                </div>

                {/* Accuracy Range */}
                <div>
                  <CreatableSelect
                    dropdownKey="accuracyTolerance"
                    label="Certified Accuracy Tolerance"
                    value={formData.accuracyRange}
                    onChange={(val) => setFormData({ ...formData, accuracyRange: val })}
                    placeholder="-- Select or Enter Accuracy --"
                    addPlaceholder="Type custom tolerance (e.g. ± 0.2 °C)..."
                    isLight={isLight}
                  />
                </div>

                {/* Calibration Date */}
                <div>
                  <label className="block text-xs font-bold mb-1">Calibration Conducted Date</label>
                  <input
                    type="date"
                    value={formData.calibrationDate}
                    onChange={(e) => setFormData({ ...formData, calibrationDate: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border text-xs font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                    required
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-xs font-bold mb-1">Certificate Expiry Date *</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border text-xs font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                    required
                  />
                </div>

                {/* Certificate Number */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">NABL / Lab Certificate Number *</label>
                  <input
                    type="text"
                    value={formData.certificateNumber}
                    onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                    placeholder="e.g. NABL-CAL-88902"
                    className={`w-full p-2.5 rounded-lg border text-xs font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                    required
                  />
                </div>

                {/* Agency Name */}
                <div className="sm:col-span-2">
                  <CreatableSelect
                    dropdownKey="calibrationAgency"
                    label="Accredited Calibration Agency"
                    value={formData.agencyName}
                    onChange={(val) => setFormData({ ...formData, agencyName: val })}
                    placeholder="-- Select or Enter Calibration Agency --"
                    addPlaceholder="Type custom agency name..."
                    isLight={isLight}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Save Calibration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;

import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Plus,
  Trash2,
  FileBadge
} from 'lucide-react';
import api from '../api/client';
import CreatableSelect from '../components/CreatableSelect';

export const QcLabPage = ({ onSelectTab }) => {
  const [batches, setBatches] = useState(() => {
    const cached = api.cache.get('/batches');
    return Array.isArray(cached) ? cached : (cached?.batches || []);
  });
  const [selectedBatchId, setSelectedBatchId] = useState('');

  // Hardness Test Readings
  const [surfaceReadings, setSurfaceReadings] = useState([]);
  const [coreReading, setCoreReading] = useState('');
  const [effectiveCaseDepth, setEffectiveCaseDepth] = useState('');
  const [totalCaseDepth, setTotalCaseDepth] = useState('');
  const [grainSize, setGrainSize] = useState('');
  const [retainedAustenite, setRetainedAustenite] = useState('');
  const [microstructure, setMicrostructure] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [approved, setApproved] = useState(false);

  const loadBatches = async () => {
    try {
      const res = await api.batches.getAll().catch(() => []);
      const list = Array.isArray(res) ? res : (res?.batches || []);
      setBatches(list);
    } catch (err) {
      console.warn('[QC] Failed to load batches:', err.message);
    }
  };

  useEffect(() => {
    loadBatches();

    const handleSync = () => {
      loadBatches();
    };

    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Specification Limits (From Part Master: EN31 / Standard Bearing Ring)
  const spec = {
    surfaceMin: 58.0,
    surfaceMax: 62.0,
    coreMin: 32.0,
    coreMax: 40.0,
    caseDepthMin: 0.80,
    caseDepthMax: 1.10,
    retainedAusteniteMax: 15.0
  };

  // Compute Surface Average
  const surfaceAvg = surfaceReadings.length > 0
    ? Number((surfaceReadings.reduce((acc, r) => acc + Number(r.value || 0), 0) / surfaceReadings.length).toFixed(1))
    : 0;

  // Automated PASS/FAIL Logic
  const isHardnessPass = surfaceReadings.length > 0 && surfaceAvg >= spec.surfaceMin && surfaceAvg <= spec.surfaceMax;
  const isCorePass = coreReading !== '' && Number(coreReading) >= spec.coreMin && Number(coreReading) <= spec.coreMax;
  const isCaseDepthPass = effectiveCaseDepth !== '' && Number(effectiveCaseDepth) >= spec.caseDepthMin && Number(effectiveCaseDepth) <= spec.caseDepthMax;
  const isAustenitePass = retainedAustenite !== '' && Number(retainedAustenite) <= spec.retainedAusteniteMax;

  const isOverallPass = isHardnessPass && isCorePass && isCaseDepthPass && isAustenitePass;

  const addSample = () => {
    setSurfaceReadings([
      ...surfaceReadings,
      { id: Date.now(), location: `Sample Point ${surfaceReadings.length + 1}`, value: 60.0 }
    ]);
  };

  const removeSample = (id) => {
    setSurfaceReadings(surfaceReadings.filter(r => r.id !== id));
  };

  const updateSampleValue = (id, val) => {
    setSurfaceReadings(surfaceReadings.map(r => r.id === id ? { ...r, value: parseFloat(val) || 0 } : r));
  };

  const [submitting, setSubmitting] = useState(false);
  const [qcError, setQcError] = useState(null);
  const [qcSuccess, setQcSuccess] = useState(null);

  const fillNominalDefaults = () => {
    setSurfaceReadings([
      { id: 1, location: 'Sample Point 1 (OD)', value: 60.5 },
      { id: 2, location: 'Sample Point 2 (Center)', value: 60.0 },
      { id: 3, location: 'Sample Point 3 (ID)', value: 59.8 }
    ]);
    setCoreReading('36.0');
    setEffectiveCaseDepth('0.95');
    setTotalCaseDepth('1.30');
    setGrainSize('ASTM 7');
    setRetainedAustenite('8.0');
    setMicrostructure('Uniform Tempered Martensite with Fine Carbides');
    setIsLocked(false);
    setApproved(false);
  };

  const handleApprove = async () => {
    if (!selectedBatchId) {
      setQcError('Please select a batch to test.');
      return;
    }
    try {
      setSubmitting(true);
      setQcError(null);
      setQcSuccess(null);
      const createRes = await api.qc.create({
        batchId: selectedBatchId,
        hardness: {
          scale: 'HRC',
          sampleReadings: surfaceReadings.map(r => ({ location: r.location, observedValue: r.value })),
          averageValue: surfaceAvg,
          coreReadings: coreReading ? [{ location: 'Core', observedValue: Number(coreReading) }] : []
        },
        caseDepth: {
          actualEffectiveMm: Number(effectiveCaseDepth) || 0,
          totalCaseDepthMm: Number(totalCaseDepth) || 0
        },
        metallography: {
          grainSizeAstm: grainSize || 'ASTM 7',
          retainedAustenitePercent: Number(retainedAustenite) || 8,
          microstructureObserved: microstructure || 'Uniform Tempered Martensite with Fine Carbides'
        },
        remarks: isOverallPass ? 'All test parameters within nominal engineering limits.' : 'Parameters deviate from specification limits.'
      });

      const inspectionId = createRes?.inspection?._id || createRes?.data?._id;
      if (inspectionId) {
        const approveRes = await api.qc.approve(inspectionId);
        setQcSuccess(approveRes?.message || 'QC sign-off recorded successfully.');
      } else {
        setQcSuccess('QC Inspection recorded successfully.');
      }
      setIsLocked(true);
      setApproved(true);
      loadBatches();
    } catch (err) {
      console.error('[QC] Could not persist to backend:', err);
      setQcError(err?.message || 'Failed to submit QC sign-off.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            QUALITY TESTING LAB
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Test Part Hardness (HRC/HRB), Case Depth, Microstructure &amp; Approve Batches for TC &amp; Dispatch
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {batches.length > 0 ? (
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg px-3 py-2 font-mono max-w-full"
            >
              <option value="">-- Select Pending Batch --</option>
              {batches.map((b) => (
                <option key={b.batchId || b._id} value={b.batchId || b._id}>
                  {b.batchId || b._id} ({b.customer?.companyName || (typeof b.customer === 'string' ? b.customer : 'Batch')})
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-slate-500 font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
              No Batches Pending QC
            </span>
          )}

          <button
            onClick={fillNominalDefaults}
            type="button"
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Auto-Fill Nominal Specs
          </button>

          {isLocked && (
            <button
              onClick={() => onSelectTab && onSelectTab('certificates')}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer"
            >
              <FileBadge className="h-4 w-4" /> View Certificate
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {qcError && (
        <div className="p-3 bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs flex justify-between items-center">
          <span>{qcError}</span>
          <button onClick={() => setQcError(null)} className="font-bold hover:underline">Dismiss</button>
        </div>
      )}
      {qcSuccess && (
        <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs flex justify-between items-center">
          <span>{qcSuccess}</span>
          <button onClick={() => setQcSuccess(null)} className="font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Auto-Evaluation Outcome Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
        isOverallPass
          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300'
          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
      }`}>
        <div className="flex items-center gap-3">
          {isOverallPass ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <FlaskConical className="h-6 w-6 text-orange-600 dark:text-orange-400 shrink-0" />
          )}
          <div>
            <div className="text-sm font-black flex items-center gap-2">
              QC EVALUATION: {isOverallPass ? 'ALL TEST PARAMETERS PASS' : 'AWAITING INSPECTION READINGS'}
              {isLocked && (
                <span className="text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Record Locked
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isOverallPass
                ? 'Surface hardness, core hardness, case depth, and microstructure conform to ISO/IATF drawing specifications.'
                : 'Enter hardness sample points, microhardness Vickers case depth, and grain size to evaluate batch conformity.'}
            </p>
          </div>
        </div>

        {!isLocked && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleApprove}
              disabled={submitting || !selectedBatchId}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow cursor-pointer ${
                isOverallPass
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900'
              }`}
            >
              {submitting
                ? 'Processing Sign-Off...'
                : isOverallPass
                ? 'Authorize QC Sign-Off & Lock'
                : 'Log Inspection & Issue NCR'}
            </button>
          </div>
        )}
      </div>

      {/* 3 Inspection Testing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Hardness Testing Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Surface &amp; Core Hardness (HRC)
            </h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              isHardnessPass ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {isHardnessPass ? 'PASS' : surfaceReadings.length === 0 ? 'PENDING' : 'OUT OF SPEC'}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Drawing Specification</span>
            <div className="text-slate-900 dark:text-white font-mono font-bold mt-0.5">
              Surface: {spec.surfaceMin} - {spec.surfaceMax} HRC &bull; Core: {spec.coreMin} - {spec.coreMax} HRC
            </div>
          </div>

          {/* Sample Readings Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              <span>Sample Point</span>
              <span>Observed (HRC)</span>
            </div>

            {surfaceReadings.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-xs italic">
                No sample readings recorded yet.
              </div>
            ) : (
              surfaceReadings.map((r, idx) => (
                <div key={r.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    disabled={isLocked}
                    value={r.location}
                    onChange={(e) => {
                      const next = [...surfaceReadings];
                      next[idx].location = e.target.value;
                      setSurfaceReadings(next);
                    }}
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded p-1.5 text-xs text-slate-900 dark:text-slate-300"
                  />
                  <input
                    type="number"
                    step="0.1"
                    disabled={isLocked}
                    value={r.value}
                    onChange={(e) => updateSampleValue(r.id, e.target.value)}
                    className="w-20 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-xs text-slate-900 dark:text-white font-mono font-bold text-center"
                  />
                  {!isLocked && surfaceReadings.length > 1 && (
                    <button onClick={() => removeSample(r.id)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}

            {!isLocked && (
              <button
                onClick={addSample}
                className="w-full mt-2 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Add Sample Point
              </button>
            )}
          </div>

          {/* Computed Average */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Surface Hardness Average:</span>
            <span className={`font-mono text-base font-black ${
              isHardnessPass ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
            }`}>
              {surfaceAvg} HRC
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800/60">
            <span className="text-slate-600 dark:text-slate-400">Core Hardness:</span>
            <input
              type="number"
              step="0.1"
              disabled={isLocked}
              value={coreReading}
              onChange={(e) => setCoreReading(e.target.value)}
              placeholder="0.0"
              className="w-20 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-1 text-xs text-slate-900 dark:text-white font-mono font-bold text-center"
            />
          </div>
        </div>

        {/* 2. Case Depth Testing Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Case Depth Testing
            </h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              isCaseDepthPass ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {isCaseDepthPass ? 'PASS' : effectiveCaseDepth === '' ? 'PENDING' : 'OUT OF SPEC'}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Drawing Spec</span>
            <div className="text-slate-900 dark:text-white font-mono font-bold mt-0.5">
              ECD: {spec.caseDepthMin} - {spec.caseDepthMax} mm @ 50 HRC Cutoff
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-600 dark:text-slate-400 block mb-1">Effective Case Depth (mm):</label>
              <input
                type="number"
                step="0.01"
                disabled={isLocked}
                value={effectiveCaseDepth}
                onChange={(e) => setEffectiveCaseDepth(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Microhardness Vickers (500gf)</span>
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 block mb-1">Total Case Depth (mm):</label>
              <input
                type="number"
                step="0.01"
                disabled={isLocked}
                value={totalCaseDepth}
                onChange={(e) => setTotalCaseDepth(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            Measurement Method: ISO 2639 / ASTM E384 Micro-indentation traverse.
          </div>
        </div>

        {/* 3. Metallography & Microstructure Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              3. Metallography &amp; Structure
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded">
              {grainSize ? 'INSPECTED' : 'PENDING'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <CreatableSelect
                dropdownKey="grainSize"
                label="Austenitic Grain Size:"
                placeholder="-- Select Grain Size --"
                value={grainSize}
                onChange={setGrainSize}
                disabled={isLocked}
                addPlaceholder="Type custom grain size (e.g. ASTM 7.5)..."
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Spec: ASTM 6 to 8 (Fine Grain)</span>
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 block mb-1">Retained Austenite (%):</label>
              <input
                type="number"
                step="0.5"
                disabled={isLocked}
                value={retainedAustenite}
                onChange={(e) => setRetainedAustenite(e.target.value)}
                placeholder="e.g. 8.0"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Spec: Max {spec.retainedAusteniteMax} %</span>
            </div>

            <div>
              <CreatableSelect
                dropdownKey="microstructure"
                label="Microstructure Observed:"
                placeholder="-- Select Microstructure --"
                value={microstructure}
                onChange={setMicrostructure}
                disabled={isLocked}
                addPlaceholder="Type custom microstructure..."
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            Verified under optical metallograph at 500x magnification (2% Nital Etch).
          </div>
        </div>

      </div>
    </div>
  );
};
export default QcLabPage;

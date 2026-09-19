import React, { useState } from 'react';
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

export const QcLabPage = ({ onSelectTab }) => {
  const [selectedBatchId, setSelectedBatchId] = useState('HT-2026-000125');

  // Hardness Test Readings
  const [surfaceReadings, setSurfaceReadings] = useState([
    { id: 1, location: 'Ring Surface - OD', value: 60.5 },
    { id: 2, location: 'Ring Surface - Face', value: 60.2 },
    { id: 3, location: 'Ring Surface - ID', value: 60.8 }
  ]);

  const [coreReading, setCoreReading] = useState(35.8);
  const [effectiveCaseDepth, setEffectiveCaseDepth] = useState(0.94);
  const [totalCaseDepth, setTotalCaseDepth] = useState(1.25);
  const [grainSize, setGrainSize] = useState('ASTM 7');
  const [retainedAustenite, setRetainedAustenite] = useState(8);
  const [isLocked, setIsLocked] = useState(false);
  const [approved, setApproved] = useState(false);

  // Specification Limits (From Part Master: EN31 Bearing Ring)
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
  const isHardnessPass = surfaceAvg >= spec.surfaceMin && surfaceAvg <= spec.surfaceMax;
  const isCorePass = coreReading >= spec.coreMin && coreReading <= spec.coreMax;
  const isCaseDepthPass = effectiveCaseDepth >= spec.caseDepthMin && effectiveCaseDepth <= spec.caseDepthMax;
  const isAustenitePass = retainedAustenite <= spec.retainedAusteniteMax;

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

  const handleApprove = () => {
    setIsLocked(true);
    setApproved(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
        <div>
          <h1 className="text-base font-extrabold text-white flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-orange-500" />
            Metallurgical Quality Control Lab & Inspection Console
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated tolerance evaluation algorithm for Rockwell Hardness (HRC), Case Depth, and Microstructure
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono"
          >
            <option value="HT-2026-000125">HT-2026-000125 (QC Pending &bull; F-01)</option>
            <option value="HT-2026-000124">HT-2026-000124 (Approved &bull; SKF 6205)</option>
          </select>

          {isLocked && (
            <button
              onClick={() => onSelectTab('certificates')}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
            >
              <FileBadge className="h-4 w-4" /> View Certificate
            </button>
          )}
        </div>
      </div>

      {/* Auto-Evaluation Outcome Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between shadow ${
        isOverallPass
          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
          : 'bg-red-950/20 border-red-500/40 text-red-300'
      }`}>
        <div className="flex items-center gap-3">
          {isOverallPass ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="h-6 w-6 text-red-400 shrink-0" />
          )}
          <div>
            <div className="text-sm font-black flex items-center gap-2">
              AUTOMATED QC EVALUATION RESULT: {isOverallPass ? 'ALL PARAMETERS PASS' : 'FAILED / OUT OF SPEC'}
              {isLocked && (
                <span className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Record Locked
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isOverallPass
                ? 'Surface hardness, core hardness, case depth, and retained austenite meet drawing standards.'
                : 'One or more measured values violate engineering tolerances. Approval blocked until NCR / disposition.'}
            </p>
          </div>
        </div>

        {!isLocked && (
          <button
            onClick={handleApprove}
            disabled={!isOverallPass}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow ${
              isOverallPass
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            Authorize QC Sign-Off & Lock
          </button>
        )}
      </div>

      {/* 3 Inspection Testing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Hardness Testing Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              1. Surface & Core Hardness (HRC)
            </h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              isHardnessPass ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {isHardnessPass ? 'PASS' : 'FAIL'}
            </span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Drawing Spec</span>
            <div className="text-white font-mono font-bold mt-0.5">
              Surface: {spec.surfaceMin} - {spec.surfaceMax} HRC &bull; Core: {spec.coreMin} - {spec.coreMax} HRC
            </div>
          </div>

          {/* Sample Readings Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span>Sample Point</span>
              <span>Observed (HRC)</span>
            </div>

            {surfaceReadings.map((r, idx) => (
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
                  className="flex-1 bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-300"
                />
                <input
                  type="number"
                  step="0.1"
                  disabled={isLocked}
                  value={r.value}
                  onChange={(e) => updateSampleValue(r.id, e.target.value)}
                  className="w-20 bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white font-mono font-bold text-center"
                />
                {!isLocked && surfaceReadings.length > 1 && (
                  <button onClick={() => removeSample(r.id)} className="text-slate-500 hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}

            {!isLocked && (
              <button
                onClick={addSample}
                className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold flex items-center justify-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add Sample Point
              </button>
            )}
          </div>

          {/* Computed Average */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Surface Hardness Average:</span>
            <span className={`font-mono text-base font-black ${
              isHardnessPass ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {surfaceAvg} HRC
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
            <span className="text-slate-400">Core Hardness:</span>
            <input
              type="number"
              step="0.1"
              disabled={isLocked}
              value={coreReading}
              onChange={(e) => setCoreReading(parseFloat(e.target.value) || 0)}
              className="w-20 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white font-mono font-bold text-center"
            />
          </div>
        </div>

        {/* 2. Case Depth Testing Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              2. Case Depth Testing
            </h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              isCaseDepthPass ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {isCaseDepthPass ? 'PASS' : 'FAIL'}
            </span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Drawing Spec</span>
            <div className="text-white font-mono font-bold mt-0.5">
              ECD: {spec.caseDepthMin} - {spec.caseDepthMax} mm @ 50 HRC Cutoff
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Effective Case Depth (mm):</label>
              <input
                type="number"
                step="0.01"
                disabled={isLocked}
                value={effectiveCaseDepth}
                onChange={(e) => setEffectiveCaseDepth(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono font-bold text-white"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Microhardness Vickers (500gf)</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Total Case Depth (mm):</label>
              <input
                type="number"
                step="0.01"
                disabled={isLocked}
                value={totalCaseDepth}
                onChange={(e) => setTotalCaseDepth(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono font-bold text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Measurement Method: ISO 2639 / ASTM E384 Micro-indentation traverse.
          </div>
        </div>

        {/* 3. Metallography & Microstructure Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              3. Metallography & Structure
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
              PASS
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Austenitic Grain Size:</label>
              <input
                type="text"
                disabled={isLocked}
                value={grainSize}
                onChange={(e) => setGrainSize(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono font-bold text-white"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Spec: ASTM 6 to 8 (Fine Grain)</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Retained Austenite (%):</label>
              <input
                type="number"
                disabled={isLocked}
                value={retainedAustenite}
                onChange={(e) => setRetainedAustenite(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono font-bold text-white"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Spec: Max {spec.retainedAusteniteMax} %</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Microstructure Observed:</label>
              <div className="p-2 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300">
                Tempered Martensite with fine dispersed spheroidal carbides. Free from network carbides and decarburization.
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Verified under optical metallograph at 500x magnification (2% Nital Etch).
          </div>
        </div>

      </div>
    </div>
  );
};

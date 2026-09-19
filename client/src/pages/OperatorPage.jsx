import React, { useState } from 'react';
import {
  UserCheck,
  Flame,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Gauge,
  ShieldCheck,
  Send
} from 'lucide-react';

export const OperatorPage = () => {
  const [selectedBatchId, setSelectedBatchId] = useState('HT-2026-000125');
  const [activeStep, setActiveStep] = useState('RECORD_ACTUALS'); // 'CONFIRM', 'RUNNING', 'RECORD_ACTUALS', 'SUBMITTED'

  // Operator input form for actual readings
  const [actualParams, setActualParams] = useState({
    actualHardeningTemp: 852,
    actualSoakMinutes: 92,
    actualCarbonPotential: 0.91,
    actualQuenchTemp: 62,
    actualTemperingTemp: 182,
    actualTemperingMinutes: 120,
    energyConsumedKwh: 184,
    operatorRemarks: 'Uniform soak observed. Quench agitation normal at 62°C.'
  });

  const [submitted, setSubmitted] = useState(false);

  const batchInfo = {
    batchId: 'HT-2026-000125',
    customer: 'SKF India Bearings Ltd.',
    partNumber: '6205-BRG-RING',
    partName: '6205 Bearing Ring',
    materialGrade: 'EN31',
    heatNumber: 'H-45872',
    loadedWeight: 420,
    quantity: 1500,
    furnaceId: 'F-01 (Sealed Quench Furnace SQF-01)',
    recipeCode: 'RCP-EN31-6205 (Rev V1)',
    targets: {
      temp: '850 °C (±5°)',
      soak: '90 min',
      cp: '0.90 %',
      quench: 'Oil @ 60 °C',
      temper: '180 °C (120 min)'
    }
  };

  const handleCompleteAndSubmitToQC = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setActiveStep('SUBMITTED');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Operator Header */}
      <div className="bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 border border-orange-500/30 p-4 rounded-xl shadow flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-600 rounded-lg text-white font-bold shadow">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-white flex items-center gap-2">
              FURNACE OPERATOR TOUCH CONSOLE
              <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
                BADGE: OP-104 &bull; RAMESH KUMAR
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Simplified shop-floor workflow: Select Batch &rarr; Confirm Approved Recipe &rarr; Start Cycle &rarr; Record Actuals &rarr; Submit to QC
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-mono block">Active Furnace</span>
          <span className="text-sm font-black text-white font-mono">F-01 (SQF)</span>
        </div>
      </div>

      {submitted ? (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-8 text-center space-y-4">
          <div className="h-14 w-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-black text-white">Batch Successfully Submitted to QC Lab!</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Batch <strong className="text-orange-400 font-mono">{batchInfo.batchId}</strong> has completed its heat cycle. Actual parameters and power logs have been permanently recorded. Furnace F-01 is ready for unloading and next batch.
          </p>
          <div className="pt-4">
            <button
              onClick={() => { setSubmitted(false); setActiveStep('RECORD_ACTUALS'); }}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold"
            >
              Process Next Assigned Batch
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Assigned Batch & Approved Recipe Targets */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">1. Assigned Batch</span>
              <div className="text-sm font-black text-white font-mono mt-1 text-orange-400">
                {batchInfo.batchId}
              </div>
              <div className="text-xs text-slate-300 mt-1">{batchInfo.partName}</div>
              <div className="text-[11px] text-slate-400">{batchInfo.customer}</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Heat Number:</span>
                <span className="font-mono font-bold text-red-400">{batchInfo.heatNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Material Grade:</span>
                <span className="font-mono font-bold text-blue-400">{batchInfo.materialGrade}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Loaded Weight:</span>
                <span className="font-bold text-white">{batchInfo.loadedWeight} kg ({batchInfo.quantity} pcs)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Assigned Furnace:</span>
                <span className="font-bold text-white">F-01 (600 kg Cap)</span>
              </div>
            </div>

            {/* Approved Recipe Specifications (Non-editable for Operator) */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <ShieldCheck className="h-4 w-4" /> APPROVED RECIPE TARGETS
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {batchInfo.recipeCode} &bull; Locked
              </div>

              <div className="space-y-1 pt-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Austenitizing:</span>
                  <span className="font-mono text-white font-bold">{batchInfo.targets.temp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Soak Time:</span>
                  <span className="font-mono text-white font-bold">{batchInfo.targets.soak}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Atmosphere CP:</span>
                  <span className="font-mono text-white font-bold">{batchInfo.targets.cp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quench:</span>
                  <span className="font-mono text-white font-bold">{batchInfo.targets.quench}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tempering:</span>
                  <span className="font-mono text-white font-bold">{batchInfo.targets.temper}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (2 spans): Actual Process Recording Form */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Gauge className="h-4 w-4 text-orange-400" />
                2. Record Actual Process Data
              </h2>
              <span className="text-xs font-bold text-orange-400 font-mono bg-orange-500/10 px-2.5 py-1 rounded border border-orange-500/20">
                CYCLE IN PROGRESS &bull; F-01
              </span>
            </div>

            <form onSubmit={handleCompleteAndSubmitToQC} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Actual Temp */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Actual Soaking Temp (°C)
                  </label>
                  <input
                    type="number"
                    value={actualParams.actualHardeningTemp}
                    onChange={(e) => setActualParams({ ...actualParams, actualHardeningTemp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-white font-bold focus:border-orange-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Target: 850 °C (±5°)</span>
                </div>

                {/* Actual Soak Minutes */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Actual Soak Time (Minutes)
                  </label>
                  <input
                    type="number"
                    value={actualParams.actualSoakMinutes}
                    onChange={(e) => setActualParams({ ...actualParams, actualSoakMinutes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-white font-bold focus:border-orange-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Target: 90 Minutes</span>
                </div>

                {/* Carbon Potential */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Actual Carbon Potential (%CP)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={actualParams.actualCarbonPotential}
                    onChange={(e) => setActualParams({ ...actualParams, actualCarbonPotential: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-white font-bold focus:border-orange-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Target: 0.90 %</span>
                </div>

                {/* Quench Temp */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Quench Oil Temp (°C)
                  </label>
                  <input
                    type="number"
                    value={actualParams.actualQuenchTemp}
                    onChange={(e) => setActualParams({ ...actualParams, actualQuenchTemp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-white font-bold focus:border-orange-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Target: 60 °C (Oil ISO 32)</span>
                </div>

                {/* Tempering Temp */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Actual Tempering Temp (°C)
                  </label>
                  <input
                    type="number"
                    value={actualParams.actualTemperingTemp}
                    onChange={(e) => setActualParams({ ...actualParams, actualTemperingTemp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-white font-bold focus:border-orange-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Target: 180 °C</span>
                </div>

                {/* Energy Consumed */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Power Consumed (kWh)
                  </label>
                  <input
                    type="number"
                    value={actualParams.energyConsumedKwh}
                    onChange={(e) => setActualParams({ ...actualParams, energyConsumedKwh: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-white font-bold focus:border-orange-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">For batch costing (kWh/kg)</span>
                </div>
              </div>

              {/* Operator Remarks */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Operator Observations / Floor Remarks
                </label>
                <textarea
                  value={actualParams.operatorRemarks}
                  onChange={(e) => setActualParams({ ...actualParams, operatorRemarks: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-orange-500"
                  placeholder="Floor conditions, thermocouple stability, quench observations..."
                />
              </div>

              {/* Complete & Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-orange-950 flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="h-4 w-4" />
                  Complete Furnace Cycle & Submit Batch to QC Lab
                </button>
              </div>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};

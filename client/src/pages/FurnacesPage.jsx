import React, { useState } from 'react';
import {
  Flame,
  Gauge,
  Layers,
  Clock,
  AlertTriangle,
  Activity,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const FurnacesPage = ({ onSelectTab }) => {
  const [furnaces, setFurnaces] = useState([
    {
      id: 'F-01',
      name: 'Sealed Quench Furnace #1 (SQF-01)',
      type: 'SEALED_QUENCH_FURNACE',
      capacityKg: 600,
      loadedWeightKg: 420,
      currentStatus: 'HEATING',
      currentTemperature: 852,
      targetTemperature: 855,
      currentCarbonPotential: 0.92,
      quenchTemp: 62,
      currentBatchId: 'HT-2026-000125',
      operator: 'Ramesh Kumar (OP-104)',
      timeRemainingMinutes: 48,
      calibrationStatus: 'VALID'
    },
    {
      id: 'F-02',
      name: 'Pit Carburizing Furnace #2 (PIT-02)',
      type: 'PIT_CARBURIZING',
      capacityKg: 1200,
      loadedWeightKg: 0,
      currentStatus: 'IDLE',
      currentTemperature: 45,
      targetTemperature: 0,
      currentCarbonPotential: 0.0,
      quenchTemp: 28,
      currentBatchId: null,
      operator: null,
      timeRemainingMinutes: 0,
      calibrationStatus: 'EXPIRING_SOON' // 7 days remaining
    },
    {
      id: 'F-03',
      name: 'Continuous Mesh Belt Furnace #3',
      type: 'MESH_BELT',
      capacityKg: 400,
      loadedWeightKg: 0,
      currentStatus: 'IDLE',
      currentTemperature: 28,
      targetTemperature: 0,
      currentCarbonPotential: 0.0,
      quenchTemp: 26,
      currentBatchId: null,
      operator: null,
      timeRemainingMinutes: 0,
      calibrationStatus: 'VALID'
    },
    {
      id: 'F-04',
      name: 'Tempering Oven #4 (TO-04)',
      type: 'TEMPERING_OVEN',
      capacityKg: 800,
      loadedWeightKg: 0,
      currentStatus: 'IDLE',
      currentTemperature: 30,
      targetTemperature: 0,
      currentCarbonPotential: 0.0,
      quenchTemp: 0,
      currentBatchId: null,
      operator: null,
      timeRemainingMinutes: 0,
      calibrationStatus: 'VALID'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
        <div>
          <h1 className="text-base font-extrabold text-white flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Furnace Master & Real-Time Status Board
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Live process telemetry, temperature zones, carbon potential (%CP), and capacity utilization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('operator')}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
          >
            Open Operator Console
          </button>
        </div>
      </div>

      {/* Furnace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {furnaces.map((f) => {
          const isRunning = f.currentStatus !== 'IDLE' && f.currentStatus !== 'MAINTENANCE';
          const utilization = Math.round((f.loadedWeightKg / f.capacityKg) * 100);

          return (
            <div
              key={f.id}
              className={`bg-slate-900 border rounded-xl p-5 shadow relative overflow-hidden transition-all ${
                isRunning ? 'border-orange-500/50 ring-1 ring-orange-500/20' : 'border-slate-800'
              }`}
            >
              {/* Top Banner */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg font-mono font-bold text-sm border ${
                    isRunning
                      ? 'bg-orange-600/20 text-orange-400 border-orange-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {f.id}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">{f.name}</h2>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Type: {f.type}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    isRunning
                      ? 'bg-orange-600 text-white animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {f.currentStatus}
                  </span>
                  {f.calibrationStatus === 'EXPIRING_SOON' && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold mt-1">
                      <AlertTriangle className="h-3 w-3" /> Calibration Due Soon
                    </div>
                  )}
                </div>
              </div>

              {/* Live Telemetry Meters */}
              <div className="grid grid-cols-3 gap-3 my-4">
                {/* Temperature Meter */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Furnace Temp</span>
                  <div className="text-xl font-black font-mono mt-1 text-white flex items-baseline gap-1">
                    <span className={isRunning ? 'text-orange-400' : 'text-slate-400'}>
                      {f.currentTemperature}
                    </span>
                    <span className="text-xs text-slate-500 font-sans">°C</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Target: {f.targetTemperature > 0 ? `${f.targetTemperature} °C` : 'Off'}
                  </span>
                </div>

                {/* Carbon Potential Meter */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Carbon Potential</span>
                  <div className="text-xl font-black font-mono mt-1 text-white flex items-baseline gap-1">
                    <span className={isRunning ? 'text-blue-400' : 'text-slate-400'}>
                      {f.currentCarbonPotential > 0 ? `${f.currentCarbonPotential}%` : '0.0%'}
                    </span>
                    <span className="text-xs text-slate-500 font-sans">CP</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Atmosphere: {isRunning ? 'Endo Gas' : 'Standby'}
                  </span>
                </div>

                {/* Quench Oil Temp */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Quench Oil</span>
                  <div className="text-xl font-black font-mono mt-1 text-white flex items-baseline gap-1">
                    <span className={isRunning ? 'text-emerald-400' : 'text-slate-400'}>
                      {f.quenchTemp}
                    </span>
                    <span className="text-xs text-slate-500 font-sans">°C</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Tank: 4,500 L (ISO 32)
                  </span>
                </div>
              </div>

              {/* Batch & Capacity Utilization Bar */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Current Batch:</span>
                  <strong className="font-mono text-orange-400">
                    {f.currentBatchId || 'None (Idle)'}
                  </strong>
                </div>

                {isRunning && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Operator:</span>
                    <span>{f.operator}</span>
                  </div>
                )}

                {/* Capacity Gauge */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Furnace Loading:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {f.loadedWeightKg} kg / {f.capacityKg} kg ({utilization}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        utilization > 95 ? 'bg-red-500' : utilization > 60 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${utilization}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-mono">
                  {isRunning ? `Remaining: ${f.timeRemainingMinutes} min` : 'Available for scheduling'}
                </span>
                <button
                  onClick={() => onSelectTab('operator')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold border border-slate-700"
                >
                  {isRunning ? 'View Cycle Telemetry' : 'Load New Batch'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

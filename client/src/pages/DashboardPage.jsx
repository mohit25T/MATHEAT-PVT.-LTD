import React, { useState, useEffect } from 'react';
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Package,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Calendar
} from 'lucide-react';

export const DashboardPage = ({ onSelectTab, onSearch }) => {
  const [stats, setStats] = useState({
    todayJobs: 4,
    runningBatches: 2,
    weightProcessedToday: 1840,
    piecesProcessedToday: 4200,
    qcPending: 1,
    qcPassed: 18,
    qcFailed: 0,
    activeFurnaces: 1,
    idleFurnaces: 3,
    avgUtilization: 70,
    calibrationAlerts: 1
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Factory Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 rounded-xl border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white tracking-tight">
              MATHEAT MES &bull; SHOP FLOOR CONTROL
            </h1>
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              REAL-TIME PRODUCTION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Uniform Quality &bull; High Strength &bull; Engineering Precision &bull; NABL / ISO Traceability Active
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('operator')}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-orange-950 transition-all"
          >
            <Flame className="h-4 w-4" />
            Operator Console
          </button>
          <button
            onClick={() => onSelectTab('certificates')}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
          >
            View Certificates
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Running Batches</span>
            <Flame className="h-4 w-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {stats.runningBatches} <span className="text-xs text-slate-400 font-sans font-normal">in cycle</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2">
            <span className="font-semibold">Batch HT-2026-000125</span> in F-01
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Processed Today</span>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {stats.weightProcessedToday.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">kg</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {stats.piecesProcessedToday.toLocaleString()} finished pieces
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>QC Quality Pass Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
            100%
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            18 Passed &bull; 0 Failed &bull; 1 Pending
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Furnace Capacity Utilization</span>
            <Layers className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2 font-mono">
            70.0%
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            420 kg loaded / 600 kg capacity (F-01)
          </div>
        </div>
      </div>

      {/* Safety & Quality Alerts Bar */}
      <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-300">
              Critical Safety Notice: Calibration Expiry in 7 Days
            </div>
            <div className="text-[11px] text-slate-300">
              Furnace F-02 Digital Temp Controller (Eurotherm EUR-2408) calibration expires on 24-Sep-2026. Recalibrate before next job work cycle.
            </div>
          </div>
        </div>
        <button
          onClick={() => onSelectTab('maintenance')}
          className="text-xs font-semibold px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg shrink-0"
        >
          View Calibration Log
        </button>
      </div>

      {/* Two Column Layout: Live Furnaces & Recent Heat Treatment Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Furnace Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Furnace Shop Floor Status (4 Furnaces)
            </h2>
            <button
              onClick={() => onSelectTab('furnaces')}
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-semibold"
            >
              All Furnaces <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* F-01 */}
            <div className="bg-slate-950 border border-orange-500/40 rounded-lg p-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-orange-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-bl">
                RUNNING (HEATING)
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-orange-600/10 text-orange-500 border border-orange-500/20 font-mono font-bold text-sm">
                  F-01
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sealed Quench Furnace #1 (SQF-01)</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Batch: <span className="text-orange-400 font-semibold">HT-2026-000125</span> &bull; Heat No: <span className="text-red-400 font-semibold">H-45872</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Current Temp</span>
                  <span className="font-mono font-bold text-orange-400 text-sm">852 °C</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Target / Soak</span>
                  <span className="font-mono text-slate-300 text-sm">855 °C (90m)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Loaded / Cap</span>
                  <span className="font-mono text-slate-300 text-sm">420 / 600 kg</span>
                </div>
              </div>
            </div>

            {/* F-02 */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 font-mono font-bold text-sm">
                    F-02
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Pit Carburizing Furnace #2 (PIT-02)</div>
                    <div className="text-[11px] text-slate-400">Capacity: 1200 kg &bull; Max Temp: 1000 °C</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-800 text-slate-400 rounded">
                  IDLE / READY
                </span>
              </div>
            </div>

            {/* F-03 */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 font-mono font-bold text-sm">
                    F-03
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Continuous Mesh Belt Furnace #3</div>
                    <div className="text-[11px] text-slate-400">Capacity: 400 kg &bull; Electric Radiant</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-800 text-slate-400 rounded">
                  IDLE / READY
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Batches & Traceability Quick Access */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-400" />
                Active Heat Treatment Batches
              </h2>
              <button
                onClick={() => onSelectTab('batches')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                All Batches <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Batch 1 */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-bold text-white">HT-2026-000125</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
                    HEATING (F-01)
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1 font-medium">
                  6205 Bearing Outer Ring &bull; SKF India Ltd.
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                  <span>Heat No: <strong className="text-slate-300">H-45872</strong></span>
                  <span>420 kg (1500 Pcs)</span>
                  <span>EN31</span>
                </div>
              </div>

              {/* Batch 2 */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-bold text-white">HT-2026-000124</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                    QC PASS &bull; CERT READY
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1 font-medium">
                  6205 Bearing Outer Ring &bull; SKF India Ltd.
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                  <span>Heat No: <strong className="text-slate-300">H-45872</strong></span>
                  <span>Hardness: <strong className="text-emerald-400">60.5 HRC</strong></span>
                  <button
                    onClick={() => onSelectTab('certificates')}
                    className="text-orange-400 underline font-sans font-bold"
                  >
                    View Certificate
                  </button>
                </div>
              </div>

              {/* Batch 3 */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-bold text-white">HT-2026-000123</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                    DISPATCHED &bull; INVOICED
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1 font-medium">
                  Drive Pinion 24T &bull; Tata Motors Ltd.
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                  <span>Heat No: <strong className="text-slate-300">H-90214</strong></span>
                  <span>Invoice: <strong className="text-slate-300">INV-2026-0001</strong></span>
                  <span>20MnCr5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Single-Screen Traceability Bar */}
          <div className="mt-4 pt-4 border-t border-slate-800 bg-slate-950/40 p-3 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200">Need Complete Batch Traceability?</div>
              <div className="text-[10px] text-slate-400">Search any Raw Heat Number or Batch ID across all 15 stages.</div>
            </div>
            <button
              onClick={() => {
                if (onSearch) onSearch('H-45872');
                onSelectTab('traceability');
              }}
              className="text-xs font-bold px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Trace Heat H-45872 &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

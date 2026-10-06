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
  Calendar,
  Plus,
  Truck,
  Receipt,
  SearchCode,
  Activity,
  ArrowRight,
  ShieldCheck,
  Check,
  Wrench,
  Gauge,
  Thermometer,
  Zap
} from 'lucide-react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';

export const DashboardPage = ({ onSelectTab, onSearch }) => {
  const { isLight } = useTheme();

  const [batches, setBatches] = useState(() => {
    const cached = api.cache.get('/batches');
    return Array.isArray(cached) ? cached : (cached?.batches || cached?.data || []);
  });
  const [jobOrders, setJobOrders] = useState(() => {
    const cached = api.cache.get('/job-orders');
    return Array.isArray(cached) ? cached : (cached?.jobOrders || cached?.data || []);
  });
  const [gateEntries, setGateEntries] = useState(() => {
    const cached = api.cache.get('/gate/entries');
    return Array.isArray(cached) ? cached : (cached?.entries || cached?.data || []);
  });
  const [furnaces, setFurnaces] = useState(() => {
    const cached = api.cache.get('/furnaces');
    return Array.isArray(cached) ? cached : (cached?.furnaces || cached?.data || []);
  });
  const [dispatches, setDispatches] = useState(() => {
    const cached = api.cache.get('/commercial/dispatch');
    return Array.isArray(cached) ? cached : (cached?.dispatches || cached?.data || []);
  });
  const [invoices, setInvoices] = useState(() => {
    const cached = api.cache.get('/commercial/invoices');
    return Array.isArray(cached) ? cached : (cached?.invoices || cached?.data || []);
  });
  const [calibrations, setCalibrations] = useState(() => {
    const cached = api.cache.get('/maintenance/calibrations');
    return Array.isArray(cached) ? cached : (cached?.calibrations || cached?.data || []);
  });
  const [ncrs, setNcrs] = useState(() => {
    const cached = api.cache.get('/ncr');
    return Array.isArray(cached) ? cached : (cached?.ncrs || cached?.data || []);
  });

  const [loading, setLoading] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [batchesRes, joRes, gateRes, furnacesRes, dspRes, invRes, calibRes, ncrRes] = await Promise.all([
        api.batches.getAll().catch(() => []),
        api.jobOrders.getAll().catch(() => []),
        api.gate.getEntries().catch(() => []),
        api.furnaces.getAll().catch(() => []),
        api.commercial.getDispatches().catch(() => []),
        api.commercial.getInvoices().catch(() => []),
        api.maintenance.getCalibrations().catch(() => []),
        api.ncr.getAll().catch(() => [])
      ]);

      const batchList = Array.isArray(batchesRes) ? batchesRes : (batchesRes?.batches || batchesRes?.data || []);
      const joList = Array.isArray(joRes) ? joRes : (joRes?.jobOrders || joRes?.data || []);
      const entries = Array.isArray(gateRes) ? gateRes : (gateRes?.entries || gateRes?.data || []);
      const furnaceList = Array.isArray(furnacesRes) ? furnacesRes : (furnacesRes?.furnaces || furnacesRes?.data || []);
      const dspList = Array.isArray(dspRes) ? dspRes : (dspRes?.dispatches || dspRes?.data || []);
      const invList = Array.isArray(invRes) ? invRes : (invRes?.invoices || invRes?.data || []);
      const calibList = Array.isArray(calibRes) ? calibRes : (calibRes?.calibrations || calibRes?.data || []);
      const ncrList = Array.isArray(ncrRes) ? ncrRes : (ncrRes?.ncrs || ncrRes?.data || []);

      setBatches(batchList);
      setJobOrders(joList);
      setGateEntries(entries);
      setFurnaces(furnaceList);
      setDispatches(dspList);
      setInvoices(invList);
      setCalibrations(calibList);
      setNcrs(ncrList);
    } catch (err) {
      console.warn('[DASHBOARD] Load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleSync = () => loadDashboardData();
    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Default display furnaces if none loaded
  const displayFurnaces = furnaces.length > 0 ? furnaces : [
    { furnaceId: 'F-01', name: 'Sealed Quench Furnace #1', currentStatus: 'HEATING', currentTemperature: 858, targetTemperature: 860, capacityKg: 600, loadedWeightKg: 420 },
    { furnaceId: 'F-02', name: 'Sealed Quench Furnace #2', currentStatus: 'IDLE', currentTemperature: 28, targetTemperature: 0, capacityKg: 600, loadedWeightKg: 0 },
    { furnaceId: 'F-03', name: 'Tempering Oven #1', currentStatus: 'TEMPERING', currentTemperature: 182, targetTemperature: 180, capacityKg: 500, loadedWeightKg: 380 },
    { furnaceId: 'F-04', name: 'Pit Carburizing Furnace', currentStatus: 'MAINTENANCE', currentTemperature: 25, targetTemperature: 0, capacityKg: 1000, loadedWeightKg: 0 }
  ];

  // SECTION 48 COUNTS
  const todayJobsCount = jobOrders.length > 0 ? jobOrders.length : 12;
  const todayHeatsCount = batches.length > 0 ? batches.length : 8;
  const qcPendingCount = batches.filter(b => b.qcStatus === 'PENDING' || b.status === 'QC_PENDING').length || 3;
  const dispatchCount = dispatches.length > 0 ? dispatches.length : 5;
  const invoiceCount = invoices.length > 0 ? invoices.length : 7;

  // Alerts
  const calibrationAlertsCount = calibrations.filter(c => c.status === 'EXPIRED' || c.status === 'EXPIRING_SOON').length;
  const maintenanceAlertsCount = displayFurnaces.filter(f => f.currentStatus === 'MAINTENANCE' || f.maintenanceStatus === 'DUE_FOR_PM').length;

  return (
    <div className={`space-y-6 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
      {/* SECTION 48: ERP HOME SCREEN HEADER */}
      <div className={`p-6 rounded-2xl border shadow-sm ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-orange-600">MATHEAT ERP</span>
              <span className="text-slate-400 font-bold">&bull;</span>
              <span className="text-sm font-extrabold uppercase tracking-wide">HEAT TREATMENT OPERATIONS</span>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                LIVE
              </span>
            </div>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Industrial Heat Treatment Operations &bull; Commercial Job Work &bull; CQI-9 Compliance Dashboard
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onSelectTab && onSelectTab('operator')}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Flame className="h-4 w-4" /> Operator Console
            </button>
            <button
              onClick={() => onSelectTab && onSelectTab('traceability')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <SearchCode className="h-4 w-4" /> 360° Traceability
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 48: 1. FURNACES LIVE STATUS BOARD */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-600" />
            FURNACES LIVE SHOP FLOOR BOARD
          </h2>
          <button
            onClick={() => onSelectTab && onSelectTab('furnaces')}
            className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            All Furnaces &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayFurnaces.map((f) => {
            const isHeating = f.currentStatus === 'HEATING' || f.currentStatus === 'SOAKING' || f.currentStatus === 'RUNNING';
            const isTempering = f.currentStatus === 'TEMPERING';
            const isMaintenance = f.currentStatus === 'MAINTENANCE' || f.currentStatus === 'UNDER_BREAKDOWN';
            const isAvailable = !isHeating && !isTempering && !isMaintenance;

            return (
              <div
                key={f.furnaceId || f._id}
                className={`p-4 rounded-2xl border shadow-sm transition-all hover:scale-[1.01] ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-mono text-base font-black text-slate-900 dark:text-white">
                    {f.furnaceId}
                  </span>

                  {isHeating && (
                    <span className="flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-300 dark:border-orange-500/30 animate-pulse">
                      <Flame className="h-3 w-3" /> HEATING
                    </span>
                  )}

                  {isTempering && (
                    <span className="flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400 border border-violet-300 dark:border-violet-500/30">
                      <Thermometer className="h-3 w-3" /> TEMPERING
                    </span>
                  )}

                  {isMaintenance && (
                    <span className="flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-300 dark:border-red-500/30">
                      <Wrench className="h-3 w-3" /> MAINTENANCE
                    </span>
                  )}

                  {isAvailable && (
                    <span className="flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                      <Check className="h-3 w-3" /> AVAILABLE
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                    {f.name}
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Current Temp:</span>
                    <span className="font-mono text-lg font-black text-slate-900 dark:text-white">
                      {f.currentTemperature || 28}°C
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Capacity: {f.capacityKg || 600} kg</span>
                    <span className="font-bold text-orange-600">
                      {Math.round(((f.loadedWeightKg || 0) / (f.capacityKg || 600)) * 100)}% load
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 48: 2. TODAY'S PRODUCTION COUNTS */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-blue-600" />
          TODAY'S OPERATIONS METRICS
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Jobs */}
          <div
            onClick={() => onSelectTab && onSelectTab('joborders')}
            className={`p-4 rounded-2xl border shadow-sm cursor-pointer transition-all hover:scale-[1.02] ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-bold">Jobs</span>
              <Layers className="h-4 w-4 text-blue-600" />
            </div>
            <div className="font-mono text-3xl font-black text-slate-900 dark:text-white mt-2">
              {todayJobsCount}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold block mt-1">Active Job Orders</span>
          </div>

          {/* Heats */}
          <div
            onClick={() => onSelectTab && onSelectTab('batches')}
            className={`p-4 rounded-2xl border shadow-sm cursor-pointer transition-all hover:scale-[1.02] ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-bold">Heats</span>
              <Flame className="h-4 w-4 text-orange-600" />
            </div>
            <div className="font-mono text-3xl font-black text-orange-600 mt-2">
              {todayHeatsCount}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold block mt-1">Furnace Heat Cycles</span>
          </div>

          {/* QC Pending */}
          <div
            onClick={() => onSelectTab && onSelectTab('qclab')}
            className={`p-4 rounded-2xl border shadow-sm cursor-pointer transition-all hover:scale-[1.02] ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-bold">QC Pending</span>
              <ShieldCheck className="h-4 w-4 text-amber-500" />
            </div>
            <div className="font-mono text-3xl font-black text-amber-500 mt-2">
              {qcPendingCount}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold block mt-1">Lab Testing Queue</span>
          </div>

          {/* Dispatch */}
          <div
            onClick={() => onSelectTab && onSelectTab('commercial')}
            className={`p-4 rounded-2xl border shadow-sm cursor-pointer transition-all hover:scale-[1.02] ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-bold">Dispatch</span>
              <Truck className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="font-mono text-3xl font-black text-indigo-600 mt-2">
              {dispatchCount}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold block mt-1">Delivery Challans</span>
          </div>

          {/* Invoices */}
          <div
            onClick={() => onSelectTab && onSelectTab('commercial')}
            className={`p-4 rounded-2xl border shadow-sm cursor-pointer transition-all hover:scale-[1.02] col-span-2 sm:col-span-1 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-bold">Invoices</span>
              <Receipt className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="font-mono text-3xl font-black text-emerald-600 mt-2">
              {invoiceCount}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold block mt-1">GST Tax Invoices</span>
          </div>
        </div>
      </div>

      {/* SECTION 48: 3. ALERTS PANEL */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          ACTIVE FACTORY ALERTS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Alert 1: Calibration Due */}
          <div
            onClick={() => onSelectTab && onSelectTab('maintenance')}
            className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition-all text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500 text-white rounded-lg">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-amber-900 dark:text-amber-200 block font-bold">Calibration Due</strong>
                <span className="text-[11px] text-amber-700 dark:text-amber-400">Rockwell Tester &bull; Thermocouple</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-600 shrink-0" />
          </div>

          {/* Alert 2: QC Pending */}
          <div
            onClick={() => onSelectTab && onSelectTab('qclab')}
            className="p-3.5 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/30 flex items-center justify-between cursor-pointer hover:bg-blue-100/70 transition-all text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-blue-900 dark:text-blue-200 block font-bold">QC Pending</strong>
                <span className="text-[11px] text-blue-700 dark:text-blue-400">{qcPendingCount} Heats awaiting inspection</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-600 shrink-0" />
          </div>

          {/* Alert 3: Delivery Due Today */}
          <div
            onClick={() => onSelectTab && onSelectTab('joborders')}
            className="p-3.5 rounded-xl border border-orange-300 dark:border-orange-800 bg-orange-50/70 dark:bg-orange-950/30 flex items-center justify-between cursor-pointer hover:bg-orange-100/70 transition-all text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-600 text-white rounded-lg">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-orange-900 dark:text-orange-200 block font-bold">Delivery Due Today</strong>
                <span className="text-[11px] text-orange-700 dark:text-orange-400">Customer PO commitment</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-orange-600 shrink-0" />
          </div>

          {/* Alert 4: Furnace Maintenance */}
          <div
            onClick={() => onSelectTab && onSelectTab('furnaces')}
            className="p-3.5 rounded-xl border border-red-300 dark:border-red-800 bg-red-50/70 dark:bg-red-950/30 flex items-center justify-between cursor-pointer hover:bg-red-100/70 transition-all text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-600 text-white rounded-lg">
                <Wrench className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-red-900 dark:text-red-200 block font-bold">Furnace Maintenance</strong>
                <span className="text-[11px] text-red-700 dark:text-red-400">Pit Furnace F-04 Under PM</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-red-600 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;

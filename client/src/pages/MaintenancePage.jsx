import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldAlert,
  Gauge
} from 'lucide-react';

export const MaintenancePage = () => {
  const calibrations = [
    {
      id: 'CAL-01',
      name: 'Zone 1 Control Thermocouple (Type S)',
      type: 'THERMOCOUPLE',
      furnaceId: 'F-01',
      serialNumber: 'TC-S-9912',
      expiryDate: '21-Nov-2026',
      daysRemaining: 65,
      status: 'VALID',
      certificate: 'NABL-CAL-4821'
    },
    {
      id: 'CAL-02',
      name: 'Digital Temp Controller (Eurotherm EUR-2408)',
      type: 'TEMP_CONTROLLER',
      furnaceId: 'F-02',
      serialNumber: 'EUR-2408-77',
      expiryDate: '24-Sep-2026',
      daysRemaining: 7, // TRIGGER CRITICAL 10-DAY WARNING!
      status: 'EXPIRING_SOON',
      certificate: 'NABL-CAL-3310'
    },
    {
      id: 'CAL-03',
      name: 'Rockwell Hardness Tester (HT-RC-01)',
      type: 'HARDNESS_TESTER',
      furnaceId: 'QA Lab',
      serialNumber: 'RC-TEST-004',
      expiryDate: '09-Jun-2027',
      daysRemaining: 265,
      status: 'VALID',
      certificate: 'NABL-CAL-9921'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
        <div>
          <h1 className="text-base font-extrabold text-white flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-500" />
            Equipment Maintenance & Instrument Calibration
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Thermocouples, temperature controllers, hardness testers, with automatic 10-day safety lockout alerts
          </p>
        </div>
      </div>

      {/* 10-Day Expiry Safety Alert */}
      <div className="bg-amber-950/20 border border-amber-500/40 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-amber-300">
              URGENT CALIBRATION ALERT: 1 Instrument Expiring in 7 Days
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Furnace F-02 Digital Controller (Eurotherm) certificate expires on <strong>24-Sep-2026</strong>. In accordance with ISO/IATF quality guidelines, expired instruments cannot certify active furnace cycles.
            </p>
          </div>
        </div>
      </div>

      {/* Calibration Register */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Critical Instruments & NABL Calibration Tracker
          </h2>
          <span className="text-xs font-mono text-slate-400">3 Tracked Devices</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
              <th className="p-3">Instrument & Serial No</th>
              <th className="p-3">Type & Equipment</th>
              <th className="p-3">Expiry Date</th>
              <th className="p-3">Days Remaining</th>
              <th className="p-3">Calibration Cert</th>
              <th className="p-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-sans">
            {calibrations.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/40">
                <td className="p-3">
                  <div className="font-bold text-slate-200">{c.name}</div>
                  <span className="text-[10px] font-mono text-slate-400">S/N: {c.serialNumber}</span>
                </td>
                <td className="p-3">
                  <span className="text-slate-300 font-medium block">{c.type}</span>
                  <span className="text-[10px] text-orange-400 font-mono">{c.furnaceId}</span>
                </td>
                <td className="p-3 font-mono text-slate-300">{c.expiryDate}</td>
                <td className="p-3 font-mono">
                  <span className={`font-bold ${c.daysRemaining <= 10 ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`}>
                    {c.daysRemaining} Days
                  </span>
                </td>
                <td className="p-3 font-mono text-slate-400 text-[11px]">{c.certificate}</td>
                <td className="p-3 text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    c.status === 'VALID'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {c.status === 'VALID' ? 'ACTIVE / VALID' : 'DUE IN 7 DAYS'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

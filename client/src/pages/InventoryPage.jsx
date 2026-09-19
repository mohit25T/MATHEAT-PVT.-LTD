import React, { useState } from 'react';
import {
  Boxes,
  Building2,
  Trash2,
  History,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const InventoryPage = () => {
  const stockItems = [
    {
      partNumber: '6205-BRG-RING',
      heatNumber: 'H-45872',
      ownership: 'CUSTOMER OWNED',
      customer: 'SKF India Bearings Ltd.',
      quantity: 1500,
      weightKg: 420,
      location: 'CUSTOMER-BAY-SKF-01',
      status: 'ACCEPTED'
    },
    {
      partNumber: 'PINION-24T-TATA',
      heatNumber: 'H-90214',
      ownership: 'CUSTOMER OWNED',
      customer: 'Tata Motors Ltd.',
      quantity: 500,
      weightKg: 925,
      location: 'CUSTOMER-BAY-TATA-02',
      status: 'ACCEPTED'
    }
  ];

  const scrapItems = [
    {
      scrapId: 'SCRP-2026-0001',
      batchId: 'HT-2026-000120',
      partNumber: '6205-BRG-RING',
      heatNumber: 'H-39110',
      weightKg: 14.5,
      quantity: 52,
      reason: 'Quench cracking due to thermal shock',
      estimatedValue: 507.5,
      status: 'STORED IN SCRAP YARD'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
        <div>
          <h1 className="text-base font-extrabold text-white flex items-center gap-2">
            <Boxes className="h-5 w-5 text-orange-500" />
            Batch Inventory, Customer Stock & Scrap Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Customer-owned stock reconciliation (Input = Good + Rejection + Scrap), Scrap tracking, and immutable stock transactions
          </p>
        </div>
      </div>

      {/* Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
          <span className="text-xs text-slate-400 font-semibold">Customer-Owned Stock</span>
          <div className="text-2xl font-black text-white font-mono mt-1">1,345 kg</div>
          <span className="text-[11px] text-blue-400 font-mono mt-1 block">SKF India &bull; Tata Motors</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
          <span className="text-xs text-slate-400 font-semibold">Work In Progress (WIP)</span>
          <div className="text-2xl font-black text-orange-400 font-mono mt-1">420 kg</div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">1 Batch currently in F-01</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
          <span className="text-xs text-slate-400 font-semibold">Total Scrap Segregated</span>
          <div className="text-2xl font-black text-red-400 font-mono mt-1">14.5 kg</div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">Recovery Value: ₹ 508</span>
        </div>
      </div>

      {/* Active Stock Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Current Floor Stock Inventory
          </h2>
          <span className="text-xs font-mono text-slate-400">{stockItems.length} Lots</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
              <th className="p-3">Component</th>
              <th className="p-3">Raw Heat Number</th>
              <th className="p-3">Ownership & Customer</th>
              <th className="p-3">Available Weight / Qty</th>
              <th className="p-3">Storage Location</th>
              <th className="p-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-sans">
            {stockItems.map((s, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40">
                <td className="p-3 font-mono font-bold text-white">{s.partNumber}</td>
                <td className="p-3 font-mono font-bold text-red-400 bg-red-950/20 px-2 py-0.5 rounded border border-red-500/20 w-fit">
                  {s.heatNumber}
                </td>
                <td className="p-3">
                  <div className="font-semibold text-slate-200">{s.customer}</div>
                  <span className="text-[10px] text-blue-400 font-mono">{s.ownership}</span>
                </td>
                <td className="p-3 font-mono">
                  <strong className="text-white">{s.weightKg} kg</strong>
                  <span className="text-[10px] text-slate-400 block">{s.quantity} pcs</span>
                </td>
                <td className="p-3 text-slate-300 font-mono text-[11px]">{s.location}</td>
                <td className="p-3 text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scrap Register */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
            <Trash2 className="h-4 w-4" /> Scrap Management Register
          </h2>
          <span className="text-xs font-mono text-slate-400">{scrapItems.length} Scrap Logs</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
              <th className="p-3">Scrap ID & Batch</th>
              <th className="p-3">Heat No & Part</th>
              <th className="p-3">Scrap Weight / Qty</th>
              <th className="p-3">Reason for Scrap</th>
              <th className="p-3 text-right">Disposal Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-sans">
            {scrapItems.map((sc) => (
              <tr key={sc.scrapId} className="hover:bg-slate-800/40">
                <td className="p-3 font-mono">
                  <span className="font-bold text-red-400 block">{sc.scrapId}</span>
                  <span className="text-[10px] text-slate-500">Batch: {sc.batchId}</span>
                </td>
                <td className="p-3">
                  <div className="font-bold text-slate-200">{sc.partNumber}</div>
                  <span className="text-[10px] text-red-400 font-mono">Heat: {sc.heatNumber}</span>
                </td>
                <td className="p-3 font-mono font-bold text-white">
                  {sc.weightKg} kg ({sc.quantity} pcs)
                </td>
                <td className="p-3 text-slate-300">{sc.reason}</td>
                <td className="p-3 text-right font-mono text-[11px] text-slate-400">
                  {sc.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

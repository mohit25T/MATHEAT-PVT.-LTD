import React, { useState } from 'react';
import {
  Users,
  Building2,
  Cpu,
  Flame,
  Layers,
  Award
} from 'lucide-react';

export const MastersPage = () => {
  const [activeTab, setActiveTab] = useState('customers');

  const customers = [
    { code: 'CUST-SKF', name: 'SKF India Bearings Ltd.', gstin: '27AAACS1900K1Z9', city: 'Pune, Maharashtra', terms: '45 Days Net', credit: '₹ 30,00,000' },
    { code: 'CUST-TATA', name: 'Tata Motors Ltd. (Powertrain Div)', gstin: '27AAACT2727Q1ZW', city: 'Pune, Maharashtra', terms: '30 Days Net', credit: '₹ 25,00,000' }
  ];

  const parts = [
    {
      partNumber: '6205-BRG-RING',
      partName: '6205 Deep Groove Ball Bearing Outer Ring',
      customer: 'SKF India Bearings Ltd.',
      grade: 'EN31',
      drawing: 'DWG-6205-RevB (R1)',
      process: 'Carburizing + Hardening + Tempering',
      hardness: '58-62 HRC',
      caseDepth: '0.80-1.10 mm'
    },
    {
      partNumber: 'PINION-24T-TATA',
      partName: 'Transmission Drive Pinion 24-Teeth',
      customer: 'Tata Motors Ltd.',
      grade: '20MnCr5',
      drawing: 'DWG-PIN-24T (R2)',
      process: 'Carburizing + Hardening + Tempering',
      hardness: '59-63 HRC',
      caseDepth: '1.00-1.30 mm'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
        <div>
          <h1 className="text-base font-extrabold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-500" />
            Master Data Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Customers, Suppliers, Part Masters with Drawing Tolerances, Process Masters, and Machine Catalogs
          </p>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-md ${activeTab === 'customers' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab('parts')}
            className={`px-3 py-1.5 rounded-md ${activeTab === 'parts' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Part Master
          </button>
        </div>
      </div>

      {activeTab === 'customers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                <th className="p-3">Customer Code</th>
                <th className="p-3">Company Name</th>
                <th className="p-3">GSTIN</th>
                <th className="p-3">Location</th>
                <th className="p-3">Payment Terms</th>
                <th className="p-3 text-right">Credit Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {customers.map((c) => (
                <tr key={c.code} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-orange-400">{c.code}</td>
                  <td className="p-3 font-bold text-slate-200">{c.name}</td>
                  <td className="p-3 font-mono text-slate-300">{c.gstin}</td>
                  <td className="p-3 text-slate-400">{c.city}</td>
                  <td className="p-3 text-slate-300">{c.terms}</td>
                  <td className="p-3 font-mono text-emerald-400 text-right font-bold">{c.credit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'parts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                <th className="p-3">Part Number</th>
                <th className="p-3">Part Name & Customer</th>
                <th className="p-3">Grade & Standard</th>
                <th className="p-3">Drawing & Rev</th>
                <th className="p-3">Required Process</th>
                <th className="p-3 text-right">Spec Tolerances</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {parts.map((p) => (
                <tr key={p.partNumber} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-orange-400">{p.partNumber}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-200">{p.partName}</div>
                    <span className="text-[10px] text-slate-400">{p.customer}</span>
                  </td>
                  <td className="p-3 font-mono text-blue-400 font-bold">{p.grade}</td>
                  <td className="p-3 font-mono text-slate-300">{p.drawing}</td>
                  <td className="p-3 text-slate-300">{p.process}</td>
                  <td className="p-3 text-right">
                    <div className="font-mono font-bold text-emerald-400">{p.hardness}</div>
                    <span className="text-[10px] text-slate-400 font-mono">ECD: {p.caseDepth}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

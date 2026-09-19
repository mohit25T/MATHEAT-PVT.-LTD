import React, { useState } from 'react';
import {
  Truck,
  Receipt,
  Coins,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Download,
  Plus,
  AlertTriangle,
  FileBadge
} from 'lucide-react';
import { TaxInvoiceViewer } from '../components/TaxInvoiceViewer';

export const CommercialPage = ({ onSelectTab }) => {
  const [activeSubTab, setActiveSubTab] = useState('tax-invoice'); // 'tax-invoice', 'invoices', 'dispatch', 'costing'

  const dispatches = [
    {
      dispatchNumber: 'DSP-2026-0001',
      date: '16-Sep-2026',
      customerName: 'SKF India Bearings Ltd.',
      batchId: 'HT-2026-000124',
      partNumber: '6205-BRG-RING',
      heatNumber: 'H-45872',
      quantityPcs: 1495,
      weightKg: 418.6,
      vehicleNumber: 'MH-20-DE-4412',
      transporter: 'V-Trans Logistics',
      qcVerified: true,
      invoiceNumber: 'INV-2026-0001'
    }
  ];

  const invoices = [
    {
      invoiceNumber: 'MH/25-26/0089',
      invoiceDate: '17-Sep-2026',
      customerName: 'DURGA MANUFACTURES',
      batchId: 'B-2026-0178',
      heatNumber: 'H45872',
      billedWeightKg: 1608.8,
      ratePerKg: 68.5,
      subtotal: 109580.30,
      cgst: 9862.23,
      sgst: 9862.23,
      totalAmount: 129304.00,
      paymentTerms: '30 Days',
      status: 'ISSUED'
    },
    {
      invoiceNumber: 'INV-2026-0001',
      invoiceDate: '16-Sep-2026',
      customerName: 'SKF India Bearings Ltd.',
      batchId: 'HT-2026-000124',
      heatNumber: 'H-45872',
      billedWeightKg: 418.6,
      ratePerKg: 32,
      subtotal: 13395,
      cgst: 1205.55,
      sgst: 1205.55,
      totalAmount: 15806,
      paymentTerms: '30 Days Net',
      status: 'PAID'
    }
  ];

  const costing = [
    {
      batchId: 'HT-2026-000124',
      batchWeightKg: 420,
      batchPieces: 1500,
      electricityCost: 1980,
      gasFuelCost: 650,
      quenchOilCost: 450,
      laborCost: 1200,
      furnaceDepreciation: 800,
      totalBatchCost: 5080,
      costPerKg: 12.09,
      billingRevenue: 13395,
      grossMargin: 8315,
      marginPercent: 62.1
    }
  ];

  const handleDownloadInvoice = (invNum) => {
    window.open(`http://localhost:5000/api/documents/invoice/${invNum}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm no-print">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Truck className="h-5 w-5 text-orange-600" />
            Commercial Operations, QC-Gated Dispatch & Tax Invoicing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Standard GST Tax Invoices, strict QC PASS dispatch verification, and batch-level ₹/kg costing
          </p>
        </div>

        {/* Subtab Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-300 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('tax-invoice')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === 'tax-invoice' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <FileBadge className="h-3.5 w-3.5" /> Official Tax Invoice (Format)
          </button>
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeSubTab === 'invoices' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Invoice Register
          </button>
          <button
            onClick={() => setActiveSubTab('dispatch')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeSubTab === 'dispatch' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Dispatch Register
          </button>
          <button
            onClick={() => setActiveSubTab('costing')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeSubTab === 'costing' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Batch Costing (₹/kg)
          </button>
        </div>
      </div>

      {/* 0. OFFICIAL TAX INVOICE FORMAT (EXACT REPLICATION) */}
      {activeSubTab === 'tax-invoice' && (
        <TaxInvoiceViewer />
      )}

      {/* 1. DISPATCH REGISTER */}
      {activeSubTab === 'dispatch' && (
        <div className="space-y-4">
          <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <strong>Strict QC Verification Gate Enforced:</strong> Dispatch is blocked by system rule unless the batch holds an authorized QC PASS sign-off.
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                  <th className="p-3">Dispatch No & Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Batch & Heat Number</th>
                  <th className="p-3">Weight & Quantity</th>
                  <th className="p-3">Vehicle & Transporter</th>
                  <th className="p-3">QC Status</th>
                  <th className="p-3 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {dispatches.map((d) => (
                  <tr key={d.dispatchNumber} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono">
                      <span className="font-bold text-white block">{d.dispatchNumber}</span>
                      <span className="text-[10px] text-slate-500">{d.date}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-200">{d.customerName}</td>
                    <td className="p-3 font-mono">
                      <span className="text-orange-400 font-bold block">{d.batchId}</span>
                      <span className="text-red-400 font-semibold text-[10px]">Heat: {d.heatNumber}</span>
                    </td>
                    <td className="p-3 font-mono">
                      <span className="font-bold text-white block">{d.weightKg} kg</span>
                      <span className="text-[10px] text-slate-400">{d.quantityPcs} pcs</span>
                    </td>
                    <td className="p-3 text-slate-300">
                      <div>{d.vehicleNumber}</div>
                      <span className="text-[10px] text-slate-500">{d.transporter}</span>
                    </td>
                    <td className="p-3">
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded w-fit">
                        <CheckCircle2 className="h-3 w-3" /> QC PASS VERIFIED
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(d.invoiceNumber)}
                        className="text-orange-400 hover:text-orange-300 font-bold text-xs underline font-mono"
                      >
                        {d.invoiceNumber} &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. GST INVOICES */}
      {activeSubTab === 'invoices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                <th className="p-3">Invoice No & Date</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Billed Weight & Rate</th>
                <th className="p-3">Subtotal</th>
                <th className="p-3">GST (18%)</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {invoices.map((inv) => (
                <tr key={inv.invoiceNumber} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono">
                    <span className="font-bold text-white block">{inv.invoiceNumber}</span>
                    <span className="text-[10px] text-slate-500">{inv.invoiceDate}</span>
                  </td>
                  <td className="p-3 font-semibold text-slate-200">{inv.customerName}</td>
                  <td className="p-3 font-mono">
                    <span className="font-bold text-slate-200 block">{inv.billedWeightKg} kg</span>
                    <span className="text-[10px] text-slate-400">₹ {inv.ratePerKg} / kg</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-300">
                    ₹ {inv.subtotal.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">
                    <div>CGST: ₹ {inv.cgst}</div>
                    <div>SGST: ₹ {inv.sgst}</div>
                  </td>
                  <td className="p-3 font-mono font-black text-emerald-400 text-sm">
                    ₹ {inv.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(inv.invoiceNumber)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold ml-auto"
                    >
                      <Download className="h-3.5 w-3.5" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. BATCH COSTING */}
      {activeSubTab === 'costing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Batch-Level Energy, Consumable & Direct Labor Costing
            </h2>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Avg Cost/kg: ₹ 12.09 &bull; Gross Margin: 62.1%
            </span>
          </div>

          <div className="divide-y divide-slate-800">
            {costing.map((c) => (
              <div key={c.batchId} className="py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm font-bold text-orange-400">
                    Batch: {c.batchId} ({c.batchWeightKg} kg)
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    Billing Revenue: <strong className="text-white">₹ {c.billingRevenue.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Electricity Power</span>
                    <strong className="text-slate-200">₹ {c.electricityCost}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">LPG / Endo Gas</span>
                    <strong className="text-slate-200">₹ {c.gasFuelCost}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Quench Oil & Chem</span>
                    <strong className="text-slate-200">₹ {c.quenchOilCost}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Direct Labor</span>
                    <strong className="text-slate-200">₹ {c.laborCost}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Furnace Depreciation</span>
                    <strong className="text-slate-200">₹ {c.furnaceDepreciation}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 font-mono">
                    Total Batch Processing Cost: <strong className="text-white">₹ {c.totalBatchCost}</strong> (₹ {c.costPerKg} / kg)
                  </span>
                  <span className="text-emerald-400 font-bold font-mono">
                    Gross Margin: ₹ {c.grossMargin} ({c.marginPercent}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

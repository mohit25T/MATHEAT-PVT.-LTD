import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export const JobOrdersPage = ({ onSelectTab }) => {
  const [jobOrders, setJobOrders] = useState([
    {
      jobOrderNumber: 'JO-2026-0001',
      customer: 'SKF India Bearings Ltd.',
      customerPo: 'PO-SKF-2026-901',
      partNumber: '6205-BRG-RING',
      heatNumber: 'H-45872',
      quantity: 1500,
      weightKg: 420,
      requiredHardness: '58 - 62 HRC',
      requiredCaseDepth: '0.80 - 1.10 mm',
      deliveryDate: '22-Sep-2026',
      priority: 'HIGH',
      status: 'IN_PRODUCTION'
    },
    {
      jobOrderNumber: 'JO-2026-0002',
      customer: 'Tata Motors Ltd.',
      customerPo: 'PO-TATA-2026-440',
      partNumber: 'PINION-24T-TATA',
      heatNumber: 'H-90214',
      quantity: 500,
      weightKg: 925,
      requiredHardness: '59 - 63 HRC',
      requiredCaseDepth: '1.00 - 1.30 mm',
      deliveryDate: '25-Sep-2026',
      priority: 'URGENT',
      status: 'READY_FOR_PRODUCTION'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
        <div>
          <h1 className="text-base font-extrabold text-white flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-orange-500" />
            Job Work Orders Register
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Customer Enquiry &rarr; Quotation &rarr; Customer PO &rarr; Job Order with drawing specifications & delivery schedules
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Active Job Work Orders
          </h2>
          <span className="text-xs font-mono text-slate-400">{jobOrders.length} Orders</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
              <th className="p-3">Job Order & PO</th>
              <th className="p-3">Customer & Component</th>
              <th className="p-3">Heat Number</th>
              <th className="p-3">Weight & Qty</th>
              <th className="p-3">Required Hardness / Case</th>
              <th className="p-3">Delivery & Priority</th>
              <th className="p-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-sans">
            {jobOrders.map((jo) => (
              <tr key={jo.jobOrderNumber} className="hover:bg-slate-800/40">
                <td className="p-3 font-mono">
                  <span className="font-bold text-white block">{jo.jobOrderNumber}</span>
                  <span className="text-[10px] text-slate-500">PO: {jo.customerPo}</span>
                </td>
                <td className="p-3">
                  <div className="font-bold text-slate-200">{jo.partNumber}</div>
                  <span className="text-[10px] text-slate-400">{jo.customer}</span>
                </td>
                <td className="p-3 font-mono">
                  <span className="font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30 inline-block">
                    {jo.heatNumber}
                  </span>
                </td>
                <td className="p-3 font-mono">
                  <span className="font-bold text-white block">{jo.weightKg} kg</span>
                  <span className="text-[10px] text-slate-400">{jo.quantity} pcs</span>
                </td>
                <td className="p-3 text-[11px]">
                  <div className="font-semibold text-slate-200">{jo.requiredHardness}</div>
                  <div className="text-slate-400 font-mono text-[10px]">ECD: {jo.requiredCaseDepth}</div>
                </td>
                <td className="p-3">
                  <div className="text-slate-200 font-mono">{jo.deliveryDate}</div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    jo.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {jo.priority}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded">
                    {jo.status.replace('_', ' ')}
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

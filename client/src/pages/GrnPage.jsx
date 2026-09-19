import React, { useState } from 'react';
import {
  PackagePlus,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Plus
} from 'lucide-react';

export const GrnPage = () => {
  const [showModal, setShowModal] = useState(false);

  const [inwardList, setInwardList] = useState([
    {
      grnNumber: 'GRN-2026-0001',
      date: '12-Sep-2026',
      ownership: 'CUSTOMER',
      customerName: 'SKF India Bearings Ltd.',
      challanNumber: 'DC-SKF-8921',
      partNumber: '6205-BRG-RING',
      materialGrade: 'EN31',
      heatNumber: 'H-45872',
      castNumber: 'C-9021-B',
      receivedWeightKg: 840,
      receivedQuantity: 3000,
      acceptedWeightKg: 840,
      storageLocation: 'CUSTOMER-BAY-SKF-01',
      status: 'ACCEPTED'
    },
    {
      grnNumber: 'GRN-2026-0002',
      date: '14-Sep-2026',
      ownership: 'CUSTOMER',
      customerName: 'Tata Motors Ltd.',
      challanNumber: 'DC-TATA-4402',
      partNumber: 'PINION-24T-TATA',
      materialGrade: '20MnCr5',
      heatNumber: 'H-90214',
      castNumber: 'C-3388-X',
      receivedWeightKg: 1850,
      receivedQuantity: 1000,
      acceptedWeightKg: 1850,
      storageLocation: 'CUSTOMER-BAY-TATA-02',
      status: 'ACCEPTED'
    }
  ]);

  const [form, setForm] = useState({
    ownership: 'CUSTOMER',
    customerName: 'SKF India Bearings Ltd.',
    challanNumber: '',
    partNumber: '6205-BRG-RING',
    materialGrade: 'EN31',
    heatNumber: '',
    castNumber: '',
    receivedWeightKg: '',
    receivedQuantity: '',
    storageLocation: 'CUSTOMER-BAY-A1'
  });

  const handleCreateGrn = (e) => {
    e.preventDefault();
    const newGrn = {
      grnNumber: `GRN-2026-000${inwardList.length + 1}`,
      date: new Date().toLocaleDateString('en-IN'),
      ownership: form.ownership,
      customerName: form.customerName,
      challanNumber: form.challanNumber || 'DC-MANUAL-01',
      partNumber: form.partNumber,
      materialGrade: form.materialGrade,
      heatNumber: form.heatNumber.toUpperCase().trim(),
      castNumber: form.castNumber,
      receivedWeightKg: parseFloat(form.receivedWeightKg) || 0,
      receivedQuantity: parseInt(form.receivedQuantity) || 0,
      acceptedWeightKg: parseFloat(form.receivedWeightKg) || 0,
      storageLocation: form.storageLocation,
      status: 'ACCEPTED'
    };

    setInwardList([newGrn, ...inwardList]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
        <div>
          <h1 className="text-base font-extrabold text-white flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-orange-500" />
            Material Inward (GRN) & Customer Stock Segregation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Mandatory Heat Number verification, Mill Test Certificate (MTC) chemistry, and strict customer ownership isolation
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
        >
          <Plus className="h-4 w-4" /> Inward New Material (GRN)
        </button>
      </div>

      {/* Customer Stock Segregation Callout */}
      <div className="bg-blue-950/20 border border-blue-500/30 p-3.5 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-blue-300">Strict Ownership Rule Active:</span>
            <p className="text-slate-300 text-[11px] mt-0.5">
              Customer-owned material is segregated in dedicated bays. 100% weight reconciliation enforced: Input = Good + Rejection + Scrap.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Customer Stock</span>
            <span className="font-mono font-bold text-white text-sm">2,690 kg</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Company Stock</span>
            <span className="font-mono font-bold text-white text-sm">0 kg</span>
          </div>
        </div>
      </div>

      {/* Material Inward Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Material Inward Register (Heat Number Linked)
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {inwardList.length} GRN Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <th className="p-3">GRN No & Date</th>
                <th className="p-3">Ownership & Customer</th>
                <th className="p-3">Part Details</th>
                <th className="p-3">Raw Heat Number</th>
                <th className="p-3">Inward Weight / Qty</th>
                <th className="p-3">Location</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {inwardList.map((g) => (
                <tr key={g.grnNumber} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono">
                    <span className="font-bold text-white block">{g.grnNumber}</span>
                    <span className="text-[10px] text-slate-500">{g.date} &bull; DC: {g.challanNumber}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded inline-block mb-0.5">
                      {g.ownership}
                    </span>
                    <div className="font-semibold text-slate-200">{g.customerName}</div>
                  </td>
                  <td className="p-3">
                    <span className="font-mono font-bold text-slate-200 block">{g.partNumber}</span>
                    <span className="text-[11px] text-blue-400 font-mono">Grade: {g.materialGrade}</span>
                  </td>
                  <td className="p-3 font-mono">
                    <span className="font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30 block w-fit">
                      {g.heatNumber}
                    </span>
                    <span className="text-[10px] text-slate-500">Cast: {g.castNumber}</span>
                  </td>
                  <td className="p-3 font-mono">
                    <span className="font-bold text-white block">{g.receivedWeightKg} kg</span>
                    <span className="text-[10px] text-slate-400">{g.receivedQuantity} Pcs</span>
                  </td>
                  <td className="p-3 text-slate-300 font-mono text-[11px]">
                    {g.storageLocation}
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                      {g.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New GRN Inward Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PackagePlus className="h-5 w-5 text-orange-500" />
                Material Inward (GRN Entry)
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGrn} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Ownership Type</label>
                  <select
                    value={form.ownership}
                    onChange={(e) => setForm({ ...form, ownership: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="CUSTOMER">CUSTOMER OWNED (Job Work)</option>
                    <option value="COMPANY">COMPANY OWNED</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Customer Delivery Challan No</label>
                  <input
                    type="text"
                    value={form.challanNumber}
                    onChange={(e) => setForm({ ...form, challanNumber: e.target.value })}
                    placeholder="e.g. DC-9988"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Part Number</label>
                  <input
                    type="text"
                    value={form.partNumber}
                    onChange={(e) => setForm({ ...form, partNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-red-400 font-bold block mb-1">
                    Raw Heat Number (MANDATORY) *
                  </label>
                  <input
                    type="text"
                    value={form.heatNumber}
                    onChange={(e) => setForm({ ...form, heatNumber: e.target.value })}
                    placeholder="e.g. H-45872"
                    className="w-full bg-slate-950 border border-red-500/60 rounded-lg p-2 text-white font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Cast / Coil Number</label>
                  <input
                    type="text"
                    value={form.castNumber}
                    onChange={(e) => setForm({ ...form, castNumber: e.target.value })}
                    placeholder="e.g. C-9021-B"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Received Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.receivedWeightKg}
                    onChange={(e) => setForm({ ...form, receivedWeightKg: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Received Quantity (Pcs)</label>
                  <input
                    type="number"
                    value={form.receivedQuantity}
                    onChange={(e) => setForm({ ...form, receivedQuantity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg text-xs shadow-md"
                >
                  Accept & Allocate Inward Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

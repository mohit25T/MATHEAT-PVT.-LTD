import React, { useState } from 'react';
import {
  Layers,
  Flame,
  Plus,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const BatchesPage = ({ onSelectTab }) => {
  const [batches, setBatches] = useState([
    {
      batchId: 'HT-2026-000125',
      jobOrder: 'JO-2026-0001',
      customer: 'SKF India Bearings Ltd.',
      partNumber: '6205-BRG-RING',
      heatNumber: 'H-45872',
      furnaceId: 'F-01',
      furnaceCapacity: 600,
      inputWeightKg: 420,
      inputQuantity: 1500,
      recipe: 'RCP-EN31-6205 (V1)',
      status: 'HEATING',
      qcStatus: 'NOT_STARTED'
    },
    {
      batchId: 'HT-2026-000124',
      jobOrder: 'JO-2026-0001',
      customer: 'SKF India Bearings Ltd.',
      partNumber: '6205-BRG-RING',
      heatNumber: 'H-45872',
      furnaceId: 'F-01',
      furnaceCapacity: 600,
      inputWeightKg: 420,
      inputQuantity: 1500,
      recipe: 'RCP-EN31-6205 (V1)',
      status: 'READY_FOR_DISPATCH',
      qcStatus: 'PASS'
    },
    {
      batchId: 'HT-2026-000123',
      jobOrder: 'JO-2026-0002',
      customer: 'Tata Motors Ltd.',
      partNumber: 'PINION-24T-TATA',
      heatNumber: 'H-90214',
      furnaceId: 'F-02',
      furnaceCapacity: 1200,
      inputWeightKg: 925,
      inputQuantity: 500,
      recipe: 'RCP-20MNCR5-PIN (V1)',
      status: 'DISPATCHED',
      qcStatus: 'PASS'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [furnaceCap, setFurnaceCap] = useState(600);
  const [inputWeight, setInputWeight] = useState(420);
  const [selectedFurnace, setSelectedFurnace] = useState('F-01');

  // Loading Validation
  const availableWeight = Math.max(0, furnaceCap - inputWeight);
  const utilization = furnaceCap > 0 ? Math.round((inputWeight / furnaceCap) * 100) : 0;
  const isOverloaded = inputWeight > furnaceCap;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
        <div>
          <h1 className="text-base font-extrabold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-orange-500" />
            Batch Management & Furnace Loading Control
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Unique Batch IDs (HT-YYYY-XXXXXX), unbroken Heat Number linkage, and furnace capacity validation
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
        >
          <Plus className="h-4 w-4" /> Plan & Load New Batch
        </button>
      </div>

      {/* Batches Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Active Batch Register
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {batches.length} Batches Loaded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <th className="p-3">Batch ID & Job Order</th>
                <th className="p-3">Customer & Component</th>
                <th className="p-3">Raw Heat Number</th>
                <th className="p-3">Furnace & Loading</th>
                <th className="p-3">Approved Recipe</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {batches.map((b) => (
                <tr key={b.batchId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono">
                    <span className="font-bold text-orange-400 block">{b.batchId}</span>
                    <span className="text-[10px] text-slate-500">{b.jobOrder}</span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-200">{b.partNumber}</div>
                    <span className="text-[11px] text-slate-400">{b.customer}</span>
                  </td>
                  <td className="p-3 font-mono">
                    <span className="font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30 inline-block">
                      {b.heatNumber}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold font-mono text-white">
                      {b.furnaceId} ({b.inputWeightKg} kg)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Cap: {b.furnaceCapacity} kg &bull; {Math.round((b.inputWeightKg / b.furnaceCapacity) * 100)}% load
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-300">
                    {b.recipe}
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      b.status === 'HEATING'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse'
                        : b.status === 'READY_FOR_DISPATCH'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {b.qcStatus === 'PASS' ? (
                      <button
                        onClick={() => onSelectTab('certificates')}
                        className="text-orange-400 hover:text-orange-300 font-bold text-xs underline"
                      >
                        Certificate &rarr;
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectTab('operator')}
                        className="text-blue-400 hover:text-blue-300 font-bold text-xs"
                      >
                        Open Console &rarr;
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Furnace Loading Calculator Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Furnace Loading & Capacity Calculator
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Furnace</label>
                <select
                  value={selectedFurnace}
                  onChange={(e) => {
                    setSelectedFurnace(e.target.value);
                    setFurnaceCap(e.target.value === 'F-02' ? 1200 : e.target.value === 'F-03' ? 400 : 600);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="F-01">Furnace F-01 (SQF - 600 kg Max Capacity)</option>
                  <option value="F-02">Furnace F-02 (PIT - 1200 kg Max Capacity)</option>
                  <option value="F-03">Furnace F-03 (Mesh Belt - 400 kg Max Capacity)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Input Batch Weight to Load (kg)</label>
                <input
                  type="number"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold text-sm"
                />
              </div>

              {/* Live Capacity Feedback */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                isOverloaded
                  ? 'bg-red-950/30 border-red-500/50 text-red-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}>
                <div className="flex justify-between font-mono text-xs">
                  <span>Furnace Rated Capacity:</span>
                  <strong className="text-white">{furnaceCap} kg</strong>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span>Planned Batch Load:</span>
                  <strong className={isOverloaded ? 'text-red-400 font-black' : 'text-orange-400'}>
                    {inputWeight} kg
                  </strong>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span>Remaining Available:</span>
                  <strong className="text-emerald-400">{availableWeight} kg</strong>
                </div>
                <div className="flex justify-between font-mono text-xs pt-1 border-t border-slate-800">
                  <span>Furnace Utilization:</span>
                  <strong className="text-white">{utilization}%</strong>
                </div>

                {isOverloaded && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold pt-2 border-t border-red-500/40">
                    <AlertTriangle className="h-4 w-4" />
                    OVERLOAD BLOCKED: Loaded weight exceeds furnace rating. Do not overload!
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isOverloaded}
                  onClick={() => {
                    alert('Batch Scheduled & Furnace Assigned!');
                    setShowModal(false);
                  }}
                  className={`px-5 py-2 rounded-lg text-xs font-bold text-white shadow ${
                    isOverloaded ? 'bg-slate-700 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-500'
                  }`}
                >
                  Confirm Furnace Load
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

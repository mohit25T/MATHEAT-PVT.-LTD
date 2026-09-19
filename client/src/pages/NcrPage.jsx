import React, { useState } from 'react';
import {
  AlertOctagon,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const NcrPage = ({ onSelectTab }) => {
  const [ncrs, setNcrs] = useState([
    {
      ncrNumber: 'NCR-2026-0001',
      batchId: 'HT-2026-000120',
      partNumber: '6205-BRG-RING',
      heatNumber: 'H-39110',
      defectCategory: 'LOW_HARDNESS',
      defectDescription: 'Surface hardness observed at 55.5 HRC against 58-62 HRC drawing requirement.',
      affectedQuantity: 400,
      affectedWeightKg: 112,
      disposition: 'REWORK',
      reworkBatchId: 'HT-2026-000120-R01',
      status: 'DISPOSITION_APPROVED',
      rootCause: 'Furnace quench oil temperature exceeded 75°C causing delayed martensitic transformation.',
      correctiveAction: 'Oil heat exchanger pump flushed and filter replaced. Batch scheduled for re-tempering/re-hardening.'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
        <div>
          <h1 className="text-base font-extrabold text-white flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-red-500" />
            Non-Conformance Reports (NCR) & Rework Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Failure &rarr; Root Cause Analysis &rarr; Disposition (Rework, Reprocess, Scrap, Concession). Original failed batch is never deleted!
          </p>
        </div>
      </div>

      {/* Rework Preservation Notice */}
      <div className="bg-red-950/20 border border-red-500/30 p-3.5 rounded-xl flex items-center gap-3 text-xs">
        <ShieldAlert className="h-5 w-5 text-red-400 shrink-0" />
        <div className="text-slate-300">
          <strong className="text-red-400">Strict Traceability Rule:</strong> When a batch fails QC, the original batch record is preserved permanently. A linked child rework batch (e.g. <span className="font-mono text-white">HT-2026-000120-R01</span>) is generated to track subsequent processing.
        </div>
      </div>

      {/* NCR Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Quality Non-Conformance Register
          </h2>
          <span className="text-xs text-slate-400 font-mono">{ncrs.length} NCRs</span>
        </div>

        <div className="divide-y divide-slate-800">
          {ncrs.map((n) => (
            <div key={n.ncrNumber} className="p-5 hover:bg-slate-800/30 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-red-400 text-sm">{n.ncrNumber}</span>
                  <span className="text-xs text-slate-300 font-mono">
                    Batch: <strong className="text-white">{n.batchId}</strong>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Heat No: <strong className="text-slate-300">{n.heatNumber}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded uppercase">
                    {n.defectCategory.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded uppercase">
                    DISPOSITION: {n.disposition}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-200">
                <strong>Defect Description:</strong> {n.defectDescription}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Root Cause Analysis</span>
                  <p className="text-slate-300 mt-0.5">{n.rootCause}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Corrective & Preventive Action</span>
                  <p className="text-slate-300 mt-0.5">{n.correctiveAction}</p>
                </div>
              </div>

              {n.reworkBatchId && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-orange-400" />
                    <span className="text-slate-400">Generated Linked Rework Batch:</span>
                    <strong className="font-mono text-orange-400">{n.reworkBatchId}</strong>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Affected Weight: <strong>{n.affectedWeightKg} kg ({n.affectedQuantity} pcs)</strong>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

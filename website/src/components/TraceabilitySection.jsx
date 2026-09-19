import React, { useState } from 'react';
import { QrCode, ShieldCheck, CheckCircle2, ArrowRight, FileText, Search, ExternalLink, RefreshCw } from 'lucide-react';
import { sampleCertificate, demoBatches } from '../data/specs';

export default function TraceabilitySection({ onOpenCertificateModal }) {
  const [searchedBatch, setSearchedBatch] = useState("HT-2026-000125");
  const [activeChainStep, setActiveChainStep] = useState(7); // default all verified

  const currentBatch = demoBatches[searchedBatch] || demoBatches["HT-2026-000125"];

  const traceabilityChain = [
    { step: "01", name: "CUSTOMER", code: "PAT-LTD", desc: "Order Allocation" },
    { step: "02", name: "JOB ORDER", code: "JO-8921", desc: "Routing Card" },
    { step: "03", name: "HEAT NUMBER", code: "H45872", desc: "Mill Certificate" },
    { step: "04", name: "BATCH", code: "HT-2026-000125", desc: "Barcoded Charge" },
    { step: "05", name: "FURNACE", code: "SQF-02", desc: "Sealed Chamber" },
    { step: "06", name: "PROCESS", code: "CARB+TEMP", desc: "850°C Quench" },
    { step: "07", name: "QC INSPECTION", code: "60.2 HRC", desc: "Lab Sign-off" },
    { step: "08", name: "CERTIFICATE", code: "HTC-000125", desc: "QR Locked" },
  ];

  return (
    <section id="traceability" className="py-8 bg-[#E5EBF2] bg-cad-grid border-b border-slate-300 relative overflow-hidden w-full">
      <div className="w-full px-3 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-6">
          <span className="font-mono text-xs font-bold text-heat-orange tracking-widest uppercase block mb-1">
            // UNCOMPROMISED ACCOUNTABILITY
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            EVERY BATCH HAS A STORY.
          </h2>
          <div className="w-16 h-1 bg-heat-orange mt-2 mb-3"></div>
          <p className="text-base font-medium text-navy-800/90 leading-relaxed">
            "From raw material identification to final metallurgical certification, every single component batch processed at MATHEAT PVT. LTD. carries an immutable digital audit trail."
          </p>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
            Automotive tier-1 and precision bearing manufacturers require complete traceability. We connect steel mill heats, fixturing orientations, continuous thermocouple curves, and lab coupon test records into a single verifiable Heat Treatment Certificate.
          </p>
        </div>

        {/* Animated Traceability Chain */}
        <div className="bg-navy-950 border-2 border-navy-700/80 rounded-2xl p-4 sm:p-5 text-white shadow-2xl mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-cad-grid-dark opacity-20 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-navy-800 gap-2">
              <span className="font-mono text-xs text-heat-orange font-bold uppercase tracking-wider">
                END-TO-END DIGITAL AUDIT CHAIN
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                CLICK ANY NODE TO INSPECT AUDIT LEVEL
              </span>
            </div>

            {/* Nodes Chain */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 relative">
              {traceabilityChain.map((node, index) => {
                const isActive = index <= activeChainStep;
                return (
                  <button
                    key={node.step}
                    onClick={() => setActiveChainStep(index)}
                    className={`text-left p-3 rounded-xl border-2 transition-all relative ${
                      isActive
                        ? 'bg-navy-900 border-heat-orange shadow-md'
                        : 'bg-navy-900/60 border-navy-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-slate-400 font-bold">{node.step}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-heat-orange"></span>
                    </div>
                    <div className="font-mono font-bold text-xs text-white truncate">
                      {node.name}
                    </div>
                    <div className="font-mono text-[11px] text-heat-orange font-semibold mt-1 truncate">
                      {node.code}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {node.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Digital Batch Card Simulator (As required in prompt) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Explanatory & Interactive Lookup */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 bg-slate-200 text-navy-900 px-3 py-1 rounded text-xs font-mono font-bold">
              <span>LIVE BATCH VERIFICATION PORTAL</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Instant Metallurgical Verification by QR or Batch ID
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed">
              Every dispatched component container is sealed with a durable water-resistant barcoded dispatch tag. Customers and inspection engineers can scan the code to instantly retrieve full furnace pyrometry graphs and certified hardness data.
            </p>
              {/* Interactive Batch Input Search Simulator */}
            <div className="bg-white border-2 border-slate-400 rounded-xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono text-slate-600 uppercase font-bold">
                  Simulate Client-Side Batch Query:
                </label>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  100% Client-Side DB
                </span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchedBatch}
                    onChange={(e) => setSearchedBatch(e.target.value.trim().toUpperCase())}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs font-mono font-semibold text-navy-900 focus:outline-none focus:border-heat-orange"
                    placeholder="Enter Batch No. (e.g. HT-2026-000125)"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <button
                  onClick={() => setSearchedBatch("HT-2026-000125")}
                  className="px-3 py-2 bg-navy-900 hover:bg-navy-800 text-white font-mono text-xs font-bold rounded flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>RESET</span>
                </button>
              </div>

              {/* Sample Batch Quick Chips */}
              <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-slate-500">
                <span>Sample Batches:</span>
                {Object.keys(demoBatches).map((b) => (
                  <button
                    key={b}
                    onClick={() => setSearchedBatch(b)}
                    className={`px-2 py-0.5 rounded border text-[10px] font-semibold transition-all ${
                      searchedBatch === b
                        ? 'bg-heat-orange text-white border-heat-orange'
                        : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenCertificateModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-heat-orange hover:bg-heat-deep text-white font-mono text-xs font-bold rounded shadow transition-all group"
              >
                <FileText className="w-4 h-4" />
                <span>INSPECT FULL SAMPLE CERTIFICATE</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right: The Requested Digital Batch Card Demo */}
          <div className="lg:col-span-6">
            <div className="bg-white border-2 border-navy-900 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden font-mono text-xs">
              {/* Top Industrial Header Banner */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-navy-900">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block">
                    MATHEAT PVT. LTD. // TRACEABILITY SYSTEM
                  </span>
                  <div className="text-base font-bold text-navy-900">
                    DIGITAL BATCH ROUTING CARD
                  </div>
                </div>
                <div className="p-2 bg-slate-100 rounded border border-slate-300">
                  <QrCode className="w-8 h-8 text-navy-900" />
                </div>
              </div>

              {/* Exact Requested Batch Parameters Table */}
              <div className="space-y-2.5 divide-y divide-slate-100">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 uppercase">Batch No.</span>
                  <span className="font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {currentBatch.batchNo}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 uppercase">Heat No.</span>
                  <span className="font-bold text-navy-900">{currentBatch.heatNo}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 uppercase">Process</span>
                  <span className="font-bold text-navy-900">{currentBatch.process}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 uppercase">Furnace</span>
                  <span className="font-bold text-navy-900">{currentBatch.furnace}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 uppercase">QC Result</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {currentBatch.qc}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 uppercase">Certificate No.</span>
                  <span className="font-bold text-heat-orange bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    {currentBatch.certificate}
                  </span>
                </div>
              </div>

              {/* Verified Digital Stamp */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  CRYPTOGRAPHICALLY LOGGED
                </span>
                <button
                  onClick={onOpenCertificateModal}
                  className="text-heat-orange hover:underline font-bold flex items-center gap-1"
                >
                  VIEW CERTIFICATE <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Visual Concept Disclaimer */}
              <div className="mt-2 text-[10px] text-slate-400 italic text-center">
                * Visual digital batch card concept representation.
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

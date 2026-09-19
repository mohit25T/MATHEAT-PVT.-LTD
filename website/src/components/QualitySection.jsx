import React from 'react';
import { qualityCapabilities } from '../data/specs';
import { ShieldCheck, CheckCircle2, ChevronRight, Microscope, Target, Compass } from 'lucide-react';

export default function QualitySection() {
  const qualityFlow = [
    { step: "01", name: "Material", desc: "Chemical composition & OES audit" },
    { step: "02", name: "Process", desc: "Validated metallurgical recipe" },
    { step: "03", name: "Furnace", desc: "AMS 2750 pyrometry calibration" },
    { step: "04", name: "Parameters", desc: "Closed-loop atmosphere & soak" },
    { step: "05", name: "Inspection", desc: "Rockwell, Vickers & micro testing" },
    { step: "06", name: "Traceability", desc: "100% certified batch audit trail" },
  ];

  return (
    <section id="quality" className="py-8 bg-[#E5EBF2] bg-cad-grid border-b border-slate-300 relative overflow-hidden w-full">
      <div className="w-full px-3 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-6">
          <span className="font-mono text-xs font-bold text-heat-orange tracking-widest uppercase block mb-1">
            // METALLURGICAL ASSURANCE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            QUALITY IS BUILT INTO THE PROCESS.
          </h2>
          <div className="w-16 h-1 bg-heat-orange mt-2 mb-3"></div>
          <p className="text-base font-semibold text-slate-800 leading-relaxed">
            "Quality should not be checked only at the end. At MATHEAT PVT. LTD., quality is systematically governed from raw material induction to final metallurgical release."
          </p>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
            By embedding pyrometric logging, optical microstructure analysis, and Rockwell/Vickers hardness checks throughout each production phase, we eliminate deviations before they occur.
          </p>
        </div>

        {/* Quality Closed-Loop Sequential Flow */}
        <div className="bg-white border-2 border-slate-400 rounded-2xl p-4 sm:p-5 mb-6 shadow-lg">
          <div className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">
            CONTINUOUS IN-LINE QUALITY CYCLE // SIX-POINT VERIFICATION
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {qualityFlow.map((node, i) => (
              <div key={i} className="bg-slate-100 border-2 border-slate-300 rounded-xl p-3 relative group hover:border-heat-orange hover:bg-orange-50/20 transition-all">
                <span className="text-[10px] font-mono font-bold text-heat-orange block mb-0.5">
                  STAGE {node.step}
                </span>
                <div className="text-sm font-bold text-navy-900 mb-0.5">
                  {node.name}
                </div>
                <div className="text-xs text-slate-600 leading-tight">
                  {node.desc}
                </div>
                {i < qualityFlow.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-400 font-bold">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quality Capabilities & Laboratory Testing Equipment */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qualityCapabilities.map((cap, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-slate-400 hover:border-heat-orange border-t-4 border-t-navy-900 hover:border-t-heat-orange rounded-xl p-4 sm:p-5 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                {/* Custom Line Art Equipment Icon */}
                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-300 flex items-center justify-center text-navy-900 mb-4">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-navy-900 fill-none" strokeWidth="1.75">
                    <circle cx="12" cy="12" r="9" strokeDasharray="3 2" />
                    <line x1="12" y1="3" x2="12" y2="7" stroke="#FF6B00" strokeWidth="2" />
                    <line x1="12" y1="12" x2="16" y2="10" stroke="#FF6B00" strokeWidth="2" />
                    <circle cx="12" cy="12" r="2" fill="#0A192F" />
                  </svg>
                </div>

                <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 mb-1">
                  <span className="font-bold">CAPABILITY 0{idx + 1}</span>
                  <span className="text-heat-orange font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{cap.standard}</span>
                </div>

                <h3 className="text-lg font-extrabold text-navy-900 mb-2">
                  {cap.title}
                </h3>

                <div className="bg-slate-100 border border-slate-300 rounded p-2.5 mb-3 font-mono text-xs text-navy-900">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Equipment:</span>
                  <span className="font-semibold">{cap.equipment}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {cap.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-300 flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>NABL CALIBRATED & VERIFIED</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

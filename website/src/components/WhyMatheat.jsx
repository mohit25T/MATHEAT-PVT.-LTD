import React from 'react';
import { ShieldCheck, Target, Layers, FileCheck2, Award, Zap } from 'lucide-react';
import { companyInfo } from '../data/companyInfo';

export default function WhyMatheat({ onOpenQuoteModal }) {
  const pillars = [
    {
      num: "01",
      title: "UNIFORMITY",
      shortDesc: "Consistent treatment across batches.",
      desc: "Zero hot-spots or temperature dead-zones. Continuous gas agitation and high-velocity quench fluid dynamics guarantee identical surface-to-core hardness across thousands of components.",
      stat: "±3°C Pyrometric Uniformity"
    },
    {
      num: "02",
      title: "STRENGTH",
      shortDesc: "Controlled thermal processing for required material performance.",
      desc: "Optimized thermodynamic phase transformation maximizing tensile strength, high root-bending fatigue endurance, and impact toughness without brittle failure.",
      stat: "+350% Extended Fatigue Life"
    },
    {
      num: "03",
      title: "PRECISION",
      shortDesc: "Controlled process parameters and inspection.",
      desc: "Sub-millimeter effective case depth control (±0.08 mm) and strict runout preservation through specialized vertical hanging fixturing and slow thermal pre-heat ramps.",
      stat: "Runout < 0.015 mm TIR"
    },
    {
      num: "04",
      title: "TRACEABILITY",
      shortDesc: "Batch-level process and quality records.",
      desc: "Permanent barcoded link from incoming raw forging heat code to furnace datalogger, quench oil curve, Vickers hardness traverse, and certified Heat Treatment Certificate.",
      stat: "100% Digital QR Audit Trail"
    }
  ];

  return (
    <section className="py-8 bg-[#E5EBF2] bg-cad-grid border-b border-slate-300 relative overflow-hidden w-full">
      <div className="w-full px-3 sm:px-6">
        
        {/* Visual Brand Triad Highlight: UNIFORM • STRENGTH • PRECISION */}
        <div className="mb-6 p-4 sm:p-6 bg-navy-950 rounded-2xl border border-navy-800 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-cad-grid-dark opacity-30 pointer-events-none"></div>

          <div className="relative z-10 text-center w-full space-y-2.5">
            <span className="font-mono text-xs font-bold text-heat-orange tracking-widest uppercase block">
              // THE CORE MATHEAT BRAND PROMISE
            </span>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-mono text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              <span className="text-white hover:text-heat-orange transition-colors">UNIFORM</span>
              <span className="text-heat-orange">•</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-heat-orange to-heat-amber">STRENGTH</span>
              <span className="text-heat-orange">•</span>
              <span className="text-white hover:text-heat-orange transition-colors">PRECISION</span>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm font-mono max-w-2xl mx-auto pt-1">
              Every furnace cycle at MATHEAT PVT. LTD. is engineered to satisfy this triad. No shortcuts, no estimations, no compromises.
            </p>
          </div>
        </div>

        {/* Section Heading */}
        <div className="max-w-3xl mb-6">
          <span className="font-mono text-xs font-bold text-heat-orange tracking-widest uppercase block mb-1">
            // COMPETITIVE ADVANTAGE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            PRECISION YOU CAN TRACE.
          </h2>
          <div className="w-16 h-1 bg-heat-orange mt-2 mb-3"></div>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Our customers don't just purchase heat treatment; they purchase guaranteed component reliability. Here is why India's leading precision engineering and automotive manufacturers trust MATHEAT.
          </p>
        </div>

        {/* Four Major Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p) => (
            <div
              key={p.num}
              className="bg-white border-2 border-slate-400 hover:border-heat-orange border-t-4 border-t-navy-900 hover:border-t-heat-orange rounded-xl p-4 sm:p-5 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-slate-400 mb-3 pb-2 border-b border-slate-200">
                  <span className="font-bold text-heat-orange text-lg">{p.num}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">MATHEAT CORE</span>
                </div>

                <h3 className="text-xl font-black text-navy-900 tracking-tight mb-1.5 group-hover:text-heat-orange transition-colors">
                  {p.title}
                </h3>

                <p className="text-xs font-semibold text-navy-800/90 mb-2">
                  {p.shortDesc}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-200 bg-slate-50 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-3 sm:p-3.5 rounded-b-xl border-t border-slate-300">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Benchmark Metric:</span>
                <span className="text-xs font-mono font-bold text-navy-900 group-hover:text-heat-orange transition-colors">
                  {p.stat}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

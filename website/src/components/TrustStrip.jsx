import React from 'react';

export default function TrustStrip() {
  const trustPillars = [
    {
      title: "UNIFORM HARDNESS",
      desc: "Cross-sectional repeatable metallurgical core & surface hardness",
      icon: (
        <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-heat-orange fill-none" strokeWidth="1.75">
          <circle cx="16" cy="16" r="13" strokeDasharray="3 2" />
          <circle cx="16" cy="16" r="8" />
          <circle cx="16" cy="16" r="3" fill="#FF6B00" />
          <line x1="16" y1="0" x2="16" y2="6" stroke="#0A192F" strokeWidth="2" />
          <line x1="16" y1="26" x2="16" y2="32" stroke="#0A192F" strokeWidth="2" />
          <line x1="0" y1="16" x2="6" y2="16" stroke="#0A192F" strokeWidth="2" />
          <line x1="26" y1="16" x2="32" y2="16" stroke="#0A192F" strokeWidth="2" />
        </svg>
      )
    },
    {
      title: "PRECISION CONTROL",
      desc: "Closed-loop carbon potential, multi-zone pyrometry & soak timers",
      icon: (
        <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-heat-orange fill-none" strokeWidth="1.75">
          <rect x="4" y="6" width="24" height="20" rx="2" stroke="#0A192F" strokeWidth="1.5" />
          <line x1="8" y1="20" x2="14" y2="12" stroke="#FF6B00" strokeWidth="2" />
          <line x1="14" y1="12" x2="20" y2="17" stroke="#FF6B00" strokeWidth="2" />
          <line x1="20" y1="17" x2="25" y2="10" stroke="#FF6B00" strokeWidth="2" />
          <circle cx="25" cy="10" r="2" fill="#FF6B00" />
          <line x1="8" y1="23" x2="24" y2="23" stroke="#64748B" strokeDasharray="2 2" />
        </svg>
      )
    },
    {
      title: "PROCESS TRACEABILITY",
      desc: "Direct barcode linkage from raw mill heat code to final certificate",
      icon: (
        <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-heat-orange fill-none" strokeWidth="1.75">
          <rect x="4" y="4" width="8" height="8" />
          <rect x="20" y="4" width="8" height="8" />
          <rect x="4" y="20" width="8" height="8" />
          <circle cx="8" cy="8" r="2" fill="#FF6B00" />
          <circle cx="24" cy="8" r="2" fill="#FF6B00" />
          <circle cx="8" cy="24" r="2" fill="#FF6B00" />
          <path d="M 16 8 H 17 M 16 16 H 24 V 24 M 20 20 H 24" stroke="#0A192F" strokeWidth="2" />
        </svg>
      )
    },
    {
      title: "CONSISTENT RESULTS",
      desc: "Batch-to-batch repeatability backed by NABL calibrated metallurgy lab",
      icon: (
        <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-heat-orange fill-none" strokeWidth="1.75">
          <path d="M 6 18 L 12 24 L 26 8" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="14" stroke="#0A192F" strokeWidth="1.5" strokeDasharray="4 2" />
        </svg>
      )
    }
  ];

  return (
    <section className="bg-[#E5EBF2] border-y border-slate-300 py-4 relative z-10 w-full">
      <div className="w-full px-3 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trustPillars.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl bg-white border-2 border-slate-400 hover:border-heat-orange border-t-4 border-t-navy-900 hover:border-t-heat-orange shadow-md hover:shadow-xl transition-all group"
            >
              <div className="shrink-0 p-2 bg-slate-100 border border-slate-300 rounded-lg group-hover:bg-orange-50 group-hover:border-heat-orange/50 transition-colors">
                {item.icon}
              </div>
              <div>
                <h4 className="font-mono text-xs font-bold tracking-wider text-navy-900 uppercase">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

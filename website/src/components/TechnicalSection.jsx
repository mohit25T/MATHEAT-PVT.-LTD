import React from 'react';
import { technicalCards } from '../data/specs';
import { Sliders, Cpu, Activity, Database, CheckSquare, Layers } from 'lucide-react';

export default function TechnicalSection() {
  const cardIcons = [Sliders, Cpu, Activity, Database, CheckSquare, Layers];

  return (
    <section className="py-8 bg-navy-950 text-white border-b border-navy-800 relative overflow-hidden w-full">
      {/* Engineering CAD Pattern */}
      <div className="absolute inset-0 bg-cad-grid-dark opacity-30 pointer-events-none"></div>

      <div className="w-full px-3 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-6">
          <span className="font-mono text-xs font-bold text-heat-orange tracking-widest uppercase block mb-1">
            // CLOSED-LOOP GOVERNANCE
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            ENGINEERED PROCESS CONTROL.
          </h2>
          <div className="w-16 h-1 bg-heat-orange mt-2 mb-3"></div>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            By digitizing thermodynamic parameters, MATHEAT eliminates human error and ensures that every heating phase conforms precisely to material equilibrium standards.
          </p>
        </div>

        {/* 6 Technical Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {technicalCards.map((card, idx) => {
            const Icon = cardIcons[idx] || Cpu;
            return (
              <div
                key={card.id}
                className="bg-[#0F223D] border-2 border-navy-700 hover:border-heat-orange border-t-4 border-t-heat-orange/70 hover:border-t-heat-orange rounded-xl p-4 sm:p-5 transition-all duration-300 shadow-xl hover:shadow-2xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-4 pb-2 border-b border-navy-800">
                    <span className="text-heat-orange font-bold">SPEC 0{idx + 1} //</span>
                    <span className="text-slate-300 uppercase font-semibold">{card.tag}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-700 text-heat-orange group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-heat-orange transition-colors">
                      {card.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {card.description}
                  </p>
                </div>

                {/* Metric Strip */}
                <div className="pt-3 border-t border-navy-800/80 font-mono">
                  <div className="text-sm font-bold text-emerald-400">
                    {card.metric}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                    {card.submetric}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

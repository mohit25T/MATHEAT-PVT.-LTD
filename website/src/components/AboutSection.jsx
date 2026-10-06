import React from 'react';
import MetallurgyLineArt from './lineart/MetallurgyLineArt';
import { CheckCircle2, Flame, Layers, ShieldCheck, Thermometer, Clock, Wind, Droplets } from 'lucide-react';
import SwipableCardCarousel from './common/SwipableCardCarousel';

export default function AboutSection() {
  const controlParameters = [
    { name: "Controlled Temperature", desc: "Multi-zone digital pyrometry accurate within ±3°C", icon: Thermometer },
    { name: "Controlled Time", desc: "Automated saturation timers avoiding grain coarsening", icon: Clock },
    { name: "Controlled Atmosphere", desc: "Endo-gas & nitrogen shrouds with closed-loop oxygen probes", icon: Wind },
    { name: "Controlled Quenching", desc: "Agitated quench tanks with high-velocity fluid circulation", icon: Droplets },
    { name: "Controlled Cooling", desc: "Controlled cooling curves to eliminate distortion and cracking", icon: Layers },
    { name: "Microstructure Inspection", desc: "In-house lab verifying grain size, decarburization & phase ratio", icon: ShieldCheck },
    { name: "Batch Traceability", desc: "Individual job order barcode linking mill heat to certificate", icon: CheckCircle2 }
  ];

  return (
    <section id="about" className="py-8 bg-[#E5EBF2] bg-cad-grid border-b border-slate-300 relative overflow-hidden w-full">
      <div className="w-full px-3 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            ENGINEERED AROUND METALLURGY.
          </h2>
          <div className="w-16 h-1 bg-heat-orange mt-2 mb-3"></div>
          <p className="text-base font-semibold text-slate-800 leading-relaxed">
            "Heat treatment is not simply heating and cooling metal. It is the controlled transformation of material properties."
          </p>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
            At MATHEAT PVT. LTD., our operations are founded on solid metallurgical science. Every steel alloy grade responds differently to thermodynamic thermal gradients. By strictly governing every variable of the thermal envelope, we transform soft, unpredictable raw forgings and machined components into tough, fatigue-resistant power transmission parts.
          </p>
        </div>

        {/* Metallurgical Visual Microstructure Transformation */}
        <div className="mb-6">
          <MetallurgyLineArt />
        </div>

        {/* 7 Engineering Pillars Grid */}
        <div className="bg-white border-2 border-slate-400 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="shrink-0 min-w-0">
              <span className="font-mono text-[11px] text-slate-500 uppercase tracking-widest font-bold block">
                QUALITY MANAGEMENT PROTOCOL
              </span>
              <h3 className="text-lg font-bold text-navy-900 mt-0.5 sm:whitespace-nowrap">
                The Seven Pillars of MATHEAT Process Control
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-heat-orange px-3 py-1 bg-orange-50 border border-orange-200 rounded shrink-0 whitespace-nowrap self-start md:self-auto">
              ZERO-COMPROMISE METALLURGY
            </span>
          </div>

          <SwipableCardCarousel
            items={controlParameters}
            autoSwipeInterval={3000}
            cardMaxWidth="max-w-2xl"
            renderItem={(param, idx) => {
              const Icon = param.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-100 border-2 border-slate-300 hover:border-heat-orange hover:bg-orange-50/30 shadow-sm hover:shadow-md transition-all group h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded bg-navy-900 text-white group-hover:bg-heat-orange transition-colors shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-mono text-xs font-bold text-navy-900 uppercase break-words">
                        {param.name}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-1 break-words">
                      {param.desc}
                    </p>
                  </div>
                </div>
              );
            }}
          />
        </div>

      </div>
    </section>
  );
}

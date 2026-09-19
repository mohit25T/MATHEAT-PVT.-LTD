import React from 'react';
import { ArrowRight, Flame, ShieldCheck, Mail, Phone } from 'lucide-react';
import GearLineArt from './lineart/GearLineArt';

export default function CTASection({ onOpenQuoteModal }) {
  return (
    <section className="py-8 bg-navy-950 text-white relative overflow-hidden border-b border-navy-800 w-full">
      {/* Background CAD Lines */}
      <div className="absolute inset-0 bg-cad-grid-dark opacity-30 pointer-events-none"></div>

      <div className="w-full px-3 sm:px-6 relative z-10">
        <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border-2 border-navy-700/80 rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Ambient Heat Orange Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-heat-orange/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Copy & Action */}
            <div className="lg:col-span-8 space-y-3.5">
              <span className="font-mono text-xs font-bold text-heat-orange tracking-widest uppercase block">
                // PARTNER WITH MATHEAT
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                LET'S BUILD THE RIGHT HEAT-TREATMENT PROCESS FOR YOUR COMPONENT.
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
                Share your component drawing, material grade, required hardness, and application. Our metallurgical team will analyze your specifications and engineer an optimal, distortion-controlled thermal recipe.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={onOpenQuoteModal}
                  className="inline-flex items-center justify-center gap-2 bg-heat-orange hover:bg-heat-deep text-white font-mono text-xs sm:text-sm font-bold px-8 py-4 rounded shadow-lg hover:shadow-orange-500/25 transition-all group active:scale-95"
                >
                  <span>REQUEST A QUOTE</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-700 text-white border border-navy-600 font-mono text-xs sm:text-sm font-bold px-6 py-4 rounded transition-all active:scale-95"
                >
                  <Phone className="w-4 h-4 text-heat-orange" />
                  <span>CONTACT OUR TEAM</span>
                </a>
              </div>

              {/* Assurance Checkpoints */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  NDA / Confidential Drawing Handling
                </span>
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-heat-orange" />
                  Batch Pilot Samples Available
                </span>
              </div>
            </div>

            {/* Right: Technical Line Art Transition Raw -> Heat Treated */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-navy-950/80 border border-navy-700 rounded-xl relative">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mb-4">
                // COMPONENT THERMAL TRANSITION
              </span>

              {/* Animated Rotating Gear with Heat Shimmer */}
              <div className="relative flex items-center justify-center py-2">
                <GearLineArt className="w-32 h-32" animated={true} heatGlow={true} />
              </div>

              {/* Status Badges */}
              <div className="w-full mt-4 pt-3 border-t border-navy-800 flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">RAW: 20MnCr5</span>
                <span className="text-heat-orange font-bold">HARDENED: 60 HRC</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

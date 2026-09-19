import React, { useState } from 'react';
import { industries } from '../data/industries';
import GearLineArt from './lineart/GearLineArt';
import BearingLineArt from './lineart/BearingLineArt';
import ShaftLineArt from './lineart/ShaftLineArt';
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

export default function IndustriesSection({ onOpenQuoteModal }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const renderIndustryLineArt = (id) => {
    switch (id) {
      case "gears":
      case "transmission-components":
        return <GearLineArt className="w-16 h-16" heatGlow={true} />;
      case "bearings":
        return <BearingLineArt className="w-16 h-16" heatGlow={true} />;
      case "shafts":
        return <ShaftLineArt className="w-24 h-12" heatGlow={true} />;
      case "automotive":
        return (
          <svg viewBox="0 0 64 64" className="w-16 h-16 stroke-navy-900 fill-none" strokeWidth="1.75">
            {/* Camshaft / crankshaft engine outline */}
            <line x1="8" y1="32" x2="56" y2="32" stroke="#0A192F" strokeWidth="2" />
            <rect x="18" y="24" width="8" height="16" stroke="#FF6B00" strokeWidth="1.5" fill="rgba(255,107,0,0.1)" />
            <rect x="38" y="24" width="8" height="16" stroke="#FF6B00" strokeWidth="1.5" fill="rgba(255,107,0,0.1)" />
            <circle cx="22" cy="18" r="5" stroke="#0A192F" />
            <circle cx="42" cy="46" r="5" stroke="#0A192F" />
          </svg>
        );
      case "agricultural":
        return (
          <svg viewBox="0 0 64 64" className="w-16 h-16 stroke-navy-900 fill-none" strokeWidth="1.75">
            {/* Curved rotavator blade line art */}
            <path d="M 16 16 L 36 16 Q 52 24 48 48 L 40 48 Q 44 28 32 24 L 16 24 Z" stroke="#FF6B00" strokeWidth="1.8" fill="rgba(255,107,0,0.1)" />
            <circle cx="24" cy="20" r="3" fill="#0A192F" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 64 64" className="w-16 h-16 stroke-navy-900 fill-none" strokeWidth="1.75">
            <polygon points="32,8 54,20 54,44 32,56 10,44 10,20" strokeWidth="1.5" />
            <circle cx="32" cy="32" r="12" stroke="#FF6B00" strokeDasharray="3 2" />
            <circle cx="32" cy="32" r="4" fill="#0A192F" />
          </svg>
        );
    }
  };

  return (
    <section id="industries" className="py-8 bg-[#E5EBF2] bg-cad-grid border-b border-slate-300 relative overflow-hidden w-full">
      <div className="w-full px-3 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-3 border-b border-slate-300">
          <div>
            <span className="font-mono text-xs font-bold text-heat-orange tracking-widest uppercase block mb-1">
              // APPLICATION SECTORS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              BUILT FOR CRITICAL COMPONENTS.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mt-1.5">
              Serving powertrain, bearing, agricultural, and industrial equipment builders where premature component failure is simply not an option.
            </p>
          </div>
          <div className="mt-3 md:mt-0 font-mono text-xs text-slate-700 bg-white px-3 py-1.5 rounded-lg border-2 border-slate-400 font-bold">
            <span>10 SPECIALIZED INDUSTRIAL SECTORS</span>
          </div>
        </div>

        {/* 10 Industries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {industries.map((ind) => (
            <div
              key={ind.id}
              className="bg-white border-2 border-slate-400 hover:border-heat-orange border-t-4 border-t-navy-900 hover:border-t-heat-orange rounded-xl p-4 sm:p-5 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                  <h3 className="text-xl font-bold text-navy-900 group-hover:text-heat-orange transition-colors">
                    {ind.name}
                  </h3>
                  <span className="font-mono text-[10px] text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-300 font-bold">
                    SECTOR // SPEC
                  </span>
                </div>

                {/* Technical Line Art Display */}
                <div className="py-4 flex justify-center items-center bg-slate-50 rounded-lg border border-slate-300 mb-4 group-hover:border-heat-orange/50 transition-colors">
                  {renderIndustryLineArt(ind.id)}
                </div>

                <p className="text-xs font-semibold text-navy-800/90 mb-2">
                  {ind.headline}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {ind.description}
                </p>

                {/* Typical Components */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">
                    Processed Components:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ind.typicalComponents.map((comp, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300 font-medium"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Critical Metric & Action */}
              <div className="mt-5 pt-4 border-t border-slate-300 flex items-center justify-between">
                <div className="text-[10px] font-mono text-slate-600 max-w-[200px] truncate bg-slate-100 px-2 py-1 rounded border border-slate-200">
                  <span className="text-heat-orange font-bold">CRITICAL: </span>
                  {ind.criticalFactors}
                </div>
                <button
                  onClick={onOpenQuoteModal}
                  className="text-navy-900 hover:text-heat-orange p-1 transition-colors"
                  title="Enquire about this sector"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

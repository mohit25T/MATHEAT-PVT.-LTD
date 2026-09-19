import React, { useState } from 'react';
import { processedComponents } from '../data/components';
import GearLineArt from './lineart/GearLineArt';
import BearingLineArt from './lineart/BearingLineArt';
import ShaftLineArt from './lineart/ShaftLineArt';
import { ArrowRight, Filter, Layers, Check } from 'lucide-react';

export default function ComponentGallery({ onOpenQuoteModal }) {
  const [filterCategory, setFilterCategory] = useState("ALL");

  const categories = ["ALL", "Transmission & Gearing", "Bearings", "Shafts & Axles", "Structural & Suspension", "Wear Components"];

  const filteredComponents = filterCategory === "ALL"
    ? processedComponents
    : processedComponents.filter(c => c.category === filterCategory);

  const renderComponentDrawing = (comp) => {
    switch (comp.lineType) {
      case "gear":
        return <GearLineArt className="w-16 h-16" heatGlow={false} />;
      case "bearing":
      case "roller":
        return <BearingLineArt className="w-16 h-16" heatGlow={false} />;
      case "shaft":
      case "spindle":
        return <ShaftLineArt className="w-28 h-12" heatGlow={false} />;
      case "pin":
        return (
          <svg viewBox="0 0 80 40" className="w-20 h-10 stroke-navy-900 fill-none" strokeWidth="1.5">
            <rect x="10" y="8" width="60" height="24" rx="3" stroke="#0A192F" />
            <line x1="15" y1="8" x2="15" y2="32" stroke="#FF6B00" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="65" y1="8" x2="65" y2="32" stroke="#FF6B00" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="10" y1="20" x2="70" y2="20" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="6 2" />
          </svg>
        );
      case "bush":
        return (
          <svg viewBox="0 0 60 60" className="w-14 h-14 stroke-navy-900 fill-none" strokeWidth="1.5">
            <circle cx="30" cy="30" r="24" stroke="#0A192F" strokeWidth="2" />
            <circle cx="30" cy="30" r="14" stroke="#FF6B00" strokeWidth="1.8" fill="rgba(255,107,0,0.1)" />
            <line x1="30" y1="6" x2="30" y2="54" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="3 3" />
          </svg>
        );
      case "sprocket":
        return (
          <svg viewBox="0 0 60 60" className="w-14 h-14 stroke-navy-900 fill-none" strokeWidth="1.5">
            <polygon points="30,4 34,14 44,8 42,20 54,20 46,28 56,36 44,38 48,50 36,46 32,56 26,46 14,50 18,38 6,36 16,28 8,20 20,20 18,8 28,14" stroke="#FF6B00" strokeWidth="1.5" fill="rgba(255,107,0,0.08)" />
            <circle cx="30" cy="30" r="8" fill="#0A192F" />
          </svg>
        );
      default:
        return <GearLineArt className="w-14 h-14" heatGlow={false} />;
    }
  };

  return (
    <section id="components" className="py-8 bg-[#E5EBF2] bg-cad-grid border-b border-slate-300 relative overflow-hidden w-full">
      <div className="w-full px-3 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-3 border-b border-slate-300">
          <div>
            <span className="font-mono text-xs font-bold text-heat-orange tracking-widest uppercase block mb-1">
              // ENGINEERING GALLERY
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              COMPONENTS WE PROCESS.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mt-1.5">
              Explore critical components regularly processed through our sealed quench, pit, and induction facilities.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-3 md:mt-0 flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
                  filterCategory === cat
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 border-2 border-slate-400 hover:border-slate-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Technical Component Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComponents.map((comp) => (
            <div
              key={comp.id}
              className="bg-white border-2 border-slate-400 hover:border-heat-orange border-t-4 border-t-navy-900 hover:border-t-heat-orange rounded-xl p-4 sm:p-5 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 mb-3 pb-2 border-b border-slate-200">
                  <span className="uppercase text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">{comp.category}</span>
                  <span className="text-heat-orange font-bold">GRADE: {comp.steelGrade}</span>
                </div>

                {/* Technical Line Drawing Header */}
                <div className="h-20 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-300 mb-4 group-hover:bg-orange-50/30 transition-colors">
                  {renderComponentDrawing(comp)}
                </div>

                <h3 className="text-base font-bold text-navy-900 mb-2 group-hover:text-heat-orange transition-colors">
                  {comp.name}
                </h3>

                {/* Treatment & Hardness Parameters */}
                <div className="space-y-2 font-mono text-xs pt-2">
                  <div className="bg-slate-100 p-2.5 rounded border border-slate-300">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Typical Treatment:</span>
                    <span className="font-semibold text-navy-900">{comp.typicalTreatment}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span className="text-[11px] font-medium">Target Hardness:</span>
                    <span className="font-bold text-navy-900">{comp.targetHardness}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span className="text-[11px] font-medium">Effective Case Depth:</span>
                    <span className="font-bold text-heat-orange">{comp.effectiveCaseDepth}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-slate-300">
                <button
                  onClick={onOpenQuoteModal}
                  className="w-full py-2 bg-slate-100 hover:bg-navy-900 hover:text-white text-navy-900 border border-slate-300 rounded font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>SUBMIT RFQ FOR THIS PART</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

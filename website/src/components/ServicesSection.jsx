import React, { useState } from 'react';
import { services } from '../data/services';
import { ArrowRight, Flame, ShieldAlert, CheckCircle2, X, Sliders, Layers } from 'lucide-react';
import GearLineArt from './lineart/GearLineArt';
import BearingLineArt from './lineart/BearingLineArt';
import ShaftLineArt from './lineart/ShaftLineArt';

export default function ServicesSection({ onOpenQuoteModal }) {
  const [selectedService, setSelectedService] = useState(null);

  // Technical SVG Line Drawing per Service
  const renderServiceLineArt = (service, isHovered = false) => {
    switch (service.lineArtType) {
      case 'carburizing':
      case 'caseHardening':
        return (
          <div className="w-20 h-20 flex items-center justify-center relative">
            <svg viewBox="0 0 80 80" className="w-full h-full stroke-navy-900 group-hover:stroke-heat-orange transition-colors fill-none" strokeWidth="1.5">
              {/* Outer Case Layer */}
              <rect x="10" y="10" width="60" height="60" rx="4" strokeWidth="2" />
              {/* Case Hardening Penetration Depth Zone */}
              <rect x="18" y="18" width="44" height="44" strokeDasharray="3 2" className="group-hover:stroke-heat-orange" />
              {/* Core tough zone */}
              <rect x="26" y="26" width="28" height="28" fill="rgba(10,25,47,0.06)" className="group-hover:fill-orange-500/20 transition-all" />
              {/* Carbon atom ingress arrows */}
              <path d="M 5 40 H 12 M 75 40 H 68 M 40 5 V 12 M 40 75 V 68" stroke="#FF6B00" strokeWidth="1.5" />
              <text x="40" y="44" textAnchor="middle" fill="#0A192F" fontSize="8" fontFamily="'Times New Roman', Times, serif" fontWeight="bold">CASE</text>
            </svg>
          </div>
        );
      case 'hardening':
        return <GearLineArt className="w-20 h-20" heatGlow={isHovered} />;
      case 'tempering':
        return (
          <div className="w-20 h-20 flex items-center justify-center">
            <svg viewBox="0 0 80 80" className="w-full h-full stroke-navy-900 group-hover:stroke-heat-orange transition-colors fill-none" strokeWidth="1.5">
              <circle cx="40" cy="40" r="32" strokeDasharray="4 2" />
              <circle cx="40" cy="40" r="22" />
              {/* Thermal relaxing stress relief concentric rings */}
              <path d="M 28 40 Q 40 28 52 40 T 76 40" stroke="#FF6B00" strokeWidth="1.5" />
              <line x1="16" y1="40" x2="64" y2="40" stroke="#64748B" strokeDasharray="2 2" />
              <circle cx="40" cy="40" r="4" fill="#FF6B00" />
            </svg>
          </div>
        );
      case 'induction':
        return <ShaftLineArt className="w-28 h-16" heatGlow={isHovered} />;
      case 'carbonitriding':
        return (
          <div className="w-20 h-20 flex items-center justify-center">
            <svg viewBox="0 0 80 80" className="w-full h-full stroke-navy-900 group-hover:stroke-heat-orange transition-colors fill-none" strokeWidth="1.5">
              <polygon points="40,8 72,26 72,62 40,76 8,62 8,26" strokeWidth="1.8" />
              <polygon points="40,18 64,32 64,56 40,68 16,56 16,32" strokeDasharray="3 2" stroke="#FF6B00" />
              <circle cx="40" cy="44" r="8" fill="#FF6B00" opacity="0.8" />
              <text x="40" y="47" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontFamily="'Times New Roman', Times, serif">C+N</text>
            </svg>
          </div>
        );
      case 'annealing':
      case 'normalizing':
        return (
          <div className="w-20 h-20 flex items-center justify-center">
            <svg viewBox="0 0 80 80" className="w-full h-full stroke-navy-900 group-hover:stroke-heat-orange transition-colors fill-none" strokeWidth="1.5">
              <rect x="12" y="20" width="56" height="40" rx="2" />
              {/* Slow cooling lattice rearrangement */}
              <line x1="20" y1="20" x2="60" y2="60" stroke="#FF6B00" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="20" y1="60" x2="60" y2="20" stroke="#FF6B00" strokeWidth="1.2" strokeDasharray="3 3" />
              <circle cx="40" cy="40" r="10" stroke="#0A192F" strokeWidth="1.5" />
              <circle cx="40" cy="40" r="3" fill="#FF6B00" />
            </svg>
          </div>
        );
      default:
        return <BearingLineArt className="w-20 h-20" heatGlow={isHovered} />;
    }
  };

  return (
    <section id="services" className="py-8 bg-[#E5EBF2] bg-cad-grid border-b border-slate-300 relative overflow-hidden w-full">
      <div className="w-full px-3 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-3 border-b border-slate-300">
          <div>
            <span className="font-mono text-xs font-bold text-heat-orange tracking-widest uppercase block mb-1">
              // CORE METALLURGICAL CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              HEAT TREATMENT, ENGINEERED FOR PERFORMANCE.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mt-1.5">
              Controlled thermal cycles configured to enhance fatigue resistance, prevent tooth spalling, and guarantee uniform case-to-core hardness profiles.
            </p>
          </div>

          <div className="mt-3 md:mt-0 font-mono text-xs text-slate-700 bg-white px-3 py-1.5 rounded-lg border-2 border-slate-400 shadow-xs">
            <span>TOTAL REGISTERED PROCESSES:</span>{' '}
            <span className="text-navy-900 font-bold">09 INDUSTRIAL SERVICES</span>
          </div>
        </div>

        {/* 9 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="bg-white border-2 border-slate-400 hover:border-heat-orange border-t-4 border-t-navy-900 hover:border-t-heat-orange rounded-xl p-4 sm:p-5 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Number & Category */}
                <div className="flex items-center justify-between font-mono text-xs text-slate-400 mb-4 pb-2 border-b border-slate-200">
                  <span className="text-heat-orange font-bold">0{index + 1} //</span>
                  <span className="uppercase tracking-wider text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                    {service.category}
                  </span>
                </div>

                {/* Line-Art Illustration with Progressive Hover Effect */}
                <div className="py-3 flex justify-center items-center bg-slate-50 rounded-lg border border-slate-300 mb-4 group-hover:border-heat-orange/50 transition-colors">
                  {renderServiceLineArt(service)}
                </div>

                {/* Title & Short Description */}
                <h3 className="text-xl font-extrabold text-navy-900 tracking-tight mb-2 group-hover:text-heat-orange transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium mb-3">
                  {service.headline}
                </p>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                {/* Key Applications Preview */}
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">
                    Typical Applications
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {service.applications.slice(0, 2).map((app, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono bg-slate-100 text-navy-900 px-2 py-0.5 rounded border border-slate-300 font-medium"
                      >
                        {app}
                      </span>
                    ))}
                    {service.applications.length > 2 && (
                      <span className="text-[10px] font-mono text-slate-500 self-center">
                        +{service.applications.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Action: Learn More */}
              <div className="pt-4 mt-5 border-t border-slate-300 flex items-center justify-between">
                <button
                  onClick={() => setSelectedService(service)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-navy-900 group-hover:text-heat-orange transition-colors"
                >
                  <span>TECHNICAL DATASHEET</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
                <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                  {service.parameters?.tempRange || "Controlled Cycle"}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Technical Service Modal / Drawer */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-navy-900/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="pr-8">
              <span className="font-mono text-xs font-bold text-heat-orange tracking-widest uppercase block">
                METALLURGICAL SERVICE SPECIFICATION // {selectedService.category}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">
                {selectedService.name}
              </h3>
              <p className="text-sm font-semibold text-navy-800/90 mt-1">
                {selectedService.headline}
              </p>
            </div>

            {/* Description & Thermal Kinetics */}
            <div className="mt-6 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-mono text-xs font-bold text-navy-900 uppercase mb-1">
                  Process Mechanism:
                </h4>
                <p>{selectedService.description}</p>
              </div>

              <div>
                <h4 className="font-mono text-xs font-bold text-navy-900 uppercase mb-1">
                  Furnace & Atmosphere Control:
                </h4>
                <p>{selectedService.processInfo}</p>
              </div>

              {/* Technical Operating Parameters */}
              <div className="pt-2">
                <h4 className="font-mono text-xs font-bold text-navy-900 uppercase mb-2">
                  Operating Control Parameters:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                  {Object.entries(selectedService.parameters).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 p-2.5 rounded border border-slate-200">
                      <span className="block text-[10px] text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-bold text-navy-900">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Component Applications */}
              <div className="pt-2">
                <h4 className="font-mono text-xs font-bold text-navy-900 uppercase mb-2">
                  Key Component Applications:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedService.applications.map((app, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-mono text-slate-700 bg-white border border-slate-200 p-2 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{app}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setSelectedService(null)}
                className="w-full sm:w-auto px-5 py-2.5 font-mono text-xs font-bold text-slate-600 hover:text-navy-900 border border-slate-300 rounded"
              >
                CLOSE SPECIFICATION
              </button>
              <button
                onClick={() => {
                  setSelectedService(null);
                  onOpenQuoteModal(selectedService.name);
                }}
                className="w-full sm:w-auto px-6 py-2.5 font-mono text-xs font-bold bg-heat-orange hover:bg-heat-deep text-white rounded flex items-center justify-center gap-2 shadow"
              >
                <span>REQUEST QUOTE FOR {selectedService.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}

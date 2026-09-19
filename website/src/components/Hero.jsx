import React, { useState } from 'react';
import { ChevronRight, ShieldCheck, Flame, Video, Layers, Activity } from 'lucide-react';
import RealisticFurnaceScene from './furnace/RealisticFurnaceScene';
import HeatTreatmentVectorAnimation from './lineart/HeatTreatmentVectorAnimation';
import CinematicFactoryVideo from './video/CinematicFactoryVideo';
import { companyInfo } from '../data/companyInfo';

export default function Hero({ onOpenQuoteModal, onNavigate }) {
  // Default to the new 100% procedural realistic SVG/CSS furnace simulation
  const [mediaMode, setMediaMode] = useState('furnace'); // 'furnace', 'cinema', or 'vector'

  return (
    <section id="hero" className="relative bg-[#F8FAFC] bg-cad-grid border-b border-navy-900/10 pt-4 pb-8 lg:py-8 overflow-hidden w-full">

      <div className="w-full px-3 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
          
          {/* Left Hero Column: Headline, Company Description & CTA Buttons (45-55% width) */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-3.5">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 bg-navy-900 text-white px-3 py-1.5 rounded text-xs font-mono tracking-widest uppercase shadow-sm">
              <Flame className="w-3.5 h-3.5 text-heat-orange animate-pulse" />
              <span>PRECISION METALLURGY</span>
              <span className="text-slate-400">|</span>
              <span className="text-heat-orange font-bold">MATHEAT PVT. LTD.</span>
            </div>

            {/* Main Headline (SEO optimized, exact specification) */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-900 tracking-tight leading-[1.12]">
              PRECISION HEAT TREATMENT<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-heat-orange via-heat-amber to-heat-deep">
                ENGINEERED FOR PERFORMANCE.
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-xl">
              MATHEAT PVT. LTD. delivers precision heat-treatment solutions designed to improve hardness, strength, wear resistance and component reliability.
            </p>

            {/* Technical Triad Tags */}
            <div className="grid grid-cols-3 gap-2 pt-1 pb-1 max-w-md font-mono text-xs">
              <div className="border-2 border-slate-300 bg-white p-2.5 rounded-lg text-center shadow-xs">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Hardness</span>
                <span className="font-bold text-navy-900">UNIFORM</span>
              </div>
              <div className="border-2 border-slate-300 bg-white p-2.5 rounded-lg text-center shadow-xs">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Microstructure</span>
                <span className="font-bold text-navy-900">STRENGTH</span>
              </div>
              <div className="border-2 border-slate-300 bg-white p-2.5 rounded-lg text-center shadow-xs">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Governance</span>
                <span className="font-bold text-heat-orange">PRECISION</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate ? onNavigate('services') : null}
                className="inline-flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-mono text-xs sm:text-sm font-bold px-6 py-3.5 rounded shadow hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <span>EXPLORE OUR SERVICES</span>
                <ChevronRight className="w-4 h-4 text-heat-orange" />
              </button>
              <button
                onClick={onOpenQuoteModal}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-navy-900 border-2 border-navy-900/20 hover:border-heat-orange font-mono text-xs sm:text-sm font-bold px-6 py-3.5 rounded transition-all active:scale-95 group cursor-pointer"
              >
                <span>CONTACT MATHEAT</span>
                <span className="text-heat-orange group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            </div>

            {/* Micro Technical Guarantee */}
            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                CQI-9 / AMS 2750 Pyrometry Standards
              </span>
            </div>
          </div>

          {/* Right Hero Column: Large Animated Industrial Furnace (45-55% width) */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-2.5">
            {/* Mode Switcher Pills (Realistic Furnace / Real Footage / 2D CAD) */}
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
              <div className="inline-flex p-1 rounded-lg bg-slate-200 border border-slate-300 shadow-inner">
                <button
                  onClick={() => setMediaMode('furnace')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    mediaMode === 'furnace'
                      ? 'bg-navy-950 text-white shadow'
                      : 'text-slate-600 hover:text-navy-900'
                  }`}
                  title="Interactive Procedural HTML+CSS+SVG Furnace Scene"
                >
                  <Activity className="w-3.5 h-3.5 text-heat-orange" />
                  <span>ANIMATED FURNACE</span>
                </button>

                <button
                  onClick={() => setMediaMode('cinema')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    mediaMode === 'cinema'
                      ? 'bg-navy-950 text-white shadow'
                      : 'text-slate-600 hover:text-navy-900'
                  }`}
                  title="11-Scene 4K Photorealistic Industrial Video"
                >
                  <Video className="w-3.5 h-3.5 text-heat-orange" />
                  <span>FACTORY FOOTAGE</span>
                </button>

                <button
                  onClick={() => setMediaMode('vector')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    mediaMode === 'vector'
                      ? 'bg-navy-950 text-white shadow'
                      : 'text-slate-600 hover:text-navy-900'
                  }`}
                  title="10-Stage 2D Engineering Vector Simulation"
                >
                  <Layers className="w-3.5 h-3.5 text-heat-orange" />
                  <span>2D CAD</span>
                </button>
              </div>
            </div>

            {/* Animation Frame */}
            <div className="relative">
              {mediaMode === 'furnace' ? (
                <RealisticFurnaceScene autoPlay={true} showControls={true} />
              ) : mediaMode === 'cinema' ? (
                <CinematicFactoryVideo autoPlay={true} showControls={true} heroMode={true} />
              ) : (
                <HeatTreatmentVectorAnimation autoPlay={true} showControls={true} />
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { processes } from '../data/processes';
import { ChevronRight, ArrowRight, Play, CheckCircle2, ShieldAlert, Film } from 'lucide-react';
import HeatTreatmentVectorAnimation from './lineart/HeatTreatmentVectorAnimation';

export default function ProcessTimeline() {
  const [activeStepIndex, setActiveStepIndex] = useState(4); // Default to Controlled Heating

  return (
    <section id="processes" className="py-8 bg-[#E5EBF2] bg-cad-grid border-b border-slate-300 relative overflow-hidden w-full">
      <div className="w-full px-3 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-6">
          <span className="font-mono text-xs font-bold text-heat-orange tracking-widest uppercase block mb-1">
            // END-TO-END PROCESS ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            FROM RAW MATERIAL TO CONTROLLED PERFORMANCE
          </h2>
          <div className="w-16 h-1 bg-heat-orange mt-2 mb-3"></div>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every component batch progresses through 10 strictly monitored metallurgical checkpoints. Real-time telemetry, oxygen probe feedback, and continuous CQI-9 pyrometric records ensure zero deviations from the approved recipe.
          </p>
        </div>

        {/* Step Selector Horizontal / Stepper Bar */}
        <div className="bg-white border-2 border-slate-400 rounded-xl p-3.5 sm:p-4 shadow-lg mb-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <span className="font-mono text-xs font-bold text-navy-900 uppercase">
              SELECT STAGE TO INSPECT TELEMETRY & QC CHECKPOINT
            </span>
            <span className="font-mono text-xs text-heat-orange font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              ACTIVE STAGE: {processes[activeStepIndex].step} / 10
            </span>
          </div>

          {/* Stepper Navigation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {processes.map((proc, index) => {
              const isActive = index === activeStepIndex;
              const isPast = index < activeStepIndex;
              return (
                <button
                  key={proc.step}
                  onClick={() => setActiveStepIndex(index)}
                  className={`p-2.5 rounded-lg text-left transition-all relative font-mono ${
                    isActive
                      ? 'bg-navy-900 text-white border-2 border-heat-orange shadow-md'
                      : isPast
                      ? 'bg-slate-100 text-navy-900 border-2 border-slate-300 hover:border-slate-400'
                      : 'bg-white text-slate-600 border-2 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className={isActive ? 'text-heat-orange font-bold' : 'font-bold'}>
                      {proc.step}
                    </span>
                    {isPast && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {isActive && <span className="w-2 h-2 rounded-full bg-heat-orange animate-ping" />}
                  </div>
                  <div className="text-[11px] font-bold leading-tight line-clamp-2">
                    {proc.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Stage Detailed Engineering Showcase */}
        <div className="bg-navy-950 border border-navy-800 rounded-2xl p-4 sm:p-6 shadow-2xl text-slate-100 relative overflow-hidden">
          {/* Subtle Background CAD Hatch */}
          <div className="absolute inset-0 bg-cad-grid-dark opacity-40 pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            
            {/* Left Stage Overview & Details */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-3xl font-extrabold text-heat-orange">
                  {processes[activeStepIndex].step}
                </span>
                <div className="h-6 w-px bg-slate-700"></div>
                <div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
                    STAGE CLASSIFICATION // {processes[activeStepIndex].category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {processes[activeStepIndex].name}
                  </h3>
                </div>
              </div>

              <p className="text-base text-slate-300 font-medium leading-relaxed">
                {processes[activeStepIndex].summary}
              </p>

              <div className="bg-navy-900/90 border border-navy-700 rounded-lg p-4 space-y-2">
                <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider block">
                  Detailed Operational Execution:
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {processes[activeStepIndex].detail}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-navy-900/60 border border-navy-800 p-3 rounded font-mono text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase">QC Mandatory Checkpoint:</span>
                  <span className="text-emerald-400 font-semibold mt-1 block">
                    ✓ {processes[activeStepIndex].checkpoint}
                  </span>
                </div>
                <div className="bg-navy-900/60 border border-navy-800 p-3 rounded font-mono text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase">Telemetry Logger Tag:</span>
                  <span className="text-heat-orange font-semibold mt-1 block truncate">
                    {processes[activeStepIndex].telemetry}
                  </span>
                </div>
              </div>

              {/* Prev / Next Controls */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 font-mono text-xs rounded border border-navy-700 text-slate-300 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← PREVIOUS STAGE
                </button>
                <button
                  disabled={activeStepIndex === processes.length - 1}
                  onClick={() => setActiveStepIndex((prev) => Math.min(processes.length - 1, prev + 1))}
                  className="px-5 py-2 font-mono text-xs font-bold rounded bg-heat-orange text-white hover:bg-heat-deep disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <span>NEXT STAGE</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Technical Line-Art Stage Diagram */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-navy-900/80 border border-navy-700/80 rounded-xl relative">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mb-4 self-start">
                // TECHNICAL SCHEMATIC // STAGE {processes[activeStepIndex].step}
              </span>

              {/* Stage Specific SVG Line Art */}
              <div className="w-full max-w-[280px] h-[200px] flex items-center justify-center">
                <svg viewBox="0 0 200 160" className="w-full h-full fill-none" strokeWidth="1.5">
                  {/* Central Stage Circle & Rings */}
                  <circle cx="100" cy="80" r="60" stroke="#1E3A8A" strokeDasharray="4 2" />
                  <circle cx="100" cy="80" r="48" stroke="#FF6B00" strokeWidth="2" />
                  <circle cx="100" cy="80" r="16" fill="rgba(255, 107, 0, 0.2)" stroke="#FF6B00" strokeWidth="1.5" />

                  {/* Stage Index inside */}
                  <text x="100" y="85" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontFamily="'Times New Roman', Times, serif" fontWeight="bold">
                    {processes[activeStepIndex].step}
                  </text>

                  {/* Dynamic radial sensors */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i * 45 * Math.PI) / 180;
                    const x1 = 100 + 48 * Math.cos(angle);
                    const y1 = 80 + 48 * Math.sin(angle);
                    const x2 = 100 + 64 * Math.cos(angle);
                    const y2 = 80 + 64 * Math.sin(angle);
                    return (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38BDF8" strokeWidth="1.5" />
                    );
                  })}

                  {/* Outer CAD ticks */}
                  <line x1="20" y1="80" x2="35" y2="80" stroke="#64748B" strokeWidth="1.5" />
                  <line x1="165" y1="80" x2="180" y2="80" stroke="#64748B" strokeWidth="1.5" />
                  <line x1="100" y1="10" x2="100" y2="25" stroke="#64748B" strokeWidth="1.5" />
                  <line x1="100" y1="135" x2="100" y2="150" stroke="#64748B" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="font-mono text-center mt-2">
                <span className="text-xs text-white font-bold block">
                  {processes[activeStepIndex].name}
                </span>
                <span className="text-[10px] text-heat-orange block mt-0.5">
                  METALLURGICALLY MONITORED // ZERO DEVIATION
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Full 10-Scene Engineering Vector Animation Showcase */}
        <div className="mt-14 pt-10 border-t border-slate-300">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
            <div>
              <span className="font-mono text-xs font-bold text-heat-orange tracking-widest uppercase block mb-1">
                // FULL PROCESS SIMULATION
              </span>
              <h3 className="text-2xl font-extrabold text-navy-900 tracking-tight">
                2D INDUSTRIAL VECTOR PROCESS ANIMATION
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Continuous 10-stage engineering vector sequence explaining CAD drafting, heating, soaking, oil quenching, tempering, inspection, and traceability.
              </p>
            </div>
            <div className="font-mono text-xs text-slate-600 bg-white px-3 py-1.5 rounded border border-slate-300 flex items-center gap-1.5 shrink-0">
              <Film className="w-3.5 h-3.5 text-heat-orange" />
              <span>16:9 4K VECTOR ENGINE • 60 FPS</span>
            </div>
          </div>

          <div className="max-w-5xl mx-auto shadow-2xl rounded-2xl overflow-hidden border-2 border-slate-400">
            <HeatTreatmentVectorAnimation autoPlay={true} showControls={true} />
          </div>
        </div>

      </div>
    </section>
  );
}

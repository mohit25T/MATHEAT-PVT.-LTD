import React, { useState } from 'react';

/**
 * Technical Metallurgical Microstructure Cross-Section
 * Shows transition:
 * 1. BEFORE HEAT TREATMENT: Coarse ferrite/pearlite grain structure with high internal stresses & low wear resistance
 * 2. CONTROLLED THERMAL PROCESS: Austenitizing recrystallization & carbon saturation at 850°C
 * 3. AFTER HEAT TREATMENT: Fine acicular needle-like martensite with uniform hardness (60 HRC) and refined grain size (ASTM 8)
 */
export default function MetallurgyLineArt() {
  const [activeTab, setActiveTab] = useState('process'); // 'before' | 'process' | 'after'

  return (
    <div className="bg-white border border-navy-900/10 rounded-xl p-6 shadow-xl relative overflow-hidden">

      {/* Header & Stage Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-navy-900/10">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-heat-orange font-bold">
            // MICROSTRUCTURE DYNAMICS
          </span>
          <h4 className="text-navy-900 font-bold text-lg mt-0.5">
            Metallurgical Phase Transformation
          </h4>
        </div>

        {/* Phase Buttons */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('before')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
              activeTab === 'before'
                ? 'bg-navy-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            1. BEFORE (RAW)
          </button>
          <button
            onClick={() => setActiveTab('process')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
              activeTab === 'process'
                ? 'bg-heat-orange text-white shadow-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            2. THERMAL PROCESS
          </button>
          <button
            onClick={() => setActiveTab('after')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
              activeTab === 'after'
                ? 'bg-navy-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            3. AFTER (HARDENED)
          </button>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Grain Microscope Simulation */}
        <div className="md:col-span-7 bg-navy-950 rounded-xl p-4 border border-navy-800 shadow-inner flex flex-col items-center">
          <div className="w-full flex justify-between items-center text-[10px] font-mono text-slate-400 mb-2">
            <span>OPTICAL 500X ETCH (2% NITAL)</span>
            <span className="text-heat-orange">
              {activeTab === 'before' && "COARSE PEARLITE + FERRITE"}
              {activeTab === 'process' && "AUSTENITE RECRYSTALLIZATION (850°C)"}
              {activeTab === 'after' && "FINE TEMPERED MARTENSITE (60 HRC)"}
            </span>
          </div>

          <svg viewBox="0 0 400 240" className="w-full max-h-[240px] rounded-lg border border-navy-700/50 bg-[#06101E]">
            <defs>
              {/* Reticle / Measurement Grid */}
              <pattern id="grainGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="400" height="240" fill="url(#grainGrid)" />

            {/* Stage 1: Coarse Pearlite & Ferrite Grains */}
            {activeTab === 'before' && (
              <g className="transition-opacity duration-500">
                {/* Large polygonal grain boundaries */}
                <polygon points="50,40 130,30 160,90 90,120 40,80" stroke="#64748B" strokeWidth="2.5" fill="rgba(100, 116, 139, 0.15)" />
                <polygon points="130,30 230,20 270,70 160,90" stroke="#64748B" strokeWidth="2.5" fill="rgba(100, 116, 139, 0.25)" />
                <polygon points="230,20 340,35 360,110 270,70" stroke="#64748B" strokeWidth="2.5" fill="rgba(100, 116, 139, 0.1)" />
                <polygon points="90,120 160,90 200,170 110,190" stroke="#64748B" strokeWidth="2.5" fill="rgba(100, 116, 139, 0.2)" />
                <polygon points="160,90 270,70 280,160 200,170" stroke="#64748B" strokeWidth="2.5" fill="rgba(100, 116, 139, 0.15)" />
                <polygon points="270,70 360,110 350,190 280,160" stroke="#64748B" strokeWidth="2.5" fill="rgba(100, 116, 139, 0.25)" />
                <polygon points="110,190 200,170 190,230 80,225" stroke="#64748B" strokeWidth="2.5" fill="rgba(100, 116, 139, 0.12)" />
                <polygon points="200,170 280,160 300,230 190,230" stroke="#64748B" strokeWidth="2.5" fill="rgba(100, 116, 139, 0.18)" />

                {/* Coarse lamellar pearlite lines within grains */}
                <path d="M 60,60 L 110,50 M 65,75 L 120,65 M 75,95 L 135,85" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2" />
                <path d="M 180,45 L 240,40 M 175,60 L 250,55 M 190,75 L 255,70" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2" />
                <path d="M 125,130 L 175,120 M 130,150 L 185,140 M 140,170 L 190,160" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2" />
                <path d="M 220,110 L 265,100 M 215,130 L 260,120 M 230,150 L 270,140" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2" />

                <circle cx="200" cy="120" r="4" fill="#EF4444" />
                <text x="210" y="123" fill="#EF4444" fontSize="9" fontFamily="'Times New Roman', Times, serif">COARSE FERRITE GRAIN</text>
              </g>
            )}

            {/* Stage 2: Austenitic Transformation under Heat */}
            {activeTab === 'process' && (
              <g className="animate-pulse">
                {/* Dissolution of boundaries into homogeneous austenite */}
                <circle cx="200" cy="120" r="95" fill="rgba(255, 107, 0, 0.12)" stroke="#FF6B00" strokeWidth="1.5" strokeDasharray="6 3" />
                <circle cx="100" cy="100" r="60" fill="rgba(255, 107, 0, 0.08)" stroke="#FF6B00" strokeWidth="1" strokeDasharray="4 2" />
                <circle cx="300" cy="100" r="60" fill="rgba(255, 107, 0, 0.08)" stroke="#FF6B00" strokeWidth="1" strokeDasharray="4 2" />

                {/* Flowing thermal gradient arrows / carbon diffusion */}
                <path d="M 140,120 Q 200,90 260,120" stroke="#FFA048" strokeWidth="2" strokeDasharray="4 2" />
                <path d="M 140,140 Q 200,170 260,140" stroke="#FFA048" strokeWidth="2" strokeDasharray="4 2" />
                <path d="M 200,60 V 180" stroke="#FF6B00" strokeWidth="2" strokeDasharray="5 3" />

                {/* Dissolved Carbon Atoms (interstitial FCC lattice) */}
                <circle cx="170" cy="100" r="3" fill="#FF6B00" />
                <circle cx="230" cy="100" r="3" fill="#FF6B00" />
                <circle cx="200" cy="140" r="3" fill="#FF6B00" />
                <circle cx="180" cy="150" r="3" fill="#FF6B00" />
                <circle cx="220" cy="150" r="3" fill="#FF6B00" />
                <circle cx="200" cy="90" r="3" fill="#FF6B00" />

                <text x="200" y="35" textAnchor="middle" fill="#FF6B00" fontSize="10" fontFamily="'Times New Roman', Times, serif" fontWeight="bold">
                  FCC AUSTENITE (γ-PHASE) FORMATION
                </text>
                <text x="200" y="215" textAnchor="middle" fill="#FFA048" fontSize="9" fontFamily="'Times New Roman', Times, serif">
                  CARBON DIFFUSION INTO SOLID SOLUTION
                </text>
              </g>
            )}

            {/* Stage 3: Fine Tempered Martensite Needles */}
            {activeTab === 'after' && (
              <g>
                {/* Dense refined grain matrix */}
                <rect x="20" y="20" width="360" height="200" fill="rgba(14, 165, 233, 0.06)" />
                {/* Acicular martensite needles (interlocking fine structure) */}
                {Array.from({ length: 42 }).map((_, i) => {
                  const x = 30 + (i % 7) * 48 + ((i * 17) % 25);
                  const y = 30 + Math.floor(i / 7) * 32 + ((i * 13) % 18);
                  const angle = (i * 47) % 180;
                  return (
                    <g key={i} transform={`translate(${x}, ${y}) rotate(${angle})`}>
                      <line x1="-16" y1="0" x2="16" y2="0" stroke="#38BDF8" strokeWidth="1.8" />
                      <line x1="-8" y1="-3" x2="8" y2="3" stroke="#F8FAFC" strokeWidth="1.2" opacity="0.8" />
                    </g>
                  );
                })}

                <circle cx="200" cy="120" r="35" stroke="#10B981" strokeWidth="2" strokeDasharray="3 2" fill="none" />
                <text x="200" y="115" textAnchor="middle" fill="#34D399" fontSize="10" fontFamily="'Times New Roman', Times, serif" fontWeight="bold">
                  ASTM 8+ FINE GRAIN
                </text>
                <text x="200" y="130" textAnchor="middle" fill="#F8FAFC" fontSize="9" fontFamily="'Times New Roman', Times, serif">
                  TEMPERED MARTENSITE
                </text>
              </g>
            )}

            {/* Crosshair scale */}
            <circle cx="200" cy="120" r="110" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
            <line x1="200" y1="10" x2="200" y2="230" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
            <line x1="10" y1="120" x2="390" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* Technical Data & Comparison Breakdown */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">Selected Phase</span>
            <div className="text-base font-bold text-navy-900 mt-0.5">
              {activeTab === 'before' && "As-Forged / As-Rolled Microstructure"}
              {activeTab === 'process' && "Thermal Austenitizing & Carburizing (850°C)"}
              {activeTab === 'after' && "Quenched & Tempered High-Strength Matrix"}
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-500">Grain Size:</span>
              <span className="font-semibold text-navy-900">
                {activeTab === 'before' ? "ASTM 3 – 5 (Coarse)" : activeTab === 'process' ? "Dissolving Phase" : "ASTM 7 – 9 (Refined)"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-500">Surface Hardness:</span>
              <span className="font-semibold text-navy-900">
                {activeTab === 'before' ? "18 – 22 HRC (Soft)" : activeTab === 'process' ? "Dynamic Austenitic" : "58 – 62 HRC (Calibrated)"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-500">Wear & Fatigue Life:</span>
              <span className={`font-semibold ${activeTab === 'after' ? 'text-emerald-700' : 'text-slate-700'}`}>
                {activeTab === 'before' ? "Baseline (Low)" : activeTab === 'process' ? "Forming" : "+350% Extended Fatigue"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-500">Internal Stress:</span>
              <span className="font-semibold text-navy-900">
                {activeTab === 'before' ? "Erratic Residual Stresses" : activeTab === 'process' ? "Thermal Equilibrium" : "Controlled Compressive Case"}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed pt-1">
            {activeTab === 'before' && "Raw forged steel possesses coarse grain boundaries prone to early fatigue spalling, premature tooth wear, and uneven machining distortion."}
            {activeTab === 'process' && "Controlled atmosphere soaking dissolves coarse carbides, allowing uniform carbon diffusion while strictly avoiding decarburization or grain growth."}
            {activeTab === 'after' && "Quenching and tempering lock in uniform acicular martensite with a tough core that absorbs sudden high-impact shocks without catastrophic shear."}
          </p>
        </div>
      </div>
    </div>
  );
}

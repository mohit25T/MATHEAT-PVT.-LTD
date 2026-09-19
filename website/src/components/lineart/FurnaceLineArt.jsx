import React, { useState, useEffect } from 'react';

/**
 * Signature Industrial Engineering Line Art: Continuous Sealed Quench Furnace Cycle
 * Steps:
 * 1. Technical grid & CAD layout
 * 2. Furnace structure stroke drawing
 * 3. Component (spur gear) entry
 * 4. Heating elements & thermal gradient
 * 5. Orange heat waves & temperature rise (850°C)
 * 6. Soak duration & austenite formation
 * 7. Quench bath immersion & rapid cooling
 * 8. Hardened component emergence
 * 9. Hardness & precision verification (60 HRC Passed)
 */
export default function FurnaceLineArt({ interactive = true, className = "" }) {
  const [cycleStep, setCycleStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const steps = [
    { label: "01 CAD GRID", desc: "Digital Chamber Calibration", temp: "28°C" },
    { label: "02 FURNACE OUTLINE", desc: "Atmosphere Retort Sealed", temp: "150°C" },
    { label: "03 COMPONENT ENTRY", desc: "Charge Enters Heating Zone", temp: "420°C" },
    { label: "04 THERMAL RAMP", desc: "Multi-Zone Radiant Heating", temp: "680°C" },
    { label: "05 AUSTENITIZING", desc: "Soaking @ 850°C (0.90% Cp)", temp: "850°C" },
    { label: "06 OIL QUENCH", desc: "Critical Martensitic Cooling", temp: "65°C" },
    { label: "07 UNIFORM HARDNESS", desc: "58 – 62 HRC Verified", temp: "Ambient" }
  ];

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCycleStep((prev) => (prev + 1) % steps.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [autoPlay, steps.length]);

  return (
    <div className={`relative bg-navy-950/95 border border-navy-700/60 rounded-xl p-5 shadow-2xl backdrop-blur-md overflow-hidden text-slate-200 ${className}`}>
      {/* Background Engineering Coordinate Marks */}
      <div className="absolute top-2 left-3 font-mono text-[10px] text-slate-400 tracking-wider flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-heat-orange animate-ping"></span>
          SYS.CAD // SQF-02
        </span>
        <span className="hidden sm:inline">COORD: 36.77°N 119.41°E</span>
        <span className="text-heat-orange font-semibold">STAGE: {steps[cycleStep].label}</span>
      </div>

      <div className="absolute top-2 right-3 font-mono text-[10px] text-slate-400 flex items-center gap-2">
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className="px-2 py-0.5 border border-navy-600 rounded text-[9px] hover:border-heat-orange hover:text-white transition-colors"
          title="Toggle cycle animation"
        >
          {autoPlay ? "PAUSE CYCLE" : "RESUME CYCLE"}
        </button>
      </div>

      {/* Main SVG Engineering Line Drawing */}
      <div className="relative pt-6 pb-2 flex items-center justify-center">
        <svg
          viewBox="0 0 600 360"
          className="w-full h-auto max-h-[360px] select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Technical Hatch Pattern */}
            <pattern id="cadGridSmall" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
            </pattern>
            <linearGradient id="heatFlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FFA048" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.2" />
            </linearGradient>
            <filter id="thermalGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Background Grid */}
          <rect x="10" y="10" width="580" height="340" fill="url(#cadGridSmall)" stroke="rgba(30, 58, 138, 0.3)" strokeWidth="1" />
          
          {/* Engineering Crosshairs */}
          <path d="M 40 40 L 40 50 M 40 40 L 50 40" stroke="#FF6B00" strokeWidth="1.5" />
          <path d="M 560 40 L 560 50 M 560 40 L 550 40" stroke="#FF6B00" strokeWidth="1.5" />
          <path d="M 40 320 L 40 310 M 40 320 L 50 320" stroke="#FF6B00" strokeWidth="1.5" />
          <path d="M 560 320 L 560 310 M 560 320 L 550 320" stroke="#FF6B00" strokeWidth="1.5" />
          <path d="M 300 20 L 300 340" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" strokeWidth="1" />
          <path d="M 20 180 L 580 180" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" strokeWidth="1" />

          {/* 2. Outer Industrial Furnace Enclosure */}
          <g className="transition-all duration-700">
            {/* Outer Shell */}
            <rect x="140" y="50" width="320" height="230" rx="4" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="6 2" opacity="0.5" />
            {/* Inner Refractory Wall */}
            <rect x="160" y="70" width="280" height="190" fill="rgba(10, 25, 47, 0.7)" stroke="#60A5FA" strokeWidth="2" />
            
            {/* Heating Elements (Coils on top & sides) */}
            <path
              d="M 180 85 H 420 M 180 92 H 420 M 180 99 H 420"
              stroke={cycleStep >= 3 && cycleStep <= 5 ? "#FF6B00" : "#334155"}
              strokeWidth="2"
              strokeDasharray="4 4"
              filter={cycleStep >= 3 && cycleStep <= 5 ? "url(#thermalGlow)" : "none"}
              className="transition-colors duration-500"
            />
            <path
              d="M 175 110 V 230 M 425 110 V 230"
              stroke={cycleStep >= 3 && cycleStep <= 5 ? "#FF6B00" : "#334155"}
              strokeWidth="2"
              strokeDasharray="4 4"
              filter={cycleStep >= 3 && cycleStep <= 5 ? "url(#thermalGlow)" : "none"}
              className="transition-colors duration-500"
            />

            {/* Hearth / Roller Conveyor */}
            <path d="M 80 250 H 520" stroke="#94A3B8" strokeWidth="2.5" />
            <circle cx="120" cy="257" r="6" stroke="#94A3B8" strokeWidth="1.5" />
            <circle cx="200" cy="257" r="6" stroke="#94A3B8" strokeWidth="1.5" />
            <circle cx="280" cy="257" r="6" stroke="#94A3B8" strokeWidth="1.5" />
            <circle cx="360" cy="257" r="6" stroke="#94A3B8" strokeWidth="1.5" />
            <circle cx="440" cy="257" r="6" stroke="#94A3B8" strokeWidth="1.5" />
            <circle cx="480" cy="257" r="6" stroke="#94A3B8" strokeWidth="1.5" />

            {/* Quench Elevator Tank Chamber below */}
            <rect x="340" y="270" width="160" height="60" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
            <path d="M 350 300 Q 380 295 420 300 T 490 300" stroke="#0EA5E9" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="355" y="322" fill="#38BDF8" fontSize="9" fontFamily="'Times New Roman', Times, serif">AGITATED QUENCH OIL</text>
          </g>

          {/* 3. Heat Wave Animations (Active in steps 3, 4, 5) */}
          {(cycleStep === 3 || cycleStep === 4 || cycleStep === 5) && (
            <g className="animate-pulse">
              <path d="M 230 195 Q 245 170 260 195 T 290 195" stroke="#FF6B00" strokeWidth="2" fill="none" opacity="0.8" />
              <path d="M 260 180 Q 275 155 290 180 T 320 180" stroke="#FF6B00" strokeWidth="2" fill="none" opacity="0.8" />
              <path d="M 310 195 Q 325 170 340 195 T 370 195" stroke="#FF6B00" strokeWidth="2" fill="none" opacity="0.8" />
              <circle cx="300" cy="180" r="45" fill="rgba(255, 107, 0, 0.12)" filter="url(#thermalGlow)" />
            </g>
          )}

          {/* 4. Moving Metal Component (Spur Gear) */}
          {/* Position transitions based on cycleStep */}
          <g
            className="transition-all duration-1000 ease-in-out"
            transform={
              cycleStep <= 1
                ? "translate(100, 205)"
                : cycleStep === 2
                ? "translate(220, 205)"
                : cycleStep === 3 || cycleStep === 4 || cycleStep === 5
                ? "translate(300, 205)"
                : cycleStep === 6
                ? "translate(420, 280)" // Quenched in tank
                : "translate(480, 205)" // Exited & verified
            }
          >
            {/* Gear Outline */}
            <g
              filter={
                cycleStep >= 3 && cycleStep <= 5
                  ? "url(#thermalGlow)"
                  : cycleStep === 6
                  ? "none"
                  : "none"
              }
            >
              {/* Outer Gear Teeth */}
              <circle
                cx="0"
                cy="0"
                r="30"
                stroke={
                  cycleStep >= 3 && cycleStep <= 5
                    ? "#FF6B00"
                    : cycleStep === 6
                    ? "#38BDF8"
                    : cycleStep === 7
                    ? "#E2E8F0"
                    : "#94A3B8"
                }
                strokeWidth="2.5"
                strokeDasharray="6 3"
                fill={cycleStep >= 4 && cycleStep <= 5 ? "rgba(255, 107, 0, 0.2)" : "rgba(15, 23, 42, 0.8)"}
              />
              {/* Gear Hub */}
              <circle
                cx="0"
                cy="0"
                r="14"
                stroke={cycleStep >= 3 && cycleStep <= 5 ? "#FFA048" : "#CBD5E1"}
                strokeWidth="2"
              />
              {/* Center Bore & Keyway */}
              <rect x="-3" y="-8" width="6" height="16" fill="#0A192F" stroke="#94A3B8" strokeWidth="1" />
              {/* Tooth Spoke Lines */}
              <line x1="-28" y1="0" x2="28" y2="0" stroke={cycleStep >= 3 && cycleStep <= 5 ? "#FFA048" : "#64748B"} strokeWidth="1.5" />
              <line x1="0" y1="-28" x2="0" y2="28" stroke={cycleStep >= 3 && cycleStep <= 5 ? "#FFA048" : "#64748B"} strokeWidth="1.5" />
            </g>

            {/* Label tag over component */}
            <text
              x="0"
              y="-38"
              textAnchor="middle"
              fill={cycleStep >= 3 && cycleStep <= 5 ? "#FF6B00" : "#94A3B8"}
              fontSize="9"
              fontFamily="'Times New Roman', Times, serif"
              fontWeight="bold"
            >
              {cycleStep <= 2
                ? "RAW CHARGE (20MnCr5)"
                : cycleStep >= 3 && cycleStep <= 5
                ? "AUSTENITE (850°C)"
                : cycleStep === 6
                ? "MARTENSITE QUENCH"
                : "HARDENED (60 HRC)"}
            </text>
          </g>

          {/* 5. Live Engineering Telemetry Callouts */}
          {/* Left Chamber Gauge */}
          <g transform="translate(45, 100)">
            <rect width="80" height="42" fill="rgba(10, 25, 47, 0.85)" stroke="#1E3A8A" strokeWidth="1" rx="2" />
            <text x="6" y="16" fill="#64748B" fontSize="8" fontFamily="'Times New Roman', Times, serif">CHAMBER TEMP</text>
            <text x="6" y="32" fill={cycleStep >= 3 && cycleStep <= 5 ? "#FF6B00" : "#38BDF8"} fontSize="14" fontFamily="'Times New Roman', Times, serif" fontWeight="bold">
              {steps[cycleStep].temp}
            </text>
          </g>

          {/* Right Hardness Verification Callout */}
          <g transform="translate(470, 95)">
            <rect width="105" height="52" fill="rgba(10, 25, 47, 0.85)" stroke={cycleStep === 6 || cycleStep === 7 ? "#10B981" : "#1E3A8A"} strokeWidth="1" rx="2" />
            <text x="6" y="14" fill="#64748B" fontSize="8" fontFamily="'Times New Roman', Times, serif">QC VERIFICATION</text>
            <text x="6" y="28" fill="#FFFFFF" fontSize="11" fontFamily="'Times New Roman', Times, serif" fontWeight="bold">
              {cycleStep === 6 || cycleStep === 7 ? "58 – 62 HRC" : "CALCULATING"}
            </text>
            <text x="6" y="44" fill={cycleStep === 6 || cycleStep === 7 ? "#34D399" : "#F59E0B"} fontSize="8" fontFamily="'Times New Roman', Times, serif">
              {cycleStep === 6 || cycleStep === 7 ? "STATUS: PASSED ✓" : "PROCESS IN PROGRESS"}
            </text>
          </g>

          {/* Temperature Profile Line Graph (Moving background curve) */}
          <path
            d="M 160 220 L 220 220 L 270 140 L 370 140 L 410 240 L 460 240"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.4"
          />
          <text x="280" y="132" fill="#F59E0B" fontSize="8" fontFamily="'Times New Roman', Times, serif" opacity="0.7">SOAK PLATEAU 850°C</text>
        </svg>
      </div>

      {/* Cycle Stage Progress Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-1.5 pt-3 border-t border-navy-800">
        {steps.map((s, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCycleStep(idx);
              setAutoPlay(false);
            }}
            className={`text-left p-1.5 rounded transition-all ${
              cycleStep === idx
                ? "bg-navy-800 border border-heat-orange shadow-md text-white"
                : "bg-navy-900/40 border border-navy-800/80 text-slate-400 hover:border-slate-500 hover:text-slate-200"
            }`}
          >
            <div className="font-mono text-[9px] text-heat-orange font-semibold">{s.label}</div>
            <div className="text-[10px] truncate leading-tight font-medium">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Triad Badges Required in Spec */}
      <div className="mt-4 pt-2 border-t border-navy-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-heat-orange"></span>
          <span>CONTROLLED PROCESS</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-heat-orange"></span>
          <span>UNIFORM HARDNESS</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-heat-orange"></span>
          <span>PRECISION PERFORMANCE</span>
        </div>
      </div>
    </div>
  );
}

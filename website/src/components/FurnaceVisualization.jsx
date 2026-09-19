import React, { useState } from 'react';
import ThermalGraphLineArt from './lineart/ThermalGraphLineArt';
import { furnaceTelemetryExample } from '../data/specs';
import { Flame, Gauge, Clock, ShieldCheck, Activity, Layers, AlertCircle } from 'lucide-react';

export default function FurnaceVisualization() {
  const [selectedFurnace, setSelectedFurnace] = useState("SQF-02");

  const telemetryHUD = [
    { label: "TEMPERATURE", value: "850°C", unit: "±3°C Pyrometry", icon: Flame, color: "text-heat-orange" },
    { label: "SOAK TIME", value: "90 MIN", unit: "Hold Duration", icon: Clock, color: "text-amber-400" },
    { label: "QUENCH", value: "CONTROLLED", unit: "Agitated Oil @ 65°C", icon: Activity, color: "text-sky-400" },
    { label: "HARDNESS", value: "58 – 62 HRC", unit: "Direct Rockwell C", icon: ShieldCheck, color: "text-emerald-400" },
    { label: "CASE DEPTH", value: "0.80 – 1.10 MM", unit: "Effective ECD @ 50 HRC", icon: Layers, color: "text-orange-400" },
  ];

  return (
    <section id="technology" className="py-8 bg-navy-950 text-white relative overflow-hidden border-b border-navy-800 w-full">
      {/* CAD Blueprint Grid Pattern */}
      <div className="absolute inset-0 bg-cad-grid-dark opacity-30 pointer-events-none"></div>

      <div className="w-full px-3 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <span className="font-mono text-xs font-bold text-heat-orange tracking-widest uppercase block mb-1">
            // ADVANCED THERMAL SYSTEMS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            CONTROL THE HEAT.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-heat-orange to-heat-amber">
              CONTROL THE RESULT.
            </span>
          </h2>
          <div className="w-20 h-1 bg-heat-orange mx-auto mt-3 mb-3"></div>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Real-time digital telemetry drives our multi-zone sealed quench furnaces. Closed-loop oxygen probe atmosphere regulation, precision pyrometry, and variable quench circulation ensure unmatched batch uniformity.
          </p>
        </div>

        {/* Real-Time Telemetry HUD Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          {telemetryHUD.map((hud, idx) => {
            const Icon = hud.icon;
            return (
              <div
                key={idx}
                className="bg-navy-900/90 border border-navy-700/80 rounded-xl p-3 sm:p-3.5 relative group hover:border-heat-orange/60 transition-colors shadow-lg"
              >
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-2">
                  <span>{hud.label}</span>
                  <Icon className={`w-3.5 h-3.5 ${hud.color}`} />
                </div>
                <div className={`text-xl sm:text-2xl font-mono font-extrabold ${hud.color} tracking-tight`}>
                  {hud.value}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">
                  {hud.unit}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Furnace Visual Centerpiece */}
        <div className="bg-navy-900/70 border border-navy-700 rounded-2xl p-4 sm:p-5 shadow-2xl relative">
          
          {/* Top Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-navy-800 gap-3 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE CYCLE ACTIVE
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">RECIPE: CARBURIZING + DIRECT QUENCH</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              CHAMBER UNIFORMITY: <span className="text-heat-orange font-bold">± 2.8°C (AMS 2750 Compliant)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            
            {/* Center Left: Large Technical Line-Art Furnace Drawing */}
            <div className="lg:col-span-7 bg-navy-950 rounded-xl p-3.5 sm:p-4 border border-navy-800 relative">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-2">
                <span>SEALED QUENCH ATMOSPHERE CHAMBER (SQF)</span>
                <span className="text-heat-orange">HEAT FLOW SIMULATION ACTIVE</span>
              </div>

              {/* Dynamic SVG Furnace Schematic */}
              <div className="relative flex items-center justify-center">
                <svg viewBox="0 0 450 260" className="w-full h-auto select-none" fill="none">
                  {/* Outer Furnace Retort Frame */}
                  <rect x="50" y="30" width="350" height="180" rx="6" stroke="#38BDF8" strokeWidth="2" strokeDasharray="6 3" opacity="0.6" />
                  {/* Inner Combustion / Muffle Chamber */}
                  <rect x="75" y="50" width="300" height="140" fill="rgba(10, 25, 47, 0.9)" stroke="#60A5FA" strokeWidth="2" />
                  
                  {/* Radiant Tube Heating Coils (Top & Bottom) with Glow */}
                  <path d="M 90 65 H 360 M 90 75 H 360" stroke="#FF6B00" strokeWidth="3" filter="drop-shadow(0 0 6px #FF6B00)" />
                  <path d="M 90 165 H 360 M 90 175 H 360" stroke="#FF6B00" strokeWidth="3" filter="drop-shadow(0 0 6px #FF6B00)" />

                  {/* Heat Waves Rippling in Chamber */}
                  <g className="animate-pulse">
                    <path d="M 120 120 Q 150 95 180 120 T 240 120 T 300 120" stroke="#FFA048" strokeWidth="2" opacity="0.8" />
                    <path d="M 140 100 Q 170 80 200 100 T 260 100 T 320 100" stroke="#FF6B00" strokeWidth="1.5" opacity="0.6" />
                    <circle cx="225" cy="120" r="50" fill="rgba(255, 107, 0, 0.15)" />
                  </g>

                  {/* Component Tray Inside Furnace */}
                  <rect x="150" y="110" width="150" height="40" rx="3" fill="#0A192F" stroke="#F8FAFC" strokeWidth="1.5" />
                  {/* Gears on Tray */}
                  <circle cx="180" cy="130" r="14" stroke="#FF6B00" strokeWidth="2" strokeDasharray="3 1" fill="rgba(255,107,0,0.3)" />
                  <circle cx="225" cy="130" r="14" stroke="#FF6B00" strokeWidth="2" strokeDasharray="3 1" fill="rgba(255,107,0,0.3)" />
                  <circle cx="270" cy="130" r="14" stroke="#FF6B00" strokeWidth="2" strokeDasharray="3 1" fill="rgba(255,107,0,0.3)" />

                  {/* Technical Measurement Dimension Lines */}
                  <line x1="50" y1="20" x2="400" y2="20" stroke="#94A3B8" strokeWidth="1" />
                  <path d="M 50 17 L 45 20 L 50 23 Z" fill="#94A3B8" />
                  <path d="M 400 17 L 405 20 L 400 23 Z" fill="#94A3B8" />
                  <text x="225" y="16" textAnchor="middle" fill="#94A3B8" fontSize="8" fontFamily="'Times New Roman', Times, serif">
                    CHAMBER LENGTH: 1450 MM // MAX BATCH CHARGE: 850 KG
                  </text>

                  {/* Oxygen Probe / Atmosphere Sensor */}
                  <line x1="225" y1="30" x2="225" y2="50" stroke="#34D399" strokeWidth="2" />
                  <circle cx="225" cy="40" r="3" fill="#34D399" />
                  <text x="235" y="43" fill="#34D399" fontSize="8" fontFamily="'Times New Roman', Times, serif">
                    O2 PROBE (0.92% Cp)
                  </text>

                  {/* Integral Quench Vestibule */}
                  <path d="M 75 190 V 240 H 220 V 190" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="4 2" />
                  <text x="145" y="225" fill="#38BDF8" fontSize="8" fontFamily="'Times New Roman', Times, serif">
                    QUENCH ELEVATOR TANK
                  </text>
                </svg>
              </div>

              {/* Callout Footer */}
              <div className="mt-3 pt-3 border-t border-navy-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>PYROMETRY: THERMOCOUPLE TYPE-S</span>
                <span className="text-heat-orange font-bold">ATMOSPHERE: ENDO GAS + PROPANE</span>
              </div>
            </div>

            {/* Right: Animated Temperature Curve Graph */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-navy-950 rounded-xl p-4 border border-navy-800">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-2">
                  <span>DYNAMIC TEMPERATURE PROFILE (TTT)</span>
                  <span className="text-heat-orange">REAL-TIME RUN</span>
                </div>
                <ThermalGraphLineArt />
              </div>

              {/* Engineering Recipe Specifications */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between py-2 border-b border-navy-800 text-slate-300">
                  <span className="text-slate-400">Primary Heating Rate:</span>
                  <span className="font-bold text-white">10°C – 15°C / MINUTE</span>
                </div>
                <div className="flex justify-between py-2 border-b border-navy-800 text-slate-300">
                  <span className="text-slate-400">Target Soaking Temp:</span>
                  <span className="font-bold text-heat-orange">850°C ± 3°C</span>
                </div>
                <div className="flex justify-between py-2 border-b border-navy-800 text-slate-300">
                  <span className="text-slate-400">Quench Medium:</span>
                  <span className="font-bold text-white">ACCELERATED QUENCH OIL</span>
                </div>
                <div className="flex justify-between py-2 border-b border-navy-800 text-slate-300">
                  <span className="text-slate-400">Core Hardness Result:</span>
                  <span className="font-bold text-emerald-400">32 – 38 HRC TOUGH CORE</span>
                </div>
              </div>

              {/* Explicit Mandatory Disclaimer */}
              <div className="flex items-start gap-2 text-[11px] font-mono text-slate-400 bg-navy-950/80 p-3 rounded border border-navy-800">
                <AlertCircle className="w-4 h-4 text-heat-orange shrink-0 mt-0.5" />
                <p>
                  {furnaceTelemetryExample.disclaimer}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

import React from 'react';

/**
 * Stepped Transmission Shaft with Engineering Tolerances & Hardening Zones
 */
export default function ShaftLineArt({ className = "w-full h-24", heatGlow = false }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 320 80"
        className="w-full h-full select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Centerline (ISO Standard dash-dot) */}
        <line x1="10" y1="40" x2="310" y2="40" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="14 3 2 3" />

        {/* Section 1: Spline / Drive end (left) */}
        <rect x="25" y="30" width="45" height="20" stroke={heatGlow ? "#FF6B00" : "#0A192F"} strokeWidth="1.5" fill="rgba(10,25,47,0.03)" />
        <line x1="32" y1="30" x2="32" y2="50" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="40" y1="30" x2="40" y2="50" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="48" y1="30" x2="48" y2="50" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="56" y1="30" x2="56" y2="50" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="64" y1="30" x2="64" y2="50" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />

        {/* Section 2: Bearing Journal 1 */}
        <rect x="70" y="25" width="50" height="30" stroke={heatGlow ? "#FF6B00" : "#0A192F"} strokeWidth="1.5" fill={heatGlow ? "rgba(255,107,0,0.12)" : "rgba(10,25,47,0.05)"} />
        {/* Induction hardened case layer indicator */}
        <line x1="70" y1="27" x2="120" y2="27" stroke="#FF6B00" strokeWidth="2" strokeDasharray="3 1" />
        <line x1="70" y1="53" x2="120" y2="53" stroke="#FF6B00" strokeWidth="2" strokeDasharray="3 1" />

        {/* Section 3: Central High-Torque Body */}
        <rect x="120" y="16" width="90" height="48" stroke={heatGlow ? "#FF6B00" : "#0A192F"} strokeWidth="1.8" fill="rgba(10,25,47,0.04)" />
        {/* Keyway */}
        <rect x="145" y="16" width="40" height="6" fill="#FFFFFF" stroke="#0A192F" strokeWidth="1" />

        {/* Section 4: Bearing Journal 2 */}
        <rect x="210" y="25" width="50" height="30" stroke={heatGlow ? "#FF6B00" : "#0A192F"} strokeWidth="1.5" fill={heatGlow ? "rgba(255,107,0,0.12)" : "rgba(10,25,47,0.05)"} />
        <line x1="210" y1="27" x2="260" y2="27" stroke="#FF6B00" strokeWidth="2" strokeDasharray="3 1" />
        <line x1="210" y1="53" x2="260" y2="53" stroke="#FF6B00" strokeWidth="2" strokeDasharray="3 1" />

        {/* Section 5: Threaded / Pinion Pilot end */}
        <rect x="260" y="32" width="35" height="16" stroke={heatGlow ? "#FF6B00" : "#0A192F"} strokeWidth="1.5" fill="rgba(10,25,47,0.03)" />
        <line x1="265" y1="32" x2="295" y2="48" stroke="#94A3B8" strokeWidth="0.75" />
        <line x1="265" y1="48" x2="295" y2="32" stroke="#94A3B8" strokeWidth="0.75" />

        {/* Engineering Dimension Arrows */}
        <line x1="25" y1="70" x2="295" y2="70" stroke="#0A192F" strokeWidth="0.8" />
        <path d="M 25 68 L 20 70 L 25 72 Z" fill="#0A192F" />
        <path d="M 295 68 L 300 70 L 295 72 Z" fill="#0A192F" />
        <text x="160" y="68" textAnchor="middle" fill="#64748B" fontSize="7" fontFamily="'Times New Roman', Times, serif">
          L = 420.00 ± 0.05 MM // RUNOUT &lt; 0.015 TIR
        </text>

        {/* Case Hardened Callout */}
        <text x="95" y="19" textAnchor="middle" fill="#FF6B00" fontSize="7" fontFamily="'Times New Roman', Times, serif" fontWeight="bold">
          ECD 1.8mm (58 HRC)
        </text>
        <text x="235" y="19" textAnchor="middle" fill="#FF6B00" fontSize="7" fontFamily="'Times New Roman', Times, serif" fontWeight="bold">
          ECD 1.8mm (58 HRC)
        </text>
      </svg>
    </div>
  );
}

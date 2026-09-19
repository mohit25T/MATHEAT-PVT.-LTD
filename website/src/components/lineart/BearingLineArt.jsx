import React from 'react';

/**
 * Engineering Bearing Schematic & Line Drawing
 * Outer race, inner race, rolling elements, cage, and technical radial load vectors
 */
export default function BearingLineArt({ className = "w-24 h-24", heatGlow = false }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Ring / Raceway */}
        <circle cx="50" cy="50" r="46" stroke={heatGlow ? "#FF6B00" : "#0A192F"} strokeWidth="2" />
        <circle cx="50" cy="50" r="41" stroke={heatGlow ? "#FFA048" : "#1E3A8A"} strokeWidth="1.2" />

        {/* Inner Ring / Bore */}
        <circle cx="50" cy="50" r="23" stroke={heatGlow ? "#FFA048" : "#1E3A8A"} strokeWidth="1.2" />
        <circle cx="50" cy="50" r="18" stroke={heatGlow ? "#FF6B00" : "#0A192F"} strokeWidth="2" />

        {/* Pitch Circle for Rolling Elements */}
        <circle cx="50" cy="50" r="32" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="2 2" />

        {/* 8 Precision Cylindrical/Spherical Rollers */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const cx = 50 + 32 * Math.cos(angle);
          const cy = 50 + 32 * Math.sin(angle);
          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r="7"
                stroke={heatGlow ? "#FF6B00" : "#0A192F"}
                strokeWidth="1.5"
                fill={heatGlow ? "rgba(255, 107, 0, 0.2)" : "rgba(241, 245, 249, 0.9)"}
              />
              <circle cx={cx} cy={cy} r="2" fill={heatGlow ? "#FF6B00" : "#64748B"} />
            </g>
          );
        })}

        {/* Cage Retainer Segments */}
        <circle cx="50" cy="50" r="36" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="4 8" />
        <circle cx="50" cy="50" r="28" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="4 8" />

        {/* CAD Dimension Markers */}
        <path d="M 5 50 H 12 M 88 50 H 95" stroke="#FF6B00" strokeWidth="1" />
        <text x="50" y="53" textAnchor="middle" fill="#64748B" fontSize="7" fontFamily="'Times New Roman', Times, serif">
          Ø46 / Ø18
        </text>
      </svg>
    </div>
  );
}

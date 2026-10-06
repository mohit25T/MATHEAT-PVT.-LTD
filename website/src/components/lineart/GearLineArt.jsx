import React from 'react';

/**
 * Precision Technical Line Art Spur / Helical Gear
 * Includes engineering pitch circles, tooth involute profiles, and rotation
 */
export default function GearLineArt({ className = "w-24 h-24", animated = true, heatGlow = false }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full ${animated ? 'animate-spin-slow' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pitch Circle (Engineering Reference Line) */}
        <circle cx="50" cy="50" r="38" stroke={heatGlow ? "#FF6B00" : "#0A192F"} strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
        
        {/* Root Circle */}
        <circle cx="50" cy="50" r="32" stroke={heatGlow ? "#FF6B00" : "#1E3A8A"} strokeWidth="1.2" />

        {/* 12 Involute Gear Teeth */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = i * 30;
          return (
            <g key={i} transform={`rotate(${angle} 50 50)`}>
              <path
                d="M 46 12 L 47 18 L 53 18 L 54 12 Z"
                stroke={heatGlow ? "#FF6B00" : "#0A192F"}
                strokeWidth="1.5"
                fill={heatGlow ? "rgba(255,107,0,0.2)" : "rgba(10,25,47,0.05)"}
                strokeLinejoin="round"
              />
              <line x1="50" y1="12" x2="50" y2="8" stroke="#FF6B00" strokeWidth="1" strokeDasharray="1 1" />
            </g>
          );
        })}

        {/* Outer Perimeter */}
        <circle cx="50" cy="50" r="44" stroke={heatGlow ? "#FF6B00" : "#334155"} strokeWidth="0.75" strokeDasharray="1 3" />

        {/* Center Hub & Keyway */}
        <circle cx="50" cy="50" r="16" stroke={heatGlow ? "#FF6B00" : "#0A192F"} strokeWidth="1.5" />
        <circle cx="50" cy="50" r="9" stroke={heatGlow ? "#FFA048" : "#1E3A8A"} strokeWidth="1.2" />
        <rect x="48" y="38" width="4" height="6" fill="#F8FAFC" stroke={heatGlow ? "#FF6B00" : "#0A192F"} strokeWidth="1" />

        {/* 4 Weight Reduction Lightening Holes */}
        <circle cx="50" cy="27" r="4" stroke={heatGlow ? "#FF6B00" : "#64748B"} strokeWidth="1" />
        <circle cx="50" cy="73" r="4" stroke={heatGlow ? "#FF6B00" : "#64748B"} strokeWidth="1" />
        <circle cx="27" cy="50" r="4" stroke={heatGlow ? "#FF6B00" : "#64748B"} strokeWidth="1" />
        <circle cx="73" cy="50" r="4" stroke={heatGlow ? "#FF6B00" : "#64748B"} strokeWidth="1" />

        {/* CAD Center Cross */}
        <line x1="45" y1="50" x2="55" y2="50" stroke="#FF6B00" strokeWidth="1" />
        <line x1="50" y1="45" x2="50" y2="55" stroke="#FF6B00" strokeWidth="1" />
      </svg>
    </div>
  );
}

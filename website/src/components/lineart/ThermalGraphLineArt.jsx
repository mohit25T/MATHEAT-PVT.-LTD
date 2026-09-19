import React from 'react';

/**
 * Animated SVG Temperature-Time Transformation (TTT) Curve
 * Plots preheat, austenitizing soak, quench drop, and tempering plateau
 */
export default function ThermalGraphLineArt({ className = "w-full h-48" }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 500 200"
        className="w-full h-full select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="thermalGraphFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#FF6B00" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#0A192F" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1="50" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 2" />
        <line x1="50" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 2" />
        <line x1="50" y1="110" x2="480" y2="110" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 2" />
        <line x1="50" y1="150" x2="480" y2="150" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 2" />

        {/* Y Axis Labels */}
        <text x="42" y="34" textAnchor="end" fill="#94A3B8" fontSize="8" fontFamily="'Times New Roman', Times, serif">900°C</text>
        <text x="42" y="74" textAnchor="end" fill="#FF6B00" fontSize="8" fontFamily="'Times New Roman', Times, serif">850°C</text>
        <text x="42" y="114" textAnchor="end" fill="#94A3B8" fontSize="8" fontFamily="'Times New Roman', Times, serif">550°C</text>
        <text x="42" y="154" textAnchor="end" fill="#94A3B8" fontSize="8" fontFamily="'Times New Roman', Times, serif">180°C</text>

        {/* X Axis (Time) */}
        <line x1="50" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <text x="50" y="184" fill="#64748B" fontSize="8" fontFamily="'Times New Roman', Times, serif">0m (Load)</text>
        <text x="140" y="184" fill="#64748B" fontSize="8" fontFamily="'Times New Roman', Times, serif">Preheat</text>
        <text x="240" y="184" fill="#FF6B00" fontSize="8" fontFamily="'Times New Roman', Times, serif">Soak (90m)</text>
        <text x="340" y="184" fill="#38BDF8" fontSize="8" fontFamily="'Times New Roman', Times, serif">Quench (12s)</text>
        <text x="440" y="184" fill="#64748B" fontSize="8" fontFamily="'Times New Roman', Times, serif">Temper (120m)</text>

        {/* Area under curve */}
        <path
          d="M 50 170 
             L 110 110 
             L 180 70 
             L 300 70 
             L 330 160 
             L 360 145 
             L 450 145 
             L 480 170 
             Z"
          fill="url(#thermalGraphFill)"
        />

        {/* Thermal Cycle Curve Line */}
        <path
          d="M 50 170 
             L 110 110 
             L 180 70 
             L 300 70 
             L 330 160 
             L 360 145 
             L 450 145 
             L 480 170"
          stroke="#FF6B00"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Critical Points */}
        {/* Austenitizing Soak */}
        <circle cx="240" cy="70" r="4" fill="#FF6B00" />
        <circle cx="240" cy="70" r="8" stroke="#FF6B00" strokeWidth="1" opacity="0.6" className="animate-ping" />
        <text x="240" y="58" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontFamily="'Times New Roman', Times, serif" fontWeight="bold">
          AUSTENITIZE 850°C
        </text>

        {/* Quench drop point */}
        <circle cx="330" cy="160" r="4" fill="#38BDF8" />
        <text x="330" y="150" textAnchor="end" fill="#38BDF8" fontSize="8" fontFamily="'Times New Roman', Times, serif">
          OIL QUENCH 65°C
        </text>

        {/* Tempering Plateau */}
        <circle cx="400" cy="145" r="3" fill="#F59E0B" />
        <text x="405" y="138" fill="#F59E0B" fontSize="8" fontFamily="'Times New Roman', Times, serif">
          TEMPER 200°C
        </text>
      </svg>
    </div>
  );
}

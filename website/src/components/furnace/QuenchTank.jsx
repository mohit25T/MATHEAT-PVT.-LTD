import React from 'react';

/**
 * QuenchTank (Full HD 1080p Native):
 * Industrial agitated quench tank with hoist elevator mast, circulation pump,
 * and billowing steam plumes driven smoothly via steamOpacity.
 */
export default function QuenchTank({ steamOpacity = 0 }) {
  return (
    <g id="quench-tank-station-1080" transform="translate(1440, 560)">
      {/* ------------------------------------------------------------ */}
      {/* 1. ELEVATOR HOIST MAST & RIGGING */}
      {/* ------------------------------------------------------------ */}
      <g id="hoist-mast-1080">
        {/* Vertical Twin I-Beam Mast */}
        <rect x="160" y="-300" width="16" height="380" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
        <rect x="184" y="-300" width="16" height="380" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
        {/* Top Pulley Sheave */}
        <circle cx="180" cy="-290" r="18" fill="#475569" stroke="#0F172A" strokeWidth="3" />
        <circle cx="180" cy="-290" r="6" fill="#94A3B8" />
        {/* Steel Hoist Cable */}
        <line x1="180" y1="-272" x2="180" y2="80" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="6 2" />
      </g>

      {/* ------------------------------------------------------------ */}
      {/* 2. HEAVY WELDED STEEL QUENCH OIL TANK */}
      {/* ------------------------------------------------------------ */}
      <g id="tank-housing-1080">
        {/* Outer Tank Body */}
        <rect
          x="0"
          y="80"
          width="340"
          height="250"
          rx="6"
          fill="url(#quenchTankGrad1080)"
          stroke="#334155"
          strokeWidth="3"
        />

        {/* Structural Perimeter Ribs */}
        <line x1="0" y1="160" x2="340" y2="160" stroke="#0F172A" strokeWidth="6" />
        <line x1="0" y1="240" x2="340" y2="240" stroke="#0F172A" strokeWidth="6" />

        {/* Quench Oil Reservoir Cavity */}
        <rect x="18" y="88" width="304" height="220" fill="#090E17" />
        
        {/* Oil Surface Meniscus Level */}
        <ellipse cx="170" cy="108" rx="145" ry="14" fill="#1E293B" stroke="#334155" strokeWidth="2" />
        {/* Agitated fluid ripples */}
        <ellipse cx="170" cy="108" rx="95" ry="9" fill="none" stroke="#475569" strokeWidth="2" opacity="0.6" />
        <ellipse cx="170" cy="108" rx="45" ry="4.5" fill="none" stroke="#64748B" strokeWidth="1.5" opacity="0.8" />

        {/* Oil Level Gauge Sight Tube */}
        <rect x="312" y="120" width="12" height="140" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="2" />
        <line x1="318" y1="130" x2="318" y2="250" stroke="#38BDF8" strokeWidth="4" opacity="0.75" />

        {/* Agitation Motor Pump on Left Flank */}
        <rect x="-38" y="150" width="42" height="74" rx="4" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
        <line x1="-38" y1="166" x2="4" y2="166" stroke="#475569" strokeWidth="3" />
        <line x1="-38" y1="182" x2="4" y2="182" stroke="#475569" strokeWidth="3" />
        <line x1="-38" y1="198" x2="4" y2="198" stroke="#475569" strokeWidth="3" />
        {/* Cooling Shroud */}
        <rect x="-50" y="160" width="12" height="54" rx="2" fill="#0F172A" />

        {/* Base Floor Mount Anchors */}
        <rect x="25" y="322" width="42" height="24" rx="2" fill="#0F172A" />
        <rect x="270" y="322" width="42" height="24" rx="2" fill="#0F172A" />

        {/* Industrial Stencil Decal */}
        <text x="170" y="295" textAnchor="middle" fill="#64748B" fontSize="13" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
          AGITATED OIL QUENCH // 65°C
        </text>
      </g>

      {/* ------------------------------------------------------------ */}
      {/* 3. BILLOWING STEAM PLUMES */}
      {/* ------------------------------------------------------------ */}
      {steamOpacity > 0 && (
        <g
          id="steam-effects-1080"
          transform="translate(170, 90)"
          opacity={steamOpacity}
        >
          <path
            className="steam-plume-1"
            d="M -30 0 C -60 -30, -50 -70, -10 -80 C 30 -90, 50 -50, 20 -20 Z"
            fill="url(#quenchSteamGrad1080)"
          />
          <path
            className="steam-plume-2"
            d="M 10 0 C -20 -40, 20 -90, 50 -84 C 80 -76, 70 -30, 30 -10 Z"
            fill="url(#quenchSteamGrad1080)"
          />
          <path
            className="steam-plume-3"
            d="M -10 -20 C -44 -60, -20 -110, 24 -100 C 60 -90, 40 -40, 0 -30 Z"
            fill="url(#quenchSteamGrad1080)"
          />
          <circle
            className="steam-plume-4"
            cx="0"
            cy="-50"
            r="56"
            fill="url(#quenchSteamGrad1080)"
          />
        </g>
      )}
    </g>
  );
}

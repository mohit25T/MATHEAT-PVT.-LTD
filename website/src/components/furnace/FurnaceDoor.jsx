import React from 'react';

/**
 * FurnaceDoor (Full HD 1080p):
 * Heavy pneumatic guillotine door in vertical guide channels.
 * Directly translated via doorLiftY (0px closed to -490px fully open).
 * Guaranteed 100% stutter-free and perfectly responsive to seeking and dragging.
 */
export default function FurnaceDoor({ doorLiftY = 0, doorOpacity = 1.0 }) {
  return (
    <g id="furnace-door-system-1080">
      {/* ------------------------------------------------------------ */}
      {/* 1. STATIONARY VERTICAL DOOR GUIDE CHANNELS (LEFT & RIGHT) */}
      {/* ------------------------------------------------------------ */}
      {/* Left Guide Track */}
      <rect x="420" y="140" width="30" height="710" fill="#0F172A" stroke="#334155" strokeWidth="2" />
      <rect x="430" y="140" width="10" height="710" fill="#1E293B" />
      <rect x="410" y="820" width="50" height="26" rx="4" fill="#475569" />

      {/* Right Guide Track */}
      <rect x="1250" y="140" width="30" height="710" fill="#0F172A" stroke="#334155" strokeWidth="2" />
      <rect x="1260" y="140" width="10" height="710" fill="#1E293B" />
      <rect x="1240" y="820" width="50" height="26" rx="4" fill="#475569" />

      {/* ------------------------------------------------------------ */}
      {/* 2. OVERHEAD PNEUMATIC LIFTING CYLINDER */}
      {/* ------------------------------------------------------------ */}
      <g id="lifting-pneumatic-cylinder-1080">
        <rect x="760" y="70" width="180" height="26" rx="4" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
        <rect x="825" y="0" width="50" height="110" rx="6" fill="url(#cylinderGrad1080)" stroke="#475569" strokeWidth="2" />
        {/* Polished Chrome Piston Rod (adjusts with door lift) */}
        <line
          x1="850"
          y1="110"
          x2="850"
          y2={270 + doorLiftY}
          stroke="#CBD5E1"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <rect x="830" y={255 + doorLiftY} width="40" height="30" rx="4" fill="#334155" />
        <circle cx="850" cy={270 + doorLiftY} r="7" fill="#64748B" />
      </g>

      {/* ------------------------------------------------------------ */}
      {/* 3. LIFTING INSULATED DOOR SLAB (Supports Dynamic Transparency) */}
      {/* ------------------------------------------------------------ */}
      <g
        id="door-slab-1080"
        transform={`translate(0, ${doorLiftY})`}
        opacity={doorOpacity}
        style={{ willChange: 'transform, opacity' }}
      >
        {/* Outer Heavy Steel Door Shell */}
        <rect
          x="440"
          y="270"
          width="820"
          height="580"
          rx="8"
          fill="url(#doorSlabGrad1080)"
          stroke={doorOpacity < 0.9 ? "#FF6A00" : "#475569"}
          strokeWidth={doorOpacity < 0.9 ? "4" : "4"}
        />

        {/* Ceramic Gasket Seal Flange */}
        <rect
          x="455"
          y="285"
          width="790"
          height="550"
          rx="4"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="3"
          strokeDasharray="12 6"
        />

        {/* Structural X-Rib Reinforcement Braces */}
        <line x1="465" y1="295" x2="1235" y2="825" stroke="#0F172A" strokeWidth="6" opacity="0.6" />
        <line x1="465" y1="825" x2="1235" y2="295" stroke="#0F172A" strokeWidth="6" opacity="0.6" />
        <line x1="465" y1="295" x2="1235" y2="825" stroke="#475569" strokeWidth="2" opacity="0.4" />
        <line x1="465" y1="825" x2="1235" y2="295" stroke="#475569" strokeWidth="2" opacity="0.4" />

        {/* Door Perimeter Fastener Studs */}
        {[310, 390, 470, 550, 630, 710, 790].map((yPos, i) => (
          <g key={i}>
            <circle cx="460" cy={yPos} r="5" fill="#64748B" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="1240" cy={yPos} r="5" fill="#64748B" stroke="#0F172A" strokeWidth="1.5" />
          </g>
        ))}

        {/* ------------------------------------------------------------ */}
        {/* QUARTZ INSPECTION VIEWPORT (Sight glass) */}
        {/* ------------------------------------------------------------ */}
        <g id="door-viewport-1080">
          <circle cx="850" cy="540" r="68" fill="#0F172A" stroke="#475569" strokeWidth="6" />
          {/* Bezel Ring Bolts */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const bx = 850 + 56 * Math.cos(rad);
            const by = 540 + 56 * Math.sin(rad);
            return <circle key={i} cx={bx} cy={by} r="3.5" fill="#94A3B8" />;
          })}
          {/* Viewport Glass (Always reveals internal fire glow) */}
          <circle
            cx="850"
            cy="540"
            r="44"
            fill="url(#viewportFireGrad1080)"
            stroke="#EA580C"
            strokeWidth="2.5"
          />
          {/* Internal Flame Reflection inside viewport */}
          <ellipse
            cx="845"
            cy="545"
            rx="26"
            ry="20"
            fill="#FEF08A"
            opacity="0.9"
            className="flame-inner"
          />
          {/* Specular Glare Arc */}
          <path
            d="M 825 515 A 38 38 0 0 1 875 520"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.65"
            fill="none"
          />
        </g>

        {/* MATHEAT Door Safety & Brand Decals */}
        <g id="door-decals-1080">
          <rect x="670" y="700" width="360" height="52" rx="4" fill="#0A0F1D" stroke="#334155" strokeWidth="2" />
          <text
            x="850"
            y="724"
            textAnchor="middle"
            fill="#FF6A00"
            fontSize="18"
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="3"
          >
            MATHEAT PVT. LTD.
          </text>
          <text
            x="850"
            y="742"
            textAnchor="middle"
            fill="#CBD5E1"
            fontSize="14"
            fontFamily="monospace"
            letterSpacing="1"
          >
            CQI-9 CONTROLLED ATMOSPHERE // 850°C
          </text>
        </g>
      </g>
    </g>
  );
}

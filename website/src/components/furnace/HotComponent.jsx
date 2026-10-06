import React from 'react';

/**
 * HotComponent (Full HD 1080p Native):
 * Industrial spur gear & pinion shaft in an alloy charging grid tray.
 * Features 100% seamless cross-fade metallurgy:
 * - Base: Raw cold machined silver carbon steel (#CBD5E1 / #94A3B8)
 * - Heat Glow: Smooth thermal red-orange ramp (#DC2626 / #EA580C)
 * - Soak Glow: Incandescent 850°C golden-white (#FEF08A / #FBBF24) with radial heat bloom
 * - Hardened: Quenched, high-hardness tempered martensite with deep dark gunmetal sheen (#0F172A / #1E293B)
 */
export default function HotComponent({
  posX = 1380,
  posY = 745,
  status = 'raw', // 'raw' | 'heating' | 'soaking' | 'hardened'
  heatGlow = 0,
  soakGlow = 0,
  hardenedGlow = 0,
  auraOpacity = 0,
  opacity = 1.0,
  idPrefix = "batchA"
}) {
  // 16 Gear Teeth array
  const numTeeth = 16;
  const teeth = [];
  for (let i = 0; i < numTeeth; i++) {
    teeth.push((i * 360) / numTeeth);
  }

  // Calculate effective cross-fade opacities
  let hGlow = heatGlow;
  let sGlow = soakGlow;
  let dGlow = hardenedGlow;
  let aGlow = auraOpacity;

  if (status === 'heating' && heatGlow === 0) {
    hGlow = 1.0;
    aGlow = 0.45;
  } else if (status === 'soaking' && soakGlow === 0) {
    hGlow = 1.0;
    sGlow = 1.0;
    aGlow = 0.85;
  } else if (status === 'hardened' && hardenedGlow === 0) {
    dGlow = 1.0;
    hGlow = 0;
    sGlow = 0;
    aGlow = 0;
  }

  // Reusable gear geometry renderer
  const renderGearAssembly = (gearFill, gearStroke, webFill, hubFill, showSheen = false) => (
    <g>
      {/* 16 Gear Teeth */}
      {teeth.map((deg, i) => (
        <rect
          key={i}
          x="-10"
          y="-70"
          width="20"
          height="20"
          rx="2"
          fill={gearFill}
          stroke={gearStroke}
          strokeWidth="2"
          transform={`rotate(${deg})`}
        />
      ))}

      {/* Outer Rim */}
      <circle cx="0" cy="0" r="58" fill={gearFill} stroke={gearStroke} strokeWidth="3" />

      {/* Recessed Web Pockets */}
      <circle cx="0" cy="0" r="44" fill="#0F172A" opacity="0.35" />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const px = 30 * Math.cos(rad);
        const py = 30 * Math.sin(rad);
        return (
          <circle
            key={i}
            cx={px}
            cy={py}
            r="9"
            fill={webFill}
            stroke={gearStroke}
            strokeWidth="1.5"
          />
        );
      })}

      {/* Gear Hub & Center Keyed Bore */}
      <circle cx="0" cy="0" r="20" fill={hubFill} stroke={gearStroke} strokeWidth="2.5" />
      <circle cx="0" cy="0" r="11" fill="#0A0F17" />
      <rect x="-2.5" y="-14" width="5" height="6" fill="#0A0F17" />

      {/* Splined Pinion Shaft */}
      <rect
        x="-6"
        y="14"
        width="12"
        height="38"
        rx="2"
        fill={gearFill}
        stroke={gearStroke}
        strokeWidth="1.5"
      />

      {/* Tempered Metallic Sheen */}
      {showSheen && (
        <ellipse
          cx="-15"
          cy="-20"
          rx="30"
          ry="14"
          fill="url(#temperedSheenGrad1080)"
          opacity="0.85"
          transform="rotate(-25, -15, -20)"
        />
      )}
    </g>
  );

  return (
    <g
      id={`${idPrefix}-assembly-1080`}
      transform={`translate(${posX}, ${posY})`}
      opacity={opacity}
      style={{ willChange: 'transform' }}
    >
      {/* ------------------------------------------------------------ */}
      {/* 1. HEAT BLOOM AURA (Cross-faded smoothly during high heat) */}
      {/* ------------------------------------------------------------ */}
      {aGlow > 0.01 && (
        <circle
          cx="0"
          cy="0"
          r="120"
          fill="url(#gearRadialBloomGrad1080)"
          opacity={aGlow}
          className="ambient-heat-glow"
        />
      )}

      {/* ------------------------------------------------------------ */}
      {/* 2. ALLOY CHARGING BASKET / TRAY */}
      {/* ------------------------------------------------------------ */}
      <g id={`${idPrefix}-charging-tray-1080`}>
        {/* Tray Base Grid Runner */}
        <rect
          x="-105"
          y="48"
          width="210"
          height="18"
          rx="4"
          fill={dGlow > 0.5 ? "#0F172A" : sGlow > 0.3 ? "#78350F" : "#1E293B"}
          stroke={sGlow > 0.3 ? "#EA580C" : "#0F172A"}
          strokeWidth="2"
        />
        <line
          x1="-96"
          y1="57"
          x2="96"
          y2="57"
          stroke={sGlow > 0.3 ? "#FEF08A" : "#475569"}
          strokeWidth="4"
          strokeDasharray="8 4"
        />
        {/* Side Lifting Ears */}
        <path d="M -105 48 L -96 20 L -88 20 L -88 48 Z" fill="#334155" />
        <path d="M 105 48 L 96 20 L 88 20 L 88 48 Z" fill="#334155" />
      </g>

      {/* ------------------------------------------------------------ */}
      {/* 3. MULTI-LAYER CROSS-FADING METALLURGICAL GEAR ASSEMBLY */}
      {/* ------------------------------------------------------------ */}
      <g id={`${idPrefix}-precision-steel-gear-1080`}>
        {/* Layer 1: Base Cold Raw Machined Steel */}
        {renderGearAssembly("url(#rawSteelGrad1080)", "#64748B", "#475569", "url(#rawSteelGrad1080)")}

        {/* Layer 2: Thermal Heating Red-Orange Ramp */}
        {hGlow > 0.01 && (
          <g opacity={Math.min(1, hGlow)}>
            {renderGearAssembly("url(#heatingSteelGrad1080)", "#F97316", "#7F1D1D", "url(#heatingSteelGrad1080)")}
          </g>
        )}

        {/* Layer 3: 850°C Austenitizing Incandescent Golden-White */}
        {sGlow > 0.01 && (
          <g opacity={Math.min(1, sGlow)}>
            {renderGearAssembly("url(#hotGearIncandescentGrad1080)", "#FFFDF0", "#991B1B", "url(#hotGearIncandescentGrad1080)")}
          </g>
        )}

        {/* Layer 4: Oil-Quenched High-Hardness Tempered Martensite */}
        {dGlow > 0.01 && (
          <g opacity={Math.min(1, dGlow)}>
            {renderGearAssembly("url(#hardenedSteelGrad1080)", "#475569", "#0A0F17", "url(#hardenedSteelGrad1080)", true)}
          </g>
        )}
      </g>
    </g>
  );
}

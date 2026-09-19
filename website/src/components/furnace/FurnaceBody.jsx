import React from 'react';

/**
 * FurnaceBody (Full HD 1080p Native):
 * Structural heavy steel casing, refractory ceramic brick cavity,
 * ventilation exhaust flue, roller hearth conveyor bed, gas lines,
 * perspective factory floor, and MATHEAT PVT. LTD. header badge.
 */
export default function FurnaceBody() {
  return (
    <g className="furnace-body-1080" id="furnace-chassis-1080">
      {/* ------------------------------------------------------------ */}
      {/* 1. FACTORY ENVIRONMENT: Back Wall & Industrial Floor */}
      {/* ------------------------------------------------------------ */}

      {/* Dark Industrial Factory Wall */}
      <rect x="0" y="0" width="1920" height="880" fill="url(#factoryWallGrad1080)" />

      {/* Structural Steel Columns & Girders in Background */}
      <rect x="130" y="0" width="48" height="880" fill="#131B24" opacity="0.75" />
      <rect x="178" y="0" width="8" height="880" fill="#1A2533" opacity="0.6" />
      <rect x="1740" y="0" width="55" height="880" fill="#131B24" opacity="0.75" />
      <rect x="1732" y="0" width="8" height="880" fill="#1A2533" opacity="0.6" />

      {/* Overhead Crane Rail & Service Pipe Lines */}
      <line x1="0" y1="88" x2="1920" y2="88" stroke="#1A2430" strokeWidth="12" />
      <line x1="0" y1="116" x2="1920" y2="116" stroke="#253342" strokeWidth="4" strokeDasharray="24 8" />

      {/* Industrial Gas Manifold Line & Electrical Trays */}
      <path d="M 0 176 L 320 176 L 320 380" fill="none" stroke="#EAB308" strokeWidth="6" opacity="0.9" />
      <path d="M 0 196 L 300 196 L 300 680" fill="none" stroke="#EAB308" strokeWidth="6" opacity="0.9" />
      <text x="36" y="166" fill="#CA8A04" fontSize="15" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
        NATURAL GAS LINE // 2.5 BAR HIGH-PRESSURE
      </text>

      {/* Factory Floor (Perspective Grid & Floor Plate) */}
      <rect x="0" y="880" width="1920" height="200" fill="url(#factoryFloorGrad1080)" />
      
      {/* Floor Perspective Expansion Lines */}
      <line x1="0" y1="880" x2="1920" y2="880" stroke="#334155" strokeWidth="4" />
      <line x1="260" y1="880" x2="180" y2="1080" stroke="#1E293B" strokeWidth="3" opacity="0.5" />
      <line x1="600" y1="880" x2="540" y2="1080" stroke="#1E293B" strokeWidth="3" opacity="0.5" />
      <line x1="960" y1="880" x2="960" y2="1080" stroke="#1E293B" strokeWidth="3" opacity="0.5" />
      <line x1="1320" y1="880" x2="1380" y2="1080" stroke="#1E293B" strokeWidth="3" opacity="0.5" />
      <line x1="1660" y1="880" x2="1760" y2="1080" stroke="#1E293B" strokeWidth="3" opacity="0.5" />

      {/* Floor Specular Heat Reflection Ellipse */}
      <ellipse
        cx="850"
        cy="910"
        rx="580"
        ry="55"
        fill="url(#floorHeatReflection1080)"
        opacity="0.65"
      />

      {/* ------------------------------------------------------------ */}
      {/* 2. STRUCTURAL HEAVY I-BEAM LEGS (Supports Furnace Base) */}
      {/* ------------------------------------------------------------ */}
      
      {/* Left Leg */}
      <g id="leg-left-1080">
        <rect x="380" y="850" width="64" height="75" fill="url(#steelBeamGrad1080)" />
        <rect x="360" y="915" width="104" height="18" rx="4" fill="#0F172A" />
        <circle cx="375" cy="924" r="4.5" fill="#64748B" />
        <circle cx="449" cy="924" r="4.5" fill="#64748B" />
      </g>

      {/* Center Leg */}
      <g id="leg-center-1080">
        <rect x="818" y="850" width="64" height="75" fill="url(#steelBeamGrad1080)" />
        <rect x="798" y="915" width="104" height="18" rx="4" fill="#0F172A" />
        <circle cx="813" cy="924" r="4.5" fill="#64748B" />
        <circle cx="887" cy="924" r="4.5" fill="#64748B" />
      </g>

      {/* Right Leg */}
      <g id="leg-right-1080">
        <rect x="1256" y="850" width="64" height="75" fill="url(#steelBeamGrad1080)" />
        <rect x="1236" y="915" width="104" height="18" rx="4" fill="#0F172A" />
        <circle cx="1251" cy="924" r="4.5" fill="#64748B" />
        <circle cx="1325" cy="924" r="4.5" fill="#64748B" />
      </g>

      {/* ------------------------------------------------------------ */}
      {/* 3. EXHAUST & VENTILATION CHIMNEY FLUE STACK (Top) */}
      {/* ------------------------------------------------------------ */}
      <g id="exhaust-chimney-1080">
        <rect x="750" y="20" width="200" height="16" fill="#1E293B" />
        <rect x="770" y="36" width="160" height="164" fill="url(#exhaustStackGrad1080)" />
        <line x1="770" y1="100" x2="930" y2="100" stroke="#334155" strokeWidth="4" />
        {/* Flange Collar at furnace entry */}
        <rect x="754" y="180" width="192" height="22" rx="2" fill="#0F172A" />
        {[770, 810, 850, 890, 930].map((xPos, idx) => (
          <circle key={idx} cx={xPos} cy="191" r="3.5" fill="#94A3B8" />
        ))}
        {/* Damper Lever */}
        <rect x="930" y="94" width="36" height="8" fill="#64748B" />
        <circle cx="966" cy="98" r="10" fill="#EA580C" />
      </g>

      {/* ------------------------------------------------------------ */}
      {/* 4. MAIN FURNACE STEEL CHASSIS (Outer Housing) */}
      {/* ------------------------------------------------------------ */}
      <g id="furnace-outer-casing-1080">
        {/* Outer Heavy Steel Housing */}
        <rect
          x="320"
          y="200"
          width="1060"
          height="660"
          rx="12"
          fill="url(#furnaceCasingGrad1080)"
          stroke="#334155"
          strokeWidth="4"
        />

        {/* Structural Top Crown Header Beam */}
        <rect x="310" y="196" width="1080" height="36" rx="4" fill="url(#headerBeamGrad1080)" />
        <line x1="310" y1="232" x2="1390" y2="232" stroke="#0F172A" strokeWidth="4" />

        {/* Vertical Structural Gusset Stiffeners */}
        <rect x="430" y="232" width="18" height="628" fill="#0F172A" opacity="0.6" />
        <rect x="434" y="232" width="6" height="628" fill="#475569" opacity="0.4" />
        <rect x="1252" y="232" width="18" height="628" fill="#0F172A" opacity="0.6" />
        <rect x="1256" y="232" width="6" height="628" fill="#475569" opacity="0.4" />

        {/* Rigging Shackles / Lifting Lugs */}
        <rect x="340" y="170" width="40" height="30" rx="4" fill="#334155" />
        <circle cx="360" cy="185" r="9" fill="#0B121A" />
        <rect x="1320" y="170" width="40" height="30" rx="4" fill="#334155" />
        <circle cx="1340" cy="185" r="9" fill="#0B121A" />

        {/* Outer Perimeter Hex Studs */}
        {[260, 340, 420, 500, 580, 660, 740, 810].map((yPos, idx) => (
          <g key={idx}>
            <circle cx="345" cy={yPos} r="5" fill="#64748B" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="1355" cy={yPos} r="5" fill="#64748B" stroke="#0F172A" strokeWidth="1.5" />
          </g>
        ))}

        {/* MATHEAT PVT. LTD. Header Plaque */}
        <g id="matheat-header-badge-1080">
          <rect x="580" y="202" width="540" height="26" rx="4" fill="#0A1320" stroke="#FF6A00" strokeWidth="1.5" />
          <text
            x="850"
            y="220"
            textAnchor="middle"
            fill="#F8FAFC"
            fontSize="15"
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="4"
          >
            MATHEAT PVT. LTD. • INDUSTRIAL HEATING
          </text>
        </g>
      </g>

      {/* ------------------------------------------------------------ */}
      {/* 5. REFRACTORY CERAMIC INSULATION CAVITY (Brick Interior) */}
      {/* ------------------------------------------------------------ */}
      <g id="refractory-chamber-1080">
        {/* Ceramic Fiber Insulation Outer Border */}
        <rect
          x="450"
          y="280"
          width="800"
          height="560"
          rx="8"
          fill="#1C130E"
          stroke="#382114"
          strokeWidth="12"
        />

        {/* Staggered Refractory Brick Joints */}
        <g stroke="#C2410C" strokeWidth="1.5" opacity="0.8">
          {[340, 400, 460, 520, 580, 640, 700, 760].map((yPos, i) => (
            <line key={i} x1="462" y1={yPos} x2="1238" y2={yPos} />
          ))}
          {/* Vertical staggered joints */}
          {[550, 710, 870, 1030, 1190].map((xPos, i) => (
            <React.Fragment key={i}>
              <line x1={xPos} y1="280" x2={xPos} y2="340" />
              <line x1={xPos - 80} y1="340" x2={xPos - 80} y2="400" />
              <line x1={xPos} y1="400" x2={xPos} y2="460" />
              <line x1={xPos - 80} y1="460" x2={xPos - 80} y2="520" />
              <line x1={xPos} y1="520" x2={xPos} y2="580" />
              <line x1={xPos - 80} y1="580" x2={xPos - 80} y2="640" />
              <line x1={xPos} y1="640" x2={xPos} y2="700" />
              <line x1={xPos - 80} y1="700" x2={xPos - 80} y2="760" />
            </React.Fragment>
          ))}
        </g>

        {/* Deep Combustion Cavity Background */}
        <rect
          x="470"
          y="295"
          width="760"
          height="530"
          fill="url(#chamberActiveHeatGrad1080)"
          opacity="0.95"
        />

        {/* Roller Hearth Bed Tracks (Extends from chamber out toward quench station) */}
        <g id="hearth-roller-rails-1080">
          <rect x="470" y="780" width="1020" height="24" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <line x1="470" y1="788" x2="1490" y2="788" stroke="#475569" strokeWidth="4" />
          
          {/* Heavy Alloy Roller Bearings */}
          {[510, 580, 650, 720, 790, 860, 930, 1000, 1070, 1140, 1210, 1280, 1350, 1420, 1490].map((xPos, idx) => (
            <g key={idx}>
              <circle cx={xPos} cy="792" r="8" fill="#334155" stroke="#64748B" strokeWidth="2" />
              <circle cx={xPos} cy="792" r="3" fill="#0F172A" />
            </g>
          ))}
        </g>
      </g>

      {/* ------------------------------------------------------------ */}
      {/* 6. BURNER PORTS (4 Wall Housings) */}
      {/* ------------------------------------------------------------ */}
      <g id="burner-mount-flanges-1080">
        {/* Burner 1 (Top Left) */}
        <rect x="460" y="360" width="34" height="52" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="2" />
        <circle cx="477" cy="386" r="11" fill="#7F1D1D" />
        <circle cx="477" cy="386" r="5" fill="#F59E0B" />

        {/* Burner 2 (Bottom Left) */}
        <rect x="460" y="660" width="34" height="52" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="2" />
        <circle cx="477" cy="686" r="11" fill="#7F1D1D" />
        <circle cx="477" cy="686" r="5" fill="#F59E0B" />

        {/* Burner 3 (Top Right) */}
        <rect x="1206" y="360" width="34" height="52" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="2" />
        <circle cx="1223" cy="386" r="11" fill="#7F1D1D" />
        <circle cx="1223" cy="386" r="5" fill="#F59E0B" />

        {/* Burner 4 (Bottom Right) */}
        <rect x="1206" y="660" width="34" height="52" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="2" />
        <circle cx="1223" cy="686" r="11" fill="#7F1D1D" />
        <circle cx="1223" cy="686" r="5" fill="#F59E0B" />
      </g>
    </g>
  );
}

import React from 'react';

/**
 * ControlPanel (Full HD 1080p Native):
 * Industrial SCADA instrumentation cabinet with high-contrast LED temperature readout,
 * carbon potential atmosphere monitoring, pilot indicator lamps, and emergency stop.
 */
export default function ControlPanel({ temp = 850, status = "HEATING 850°C" }) {
  return (
    <g id="control-panel-cabinet-1080" transform="translate(60, 310)">
      {/* Heavy Steel Cabinet Housing */}
      <rect
        x="0"
        y="0"
        width="220"
        height="390"
        rx="8"
        fill="url(#controlCabinetGrad1080)"
        stroke="#475569"
        strokeWidth="3"
      />

      {/* Inner Bevel */}
      <rect x="8" y="8" width="204" height="374" rx="4" fill="#0B1320" stroke="#1E293B" strokeWidth="2" />

      {/* Main Digital LED Temperature Display */}
      <g id="temperature-display-1080">
        <rect x="20" y="28" width="180" height="76" rx="4" fill="#05080E" stroke="#334155" strokeWidth="2" />
        
        <text x="28" y="48" fill="#94A3B8" fontSize="11" fontFamily="monospace" fontWeight="bold">
          PROCESS TEMP.
        </text>

        <text
          x="152"
          y="88"
          textAnchor="end"
          fill="#EF4444"
          fontSize="38"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="2"
          style={{ textShadow: "0 0 16px rgba(239, 68, 68, 0.85)" }}
        >
          {Math.round(temp)}
        </text>
        <text x="158" y="66" fill="#EF4444" fontSize="16" fontFamily="monospace" fontWeight="bold">
          °C
        </text>
      </g>

      {/* Atmosphere Gas Display */}
      <g id="atmosphere-display-1080">
        <rect x="20" y="118" width="180" height="52" rx="4" fill="#05080E" stroke="#1E293B" strokeWidth="1.5" />
        <text x="28" y="136" fill="#64748B" fontSize="10" fontFamily="monospace">
          ATMOSPHERE: ENDO GAS
        </text>
        <text x="28" y="156" fill="#38BDF8" fontSize="13" fontFamily="monospace" fontWeight="bold">
          CP: 0.80% // DEW: +4°C
        </text>
      </g>

      {/* Process Status Box */}
      <g id="status-display-1080">
        <rect x="20" y="182" width="180" height="56" rx="4" fill="#05080E" stroke="#334155" strokeWidth="2" />
        <text x="28" y="200" fill="#94A3B8" fontSize="11" fontFamily="monospace" fontWeight="bold">
          MODE:
        </text>
        <text
          x="28"
          y="224"
          fill="#10B981"
          fontSize="15"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="1"
        >
          AUTO LOOP
        </text>
      </g>

      {/* Pilot Status Indicator Lamps */}
      <g id="pilot-lamps-1080" transform="translate(28, 256)">
        {/* Lamp 1: Power (Green) */}
        <circle cx="16" cy="16" r="9" fill="#10B981" stroke="#064E3B" strokeWidth="2" />
        <circle cx="16" cy="16" r="4" fill="#A7F3D0" />
        <text x="16" y="38" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="monospace">
          PWR
        </text>

        {/* Lamp 2: Heat (Orange) */}
        <circle cx="56" cy="16" r="9" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />
        <circle cx="56" cy="16" r="4" fill="#FEF08A" />
        <text x="56" y="38" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="monospace">
          HEAT
        </text>

        {/* Lamp 3: Agitation (Blue) */}
        <circle cx="96" cy="16" r="9" fill="#0284C7" stroke="#0C4A6E" strokeWidth="2" />
        <circle cx="96" cy="16" r="4" fill="#BAE6FD" />
        <text x="96" y="38" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="monospace">
          AGIT
        </text>

        {/* Lamp 4: Alarm (Red) */}
        <circle cx="136" cy="16" r="9" fill="#7F1D1D" stroke="#450A0A" strokeWidth="2" />
        <text x="136" y="38" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="monospace">
          ALM
        </text>
      </g>

      {/* Emergency Stop Button (E-Stop) */}
      <g id="estop-1080" transform="translate(28, 315)">
        {/* Yellow Safety Bezel */}
        <circle cx="32" cy="32" r="22" fill="#EAB308" stroke="#713F12" strokeWidth="2" />
        <text x="32" y="18" textAnchor="middle" fill="#000000" fontSize="7" fontFamily="sans-serif" fontWeight="bold">
          EMERGENCY
        </text>
        {/* Red Pushbutton */}
        <circle cx="32" cy="32" r="14" fill="#DC2626" stroke="#991B1B" strokeWidth="2.5" />
        <circle cx="32" cy="32" r="6" fill="#EF4444" />

        {/* Key Switch */}
        <circle cx="112" cy="32" r="12" fill="#334155" stroke="#0F172A" strokeWidth="2" />
        <rect x="110" y="26" width="4" height="12" fill="#94A3B8" />
      </g>
    </g>
  );
}

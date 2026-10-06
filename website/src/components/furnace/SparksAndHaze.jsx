import React from 'react';

/**
 * SparksAndHaze (Full HD 1080p Native):
 * 120 FPS lightweight CSS-animated sparks and heat-wave distortion bands.
 */
export default function SparksAndHaze() {
  return (
    <g id="sparks-and-atmospheric-haze-1080" pointerEvents="none">
      {/* ------------------------------------------------------------ */}
      {/* 1. CHIMNEY EXHAUST HAZE (Top Flue Stack at x=850, y=25) */}
      {/* ------------------------------------------------------------ */}
      <g id="chimney-haze-1080">
        <ellipse
          className="chimney-puff-1"
          cx="850"
          cy="28"
          rx="36"
          ry="14"
          fill="url(#exhaustHazeGrad1080)"
        />
        <ellipse
          className="chimney-puff-2"
          cx="860"
          cy="22"
          rx="44"
          ry="18"
          fill="url(#exhaustHazeGrad1080)"
        />
      </g>

      {/* ------------------------------------------------------------ */}
      {/* 2. HEAT DISTORTION WAVES (Above Chamber Opening) */}
      {/* ------------------------------------------------------------ */}
      <g id="heat-waves-1080" transform="translate(600, 240)">
        <path
          className="heat-wave-1080-1"
          d="M 0 0 Q 120 -24 240 0 T 480 0"
          fill="none"
          stroke="url(#heatWaveStrokeGrad1080)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          className="heat-wave-1080-2"
          d="M 40 -20 Q 160 -48 280 -20 T 440 -20"
          fill="none"
          stroke="url(#heatWaveStrokeGrad1080)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          className="heat-wave-1080-3"
          d="M 80 -40 Q 180 -64 300 -40 T 400 -40"
          fill="none"
          stroke="url(#heatWaveStrokeGrad1080)"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </g>

      {/* ------------------------------------------------------------ */}
      {/* 3. GLOWING SPARKS & EMBERS */}
      {/* ------------------------------------------------------------ */}
      <g id="glowing-sparks-1080" transform="translate(850, 560)">
        <circle className="spark-1080-1" cx="-160" cy="80" r="3.2" fill="#FEF08A" />
        <circle className="spark-1080-2" cx="-100" cy="40" r="4.0" fill="#F59E0B" />
        <circle className="spark-1080-3" cx="-40" cy="100" r="2.8" fill="#FFEDD5" />
        <circle className="spark-1080-4" cx="20" cy="60" r="3.6" fill="#F97316" />
        <circle className="spark-1080-5" cx="80" cy="90" r="3.0" fill="#FEF08A" />
        <circle className="spark-1080-6" cx="140" cy="50" r="4.4" fill="#F59E0B" />
        <circle className="spark-1080-1" cx="-120" cy="-20" r="2.6" fill="#FFFFFF" />
        <circle className="spark-1080-2" cx="60" cy="-30" r="3.4" fill="#FDE047" />
        <circle className="spark-1080-3" cx="-60" cy="120" r="3.0" fill="#F97316" />
        <circle className="spark-1080-4" cx="100" cy="110" r="3.8" fill="#FEF08A" />
        <circle className="spark-1080-5" cx="-140" cy="140" r="2.8" fill="#F59E0B" />
        <circle className="spark-1080-6" cx="30" cy="150" r="3.2" fill="#FDE047" />
      </g>
    </g>
  );
}

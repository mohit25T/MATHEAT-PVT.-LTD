import React from 'react';

/**
 * FurnaceFlames (Full HD 1080p Native):
 * 4 independent industrial gas combustion burners inside the furnace chamber.
 * Scaled and optimized for 120 FPS high-refresh rate display with organic asynchronous motion.
 */
export default function FurnaceFlames({ intensity = 1.0 }) {
  return (
    <g className="furnace-flames-1080" id="furnace-flames-1080" opacity={intensity}>
      {/* ============================================================ */}
      {/* BURNER 1: Top-Left (x=475, y=390) -> Shoots into center */}
      {/* ============================================================ */}
      <g className="burner-1-flame" transform="translate(475, 390)">
        {/* Layer 1: Dark Red Outer Flame */}
        <path
          className="flame-outer"
          d="M 0 0 C 80 -40, 190 -70, 280 -20 C 340 16, 290 70, 190 60 C 100 50, 40 30, 0 0 Z"
          fill="url(#flameOuterGrad1080)"
          opacity="0.85"
        />
        {/* Layer 2: Orange Middle Flame */}
        <path
          className="flame-middle"
          d="M 4 0 C 70 -28, 160 -50, 230 -12 C 270 12, 240 48, 156 40 C 84 32, 30 20, 4 0 Z"
          fill="url(#flameMiddleGrad1080)"
          opacity="0.9"
        />
        {/* Layer 3: Bright Orange-Yellow Inner Flame */}
        <path
          className="flame-inner"
          d="M 8 0 C 60 -20, 130 -32, 180 -8 C 210 8, 184 32, 120 28 C 64 22, 24 12, 8 0 Z"
          fill="url(#flameInnerGrad1080)"
          opacity="0.95"
        />
        {/* Layer 4: Intense Yellow Core */}
        <path
          className="flame-core"
          d="M 10 0 C 44 -12, 96 -20, 132 -4 C 156 6, 136 22, 88 18 C 48 14, 20 8, 10 0 Z"
          fill="#FEF08A"
        />
        {/* Layer 5: White-Hot Center Eye */}
        <ellipse cx="44" cy="0" rx="32" ry="9" fill="#FFFFFF" opacity="0.95" />
      </g>

      {/* ============================================================ */}
      {/* BURNER 2: Bottom-Left (x=475, y=690) -> Shoots upward-inward */}
      {/* ============================================================ */}
      <g className="burner-2-flame" transform="translate(475, 690)">
        {/* Layer 1: Dark Red Outer Flame */}
        <path
          className="flame-outer"
          d="M 0 0 C 90 36, 180 60, 270 16 C 330 -24, 280 -70, 180 -56 C 100 -44, 40 -24, 0 0 Z"
          fill="url(#flameOuterGrad1080)"
          opacity="0.85"
        />
        {/* Layer 2: Orange Middle Flame */}
        <path
          className="flame-middle"
          d="M 4 0 C 70 24, 150 44, 220 10 C 260 -16, 230 -48, 150 -36 C 80 -28, 30 -16, 4 0 Z"
          fill="url(#flameMiddleGrad1080)"
          opacity="0.9"
        />
        {/* Layer 3: Bright Orange-Yellow Inner Flame */}
        <path
          className="flame-inner"
          d="M 8 0 C 56 16, 120 28, 170 6 C 196 -10, 176 -32, 116 -24 C 60 -18, 24 -10, 8 0 Z"
          fill="url(#flameInnerGrad1080)"
          opacity="0.95"
        />
        {/* Layer 4: Intense Yellow Core */}
        <path
          className="flame-core"
          d="M 10 0 C 40 10, 88 16, 124 4 C 144 -6, 128 -20, 84 -14 C 44 -10, 20 -6, 10 0 Z"
          fill="#FEF08A"
        />
        {/* Layer 5: White-Hot Center Eye */}
        <ellipse cx="40" cy="0" rx="30" ry="8" fill="#FFFFFF" opacity="0.95" />
      </g>

      {/* ============================================================ */}
      {/* BURNER 3: Top-Right (x=1225, y=390) -> Shoots leftward-inward */}
      {/* ============================================================ */}
      <g className="burner-3-flame" transform="translate(1225, 390) scale(-1, 1)">
        {/* Layer 1: Dark Red Outer Flame */}
        <path
          className="flame-outer"
          d="M 0 0 C 84 -44, 184 -64, 276 -16 C 336 20, 284 68, 188 56 C 96 48, 36 28, 0 0 Z"
          fill="url(#flameOuterGrad1080)"
          opacity="0.85"
        />
        {/* Layer 2: Orange Middle Flame */}
        <path
          className="flame-middle"
          d="M 4 0 C 72 -30, 156 -48, 224 -10 C 264 16, 236 48, 152 38 C 78 30, 28 18, 4 0 Z"
          fill="url(#flameMiddleGrad1080)"
          opacity="0.9"
        />
        {/* Layer 3: Bright Orange-Yellow Inner Flame */}
        <path
          className="flame-inner"
          d="M 8 0 C 56 -20, 124 -30, 176 -6 C 204 10, 180 30, 118 26 C 62 20, 24 12, 8 0 Z"
          fill="url(#flameInnerGrad1080)"
          opacity="0.95"
        />
        {/* Layer 4: Intense Yellow Core */}
        <path
          className="flame-core"
          d="M 10 0 C 40 -12, 92 -18, 128 -4 C 150 6, 132 20, 86 16 C 46 12, 20 8, 10 0 Z"
          fill="#FEF08A"
        />
        {/* Layer 5: White-Hot Center Eye */}
        <ellipse cx="42" cy="0" rx="30" ry="8.4" fill="#FFFFFF" opacity="0.95" />
      </g>

      {/* ============================================================ */}
      {/* BURNER 4: Bottom-Right (x=1225, y=690) -> Shoots upward-left */}
      {/* ============================================================ */}
      <g className="burner-4-flame" transform="translate(1225, 690) scale(-1, 1)">
        {/* Layer 1: Dark Red Outer Flame */}
        <path
          className="flame-outer"
          d="M 0 0 C 88 38, 176 56, 264 14 C 324 -20, 276 -64, 176 -52 C 96 -40, 36 -22, 0 0 Z"
          fill="url(#flameOuterGrad1080)"
          opacity="0.85"
        />
        {/* Layer 2: Orange Middle Flame */}
        <path
          className="flame-middle"
          d="M 4 0 C 68 26, 146 40, 216 8 C 256 -14, 224 -44, 146 -34 C 76 -26, 28 -14, 4 0 Z"
          fill="url(#flameMiddleGrad1080)"
          opacity="0.9"
        />
        {/* Layer 3: Bright Orange-Yellow Inner Flame */}
        <path
          className="flame-inner"
          d="M 8 0 C 52 16, 116 26, 166 4 C 190 -8, 170 -30, 112 -22 C 58 -16, 22 -8, 8 0 Z"
          fill="url(#flameInnerGrad1080)"
          opacity="0.95"
        />
        {/* Layer 4: Intense Yellow Core */}
        <path
          className="flame-core"
          d="M 10 0 C 38 10, 84 14, 120 2 C 138 -6, 124 -18, 80 -12 C 42 -8, 18 -6, 10 0 Z"
          fill="#FEF08A"
        />
        {/* Layer 5: White-Hot Center Eye */}
        <ellipse cx="38" cy="0" rx="28" ry="7.6" fill="#FFFFFF" opacity="0.95" />
      </g>

      {/* Center Chamber Thermal Convection Fire Swirl */}
      <circle
        cx="850"
        cy="540"
        r="150"
        fill="url(#flameSwirlRadialGrad1080)"
        opacity="0.75"
        className="ambient-heat-glow"
      />
    </g>
  );
}

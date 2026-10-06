import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

export default function HeatTreatmentVectorAnimation({
  autoPlay = true,
  showControls = true,
  className = "",
  onSceneChange = null
}) {
  const TOTAL_DURATION = 25.0; // seconds

  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Scene definitions with timing
  const scenes = [
    { id: 1, name: "CAD Sketch", range: [0.0, 2.5], label: "01 // CAD DRAFTING" },
    { id: 2, name: "Raw Component", range: [2.5, 5.0], label: "02 // RAW COMPONENT" },
    { id: 3, name: "Furnace Entry", range: [5.0, 7.5], label: "03 // FURNACE CHAMBER" },
    { id: 4, name: "Controlled Heating", range: [7.5, 10.2], label: "04 // HEATING CYCLE" },
    { id: 5, name: "Soak & Atmosphere", range: [10.2, 12.8], label: "05 // SOAK & ATMOSPHERE" },
    { id: 6, name: "Oil Quenching", range: [12.8, 15.6], label: "06 // QUENCH TRANSFORMATION" },
    { id: 7, name: "Tempering", range: [15.6, 18.2], label: "07 // CONTROLLED TEMPERING" },
    { id: 8, name: "Quality Inspection", range: [18.2, 20.8], label: "08 // QUALITY AUDIT" },
    { id: 9, name: "Traceability", range: [20.8, 23.2], label: "09 // DIGITAL AUDIT TRAIL" },
    { id: 10, name: "Brand Guarantee", range: [23.2, 25.0], label: "10 // MATHEAT METALLURGY" },
  ];

  // Active scene calculation
  const currentSceneIndex = scenes.findIndex(
    s => time >= s.range[0] && time < s.range[1]
  );
  const activeScene = scenes[currentSceneIndex >= 0 ? currentSceneIndex : 0];

  useEffect(() => {
    if (onSceneChange) {
      onSceneChange(activeScene);
    }
  }, [activeScene.id]);

  // Main 60FPS animation loop with smooth time wrap
  useEffect(() => {
    const updateAnimation = (now) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        setTime((prev) => {
          const next = prev + delta;
          return next >= TOTAL_DURATION ? next - TOTAL_DURATION : next;
        });
      }

      animFrameRef.current = requestAnimationFrame(updateAnimation);
    };

    animFrameRef.current = requestAnimationFrame(updateAnimation);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Handle seeking
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setTime(pos * TOTAL_DURATION);
  };

  // Jump to specific scene
  const jumpToScene = (index) => {
    setTime(scenes[index].range[0]);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Helper to get normalized progress (0 to 1) within a scene
  const getSceneProgress = (start, end) => {
    if (time < start) return 0;
    if (time > end) return 1;
    return (time - start) / (end - start);
  };

  // Individual scene progresses
  const p1 = getSceneProgress(0.0, 2.5);
  const p2 = getSceneProgress(2.5, 5.0);
  const p3 = getSceneProgress(5.0, 7.5);
  const p4 = getSceneProgress(7.5, 10.2);
  const p5 = getSceneProgress(10.2, 12.8);
  const p6 = getSceneProgress(12.8, 15.6);
  const p7 = getSceneProgress(15.6, 18.2);
  const p8 = getSceneProgress(18.2, 20.8);
  const p9 = getSceneProgress(20.8, 23.2);
  const p10 = getSceneProgress(23.2, 25.0);


  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video bg-[#FDFDFE] rounded-xl overflow-hidden border-2 border-slate-400 shadow-xl select-none group font-sans ${className}`}
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      {/* 16:9 Scalable Vector Engine (1600 x 900) */}
      <svg
        viewBox="0 0 1600 900"
        className="w-full h-full block fill-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle Technical Engineering Millimeter Grid */}
          <pattern id="millimeterGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="40" y2="0" stroke="#E2E8F0" strokeWidth="0.75" />
            <line x1="0" y1="0" x2="0" y2="40" stroke="#E2E8F0" strokeWidth="0.75" />
            <circle cx="20" cy="20" r="0.75" fill="#CBD5E1" />
          </pattern>

          {/* Major CAD Block Grid */}
          <pattern id="majorCadGrid" width="200" height="200" patternUnits="userSpaceOnUse">
            <rect width="200" height="200" fill="url(#millimeterGrid)" />
            <line x1="0" y1="0" x2="200" y2="0" stroke="#CBD5E1" strokeWidth="1.2" />
            <line x1="0" y1="0" x2="0" y2="200" stroke="#CBD5E1" strokeWidth="1.2" />
            <path d="M 0 10 L 0 0 L 10 0 M 190 0 L 200 0 L 200 10 M 200 190 L 200 200 L 190 200 M 10 200 L 0 200 L 0 190" stroke="#94A3B8" strokeWidth="1" />
          </pattern>

          {/* Thermal Dynamic Gradients */}
          <linearGradient id="heatGlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="50%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          <linearGradient id="quenchCoolGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="metalBodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="50%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Marker Arrows for Engineering Dimensions */}
          <marker id="dimArrowStart" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 10 2 L 2 5 L 10 8 z" fill="#0A192F" />
          </marker>
          <marker id="dimArrowEnd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 2 L 8 5 L 0 8 z" fill="#0A192F" />
          </marker>
          <marker id="dimArrowOrange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 2 L 8 5 L 0 8 z" fill="#FF6B00" />
          </marker>
        </defs>

        {/* ============================================================ */}
        {/* BASE BACKGROUND & TECHNICAL GRID */}
        {/* ============================================================ */}
        <rect width="1600" height="900" fill="#FBFDFE" />
        <rect width="1600" height="900" fill="url(#majorCadGrid)" opacity="0.65" />

        {/* Outer Blueprint Drawing Border */}
        <rect x="30" y="30" width="1540" height="840" stroke="#0A192F" strokeWidth="1.5" strokeDasharray="12 4 4 4" opacity="0.4" />

        {/* 9:16 Mobile Center Safe Zone Guide Lines (Extremely subtle, dashed) */}
        <line x1="547" y1="30" x2="547" y2="870" stroke="#E2E8F0" strokeWidth="0.75" strokeDasharray="4 4" />
        <line x1="1053" y1="30" x2="1053" y2="870" stroke="#E2E8F0" strokeWidth="0.75" strokeDasharray="4 4" />

        {/* ============================================================ */}
        {/* SCENE 01: ENGINEERING DRAWING (CAD SKETCH PROGRESSIVE REVEAL) */}
        {/* ============================================================ */}
        {time < 3.0 && (
          <g id="scene01" opacity={time < 2.5 ? 1 : (3.0 - time) * 2}>
            {/* Gear Line Art Draft on Left */}
            <g transform="translate(380, 450) scale(0.95)" opacity={Math.min(1, p1 * 2)}>
              <circle cx="0" cy="0" r="140" stroke="#0A192F" strokeWidth="1.5" strokeDasharray="6 3" />
              <circle cx="0" cy="0" r="110" stroke="#0A192F" strokeWidth="2" strokeDasharray={880} strokeDashoffset={880 * (1 - p1)} />
              <circle cx="0" cy="0" r="50" stroke="#0A192F" strokeWidth="1.5" />
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const x1 = 110 * Math.cos(angle);
                const y1 = 110 * Math.sin(angle);
                const x2 = 135 * Math.cos(angle);
                const y2 = 135 * Math.sin(angle);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FF6B00" strokeWidth="2" strokeDasharray="30" strokeDashoffset={30 * (1 - p1)} />;
              })}
            </g>

            {/* Bearing Line Art Draft on Right */}
            <g transform="translate(1220, 450) scale(0.9)" opacity={Math.min(1, p1 * 1.8)}>
              <circle cx="0" cy="0" r="120" stroke="#0A192F" strokeWidth="2" strokeDasharray={754} strokeDashoffset={754 * (1 - p1)} />
              <circle cx="0" cy="0" r="80" stroke="#0A192F" strokeWidth="1.5" />
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * 45 * Math.PI) / 180;
                const cx = 100 * Math.cos(angle);
                const cy = 100 * Math.sin(angle);
                return <circle key={i} cx={cx} cy={cy} r="14" stroke="#0A192F" strokeWidth="1.5" fill="#F8FAFC" />;
              })}
            </g>

            {/* Center Subject Progressive Drafting (The Pinion Gear Shaft) */}
            <g transform="translate(800, 450)">
              {/* Progressive Center Pinion Shaft Lines */}
              <rect
                x="-220"
                y="-60"
                width="440"
                height="120"
                rx="4"
                stroke="#0A192F"
                strokeWidth="2.5"
                strokeDasharray="1120"
                strokeDashoffset={1120 * (1 - p1)}
                fill="#FFFFFF"
              />
              <line x1="-150" y1="-60" x2="-150" y2="60" stroke="#0A192F" strokeWidth="1.5" strokeDasharray="4 2" />
              <line x1="80" y1="-60" x2="80" y2="60" stroke="#0A192F" strokeWidth="1.5" strokeDasharray="4 2" />

              {/* Pinion Gear Tooth Profile Section */}
              <rect x="-60" y="-80" width="120" height="160" stroke="#0A192F" strokeWidth="2" strokeDasharray="560" strokeDashoffset={560 * (1 - p1)} fill="#F8FAFC" />
              {[-50, -25, 0, 25, 50].map((gx, idx) => (
                <line key={idx} x1={gx} y1="-80" x2={gx} y2="80" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 2" />
              ))}

              {/* Center Axis Line */}
              <line x1="-280" y1="0" x2="280" y2="0" stroke="#DC2626" strokeWidth="1" strokeDasharray="16 4 4 4" opacity={p1} />
            </g>
          </g>
        )}

        {/* ============================================================ */}
        {/* SCENE 02: RAW METAL COMPONENT (SCHEMATICS) */}
        {/* ============================================================ */}
        {time >= 2.3 && time < 5.3 && (
          <g id="scene02" opacity={time < 2.5 ? (time - 2.3) * 5 : time > 5.0 ? (5.3 - time) * 3.33 : 1}>
            <g transform="translate(800, 430)">
              {/* Component Solid Body */}
              <rect x="-240" y="-55" width="480" height="110" rx="3" fill="url(#metalBodyGradient)" stroke="#0A192F" strokeWidth="2.5" />

              {/* Center Stepped Gear Portion */}
              <rect x="-70" y="-80" width="140" height="160" rx="2" fill="#E2E8F0" stroke="#0A192F" strokeWidth="2" />
              {/* Splines / Teeth lines */}
              {[-50, -25, 0, 25, 50].map((x, i) => (
                <line key={i} x1={x} y1="-80" x2={x} y2="80" stroke="#0A192F" strokeWidth="1.5" />
              ))}

              {/* Bearing Journal Stepped Sections */}
              <line x1="-160" y1="-55" x2="-160" y2="55" stroke="#0A192F" strokeWidth="2" />
              <line x1="150" y1="-55" x2="150" y2="55" stroke="#0A192F" strokeWidth="2" />

              {/* Dimension Leader Lines */}
              <g opacity={Math.min(1, p2 * 1.5)}>
                <line x1="-240" y1="85" x2="240" y2="85" stroke="#0A192F" strokeWidth="1.5" markerStart="url(#dimArrowStart)" markerEnd="url(#dimArrowEnd)" />
                <line x1="-240" y1="58" x2="-240" y2="100" stroke="#64748B" strokeWidth="1" />
                <line x1="240" y1="58" x2="240" y2="100" stroke="#64748B" strokeWidth="1" />

                <line x1="270" y1="-55" x2="270" y2="55" stroke="#0A192F" strokeWidth="1.5" markerStart="url(#dimArrowStart)" markerEnd="url(#dimArrowEnd)" />
                <line x1="245" y1="-55" x2="290" y2="-55" stroke="#64748B" strokeWidth="1" />
                <line x1="245" y1="55" x2="290" y2="55" stroke="#64748B" strokeWidth="1" />
              </g>

              {/* Transition Arrow Pointing toward Furnace */}
              <g transform="translate(0, 160)" opacity={Math.max(0, (p2 - 0.4) * 1.6)}>
                <line x1="-80" y1="0" x2="80" y2="0" stroke="#FF6B00" strokeWidth="2.5" markerEnd="url(#dimArrowOrange)" />
              </g>
            </g>
          </g>
        )}

        {/* ============================================================ */}
        {/* SCENE 03: INDUSTRIAL FURNACE (ENTRY & CHAMBER SEAL) */}
        {/* ============================================================ */}
        {time >= 4.8 && time < 7.8 && (
          <g id="scene03" opacity={time < 5.0 ? (time - 4.8) * 5 : time > 7.5 ? (7.8 - time) * 3.33 : 1}>
            <g transform="translate(800, 450)">
              {/* Outer Sealed Quench Furnace Frame */}
              <rect x="-420" y="-260" width="840" height="520" rx="8" fill="#F8FAFC" stroke="#0A192F" strokeWidth="3" />
              
              {/* Structural I-Beams & Reinforcements */}
              <line x1="-420" y1="-160" x2="420" y2="-160" stroke="#0A192F" strokeWidth="1.5" />
              <line x1="-420" y1="180" x2="420" y2="180" stroke="#0A192F" strokeWidth="1.5" />
              <line x1="-200" y1="-260" x2="-200" y2="260" stroke="#0A192F" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="200" y1="-260" x2="200" y2="260" stroke="#0A192F" strokeWidth="1.5" strokeDasharray="4 4" />

              {/* Inner Heated Chamber */}
              <rect x="-260" y="-140" width="520" height="280" rx="4" fill="#FFFFFF" stroke="#0A192F" strokeWidth="2" />

              {/* Ceramic Heating Resistance Coils along walls */}
              {[-120, -60, 0, 60, 120].map((y, i) => (
                <g key={i}>
                  <path d={`M -250 ${y} Q -240 ${y-10} -230 ${y} T -210 ${y}`} stroke="#FF6B00" strokeWidth="2" />
                  <path d={`M 210 ${y} Q 220 ${y-10} 230 ${y} T 250 ${y}`} stroke="#FF6B00" strokeWidth="2" />
                </g>
              ))}

              {/* Component translating into the furnace */}
              {/* Component position moves from x = -500 to x = 0 */}
              <g transform={`translate(${p3 < 0.6 ? -300 + p3 * 500 : 0}, 0)`}>
                <rect x="-160" y="-35" width="320" height="70" rx="2" fill="url(#metalBodyGradient)" stroke="#0A192F" strokeWidth="2" />
                <rect x="-45" y="-55" width="90" height="110" rx="2" fill="#E2E8F0" stroke="#0A192F" strokeWidth="1.5" />
              </g>

              {/* Insulated Vertical Pneumatic Door */}
              {/* Door opens up (p3: 0 -> 0.4) and seals down (p3: 0.6 -> 0.9) */}
              <g transform={`translate(-260, ${p3 < 0.4 ? -140 - p3 * 250 : p3 < 0.6 ? -240 : -240 + (p3 - 0.6) * 333})`}>
                <rect x="-20" y="0" width="40" height="280" fill="#E2E8F0" stroke="#0A192F" strokeWidth="2.5" />
                <line x1="0" y1="20" x2="0" y2="260" stroke="#FF6B00" strokeWidth="2" strokeDasharray="8 4" />
                <circle cx="0" cy="140" r="8" fill="#0A192F" />
              </g>

              {/* Control Panel Graphical Indicator on Right (Clean, no text) */}
              <g transform="translate(280, -220)">
                <rect x="0" y="0" width="80" height="120" rx="4" fill="#0A192F" stroke="#0A192F" />
                <circle cx="40" cy="30" r="10" fill="#10B981" />
                <circle cx="40" cy="60" r="10" fill="#F59E0B" />
                <circle cx="40" cy="90" r="10" fill="#FF6B00" />
              </g>
            </g>
          </g>
        )}

        {/* ============================================================ */}
        {/* SCENE 04: CONTROLLED HEATING (600°C -> 850°C THERMAL GLOW) */}
        {/* ============================================================ */}
        {time >= 7.3 && time < 10.5 && (
          <g id="scene04" opacity={time < 7.5 ? (time - 7.3) * 5 : time > 10.2 ? (10.5 - time) * 3.33 : 1}>
            <g transform="translate(800, 450)">
              {/* Chamber Heated Backdrop with subtle heat tint */}
              <rect x="-380" y="-220" width="760" height="440" rx="6" fill="#FFFBEB" stroke="#0A192F" strokeWidth="2.5" />

              {/* Glowing Heating Coils on left and right */}
              {[-160, -80, 0, 80, 160].map((y, i) => (
                <g key={i}>
                  <path d={`M -370 ${y} Q -350 ${y-15} -330 ${y} T -290 ${y}`} stroke="#DC2626" strokeWidth="3" />
                  <path d={`M 290 ${y} Q 310 ${y-15} 330 ${y} T 370 ${y}`} stroke="#DC2626" strokeWidth="3" />
                </g>
              ))}

              {/* Flowing Convective Heat Streamlines (Orange & Red Vector Waves) */}
              {[-120, -60, 60, 120].map((y, i) => (
                <path
                  key={i}
                  d={`M -260 ${y} Q 0 ${y + (i % 2 === 0 ? 30 : -30)} 260 ${y}`}
                  stroke="#FF6B00"
                  strokeWidth="2"
                  strokeDasharray="16 8"
                  strokeDashoffset={-time * 60}
                  opacity="0.8"
                />
              ))}

              {/* Component Gradually Transforming from Steel Gray -> Amber -> Glowing Hot Orange */}
              <g id="heatingComponent">
                {/* Outer Thermal Heat Aura (Controlled vector stroke) */}
                <rect
                  x="-235"
                  y="-60"
                  width="470"
                  height="120"
                  rx="6"
                  stroke="#FF6B00"
                  strokeWidth={2 + p4 * 3}
                  opacity={0.3 + p4 * 0.7}
                  strokeDasharray="8 4"
                />

                {/* Main Pinion Body (Color interpolation) */}
                <rect
                  x="-220"
                  y="-50"
                  width="440"
                  height="100"
                  rx="4"
                  fill={p4 < 0.3 ? "#E2E8F0" : p4 < 0.7 ? "#FB923C" : "url(#heatGlowGradient)"}
                  stroke="#0A192F"
                  strokeWidth="2.5"
                />

                {/* Center Gear Portion */}
                <rect
                  x="-65"
                  y="-75"
                  width="130"
                  height="150"
                  rx="3"
                  fill={p4 < 0.3 ? "#CBD5E1" : p4 < 0.7 ? "#F97316" : "#DC2626"}
                  stroke="#0A192F"
                  strokeWidth="2"
                />
                {[-45, -20, 5, 30].map((x, i) => (
                  <line key={i} x1={x} y1="-75" x2={x} y2="75" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
                ))}
              </g>
            </g>
          </g>
        )}

        {/* ============================================================ */}
        {/* SCENE 05: SOAKING (TEMPERATURE STABILIZATION) */}
        {/* ============================================================ */}
        {time >= 10.0 && time < 13.1 && (
          <g id="scene05" opacity={time < 10.2 ? (time - 10.0) * 5 : time > 12.8 ? (13.1 - time) * 3.33 : 1}>
            <g transform="translate(800, 450)">
              {/* Soaking Chamber Frame */}
              <rect x="-440" y="-240" width="880" height="480" rx="8" fill="#FFFDF8" stroke="#0A192F" strokeWidth="2.5" />

              {/* Stabilized Hot Component */}
              <rect x="-210" y="-45" width="420" height="90" rx="4" fill="url(#heatGlowGradient)" stroke="#0A192F" strokeWidth="2.5" />
              <rect x="-60" y="-70" width="120" height="140" rx="3" fill="#DC2626" stroke="#0A192F" strokeWidth="2" />
              
              {/* Carbon Atom Diffusion Ingress Arrows */}
              {[-150, -100, 100, 150].map((x, i) => (
                <g key={i}>
                  <line x1={x} y1="-75" x2={x} y2="-50" stroke="#FF6B00" strokeWidth="2" markerEnd="url(#dimArrowOrange)" />
                  <line x1={x} y1="75" x2={x} y2="50" stroke="#FF6B00" strokeWidth="2" markerEnd="url(#dimArrowOrange)" />
                </g>
              ))}

              {/* Real-Time Pyrometric Soak Graph (Clean Vector Curve) */}
              <g transform="translate(-170, 120)">
                <rect x="0" y="0" width="340" height="70" fill="#0A192F" rx="4" stroke="#0A192F" />
                <line x1="30" y1="55" x2="310" y2="55" stroke="#334155" strokeWidth="1" />
                <line x1="30" y1="55" x2="30" y2="15" stroke="#334155" strokeWidth="1" />
                <path d="M 30 50 L 110 25 L 310 25" stroke="#FF6B00" strokeWidth="2.5" fill="none" />
                <circle cx={110 + p5 * 180} cy="25" r="4" fill="#10B981" />
              </g>
            </g>
          </g>
        )}

        {/* ============================================================ */}
        {/* SCENE 06: QUENCHING (HOT ORANGE -> AGITATED BLUE OIL COOLING) */}
        {/* ============================================================ */}
        {time >= 12.6 && time < 15.9 && (
          <g id="scene06" opacity={time < 12.8 ? (time - 12.6) * 5 : time > 15.6 ? (15.9 - time) * 3.33 : 1}>
            <g transform="translate(800, 450)">
              {/* Quench Tank Shell */}
              <rect x="-420" y="-180" width="840" height="420" rx="6" fill="#F0F9FF" stroke="#0A192F" strokeWidth="2.5" />
              
              {/* Oil Level Line */}
              <line x1="-420" y1="-100" x2="420" y2="-100" stroke="#0284C7" strokeWidth="2" strokeDasharray="8 4" />

              {/* Hydrodynamic Streamlines */}
              {[-60, -20, 20, 60, 100, 140].map((y, i) => (
                <path
                  key={i}
                  d={`M -380 ${y} Q 0 ${y + (i % 2 === 0 ? 25 : -25)} 380 ${y}`}
                  stroke="#38BDF8"
                  strokeWidth={2}
                  strokeDasharray="20 10"
                  strokeDashoffset={time * 90}
                  opacity="0.8"
                />
              ))}

              {/* Component descending and rapidly cooling */}
              <g transform="translate(0, 0)">
                <rect
                  x="-210"
                  y="-45"
                  width="420"
                  height="90"
                  rx="4"
                  fill={p6 < 0.4 ? "url(#heatGlowGradient)" : p6 < 0.7 ? "#0284C7" : "#0A192F"}
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                />
                <rect
                  x="-60"
                  y="-70"
                  width="120"
                  height="140"
                  rx="3"
                  fill={p6 < 0.4 ? "#DC2626" : p6 < 0.7 ? "#0369A1" : "#0A192F"}
                  stroke="#38BDF8"
                  strokeWidth="2"
                />

                {/* Quench vapor bubble / turbulence vector dots */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <circle
                    key={i}
                    cx={-150 + i * 45}
                    cy={-50 - (i % 3) * 12}
                    r={3 + (i % 3)}
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                    fill="none"
                  />
                ))}
              </g>
            </g>
          </g>
        )}

        {/* ============================================================ */}
        {/* SCENE 07: TEMPERING (CONTROLLED STRESS-RELIEF CYCLE) */}
        {/* ============================================================ */}
        {time >= 15.4 && time < 18.5 && (
          <g id="scene07" opacity={time < 15.6 ? (time - 15.4) * 5 : time > 18.2 ? (18.5 - time) * 3.33 : 1}>
            <g transform="translate(800, 450)">
              {/* Secondary Tempering Furnace */}
              <rect x="-420" y="-220" width="840" height="440" rx="8" fill="#FFFDF8" stroke="#0A192F" strokeWidth="2.5" />

              {/* Soft Warm Amber Tempering Thermal Rays */}
              {[-80, 0, 80].map((y, i) => (
                <line key={i} x1="-360" y1={y} x2="360" y2={y} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="12 6" strokeDashoffset={-time * 30} />
              ))}

              {/* Component in Toughness Equilibrium */}
              <rect x="-210" y="-45" width="420" height="90" rx="4" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
              <rect x="-60" y="-70" width="120" height="140" rx="3" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />

              {/* Toughness Stress-Relief Wave */}
              <circle cx="0" cy="0" r={40 + p7 * 140} stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 3" opacity={1 - p7 * 0.7} fill="none" />
            </g>
          </g>
        )}

        {/* ============================================================ */}
        {/* SCENE 08: QUALITY INSPECTION (DIAMOND INDENTER & MICROMETER) */}
        {/* ============================================================ */}
        {time >= 18.0 && time < 21.1 && (
          <g id="scene08" opacity={time < 18.2 ? (time - 18.0) * 5 : time > 20.8 ? (21.1 - time) * 3.33 : 1}>
            <g transform="translate(800, 450)">
              {/* Granite Inspection Base Table */}
              <rect x="-420" y="60" width="840" height="180" rx="4" fill="#F1F5F9" stroke="#0A192F" strokeWidth="2.5" />

              {/* Component Resting on V-Blocks */}
              <path d="M -160 60 L -140 20 L -120 60 Z" fill="#CBD5E1" stroke="#0A192F" strokeWidth="1.5" />
              <path d="M 120 60 L 140 20 L 160 60 Z" fill="#CBD5E1" stroke="#0A192F" strokeWidth="1.5" />

              <rect x="-210" y="-35" width="420" height="70" rx="3" fill="#E2E8F0" stroke="#0A192F" strokeWidth="2.5" />
              <rect x="-60" y="-55" width="120" height="110" rx="2" fill="#CBD5E1" stroke="#0A192F" strokeWidth="2" />

              {/* Hardness Tester Diamond Indenter Mechanism */}
              <g transform={`translate(-100, ${p8 < 0.5 ? -140 + p8 * 140 : -70})`}>
                <rect x="-15" y="-60" width="30" height="60" fill="#0A192F" stroke="#0A192F" />
                <polygon points="0,15 -10,0 10,0" fill="#FF6B00" stroke="#0A192F" strokeWidth="1.5" />
                <line x1="0" y1="-60" x2="0" y2="-120" stroke="#0A192F" strokeWidth="2" />
              </g>

              {/* Laser Optical Runout Micrometer Scan Line */}
              <g transform="translate(60, 0)">
                <line x1="0" y1="-140" x2="0" y2="60" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 2" />
                <circle cx="0" cy="-35" r="5" fill="#EF4444" />
              </g>
            </g>
          </g>
        )}

        {/* ============================================================ */}
        {/* SCENE 09: TRACEABILITY */}
        {/* ============================================================ */}
        {time >= 20.6 && time < 23.4 && (
          <g id="scene09" opacity={time < 20.8 ? (time - 20.6) * 5 : time > 23.2 ? (23.4 - time) * 5 : 1}>
            <g transform="translate(800, 450)">
              {/* Flowing Glowing Traceability Line Connecting Sequential Nodes */}
              <path
                d="M -480 0 L -320 0 L -160 0 L 0 0 L 160 0 L 320 0 L 480 0"
                stroke="#FF6B00"
                strokeWidth="3"
                strokeDasharray="12 6"
                strokeDashoffset={-time * 50}
              />

              {/* Sequential Traceability Nodes */}
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const nodeActive = p9 > (i / 6);
                return (
                  <g key={i} transform={`translate(${-450 + i * 180}, 0)`}>
                    <circle
                      cx="0"
                      cy="0"
                      r="16"
                      fill={nodeActive ? "#0A192F" : "#FFFFFF"}
                      stroke="#FF6B00"
                      strokeWidth={nodeActive ? 3 : 1.5}
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="6"
                      fill={nodeActive ? "#FF6B00" : "#CBD5E1"}
                    />
                  </g>
                );
              })}
            </g>
          </g>
        )}

        {/* ============================================================ */}
        {/* SCENE 10: BRAND REVEAL & SEAMLESS TRANSITION TO SCENE 01 */}
        {/* ============================================================ */}
        {time >= 23.0 && (
          <g id="scene10" opacity={time < 23.2 ? (time - 23.0) * 5 : time > 24.6 ? (25.0 - time) * 2.5 : 1}>
            <g transform="translate(800, 450)">
              {/* Converging Vector Lines drafting Logo */}
              <circle cx="0" cy="0" r="80" stroke="#0A192F" strokeWidth="1.5" strokeDasharray="4 2" />
              <circle cx="0" cy="0" r="120" stroke="#FF6B00" strokeWidth="1" strokeDasharray="8 4" />

              {/* Official Brand Logo Drawing Box */}
              <rect x="-160" y="-75" width="320" height="150" fill="#FFFFFF" stroke="#0A192F" strokeWidth="2" rx="4" />

              {/* Authentic MATHEAT Flame Art */}
              <g transform="translate(-110, -10) scale(1.1)">
                <path d="M 0 0 L 15 -35 L 30 0 L 30 -35 L 45 0" stroke="#0A192F" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="15" cy="-12" r="5" fill="#FF6B00" />
              </g>

              <text x="-35" y="-15" fill="#0A192F" fontSize="32" fontWeight="bold" letterSpacing="1">
                MATHEAT
              </text>
              <text x="-35" y="10" fill="#64748B" fontSize="14" fontWeight="bold" letterSpacing="3">
                PVT. LTD.
              </text>

              {/* Seamless Sweeping Heat Line to Reset into Scene 01 Grid */}
              <line
                x1="-700"
                y1="140"
                x2={-700 + p10 * 1400}
                y2="140"
                stroke="#FF6B00"
                strokeWidth="2"
                opacity={0.8}
              />
            </g>
          </g>
        )}

      </svg>

      {/* ============================================================ */}
      {/* DISCREET MINIMAL CONTROLS (No Scrubber, No Process Names) */}
      {/* ============================================================ */}
      {showControls && (
        <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 sm:gap-2 z-20 opacity-70 hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 sm:p-2 rounded-full bg-navy-950/80 hover:bg-heat-orange text-white border border-slate-700/80 transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-sm"
            title={isPlaying ? "Pause animation" : "Play animation"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setTime(0)}
            className="p-1.5 sm:p-2 rounded-full bg-navy-950/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-sm"
            title="Reset animation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-full bg-navy-950/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-sm"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Flame, ShieldAlert, VolumeX, Eye } from 'lucide-react';

/**
 * Cinematic, Photorealistic Industrial Heat-Treatment Factory Video
 * for MATHEAT PVT. LTD.
 *
 * 16:9 4K Cinema Engine
 * Continuous 28.0s seamless sequence matching all 11 scenes:
 *   Scene 1: Industrial Factory Intro (Wide shot, heavy steel, gas lines)
 *   Scene 2: Furnace Close-Up (Thick insulated door, burner ports, pyrometry)
 *   Scene 3: Real Flames Combustion (Gas burner flames shooting across refractory brick)
 *   Scene 4: Glowing Metal (Gears & pinion shafts glowing red-hot at 850°C)
 *   Scene 5: Furnace in Operation (Door cracked, intense heat waves & air movement)
 *   Scene 6: Industrial Loading (Charge tray entering chamber, light escaping seals)
 *   Scene 7: Burner Close-Up (Slow-motion gas nozzle combustion)
 *   Scene 8: Heat Treatment Process (Continuous pyrometric monitoring & gas control)
 *   Scene 9: Controlled Oil Quenching (Red-hot steel lowered into agitated oil, billowing steam)
 *   Scene 10: Finished Component (Macro glide over precision-hardened gears & bearings)
 *   Scene 11: MATHEAT Brand Ending (Cinematic pull-back with glowing furnace & official logo)
 */

export default function CinematicFactoryVideo({
  autoPlay = true,
  showControls = true,
  className = "",
  heroMode = false
}) {
  const TOTAL_DURATION = 28.0; // seconds

  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHUD, setShowHUD] = useState(true);

  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);

  // 11 Scenes breakdown - Each has a distinct, 100% unique photorealistic 4K cinematic asset
  const scenes = [
    { id: 1, name: "Factory Floor", range: [0.0, 2.5], title: "01 // INDUSTRIAL FACTORY INTRO", image: "/cinematic/scene_01_factory_intro.jpg", temp: 25 },
    { id: 2, name: "Furnace Unit", range: [2.5, 5.0], title: "02 // SEALED-QUENCH FURNACE CLOSE-UP", image: "/cinematic/scene_02_furnace_closeup.jpg", temp: 150 },
    { id: 3, name: "Real Flames", range: [5.0, 7.5], title: "03 // GAS BURNER FLAME COMBUSTION", image: "/cinematic/scene_03_real_flames.jpg", temp: 650 },
    { id: 4, name: "Glowing Metal", range: [7.5, 10.0], title: "04 // RED-HOT STEEL TRANSFORMATION", image: "/cinematic/scene_04_glowing_metal.jpg", temp: 820 },
    { id: 5, name: "Thermal Soak", range: [10.0, 12.5], title: "05 // FURNACE THERMAL EQUILIBRIUM", image: "/cinematic/scene_05_furnace_operation.jpg", temp: 850 },
    { id: 6, name: "Batch Charge", range: [12.5, 15.0], title: "06 // INDUSTRIAL BASKET LOADING", image: "/cinematic/scene_06_basket_loading.jpg", temp: 850 },
    { id: 7, name: "Burner Macro", range: [15.0, 17.5], title: "07 // COMBUSTION NOZZLE ENVELOPE", image: "/cinematic/scene_07_burner_macro.jpg", temp: 850 },
    { id: 8, name: "Process Control", range: [17.5, 20.0], title: "08 // CLOSED-LOOP PYROMETRIC GOVERNANCE", image: "/cinematic/scene_08_process_control.jpg", temp: 850 },
    { id: 9, name: "Oil Quenching", range: [20.0, 23.0], title: "09 // CONTROLLED AGITATED OIL QUENCH", image: "/cinematic/scene_09_oil_quench.jpg", temp: 65 },
    { id: 10, name: "Finished Parts", range: [23.0, 25.5], title: "10 // PRECISION TREATED COMPONENTS", image: "/cinematic/scene_10_finished_parts.jpg", temp: 25 },
    { id: 11, name: "Brand Reveal", range: [25.5, 28.0], title: "11 // MATHEAT PVT. LTD.", image: "/cinematic/scene_11_brand_ending.jpg", temp: 25 },
  ];

  // Active scene calculation
  const currentSceneIndex = scenes.findIndex(
    s => time >= s.range[0] && time < s.range[1]
  );
  const activeScene = scenes[currentSceneIndex >= 0 ? currentSceneIndex : 0];

  // 60FPS animation loop
  useEffect(() => {
    const update = (now) => {
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

      animFrameRef.current = requestAnimationFrame(update);
    };

    animFrameRef.current = requestAnimationFrame(update);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setTime(pos * TOTAL_DURATION);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Dynamic values
  const flameFlicker = Math.sin(time * 18) * 0.12 + Math.cos(time * 31) * 0.08;

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden border-2 border-slate-600 shadow-2xl select-none group font-sans ${className}`}
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      {/* SVG Turbulence Filter for Real Thermodynamic Heat Haze Distortion */}
      <svg className="hidden">
        <defs>
          <filter id="heatHazeFilter" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015 0.04"
              numOctaves="2"
              result="noise"
              seed={Math.floor(time * 10) % 100}
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={activeScene.temp > 600 ? 12 : 0}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* ============================================================ */}
      {/* 11 UNIQUE CINEMATIC SCENE FOOTAGE LAYERS (NO REPEATS) */}
      {/* ============================================================ */}
      {scenes.map((s) => {
        const isActive = activeScene.id === s.id;
        return (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover transform transition-transform duration-[6000ms] ease-out"
              style={{
                filter: s.temp > 600 ? "url(#heatHazeFilter)" : "none",
                transform: isActive
                  ? s.id === 2
                    ? "scale(1.15) translate(-1%, -1%)"
                    : s.id === 7
                    ? "scale(1.22) translate(2%, -1%)"
                    : s.id === 8
                    ? "scale(1.08) translate(-1%, 1%)"
                    : s.id === 10
                    ? "scale(1.12) translate(-2%, 0%)"
                    : "scale(1.05) translate(0%, 0%)"
                  : "scale(1.01)"
              }}
            />
          </div>
        );
      })}

      {/* ============================================================ */}
      {/* ATMOSPHERIC HEAT DISTORTION & LIGHT PULSATION OVERLAYS */}
      {/* ============================================================ */}

      {/* Dynamic Volumetric Heat Lighting Glow (illuminating factory walls) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: "radial-gradient(ellipse at 75% 50%, rgba(255, 107, 0, 0.28) 0%, rgba(220, 38, 38, 0.12) 50%, transparent 80%)",
          opacity: 0.6 + flameFlicker * 2
        }}
      />

      {/* Cinematic Film Vignette & Left-Side Negative Space Shading */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: heroMode
            ? "linear-gradient(to right, rgba(10, 25, 47, 0.85) 0%, rgba(10, 25, 47, 0.4) 45%, transparent 75%)"
            : "linear-gradient(to right, rgba(0, 0, 0, 0.45) 0%, transparent 40%, transparent 70%, rgba(0, 0, 0, 0.4) 100%)"
        }}
      />

      {/* Top & Bottom Cinematic Letterbox Tint */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

      {/* ============================================================ */}
      {/* DISCREET MINIMAL CONTROLS (No Scrubber, No Process Names) */}
      {/* ============================================================ */}
      {showControls && (
        <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 sm:gap-2 z-20 opacity-70 hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 sm:p-2 rounded-full bg-navy-950/80 hover:bg-heat-orange text-white border border-slate-700/80 transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-sm"
            title={isPlaying ? "Pause footage" : "Play footage"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setTime(0)}
            className="p-1.5 sm:p-2 rounded-full bg-navy-950/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-sm"
            title="Rewind to start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-full bg-navy-950/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-sm"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}

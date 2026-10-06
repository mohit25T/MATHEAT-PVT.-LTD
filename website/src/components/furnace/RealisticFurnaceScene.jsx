import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Thermometer } from 'lucide-react';
import FurnaceBody from './FurnaceBody';
import FurnaceDoor from './FurnaceDoor';
import FurnaceFlames from './FurnaceFlames';
import HotComponent from './HotComponent';
import QuenchTank from './QuenchTank';
import ControlPanel from './ControlPanel';
import SparksAndHaze from './SparksAndHaze';
import '../../styles/furnace.css';

/**
 * RealisticFurnaceScene — Full HD 1080p Ultra-Smooth Showcase
 * Features:
 * 1. C^2 Continuous Perlin Smootherstep interpolation (zero velocity & zero acceleration jump)
 * 2. Multi-layer metallurgical cross-fade (raw -> red-hot -> incandescent 850°C -> dark martensite)
 * 3. Perfect non-colliding continuous conveyor flow (Batch A exits before Batch B arrives)
 * 4. 100% seamless infinite loop hand-off (mathematically identical at t=30.0s and t=0.0s)
 * 5. Clean, distraction-free display without tracking lines or process labels
 */
export default function RealisticFurnaceScene({
  autoPlay = true,
  showControls = true,
  className = ""
}) {
  const TOTAL_DURATION = 30.0; // seconds per complete industrial loop

  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const animTimeRef = useRef(0);
  const lastTimeRef = useRef(null);

  // Smooth frame-synced timer that pauses and resumes exactly where stopped
  useEffect(() => {
    let animId;

    const update = (now) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        animTimeRef.current = (animTimeRef.current + delta) % TOTAL_DURATION;
        setTime(animTimeRef.current);
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // C^2 Continuous Perlin Smootherstep: 6t^5 - 15t^4 + 10t^3
  // Guarantees zero velocity and zero acceleration at both endpoints for velvety-smooth motion
  const smootherStep = (t, start, end) => {
    if (t <= start) return 0;
    if (t >= end) return 1;
    const x = (t - start) / (end - start);
    return x * x * x * (x * (x * 6 - 15) + 10);
  };

  const lerp = (a, b, t) => a + (b - a) * t;

  // ------------------------------------------------------------
  // 1. DYNAMIC SYSTEM CALCULATIONS (Direct function of time)
  // ------------------------------------------------------------

  // Door Lift Y (0px closed to -490px fully raised)
  // Reaches full open BEFORE component moves; closes AFTER component is clear
  let doorLiftY = 0;
  if (time < 3.5) {
    doorLiftY = 0;
  } else if (time < 6.0) {
    doorLiftY = lerp(0, -490, smootherStep(time, 3.5, 6.0));
  } else if (time < 10.2) {
    doorLiftY = -490;
  } else if (time < 12.5) {
    doorLiftY = lerp(-490, 0, smootherStep(time, 10.2, 12.5));
  } else if (time < 19.5) {
    doorLiftY = 0;
  } else if (time < 21.5) {
    doorLiftY = lerp(0, -490, smootherStep(time, 19.5, 21.5));
  } else if (time < 23.8) {
    doorLiftY = -490;
  } else if (time < 25.5) {
    doorLiftY = lerp(-490, 0, smootherStep(time, 23.8, 25.5));
  } else {
    doorLiftY = 0;
  }

  // Door Slab Opacity: Becomes transparent as temperature increases during heating & 850°C soak
  let doorOpacity = 1.0;
  if (time >= 10.5 && time < 21.0) {
    if (time < 13.5) {
      // Smoothly becomes transparent as temperature ramps up to 850°C
      doorOpacity = lerp(1.0, 0.75, smootherStep(time, 10.5, 13.5));
    } else if (time < 19.5) {
      // Crystal-clear thermal inspection view during full 850°C austenitizing soak
      doorOpacity = 0.75;
    } else {
      // Solidifies smoothly as the door prepares to open for discharge
      doorOpacity = lerp(0.75, 1.0, smootherStep(time, 19.5, 21.0));
    }
  }

  // Flame Intensity (0.45 baseline to 1.0 roaring combustion)
  let flameIntensity = 0.45;
  if (time < 3.5) {
    flameIntensity = 0.45;
  } else if (time < 6.0) {
    flameIntensity = 0.55;
  } else if (time < 10.0) {
    flameIntensity = 0.70;
  } else if (time < 13.0) {
    flameIntensity = lerp(0.70, 1.0, smootherStep(time, 10.0, 13.0));
  } else if (time < 19.5) {
    flameIntensity = 1.0;
  } else if (time < 22.0) {
    flameIntensity = lerp(1.0, 0.45, smootherStep(time, 19.5, 22.0));
  } else {
    flameIntensity = 0.45;
  }

  // Steam Opacity in Quench Tank
  let steamOpacity = 0;
  if (time >= 24.0 && time < 26.5) {
    if (time < 24.6) {
      steamOpacity = lerp(0, 0.95, smootherStep(time, 24.0, 24.6));
    } else {
      steamOpacity = lerp(0.95, 0, smootherStep(time, 24.6, 26.5));
    }
  }

  // Batch A: Multi-Layer Metallurgical Cross-Fade Glows
  let batchAHeatGlow = 0;
  let batchASoakGlow = 0;
  let batchAHardenedGlow = 0;
  let batchAAura = 0;

  // Heat Glow (Cherry Red)
  if (time >= 11.5 && time < 25.2) {
    if (time < 14.5) {
      batchAHeatGlow = lerp(0, 1.0, smootherStep(time, 11.5, 14.5));
    } else if (time < 24.5) {
      batchAHeatGlow = 1.0;
    } else {
      batchAHeatGlow = lerp(1.0, 0, smootherStep(time, 24.5, 25.2));
    }
  }

  // Soak Glow (Incandescent 850°C Golden-White)
  if (time >= 14.5 && time < 24.8) {
    if (time < 17.0) {
      batchASoakGlow = lerp(0, 1.0, smootherStep(time, 14.5, 17.0));
    } else if (time < 24.2) {
      batchASoakGlow = 1.0;
    } else {
      batchASoakGlow = lerp(1.0, 0, smootherStep(time, 24.2, 24.8));
    }
  }

  // Radiant Heat Bloom Aura
  if (time >= 13.0 && time < 24.6) {
    if (time < 16.5) {
      batchAAura = lerp(0, 0.85, smootherStep(time, 13.0, 16.5));
    } else if (time < 23.8) {
      batchAAura = 0.85;
    } else {
      batchAAura = lerp(0.85, 0, smootherStep(time, 23.8, 24.6));
    }
  }

  // Hardened Martensite (Deep Dark Oil-Quenched Steel)
  if (time >= 24.5) {
    if (time < 25.3) {
      batchAHardenedGlow = lerp(0, 1.0, smootherStep(time, 24.5, 25.3));
    } else {
      batchAHardenedGlow = 1.0;
    }
  }

  // Batch A Horizontal Position
  let batchAPosX = 1380;
  if (time < 6.5) {
    batchAPosX = 1380; // Stationary at loading hearth
  } else if (time < 10.0) {
    batchAPosX = lerp(1380, 850, smootherStep(time, 6.5, 10.0)); // Enters furnace smoothly
  } else if (time < 21.5) {
    batchAPosX = 850; // In heating chamber
  } else if (time < 23.8) {
    batchAPosX = lerp(850, 1610, smootherStep(time, 21.5, 23.8)); // Transfers to quench elevator
  } else if (time < 25.8) {
    batchAPosX = 1610; // At quench hoist station
  } else {
    batchAPosX = lerp(1610, 2200, smootherStep(time, 25.8, 28.2)); // Discharges off-screen to the right
  }

  // Batch A Vertical Position (Quench Submersion)
  let batchAPosY = 745;
  if (time >= 24.0 && time < 25.8) {
    if (time < 24.8) {
      batchAPosY = lerp(745, 875, smootherStep(time, 24.0, 24.8));
    } else if (time < 25.2) {
      batchAPosY = 875;
    } else {
      batchAPosY = lerp(875, 745, smootherStep(time, 25.2, 25.8));
    }
  }

  // Batch A Opacity (fades out as it leaves right boundary, completely gone by 28.2s)
  let batchAOpacity = 1.0;
  if (time >= 27.5) {
    batchAOpacity = lerp(1.0, 0, smootherStep(time, 27.5, 28.2));
  }

  // Batch B: Next Incoming Fresh Raw Batch
  // Begins entry at 27.6s (after Batch A has cleared past x=1950 and exited)
  let batchBPosX = 2100;
  let batchBPosY = 745;
  let batchBOpacity = 0;

  if (time >= 27.6) {
    batchBPosX = lerp(2100, 1380, smootherStep(time, 27.6, 29.5));
    batchBOpacity = lerp(0, 1.0, smootherStep(time, 27.6, 28.0));
  }

  // Temperature (Refractory Chamber Pyrometry)
  let currentTemp = 350;
  if (time < 3.5) {
    currentTemp = 350;
  } else if (time < 6.0) {
    currentTemp = lerp(350, 550, smootherStep(time, 3.5, 6.0));
  } else if (time < 10.0) {
    currentTemp = lerp(550, 650, smootherStep(time, 6.0, 10.0));
  } else if (time < 13.0) {
    currentTemp = lerp(650, 850, smootherStep(time, 10.0, 13.0));
  } else if (time < 19.5) {
    currentTemp = 850;
  } else if (time < 22.0) {
    currentTemp = lerp(850, 830, smootherStep(time, 19.5, 22.0));
  } else if (time < 24.5) {
    currentTemp = lerp(830, 65, smootherStep(time, 22.5, 24.5));
  } else if (time < 27.5) {
    currentTemp = 65;
  } else if (time < 29.5) {
    currentTemp = lerp(65, 350, smootherStep(time, 27.5, 29.5));
  } else {
    currentTemp = 350;
  }

  // Ambient room glow opacity
  const ambientGlowOpacity = (Math.max(0, -doorLiftY) / 490) * 0.45 + (flameIntensity * 0.25);

  const togglePlayPause = () => {
    lastTimeRef.current = null;
    setIsPlaying(prev => !prev);
  };

  const handleRestart = () => {
    lastTimeRef.current = null;
    animTimeRef.current = 0;
    setTime(0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video bg-[#070B11] rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl select-none group furnace-1080-container ${!isPlaying ? 'is-paused' : ''} ${className}`}
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >

      {/* ------------------------------------------------------------ */}
      {/* 2. AMBIENT ROOM HEAT GLOW */}
      {/* ------------------------------------------------------------ */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-150"
        style={{
          opacity: ambientGlowOpacity,
          background: "radial-gradient(circle at 45% 55%, rgba(255, 106, 0, 0.45) 0%, rgba(220, 38, 38, 0.12) 50%, transparent 75%)"
        }}
      />

      {/* ------------------------------------------------------------ */}
      {/* 3. NATIVE FULL HD 1080p SVG CANVAS (1920 x 1080) */}
      {/* ------------------------------------------------------------ */}
      <svg
        viewBox="0 0 1920 1080"
        className="w-full h-full object-contain"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Realistic industrial heat-treatment furnace continuous simulation"
      >
        <defs>
          {/* Cold Raw Machined Carbon Steel */}
          <linearGradient id="rawSteelGrad1080" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="35%" stopColor="#CBD5E1" />
            <stop offset="70%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>

          {/* Heating Red-Orange Thermal Transition */}
          <linearGradient id="heatingSteelGrad1080" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="35%" stopColor="#FB923C" />
            <stop offset="70%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>

          {/* Oil-Quenched High-Hardness Tempered Martensite Steel */}
          <linearGradient id="hardenedSteelGrad1080" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="30%" stopColor="#1E293B" />
            <stop offset="70%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Hardened Metallic Sheen */}
          <linearGradient id="temperedSheenGrad1080" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#818CF8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="factoryWallGrad1080" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B121A" />
            <stop offset="60%" stopColor="#0F1722" />
            <stop offset="100%" stopColor="#141E2B" />
          </linearGradient>

          <linearGradient id="factoryFloorGrad1080" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="30%" stopColor="#141C27" />
            <stop offset="100%" stopColor="#0A0F16" />
          </linearGradient>

          <radialGradient id="floorHeatReflection1080" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#EA580C" stopOpacity="0.45" />
            <stop offset="85%" stopColor="#991B1B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="steelBeamGrad1080" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="35%" stopColor="#334155" />
            <stop offset="70%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="exhaustStackGrad1080" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="30%" stopColor="#475569" />
            <stop offset="70%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="furnaceCasingGrad1080" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="40%" stopColor="#172230" />
            <stop offset="85%" stopColor="#0E1620" />
            <stop offset="100%" stopColor="#090E15" />
          </linearGradient>

          <linearGradient id="headerBeamGrad1080" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="40%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          <radialGradient id="chamberActiveHeatGrad1080" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#F59E0B" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#EA580C" stopOpacity="0.85" />
            <stop offset="80%" stopColor="#991B1B" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#261005" stopOpacity="0.95" />
          </radialGradient>

          <linearGradient id="flameOuterGrad1080" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#991B1B" />
            <stop offset="60%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="flameMiddleGrad1080" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="60%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#C2410C" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="flameInnerGrad1080" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.7" />
          </linearGradient>

          <radialGradient id="flameSwirlRadialGrad1080" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#EA580C" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#991B1B" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="doorSlabGrad1080" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="30%" stopColor="#1E293B" />
            <stop offset="75%" stopColor="#141E2B" />
            <stop offset="100%" stopColor="#0B1017" />
          </linearGradient>

          <linearGradient id="cylinderGrad1080" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="45%" stopColor="#64748B" />
            <stop offset="75%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          <radialGradient id="viewportFireGrad1080" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="75%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#991B1B" />
          </radialGradient>

          <radialGradient id="hotGearIncandescentGrad1080" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="30%" stopColor="#FDE047" />
            <stop offset="60%" stopColor="#F59E0B" />
            <stop offset="85%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#DC2626" />
          </radialGradient>

          <radialGradient id="gearRadialBloomGrad1080" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD54A" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#FF6A00" stopOpacity="0.5" />
            <stop offset="75%" stopColor="#DC2626" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="quenchTankGrad1080" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="50%" stopColor="#15202E" />
            <stop offset="100%" stopColor="#0B1119" />
          </linearGradient>

          <radialGradient id="quenchSteamGrad1080" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="45%" stopColor="#E2E8F0" stopOpacity="0.45" />
            <stop offset="80%" stopColor="#94A3B8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#64748B" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="controlCabinetGrad1080" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="40%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <radialGradient id="exhaustHazeGrad1080" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#64748B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#334155" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="heatWaveStrokeGrad1080" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#EA580C" stopOpacity="0" />
            <stop offset="30%" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#FEF08A" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#EA580C" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* 1. Main Furnace Body, Refractory Cavity & Floor */}
        <FurnaceBody />

        {/* 2. 4-Burner Organic SVG Combustion Flames */}
        <FurnaceFlames intensity={flameIntensity} />

        {/* 3. Quenching Tank Station with Billowing Steam Plumes */}
        <QuenchTank steamOpacity={steamOpacity} />

        {/* 4. Batch A: Primary Active Batch (Heating -> Austenitizing -> Quenched Hardened -> Discharged Right) */}
        {batchAOpacity > 0 && (
          <HotComponent
            posX={batchAPosX}
            posY={batchAPosY}
            heatGlow={batchAHeatGlow}
            soakGlow={batchASoakGlow}
            hardenedGlow={batchAHardenedGlow}
            auraOpacity={batchAAura}
            opacity={batchAOpacity}
            idPrefix="batchA"
          />
        )}

        {/* 5. Batch B: Next Incoming Fresh Raw Batch (Enters cleanly after Batch A clears) */}
        {batchBOpacity > 0 && (
          <HotComponent
            posX={batchBPosX}
            posY={batchBPosY}
            heatGlow={0}
            soakGlow={0}
            hardenedGlow={0}
            auraOpacity={0}
            opacity={batchBOpacity}
            idPrefix="batchB"
          />
        )}

        {/* 6. Heavy Guillotine Pneumatic Door (In Front of Components with Dynamic High-Temp Transparency) */}
        <FurnaceDoor doorLiftY={doorLiftY} doorOpacity={doorOpacity} />

        {/* 7. SCADA Control Panel Cabinet */}
        <ControlPanel
          temp={currentTemp}
          status="CYCLE ACTIVE"
        />

        {/* 8. Sparks, Embers & Heat Distortion */}
        <SparksAndHaze />
      </svg>

      {/* ------------------------------------------------------------ */}
      {/* 4. DISCREET MINIMAL CONTROLS (Floating Corner Glassmorphism) */}
      {/* ------------------------------------------------------------ */}
      {showControls && (
        <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 sm:gap-2 z-20 opacity-70 hover:opacity-100 transition-opacity">
          <button
            onClick={togglePlayPause}
            className="p-1.5 sm:p-2 rounded-full bg-navy-950/80 hover:bg-heat-orange text-white border border-slate-700/80 transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-sm"
            title={isPlaying ? "Pause Simulation" : "Resume Simulation"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleRestart}
            className="p-1.5 sm:p-2 rounded-full bg-navy-950/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-sm"
            title="Restart Simulation"
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

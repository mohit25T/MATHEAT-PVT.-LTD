import React, { useState, useEffect } from 'react';
import {
  Flame,
  Gauge,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Send,
  Zap,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Thermometer,
  Layers,
  Hash,
  Scale,
  Check,
  Sparkles
} from 'lucide-react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';

export const OperatorPage = () => {
  const { isLight } = useTheme();

  // Furnaces & Batches
  const [furnaces, setFurnaces] = useState(() => {
    const cached = api.cache.get('/furnaces');
    return Array.isArray(cached) ? cached : (cached?.furnaces || cached?.data || []);
  });
  const [selectedFurnaceId, setSelectedFurnaceId] = useState('F-01');
  const [batches, setBatches] = useState(() => {
    const cached = api.cache.get('/batches');
    return Array.isArray(cached) ? cached : (cached?.batches || cached?.data || []);
  });

  // Active run states
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [currentPhase, setCurrentPhase] = useState('LOADING'); // 'LOADING', 'HEATING', 'SOAKING', 'QUENCHING', 'TEMPERING', 'COMPLETE'

  // Temperature and Telemetry Controls (Glove-friendly)
  const [targetTemp, setTargetTemp] = useState(860);
  const [actualTemp, setActualTemp] = useState(858);
  const [targetSoakMins, setTargetSoakMins] = useState(90);
  const [soakElapsedMins, setSoakElapsedMins] = useState(90);
  const [carbonPotential, setCarbonPotential] = useState(0.88);

  // Quench & Transfer
  const [quenchMedium, setQuenchMedium] = useState('QUENCH OIL');
  const [quenchTemp, setQuenchTemp] = useState(62);
  const [transferTimeSec, setTransferTimeSec] = useState(11); // Transfer time door to quench

  // Tempering
  const [temperingTemp, setTemperingTemp] = useState(180);
  const [actualTemperingTemp, setActualTemperingTemp] = useState(182);
  const [temperingMins, setTemperingMins] = useState(120);

  // Output & Reconciliation (Section 21)
  const [inputWeightKg, setInputWeightKg] = useState(100);
  const [inputQty, setInputQty] = useState(10);
  const [outputWeightKg, setOutputWeightKg] = useState(99.5);
  const [acceptedQty, setAcceptedQty] = useState(10);
  const [rejectedQty, setRejectedQty] = useState(0);
  const [scrapWeightKg, setScrapWeightKg] = useState(0);
  const [processLossKg, setProcessLossKg] = useState(0.5);

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [soakTimerWarning, setSoakTimerWarning] = useState('');

  const loadData = async () => {
    try {
      const [fRes, bRes] = await Promise.all([
        api.furnaces.getAll().catch(() => []),
        api.batches.getAll().catch(() => [])
      ]);

      const fList = Array.isArray(fRes) ? fRes : (fRes?.furnaces || fRes?.data || []);
      const bList = Array.isArray(bRes) ? bRes : (bRes?.batches || bRes?.data || []);

      setFurnaces(fList);
      setBatches(bList);

      if (fList.length > 0 && !selectedFurnaceId) {
        setSelectedFurnaceId(fList[0].furnaceId || 'F-01');
      }
    } catch (e) {
      console.warn('Operator data load error:', e.message);
    }
  };

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Filter batches for selected furnace
  const furnaceBatches = batches.filter(
    b => (b.furnace?.furnaceId || b.furnaceId) === selectedFurnaceId || !b.furnaceId
  );

  const currentBatch = batches.find(b => (b.batchId || b._id) === selectedBatchId) || furnaceBatches[0] || batches[0];

  useEffect(() => {
    if (currentBatch) {
      setSelectedBatchId(currentBatch.batchId || currentBatch._id);
      const r = currentBatch.recipe || {};
      const targetT = r.targetTemperature || 860;
      setTargetTemp(targetT);
      setActualTemp(targetT - 2);
      const soakT = r.soakingTimeMinutes || 90;
      setTargetSoakMins(soakT);
      setSoakElapsedMins(soakT);
      setCarbonPotential(r.carbonPotential || 0.88);
      const tempT = r.temperingTemperature || 180;
      setTemperingTemp(tempT);
      setActualTemperingTemp(tempT + 2);
      setTemperingMins(r.temperingTimeMinutes || 120);

      const inWt = currentBatch.inputWeightKg || 100;
      const inQ = currentBatch.inputQuantity || 10;
      setInputWeightKg(inWt);
      setInputQty(inQ);
      setOutputWeightKg(inWt);
      setAcceptedQty(inQ);
      setRejectedQty(0);
      setScrapWeightKg(0);
      setProcessLossKg(0);
      setSubmitSuccess(false);
      setErrorMessage('');
    }
  }, [currentBatch?.batchId, selectedFurnaceId]);

  // Adjusters for temperature
  const adjustActualTemp = (delta) => {
    setActualTemp(prev => Math.max(0, prev + delta));
  };

  const adjustActualTemperingTemp = (delta) => {
    setActualTemperingTemp(prev => Math.max(0, prev + delta));
  };

  const adjustSoakElapsed = (delta) => {
    setSoakElapsedMins(prev => Math.max(0, prev + delta));
  };

  // Reconciliation calculation
  const totalReconciledWeight = Number(outputWeightKg || 0) + Number(scrapWeightKg || 0) + Number(processLossKg || 0);
  const weightDifference = Math.abs(totalReconciledWeight - Number(inputWeightKg || 0));
  const isReconciled = weightDifference <= 2.0; // Allowed 2kg process scaling tolerance

  // Advance Phase with Safety Guard
  const handleProceedNextPhase = () => {
    setErrorMessage('');
    setSoakTimerWarning('');

    if (currentPhase === 'LOADING') {
      setCurrentPhase('HEATING');
    } else if (currentPhase === 'HEATING') {
      setCurrentPhase('SOAKING');
    } else if (currentPhase === 'SOAKING') {
      if (soakElapsedMins < targetSoakMins) {
        setSoakTimerWarning(`CAUTION: Elapsed soak (${soakElapsedMins}m) is less than required recipe soak (${targetSoakMins}m). Metallurgist override required!`);
        return;
      }
      setCurrentPhase('QUENCHING');
    } else if (currentPhase === 'QUENCHING') {
      setCurrentPhase('TEMPERING');
    } else if (currentPhase === 'TEMPERING') {
      setCurrentPhase('COMPLETE');
    }
  };

  // Submit Run to QC
  const handleCompleteHeat = async () => {
    if (!currentBatch) return;
    setErrorMessage('');

    if (!isReconciled) {
      setErrorMessage(`RECONCILIATION ERROR: Output (${outputWeightKg}kg) + Scrap (${scrapWeightKg}kg) + Loss (${processLossKg}kg) = ${totalReconciledWeight}kg does not match Input (${inputWeightKg}kg). Impossible quantities blocked.`);
      return;
    }

    try {
      setSubmitting(true);
      const targetId = currentBatch._id || currentBatch.batchId;
      await api.batches.recordCycle(targetId, {
        actualHardeningTemp: actualTemp,
        actualSoakMinutes: soakElapsedMins,
        actualCarbonPotential: carbonPotential,
        actualQuenchTemp: quenchTemp,
        actualTemperingTemp: actualTemperingTemp,
        actualTemperingMinutes: temperingMins,
        outputWeightKg: outputWeightKg,
        outputQuantity: acceptedQty,
        rejectedQuantity: rejectedQty,
        scrapWeightKg: scrapWeightKg,
        energyConsumedKwh: 185,
        operatorRemarks: `Cycle completed on ${selectedFurnaceId}. Quench transfer: ${transferTimeSec}s. Reconciled weight: ${outputWeightKg}kg.`
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        loadData();
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit heat completion to QC Lab.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`space-y-4 max-w-5xl mx-auto ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
      {/* SECTION 47: DEDICATED GLOVE-FRIENDLY MOBILE OPERATOR TERMINAL */}
      
      {/* TOP BAR: MY FURNACE SELECTOR (EXTRA LARGE TOUCH BUTTONS) */}
      <div className={`p-4 rounded-2xl border shadow-sm ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-orange-600 text-white rounded-xl shadow-md">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-orange-600">
                Shop Floor Industrial Terminal
              </div>
              <h1 className="text-lg font-black tracking-tight">
                MY FURNACE: <span className="font-mono text-xl text-orange-600">{selectedFurnaceId}</span>
              </h1>
            </div>
          </div>

          {/* Large Furnace Selector Buttons */}
          <div className="flex flex-wrap gap-2">
            {(furnaces.length > 0 ? furnaces : [{ furnaceId: 'F-01' }, { furnaceId: 'F-02' }, { furnaceId: 'F-03' }, { furnaceId: 'F-04' }]).map(f => {
              const fId = f.furnaceId || 'F-01';
              const isSelected = selectedFurnaceId === fId;
              return (
                <button
                  key={fId}
                  onClick={() => setSelectedFurnaceId(fId)}
                  className={`px-4 py-3 rounded-xl font-mono text-sm font-black transition-all cursor-pointer shadow-sm active:scale-95 ${
                    isSelected
                      ? 'bg-orange-600 text-white ring-4 ring-orange-500/30'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {fId}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ACTIVE HEAT IDENTITY CARD (BIG HIGH CONTRAST DISPLAY) */}
      {currentBatch ? (
        <div className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">CURRENT HEAT NUMBER</span>
              <div className="font-mono text-2xl font-black text-red-600 dark:text-red-400">
                {currentBatch.heatNumber || 'HT-2026-000125'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">BATCH:</span>
              <span className="font-mono text-base font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-3 py-1 rounded-xl border border-orange-200 dark:border-orange-500/30">
                {currentBatch.batchId || 'BT-00001'}
              </span>
            </div>
          </div>

          {/* Big Master Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Job Card (JC)</span>
              <strong className="font-mono text-sm text-indigo-600 dark:text-indigo-400">
                {currentBatch.jobCard?.jobCardNumber || `JC-${currentBatch.jobOrder?.jobOrderNumber || '00001'}`}
              </strong>
            </div>

            <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Part / Component</span>
              <strong className="text-sm font-extrabold block truncate">
                {currentBatch.part?.partNumber || currentBatch.partNumber || 'PART-6205'}
              </strong>
              <span className="text-[10px] text-slate-500">{currentBatch.part?.partName || 'Precision Component'}</span>
            </div>

            <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer</span>
              <strong className="text-sm font-extrabold block truncate">
                {currentBatch.customer?.companyName || (typeof currentBatch.customer === 'string' ? currentBatch.customer : 'Customer Stock')}
              </strong>
            </div>

            <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Recipe &bull; Material</span>
              <strong className="text-sm font-mono text-orange-600 block truncate">
                {currentBatch.materialGrade || 'EN31'} &bull; {currentBatch.recipe?.recipeCode || 'RCP-STD'}
              </strong>
            </div>
          </div>
        </div>
      ) : (
        <div className={`p-8 text-center rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <Flame className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <h3 className="text-sm font-black">No Active Heat Dispatched to {selectedFurnaceId}</h3>
          <p className="text-xs text-slate-500 mt-1">Load a batch from the Batches page or select another furnace unit.</p>
        </div>
      )}

      {/* PHASE PROGRESS STEPPER (LARGE TOUCH BUTTONS) */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { id: 'LOADING', label: '1. LOADING', icon: Scale },
          { id: 'HEATING', label: '2. HEATING', icon: Flame },
          { id: 'SOAKING', label: '3. SOAKING', icon: Clock },
          { id: 'QUENCHING', label: '4. QUENCH', icon: Zap },
          { id: 'TEMPERING', label: '5. TEMPER', icon: Thermometer },
          { id: 'COMPLETE', label: '6. COMPLETE', icon: CheckCircle2 }
        ].map(stage => {
          const StageIcon = stage.icon;
          const isActive = currentPhase === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setCurrentPhase(stage.id)}
              className={`p-3 rounded-xl text-center font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-95 flex flex-col items-center gap-1.5 ${
                isActive
                  ? 'bg-orange-600 text-white ring-4 ring-orange-500/30'
                  : isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <StageIcon className="h-4 w-4" />
              <span className="text-[11px] font-black">{stage.label}</span>
            </button>
          );
        })}
      </div>

      {/* ERROR & SOAK WARNING BANNERS */}
      {errorMessage && (
        <div className="p-4 bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {soakTimerWarning && (
        <div className="p-4 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-bold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>{soakTimerWarning}</span>
          </div>
          <button
            onClick={() => {
              setSoakTimerWarning('');
              setCurrentPhase('QUENCHING');
            }}
            className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-[11px] font-black cursor-pointer uppercase shrink-0"
          >
            Authorize Override
          </button>
        </div>
      )}

      {submitSuccess && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-2xl text-center space-y-2">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
          <h3 className="text-base font-black">Heat Cycle Completed &amp; Locked for QC Lab</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Telemetry recorded into immutable audit ledger. Parts are ready for Rockwell Hardness testing and Test Certificate generation.
          </p>
        </div>
      )}

      {/* INTERACTIVE CONTROLS BASED ON ACTIVE STAGE */}
      {!submitSuccess && (
        <div className={`p-6 rounded-2xl border shadow-sm space-y-6 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          {/* 1. LOADING STAGE */}
          {currentPhase === 'LOADING' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Scale className="h-5 w-5 text-orange-600" />
                Step 1: Furnace Loading &amp; Tare Scale Verification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Loaded Weight (kg)</label>
                  <input
                    type="number"
                    value={inputWeightKg}
                    onChange={(e) => setInputWeightKg(Number(e.target.value))}
                    className="w-full text-xl font-mono font-black p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Component Quantity (Pcs)</label>
                  <input
                    type="number"
                    value={inputQty}
                    onChange={(e) => setInputQty(Number(e.target.value))}
                    className="w-full text-xl font-mono font-black p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Basket / Fixture ID</label>
                  <input
                    type="text"
                    defaultValue="BSK-04"
                    className="w-full text-xl font-mono font-black p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <button
                onClick={handleProceedNextPhase}
                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-base font-black shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                Confirm Load &amp; Start Heating Cycle &rarr;
              </button>
            </div>
          )}

          {/* 2. HEATING & TEMPERATURE STAGE */}
          {currentPhase === 'HEATING' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-600" />
                  Step 2: Heating Phase &amp; Thermocouple Logging
                </h3>
                <span className="font-mono text-sm font-bold text-slate-500">Target: {targetTemp}°C</span>
              </div>

              {/* Massive Thermocouple Temperature Display with +/- Touch Controls */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
                <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                  Live Actual Chamber Temperature
                </span>
                <div className="font-mono text-5xl sm:text-6xl font-black text-orange-600 dark:text-orange-400 tracking-tight">
                  {actualTemp} <span className="text-2xl text-slate-400">°C</span>
                </div>

                {/* Big Touch Buttons for Dirty / Gloved Hands */}
                <div className="flex justify-center items-center gap-3 pt-2">
                  <button
                    onClick={() => adjustActualTemp(-10)}
                    className="px-5 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-mono text-base font-black shadow active:scale-90 cursor-pointer"
                  >
                    -10°
                  </button>
                  <button
                    onClick={() => adjustActualTemp(-2)}
                    className="px-5 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-mono text-base font-black shadow active:scale-90 cursor-pointer"
                  >
                    -2°
                  </button>
                  <button
                    onClick={() => adjustActualTemp(2)}
                    className="px-5 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-mono text-base font-black shadow active:scale-90 cursor-pointer"
                  >
                    +2°
                  </button>
                  <button
                    onClick={() => adjustActualTemp(10)}
                    className="px-5 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-mono text-base font-black shadow active:scale-90 cursor-pointer"
                  >
                    +10°
                  </button>
                </div>
              </div>

              <button
                onClick={handleProceedNextPhase}
                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-base font-black shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                Target Temperature Reached &rarr; Begin Soaking Timer
              </button>
            </div>
          )}

          {/* 3. SOAKING STAGE */}
          {currentPhase === 'SOAKING' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Step 3: Soaking Phase &amp; Carbon Potential
                </h3>
                <span className="font-mono text-sm font-bold text-slate-500">Min Required: {targetSoakMins} min</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Soak Timer Display */}
                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                    Elapsed Soaking Minutes
                  </span>
                  <div className={`font-mono text-5xl font-black ${
                    soakElapsedMins >= targetSoakMins ? 'text-emerald-600' : 'text-amber-500 animate-pulse'
                  }`}>
                    {soakElapsedMins} <span className="text-xl text-slate-400">/ {targetSoakMins} min</span>
                  </div>

                  <div className="flex justify-center items-center gap-2 pt-1">
                    <button
                      onClick={() => adjustSoakElapsed(-15)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-mono text-sm font-black active:scale-90 cursor-pointer"
                    >
                      -15m
                    </button>
                    <button
                      onClick={() => adjustSoakElapsed(15)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-mono text-sm font-black active:scale-90 cursor-pointer"
                    >
                      +15m
                    </button>
                  </div>
                </div>

                {/* Carbon Potential Display */}
                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                    Carbon Potential (%CP)
                  </span>
                  <div className="font-mono text-5xl font-black text-orange-600 dark:text-orange-400">
                    {carbonPotential} <span className="text-xl text-slate-400">%</span>
                  </div>
                  <div className="flex justify-center items-center gap-2 pt-1">
                    <button
                      onClick={() => setCarbonPotential(prev => Number((prev - 0.05).toFixed(2)))}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-mono text-sm font-black active:scale-90 cursor-pointer"
                    >
                      -0.05
                    </button>
                    <button
                      onClick={() => setCarbonPotential(prev => Number((prev + 0.05).toFixed(2)))}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-mono text-sm font-black active:scale-90 cursor-pointer"
                    >
                      +0.05
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceedNextPhase}
                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-base font-black shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                Complete Soak &amp; Advance to Quench Tank &rarr;
              </button>
            </div>
          )}

          {/* 4. QUENCHING STAGE */}
          {currentPhase === 'QUENCHING' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Step 4: Quenching &amp; Transfer Time Recording
                </h3>
                <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border">
                  CQI-9 Standard &lt; 15s
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border text-center space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">Quench Medium</span>
                  <strong className="text-base font-mono font-black">{quenchMedium}</strong>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border text-center space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">Quench Tank Temp (°C)</span>
                  <div className="font-mono text-3xl font-black text-blue-600">{quenchTemp}°C</div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border text-center space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">Transfer Time (Seconds)</span>
                  <div className="font-mono text-3xl font-black text-emerald-600">{transferTimeSec}s</div>
                  <span className="text-[10px] text-slate-500">Door opening to immersion</span>
                </div>
              </div>

              <button
                onClick={handleProceedNextPhase}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-base font-black shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                Quench Completed &rarr; Transfer to Tempering Furnace
              </button>
            </div>
          )}

          {/* 5. TEMPERING STAGE */}
          {currentPhase === 'TEMPERING' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-violet-600" />
                  Step 5: Tempering &amp; Stress Relief
                </h3>
                <span className="font-mono text-sm font-bold text-slate-500">Target: {temperingTemp}°C ({temperingMins} min)</span>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
                <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                  Tempering Actual Temperature
                </span>
                <div className="font-mono text-5xl font-black text-violet-600 dark:text-violet-400">
                  {actualTemperingTemp} <span className="text-2xl text-slate-400">°C</span>
                </div>

                <div className="flex justify-center items-center gap-3 pt-2">
                  <button
                    onClick={() => adjustActualTemperingTemp(-5)}
                    className="px-5 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-mono text-base font-black active:scale-90 cursor-pointer"
                  >
                    -5°
                  </button>
                  <button
                    onClick={() => adjustActualTemperingTemp(5)}
                    className="px-5 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-mono text-base font-black active:scale-90 cursor-pointer"
                  >
                    +5°
                  </button>
                </div>
              </div>

              <button
                onClick={handleProceedNextPhase}
                className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-base font-black shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                Tempering Completed &rarr; Go to Weight Reconciliation &amp; Final Sign-Off
              </button>
            </div>
          )}

          {/* 6. COMPLETE & RECONCILIATION STAGE (SECTION 21) */}
          {currentPhase === 'COMPLETE' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Step 6: Production Completion &amp; Weight Reconciliation
                </h3>
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                  isReconciled ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-red-100 text-red-800 border-red-300'
                }`}>
                  {isReconciled ? 'RECONCILIATION BALANCED' : 'UNBALANCED QUANTITIES'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Input Weight (kg)</label>
                  <input
                    type="number"
                    value={inputWeightKg}
                    disabled
                    className="w-full font-mono font-bold p-2.5 rounded-lg border bg-slate-100 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Output Weight (kg)</label>
                  <input
                    type="number"
                    value={outputWeightKg}
                    onChange={(e) => setOutputWeightKg(Number(e.target.value))}
                    className="w-full font-mono font-bold p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Scrap Weight (kg)</label>
                  <input
                    type="number"
                    value={scrapWeightKg}
                    onChange={(e) => setScrapWeightKg(Number(e.target.value))}
                    className="w-full font-mono font-bold p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Process Loss (kg)</label>
                  <input
                    type="number"
                    value={processLossKg}
                    onChange={(e) => setProcessLossKg(Number(e.target.value))}
                    className="w-full font-mono font-bold p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Accepted Pieces</label>
                  <input
                    type="number"
                    value={acceptedQty}
                    onChange={(e) => setAcceptedQty(Number(e.target.value))}
                    className="w-full font-mono font-bold p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Rejected Pieces</label>
                  <input
                    type="number"
                    value={rejectedQty}
                    onChange={(e) => setRejectedQty(Number(e.target.value))}
                    className="w-full font-mono font-bold p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              {/* Reconciliation formula bar */}
              <div className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between ${
                isReconciled ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300' : 'bg-red-50 dark:bg-red-950/30 border-red-300 text-red-700'
              }`}>
                <span>{outputWeightKg}kg (Out) + {scrapWeightKg}kg (Scrap) + {processLossKg}kg (Loss) = <strong>{totalReconciledWeight}kg</strong></span>
                <span>Expected: <strong>{inputWeightKg}kg</strong></span>
              </div>

              <button
                onClick={handleCompleteHeat}
                disabled={submitting || !isReconciled}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-base font-black shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="h-5 w-5" />
                {submitting ? 'Submitting Run...' : 'Sign-Off & Complete Heat &rarr; Handover to QC Lab'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default OperatorPage;

export const furnaceTelemetryExample = {
  furnaceId: "SQF-02 (Sealed Quench Furnace)",
  activeProcess: "Gas Carburizing + Direct Quench",
  currentTemperature: "850°C",
  targetTemperature: "850°C ± 3°C",
  soakTimeElapsed: "90 MIN",
  soakTimeTotal: "120 MIN",
  atmosphereCp: "0.92% Carbon Potential",
  quenchMedium: "Accelerated Oil @ 65°C (Controlled Agitation)",
  expectedHardness: "58 – 62 HRC",
  caseDepthRange: "0.80 – 1.10 MM",
  uniformityCompliance: "AMS 2750 / CQI-9 Pyrometry Standards",
  disclaimer: "UI telemetry representation for demonstration purposes. Exact production parameters are customized to client metallurgical specifications."
};

export const technicalCards = [
  {
    id: "temp-control",
    title: "TEMPERATURE CONTROL",
    tag: "PYROMETRY CLASS 2",
    description: "Multi-zone PID thyristor power regulation maintaining chamber temperature uniformity within ±5°C across the entire heating envelope.",
    metric: "±3°C Uniformity",
    submetric: "Calibrated Type-K/S Multi-point Thermocouples"
  },
  {
    id: "time-control",
    title: "TIME & SOAK CONTROL",
    tag: "MICROPROCESSOR TIMING",
    description: "Automated digital soak countdown tied to core part thermocouple saturation, ensuring full austenitic transformation without grain coarsening.",
    metric: "Automated Soak Logic",
    submetric: "Continuous Cycle Datalogging"
  },
  {
    id: "quench-control",
    title: "QUENCH CONTROL",
    tag: "VARIABLE FREQUENCY AGITATION",
    description: "Precision temperature-controlled quench tanks with automated variable-speed impellers to tailor vapor blanket collapse and eliminate thermal warp.",
    metric: "< 12s Transfer Time",
    submetric: "Closed-loop heat exchangers maintain 60°C – 70°C oil"
  },
  {
    id: "process-recipes",
    title: "PROCESS RECIPES",
    tag: "DIGITAL METALLURGY",
    description: "Library of validated multi-stage thermal cycle recipes for over 80 standard alloy grades, guaranteeing identical execution across production runs.",
    metric: "80+ Validated Recipes",
    submetric: "Locked parameter execution"
  },
  {
    id: "batch-traceability",
    title: "BATCH TRACEABILITY",
    tag: "HEAT-TO-CERTIFICATE",
    description: "100% digital tracking connecting raw material mill test certificates to furnace logs, quench data, hardness test records, and final certificates.",
    metric: "100% Digital Audit Trail",
    submetric: "Barcoded routing cards & QR certificate access"
  },
  {
    id: "quality-inspection",
    title: "QUALITY INSPECTION",
    tag: "IN-HOUSE METALLURGY LAB",
    description: "Calibrated digital Rockwell, Vickers microhardness testing, optical spectrometry, and metallurgical microscope for microstructure evaluation.",
    metric: "NABL Traceable Calibrations",
    submetric: "ASTM E18 / E384 compliance"
  }
];

export const sampleCertificate = {
  certificateNo: "HTC-2026-000125",
  date: "18-SEP-2026",
  batchNo: "HT-2026-000125",
  customer: "PRECISION AUTOMOTIVE TRANSMISSIONS LTD.",
  partNumber: "PAT-GEAR-8620-A3",
  partDescription: "4th Speed Output Helical Gear",
  materialGrade: "SAE 8620H / 20MnCr5",
  heatNumber: "H45872 (Tata Steel Mill)",
  quantity: "480 NOS.",
  chargeWeight: "360 KG",
  process: "Gas Carburizing + Direct Quench + Tempering",
  furnaceId: "SQF-02",
  cycleDate: "18-SEP-2026 04:30 - 10:15",
  inspectionResults: {
    surfaceHardnessSpec: "58 – 62 HRC",
    surfaceHardnessObserved: "60.5, 61.0, 59.8, 60.2 HRC",
    coreHardnessSpec: "32 – 40 HRC",
    coreHardnessObserved: "35.5, 36.2 HRC",
    caseDepthSpec: "0.80 – 1.10 mm (at 50 HRC)",
    caseDepthObserved: "0.95 mm (Effective Case Depth)",
    microstructureSpec: "Tempered Martensite + Retained Austenite < 10%",
    microstructureObserved: "Fine Tempered Martensite with < 7% RA. No intergranular oxidation.",
    crackInspection: "Magnetic Particle Inspection: ZERO CRACKS DETECTED",
    status: "PASSED (COMPLIANT WITH SPEC PAT-ENG-HT-04)"
  },
  approvedBy: "Head of Metallurgy & Quality Assurance",
  verificationUrl: "https://matheat.com/verify/HTC-2026-000125"
};

export const demoBatches = {
  "HT-2026-000125": {
    batchNo: "HT-2026-000125",
    heatNo: "H45872",
    process: "Gas Carburizing + Direct Quench",
    furnace: "F-02 (Sealed Quench)",
    part: "4th Speed Output Helical Gear",
    material: "20MnCr5 / SAE 8620",
    qc: "PASSED (60.2 HRC)",
    certificate: "HTC-2026-000125",
    caseDepth: "0.95 mm",
    status: "RELEASED"
  },
  "HT-2026-000126": {
    batchNo: "HT-2026-000126",
    heatNo: "H46109",
    process: "Through Hardening & Double Temper",
    furnace: "F-01 (Continuous Mesh)",
    part: "Tapered Bearing Outer Ring",
    material: "SAE 52100 (100Cr6)",
    qc: "PASSED (62.5 HRC)",
    certificate: "HTC-2026-000126",
    caseDepth: "Through Hardened",
    status: "RELEASED"
  },
  "HT-2026-000127": {
    batchNo: "HT-2026-000127",
    heatNo: "H47332",
    process: "Induction Hardening on Journals",
    furnace: "IND-03 (CNC Scanner)",
    part: "Transmission Stepped Shaft",
    material: "AISI 4140 (EN19)",
    qc: "PASSED (56.8 HRC)",
    certificate: "HTC-2026-000127",
    caseDepth: "2.20 mm",
    status: "RELEASED"
  }
};

export const qualityCapabilities = [
  {
    title: "Hardness Testing",
    equipment: "Digital Rockwell Hardness Tester (HRC, HRB, HRA)",
    standard: "ASTM E18 / ISO 6508",
    description: "Precision diamond indenter verification across 5+ locations per sample coupon to confirm uniform hardness distribution."
  },
  {
    title: "Microhardness & Case Depth",
    equipment: "Computerized Vickers Microhardness Tester (HV0.1 to HV1.0)",
    standard: "ASTM E384 / ISO 6507",
    description: "Traverse microhardness profiling to map the exact effective case depth (ECD) at 50 HRC / 513 HV cutoff limit."
  },
  {
    title: "Metallographic Examination",
    equipment: "Inverted Metallurgical Microscope with Digital Image Analyzer",
    standard: "ASTM E112 (Grain Size) / ASTM E45",
    description: "Cross-sectional microstructure inspection after 2% Nital etching to verify austenite grain size, carbide morphology, and decarburization."
  },
  {
    title: "Dimensional Distortion Verification",
    equipment: "Precision Dial Indicators, Granite Surface Plates & Height Gauges",
    standard: "ISO 1101 Geometric Tolerancing",
    description: "Pre-and-post heat treatment runout, ovality, and face-flatness checks to ensure minimal dimensional change during quenching."
  },
  {
    title: "Crack Detection (NDT)",
    equipment: "Wet Magnetic Particle Inspection (MPI) Bench",
    standard: "ASTM E1444 / ISO 9934",
    description: "Fluorescent and black magnetic particle flaw detection to identify microscopic thermal quench cracks or grinding checks."
  },
  {
    title: "Process Parameter Verification",
    equipment: "Multi-channel Dataloggers & CQI-9 Pyrometry Recorders",
    standard: "AMS 2750F / AIAG CQI-9",
    description: "Continuous second-by-second digital logging of furnace heating zones, oxygen probe carbon potential, and quench oil agitation."
  }
];

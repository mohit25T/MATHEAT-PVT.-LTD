export const processes = [
  {
    step: "01",
    name: "MATERIAL RECEIVING",
    category: "Ingress Verification",
    summary: "Verification of incoming batch physical condition, quantity check, and customer drawing compliance.",
    detail: "Incoming components are inspected for surface contamination, transit damage, dimensional integrity, and heat code stamping. Delivery documentation is matched with engineering work orders.",
    checkpoint: "Visual inspection & quantity reconcilation against customer delivery challan.",
    telemetry: "Gate Log / Inbound Manifest ID"
  },
  {
    step: "02",
    name: "MATERIAL IDENTIFICATION",
    category: "Spectrometric & Chemistry Audit",
    summary: "Verification of steel grade chemistry (Carbon, Manganese, Chrome, Nickel, Molybdenum).",
    detail: "Positive material identification (PMI) and optical emission spectrometry (OES) verify chemical composition against DIN/AISI/IS standards to ensure heat-treat responsiveness.",
    checkpoint: "Chemical composition verification and allocation to specific steel family recipe.",
    telemetry: "Spectral Chemistry Tag: SAE 8620 / 20MnCr5 / EN31"
  },
  {
    step: "03",
    name: "PROCESS SELECTION",
    category: "Recipe & Metallurgical Plan",
    summary: "Metallurgical engineers configure recipe parameters, cycle times, ramp rates, and atmosphere levels.",
    detail: "Based on required surface hardness, core strength, case depth, and distortion tolerances, a validated furnace program recipe is assigned from the MATHEAT validated recipe library.",
    checkpoint: "Engineering sign-off on thermal cycle diagram and thermocouple placement plan.",
    telemetry: "Recipe Code: HT-RC-CARB-04"
  },
  {
    step: "04",
    name: "FURNACE LOADING",
    category: "Fixturing & Charge Geometry",
    summary: "Strategic component fixturing to ensure uniform atmosphere exposure and minimize thermal distortion.",
    detail: "Components are oriented on heat-resistant nickel-chrome alloy fixtures, baskets, or grid trays with precise spacing to guarantee unobstructed gas circulation and even quench flow.",
    checkpoint: "Fixture spacing verification and charge weight optimization.",
    telemetry: "Charge Weight: 750 KG Net | Tray Config: T-3B"
  },
  {
    step: "05",
    name: "CONTROLLED HEATING",
    category: "Thermal Ramp & Chamber Purge",
    summary: "Gradual pre-heating and ramp-up under protective atmosphere to prevent thermal shock and decarburization.",
    detail: "Furnace temperature is ramped up at a controlled rate (e.g. 10°C - 15°C/min) with nitrogen or endothermic atmosphere active, ensuring smooth expansion across varying section thicknesses.",
    checkpoint: "Pre-heating zone transition and atmosphere dewpoint verification.",
    telemetry: "Ramp Rate: 12°C/min | Atmosphere Dewpoint: -18°C"
  },
  {
    step: "06",
    name: "SOAKING",
    category: "Austenitizing & Carbon Diffusion",
    summary: "Holding at peak temperature to dissolve carbides and achieve homogeneous solid solution.",
    detail: "During soaking, carbon potentials (for carburizing) or protective atmosphere ratios are maintained with closed-loop oxygen probe feedback, stabilizing austenite grain size.",
    checkpoint: "Zone-to-zone temperature uniformity within ±5°C (Class 2 pyrometry).",
    telemetry: "Chamber Temp: 850°C – 920°C | Carbon Potential: 0.90% Cp"
  },
  {
    step: "07",
    name: "QUENCHING",
    category: "Critical Cooling Transformation",
    summary: "Rapid cooling through the critical transformation zone into martensite without cracking or severe warp.",
    detail: "Components are rapidly transferred into an agitated quench bath. Quench oil temperature, impeller velocity, and immersion speed are automatically monitored and recorded.",
    checkpoint: "Quench transfer elapsed time < 15 seconds; uniform oil circulation verified.",
    telemetry: "Quench Medium: Agitated Oil @ 65°C | Transfer: 8.2s"
  },
  {
    step: "08",
    name: "TEMPERING",
    category: "Stress Relief & Toughness Optimization",
    summary: "Secondary thermal soak to convert brittle tetragonal martensite into tough, fatigue-resistant tempered martensite.",
    detail: "Immediate tempering cycle prevents quench cracking and precisely adjusts hardness to the customer’s specified tolerance band (typically ±2 HRC).",
    checkpoint: "Recirculating convection cycle with dual control thermocouples.",
    telemetry: "Tempering Temp: 180°C – 580°C | Cycle: 120 Min"
  },
  {
    step: "09",
    name: "QUALITY INSPECTION",
    category: "Metallurgical & Dimensional Audit",
    summary: "Comprehensive laboratory testing: Rockwell hardness, microhardness case depth, and microstructure analysis.",
    detail: "Sacrificial test coupons from the same batch are cut, polished, and etched to analyze microstructural grain size, retained austenite percentage, and effective case depth profile.",
    checkpoint: "HRC / HV microhardness traverse test and dimensional CMM check.",
    telemetry: "Test Station: Rockwell 150kgf + Vickers Micro 1kgf"
  },
  {
    step: "10",
    name: "FINAL RELEASE",
    category: "Traceability & Certification",
    summary: "Generation of Heat Treatment Certificate (HTC) with complete batch audit trail, QR code, and dispatch packing.",
    detail: "Batch records are digitally locked in the system. The certified Heat Treatment Certificate is signed off by the Metallurgical QC In-Charge and linked to the batch QR barcode for permanent customer traceability.",
    checkpoint: "Final QC sign-off, protective anti-corrosion oiling, and QR dispatch tag.",
    telemetry: "Certificate: HTC-2026-000125 | Status: RELEASED"
  }
];

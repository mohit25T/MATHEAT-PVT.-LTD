export const services = [
  {
    id: "hardening",
    name: "HARDENING",
    category: "Through Hardening & Quenching",
    headline: "Controlled heating and quenching to achieve required hardness and strength.",
    description: "Components are austenitized at precise temperatures based on steel chemistry, soaked for grain dissolution, and quenched in agitated, temperature-regulated media to form hard martensite.",
    processInfo: "Austenitizing at 820°C - 880°C followed by controlled oil, polymer, or salt bath quenching with minimal distortion.",
    applications: [
      "Transmission shafts & axles",
      "High-tensile fasteners",
      "Forged hand tools & dies",
      "Heavy machinery pins"
    ],
    parameters: {
      tempRange: "820°C – 880°C",
      atmosphere: "Endothermic / Nitrogen Controlled",
      quenchMedium: "Accelerated Quench Oil / Polymer",
      typicalHardness: "45 – 62 HRC (as quenched)"
    },
    lineArtType: "hardening"
  },
  {
    id: "tempering",
    name: "TEMPERING",
    category: "Microstructure Toughening",
    headline: "Controlled tempering to achieve the required balance between hardness, toughness and dimensional stability.",
    description: "Reheating as-quenched martensitic steel below the critical transformation temperature to relieve internal thermal stresses, modify retained austenite, and establish target impact toughness.",
    processInfo: "Sub-critical thermal soak at 160°C - 650°C in forced-convection recirculating atmosphere furnaces.",
    applications: [
      "Automotive gears and pinions",
      "Leaf and coil suspension springs",
      "Hydraulic cylinder rods",
      "Heavy structural pins"
    ],
    parameters: {
      tempRange: "160°C – 650°C",
      atmosphere: "Recirculating Convection Air",
      duration: "60 – 180 Minutes",
      typicalHardness: "Target 28 – 55 HRC (calibrated)"
    },
    lineArtType: "tempering"
  },
  {
    id: "carburizing",
    name: "CARBURIZING",
    category: "Atmosphere Thermochemical Treatment",
    headline: "Surface carbon enrichment followed by hardening to improve wear resistance and surface hardness.",
    description: "Diffusing nascent carbon into low-carbon steel components at elevated temperatures in a hydrocarbon-enriched carrier gas, producing a high-carbon martensitic case over a ductile, shock-absorbing core.",
    processInfo: "Endothermic gas carrier with methane/propane enrichment under closed-loop oxygen probe carbon potential regulation (0.80% - 1.10% Cp).",
    applications: [
      "Automotive transmission gears",
      "Differential drive ring gears",
      "Heavy earthmover drive sprockets",
      "Planetary gearbox sun gears"
    ],
    parameters: {
      tempRange: "900°C – 940°C",
      carbonPotential: "0.80% – 1.05% Cp",
      caseDepth: "0.50 mm – 2.50 mm (Effective ECD 50 HRC)",
      surfaceHardness: "58 – 62 HRC"
    },
    lineArtType: "carburizing"
  },
  {
    id: "carbonitriding",
    name: "CARBONITRIDING",
    category: "Modified Surface Hardening",
    headline: "Controlled surface treatment for improved wear and fatigue performance.",
    description: "Simultaneous diffusion of carbon and nitrogen into the austenitic case. Nitrogen increases hardenability and resistance to softening during high-friction operating conditions.",
    processInfo: "Modified gas atmosphere with ammonia addition at 820°C - 880°C, ideal for thin case depths and stamping or sheet metal components.",
    applications: [
      "Small precision stamped gears",
      "Automotive latch mechanisms",
      "Bearing cage clips & bushings",
      "Textile machinery wear guides"
    ],
    parameters: {
      tempRange: "820°C – 880°C",
      atmosphere: "Endo Gas + Hydrocarbon + NH3 (Ammonia)",
      caseDepth: "0.10 mm – 0.60 mm",
      surfaceHardness: "58 – 64 HRC"
    },
    lineArtType: "carbonitriding"
  },
  {
    id: "annealing",
    name: "ANNEALING",
    category: "Softening & Grain Homogenization",
    headline: "Controlled heating and cooling to modify material structure and improve machinability.",
    description: "Heating steel into or slightly below the transformation range, followed by programmed slow furnace cooling to produce a coarse pearlite or spheroidized microstructure with optimal cold forming properties.",
    processInfo: "Full annealing, isothermal annealing, and spheroidize annealing cycles executed in sealed retort atmosphere furnaces.",
    applications: [
      "Hot forged blanks prior to gear cutting",
      "Cold heading wire and bars",
      "Machined casting pre-forms",
      "High-carbon bearing steel blanks"
    ],
    parameters: {
      tempRange: "750°C – 860°C (Slow furnace cool)",
      coolingRate: "15°C – 30°C / hour controlled",
      atmosphere: "Protective Nitrogen to prevent decarburization",
      targetHardness: "140 – 210 HBW"
    },
    lineArtType: "annealing"
  },
  {
    id: "normalizing",
    name: "NORMALIZING",
    category: "Microstructural Refinement",
    headline: "Controlled thermal treatment for refined structure and improved mechanical properties.",
    description: "Heating above upper critical temperature (Ac3) followed by still air cooling to break down dendritic structures, refine ferrite-pearlite grain size, and improve toughness prior to final induction or through-hardening.",
    processInfo: "Austenitizing at 860°C - 920°C with uniform air-jet or still atmosphere cooling tables.",
    applications: [
      "Heavy automotive crankshaft forgings",
      "Cast steel valve bodies",
      "Railway coupling links",
      "Large industrial gear blanks"
    ],
    parameters: {
      tempRange: "860°C – 920°C",
      coolingMedium: "Uniform Still / Circulated Ambient Air",
      grainSize: "ASTM 7 – 9 Fine Grain",
      result: "Uniform machinability & low residual stress"
    },
    lineArtType: "normalizing"
  },
  {
    id: "stress-relieving",
    name: "STRESS RELIEVING",
    category: "Dimensional Stabilization",
    headline: "Controlled thermal treatment to reduce residual stresses.",
    description: "Soaking below the lower transformation temperature to eliminate locked-in stresses from heavy rough machining, welding, cold bending, or quenching without altering base material hardness.",
    processInfo: "Thermal soak at 550°C - 650°C with controlled heating and furnace cooling ramps to preserve tight dimensional tolerances.",
    applications: [
      "Welded machine frames & beds",
      "Precision ground spindle shafts",
      "Large casting housings",
      "Complex geometric die cavities"
    ],
    parameters: {
      tempRange: "550°C – 650°C",
      soakDuration: "1 hour per 25mm section thickness",
      furnaceCooling: "To 300°C before air release",
      dimensionalTolerances: "Maintained < 0.01 mm"
    },
    lineArtType: "stressRelieving"
  },
  {
    id: "induction-hardening",
    name: "INDUCTION HARDENING",
    category: "Localized High-Frequency Hardening",
    headline: "Localized surface hardening for selected component geometries and applications.",
    description: "Electromagnetic induction coils rapidly heat specific wear zones (teeth, journals, cam lobes) in seconds, followed immediately by integral spray quenching, leaving core ductility intact.",
    processInfo: "Medium to high frequency (10 kHz - 350 kHz) CNC induction scanning systems with precise energy and dwell control.",
    applications: [
      "Camshaft lobes & crankshaft journals",
      "Linear bearing guide rails",
      "Splined shaft engagement zones",
      "Sprocket teeth contours"
    ],
    parameters: {
      frequencyRange: "10 kHz – 350 kHz CNC Scanning",
      cycleTime: "2 – 45 seconds per zone",
      caseDepth: "1.5 mm – 5.0 mm localized",
      surfaceHardness: "55 – 63 HRC"
    },
    lineArtType: "induction"
  },
  {
    id: "case-hardening",
    name: "CASE HARDENING",
    category: "Wear-Resistant Composite Properties",
    headline: "Surface hardening with a tougher core for demanding industrial applications.",
    description: "Engineered balance of high surface hardness (fatigue and galling resistance) coupled with a resilient low-carbon core capable of absorbing cyclic shock loads without catastrophic brittle failure.",
    processInfo: "Tailored combination of carburizing/carbonitriding, controlled quenching, and sub-zero treatment where stabilization of retained austenite is mandatory.",
    applications: [
      "Earthmoving track pins and bushings",
      "Precision roller bearing races",
      "Automotive steering rack and pinions",
      "Pneumatic tool impact pistons"
    ],
    parameters: {
      effectiveDepth: "0.40 mm – 3.0 mm (500 HV1)",
      coreHardness: "28 – 38 HRC",
      surfaceHardness: "59 – 64 HRC",
      microstructure: "Fine tempered martensite + residual austenite < 10%"
    },
    lineArtType: "caseHardening"
  }
];

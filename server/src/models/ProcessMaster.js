import mongoose from 'mongoose';

const processMasterSchema = new mongoose.Schema({
  processCode: { type: String, required: true, unique: true, uppercase: true },
  processName: { type: String, required: true }, // e.g. Carburizing + Hardening + Tempering
  category: { type: String, enum: ['THERMO_CHEMICAL', 'THERMAL_HARDENING', 'ANNEALING', 'TEMPERING', 'STRESS_RELIEF'], default: 'THERMO_CHEMICAL' },
  defaultTempRange: {
    min: { type: Number, default: 850 },
    max: { type: Number, default: 920 }
  },
  defaultHeatingRate: { type: String, default: '150°C/hr' },
  defaultSoakingTime: { type: Number, default: 90 }, // minutes
  tempTolerance: { type: Number, default: 5 }, // ±5°C
  defaultAtmosphere: { type: String, default: 'Endo Gas + LPG' },
  carbonPotentialRange: {
    min: { type: Number, default: 0.8 },
    max: { type: Number, default: 1.1 }
  },
  quenchMedium: { type: String, default: 'OIL', uppercase: true },
  defaultQuenchTemp: { type: Number, default: 60 }, // °C
  defaultQuenchDurationMinutes: { type: Number, default: 15 },
  transferTimeSeconds: { type: Number, default: 15 }, // Door-to-quench transfer time
  temperingTemp: { type: Number, default: 180 }, // °C
  temperingTime: { type: Number, default: 120 }, // minutes
  coolingMethod: { type: String, default: 'Air Cool' },
  requiredHardness: { type: String, default: '58-62 HRC' },
  requiredCaseDepth: { type: String, default: '0.80 - 1.10 mm' },
  requiredCoreHardness: { type: String, default: '32-40 HRC' },
  distortionLimits: { type: String, default: 'Max 0.05 mm' },
  requiredQCParams: [{ type: String }], // ['Surface Hardness', 'Core Hardness', 'Effective Case Depth', 'Microstructure']
  ratePerKg: { type: Number, default: 0 },
  ratePerPc: { type: Number, default: 0 },
  minCharge: { type: Number, default: 0 },
  sacCode: { type: String, default: '998873' }, // Heat Treatment Job Work SAC
  revisionHistory: [{
    revision: { type: String, default: 'V1' },
    changeReason: { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const ProcessMaster = mongoose.model('ProcessMaster', processMasterSchema);

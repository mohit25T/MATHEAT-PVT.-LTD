import mongoose from 'mongoose';

const processMasterSchema = new mongoose.Schema({
  processCode: { type: String, required: true, unique: true, uppercase: true },
  processName: { type: String, required: true }, // e.g. Carburizing + Hardening + Tempering
  category: { type: String, enum: ['THERMO_CHEMICAL', 'THERMAL_HARDENING', 'ANNEALING', 'TEMPERING', 'STRESS_RELIEF'], default: 'THERMO_CHEMICAL' },
  defaultTempRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  defaultHeatingRate: { type: String, default: '150°C/hr' },
  defaultSoakingTime: { type: Number, default: 90 }, // minutes
  defaultAtmosphere: { type: String, default: 'Endo Gas + LPG' },
  carbonPotentialRange: {
    min: { type: Number, default: 0.8 },
    max: { type: Number, default: 1.1 }
  },
  quenchMedium: { type: String, enum: ['OIL', 'WATER', 'POLYMER', 'AIR', 'BRINE', 'NONE'], default: 'OIL' },
  defaultQuenchTemp: { type: Number, default: 60 }, // °C
  temperingTemp: { type: Number, default: 180 }, // °C
  temperingTime: { type: Number, default: 120 }, // minutes
  coolingMethod: { type: String, default: 'Air Cool' },
  requiredQCParams: [{ type: String }], // ['Surface Hardness', 'Core Hardness', 'Effective Case Depth', 'Microstructure']
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const ProcessMaster = mongoose.model('ProcessMaster', processMasterSchema);

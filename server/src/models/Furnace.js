import mongoose from 'mongoose';
import { FURNACE_STATUS } from '../config/constants.js';

const furnaceSchema = new mongoose.Schema({
  furnaceId: { type: String, required: true, unique: true, uppercase: true }, // F-01
  name: { type: String, required: true }, // Sealed Quench Furnace SQF-1
  type: {
    type: String,
    enum: ['SEALED_QUENCH_FURNACE', 'PIT_CARBURIZING', 'MESH_BELT', 'TEMPERING_OVEN', 'BOGIE_HEARTH', 'INDUCTION'],
    default: 'SEALED_QUENCH_FURNACE'
  },
  manufacturer: { type: String, default: 'HighTemp Furnaces Ltd.' },
  model: { type: String, default: 'HT-SQF-600' },
  serialNumber: { type: String },
  capacityKg: { type: Number, required: true }, // Maximum loadable weight in kg
  maxTemperature: { type: Number, default: 1050 }, // °C
  workingTempRange: {
    min: { type: Number, default: 750 },
    max: { type: Number, default: 950 }
  },
  heatingType: { type: String, default: 'Electric Radiant Tubes (120 kW)' },
  quenchMedium: { type: String, enum: ['OIL', 'WATER', 'POLYMER', 'AIR', 'NONE'], default: 'OIL' },
  quenchTankCapacityLiters: { type: Number, default: 4500 },

  // Real-time Factory Floor State
  currentStatus: {
    type: String,
    enum: Object.values(FURNACE_STATUS),
    default: FURNACE_STATUS.IDLE
  },
  currentTemperature: { type: Number, default: 28 }, // °C
  targetTemperature: { type: Number, default: 0 },
  currentCarbonPotential: { type: Number, default: 0 },
  currentBatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    default: null
  },
  currentBatchId: { type: String, default: null },
  currentOperator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  loadedWeightKg: { type: Number, default: 0 },
  cycleStartTime: { type: Date, default: null },
  expectedCompletionTime: { type: Date, default: null },

  // Maintenance & Calibration Linkage
  calibrationStatus: { type: String, enum: ['VALID', 'EXPIRING_SOON', 'EXPIRED'], default: 'VALID' },
  lastCalibrationDate: { type: Date },
  nextCalibrationDue: { type: Date },
  maintenanceStatus: { type: String, enum: ['HEALTHY', 'DUE_FOR_PM', 'UNDER_BREAKDOWN'], default: 'HEALTHY' },
  
  // Power & Efficiency
  ratedPowerKw: { type: Number, default: 95 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Virtual for real-time utilization %
furnaceSchema.virtual('utilizationPercentage').get(function() {
  if (!this.capacityKg || this.capacityKg <= 0) return 0;
  return Math.min(100, Math.round((this.loadedWeightKg / this.capacityKg) * 100));
});

furnaceSchema.set('toJSON', { virtuals: true });
furnaceSchema.set('toObject', { virtuals: true });

export const Furnace = mongoose.model('Furnace', furnaceSchema);

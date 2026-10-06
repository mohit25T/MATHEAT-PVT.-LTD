import mongoose from 'mongoose';

const telemetryPointSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  tempZone1: Number,
  tempZone2: Number,
  tempZone3: Number,
  carbonPotential: Number,
  quenchTemp: Number
}, { _id: false });

const furnaceCycleSchema = new mongoose.Schema({
  cycleId: { type: String, required: true, unique: true, uppercase: true }, // FC-2026-0001
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  batchId: { type: String, required: true },
  furnace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Furnace'
  },
  furnaceId: { type: String, default: 'F-01' },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  },
  recipeRevision: { type: mongoose.Schema.Types.Mixed, default: 'V1' },
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  
  // Target vs Actual Furnace Parameters (Never overwrite target with actual!)
  parameters: {
    heating: {
      targetTemp: { type: Number, default: 850 },
      actualTemp: { type: Number },
      targetHeatingTimeMinutes: { type: Number, default: 60 },
      actualHeatingTimeMinutes: Number
    },
    soaking: {
      targetTemp: { type: Number, default: 850 },
      actualTemp: { type: Number },
      targetSoakMinutes: { type: Number, default: 90 },
      actualSoakMinutes: { type: Number },
      targetCarbonPotential: { type: Number, default: 0.85 },
      actualCarbonPotential: Number
    },
    quenching: {
      quenchMedium: { type: String, default: 'OIL' },
      targetQuenchTemp: { type: Number, default: 60 },
      actualQuenchTemp: Number,
      targetQuenchTimeMinutes: { type: Number, default: 15 },
      actualQuenchTimeMinutes: Number,
      transferTimeSeconds: Number,
      agitationSpeed: { type: String, default: 'HIGH' }
    },
    tempering: {
      targetTemp: { type: Number, default: 180 },
      actualTemp: { type: Number },
      targetTimeMinutes: { type: Number, default: 120 },
      actualTimeMinutes: { type: Number },
      coolingMethod: { type: String, default: 'Air Cool' }
    }
  },
  
  // IoT / PLC / SCADA Telemetry Stream
  telemetryLogs: [telemetryPointSchema],
  
  // Energy Consumption
  energyConsumedKwh: { type: Number, default: 0 },
  gasConsumedCubicMeters: { type: Number, default: 0 },
  
  cycleStatus: {
    type: String,
    enum: ['IN_PROGRESS', 'COMPLETED', 'ABORTED', 'INTERRUPTED'],
    default: 'IN_PROGRESS'
  },
  
  deviationNotes: { type: String },
  operatorRemarks: { type: String }
}, {
  timestamps: true
});

export const FurnaceCycle = mongoose.model('FurnaceCycle', furnaceCycleSchema);

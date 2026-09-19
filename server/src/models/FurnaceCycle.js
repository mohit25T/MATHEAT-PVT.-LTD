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
    ref: 'Furnace',
    required: true
  },
  furnaceId: { type: String, required: true },
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  
  // Target vs Actual Furnace Parameters (Never overwrite target with actual!)
  parameters: {
    heating: {
      targetTemp: { type: Number, required: true },
      actualTemp: { type: Number },
      targetHeatingTimeMinutes: Number,
      actualHeatingTimeMinutes: Number
    },
    soaking: {
      targetTemp: { type: Number, required: true },
      actualTemp: { type: Number },
      targetSoakMinutes: { type: Number, required: true },
      actualSoakMinutes: { type: Number },
      targetCarbonPotential: Number,
      actualCarbonPotential: Number
    },
    quenching: {
      quenchMedium: { type: String, default: 'OIL' },
      targetQuenchTemp: Number,
      actualQuenchTemp: Number,
      targetQuenchTimeMinutes: Number,
      actualQuenchTimeMinutes: Number,
      agitationSpeed: { type: String, default: 'HIGH' }
    },
    tempering: {
      targetTemp: { type: Number, required: true },
      actualTemp: { type: Number },
      targetTimeMinutes: { type: Number, required: true },
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

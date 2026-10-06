import mongoose from 'mongoose';

const maintenanceLogSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true },
  equipmentType: { type: String, enum: ['FURNACE', 'QUENCH_TANK', 'HARDNESS_TESTER', 'COMPRESSOR', 'COOLING_TOWER'], default: 'FURNACE' },
  furnace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Furnace'
  },
  equipmentName: { type: String, required: true }, // e.g. "Furnace F-01 Radiant Tube Burner"
  type: { type: String, enum: ['PREVENTIVE', 'BREAKDOWN'], required: true },
  
  // Breakdown details
  breakdownDate: { type: Date },
  reportedIssue: { type: String },
  rootCause: { type: String },
  actionTaken: { type: String },
  sparePartsUsed: [{
    partName: String,
    quantity: Number,
    cost: Number
  }],
  downtimeHours: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  
  // Preventive details
  frequencyDays: { type: Number, default: 30 },
  checklist: [{
    task: String,
    completed: Boolean,
    notes: String
  }],
  
  technician: { type: String, required: true },
  status: { type: String, enum: ['SCHEDULED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'RESOLVED' },
  completionDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const calibrationSchema = new mongoose.Schema({
  calibrationId: { type: String, required: true, unique: true },
  instrumentName: { type: String, required: true }, // e.g. "Zone 1 Control Thermocouple (Type S)"
  instrumentType: {
    type: String,
    enum: ['THERMOCOUPLE', 'TEMP_CONTROLLER', 'HARDNESS_TESTER', 'PYROMETER', 'WEIGHING_SCALE', 'PRESSURE_GAUGE'],
    required: true
  },
  serialNumber: { type: String, required: true },
  linkedFurnace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Furnace'
  },
  furnaceId: { type: String }, // e.g. F-01
  calibrationDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  agencyName: { type: String, default: 'NABL Accredited Calibration Labs Ltd.' },
  certificateNumber: { type: String, required: true },
  certificateUrl: { type: String },
  accuracyRange: { type: String, default: '± 1.0 °C' },
  isCritical: { type: Boolean, default: true } // If critical and expired, blocks batch approval
}, {
  timestamps: true
});

// Virtual to determine if expiring within 10 days or expired
calibrationSchema.virtual('status').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'EXPIRED';
  if (diffDays <= 10) return 'EXPIRING_SOON';
  return 'VALID';
});

calibrationSchema.set('toJSON', { virtuals: true });
calibrationSchema.set('toObject', { virtuals: true });

export const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema);
export const Calibration = mongoose.model('Calibration', calibrationSchema);

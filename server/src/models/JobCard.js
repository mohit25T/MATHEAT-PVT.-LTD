import mongoose from 'mongoose';

const jobCardSchema = new mongoose.Schema({
  jobCardNumber: { type: String, required: true, unique: true, uppercase: true }, // e.g. JC-2026-000125 or JC-00001
  jobOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobOrder',
    required: true
  },
  jobOrderNumber: { type: String, required: true },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: { type: String, required: true },
  grn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GRN'
  },
  grnNumber: { type: String },
  partNumber: { type: String, required: true },
  partName: { type: String, required: true },
  drawingNumber: { type: String },
  materialGrade: { type: String, required: true },
  heatNumber: { type: String, required: true, uppercase: true },
  quantityPcs: { type: Number, required: true },
  weightKg: { type: Number, required: true },
  requiredProcess: { type: String, required: true },
  processRevision: { type: String, default: 'V1' },
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
  recipeCode: { type: String },
  targetTemperature: { type: Number },
  soakingTimeMinutes: { type: Number },
  carbonPotential: { type: Number },
  quenchMedium: { type: String },
  transferTimeSeconds: { type: Number },
  temperingTemperature: { type: Number },
  temperingTimeMinutes: { type: Number },
  requiredHardness: { type: String, required: true },
  requiredCaseDepth: { type: String },
  priority: { type: String, default: 'STANDARD', enum: ['LOW', 'STANDARD', 'HIGH', 'URGENT'] },
  deliveryDate: { type: Date, required: true },
  specialInstructions: { type: String },
  status: {
    type: String,
    enum: ['CREATED', 'PLANNED', 'IN_PRODUCTION', 'QC_PENDING', 'QC_PASSED', 'DISPATCHED', 'COMPLETED'],
    default: 'CREATED'
  },
  batches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  }],
  qrCodeUrl: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export const JobCard = mongoose.model('JobCard', jobCardSchema);

import mongoose from 'mongoose';

const ncrSchema = new mongoose.Schema({
  ncrNumber: { type: String, required: true, unique: true, uppercase: true }, // NCR-2026-0001
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  batchId: { type: String, required: true },
  qcInspection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QCInspection'
  },
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
    required: true
  },
  heatNumber: { type: String, required: true },
  
  defectCategory: {
    type: String,
    enum: [
      'LOW_HARDNESS',
      'HIGH_HARDNESS',
      'INSUFFICIENT_CASE_DEPTH',
      'EXCESSIVE_CASE_DEPTH',
      'CRACKING',
      'DISTORTION',
      'DECARBURIZATION',
      'OVERHEATING',
      'INCORRECT_RECIPE',
      'FURNACE_DEVIATION',
      'QUENCH_ISSUE',
      'MATERIAL_DEFECT',
      'DIMENSIONAL_VARIATION'
    ],
    required: true
  },
  defectDescription: { type: String, required: true },
  affectedQuantity: { type: Number, required: true },
  affectedWeightKg: { type: Number, required: true },
  
  rootCauseAnalysis: { type: String },
  correctiveAction: { type: String },
  preventiveAction: { type: String },
  
  disposition: {
    type: String,
    enum: ['REWORK', 'REPROCESS', 'SCRAP', 'CUSTOMER_CONCESSION', 'USE_AS_IS', 'PENDING_DECISION'],
    default: 'PENDING_DECISION'
  },
  reworkBatchId: { type: String }, // e.g. HT-2026-000125-R01
  
  status: {
    type: String,
    enum: ['OPEN', 'UNDER_INVESTIGATION', 'DISPOSITION_APPROVED', 'CLOSED'],
    default: 'OPEN'
  },
  
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  closureDate: { type: Date }
}, {
  timestamps: true
});

export const NCR = mongoose.model('NCR', ncrSchema);

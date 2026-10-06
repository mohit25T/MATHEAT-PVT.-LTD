import mongoose from 'mongoose';

const reworkSchema = new mongoose.Schema({
  reworkNumber: { type: String, required: true, unique: true, uppercase: true }, // e.g. RT-2026-000012 or RT-00001
  originalBatchId: { type: String, required: true },
  originalHeatNumber: { type: String, required: true },
  originalBatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  },
  ncr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NCR'
  },
  ncrNumber: { type: String },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerName: { type: String },
  partNumber: { type: String, required: true },
  quantityPcs: { type: Number, required: true },
  weightKg: { type: Number, required: true },
  reworkReason: { type: String, required: true },
  reworkProcess: { type: String, required: true }, // e.g. Re-temper at 220C or Re-quench
  targetHardness: { type: String },
  assignedFurnace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Furnace'
  },
  assignedFurnaceId: { type: String },
  reworkHeatNumber: { type: String }, // New heat number for the re-treatment cycle
  status: {
    type: String,
    enum: ['PLANNED', 'IN_TREATMENT', 'QC_PENDING', 'QC_PASSED', 'SCRAP'],
    default: 'PLANNED'
  },
  authorizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: { type: Date }
}, {
  timestamps: true
});

export const Rework = mongoose.model('Rework', reworkSchema);

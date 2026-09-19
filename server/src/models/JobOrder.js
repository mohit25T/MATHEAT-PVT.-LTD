import mongoose from 'mongoose';
import { JOB_STATUS } from '../config/constants.js';

const jobOrderSchema = new mongoose.Schema({
  jobOrderNumber: { type: String, required: true, unique: true, uppercase: true }, // JO-2026-0001
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerPoNumber: { type: String, required: true },
  poDate: { type: Date, default: Date.now },
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
    required: true
  },
  grn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GRN'
  },
  heatNumber: { type: String, required: true, uppercase: true },
  
  targetQuantity: { type: Number, required: true }, // pieces
  targetWeight: { type: Number, required: true }, // kg
  
  requiredProcess: { type: String, required: true },
  requiredHardness: { type: String, required: true }, // e.g. "58-62 HRC"
  requiredCaseDepth: { type: String }, // e.g. "0.80 - 1.10 mm"
  
  deliveryDate: { type: Date, required: true },
  priority: { type: String, enum: ['NORMAL', 'HIGH', 'URGENT'], default: 'NORMAL' },
  
  status: {
    type: String,
    enum: Object.values(JOB_STATUS),
    default: JOB_STATUS.READY_FOR_PRODUCTION
  },
  
  // Production Output Reconciliation
  completedQuantity: { type: Number, default: 0 },
  completedWeight: { type: Number, default: 0 },
  rejectedQuantity: { type: Number, default: 0 },
  rejectedWeight: { type: Number, default: 0 },
  scrapWeight: { type: Number, default: 0 },
  
  batches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  }],
  
  specialInstructions: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export const JobOrder = mongoose.model('JobOrder', jobOrderSchema);

import mongoose from 'mongoose';
import { BATCH_STATUS } from '../config/constants.js';

const batchSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true, uppercase: true }, // e.g. HT-2026-000125
  jobOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobOrder',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
    required: true
  },
  grn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GRN'
  },
  materialGrade: { type: String, required: true },
  heatNumber: { type: String, required: true, uppercase: true }, // Critical unbroken traceability
  castNumber: { type: String },
  
  furnace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Furnace',
    required: true
  },
  furnaceId: { type: String, required: true }, // F-01
  
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  recipeRevision: { type: String, default: 'V1' },
  
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Loading & Quantities
  inputQuantity: { type: Number, required: true },
  inputWeightKg: { type: Number, required: true }, // Validated <= furnace.capacityKg
  
  outputQuantity: { type: Number, default: 0 },
  outputWeightKg: { type: Number, default: 0 },
  rejectionQuantity: { type: Number, default: 0 },
  rejectionWeightKg: { type: Number, default: 0 },
  scrapWeightKg: { type: Number, default: 0 },
  
  // Timing
  productionDate: { type: Date, default: Date.now },
  scheduledStartTime: { type: Date },
  actualStartTime: { type: Date },
  actualEndTime: { type: Date },
  
  // Workflow States
  status: {
    type: String,
    enum: Object.values(BATCH_STATUS),
    default: BATCH_STATUS.PLANNED
  },
  
  qcStatus: {
    type: String,
    enum: ['NOT_STARTED', 'PENDING', 'PASS', 'FAIL', 'ON_HOLD'],
    default: 'NOT_STARTED'
  },
  
  // Rework Linkage
  isRework: { type: Boolean, default: false },
  parentBatchId: { type: String }, // e.g. HT-2026-000125 if this is -R01
  reworkBatchId: { type: String }, // link to child rework if failed
  
  // Commercial & Documentation
  certificateNumber: { type: String },
  certificateGeneratedAt: { type: Date },
  dispatchNumber: { type: String },
  invoiceNumber: { type: String },
  
  qrCodeUrl: { type: String },
  notes: { type: String }
}, {
  timestamps: true
});

export const Batch = mongoose.model('Batch', batchSchema);

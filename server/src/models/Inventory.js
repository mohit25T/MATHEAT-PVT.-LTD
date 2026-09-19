import mongoose from 'mongoose';
import { STOCK_OWNERSHIP } from '../config/constants.js';

const inventorySchema = new mongoose.Schema({
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
    required: true
  },
  partNumber: { type: String, required: true },
  heatNumber: { type: String, required: true, uppercase: true }, // Mandatory unbroken traceability
  batchId: { type: String }, // Present when in WIP/Finished
  ownership: {
    type: String,
    enum: Object.values(STOCK_OWNERSHIP),
    default: STOCK_OWNERSHIP.CUSTOMER
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  
  quantity: { type: Number, required: true, default: 0 },
  weightKg: { type: Number, required: true, default: 0 },
  
  location: {
    type: String,
    default: 'INWARD_BAY_A'
  },
  status: {
    type: String,
    enum: [
      'INCOMING',
      'ACCEPTED',
      'HOLD',
      'WIP',
      'FURNACE',
      'QC_PENDING',
      'FINISHED',
      'REWORK',
      'REJECTED',
      'SCRAP',
      'DISPATCHED'
    ],
    default: 'ACCEPTED'
  }
}, {
  timestamps: true
});

const inventoryTransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  partNumber: { type: String, required: true },
  heatNumber: { type: String, required: true },
  batchId: { type: String },
  ownership: { type: String, enum: Object.values(STOCK_OWNERSHIP), default: STOCK_OWNERSHIP.CUSTOMER },
  customerName: { type: String },
  
  quantity: { type: Number, required: true },
  weightKg: { type: Number, required: true },
  
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  
  transactionType: {
    type: String,
    enum: [
      'GRN_INWARD',
      'ISSUE_TO_FURNACE',
      'RETURN_FROM_FURNACE',
      'QC_PASS_TRANSFER',
      'QC_REJECT_TRANSFER',
      'REWORK_TRANSFER',
      'SCRAP_GENERATION',
      'DISPATCH'
    ],
    required: true
  },
  referenceDocumentType: { type: String }, // GRN, BATCH, JOB_ORDER, DISPATCH
  referenceDocumentNumber: { type: String },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: { type: String, default: 'SYSTEM' },
  notes: { type: String }
}, {
  timestamps: true
});

const scrapSchema = new mongoose.Schema({
  scrapId: { type: String, required: true, unique: true },
  batchId: { type: String },
  heatNumber: { type: String, required: true },
  partNumber: { type: String, required: true },
  weightKg: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  reason: { type: String, required: true }, // Quench crack, severe distortion, furnace overheating
  scrapCategory: { type: String, enum: ['STEEL_TURNINGS', 'SOLID_PARTS', 'SCALE_SLAG'], default: 'SOLID_PARTS' },
  estimatedValue: { type: Number, default: 0 },
  disposalStatus: { type: String, enum: ['STORED', 'SOLD_TO_RECYCLER'], default: 'STORED' },
  generatedDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const Inventory = mongoose.model('Inventory', inventorySchema);
export const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
export const Scrap = mongoose.model('Scrap', scrapSchema);

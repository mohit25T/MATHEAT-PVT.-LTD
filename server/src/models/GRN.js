import mongoose from 'mongoose';
import { STOCK_OWNERSHIP } from '../config/constants.js';

const grnSchema = new mongoose.Schema({
  grnNumber: { type: String, required: true, unique: true, uppercase: true }, // GRN-2026-0001
  date: { type: Date, default: Date.now },
  ownership: {
    type: String,
    enum: Object.values(STOCK_OWNERSHIP),
    default: STOCK_OWNERSHIP.CUSTOMER
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: function() { return this.ownership === STOCK_OWNERSHIP.CUSTOMER; }
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: function() { return this.ownership === STOCK_OWNERSHIP.COMPANY; }
  },
  challanNumber: { type: String, required: true }, // Customer Delivery Challan / Supplier DC
  poNumber: { type: String }, // Customer PO or Purchase PO
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
    required: true
  },
  partNumber: { type: String, required: true },
  partName: { type: String },
  materialGrade: { type: String, required: true }, // e.g. EN31, 20MnCr5
  
  // Mandatory Heat Traceability
  heatNumber: { type: String, required: true, uppercase: true, trim: true }, // NEVER lose original heat number!
  castNumber: { type: String, trim: true },
  millOrigin: { type: String, default: 'JSW Steel' },
  mtcNumber: { type: String },
  mtcAvailable: { type: Boolean, default: true },
  
  // Chemical Composition from MTC
  chemicalComposition: {
    c: Number,
    mn: Number,
    si: Number,
    cr: Number,
    ni: Number,
    mo: Number,
    s: Number,
    p: Number
  },
  
  // Inward Quantities
  receivedQuantity: { type: Number, required: true }, // pieces
  receivedWeight: { type: Number, required: true }, // kg
  
  inspectionStatus: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'ON_HOLD', 'REJECTED'],
    default: 'ACCEPTED'
  },
  acceptedQuantity: { type: Number, required: true },
  acceptedWeight: { type: Number, required: true },
  rejectedQuantity: { type: Number, default: 0 },
  rejectedWeight: { type: Number, default: 0 },
  
  // Balance tracking for production issue
  issuedQuantity: { type: Number, default: 0 },
  issuedWeight: { type: Number, default: 0 },
  
  storageLocation: { type: String, default: 'CUSTOMER-BAY-A1' },
  inspectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remarks: { type: String }
}, {
  timestamps: true
});

// Virtual for remaining unallocated balance
grnSchema.virtual('availableWeight').get(function() {
  return Math.max(0, (this.acceptedWeight || 0) - (this.issuedWeight || 0));
});

grnSchema.virtual('availableQuantity').get(function() {
  return Math.max(0, (this.acceptedQuantity || 0) - (this.issuedQuantity || 0));
});

grnSchema.set('toJSON', { virtuals: true });
grnSchema.set('toObject', { virtuals: true });

export const GRN = mongoose.model('GRN', grnSchema);

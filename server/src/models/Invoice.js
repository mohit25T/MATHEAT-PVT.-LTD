import mongoose from 'mongoose';

const dispatchSchema = new mongoose.Schema({
  dispatchNumber: { type: String, required: true, unique: true, uppercase: true }, // DSP-2026-0001
  dispatchDate: { type: Date, default: Date.now },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  batchId: { type: String, required: true },
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
    required: true
  },
  heatNumber: { type: String, required: true },
  
  quantityPcs: { type: Number, required: true },
  weightKg: { type: Number, required: true },
  
  // Weighbridge & Gate Terminal Live Camera Verification
  grossWeightKg: { type: Number },
  tareWeightKg: { type: Number },
  netWeightKg: { type: Number },
  scalePhoto: { type: String }, // Base64 or snapshot URL
  materialPhoto: { type: String }, // Metal load snapshot URL
  weighbridgeVerifiedAt: { type: Date },

  vehicleNumber: { type: String, required: true },
  transporterName: { type: String, default: 'V-Trans Express Logistics' },
  lrNumber: { type: String },
  packagingType: { type: String, default: 'Wooden Crates with VCI Anti-Rust Paper' },
  
  qcApprovalVerified: { type: Boolean, default: true },
  authorizedOverride: { type: Boolean, default: false },
  overrideReason: { type: String },
  
  preparedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remarks: { type: String }
}, {
  timestamps: true
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, uppercase: true }, // INV-2026-0001
  invoiceDate: { type: Date, default: Date.now },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  dispatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispatch'
  },
  batchId: { type: String, required: true },
  partNumber: { type: String, required: true },
  heatNumber: { type: String, required: true },
  
  billingType: { type: String, enum: ['PER_KG', 'PER_PIECE', 'FIXED_BATCH_RATE'], default: 'PER_KG' },
  billedQuantity: { type: Number, required: true },
  billedWeightKg: { type: Number, required: true },
  unitRate: { type: Number, required: true }, // e.g. 28 ₹/kg
  
  subtotal: { type: Number, required: true },
  isInterstate: { type: Boolean, default: false },
  cgstAmount: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  igstAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  
  paymentTerms: { type: String, default: '30 Days Net' },
  dueDate: { type: Date },
  paymentStatus: { type: String, enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID'], default: 'UNPAID' },
  amountPaid: { type: Number, default: 0 }
}, {
  timestamps: true
});

const batchCostingSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true },
  batchWeightKg: { type: Number, required: true },
  batchPieces: { type: Number, required: true },
  
  electricityCost: { type: Number, default: 0 },
  gasFuelCost: { type: Number, default: 0 },
  quenchOilConsumablesCost: { type: Number, default: 0 },
  laborCost: { type: Number, default: 0 },
  furnaceDepreciationOverhead: { type: Number, default: 0 },
  qcTestingCost: { type: Number, default: 0 },
  reworkScrapLoss: { type: Number, default: 0 },
  
  totalBatchCost: { type: Number, required: true },
  costPerKg: { type: Number, required: true },
  costPerPiece: { type: Number, required: true },
  
  billingRevenue: { type: Number, required: true },
  grossMarginAmount: { type: Number, required: true },
  grossMarginPercentage: { type: Number, required: true }
}, {
  timestamps: true
});

export const Dispatch = mongoose.model('Dispatch', dispatchSchema);
export const Invoice = mongoose.model('Invoice', invoiceSchema);
export const BatchCosting = mongoose.model('BatchCosting', batchCostingSchema);

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

const invoiceItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
    required: false
  },
  name: { type: String, required: true },
  hsnCode: { type: String, default: '9988' },
  quantity: { type: Number, required: true, default: 1 },
  unit: { type: String, default: 'Kg' },
  unitPrice: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  taxableAmount: { type: Number, required: true },
  gstRate: { type: Number, default: 18 },
  gstAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, uppercase: true }, // INV-2026-0001
  invoiceDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false
  },
  customerName: { type: String, trim: true },
  companyName: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  gstNumber: { type: String, trim: true },
  customerGstin: { type: String, trim: true },
  billingAddress: { type: String },
  shippingAddress: { type: String },
  city: { type: String, default: 'Ahmedabad' },
  state: { type: String, default: 'Gujarat' },
  pincode: { type: String, default: '382445' },
  placeOfSupply: { type: String, default: 'Gujarat' },
  reverseCharge: { type: String, default: 'No' },

  // Transport & References
  transport: {
    customerPoNo: { type: String, default: '' },
    challanNo: { type: String, default: '' },
    customerChallanNo: { type: String, default: '' },
    jobOrderNo: { type: String, default: '' },
    ewayBillNo: { type: String, default: '' },
    lrNo: { type: String, default: '' },
    transporter: { type: String, default: '' },
    vehicleNumber: { type: String, default: '' }
  },

  // Multi-item Line Items
  items: [invoiceItemSchema],

  // Financials & Tax calculations
  subtotal: { type: Number, required: true, default: 0 },
  freightCharges: { type: Number, default: 0 },
  packagingCharges: { type: Number, default: 0 },
  isInterstate: { type: Boolean, default: false },
  cgstAmount: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  igstAmount: { type: Number, default: 0 },
  totalGst: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 }, // Synonymous with grandTotal
  grandTotal: { type: Number, default: 0 },
  amountInWords: { type: String, default: '' },

  // Banking Details
  bankDetails: {
    bankName: { type: String, default: 'State Bank of India' },
    accountName: { type: String, default: 'MATHEAT PRIVATE LIMITED' },
    accountNumber: { type: String, default: '30998822110' },
    ifscCode: { type: String, default: 'SBIN0001234' },
    branch: { type: String, default: 'Vatva GIDC, Ahmedabad' }
  },

  paymentTerms: { type: String, default: '30 Days Net from Delivery' },
  notes: { type: String, default: 'All heat treatment processing certified as per ASTM / IS standards. Subject to Ahmedabad Jurisdiction.' },
  status: { type: String, enum: ['DRAFT', 'SENT', 'PAID', 'CANCELLED'], default: 'SENT' },
  paymentStatus: { type: String, enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID'], default: 'UNPAID' },
  amountPaid: { type: Number, default: 0 },

  // Legacy single-batch linkage (optional, for backward compatibility with auto-dispatch)
  dispatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispatch',
    required: false
  },
  batchId: { type: String, required: false },
  partNumber: { type: String, required: false },
  heatNumber: { type: String, required: false },
  billingType: { type: String, enum: ['PER_KG', 'PER_PIECE', 'FIXED_BATCH_RATE'], default: 'PER_KG' },
  billedQuantity: { type: Number, required: false },
  billedWeightKg: { type: Number, required: false },
  unitRate: { type: Number, required: false }
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

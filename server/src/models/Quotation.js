import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema({
  quotationNumber: { type: String, required: true, unique: true, uppercase: true }, // e.g. QT-2026-000001 or QT-00001
  enquiry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enquiry'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: { type: String, required: true },
  partNumber: { type: String, required: true },
  partName: { type: String, required: true },
  process: { type: String, required: true },
  quantity: { type: Number, required: true },
  estimatedWeightKg: { type: Number, default: 0 },
  rateType: { type: String, enum: ['PER_KG', 'PER_PIECE', 'FIXED_LOT'], default: 'PER_KG' },
  rate: { type: Number, required: true },
  minimumJobCharge: { type: Number, default: 0 },
  setupCharge: { type: Number, default: 0 },
  testingCharge: { type: Number, default: 0 },
  packingCharge: { type: Number, default: 0 },
  transportCharge: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
  gstRate: { type: Number, default: 18 },
  gstAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  validUntil: { type: Date },
  termsAndConditions: {
    type: String,
    default: '1. Rates valid for 30 days. 2. Tolerances as per agreed drawing. 3. Payment 30 days net.'
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
    default: 'DRAFT'
  },
  jobOrderCreated: { type: Boolean, default: false },
  jobOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobOrder'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export const Quotation = mongoose.model('Quotation', quotationSchema);

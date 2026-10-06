import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  enquiryNumber: { type: String, required: true, unique: true, uppercase: true }, // e.g. ENQ-2026-000001 or ENQ-00001
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: { type: String, required: true },
  enquiryDate: { type: Date, default: Date.now },
  partNumber: { type: String, required: true },
  partName: { type: String, required: true },
  quantity: { type: Number, required: true },
  estimatedWeightKg: { type: Number },
  materialGrade: { type: String, required: true },
  requiredProcess: { type: String, required: true },
  requiredHardness: { type: String, required: true }, // e.g. "58-62 HRC"
  requiredCaseDepth: { type: String }, // e.g. "0.80 - 1.10 mm"
  deliveryRequirement: { type: Date },
  customerDrawing: { type: String },
  customerSpecification: { type: String },
  remarks: { type: String },
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'REVIEW', 'QUOTED', 'WON', 'LOST'],
    default: 'DRAFT'
  },
  quotation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export const Enquiry = mongoose.model('Enquiry', enquirySchema);

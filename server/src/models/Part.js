import mongoose from 'mongoose';

const partSchema = new mongoose.Schema({
  partNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  partName: { type: String, required: true, trim: true },
  description: { type: String },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  drawingNumber: { type: String },
  revision: { type: String, default: 'R0' },
  materialGrade: { type: String, required: true, uppercase: true }, // e.g. EN31, 20MnCr5, SAE 8620
  standard: { type: String, default: 'IS 5517' }, // ASTM / DIN / ISO / IS
  weightPerPiece: { type: Number, required: true }, // in kg
  dimensions: {
    outerDiameter: Number, // mm
    innerDiameter: Number, // mm
    length: Number, // mm
    thickness: Number, // mm
    description: String
  },
  requiredProcess: { type: String, required: true }, // e.g. Carburizing + Hardening + Tempering
  
  // Quality & Metallurgical Specifications
  hardnessSpec: {
    scale: { type: String, enum: ['HRC', 'HRB', 'HB', 'HV'], default: 'HRC' },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    target: { type: Number }
  },
  coreHardnessSpec: {
    scale: { type: String, enum: ['HRC', 'HRB', 'HB', 'HV'], default: 'HRC' },
    min: { type: Number },
    max: { type: Number }
  },
  caseDepthSpec: {
    required: { type: Boolean, default: false },
    effectiveMin: { type: Number, default: 0 }, // mm
    effectiveMax: { type: Number, default: 0 }, // mm
    totalMin: { type: Number, default: 0 },
    totalMax: { type: Number, default: 0 },
    cutoffHardness: { type: String, default: '50 HRC / 550 HV' },
    method: { type: String, default: 'Microhardness Traverse' }
  },
  metallographySpec: {
    grainSize: { type: String, default: 'ASTM 5-8' },
    retainedAusteniteMax: { type: Number, default: 15 }, // %
    decarburizationMax: { type: Number, default: 0 }, // mm
    structureRequired: { type: String, default: 'Tempered Martensite with Fine Carbides' }
  },
  nominalChemistry: {
    c: { min: Number, max: Number },
    mn: { min: Number, max: Number },
    si: { min: Number, max: Number },
    cr: { min: Number, max: Number },
    ni: { min: Number, max: Number },
    mo: { min: Number, max: Number },
    s: { max: Number },
    p: { max: Number }
  },
  specialInstructions: { type: String },
  unitRatePerKg: { type: Number, default: 28 }, // ₹/kg
  unitRatePerPiece: { type: Number, default: 12 }, // ₹/pc
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Part = mongoose.model('Part', partSchema);

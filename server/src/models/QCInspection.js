import mongoose from 'mongoose';

const sampleReadingSchema = new mongoose.Schema({
  sampleNumber: Number,
  location: String, // e.g. "Surface - Flange", "Surface - Hub", "Core"
  value: Number
}, { _id: false });

const qcInspectionSchema = new mongoose.Schema({
  inspectionId: { type: String, required: true, unique: true, uppercase: true }, // QC-2026-0001
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  batchId: { type: String, required: true },
  jobOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobOrder'
  },
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
    required: true
  },
  heatNumber: { type: String, required: true },
  
  inspectionType: {
    type: String,
    enum: ['INCOMING', 'IN_PROCESS', 'FINAL'],
    default: 'FINAL'
  },
  
  // 1. Hardness Testing
  hardness: {
    scale: { type: String, enum: ['HRC', 'HRB', 'HB', 'HV'], default: 'HRC' },
    specifiedMin: { type: Number, required: true },
    specifiedMax: { type: Number, required: true },
    machineUsed: { type: String, default: 'Rockwell Hardness Tester (HT-RC-01)' },
    sampleReadings: [sampleReadingSchema],
    averageValue: Number,
    coreSpecifiedMin: Number,
    coreSpecifiedMax: Number,
    coreReadings: [sampleReadingSchema],
    coreAverageValue: Number,
    result: { type: String, enum: ['PASS', 'FAIL', 'NOT_EVALUATED'], default: 'NOT_EVALUATED' }
  },
  
  // 2. Case Depth Testing
  caseDepth: {
    required: { type: Boolean, default: false },
    specifiedEffectiveMin: Number, // mm
    specifiedEffectiveMax: Number, // mm
    actualEffectiveMm: Number, // mm
    totalCaseDepthMm: Number,
    cutoffHardness: { type: String, default: '50 HRC / 550 HV' },
    method: { type: String, default: 'Microhardness Traverse (Vickers 500gf)' },
    result: { type: String, enum: ['PASS', 'FAIL', 'NOT_APPLICABLE'], default: 'NOT_APPLICABLE' }
  },
  
  // 3. Metallography & Microstructure
  metallography: {
    required: { type: Boolean, default: true },
    microstructureObserved: { type: String, default: 'Tempered Martensite with uniform dispersed carbides' },
    grainSizeAstm: { type: String, default: 'ASTM 7' },
    retainedAustenitePercent: { type: Number, default: 8 },
    retainedAusteniteLimit: { type: Number, default: 15 },
    decarburizationDepthMm: { type: Number, default: 0 },
    carbideNetwork: { type: String, default: 'Absent / Dispersed' },
    microstructurePhotoUrl: { type: String },
    result: { type: String, enum: ['PASS', 'FAIL', 'NOT_APPLICABLE'], default: 'PASS' }
  },
  
  // 4. Dimensional & Visual
  visualInspection: {
    surfaceFinish: { type: String, default: 'Uniform clean metallic finish, no scale/blisters' },
    cracksObserved: { type: Boolean, default: false },
    distortionAcceptable: { type: Boolean, default: true },
    result: { type: String, enum: ['PASS', 'FAIL'], default: 'PASS' }
  },
  
  // Overall Auto-computed Evaluation
  overallResult: {
    type: String,
    enum: ['PENDING', 'PASS', 'FAIL', 'HOLD'],
    default: 'PENDING'
  },
  
  // Approval & Lockout
  isLocked: { type: Boolean, default: false }, // Locked permanently post-approval
  inspectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  inspectorName: { type: String },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approverName: { type: String },
  approvalDate: { type: Date },
  remarks: { type: String }
}, {
  timestamps: true
});

export const QCInspection = mongoose.model('QCInspection', qcInspectionSchema);

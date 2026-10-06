import mongoose from 'mongoose';

const qcInstrumentSchema = new mongoose.Schema({
  instrumentId: { type: String, required: true, unique: true, uppercase: true }, // e.g. INST-001 or RC-TESTER-01
  instrumentName: { type: String, required: true }, // e.g. Rockwell Hardness Tester
  type: {
    type: String,
    enum: ['HARDNESS_TESTER', 'TEMPERATURE_SENSOR', 'THERMOCOUPLE', 'WEIGHING_SCALE', 'MICROSCOPE', 'DIMENSIONAL_GAUGE'],
    default: 'HARDNESS_TESTER'
  },
  manufacturer: { type: String, default: 'Mitutoyo / Blue Star' },
  model: { type: String },
  serialNumber: { type: String, required: true },
  calibrationDate: { type: Date, required: true },
  calibrationDueDate: { type: Date, required: true },
  calibrationAgency: { type: String, default: 'NABL Accredited Calibration Laboratory' },
  calibrationCertificateNumber: { type: String, required: true },
  calibrationCertificate: { type: String },
  calibrationCertificateUrl: { type: String },
  accuracyTolerance: { type: String, default: '±0.5 HRC / ±1°C' },
  status: {
    type: String,
    enum: ['ACTIVE', 'CALIBRATION_DUE', 'CALIBRATION_OVERDUE', 'OUT_OF_SERVICE'],
    default: 'ACTIVE'
  },
  notes: { type: String }
}, {
  timestamps: true
});

export const QCInstrument = mongoose.model('QCInstrument', qcInstrumentSchema);

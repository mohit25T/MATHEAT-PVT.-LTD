import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  supplierCode: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['STEEL_MILL', 'CONSUMABLES', 'GAS_OIL', 'SPARE_PARTS', 'CALIBRATION_AGENCY'], default: 'STEEL_MILL' },
  gstin: { type: String },
  phone: { type: String },
  email: { type: String },
  address: {
    city: String,
    state: String,
    pincode: String
  },
  approvedStatus: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Supplier = mongoose.model('Supplier', supplierSchema);

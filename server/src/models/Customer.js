import mongoose from 'mongoose';

const customerContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String },
  phone: { type: String },
  email: { type: String },
  isPrimary: { type: Boolean, default: false }
});

const customerSchema = new mongoose.Schema({
  customerCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  companyName: { type: String, required: true, trim: true },
  gstin: { type: String, trim: true },
  pan: { type: String, trim: true },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  contacts: [customerContactSchema],
  paymentTerms: { type: String, default: '30 Days Net' },
  creditLimit: { type: Number, default: 500000 },
  currentOutstanding: { type: Number, default: 0 },
  customerType: { type: String, enum: ['OEM', 'TIER_1', 'JOB_WORK', 'EXPORT'], default: 'JOB_WORK' },
  isActive: { type: Boolean, default: true },
  notes: { type: String }
}, {
  timestamps: true
});

export const Customer = mongoose.model('Customer', customerSchema);

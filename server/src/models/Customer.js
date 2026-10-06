import mongoose from 'mongoose';

const additionalAddressSchema = new mongoose.Schema({
  label: { type: String, default: 'Warehouse / Branch' },
  companyName: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  stateCode: { type: String },
  pincode: { type: String },
  gstin: { type: String },
  type: { type: String, enum: ['both', 'billing', 'shipping'], default: 'both' }
});

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
  tradeName: { type: String, trim: true },
  name: { type: String, trim: true }, // Legal representative / Contact Person
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  gstin: { type: String, trim: true, uppercase: true, default: '27AABCU9603R1ZM' },
  pan: { type: String, trim: true, uppercase: true },
  state: { type: String, trim: true },
  stateCode: { type: String, trim: true },
  city: { type: String, trim: true },
  pincode: { type: String, trim: true },
  address: { type: String, trim: true },
  entityType: { type: String, trim: true },
  gstStatus: { type: String, default: 'Active' },
  taxpayerType: { type: String, default: 'Regular' },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  contacts: [customerContactSchema],
  addresses: [additionalAddressSchema], // Multi-node shipping/billing addresses
  paymentTerms: { type: String, default: '30 Days Net' },
  creditLimit: { type: Number, default: 500000 },
  currentOutstanding: { type: Number, default: 0 },
  customerType: { type: String, enum: ['regular', 'job_work', 'scrap_buyer', 'OEM', 'TIER_1', 'JOB_WORK', 'EXPORT'], default: 'regular' },
  isActive: { type: Boolean, default: true },
  notes: { type: String }
}, {
  timestamps: true
});

export const Customer = mongoose.model('Customer', customerSchema);


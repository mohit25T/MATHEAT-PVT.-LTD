import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentNumber: { type: String, required: true, unique: true, uppercase: true }, // e.g. PAY-2026-000001 or PAY-00001
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  invoiceNumber: { type: String, required: true },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, default: Date.now },
  paymentMode: {
    type: String,
    enum: ['NEFT', 'RTGS', 'CHEQUE', 'CASH', 'UPI', 'BANK_TRANSFER'],
    default: 'NEFT'
  },
  referenceNumber: { type: String, required: true }, // Transaction ID / Cheque No
  bankName: { type: String, default: 'State Bank of India' },
  status: {
    type: String,
    enum: ['RECEIVED', 'CLEARED', 'BOUNCED', 'REVERSED'],
    default: 'CLEARED'
  },
  remarks: { type: String },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export const Payment = mongoose.model('Payment', paymentSchema);

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'MATERIAL_RECEIVED',
      'JOB_READY',
      'HEAT_STARTED',
      'HEAT_COMPLETED',
      'QC_PENDING',
      'QC_FAILED',
      'CERTIFICATE_GENERATED',
      'DISPATCH_READY',
      'INVOICE_GENERATED',
      'PAYMENT_OVERDUE',
      'FURNACE_MAINTENANCE',
      'CALIBRATION_DUE',
      'GENERAL'
    ],
    default: 'GENERAL'
  },
  severity: {
    type: String,
    enum: ['INFO', 'SUCCESS', 'WARNING', 'DANGER'],
    default: 'INFO'
  },
  link: { type: String }, // e.g. /qc-lab or /commercial or /traceability?q=HT-00001
  isRead: { type: Boolean, default: false },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

export const Notification = mongoose.model('Notification', notificationSchema);

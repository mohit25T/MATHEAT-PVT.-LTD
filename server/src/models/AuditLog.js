import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userName: { type: String, default: 'SYSTEM' },
  userRole: { type: String, default: 'SYSTEM' },
  action: { type: String, required: true },
  module: { type: String, required: true },
  recordId: { type: String },
  entityType: { type: String },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  description: { type: String },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

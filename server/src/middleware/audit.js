import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async ({
  req,
  action,
  module,
  recordId,
  entityType,
  oldValue = null,
  newValue = null,
  description = ''
}) => {
  try {
    const user = req?.user;
    await AuditLog.create({
      user: user?._id || null,
      userName: user ? `${user.firstName} ${user.lastName}` : 'SYSTEM',
      userRole: user?.role || 'SYSTEM',
      action,
      module,
      recordId: String(recordId || ''),
      entityType,
      oldValue,
      newValue,
      description,
      ipAddress: req?.ip || req?.headers['x-forwarded-for'] || '127.0.0.1'
    });
  } catch (error) {
    console.error(`[AUDIT ERROR] Failed to record audit log: ${error.message}`);
  }
};

import { Notification } from '../models/Notification.js';
import { Batch } from '../models/Batch.js';
import { Furnace } from '../models/Furnace.js';
import { QCInstrument } from '../models/QCInstrument.js';
import { Invoice } from '../models/Invoice.js';

export const getNotifications = async (req, res, next) => {
  try {
    const list = await Notification.find().sort({ createdAt: -1 }).limit(20);
    
    // Auto-generate live alerts if system state has critical items
    const dynamicAlerts = [];
    
    // 1. Calibration Overdue or Due Check
    const instruments = await QCInstrument.find();
    const now = new Date();
    instruments.forEach((inst) => {
      const days = Math.round((new Date(inst.calibrationDueDate) - now) / (1000 * 60 * 60 * 24));
      if (days < 0) {
        dynamicAlerts.push({
          _id: `alert-cal-overdue-${inst._id}`,
          title: 'Calibration Overdue',
          message: `${inst.instrumentName} (${inst.serialNumber}) calibration expired ${Math.abs(days)} days ago! Immediate recalibration required.`,
          category: 'CALIBRATION_DUE',
          severity: 'DANGER',
          link: '/maintenance'
        });
      } else if (days <= 30) {
        dynamicAlerts.push({
          _id: `alert-cal-due-${inst._id}`,
          title: 'Calibration Due Soon',
          message: `${inst.instrumentName} calibration is due in ${days} days. Schedule NABL agency audit.`,
          category: 'CALIBRATION_DUE',
          severity: 'WARNING',
          link: '/maintenance'
        });
      }
    });

    // 2. QC Pending Batches
    const qcPendingCount = await Batch.countDocuments({
      $or: [{ status: 'QC_PENDING' }, { qcStatus: 'PENDING' }]
    });
    if (qcPendingCount > 0) {
      dynamicAlerts.push({
        _id: 'alert-qc-pending',
        title: 'QC Inspection Pending',
        message: `${qcPendingCount} furnace heat(s) waiting for metallurgical hardness & case depth testing.`,
        category: 'QC_PENDING',
        severity: 'INFO',
        link: '/qc-lab'
      });
    }

    // 3. Furnace Maintenance Alerts
    const maintFurnaces = await Furnace.find({ status: 'MAINTENANCE' });
    maintFurnaces.forEach((f) => {
      dynamicAlerts.push({
        _id: `alert-maint-${f._id}`,
        title: 'Furnace Under Maintenance',
        message: `${f.name || f.furnaceId} is undergoing preventative/breakdown maintenance. Loading locked.`,
        category: 'FURNACE_MAINTENANCE',
        severity: 'WARNING',
        link: '/furnaces'
      });
    });

    // 4. Overdue Invoices
    const overdueInvoices = await Invoice.find({
      dueDate: { $lt: now },
      paymentStatus: { $ne: 'PAID' }
    });
    if (overdueInvoices.length > 0) {
      const totalDue = overdueInvoices.reduce((acc, inv) => acc + Math.max(0, (inv.grandTotal || inv.totalAmount || 0) - (inv.amountPaid || 0)), 0);
      dynamicAlerts.push({
        _id: 'alert-overdue-inv',
        title: 'Outstanding Payment Overdue',
        message: `${overdueInvoices.length} invoice(s) totalling ₹ ${totalDue.toLocaleString('en-IN')} are past 30 days credit limit.`,
        category: 'PAYMENT_OVERDUE',
        severity: 'WARNING',
        link: '/commercial'
      });
    }

    const combined = [...dynamicAlerts, ...list];
    res.json({
      success: true,
      count: combined.length,
      notifications: combined,
      unreadCount: combined.filter(n => !n.isRead).length
    });
  } catch (err) { next(err); }
};

export const createNotification = async (req, res, next) => {
  try {
    const notif = await Notification.create(req.body);
    res.status(201).json({ success: true, notification: notif });
  } catch (err) { next(err); }
};

export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

import express from 'express';
import { MaintenanceLog, Calibration } from '../models/Maintenance.js';
import { Furnace } from '../models/Furnace.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// MAINTENANCE
router.get('/maintenance', authenticate, async (req, res, next) => {
  try {
    const logs = await MaintenanceLog.find().populate('furnace').sort({ createdAt: -1 });
    res.json({ success: true, count: logs.length, logs });
  } catch (error) { next(error); }
});

router.post('/maintenance', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'MAINTENANCE_MANAGER'), async (req, res, next) => {
  try {
    const count = await MaintenanceLog.countDocuments();
    const logId = `MNT-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    const log = await MaintenanceLog.create({
      logId,
      ...req.body
    });
    res.status(201).json({ success: true, log });
  } catch (error) { next(error); }
});

// CALIBRATION
router.get('/calibration', authenticate, async (req, res, next) => {
  try {
    const calibrations = await Calibration.find().populate('linkedFurnace').sort({ expiryDate: 1 });
    
    // Check for instruments expiring within 10 days
    const now = new Date();
    const alerts = calibrations.filter(c => {
      const diffDays = Math.ceil((new Date(c.expiryDate) - now) / (1000 * 60 * 60 * 24));
      return diffDays <= 10;
    });

    res.json({
      success: true,
      count: calibrations.length,
      alertsCount: alerts.length,
      expiringInstruments: alerts,
      calibrations
    });
  } catch (error) { next(error); }
});

export default router;

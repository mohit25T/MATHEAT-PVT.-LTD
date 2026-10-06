import express from 'express';
import * as maintenanceController from '../controllers/maintenanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Instrument Calibration
router.get('/calibration', maintenanceController.getCalibrations);
router.post('/calibration', maintenanceController.createCalibration);
router.delete('/calibration/:id', maintenanceController.deleteCalibration);

// Maintenance Logs
router.get('/maintenance', maintenanceController.getMaintenanceLogs);
router.post('/maintenance', maintenanceController.createMaintenanceLog);

export default router;

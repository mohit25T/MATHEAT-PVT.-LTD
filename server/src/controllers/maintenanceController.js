import { MaintenanceLog, Calibration } from '../models/Maintenance.js';
import { Furnace } from '../models/Furnace.js';

// 1. GET ALL CALIBRATIONS & EXPIRY ALERTS
export const getCalibrations = async (req, res, next) => {
  try {
    const records = await Calibration.find().populate('linkedFurnace').sort({ expiryDate: 1 });
    const now = new Date();

    const formatted = records.map(c => {
      const expiry = new Date(c.expiryDate);
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      return {
        ...c.toObject(),
        daysRemaining: diffDays,
        status: diffDays < 0 ? 'EXPIRED' : diffDays <= 10 ? 'EXPIRING_SOON' : 'VALID'
      };
    });

    const expiringInstruments = formatted.filter(c => c.daysRemaining <= 10);

    res.json({
      success: true,
      count: formatted.length,
      alertsCount: expiringInstruments.length,
      expiringInstruments,
      calibrations: formatted,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// 2. CREATE INSTRUMENT CALIBRATION RECORD
export const createCalibration = async (req, res, next) => {
  try {
    const {
      instrumentName,
      instrumentType,
      serialNumber,
      furnaceId,
      calibrationDate,
      expiryDate,
      certificateNumber,
      agencyName,
      accuracyRange
    } = req.body;

    if (!instrumentName || !serialNumber || !certificateNumber) {
      return res.status(400).json({
        success: false,
        message: 'Instrument Name, Serial Number, and Certificate Number are required.'
      });
    }

    const count = await Calibration.countDocuments();
    const calibrationId = `CAL-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Normalize instrument type to schema enum
    let normalizedType = (instrumentType || 'THERMOCOUPLE').toUpperCase().replace(/\s+/g, '_');
    const validTypes = ['THERMOCOUPLE', 'TEMP_CONTROLLER', 'HARDNESS_TESTER', 'PYROMETER', 'WEIGHING_SCALE', 'PRESSURE_GAUGE'];
    if (!validTypes.includes(normalizedType)) {
      if (normalizedType.includes('CONTROLLER')) normalizedType = 'TEMP_CONTROLLER';
      else if (normalizedType.includes('HARDNESS') || normalizedType.includes('TESTER')) normalizedType = 'HARDNESS_TESTER';
      else if (normalizedType.includes('SCALE') || normalizedType.includes('WEIGH')) normalizedType = 'WEIGHING_SCALE';
      else if (normalizedType.includes('PRESSURE') || normalizedType.includes('GAUGE')) normalizedType = 'PRESSURE_GAUGE';
      else normalizedType = 'THERMOCOUPLE';
    }

    // Attempt to link furnace if ID provided
    let linkedFurnace = null;
    if (furnaceId && furnaceId !== 'GENERAL_LAB') {
      const fDoc = await Furnace.findOne({
        $or: [{ furnaceId: furnaceId.toUpperCase() }, { name: furnaceId }]
      });
      if (fDoc) linkedFurnace = fDoc._id;
    }

    const calDoc = await Calibration.create({
      calibrationId,
      instrumentName: instrumentName.trim(),
      instrumentType: normalizedType,
      serialNumber: serialNumber.trim().toUpperCase(),
      linkedFurnace,
      furnaceId: furnaceId || 'Plant General',
      calibrationDate: calibrationDate ? new Date(calibrationDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      agencyName: agencyName || 'NABL Accredited Calibration Labs Ltd.',
      certificateNumber: certificateNumber.trim().toUpperCase(),
      accuracyRange: accuracyRange || '± 1.0 °C'
    });

    // Sync with linked Furnace
    if (linkedFurnace) {
      await Furnace.findByIdAndUpdate(linkedFurnace, {
        calibrationDate: calDoc.calibrationDate,
        calibrationExpiryDate: calDoc.expiryDate,
        calibrationStatus: 'VALID',
        calibrationCertificateNumber: calDoc.certificateNumber
      });
    }

    res.status(201).json({
      success: true,
      message: `Instrument "${calDoc.instrumentName}" registered with cert #${calDoc.certificateNumber}`,
      calibration: calDoc
    });
  } catch (error) {
    next(error);
  }
};

// 3. DELETE CALIBRATION RECORD
export const deleteCalibration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Calibration.findOneAndDelete({
      $or: [{ _id: id }, { calibrationId: id }]
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Calibration record not found' });
    }

    res.json({
      success: true,
      message: `Calibration #${deleted.calibrationId} removed successfully`
    });
  } catch (error) {
    next(error);
  }
};

// 4. GET MAINTENANCE LOGS
export const getMaintenanceLogs = async (req, res, next) => {
  try {
    const logs = await MaintenanceLog.find().populate('furnace').sort({ createdAt: -1 });
    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};

// 5. CREATE MAINTENANCE LOG WITH FURNACE STATUS SYNCHRONIZATION
export const createMaintenanceLog = async (req, res, next) => {
  try {
    const count = await MaintenanceLog.countDocuments();
    const logId = `MNT-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    const log = await MaintenanceLog.create({
      logId,
      ...req.body
    });

    // Synchronize Furnace Downtime Status
    if (log.furnace) {
      const furnace = await Furnace.findById(log.furnace);
      if (furnace) {
        if (log.type === 'BREAKDOWN') {
          furnace.currentStatus = 'BREAKDOWN';
          furnace.status = 'BREAKDOWN';
        } else if (log.type === 'PREVENTIVE') {
          furnace.currentStatus = 'MAINTENANCE';
          furnace.status = 'MAINTENANCE';
        } else if (log.status === 'COMPLETED' || log.status === 'RESOLVED') {
          furnace.currentStatus = 'IDLE';
          furnace.status = 'ACTIVE';
        }
        await furnace.save();
      }
    }

    res.status(201).json({ success: true, log });
  } catch (error) {
    next(error);
  }
};

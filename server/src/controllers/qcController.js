import mongoose from 'mongoose';
import { QCInspection } from '../models/QCInspection.js';
import { Batch } from '../models/Batch.js';
import { NCR } from '../models/NCR.js';
import { QCInstrument } from '../models/QCInstrument.js';
import { evaluateQC } from '../services/qcEngine.js';
import { BATCH_STATUS } from '../config/constants.js';
import { logAudit } from '../middleware/audit.js';

// Sequence generator for Certificate: HTC-YYYY-XXXXXX
export const generateNextCertificateNumber = async () => {
  const currentYear = new Date().getFullYear();
  const batches = await Batch.find({
    certificateNumber: /^HTC-/i
  }).select('certificateNumber');

  let maxSeq = 0;
  for (const b of batches) {
    const parts = (b.certificateNumber || '').split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    } else if (parts.length === 2) {
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    }
  }

  let nextNum = maxSeq + 1;
  let candidate = `HTC-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  while (await Batch.findOne({ certificateNumber: candidate })) {
    nextNum++;
    candidate = `HTC-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  }
  return candidate;
};

// 1. GET ALL QC INSPECTIONS
export const getAll = async (req, res, next) => {
  try {
    const inspections = await QCInspection.find()
      .populate('batch')
      .populate('part')
      .populate('inspectedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: inspections.length, inspections, data: inspections });
  } catch (error) { next(error); }
};

// 2. GET QC BY BATCH ID
export const getByBatchId = async (req, res, next) => {
  try {
    let inspection = await QCInspection.findOne({ batchId: req.params.batchId })
      .populate('batch')
      .populate('part');
    if (!inspection && mongoose.Types.ObjectId.isValid(req.params.batchId)) {
      inspection = await QCInspection.findOne({ batch: req.params.batchId })
        .populate('batch')
        .populate('part');
    }
    res.json({ success: true, inspection });
  } catch (error) { next(error); }
};

// 3. CREATE QC INSPECTION
export const create = async (req, res, next) => {
  try {
    const { batchId, hardness, caseDepth, metallography, visualInspection, remarks, instrumentId } = req.body;

    let batch = await Batch.findOne({ batchId }).populate('part');
    if (!batch && mongoose.Types.ObjectId.isValid(batchId)) {
      batch = await Batch.findById(batchId).populate('part');
    }
    if (!batch) return res.status(404).json({ success: false, message: `Batch ${batchId} not found.` });

    // CALIBRATION LOCKOUT: Check instrument calibration status
    const machineCheck = instrumentId || hardness?.machineId || hardness?.machineUsed;
    if (machineCheck) {
      let inst = null;
      if (mongoose.Types.ObjectId.isValid(machineCheck)) {
        inst = await QCInstrument.findById(machineCheck);
      }
      if (!inst) {
        inst = await QCInstrument.findOne({ $or: [{ instrumentId: machineCheck }, { name: machineCheck }] });
      }
      if (inst) {
        const isExpired = inst.calibrationStatus === 'EXPIRED' || (inst.nextCalibrationDue && new Date(inst.nextCalibrationDue) < new Date());
        if (isExpired) {
          const expStr = inst.nextCalibrationDue ? new Date(inst.nextCalibrationDue).toLocaleDateString('en-IN') : 'expired';
          return res.status(400).json({
            success: false,
            message: `QC Instrument ${inst.instrumentId || inst.name} calibration expired on ${expStr}. Testing using uncalibrated instruments is strictly prohibited under ISO 9001 / CQI-9.`
          });
        }
      }
    }

    const part = batch.part || {};

    const rawData = {
      hardness: {
        scale: hardness?.scale || part.hardnessSpec?.scale || 'HRC',
        specifiedMin: part.hardnessSpec?.min || 58,
        specifiedMax: part.hardnessSpec?.max || 62,
        machineUsed: hardness?.machineUsed || 'Rockwell Hardness Tester (HT-RC-01)',
        sampleReadings: hardness?.sampleReadings || [],
        coreSpecifiedMin: part.coreHardnessSpec?.min,
        coreSpecifiedMax: part.coreHardnessSpec?.max,
        coreReadings: hardness?.coreReadings || []
      },
      caseDepth: {
        required: part.caseDepthSpec?.required || false,
        specifiedEffectiveMin: part.caseDepthSpec?.effectiveMin || 0,
        specifiedEffectiveMax: part.caseDepthSpec?.effectiveMax || 0,
        actualEffectiveMm: Number(caseDepth?.actualEffectiveMm || 0),
        totalCaseDepthMm: Number(caseDepth?.totalCaseDepthMm || 0),
        cutoffHardness: part.caseDepthSpec?.cutoffHardness || '50 HRC / 550 HV'
      },
      metallography: {
        required: true,
        microstructureObserved: metallography?.microstructureObserved || 'Uniform Tempered Martensite with Fine Carbides',
        grainSizeAstm: metallography?.grainSizeAstm || 'ASTM 7',
        retainedAustenitePercent: Number(metallography?.retainedAustenitePercent || 8),
        retainedAusteniteLimit: part.metallographySpec?.retainedAusteniteMax || 15,
        decarburizationDepthMm: Number(metallography?.decarburizationDepthMm || 0)
      },
      visualInspection: {
        surfaceFinish: visualInspection?.surfaceFinish || 'Clean, scale-free metallic luster',
        cracksObserved: visualInspection?.cracksObserved || false,
        distortionAcceptable: visualInspection?.distortionAcceptable !== false
      }
    };

    const { results, inspectionData } = evaluateQC(rawData, part);

    const existingCount = await QCInspection.countDocuments();
    const currentYear = new Date().getFullYear();
    const inspectionId = `QC-${currentYear}-${String(existingCount + 1).padStart(6, '0')}`;

    const inspection = await QCInspection.create({
      inspectionId,
      batch: batch._id,
      batchId: batch.batchId,
      jobOrder: batch.jobOrder,
      part: part._id,
      heatNumber: batch.heatNumber,
      hardness: inspectionData.hardness,
      caseDepth: inspectionData.caseDepth,
      metallography: inspectionData.metallography,
      visualInspection: inspectionData.visualInspection,
      overallResult: results.overallResult,
      inspectedBy: req.user?._id,
      inspectorName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Metallurgical QA Inspector',
      remarks: remarks || (results.reasons.length > 0 ? results.reasons.join('; ') : 'All test parameters within engineering tolerances.')
    });

    res.status(201).json({ success: true, inspection, evaluation: results });
  } catch (error) { next(error); }
};

// 4. APPROVE QC INSPECTION
export const approve = async (req, res, next) => {
  try {
    const inspection = await QCInspection.findById(req.params.id);
    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found.' });

    if (inspection.isLocked) {
      return res.status(400).json({ success: false, message: 'Inspection is permanently locked and approved.' });
    }

    inspection.isLocked = true;
    inspection.approvedBy = req.user?._id;
    inspection.approverName = req.user ? `${req.user.firstName} ${req.user.lastName} (QC Manager)` : 'Er. Rajesh Sharma (Lead Metallurgist)';
    inspection.approvalDate = new Date();
    await inspection.save();

    const batch = await Batch.findById(inspection.batch);
    if (batch) {
      if (inspection.overallResult === 'PASS') {
        const nextHtc = await generateNextCertificateNumber();
        batch.status = BATCH_STATUS.READY_FOR_DISPATCH;
        batch.qcStatus = 'PASS';
        batch.certificateNumber = nextHtc;
        batch.certificateGeneratedAt = new Date();
      } else {
        batch.status = BATCH_STATUS.ON_HOLD; // Quarantined to Quarantine Bay
        batch.qcStatus = 'FAIL';

        const existingNcrs = await NCR.find({
          ncrNumber: /^NCR-/i
        }).select('ncrNumber');
        let maxSeq = 0;
        for (const n of existingNcrs) {
          const parts = (n.ncrNumber || '').split('-');
          if (parts.length === 3) {
            const num = parseInt(parts[2], 10);
            if (!isNaN(num) && num > maxSeq) maxSeq = num;
          } else if (parts.length === 2) {
            const num = parseInt(parts[1], 10);
            if (!isNaN(num) && num > maxSeq) maxSeq = num;
          }
        }
        const currentYear = new Date().getFullYear();
        const nextNcrNumber = `NCR-${currentYear}-${String(maxSeq + 1).padStart(6, '0')}`;

        await NCR.create({
          ncrNumber: nextNcrNumber,
          batch: batch._id,
          batchId: batch.batchId,
          qcInspection: inspection._id,
          part: batch.part,
          heatNumber: batch.heatNumber,
          defectCategory: 'LOW_HARDNESS',
          defectDescription: inspection.remarks || 'Out of specification hardness / metallurgical parameters',
          affectedQuantity: batch.outputQuantity || batch.inputQuantity,
          affectedWeightKg: batch.outputWeightKg || batch.inputWeightKg,
          raisedBy: req.user?._id
        });
      }
      await batch.save();
    }

    if (req.user) {
      await logAudit({
        req,
        action: 'APPROVE_QC',
        module: 'QUALITY',
        recordId: inspection._id,
        entityType: 'QCInspection',
        description: `QC Inspection ${inspection.inspectionId} approved. Result: ${inspection.overallResult}`
      });
    }

    res.json({ success: true, message: `QC Inspection signed off. Overall Result: ${inspection.overallResult}`, inspection, batch });
  } catch (error) { next(error); }
};

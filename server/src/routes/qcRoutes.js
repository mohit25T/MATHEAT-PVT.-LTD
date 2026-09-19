import express from 'express';
import { QCInspection } from '../models/QCInspection.js';
import { Batch } from '../models/Batch.js';
import { Part } from '../models/Part.js';
import { NCR } from '../models/NCR.js';
import { evaluateQC } from '../services/qcEngine.js';
import { BATCH_STATUS } from '../config/constants.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// GET /api/qc
router.get('/', authenticate, async (req, res, next) => {
  try {
    const inspections = await QCInspection.find()
      .populate('batch')
      .populate('part')
      .populate('inspectedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: inspections.length, inspections });
  } catch (error) { next(error); }
});

// GET /api/qc/batch/:batchId
router.get('/batch/:batchId', authenticate, async (req, res, next) => {
  try {
    const inspection = await QCInspection.findOne({ batchId: req.params.batchId })
      .populate('batch')
      .populate('part');
    res.json({ success: true, inspection });
  } catch (error) { next(error); }
});

// POST /api/qc (Record QC Inspection with Automated Algorithm Evaluation)
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'QC_MANAGER', 'QC_INSPECTOR'), async (req, res, next) => {
  try {
    const { batchId, hardness, caseDepth, metallography, visualInspection, remarks } = req.body;

    const batch = await Batch.findOne({ batchId }).populate('part');
    if (!batch) return res.status(404).json({ success: false, message: `Batch ${batchId} not found.` });

    const part = batch.part;

    // Build raw inspection data with specified tolerances from Part Master
    const rawData = {
      hardness: {
        scale: hardness?.scale || part.hardnessSpec.scale,
        specifiedMin: part.hardnessSpec.min,
        specifiedMax: part.hardnessSpec.max,
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

    // Run Automated Pass/Fail algorithm
    const { results, inspectionData } = evaluateQC(rawData, part);

    const count = await QCInspection.countDocuments();
    const inspectionId = `QC-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

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
      inspectedBy: req.user._id,
      inspectorName: `${req.user.firstName} ${req.user.lastName}`,
      remarks: remarks || (results.reasons.length > 0 ? results.reasons.join('; ') : 'All test parameters within engineering tolerances.')
    });

    res.status(201).json({ success: true, inspection, evaluation: results });
  } catch (error) { next(error); }
});

// POST /api/qc/:id/approve (Authorized sign-off and permanent record locking)
router.post('/:id/approve', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'QC_MANAGER'), async (req, res, next) => {
  try {
    const inspection = await QCInspection.findById(req.params.id);
    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found.' });

    if (inspection.isLocked) {
      return res.status(400).json({ success: false, message: 'Inspection is permanently locked and approved.' });
    }

    inspection.isLocked = true;
    inspection.approvedBy = req.user._id;
    inspection.approverName = `${req.user.firstName} ${req.user.lastName} (QC Manager)`;
    inspection.approvalDate = new Date();
    await inspection.save();

    const batch = await Batch.findById(inspection.batch);
    if (batch) {
      if (inspection.overallResult === 'PASS') {
        batch.status = BATCH_STATUS.READY_FOR_DISPATCH;
        batch.qcStatus = 'PASS';
        batch.certificateNumber = `HTC-${batch.batchId}`;
        batch.certificateGeneratedAt = new Date();
      } else {
        batch.status = BATCH_STATUS.QC_FAILED;
        batch.qcStatus = 'FAIL';

        // Automatically trigger NCR
        const ncrCount = await NCR.countDocuments();
        await NCR.create({
          ncrNumber: `NCR-${new Date().getFullYear()}-${String(ncrCount + 1).padStart(5, '0')}`,
          batch: batch._id,
          batchId: batch.batchId,
          qcInspection: inspection._id,
          part: batch.part,
          heatNumber: batch.heatNumber,
          defectCategory: 'LOW_HARDNESS',
          defectDescription: inspection.remarks || 'Out of specification hardness / metallurgical parameters',
          affectedQuantity: batch.outputQuantity || batch.inputQuantity,
          affectedWeightKg: batch.outputWeightKg || batch.inputWeightKg,
          raisedBy: req.user._id
        });
      }
      await batch.save();
    }

    await logAudit({
      req,
      action: 'APPROVE_QC',
      module: 'QUALITY',
      recordId: inspection._id,
      entityType: 'QCInspection',
      description: `QC Inspection ${inspection.inspectionId} approved by ${req.user.username}. Result: ${inspection.overallResult}`
    });

    res.json({ success: true, message: `QC Inspection signed off. Overall Result: ${inspection.overallResult}`, inspection, batch });
  } catch (error) { next(error); }
});

export default router;

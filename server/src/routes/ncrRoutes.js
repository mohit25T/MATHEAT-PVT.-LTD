import express from 'express';
import QRCode from 'qrcode';
import { NCR } from '../models/NCR.js';
import { Batch } from '../models/Batch.js';
import { Scrap } from '../models/Inventory.js';
import { BATCH_STATUS } from '../config/constants.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// GET /api/ncr
router.get('/', authenticate, async (req, res, next) => {
  try {
    const ncrs = await NCR.find()
      .populate('batch')
      .populate('part')
      .populate('raisedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: ncrs.length, ncrs });
  } catch (error) { next(error); }
});

// POST /api/ncr/:id/disposition
router.post('/:id/disposition', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'QC_MANAGER'), async (req, res, next) => {
  try {
    const { disposition, rootCauseAnalysis, correctiveAction, preventiveAction } = req.body;
    const ncr = await NCR.findById(req.params.id);
    if (!ncr) return res.status(404).json({ success: false, message: 'NCR not found.' });

    ncr.disposition = disposition;
    ncr.rootCauseAnalysis = rootCauseAnalysis;
    ncr.correctiveAction = correctiveAction;
    ncr.preventiveAction = preventiveAction;
    ncr.authorizedBy = req.user._id;
    ncr.status = 'DISPOSITION_APPROVED';

    const originalBatch = await Batch.findById(ncr.batch);

    // If Rework is approved, create linked rework batch (e.g. HT-2026-000125-R01)
    if (disposition === 'REWORK' && originalBatch) {
      const reworkBatchId = `${originalBatch.batchId}-R01`;
      const qrDataUrl = await QRCode.toDataURL(`MATHEAT-BATCH|ID:${reworkBatchId}|REWORK_OF:${originalBatch.batchId}`);

      const reworkBatch = await Batch.create({
        batchId: reworkBatchId,
        jobOrder: originalBatch.jobOrder,
        customer: originalBatch.customer,
        part: originalBatch.part,
        grn: originalBatch.grn,
        materialGrade: originalBatch.materialGrade,
        heatNumber: originalBatch.heatNumber,
        furnace: originalBatch.furnace,
        furnaceId: originalBatch.furnaceId,
        recipe: originalBatch.recipe,
        recipeRevision: originalBatch.recipeRevision,
        inputQuantity: ncr.affectedQuantity,
        inputWeightKg: ncr.affectedWeightKg,
        status: BATCH_STATUS.REWORK,
        isRework: true,
        parentBatchId: originalBatch.batchId,
        qrCodeUrl: qrDataUrl
      });

      originalBatch.reworkBatchId = reworkBatchId;
      await originalBatch.save();

      ncr.reworkBatchId = reworkBatchId;
    }

    // If Scrap is approved, generate first-class Scrap inventory record
    if (disposition === 'SCRAP' && originalBatch) {
      const count = await Scrap.countDocuments();
      await Scrap.create({
        scrapId: `SCRP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`,
        batchId: originalBatch.batchId,
        heatNumber: originalBatch.heatNumber,
        partNumber: originalBatch.materialGrade,
        weightKg: ncr.affectedWeightKg,
        quantity: ncr.affectedQuantity,
        reason: ncr.defectDescription,
        estimatedValue: Number(ncr.affectedWeightKg * 35) // Scrap market rate approx ₹35/kg
      });
    }

    await ncr.save();

    await logAudit({
      req,
      action: 'APPROVE_NCR_DISPOSITION',
      module: 'NCR',
      recordId: ncr._id,
      entityType: 'NCR',
      description: `Approved disposition ${disposition} for NCR ${ncr.ncrNumber}`
    });

    res.json({ success: true, message: `Disposition ${disposition} approved.`, ncr });
  } catch (error) { next(error); }
});

export default router;

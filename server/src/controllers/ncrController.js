import QRCode from 'qrcode';
import { NCR } from '../models/NCR.js';
import { Batch } from '../models/Batch.js';
import { Scrap } from '../models/Inventory.js';
import { BATCH_STATUS } from '../config/constants.js';
import { logAudit } from '../middleware/audit.js';

export const getAll = async (req, res, next) => {
  try {
    const ncrs = await NCR.find()
      .populate('batch')
      .populate('part')
      .populate('raisedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: ncrs.length, ncrs, data: ncrs });
  } catch (error) { next(error); }
};

// 1.1 DELETE NCR
export const deleteNcr = async (req, res, next) => {
  try {
    const ncr = await NCR.findByIdAndDelete(req.params.id);
    if (!ncr) return res.status(404).json({ success: false, message: 'NCR not found.' });
    res.json({ success: true, message: 'NCR deleted successfully.' });
  } catch (error) { next(error); }
};

// 2. DISPOSITION NCR
export const disposition = async (req, res, next) => {
  try {
    const { disposition: dispChoice, rootCauseAnalysis, correctiveAction, preventiveAction } = req.body;
    const ncr = await NCR.findById(req.params.id);
    if (!ncr) return res.status(404).json({ success: false, message: 'NCR not found.' });

    ncr.disposition = dispChoice;
    ncr.rootCauseAnalysis = rootCauseAnalysis;
    ncr.correctiveAction = correctiveAction;
    ncr.preventiveAction = preventiveAction;
    ncr.authorizedBy = req.user?._id;
    ncr.status = 'DISPOSITION_APPROVED';

    const originalBatch = await Batch.findById(ncr.batch);

    if (dispChoice === 'REWORK' && originalBatch) {
      const reworkBatchId = `${originalBatch.batchId}-R01`;
      const qrDataUrl = await QRCode.toDataURL(`MATHEAT-BATCH|ID:${reworkBatchId}|REWORK_OF:${originalBatch.batchId}`);

      await Batch.create({
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

    if (dispChoice === 'SCRAP' && originalBatch) {
      const count = await Scrap.countDocuments();
      await Scrap.create({
        scrapId: `SCRP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`,
        batchId: originalBatch.batchId,
        heatNumber: originalBatch.heatNumber,
        partNumber: originalBatch.materialGrade,
        weightKg: ncr.affectedWeightKg,
        quantity: ncr.affectedQuantity,
        reason: ncr.defectDescription,
        estimatedValue: Number(ncr.affectedWeightKg * 35)
      });
    }

    await ncr.save();

    if (req.user) {
      await logAudit({
        req,
        action: 'APPROVE_NCR_DISPOSITION',
        module: 'NCR',
        recordId: ncr._id,
        entityType: 'NCR',
        description: `Approved disposition ${dispChoice} for NCR ${ncr.ncrNumber}`
      });
    }

    res.json({ success: true, message: `Disposition ${dispChoice} approved.`, ncr });
  } catch (error) { next(error); }
};

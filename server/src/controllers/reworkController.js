import { Rework } from '../models/Rework.js';
import { Batch } from '../models/Batch.js';
import { NCR } from '../models/NCR.js';

// Sequence: RT-YYYY-XXXXXX
export const generateNextReworkNumber = async () => {
  const currentYear = new Date().getFullYear();
  const reworks = await Rework.find({
    reworkNumber: /^RT-/i
  }).select('reworkNumber');

  let maxSeq = 0;
  for (const r of reworks) {
    const parts = (r.reworkNumber || '').split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    } else if (parts.length === 2) {
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    }
  }

  let nextNum = maxSeq + 1;
  let candidate = `RT-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  while (await Rework.findOne({ reworkNumber: candidate })) {
    nextNum++;
    candidate = `RT-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  }
  return candidate;
};

export const getReworks = async (req, res, next) => {
  try {
    const list = await Rework.find()
      .populate('originalBatch')
      .populate('ncr')
      .populate('customer')
      .populate('assignedFurnace')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, reworks: list, data: list });
  } catch (err) { next(err); }
};

export const getNextReworkNo = async (req, res, next) => {
  try {
    const reworkNumber = await generateNextReworkNumber();
    res.json({ success: true, reworkNumber });
  } catch (err) { next(err); }
};

export const createRework = async (req, res, next) => {
  try {
    const data = req.body;
    let reworkNumber = data.reworkNumber;
    if (!reworkNumber || reworkNumber === 'AUTO') {
      reworkNumber = await generateNextReworkNumber();
    }

    const batch = await Batch.findOne({
      $or: [{ batchId: data.originalBatchId }, { _id: data.originalBatchId }]
    });

    const origHeat = batch?.heatNumber || data.originalHeatNumber || 'HT-2026-000001';
    const reworkHeat = `${origHeat}-R01`;

    const rework = await Rework.create({
      ...data,
      reworkNumber,
      originalBatch: batch?._id,
      originalBatchId: batch?.batchId || data.originalBatchId,
      originalHeatNumber: origHeat,
      reworkHeatNumber: reworkHeat,
      customer: batch?.customer,
      customerName: data.customerName,
      partNumber: batch?.partNumber || data.partNumber || 'PART-01',
      quantityPcs: Number(data.quantityPcs) || batch?.inputQuantity || 1,
      weightKg: Number(data.weightKg) || batch?.inputWeightKg || 1,
      reworkReason: data.reworkReason || 'Low hardness deviation requiring re-tempering',
      reworkProcess: data.reworkProcess || 'Re-temper at 220°C for 2.5 hours',
      status: 'PLANNED',
      authorizedBy: req.user?._id
    });

    // Mark original batch with rework linkage without overwriting history
    if (batch) {
      batch.isRework = true;
      batch.reworkBatchId = reworkNumber;
      await batch.save();
    }

    res.status(201).json({
      success: true,
      message: `Rework order ${reworkNumber} created linked to original heat ${rework.originalHeatNumber}`,
      rework
    });
  } catch (err) { next(err); }
};

export const updateReworkStatus = async (req, res, next) => {
  try {
    const { status, completedAt, finalHardness } = req.body;
    const updated = await Rework.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(completedAt ? { completedAt: new Date(completedAt) } : {}),
        ...(finalHardness ? { targetHardness: finalHardness } : {})
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Rework not found' });
    res.json({ success: true, rework: updated });
  } catch (err) { next(err); }
};

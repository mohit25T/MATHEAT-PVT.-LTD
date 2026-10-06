import QRCode from 'qrcode';
import { JobCard } from '../models/JobCard.js';
import { JobOrder } from '../models/JobOrder.js';
import { Customer } from '../models/Customer.js';
import { GRN } from '../models/GRN.js';
import { Recipe } from '../models/Recipe.js';

// Sequence generator: JC-YYYY-XXXXXX (e.g. JC-2026-000001)
export const generateNextJobCardNumber = async () => {
  const currentYear = new Date().getFullYear();
  const cards = await JobCard.find({
    jobCardNumber: /^JC-/i
  }).select('jobCardNumber');

  let maxSeq = 0;
  for (const c of cards) {
    const parts = (c.jobCardNumber || '').split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    } else if (parts.length === 2) {
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    }
  }

  let nextNum = maxSeq + 1;
  let candidate = `JC-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  while (await JobCard.findOne({ jobCardNumber: candidate })) {
    nextNum++;
    candidate = `JC-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  }
  return candidate;
};

export const getJobCards = async (req, res, next) => {
  try {
    const list = await JobCard.find()
      .populate('jobOrder')
      .populate('customer')
      .populate('grn')
      .populate('recipe')
      .populate('batches')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, jobCards: list, data: list });
  } catch (err) { next(err); }
};

export const getNextJobCardNo = async (req, res, next) => {
  try {
    const jobCardNumber = await generateNextJobCardNumber();
    res.json({ success: true, jobCardNumber });
  } catch (err) { next(err); }
};

export const createJobCard = async (req, res, next) => {
  try {
    const data = req.body;
    let jobCardNumber = data.jobCardNumber;
    if (!jobCardNumber || jobCardNumber === 'AUTO') {
      jobCardNumber = await generateNextJobCardNumber();
    }

    const jobOrder = await JobOrder.findById(data.jobOrder || data.jobOrderId)
      .populate('part');
    if (!jobOrder) {
      return res.status(404).json({ success: false, message: 'Job Order not found' });
    }

    // Try finding linked recipe if not explicitly supplied
    let recipeDoc = null;
    if (data.recipe) {
      recipeDoc = await Recipe.findById(data.recipe);
    } else if (jobOrder.part?._id) {
      recipeDoc = await Recipe.findOne({ part: jobOrder.part._id, isApproved: true }) ||
                  await Recipe.findOne({ part: jobOrder.part._id });
    }
    if (!recipeDoc && (jobOrder.part?.materialGrade || data.materialGrade)) {
      const grade = (jobOrder.part?.materialGrade || data.materialGrade || '').toUpperCase();
      recipeDoc = await Recipe.findOne({ materialGrade: grade, isApproved: true }) ||
                  await Recipe.findOne({ materialGrade: grade });
    }

    // Generate secure QR payload
    const qrPayload = JSON.stringify({
      type: 'MATHEAT-TRAVELER',
      jc: jobCardNumber,
      jo: jobOrder.jobOrderNumber,
      heat: jobOrder.heatNumber,
      part: jobOrder.partNumber || jobOrder.part?.partNumber,
      qty: jobOrder.targetQuantity,
      process: jobOrder.requiredProcess,
      hardness: jobOrder.requiredHardness
    });

    const qrCodeUrl = await QRCode.toDataURL(qrPayload, {
      width: 250,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' }
    });

    const jobCard = await JobCard.create({
      jobCardNumber,
      jobOrder: jobOrder._id,
      jobOrderNumber: jobOrder.jobOrderNumber,
      customer: jobOrder.customer,
      customerName: data.customerName || (typeof jobOrder.customer === 'string' ? jobOrder.customer : 'Customer'),
      grn: jobOrder.grn,
      grnNumber: data.grnNumber || '',
      partNumber: jobOrder.partNumber || jobOrder.part?.partNumber || data.partNumber || 'PART',
      partName: jobOrder.partName || jobOrder.part?.partName || data.partName || 'Component',
      drawingNumber: data.drawingNumber || jobOrder.part?.drawingNumber || `DWG-${jobOrder.partNumber || 'PART'}`,
      materialGrade: data.materialGrade || jobOrder.part?.materialGrade || 'EN31 / 20MnCr5',
      heatNumber: jobOrder.heatNumber,
      quantityPcs: jobOrder.targetQuantity,
      weightKg: jobOrder.targetWeight,
      requiredProcess: jobOrder.requiredProcess,
      processRevision: data.processRevision || recipeDoc?.revision || 'V1',
      recipe: recipeDoc?._id || undefined,
      recipeCode: recipeDoc?.recipeCode || data.recipeCode || undefined,
      targetTemperature: data.targetTemperature ?? recipeDoc?.targetTemperature,
      soakingTimeMinutes: data.soakingTimeMinutes ?? recipeDoc?.soakingTimeMinutes,
      carbonPotential: data.carbonPotential ?? recipeDoc?.carbonPotential,
      quenchMedium: data.quenchMedium || recipeDoc?.quenchMedium || 'OIL',
      transferTimeSeconds: data.transferTimeSeconds ?? recipeDoc?.transferTimeSeconds ?? 15,
      temperingTemperature: data.temperingTemperature ?? recipeDoc?.temperingTemperature,
      temperingTimeMinutes: data.temperingTimeMinutes ?? recipeDoc?.temperingTimeMinutes,
      requiredHardness: jobOrder.requiredHardness,
      requiredCaseDepth: jobOrder.requiredCaseDepth,
      priority: jobOrder.priority || 'STANDARD',
      deliveryDate: jobOrder.deliveryDate,
      specialInstructions: jobOrder.specialInstructions || '',
      qrCodeUrl,
      createdBy: req.user?._id
    });

    // Update Job Order status to READY_FOR_PRODUCTION
    jobOrder.status = 'READY_FOR_PRODUCTION';
    await jobOrder.save();

    res.status(201).json({
      success: true,
      message: `Job Card ${jobCardNumber} generated successfully.`,
      jobCard
    });
  } catch (err) { next(err); }
};

export const getJobCardById = async (req, res, next) => {
  try {
    const card = await JobCard.findById(req.params.id)
      .populate('jobOrder')
      .populate('customer')
      .populate('grn')
      .populate('recipe')
      .populate('batches');
    if (!card) return res.status(404).json({ success: false, message: 'Job Card not found' });
    res.json({ success: true, jobCard: card });
  } catch (err) { next(err); }
};

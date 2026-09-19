import express from 'express';
import { JobOrder } from '../models/JobOrder.js';
import { Part } from '../models/Part.js';
import { GRN } from '../models/GRN.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// GET /api/job-orders
router.get('/', authenticate, async (req, res, next) => {
  try {
    const jobOrders = await JobOrder.find()
      .populate('customer', 'companyName customerCode')
      .populate('part')
      .populate('grn')
      .populate('batches')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: jobOrders.length, jobOrders });
  } catch (error) { next(error); }
});

// POST /api/job-orders
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER'), async (req, res, next) => {
  try {
    const {
      customer,
      customerPoNumber,
      part: partId,
      grn: grnId,
      targetQuantity,
      targetWeight,
      deliveryDate,
      priority,
      specialInstructions
    } = req.body;

    const part = await Part.findById(partId);
    if (!part) return res.status(400).json({ success: false, message: 'Part not found' });

    let heatNumber = req.body.heatNumber;
    if (grnId) {
      const grn = await GRN.findById(grnId);
      if (grn) heatNumber = grn.heatNumber;
    }

    if (!heatNumber) {
      return res.status(400).json({ success: false, message: 'Heat Number is mandatory for Job Order traceability.' });
    }

    const count = await JobOrder.countDocuments();
    const jobOrderNumber = `JO-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const jobOrder = await JobOrder.create({
      jobOrderNumber,
      customer,
      customerPoNumber,
      part: part._id,
      grn: grnId,
      heatNumber,
      targetQuantity: Number(targetQuantity),
      targetWeight: Number(targetWeight),
      requiredProcess: part.requiredProcess,
      requiredHardness: `${part.hardnessSpec.min}-${part.hardnessSpec.max} ${part.hardnessSpec.scale}`,
      requiredCaseDepth: part.caseDepthSpec?.required ? `${part.caseDepthSpec.effectiveMin}-${part.caseDepthSpec.effectiveMax} mm` : 'N/A',
      deliveryDate: new Date(deliveryDate),
      priority: priority || 'NORMAL',
      specialInstructions,
      createdBy: req.user._id
    });

    await logAudit({
      req,
      action: 'CREATE_JOB_ORDER',
      module: 'JOB_ORDER',
      recordId: jobOrder._id,
      entityType: 'JobOrder',
      newValue: { jobOrderNumber, heatNumber, customerPoNumber }
    });

    res.status(201).json({ success: true, jobOrder });
  } catch (error) { next(error); }
});

export default router;

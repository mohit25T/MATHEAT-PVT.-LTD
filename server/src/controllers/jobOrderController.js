import mongoose from 'mongoose';
import { JobOrder } from '../models/JobOrder.js';
import { Customer } from '../models/Customer.js';
import { Part } from '../models/Part.js';
import { GRN } from '../models/GRN.js';
import { logAudit } from '../middleware/audit.js';
import { generateNextHeatNumber } from './batchController.js';

// 1. GET ALL JOB ORDERS
export const getAll = async (req, res, next) => {
  try {
    const jobOrders = await JobOrder.find()
      .populate('customer', 'companyName customerCode gstin')
      .populate('part', 'partNumber partName materialGrade hardnessSpec caseDepthSpec')
      .populate('grn', 'grnNumber heatNumber')
      .populate('batches', 'batchId status qcStatus')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobOrders.length,
      jobOrders,
      data: jobOrders
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET SINGLE JOB ORDER
export const getById = async (req, res, next) => {
  try {
    const jobOrder = await JobOrder.findById(req.params.id)
      .populate('customer')
      .populate('part')
      .populate('grn')
      .populate('batches');

    if (!jobOrder) {
      return res.status(404).json({ success: false, message: 'Job Order not found' });
    }

    res.json({ success: true, jobOrder });
  } catch (error) {
    next(error);
  }
};

// HELPER: GENERATE NEXT JO-YYYY-XXXXXX JOB ORDER NUMBER
export const generateNextJobOrderNumber = async () => {
  const currentYear = new Date().getFullYear();
  const orders = await JobOrder.find({
    jobOrderNumber: /^JO-/i
  }).select('jobOrderNumber');

  let maxSeq = 0;
  for (const o of orders) {
    const parts = (o.jobOrderNumber || '').split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    } else if (parts.length === 2) {
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    }
  }

  let nextNum = maxSeq + 1;
  let candidate = `JO-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  while (await JobOrder.findOne({ jobOrderNumber: candidate })) {
    nextNum++;
    candidate = `JO-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  }
  return candidate;
};

// GET NEXT SEQUENTIAL JOB ORDER NUMBER (e.g. JO-00001)
export const getNextJobOrderNumber = async (req, res, next) => {
  try {
    const jobOrderNumber = await generateNextJobOrderNumber();
    res.json({ success: true, jobOrderNumber });
  } catch (error) {
    next(error);
  }
};

// 3. CREATE NEW JOB ORDER
export const create = async (req, res, next) => {
  try {
    const {
      customer: customerInput,
      customerPoNumber,
      poDate,
      part: partInput,
      partNumber: partNumberInput,
      partName: partNameInput,
      grn: grnId,
      heatNumber: heatNumberInput,
      targetQuantity,
      targetWeight,
      requiredProcess,
      requiredHardness,
      requiredCaseDepth,
      deliveryDate,
      priority,
      specialInstructions
    } = req.body;

    if (!customerPoNumber) {
      return res.status(400).json({ success: false, message: 'Customer PO Number is required.' });
    }

    // Resolve or Auto-create Customer
    let customerDoc = null;
    if (mongoose.Types.ObjectId.isValid(customerInput)) {
      customerDoc = await Customer.findById(customerInput);
    }
    if (!customerDoc) {
      const companyName = (typeof customerInput === 'string' && customerInput.trim())
        ? customerInput.trim()
        : 'WALK-IN CLIENT';
      customerDoc = await Customer.findOne({ companyName });
      if (!customerDoc) {
        const codeSuffix = Math.floor(1000 + Math.random() * 9000);
        customerDoc = await Customer.create({
          customerCode: `CUST-${codeSuffix}`,
          companyName,
          customerType: 'regular',
          paymentTerms: '30 Days Net'
        });
      }
    }

    // Resolve or Auto-create Part
    let partDoc = null;
    if (mongoose.Types.ObjectId.isValid(partInput)) {
      partDoc = await Part.findById(partInput);
    }
    if (!partDoc) {
      const pNum = partNumberInput || (typeof partInput === 'string' ? partInput : `PART-${Date.now().toString().slice(-4)}`);
      partDoc = await Part.findOne({ partNumber: pNum });
      if (!partDoc) {
        partDoc = await Part.create({
          partNumber: pNum,
          partName: partNameInput || pNum,
          customer: customerDoc._id,
          drawingNumber: `DWG-${pNum}`,
          revision: 'R1',
          materialGrade: 'EN31',
          standard: 'IS 5517',
          weightPerPiece: targetQuantity && targetWeight ? Number((Number(targetWeight) / Number(targetQuantity)).toFixed(3)) : 1.0,
          requiredProcess: requiredProcess || 'Hardening & Tempering',
          hardnessSpec: { scale: 'HRC', min: 58, max: 62, target: 60 }
        });
      }
    }

    // Resolve Heat Number (mandatory for aerospace/automotive traceability)
    let heatNumber = heatNumberInput;
    if (!heatNumber && grnId && mongoose.Types.ObjectId.isValid(grnId)) {
      const grn = await GRN.findById(grnId);
      if (grn) heatNumber = grn.heatNumber;
    }
    if (!heatNumber) {
      heatNumber = await generateNextHeatNumber();
    }

    // Generate unique sequential Job Order Number (format: JO-00001)
    let jobOrderNumber = req.body.jobOrderNumber;
    if (!jobOrderNumber || !jobOrderNumber.trim()) {
      jobOrderNumber = await generateNextJobOrderNumber();
    } else {
      jobOrderNumber = jobOrderNumber.trim().toUpperCase();
    }

    const newJobOrder = await JobOrder.create({
      jobOrderNumber,
      customer: customerDoc._id,
      customerPoNumber: customerPoNumber.trim().toUpperCase(),
      poDate: poDate ? new Date(poDate) : new Date(),
      part: partDoc._id,
      grn: grnId && mongoose.Types.ObjectId.isValid(grnId) ? grnId : undefined,
      heatNumber: heatNumber.trim().toUpperCase(),
      targetQuantity: Number(targetQuantity) || 1,
      targetWeight: Number(targetWeight) || 1,
      requiredProcess: requiredProcess || partDoc.requiredProcess || 'Hardening & Tempering',
      requiredHardness: requiredHardness || (partDoc.hardnessSpec ? `${partDoc.hardnessSpec.min}-${partDoc.hardnessSpec.max} ${partDoc.hardnessSpec.scale}` : '58-62 HRC'),
      requiredCaseDepth: requiredCaseDepth || '0.80 - 1.10 mm',
      deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: priority ? String(priority).trim().toUpperCase() : 'STANDARD',
      specialInstructions: specialInstructions || '',
      createdBy: req.user?._id
    });

    const populatedJobOrder = await JobOrder.findById(newJobOrder._id)
      .populate('customer', 'companyName customerCode')
      .populate('part', 'partNumber partName');

    if (req.user) {
      await logAudit({
        req,
        action: 'CREATE_JOB_ORDER',
        module: 'JOB_ORDER',
        recordId: newJobOrder._id,
        entityType: 'JobOrder',
        newValue: { jobOrderNumber, heatNumber, customerPoNumber }
      });
    }

    res.status(201).json({
      success: true,
      message: `Job Order #${jobOrderNumber} created successfully`,
      jobOrder: populatedJobOrder
    });
  } catch (error) {
    next(error);
  }
};

// 4. UPDATE JOB ORDER
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await JobOrder.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
      .populate('customer', 'companyName customerCode')
      .populate('part', 'partNumber partName');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Job Order not found' });
    }

    res.json({ success: true, message: 'Job Order updated successfully', jobOrder: updated });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE JOB ORDER
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await JobOrder.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Job Order not found' });
    }

    res.json({ success: true, message: `Job Order #${deleted.jobOrderNumber} deleted successfully` });
  } catch (error) {
    next(error);
  }
};

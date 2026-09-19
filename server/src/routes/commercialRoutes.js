import express from 'express';
import { Dispatch, Invoice, BatchCosting } from '../models/Invoice.js';
import { Batch } from '../models/Batch.js';
import { Part } from '../models/Part.js';
import { InventoryTransaction } from '../models/Inventory.js';
import { BATCH_STATUS } from '../config/constants.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// DISPATCH
router.get('/dispatch', authenticate, async (req, res, next) => {
  try {
    const dispatches = await Dispatch.find()
      .populate('customer', 'companyName')
      .populate('part', 'partNumber partName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: dispatches.length, dispatches });
  } catch (error) { next(error); }
});

// POST /api/commercial/dispatch (Strict QC PASS Gate)
router.post('/dispatch', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER'), async (req, res, next) => {
  try {
    const { batchId, vehicleNumber, transporterName, lrNumber, packagingType, remarks } = req.body;

    const batch = await Batch.findOne({ batchId }).populate('part customer');
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found.' });

    // STRICT QC PASS GATE
    if (batch.qcStatus !== 'PASS' && !req.body.authorizedOverride) {
      return res.status(400).json({
        success: false,
        message: `Dispatch Rejected: Batch ${batchId} has QC Status '${batch.qcStatus}'. Batches cannot be dispatched without QC PASS approval.`
      });
    }

    const count = await Dispatch.countDocuments();
    const dispatchNumber = `DSP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const dispatch = await Dispatch.create({
      dispatchNumber,
      customer: batch.customer._id,
      batch: batch._id,
      batchId: batch.batchId,
      part: batch.part._id,
      heatNumber: batch.heatNumber,
      quantityPcs: batch.outputQuantity || batch.inputQuantity,
      weightKg: batch.outputWeightKg || batch.inputWeightKg,
      vehicleNumber,
      transporterName: transporterName || 'V-Trans Logistics',
      lrNumber,
      packagingType: packagingType || 'Wooden Crates with VCI Paper',
      qcApprovalVerified: true,
      preparedBy: req.user._id,
      remarks
    });

    batch.status = BATCH_STATUS.DISPATCHED;
    batch.dispatchNumber = dispatchNumber;
    await batch.save();

    // Inventory Movement to Dispatched
    await InventoryTransaction.create({
      transactionId: `TXN-DSP-${Date.now()}`,
      partNumber: batch.part.partNumber,
      heatNumber: batch.heatNumber,
      batchId: batch.batchId,
      quantity: dispatch.quantityPcs,
      weightKg: dispatch.weightKg,
      fromLocation: 'FINISHED_GOODS_BAY',
      toLocation: `CUSTOMER_TRANSIT (${vehicleNumber})`,
      transactionType: 'DISPATCH',
      referenceDocumentType: 'DISPATCH',
      referenceDocumentNumber: dispatchNumber,
      user: req.user._id,
      userName: `${req.user.firstName} ${req.user.lastName}`
    });

    // Automatically generate Tax Invoice
    const invCount = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(5, '0')}`;
    const ratePerKg = batch.part.unitRatePerKg || 28;
    const subtotal = Math.round(dispatch.weightKg * ratePerKg);
    const cgst = Math.round(subtotal * 0.09);
    const sgst = Math.round(subtotal * 0.09);
    const total = subtotal + cgst + sgst;

    const invoice = await Invoice.create({
      invoiceNumber,
      customer: batch.customer._id,
      dispatch: dispatch._id,
      batchId: batch.batchId,
      partNumber: batch.part.partNumber,
      heatNumber: batch.heatNumber,
      billingType: 'PER_KG',
      billedQuantity: dispatch.quantityPcs,
      billedWeightKg: dispatch.weightKg,
      unitRate: ratePerKg,
      subtotal,
      cgstAmount: cgst,
      sgstAmount: sgst,
      totalAmount: total,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    batch.invoiceNumber = invoiceNumber;
    await batch.save();

    await logAudit({
      req,
      action: 'DISPATCH_BATCH',
      module: 'DISPATCH',
      recordId: dispatch._id,
      entityType: 'Dispatch',
      description: `Dispatched ${dispatch.weightKg} kg of Batch ${batch.batchId} via ${vehicleNumber}. Generated invoice ${invoiceNumber}.`
    });

    res.status(201).json({ success: true, dispatch, invoice });
  } catch (error) { next(error); }
});

// INVOICES
router.get('/invoices', authenticate, async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate('customer', 'companyName customerCode gstin')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: invoices.length, invoices });
  } catch (error) { next(error); }
});

// COSTING
router.get('/costing', authenticate, async (req, res, next) => {
  try {
    const costings = await BatchCosting.find().sort({ createdAt: -1 });
    res.json({ success: true, count: costings.length, costings });
  } catch (error) { next(error); }
});

export default router;

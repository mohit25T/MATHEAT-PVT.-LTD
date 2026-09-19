import express from 'express';
import { GRN } from '../models/GRN.js';
import { Part } from '../models/Part.js';
import { Inventory, InventoryTransaction } from '../models/Inventory.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// GET /api/grn
router.get('/', authenticate, async (req, res, next) => {
  try {
    const grns = await GRN.find()
      .populate('customer', 'companyName customerCode')
      .populate('supplier', 'name supplierCode')
      .populate('part')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: grns.length, grns });
  } catch (error) { next(error); }
});

// POST /api/grn
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER'), async (req, res, next) => {
  try {
    const {
      ownership,
      customer,
      supplier,
      challanNumber,
      poNumber,
      partNumber,
      heatNumber,
      castNumber,
      receivedQuantity,
      receivedWeight,
      acceptedQuantity,
      acceptedWeight,
      rejectedQuantity,
      rejectedWeight,
      chemicalComposition,
      storageLocation,
      remarks
    } = req.body;

    // Validate Part
    const part = await Part.findOne({ partNumber: partNumber?.toUpperCase() });
    if (!part) {
      return res.status(400).json({ success: false, message: `Part with number ${partNumber} not found in Part Master.` });
    }

    // Auto generate GRN Number
    const count = await GRN.countDocuments();
    const grnNumber = `GRN-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const grn = await GRN.create({
      grnNumber,
      ownership: ownership || 'CUSTOMER',
      customer: ownership === 'CUSTOMER' ? (customer || part.customer) : undefined,
      supplier: ownership === 'COMPANY' ? supplier : undefined,
      challanNumber,
      poNumber,
      part: part._id,
      partNumber: part.partNumber,
      partName: part.partName,
      materialGrade: part.materialGrade,
      heatNumber: heatNumber.toUpperCase().trim(),
      castNumber,
      chemicalComposition: chemicalComposition || {},
      receivedQuantity: Number(receivedQuantity),
      receivedWeight: Number(receivedWeight),
      acceptedQuantity: Number(acceptedQuantity || receivedQuantity),
      acceptedWeight: Number(acceptedWeight || receivedWeight),
      rejectedQuantity: Number(rejectedQuantity || 0),
      rejectedWeight: Number(rejectedWeight || 0),
      storageLocation: storageLocation || 'RAW-MATERIAL-BAY-1',
      inspectedBy: req.user._id,
      remarks
    });

    // Create / Update traceable Inventory item
    await Inventory.create({
      part: part._id,
      partNumber: part.partNumber,
      heatNumber: grn.heatNumber,
      ownership: grn.ownership,
      customer: grn.customer,
      quantity: grn.acceptedQuantity,
      weightKg: grn.acceptedWeight,
      location: grn.storageLocation,
      status: 'ACCEPTED'
    });

    // Immutable Inventory Transaction
    await InventoryTransaction.create({
      transactionId: `TXN-${Date.now()}`,
      partNumber: part.partNumber,
      heatNumber: grn.heatNumber,
      ownership: grn.ownership,
      customerName: req.user.username,
      quantity: grn.acceptedQuantity,
      weightKg: grn.acceptedWeight,
      fromLocation: 'INWARD_DOCK',
      toLocation: grn.storageLocation,
      transactionType: 'GRN_INWARD',
      referenceDocumentType: 'GRN',
      referenceDocumentNumber: grn.grnNumber,
      user: req.user._id,
      userName: `${req.user.firstName} ${req.user.lastName}`
    });

    await logAudit({
      req,
      action: 'INWARD_GRN',
      module: 'INWARD',
      recordId: grn._id,
      entityType: 'GRN',
      newValue: { grnNumber: grn.grnNumber, heatNumber: grn.heatNumber, weight: grn.acceptedWeight }
    });

    res.status(201).json({ success: true, grn });
  } catch (error) { next(error); }
});

export default router;

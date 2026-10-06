import mongoose from 'mongoose';
import { GRN } from '../models/GRN.js';
import { Part } from '../models/Part.js';
import { Customer } from '../models/Customer.js';
import { Supplier } from '../models/Supplier.js';
import { Inventory, InventoryTransaction } from '../models/Inventory.js';
import { logAudit } from '../middleware/audit.js';

// 1. GET ALL GRNs
export const getAll = async (req, res, next) => {
  try {
    const grns = await GRN.find()
      .populate('customer', 'companyName customerCode')
      .populate('supplier', 'name supplierCode')
      .populate('part')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: grns.length, grns, data: grns });
  } catch (error) {
    next(error);
  }
};

// HELPER: GENERATE NEXT GRN-2026-000001 GRN NUMBER
export const generateNextGrnNumber = async () => {
  const currentYear = new Date().getFullYear();
  const pattern = new RegExp(`^GRN-${currentYear}-(\\d+)$`, 'i');
  const grns = await GRN.find({
    grnNumber: new RegExp(`^GRN-(${currentYear}-)?\\d+$`, 'i')
  }).select('grnNumber');

  let maxSeq = 0;
  for (const g of grns) {
    const matchYear = g.grnNumber?.match(pattern);
    if (matchYear) {
      const num = parseInt(matchYear[1], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    } else {
      const matchOld = g.grnNumber?.match(/^GRN-(\d+)$/i);
      if (matchOld) {
        const num = parseInt(matchOld[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    }
  }

  let nextNum = maxSeq + 1;
  let candidate = `GRN-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  while (await GRN.findOne({ grnNumber: candidate })) {
    nextNum++;
    candidate = `GRN-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  }
  return candidate;
};

// GET NEXT SEQUENTIAL GRN NUMBER (e.g. GRN-00001)
export const getNextGrnNumber = async (req, res, next) => {
  try {
    const grnNumber = await generateNextGrnNumber();
    res.json({ success: true, grnNumber });
  } catch (error) {
    next(error);
  }
};

// 2. CREATE INWARD GRN
export const create = async (req, res, next) => {
  try {
    const {
      ownership,
      customer,
      customerName,
      supplier,
      supplierName,
      challanNumber,
      poNumber,
      partNumber,
      partName,
      materialGrade,
      heatNumber,
      castNumber,
      receivedQuantity,
      receivedWeight,
      receivedWeightKg,
      acceptedQuantity,
      acceptedWeight,
      acceptedWeightKg,
      rejectedQuantity,
      rejectedWeight,
      chemicalComposition,
      storageLocation,
      remarks
    } = req.body;

    const actualWeight = Number(receivedWeightKg ?? receivedWeight ?? 0);
    const actualQty = Number(receivedQuantity ?? 0) || 1;
    const actualAcceptedWeight = Number(acceptedWeightKg ?? acceptedWeight ?? actualWeight);
    const actualAcceptedQty = Number(acceptedQuantity ?? actualQty);

    // Resolve Customer
    let customerObj = null;
    let resolvedCustomerName = (customerName || (typeof customer === 'string' && !mongoose.Types.ObjectId.isValid(customer) ? customer : '')).trim();

    if (customer && mongoose.Types.ObjectId.isValid(customer)) {
      customerObj = await Customer.findById(customer);
      if (customerObj) {
        resolvedCustomerName = customerObj.companyName;
      }
    }

    if (!customerObj && resolvedCustomerName) {
      customerObj = await Customer.findOne({
        $or: [
          { companyName: new RegExp(`^${resolvedCustomerName}$`, 'i') },
          { tradeName: new RegExp(`^${resolvedCustomerName}$`, 'i') },
          { name: new RegExp(`^${resolvedCustomerName}$`, 'i') }
        ]
      });
    }

    if (!customerObj && resolvedCustomerName && (!ownership || ownership === 'CUSTOMER')) {
      try {
        const prefix = resolvedCustomerName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'CUST';
        const cCount = await Customer.countDocuments();
        customerObj = await Customer.create({
          customerCode: `CUST-${prefix}-${String(cCount + 1).padStart(3, '0')}`,
          companyName: resolvedCustomerName,
          tradeName: resolvedCustomerName,
          name: resolvedCustomerName,
          customerType: 'job_work'
        });
      } catch (err) {
        console.warn('Could not auto-create customer for GRN:', err.message);
      }
    }

    if (customerObj) {
      resolvedCustomerName = customerObj.companyName;
    }

    // Resolve Supplier if COMPANY owned
    let supplierObj = null;
    let resolvedSupplierName = (supplierName || (typeof supplier === 'string' && !mongoose.Types.ObjectId.isValid(supplier) ? supplier : '')).trim();
    if (supplier && mongoose.Types.ObjectId.isValid(supplier)) {
      supplierObj = await Supplier.findById(supplier);
      if (supplierObj) {
        resolvedSupplierName = supplierObj.name;
      }
    }

    // Resolve or Auto-create Part
    const pNum = (partNumber || 'PART-STD').toUpperCase().trim();
    let part = await Part.findOne({ partNumber: pNum });
    if (!part) {
      part = await Part.create({
        partNumber: pNum,
        partName: partName || pNum,
        materialGrade: materialGrade || 'EN31',
        customer: customerObj?._id,
        weightPerPiece: actualQty > 0 ? Number((actualWeight / actualQty).toFixed(3)) : 1.0,
        requiredProcess: 'Heat Treatment',
        hardnessSpec: { scale: 'HRC', min: 58, max: 62, target: 60 }
      });
    } else if (materialGrade && (!part.materialGrade || part.materialGrade === 'EN31')) {
      part.materialGrade = materialGrade;
      await part.save().catch(() => {});
    }

    // Unique GRN Number (format: GRN-00001)
    let grnNumber = req.body.grnNumber;
    if (!grnNumber || !grnNumber.trim()) {
      grnNumber = await generateNextGrnNumber();
    } else {
      grnNumber = grnNumber.trim().toUpperCase();
    }

    const cleanHeat = (heatNumber || `HEAT-${Date.now().toString().slice(-6)}`).toUpperCase().trim();

    const grn = await GRN.create({
      grnNumber,
      ownership: ownership || 'CUSTOMER',
      customer: customerObj?._id,
      customerName: resolvedCustomerName || (ownership === 'COMPANY' ? 'Company Owned' : 'Customer Stock'),
      supplier: supplierObj?._id,
      supplierName: resolvedSupplierName || undefined,
      challanNumber: challanNumber || `DC-${Date.now().toString().slice(-4)}`,
      poNumber: poNumber || `PO-${Date.now().toString().slice(-4)}`,
      part: part._id,
      partNumber: part.partNumber,
      partName: part.partName,
      materialGrade: materialGrade || part.materialGrade || 'EN31',
      heatNumber: cleanHeat,
      castNumber: castNumber || 'N/A',
      chemicalComposition: chemicalComposition || {},
      receivedQuantity: actualQty,
      receivedWeight: actualWeight,
      acceptedQuantity: actualAcceptedQty,
      acceptedWeight: actualAcceptedWeight,
      rejectedQuantity: Number(rejectedQuantity || 0),
      rejectedWeight: Number(rejectedWeight || 0),
      storageLocation: storageLocation || 'RAW-MATERIAL-BAY-1',
      jobOrder: req.body.jobOrder || undefined,
      transporter: req.body.transporter || undefined,
      packageCount: Number(req.body.packageCount || 1),
      materialCondition: req.body.materialCondition || 'GOOD',
      vehicleNumber: req.body.vehicleNumber || undefined,
      attachedChallan: req.body.attachedChallan || undefined,
      receivedBy: req.body.receivedBy || (req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() : 'Store Inward'),
      inspectedBy: req.user?._id,
      remarks
    });

    if (req.body.jobOrder && mongoose.Types.ObjectId.isValid(req.body.jobOrder)) {
      const { JobOrder } = await import('../models/JobOrder.js');
      const jo = await JobOrder.findById(req.body.jobOrder);
      if (jo) {
        jo.grn = grn._id;
        if (grn.inspectionStatus === 'ACCEPTED') {
          jo.status = 'MATERIAL_RECEIVED';
        }
        await jo.save();
      }
    }

    await Inventory.create({
      part: part._id,
      partNumber: part.partNumber,
      heatNumber: grn.heatNumber,
      ownership: grn.ownership,
      customer: grn.customer,
      customerName: grn.customerName,
      quantity: grn.acceptedQuantity,
      weightKg: grn.acceptedWeight,
      location: grn.storageLocation,
      status: 'ACCEPTED'
    });

    await InventoryTransaction.create({
      transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      partNumber: part.partNumber,
      heatNumber: grn.heatNumber,
      ownership: grn.ownership,
      customerName: grn.customerName || (req.user?.username || 'Store Inward'),
      quantity: grn.acceptedQuantity,
      weightKg: grn.acceptedWeight,
      fromLocation: 'INWARD_DOCK',
      toLocation: grn.storageLocation,
      transactionType: 'GRN_INWARD',
      referenceDocumentType: 'GRN',
      referenceDocumentNumber: grn.grnNumber,
      user: req.user?._id,
      userName: req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() : 'Store Inward'
    });

    if (req.user) {
      await logAudit({
        req,
        action: 'INWARD_GRN',
        module: 'INWARD',
        recordId: grn._id,
        entityType: 'GRN',
        newValue: { grnNumber: grn.grnNumber, heatNumber: grn.heatNumber, weight: grn.acceptedWeight }
      });
    }

    res.status(201).json({ success: true, grn });
  } catch (error) {
    console.error('[GRN CREATE ERROR]:', error);
    next(error);
  }
};

// 3. DELETE GRN
export const deleteGrn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const grn = await GRN.findByIdAndDelete(id);
    if (!grn) {
      return res.status(404).json({ success: false, message: 'GRN record not found' });
    }
    // Also remove associated inward inventory
    await Inventory.deleteMany({ heatNumber: grn.heatNumber, partNumber: grn.partNumber });
    res.json({ success: true, message: 'GRN inward record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

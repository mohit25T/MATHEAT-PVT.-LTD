import mongoose from 'mongoose';
import { Dispatch, Invoice, BatchCosting } from '../models/Invoice.js';
import { Batch } from '../models/Batch.js';
import { InventoryTransaction } from '../models/Inventory.js';
import { BATCH_STATUS } from '../config/constants.js';
import { logAudit } from '../middleware/audit.js';

// 1. GET DISPATCHES
export const getDispatches = async (req, res, next) => {
  try {
    const dispatches = await Dispatch.find()
      .populate('customer', 'companyName')
      .populate('part', 'partNumber partName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: dispatches.length, dispatches, data: dispatches });
  } catch (error) { next(error); }
};

// 2. CREATE DISPATCH (WITH AUTOMATIC INVOICE GENERATION)
export const createDispatch = async (req, res, next) => {
  try {
    const { batchId, vehicleNumber, transporterName, lrNumber, packagingType, remarks } = req.body;

    const batch = await Batch.findOne({ batchId }).populate('part customer');
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found.' });

    if (batch.qcStatus !== 'PASS' && !req.body.authorizedOverride) {
      return res.status(400).json({
        success: false,
        message: `Dispatch Rejected: Batch ${batchId} has QC Status '${batch.qcStatus}'. Batches cannot be dispatched without QC PASS approval.`
      });
    }

    // STRICT GUARD: Dispatch blocked without signed Heat Treatment Certificate (HTC)
    if (!batch.certificateNumber && !req.body.authorizedOverride) {
      return res.status(400).json({
        success: false,
        message: `Dispatch Blocked: Batch ${batchId} does not have an issued Heat Treatment Certificate (HTC). Production cannot be dispatched without signed quality certification.`
      });
    }

    const dispatchNumber = await generateNextDispatchNumber();

    const dispatch = await Dispatch.create({
      dispatchNumber,
      customer: batch.customer?._id,
      batch: batch._id,
      batchId: batch.batchId,
      part: batch.part?._id,
      heatNumber: batch.heatNumber,
      quantityPcs: batch.outputQuantity || batch.inputQuantity || 1,
      weightKg: batch.outputWeightKg || batch.inputWeightKg || 1,
      vehicleNumber: vehicleNumber || 'MH-12-TR-0001',
      transporterName: transporterName || 'V-Trans Logistics',
      lrNumber: lrNumber || `LR-${Date.now().toString().slice(-6)}`,
      packagingType: packagingType || 'Wooden Crates with VCI Paper',
      qcApprovalVerified: true,
      preparedBy: req.user?._id,
      remarks
    });

    batch.status = BATCH_STATUS.DISPATCHED;
    batch.dispatchNumber = dispatchNumber;
    await batch.save();

    await InventoryTransaction.create({
      transactionId: `TXN-DSP-${Date.now()}`,
      partNumber: batch.part?.partNumber || 'COMPONENT',
      heatNumber: batch.heatNumber,
      batchId: batch.batchId,
      quantity: dispatch.quantityPcs,
      weightKg: dispatch.weightKg,
      fromLocation: 'FINISHED_GOODS_BAY',
      toLocation: `CUSTOMER_TRANSIT (${vehicleNumber})`,
      transactionType: 'DISPATCH',
      referenceDocumentType: 'DISPATCH',
      referenceDocumentNumber: dispatchNumber,
      user: req.user?._id,
      userName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Dispatch Dept'
    });

    const invoiceNumber = await generateNextInvoiceNumber();
    const ratePerKg = batch.part?.unitRatePerKg || batch.customer?.agreedRatePerKg || 28;
    const billedWt = dispatch.weightKg;
    const subtotal = Math.round(billedWt * ratePerKg);

    // State-Aware GST Calculation (Factory in Gujarat - Code 24)
    const customerGstin = batch.customer?.gstin || '';
    const isInterstate = Boolean(customerGstin && !customerGstin.startsWith('24'));
    let cgst = 0, sgst = 0, igst = 0;
    if (isInterstate) {
      igst = Math.round(subtotal * 0.18);
    } else {
      cgst = Math.round(subtotal * 0.09);
      sgst = Math.round(subtotal * 0.09);
    }
    const totalGst = cgst + sgst + igst;
    const grandTotal = subtotal + totalGst;

    const invoice = await Invoice.create({
      invoiceNumber,
      customer: batch.customer?._id,
      customerName: batch.customer?.companyName || 'Customer',
      companyName: batch.customer?.companyName || 'Customer',
      customerGstin: customerGstin || batch.customer?.gstin || '',
      gstNumber: customerGstin || batch.customer?.gstin || '',
      dispatch: dispatch._id,
      batchId: batch.batchId,
      partNumber: batch.part?.partNumber || 'COMPONENT',
      heatNumber: batch.heatNumber,
      billingType: 'PER_KG',
      billedQuantity: dispatch.quantityPcs,
      billedWeightKg: billedWt,
      unitRate: ratePerKg,
      subtotal,
      isInterstate,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
      totalGst,
      totalAmount: grandTotal,
      grandTotal,
      items: [{
        productId: batch.part?._id,
        name: `Job Work Charges: Heat Treatment of ${batch.part?.partNumber || 'Metal Components'} (Heat: ${batch.heatNumber})`,
        hsnCode: '998873',
        quantity: billedWt,
        unit: 'Kg',
        unitPrice: ratePerKg,
        taxableAmount: subtotal,
        gstRate: 18,
        gstAmount: totalGst,
        totalAmount: grandTotal
      }],
      transport: {
        challanNo: dispatchNumber,
        vehicleNumber: vehicleNumber || 'MH-12-TR-0001',
        transporter: transporterName || 'V-Trans Logistics',
        lrNo: lrNumber || ''
      },
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    batch.invoiceNumber = invoiceNumber;
    await batch.save();

    if (req.user) {
      await logAudit({
        req,
        action: 'DISPATCH_BATCH',
        module: 'DISPATCH',
        recordId: dispatch._id,
        entityType: 'Dispatch',
        description: `Dispatched ${dispatch.weightKg} kg of Batch ${batch.batchId} via ${vehicleNumber}. Generated invoice ${invoiceNumber}.`
      });
    }

    res.status(201).json({ success: true, dispatch, invoice });
  } catch (error) { next(error); }
};

// HELPER: GENERATE NEXT DC-YYYY-XXXXXX DISPATCH NUMBER
export const generateNextDispatchNumber = async () => {
  const currentYear = new Date().getFullYear();
  const dispatches = await Dispatch.find({
    dispatchNumber: /^DC-|^DSP-/i
  }).select('dispatchNumber');

  let maxSeq = 0;
  for (const d of dispatches) {
    const parts = (d.dispatchNumber || '').split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    } else if (parts.length === 2) {
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    }
  }

  let nextNum = maxSeq + 1;
  let candidate = `DC-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  while (await Dispatch.findOne({ dispatchNumber: candidate })) {
    nextNum++;
    candidate = `DC-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  }
  return candidate;
};

// HELPER: GENERATE NEXT INV-YYYY-XXXXXX INVOICE NUMBER
export const generateNextInvoiceNumber = async () => {
  const currentYear = new Date().getFullYear();
  const invoices = await Invoice.find({
    invoiceNumber: /^INV-|^MT-/i
  }).select('invoiceNumber');

  let maxSeq = 0;
  for (const inv of invoices) {
    const parts = (inv.invoiceNumber || '').split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    } else if (parts.length === 4) {
      const num = parseInt(parts[3], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    } else if (parts.length === 2) {
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    }
  }

  let nextNum = maxSeq + 1;
  let candidate = `INV-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  while (await Invoice.findOne({ invoiceNumber: candidate })) {
    nextNum++;
    candidate = `INV-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  }
  return candidate;
};

// 3. GET NEXT SEQUENTIAL INVOICE NUMBER (e.g. MT-00001)
export const getNextInvoiceNumber = async (req, res, next) => {
  try {
    const invoiceNumber = await generateNextInvoiceNumber();
    res.json({ success: true, invoiceNumber });
  } catch (error) { next(error); }
};

// 4. CREATE TAX INVOICE (MANUAL / CUSTOMER BILLING)
export const createInvoice = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // Clean null or empty string or invalid customer / dispatch ObjectIds
    if (data.customer === '' || data.customer === 'null' || !data.customer || !mongoose.Types.ObjectId.isValid(data.customer)) {
      delete data.customer;
    }
    if (data.dispatch === '' || data.dispatch === 'null' || !data.dispatch || !mongoose.Types.ObjectId.isValid(data.dispatch)) {
      delete data.dispatch;
    }

    // Auto-generate invoice number if missing (format: MT-00001)
    if (!data.invoiceNumber || !data.invoiceNumber.trim()) {
      data.invoiceNumber = await generateNextInvoiceNumber();
    } else {
      data.invoiceNumber = data.invoiceNumber.trim().toUpperCase();
    }

    // Check duplicate
    const existing = await Invoice.findOne({ invoiceNumber: data.invoiceNumber });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Invoice number ${data.invoiceNumber} already exists.`
      });
    }

    // Ensure grandTotal is populated
    data.grandTotal = data.grandTotal || data.totalAmount || 0;
    data.totalAmount = data.grandTotal;

    const newInvoice = await Invoice.create(data);

    if (req.user) {
      await logAudit({
        req,
        action: 'CREATE_TAX_INVOICE',
        module: 'COMMERCIAL',
        recordId: newInvoice._id,
        entityType: 'Invoice',
        description: `Created Tax Invoice ${newInvoice.invoiceNumber} for ${newInvoice.companyName || newInvoice.customerName || 'Customer'} with total ₹${newInvoice.grandTotal}.`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Tax Invoice created successfully!',
      invoice: newInvoice
    });
  } catch (error) { next(error); }
};

// 5. GET INVOICES (WITH SEARCH & STATUS FILTERING)
export const getInvoices = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { invoiceNumber: regex },
        { customerName: regex },
        { companyName: regex },
        { phone: regex },
        { batchId: regex }
      ];
    }

    const invoices = await Invoice.find(query)
      .populate('customer', 'companyName customerCode gstin phone email billingAddress shippingAddress city state pincode')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: invoices.length, invoices, data: invoices });
  } catch (error) { next(error); }
};

// 6. GET SINGLE INVOICE BY ID
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'companyName customerCode gstin phone email billingAddress shippingAddress city state pincode')
      .populate('dispatch');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, invoice });
  } catch (error) { next(error); }
};

// 7. UPDATE INVOICE
export const updateInvoice = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.customer === '' || data.customer === 'null') delete data.customer;
    if (data.dispatch === '' || data.dispatch === 'null') delete data.dispatch;

    data.grandTotal = data.grandTotal || data.totalAmount || 0;
    data.totalAmount = data.grandTotal;

    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, message: 'Invoice updated successfully!', invoice: updated });
  } catch (error) { next(error); }
};

// 8. DELETE INVOICE
export const deleteInvoice = async (req, res, next) => {
  try {
    const deleted = await Invoice.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.json({ success: true, message: 'Invoice deleted successfully!' });
  } catch (error) { next(error); }
};

// 9. GET BATCH COSTING
export const getCosting = async (req, res, next) => {
  try {
    const costings = await BatchCosting.find().sort({ createdAt: -1 });
    res.json({ success: true, count: costings.length, costings, data: costings });
  } catch (error) { next(error); }
};


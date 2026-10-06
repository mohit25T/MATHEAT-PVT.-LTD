import mongoose from 'mongoose';
import { Enquiry } from '../models/Enquiry.js';
import { Quotation } from '../models/Quotation.js';
import { JobOrder } from '../models/JobOrder.js';
import { Customer } from '../models/Customer.js';
import { Part } from '../models/Part.js';
import { generateNextJobOrderNumber } from './jobOrderController.js';

// Sequence generator for Enquiries: ENQ-2026-000001, ENQ-2026-000002...
export const generateNextEnquiryNumber = async () => {
  const currentYear = new Date().getFullYear();
  const pattern = new RegExp(`^ENQ-${currentYear}-(\\d+)$`, 'i');
  const enquiries = await Enquiry.find({ enquiryNumber: new RegExp(`^ENQ-(${currentYear}-)?\\d+$`, 'i') }).select('enquiryNumber');

  let maxSeq = 0;
  for (const e of enquiries) {
    const matchYear = e.enquiryNumber?.match(pattern);
    if (matchYear) {
      const num = parseInt(matchYear[1], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    } else {
      const matchOld = e.enquiryNumber?.match(/^ENQ-(\d+)$/i);
      if (matchOld) {
        const num = parseInt(matchOld[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    }
  }
  return `ENQ-${currentYear}-${String(maxSeq + 1).padStart(6, '0')}`;
};

// Sequence generator for Quotations: QT-2026-000001, QT-2026-000002...
export const generateNextQuotationNumber = async () => {
  const currentYear = new Date().getFullYear();
  const pattern = new RegExp(`^QT-${currentYear}-(\\d+)$`, 'i');
  const quotations = await Quotation.find({ quotationNumber: new RegExp(`^QT-(${currentYear}-)?\\d+$`, 'i') }).select('quotationNumber');

  let maxSeq = 0;
  for (const q of quotations) {
    const matchYear = q.quotationNumber?.match(pattern);
    if (matchYear) {
      const num = parseInt(matchYear[1], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    } else {
      const matchOld = q.quotationNumber?.match(/^QT-(\d+)$/i);
      if (matchOld) {
        const num = parseInt(matchOld[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    }
  }
  return `QT-${currentYear}-${String(maxSeq + 1).padStart(6, '0')}`;
};

// --- ENQUIRIES ---

export const getEnquiries = async (req, res, next) => {
  try {
    const list = await Enquiry.find()
      .populate('customer')
      .populate('quotation')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, enquiries: list, data: list });
  } catch (err) { next(err); }
};

export const getNextEnquiryNo = async (req, res, next) => {
  try {
    const enquiryNumber = await generateNextEnquiryNumber();
    res.json({ success: true, enquiryNumber });
  } catch (err) { next(err); }
};

export const createEnquiry = async (req, res, next) => {
  try {
    const data = req.body;
    let enquiryNumber = data.enquiryNumber;
    if (!enquiryNumber || enquiryNumber === 'AUTO') {
      enquiryNumber = await generateNextEnquiryNumber();
    }

    let customerId = data.customer;
    let customerName = data.customerName;

    if (customerId && !customerName) {
      const c = await Customer.findById(customerId);
      if (c) customerName = c.companyName || c.name;
    } else if (!customerId && customerName) {
      let c = await Customer.findOne({ companyName: customerName });
      if (!c) {
        c = await Customer.create({
          companyName: customerName,
          customerCode: `CUS-${Date.now().toString().slice(-4)}`
        });
      }
      customerId = c._id;
    }

    const enquiry = await Enquiry.create({
      ...data,
      enquiryNumber,
      customer: customerId,
      customerName: customerName || 'Valued Customer',
      createdBy: req.user?._id
    });

    res.status(201).json({ success: true, enquiry, data: enquiry });
  } catch (err) { next(err); }
};

export const updateEnquiry = async (req, res, next) => {
  try {
    const updated = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, enquiry: updated });
  } catch (err) { next(err); }
};

export const deleteEnquiry = async (req, res, next) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Enquiry deleted' });
  } catch (err) { next(err); }
};

// --- QUOTATIONS ---

export const getQuotations = async (req, res, next) => {
  try {
    const list = await Quotation.find()
      .populate('customer')
      .populate('enquiry')
      .populate('jobOrder')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, quotations: list, data: list });
  } catch (err) { next(err); }
};

export const getNextQuotationNo = async (req, res, next) => {
  try {
    const quotationNumber = await generateNextQuotationNumber();
    res.json({ success: true, quotationNumber });
  } catch (err) { next(err); }
};

export const createQuotation = async (req, res, next) => {
  try {
    const data = req.body;
    let quotationNumber = data.quotationNumber;
    if (!quotationNumber || quotationNumber === 'AUTO') {
      quotationNumber = await generateNextQuotationNumber();
    }

    let customerId = data.customer;
    let customerName = data.customerName;

    if (customerId && !customerName) {
      const c = await Customer.findById(customerId);
      if (c) customerName = c.companyName || c.name;
    } else if (!customerId && customerName) {
      let c = await Customer.findOne({ companyName: customerName });
      if (!c) {
        c = await Customer.create({
          companyName: customerName,
          customerCode: `CUS-${Date.now().toString().slice(-4)}`
        });
      }
      customerId = c._id;
    }

    const qty = Number(data.quantity) || 1;
    const rate = Number(data.rate) || 0;
    const minCharge = Number(data.minimumJobCharge) || 0;
    const setup = Number(data.setupCharge) || 0;
    const testing = Number(data.testingCharge) || 0;
    const packing = Number(data.packingCharge) || 0;
    const transport = Number(data.transportCharge) || 0;
    
    const baseAmount = Math.max(qty * rate, minCharge) + setup + testing + packing + transport;
    const gstRate = Number(data.gstRate) || 18;
    const gstAmount = Number(((baseAmount * gstRate) / 100).toFixed(2));
    const totalAmount = Number((baseAmount + gstAmount).toFixed(2));

    const quotation = await Quotation.create({
      ...data,
      quotationNumber,
      customer: customerId,
      customerName: customerName || 'Valued Customer',
      subtotal: baseAmount,
      gstRate,
      gstAmount,
      totalAmount,
      createdBy: req.user?._id
    });

    // If linked to an enquiry, update enquiry status to QUOTED
    if (data.enquiry) {
      await Enquiry.findByIdAndUpdate(data.enquiry, {
        status: 'QUOTED',
        quotation: quotation._id
      });
    }

    res.status(201).json({ success: true, quotation, data: quotation });
  } catch (err) { next(err); }
};

export const updateQuotation = async (req, res, next) => {
  try {
    const updated = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Quotation not found' });
    res.json({ success: true, quotation: updated });
  } catch (err) { next(err); }
};

// 1-Click Convert Accepted Quotation to Production Job Order
export const convertQuotationToJobOrder = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

    const nextJoNumber = await generateNextJobOrderNumber();
    
    // Ensure Part exists
    let part = await Part.findOne({ partNumber: quotation.partNumber });
    if (!part) {
      part = await Part.create({
        partNumber: quotation.partNumber,
        partName: quotation.partName,
        customer: quotation.customer,
        materialGrade: 'EN31 / 20MnCr5',
        drawingNumber: `DWG-${quotation.partNumber}`,
        requiredHardness: '58-62 HRC'
      });
    }

    const jobOrder = await JobOrder.create({
      jobOrderNumber: nextJoNumber,
      customer: quotation.customer,
      customerPoNumber: `PO-${quotation.quotationNumber.replace(/^QT-/, '')}`,
      poDate: new Date(),
      part: part._id,
      partNumber: quotation.partNumber,
      partName: quotation.partName,
      heatNumber: `HT-${Date.now().toString().slice(-5)}`,
      targetQuantity: quotation.quantity,
      targetWeight: quotation.estimatedWeightKg || quotation.quantity * 1.5,
      requiredProcess: quotation.process,
      requiredHardness: '58-62 HRC',
      requiredCaseDepth: '0.80 - 1.10 mm',
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: 'STANDARD',
      status: 'CONFIRMED',
      createdBy: req.user?._id
    });

    quotation.status = 'ACCEPTED';
    quotation.jobOrderCreated = true;
    quotation.jobOrder = jobOrder._id;
    await quotation.save();

    if (quotation.enquiry) {
      await Enquiry.findByIdAndUpdate(quotation.enquiry, { status: 'WON' });
    }

    res.json({
      success: true,
      message: `Job Order ${nextJoNumber} successfully generated from Quotation ${quotation.quotationNumber}`,
      jobOrder,
      quotation
    });
  } catch (err) { next(err); }
};

export const deleteQuotation = async (req, res, next) => {
  try {
    await Quotation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Quotation deleted' });
  } catch (err) { next(err); }
};

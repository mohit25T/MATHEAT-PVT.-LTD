import { Payment } from '../models/Payment.js';
import { Invoice } from '../models/Invoice.js';
import { Customer } from '../models/Customer.js';

// Sequence generator: PAY-YYYY-XXXXXX (e.g. PAY-2026-000001)
export const generateNextPaymentNumber = async () => {
  const currentYear = new Date().getFullYear();
  const payments = await Payment.find({
    paymentNumber: /^PAY-/i
  }).select('paymentNumber');

  let maxSeq = 0;
  for (const p of payments) {
    const parts = (p.paymentNumber || '').split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    } else if (parts.length === 2) {
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    }
  }

  let nextNum = maxSeq + 1;
  let candidate = `PAY-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  while (await Payment.findOne({ paymentNumber: candidate })) {
    nextNum++;
    candidate = `PAY-${currentYear}-${String(nextNum).padStart(6, '0')}`;
  }
  return candidate;
};

export const getPayments = async (req, res, next) => {
  try {
    const list = await Payment.find()
      .populate('invoice')
      .populate('customer')
      .sort({ paymentDate: -1, createdAt: -1 });
    res.json({ success: true, count: list.length, payments: list, data: list });
  } catch (err) { next(err); }
};

export const getNextPaymentNo = async (req, res, next) => {
  try {
    const paymentNumber = await generateNextPaymentNumber();
    res.json({ success: true, paymentNumber });
  } catch (err) { next(err); }
};

export const recordPayment = async (req, res, next) => {
  try {
    const data = req.body;
    let paymentNumber = data.paymentNumber;
    if (!paymentNumber || paymentNumber === 'AUTO') {
      paymentNumber = await generateNextPaymentNumber();
    }

    const invoice = await Invoice.findById(data.invoice || data.invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const amount = Number(data.amount) || 0;
    const tdsDeducted = Number(data.tdsDeducted || data.tdsAmount || 0);
    const totalCredit = amount + tdsDeducted;

    if (totalCredit <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount or TDS must be greater than zero' });
    }

    const payment = await Payment.create({
      paymentNumber,
      invoice: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      customer: invoice.customer,
      customerName: invoice.companyName || invoice.customerName || 'Customer',
      amount,
      tdsDeducted,
      paymentDate: data.paymentDate || new Date(),
      paymentMode: data.paymentMode || 'NEFT',
      referenceNumber: data.referenceNumber || `TXN-${Date.now().toString().slice(-6)}`,
      bankName: data.bankName || 'State Bank of India',
      status: 'CLEARED',
      remarks: data.remarks || (tdsDeducted > 0 ? `TDS of ₹${tdsDeducted} deducted by customer.` : ''),
      recordedBy: req.user?._id
    });

    // Update invoice payment totals and status
    const currentPaid = Number(invoice.amountPaid || 0);
    const newPaid = Number((currentPaid + totalCredit).toFixed(2));
    const grandTotal = Number(invoice.grandTotal || invoice.totalAmount || 0);

    invoice.amountPaid = newPaid;
    if (newPaid >= grandTotal - 0.5) { // allow fractional rounding
      invoice.paymentStatus = 'PAID';
      invoice.status = 'PAID';
    } else if (newPaid > 0) {
      invoice.paymentStatus = 'PARTIALLY_PAID';
    }
    await invoice.save();

    res.status(201).json({
      success: true,
      message: `Payment ${paymentNumber} recorded successfully.`,
      payment,
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        grandTotal,
        amountPaid: newPaid,
        outstanding: Math.max(0, grandTotal - newPaid),
        paymentStatus: invoice.paymentStatus
      }
    });
  } catch (err) { next(err); }
};

export const getPaymentSummary = async (req, res, next) => {
  try {
    const invoices = await Invoice.find().select('grandTotal totalAmount amountPaid paymentStatus invoiceDate dueDate');
    
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let overdueAmount = 0;
    const now = new Date();

    invoices.forEach((inv) => {
      const gTotal = Number(inv.grandTotal || inv.totalAmount || 0);
      const paid = Number(inv.amountPaid || 0);
      const due = Math.max(0, gTotal - paid);

      totalInvoiced += gTotal;
      totalCollected += paid;
      totalOutstanding += due;

      if (due > 0 && inv.dueDate && new Date(inv.dueDate) < now) {
        overdueAmount += due;
      }
    });

    res.json({
      success: true,
      summary: {
        totalInvoiced: Number(totalInvoiced.toFixed(2)),
        totalCollected: Number(totalCollected.toFixed(2)),
        totalOutstanding: Number(totalOutstanding.toFixed(2)),
        overdueAmount: Number(overdueAmount.toFixed(2)),
        collectionRatioPercent: totalInvoiced > 0 ? Number(((totalCollected / totalInvoiced) * 100).toFixed(1)) : 100
      }
    });
  } catch (err) { next(err); }
};

export const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

    // Revert amount from invoice
    const invoice = await Invoice.findById(payment.invoice);
    if (invoice) {
      const currentPaid = Number(invoice.amountPaid || 0);
      const newPaid = Math.max(0, currentPaid - payment.amount);
      const grandTotal = Number(invoice.grandTotal || invoice.totalAmount || 0);

      invoice.amountPaid = newPaid;
      if (newPaid >= grandTotal - 0.5) invoice.paymentStatus = 'PAID';
      else if (newPaid > 0) invoice.paymentStatus = 'PARTIALLY_PAID';
      else invoice.paymentStatus = 'UNPAID';
      await invoice.save();
    }

    await Payment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Payment record deleted' });
  } catch (err) { next(err); }
};

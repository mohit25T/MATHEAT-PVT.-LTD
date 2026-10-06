import { numberToWords } from './numberToWords';

/**
 * Normalizes any invoice data structure (database model, API response, or sample template)
 * into the exact format required by the official MATHEAT Tax Invoice preview/print version.
 */
export const normalizeInvoiceData = (raw) => {
  if (!raw) {
    return {
      invoiceNo: 'MH/25-26/0001',
      invoiceDate: '27 Sept 2026',
      placeOfSupply: 'Maharashtra (27)',
      reverseCharge: 'No',

      // Bill To
      billTo: {
        name: 'Customer Name',
        address: 'Customer Address, City, State - Pincode',
        gstin: '27AAAAA0000A1Z5',
        contact: '+91 98000 00000',
        email: 'accounts@customer.com'
      },

      // Ship To
      shipTo: {
        name: 'Customer Delivery Point',
        address: 'Factory / Plant Address, Industrial Area'
      },

      // Transport & Order Details
      transport: {
        customerChallanNo: 'DC-2026-4401',
        challanNo: 'DC-2026-4401',
        jobOrderNo: 'JO-2026-001',
        ewayBillNo: 'N/A',
        lrNo: 'N/A',
        transporter: 'Direct Transport',
        freight: 'To Pay',
        paymentTerms: '30 Days Net',
        dueDate: '30 Days'
      },

      // Items
      items: [
        {
          srNo: 1,
          description: 'Heat Treatment Job Work Charges',
          spec: 'As per Customer Drawing Specifications',
          partNo: 'HT-COMP-01',
          process: 'Hardening + Tempering',
          batchNo: 'HT-2026-000001',
          heatNo: 'H-00001',
          qtyKg: 500.0,
          rate: 45.0,
          gstRate: '18%',
          amount: 22500.0
        }
      ],

      totalQtyKg: '500.000',
      subTotal: 22500.0,
      cgst: 2025.0,
      sgst: 2025.0,
      igst: 0.0,
      isInterstate: false,
      roundOff: 0.0,
      grandTotal: 26550.0,
      amountInWords: 'Rupees Twenty Six Thousand Five Hundred Fifty Only',

      bank: {
        name: 'State Bank of India',
        acNo: '30998822110',
        ifsc: 'SBIN0001234',
        branch: 'MIDC Aurangabad'
      }
    };
  }

  // Determine Invoice Number
  const invoiceNo = raw.invoiceNumber || raw.invoiceNo || 'MH/25-26/0001';

  // Format Date (e.g. 27 Sept 2026)
  let formattedDate = '27 Sept 2026';
  if (raw.invoiceDate) {
    if (typeof raw.invoiceDate === 'string' && raw.invoiceDate.includes(' ') && !raw.invoiceDate.includes('T')) {
      formattedDate = raw.invoiceDate;
    } else {
      try {
        const d = new Date(raw.invoiceDate);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        } else {
          formattedDate = String(raw.invoiceDate);
        }
      } catch {
        formattedDate = String(raw.invoiceDate);
      }
    }
  }

  // Bill To Details
  const billToName = raw.billTo?.name || raw.companyName || raw.customer?.companyName || raw.customerName || 'Customer Name';
  const billToAddress = raw.billTo?.address || raw.billingAddress || (
    raw.customer?.address 
      ? `${raw.customer.address}, ${raw.customer.city || ''} ${raw.customer.state || ''} - ${raw.customer.pincode || ''}`
      : 'Customer Address, City, State - Pincode'
  );
  const billToGstin = raw.billTo?.gstin || raw.gstNumber || raw.gstin || raw.customer?.gstin || '27AAAAA0000A1Z5';
  const billToContact = raw.billTo?.contact || raw.phone || raw.customer?.phone || '+91 98000 00000';
  const billToEmail = raw.billTo?.email || raw.email || raw.customer?.email || 'accounts@customer.com';

  // Ship To Details
  const shipToName = raw.shipTo?.name || raw.customerDeliveryPoint || raw.companyName || raw.customer?.companyName || raw.customerName || 'Customer Delivery Point';
  const shipToAddress = raw.shipTo?.address || raw.shippingAddress || raw.billingAddress || 'Factory / Plant Address, Industrial Area';

  // Transport & Logistics
  let formattedDueDate = '30 Days';
  if (raw.dueDate) {
    try {
      const dd = new Date(raw.dueDate);
      if (!isNaN(dd.getTime())) {
        formattedDueDate = dd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    } catch {
      // fallback
    }
  }

  const transport = {
    customerPoNo: raw.transport?.customerPoNo || raw.customerPoNo || '',
    challanNo: raw.transport?.challanNo || raw.transport?.customerChallanNo || raw.challanNo || raw.customerChallanNo || raw.transport?.customerPoNo || raw.customerPoNo || 'DC-2026-4401',
    customerChallanNo: raw.transport?.customerChallanNo || raw.transport?.challanNo || raw.customerChallanNo || raw.challanNo || raw.transport?.customerPoNo || raw.customerPoNo || 'DC-2026-4401',
    jobOrderNo: raw.transport?.jobOrderNo || raw.jobOrderNo || 'JO-2026-001',
    ewayBillNo: raw.transport?.ewayBillNo || raw.ewayBillNo || 'N/A',
    lrNo: raw.transport?.lrNo || raw.lrNo || 'N/A',
    transporter: raw.transport?.transporter || raw.transporterName || raw.transporter || 'Direct Transport',
    freight: raw.transport?.freight || raw.freight || 'To Pay',
    paymentTerms: raw.transport?.paymentTerms || raw.paymentTerms || '30 Days Net',
    dueDate: raw.transport?.dueDate || formattedDueDate
  };

  // Line Items
  const rawItems = Array.isArray(raw.items) && raw.items.length > 0 ? raw.items : null;
  const items = rawItems
    ? rawItems.map((item, idx) => ({
        srNo: item.srNo || idx + 1,
        description: item.description || item.name || 'Heat Treatment Job Work Charges',
        spec: item.spec || (item.hsnCode ? `HSN: ${item.hsnCode}` : 'As per Customer Drawing Specifications'),
        partNo: item.partNo || item.partNumber || raw.partNumber || 'HT-COMP-01',
        process: item.process || 'Hardening + Tempering',
        batchNo: item.batchNo || item.batchId || raw.batchId || 'HT-2026-000001',
        heatNo: item.heatNo || item.heatNumber || raw.heatNumber || 'H-00001',
        qtyKg: Number(item.qtyKg || item.quantity || item.billedWeightKg || 500),
        rate: Number(item.rate || item.unitPrice || item.unitRate || 45),
        gstRate: typeof item.gstRate === 'number' ? `${item.gstRate}%` : (item.gstRate || '18%'),
        amount: Number(item.amount || item.taxableAmount || item.totalAmount || ((item.quantity || 1) * (item.unitPrice || 45)))
      }))
    : [
        {
          srNo: 1,
          description: raw.partNumber ? `Heat Treatment Job Work (${raw.partNumber})` : 'Heat Treatment Job Work Charges',
          spec: 'As per Customer Drawing Specifications',
          partNo: raw.partNumber || 'HT-COMP-01',
          process: 'Hardening + Tempering',
          batchNo: raw.batchId || 'HT-2026-000001',
          heatNo: raw.heatNumber || 'H-00001',
          qtyKg: Number(raw.billedWeightKg || raw.billedQuantity || 500),
          rate: Number(raw.unitRate || raw.ratePerKg || 45),
          gstRate: '18%',
          amount: Number(raw.subtotal || 22500)
        }
      ];

  const totalQtyNum = items.reduce((sum, it) => sum + (Number(it.qtyKg) || 0), 0);
  const subTotal = Number(raw.subtotal ?? raw.subTotal ?? items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0));
  const isInter = Boolean(raw.isInterstate);
  const cgst = Number(raw.cgstAmount ?? raw.cgst ?? (isInter ? 0 : Math.round(subTotal * 0.09 * 100) / 100));
  const sgst = Number(raw.sgstAmount ?? raw.sgst ?? (isInter ? 0 : Math.round(subTotal * 0.09 * 100) / 100));
  const igst = Number(raw.igstAmount ?? raw.igst ?? (isInter ? Math.round(subTotal * 0.18 * 100) / 100 : 0));
  const grandTotal = Number(raw.grandTotal ?? raw.totalAmount ?? (subTotal + cgst + sgst + igst));

  // Bank Info
  const bank = {
    name: raw.bankDetails?.bankName || raw.bank?.name || 'State Bank of India',
    acNo: raw.bankDetails?.accountNumber || raw.bank?.acNo || '30998822110',
    ifsc: raw.bankDetails?.ifscCode || raw.bank?.ifsc || 'SBIN0001234',
    branch: raw.bankDetails?.branch || raw.bank?.branch || 'MIDC Aurangabad'
  };

  return {
    invoiceNo,
    invoiceDate: formattedDate,
    placeOfSupply: raw.placeOfSupply || raw.state || 'Maharashtra (27)',
    reverseCharge: raw.reverseCharge || 'No',
    billTo: {
      name: billToName,
      address: billToAddress,
      gstin: billToGstin,
      contact: billToContact,
      email: billToEmail
    },
    shipTo: {
      name: shipToName,
      address: shipToAddress
    },
    transport,
    items,
    totalQtyKg: totalQtyNum.toFixed(3),
    subTotal,
    cgst,
    sgst,
    igst,
    isInterstate: isInter,
    roundOff: Number(raw.roundOff || 0),
    grandTotal,
    amountInWords: raw.amountInWords || numberToWords(grandTotal),
    bank
  };
};

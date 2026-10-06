import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  X,
  Building2,
  Truck,
  FileText,
  Receipt
} from 'lucide-react';

/**
 * Converts any Indian rupee number into standard English words
 * e.g. 23600000 -> "Rupees Two Crore Thirty-Six Lakh Only"
 */
export const convertNumberToWords = (amount) => {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + 'Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + a[n % 10].trim() : '') + ' ';
    } else if (n > 0) {
      str += a[n];
    }
    return str;
  };

  const num = Math.floor(Math.abs(amount || 0));
  if (num === 0) return 'Rupees Zero Only';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = num % 1000;

  let res = 'Rupees ';
  if (crore > 0) res += inWords(crore) + 'Crore ';
  if (lakh > 0) res += inWords(lakh) + 'Lakh ';
  if (thousand > 0) res += inWords(thousand) + 'Thousand ';
  if (hundred > 0) res += inWords(hundred);

  const paise = Math.round((Math.abs(amount || 0) - num) * 100);
  if (paise > 0) {
    res += 'and ' + inWords(paise) + 'Paise ';
  }

  return (res + 'Only').replace(/\s+/g, ' ').trim();
};

/**
 * Maps standard Heat Treatment purchase categories to default HSN codes
 */
const getCategoryHsn = (category = '') => {
  switch (category) {
    case 'QUENCH_OIL':
      return '27101990';
    case 'PROCESS_GAS':
      return '28043000';
    case 'HEAT_TREAT_SALT':
      return '28273990';
    case 'SPARE_PARTS':
      return '84179000';
    case 'REFRACTORY':
      return '69022090';
    case 'LAB_CHEMICAL':
      return '38220090';
    default:
      return '998821';
  }
};

export const PurchaseOrderModal = ({ po, suppliers = [], onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  if (!po) return null;

  // Enrich supplier details if matched in the suppliers list
  const matchedSupplier = suppliers.find(
    (s) =>
      (s.name && po.supplierName && s.name.trim().toLowerCase() === po.supplierName.trim().toLowerCase()) ||
      (s.gstin && po.supplierGstin && s.gstin.trim().toUpperCase() === po.supplierGstin.trim().toUpperCase())
  );

  const supplierAddress =
    po.supplierAddress ||
    (matchedSupplier?.address
      ? [
          matchedSupplier.address.street,
          matchedSupplier.address.city,
          matchedSupplier.address.state,
          matchedSupplier.address.pincode
        ]
          .filter(Boolean)
          .join(', ')
      : 'GIDC Industrial Estate, Gujarat, India');

  const supplierPhone = po.supplierPhone || matchedSupplier?.phone || '+91 98XXX XXXXX';
  const supplierEmail = matchedSupplier?.email || 'vendor.accounts@supplier.com';
  const supplierGstin = po.supplierGstin || matchedSupplier?.gstin || '24AAAPL0000A1Z5';

  // Tax calculations: Intra-state (Gujarat 24) or Inter-state
  const supplierStateCode = (supplierGstin || '').slice(0, 2);
  const isIntraState = supplierStateCode === '24' || !supplierStateCode;

  const subtotal = po.subtotal || po.items?.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) || 0;
  const gstRate = po.gstRate || 18;
  const totalGst = po.gstAmount || Math.round(subtotal * (gstRate / 100) * 100) / 100;
  const grandTotal = po.grandTotal || subtotal + totalGst;

  const cgstAmount = isIntraState ? Math.round((totalGst / 2) * 100) / 100 : 0;
  const sgstAmount = isIntraState ? Math.round((totalGst / 2) * 100) / 100 : 0;
  const igstAmount = !isIntraState ? totalGst : 0;

  // Prepare line items list with intelligent fallback
  const lineItems =
    po.items && po.items.length > 0
      ? po.items
      : [
          {
            itemName: 'Quench Oil / Industrial Process Consumables',
            category: 'QUENCH_OIL',
            hsnCode: '27101990',
            quantity: 1000,
            unit: 'LITRES',
            unitPrice: subtotal ? Math.round((subtotal / 1000) * 100) / 100 : 200,
            amount: subtotal || 200000
          }
        ];

  // Generate QR Code for PO authentication
  useEffect(() => {
    const qrData = `PO|MATHEAT|${po.poNumber}|DATE:${po.orderDate}|AMT:${grandTotal}|SUP:${po.supplierName}|GST:${supplierGstin}|CONSIGNEE:24AAACM1234F1Z5`;
    QRCode.toDataURL(qrData, { width: 140, margin: 1, errorCorrectionLevel: 'M' })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Failed to generate PO QR:', err));
  }, [po, grandTotal, supplierGstin]);

  // Clean print handler
  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `${po.poNumber}_MATHEAT_PO`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="po-modal-backdrop fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Outer Modal Container */}
      <div className="po-modal-container relative w-full max-w-[880px] my-2 sm:my-4 flex flex-col font-sans">
        {/* Top Action Ribbon - Screen Only (Hidden on Print) */}
        <div className="no-print mb-2.5 flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl shadow-2xl border bg-white border-slate-300 text-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wide flex items-center gap-2">
                <span className="text-slate-900">OFFICIAL PURCHASE ORDER</span>
                <span className="font-mono text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-300 text-[11px] font-bold">
                  {po.poNumber}
                </span>
              </div>
              <div className="text-[10px] mt-0.5 text-slate-600">
                Vendor: <strong className="text-slate-900">{po.supplierName}</strong> &bull; Total:{' '}
                <strong className="text-emerald-700 font-mono">₹{grandTotal.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" /> Print Purchase Order (A4)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-all cursor-pointer border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* =======================================================================
            PRINTABLE INDUSTRIAL PURCHASE ORDER SHEET (A4 Standard Format - LIGHT MODE ONLY)
            Per User Request: PO must ALWAYS render in Light Mode only!
            ======================================================================= */}
        <div className="po-sheet-wrapper overflow-hidden rounded-xl shadow-2xl border bg-white border-slate-300">
          {/* Strict Document Styles - Ensures Pure White Header Badge Text across all themes */}
          <style>{`
            #printable-purchase-order .po-header-badge,
            #printable-purchase-order .po-header-badge *,
            #printable-purchase-order .po-badge-title,
            #printable-purchase-order .po-badge-title *,
            #printable-purchase-order .po-badge-subtitle,
            #printable-purchase-order .po-badge-subtitle *,
            #printable-purchase-order .po-total-banner,
            #printable-purchase-order .po-total-banner * {
              color: #ffffff !important;
              -webkit-text-fill-color: #ffffff !important;
            }
            #printable-purchase-order .po-header-badge {
              background-color: #0b2545 !important;
            }
            #printable-purchase-order .po-badge-title {
              color: #ffffff !important;
              -webkit-text-fill-color: #ffffff !important;
            }
            #printable-purchase-order .po-badge-subtitle {
              background-color: #ea580c !important;
              color: #ffffff !important;
              -webkit-text-fill-color: #ffffff !important;
            }
            #printable-purchase-order .po-table-header,
            #printable-purchase-order .po-table-header th {
              background-color: #0b2545 !important;
              color: #ffffff !important;
              -webkit-text-fill-color: #ffffff !important;
            }
          `}</style>

          <div
            id="printable-purchase-order"
            className="relative mx-auto p-4 sm:p-5 space-y-2.5 text-xs font-sans leading-tight bg-white text-slate-900"
            style={{ width: '100%', maxWidth: '850px', backgroundColor: '#ffffff', color: '#0f172a' }}
          >
            <div className="po-watermark-overlay absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none">
              <img
                src="/matheat_logo.png"
                alt="MATHEAT"
                className="w-[420px] max-w-[70%] object-contain pointer-events-none opacity-50"
                style={{ opacity: 0.5 }}
              />
            </div>

            {/* 1. TOP CORPORATE HEADER & TITLE */}
            <div className="relative z-10 border-b-2 pb-2.5 border-[#0b2545]">
              <div className="flex flex-row items-start justify-between gap-3">
                {/* Brand & Factory Identity */}
                <div className="flex items-start gap-3">
                  <img
                    src="/matheat_logo.png"
                    alt="MATHEAT PVT. LTD."
                    className="h-11 sm:h-12 w-auto object-contain shrink-0 mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-base sm:text-lg font-black tracking-tight uppercase text-[#0b2545]">
                        MATHEAT PVT. LTD.
                      </h1>
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-wider border bg-transparent text-blue-900 border-blue-400">
                        ISO 9001:2015
                      </span>
                    </div>
                    <div className="text-[9px] font-bold text-orange-600 tracking-wider uppercase mt-0.5">
                      COMMERCIAL PROCUREMENT &bull; HEAT TREATMENT SOLUTIONS
                    </div>
                    <div className="text-[9.5px] mt-1 leading-snug text-slate-700">
                      <strong className="text-slate-900">Works &amp; Regd. Office:</strong> Plot 42, GIDC Phase II, Vatva, Ahmedabad – 382445, Gujarat, India<br />
                      <strong className="text-slate-900">Phone:</strong> +91 98258 70821 &bull; <strong className="text-slate-900">Email:</strong> purchase@matheat.in / accounts@matheat.in &bull; <strong className="text-slate-900">Web:</strong> www.matheat.in
                    </div>
                    <div className="text-[9px] font-mono font-bold mt-1 flex flex-wrap gap-x-3 gap-y-0.5 p-1 rounded border bg-transparent border-slate-300 text-slate-800">
                      <span>GSTIN: <strong className="text-blue-900 font-black">24AAACM1234F1Z5</strong></span>
                      <span>CIN: U29299GJ2026PTC145892</span>
                      <span>PAN: AAACM1234F</span>
                      <span>STATE: GUJARAT (24)</span>
                    </div>
                  </div>
                </div>

                {/* Right: Angled PO Document Badge with GUARANTEED WHITE TEXT */}
                <div className="flex flex-col items-end justify-start gap-1.5 shrink-0">
                  <div
                    className="po-header-badge bg-[#0b2545] py-1.5 px-4 text-right rounded-md shadow-sm select-none"
                    style={{
                      clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)',
                      backgroundColor: '#0b2545',
                      color: '#ffffff'
                    }}
                  >
                    <div
                      className="po-badge-title text-sm font-black tracking-wider uppercase"
                      style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                    >
                      PURCHASE ORDER
                    </div>
                    <div className="po-badge-subrow mt-0.5">
                      <span
                        className="po-badge-subtitle text-[8.5px] font-black tracking-widest uppercase bg-orange-600 px-2 py-0.5 rounded shadow-xs inline-block"
                        style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                      >
                        ORIGINAL FOR SUPPLIER
                      </span>
                    </div>
                  </div>

                  {qrCodeUrl && (
                    <div className="flex items-center gap-1.5 text-right mt-0.5">
                      <div className="text-[7.5px] font-bold leading-tight text-slate-600">
                        Authentic PO<br />Digital Seal
                      </div>
                      <img
                        src={qrCodeUrl}
                        alt="PO QR"
                        className="h-11 w-11 border border-slate-300 p-0.5 rounded bg-transparent shadow-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. PO METADATA GRID STRIP */}
            <div className="relative z-10 border rounded-lg p-2 grid grid-cols-4 gap-2 text-[10px] bg-transparent border-slate-300">
              <div>
                <span className="font-bold block text-[8.5px] uppercase tracking-wider text-slate-500">PO Number</span>
                <span className="font-mono font-black text-xs text-blue-900">{po.poNumber}</span>
              </div>
              <div>
                <span className="font-bold block text-[8.5px] uppercase tracking-wider text-slate-500">PO Date</span>
                <span className="font-bold text-slate-900">{po.orderDate}</span>
              </div>
              <div>
                <span className="font-bold block text-[8.5px] uppercase tracking-wider text-slate-500">Payment Terms</span>
                <span className="font-bold text-slate-900">{po.paymentTerms || '30 Days Net from GRN'}</span>
              </div>
              <div>
                <span className="font-bold block text-[8.5px] uppercase tracking-wider text-slate-500">Expected Delivery</span>
                <span className="font-bold text-emerald-800">{po.expectedDeliveryDate || 'Within 7 Days / Immediate'}</span>
              </div>
            </div>

            {/* 3. TWO-COLUMN PARTY CARDS: VENDOR & BUYER (ALWAYS SIDE-BY-SIDE) */}
            <div className="relative z-10 grid grid-cols-2 gap-2.5 text-xs">
              {/* Card 1: VENDOR / SUPPLIER */}
              <div className="p-2.5 border rounded-lg flex flex-col justify-between space-y-1 shadow-xs bg-transparent border-slate-300">
                <div>
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-[9px] font-black uppercase tracking-wider flex items-center gap-1 text-[#0b2545]">
                      <Building2 className="h-3 w-3 text-orange-600" />
                      VENDOR / SUPPLIER (BILL &amp; SHIP FROM)
                    </span>
                    <span className="text-[7.5px] font-bold px-1.5 py-0.5 rounded font-mono border bg-transparent text-blue-900 border-blue-400">
                      APPROVED
                    </span>
                  </div>
                  <div className="font-black text-xs sm:text-sm mt-1 uppercase leading-tight text-slate-900">
                    {po.supplierName}
                  </div>
                  <div className="text-[9.5px] mt-0.5 leading-snug line-clamp-2 text-slate-700">
                    {supplierAddress}
                  </div>
                </div>

                <div className="text-[9.5px] font-mono space-y-0.5 pt-1.5 border-t p-2 rounded bg-transparent border-slate-300 text-slate-900">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-bold">GSTIN:</span>
                    <strong className="text-blue-950 font-black">{supplierGstin}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-bold">State Code:</span>
                    <span className="text-slate-900 font-bold">{supplierStateCode || '24'} (Gujarat)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-bold">Contact / Phone:</span>
                    <span className="text-slate-900 font-medium">{supplierPhone}</span>
                  </div>
                  {supplierEmail && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-bold">Email:</span>
                      <span className="text-slate-900 font-medium lowercase truncate max-w-[180px]">{supplierEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: DELIVER TO & INVOICE TO (CONSIGNEE) */}
              <div className="p-2.5 border rounded-lg flex flex-col justify-between space-y-1 shadow-xs bg-transparent border-slate-300">
                <div>
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-[9px] font-black uppercase tracking-wider flex items-center gap-1 text-[#0b2545]">
                      <Truck className="h-3 w-3 text-orange-600" />
                      DELIVER TO &amp; INVOICE TO (CONSIGNEE)
                    </span>
                    <span className="text-[7.5px] font-bold px-1.5 py-0.5 rounded font-mono border bg-transparent text-emerald-900 border-emerald-400">
                      PLANT #1
                    </span>
                  </div>
                  <div className="font-black text-xs sm:text-sm mt-1 uppercase leading-tight text-slate-900">
                    MATHEAT PVT. LTD.
                  </div>
                  <div className="text-[9.5px] mt-0.5 leading-snug line-clamp-2 text-slate-700">
                    Plot 42, GIDC Phase II, Vatva Industrial Estate, Ahmedabad – 382445, Gujarat, India
                  </div>
                </div>

                <div className="text-[9.5px] font-mono space-y-0.5 pt-1.5 border-t p-2 rounded bg-transparent border-slate-300 text-slate-900">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-bold">Buyer GSTIN:</span>
                    <strong className="text-blue-950 font-black">24AAACM1234F1Z5</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-bold">Receiving Point:</span>
                    <span className="text-slate-900 font-bold">Gate #1 (Weighbridge Terminal)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-bold">Stores In-charge:</span>
                    <span className="text-slate-900 font-medium">Procurement (+91 98258 70821)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-bold">Dispatch Mode:</span>
                    <span className="text-slate-900 font-medium">Road Freight / Door Delivery</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. LINE ITEMS TABLE (MANDATORY & FULLY VISIBLE) */}
            <div className="relative z-10 rounded-lg overflow-hidden border shadow-xs bg-transparent border-slate-300">
              <table className="w-full text-left text-xs border-collapse bg-transparent">
                <thead>
                  <tr
                    className="po-table-header text-[9.5px] uppercase font-bold tracking-wider"
                    style={{ backgroundColor: '#0b2545', color: '#ffffff' }}
                  >
                    <th className="py-2 px-2.5 text-center w-8" style={{ color: '#ffffff' }}>#</th>
                    <th className="py-2 px-2.5" style={{ color: '#ffffff' }}>Item Description &amp; Technical Specifications</th>
                    <th className="py-2 px-2.5 text-center w-24" style={{ color: '#ffffff' }}>Category</th>
                    <th className="py-2 px-2.5 text-center w-20" style={{ color: '#ffffff' }}>HSN/SAC</th>
                    <th className="py-2 px-2.5 text-right w-24" style={{ color: '#ffffff' }}>Qty &amp; Unit</th>
                    <th className="py-2 px-2.5 text-right w-24" style={{ color: '#ffffff' }}>Rate (₹)</th>
                    <th className="py-2 px-2.5 text-right w-28" style={{ color: '#ffffff' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-transparent text-[10.5px] divide-slate-200">
                  {lineItems.map((item, idx) => (
                    <tr key={idx} className="bg-transparent hover:bg-slate-50/40">
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-2.5">
                        <div className="font-black uppercase text-slate-900">{item.itemName}</div>
                        <div className="text-[8.5px] mt-0.5 text-slate-500">
                          Industrial Heat Treatment Grade &bull; Standard Pack &bull; MTC / COA Required
                        </div>
                      </td>
                      <td className="py-2 px-2.5 text-center font-mono text-[9px] font-bold text-blue-900">
                        {item.category || 'GENERAL'}
                      </td>
                      <td className="py-2 px-2.5 text-center font-mono text-[9.5px] text-slate-600">
                        {item.hsnCode || getCategoryHsn(item.category)}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                        {(parseFloat(item.quantity) || 0).toLocaleString('en-IN')} {item.unit || 'UNITS'}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono text-slate-800">
                        ₹{(parseFloat(item.unitPrice) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-black text-slate-900">
                        ₹{(parseFloat(item.amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 5. FINANCIAL SUMMARY & AMOUNT IN WORDS */}
            <div className="relative z-10 grid grid-cols-12 gap-2.5 items-stretch">
              {/* Left Side: Amount in Words, Special Instructions & Bank Details (7 Cols) */}
              <div className="col-span-7 flex flex-col justify-between space-y-1.5">
                {/* Amount in words card */}
                <div className="p-2 border rounded-lg shadow-xs bg-transparent border-slate-300">
                  <div className="text-[8.5px] font-black uppercase tracking-wider text-orange-600 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Amount Chargeable in Words
                  </div>
                  <div className="text-[10.5px] font-black mt-0.5 leading-snug text-slate-900">
                    {convertNumberToWords(grandTotal)}
                  </div>
                </div>

                {/* Special Instructions & Banking */}
                <div className="p-2 border rounded-lg text-[9px] space-y-1 bg-transparent border-slate-300 text-slate-700">
                  <div>
                    <strong className="text-slate-800">Special Instructions:</strong>{' '}
                    <span>
                      {po.notes ||
                        'Manufacturer Test Certificate (MTC/COA) and valid GST E-Way Bill must accompany the delivery.'}
                    </span>
                  </div>
                  <div className="pt-1 border-t text-[8.5px] flex flex-wrap gap-x-2.5 border-slate-200 text-slate-600">
                    <span><strong className="text-slate-800">Bank:</strong> State Bank of India</span>
                    <span><strong className="text-slate-800">A/c No:</strong> 30998822110</span>
                    <span><strong className="text-slate-800">IFSC:</strong> SBIN0001234</span>
                    <span><strong className="text-slate-800">Branch:</strong> Vatva GIDC, Ahmedabad</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Tax Calculations Box & Grand Total (5 Cols) */}
              <div className="col-span-5 border rounded-lg overflow-hidden shadow-xs flex flex-col justify-between bg-transparent border-slate-300">
                <div className="p-2 space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Taxable Subtotal:</span>
                    <strong className="font-mono text-slate-900">
                      ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>

                  {isIntraState ? (
                    <>
                      <div className="flex justify-between text-slate-700">
                        <span className="font-medium">CGST @ 9%:</span>
                        <span className="font-mono font-bold text-slate-900">
                          ₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span className="font-medium">SGST @ 9%:</span>
                        <span className="font-mono font-bold text-slate-900">
                          ₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-700">
                      <span className="font-medium">IGST @ 18%:</span>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between border-t pt-0.5 text-[9px] border-slate-200 text-slate-600">
                    <span>Round Off:</span>
                    <span className="font-mono">₹0.00</span>
                  </div>
                </div>

                {/* Grand Total Banner */}
                <div
                  className="po-total-banner p-2 flex items-center justify-between font-black uppercase tracking-wide bg-[#ea580c] text-white"
                  style={{ backgroundColor: '#ea580c', color: '#ffffff' }}
                >
                  <span className="text-[11px] text-white" style={{ color: '#ffffff' }}>Grand Total (₹):</span>
                  <span className="text-sm font-mono font-black text-white" style={{ color: '#ffffff' }}>
                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* 6. STANDARD TERMS & CONDITIONS */}
            <div className="relative z-10 p-2 border rounded-lg text-[8px] leading-tight bg-transparent border-slate-300 text-slate-700">
              <div className="font-black uppercase tracking-wider mb-0.5 text-[#0b2545]">
                Standard Commercial Terms &amp; Conditions
              </div>
              <ol className="list-decimal pl-3 space-y-0.5">
                <li><strong className="text-slate-800">Inspection &amp; Acceptance:</strong> Material is accepted subject to inspection and physical/chemical lab clearance by MATHEAT QC Lab prior to final GRN. Rejections returned at supplier cost.</li>
                <li><strong className="text-slate-800">Documentation:</strong> Manufacturer Test Certificate (MTC/COA), Tax Invoice, Delivery Challan, and valid E-Way Bill must accompany the dispatch.</li>
                <li><strong className="text-slate-800">Weighbridge Verification:</strong> Delivery vehicles must register at MATHEAT Weighbridge Gate Terminal (Gate #1) for Gross/Tare slip issuance.</li>
                <li><strong className="text-slate-800">Payment:</strong> Payment will be released strictly as per agreed terms ({po.paymentTerms || '30 Days Net'}) following store inward acceptance.</li>
                <li><strong className="text-slate-800">Statutory Compliance:</strong> Supplier warrants full compliance with GST laws, E-Way rules, and industrial safety standards.</li>
                <li><strong className="text-slate-800">Jurisdiction:</strong> All disputes arising under this Purchase Order shall be subject to the exclusive jurisdiction of the Courts at Ahmedabad (Gujarat).</li>
              </ol>
            </div>

            {/* 7. SIGNATORIES & OFFICIAL STAMPS */}
            <div className="relative z-10 grid grid-cols-3 gap-2.5 pt-1.5 border-t-2 text-[9px] border-slate-300">
              {/* Column 1: Prepared By */}
              <div className="p-1.5 border rounded-lg flex flex-col justify-between h-18 border-slate-300 bg-transparent text-slate-800">
                <div className="font-bold uppercase text-[8px] text-slate-500">Prepared By</div>
                <div className="text-[9.5px] font-semibold text-slate-800">
                  Commercial Stores &amp; Procurement
                </div>
                <div className="border-t border-dashed pt-0.5 text-[7.5px] border-slate-300 text-slate-500">
                  Officer Sign &bull; Date: {po.orderDate}
                </div>
              </div>

              {/* Column 2: Supplier Acceptance */}
              <div className="p-1.5 border rounded-lg flex flex-col justify-between h-18 border-slate-300 bg-transparent text-slate-800">
                <div className="font-bold uppercase text-[8px] text-slate-500">Vendor / Supplier Acceptance</div>
                <div className="text-[8.5px] italic text-slate-600">
                  Sign &amp; Stamp here and return copy
                </div>
                <div className="border-t border-dashed pt-0.5 text-[7.5px] border-slate-300 text-slate-500">
                  Authorized Signatory &bull; Stamp
                </div>
              </div>

              {/* Column 3: For MATHEAT PVT. LTD. Authorized Signatory */}
              <div className="p-1.5 border rounded-lg flex items-center justify-between h-18 border-slate-300 bg-transparent text-slate-900">
                <div className="flex flex-col justify-between h-full">
                  <div className="font-black uppercase text-[8px] text-slate-900">For, MATHEAT PVT. LTD.</div>
                  <div className="text-[7.5px] font-bold uppercase text-slate-800">Authorized Signatory</div>
                </div>

                {/* Circular Official Company Seal */}
                <div className="relative w-12 h-12 rounded-full border-0 flex flex-col items-center justify-center text-center shrink-0 font-sans p-0.5 shadow-xs border-blue-900 text-blue-900">
                </div>
              </div>
            </div>

            {/* 8. FOOTER WITH REGISTERED IDENTIFIERS */}
            <div className="relative z-10 pt-1 border-t text-center text-[7.5px] font-mono border-slate-200 text-slate-500">
              MATHEAT PVT. LTD. &bull; Registered Office &amp; Works: Plot 42, GIDC Phase II, Vatva, Ahmedabad - 382445, Gujarat, India &bull; GSTIN: 24AAACM1234F1Z5 &bull; CIN: U29299GJ2026PTC145892
            </div>
          </div>
        </div>

        {/* Bottom Action Ribbon - Screen Only (Hidden on Print) */}
        <div className="no-print mt-2 flex items-center justify-between p-2.5 rounded-xl shadow-xl border bg-white border-slate-300 text-slate-900">
          <div className="text-[10px] font-mono text-slate-600">
            PO Document: <span className="font-bold text-slate-900">{po.poNumber}</span> &bull; Status:{' '}
            <span className="text-emerald-700 font-bold">{po.status || 'ORDERED'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" /> Print A4 Sheet
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderModal;

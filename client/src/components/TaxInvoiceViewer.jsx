import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  Download,
  ShieldCheck,
  User,
  MapPin,
  Calendar,
  ClipboardList,
  FileText,
  Truck,
  Package,
  CreditCard,
  Clock,
  Layers,
  Users,
  Building2,
  ScrollText,
  Cog,
  Thermometer,
  FileCheck
} from 'lucide-react';

export const TaxInvoiceViewer = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const invoiceData = {
    invoiceNo: 'MH/25-26/0089',
    invoiceDate: '17 Sep 2026',
    placeOfSupply: 'Gujarat (24)',
    reverseCharge: 'No',

    // Bill To
    billTo: {
      name: 'DURGA MANUFACTURES',
      address: 'Plot No. A5, Sapar Main Road, Opp. Mahindra Gear, Decora Cement Campus, Shapar Veraval, Rajkot – 360024, Gujarat, India',
      gstin: '24AHMPT0206E1ZO',
      contact: '+91 98258 70821',
      email: 'info@durgamanufactures.com'
    },

    // Ship To
    shipTo: {
      name: 'DURGA MANUFACTURES',
      address: 'Plot No. A5, Sapar Main Road, Opp. Mahindra Gear, Decora Cement Campus, Shapar Veraval, Rajkot – 360024, Gujarat, India'
    },

    // Transport & Order Details
    transport: {
      customerPoNo: 'PO/DM/2026/145',
      jobOrderNo: 'JO/26/0178',
      ewayBillNo: '612183521124',
      lrNo: 'GJ03BU4179',
      transporter: 'Shree Roadlines',
      freight: 'Paid',
      paymentTerms: '30 Days',
      dueDate: '17 Oct 2026'
    },

    // Items
    items: [
      {
        srNo: 1,
        description: 'Rotor (Stamping)',
        spec: '140×70 = 110MM × 120 STATOR',
        partNo: 'HT-140-120',
        process: 'Hardening + Tempering',
        batchNo: 'B-2026-0178',
        heatNo: 'H45872',
        qtyKg: 936.200,
        rate: 68.50,
        gstRate: '18%',
        amount: 64129.70
      },
      {
        srNo: 2,
        description: 'Rotor (Stamping)',
        spec: '140×70 = 132 ROTOR LOOSE',
        partNo: 'HT-140-132',
        process: 'Hardening + Tempering',
        batchNo: 'B-2026-0179',
        heatNo: 'H45873',
        qtyKg: 237.600,
        rate: 68.50,
        gstRate: '18%',
        amount: 16275.60
      },
      {
        srNo: 3,
        description: 'Gear Component',
        spec: '',
        partNo: 'HT-GR-450',
        process: 'Carburizing + Hardening',
        batchNo: 'B-2026-0180',
        heatNo: 'H45874',
        qtyKg: 150.000,
        rate: 72.00,
        gstRate: '18%',
        amount: 10800.00
      },
      {
        srNo: 4,
        description: 'Shaft',
        spec: '',
        partNo: 'HT-SH-320',
        process: 'Induction Hardening',
        batchNo: 'B-2026-0181',
        heatNo: 'H45875',
        qtyKg: 85.000,
        rate: 75.00,
        gstRate: '18%',
        amount: 6375.00
      },
      {
        srNo: 5,
        description: 'Misc. Components',
        spec: '(As per PO)',
        partNo: 'HT-MC-001',
        process: 'Stress Relieving',
        batchNo: 'B-2026-0182',
        heatNo: 'H45876',
        qtyKg: 200.000,
        rate: 60.00,
        gstRate: '18%',
        amount: 12000.00
      }
    ],

    totalQtyKg: '1,608.800',
    subTotal: 109580.30,
    cgst: 9862.23,
    sgst: 9862.23,
    roundOff: -0.76,
    grandTotal: 129304.00,
    amountInWords: 'Rupees One Lakh Twenty Nine Thousand Three Hundred Four Only',

    bank: {
      name: 'ICICI Bank Ltd.',
      acNo: '072805503144',
      ifsc: 'ICIC0000728',
      branch: 'Gondal Road, Rajkot'
    }
  };

  useEffect(() => {
    // Generate real, scan-compliant GST QR Code
    const qrText = `GST-INVOICE|MATHEAT|MH/25-26/0089|2026-09-17|129304.00|24AHMPT0206E1ZO|24AABCM8920C1Z4`;
    QRCode.toDataURL(qrText, { width: 140, margin: 1, errorCorrectionLevel: 'M' })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, []);

  const getCleanInvoiceFileName = () => {
    // Sanitize for file systems (replace '/' or invalid characters with '-')
    return (invoiceData.invoiceNo || 'MH-25-26-0089').replace(/[\/\\?%*:|"<>]/g, '-');
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const fileName = getCleanInvoiceFileName();
    // Browsers default the 'Save as PDF' filename to document.title
    document.title = fileName;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const handleDownloadPdf = async () => {
    const fileName = `${getCleanInvoiceFileName()}.pdf`;
    try {
      const response = await fetch(`http://localhost:5000/api/documents/invoice/${getCleanInvoiceFileName()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Direct download failed, falling back to open:', err);
      window.open(`http://localhost:5000/api/documents/invoice/${getCleanInvoiceFileName()}`, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Ribbon (Hidden During Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-300 p-4 rounded-xl shadow-sm">
        <div>
          <h2 className="text-base font-black text-black flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-blue-600" />
            Official MATHEAT Tax Invoice (Exact Live Template)
          </h2>
          <p className="text-xs text-black mt-0.5 font-medium">
            Invoice No: <span className="font-bold text-orange-600">{invoiceData.invoiceNo}</span> &bull; 
            Client: <span className="font-bold text-black">{invoiceData.billTo.name}</span> &bull; 
            GST Ready with Scannable Verification
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" /> Download Official PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Print Tax Invoice
          </button>
        </div>
      </div>

      {/* =======================================================================
          PRINTABLE TAX INVOICE SHEET (Pixel-Perfect Match to Image - Strictly 1 Page)
          ======================================================================= */}
      <div
        id="printable-tax-invoice"
        className="printable-certificate relative bg-[#f8fafc] text-black shadow-2xl mx-auto border border-slate-300 font-sans max-w-[850px] p-2.5 sm:p-3 space-y-1 sm:space-y-1.5 overflow-hidden"
      >
        {/* Official MATHEAT Transparent Background Watermark */}
        <div
          className="invoice-watermark-overlay absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}
        >
          <img
            src="/matheat_logo.png"
            alt="MATHEAT Watermark"
            className="w-[360px] max-w-[60%] object-contain opacity-10 pointer-events-none"
          />
        </div>

        {/* 1. TOP HEADER WITH LOGO, FEATURE BADGES & FURNACE IMAGE BANNER */}
        <div className="relative z-10 flex flex-row items-stretch justify-between gap-2.5 border-b border-slate-300 pb-1">
          
          {/* Left: Brand Identity & Feature Badges */}
          <div className="flex-1 flex flex-col justify-between py-0.5">
            <div>
              {/* Full Brand Identity Logo using provided transparent image */}
              <div className="flex flex-col items-start">
                <img
                  src="/matheat_logo.png"
                  alt="MATHEAT PVT. LTD."
                  className="h-11 sm:h-12 w-auto object-contain max-w-[220px]"
                />
                <div className="text-[9px] font-black text-[#0b2545] tracking-[0.24em] uppercase mt-0.5 pl-0.5">
                  HEAT TREATMENT SOLUTIONS
                </div>
              </div>
            </div>

            {/* Three Feature Badges with circular icons */}
            <div className="flex items-center gap-3 mt-0.5 text-[8px] font-black text-[#0b2545]">
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-full border border-[#0b2545] flex items-center justify-center">
                  <Cog className="h-2 w-2 text-[#0b2545]" />
                </div>
                <span>UNIFORM HARDNESS</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-full border border-[#ea580c] flex items-center justify-center">
                  <Thermometer className="h-2 w-2 text-[#ea580c]" />
                </div>
                <span>SUPERIOR STRENGTH</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-full border border-[#0b2545] flex items-center justify-center">
                  <ShieldCheck className="h-2 w-2 text-[#0b2545]" />
                </div>
                <span>PRECISION PERFORMANCE</span>
              </div>
            </div>
          </div>

          {/* Right: High-Impact Furnace Photographic Banner with Glowing Metal */}
          <div
            className="furnace-banner-box rounded-lg overflow-hidden relative shadow-md shrink-0 border border-slate-800"
            style={{ width: '250px', minWidth: '250px', height: '82px', maxHeight: '82px', backgroundColor: '#090e17' }}
          >
            {/* Real Industrial Steel Heating Photo */}
            <div className="relative w-full h-full bg-slate-950 overflow-hidden" style={{ height: '82px', maxHeight: '82px' }}>
              <img
                src="/furnace_banner.jpg"
                alt="Industrial Furnace Heat Treatment"
                className="w-full h-full object-cover object-center opacity-85"
                style={{ width: '100%', height: '82px', maxHeight: '82px', objectFit: 'cover' }}
              />
              
              {/* Dark Contrast Overlay for Shade of White Typography */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent flex flex-col justify-center px-3">
                <div className="text-left tracking-wide leading-tight font-black" style={{ color: '#f8fafc' }}>
                  <div className="text-[8px] uppercase tracking-widest font-black" style={{ color: '#f1f5f9' }}>METAL</div>
                  <div className="text-[10px] uppercase tracking-wider font-black mt-0.5" style={{ color: '#f8fafc' }}>STRONGER</div>
                  <div className="text-[7.5px] uppercase tracking-widest font-black mt-0.5" style={{ color: '#e2e8f0' }}>FOR A</div>
                  <div className="text-[9.5px] uppercase tracking-wide font-black mt-0.5" style={{ color: '#f8fafc' }}>BETTER</div>
                  <div className="text-[10.5px] uppercase tracking-wider font-black mt-0.5" style={{ color: '#f8fafc' }}>TOMORROW</div>
                </div>
              </div>

              {/* Bottom Orange Angled Wedge Accent */}
              <div
                className="absolute bottom-0 right-0 w-14 h-2.5 bg-orange-600"
                style={{ clipPath: 'polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
              />
            </div>
          </div>
        </div>

        {/* 2. TAX INVOICE BAR & INVOICE METADATA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white">
          
          {/* Dark Navy Block: TAX INVOICE with angled diagonal edge */}
          <div
            className="w-full sm:w-[240px] bg-[#0b2545] text-white py-1.5 px-4 relative rounded-l-md"
            style={{
              clipPath: 'polygon(0% 0%, 92% 0%, 100% 100%, 0% 100%)'
            }}
          >
            <h1 className="text-xl font-black tracking-wider uppercase leading-tight text-white">
              TAX INVOICE
            </h1>
            <div className="text-[8.5px] font-bold text-slate-200 tracking-widest uppercase mt-0.5">
              ORIGINAL FOR RECIPIENT
            </div>
          </div>

          {/* Center: Key Invoice Details */}
          <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs px-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700 text-[11px]">Invoice No.</span>
              <strong className="font-mono text-black font-black text-xs">{invoiceData.invoiceNo}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700 text-[11px]">Invoice Date</span>
              <strong className="text-black font-bold text-[11px]">{invoiceData.invoiceDate}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700 text-[11px]">Place of Supply</span>
              <strong className="text-black font-bold text-[11px]">{invoiceData.placeOfSupply}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700 text-[11px]">Reverse Charge</span>
              <strong className="text-black font-bold text-[11px]">{invoiceData.reverseCharge}</strong>
            </div>
          </div>

          {/* Right: Verification QR Code */}
          <div className="flex flex-col items-center justify-center shrink-0 pr-1">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="GST Invoice Verification QR" className="w-12 h-12 object-contain" />
            ) : (
              <div className="w-12 h-12 border border-slate-300 bg-white flex items-center justify-center">
                <span className="text-[7px] font-mono">QR CODE</span>
              </div>
            )}
            <span className="text-[7.5px] font-bold text-slate-800 text-center leading-tight mt-0.5">
              Scan for<br />Invoice Verification
            </span>
          </div>
        </div>

        {/* 3. PARTY & LOGISTICS SECTION (3 Rounded Cards with Light Gray Fill) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
          
          {/* Card 1: BILL TO */}
          <div className="sm:col-span-4 p-2.5 bg-[#f4f7fa] border border-[#e2e8f0] rounded-lg flex flex-col justify-between space-y-1 shadow-sm">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-black pb-1 border-b border-slate-200">
                <div className="h-4 w-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[9px]">
                  <User className="h-2.5 w-2.5" />
                </div>
                <span>BILL TO</span>
              </div>
              <div className="font-black text-xs text-black mt-1 leading-tight">
                {invoiceData.billTo.name}
              </div>
              <p className="text-[10px] text-slate-800 mt-0.5 leading-tight">
                {invoiceData.billTo.address}
              </p>
            </div>
            <div className="text-[10px] space-y-0.5 pt-1 border-t border-slate-200">
              <div><strong className="text-black">GSTIN :</strong> <span className="font-mono font-bold text-black">{invoiceData.billTo.gstin}</span></div>
              <div><strong className="text-black">Contact :</strong> <span className="text-black font-medium">{invoiceData.billTo.contact}</span></div>
              <div><strong className="text-black">Email :</strong> <span className="text-black font-medium">{invoiceData.billTo.email}</span></div>
            </div>
          </div>

          {/* Card 2: SHIP TO (IF DIFFERENT) */}
          <div className="sm:col-span-4 p-2.5 bg-[#f4f7fa] border border-[#e2e8f0] rounded-lg flex flex-col justify-start space-y-1 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-black pb-1 border-b border-slate-200">
              <div className="h-4 w-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[9px]">
                <MapPin className="h-2.5 w-2.5" />
              </div>
              <span>SHIP TO <span className="text-[8.5px] font-normal text-slate-600">(IF DIFFERENT)</span></span>
            </div>
            <div className="font-black text-xs text-black mt-1 leading-tight">
              {invoiceData.shipTo.name}
            </div>
            <p className="text-[10px] text-slate-800 mt-0.5 leading-tight">
              {invoiceData.shipTo.address}
            </p>
          </div>

          {/* Card 3: TRANSPORT & ORDER DETAILS */}
          <div className="sm:col-span-4 p-2.5 bg-[#f4f7fa] border border-[#e2e8f0] rounded-lg space-y-0.5 text-[10px] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><Calendar className="h-2.5 w-2.5 text-blue-800" /> Customer PO No.</span>
              <strong className="font-mono text-black font-bold">{invoiceData.transport.customerPoNo}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><ClipboardList className="h-2.5 w-2.5 text-blue-800" /> Job Order No.</span>
              <strong className="font-mono text-black font-bold">{invoiceData.transport.jobOrderNo}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><FileText className="h-2.5 w-2.5 text-blue-800" /> E-Way Bill No.</span>
              <strong className="font-mono text-black font-bold">{invoiceData.transport.ewayBillNo}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><Truck className="h-2.5 w-2.5 text-blue-800" /> LR No.</span>
              <strong className="font-mono text-black font-bold">{invoiceData.transport.lrNo}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><Truck className="h-2.5 w-2.5 text-blue-800" /> Transporter</span>
              <strong className="text-black font-bold">{invoiceData.transport.transporter}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><Package className="h-2.5 w-2.5 text-blue-800" /> Freight</span>
              <strong className="text-black font-bold">{invoiceData.transport.freight}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><CreditCard className="h-2.5 w-2.5 text-blue-800" /> Payment Terms</span>
              <strong className="text-black font-bold">{invoiceData.transport.paymentTerms}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><Clock className="h-2.5 w-2.5 text-blue-800" /> Due Date</span>
              <strong className="text-black font-bold">{invoiceData.transport.dueDate}</strong>
            </div>
          </div>
        </div>

        {/* 4. ITEMS TABLE (Deep Navy Header, Clean Grid, High Contrast) */}
        <div className="rounded-md overflow-hidden border border-slate-300">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0b2545] text-white text-[9.5px] font-black uppercase tracking-wider">
                <th className="p-1.5 text-center border-r border-slate-700 w-8">Sr.<br />No.</th>
                <th className="p-1.5 border-r border-slate-700">Description</th>
                <th className="p-1.5 text-center border-r border-slate-700">Part No. /<br />Specification</th>
                <th className="p-1.5 border-r border-slate-700">Process</th>
                <th className="p-1.5 text-center border-r border-slate-700">Batch No.</th>
                <th className="p-1.5 text-center border-r border-slate-700">Heat No.</th>
                <th className="p-1.5 text-right border-r border-slate-700">Qty<br />(Kg)</th>
                <th className="p-1.5 text-right border-r border-slate-700">Rate<br />(₹/Kg)</th>
                <th className="p-1.5 text-center border-r border-slate-700">GST<br />(%)</th>
                <th className="p-1.5 text-right">Amount<br />(₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[10.5px] font-medium bg-white">
              {invoiceData.items.map((row) => (
                <tr key={row.srNo} className="hover:bg-slate-50">
                  <td className="p-1.5 text-center border-r border-slate-200 font-bold text-black">{row.srNo}</td>
                  <td className="p-1.5 border-r border-slate-200">
                    <div className="font-bold text-black text-[11px] leading-tight">{row.description}</div>
                    {row.spec && <div className="text-[9px] text-slate-500 font-sans leading-tight">{row.spec}</div>}
                  </td>
                  <td className="p-1.5 text-center border-r border-slate-200 font-mono font-bold text-black">{row.partNo}</td>
                  <td className="p-1.5 border-r border-slate-200 text-black font-semibold">{row.process}</td>
                  <td className="p-1.5 text-center border-r border-slate-200 font-mono font-bold text-black">{row.batchNo}</td>
                  <td className="p-1.5 text-center border-r border-slate-200 font-mono font-bold text-black">{row.heatNo}</td>
                  <td className="p-1.5 text-right border-r border-slate-200 font-mono font-bold text-black">{row.qtyKg.toFixed(3)}</td>
                  <td className="p-1.5 text-right border-r border-slate-200 font-mono text-black">{row.rate.toFixed(2)}</td>
                  <td className="p-1.5 text-center border-r border-slate-200 font-mono text-black">{row.gstRate}</td>
                  <td className="p-1.5 text-right font-mono font-black text-black">{row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}

              {/* Total Quantity Row */}
              <tr className="bg-white border-t-2 border-slate-300 font-black text-xs text-black">
                <td colSpan={6} className="p-1.5 text-right pr-3 uppercase tracking-wider border-r border-slate-200 text-[10.5px]">
                  Total Quantity (Kg)
                </td>
                <td className="p-1.5 text-right font-mono font-black text-black border-r border-slate-200 text-[11px]">
                  {invoiceData.totalQtyKg}
                </td>
                <td colSpan={3} className="p-1.5 bg-white"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 5. PROCESS SUMMARY & VALUE PILLARS (4 Separate Rounded Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 text-xs">
          
          {/* Process Summary Card */}
          <div className="sm:col-span-5 p-1.5 bg-[#f4f7fa] border border-[#e2e8f0] rounded-md flex items-start gap-1.5 shadow-sm">
            <div className="h-5 w-5 rounded bg-orange-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-sm">
              <FileText className="h-3 w-3" />
            </div>
            <div>
              <div className="font-black text-[9.5px] uppercase text-black tracking-wider">PROCESS SUMMARY</div>
              <p className="text-[8.5px] text-slate-800 leading-tight mt-0.5">
                Heat Treatment as per customer specification & applicable standards. Material processed in controlled atmosphere.
              </p>
            </div>
          </div>

          {/* Traceability Card */}
          <div className="sm:col-span-3 p-1.5 bg-[#f4f7fa] border border-[#e2e8f0] rounded-md flex items-center gap-1.5 shadow-sm">
            <div className="h-5 w-5 rounded bg-[#0b2545] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Layers className="h-3 w-3" />
            </div>
            <div>
              <div className="font-black text-[9.5px] uppercase text-black tracking-wider">TRACEABILITY</div>
              <p className="text-[9px] text-black font-bold leading-tight mt-0.5">
                Heat No. &rarr; Batch &rarr; Invoice
              </p>
            </div>
          </div>

          {/* Quality Assured Card */}
          <div className="sm:col-span-2 p-1.5 bg-[#f4f7fa] border border-[#e2e8f0] rounded-md flex items-center gap-1 shadow-sm">
            <div className="h-5 w-5 rounded bg-[#0b2545] text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="h-3 w-3" />
            </div>
            <div>
              <div className="font-black text-[9px] uppercase text-black tracking-wider">QUALITY ASSURED</div>
              <p className="text-[8.5px] text-slate-800 font-bold leading-tight mt-0.5">
                Controlled & Tested
              </p>
            </div>
          </div>

          {/* Customer Focused Card */}
          <div className="sm:col-span-2 p-1.5 bg-[#f4f7fa] border border-[#e2e8f0] rounded-md flex items-center gap-1 shadow-sm">
            <div className="h-5 w-5 rounded bg-[#0b2545] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Users className="h-3 w-3" />
            </div>
            <div>
              <div className="font-black text-[9px] uppercase text-black tracking-wider">CUSTOMER FOCUSED</div>
              <p className="text-[8.5px] text-slate-800 font-bold leading-tight mt-0.5">
                On Time Delivery
              </p>
            </div>
          </div>
        </div>

        {/* 6. LOWER GRID: BANK DETAILS | TERMS | FINANCIAL TOTALS (3 Rounded Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
          
          {/* Bank Details Card */}
          <div className="sm:col-span-4 p-2 bg-[#f4f7fa] border border-[#e2e8f0] rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center gap-1.5 font-black text-black uppercase tracking-wider pb-0.5 border-b border-slate-200 text-[10px]">
              <Building2 className="h-3.5 w-3.5 text-[#0b2545]" />
              <span>Bank Details</span>
            </div>
            <div className="space-y-0.5 text-[10px] pt-0.5">
              <div className="flex justify-between"><span className="text-slate-700 font-bold">Bank Name :</span> <strong className="text-black">{invoiceData.bank.name}</strong></div>
              <div className="flex justify-between"><span className="text-slate-700 font-bold">A/C No. :</span> <strong className="font-mono text-black font-black">{invoiceData.bank.acNo}</strong></div>
              <div className="flex justify-between"><span className="text-slate-700 font-bold">IFSC Code :</span> <strong className="font-mono text-black font-black">{invoiceData.bank.ifsc}</strong></div>
              <div className="flex justify-between"><span className="text-slate-700 font-bold">Branch :</span> <strong className="text-black">{invoiceData.bank.branch}</strong></div>
            </div>
          </div>

          {/* Terms & Conditions Card */}
          <div className="sm:col-span-4 p-2 bg-[#f4f7fa] border border-[#e2e8f0] rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center gap-1.5 font-black text-black uppercase tracking-wider pb-0.5 border-b border-slate-200 text-[10px]">
              <ScrollText className="h-3.5 w-3.5 text-[#0b2545]" />
              <span>Terms & Conditions</span>
            </div>
            <ol className="list-decimal list-inside text-[8.5px] text-slate-800 space-y-0.5 leading-tight pt-0.5">
              <li>Goods once sold will not be taken back.</li>
              <li>Payment within agreed credit period.</li>
              <li>Interest @ 24% p.a. on overdue payments.</li>
              <li>Responsibility ceases once goods leave premises.</li>
              <li>Subject to Rajkot Jurisdiction only.</li>
              <li>Computer generated invoice, no signature required.</li>
            </ol>
          </div>

          {/* Financial Calculation Card with Solid Orange Grand Total */}
          <div className="sm:col-span-4 bg-[#f4f7fa] border border-[#e2e8f0] rounded-lg flex flex-col justify-between overflow-hidden shadow-sm">
            <div className="p-2 space-y-0.5 text-[10.5px]">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">Sub Total</span>
                <span className="font-mono font-black text-black">{invoiceData.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">CGST @ 9%</span>
                <span className="font-mono font-black text-black">{invoiceData.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">SGST @ 9%</span>
                <span className="font-mono font-black text-black">{invoiceData.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-0.5">
                <span className="font-semibold text-slate-700">Round Off</span>
                <span className="font-mono font-black text-black">{invoiceData.roundOff.toFixed(2)}</span>
              </div>
            </div>

            {/* Grand Total Solid Orange Banner with Rounded Bottom */}
            <div className="bg-[#ea580c] text-white py-1.5 px-3 flex items-center justify-between font-black text-xs uppercase tracking-wide">
              <span>Grand Total (₹)</span>
              <span className="text-sm font-mono font-black">{invoiceData.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* 7. AMOUNT IN WORDS & SIGNATORY/STAMP AREA */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
          
          {/* Amount in Words Card */}
          <div className="sm:col-span-7 p-2.5 bg-[#f4f7fa] border border-[#e2e8f0] rounded-lg shadow-sm">
            <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider text-orange-600">
              <FileText className="h-3.5 w-3.5" />
              <span>Amount in Words</span>
            </div>
            <div className="text-[11px] font-black text-black mt-1 leading-tight">
              {invoiceData.amountInWords}
            </div>
          </div>

          {/* Authorized Signatory & Official Seal Stamp Area */}
          <div className="sm:col-span-5 flex items-center justify-between gap-3 px-1">
            <div className="text-left">
              <div className="text-[10px] font-black text-black uppercase">For, MATHEAT PVT. LTD.</div>
              
              {/* Authentic Cursive Signature Representation */}
              <div className="my-0.5 h-7 flex items-center">
                <svg className="w-28 h-6 text-black" viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 25 C20 5 25 35 35 15 C45 -5 50 30 60 20 C70 10 80 25 90 20 C100 15 110 25 125 22 C135 20 145 15 155 18" stroke="#0b192c" strokeWidth="2" strokeLinecap="round" />
                  <path d="M15 30 L140 28" stroke="#0b192c" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              <div className="text-[9px] font-bold text-slate-800 uppercase">Authorized Signatory</div>
            </div>

            {/* Circular Official Company Seal Stamp in Blue Ink */}
            <div className="relative w-16 h-16 rounded-full border-2 border-blue-900 flex flex-col items-center justify-center text-center text-blue-900 shrink-0 font-sans p-0.5 shadow-sm">
              <div className="absolute inset-0.5 rounded-full border border-blue-900/60 pointer-events-none" />
              <div className="text-[6.5px] font-black uppercase tracking-tighter leading-tight mt-0.5">
                MATHEAT PVT. LTD.
              </div>
              <div className="border-t border-b border-blue-900 px-1.5 py-0.2 my-0.5 text-[7.5px] font-black tracking-widest">
                RAJKOT
              </div>
              <div className="text-[7px] font-bold">★</div>
            </div>
          </div>
        </div>

        {/* 8. FOOTER WITH REGISTERED ADDRESS & SLOGAN */}
        <div className="rounded-lg overflow-hidden flex flex-col sm:flex-row items-stretch justify-between bg-[#0b2545] text-white">
          
          {/* Left: Contact Info & Regulatory Identifiers */}
          <div className="py-1.5 px-3 flex-1 text-[9px] space-y-0.5">
            <div className="flex items-center gap-1.5 text-white">
              <MapPin className="h-2.5 w-2.5 text-orange-400 shrink-0" />
              <span>Plot No. XX, Industrial Area, Rajkot – 360____, Gujarat, India</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-white">
              <span>📞 +91 98258 70821</span>
              <span>✉ info@matheat.in</span>
              <span>🌐 www.matheat.in</span>
            </div>
            <div className="text-[8px] text-white font-mono tracking-tight pt-0.5 border-t border-slate-700/60">
              CIN : U29299GJ2026PTCXXX0X &nbsp;|&nbsp; GSTIN : 24XXXXX0000X &nbsp;|&nbsp; IEC : XXXXXXXXXX
            </div>
          </div>

          {/* Right: Angled Flame Orange Accent Wedge Banner */}
          <div
            className="w-full sm:w-[190px] bg-[#ea580c] p-2 flex flex-col justify-center text-right font-black uppercase tracking-wider text-white shrink-0"
            style={{ clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
          >
            <div className="text-[11px] text-white font-black leading-tight">HEAT TODAY</div>
            <div className="text-[9px] text-white font-black leading-tight">A STRONGER TOMORROW</div>
          </div>
        </div>
      </div>
    </div>
  );
};

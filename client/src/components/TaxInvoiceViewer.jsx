import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import api from '../api/client';
import {
  Printer,
  Download,
  Share2,
  X,
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

import { normalizeInvoiceData } from '../utils/normalizeInvoiceData';

export const TaxInvoiceViewer = ({ invoice: propInvoice, isOpen, onClose }) => {
  const isModal = isOpen !== undefined;
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [liveInvoices, setLiveInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(propInvoice || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propInvoice) {
      setSelectedInvoice(propInvoice);
    }
  }, [propInvoice]);

  useEffect(() => {
    if (!isModal) {
      loadInvoices();
    }
  }, [isModal]);

  // Keyboard shortcut: Escape to close modal
  useEffect(() => {
    if (!isModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, isOpen, onClose]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.commercial.getInvoices().catch(() => []);
      const list = Array.isArray(res) ? res : (res?.invoices || []);
      setLiveInvoices(list);
      if (propInvoice) {
        setSelectedInvoice(propInvoice);
      } else if (list.length > 0 && !selectedInvoice) {
        setSelectedInvoice(list[0]);
      }
    } catch (err) {
      console.warn('[TAX INVOICE] Error loading invoices:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Normalized invoice data - guarantees preview template structure for any invoice or fallback
  const invoiceData = normalizeInvoiceData(selectedInvoice || propInvoice);

  useEffect(() => {
    if (invoiceData) {
      // Generate real, scan-compliant GST QR Code
      const qrText = `GST-INVOICE|MATHEAT|${invoiceData.invoiceNo}|${invoiceData.invoiceDate}|${invoiceData.grandTotal}|${invoiceData.billTo?.gstin || ''}|27AAACS1900K1Z9`;
      QRCode.toDataURL(qrText, { width: 140, margin: 1, errorCorrectionLevel: 'M' })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [invoiceData.invoiceNo, invoiceData.grandTotal, invoiceData.billTo?.gstin]);

  const getCleanInvoiceFileName = () => {
    return (invoiceData?.invoiceNo || 'MH-INVOICE').replace(/[\/\\?%*:|"<>]/g, '-');
  };

  const handlePrint = () => {
    if (!invoiceData) return;
    const originalTitle = document.title;
    const fileName = getCleanInvoiceFileName();
    document.title = fileName;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const handleWhatsAppShare = () => {
    const invNo = invoiceData.invoiceNo;
    const invDate = invoiceData.invoiceDate;
    const custName = invoiceData.billTo?.name || 'Customer';
    const gTotal = invoiceData.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 });

    const text = `*TAX INVOICE - MATHEAT PVT. LTD.*\n` +
      `Invoice No: ${invNo}\n` +
      `Date: ${invDate}\n` +
      `Billed To: ${custName}\n` +
      `Grand Total: ₹${gTotal}\n` +
      `Place of Supply: ${invoiceData.placeOfSupply}\n\n` +
      `Thank you for your business with MATHEAT! Support: +91 98258 70821 / purchase@matheat.in`;

    const rawPhone = (invoiceData.billTo?.contact || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleDownloadPdf = async () => {
    if (!invoiceData) return;
    const cleanName = getCleanInvoiceFileName();
    const fileName = `${cleanName}.pdf`;
    const invoiceUrl = api.documents.getInvoiceUrl(cleanName);
    try {
      const response = await fetch(invoiceUrl);
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
      console.warn('Direct download failed, falling back to print dialog:', err);
      handlePrint();
    }
  };

  if (isModal && !isOpen) return null;

  // Single source of truth for the printable invoice sheet
  const invoiceSheetContent = (
    <div className="invoice-sheet-wrapper w-full overflow-x-auto print:overflow-visible">
      <div
        id="printable-tax-invoice"
        className="printable-certificate relative bg-white text-slate-900 shadow-2xl mx-auto border border-slate-300 font-sans max-w-[850px] min-w-[720px] p-2.5 sm:p-3 flex flex-col justify-between min-h-[1050px] space-y-1 sm:space-y-1.5 overflow-hidden"
        style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
      >
        {/* Official MATHEAT Transparent Background Watermark */}
        <div
          className="invoice-watermark-overlay absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}
        >
          <img
            src="/matheat_logo.png"
            alt="MATHEAT Watermark"
            className="w-[420px] max-w-[70%] object-contain opacity-50 pointer-events-none"
            style={{ opacity: 0.5 }}
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
                src="/furnace_banner_wide.jpg"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-transparent">
          
          {/* Dark Navy Block: TAX INVOICE with angled diagonal edge */}
          <div
            className="invoice-header-badge w-full sm:w-[240px] bg-[#0b2545] text-white py-1.5 px-4 relative rounded-l-md"
            style={{
              clipPath: 'polygon(0% 0%, 92% 0%, 100% 100%, 0% 100%)',
              backgroundColor: '#0b2545',
              color: '#ffffff'
            }}
          >
            <h1 className="text-xl font-black tracking-wider uppercase leading-tight text-white" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
              TAX INVOICE
            </h1>
            <div className="text-[8.5px] font-bold text-slate-200 tracking-widest uppercase mt-0.5" style={{ color: '#e2e8f0', WebkitTextFillColor: '#e2e8f0' }}>
              <span className="text-white">ORIGINAL FOR RECIPIENT</span>
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
              <div className="w-12 h-12 border border-slate-300 bg-transparent flex items-center justify-center">
                <span className="text-[7px] font-mono">QR CODE</span>
              </div>
            )}
            <span className="text-[7.5px] font-bold text-slate-800 text-center leading-tight mt-0.5">
              Scan for<br />Invoice Verification
            </span>
          </div>
        </div>

        {/* 3. PARTY & LOGISTICS SECTION (3 Rounded Cards with Tight, Harmonious Padding) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 text-xs">
          
          {/* Card 1: BILL TO (BUYER) */}
          <div className="sm:col-span-4 p-2 bg-transparent border border-slate-300 rounded-lg flex flex-col justify-between space-y-1 shadow-xs">
            <div>
              <div className="flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider text-black pb-0.5 border-b border-slate-200">
                <div className="h-4 w-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[9px] shrink-0">
                  <User className="h-2.5 w-2.5" />
                </div>
                <span>BILL TO (BUYER)</span>
              </div>
              <div className="font-black text-[11px] text-black mt-1 leading-tight">
                {invoiceData.billTo.name}
              </div>
              <p className="text-[9.5px] text-slate-800 mt-0.5 leading-tight">
                {invoiceData.billTo.address}
              </p>
            </div>
            <div className="text-[9px] space-y-0.5 pt-1 border-t border-slate-200">
              <div className="flex justify-between"><strong className="text-slate-700">GSTIN :</strong> <span className="font-mono font-bold text-black">{invoiceData.billTo.gstin}</span></div>
              <div className="flex justify-between"><strong className="text-slate-700">Contact :</strong> <span className="text-black font-medium">{invoiceData.billTo.contact}</span></div>
              <div className="flex justify-between"><strong className="text-slate-700">Email :</strong> <span className="text-black font-medium truncate max-w-[130px]">{invoiceData.billTo.email}</span></div>
            </div>
          </div>

          {/* Card 2: SHIP TO (CONSIGNEE) */}
          <div className="sm:col-span-4 p-2 bg-transparent border border-slate-300 rounded-lg flex flex-col justify-between space-y-1 shadow-xs">
            <div>
              <div className="flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider text-black pb-0.5 border-b border-slate-200">
                <div className="h-4 w-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[9px] shrink-0">
                  <MapPin className="h-2.5 w-2.5" />
                </div>
                <span>SHIP TO <span className="text-[8px] font-normal text-slate-600">(CONSIGNEE)</span></span>
              </div>
              <div className="font-black text-[11px] text-black mt-1 leading-tight">
                {invoiceData.shipTo.name}
              </div>
              <p className="text-[9.5px] text-slate-800 mt-0.5 leading-tight">
                {invoiceData.shipTo.address}
              </p>
            </div>
            <div className="text-[9px] text-slate-600 italic pt-1 border-t border-slate-200 leading-tight">
              Dispatch from Works: Plot No. 12, Sector 5, Industrial Area
            </div>
          </div>

          {/* Card 3: TRANSPORT & ORDER DETAILS */}
          <div className="sm:col-span-4 p-2 bg-transparent border border-slate-300 rounded-lg space-y-0.5 text-[9px] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><FileText className="h-2.5 w-2.5 text-blue-800 shrink-0" /> Cust. Challan No.</span>
              <strong className="font-mono text-black font-bold">{invoiceData.transport.customerChallanNo || invoiceData.transport.challanNo || invoiceData.transport.customerPoNo || 'DC-2026-4401'}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><ClipboardList className="h-2.5 w-2.5 text-blue-800 shrink-0" /> Job Order No.</span>
              <strong className="font-mono text-black font-bold">{invoiceData.transport.jobOrderNo}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><FileText className="h-2.5 w-2.5 text-blue-800 shrink-0" /> E-Way Bill No.</span>
              <strong className="font-mono text-black font-bold">{invoiceData.transport.ewayBillNo}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><Truck className="h-2.5 w-2.5 text-blue-800 shrink-0" /> LR No.</span>
              <strong className="font-mono text-black font-bold">{invoiceData.transport.lrNo}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><Truck className="h-2.5 w-2.5 text-blue-800 shrink-0" /> Transporter</span>
              <strong className="text-black font-bold truncate max-w-[110px] text-right">{invoiceData.transport.transporter}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><Package className="h-2.5 w-2.5 text-blue-800 shrink-0" /> Freight</span>
              <strong className="text-black font-bold">{invoiceData.transport.freight}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><CreditCard className="h-2.5 w-2.5 text-blue-800 shrink-0" /> Payment Terms</span>
              <strong className="text-black font-bold">{invoiceData.transport.paymentTerms}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><Clock className="h-2.5 w-2.5 text-blue-800 shrink-0" /> Due Date</span>
              <strong className="text-black font-bold">{invoiceData.transport.dueDate}</strong>
            </div>
          </div>
        </div>

        {/* 4. ITEMS TABLE (Prominent Central Ledger with Continuous Column Dividers) */}
        <div className="invoice-table-container rounded-md overflow-hidden border border-slate-300 flex flex-col flex-1 min-h-[150px] bg-transparent">
          <table className="w-full table-fixed text-left text-xs border-collapse h-full flex-1 bg-transparent">
            <colgroup>
              <col style={{ width: '4%' }} />
              <col style={{ width: '24%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '8.5%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '4.5%' }} />
              <col style={{ width: '9%' }} />
            </colgroup>
            <thead>
              <tr className="invoice-table-header bg-[#0b2545] text-white text-[9px] font-black uppercase tracking-wider" style={{ backgroundColor: '#0b2545', color: '#ffffff' }}>
                <th className="p-1 text-center border-r border-slate-700 overflow-hidden leading-tight">Sr.<br />No.</th>
                <th className="p-1 border-r border-slate-700 overflow-hidden leading-tight">Description of Goods / Job Work</th>
                <th className="p-1 text-center border-r border-slate-700 overflow-hidden leading-tight">Part No. /<br />Specification</th>
                <th className="p-1 border-r border-slate-700 overflow-hidden leading-tight">Process</th>
                <th className="p-1 text-center border-r border-slate-700 overflow-hidden leading-tight">Batch No.</th>
                <th className="p-1 text-center border-r border-slate-700 overflow-hidden leading-tight">Heat No.</th>
                <th className="p-1 text-right border-r border-slate-700 overflow-hidden leading-tight">Qty<br />(Kg)</th>
                <th className="p-1 text-right border-r border-slate-700 overflow-hidden leading-tight">Rate<br />(₹/Kg)</th>
                <th className="p-1 text-center border-r border-slate-700 overflow-hidden leading-tight">GST<br />(%)</th>
                <th className="p-1 text-right overflow-hidden leading-tight">Amount<br />(₹)</th>
              </tr>
            </thead>
            <tbody className="text-[9.5px] font-medium bg-transparent">
              {invoiceData.items.map((row) => (
                <tr key={row.srNo} className="border-b border-slate-200 bg-transparent hover:bg-slate-50/40">
                  <td className="p-1 text-center border-r border-slate-200 font-bold text-black overflow-hidden">{row.srNo}</td>
                  <td className="p-1 border-r border-slate-200 overflow-hidden">
                    <div className="font-bold text-black text-[9.5px] leading-tight break-words">{row.description}</div>
                    {row.spec && <div className="text-[8px] text-slate-500 font-sans leading-tight mt-0.5 break-words">{row.spec}</div>}
                  </td>
                  <td className="p-1 text-center border-r border-slate-200 font-mono font-bold text-black text-[8.5px] break-all overflow-hidden">{row.partNo}</td>
                  <td className="p-1 border-r border-slate-200 text-black font-semibold text-[8.5px] break-words leading-tight overflow-hidden">{row.process}</td>
                  <td className="p-1 text-center border-r border-slate-200 font-mono font-bold text-black text-[8px] tracking-tight break-all overflow-hidden">{row.batchNo}</td>
                  <td className="p-1 text-center border-r border-slate-200 font-mono font-bold text-black text-[8px] break-all overflow-hidden">{row.heatNo}</td>
                  <td className="p-1 text-right border-r border-slate-200 font-mono font-bold text-black text-[9px] overflow-hidden">{row.qtyKg.toFixed(3)}</td>
                  <td className="p-1 text-right border-r border-slate-200 font-mono text-black text-[8.5px] overflow-hidden">{row.rate.toFixed(2)}</td>
                  <td className="p-1 text-center border-r border-slate-200 font-mono text-black text-[8.5px] overflow-hidden">{row.gstRate}</td>
                  <td className="p-1 text-right font-mono font-black text-black text-[9.5px] overflow-hidden">{row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}

              {/* Continuous vertical dividers through remaining vertical space (as seen in industrial bill) */}
              <tr className="h-full">
                <td className="border-r border-slate-200 p-0 overflow-hidden">&nbsp;</td>
                <td className="border-r border-slate-200 p-0 overflow-hidden"></td>
                <td className="border-r border-slate-200 p-0 overflow-hidden"></td>
                <td className="border-r border-slate-200 p-0 overflow-hidden"></td>
                <td className="border-r border-slate-200 p-0 overflow-hidden"></td>
                <td className="border-r border-slate-200 p-0 overflow-hidden"></td>
                <td className="border-r border-slate-200 p-0 overflow-hidden"></td>
                <td className="border-r border-slate-200 p-0 overflow-hidden"></td>
                <td className="border-r border-slate-200 p-0 overflow-hidden"></td>
                <td className="p-0 overflow-hidden"></td>
              </tr>

              {/* Connected Ledger Summary / Subtotal Row */}
              <tr className="invoice-total-row bg-transparent border-t border-slate-300 font-black text-xs text-black">
                <td colSpan={6} className="px-2 py-1 text-right uppercase tracking-wider border-r border-slate-300 font-bold text-[9px] text-slate-700 overflow-hidden">
                  Total Weight / Quantity (Kg)
                </td>
                <td className="px-1 py-1 text-right font-mono font-black text-black border-r border-slate-300 text-[9.5px] overflow-hidden">
                  {invoiceData.totalQtyKg}
                </td>
                <td colSpan={2} className="px-1 py-1 text-right uppercase tracking-wider border-r border-slate-300 font-bold text-[9px] text-slate-700 overflow-hidden">
                  Sub Total
                </td>
                <td className="px-1 py-1 text-right font-mono font-black text-black text-[10px] overflow-hidden">
                  ₹{invoiceData.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 5. PROCESS SUMMARY & VALUE PILLARS (4 Compact Rounded Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 text-xs">
          
          {/* Process Summary Card */}
          <div className="sm:col-span-5 p-1.5 bg-transparent border border-slate-300 rounded-md flex items-start gap-1.5 shadow-xs">
            <div className="h-4 w-4 rounded bg-orange-600 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
              <FileText className="h-2.5 w-2.5" />
            </div>
            <div>
              <div className="font-black text-[9px] uppercase text-black tracking-wider leading-none">PROCESS SUMMARY</div>
              <p className="text-[8px] text-slate-800 leading-tight mt-0.5">
                Heat Treatment as per customer specification & applicable standards. Material processed in controlled atmosphere.
              </p>
            </div>
          </div>

          {/* Traceability Card */}
          <div className="sm:col-span-3 p-1.5 bg-transparent border border-slate-300 rounded-md flex items-center gap-1.5 shadow-xs">
            <div className="h-4 w-4 rounded bg-[#0b2545] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Layers className="h-2.5 w-2.5" />
            </div>
            <div>
              <div className="font-black text-[9px] uppercase text-black tracking-wider leading-none">TRACEABILITY</div>
              <p className="text-[8.5px] text-black font-bold leading-tight mt-0.5">
                Heat No. &rarr; Batch &rarr; Invoice
              </p>
            </div>
          </div>

          {/* Quality Assured Card */}
          <div className="sm:col-span-2 p-1.5 bg-transparent border border-slate-300 rounded-md flex items-center gap-1 shadow-xs">
            <div className="h-4 w-4 rounded bg-[#0b2545] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="h-2.5 w-2.5" />
            </div>
            <div>
              <div className="font-black text-[8.5px] uppercase text-black tracking-wider leading-none">QUALITY ASSURED</div>
              <p className="text-[8px] text-slate-800 font-bold leading-tight mt-0.5">
                Controlled & Tested
              </p>
            </div>
          </div>

          {/* Customer Focused Card */}
          <div className="sm:col-span-2 p-1.5 bg-transparent border border-slate-300 rounded-md flex items-center gap-1 shadow-xs">
            <div className="h-4 w-4 rounded bg-[#0b2545] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Users className="h-2.5 w-2.5" />
            </div>
            <div>
              <div className="font-black text-[8.5px] uppercase text-black tracking-wider leading-none">CUSTOMER FOCUSED</div>
              <p className="text-[8px] text-slate-800 font-bold leading-tight mt-0.5">
                On Time Delivery
              </p>
            </div>
          </div>
        </div>

        {/* 6. LOWER GRID: BANK DETAILS | TERMS | FINANCIAL TOTALS (3 Rounded Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 text-xs">
          
          {/* Bank Details Card */}
          <div className="sm:col-span-4 p-2 bg-transparent border border-slate-300 rounded-lg space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 font-black text-black uppercase tracking-wider pb-0.5 border-b border-slate-200 text-[10px]">
              <Building2 className="h-3.5 w-3.5 text-[#0b2545]" />
              <span>Bank Details</span>
            </div>
            <div className="space-y-0.5 text-[9.5px] pt-0.5">
              <div className="flex justify-between"><span className="text-slate-700 font-bold">Bank Name :</span> <strong className="text-black">{invoiceData.bank.name}</strong></div>
              <div className="flex justify-between"><span className="text-slate-700 font-bold">A/C No. :</span> <strong className="font-mono text-black font-black">{invoiceData.bank.acNo}</strong></div>
              <div className="flex justify-between"><span className="text-slate-700 font-bold">IFSC Code :</span> <strong className="font-mono text-black font-black">{invoiceData.bank.ifsc}</strong></div>
              <div className="flex justify-between"><span className="text-slate-700 font-bold">Branch :</span> <strong className="text-black">{invoiceData.bank.branch}</strong></div>
            </div>
          </div>

          {/* Terms & Conditions Card */}
          <div className="sm:col-span-4 p-2 bg-transparent border border-slate-300 rounded-lg space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 font-black text-black uppercase tracking-wider pb-0.5 border-b border-slate-200 text-[10px]">
              <ScrollText className="h-3.5 w-3.5 text-[#0b2545]" />
              <span>Terms & Conditions</span>
            </div>
            <ol className="list-decimal list-inside text-[8px] text-slate-800 space-y-0.5 leading-tight pt-0.5">
              <li>Goods once sold will not be taken back.</li>
              <li>Payment within agreed credit period.</li>
              <li>Interest @ 24% p.a. on overdue payments.</li>
              <li>Responsibility ceases once goods leave premises.</li>
              <li>Subject to Rajkot Jurisdiction only.</li>
              <li>Computer generated invoice, no signature required.</li>
            </ol>
          </div>

          {/* Financial Calculation Card with Solid Orange Grand Total */}
          <div className="sm:col-span-4 bg-transparent border border-slate-300 rounded-lg flex flex-col justify-between overflow-hidden shadow-xs">
            <div className="p-2 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">Taxable Sub Total</span>
                <span className="font-mono font-black text-black">₹{invoiceData.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {invoiceData.isInterstate ? (
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">IGST @ 18%</span>
                  <span className="font-mono font-black text-black">₹{invoiceData.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700">CGST @ 9%</span>
                    <span className="font-mono font-black text-black">₹{invoiceData.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700">SGST @ 9%</span>
                    <span className="font-mono font-black text-black">₹{invoiceData.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between border-b border-slate-200 pb-0.5">
                <span className="font-semibold text-slate-700">Round Off</span>
                <span className="font-mono font-black text-black">₹{invoiceData.roundOff.toFixed(2)}</span>
              </div>
            </div>

            {/* Grand Total Solid Orange Banner with Rounded Bottom */}
            <div
              className="invoice-total-banner bg-[#ea580c] text-white py-1.5 px-3 flex items-center justify-between font-black text-xs uppercase tracking-wide"
              style={{ backgroundColor: '#ea580c', color: '#ffffff' }}
            >
              <span style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>Grand Total (₹)</span>
              <span className="text-sm font-mono font-black" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
                ₹{invoiceData.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* 7. AMOUNT IN WORDS & SIGNATORY/STAMP AREA */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
          
          {/* Amount in Words Card */}
          <div className="sm:col-span-7 p-2.5 bg-transparent border border-slate-300 rounded-lg shadow-sm">
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
        <div
          className="invoice-footer-banner rounded-lg overflow-hidden flex flex-col sm:flex-row items-stretch justify-between bg-[#0b2545] text-white"
          style={{ backgroundColor: '#0b2545', color: '#ffffff' }}
        >
          
          {/* Left: Contact Info & Regulatory Identifiers */}
          <div className="py-1.5 px-3 flex-1 text-[9px] space-y-0.5">
            <div className="flex items-center gap-1.5 text-white">
              <MapPin className="h-2.5 w-2.5 text-orange-400 shrink-0" />
              <span className="text-white">Plot No. XX, Industrial Area, Rajkot – 360____, Gujarat, India</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-white">
              <span className="text-white">📞 +91 98258 70821</span>
              <span className="text-white">✉ info@matheat.in</span>
              <span className="text-white">🌐 www.matheat.in</span>
            </div>
            <div className="text-[8px] text-white font-mono tracking-tight pt-0.5 border-t border-slate-700/60">
              <span className="text-white">CIN : U29299GJ2026PTCXXX0X &nbsp;|&nbsp; GSTIN : 24XXXXX0000X &nbsp;|&nbsp; IEC : XXXXXXXXXX</span>
            </div>
          </div>

          {/* Right: Angled Flame Orange Accent Wedge Banner */}
          <div
            className="invoice-footer-wedge w-full sm:w-[190px] bg-[#ea580c] p-2 flex flex-col justify-center text-right font-black uppercase tracking-wider text-white shrink-0"
            style={{
              clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)',
              backgroundColor: '#ea580c',
              color: '#ffffff'
            }}
          >
            <div className="text-[11px] text-white font-black leading-tight" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>HEAT TODAY</div>
            <div className="text-[9px] text-white font-black leading-tight" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>A STRONGER TOMORROW</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal Dialog Mode (used when opened as a popup with isOpen/onClose)
  if (isModal) {
    return (
      <div
        id="invoice-modal-backdrop"
        className="invoice-modal-backdrop fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div className="invoice-modal-container relative w-full max-w-[880px] my-2 sm:my-4 flex flex-col font-sans">
          {/* Top Action Ribbon - Screen Only (Hidden on Print) */}
          <div className="no-print mb-2.5 flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl shadow-2xl border bg-white border-slate-300 text-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow">
                <FileCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-black tracking-wide flex items-center gap-2">
                  <span className="text-slate-900">OFFICIAL TAX INVOICE</span>
                  <span className="font-mono text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-300 text-[11px] font-bold">
                    {invoiceData.invoiceNo}
                  </span>
                </div>
                <div className="text-[10px] mt-0.5 text-slate-600">
                  Client: <strong className="text-slate-900">{invoiceData.billTo?.name}</strong> &bull; Total:{' '}
                  <strong className="text-emerald-700 font-mono">₹{invoiceData.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" /> WhatsApp
              </button>
              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> PDF
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" /> Print Bill (A4)
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

          {/* Printable Invoice Sheet */}
          {invoiceSheetContent}
        </div>
      </div>
    );
  }

  // Inline Page / Tab Mode (embedded directly with invoice selector dropdown)
  return (
    <div className="space-y-4">
      {/* Top Action Ribbon (Hidden During Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-blue-600" />
            Official MATHEAT Tax Invoice (Live Template)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
            Invoice No: <span className="font-bold text-orange-600">{invoiceData.invoiceNo}</span> &bull; 
            Client: <span className="font-bold text-slate-900 dark:text-white">{invoiceData.billTo?.name}</span> &bull; 
            GST Ready with Scannable Verification
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {liveInvoices.length > 0 && (
            <select
              value={selectedInvoice?._id || (selectedInvoice ? selectedInvoice.invoiceNumber || 'custom' : 'preview')}
              onChange={(e) => {
                if (e.target.value === 'preview') {
                  setSelectedInvoice(null);
                } else {
                  const found = liveInvoices.find((inv) => (inv._id || inv.invoiceNumber) === e.target.value);
                  if (found) setSelectedInvoice(found);
                }
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="preview">Sample Preview Template (MH/25-26/0001)</option>
              {liveInvoices.map((inv) => (
                <option key={inv._id || inv.invoiceNumber} value={inv._id || inv.invoiceNumber}>
                  {inv.invoiceNumber || inv.invoiceNo} - {inv.companyName || inv.customerName || 'Customer'}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
          >
            <Share2 className="h-4 w-4" /> WhatsApp
          </button>
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
            <Printer className="h-4 w-4" /> Print Tax Invoice (A4)
          </button>
        </div>
      </div>

      {/* Printable Invoice Sheet */}
      {invoiceSheetContent}
    </div>
  );
};

// Aliased export so existing imports of TaxInvoicePrintModal continue working seamlessly
export const TaxInvoicePrintModal = TaxInvoiceViewer;
export default TaxInvoiceViewer;

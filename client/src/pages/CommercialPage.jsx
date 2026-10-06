import React, { useState, useEffect } from 'react';
import {
  Truck,
  Receipt,
  Coins,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Download,
  Plus,
  AlertTriangle,
  Printer,
  Eye,
  Trash2,
  Share2,
  Search,
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  Check,
  X,
  Building,
  ArrowRight
} from 'lucide-react';
import { TaxInvoiceViewer } from '../components/TaxInvoiceViewer';
import { CreateTaxInvoiceModal } from '../components/CreateTaxInvoiceModal';
import api from '../api/client';

export const CommercialPage = ({ onSelectTab }) => {
  const [activeSubTab, setActiveSubTab] = useState('invoices'); // 'invoices', 'payments', 'dispatch', 'costing'
  const [dispatches, setDispatches] = useState(() => {
    const cached = api.cache.get('/commercial/dispatch');
    return Array.isArray(cached) ? cached : (cached?.dispatches || cached?.data || []);
  });
  const [invoices, setInvoices] = useState(() => {
    const cached = api.cache.get('/commercial/invoices');
    return Array.isArray(cached) ? cached : (cached?.invoices || cached?.data || []);
  });
  const [payments, setPayments] = useState(() => {
    const cached = api.cache.get('/payments');
    return Array.isArray(cached) ? cached : (cached?.payments || cached?.data || []);
  });
  const [paymentSummary, setPaymentSummary] = useState(() => {
    const cached = api.cache.get('/payments/summary');
    return cached?.summary || {
      totalInvoiced: 0,
      totalCollected: 0,
      totalOutstanding: 0,
      overdueAmount: 0,
      collectionRatioPercent: 0
    };
  });
  const [costing, setCosting] = useState(() => {
    const cached = api.cache.get('/commercial/costing');
    return Array.isArray(cached) ? cached : (cached?.costings || cached?.data || []);
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPrintInvoice, setSelectedPrintInvoice] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Payment Recording Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    paymentNumber: '',
    invoiceId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'NEFT',
    referenceNumber: '',
    bankName: 'State Bank of India',
    remarks: ''
  });

  const loadCommercialData = async () => {
    try {
      const [invRes, dspRes, cstRes, payRes, sumRes] = await Promise.all([
        api.commercial.getInvoices().catch(() => []),
        api.commercial.getDispatches().catch(() => []),
        api.commercial.getCosting().catch(() => []),
        api.payments.getPayments().catch(() => []),
        api.payments.getSummary().catch(() => null)
      ]);
      const invList = Array.isArray(invRes) ? invRes : (invRes?.invoices || []);
      setInvoices(invList);
      const dspList = Array.isArray(dspRes) ? dspRes : (dspRes?.dispatches || []);
      setDispatches(dspList);
      const cstList = Array.isArray(cstRes) ? cstRes : (cstRes?.costings || []);
      setCosting(cstList);
      const payList = Array.isArray(payRes) ? payRes : (payRes?.payments || payRes?.data || []);
      setPayments(payList);
      if (sumRes?.summary) {
        setPaymentSummary(sumRes.summary);
      }
    } catch (err) {
      console.warn('[COMMERCIAL] Could not fetch data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommercialData();

    const handleSync = () => {
      loadCommercialData();
    };

    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const handleDownloadInvoice = (invNum) => {
    window.open(api.documents.getInvoiceUrl(invNum), '_blank');
  };

  const handleDeleteInvoice = async (id, invNo) => {
    if (!window.confirm(`Are you sure you want to permanently delete Tax Invoice ${invNo}?`)) return;
    try {
      await api.commercial.deleteInvoice(id);
      loadCommercialData();
    } catch (err) {
      alert(err.message || 'Failed to delete invoice');
    }
  };

  const handleWhatsAppShare = (inv) => {
    const invNo = inv.invoiceNumber || inv.invoiceNo;
    const invDate = inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-IN') : '';
    const custName = inv.companyName || inv.customerName || inv.customer?.companyName || 'Customer';
    const gTotal = (inv.grandTotal || inv.totalAmount || 0).toLocaleString('en-IN');

    const text = `*TAX INVOICE - MATHEAT PVT. LTD.*\n` +
      `Invoice No: ${invNo}\n` +
      `Date: ${invDate}\n` +
      `Billed To: ${custName}\n` +
      `Grand Total: ₹${gTotal}\n` +
      `Place of Supply: ${inv.state || 'Gujarat'}\n\n` +
      `Thank you for your business with MATHEAT! Support: +91 98258 70821`;

    const rawPhone = (inv.phone || inv.customer?.phone || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Open Payment Modal
  const handleOpenPaymentModal = async (targetInvoice = null) => {
    setPaymentError('');
    let nextNum = 'PAY-00001';
    try {
      const res = await api.payments.getNextPaymentNumber();
      if (res?.paymentNumber) nextNum = res.paymentNumber;
    } catch (e) {
      console.warn('Next payment number error:', e);
    }

    let defaultInvId = '';
    let defaultAmount = '';
    if (targetInvoice) {
      defaultInvId = targetInvoice._id;
      const gTotal = Number(targetInvoice.grandTotal || targetInvoice.totalAmount || 0);
      const paid = Number(targetInvoice.amountPaid || 0);
      defaultAmount = Math.max(0, gTotal - paid);
    }

    setPaymentForm({
      paymentNumber: nextNum,
      invoiceId: defaultInvId,
      amount: defaultAmount ? String(defaultAmount) : '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'NEFT',
      referenceNumber: `UTR-${Date.now().toString().slice(-6)}`,
      bankName: 'State Bank of India',
      remarks: ''
    });
    setShowPaymentModal(true);
  };

  const handleInvoiceSelectInForm = (invId) => {
    const inv = invoices.find((i) => i._id === invId);
    if (inv) {
      const gTotal = Number(inv.grandTotal || inv.totalAmount || 0);
      const paid = Number(inv.amountPaid || 0);
      const balance = Math.max(0, gTotal - paid);
      setPaymentForm({
        ...paymentForm,
        invoiceId: invId,
        amount: String(balance)
      });
    } else {
      setPaymentForm({ ...paymentForm, invoiceId: invId });
    }
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentError('');

    if (!paymentForm.invoiceId) {
      setPaymentError('Please select a Tax Invoice.');
      return;
    }
    const amt = Number(paymentForm.amount);
    if (!amt || amt <= 0) {
      setPaymentError('Payment amount must be greater than zero.');
      return;
    }

    try {
      setSubmittingPayment(true);
      await api.payments.recordPayment({
        paymentNumber: paymentForm.paymentNumber,
        invoice: paymentForm.invoiceId,
        amount: amt,
        paymentDate: paymentForm.paymentDate,
        paymentMode: paymentForm.paymentMode,
        referenceNumber: paymentForm.referenceNumber,
        bankName: paymentForm.bankName,
        remarks: paymentForm.remarks
      });
      setShowPaymentModal(false);
      await loadCommercialData();
    } catch (err) {
      setPaymentError(err.message || 'Failed to record payment.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleDeletePayment = async (id, num) => {
    if (!window.confirm(`Are you sure you want to delete payment receipt ${num}? This will revert the customer invoice balance.`)) return;
    try {
      await api.payments.deletePayment(id);
      await loadCommercialData();
    } catch (err) {
      alert(`Could not delete payment: ${err.message}`);
    }
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const invNo = (inv.invoiceNumber || '').toLowerCase();
    const cust = (inv.companyName || inv.customerName || inv.customer?.companyName || '').toLowerCase();
    const phone = (inv.phone || '').toLowerCase();
    return invNo.includes(term) || cust.includes(term) || phone.includes(term);
  });

  // Filtered payments
  const filteredPayments = payments.filter((p) => {
    if (!paymentSearch) return true;
    const term = paymentSearch.toLowerCase();
    return (
      (p.paymentNumber && p.paymentNumber.toLowerCase().includes(term)) ||
      (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(term)) ||
      (p.customerName && p.customerName.toLowerCase().includes(term)) ||
      (p.referenceNumber && p.referenceNumber.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm no-print">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="h-5 w-5 text-orange-600" />
            Commercial Operations, Invoicing &amp; Accounts Receivables
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Customer PO &rarr; Job Order &rarr; Dispatch Challan &rarr; GST Tax Invoice &rarr; Payment Settlement &amp; Ledger
          </p>
        </div>

        {/* Action Button & Subtab Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 no-print">
          {/* Subtab Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-300 dark:border-slate-800 text-xs font-semibold overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveSubTab('invoices')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'invoices' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Receipt className="h-3.5 w-3.5" /> Invoice Register
            </button>
            <button
              onClick={() => setActiveSubTab('payments')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'payments' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" /> Payments &amp; Receivables
              {paymentSummary.totalOutstanding > 0 && (
                <span className="text-[10px] bg-red-100 text-red-700 font-mono font-bold px-1.5 py-0.2 rounded-full">
                  ₹{(paymentSummary.totalOutstanding / 1000).toFixed(0)}k Due
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('dispatch')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeSubTab === 'dispatch' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Dispatch Register
            </button>
            <button
              onClick={() => setActiveSubTab('costing')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeSubTab === 'costing' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Batch Costing (₹/kg)
            </button>
          </div>

          {activeSubTab === 'payments' ? (
            <button
              onClick={() => handleOpenPaymentModal()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" /> Record Payment
            </button>
          ) : (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" /> Create Tax Invoice
            </button>
          )}
        </div>
      </div>

      {/* 1. DISPATCH REGISTER */}
      {activeSubTab === 'dispatch' && (
        <div className="space-y-4 no-print">
          <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-3 text-xs text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <strong>Strict QC Verification Gate Enforced:</strong> Outward customer dispatch is locked until heat treatment batch has achieved authorized QC PASS sign-off.
            </div>
          </div>

          {dispatches.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
              <div className="h-14 w-14 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Truck className="h-7 w-7 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Zero Dispatch Records Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                When heat treatment batches pass inspection and are approved for shipment, they will be listed here with truck gate-out weighment verification.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Dispatch No &amp; Date</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Batch &amp; Heat Number</th>
                    <th className="p-3">Weight &amp; Quantity</th>
                    <th className="p-3">Vehicle &amp; Transporter</th>
                    <th className="p-3">QC Status</th>
                    <th className="p-3 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                  {dispatches.map((d) => (
                    <tr key={d.dispatchNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono">
                        <span className="font-bold text-slate-900 dark:text-white block">{d.dispatchNumber}</span>
                        <span className="text-[10px] text-slate-500">{d.date || new Date(d.createdAt).toLocaleDateString('en-IN')}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{d.customer?.companyName || d.customerName || 'Customer'}</td>
                      <td className="p-3 font-mono">
                        <span className="text-orange-600 dark:text-orange-400 font-bold block">{d.batchId}</span>
                        <span className="text-red-500 font-semibold text-[10px]">Heat: {d.heatNumber}</span>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="font-bold text-slate-900 dark:text-white block">{d.weightKg} kg</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{d.quantityPcs} pcs</span>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        <div>{d.vehicleNumber}</div>
                        <span className="text-[10px] text-slate-500">{d.transporterName || d.transporter}</span>
                      </td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 rounded w-fit">
                          <CheckCircle2 className="h-3 w-3" /> QC PASS VERIFIED
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDownloadInvoice(d.invoiceNumber)}
                          className="text-orange-600 dark:text-orange-400 hover:underline font-bold text-xs font-mono"
                        >
                          {d.invoiceNumber} &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. GST TAX INVOICES REGISTER */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-4 no-print">
          {/* Action & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search invoice no, customer, phone..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-500 font-semibold">
                Total Invoices: <strong className="text-slate-900 dark:text-white font-mono">{invoices.length}</strong>
              </span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> New Tax Invoice
              </button>
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
              <div className="h-14 w-14 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Receipt className="h-7 w-7 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                No Tax Invoices Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                Click the button below to generate a new GST Tax Invoice with automated numbering, real-time GST calculations, and A4 print compliance.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Create First Tax Invoice
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Invoice No &amp; Date</th>
                    <th className="p-3">Customer / Billed To</th>
                    <th className="p-3 text-center">Items &amp; HSN</th>
                    <th className="p-3 text-right">Grand Total</th>
                    <th className="p-3 text-right">Paid / Received</th>
                    <th className="p-3 text-right">Balance Due</th>
                    <th className="p-3 text-center">Payment Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                  {filteredInvoices.map((inv) => {
                    const invNo = inv.invoiceNumber || inv.invoiceNo || 'INV-2026';
                    const invDate = inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-IN') : 'N/A';
                    const custName = inv.companyName || inv.customerName || inv.customer?.companyName || 'Direct Customer';
                    const gTotal = inv.grandTotal || inv.totalAmount || 0;
                    const paid = Number(inv.amountPaid || 0);
                    const due = Math.max(0, gTotal - paid);
                    const itemCount = inv.items?.length || 1;
                    const pStatus = inv.paymentStatus || (paid >= gTotal - 0.5 && gTotal > 0 ? 'PAID' : paid > 0 ? 'PARTIALLY_PAID' : 'UNPAID');

                    return (
                      <tr key={inv._id || invNo} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono">
                          <span className="font-black text-slate-900 dark:text-white block text-xs">{invNo}</span>
                          <span className="text-[10px] text-slate-500">{invDate}</span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{custName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {inv.gstNumber || inv.gstin || inv.customer?.gstin || (inv.phone ? `Phone: ${inv.phone}` : '')}
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono">
                          <span className="font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded text-[10px]">
                            {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-black text-right text-slate-950 dark:text-white text-xs">
                          ₹{gTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 font-mono font-bold text-right text-emerald-600 dark:text-emerald-400 text-xs">
                          ₹{paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 font-mono font-bold text-right text-xs">
                          {due > 0 ? (
                            <span className="text-red-600 dark:text-red-400">
                              ₹{due.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-slate-400">₹0.00</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 font-bold text-[9.5px] rounded uppercase font-mono ${
                            pStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : pStatus === 'PARTIALLY_PAID'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                          }`}>
                            {pStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {due > 0 && (
                              <button
                                onClick={() => handleOpenPaymentModal(inv)}
                                title="Record Payment for this Invoice"
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                              >
                                <DollarSign className="h-3 w-3" /> Pay
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedPrintInvoice(inv);
                                setShowPrintModal(true);
                              }}
                              title="View &amp; Print A4 Tax Invoice"
                              className="flex items-center gap-1 px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-bold shadow-xs transition-colors cursor-pointer"
                            >
                              <Printer className="h-3.5 w-3.5" /> View
                            </button>

                            <button
                              onClick={() => handleWhatsAppShare(inv)}
                              title="Share on WhatsApp"
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </button>

                            {inv._id && (
                              <button
                                onClick={() => handleDeleteInvoice(inv._id, invNo)}
                                title="Delete Invoice"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. PAYMENTS & RECEIVABLES TAB */}
      {activeSubTab === 'payments' && (
        <div className="space-y-4 no-print">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-500 uppercase font-bold">
                <span>Total Invoiced</span>
                <Receipt className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                ₹{(paymentSummary.totalInvoiced || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
              <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 uppercase font-bold">
                <span>Total Collected</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                ₹{(paymentSummary.totalCollected || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5 font-bold">
                Collection Ratio: {paymentSummary.collectionRatioPercent || 0}%
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
              <div className="flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-400 uppercase font-bold">
                <span>Outstanding Receivables</span>
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1 font-mono">
                ₹{(paymentSummary.totalOutstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 shadow-xs">
              <div className="flex items-center justify-between text-[11px] text-red-700 dark:text-red-400 uppercase font-bold">
                <span>Overdue (Past 30 Days)</span>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-xl font-black text-red-700 dark:text-red-400 mt-1 font-mono">
                ₹{(paymentSummary.overdueAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Filter Bar & Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                placeholder="Search payment #, invoice #, customer..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => handleOpenPaymentModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Record Customer Payment
              </button>
            </div>
          </div>

          {/* Payments Table */}
          {filteredPayments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
              <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CreditCard className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                No Payment Records Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                Record bank NEFT/RTGS receipts, Cheques, or UPI customer settlements to reconcile outstanding balances against issued tax invoices.
              </p>
              <button
                onClick={() => handleOpenPaymentModal()}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Record First Payment
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Payment Receipt #</th>
                    <th className="p-3">Customer Entity</th>
                    <th className="p-3">Linked Tax Invoice</th>
                    <th className="p-3 text-right">Amount Received</th>
                    <th className="p-3">Mode &amp; Bank</th>
                    <th className="p-3">Transaction / UTR #</th>
                    <th className="p-3">Payment Date</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                  {filteredPayments.map((p) => (
                    <tr key={p._id || p.paymentNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {p.paymentNumber}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {p.customerName || p.customer?.companyName || 'Customer'}
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {p.invoiceNumber}
                      </td>
                      <td className="p-3 font-mono font-black text-right text-emerald-600 dark:text-emerald-400 text-sm">
                        ₹{(p.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{p.paymentMode}</span>
                        <span className="text-[10px] text-slate-500">{p.bankName || 'State Bank of India'}</span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {p.referenceNumber}
                      </td>
                      <td className="p-3 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[9.5px] rounded uppercase font-mono">
                          {p.status || 'CLEARED'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeletePayment(p._id, p.paymentNumber)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                          title="Delete Payment & Revert Balance"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. BATCH COSTING */}
      {activeSubTab === 'costing' && (
        <div className="no-print">
          {costing.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
              <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Coins className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                No Batch Costing Records Available
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                All mock costing calculations have been cleared. As production batches are processed in furnaces, their direct electricity (kWh), gas, quench oil, labor, and depreciation costs will be tracked on this board.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Batch-Level Energy, Consumable &amp; Direct Labor Costing
                </h2>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {costing.map((c) => (
                  <div key={c.batchId} className="py-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-sm font-bold text-orange-600 dark:text-orange-400">
                        Batch: {c.batchId} ({c.batchWeightKg} kg)
                      </div>
                      <div className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                        Billing Revenue: <strong className="text-slate-900 dark:text-white">₹ {c.billingRevenue?.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl shadow-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden my-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                <h3 className="font-black text-sm uppercase tracking-wider">
                  Record Customer Payment Receipt
                </h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4">
              {paymentError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Receipt Number</label>
                  <input
                    type="text"
                    value={paymentForm.paymentNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentNumber: e.target.value })}
                    className="w-full p-2.5 rounded-lg border text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    className="w-full p-2.5 rounded-lg border text-xs font-semibold bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                    required
                  />
                </div>
              </div>

              {/* Invoice Selector */}
              <div>
                <label className="block text-xs font-bold mb-1">Select Tax Invoice to Settle *</label>
                <select
                  value={paymentForm.invoiceId}
                  onChange={(e) => handleInvoiceSelectInForm(e.target.value)}
                  className="w-full p-2.5 rounded-lg border text-xs font-medium bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                  required
                >
                  <option value="">-- Choose Tax Invoice --</option>
                  {invoices.map((inv) => {
                    const gTotal = Number(inv.grandTotal || inv.totalAmount || 0);
                    const paid = Number(inv.amountPaid || 0);
                    const bal = Math.max(0, gTotal - paid);
                    const cust = inv.companyName || inv.customerName || 'Customer';
                    return (
                      <option key={inv._id} value={inv._id}>
                        {inv.invoiceNumber} &bull; {cust} &bull; Total: ₹{gTotal.toLocaleString('en-IN')} (Due: ₹{bal.toLocaleString('en-IN')})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Amount & Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Settlement Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="e.g. 25000"
                    className="w-full p-2.5 rounded-lg border text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Payment Mode</label>
                  <select
                    value={paymentForm.paymentMode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                    className="w-full p-2.5 rounded-lg border text-xs font-bold bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                  >
                    <option value="NEFT">NEFT / RTGS</option>
                    <option value="CHEQUE">Cheque / Demand Draft</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CASH">Cash Deposit</option>
                    <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                  </select>
                </div>
              </div>

              {/* Reference & Bank */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">UTR / Cheque / Ref Number *</label>
                  <input
                    type="text"
                    value={paymentForm.referenceNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                    placeholder="e.g. CMS294829104"
                    className="w-full p-2.5 rounded-lg border text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Depository Bank</label>
                  <input
                    type="text"
                    value={paymentForm.bankName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                    placeholder="e.g. State Bank of India / HDFC"
                    className="w-full p-2.5 rounded-lg border text-xs font-semibold bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold mb-1">Accounting Remarks</label>
                <input
                  type="text"
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  placeholder="e.g. Full settlement against heat batch delivery"
                  className="w-full p-2.5 rounded-lg border text-xs bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow disabled:opacity-50"
                >
                  {submittingPayment ? 'Recording...' : 'Record Payment Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Tax Invoice Modal */}
      <CreateTaxInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onInvoiceCreated={(newInv) => {
          loadCommercialData();
          setSelectedPrintInvoice(newInv);
          setShowPrintModal(true);
        }}
      />

      {/* A4 Tax Invoice Print & PDF Modal */}
      <TaxInvoiceViewer
        isOpen={showPrintModal}
        invoice={selectedPrintInvoice}
        onClose={() => {
          setShowPrintModal(false);
          setSelectedPrintInvoice(null);
        }}
      />
    </div>
  );
};

export default CommercialPage;

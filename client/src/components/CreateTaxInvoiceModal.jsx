import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Save,
  X,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Percent,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../api/client';
import { numberToWords } from '../utils/numberToWords';

export const CreateTaxInvoiceModal = ({ isOpen, onClose, onInvoiceCreated }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customer: '',
    customerType: 'Customer', // 'Customer' or 'Custom'
    customerName: '',
    companyName: '',
    phone: '',
    email: '',
    gstNumber: '',
    billingAddress: '',
    shippingAddress: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '382445',
    placeOfSupply: 'Gujarat (24)',
    reverseCharge: 'No',

    // Transport Details
    transport: {
      customerChallanNo: '',
      challanNo: '',
      customerPoNo: '',
      jobOrderNo: '',
      ewayBillNo: '',
      lrNo: '',
      transporter: '',
      vehicleNumber: ''
    },

    // Line Items
    items: [
      {
        name: 'Heat Treatment Job Work (Hardening & Tempering)',
        hsnCode: '9988',
        quantity: 500,
        unit: 'Kg',
        unitPrice: 45,
        discountPercent: 0,
        taxableAmount: 22500,
        gstRate: 18,
        gstAmount: 4050,
        totalAmount: 26550
      }
    ],

    // Calculations
    subtotal: 22500,
    freightCharges: 0,
    packagingCharges: 0,
    isInterstate: false,
    cgstAmount: 2025,
    sgstAmount: 2025,
    igstAmount: 0,
    totalGst: 4050,
    grandTotal: 26550,
    amountInWords: 'Rupees Twenty Six Thousand Five Hundred Fifty Only',

    // Bank Details
    bankDetails: {
      bankName: 'State Bank of India',
      accountName: 'MATHEAT PRIVATE LIMITED',
      accountNumber: '30998822110',
      ifscCode: 'SBIN0001234',
      branch: 'Vatva GIDC, Ahmedabad'
    },

    paymentTerms: '30 Days Net from Delivery',
    notes: 'Material processed and tested strictly according to customer technical specifications and ASTM/IS metallurgical standards.'
  });

  // Fetch initial data (Next sequential number + Customers list)
  useEffect(() => {
    if (!isOpen) return;

    const initData = async () => {
      setLoading(true);
      setError('');
      try {
        const [numRes, custRes, joRes] = await Promise.all([
          api.commercial.getNextInvoiceNumber().catch(() => ({ invoiceNumber: 'MT-00001' })),
          api.customers.getAll().catch(() => []),
          api.jobOrders.getAll().catch(() => [])
        ]);

        if (numRes?.invoiceNumber) {
          setFormData((prev) => ({ ...prev, invoiceNumber: numRes.invoiceNumber }));
        }

        const custList = Array.isArray(custRes) ? custRes : (custRes?.data || custRes?.customers || []);
        
        // Also extract unique customers from existing Job Orders so dropdown always has complete choices
        const joList = Array.isArray(joRes) ? joRes : (joRes?.data || joRes?.jobOrders || []);
        const seen = new Set();
        const merged = [];

        custList.forEach((c) => {
          const key = (c.companyName || c.name || c.customerName || '').toLowerCase().trim();
          if (key && !seen.has(key)) {
            seen.add(key);
            merged.push(c);
          }
        });

        joList.forEach((jo, idx) => {
          const cObj = typeof jo.customer === 'object' ? jo.customer : null;
          const cName = cObj?.companyName || (typeof jo.customer === 'string' ? jo.customer : '') || jo.customerName;
          if (cName) {
            const key = cName.trim().toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              merged.push({
                _id: cObj?._id || `jo-cust-${idx}`,
                companyName: cName,
                name: cObj?.name || jo.contactPerson || cName,
                gstin: cObj?.gstin || jo.gstin || '',
                phone: cObj?.phone || jo.phone || '',
                address: cObj?.address || jo.address || '',
                city: cObj?.city || 'Ahmedabad',
                state: cObj?.state || 'Gujarat',
                pincode: cObj?.pincode || '382445'
              });
            }
          }
        });

        setCustomers(merged);
      } catch (err) {
        console.error('Error initializing invoice modal:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [isOpen]);

  // Recalculate totals whenever items, freight, packaging, or state change
  const recalculateTotals = useCallback((itemsList, freightVal, packagingVal, stateVal, isInterstateVal) => {
    let sub = 0;
    let gstSum = 0;

    const updatedItems = (itemsList || []).map((item) => {
      const qty = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.unitPrice) || 0;
      const disc = parseFloat(item.discountPercent) || 0;
      const gstRate = parseFloat(item.gstRate) || 18;

      const baseAmount = qty * rate;
      const discountAmount = (baseAmount * disc) / 100;
      const taxableAmount = Math.max(0, baseAmount - discountAmount);
      const itemGst = (taxableAmount * gstRate) / 100;
      const totalAmount = taxableAmount + itemGst;

      sub += taxableAmount;
      gstSum += itemGst;

      return {
        ...item,
        taxableAmount: Math.round(taxableAmount * 100) / 100,
        gstAmount: Math.round(itemGst * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100
      };
    });

    const isInterstate = isInterstateVal !== undefined 
      ? isInterstateVal 
      : (stateVal || 'Gujarat').trim().toLowerCase() !== 'gujarat';

    const freight = parseFloat(freightVal) || 0;
    const packaging = parseFloat(packagingVal) || 0;
    const freightGst = (freight * 18) / 100;
    const packagingGst = (packaging * 18) / 100;

    const totalGst = gstSum + freightGst + packagingGst;
    const grandTotal = Math.round(sub + freight + packaging + totalGst);

    const cgstAmount = isInterstate ? 0 : Math.round((totalGst / 2) * 100) / 100;
    const sgstAmount = isInterstate ? 0 : Math.round((totalGst / 2) * 100) / 100;
    const igstAmount = isInterstate ? Math.round(totalGst * 100) / 100 : 0;

    return {
      updatedItems,
      subtotal: Math.round(sub * 100) / 100,
      freightCharges: freight,
      packagingCharges: packaging,
      isInterstate,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalGst: Math.round(totalGst * 100) / 100,
      grandTotal,
      amountInWords: numberToWords(grandTotal)
    };
  }, []);

  // Update item field
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    const calcs = recalculateTotals(newItems, formData.freightCharges, formData.packagingCharges, formData.state, formData.isInterstate);
    setFormData((prev) => ({
      ...prev,
      items: calcs.updatedItems,
      subtotal: calcs.subtotal,
      cgstAmount: calcs.cgstAmount,
      sgstAmount: calcs.sgstAmount,
      igstAmount: calcs.igstAmount,
      totalGst: calcs.totalGst,
      grandTotal: calcs.grandTotal,
      amountInWords: calcs.amountInWords
    }));
  };

  // Add line item
  const handleAddItem = () => {
    const newItem = {
      name: '',
      hsnCode: '9988',
      quantity: 1,
      unit: 'Kg',
      unitPrice: 0,
      discountPercent: 0,
      taxableAmount: 0,
      gstRate: 18,
      gstAmount: 0,
      totalAmount: 0
    };
    const newItems = [...formData.items, newItem];
    const calcs = recalculateTotals(newItems, formData.freightCharges, formData.packagingCharges, formData.state, formData.isInterstate);
    setFormData((prev) => ({
      ...prev,
      items: calcs.updatedItems,
      subtotal: calcs.subtotal,
      cgstAmount: calcs.cgstAmount,
      sgstAmount: calcs.sgstAmount,
      igstAmount: calcs.igstAmount,
      totalGst: calcs.totalGst,
      grandTotal: calcs.grandTotal,
      amountInWords: calcs.amountInWords
    }));
  };

  // Remove line item
  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    const calcs = recalculateTotals(newItems, formData.freightCharges, formData.packagingCharges, formData.state, formData.isInterstate);
    setFormData((prev) => ({
      ...prev,
      items: calcs.updatedItems,
      subtotal: calcs.subtotal,
      cgstAmount: calcs.cgstAmount,
      sgstAmount: calcs.sgstAmount,
      igstAmount: calcs.igstAmount,
      totalGst: calcs.totalGst,
      grandTotal: calcs.grandTotal,
      amountInWords: calcs.amountInWords
    }));
  };

  // Customer Select Handler
  const handleCustomerSelect = (customerId) => {
    if (!customerId) {
      setFormData((prev) => ({ ...prev, customer: '', customerType: 'Custom' }));
      return;
    }
    const selected = customers.find((c) => (c._id || c.id) === customerId);
    if (selected) {
      const stateName = selected.state || (typeof selected.billingAddress === 'object' ? selected.billingAddress?.state : '') || 'Gujarat';
      const isInter = stateName.trim().toLowerCase() !== 'gujarat';
      const calcs = recalculateTotals(formData.items, formData.freightCharges, formData.packagingCharges, stateName, isInter);

      const bAddress = typeof selected.billingAddress === 'string'
        ? selected.billingAddress
        : (selected.billingAddress?.street || selected.address || '');

      const sAddress = selected.shippingAddress || (selected.addresses && selected.addresses.find((a) => a.type === 'shipping' || a.type === 'both')?.address) || bAddress;

      const city = selected.city || (typeof selected.billingAddress === 'object' ? selected.billingAddress?.city : '') || 'Ahmedabad';
      const pincode = selected.pincode || (typeof selected.billingAddress === 'object' ? selected.billingAddress?.pincode : '') || '';

      setFormData((prev) => ({
        ...prev,
        customer: selected._id || selected.id,
        customerType: 'Customer',
        companyName: selected.companyName || selected.customerName || '',
        customerName: selected.name || selected.contactPerson || selected.companyName || '',
        phone: selected.phone || selected.mobile || '',
        email: selected.email || '',
        gstNumber: selected.gstin || selected.gstNumber || '',
        billingAddress: bAddress,
        shippingAddress: sAddress,
        city: city,
        state: stateName,
        pincode: pincode,
        placeOfSupply: `${stateName} (${isInter ? 'Inter-state' : '24'})`,
        isInterstate: isInter,
        paymentTerms: selected.paymentTerms || prev.paymentTerms,
        subtotal: calcs.subtotal,
        cgstAmount: calcs.cgstAmount,
        sgstAmount: calcs.sgstAmount,
        igstAmount: calcs.igstAmount,
        totalGst: calcs.totalGst,
        grandTotal: calcs.grandTotal,
        amountInWords: calcs.amountInWords
      }));
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.companyName && !formData.customerName) {
      setError('Please provide a Customer / Company Name.');
      return;
    }
    if (formData.items.length === 0 || !formData.items[0].name) {
      setError('Please add at least one line item with a valid description.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        totalAmount: formData.grandTotal,
        transport: {
          ...formData.transport,
          challanNo: formData.transport.challanNo || formData.transport.customerChallanNo || '',
          customerChallanNo: formData.transport.customerChallanNo || formData.transport.challanNo || '',
          customerPoNo: formData.transport.customerChallanNo || ''
        }
      };
      const res = await api.commercial.createInvoice(payload);
      if (res.success || res.invoice) {
        if (onInvoiceCreated) {
          onInvoiceCreated(res.invoice || res);
        }
        onClose();
      } else {
        setError(res.message || 'Failed to create invoice');
      }
    } catch (err) {
      setError(err.message || 'Error saving Tax Invoice');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 md:p-6 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                Generate Official Tax Invoice
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                GST Tax Invoicing with real-time tax splitting, HSN mapping, and A4 print compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Invoice Header & Customer Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/60 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                required
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold text-blue-900 dark:text-blue-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="e.g. MT-00001"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                required
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Due Date / Payment Terms
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Customer / Party Details */}
          <div className="bg-slate-50/70 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-orange-600" />
                  Customer &amp; Billing Details
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Select a registered customer to auto-fill billing, shipping, and tax parameters
                </p>
              </div>

              {/* Customer Selector Dropdown */}
              <div className="w-full md:w-80">
                <label className="block text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wide mb-1">
                  Customer Profile Dropdown
                </label>
                <select
                  value={formData.customer || ''}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border-2 border-orange-500/50 hover:border-orange-500 rounded-lg text-slate-900 dark:text-white font-semibold text-xs shadow-xs focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors"
                >
                  <option value="">-- Select Registered Customer (Auto-fill) --</option>
                  {customers.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.companyName || c.name || c.customerName} {c.gstin ? `[GST: ${c.gstin}]` : ''}
                    </option>
                  ))}
                  <option value="">-- Or Manual / Custom Customer --</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                  Company / Firm Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Atlas Automotives Ltd."
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                  GSTIN / Tax ID
                </label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  placeholder="24AAAAA0000A1Z5"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono uppercase text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                  Phone / Mobile
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="accounts@customer.com"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                  Place of Supply
                </label>
                <input
                  type="text"
                  value={formData.placeOfSupply}
                  onChange={(e) => setFormData({ ...formData, placeOfSupply: e.target.value })}
                  placeholder="Gujarat (24)"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                  Billing Address
                </label>
                <textarea
                  rows="2"
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  placeholder="Plot No., Industrial Area, City"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-400">
                    Shipping / Delivery Address
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, shippingAddress: prev.billingAddress }))}
                    className="text-[10px] text-orange-600 hover:text-orange-700 font-semibold underline cursor-pointer"
                  >
                    Same as Billing
                  </button>
                </div>
                <textarea
                  rows="2"
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  placeholder="Consignee delivery address if different from billing"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ahmedabad"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                  State (Determines IGST vs CGST/SGST)
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => {
                    const st = e.target.value;
                    const isInter = st.trim().toLowerCase() !== 'gujarat';
                    const calcs = recalculateTotals(formData.items, formData.freightCharges, formData.packagingCharges, st, isInter);
                    setFormData((prev) => ({
                      ...prev,
                      state: st,
                      isInterstate: isInter,
                      placeOfSupply: `${st} (${isInter ? 'Inter-state' : '24'})`,
                      subtotal: calcs.subtotal,
                      cgstAmount: calcs.cgstAmount,
                      sgstAmount: calcs.sgstAmount,
                      igstAmount: calcs.igstAmount,
                      totalGst: calcs.totalGst,
                      grandTotal: calcs.grandTotal,
                      amountInWords: calcs.amountInWords
                    }));
                  }}
                  placeholder="Gujarat"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                  Pincode
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="382445"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                  Tax Treatment
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-1 rounded-md text-[10.5px] font-mono font-bold w-full text-center ${
                    formData.isInterstate
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  }`}>
                    {formData.isInterstate ? 'INTER-STATE (IGST 18%)' : 'INTRA-STATE (CGST 9% + SGST 9%)'}
                  </span>
                </div>
              </div>
            </div>
          </div>


          {/* Section 4: Dynamic Line Items Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                Line Items &amp; Processing Charges
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Line Item
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 rounded-xl bg-transparent">
              <table className="w-full text-left text-xs border-collapse bg-transparent">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[9.5px] tracking-wider font-bold">
                    <th className="p-2 text-center w-8">#</th>
                    <th className="p-2 min-w-[200px]">Item Description &amp; Specifications</th>
                    <th className="p-2 text-center w-20">HSN</th>
                    <th className="p-2 text-right w-20">Qty</th>
                    <th className="p-2 text-center w-16">Unit</th>
                    <th className="p-2 text-right w-24">Rate (₹)</th>
                    <th className="p-2 text-right w-16">Disc %</th>
                    <th className="p-2 text-right w-24">Taxable (₹)</th>
                    <th className="p-2 text-center w-16">GST %</th>
                    <th className="p-2 text-right w-24">Total (₹)</th>
                    <th className="p-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-transparent text-[11px]">
                  {formData.items.map((item, idx) => (
                    <tr key={idx} className="bg-transparent hover:bg-slate-50/30 dark:hover:bg-slate-800/30">
                      <td className="p-2 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Heat Treatment Charges (H&T)"
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-semibold text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.hsnCode}
                          onChange={(e) => handleItemChange(idx, 'hsnCode', e.target.value)}
                          placeholder="9988"
                          className="w-full px-1.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-center font-mono font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-right font-mono font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full px-1 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-center font-medium"
                        >
                          <option value="Kg">Kg</option>
                          <option value="Pcs">Pcs</option>
                          <option value="Sets">Sets</option>
                          <option value="Nos">Nos</option>
                          <option value="MT">MT</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-right font-mono font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent}
                          onChange={(e) => handleItemChange(idx, 'discountPercent', e.target.value)}
                          className="w-full px-1.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-right font-mono"
                        />
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        ₹{item.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-center font-bold">
                        {item.gstRate}%
                      </td>
                      <td className="p-2 text-right font-mono font-black text-slate-900 dark:text-white">
                        ₹{item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          disabled={formData.items.length <= 1}
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-slate-400 p-1 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Financial Summary & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch pt-2">
            {/* Left: Freight, Packaging & Amount in Words */}
            <div className="bg-slate-50/60 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                    Freight / Transport (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.freightCharges}
                    onChange={(e) => {
                      const fr = e.target.value;
                      const calcs = recalculateTotals(formData.items, fr, formData.packagingCharges, formData.state, formData.isInterstate);
                      setFormData((prev) => ({
                        ...prev,
                        freightCharges: parseFloat(fr) || 0,
                        subtotal: calcs.subtotal,
                        cgstAmount: calcs.cgstAmount,
                        sgstAmount: calcs.sgstAmount,
                        igstAmount: calcs.igstAmount,
                        totalGst: calcs.totalGst,
                        grandTotal: calcs.grandTotal,
                        amountInWords: calcs.amountInWords
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                    Packaging &amp; Crating (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.packagingCharges}
                    onChange={(e) => {
                      const pk = e.target.value;
                      const calcs = recalculateTotals(formData.items, formData.freightCharges, pk, formData.state, formData.isInterstate);
                      setFormData((prev) => ({
                        ...prev,
                        packagingCharges: parseFloat(pk) || 0,
                        subtotal: calcs.subtotal,
                        cgstAmount: calcs.cgstAmount,
                        sgstAmount: calcs.sgstAmount,
                        igstAmount: calcs.igstAmount,
                        totalGst: calcs.totalGst,
                        grandTotal: calcs.grandTotal,
                        amountInWords: calcs.amountInWords
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              {/* Amount in words card */}
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 block mb-0.5">
                  Amount in Words:
                </span>
                <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 italic leading-snug">
                  {formData.amountInWords}
                </p>
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                  Terms &amp; Specific Conditions
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-[10.5px]"
                />
              </div>
            </div>

            {/* Right: Calculations Breakdown & Grand Total */}
            <div className="bg-slate-50/60 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Subtotal (Taxable Value):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ₹{formData.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {formData.freightCharges > 0 && (
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-600 dark:text-slate-400">Freight &amp; Transportation:</span>
                    <span className="font-mono font-medium">₹{formData.freightCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {formData.packagingCharges > 0 && (
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-600 dark:text-slate-400">Packaging &amp; Crating:</span>
                    <span className="font-mono font-medium">₹{formData.packagingCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {!formData.isInterstate ? (
                  <>
                    <div className="flex justify-between py-0.5 text-slate-700 dark:text-slate-300 font-medium">
                      <span>CGST (9%):</span>
                      <span className="font-mono font-bold">₹{formData.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-700 dark:text-slate-300 font-medium border-b border-slate-200 dark:border-slate-800 pb-1">
                      <span>SGST (9%):</span>
                      <span className="font-mono font-bold">₹{formData.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between py-0.5 text-slate-700 dark:text-slate-300 font-medium border-b border-slate-200 dark:border-slate-800 pb-1">
                    <span>IGST (18%):</span>
                    <span className="font-mono font-bold">₹{formData.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between py-0.5 text-slate-500 text-[10.5px]">
                  <span>Total Tax (GST):</span>
                  <span className="font-mono">₹{formData.totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Grand Total Banner */}
              <div className="mt-4 p-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl flex items-center justify-between shadow-md">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest block opacity-90">Invoice Total</span>
                  <span className="text-xs font-black">GRAND TOTAL (₹)</span>
                </div>
                <span className="text-xl font-mono font-black tracking-tight">
                  ₹{formData.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-black rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Creating Invoice...' : 'Generate & Save Tax Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaxInvoiceModal;

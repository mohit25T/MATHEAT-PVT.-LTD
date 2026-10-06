import React, { useState } from 'react';
import CreatableSelect from './CreatableSelect';
import { convertNumberToWords } from './PurchaseOrderModal';
import {
  ShoppingCart,
  Plus,
  Trash2,
  X,
  Building2,
  Calendar,
  CreditCard,
  Truck,
  FileText,
  MapPin,
  CheckCircle2,
  Loader2,
  Layers,
  Sparkles
} from 'lucide-react';

const COMMON_ITEMS = [
  { name: 'Fast Quench Oil 5000', category: 'QUENCH_OIL', hsn: '27101990', unit: 'LITRES', rate: 220 },
  { name: 'Accelerated Hot Quenching Oil (150°C)', category: 'QUENCH_OIL', hsn: '27101990', unit: 'LITRES', rate: 260 },
  { name: 'Anhydrous Ammonia (NH3) Cylinders', category: 'PROCESS_GAS', hsn: '28141000', unit: 'CYLINDERS', rate: 4500 },
  { name: 'High Purity Liquid Nitrogen (N2)', category: 'PROCESS_GAS', hsn: '28043000', unit: 'CYLINDERS', rate: 1800 },
  { name: 'Carburizing Liquid Salt Mixture', category: 'HEAT_TREAT_SALT', hsn: '28273990', unit: 'KG', rate: 140 },
  { name: 'Neutral Tempering Salt (50Kg Bag)', category: 'HEAT_TREAT_SALT', hsn: '28273990', unit: 'BAGS', rate: 4200 },
  { name: 'Type-K Inconel Thermocouple Probe (1000mm)', category: 'SPARE_PARTS', hsn: '85149000', unit: 'PCS', rate: 3200 },
  { name: 'Nichrome Heating Element Spiral Coil', category: 'SPARE_PARTS', hsn: '85149000', unit: 'SETS', rate: 18500 },
  { name: 'High Alumina Refractory Fire Bricks', category: 'REFRACTORY', hsn: '69022090', unit: 'PCS', rate: 120 },
  { name: 'Nital Etchant Reagent (1L)', category: 'LAB_CHEMICAL', hsn: '38220090', unit: 'LITRES', rate: 850 }
];

export const CreatePurchaseOrderModal = ({
  isOpen,
  onClose,
  onSubmit,
  suppliers = [],
  isLight = false,
  orders = []
}) => {
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    poNumber: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
    supplierName: '',
    supplierGstin: '',
    supplierPhone: '',
    supplierAddress: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    paymentTerms: '30 Days Net from GRN',
    deliveryLocation: 'Plot 42, GIDC Phase II, Vatva, Ahmedabad - Gate #1 Central Stores',
    dispatchMode: 'Road Transport / Door Delivery (Freight Included)',
    gstRate: 18,
    notes: 'Manufacturer Test Certificate (MTC/COA) and valid GST E-Way Bill must accompany the delivery.',
    items: [
      {
        itemName: '',
        category: 'QUENCH_OIL',
        hsnCode: '27101990',
        quantity: 100,
        unit: 'LITRES',
        unitPrice: 200,
        amount: 20000
      }
    ]
  });

  if (!isOpen) return null;

  // Handle supplier selection
  const handleSupplierSelect = (supplierName) => {
    const found = suppliers.find(
      (s) => s.name && s.name.trim().toLowerCase() === supplierName.trim().toLowerCase()
    );

    let addressStr = form.supplierAddress;
    if (found?.address) {
      addressStr = [
        found.address.street,
        found.address.city,
        found.address.state,
        found.address.pincode
      ]
        .filter(Boolean)
        .join(', ');
    }

    setForm((prev) => ({
      ...prev,
      supplierName,
      supplierPhone: found?.phone || prev.supplierPhone,
      supplierGstin: found?.gstin || prev.supplierGstin,
      supplierAddress: addressStr
    }));
  };

  // Handle item change
  const handleItemChange = (index, field, value) => {
    const updated = [...form.items];
    updated[index][field] = value;

    if (field === 'category') {
      const match = COMMON_ITEMS.find((c) => c.category === value);
      if (match) {
        if (!updated[index].hsnCode) updated[index].hsnCode = match.hsn;
        if (!updated[index].unit) updated[index].unit = match.unit;
      }
    }

    if (field === 'itemName') {
      const match = COMMON_ITEMS.find(
        (c) => c.name.toLowerCase() === (value || '').toLowerCase()
      );
      if (match) {
        updated[index].category = match.category;
        updated[index].hsnCode = match.hsn;
        updated[index].unit = match.unit;
        if (!updated[index].unitPrice || updated[index].unitPrice === 0) {
          updated[index].unitPrice = match.rate;
        }
      }
    }

    if (field === 'quantity' || field === 'unitPrice') {
      const qty = parseFloat(updated[index].quantity) || 0;
      const price = parseFloat(updated[index].unitPrice) || 0;
      updated[index].amount = Math.round(qty * price * 100) / 100;
    }

    setForm({ ...form, items: updated });
  };

  const addItemRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemName: '',
          category: 'GENERAL',
          hsnCode: '998821',
          quantity: 1,
          unit: 'KG',
          unitPrice: 0,
          amount: 0
        }
      ]
    }));
  };

  const removeItemRow = (index) => {
    if (form.items.length === 1) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index)
    }));
  };

  // Commercial calculations
  const subtotal = form.items.reduce(
    (acc, item) => acc + (parseFloat(item.amount) || 0),
    0
  );
  const gstRate = parseFloat(form.gstRate) || 18;
  const gstAmount = Math.round(subtotal * (gstRate / 100) * 100) / 100;
  const grandTotal = Math.round((subtotal + gstAmount) * 100) / 100;

  // State Code detection (Gujarat = 24)
  const supplierStateCode = (form.supplierGstin || '').slice(0, 2);
  const isIntraState = supplierStateCode === '24' || !supplierStateCode;
  const cgstAmount = isIntraState ? Math.round((gstAmount / 2) * 100) / 100 : 0;
  const sgstAmount = isIntraState ? Math.round((gstAmount / 2) * 100) / 100 : 0;
  const igstAmount = !isIntraState ? gstAmount : 0;

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplierName) {
      alert('Please select or specify a supplier.');
      return;
    }
    if (form.items.some((i) => !i.itemName.trim())) {
      alert('Please provide an item description for all rows.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        subtotal,
        gstRate,
        gstAmount,
        grandTotal
      });
      onClose();
    } catch (err) {
      alert(`Failed to save Purchase Order: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        className={`relative border rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col my-auto max-h-[94vh] overflow-y-auto font-sans transition-colors ${
          isLight
            ? 'bg-white border-slate-300 text-slate-900'
            : 'bg-slate-900 border-slate-700 text-white'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-orange-600 dark:text-orange-400">
                  Create Official Purchase Order
                </h2>
                <span className="text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-700 px-2 py-0.5 rounded">
                  {form.poNumber}
                </span>
              </div>
              <p className={`text-xs mt-0.5 font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Issue legal commercial procurement order for quenching oils, industrial gases &amp; factory consumables
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* SECTION 1: PO & SUPPLIER PARTICULARS */}
          <div
            className={`p-3.5 rounded-xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 border-b pb-1.5 border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> 1. Vendor &amp; Document Particulars
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-normal">
                MATHEAT Commercial Procurement
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  PO Number *
                </label>
                <input
                  type="text"
                  value={form.poNumber}
                  onChange={(e) => setForm({ ...form, poNumber: e.target.value.toUpperCase() })}
                  className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  PO Issue Date *
                </label>
                <input
                  type="date"
                  value={form.orderDate}
                  onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
                  className={`w-full px-3 py-2 text-xs font-bold rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                  required
                />
              </div>

              <div>
                <CreatableSelect
                  dropdownKey="supplier"
                  label="Select or Add Supplier *"
                  value={form.supplierName}
                  onChange={handleSupplierSelect}
                  options={suppliers.map((s) => ({
                    value: s.name,
                    label: `${s.name}${s.category ? ` (${s.category})` : ''}`
                  }))}
                  placeholder="-- Choose Registered Supplier --"
                  addPlaceholder="Type new supplier name to save in DB..."
                  isLight={isLight}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>Supplier GSTIN</span>
                  {form.supplierGstin && (
                    <span className="text-[9.5px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                      {isIntraState ? '● Gujarat (24)' : '● Inter-State'}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="e.g. 24AHMPT0206E1Z0"
                  value={form.supplierGstin}
                  onChange={(e) => setForm({ ...form, supplierGstin: e.target.value.toUpperCase() })}
                  className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border uppercase text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  Supplier Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={form.supplierPhone}
                  onChange={(e) => setForm({ ...form, supplierPhone: e.target.value })}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  Supplier Address / City
                </label>
                <input
                  type="text"
                  placeholder="Plot / Street, Industrial Estate, City..."
                  value={form.supplierAddress}
                  onChange={(e) => setForm({ ...form, supplierAddress: e.target.value })}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: COMMERCIAL & DELIVERY TERMS */}
          <div
            className={`p-3.5 rounded-xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 border-b pb-1.5 border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-orange-600" /> 2. Delivery &amp; Commercial Terms
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-normal">
                Strict Statutory Terms
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={form.expectedDeliveryDate}
                  onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })}
                  className={`w-full px-3 py-2 text-xs font-bold rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  Payment Terms
                </label>
                <select
                  value={form.paymentTerms}
                  onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  <option value="30 Days Net from GRN">30 Days Net from GRN</option>
                  <option value="15 Days Net from GRN">15 Days Net from GRN</option>
                  <option value="45 Days Credit">45 Days Credit</option>
                  <option value="Immediate / Against Delivery">Immediate / Against Delivery</option>
                  <option value="Advance 50%, Balance on GRN">Advance 50%, Balance on GRN</option>
                  <option value="100% Advance Payment">100% Advance Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  Dispatch &amp; Freight Mode
                </label>
                <input
                  type="text"
                  value={form.dispatchMode}
                  onChange={(e) => setForm({ ...form, dispatchMode: e.target.value })}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  Delivery Plant &amp; Gate Location
                </label>
                <input
                  type="text"
                  value={form.deliveryLocation}
                  onChange={(e) => setForm({ ...form, deliveryLocation: e.target.value })}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                  Special Instructions / Quality Remarks
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: MATERIAL LINE ITEMS TABLE */}
          <div
            className={`p-3.5 rounded-xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" /> 3. Itemized Material Procurement Table
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Specify heat treatment consumables, units, HSN codes, and agreed price rates
                </p>
              </div>

              <button
                type="button"
                onClick={addItemRow}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1 cursor-pointer transition-all"
              >
                <Plus className="h-3.5 w-3.5" /> Add Material Item
              </button>
            </div>

            {/* Datalist suggestions */}
            <datalist id="common-po-items-datalist">
              {COMMON_ITEMS.map((item, idx) => (
                <option key={idx} value={item.name}>
                  {item.category} &bull; {item.unit} &bull; ₹{item.rate}
                </option>
              ))}
              {orders.flatMap((o) => (o.items || []).map((i) => i.itemName)).filter(Boolean).map((n, i) => (
                <option key={`saved-${i}`} value={n} />
              ))}
            </datalist>

            {/* Responsive Table Container */}
            <div className="overflow-x-auto border rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-white text-[10px] uppercase font-bold tracking-wider">
                    <th className="p-2.5 text-center w-8">#</th>
                    <th className="p-2.5">Item Description &amp; Technical Spec *</th>
                    <th className="p-2.5 w-36">Category</th>
                    <th className="p-2.5 w-24">HSN Code</th>
                    <th className="p-2.5 w-28">Unit</th>
                    <th className="p-2.5 w-24 text-right">Qty *</th>
                    <th className="p-2.5 w-28 text-right">Rate (₹) *</th>
                    <th className="p-2.5 w-32 text-right">Amount (₹)</th>
                    <th className="p-2.5 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-[11px]">
                  {form.items.map((item, idx) => (
                    <tr
                      key={idx}
                      className={
                        idx % 2 === 0
                          ? isLight ? 'bg-white' : 'bg-slate-900'
                          : isLight ? 'bg-slate-50' : 'bg-slate-950/50'
                      }
                    >
                      <td className="p-2 text-center font-mono font-bold text-slate-500 dark:text-slate-400">
                        {idx + 1}
                      </td>

                      <td className="p-2">
                        <input
                          type="text"
                          list="common-po-items-datalist"
                          placeholder="Select or enter item name..."
                          value={item.itemName}
                          onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                            isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700'
                          }`}
                          required
                        />
                      </td>

                      <td className="p-2">
                        <select
                          value={item.category || 'GENERAL'}
                          onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                          className={`w-full px-2 py-1.5 rounded-lg border text-[11px] font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                            isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700'
                          }`}
                        >
                          <option value="QUENCH_OIL">Quench Oil</option>
                          <option value="PROCESS_GAS">Process Gas</option>
                          <option value="HEAT_TREAT_SALT">Heat Treat Salt</option>
                          <option value="SPARE_PARTS">Spare Parts</option>
                          <option value="REFRACTORY">Refractory</option>
                          <option value="LAB_CHEMICAL">Lab Chemical</option>
                          <option value="GENERAL">General</option>
                        </select>
                      </td>

                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="HSN"
                          value={item.hsnCode || ''}
                          onChange={(e) => handleItemChange(idx, 'hsnCode', e.target.value)}
                          className={`w-full px-2 py-1.5 rounded-lg border text-xs font-mono text-center font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                            isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700'
                          }`}
                        />
                      </td>

                      <td className="p-2">
                        <select
                          value={item.unit || 'LITRES'}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className={`w-full px-2 py-1.5 rounded-lg border text-[11px] font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                            isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700'
                          }`}
                        >
                          <option value="LITRES">Litres</option>
                          <option value="BARRELS">Barrels (210L)</option>
                          <option value="KG">Kilograms (Kg)</option>
                          <option value="CYLINDERS">Cylinders</option>
                          <option value="BAGS">Bags (50Kg)</option>
                          <option value="PCS">Pieces (Pcs)</option>
                          <option value="SETS">Sets</option>
                          <option value="METERS">Meters</option>
                        </select>
                      </td>

                      <td className="p-2 text-right">
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className={`w-full px-2 py-1.5 text-right rounded-lg border text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                            isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700'
                          }`}
                          required
                        />
                      </td>

                      <td className="p-2 text-right">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className={`w-full px-2 py-1.5 text-right rounded-lg border text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                            isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700'
                          }`}
                          required
                        />
                      </td>

                      <td className="p-2 text-right font-mono font-black text-slate-900 dark:text-white">
                        ₹{(parseFloat(item.amount) || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2
                        })}
                      </td>

                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          disabled={form.items.length === 1}
                          className="p-1 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Remove item row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4: FINANCIAL & TAX BREAKDOWN */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
            {/* Left: Live Amount in Words */}
            <div
              className={`sm:col-span-6 p-3 rounded-xl border flex flex-col justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Amount Chargeable in Words
                </span>
                <div className="text-xs font-black text-slate-900 dark:text-white mt-1.5 leading-snug">
                  {convertNumberToWords(grandTotal)}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span>Total Items: <strong className="text-slate-800 dark:text-slate-200">{form.items.length}</strong></span>
                <span>Destination: <strong className="text-slate-800 dark:text-slate-200">Ahmedabad (24)</strong></span>
              </div>
            </div>

            {/* Right: Tax Breakdown Box */}
            <div
              className={`sm:col-span-6 p-3 rounded-xl border space-y-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Taxable Subtotal:</span>
                <strong className="font-mono text-slate-900 dark:text-white">
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </strong>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">GST Rate:</span>
                <select
                  value={form.gstRate}
                  onChange={(e) => setForm({ ...form, gstRate: parseFloat(e.target.value) || 0 })}
                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold border text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  <option value={18}>18% (Standard GST)</option>
                  <option value={12}>12% (Concessional)</option>
                  <option value={5}>5% (Essential)</option>
                  <option value={0}>0% (Exempted)</option>
                </select>
              </div>

              {isIntraState ? (
                <>
                  <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                    <span>CGST @ {gstRate / 2}%:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      ₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                    <span>SGST @ {gstRate / 2}%:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      ₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span>IGST @ {gstRate}%:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ₹{igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="border-t pt-1.5 border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-black uppercase text-orange-600 dark:text-orange-400">
                  Grand Total (₹):
                </span>
                <span className="text-base font-mono font-black text-orange-600 dark:text-orange-400">
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Action Buttons Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isLight
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black tracking-wide shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving PO...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Save &amp; Generate Purchase Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreatePurchaseOrderModal;

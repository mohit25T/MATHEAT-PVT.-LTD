import React, { useState, useEffect } from 'react';
import {
  FileQuestion,
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Building2,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import api from '../api/client';
import CreatableSelect from '../components/CreatableSelect';

export const SalesPage = ({ onSelectTab }) => {
  const [activeTab, setActiveTab] = useState('enquiries'); // 'enquiries' or 'quotations'
  
  // Data states with 0ms instant cache hydration
  const [enquiries, setEnquiries] = useState(() => {
    const cached = api.cache.get('/sales/enquiries');
    return Array.isArray(cached) ? cached : (cached?.enquiries || cached?.data || []);
  });
  const [quotations, setQuotations] = useState(() => {
    const cached = api.cache.get('/sales/quotations');
    return Array.isArray(cached) ? cached : (cached?.quotations || cached?.data || []);
  });
  const [customers, setCustomers] = useState(() => {
    const cached = api.cache.get('/customers');
    return Array.isArray(cached) ? cached : (cached?.data || cached?.customers || []);
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Forms
  const [enquiryForm, setEnquiryForm] = useState({
    enquiryNumber: '',
    customer: '',
    customerName: '',
    partNumber: '',
    partName: '',
    quantity: '',
    estimatedWeightKg: '',
    materialGrade: '20MnCr5',
    requiredProcess: 'Case Carburizing & Hardening',
    requiredHardness: '58-62 HRC',
    requiredCaseDepth: '0.80 - 1.10 mm',
    deliveryRequirement: '',
    remarks: ''
  });

  const [quotationForm, setQuotationForm] = useState({
    quotationNumber: '',
    enquiry: '',
    customer: '',
    customerName: '',
    partNumber: '',
    partName: '',
    process: 'Case Carburizing & Quenching (SQF)',
    quantity: 100,
    estimatedWeightKg: 150,
    rateType: 'PER_KG',
    rate: 45,
    minimumJobCharge: 2500,
    setupCharge: 0,
    testingCharge: 500,
    packingCharge: 0,
    transportCharge: 0,
    gstRate: 18
  });

  const loadData = async () => {
    try {
      const [enqRes, qtRes, custRes] = await Promise.all([
        api.sales.getEnquiries().catch(() => []),
        api.sales.getQuotations().catch(() => []),
        api.customers.getAll().catch(() => [])
      ]);
      setEnquiries(Array.isArray(enqRes) ? enqRes : (enqRes?.enquiries || enqRes?.data || []));
      setQuotations(Array.isArray(qtRes) ? qtRes : (qtRes?.quotations || qtRes?.data || []));
      setCustomers(Array.isArray(custRes) ? custRes : (custRes?.data || custRes?.customers || []));
    } catch (err) {
      console.warn('Failed to load sales data:', err.message);
    }
  };

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const handleOpenEnquiryModal = async () => {
    let nextNum = 'ENQ-00001';
    try {
      const res = await api.sales.getNextEnquiryNumber();
      if (res?.enquiryNumber) nextNum = res.enquiryNumber;
    } catch (_) {}
    setEnquiryForm({
      enquiryNumber: nextNum,
      customer: '',
      customerName: '',
      partNumber: '',
      partName: '',
      quantity: '',
      estimatedWeightKg: '',
      materialGrade: '20MnCr5',
      requiredProcess: 'Case Carburizing & Hardening',
      requiredHardness: '58-62 HRC',
      requiredCaseDepth: '0.80 - 1.10 mm',
      deliveryRequirement: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      remarks: ''
    });
    setShowEnquiryModal(true);
  };

  const handleOpenQuotationModal = async (fromEnquiry = null) => {
    let nextNum = 'QT-00001';
    try {
      const res = await api.sales.getNextQuotationNumber();
      if (res?.quotationNumber) nextNum = res.quotationNumber;
    } catch (_) {}

    if (fromEnquiry) {
      setQuotationForm({
        quotationNumber: nextNum,
        enquiry: fromEnquiry._id,
        customer: fromEnquiry.customer?._id || fromEnquiry.customer,
        customerName: fromEnquiry.customerName || fromEnquiry.customer?.companyName || '',
        partNumber: fromEnquiry.partNumber,
        partName: fromEnquiry.partName,
        process: fromEnquiry.requiredProcess,
        quantity: fromEnquiry.quantity || 100,
        estimatedWeightKg: fromEnquiry.estimatedWeightKg || fromEnquiry.quantity * 1.5,
        rateType: 'PER_KG',
        rate: 45,
        minimumJobCharge: 2500,
        setupCharge: 0,
        testingCharge: 500,
        packingCharge: 0,
        transportCharge: 0,
        gstRate: 18
      });
    } else {
      setQuotationForm({
        quotationNumber: nextNum,
        enquiry: '',
        customer: '',
        customerName: '',
        partNumber: '',
        partName: '',
        process: 'Case Carburizing & Quenching (SQF)',
        quantity: 100,
        estimatedWeightKg: 150,
        rateType: 'PER_KG',
        rate: 45,
        minimumJobCharge: 2500,
        setupCharge: 0,
        testingCharge: 500,
        packingCharge: 0,
        transportCharge: 0,
        gstRate: 18
      });
    }
    setShowQuotationModal(true);
  };

  const handleSaveEnquiry = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.sales.createEnquiry({
        ...enquiryForm,
        quantity: Number(enquiryForm.quantity) || 1,
        estimatedWeightKg: Number(enquiryForm.estimatedWeightKg) || 0
      });
      setMessage('Customer enquiry successfully registered.');
      setShowEnquiryModal(false);
      await loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveQuotation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.sales.createQuotation({
        ...quotationForm,
        quantity: Number(quotationForm.quantity) || 1,
        estimatedWeightKg: Number(quotationForm.estimatedWeightKg) || 0,
        rate: Number(quotationForm.rate) || 0
      });
      setMessage('Official quotation successfully generated.');
      setShowQuotationModal(false);
      setActiveTab('quotations');
      await loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create quotation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvertToJobOrder = async (quoteId, quoteNum) => {
    if (!window.confirm(`Accept Quotation ${quoteNum} and generate Production Job Order?`)) return;
    try {
      const res = await api.sales.convertToJobOrder(quoteId);
      setMessage(res.message || 'Job Order created successfully.');
      await loadData();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to convert quotation to Job Order');
    }
  };

  const filteredEnquiries = enquiries.filter(e => {
    const q = searchQuery.toLowerCase();
    return (
      (e.enquiryNumber && e.enquiryNumber.toLowerCase().includes(q)) ||
      (e.customerName && e.customerName.toLowerCase().includes(q)) ||
      (e.partNumber && e.partNumber.toLowerCase().includes(q)) ||
      (e.requiredProcess && e.requiredProcess.toLowerCase().includes(q))
    );
  });

  const filteredQuotations = quotations.filter(qt => {
    const q = searchQuery.toLowerCase();
    return (
      (qt.quotationNumber && qt.quotationNumber.toLowerCase().includes(q)) ||
      (qt.customerName && qt.customerName.toLowerCase().includes(q)) ||
      (qt.partNumber && qt.partNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Sales Pipeline: Customer Enquiries &amp; Quotations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Customer RFQs, metallurgical rate cards, process cost estimation, and 1-click Job Order creation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('enquiries')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'enquiries' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <FileQuestion className="h-3.5 w-3.5" /> Enquiries ({enquiries.length})
            </button>
            <button
              onClick={() => setActiveTab('quotations')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'quotations' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Receipt className="h-3.5 w-3.5" /> Quotations ({quotations.length})
            </button>
          </div>

          {activeTab === 'enquiries' ? (
            <button
              onClick={handleOpenEnquiryModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" /> New Enquiry
            </button>
          ) : (
            <button
              onClick={() => handleOpenQuotationModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" /> New Quotation
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab === 'enquiries' ? 'enquiries by customer, part, process' : 'quotations by customer, quote no, part'}...`}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-orange-500"
        />
      </div>

      {/* 1. ENQUIRIES TABLE */}
      {activeTab === 'enquiries' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {filteredEnquiries.length === 0 ? (
            <div className="p-12 text-center">
              <FileQuestion className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Customer Enquiries Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Record incoming customer RFQs and generate quotations.</p>
              <button
                onClick={handleOpenEnquiryModal}
                className="mt-4 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-semibold"
              >
                + Register First Enquiry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Enquiry No</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Component / Part</th>
                    <th className="p-3">Quantity &amp; Weight</th>
                    <th className="p-3">Required Process &amp; Hardness</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredEnquiries.map((enq) => (
                    <tr key={enq._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-orange-600 dark:text-orange-400">
                        {enq.enquiryNumber}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{enq.customerName}</div>
                        <div className="text-[10px] text-slate-400">{new Date(enq.enquiryDate).toLocaleDateString('en-IN')}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{enq.partName}</div>
                        <div className="font-mono text-[10px] text-slate-500">{enq.partNumber} ({enq.materialGrade})</div>
                      </td>
                      <td className="p-3">
                        <div>{enq.quantity?.toLocaleString()} pcs</div>
                        <div className="text-[10px] text-slate-400">{enq.estimatedWeightKg || '-'} kg</div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-900 dark:text-white font-semibold">{enq.requiredProcess}</div>
                        <div className="text-[10px] text-orange-600 dark:text-orange-400 font-mono">{enq.requiredHardness} | {enq.requiredCaseDepth || 'Standard'}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          enq.status === 'WON' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          enq.status === 'QUOTED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {enq.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {enq.status !== 'WON' && enq.status !== 'QUOTED' ? (
                          <button
                            onClick={() => handleOpenQuotationModal(enq)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[11px] font-bold cursor-pointer"
                          >
                            Quote <ArrowRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Quoted</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. QUOTATIONS TABLE */}
      {activeTab === 'quotations' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {filteredQuotations.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Quotations Generated Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Generate official rate quotations for customers.</p>
              <button
                onClick={() => handleOpenQuotationModal()}
                className="mt-4 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
              >
                + Create Quotation
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Quotation No</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Part &amp; Process</th>
                    <th className="p-3">Rate</th>
                    <th className="p-3">Grand Total (incl GST)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Job Order Creation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredQuotations.map((qt) => (
                    <tr key={qt._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {qt.quotationNumber}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{qt.customerName}</div>
                        <div className="text-[10px] text-slate-400">{new Date(qt.createdAt).toLocaleDateString('en-IN')}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{qt.partName} ({qt.partNumber})</div>
                        <div className="text-[10px] text-slate-500">{qt.process} | {qt.quantity} pcs</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        ₹ {qt.rate} / {qt.rateType === 'PER_KG' ? 'kg' : 'pc'}
                      </td>
                      <td className="p-3 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹ {qt.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          qt.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {qt.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {qt.jobOrderCreated ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Job Order Active
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConvertToJobOrder(qt._id, qt.quotationNumber)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[11px] font-bold shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Accept &amp; Create JO
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: New Customer Enquiry */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-orange-600" />
              Register Customer Enquiry ({enquiryForm.enquiryNumber})
            </h2>

            <form onSubmit={handleSaveEnquiry} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Customer Name *</label>
                <CreatableSelect
                  options={customers.map(c => ({ value: c.companyName || c.name, label: c.companyName || c.name }))}
                  value={enquiryForm.customerName}
                  onChange={(val) => {
                    const match = customers.find(c => (c.companyName || c.name) === val);
                    setEnquiryForm(prev => ({
                      ...prev,
                      customerName: val,
                      customer: match?._id || ''
                    }));
                  }}
                  placeholder="Select or enter customer name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Part Number *</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.partNumber}
                    onChange={(e) => setEnquiryForm(prev => ({ ...prev, partNumber: e.target.value }))}
                    placeholder="e.g. PINION-6204"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Part Description *</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.partName}
                    onChange={(e) => setEnquiryForm(prev => ({ ...prev, partName: e.target.value }))}
                    placeholder="e.g. Drive Pinion Gear"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Quantity (pcs) *</label>
                  <input
                    type="number"
                    required
                    value={enquiryForm.quantity}
                    onChange={(e) => setEnquiryForm(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="1000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Est. Weight (kg)</label>
                  <input
                    type="number"
                    value={enquiryForm.estimatedWeightKg}
                    onChange={(e) => setEnquiryForm(prev => ({ ...prev, estimatedWeightKg: e.target.value }))}
                    placeholder="750"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Material Grade *</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.materialGrade}
                    onChange={(e) => setEnquiryForm(prev => ({ ...prev, materialGrade: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Required Process *</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.requiredProcess}
                    onChange={(e) => setEnquiryForm(prev => ({ ...prev, requiredProcess: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Required Hardness *</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.requiredHardness}
                    onChange={(e) => setEnquiryForm(prev => ({ ...prev, requiredHardness: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Special Instructions / Remarks</label>
                <textarea
                  rows="2"
                  value={enquiryForm.remarks}
                  onChange={(e) => setEnquiryForm(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="e.g. Critical gear flank finish, 100% surface hardness checking"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {errorMsg && <p className="text-red-600 font-semibold">{errorMsg}</p>}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEnquiryModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Register Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Quotation */}
      {showQuotationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              Generate Official Rate Quotation ({quotationForm.quotationNumber})
            </h2>

            <form onSubmit={handleSaveQuotation} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Customer Name *</label>
                <CreatableSelect
                  options={customers.map(c => ({ value: c.companyName || c.name, label: c.companyName || c.name }))}
                  value={quotationForm.customerName}
                  onChange={(val) => {
                    const match = customers.find(c => (c.companyName || c.name) === val);
                    setQuotationForm(prev => ({
                      ...prev,
                      customerName: val,
                      customer: match?._id || ''
                    }));
                  }}
                  placeholder="Select or enter customer"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Part Number *</label>
                  <input
                    type="text"
                    required
                    value={quotationForm.partNumber}
                    onChange={(e) => setQuotationForm(prev => ({ ...prev, partNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Part Name *</label>
                  <input
                    type="text"
                    required
                    value={quotationForm.partName}
                    onChange={(e) => setQuotationForm(prev => ({ ...prev, partName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Quantity (pcs)</label>
                  <input
                    type="number"
                    value={quotationForm.quantity}
                    onChange={(e) => setQuotationForm(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Rate (₹)</label>
                  <input
                    type="number"
                    value={quotationForm.rate}
                    onChange={(e) => setQuotationForm(prev => ({ ...prev, rate: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Billing Rate Basis</label>
                  <select
                    value={quotationForm.rateType}
                    onChange={(e) => setQuotationForm(prev => ({ ...prev, rateType: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="PER_KG">₹ / kg</option>
                    <option value="PER_PIECE">₹ / piece</option>
                    <option value="FIXED_LOT">Fixed Lot Charge</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Min Job Charge (₹)</label>
                  <input
                    type="number"
                    value={quotationForm.minimumJobCharge}
                    onChange={(e) => setQuotationForm(prev => ({ ...prev, minimumJobCharge: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Testing / Lab Charge (₹)</label>
                  <input
                    type="number"
                    value={quotationForm.testingCharge}
                    onChange={(e) => setQuotationForm(prev => ({ ...prev, testingCharge: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {errorMsg && <p className="text-red-600 font-semibold">{errorMsg}</p>}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowQuotationModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  {submitting ? 'Generating...' : 'Save Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;

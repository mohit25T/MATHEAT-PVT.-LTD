import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trash2,
  X,
  Building2,
  Hash,
  Scale,
  Flame,
  FileText,
  AlertCircle,
  QrCode,
  Printer,
  ExternalLink,
  Search,
  Check,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import QRCode from 'qrcode';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';
import CreatableSelect from '../components/CreatableSelect';

export const JobOrdersPage = ({ onSelectTab }) => {
  const { isLight } = useTheme();

  // Active tab: 'orders' or 'jobcards'
  const [activeTab, setActiveTab] = useState('orders');

  const [jobOrders, setJobOrders] = useState(() => {
    const cached = api.cache.get('/job-orders');
    return Array.isArray(cached) ? cached : (cached?.jobOrders || cached?.data || []);
  });
  const [jobCards, setJobCards] = useState(() => {
    const cached = api.cache.get('/job-cards');
    return Array.isArray(cached) ? cached : (cached?.jobCards || cached?.data || []);
  });
  const [customers, setCustomers] = useState(() => {
    const cached = api.cache.get('/customers');
    return Array.isArray(cached) ? cached : (cached?.data || cached?.customers || []);
  });
  const [loading, setLoading] = useState(() => {
    const cached = api.cache.get('/job-orders');
    const list = Array.isArray(cached) ? cached : (cached?.jobOrders || cached?.data || []);
    return list.length === 0;
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Selected Job Card for Traveler Inspection Modal
  const [selectedJobCard, setSelectedJobCard] = useState(null);
  const [cardQrDataUrl, setCardQrDataUrl] = useState('');
  const [generatingCardForJo, setGeneratingCardForJo] = useState(null);
  const [jobCardSearch, setJobCardSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    jobOrderNumber: '',
    customer: '',
    customerPoNumber: '',
    poDate: new Date().toISOString().split('T')[0],
    partNumber: '',
    partName: '',
    heatNumber: '',
    targetQuantity: '',
    targetWeight: '',
    requiredProcess: '',
    requiredHardness: '',
    requiredCaseDepth: '',
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: '',
    specialInstructions: ''
  });

  const loadJobOrders = async () => {
    try {
      const res = await api.jobOrders.getAll().catch(() => []);
      const list = Array.isArray(res) ? res : (res?.jobOrders || []);
      setJobOrders(list);
    } catch (err) {
      console.warn('[JOB ORDERS] Load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadJobCards = async () => {
    try {
      const res = await api.jobCards.getAll().catch(() => []);
      const list = Array.isArray(res) ? res : (res?.jobCards || res?.data || []);
      setJobCards(list);
    } catch (err) {
      console.warn('[JOB CARDS] Load error:', err.message);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await api.customers.getAll().catch(() => []);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setCustomers(list);
    } catch (err) {
      console.warn('[CUSTOMERS] Load error:', err.message);
    }
  };

  useEffect(() => {
    loadJobOrders();
    loadJobCards();
    loadCustomers();

    const handleSync = () => {
      loadJobOrders();
      loadJobCards();
      loadCustomers();
    };

    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const knownParts = Array.from(
    new Set([
      ...jobOrders.map((j) => j.partNumber).filter(Boolean),
      ...customers.flatMap((c) => (c.parts || []).map((p) => p.partNumber || p.name)).filter(Boolean)
    ])
  );

  const handleOpenModal = async () => {
    setErrorMsg('');
    setShowCreateModal(true);
    let nextJo = 'JO-00001';
    try {
      const res = await api.jobOrders.getNextJobOrderNumber();
      if (res?.jobOrderNumber) nextJo = res.jobOrderNumber;
    } catch (e) {
      console.warn('Could not fetch next JO number:', e.message);
    }
    setFormData({
      jobOrderNumber: nextJo,
      customer: '',
      customerPoNumber: `PO-${nextJo.replace(/^JO-/i, '')}`,
      poDate: new Date().toISOString().split('T')[0],
      partNumber: '',
      partName: '',
      heatNumber: `HEAT-${Math.floor(10000 + Math.random() * 90000)}`,
      targetQuantity: '',
      targetWeight: '',
      requiredProcess: '',
      requiredHardness: '',
      requiredCaseDepth: '',
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'STANDARD',
      specialInstructions: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.customerPoNumber || !formData.heatNumber || !formData.targetQuantity || !formData.targetWeight) {
      setErrorMsg('Please provide Customer PO, Heat Number, Target Quantity, and Target Weight.');
      return;
    }

    try {
      setSubmitting(true);
      await api.jobOrders.create(formData);
      setShowCreateModal(false);
      await loadJobOrders();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register job order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, joNumber) => {
    if (window.confirm(`Are you sure you want to delete Job Order #${joNumber}?`)) {
      try {
        await api.jobOrders.delete(id);
        await loadJobOrders();
      } catch (err) {
        alert(`Failed to delete job order: ${err.message}`);
      }
    }
  };

  // Instant Job Card generator from Job Order
  const handleGenerateJobCard = async (jo) => {
    try {
      setGeneratingCardForJo(jo._id);
      const res = await api.jobCards.create({
        jobOrderId: jo._id,
        customerName: jo.customer?.companyName || jo.customer || 'Customer',
        partNumber: jo.partNumber,
        partName: jo.partName || jo.partNumber,
        materialGrade: jo.materialGrade || 'EN31 / 20MnCr5',
        drawingNumber: jo.drawingNumber || `DWG-${jo.partNumber}`,
        processRevision: 'V1'
      });

      if (res?.jobCard) {
        await loadJobCards();
        await loadJobOrders();
        // Open the generated Job Card directly
        openJobCardTraveler(res.jobCard);
      }
    } catch (err) {
      alert(`Could not generate Job Card: ${err.message}`);
    } finally {
      setGeneratingCardForJo(null);
    }
  };

  // Open Job Card Traveler modal with live QR
  const openJobCardTraveler = async (jc) => {
    setSelectedJobCard(jc);
    if (jc.qrCodeUrl) {
      setCardQrDataUrl(jc.qrCodeUrl);
    } else {
      try {
        const payload = `MATHEAT-JC|CARD:${jc.jobCardNumber}|JO:${jc.jobOrderNumber}|PART:${jc.partNumber}|HEAT:${jc.heatNumber}|QTY:${jc.quantityPcs}|PROCESS:${jc.requiredProcess}`;
        const url = await QRCode.toDataURL(payload, { width: 180, margin: 1 });
        setCardQrDataUrl(url);
      } catch (e) {
        console.warn('QR code gen error:', e);
      }
    }
  };

  const filteredJobCards = jobCards.filter((jc) => {
    if (!jobCardSearch) return true;
    const q = jobCardSearch.toLowerCase();
    return (
      (jc.jobCardNumber && jc.jobCardNumber.toLowerCase().includes(q)) ||
      (jc.jobOrderNumber && jc.jobOrderNumber.toLowerCase().includes(q)) ||
      (jc.customerName && jc.customerName.toLowerCase().includes(q)) ||
      (jc.partNumber && jc.partNumber.toLowerCase().includes(q)) ||
      (jc.heatNumber && jc.heatNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className={`space-y-6 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border shadow-sm ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-orange-600" />
            <h1 className="text-base font-extrabold">
              Job Work Orders &amp; Production Route Cards
            </h1>
            <span className="text-[11px] font-mono font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded border border-orange-300 dark:border-orange-800">
              MES WORKFLOW
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Traceability Link: Customer PO &rarr; Job Order (JO) &rarr; Material Receipt (GRN) &rarr; Production Job Card (JC) with QR Code Traveler
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'orders' ? (
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Create Job Order
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('orders')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <ClipboardList className="h-4 w-4" /> View Job Orders
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Job Work Orders ({jobOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('jobcards')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'jobcards'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <QrCode className="h-4 w-4" />
          Production Job Cards / Travelers ({jobCards.length})
          <span className="text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono px-1.5 py-0.5 rounded">
            QR CODE
          </span>
        </button>
      </div>

      {/* TAB 1: JOB WORK ORDERS */}
      {activeTab === 'orders' && (
        <>
          {loading ? (
            <div className={`p-12 text-center rounded-xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="text-xs font-mono text-slate-500">Loading Job Work Orders...</div>
            </div>
          ) : jobOrders.length === 0 ? (
            <div className={`p-12 text-center rounded-xl border shadow-sm ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}>
              <div className="h-14 w-14 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ClipboardList className="h-7 w-7 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-base font-black">
                No Job Work Orders Registered
              </h3>
              <p className={`text-xs max-w-md mx-auto mt-1 leading-relaxed ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Register incoming customer purchase orders to track drawing tolerances, required hardness, case depths, and delivery schedules.
              </p>
              <button
                onClick={handleOpenModal}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" /> + Register New Job Order
              </button>
            </div>
          ) : (
            <div className={`border rounded-xl overflow-hidden shadow-sm ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className={`p-4 border-b flex items-center justify-between ${
                isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'
              }`}>
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  Active Job Work Orders ({jobOrders.length})
                </h2>
                <button
                  onClick={handleOpenModal}
                  className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Order
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`text-[10px] uppercase font-bold tracking-wider border-b ${
                      isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}>
                      <th className="p-3">Job Order &amp; PO</th>
                      <th className="p-3">Customer &amp; Component</th>
                      <th className="p-3">Heat Number</th>
                      <th className="p-3">Weight &amp; Qty</th>
                      <th className="p-3">Required Process &amp; Spec</th>
                      <th className="p-3">Delivery &amp; Priority</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">MES Route Card</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800 text-slate-200'
                  }`}>
                    {jobOrders.map((jo) => {
                      const custName = jo.customer?.companyName || jo.customer || 'Customer';
                      const pNum = jo.part?.partNumber || jo.partNumber || 'COMPONENT';
                      const existingCard = jobCards.find(
                        (jc) => jc.jobOrder === jo._id || jc.jobOrderNumber === jo.jobOrderNumber
                      );

                      return (
                        <tr key={jo._id || jo.jobOrderNumber} className={`transition-colors ${
                          isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                        }`}>
                          <td className="p-3 font-mono">
                            <span className="font-bold text-orange-600 block">{jo.jobOrderNumber}</span>
                            <span className="text-[10px] text-slate-500">PO: {jo.customerPoNumber}</span>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900 dark:text-white">{pNum}</div>
                            <span className="text-[11px] text-slate-500 font-semibold">{custName}</span>
                          </td>
                          <td className="p-3 font-mono">
                            <span className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-500/30 inline-block text-[11px]">
                              {jo.heatNumber}
                            </span>
                          </td>
                          <td className="p-3 font-mono">
                            <span className="font-bold text-slate-900 dark:text-white block">{jo.targetWeight} kg</span>
                            <span className="text-[10px] text-slate-500">{jo.targetQuantity} pcs</span>
                          </td>
                          <td className="p-3 text-[11px]">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{jo.requiredProcess}</div>
                            <div className="text-slate-500 font-mono text-[10px] mt-0.5">
                              {jo.requiredHardness} &bull; {jo.requiredCaseDepth}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-[11px]">{new Date(jo.deliveryDate).toLocaleDateString('en-IN')}</div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 inline-block ${
                              jo.priority === 'URGENT'
                                ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                            }`}>
                              {jo.priority || 'STANDARD'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                              jo.status === 'READY_FOR_PRODUCTION'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : jo.status === 'IN_PRODUCTION'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                            }`}>
                              {jo.status || 'CONFIRMED'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {existingCard ? (
                              <button
                                onClick={() => openJobCardTraveler(existingCard)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded font-mono text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                <QrCode className="h-3 w-3" />
                                {existingCard.jobCardNumber}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleGenerateJobCard(jo)}
                                disabled={generatingCardForJo === jo._id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded text-[11px] font-bold cursor-pointer shadow-sm transition-all disabled:opacity-50"
                              >
                                <QrCode className="h-3 w-3" />
                                {generatingCardForJo === jo._id ? 'Generating...' : 'Issue Job Card'}
                              </button>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDelete(jo._id, jo.jobOrderNumber)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isLight
                                  ? 'bg-slate-100 hover:bg-rose-100 text-rose-700 border-slate-300'
                                  : 'bg-slate-800 hover:bg-rose-950 text-rose-400 border-slate-700'
                              }`}
                              title="Delete Job Order"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: PRODUCTION JOB CARDS / TRAVELERS */}
      {activeTab === 'jobcards' && (
        <div className="space-y-4">
          {/* Summary Row & Search */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Route Cards</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{jobCards.length}</div>
            </div>
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Ready for Batching</div>
              <div className="text-xl font-black text-emerald-600 mt-1">
                {jobCards.filter(c => c.status === 'CREATED' || c.status === 'PLANNED').length}
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">In Production</div>
              <div className="text-xl font-black text-indigo-600 mt-1">
                {jobCards.filter(c => c.status === 'IN_PRODUCTION').length}
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Total Process Weight</div>
              <div className="text-xl font-black text-orange-600 mt-1">
                {jobCards.reduce((acc, c) => acc + (Number(c.weightKg) || 0), 0).toFixed(1)} kg
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={jobCardSearch}
                onChange={(e) => setJobCardSearch(e.target.value)}
                placeholder="Search Job Card, JO, Heat No, Part..."
                className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab && onSelectTab('batches')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                <Flame className="h-3.5 w-3.5" />
                Go to Furnace Batch Planning &rarr;
              </button>
            </div>
          </div>

          {/* Job Cards Table */}
          {filteredJobCards.length === 0 ? (
            <div className={`p-10 text-center rounded-xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <QrCode className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No Job Cards found matching criteria.</p>
              <button
                onClick={() => setActiveTab('orders')}
                className="mt-3 text-xs text-orange-600 font-bold hover:underline cursor-pointer"
              >
                &larr; Switch to Job Orders to issue route cards
              </button>
            </div>
          ) : (
            <div className={`border rounded-xl overflow-hidden shadow-sm ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`text-[10px] uppercase font-bold tracking-wider border-b ${
                      isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}>
                      <th className="p-3">Job Card #</th>
                      <th className="p-3">Linked Job Order</th>
                      <th className="p-3">Customer &amp; Part</th>
                      <th className="p-3">Heat Number</th>
                      <th className="p-3">Batch Qty / Net Wt</th>
                      <th className="p-3">HT Specification</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800 text-slate-200'
                  }`}>
                    {filteredJobCards.map((jc) => (
                      <tr key={jc._id || jc.jobCardNumber} className={`transition-colors ${
                        isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                      }`}>
                        <td className="p-3 font-mono">
                          <button
                            onClick={() => openJobCardTraveler(jc)}
                            className="font-bold text-orange-600 hover:text-orange-500 flex items-center gap-1 cursor-pointer"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                            {jc.jobCardNumber}
                          </button>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Rev: {jc.processRevision || 'V1'}
                          </span>
                        </td>
                        <td className="p-3 font-mono">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {jc.jobOrderNumber}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white">{jc.partNumber}</div>
                          <span className="text-[11px] text-slate-500">{jc.customerName}</span>
                        </td>
                        <td className="p-3 font-mono">
                          <span className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-500/30 inline-block text-[11px]">
                            {jc.heatNumber}
                          </span>
                        </td>
                        <td className="p-3 font-mono">
                          <span className="font-bold text-slate-900 dark:text-white block">{jc.weightKg} kg</span>
                          <span className="text-[10px] text-slate-500">{jc.quantityPcs} pcs</span>
                        </td>
                        <td className="p-3 text-[11px]">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{jc.requiredProcess}</div>
                          <div className="text-slate-500 font-mono text-[10px]">
                            {jc.requiredHardness} &bull; {jc.requiredCaseDepth}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                            jc.status === 'IN_PRODUCTION'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300'
                              : jc.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                          }`}>
                            {jc.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openJobCardTraveler(jc)}
                              className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 shadow-sm"
                              title="Print Traveler Sheet with QR"
                            >
                              <Printer className="h-3 w-3" />
                              Traveler
                            </button>
                            <button
                              onClick={() => onSelectTab && onSelectTab('traceability')}
                              className={`p-1.5 rounded border transition-colors cursor-pointer ${
                                isLight
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                              }`}
                              title="View Traceability Chain"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* JOB CARD TRAVELER & QR CODE MODAL (PRINT READY) */}
      {selectedJobCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className={`relative w-full max-w-3xl rounded-2xl shadow-2xl border overflow-hidden my-auto max-h-[95vh] flex flex-col ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            {/* Modal Action Header */}
            <div className={`px-6 py-3 border-b flex items-center justify-between shrink-0 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-orange-600" />
                <span className="font-extrabold text-sm uppercase tracking-wider">
                  Production Route Card &amp; Traveler: {selectedJobCard.jobCardNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Traveler Card
                </button>
                <button
                  onClick={() => setSelectedJobCard(null)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Content Body */}
            <div className="p-6 space-y-6 overflow-y-auto font-sans print:p-0 print:m-0">
              {/* Factory Header */}
              <div className="flex items-start justify-between border-b pb-4 border-slate-300 dark:border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight text-orange-600">MATHEAT PVT. LTD.</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border">
                      ISO 9001:2015 &amp; CQI-9 CERTIFIED
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Industrial Heat Treatment Operations &bull; Metallurgical Plant #1
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mt-1">
                    DOCUMENT: SHOP-FLOOR ROUTE TRAVELER
                  </div>
                </div>

                <div className="text-right">
                  {cardQrDataUrl && (
                    <img
                      src={cardQrDataUrl}
                      alt="Job Card QR Code"
                      className="h-24 w-24 p-1 bg-white border border-slate-300 rounded shadow-sm inline-block"
                    />
                  )}
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Scan for Live Traceability</div>
                </div>
              </div>

              {/* Master Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Job Card Number</div>
                  <div className="font-mono font-black text-orange-600 text-sm">{selectedJobCard.jobCardNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Linked Job Order</div>
                  <div className="font-mono font-bold">{selectedJobCard.jobOrderNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Heat Trace Number</div>
                  <div className="font-mono font-bold text-red-600 dark:text-red-400">{selectedJobCard.heatNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Production Priority</div>
                  <div className="font-bold">{selectedJobCard.priority || 'STANDARD'}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Customer</div>
                  <div className="font-bold">{selectedJobCard.customerName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Component / Part #</div>
                  <div className="font-bold">{selectedJobCard.partNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Batch Quantity</div>
                  <div className="font-mono font-bold">{selectedJobCard.quantityPcs} Pieces</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Total Batch Weight</div>
                  <div className="font-mono font-bold">{selectedJobCard.weightKg} kg</div>
                </div>
              </div>

              {/* Heat Treatment Process Parameters */}
              <div className="p-3.5 rounded-lg border border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/20 text-xs">
                <div className="font-bold text-orange-800 dark:text-orange-300 uppercase text-[11px] mb-2 flex items-center gap-1.5">
                  <Flame className="h-4 w-4" />
                  Mandatory Process Recipe &amp; Specification (Non-Modifiable)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Process Recipe:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedJobCard.requiredProcess} {selectedJobCard.recipeCode ? `(${selectedJobCard.recipeCode})` : ''}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Required Hardness:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedJobCard.requiredHardness}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Required Case Depth:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedJobCard.requiredCaseDepth || 'Core Hardened'}</span>
                  </div>
                </div>

                {selectedJobCard.targetTemperature && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 mt-2 border-t border-orange-200 dark:border-orange-800/50">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Austenitizing Temp:</span>
                      <span className="font-mono font-bold text-orange-700 dark:text-orange-400">{selectedJobCard.targetTemperature}°C</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Soaking Time:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedJobCard.soakingTimeMinutes} min</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Quench Medium:</span>
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{selectedJobCard.quenchMedium || 'OIL'} (≤{selectedJobCard.transferTimeSeconds || 15}s)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Tempering Cycle:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{selectedJobCard.temperingTemperature}°C &bull; {selectedJobCard.temperingTimeMinutes} min</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Shop Floor Traveler Checklist Operations */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-blue-600" />
                  Shop-Floor Traveler Routing Operations
                </h4>
                <table className="w-full text-left text-xs border border-collapse border-slate-300 dark:border-slate-700">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold">
                      <th className="p-2 border border-slate-300 dark:border-slate-700 w-10 text-center">#</th>
                      <th className="p-2 border border-slate-300 dark:border-slate-700">Operation Stage</th>
                      <th className="p-2 border border-slate-300 dark:border-slate-700">Machine / Tank</th>
                      <th className="p-2 border border-slate-300 dark:border-slate-700">Observed Reading</th>
                      <th className="p-2 border border-slate-300 dark:border-slate-700 w-28">Operator Sign</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-[11px]">
                    <tr>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">01</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 font-semibold">Incoming Visual &amp; Count Check</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700">Weighbridge / Gate</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 text-slate-500">Gross Wt verified</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700"></td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">02</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 font-semibold">Jigging / Basket Fixturing</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700">Fixturing Station</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 text-slate-500">Uniform spacing</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700"></td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">03</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 font-semibold">Austenitizing / Hardening Heat</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700">Furnace F-01 / F-02</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 text-slate-500">Temp: ____°C &bull; Soak: ___ min</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700"></td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">04</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 font-semibold">Oil / Polymer Quenching</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700">Quench Tank #1</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 text-slate-500">Transfer Time: ___ sec</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700"></td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">05</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 font-semibold">Tempering Furnace Cycle</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700">Tempering Pit T-01</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 text-slate-500">Temp: ____°C &bull; Time: ___ min</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700"></td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">06</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 font-semibold">QC Hardness &amp; Depth Testing</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700">QC Metallurgy Lab</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 text-slate-500">Observed: _____ HRC</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700"></td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">07</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 font-semibold">Rust Preventive Oil &amp; Dispatch</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700">Dispatch Yard</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 text-slate-500">HTC Certificate Issued</td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-300 dark:border-slate-700 text-xs">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Shop Floor In-Charge</div>
                  <div className="h-10 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Metallurgist / QC Officer</div>
                  <div className="h-10 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Authorized Signatory</div>
                  <div className="h-10 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE JOB ORDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden my-auto max-h-[92vh] flex flex-col transition-all ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            {/* Modal Header */}
            <div className={`px-4 sm:px-6 py-4 border-b flex items-center justify-between shrink-0 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-orange-600" />
                <h2 className="font-extrabold text-sm uppercase tracking-wider">
                  Register New Customer Job Work Order
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Job Order Number */}
                <div>
                  <label className="block text-xs font-bold mb-1">Job Order Number (Auto)</label>
                  <input
                    type="text"
                    value={formData.jobOrderNumber}
                    onChange={(e) => setFormData({ ...formData, jobOrderNumber: e.target.value })}
                    placeholder="JO-00001"
                    className={`w-full p-2.5 rounded-lg border text-xs font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-blue-900' : 'bg-slate-950 border-slate-700 text-blue-400'
                    }`}
                  />
                </div>

                {/* Customer */}
                <CreatableSelect
                  dropdownKey="customer"
                  label="Customer / Client Entity"
                  value={formData.customer}
                  onChange={(val) => setFormData({ ...formData, customer: val })}
                  options={customers.map((c) => {
                    const name = c.companyName || c.name;
                    return {
                      value: name,
                      label: `${name}${c.customerCode ? ` (${c.customerCode})` : ''}`
                    };
                  })}
                  placeholder="-- Select Customer from Dropdown --"
                  addPlaceholder="Type new customer name to save in DB..."
                  isLight={isLight}
                  required
                />

                {/* Customer PO */}
                <div>
                  <label className="block text-xs font-bold mb-1">Customer PO Number *</label>
                  <input
                    type="text"
                    value={formData.customerPoNumber}
                    onChange={(e) => setFormData({ ...formData, customerPoNumber: e.target.value })}
                    placeholder="e.g. PO-2026-9001"
                    className={`w-full p-2.5 rounded-lg border text-xs font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                    required
                  />
                </div>

                {/* Part / Component Number */}
                <CreatableSelect
                  dropdownKey="partNumber"
                  label="Part / Drawing Number"
                  value={formData.partNumber}
                  onChange={(val) => setFormData({ ...formData, partNumber: val })}
                  options={knownParts}
                  placeholder="-- Select or Add Part Number --"
                  addPlaceholder="Type new part / drawing number..."
                  isLight={isLight}
                  required
                />

                {/* Raw Material Heat Number */}
                <div>
                  <label className="block text-xs font-bold text-red-600 dark:text-red-400 mb-1">
                    Raw Material Heat Number *
                  </label>
                  <input
                    type="text"
                    value={formData.heatNumber}
                    onChange={(e) => setFormData({ ...formData, heatNumber: e.target.value })}
                    placeholder="e.g. HEAT-45892"
                    className={`w-full p-2.5 rounded-lg border text-xs font-mono font-black ${
                      isLight ? 'bg-slate-50 border-red-300 text-slate-900' : 'bg-slate-950 border-red-500/50 text-white'
                    }`}
                    required
                  />
                </div>

                {/* Target Quantity */}
                <div>
                  <label className="block text-xs font-bold mb-1">Target Quantity (Pieces) *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.targetQuantity}
                    onChange={(e) => setFormData({ ...formData, targetQuantity: e.target.value })}
                    placeholder="e.g. 1500"
                    className={`w-full p-2.5 rounded-lg border text-xs font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                    required
                  />
                </div>

                {/* Target Weight */}
                <div>
                  <label className="block text-xs font-bold mb-1">Total Net Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                    placeholder="e.g. 420.5"
                    className={`w-full p-2.5 rounded-lg border text-xs font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                    required
                  />
                </div>

                {/* Required Process */}
                <CreatableSelect
                  dropdownKey="requiredProcess"
                  label="Required Heat Treatment Process"
                  value={formData.requiredProcess}
                  onChange={(val) => setFormData({ ...formData, requiredProcess: val })}
                  placeholder="-- Select Process --"
                  addPlaceholder="Type custom heat treat process..."
                  isLight={isLight}
                />

                {/* Hardness & Case Depth */}
                <div>
                  <label className="block text-xs font-bold mb-1">Hardness &amp; Case Depth Specs</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        list="jo-hardness-presets"
                        value={formData.requiredHardness}
                        onChange={(e) => setFormData({ ...formData, requiredHardness: e.target.value })}
                        placeholder="Hardness (e.g. 58-62 HRC)"
                        className={`w-full p-2.5 rounded-lg border text-xs font-mono font-bold ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                        }`}
                      />
                      <datalist id="jo-hardness-presets">
                        <option value="58-62 HRC" />
                        <option value="55-60 HRC" />
                        <option value="60-64 HRC" />
                        <option value="50-55 HRC" />
                        <option value="40-45 HRC" />
                        <option value="28-32 HRC" />
                        <option value="200-240 HBW" />
                        <option value="240-280 HBW" />
                      </datalist>
                    </div>
                    <div>
                      <input
                        type="text"
                        list="jo-casedepth-presets"
                        value={formData.requiredCaseDepth}
                        onChange={(e) => setFormData({ ...formData, requiredCaseDepth: e.target.value })}
                        placeholder="Case Depth (e.g. 0.8-1.1 mm)"
                        className={`w-full p-2.5 rounded-lg border text-xs font-mono font-bold ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                        }`}
                      />
                      <datalist id="jo-casedepth-presets">
                        <option value="0.80 - 1.10 mm" />
                        <option value="0.50 - 0.80 mm" />
                        <option value="1.00 - 1.30 mm" />
                        <option value="1.20 - 1.50 mm" />
                        <option value="0.30 - 0.50 mm" />
                        <option value="Through Hardened (Core Spec)" />
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="block text-xs font-bold mb-1">Target Delivery Schedule</label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border text-xs font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>

                {/* Priority */}
                <CreatableSelect
                  dropdownKey="productionPriority"
                  label="Production Priority"
                  value={formData.priority}
                  onChange={(val) => setFormData({ ...formData, priority: val })}
                  placeholder="-- Select Priority --"
                  addPlaceholder="Type new priority level..."
                  isLight={isLight}
                />
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-bold mb-1">Special Metallurgical Instructions</label>
                <textarea
                  rows={2}
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  placeholder="Quench oil temperature parameters, critical surface masking, micro-hardness test locations..."
                  className={`w-full p-2.5 rounded-lg border text-xs resize-none ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Job Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobOrdersPage;

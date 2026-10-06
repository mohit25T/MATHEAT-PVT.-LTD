import React, { useState, useEffect } from 'react';
import {
  Zap,
  ShieldCheck,
  Activity,
  User,
  Mail,
  Building2,
  Hash,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  MapPin,
  CreditCard,
  Plus,
  Trash2,
  X,
  FileCheck
} from 'lucide-react';
import { validateGSTIN, getStateByGstin, getPanByGstin, getStateCodeByGstin, getEntityTypeFromPan } from '../utils/gstValidator';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';
import CreatableSelect from './CreatableSelect';

export const CustomerFormModal = ({
  isOpen,
  initialData = null,
  onClose,
  onSuccess
}) => {
  const { isLight } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    tradeName: '',
    gstin: '',
    pan: '',
    state: '',
    stateCode: '',
    city: '',
    address: '',
    pincode: '',
    entityType: '',
    gstStatus: 'Active',
    taxpayerType: 'Regular',
    type: 'regular',
    paymentTerms: '',
    creditLimit: '500000',
    notes: '',
    addresses: []
  });

  const [gstValidation, setGstValidation] = useState({ isValid: false, message: '' });
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fetchSuccessBanner, setFetchSuccessBanner] = useState('');

  // Prepopulate if editing
  useEffect(() => {
    if (initialData) {
      const gstinVal = initialData.gstin || '';
      const stateCodeVal = initialData.stateCode || (gstinVal ? gstinVal.slice(0, 2) : '');
      const panVal = initialData.pan || (gstinVal ? getPanByGstin(gstinVal) : '');
      const stateVal = initialData.state || initialData.billingAddress?.state || (gstinVal ? getStateByGstin(gstinVal) : '');

      setFormData({
        name: initialData.name || (initialData.contacts && initialData.contacts[0]?.name) || '',
        email: initialData.email || (initialData.contacts && initialData.contacts[0]?.email) || '',
        phone: initialData.phone || (initialData.contacts && initialData.contacts[0]?.phone) || '',
        company: initialData.companyName || initialData.company || '',
        tradeName: initialData.tradeName || '',
        gstin: gstinVal,
        pan: panVal,
        state: stateVal,
        stateCode: stateCodeVal,
        city: initialData.city || initialData.billingAddress?.city || '',
        address: initialData.address || initialData.billingAddress?.street || '',
        pincode: initialData.pincode || initialData.billingAddress?.pincode || '',
        entityType: initialData.entityType || (panVal ? getEntityTypeFromPan(panVal) : ''),
        gstStatus: initialData.gstStatus || 'Active',
        taxpayerType: initialData.taxpayerType || 'Regular',
        type: initialData.customerType || initialData.type || 'regular',
        paymentTerms: initialData.paymentTerms || '',
        creditLimit: initialData.creditLimit ? String(initialData.creditLimit) : '500000',
        notes: initialData.notes || '',
        addresses: initialData.addresses || []
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        tradeName: '',
        gstin: '',
        pan: '',
        state: '',
        stateCode: '',
        city: '',
        address: '',
        pincode: '',
        entityType: '',
        gstStatus: 'Active',
        taxpayerType: 'Regular',
        type: 'regular',
        paymentTerms: '',
        creditLimit: '500000',
        notes: '',
        addresses: []
      });
      setFetchSuccessBanner('');
    }
  }, [initialData, isOpen]);

  // Live validate GSTIN whenever it changes
  useEffect(() => {
    if (formData.gstin) {
      const result = validateGSTIN(formData.gstin);
      setGstValidation(result);

      // Auto-extract State Code, State, PAN and Entity Type
      if (formData.gstin.length >= 2) {
        const code = formData.gstin.slice(0, 2);
        const stateFromGst = getStateByGstin(formData.gstin);
        setFormData((prev) => ({
          ...prev,
          stateCode: prev.stateCode || code,
          state: prev.state || stateFromGst
        }));
      }
      if (formData.gstin.length >= 10 && !formData.pan) {
        const extractedPan = getPanByGstin(formData.gstin);
        const extractedEntity = getEntityTypeFromPan(extractedPan);
        setFormData((prev) => ({
          ...prev,
          pan: extractedPan,
          entityType: prev.entityType || extractedEntity
        }));
      }
    } else {
      setGstValidation({ isValid: false, message: '' });
      setFetchSuccessBanner('');
    }
  }, [formData.gstin]);

  // Handle Fetch Details from GST Lookup Endpoint
  const handleFetchDetails = async () => {
    if (!formData.gstin || !gstValidation.isValid) return;

    try {
      setFetchLoading(true);
      setFetchSuccessBanner('');

      const res = await api.gst.lookup(formData.gstin);
      if (res && res.success && res.data) {
        const d = res.data;
        const fetchedCompany = d.companyName || d.tradeName || '';
        const fetchedTradeName = d.tradeName || d.companyName || '';
        const fetchedAddress = d.address || '';
        const fetchedCity = d.city || '';
        const fetchedState = d.state || getStateByGstin(formData.gstin) || '';
        const fetchedStateCode = d.stateCode || formData.gstin.slice(0, 2);
        const fetchedPincode = d.pincode || '';
        const fetchedPan = d.pan || getPanByGstin(formData.gstin) || '';
        const fetchedEntityType = d.entityType || getEntityTypeFromPan(fetchedPan) || '';
        const fetchedStatus = d.status || 'Active';
        const fetchedTaxpayerType = d.taxpayerType || 'Regular';

        setFormData((prev) => {
          let updatedAddresses = [...(prev.addresses || [])];
          // If addresses list is empty, also create a primary Plant/Warehouse address node with fetched details
          if (updatedAddresses.length === 0 && (fetchedAddress || fetchedCompany)) {
            updatedAddresses = [
              {
                label: 'Main Plant / Head Office',
                companyName: fetchedCompany || prev.company,
                address: fetchedAddress || prev.address,
                city: fetchedCity || prev.city,
                state: fetchedState || prev.state,
                stateCode: fetchedStateCode,
                pincode: fetchedPincode || prev.pincode,
                gstin: formData.gstin,
                type: 'both'
              }
            ];
          }

          return {
            ...prev,
            company: fetchedCompany || prev.company,
            tradeName: fetchedTradeName || prev.tradeName,
            address: fetchedAddress || prev.address,
            city: fetchedCity || prev.city,
            state: fetchedState || prev.state,
            stateCode: fetchedStateCode,
            pincode: fetchedPincode || prev.pincode,
            pan: fetchedPan || prev.pan,
            entityType: fetchedEntityType || prev.entityType,
            gstStatus: fetchedStatus,
            taxpayerType: fetchedTaxpayerType,
            addresses: updatedAddresses
          };
        });

        const sourceLabel = res.source === 'LIVE_GSTN_API' ? 'Live GSTN Portal' : 'Smart GST Decoder';
        setFetchSuccessBanner(
          `✅ Retrieved from ${sourceLabel}: ${fetchedCompany || fetchedState} | State: ${fetchedStateCode} (${fetchedState}) | Pincode: ${fetchedPincode || 'N/A'} | Status: ${fetchedStatus}`
        );
      } else {
        alert(res?.message || 'Could not fetch GST details. You can enter them manually.');
      }
    } catch (err) {
      console.error('Failed to fetch GST details:', err);
      // Fallback: extract state, stateCode, and PAN locally
      const extractedState = getStateByGstin(formData.gstin);
      const extractedStateCode = formData.gstin.slice(0, 2);
      const extractedPan = getPanByGstin(formData.gstin);
      const extractedEntityType = getEntityTypeFromPan(extractedPan);
      setFormData((prev) => ({
        ...prev,
        state: prev.state || extractedState,
        stateCode: prev.stateCode || extractedStateCode,
        pan: prev.pan || extractedPan,
        entityType: prev.entityType || extractedEntityType
      }));
      setFetchSuccessBanner(`ℹ️ State (${extractedStateCode} - ${extractedState}) and PAN (${extractedPan}) parsed from GSTIN.`);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'gstin') {
      finalValue = value.replace(/\s+/g, '').toUpperCase();
    } else if (name === 'pan') {
      finalValue = value.replace(/\s+/g, '').toUpperCase();
    } else if (name === 'stateCode') {
      finalValue = value.replace(/\s+/g, '').slice(0, 2);
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleAddAddress = () => {
    setFormData((prev) => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        {
          label: `Plant / Warehouse ${prev.addresses.length + 1}`,
          companyName: prev.company || '',
          address: '',
          city: prev.city || '',
          state: prev.state || '',
          stateCode: prev.stateCode || '',
          pincode: '',
          gstin: prev.gstin || '',
          type: ''
        }
      ]
    }));
  };

  const handleRemoveAddress = (index) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  const handleAddressChange = (index, field, value) => {
    const updated = [...formData.addresses];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, addresses: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.company.trim()) {
      alert('Company / Business name is required.');
      return;
    }

    try {
      setSubmitLoading(true);
      const cleanGstin = formData.gstin ? formData.gstin.trim().toUpperCase() : '';
      const cleanStateCode = formData.stateCode || (cleanGstin && cleanGstin.length >= 2 ? cleanGstin.slice(0, 2) : '');
      const cleanPan = formData.pan || (cleanGstin && cleanGstin.length >= 10 ? cleanGstin.slice(2, 12) : '');

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        companyName: formData.company,
        tradeName: formData.tradeName,
        gstin: cleanGstin,
        pan: cleanPan,
        state: formData.state,
        stateCode: cleanStateCode,
        city: formData.city,
        address: formData.address,
        pincode: formData.pincode,
        entityType: formData.entityType,
        gstStatus: formData.gstStatus || 'Active',
        taxpayerType: formData.taxpayerType || 'Regular',
        type: formData.type,
        customerType: formData.type,
        paymentTerms: formData.paymentTerms,
        creditLimit: parseFloat(formData.creditLimit) || 500000,
        notes: formData.notes,
        addresses: formData.addresses
      };

      if (initialData && initialData._id) {
        await api.customers.update(initialData._id, payload);
      } else {
        await api.customers.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save customer:', err);
      alert(err.message || 'Validation error saving customer.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      <div
        className={`relative rounded-2xl border shadow-2xl max-w-4xl w-full p-4 sm:p-6 my-6 max-h-[92vh] overflow-y-auto transition-colors ${
          isLight
            ? 'bg-[#f8fafc] text-black border-black/40'
            : 'bg-slate-900 text-white border-slate-800'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-full border transition-colors cursor-pointer ${
            isLight
              ? 'hover:bg-slate-200 text-black border-black/30'
              : 'hover:bg-slate-800 text-slate-400 hover:text-white border-slate-700'
          }`}
          title="Close Modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b pb-3 mb-4 pr-8 flex items-center gap-3">
          <div className="p-2.5 bg-orange-600 text-white rounded-xl shadow-md">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight uppercase flex items-center gap-2">
              {initialData ? 'Update Client Specification' : 'Authorize New Client Entity'}
              <span className="text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-600 px-2 py-0.5 rounded font-mono uppercase">
                GST Auto-Verified Node
              </span>
            </h2>
            <p className={`text-xs font-bold mt-0.5 ${isLight ? 'text-black' : 'text-slate-400'}`}>
              High-fidelity customer onboarding with instant GSTIN lookup, state resolution, and address matrices.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. CLIENT CLASSIFICATION PROTOCOL */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-orange-600" />
              <label className="text-[11px] font-black uppercase tracking-wider text-orange-600">
                Client Classification Protocol
              </label>
            </div>
            <div className={`flex flex-col sm:flex-row p-1 rounded-xl gap-1 border ${isLight ? 'bg-[#f1f5f9] border-black/30' : 'bg-slate-950 border-slate-800'}`}>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, type: 'regular' }))}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  formData.type === 'regular'
                    ? isLight
                      ? 'bg-orange-600 text-white shadow border border-black'
                      : 'bg-orange-600 text-white shadow'
                    : isLight
                    ? 'text-black hover:text-orange-600'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Regular Enterprise (OEM / Tier-1)
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, type: 'job_work' }))}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  formData.type === 'job_work'
                    ? isLight
                      ? 'bg-blue-600 text-white shadow border border-black'
                      : 'bg-blue-600 text-white shadow'
                    : isLight
                    ? 'text-black hover:text-blue-600'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                Job Work Heat Treat Partner
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, type: 'scrap_buyer' }))}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  formData.type === 'scrap_buyer'
                    ? isLight
                      ? 'bg-slate-900 text-white shadow border border-black'
                      : 'bg-slate-800 text-white shadow'
                    : isLight
                    ? 'text-black hover:text-slate-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                Scrap &amp; Metal Salvager
              </button>
            </div>
          </div>

          {/* 2. GSTIN MASTER AUTO-FETCH SECTION */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-[#f1f5f9] border-black/40' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-orange-600">
                <Hash className="h-4 w-4" />
                Fiscal &amp; Logistics Master (Instant GSTIN Auto-Fetch)
              </span>
              <span className="text-[10px] font-black font-mono text-slate-700 dark:text-slate-400">
                15-Digit Indian GST Identification Number
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* GSTIN Input with Auto-Fetch Button */}
              <div className="md:col-span-2 space-y-1">
                <label className="block text-[10px] font-black uppercase">
                  GSTIN Master UID <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <input
                    name="gstin"
                    type="text"
                    maxLength={15}
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="e.g. 24AAACM1234F1Z5"
                    className={`w-full pl-3 pr-24 py-2.5 rounded-lg border font-mono font-black text-sm tracking-widest uppercase transition-colors ${
                      formData.gstin
                        ? gstValidation.isValid
                          ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                          : 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/10'
                        : isLight
                        ? 'bg-white border-black text-black'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />

                  {/* Visual Validation Icon */}
                  {formData.gstin && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2">
                      {gstValidation.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  )}

                  {/* Fetch Button */}
                  <button
                    type="button"
                    onClick={handleFetchDetails}
                    disabled={fetchLoading || !formData.gstin || !gstValidation.isValid}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-xs font-black shadow flex items-center gap-1 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Click to Auto-Fetch Business Name, Address, State, Pincode from GSTIN"
                  >
                    {fetchLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Fetch Details</span>
                  </button>
                </div>

                {/* Validation Status Message */}
                {formData.gstin && (
                  <p className={`text-[10px] font-bold mt-1 flex items-center gap-1 font-mono ${
                    gstValidation.isValid ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    {gstValidation.isValid ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {gstValidation.message}
                  </p>
                )}
              </div>

              {/* PAN Field (Auto-extracted) */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase">
                  Permanent Account No. (PAN)
                </label>
                <input
                  name="pan"
                  type="text"
                  maxLength={10}
                  value={formData.pan}
                  onChange={handleChange}
                  placeholder="AAACM1234F"
                  className={`w-full px-3 py-2.5 rounded-lg border font-mono font-black text-sm tracking-widest uppercase ${
                    isLight ? 'bg-white border-black text-black' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            {/* Live Fiscal Summary Badges */}
            {(formData.stateCode || formData.state || formData.entityType) && (
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                {formData.stateCode && (
                  <span className="text-[11px] font-black px-2 py-0.5 rounded bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30 font-mono">
                    State Code: {formData.stateCode} ({formData.state || 'India'})
                  </span>
                )}
                {formData.entityType && (
                  <span className="text-[11px] font-black px-2 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                    Entity: {formData.entityType}
                  </span>
                )}
                <span className="text-[11px] font-black px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-mono">
                  Status: {formData.gstStatus || 'Active'}
                </span>
                {formData.taxpayerType && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
                    Type: {formData.taxpayerType}
                  </span>
                )}
              </div>
            )}

            {/* Success Banner */}
            {fetchSuccessBanner && (
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>{fetchSuccessBanner}</span>
              </div>
            )}
          </div>

          {/* 3. BUSINESS ENTITY PARTICULARS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Company / Legal Name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase">
                Registered Legal / Company Name <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="company"
                  type="text"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="LEGAL COMPANY NAME (FROM GST)"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border font-bold text-xs uppercase ${
                    isLight ? 'bg-white border-black text-black' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            {/* Trade Name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase">
                Trade / Brand Name (Alias)
              </label>
              <input
                name="tradeName"
                type="text"
                value={formData.tradeName}
                onChange={handleChange}
                placeholder="TRADE / COMMERCIAL NAME"
                className={`w-full px-3 py-2 rounded-lg border font-bold text-xs uppercase ${
                  isLight ? 'bg-white border-black text-black' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>

            {/* Full Address */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[10px] font-black uppercase">
                Physical Operational Hub (Full Address)
              </label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="Plot / Street, GIDC Industrial Estate, Landmark, City..."
                className={`w-full px-3 py-2 rounded-lg border text-xs font-bold resize-none ${
                  isLight ? 'bg-white border-black text-black' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>

            {/* State Code, State, City, Pincode in Responsive Grid */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* State Code (User explicitly requested) */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-orange-600">
                  State Code (GST)
                </label>
                <input
                  name="stateCode"
                  type="text"
                  maxLength={2}
                  value={formData.stateCode}
                  onChange={handleChange}
                  placeholder="24"
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-mono font-black text-center ${
                    isLight ? 'bg-white border-black text-black' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>

              {/* State Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase">
                  Primary State
                </label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    name="state"
                    type="text"
                    list="indian-states"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="GUJARAT"
                    className={`w-full pl-8 pr-2 py-2 rounded-lg border text-xs font-black uppercase ${
                      isLight ? 'bg-white border-black text-black' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                  <datalist id="indian-states">
                    <option value="GUJARAT" />
                    <option value="MAHARASHTRA" />
                    <option value="RAJASTHAN" />
                    <option value="MADHYA PRADESH" />
                    <option value="HARYANA" />
                    <option value="PUNJAB" />
                    <option value="DELHI" />
                    <option value="UTTAR PRADESH" />
                    <option value="KARNATAKA" />
                    <option value="TAMIL NADU" />
                    <option value="TELANGANA" />
                    <option value="ANDHRA PRADESH" />
                    <option value="WEST BENGAL" />
                  </datalist>
                </div>
              </div>

              {/* City / District */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase">
                  City / Location
                </label>
                <input
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Ahmedabad"
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-bold ${
                    isLight ? 'bg-white border-black text-black' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>

              {/* Pincode */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase">
                  Registry Pincode
                </label>
                <input
                  name="pincode"
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="382445"
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-mono font-black ${
                    isLight ? 'bg-white border-black text-black' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            {/* Entity Type / Constitution */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[10px] font-black uppercase">
                Entity Constitution / Business Type
              </label>
              <input
                name="entityType"
                type="text"
                value={formData.entityType}
                onChange={handleChange}
                placeholder="e.g. Private Limited Company / Proprietorship / LLP"
                className={`w-full px-3 py-2 rounded-lg border text-xs font-bold ${
                  isLight ? 'bg-white border-black text-black' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>
          </div>

          {/* 4. IDENTITY CORE (CONTACT PERSON) */}
          <div className={`p-3.5 rounded-xl border space-y-3 ${
            isLight ? 'bg-[#f1f5f9] border-black/30' : 'bg-slate-950 border-slate-800'
          }`}>
            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-blue-600">
              <User className="h-4 w-4" />
              Identity Core &amp; Official Point of Contact
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase">Legal Representative Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Contact Name"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs font-bold ${
                      isLight ? 'bg-white border-black text-black' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase">Contact Relay (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="client@enterprise.com"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs font-bold ${
                      isLight ? 'bg-white border-black text-black' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase">Telecom Protocol (Phone)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs font-bold font-mono ${
                      isLight ? 'bg-white border-black text-black' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 5. COMMERCIAL TERMS & CREDIT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <CreatableSelect
                dropdownKey="paymentTerms"
                label="Commercial Payment Terms"
                value={formData.paymentTerms}
                onChange={(val) => setFormData((prev) => ({ ...prev, paymentTerms: val }))}
                placeholder="-- Select Commercial Payment Terms --"
                addPlaceholder="Add custom terms (e.g. 90 Days LC)..."
                isLight={isLight}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase">Authorized Credit Limit (₹)</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="creditLimit"
                  type="number"
                  step="10000"
                  value={formData.creditLimit}
                  onChange={handleChange}
                  placeholder="500000"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border font-mono font-bold text-xs ${
                    isLight ? 'bg-[#f1f5f9] border-black text-black' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 6. DYNAMIC ADDITIONAL ADDRESS NODES (BRANCHES / PLANTS) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  Additional Address Nodes (Branches / Warehouses)
                </h4>
                <p className="text-[10px] text-slate-500 font-bold">
                  Attach multiple shipping/billing destinations to this customer
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddAddress}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-black shadow flex items-center gap-1 cursor-pointer transition-all border border-black/20"
              >
                <Plus className="w-3.5 h-3.5" /> Add Address Node
              </button>
            </div>

            {formData.addresses.length > 0 && (
              <div className="space-y-2.5">
                {formData.addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border relative space-y-2 ${
                      isLight ? 'bg-white border-black/30' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveAddress(idx)}
                      className="absolute top-2.5 right-2.5 text-rose-500 hover:text-rose-700 cursor-pointer p-1"
                      title="Remove Node"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pr-8">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black uppercase text-slate-500">Address Label</label>
                        <input
                          value={addr.label}
                          onChange={(e) => handleAddressChange(idx, 'label', e.target.value)}
                          placeholder="Warehouse 1 / Plant B"
                          className={`w-full px-2.5 py-1.5 rounded border text-xs font-bold ${
                            isLight ? 'bg-[#f1f5f9] border-black' : 'bg-slate-900 border-slate-700'
                          }`}
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black uppercase text-slate-500">Entity / Branch Name</label>
                        <input
                          value={addr.companyName}
                          onChange={(e) => handleAddressChange(idx, 'companyName', e.target.value)}
                          placeholder="Branch Company Name"
                          className={`w-full px-2.5 py-1.5 rounded border text-xs font-bold uppercase ${
                            isLight ? 'bg-[#f1f5f9] border-black' : 'bg-slate-900 border-slate-700'
                          }`}
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black uppercase text-slate-500">Node Type</label>
                        <select
                          value={addr.type}
                          onChange={(e) => handleAddressChange(idx, 'type', e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded border text-xs font-bold ${
                            isLight ? 'bg-[#f1f5f9] border-black' : 'bg-slate-900 border-slate-700'
                          }`}
                        >
                          <option value="">-- Select Node Type --</option>
                          <option value="both">Both (Billing &amp; Shipping)</option>
                          <option value="shipping">Shipping Only</option>
                          <option value="billing">Billing Only</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 space-y-0.5">
                        <label className="text-[9px] font-black uppercase text-slate-500">Full Address</label>
                        <input
                          value={addr.address}
                          onChange={(e) => handleAddressChange(idx, 'address', e.target.value)}
                          placeholder="Street, Industrial Area, City..."
                          className={`w-full px-2.5 py-1.5 rounded border text-xs font-bold ${
                            isLight ? 'bg-[#f1f5f9] border-black' : 'bg-slate-900 border-slate-700'
                          }`}
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black uppercase text-slate-500">City / Location</label>
                        <input
                          value={addr.city || ''}
                          onChange={(e) => handleAddressChange(idx, 'city', e.target.value)}
                          placeholder="City"
                          className={`w-full px-2.5 py-1.5 rounded border text-xs font-bold ${
                            isLight ? 'bg-white border-black' : 'bg-slate-900 border-slate-700'
                          }`}
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black uppercase text-slate-500">Code / State / PIN</label>
                        <div className="flex gap-1">
                          <input
                            value={addr.stateCode || ''}
                            onChange={(e) => handleAddressChange(idx, 'stateCode', e.target.value.replace(/\s+/g, '').slice(0, 2))}
                            placeholder="Code"
                            maxLength={2}
                            className={`w-1/4 px-1 py-1.5 rounded border text-xs font-mono font-black text-center ${
                              isLight ? 'bg-white border-black' : 'bg-slate-900 border-slate-700'
                            }`}
                          />
                          <input
                            value={addr.state || ''}
                            onChange={(e) => handleAddressChange(idx, 'state', e.target.value)}
                            placeholder="State"
                            className={`w-1/2 px-2 py-1.5 rounded border text-xs font-bold uppercase ${
                              isLight ? 'bg-white border-black' : 'bg-slate-900 border-slate-700'
                            }`}
                          />
                          <input
                            value={addr.pincode || ''}
                            onChange={(e) => handleAddressChange(idx, 'pincode', e.target.value)}
                            placeholder="PIN"
                            maxLength={6}
                            className={`w-1/4 px-1 py-1.5 rounded border text-xs font-mono font-bold ${
                              isLight ? 'bg-white border-black' : 'bg-slate-900 border-slate-700'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="border-t pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl text-xs font-black cursor-pointer border transition-colors ${
                isLight
                  ? 'bg-slate-200 hover:bg-slate-300 text-black border-black/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
              }`}
            >
              Abort Entry
            </button>

            <button
              type="submit"
              disabled={submitLoading}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black shadow-lg uppercase tracking-wider flex items-center gap-2 cursor-pointer border border-black transition-all disabled:opacity-50"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Synchronizing...</span>
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4" />
                  <span>{initialData ? 'Commit Data Update' : 'Authorize New Entry'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

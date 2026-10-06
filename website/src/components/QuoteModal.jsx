import React, { useState } from 'react';
import { X, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { services } from '../data/services';

export default function QuoteModal({ isOpen, onClose, defaultProcess = "Carburizing" }) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    partNumber: "",
    materialGrade: "",
    requiredProcess: defaultProcess,
    quantity: "",
    hardnessHrc: "",
    caseDepthMm: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-navy-900 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-4 sm:p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
          aria-label="Close quote modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4 font-mono">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-navy-900">
              RFQ RECEIVED // BATCH REGISTERED
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Our metallurgical engineering team at MATHEAT PVT. LTD. will review your component parameters and submit a formal quotation within 24 hours.
            </p>

            {/* Client-Side Export / Send Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
              <a
                href={`mailto:rfq@matheat.com?subject=Quick Quote: ${encodeURIComponent(formData.partNumber || 'Component')} - ${encodeURIComponent(formData.company)}&body=Name: ${encodeURIComponent(formData.name)}%0D%0ACompany: ${encodeURIComponent(formData.company)}%0D%0APhone: ${encodeURIComponent(formData.phone)}%0D%0AEmail: ${encodeURIComponent(formData.email)}%0D%0APart: ${encodeURIComponent(formData.partNumber)}%0D%0AMaterial: ${encodeURIComponent(formData.materialGrade)}%0D%0AProcess: ${encodeURIComponent(formData.requiredProcess)}%0D%0AHardness: ${encodeURIComponent(formData.hardnessHrc)}%0D%0ANotes: ${encodeURIComponent(formData.message)}`}
                className="px-4 py-2 bg-heat-orange hover:bg-heat-deep text-white font-bold rounded flex items-center gap-1.5 shadow"
              >
                <span>OPEN IN EMAIL CLIENT</span>
              </a>
              <button
                onClick={() => {
                  const content = `MATHEAT PVT. LTD. - QUICK RFQ\n--------------------------------------------\nDate: ${new Date().toLocaleDateString()}\nName: ${formData.name}\nCompany: ${formData.company}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nPart Number: ${formData.partNumber}\nMaterial Grade: ${formData.materialGrade}\nRequired Process: ${formData.requiredProcess}\nTarget Hardness: ${formData.hardnessHrc}\nNotes: ${formData.message}\n--------------------------------------------\nSend to: rfq@matheat.com`;
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `MATHEAT-RFQ-${formData.partNumber || 'Component'}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-navy-900 border border-slate-300 font-bold rounded flex items-center gap-1.5"
              >
                <span>DOWNLOAD (.TXT)</span>
              </button>
            </div>

            <div className="pt-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="px-6 py-2 border border-slate-300 text-slate-600 text-xs font-bold rounded hover:bg-slate-100 transition-colors"
              >
                CLOSE WINDOW
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
            <div>
              <span className="text-xs font-bold text-heat-orange uppercase tracking-wider block">
                MATHEAT PVT. LTD. // RFQ DESK
              </span>
              <h3 className="text-2xl font-black text-navy-900 tracking-tight mt-0.5">
                Request Engineering Quotation
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-1">
                Provide component chemistry & target hardness for custom thermal cycle calculation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">NAME *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Name"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs text-navy-900 focus:outline-none focus:border-heat-orange"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">COMPANY *</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company Name"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs text-navy-900 focus:outline-none focus:border-heat-orange"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">PHONE NUMBER *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs text-navy-900 focus:outline-none focus:border-heat-orange"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">EMAIL ADDRESS *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="engineer@company.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs text-navy-900 focus:outline-none focus:border-heat-orange"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">PART NUMBER / DRAWING</label>
                <input
                  type="text"
                  value={formData.partNumber}
                  onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                  placeholder="e.g. PG-44-PINION"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs text-navy-900 focus:outline-none focus:border-heat-orange"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">MATERIAL GRADE</label>
                <input
                  type="text"
                  value={formData.materialGrade}
                  onChange={(e) => setFormData({ ...formData, materialGrade: e.target.value })}
                  placeholder="e.g. 20MnCr5, SAE 8620"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs text-navy-900 focus:outline-none focus:border-heat-orange"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">PROCESS REQUIRED</label>
                <select
                  value={formData.requiredProcess}
                  onChange={(e) => setFormData({ ...formData, requiredProcess: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs text-navy-900 focus:outline-none focus:border-heat-orange bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">TARGET HARDNESS (HRC)</label>
                <input
                  type="text"
                  value={formData.hardnessHrc}
                  onChange={(e) => setFormData({ ...formData, hardnessHrc: e.target.value })}
                  placeholder="e.g. 58 – 62 HRC"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs text-navy-900 focus:outline-none focus:border-heat-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 font-semibold mb-1">ADDITIONAL NOTES / QUANTITY</label>
              <textarea
                rows={2}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Batch quantity, case depth (ECD), core hardness requirements..."
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs text-navy-900 focus:outline-none focus:border-heat-orange"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-heat-orange hover:bg-heat-deep text-white text-xs font-bold rounded shadow flex items-center justify-center gap-2 group transition-all"
              >
                <Send className="w-4 h-4" />
                <span>TRANSMIT RFQ TO METALLURGY TEAM</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Strict NDA Confidentiality for Customer Part Drawings</span>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

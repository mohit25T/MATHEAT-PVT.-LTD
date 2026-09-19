import React, { useState } from 'react';
import { companyInfo } from '../data/companyInfo';
import { services } from '../data/services';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, Clock, FileText } from 'lucide-react';

export default function ContactSection({ prefilledProcess = "" }) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    partNumber: "",
    materialGrade: "",
    requiredProcess: prefilledProcess || "Carburizing",
    quantity: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-8 bg-[#E5EBF2] bg-cad-grid border-b border-slate-300 relative overflow-hidden w-full">
      <div className="w-full px-3 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-6">
          <span className="font-mono text-xs font-bold text-heat-orange tracking-widest uppercase block mb-1">
            // ENGINEERING INQUIRY & RFQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            LET'S TALK ABOUT YOUR COMPONENT.
          </h2>
          <div className="w-16 h-1 bg-heat-orange mt-2 mb-3"></div>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Submit your component drawing, material specifications, and required heat treatment parameters. Our metallurgists will respond within 24 business hours with process feasibility and quotation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form: RFQ & Component Specification Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border-2 border-slate-400 rounded-2xl p-4 sm:p-6 shadow-xl">
              
              {submitted ? (
                <div className="py-12 text-center space-y-4 font-mono">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-900">
                    ENQUIRY TRANSMITTED // RFQ LOGGED
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="font-bold text-navy-900">{formData.name}</span>. Your component enquiry for <span className="font-bold text-navy-900">{formData.partNumber || "your component"}</span> ({formData.materialGrade || "specified grade"}) has been assigned to our metallurgical engineering desk.
                  </p>
                  <div className="text-[11px] text-slate-400">
                    Reference Token: <span className="text-heat-orange font-bold">RFQ-2026-ENQ-{Math.floor(1000 + Math.random() * 9000)}</span>
                  </div>

                  {/* Client-Side Export / Send Actions */}
                  <div className="pt-3 flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
                    <a
                      href={`mailto:rfq@matheat.com?subject=RFQ Inquiry: ${encodeURIComponent(formData.partNumber || 'Component')} - ${encodeURIComponent(formData.company)}&body=Name: ${encodeURIComponent(formData.name)}%0D%0ACompany: ${encodeURIComponent(formData.company)}%0D%0APhone: ${encodeURIComponent(formData.phone)}%0D%0AEmail: ${encodeURIComponent(formData.email)}%0D%0APart: ${encodeURIComponent(formData.partNumber)}%0D%0AMaterial: ${encodeURIComponent(formData.materialGrade)}%0D%0AProcess: ${encodeURIComponent(formData.requiredProcess)}%0D%0AQuantity: ${encodeURIComponent(formData.quantity)}%0D%0AMessage: ${encodeURIComponent(formData.message)}`}
                      className="px-4 py-2 bg-heat-orange hover:bg-heat-deep text-white font-bold rounded flex items-center gap-1.5 shadow"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>OPEN IN EMAIL CLIENT</span>
                    </a>
                    <button
                      onClick={() => {
                        const content = `MATHEAT PVT. LTD. - RFQ SPECIFICATION SHEET\n--------------------------------------------\nDate: ${new Date().toLocaleDateString()}\nName: ${formData.name}\nCompany: ${formData.company}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nPart Number: ${formData.partNumber}\nMaterial Grade: ${formData.materialGrade}\nRequired Process: ${formData.requiredProcess}\nQuantity: ${formData.quantity}\nRequirements/Notes: ${formData.message}\n--------------------------------------------\nSend to: rfq@matheat.com`;
                        const blob = new Blob([content], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `MATHEAT-RFQ-${formData.partNumber || 'Component'}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-navy-900 font-bold rounded flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>DOWNLOAD RFQ (.TXT)</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        company: "",
                        phone: "",
                        email: "",
                        partNumber: "",
                        materialGrade: "",
                        requiredProcess: "Carburizing",
                        quantity: "",
                        message: ""
                      });
                    }}
                    className="mt-4 px-6 py-2 border border-slate-300 text-slate-600 text-xs font-bold rounded hover:bg-slate-100 transition-colors block mx-auto"
                  >
                    SUBMIT ANOTHER INQUIRY
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="text-xs font-mono font-bold text-navy-900 uppercase border-b border-slate-200 pb-2 mb-4">
                    TECHNICAL RFQ SPECIFICATION SHEET
                  </div>

                  {/* Name & Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-slate-600 font-semibold mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs font-sans text-navy-900 focus:outline-none focus:border-heat-orange focus:ring-1 focus:ring-heat-orange"
                        placeholder="e.g. Rajesh Patel"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-slate-600 font-semibold mb-1">
                        Company / Organization *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs font-sans text-navy-900 focus:outline-none focus:border-heat-orange focus:ring-1 focus:ring-heat-orange"
                        placeholder="e.g. Apex Gears Ltd."
                      />
                    </div>
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-slate-600 font-semibold mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs font-sans text-navy-900 focus:outline-none focus:border-heat-orange focus:ring-1 focus:ring-heat-orange"
                        placeholder="+91 98XXX XXXXX"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-slate-600 font-semibold mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs font-sans text-navy-900 focus:outline-none focus:border-heat-orange focus:ring-1 focus:ring-heat-orange"
                        placeholder="engineer@company.com"
                      />
                    </div>
                  </div>

                  {/* Part Number & Material Grade */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-slate-600 font-semibold mb-1">
                        Part Number / Description
                      </label>
                      <input
                        type="text"
                        value={formData.partNumber}
                        onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs font-sans text-navy-900 focus:outline-none focus:border-heat-orange focus:ring-1 focus:ring-heat-orange"
                        placeholder="e.g. PG-44-PINION"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-slate-600 font-semibold mb-1">
                        Material Grade
                      </label>
                      <input
                        type="text"
                        value={formData.materialGrade}
                        onChange={(e) => setFormData({ ...formData, materialGrade: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs font-sans text-navy-900 focus:outline-none focus:border-heat-orange focus:ring-1 focus:ring-heat-orange"
                        placeholder="e.g. 20MnCr5, SAE 8620, EN31, EN19"
                      />
                    </div>
                  </div>

                  {/* Process & Quantity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-slate-600 font-semibold mb-1">
                        Required Process *
                      </label>
                      <select
                        value={formData.requiredProcess}
                        onChange={(e) => setFormData({ ...formData, requiredProcess: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs font-sans text-navy-900 focus:outline-none focus:border-heat-orange bg-white"
                      >
                        {services.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-slate-600 font-semibold mb-1">
                        Batch Quantity / Weight
                      </label>
                      <input
                        type="text"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs font-sans text-navy-900 focus:outline-none focus:border-heat-orange focus:ring-1 focus:ring-heat-orange"
                        placeholder="e.g. 500 Nos. or 400 KG / month"
                      />
                    </div>
                  </div>

                  {/* Message / Technical Specs */}
                  <div>
                    <label className="block font-mono text-[11px] uppercase text-slate-600 font-semibold mb-1">
                      Message / Hardness & Case Depth Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs font-sans text-navy-900 focus:outline-none focus:border-heat-orange focus:ring-1 focus:ring-heat-orange"
                      placeholder="Specify required surface hardness (e.g. 58-62 HRC), effective case depth (e.g. 0.8-1.2mm), core hardness, or drawing notes..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-heat-orange hover:bg-heat-deep text-white font-mono text-xs font-bold rounded shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                    >
                      <Send className="w-4 h-4" />
                      <span>SEND ENQUIRY // REQUEST QUOTE</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

          {/* Right Information & Official Placeholders */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Official Company Details Card */}
            <div className="bg-navy-950 text-white rounded-2xl p-6 sm:p-8 border-2 border-navy-700/80 shadow-2xl space-y-5">
              <div className="border-b border-navy-800 pb-4">
                <span className="font-mono text-[10px] text-heat-orange tracking-widest uppercase block">
                  CORPORATE HEADQUARTERS & WORKS
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {companyInfo.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  INDUSTRIAL HEAT TREATMENT & METALLURGICAL SERVICES
                </p>
              </div>

              {/* Contact Details with Verified Plant Information */}
              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-start gap-3 text-slate-300">
                  <MapPin className="w-4 h-4 text-heat-orange shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Plant Address:</span>
                    <span className="text-white font-semibold">
                      {companyInfo.contact.address.line1}<br />
                      {companyInfo.contact.address.line2}<br />
                      {companyInfo.contact.address.city}, {companyInfo.contact.address.state} {companyInfo.contact.address.pincode}, {companyInfo.contact.address.country}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-300">
                  <Phone className="w-4 h-4 text-heat-orange shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Phone / Plant Desk:</span>
                    <span className="text-white font-semibold">{companyInfo.contact.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-300">
                  <Mail className="w-4 h-4 text-heat-orange shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Metallurgical Inquiry Email:</span>
                    <span className="text-white font-semibold">{companyInfo.contact.salesEmail}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-300">
                  <Clock className="w-4 h-4 text-heat-orange shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Operational Schedule:</span>
                    <span className="text-heat-orange font-semibold">{companyInfo.contact.workingHours}</span>
                  </div>
                </div>
              </div>

              {/* Engineering Advisory Note */}
              <div className="pt-4 border-t border-navy-800 text-[11px] text-slate-400 leading-relaxed font-sans">
                Notice: All sample trials and batch processing are executed in conformance with AIAG CQI-9, AMS 2750, and ASTM metallurgy standards.
              </div>
            </div>

            {/* Quick Turnaround Assurance */}
            <div className="bg-white border-2 border-slate-400 rounded-xl p-5 font-mono text-xs space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-navy-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>RAPID TECHNICAL QUOTATION</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Drawings provided in STEP, DWG, DXF, or PDF format are reviewed by metallurgical staff for fixturing geometry, quenching media compatibility, and cycle time calculation.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

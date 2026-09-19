import React from 'react';
import { sampleCertificate } from '../data/specs';
import { X, Download, ShieldCheck, QrCode, CheckCircle2, Printer, FileText } from 'lucide-react';

export default function CertificateModal({ isOpen, onClose, onOpenQuoteModal }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-navy-900 rounded-xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative p-4 sm:p-6 font-sans">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
          aria-label="Close certificate modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Top Header */}
        <div className="border-b-2 border-navy-900 pb-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/matheat_logo.png" alt="MATHEAT PVT. LTD." className="h-11 w-auto object-contain" />
            <div>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block leading-tight">
                METALLURGICAL TEST LABORATORY
              </span>
              <h3 className="text-lg font-black text-navy-900 tracking-tight">
                HEAT TREATMENT CERTIFICATE (HTC)
              </h3>
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            <div className="text-heat-orange font-bold text-sm">
              NO: {sampleCertificate.certificateNo}
            </div>
            <div className="text-slate-500 text-[11px]">
              DATE: {sampleCertificate.date}
            </div>
          </div>
        </div>

        {/* Certificate Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-5 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Customer:</span>
            <span className="font-bold text-navy-900 truncate block">{sampleCertificate.customer}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Part Number:</span>
            <span className="font-bold text-navy-900 block">{sampleCertificate.partNumber}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Material Grade:</span>
            <span className="font-bold text-navy-900 block">{sampleCertificate.materialGrade}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Mill Heat No:</span>
            <span className="font-bold text-navy-900 block">{sampleCertificate.heatNumber}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Batch Number:</span>
            <span className="font-bold text-heat-orange block">{sampleCertificate.batchNo}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Process:</span>
            <span className="font-bold text-navy-900 block">{sampleCertificate.process}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Furnace Unit:</span>
            <span className="font-bold text-navy-900 block">{sampleCertificate.furnaceId}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Batch Qty:</span>
            <span className="font-bold text-navy-900 block">{sampleCertificate.quantity}</span>
          </div>
        </div>

        {/* Laboratory Inspection Results Table */}
        <div className="border border-slate-300 rounded-lg overflow-hidden mb-5">
          <div className="bg-navy-900 text-white font-mono text-xs font-bold px-4 py-2 flex justify-between">
            <span>METALLURGICAL TEST RESULTS</span>
            <span>STANDARD: ASTM E18 / ASTM E384</span>
          </div>

          <div className="p-4 space-y-3 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Surface Hardness:</span>
              <span className="text-slate-700">Spec: {sampleCertificate.inspectionResults.surfaceHardnessSpec}</span>
              <span className="font-bold text-emerald-700">Observed: {sampleCertificate.inspectionResults.surfaceHardnessObserved}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Core Hardness:</span>
              <span className="text-slate-700">Spec: {sampleCertificate.inspectionResults.coreHardnessSpec}</span>
              <span className="font-bold text-emerald-700">Observed: {sampleCertificate.inspectionResults.coreHardnessObserved}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Effective Case Depth:</span>
              <span className="text-slate-700">Spec: {sampleCertificate.inspectionResults.caseDepthSpec}</span>
              <span className="font-bold text-emerald-700">Observed: {sampleCertificate.inspectionResults.caseDepthObserved}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Microstructure:</span>
              <span className="text-slate-700">Spec: {sampleCertificate.inspectionResults.microstructureSpec}</span>
              <span className="font-bold text-navy-900">{sampleCertificate.inspectionResults.microstructureObserved}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1.5">
              <span className="text-slate-500 font-semibold">Crack Inspection (NDT):</span>
              <span className="sm:col-span-2 font-bold text-emerald-700">
                ✓ {sampleCertificate.inspectionResults.crackInspection}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Footer & QR Seal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-slate-300 rounded bg-slate-50">
              <QrCode className="w-10 h-10 text-navy-900" />
            </div>
            <div className="text-xs font-mono text-slate-500">
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                QC VERIFIED & SIGNED
              </span>
              <span className="text-[10px] block mt-0.5">
                Scan QR to verify cryptographic signature on matheat.com
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 rounded text-xs font-mono font-bold text-navy-900 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenQuoteModal();
              }}
              className="px-4 py-2 bg-heat-orange hover:bg-heat-deep text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>REQUEST SAMPLE CERTIFICATE</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

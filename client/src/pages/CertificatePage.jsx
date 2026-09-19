import React, { useState } from 'react';
import {
  FileBadge,
  Download,
  Printer,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Calendar,
  Layers,
  Flame,
  Award
} from 'lucide-react';

export const CertificatePage = () => {
  const [selectedBatch, setSelectedBatch] = useState('HT-2026-000124');

  // Certificate Parameters State (Comprehensive All-Parameter Heat Treatment Certificate)
  const certData = {
    certificateNumber: 'HTC-HT-2026-000124',
    date: '17-Sep-2026',
    batchId: 'HT-2026-000124',
    jobOrderNumber: 'JO-2026-0001',
    customerPoNumber: 'PO-SKF-2026-901',
    customerName: 'SKF India Bearings Ltd.',
    customerGstin: '27AAACS1900K1Z9',
    deliveryChallan: 'DC-SKF-8921',

    // Component Specifications
    partNumber: '6205-BRG-RING',
    partName: '6205 Deep Groove Ball Bearing Outer Ring',
    drawingNumber: 'DWG-6205-RevB',
    revision: 'R1',
    materialGrade: 'EN31 / 100Cr6',
    standard: 'IS 5517 / DIN 17230',
    weightPerPiece: '0.28 kg',
    dimensionsText: 'OD: 52.00 mm x ID: 25.00 mm x Width: 15.00 mm',
    processedQuantity: '1,495 Pcs',
    processedWeight: '418.6 Kg',

    // Raw Material & Chemistry
    heatNumber: 'H-45872',
    castNumber: 'C-9021-B',
    millOrigin: 'JSW Steel Ltd. (Special Steel Plant)',
    mtcNumber: 'JSW-MTC-99418',
    chemistry: {
      c: { spec: '0.95 - 1.10', actual: '0.98' },
      mn: { spec: '0.30 - 0.75', actual: '0.45' },
      si: { spec: '0.10 - 0.35', actual: '0.25' },
      cr: { spec: '1.30 - 1.60', actual: '1.42' },
      ni: { spec: 'Max 0.25', actual: '0.12' },
      mo: { spec: 'Max 0.10', actual: '0.04' },
      s: { spec: 'Max 0.025', actual: '0.015' },
      p: { spec: 'Max 0.025', actual: '0.018' }
    },

    // Process & Cycle Parameters
    furnaceId: 'F-01 (Sealed Quench Furnace SQF-01)',
    recipeCode: 'RCP-EN31-6205',
    recipeRevision: 'V1 (Approved by Metallurgist)',
    cycle: {
      hardeningTargetTemp: '850 °C',
      hardeningActualTemp: '852 °C',
      hardeningTargetSoak: '90 min',
      hardeningActualSoak: '92 min',
      atmosphere: 'Endothermic Gas with Controlled Carbon Potential (0.90% Target vs 0.91% Actual)',
      quenchMedium: 'Accelerated Quench Oil (ISO 32)',
      quenchTargetTemp: '60 °C',
      quenchActualTemp: '62 °C',
      quenchTime: '15 min (High Impeller Agitation)',
      temperingTargetTemp: '180 °C',
      temperingActualTemp: '182 °C',
      temperingTargetTime: '120 min',
      temperingActualTime: '120 min',
      coolingMethod: 'Still Air Cool to Ambient Temperature'
    },

    // Mechanical & QC Test Results
    hardness: {
      scale: 'HRC',
      specifiedRange: '58.0 - 62.0 HRC',
      readings: [
        { sample: 'Sample 1 (OD)', value: '60.5 HRC' },
        { sample: 'Sample 2 (Face)', value: '60.2 HRC' },
        { sample: 'Sample 3 (ID)', value: '60.8 HRC' },
        { sample: 'Sample 4 (OD)', value: '60.4 HRC' },
        { sample: 'Sample 5 (Face)', value: '60.6 HRC' }
      ],
      average: '60.5 HRC',
      coreSpecified: '32.0 - 40.0 HRC',
      coreActual: '35.8 HRC',
      result: 'PASS'
    },

    caseDepth: {
      cutoff: '50 HRC / 550 HV',
      effectiveRange: '0.80 - 1.10 mm',
      effectiveActual: '0.94 mm',
      totalCaseDepth: '1.25 mm',
      method: 'Microhardness Vickers Traverse (HV 0.5 kgf)',
      result: 'PASS'
    },

    metallography: {
      microstructure: 'Uniform fine Tempered Martensite with well-dispersed carbides; no free ferrite observed',
      grainSize: 'ASTM 7 (Fine Austenitic Grain, spec: ASTM 6-8)',
      retainedAustenite: '8.0 % (Max allowable: 15.0 %)',
      decarburization: '0.00 mm (No decarburization observed)',
      crackInspection: 'Satisfactory & Crack-Free (Visual & MPI Inspected)',
      distortion: '0.025 mm TIR (Within 0.05 mm limit)',
      result: 'PASS'
    },

    inspector: 'Er. Rajesh Sharma',
    inspectorDesignation: 'Senior Metallurgical QA Inspector',
    approver: 'Dr. V. K. Deshpande',
    approverDesignation: 'Head of Quality & Metallurgy'
  };

  const handleDownloadPdf = () => {
    window.open(`http://localhost:5000/api/documents/certificate/${selectedBatch}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileBadge className="h-5 w-5 text-blue-600" />
            Dedicated All-Parameter Heat Treatment Certificate
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ISO 9001:2015 & IATF 16949 / NABL Compliant Certificate with Full Part & Material Parameters
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 font-mono outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="HT-2026-000124">Batch HT-2026-000124 (SKF 6205 Bearing)</option>
            <option value="HT-2026-000123">Batch HT-2026-000123 (Tata 24T Pinion)</option>
          </select>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" /> Download Official PDF
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Print Certificate
          </button>
        </div>
      </div>

      {/* CERTIFICATE SHEET (A4 Printable Layout with Elegant Watermark) */}
      <div
        id="printable-certificate"
        className="printable-certificate bg-white text-slate-900 rounded-xl shadow-2xl p-8 max-w-4xl mx-auto relative border border-slate-200 overflow-hidden font-sans"
      >
        
        {/* Central Company Watermark */}
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center select-none"
          style={{
            backgroundImage: "url('/matheat_logo.jpg')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: '480px 480px',
            opacity: 0.38
          }}
        />

        {/* 1. Header with Logo & Creds */}
        <div className="relative z-10 border-b-2 border-slate-900 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src="/matheat_logo.jpg"
                alt="MATHEAT Logo"
                className="h-20 w-20 object-contain border border-slate-300 rounded p-1 bg-white"
              />
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950 font-sans">
                  MATHEAT PVT. LTD.
                </h2>
                <div className="text-xs font-bold text-orange-600 tracking-wider">
                  INDUSTRIAL HEAT TREATMENT SPECIALISTS &bull; UNIFORM &bull; STRENGTH &bull; PRECISION
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-tight">
                  Plot No. 42-45, Industrial Area Phase II, MIDC, Aurangabad - 431001, Maharashtra, India
                  <br />
                  Tel: +91 (240) 255-8900 | Email: qc@matheat.com | Web: www.matheat.com
                </p>
                <div className="text-[10px] font-semibold text-slate-700 mt-1">
                  An ISO 9001:2015 & IATF 16949 Certified Heat Treatment Facility
                </div>
              </div>
            </div>

            {/* Certificate Box */}
            <div className="text-right border border-slate-300 p-2.5 rounded bg-slate-50 min-w-[200px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Inspection Certificate</span>
              <span className="text-sm font-black text-red-600 font-mono block">{certData.certificateNumber}</span>
              <span className="text-[11px] text-slate-700 block mt-0.5">Date: <strong>{certData.date}</strong></span>
              <span className="text-[11px] text-slate-700 font-mono block">Batch: <strong>{certData.batchId}</strong></span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded inline-block mt-1">
                DISPOSITION: ACCEPTED / PASS
              </span>
            </div>
          </div>

          <div className="mt-4 bg-slate-900 text-white text-center py-1.5 font-bold text-xs uppercase tracking-wider rounded-sm">
            HEAT TREATMENT INSPECTION & TEST CERTIFICATE (ALL PARAMETERS)
          </div>
        </div>

        {/* 2. Customer & Component Specifications */}
        <div className="relative z-10 mt-4">
          <div className="bg-slate-100 px-3 py-1 font-bold text-xs text-slate-800 border-l-4 border-slate-900 uppercase">
            1. Customer & Component Specifications
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 p-3 text-xs border border-slate-200 rounded-b">
            <div><span className="text-slate-500 font-semibold">Customer Name:</span> <strong className="text-slate-900">{certData.customerName}</strong></div>
            <div><span className="text-slate-500 font-semibold">Customer PO No:</span> <strong className="text-slate-900">{certData.customerPoNumber}</strong></div>
            <div><span className="text-slate-500 font-semibold">Part Number:</span> <strong className="text-slate-900 font-mono">{certData.partNumber}</strong></div>
            <div><span className="text-slate-500 font-semibold">Job Order No:</span> <strong className="text-slate-900 font-mono">{certData.jobOrderNumber}</strong></div>
            <div><span className="text-slate-500 font-semibold">Part Description:</span> <span>{certData.partName}</span></div>
            <div><span className="text-slate-500 font-semibold">Drawing & Rev:</span> <span>{certData.drawingNumber} ({certData.revision})</span></div>
            <div><span className="text-slate-500 font-semibold">Quantity / Weight:</span> <strong>{certData.processedQuantity} ({certData.processedWeight})</strong></div>
            <div><span className="text-slate-500 font-semibold">Dimensions (mm):</span> <span>{certData.dimensionsText}</span></div>
          </div>
        </div>

        {/* 3. Raw Material & Chemical Composition (MTC Traceability) */}
        <div className="relative z-10 mt-4">
          <div className="bg-slate-100 px-3 py-1 font-bold text-xs text-slate-800 border-l-4 border-slate-900 uppercase">
            2. Raw Material & Chemical Composition (MTC Verified)
          </div>
          <div className="p-3 border border-slate-200 rounded-b text-xs space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div><span className="text-slate-500 font-semibold">Material Grade:</span> <strong className="text-blue-900">{certData.materialGrade}</strong></div>
              <div><span className="text-slate-500 font-semibold">Raw Heat Number:</span> <strong className="text-red-600 font-mono">{certData.heatNumber}</strong></div>
              <div><span className="text-slate-500 font-semibold">Cast / Coil No:</span> <strong className="font-mono">{certData.castNumber}</strong></div>
              <div><span className="text-slate-500 font-semibold">Standard:</span> <span>{certData.standard}</span></div>
            </div>

            {/* Chemical Elements Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-[11px] text-center border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700">
                    <th className="border border-slate-300 p-1">Element</th>
                    <th className="border border-slate-300 p-1">C %</th>
                    <th className="border border-slate-300 p-1">Mn %</th>
                    <th className="border border-slate-300 p-1">Si %</th>
                    <th className="border border-slate-300 p-1">Cr %</th>
                    <th className="border border-slate-300 p-1">Ni %</th>
                    <th className="border border-slate-300 p-1">Mo %</th>
                    <th className="border border-slate-300 p-1">S %</th>
                    <th className="border border-slate-300 p-1">P %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-1 font-semibold text-slate-600">IS/DIN Spec</td>
                    <td className="border border-slate-300 p-1 text-slate-500">{certData.chemistry.c.spec}</td>
                    <td className="border border-slate-300 p-1 text-slate-500">{certData.chemistry.mn.spec}</td>
                    <td className="border border-slate-300 p-1 text-slate-500">{certData.chemistry.si.spec}</td>
                    <td className="border border-slate-300 p-1 text-slate-500">{certData.chemistry.cr.spec}</td>
                    <td className="border border-slate-300 p-1 text-slate-500">{certData.chemistry.ni.spec}</td>
                    <td className="border border-slate-300 p-1 text-slate-500">{certData.chemistry.mo.spec}</td>
                    <td className="border border-slate-300 p-1 text-slate-500">{certData.chemistry.s.spec}</td>
                    <td className="border border-slate-300 p-1 text-slate-500">{certData.chemistry.p.spec}</td>
                  </tr>
                  <tr className="bg-orange-50/50 font-bold text-slate-900">
                    <td className="border border-slate-300 p-1 text-orange-700">Actual (MTC)</td>
                    <td className="border border-slate-300 p-1">{certData.chemistry.c.actual}</td>
                    <td className="border border-slate-300 p-1">{certData.chemistry.mn.actual}</td>
                    <td className="border border-slate-300 p-1">{certData.chemistry.si.actual}</td>
                    <td className="border border-slate-300 p-1">{certData.chemistry.cr.actual}</td>
                    <td className="border border-slate-300 p-1">{certData.chemistry.ni.actual}</td>
                    <td className="border border-slate-300 p-1">{certData.chemistry.mo.actual}</td>
                    <td className="border border-slate-300 p-1">{certData.chemistry.s.actual}</td>
                    <td className="border border-slate-300 p-1">{certData.chemistry.p.actual}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. Process Cycle (Target vs Actual) */}
        <div className="relative z-10 mt-4">
          <div className="bg-slate-100 px-3 py-1 font-bold text-xs text-slate-800 border-l-4 border-slate-900 uppercase">
            3. Heat Treatment Process & Cycle Parameters (Target vs Actual)
          </div>
          <div className="p-3 border border-slate-200 rounded-b text-xs space-y-2">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
              <div><span className="text-slate-500 font-semibold">Furnace Used:</span> <strong>{certData.furnaceId}</strong></div>
              <div><span className="text-slate-500 font-semibold">Approved Recipe:</span> <strong className="font-mono">{certData.recipeCode} ({certData.recipeRevision})</strong></div>
            </div>

            <table className="w-full text-[11px] text-center border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700">
                  <th className="border border-slate-300 p-1 text-left pl-2">Operation Stage</th>
                  <th className="border border-slate-300 p-1">Target Temp</th>
                  <th className="border border-slate-300 p-1">Actual Temp</th>
                  <th className="border border-slate-300 p-1">Target Soak</th>
                  <th className="border border-slate-300 p-1">Actual Soak</th>
                  <th className="border border-slate-300 p-1 text-left pl-2">Atmosphere / Medium</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-1 font-semibold text-left pl-2">Hardening / Soaking</td>
                  <td className="border border-slate-300 p-1">{certData.cycle.hardeningTargetTemp}</td>
                  <td className="border border-slate-300 p-1 font-bold text-orange-600">{certData.cycle.hardeningActualTemp}</td>
                  <td className="border border-slate-300 p-1">{certData.cycle.hardeningTargetSoak}</td>
                  <td className="border border-slate-300 p-1 font-bold">{certData.cycle.hardeningActualSoak}</td>
                  <td className="border border-slate-300 p-1 text-left pl-2">{certData.cycle.atmosphere}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 font-semibold text-left pl-2">Quenching Stage</td>
                  <td className="border border-slate-300 p-1">{certData.cycle.quenchTargetTemp}</td>
                  <td className="border border-slate-300 p-1 font-bold">{certData.cycle.quenchActualTemp}</td>
                  <td className="border border-slate-300 p-1">15 min</td>
                  <td className="border border-slate-300 p-1 font-bold">{certData.cycle.quenchTime}</td>
                  <td className="border border-slate-300 p-1 text-left pl-2">{certData.cycle.quenchMedium}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 font-semibold text-left pl-2">Tempering Cycle</td>
                  <td className="border border-slate-300 p-1">{certData.cycle.temperingTargetTemp}</td>
                  <td className="border border-slate-300 p-1 font-bold">{certData.cycle.temperingActualTemp}</td>
                  <td className="border border-slate-300 p-1">{certData.cycle.temperingTargetTime}</td>
                  <td className="border border-slate-300 p-1 font-bold">{certData.cycle.temperingActualTime}</td>
                  <td className="border border-slate-300 p-1 text-left pl-2">{certData.cycle.coolingMethod}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Mechanical, Case Depth & Metallurgical Test Results */}
        <div className="relative z-10 mt-4">
          <div className="bg-slate-100 px-3 py-1 font-bold text-xs text-slate-800 border-l-4 border-slate-900 uppercase">
            4. Mechanical, Case Depth & Metallurgical Inspection Results
          </div>
          <div className="p-3 border border-slate-200 rounded-b text-xs">
            <table className="w-full text-[11px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 text-center">
                  <th className="border border-slate-300 p-1 text-left pl-2">Test Parameter</th>
                  <th className="border border-slate-300 p-1">Customer / Drawing Specification</th>
                  <th className="border border-slate-300 p-1">Observed Test Results</th>
                  <th className="border border-slate-300 p-1 w-20">Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-1 font-semibold pl-2">Surface Hardness (HRC)</td>
                  <td className="border border-slate-300 p-1 text-center font-mono">{certData.hardness.specifiedRange}</td>
                  <td className="border border-slate-300 p-1 text-center font-bold">
                    Pts: 60.5, 60.2, 60.8, 60.4, 60.6 (Average: {certData.hardness.average})
                  </td>
                  <td className="border border-slate-300 p-1 text-center font-bold text-emerald-700 bg-emerald-50">PASS</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 font-semibold pl-2">Core Hardness (HRC)</td>
                  <td className="border border-slate-300 p-1 text-center font-mono">{certData.hardness.coreSpecified}</td>
                  <td className="border border-slate-300 p-1 text-center font-bold">{certData.hardness.coreActual}</td>
                  <td className="border border-slate-300 p-1 text-center font-bold text-emerald-700 bg-emerald-50">PASS</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 font-semibold pl-2">Effective Case Depth (ECD)</td>
                  <td className="border border-slate-300 p-1 text-center font-mono">{certData.caseDepth.effectiveRange} @ 50 HRC</td>
                  <td className="border border-slate-300 p-1 text-center font-bold">{certData.caseDepth.effectiveActual} (Vickers HV0.5 Traverse)</td>
                  <td className="border border-slate-300 p-1 text-center font-bold text-emerald-700 bg-emerald-50">PASS</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 font-semibold pl-2">Total Case Depth (TCD)</td>
                  <td className="border border-slate-300 p-1 text-center text-slate-500">Informative</td>
                  <td className="border border-slate-300 p-1 text-center">{certData.caseDepth.totalCaseDepth}</td>
                  <td className="border border-slate-300 p-1 text-center font-bold text-emerald-700 bg-emerald-50">PASS</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 font-semibold pl-2">Microstructure (ASTM E3)</td>
                  <td className="border border-slate-300 p-1 text-center">Tempered Martensite + Fine Carbides</td>
                  <td className="border border-slate-300 p-1 text-center text-[10px]">{certData.metallography.microstructure}</td>
                  <td className="border border-slate-300 p-1 text-center font-bold text-emerald-700 bg-emerald-50">PASS</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 font-semibold pl-2">Austenitic Grain Size</td>
                  <td className="border border-slate-300 p-1 text-center font-mono">ASTM 6 to 8</td>
                  <td className="border border-slate-300 p-1 text-center font-bold">{certData.metallography.grainSize}</td>
                  <td className="border border-slate-300 p-1 text-center font-bold text-emerald-700 bg-emerald-50">PASS</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 font-semibold pl-2">Retained Austenite %</td>
                  <td className="border border-slate-300 p-1 text-center font-mono">Max 15.0 %</td>
                  <td className="border border-slate-300 p-1 text-center font-bold">{certData.metallography.retainedAustenite}</td>
                  <td className="border border-slate-300 p-1 text-center font-bold text-emerald-700 bg-emerald-50">PASS</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 font-semibold pl-2">Decarburization Depth</td>
                  <td className="border border-slate-300 p-1 text-center font-mono">Nil / Max 0.05 mm</td>
                  <td className="border border-slate-300 p-1 text-center font-bold">{certData.metallography.decarburization}</td>
                  <td className="border border-slate-300 p-1 text-center font-bold text-emerald-700 bg-emerald-50">PASS</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 font-semibold pl-2">Crack & Distortion Check</td>
                  <td className="border border-slate-300 p-1 text-center">Crack-free & Runout &lt; 0.05 mm</td>
                  <td className="border border-slate-300 p-1 text-center">{certData.metallography.crackInspection}</td>
                  <td className="border border-slate-300 p-1 text-center font-bold text-emerald-700 bg-emerald-50">PASS</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. NABL/ISO Conformity Statement & Sign-Off */}
        <div className="relative z-10 mt-5 border border-slate-300 rounded p-3 bg-slate-50 flex items-center justify-between gap-4">
          {/* QR Code */}
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white border border-slate-300 rounded shadow-sm">
              <QrCode className="h-14 w-14 text-slate-900" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Digital Verification QR</span>
              <p className="text-[10px] text-slate-600 max-w-[280px] leading-tight">
                Scan to verify genuine digital certificate against MATHEAT immutable batch records.
                Certified in accordance with ISO 9001:2015 & IATF 16949 requirements.
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex items-center gap-8 text-center text-xs">
            <div>
              <div className="w-32 border-b border-slate-400 pb-1 font-mono font-bold text-slate-900 text-[11px]">
                {certData.inspector}
              </div>
              <span className="text-[9px] text-slate-500 block uppercase mt-0.5">QA Inspector</span>
            </div>

            <div>
              <div className="w-36 border-b border-slate-400 pb-1 font-mono font-bold text-slate-900 text-[11px]">
                {certData.approver}
              </div>
              <span className="text-[9px] text-slate-500 block uppercase mt-0.5">Head Quality & Metallurgy</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

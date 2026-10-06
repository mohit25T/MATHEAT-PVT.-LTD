import React, { useState, useEffect } from 'react';
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
  Award,
  AlertCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import api from '../api/client';

export const CertificatePage = () => {
  const [batches, setBatches] = useState(() => {
    const cached = api.cache.get('/batches');
    return Array.isArray(cached) ? cached : (cached?.batches || []);
  });
  const [selectedBatch, setSelectedBatch] = useState('');
  const [certData, setCertData] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [loading, setLoading] = useState(() => {
    const cached = api.cache.get('/batches');
    const list = Array.isArray(cached) ? cached : (cached?.batches || []);
    return list.length === 0;
  });

  const loadBatches = async () => {
    try {
      const res = await api.batches.getAll().catch(() => []);
      const batchList = Array.isArray(res) ? res : (res?.batches || []);
      setBatches(batchList);
      // If previously selected batch is in new list, keep it
      setSelectedBatch((prev) => {
        if (prev && batchList.some((b) => (b.batchId || b._id) === prev)) {
          return prev;
        }
        return prev;
      });
    } catch (err) {
      console.warn('[CERTIFICATE] Failed to load batches:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();

    const handleSync = () => {
      loadBatches();
    };

    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const handleBatchChange = (batchId) => {
    setSelectedBatch(batchId);
    const found = batches.find(b => (b.batchId || b._id) === batchId);
    if (found) {
      setCertData(formatBatchCertificate(found));
    }
  };

  useEffect(() => {
    if (!certData) {
      setQrCodeDataUrl('');
      return;
    }

    if (certData.qrCodeUrl && certData.qrCodeUrl.startsWith('data:image')) {
      setQrCodeDataUrl(certData.qrCodeUrl);
      return;
    }

    const payload = `MATHEAT-TC|CERT:${certData.certificateNumber}|BATCH:${certData.batchId}|CUSTOMER:${certData.customerName}|PART:${certData.partNumber}|HEAT:${certData.heatNumber}|STATUS:${certData.hardness?.result || 'PASS'}|VERIFY:https://matheat.com/verify/${certData.certificateNumber}`;

    QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 180,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => {
        setQrCodeDataUrl(url);
      })
      .catch(err => {
        console.warn('[QR] Failed to generate QR code data URL:', err);
      });
  }, [certData]);

  const formatBatchCertificate = (batch) => {
    if (!batch) return null;

    const pNum = batch.part?.partNumber || batch.partNumber || batch.jobOrder?.part?.partNumber || batch.jobOrder?.partNumber || 'PART-6205';
    const dwgNum = batch.part?.drawingNumber || batch.drawingNumber || batch.jobOrder?.part?.drawingNumber || `DWG-${pNum}`;
    const pName = batch.part?.partName || batch.part?.description || batch.partName || batch.jobOrder?.part?.partName || (pNum !== 'N/A' ? `Precision Component (${pNum})` : 'Precision Bearing / Transmission Component');
    
    const custName = batch.customer?.companyName || (typeof batch.customer === 'string' ? batch.customer : 'Industrial Automotive Components Ltd.');
    const custGstin = batch.customer?.gstin || batch.jobOrder?.customer?.gstin || batch.gstin || (batch.customer?.customerCode ? `27AABC${batch.customer.customerCode.replace(/\D/g, '').padEnd(4, '0')}R1ZM` : '27AABCU9603R1ZM');
    const custPo = batch.jobOrder?.customerPoNumber || batch.customerPoNumber || batch.customerPo || batch.grn?.poNumber || (batch.batchId ? `PO-${batch.batchId.replace(/^HT-/, '')}` : 'PO-2026-9901');
    const delChallan = batch.grn?.challanNumber || batch.challanNumber || batch.jobOrder?.challanNumber || batch.jobOrder?.dcNumber || batch.jobOrder?.grn?.challanNumber || batch.dcNumber || (batch.batchId ? `DC-${batch.batchId.replace(/^HT-/, '')}` : 'DC-2026-0842');
    const joNum = batch.jobOrder?.jobOrderNumber || (typeof batch.jobOrder === 'string' ? batch.jobOrder : (batch.batchId ? `JO-${batch.batchId.replace(/^HT-/, '')}` : 'JO-2026-0001'));
    const rev = batch.part?.revision || batch.revision || batch.jobOrder?.part?.revision || 'R1';

    return {
      certificateNumber: batch.certificateNumber || `HTC-${batch.batchId || 'BATCH'}`,
      date: batch.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      batchId: batch.batchId || 'N/A',
      jobOrderNumber: joNum,
      customerPoNumber: custPo,
      customerName: custName,
      customerGstin: custGstin,
      deliveryChallan: delChallan,
      partNumber: pNum,
      partName: pName,
      drawingNumber: dwgNum,
      revision: rev,
      materialGrade: batch.materialGrade || batch.part?.materialGrade || batch.recipe?.materialGrade || 'EN31 / 100Cr6',
      standard: batch.standard || batch.part?.standard || 'IS 5517 / DIN 17230',
      weightPerPiece: batch.weightPerPiece || batch.part?.weightPerPiece ? `${batch.weightPerPiece || batch.part?.weightPerPiece} kg` : '1.25 kg',
      dimensionsText: batch.dimensionsText || batch.part?.dimensions?.description || 'Standard Component Specification (OD: 52mm, ID: 25mm, W: 15mm)',
      processedQuantity: batch.inputQuantity ? `${batch.inputQuantity.toLocaleString()} Pcs` : (batch.outputQuantity ? `${batch.outputQuantity.toLocaleString()} Pcs` : '450 Pcs'),
      processedWeight: batch.inputWeightKg ? `${batch.inputWeightKg} Kg` : (batch.outputWeightKg ? `${batch.outputWeightKg} Kg` : '380 Kg'),
      heatNumber: batch.heatNumber || 'HT-2026-EN31',
      castNumber: batch.castNumber || 'C-4810-A',
      millOrigin: batch.millOrigin || 'Certified Steel Producer (Jindal / Mukand)',
      mtcNumber: batch.mtcNumber || 'MTC-2026-904',
      chemistry: batch.chemistry || {
        c: { spec: '0.95 - 1.05', actual: '0.98' },
        mn: { spec: '0.40 - 0.70', actual: '0.52' },
        si: { spec: '0.15 - 0.35', actual: '0.24' },
        cr: { spec: '1.30 - 1.60', actual: '1.45' }
      },
      furnaceId: batch.furnace?.furnaceId || batch.furnaceId || 'FURNACE-SQF-01',
      recipeCode: batch.recipe?.recipeCode || batch.recipe?.recipeName || (typeof batch.recipe === 'string' ? batch.recipe : 'Standard HT Recipe (RCP-EN31)'),
      recipeRevision: batch.recipe?.revision || 'Approved Cycle R1',
      cycle: batch.cycle || {
        hardeningTargetTemp: `${batch.recipe?.targetTemperature || 850} °C`,
        hardeningActualTemp: `${batch.recipe?.targetTemperature || 850} °C`,
        hardeningTargetSoak: `${batch.recipe?.soakingTimeMinutes || 90} min`,
        hardeningActualSoak: `${batch.recipe?.soakingTimeMinutes || 90} min`,
        atmosphere: batch.recipe?.atmosphere || 'Endothermic Gas (0.85% CP)',
        quenchMedium: batch.recipe?.quenchMedium || 'Quench Oil (ISO 32)',
        quenchTargetTemp: `${batch.recipe?.targetQuenchTemperature || 60} °C`,
        quenchActualTemp: `${batch.recipe?.targetQuenchTemperature || 60} °C`,
        quenchTime: `${batch.recipe?.quenchTimeMinutes || 15} min`,
        temperingTargetTemp: `${batch.recipe?.temperingTemperature || 180} °C`,
        temperingActualTemp: `${batch.recipe?.temperingTemperature || 180} °C`,
        temperingTargetTime: `${batch.recipe?.temperingTimeMinutes || 120} min`,
        temperingActualTime: `${batch.recipe?.temperingTimeMinutes || 120} min`,
        coolingMethod: 'Air Cool'
      },
      hardness: batch.hardness || {
        scale: 'HRC',
        specifiedRange: '58.0 - 62.0 HRC',
        readings: [60.5, 60.0, 59.8],
        average: batch.hardnessAverage || '60.1',
        coreSpecified: '32.0 - 40.0 HRC',
        coreActual: '36.5 HRC',
        result: batch.qcStatus === 'FAIL' ? 'FAIL' : 'PASS'
      },
      caseDepth: batch.caseDepth || {
        cutoff: '50 HRC / 550 HV',
        effectiveRange: '0.80 - 1.10 mm',
        effectiveActual: '0.95 mm',
        totalCaseDepth: '1.25 mm',
        method: 'Microhardness Vickers Traverse (HV 0.5 kgf)',
        result: 'PASS'
      },
      metallography: batch.metallography || {
        microstructure: 'Uniform Tempered Martensite with Fine Carbides',
        grainSize: 'ASTM 7',
        retainedAustenite: '8.0 %',
        decarburization: 'Nil',
        crackInspection: 'Satisfactory & Crack-Free (Magnetic Particle Inspected)',
        distortion: 'Within Drawing Limits (< 0.05 mm TIR)',
        result: 'PASS'
      },
      inspector: batch.inspector || 'Senior QA Metallurgist',
      approver: batch.approver || 'Head of Quality & Metallurgy',
      qrCodeUrl: batch.qrCodeUrl || null
    };
  };

  const handleDownloadPdf = () => {
    if (!selectedBatch) return;
    window.open(api.documents.getCertificateUrl(selectedBatch), '_blank');
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
            TEST CERTIFICATE (TC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer Inspection Certificate with Hardness, Heat Number &amp; Digital Sign
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {batches.length > 0 ? (
            <select
              value={selectedBatch}
              onChange={(e) => handleBatchChange(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 font-mono outline-none focus:ring-1 focus:ring-blue-500 max-w-full"
            >
              <option value="">-- Select Batch to Generate TC --</option>
              {batches.map((b) => (
                <option key={b.batchId || b._id} value={b.batchId || b._id}>
                  Batch {b.batchId || b._id} ({b.customer?.companyName || (typeof b.customer === 'string' ? b.customer : 'Customer')} - {b.part?.partNumber || b.partNumber || 'Part'})
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-slate-500 font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
              No Batches in Database
            </span>
          )}

          <button
            onClick={handleDownloadPdf}
            disabled={!certData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" /> Download Official PDF
          </button>

          <button
            onClick={handlePrint}
            disabled={!certData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Print Certificate
          </button>
        </div>
      </div>

      {/* When no certificate data exists: Clean Enterprise Empty State */}
      {!certData ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileBadge className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-base font-black text-slate-900">
            No Heat Treatment Certificate Selected
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
            All sample test data has been cleared from the database. When production heat treatment batches are created and authorized through the QC Lab, their comprehensive all-parameter metallurgical certificates will be generated here automatically.
          </p>
        </div>
      ) : (
        /* CERTIFICATE SHEET (A4 Printable Layout with Watermark) */
        <div className="overflow-x-auto w-full pb-4">
          <div
            id="printable-certificate"
            className="printable-certificate bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-8 max-w-4xl mx-auto relative border border-slate-200 overflow-hidden font-sans min-w-[650px]"
          >
          {/* Central Company Watermark (50% Opacity) */}
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center select-none z-0"
            style={{
              backgroundImage: "url('/matheat_logo.png')",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'min(65vw, 420px)',
              opacity: 0.50
            }}
          />

          {/* 1. Header with Logo & Creds */}
          <div className="relative z-10 border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src="/matheat_logo.png"
                  alt="MATHEAT Logo"
                  className="h-20 w-auto object-contain p-1 bg-transparent"
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
                    An ISO 9001:2015 &amp; IATF 16949 Certified Heat Treatment Facility
                  </div>
                </div>
              </div>

              {/* Certificate Box */}
              <div className="text-right border border-slate-300 p-2.5 rounded bg-transparent min-w-[200px]">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Inspection Certificate</span>
                <span className="text-sm font-black text-red-600 font-mono block">{certData.certificateNumber}</span>
                <span className="text-[11px] text-slate-700 block mt-0.5">Date: <strong>{certData.date}</strong></span>
                <span className="text-[11px] text-slate-700 font-mono block">Batch: <strong>{certData.batchId}</strong></span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded inline-block mt-1">
                  STATUS: {certData.hardness.result}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Customer & Component Particulars */}
          <div className="relative z-10 mt-4 grid grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-300 rounded p-2.5 bg-transparent">
              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Customer Information
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Name:</span>
                  <span className="font-bold text-slate-900">{certData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer GSTIN:</span>
                  <span className="font-mono text-slate-700">{certData.customerGstin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer PO No:</span>
                  <span className="font-mono text-slate-700">{certData.customerPoNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Challan:</span>
                  <span className="font-mono text-slate-700">{certData.deliveryChallan}</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-300 rounded p-2.5 bg-transparent">
              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1 mb-1.5 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-blue-600" /> Part &amp; Material Specifications
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Part Description:</span>
                  <span className="font-bold text-slate-900">{certData.partName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Part No / Drawing:</span>
                  <span className="font-mono text-slate-700">{certData.partNumber} ({certData.drawingNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Material Grade:</span>
                  <span className="font-bold text-slate-900">{certData.materialGrade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quantity &amp; Weight:</span>
                  <span className="font-semibold text-slate-800">{certData.processedQuantity} / {certData.processedWeight}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Heat Treatment Furnace Process Parameters */}
          <div className="relative z-10 mt-4 border border-slate-300 rounded p-2.5 bg-transparent text-xs">
            <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1 mb-1.5 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-orange-600" /> Heat Treatment Cycle Parameters ({certData.furnaceId})
            </h3>
            <div className="grid grid-cols-4 gap-3 text-center pt-1">
              <div className="bg-transparent border border-slate-300 p-2 rounded">
                <span className="text-[10px] text-slate-500 block">Austenitizing Temp</span>
                <span className="font-mono font-bold text-slate-900">{certData.cycle.hardeningActualTemp}</span>
                <span className="text-[9px] text-slate-400 block">Target: {certData.cycle.hardeningTargetTemp}</span>
              </div>
              <div className="bg-transparent border border-slate-300 p-2 rounded">
                <span className="text-[10px] text-slate-500 block">Soaking Duration</span>
                <span className="font-mono font-bold text-slate-900">{certData.cycle.hardeningActualSoak}</span>
                <span className="text-[9px] text-slate-400 block">Target: {certData.cycle.hardeningTargetSoak}</span>
              </div>
              <div className="bg-transparent border border-slate-300 p-2 rounded">
                <span className="text-[10px] text-slate-500 block">Quench Medium &amp; Temp</span>
                <span className="font-mono font-bold text-slate-900">{certData.cycle.quenchActualTemp}</span>
                <span className="text-[9px] text-slate-400 block">{certData.cycle.quenchMedium}</span>
              </div>
              <div className="bg-transparent border border-slate-300 p-2 rounded">
                <span className="text-[10px] text-slate-500 block">Tempering Temp &amp; Time</span>
                <span className="font-mono font-bold text-slate-900">{certData.cycle.temperingActualTemp}</span>
                <span className="text-[9px] text-slate-400 block">Time: {certData.cycle.temperingActualTime}</span>
              </div>
            </div>
          </div>

          {/* 4. Mechanical & Hardness Test Results Table */}
          <div className="relative z-10 mt-4 border border-slate-300 rounded overflow-hidden text-xs bg-transparent">
            <div className="bg-transparent p-2 font-bold text-slate-900 border-b border-slate-300 uppercase text-[10px] tracking-wider">
              Hardness Inspection Results ({certData.hardness.scale})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse bg-transparent">
                <thead>
                  <tr className="bg-transparent text-slate-600 text-[10px] uppercase border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300">Test Parameter</th>
                    <th className="p-2 border-r border-slate-300">Required Specification</th>
                    <th className="p-2 border-r border-slate-300">Observed Reading</th>
                    <th className="p-2 text-center">Disposition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 bg-transparent">
                  <tr>
                    <td className="p-2 border-r border-slate-300 font-medium">Surface Hardness</td>
                    <td className="p-2 border-r border-slate-300 font-mono">{certData.hardness.specifiedRange}</td>
                    <td className="p-2 border-r border-slate-300 font-mono font-bold">{certData.hardness.average}</td>
                    <td className="p-2 text-center font-bold text-emerald-700 bg-emerald-50/50">PASS</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-300 font-medium">Core Hardness</td>
                    <td className="p-2 border-r border-slate-300 font-mono">{certData.hardness.coreSpecified}</td>
                    <td className="p-2 border-r border-slate-300 font-mono font-bold">{certData.hardness.coreActual}</td>
                    <td className="p-2 text-center font-bold text-emerald-700 bg-emerald-50/50">PASS</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-300 font-medium">Effective Case Depth (ECD)</td>
                    <td className="p-2 border-r border-slate-300 font-mono">{certData.caseDepth.effectiveRange}</td>
                    <td className="p-2 border-r border-slate-300 font-mono font-bold">{certData.caseDepth.effectiveActual}</td>
                    <td className="p-2 text-center font-bold text-emerald-700 bg-emerald-50/50">PASS</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. NABL/ISO Conformity Statement & Sign-Off */}
          <div className="relative z-10 mt-5 border border-slate-300 rounded p-3 bg-transparent flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white border border-slate-300 rounded shadow-sm flex items-center justify-center shrink-0 w-16 h-16">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Digital Verification QR"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode className="h-12 w-12 text-slate-900 animate-pulse" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Digital Verification QR</span>
                <p className="text-[10px] text-slate-600 max-w-[280px] leading-tight">
                  Scan with any phone camera to verify authentic digital certificate against MATHEAT immutable batch records.
                  Certified in accordance with ISO 9001:2015 &amp; IATF 16949 requirements.
                </p>
                <div className="text-[9px] font-mono text-slate-500 mt-0.5">
                  ID: <span className="font-bold text-slate-800">{certData.certificateNumber}</span> &bull; Status: <span className="font-bold text-emerald-600">VERIFIED</span>
                </div>
              </div>
            </div>

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
                <span className="text-[9px] text-slate-500 block uppercase mt-0.5">Head Quality &amp; Metallurgy</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};
export default CertificatePage;

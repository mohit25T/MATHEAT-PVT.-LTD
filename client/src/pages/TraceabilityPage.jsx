import React, { useState, useEffect } from 'react';
import {
  SearchCode,
  Search,
  Package,
  Layers,
  Flame,
  CheckCircle2,
  FileBadge,
  Truck,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const TraceabilityPage = ({ initialQuery = 'H-45872' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeSearch, setActiveSearch] = useState(initialQuery);

  // Pre-loaded realistic 360-degree traceability records for H-45872
  const treeData = {
    heatNumber: 'H-45872',
    materialGrade: 'EN31 / 100Cr6',
    millOrigin: 'JSW Steel Ltd. (Special Steel Plant)',
    castNumber: 'C-9021-B',
    inward: {
      grnNumber: 'GRN-2026-0001',
      date: '12-Sep-2026',
      ownership: 'CUSTOMER OWNED',
      challanNumber: 'DC-SKF-8921',
      receivedWeight: '840 kg (3,000 Pcs)',
      storageLocation: 'CUSTOMER-BAY-SKF-01',
      inspectedBy: 'Anil Deshmukh (Store Manager)'
    },
    customer: {
      name: 'SKF India Bearings Ltd.',
      customerCode: 'CUST-SKF',
      gstin: '27AAACS1900K1Z9'
    },
    part: {
      partNumber: '6205-BRG-RING',
      partName: '6205 Deep Groove Ball Bearing Outer Ring',
      drawingNumber: 'DWG-6205-RevB (R1)',
      weightPerPiece: '0.28 kg',
      requiredHardness: '58 - 62 HRC',
      requiredCaseDepth: '0.80 - 1.10 mm'
    },
    jobOrder: {
      jobOrderNumber: 'JO-2026-0001',
      customerPo: 'PO-SKF-2026-901',
      targetQuantity: '1,500 Pcs (420 kg)',
      status: 'IN PRODUCTION'
    },
    batch: {
      batchId: 'HT-2026-000124',
      furnaceId: 'F-01 (Sealed Quench Furnace SQF-01)',
      recipe: 'RCP-EN31-6205 (Rev V1 Approved)',
      operator: 'Ramesh Kumar (OP-104)',
      loadedWeight: '420 kg (1,500 Pcs)',
      status: 'QC_APPROVED',
      productionDate: '15-Sep-2026'
    },
    cycle: {
      cycleId: 'FC-2026-0001',
      hardeningTemp: '852 °C (Target: 850 °C)',
      soakTime: '92 min (Target: 90 min)',
      atmosphere: 'Endothermic Gas (0.91% CP)',
      quenchTemp: '62 °C in ISO 32 Quench Oil',
      temperingTemp: '182 °C (120 min Soak)'
    },
    qc: {
      inspectionId: 'QC-2026-0001',
      status: 'PASS',
      surfaceHardness: '60.5 HRC (Spec: 58-62 HRC)',
      coreHardness: '35.8 HRC (Spec: 32-40 HRC)',
      caseDepth: '0.94 mm (Spec: 0.80-1.10 mm)',
      metallography: 'Tempered Martensite + Fine Carbides (ASTM 7 Grain)',
      approvedBy: 'Er. Rajesh Sharma (QC Manager)'
    },
    certificate: {
      certificateNumber: 'HTC-HT-2026-000124',
      status: 'CERTIFIED (NABL / ISO 9001)'
    },
    dispatch: {
      dispatchNumber: 'DSP-2026-0001',
      date: '16-Sep-2026',
      vehicle: 'MH-20-DE-4412 (V-Trans Express)',
      weight: '418.6 kg (1,495 Pcs)'
    },
    invoice: {
      invoiceNumber: 'INV-2026-0001',
      amount: '₹ 15,859 (Including 18% GST)',
      status: 'GENERATED'
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setActiveSearch(query.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow">
        <div className="flex items-center gap-2">
          <SearchCode className="h-6 w-6 text-orange-500" />
          <h1 className="text-lg font-black text-white">
            SINGLE-SCREEN 360° COMPLETE TRACEABILITY MATRIX
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Instant multi-dimensional audit: Trace from raw steel heat number through furnace cycles, QC tests, to final customer invoice.
        </p>

        <form onSubmit={handleSearch} className="mt-4 flex gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Raw Heat No (e.g. H-45872), Batch ID, Customer PO, Invoice..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold shadow-md transition-all"
          >
            Trace Journey
          </button>
        </form>

        <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Quick Samples:</span>
          <button onClick={() => { setQuery('H-45872'); setActiveSearch('H-45872'); }} className="text-orange-400 hover:underline font-mono">
            Heat H-45872
          </button>
          <span>&bull;</span>
          <button onClick={() => { setQuery('HT-2026-000125'); setActiveSearch('HT-2026-000125'); }} className="text-orange-400 hover:underline font-mono">
            Batch HT-2026-000125
          </button>
          <span>&bull;</span>
          <button onClick={() => { setQuery('PO-SKF-2026-901'); setActiveSearch('PO-SKF-2026-901'); }} className="text-orange-400 hover:underline font-mono">
            PO-SKF-2026-901
          </button>
        </div>
      </div>

      {/* Traceability Journey Visual Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Traced Heat Number</span>
              <span className="font-mono text-base font-black text-red-400 bg-red-950/30 px-2.5 py-0.5 rounded border border-red-500/40">
                {treeData.heatNumber}
              </span>
              <span className="text-xs font-bold text-slate-300 font-mono">
                &bull; Grade: <span className="text-blue-400">{treeData.materialGrade}</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Cast No: <strong className="text-slate-300 font-mono">{treeData.castNumber}</strong> &bull; Origin: {treeData.millOrigin}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
              <CheckCircle2 className="h-4 w-4" /> 100% UNBROKEN LINEAGE
            </span>
          </div>
        </div>

        {/* 10-Stage Horizontal Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Stage 1: Inward & Customer */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl relative hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-orange-400 mb-2">
              <span>1. MATERIAL INWARD (GRN)</span>
              <Package className="h-4 w-4 text-orange-400" />
            </div>
            <div className="font-mono font-bold text-white text-xs">{treeData.inward.grnNumber}</div>
            <div className="text-[11px] text-slate-300 mt-1">Challan: {treeData.inward.challanNumber}</div>
            <div className="text-[11px] text-slate-400 mt-1">Weight: {treeData.inward.receivedWeight}</div>
            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-semibold">
              {treeData.inward.ownership} &bull; {treeData.customer.name}
            </div>
          </div>

          {/* Stage 2: Job Order */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl relative hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-blue-400 mb-2">
              <span>2. JOB WORK ORDER</span>
              <Layers className="h-4 w-4 text-blue-400" />
            </div>
            <div className="font-mono font-bold text-white text-xs">{treeData.jobOrder.jobOrderNumber}</div>
            <div className="text-[11px] text-slate-300 mt-1">PO: {treeData.jobOrder.customerPo}</div>
            <div className="text-[11px] text-slate-400 mt-1">Target: {treeData.jobOrder.targetQuantity}</div>
            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-blue-300">
              Part: {treeData.part.partNumber} ({treeData.part.drawingNumber})
            </div>
          </div>

          {/* Stage 3: Furnace Execution & Recipe */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl relative hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-2">
              <span>3. FURNACE & CYCLE</span>
              <Flame className="h-4 w-4 text-amber-400" />
            </div>
            <div className="font-mono font-bold text-white text-xs">{treeData.batch.batchId}</div>
            <div className="text-[11px] text-slate-300 mt-1">{treeData.batch.furnaceId}</div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Temp: {treeData.cycle.hardeningTemp}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-amber-300">
              Recipe: {treeData.batch.recipe}
            </div>
          </div>

          {/* Stage 4: Quality & Certificate */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl relative hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-2">
              <span>4. QC LAB & CERTIFICATE</span>
              <FileBadge className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="font-mono font-bold text-white text-xs">{treeData.qc.inspectionId} &bull; PASS</div>
            <div className="text-[11px] text-emerald-400 font-bold mt-1">
              Hardness: {treeData.qc.surfaceHardness}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">ECD: {treeData.qc.caseDepth}</div>
            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-emerald-300 font-mono">
              Cert: {treeData.certificate.certificateNumber}
            </div>
          </div>

        </div>

        {/* Detailed Breakdown Box */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-orange-500" />
            Complete Audit Timeline for Heat {treeData.heatNumber}
          </h3>

          <div className="relative pl-6 border-l-2 border-slate-800 space-y-4 text-xs">
            {/* Step 1 */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-orange-600 border-2 border-slate-900"></span>
              <div className="font-bold text-slate-200">Material Inward at Weighbridge & Stores</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Received 840 kg of EN31 from JSW Special Steel on 12-Sep-2026 under Challan DC-SKF-8921. MTC verified and stamped for Heat H-45872. Chemical specs within standard.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-blue-600 border-2 border-slate-900"></span>
              <div className="font-bold text-slate-200">Production Loading into Furnace F-01</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Batch HT-2026-000124 created for 1,500 pcs (420 kg). Furnace load checked: 420 kg &le; 600 kg capacity (70% utilization). Operator Ramesh Kumar assigned.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-amber-600 border-2 border-slate-900"></span>
              <div className="font-bold text-slate-200">Furnace Cycle & Quenching Execution</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Heating to 852 °C, soaked for 92 min under 0.91% Carbon Potential atmosphere. Fast oil quenched at 62 °C, tempered at 182 °C for 120 min. All sensor telemetry recorded.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-emerald-600 border-2 border-slate-900"></span>
              <div className="font-bold text-slate-200">Metallurgical QC Inspection & Certificate Issued</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hardness test: 60.5 HRC (Pass). Case depth: 0.94 mm (Pass). Microstructure: Tempered Martensite with fine carbides (Pass). Signed off by Lead Metallurgist Er. Rajesh Sharma.
              </p>
            </div>

            {/* Step 5 */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-purple-600 border-2 border-slate-900"></span>
              <div className="font-bold text-slate-200">QC-Gated Dispatch & GST Invoicing</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                418.6 kg good components packed in wooden crates with VCI paper. Dispatched via vehicle MH-20-DE-4412 under Dispatch DSP-2026-0001. Tax Invoice INV-2026-0001 generated.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

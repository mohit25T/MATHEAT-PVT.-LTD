import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Send,
  X,
  FileCheck
} from 'lucide-react';
import { api } from '../api/client';

export const NcrPage = ({ onSelectTab }) => {
  const [ncrs, setNcrs] = useState(() => {
    const cached = api.cache.get('/ncr');
    return Array.isArray(cached?.data) ? cached.data : (Array.isArray(cached?.ncrs) ? cached.ncrs : (Array.isArray(cached) ? cached : []));
  });
  const [loading, setLoading] = useState(() => {
    const cached = api.cache.get('/ncr');
    const list = Array.isArray(cached?.data) ? cached.data : (Array.isArray(cached?.ncrs) ? cached.ncrs : (Array.isArray(cached) ? cached : []));
    return list.length === 0;
  });
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [selectedNcr, setSelectedNcr] = useState(null);
  const [dispositionData, setDispositionData] = useState({
    disposition: 'REWORK',
    rootCauseAnalysis: '',
    correctiveAction: '',
    preventiveAction: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchNcrs = async () => {
    try {
      setError(null);
      const res = await api.ncr.getAll();
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.ncrs) ? res.ncrs : (Array.isArray(res) ? res : []));
      setNcrs(list);
    } catch (err) {
      console.error('Error fetching NCRs:', err);
      setError(err?.message || 'Failed to load NCR register.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNcrs();

    const handleSync = () => {
      fetchNcrs();
    };

    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this NCR record?')) return;
    try {
      setActionError(null);
      await api.ncr.delete(id);
      setNcrs(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Error deleting NCR:', err);
      setActionError(err?.message || 'Failed to delete NCR record.');
    }
  };

  const handleOpenDisposition = (ncr) => {
    setSelectedNcr(ncr);
    setDispositionData({
      disposition: ncr.disposition && ncr.disposition !== 'PENDING' ? ncr.disposition : 'REWORK',
      rootCauseAnalysis: ncr.rootCauseAnalysis || ncr.rootCause || '',
      correctiveAction: ncr.correctiveAction || '',
      preventiveAction: ncr.preventiveAction || ''
    });
  };

  const handleSubmitDisposition = async (e) => {
    e.preventDefault();
    if (!selectedNcr) return;
    try {
      setSubmitting(true);
      setActionError(null);
      const res = await api.ncr.disposition(selectedNcr._id, dispositionData);
      setSelectedNcr(null);
      fetchNcrs();
    } catch (err) {
      console.error('Error updating NCR disposition:', err);
      setActionError(err?.message || 'Failed to submit disposition.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-500" />
            REJECTION &amp; REWORK
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Failed Batch Inspection, Root Cause &amp; Furnace Rework Routing
          </p>
        </div>
        <button
          onClick={fetchNcrs}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Action error banner */}
      {actionError && (
        <div className="p-3 bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs flex justify-between items-center">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Rework Preservation Notice */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/30 p-3.5 rounded-xl flex items-center gap-3 text-xs">
        <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
        <div className="text-slate-700 dark:text-slate-300">
          <strong className="text-red-600 dark:text-red-400">Strict Traceability Rule:</strong> When a batch fails QC, the original batch record is preserved permanently. A linked child rework batch (e.g. <span className="font-mono text-slate-900 dark:text-white">HT-2026-000120-R01</span>) is generated to track subsequent processing.
        </div>
      </div>

      {/* NCR Table or Clean Empty State */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Quality Non-Conformance Register
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {loading ? 'Loading...' : `${ncrs.length} NCRs`}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-red-500" />
            <p className="text-xs">Fetching quality non-conformance records...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400 text-xs">
            <p className="font-bold">Failed to load NCR records</p>
            <p className="mt-1 text-slate-500">{error}</p>
            <button
              onClick={fetchNcrs}
              className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : ncrs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Zero Non-Conformance Records (100% Nominal Compliance)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              All quality checks are in compliance. When any furnace batch violates metallurgical hardness or microstructure specs during lab inspection, a non-conformance docket will be initiated here with root cause and rework disposition.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {ncrs.map((n) => (
              <div key={n._id || n.ncrNumber} className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="font-mono font-bold text-red-600 dark:text-red-400 text-sm">{n.ncrNumber}</span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                      Batch: <strong className="text-slate-900 dark:text-white">{n.batchId || n.batch?.batchId || 'N/A'}</strong>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Heat No: <strong className="text-slate-700 dark:text-slate-300">{n.heatNumber || 'N/A'}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded uppercase">
                      {n.defectCategory?.replace('_', ' ') || 'NON-CONFORMANCE'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                      n.status === 'DISPOSITION_APPROVED'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                    }`}>
                      DISPOSITION: {n.disposition || 'PENDING'}
                    </span>
                    {n.status !== 'DISPOSITION_APPROVED' && (
                      <button
                        onClick={() => handleOpenDisposition(n)}
                        className="px-2.5 py-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      >
                        Set Disposition
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(n._id, e)}
                      title="Delete NCR"
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-800 dark:text-slate-200">
                  <strong>Defect Description:</strong> {n.defectDescription}
                </div>

                {(n.rootCauseAnalysis || n.rootCause || n.correctiveAction) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Root Cause Analysis</span>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5">{n.rootCauseAnalysis || n.rootCause || 'Pending analysis'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Corrective &amp; Preventive Action</span>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5">{n.correctiveAction || 'Pending action'}</p>
                    </div>
                  </div>
                )}

                {n.reworkBatchId && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400">Generated Linked Rework Batch:</span>
                      <strong className="font-mono text-orange-600 dark:text-orange-400">{n.reworkBatchId}</strong>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Affected Weight: <strong>{n.affectedWeightKg} kg ({n.affectedQuantity} pcs)</strong>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disposition Modal */}
      {selectedNcr && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-red-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Disposition Action: {selectedNcr.ncrNumber}
                </h3>
              </div>
              <button onClick={() => setSelectedNcr(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDisposition} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Choose Disposition Route:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${
                    dispositionData.disposition === 'REWORK' 
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 font-bold' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="disposition"
                      value="REWORK"
                      checked={dispositionData.disposition === 'REWORK'}
                      onChange={(e) => setDispositionData(prev => ({ ...prev, disposition: e.target.value }))}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span>REWORK (Generate Child Batch)</span>
                  </label>
                  <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${
                    dispositionData.disposition === 'SCRAP' 
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 font-bold' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="disposition"
                      value="SCRAP"
                      checked={dispositionData.disposition === 'SCRAP'}
                      onChange={(e) => setDispositionData(prev => ({ ...prev, disposition: e.target.value }))}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span>SCRAP (Divert to Scrap Yard)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Root Cause Analysis (5-Why / Metallurgical Findings):
                </label>
                <textarea
                  required
                  rows={2}
                  value={dispositionData.rootCauseAnalysis}
                  onChange={(e) => setDispositionData(prev => ({ ...prev, rootCauseAnalysis: e.target.value }))}
                  placeholder="e.g. Quench oil temperature exceeded 65°C leading to incomplete martensitic transformation"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Corrective Action:
                </label>
                <textarea
                  required
                  rows={2}
                  value={dispositionData.correctiveAction}
                  onChange={(e) => setDispositionData(prev => ({ ...prev, correctiveAction: e.target.value }))}
                  placeholder="e.g. Repeat austenitizing at 860°C and fast quench in refreshed agitator oil"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preventive Action:
                </label>
                <textarea
                  rows={2}
                  value={dispositionData.preventiveAction}
                  onChange={(e) => setDispositionData(prev => ({ ...prev, preventiveAction: e.target.value }))}
                  placeholder="e.g. Calibrate quench tank heat exchanger flow rate every week"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedNcr(null)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  <FileCheck className="h-4 w-4" />
                  {submitting ? 'Submitting...' : 'Authorize Disposition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NcrPage;

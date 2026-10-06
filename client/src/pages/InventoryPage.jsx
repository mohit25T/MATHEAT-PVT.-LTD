import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Building2,
  Trash2,
  History,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import api from '../api/client';

export const InventoryPage = () => {
  const [stockItems, setStockItems] = useState(() => {
    const cached = api.cache.get('/inventory');
    return cached?.items || (Array.isArray(cached) ? cached : []);
  });
  const [scrapItems, setScrapItems] = useState(() => {
    const cached = api.cache.get('/inventory');
    return cached?.scrap || [];
  });
  const [loading, setLoading] = useState(() => {
    const cached = api.cache.get('/inventory');
    const items = cached?.items || (Array.isArray(cached) ? cached : []);
    return items.length === 0;
  });

  const loadInventory = async () => {
    try {
      const res = await api.inventory.getAll().catch(() => ({ items: [], scrap: [] }));
      const items = res?.items || (Array.isArray(res) ? res : []);
      const scrap = res?.scrap || [];
      setStockItems(items);
      setScrapItems(scrap);
    } catch (err) {
      console.warn('[INVENTORY] Failed to fetch live stock:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();

    const handleSync = () => {
      loadInventory();
    };

    window.addEventListener('matheat_data_invalidated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('matheat_data_invalidated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const totalCustomerStockKg = stockItems
    .filter(s => s.ownership === 'CUSTOMER' || s.ownership === 'CUSTOMER OWNED')
    .reduce((sum, s) => sum + (Number(s.weightKg) || 0), 0);

  const totalWipKg = stockItems
    .filter(s => s.status === 'WIP' || s.status === 'FURNACE' || s.status === 'HOLD')
    .reduce((sum, s) => sum + (Number(s.weightKg) || 0), 0);

  const totalScrapKg = scrapItems
    .reduce((sum, s) => sum + (Number(s.weightKg) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            Batch Inventory, Customer Stock &amp; Scrap Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Customer-owned stock reconciliation (Input = Good + Rejection + Scrap), Scrap tracking, and immutable stock transactions
          </p>
        </div>

        <button
          onClick={loadInventory}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stock
        </button>
      </div>

      {/* Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Customer-Owned Stock</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">{totalCustomerStockKg.toLocaleString()} kg</div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">Live Bay Stock</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Work In Progress (WIP)</span>
          <div className="text-2xl font-black text-orange-600 dark:text-orange-400 font-mono mt-1">{totalWipKg.toLocaleString()} kg</div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">Furnace Floor Loading</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Scrap Segregated</span>
          <div className="text-2xl font-black text-red-600 dark:text-red-400 font-mono mt-1">{totalScrapKg.toLocaleString()} kg</div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">Scrap Yard Total</span>
        </div>
      </div>

      {/* Active Stock Table or Empty State */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Current Floor Stock Inventory
          </h2>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{stockItems.length} Lots</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 text-orange-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading live inventory from database...</p>
          </div>
        ) : stockItems.length === 0 ? (
          <div className="p-10 text-center">
            <Boxes className="h-10 w-10 text-slate-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">No Customer Floor Stock</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Material inward receipts logged via the Gate or GRN page will allocate to storage bays here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Component</th>
                  <th className="p-3">Raw Heat Number</th>
                  <th className="p-3">Ownership &amp; Customer</th>
                  <th className="p-3">Available Weight / Qty</th>
                  <th className="p-3">Location</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                {stockItems.map((s, idx) => {
                  const customerDisplay = s.customerName || s.customer?.companyName || (typeof s.customer === 'string' ? s.customer : 'Customer Stock');
                  return (
                    <tr key={s._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{s.partNumber}</td>
                      <td className="p-3 font-mono">
                        <span className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-500/30 inline-block">
                          {s.heatNumber}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded inline-block mb-0.5">
                          {s.ownership}
                        </span>
                        <div className="font-semibold text-slate-800 dark:text-slate-300">{customerDisplay}</div>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="font-bold text-slate-900 dark:text-white block">{s.weightKg} kg</span>
                        <span className="text-[10px] text-slate-500">{s.quantity} pcs</span>
                      </td>
                      <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{s.location}</td>
                      <td className="p-3 text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scrap Inventory Table or Empty State */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-red-500" />
            Scrap Inventory (Thermal Shock &amp; Quench Rejection)
          </h2>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{scrapItems.length} Records</span>
        </div>

        {scrapItems.length === 0 ? (
          <div className="p-10 text-center">
            <Trash2 className="h-10 w-10 text-slate-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Scrap Yard Empty</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Zero scrap recorded. Any metallurgical test rejections or quench crack scrap will be tracked here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Scrap ID &amp; Batch</th>
                  <th className="p-3">Part Details</th>
                  <th className="p-3">Heat Number</th>
                  <th className="p-3">Weight &amp; Qty</th>
                  <th className="p-3">Rejection Reason</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                {scrapItems.map((sc) => (
                  <tr key={sc.scrapId || sc._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono">
                      <span className="font-bold text-red-600 dark:text-red-400 block">{sc.scrapId}</span>
                      <span className="text-[10px] text-slate-500">{sc.batchId || 'N/A'}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{sc.partNumber}</td>
                    <td className="p-3 font-mono text-red-600 dark:text-red-400">{sc.heatNumber}</td>
                    <td className="p-3 font-mono">
                      <span className="font-bold text-slate-900 dark:text-white block">{sc.weightKg} kg</span>
                      <span className="text-[10px] text-slate-500">{sc.quantity} pcs</span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{sc.reason}</td>
                    <td className="p-3 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded">
                        {sc.status || 'SCRAP'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default InventoryPage;

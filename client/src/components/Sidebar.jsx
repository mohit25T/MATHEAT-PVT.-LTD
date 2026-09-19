import React from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Flame,
  UserCheck,
  PackagePlus,
  ClipboardList,
  FlaskConical,
  Layers,
  FileBadge,
  AlertOctagon,
  Boxes,
  Truck,
  Receipt,
  Wrench,
  SearchCode,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { isLight } = useTheme();

  const navItems = [
    {
      group: 'OPERATIONS',
      items: [
        { id: 'dashboard', label: 'Industrial Dashboard', icon: LayoutDashboard },
        { id: 'furnaces', label: 'Furnace Status Board', icon: Flame, badge: '4 Units' },
        { id: 'operator', label: 'Operator Console', icon: UserCheck, highlight: true }
      ]
    },
    {
      group: 'JOB WORK & INWARD',
      items: [
        { id: 'grn', label: 'Material Inward (GRN)', icon: PackagePlus },
        { id: 'job-orders', label: 'Job Work Orders', icon: ClipboardList }
      ]
    },
    {
      group: 'HEAT TREATMENT MES',
      items: [
        { id: 'recipes', label: 'Recipe Studio (V1/V2)', icon: FlaskConical },
        { id: 'batches', label: 'Batches & Loading', icon: Layers }
      ]
    },
    {
      group: 'QUALITY & COMPLIANCE',
      items: [
        { id: 'qc-lab', label: 'QC Lab & Hardness', icon: FlaskConical },
        { id: 'certificates', label: 'All-Parameter Certificate', icon: FileBadge, highlight: true },
        { id: 'ncr', label: 'NCR & Rework (-R01)', icon: AlertOctagon }
      ]
    },
    {
      group: 'COMMERCIAL & TRACEABILITY',
      items: [
        { id: 'inventory', label: 'Batch Stock & Scrap', icon: Boxes },
        { id: 'commercial', label: 'Dispatch & Invoicing', icon: Truck },
        { id: 'tax-invoice', label: 'Official Tax Invoice', icon: Receipt, highlight: true },
        { id: 'maintenance', label: 'Maintenance & Calibration', icon: Wrench, alert: true },
        { id: 'traceability', label: '360° Traceability Matrix', icon: SearchCode, highlight: true },
        { id: 'masters', label: 'Master Data', icon: Users }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm no-print"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`border-r flex flex-col h-full shrink-0 z-30 transition-all duration-300 select-none no-print ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        } ${
          mobileOpen
            ? 'fixed inset-y-0 left-0 shadow-2xl flex'
            : 'hidden lg:flex'
        }`}
      >
        {/* Header Toggle */}
        <div className={`p-3 border-b flex items-center justify-between ${
          isLight ? 'border-slate-200' : 'border-slate-800/80'
        }`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2 px-1">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className={`text-[11px] font-bold uppercase tracking-wider font-mono ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                FACTORY NAVIGATION
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-lg transition-colors ${
              isCollapsed ? 'mx-auto' : ''
            } ${
              isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-orange-600" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4">
          {navItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed ? (
                <h3 className={`px-2.5 pt-1 text-[9px] font-bold tracking-[0.15em] uppercase font-mono ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {group.group}
                </h3>
              ) : (
                <div className={`h-px my-2 mx-1 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isThermal = group.group === 'OPERATIONS' || item.id === 'operator' || item.id === 'furnaces' || item.id === 'batches';
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (setMobileOpen) setMobileOpen(false);
                      }}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-2.5 py-2'
                      } text-xs font-medium rounded-lg transition-all relative group ${
                        isActive
                          ? isThermal
                            ? 'bg-orange-600 text-white font-semibold shadow-sm ring-1 ring-orange-500/50'
                            : 'bg-blue-600 text-white font-semibold shadow-sm ring-1 ring-blue-500/50'
                          : isLight
                          ? 'text-slate-700 hover:bg-blue-50/70 hover:text-blue-700'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive
                              ? 'text-white'
                              : isThermal || item.highlight
                              ? 'text-orange-600'
                              : isLight
                              ? 'text-blue-700 group-hover:text-blue-600'
                              : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="truncate text-left">{item.label}</span>
                        )}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white border-white/30'
                            : isLight
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-800/90 text-slate-300 border-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}

                      {!isCollapsed && item.alert && (
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping shrink-0"></span>
                      )}

                      {isActive && (
                        <span className="absolute left-0 inset-y-1 w-1 bg-white rounded-r"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t text-[11px] ${
          isLight
            ? 'border-slate-300 bg-slate-300/60 text-slate-700'
            : 'border-slate-800 bg-slate-950/60 text-slate-400'
        }`}>
          {!isCollapsed ? (
            <div>
              <div className="flex items-center justify-between text-[11px]">
                <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
                  MATHEAT MES
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  Online
                </span>
              </div>
              <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
                UNIFORM &bull; STRENGTH &bull; PRECISION
              </p>
            </div>
          ) : (
            <div className="flex justify-center" title="MATHEAT PVT. LTD.">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth, canAccess } from '../context/AuthContext';
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
  ChevronRight,
  Shield,
  ShoppingCart,
  X
} from 'lucide-react';


// ── ALL nav items with normal, simple everyday factory names ──
const ALL_NAV = [
  {
    group: 'OPERATIONS',
    items: [
      { id: 'dashboard',  label: 'Dashboard',             icon: LayoutDashboard },
      { id: 'furnaces',   label: 'Furnaces',              icon: Flame },
      { id: 'operator',   label: 'Operator Screen',       icon: UserCheck, highlight: true }
    ]
  },
  {
    group: 'GATE & ORDERS',
    items: [
      { id: 'gate-terminal', label: 'Gate Inward & Outward', icon: Truck, highlight: true, badge: 'CAM' },
      { id: 'sales',         label: 'Enquiry & Quotation',   icon: Receipt },
      { id: 'grn',           label: 'Material Inward',       icon: PackagePlus },
      { id: 'job-orders',    label: 'Customer Orders',       icon: ClipboardList }
    ]
  },
  {
    group: 'HEAT TREATMENT',
    items: [
      { id: 'recipes', label: 'Recipes',                  icon: FlaskConical },
      { id: 'batches', label: 'Batches',                  icon: Layers }
    ]
  },
  {
    group: 'QUALITY & TC',
    items: [
      { id: 'qc-lab',       label: 'Lab Testing',          icon: FlaskConical },
      { id: 'certificates', label: 'Test Certificate (TC)',icon: FileBadge, highlight: true },
      { id: 'ncr',          label: 'Rejection & Rework',   icon: AlertOctagon }
    ]
  },
  {
    group: 'PURCHASE & BILLING',
    items: [
      { id: 'purchase',     label: 'Purchase',             icon: ShoppingCart, highlight: true },
      { id: 'services',     label: 'Service Rates',        icon: Receipt, highlight: true },
      { id: 'inventory',    label: 'Stock',                icon: Boxes },
      { id: 'commercial',   label: 'Dispatch',             icon: Truck },
      { id: 'tax-invoice',  label: 'Invoices',             icon: Receipt },
      { id: 'maintenance',  label: 'Maintenance',          icon: Wrench, alert: true },
      { id: 'traceability', label: 'Part Tracking',        icon: SearchCode },
      { id: 'masters',      label: 'Masters',              icon: Users }
    ]
  }
];

export const Sidebar = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenGate,
  hideDesktop = false
}) => {
  const { isLight } = useTheme();
  const { user } = useAuth();

  // Filter nav groups/items by role permissions
  const navItems = ALL_NAV
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccess(user, item.id))
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm no-print"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`border-r flex flex-col h-full shrink-0 transition-all duration-300 select-none no-print ${
          mobileOpen
            ? 'fixed inset-y-0 left-0 w-64 sm:w-72 max-w-[85vw] shadow-2xl flex z-50'
            : hideDesktop
              ? 'hidden'
              : `${isCollapsed ? 'w-16' : 'w-64'} hidden lg:flex z-30`
        } ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header Toggle / Close */}
        <div className={`p-3 border-b flex items-center justify-between ${
          isLight ? 'border-slate-200' : 'border-slate-800/80'
        }`}>
          {(!isCollapsed || mobileOpen) && (
            <div className="flex items-center gap-2 px-1">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className={`text-[11px] font-bold uppercase tracking-wider font-mono ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                FACTORY NAVIGATION
              </span>
            </div>
          )}

          {mobileOpen ? (
            <button
              onClick={() => setMobileOpen(false)}
              className={`p-1.5 rounded-lg transition-colors ml-auto lg:hidden ${
                isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Close Navigation Menu"
            >
              <X className="h-4.5 w-4.5 text-rose-500" />
            </button>
          ) : (
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
          )}
        </div>

        {/* Role Badge */}
        {/* Role Badge */}
        {(!isCollapsed || mobileOpen) && user?.role && (
          <div className={`mx-3 mt-3 mb-1 px-2.5 py-1.5 rounded-lg border flex items-center gap-2 ${
            isLight
              ? 'bg-orange-50 border-orange-200 text-orange-800'
              : 'bg-orange-950/30 border-orange-900/50 text-orange-300'
          }`}>
            <Shield className="h-3 w-3 text-orange-600 shrink-0" />
            <div className="min-w-0">
              <div className="text-[9px] font-black uppercase tracking-widest text-orange-500">Access Role</div>
              <div className="text-[10px] font-bold font-mono truncate">
                {user.role.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4">
          {navItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {(!isCollapsed || mobileOpen) ? (
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
                        if (item.id === 'gate-terminal' && onOpenGate) {
                          onOpenGate();
                        } else {
                          setActiveTab(item.id);
                        }
                        if (setMobileOpen) setMobileOpen(false);
                      }}
                      title={isCollapsed && !mobileOpen ? item.label : undefined}
                      className={`w-full flex items-center ${
                        isCollapsed && !mobileOpen ? 'justify-center px-2 py-2.5' : 'justify-between px-2.5 py-2'
                      } text-xs rounded-lg transition-all relative group ${
                        isActive
                          ? isThermal
                            ? 'bg-orange-600 text-[#f8fafc] font-black shadow-sm ring-1 ring-orange-500/50'
                            : 'bg-blue-600 text-[#f8fafc] font-black shadow-sm ring-1 ring-blue-500/50'
                          : isLight
                          ? 'text-black font-bold hover:bg-[#e2e8f0] hover:text-blue-700'
                          : 'text-slate-200 hover:bg-slate-800 hover:text-white font-medium'
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
                        {(!isCollapsed || mobileOpen) && (
                          <span className="truncate text-left">{item.label}</span>
                        )}
                      </div>

                      {(!isCollapsed || mobileOpen) && item.badge && (
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
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping shrink-0" />
                      )}

                      {isActive && (
                        <span className="absolute left-0 inset-y-1 w-1 bg-white rounded-r" />
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
            ? 'border-slate-200 bg-slate-50 text-slate-700'
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
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

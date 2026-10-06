import React, { useState, useEffect, useCallback } from 'react';
import { canAccess, canAccessPortal, getDefaultTab, getDefaultPortal } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

// Page Imports
import { DashboardPage } from '../pages/DashboardPage';
import { FurnacesPage } from '../pages/FurnacesPage';
import { OperatorPage } from '../pages/OperatorPage';
import { GrnPage } from '../pages/GrnPage';
import { JobOrdersPage } from '../pages/JobOrdersPage';
import { RecipesPage } from '../pages/RecipesPage';
import { BatchesPage } from '../pages/BatchesPage';
import { QcLabPage } from '../pages/QcLabPage';
import { CertificatePage } from '../pages/CertificatePage';
import { NcrPage } from '../pages/NcrPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CommercialPage } from '../pages/CommercialPage';
import { MaintenancePage } from '../pages/MaintenancePage';
import { TraceabilityPage } from '../pages/TraceabilityPage';
import { MastersPage } from '../pages/MastersPage';
import { TaxInvoiceViewer } from '../components/TaxInvoiceViewer';
import { GateTerminalPage } from '../pages/GateTerminalPage';
import { PurchasePage } from '../pages/PurchasePage';
import { ServicesPage } from '../pages/ServicesPage';
import { SalesPage } from '../pages/SalesPage';

// =============================================================================
// CENTRALIZED FRONTEND ROUTE DEFINITIONS
// =============================================================================
export const ROUTES = [
  {
    id: 'sales',
    path: '/sales',
    title: 'Sales Pipeline (Enquiry & Quotations)',
    portal: 'main-office',
    aliases: ['/enquiry', '/quotation'],
    component: SalesPage
  },
  {
    id: 'gate-terminal',
    path: '/gate-terminal',
    title: 'Gate Inward & Outward',
    portal: 'gate-terminal',
    aliases: ['/gate', '/weighbridge'],
    component: GateTerminalPage
  },
  {
    id: 'dashboard',
    path: '/dashboard',
    title: 'Dashboard',
    portal: 'main-office',
    aliases: ['/home'],
    component: DashboardPage
  },
  {
    id: 'furnaces',
    path: '/furnaces',
    title: 'Furnaces',
    portal: 'main-office',
    aliases: ['/furnace-board'],
    component: FurnacesPage
  },
  {
    id: 'operator',
    path: '/operator',
    title: 'Operator Screen',
    portal: 'main-office',
    aliases: ['/operator-run'],
    component: OperatorPage
  },
  {
    id: 'grn',
    path: '/grn',
    title: 'Material Inward (GRN)',
    portal: 'main-office',
    aliases: ['/inward'],
    component: GrnPage
  },
  {
    id: 'job-orders',
    path: '/job-orders',
    title: 'Customer Orders',
    portal: 'main-office',
    aliases: ['/orders', '/jo'],
    component: JobOrdersPage
  },
  {
    id: 'recipes',
    path: '/recipes',
    title: 'Recipes Studio',
    portal: 'main-office',
    aliases: ['/recipe'],
    component: RecipesPage
  },
  {
    id: 'batches',
    path: '/batches',
    title: 'Batches & Loading',
    portal: 'main-office',
    aliases: ['/batch'],
    component: BatchesPage
  },
  {
    id: 'qc-lab',
    path: '/qc-lab',
    title: 'Quality Testing Lab',
    portal: 'main-office',
    aliases: ['/qc', '/lab'],
    component: QcLabPage
  },
  {
    id: 'certificates',
    path: '/certificates',
    title: 'Test Certificate (TC)',
    portal: 'main-office',
    aliases: ['/tc', '/certificate'],
    component: CertificatePage
  },
  {
    id: 'ncr',
    path: '/ncr',
    title: 'Rejection & Rework (NCR)',
    portal: 'main-office',
    aliases: ['/rejection', '/rework'],
    component: NcrPage
  },
  {
    id: 'purchase',
    path: '/purchase',
    title: 'Purchase & PO',
    portal: 'main-office',
    aliases: ['/po', '/suppliers'],
    component: PurchasePage
  },
  {
    id: 'services',
    path: '/services',
    title: 'Service Rates',
    portal: 'main-office',
    aliases: ['/rates'],
    component: ServicesPage
  },
  {
    id: 'inventory',
    path: '/inventory',
    title: 'Stock Inventory',
    portal: 'main-office',
    aliases: ['/stock'],
    component: InventoryPage
  },
  {
    id: 'commercial',
    path: '/commercial',
    title: 'Commercial & Dispatch',
    portal: 'main-office',
    aliases: ['/dispatch'],
    component: CommercialPage
  },
  {
    id: 'tax-invoice',
    path: '/tax-invoice',
    title: 'Official Tax Invoice',
    portal: 'main-office',
    aliases: ['/invoice', '/invoices'],
    component: TaxInvoiceViewer
  },
  {
    id: 'maintenance',
    path: '/maintenance',
    title: 'Calibration & Maintenance',
    portal: 'main-office',
    aliases: ['/calibration'],
    component: MaintenancePage
  },
  {
    id: 'traceability',
    path: '/traceability',
    title: 'Part Tracking Traceability',
    portal: 'main-office',
    aliases: ['/tracking', '/audit-trail'],
    component: TraceabilityPage
  },
  {
    id: 'masters',
    path: '/masters',
    title: 'Masters',
    portal: 'main-office',
    aliases: ['/master', '/users'],
    component: MastersPage
  }
];

// Lookup map for fast O(1) routing
export const ROUTES_BY_ID = ROUTES.reduce((acc, r) => {
  acc[r.id] = r;
  return acc;
}, {});

export const ROUTES_BY_PATH = ROUTES.reduce((acc, r) => {
  acc[r.path] = r;
  if (r.aliases) {
    r.aliases.forEach((a) => {
      acc[a] = r;
    });
  }
  return acc;
}, {});

// =============================================================================
// ROUTE UTILITY FUNCTIONS
// =============================================================================

/**
 * Resolves a URL pathname or hash to a valid route definition
 */
export const getRouteFromPathname = (pathname = '') => {
  const clean = '/' + pathname.replace(/^\/+|\/+$/g, '');
  if (ROUTES_BY_PATH[clean]) {
    return ROUTES_BY_PATH[clean];
  }
  // Try matching without leading slash
  const slug = clean.replace(/^\//, '');
  if (ROUTES_BY_ID[slug]) {
    return ROUTES_BY_ID[slug];
  }
  return null;
};

/**
 * Resolves current browser URL to a validated route for the current user
 */
export const getInitialRoute = (user) => {
  if (typeof window === 'undefined' || !user) {
    return null;
  }
  const rawPath = window.location.pathname;
  const hashPath = window.location.hash.replace(/^#\/?/, '/');
  const targetPath = rawPath !== '/' ? rawPath : hashPath;

  const matched = getRouteFromPathname(targetPath);
  if (matched) {
    if (matched.portal === 'gate-terminal' && canAccessPortal(user, 'gate-terminal')) {
      return matched;
    }
    if (matched.portal === 'main-office' && canAccess(user, matched.id)) {
      return matched;
    }
  }
  return null;
};

/**
 * Syncs the browser address bar and tab title with the active route
 */
export const syncBrowserUrl = (portal, tabId) => {
  if (typeof window === 'undefined') return;
  const route = portal === 'gate-terminal' ? ROUTES_BY_ID['gate-terminal'] : ROUTES_BY_ID[tabId];
  if (!route) return;

  if (window.location.pathname !== route.path) {
    window.history.pushState({ portal, tabId }, '', route.path);
  }
  document.title = `MATHEAT | ${route.title}`;
};

// =============================================================================
// ROUTER HOOK (Manages activePortal, activeTab, URL sync, and back/forward navigation)
// =============================================================================
export const useAppRouter = (user) => {
  const initial = user ? getInitialRoute(user) : null;
  const [activePortal, setActivePortal] = useState(() => initial?.portal || getDefaultPortal(user));
  const [activeTab, setActiveTab] = useState(() => initial?.id || getDefaultTab(user));
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize browser URL bar and title whenever activePortal or activeTab changes
  useEffect(() => {
    if (!user) return;
    syncBrowserUrl(activePortal, activeTab);
  }, [activePortal, activeTab, user]);

  // Handle native browser Back / Forward buttons (popstate event)
  useEffect(() => {
    const handlePopState = () => {
      if (!user) return;
      const matched = getInitialRoute(user);
      if (matched) {
        setActivePortal(matched.portal);
        setActiveTab(matched.id);
      } else {
        setActivePortal(getDefaultPortal(user));
        setActiveTab(getDefaultTab(user));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  // Keep activePortal & activeTab aligned with user permissions upon login or role changes
  useEffect(() => {
    if (user) {
      if (!canAccess(user, activeTab)) {
        setActiveTab(getDefaultTab(user));
      }
      if (!canAccessPortal(user, activePortal)) {
        setActivePortal(getDefaultPortal(user));
      }
    }
  }, [user, user?.role, activeTab, activePortal]);

  // Navigation handlers
  const navigateTo = useCallback((tabId, portal = 'main-office') => {
    if (portal === 'gate-terminal') {
      if (canAccessPortal(user, 'gate-terminal')) {
        setActivePortal('gate-terminal');
        setActiveTab('gate-terminal');
      }
      return;
    }
    if (canAccess(user, tabId)) {
      setActivePortal('main-office');
      setActiveTab(tabId);
    } else {
      setActiveTab(getDefaultTab(user));
    }
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('matheat_data_invalidated', { detail: { tabId, type: 'tab_navigation' } }));
      }, 50);
    }
  }, [user]);

  const handleGlobalSearch = useCallback((query) => {
    if (canAccess(user, 'traceability')) {
      setSearchQuery(query);
      setActivePortal('main-office');
      setActiveTab('traceability');
    }
  }, [user]);

  return {
    activePortal,
    setActivePortal,
    activeTab,
    setActiveTab,
    navigateTo,
    searchQuery,
    setSearchQuery,
    handleGlobalSearch
  };
};

// =============================================================================
// ROUTE VIEW COMPONENT (Renders the active page component with RBAC guard)
// =============================================================================
export const RouteView = ({
  activeTab,
  user,
  onSelectTab,
  onSearch,
  searchQuery,
  onSwitchPortal,
  isLight
}) => {
  // Access check
  if (!canAccess(user, activeTab)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="h-16 w-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-center justify-center mb-4 text-rose-600 dark:text-rose-400 shadow-sm">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
          Module Access Restricted
        </h2>
        <p className={`text-xs max-w-md mt-1.5 mb-5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Your assigned role <span className="font-mono font-bold text-orange-600 dark:text-orange-400">[{user?.role?.replace(/_/g, ' ')}]</span> is not authorized to access this module.
        </p>
        <button
          onClick={() => onSelectTab(getDefaultTab(user))}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
        >
          Return to Authorized Workspace
        </button>
      </div>
    );
  }

  // Component dispatcher matching route ID
  switch (activeTab) {
    case 'gate-terminal':
      return <GateTerminalPage onSwitchPortal={onSwitchPortal} />;
    case 'dashboard':
      return <DashboardPage onSelectTab={onSelectTab} onSearch={onSearch} />;
    case 'furnaces':
      return <FurnacesPage onSelectTab={onSelectTab} />;
    case 'operator':
      return <OperatorPage />;
    case 'grn':
      return <GrnPage />;
    case 'job-orders':
      return <JobOrdersPage onSelectTab={onSelectTab} />;
    case 'recipes':
      return <RecipesPage />;
    case 'batches':
      return <BatchesPage onSelectTab={onSelectTab} />;
    case 'qc-lab':
      return <QcLabPage onSelectTab={onSelectTab} />;
    case 'certificates':
      return <CertificatePage />;
    case 'ncr':
      return <NcrPage onSelectTab={onSelectTab} />;
    case 'inventory':
      return <InventoryPage />;
    case 'commercial':
      return <CommercialPage onSelectTab={onSelectTab} />;
    case 'tax-invoice':
      return <TaxInvoiceViewer />;
    case 'maintenance':
      return <MaintenancePage />;
    case 'traceability':
      return <TraceabilityPage initialQuery={searchQuery} />;
    case 'masters':
      return <MastersPage />;
    case 'purchase':
      return <PurchasePage />;
    case 'services':
      return <ServicesPage />;
    case 'sales':
      return <SalesPage onSelectTab={onSelectTab} />;
    default:
      return <DashboardPage onSelectTab={onSelectTab} onSearch={onSearch} />;
  }
};

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { DashboardPage } from './pages/DashboardPage';
import { FurnacesPage } from './pages/FurnacesPage';
import { OperatorPage } from './pages/OperatorPage';
import { GrnPage } from './pages/GrnPage';
import { JobOrdersPage } from './pages/JobOrdersPage';
import { RecipesPage } from './pages/RecipesPage';
import { BatchesPage } from './pages/BatchesPage';
import { QcLabPage } from './pages/QcLabPage';
import { CertificatePage } from './pages/CertificatePage';
import { NcrPage } from './pages/NcrPage';
import { InventoryPage } from './pages/InventoryPage';
import { CommercialPage } from './pages/CommercialPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { TraceabilityPage } from './pages/TraceabilityPage';
import { MastersPage } from './pages/MastersPage';
import { TaxInvoiceViewer } from './components/TaxInvoiceViewer';

export function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('H-45872');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLight } = useTheme();

  const handleGlobalSearch = (query) => {
    setSearchQuery(query);
    setActiveTab('traceability');
  };

  return (
    <div
      className={`h-screen flex flex-col font-sans erp-watermark overflow-hidden transition-colors duration-200 ${
        isLight
          ? 'bg-[var(--bg-app)] text-slate-900'
          : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        onSearch={handleGlobalSearch}
        onSelectTab={setActiveTab}
        onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Industrial Sidebar with Collapse & Mobile Drawer */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Main Content Area with Smooth Independent Scroll */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative z-10">

          {activeTab === 'dashboard' && <DashboardPage onSelectTab={setActiveTab} onSearch={handleGlobalSearch} />}
          {activeTab === 'furnaces' && <FurnacesPage onSelectTab={setActiveTab} />}
          {activeTab === 'operator' && <OperatorPage />}
          {activeTab === 'grn' && <GrnPage />}
          {activeTab === 'job-orders' && <JobOrdersPage onSelectTab={setActiveTab} />}
          {activeTab === 'recipes' && <RecipesPage />}
          {activeTab === 'batches' && <BatchesPage onSelectTab={setActiveTab} />}
          {activeTab === 'qc-lab' && <QcLabPage onSelectTab={setActiveTab} />}
          {activeTab === 'certificates' && <CertificatePage />}
          {activeTab === 'ncr' && <NcrPage onSelectTab={setActiveTab} />}
          {activeTab === 'inventory' && <InventoryPage />}
          {activeTab === 'commercial' && <CommercialPage onSelectTab={setActiveTab} />}
          {activeTab === 'tax-invoice' && <TaxInvoiceViewer />}
          {activeTab === 'maintenance' && <MaintenancePage />}
          {activeTab === 'traceability' && <TraceabilityPage initialQuery={searchQuery} />}
          {activeTab === 'masters' && <MastersPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

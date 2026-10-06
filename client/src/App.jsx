import React, { useState } from 'react';
import { AuthProvider, useAuth, canAccess } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { DropdownProvider } from './context/DropdownContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { useAppRouter, RouteView } from './routes';
import { prewarmAllCaches } from './api/client';

export function AppContent() {
  const { user } = useAuth();
  const { isLight } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Background pre-warm of all modules for 0ms instant switching
  React.useEffect(() => {
    if (user) {
      prewarmAllCaches();
    }
  }, [user]);

  // Centralized frontend routing hook (handles URL sync, popstate, titles, and route transitions)
  const {
    activePortal,
    setActivePortal,
    activeTab,
    navigateTo,
    searchQuery,
    handleGlobalSearch
  } = useAppRouter(user);

  // ── Show Login page if user is not authenticated ──
  if (!user) {
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  return (
    <div
      className={`h-screen min-h-[100dvh] flex flex-col font-sans erp-watermark overflow-hidden transition-colors duration-200 ${
        isLight
          ? 'bg-[var(--bg-app)] text-slate-900'
          : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Top Navbar with Dual-Portal Switcher */}
      <Navbar
        onSearch={handleGlobalSearch}
        onSelectTab={(tab) => navigateTo(tab, 'main-office')}
        onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        activePortal={activePortal}
        setActivePortal={setActivePortal}
      />

      {/* DUAL PORTAL VIEW CONTAINER */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Industrial Sidebar with Collapse & Mobile Drawer */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => navigateTo(tab, 'main-office')}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          hideDesktop={activePortal === 'gate-terminal'}
          onOpenGate={() => navigateTo('gate-terminal', 'gate-terminal')}
        />

        {activePortal === 'gate-terminal' && canAccess(user, 'gate-terminal') ? (
          /* Full-Screen Gate & Weighbridge Camera Terminal */
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-5 lg:p-6 relative z-10">
            <GateTerminalPage onSwitchPortal={() => navigateTo(activeTab || 'dashboard', 'main-office')} />
          </main>
        ) : (
          /* Main Office ERP & MES Portal Content */
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 sm:p-5 md:p-6 lg:p-8 relative z-10">
            <RouteView
              activeTab={activeTab}
              user={user}
              onSelectTab={(tab) => navigateTo(tab, 'main-office')}
              onSearch={handleGlobalSearch}
              searchQuery={searchQuery}
              onSwitchPortal={() => navigateTo(activeTab || 'dashboard', 'main-office')}
              isLight={isLight}
            />
          </main>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DropdownProvider>
          <AppContent />
        </DropdownProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

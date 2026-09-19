import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Menu,
  Bell,
  Search,
  ShieldCheck,
  ChevronDown,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar = ({ onSearch, onSelectTab, onToggleMobileSidebar }) => {
  const { user, switchDemoRole, demoUsers } = useAuth();
  const { theme, toggleTheme, isLight } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      if (onSearch) onSearch(searchTerm.trim());
      if (onSelectTab) onSelectTab('traceability');
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 px-3 sm:px-4 py-2 flex items-center justify-between shadow-sm select-none shrink-0 h-14 border-b transition-colors no-print ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
          : 'bg-slate-900/95 border-slate-800 text-slate-100'
      }`}
    >
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className={`p-1.5 rounded-lg lg:hidden transition-colors ${
            isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-400'
          }`}
          title="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand & Monogram Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => onSelectTab && onSelectTab('dashboard')}
        >
          <img
            src="/matheat_logo.png"
            alt="MATHEAT Logo"
            className="h-10 w-auto object-contain shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`font-black text-sm sm:text-base tracking-tight font-sans ${
                isLight ? 'text-blue-950' : 'text-white'
              }`}>
                MATHEAT
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-orange-600/10 text-orange-600 border border-orange-500/30 rounded">
                PVT. LTD.
              </span>
            </div>
            <p className={`text-[9px] sm:text-[10px] font-mono tracking-wider uppercase hidden xs:block ${
              isLight ? 'text-slate-500 font-semibold' : 'text-slate-400'
            }`}>
              HEAT TREATMENT ERP + MES
            </p>
          </div>
        </div>
      </div>

      {/* Global Quick Traceability Search */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center max-w-md w-full mx-6">
        <div className="relative w-full">
          <Search className={`absolute left-3 top-2 h-4 w-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search Heat No (e.g. H-45872), Batch ID, PO, Part No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors ${
              isLight
                ? 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-orange-500'
                : 'bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:border-orange-500'
            }`}
          />
        </div>
      </form>

      {/* Right Controls: Theme Toggle & Role Switcher & Notifications & User */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        
        {/* THEME TOGGLE: LIGHT (OFF-WHITE STEEL) VS DARK */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 p-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
            isLight
              ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-300 shadow-sm'
              : 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
          }`}
          title={isLight ? 'Switch to Dark Industrial Theme' : 'Switch to Soft Light Industrial Theme'}
        >
          {isLight ? (
            <>
              <Moon className="h-3.5 w-3.5 text-slate-700" />
              <span className="hidden sm:inline text-[11px] text-slate-700">Dark</span>
            </>
          ) : (
            <>
              <Sun className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px] text-amber-300">Light</span>
            </>
          )}
        </button>

        {/* Role Quick Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className={`flex items-center gap-1.5 text-xs border px-2.5 py-1.5 rounded-lg transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-300 border-slate-300 text-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title="Switch User Role"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
            <span className="font-semibold hidden sm:inline">{user?.role?.replace('_', ' ')}</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {showRoleDropdown && (
            <div className={`absolute right-0 mt-1 w-56 rounded-lg shadow-2xl py-1 z-50 border ${
              isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
            }`}>
              <div className={`px-3 py-1.5 text-[10px] uppercase font-bold border-b ${
                isLight ? 'text-slate-600 border-slate-300' : 'text-slate-400 border-slate-800'
              }`}>
                Switch Operational Role
              </div>
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchDemoRole(u.role);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    isLight ? 'hover:bg-slate-200' : 'hover:bg-slate-800'
                  } ${
                    user?.role === u.role ? 'bg-orange-500/15 text-orange-600 font-bold' : ''
                  }`}
                >
                  <span>{u.firstName} ({u.role.replace('_', ' ')})</span>
                  {user?.role === u.role && <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Safety Alert Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={`p-1.5 rounded-lg relative border transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-300 border-slate-300 text-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title="Safety & Calibration Alerts"
          >
            <Bell className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>

          {showAlerts && (
            <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-2xl p-3 z-50 border ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-700'
            }`}>
              <div className={`flex items-center justify-between pb-2 border-b text-xs font-bold ${
                isLight ? 'border-slate-300 text-slate-900' : 'border-slate-800 text-slate-200'
              }`}>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" /> System Alerts (2)
                </span>
              </div>
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-800 dark:text-amber-200">
                  <div className="font-semibold text-amber-700 dark:text-amber-300">Calibration Due Soon (7 Days)</div>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    Furnace F-02 Digital Temp Controller (Eurotherm) expires on 24-Sep-2026.
                  </p>
                </div>
                <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded text-blue-800 dark:text-blue-200">
                  <div className="font-semibold text-blue-700 dark:text-blue-300">QC Pending Approval</div>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    Batch HT-2026-000125 completed cycle in F-01. Awaiting metallurgical hardness sign-off.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className={`flex items-center gap-2 border-l pl-2 sm:pl-3 ${
          isLight ? 'border-slate-300' : 'border-slate-800'
        }`}>
          <div className="h-7 w-7 rounded-full bg-orange-600 flex items-center justify-center font-bold text-xs text-white shadow">
            {user?.firstName?.charAt(0) || 'M'}
          </div>
          <div className="hidden lg:block text-left">
            <div className={`text-xs font-bold leading-tight ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
              {user?.firstName} {user?.lastName}
            </div>
            <div className={`text-[10px] leading-tight ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {user?.department || 'Operations'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

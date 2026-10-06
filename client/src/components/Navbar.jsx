import React, { useState, useEffect, useRef } from 'react';
import { useAuth, canAccess, getDefaultTab, canAccessPortal } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';
import {
  Menu,
  Bell,
  Search,
  ShieldCheck,
  Sun,
  Moon,
  Truck,
  Building2,
  CheckCircle2,
  LogOut,
  ChevronDown,
  User,
  Shield,
  AlertTriangle,
  Info,
  Check,
  KeyRound
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';

export const Navbar = ({
  onSearch,
  onSelectTab,
  onToggleMobileSidebar,
  activePortal = 'main-office',
  setActivePortal
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isLight } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlerts, setShowAlerts] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileMenuRef = useRef(null);
  const alertsRef = useRef(null);

  const fetchAlerts = async () => {
    try {
      const res = await api.notifications.getAll().catch(() => null);
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(typeof res.unreadCount === 'number' ? res.unreadCount : res.notifications.filter(n => !n.isRead).length);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    window.addEventListener('matheat_data_invalidated', fetchAlerts);
    return () => {
      clearInterval(interval);
      window.removeEventListener('matheat_data_invalidated', fetchAlerts);
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.warn('Failed to mark read:', e);
    }
  };

  const handleNotificationClick = (item) => {
    setShowAlerts(false);
    if (!item.link) return;
    const cleanTab = item.link.replace(/^\//, '').split('?')[0];
    if (onSelectTab && cleanTab) {
      onSelectTab(cleanTab);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target)) {
        setShowAlerts(false);
      }
    };
    if (showProfileMenu || showAlerts) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showProfileMenu, showAlerts]);

  const hasGateAccess = canAccess(user, 'gate-terminal');
  const hasOfficeAccess = canAccessPortal(user, 'main-office');
  const hasTraceabilityAccess = canAccess(user, 'traceability');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      if (onSearch) onSearch(searchTerm.trim());
      if (onSelectTab) onSelectTab('traceability');
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between shadow-sm select-none shrink-0 h-14 border-b transition-colors no-print ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
          : 'bg-slate-900/95 border-slate-800 text-slate-100'
      }`}
    >
      {/* Left: Mobile Toggle & Brand & Dual Portal Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className={`p-1.5 rounded-lg lg:hidden transition-colors border shrink-0 ${
            isLight
              ? 'hover:bg-slate-100 text-slate-900 border-slate-300'
              : 'hover:bg-slate-800 text-slate-400 border-slate-700'
          }`}
          title="Toggle Navigation Menu"
        >
          <Menu className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </button>

        {/* Brand & Monogram Logo */}
        <div
          className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer shrink-0"
          onClick={() => onSelectTab && onSelectTab(getDefaultTab(user))}
        >
          <img
            src="/matheat_logo.png"
            alt="MATHEAT Logo"
            className="h-8 sm:h-10 w-auto object-contain shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className={`font-black text-xs sm:text-base tracking-tight font-sans whitespace-nowrap ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                MATHEAT
              </span>
              <span className="text-[9px] sm:text-[10px] font-black px-1 sm:px-1.5 py-0.2 bg-orange-600/15 text-orange-600 border border-orange-500/40 rounded hidden sm:inline-block whitespace-nowrap">
                PVT. LTD.
              </span>
            </div>
            <p className={`text-[8.5px] sm:text-[10px] font-mono tracking-wider uppercase font-black hidden md:block whitespace-nowrap ${
              isLight ? 'text-slate-700' : 'text-slate-300'
            }`}>
              HEAT TREATMENT ERP + MES
            </p>
          </div>
        </div>

        {/* Dual-Portal High-Visibility Switcher (Role-Filtered) */}
        {hasGateAccess && hasOfficeAccess ? (
          <div className={`flex items-center p-0.5 sm:p-1 rounded-xl border shadow-sm ml-0.5 sm:ml-2.5 transition-colors shrink-0 ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
          }`}>
            {/* Button 1: Inward & Outward Gate */}
            <button
              type="button"
              onClick={() => setActivePortal && setActivePortal('gate-terminal')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activePortal === 'gate-terminal'
                  ? 'bg-orange-600 text-white border border-orange-700 shadow-md'
                  : isLight
                    ? 'bg-white text-slate-900 hover:bg-slate-100 border border-slate-300'
                    : 'bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
              title="Switch to Inward & Outward Weighbridge Camera Terminal"
            >
              <Truck className={`h-3.5 w-3.5 shrink-0 ${activePortal === 'gate-terminal' ? 'text-white' : 'text-orange-600'}`} />
              <span className="font-mono hidden md:inline">Inward &amp; Outward</span>
              <span className="font-mono hidden sm:inline md:hidden">Gate</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black font-mono border hidden lg:inline ${
                activePortal === 'gate-terminal'
                  ? 'bg-black/30 text-white border-black/20'
                  : isLight
                    ? 'bg-orange-100 text-orange-900 border-orange-300'
                    : 'bg-orange-950/80 text-orange-300 border-orange-700'
              }`}>
                GATE
              </span>
            </button>

            {/* Button 2: Main Office ERP */}
            <button
              type="button"
              onClick={() => setActivePortal && setActivePortal('main-office')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ml-0.5 sm:ml-1 ${
                activePortal === 'main-office'
                  ? 'bg-blue-600 text-white border border-blue-700 shadow-md'
                  : isLight
                    ? 'bg-white text-slate-900 hover:bg-slate-100 border border-slate-300'
                    : 'bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
              title="Switch to Main Office ERP, MES & Accounts"
            >
              <Building2 className={`h-3.5 w-3.5 shrink-0 ${activePortal === 'main-office' ? 'text-white' : 'text-blue-600'}`} />
              <span className="font-mono hidden md:inline">Main Office</span>
              <span className="font-mono hidden sm:inline md:hidden">Office</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black font-mono border hidden lg:inline ${
                activePortal === 'main-office'
                  ? 'bg-black/30 text-white border-black/20'
                  : isLight
                    ? 'bg-blue-100 text-blue-900 border-blue-300'
                    : 'bg-blue-950/80 text-blue-300 border-blue-700'
              }`}>
                ERP
              </span>
            </button>
          </div>
        ) : hasGateAccess && !hasOfficeAccess ? (
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs font-black bg-orange-600 text-white border border-orange-700 shadow-sm ml-0.5 sm:ml-3 whitespace-nowrap shrink-0">
            <Truck className="h-3.5 w-3.5 text-white shrink-0" />
            <span className="font-mono hidden sm:inline">Inward &amp; Outward Gate</span>
            <span className="font-mono sm:hidden">Gate</span>
          </div>
        ) : hasOfficeAccess && !hasGateAccess ? (
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs font-black bg-blue-600 text-white border border-blue-700 shadow-sm ml-0.5 sm:ml-3 whitespace-nowrap shrink-0">
            <Building2 className="h-3.5 w-3.5 text-white shrink-0" />
            <span className="font-mono hidden sm:inline">
              {user?.role === 'FURNACE_OPERATOR' ? 'Shopfloor Console' : 'Main Office ERP'}
            </span>
            <span className="font-mono sm:hidden">Office</span>
          </div>
        ) : null}
      </div>

      {/* Global Quick Traceability Search (Visible only to authorized roles on desktop) */}
      {hasTraceabilityAccess && (
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center max-w-md w-full mx-4 lg:mx-6 min-w-0">
          <div className="relative w-full">
            <Search className={`absolute left-3 top-2.5 h-4 w-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search Heat No, Batch ID, PO, Part No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-lg font-mono font-bold focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors border ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-orange-600'
                  : 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500 focus:border-orange-500'
              }`}
            />
          </div>
        </form>
      )}

      {/* Right Controls: Notifications & Profile Menu (Admin, Dark Mode, Logout) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        
        {/* Safety & Plant Alert Bell */}
        <div className="relative shrink-0" ref={alertsRef}>
          <button
            onClick={() => {
              setShowAlerts(!showAlerts);
              setShowProfileMenu(false);
            }}
            className={`p-1.5 rounded-lg relative border transition-colors cursor-pointer shrink-0 ${
              showAlerts
                ? isLight
                  ? 'bg-slate-200 border-slate-400 text-slate-900'
                  : 'bg-slate-700 border-slate-600 text-white'
                : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title="Safety, Quality & Calibration Alerts"
          >
            <Bell className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : notifications.length > 0 ? (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full" />
            ) : null}
          </button>

          {showAlerts && (
            <div className={`fixed sm:absolute top-14 sm:top-full right-2 sm:right-0 mt-1 w-[calc(100vw-16px)] max-w-sm sm:w-96 rounded-xl shadow-2xl p-3 z-50 border max-h-[85vh] flex flex-col ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
            }`}>
              <div className={`flex items-center justify-between pb-2.5 border-b text-xs font-black ${
                isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-slate-200'
              }`}>
                <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                  <Bell className="h-4 w-4" />
                  <span>Plant Operational Alerts</span>
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-mono">
                    {notifications.length}
                  </span>
                </div>
                {notifications.some(n => !n.isRead) && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                  >
                    <Check className="h-3 w-3" /> Mark Read
                  </button>
                )}
              </div>

              <div className="overflow-y-auto space-y-2 mt-2 pr-1 max-h-80">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center">
                    <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <div className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Zero Active Alerts
                    </div>
                    <p className={`text-[11px] mt-1 max-w-[240px] mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      All furnace thermocouples, temperature controllers, and lab test instruments are operating within certified limits.
                    </p>
                  </div>
                ) : (
                  notifications.map((item, idx) => {
                    const isDanger = item.severity === 'DANGER';
                    const isWarning = item.severity === 'WARNING';
                    const isSuccess = item.severity === 'SUCCESS';

                    return (
                      <div
                        key={item._id || idx}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                          item.isRead ? 'opacity-70' : 'font-semibold'
                        } ${
                          isDanger
                            ? isLight
                              ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-900'
                              : 'bg-red-950/40 hover:bg-red-950/60 border-red-800 text-red-200'
                            : isWarning
                            ? isLight
                              ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
                              : 'bg-amber-950/40 hover:bg-amber-950/60 border-amber-800 text-amber-200'
                            : isSuccess
                            ? isLight
                              ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900'
                              : 'bg-emerald-950/40 hover:bg-emerald-950/60 border-emerald-800 text-emerald-200'
                            : isLight
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                            : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="flex items-center gap-1.5 font-bold text-xs truncate">
                            {isDanger ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                            ) : isWarning ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            ) : (
                              <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            )}
                            {item.title}
                          </span>
                          <span className="text-[9px] font-mono px-1 rounded uppercase tracking-wider bg-black/10">
                            {item.category?.replace(/_/g, ' ') || 'ALERT'}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-tight ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                          {item.message}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown (Includes Admin Role, Dark Mode Toggle, and Logout) */}
        <div className="relative shrink-0" ref={profileMenuRef}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowAlerts(false);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:px-2 rounded-xl border transition-all cursor-pointer select-none ${
              showProfileMenu
                ? isLight
                  ? 'bg-slate-100 border-orange-500 ring-2 ring-orange-500/20'
                  : 'bg-slate-800 border-orange-500 ring-2 ring-orange-500/20'
                : isLight
                  ? 'bg-white hover:bg-slate-50 border-slate-300 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800'
            }`}
            title="User Profile & Settings"
          >
            {/* Avatar Circle */}
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-xs text-white shadow-sm shrink-0 border border-black/20">
              {user?.firstName?.charAt(0) || 'M'}
            </div>

            {/* User Name & Role Pill (Desktop & Tablet) */}
            <div className="hidden sm:block text-left">
              <div className={`text-xs font-black leading-tight max-w-[120px] truncate ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                {user?.firstName || 'Operator'} {user?.lastName || ''}
              </div>
              <div className="text-[10px] font-mono leading-tight font-bold text-orange-600 dark:text-orange-400 truncate">
                {user?.role?.replace(/_/g, ' ') || 'STAFF'}
              </div>
            </div>

            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${
              showProfileMenu ? 'rotate-180 text-orange-600' : isLight ? 'text-slate-500' : 'text-slate-400'
            }`} />
          </button>

          {/* Profile Dropdown Box */}
          {showProfileMenu && (
            <div className={`fixed sm:absolute top-14 sm:top-full right-2 sm:right-0 mt-1.5 w-[calc(100vw-16px)] max-w-xs sm:w-72 rounded-2xl shadow-2xl p-3 z-50 border transition-all ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 shadow-xl shadow-slate-900/10'
                : 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-2xl shadow-black/50'
            }`}>
              {/* 1. User Identity Header */}
              <div className={`p-3 rounded-xl mb-2 flex items-center gap-3 border ${
                isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-950/70 border-slate-800'
              }`}>
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-base text-white shadow shrink-0">
                  {user?.firstName?.charAt(0) || 'M'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`font-black text-sm leading-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {user?.firstName || 'Factory'} {user?.lastName || 'Operator'}
                  </div>
                  <div className={`text-[11px] font-mono leading-tight truncate mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {user?.department || 'Operations Team'}
                  </div>
                </div>
              </div>

              {/* 2. Admin / Authority Role Section */}
              <div className={`p-2.5 px-3 rounded-xl mb-2 border flex items-center justify-between ${
                isLight ? 'bg-orange-50/60 border-orange-200/80' : 'bg-orange-950/30 border-orange-900/40'
              }`}>
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider font-mono">
                      System Authority
                    </span>
                    <span className="text-xs font-black text-orange-700 dark:text-orange-300 font-mono block truncate">
                      {user?.role?.replace(/_/g, ' ') || 'ADMIN'}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-600 text-white font-mono shrink-0">
                  ACTIVE
                </span>
              </div>

              <div className="space-y-1">
                {/* 3. Dark Mode / Light Mode Option */}
                <button
                  type="button"
                  onClick={() => toggleTheme()}
                  className={`w-full flex items-center justify-between p-2.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    isLight
                      ? 'hover:bg-slate-100 text-slate-800 border-transparent hover:border-slate-200'
                      : 'hover:bg-slate-800 text-slate-200 border-transparent hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isLight ? (
                      <Moon className="h-4 w-4 text-slate-700 shrink-0" />
                    ) : (
                      <Sun className="h-4 w-4 text-amber-400 shrink-0" />
                    )}
                    <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>

                  {/* Toggle Pill Switch */}
                  <div className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    !isLight ? 'bg-orange-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}>
                    <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
                  </div>
                </button>

                {/* 4. Change Password Option */}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setIsChangePasswordOpen(true);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    isLight
                      ? 'hover:bg-slate-100 text-slate-800 border-transparent hover:border-slate-200'
                      : 'hover:bg-slate-800 text-slate-200 border-transparent hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
                    <span>Change Password</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Security</span>
                </button>

                {/* 5. Logout Option */}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (window.confirm('Sign out of MATHEAT ERP?')) {
                      logout();
                    }
                  }}
                  className={`w-full flex items-center gap-2.5 p-2.5 px-3 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 transition-colors cursor-pointer border border-transparent ${
                    isLight
                      ? 'hover:bg-rose-50 hover:border-rose-200'
                      : 'hover:bg-rose-950/40 hover:border-rose-900/60'
                  }`}
                >
                  <LogOut className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </header>
  );
};

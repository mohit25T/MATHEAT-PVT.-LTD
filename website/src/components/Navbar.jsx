import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { companyInfo } from '../data/companyInfo';

export default function Navbar({ activePage = "home", onNavigate, onOpenQuoteModal }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: "home", name: "Home" },
    { id: "about", name: "About" },
    { id: "services", name: "Services" },
    { id: "processes", name: "Processes" },
    { id: "quality", name: "Quality" },
    { id: "traceability", name: "Traceability" },
    { id: "industries", name: "Industries" },
    { id: "components", name: "Components" },
    { id: "contact", name: "Contact" },
  ];

  const handleLinkClick = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Engineering Micro-Bar */}
      <div className="bg-navy-950 text-slate-300 text-[11px] font-mono border-b border-navy-800 py-1 px-3 sm:px-6 hidden md:flex items-center justify-between w-full">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            FACILITY OPERATIONAL // 24x7 CONTINUOUS FURNACE CYCLES
          </span>
          <span className="text-slate-400 hidden lg:inline">
            LOCATION: RAJKOT, GUJARAT, INDIA
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-heat-orange" />
            ISO & CQI-9 PYROMETRY COMPLIANT
          </span>
          <a
            href="tel:+912812000000"
            className="flex items-center gap-1.5 text-heat-orange hover:underline font-semibold"
          >
            <Phone className="w-3 h-3" />
            PLANT DESK: {companyInfo.contact.phone.split('/')[0]}
          </a>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 w-full ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200 py-2.5'
            : 'bg-white/90 backdrop-blur-sm border-b border-slate-200/80 py-3.5'
        }`}
      >
        <div className="w-full px-3 sm:px-6 flex items-center justify-between">
          {/* Authentic Logo - strictly preserved proportions & colors */}
          <button
            onClick={() => handleLinkClick("home")}
            className="flex items-center gap-3 group text-left"
          >
            <img
              src="/matheat_logo.png"
              alt="MATHEAT PVT. LTD. Logo"
              className="h-11 sm:h-13 md:h-14 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`px-2.5 xl:px-3 py-1.5 text-med font-medium rounded transition-all uppercase tracking-wider font-mono relative ${
                    isActive
                      ? 'text-heat-orange font-bold bg-orange-50 border border-orange-200'
                      : 'text-slate-700 hover:text-heat-orange hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-heat-orange rounded-full"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: GET A QUOTE Button */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenQuoteModal}
              className="relative inline-flex items-center gap-2 bg-heat-orange hover:bg-heat-deep text-white font-mono text-xs font-bold px-3.5 py-2 rounded shadow-md hover:shadow-lg transition-all group active:scale-95"
            >
              <span>GET A QUOTE</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenQuoteModal}
              className="bg-heat-orange text-white text-[11px] font-mono font-bold px-2.5 py-1.5 rounded sm:hidden"
            >
              QUOTE
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-navy-900 hover:bg-slate-100 rounded-md focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-fadeIn">
            <div className="grid grid-cols-2 gap-1.5">
              {navLinks.map((link) => {
                const isActive = activePage === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id)}
                    className={`px-3 py-2 text-xs font-mono font-semibold rounded text-left transition-all uppercase ${
                      isActive
                        ? 'bg-heat-orange text-white font-bold'
                        : 'text-navy-900 hover:text-heat-orange hover:bg-slate-50 border border-slate-100'
                    }`}
                  >
                    {link.name}
                  </button>
                );
              })}
            </div>
            <div className="pt-3 border-t border-slate-200 mt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuoteModal();
                }}
                className="w-full py-2.5 bg-heat-orange text-white font-mono text-xs font-bold rounded flex items-center justify-center gap-2 shadow"
              >
                <span>REQUEST RFQ / GET A QUOTE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

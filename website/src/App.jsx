import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustStrip from './components/TrustStrip';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import ProcessTimeline from './components/ProcessTimeline';
import FurnaceVisualization from './components/FurnaceVisualization';
import QualitySection from './components/QualitySection';
import TraceabilitySection from './components/TraceabilitySection';
import IndustriesSection from './components/IndustriesSection';
import ComponentGallery from './components/ComponentGallery';
import WhyMatheat from './components/WhyMatheat';
import TechnicalSection from './components/TechnicalSection';
import CTASection from './components/CTASection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import CertificateModal from './components/CertificateModal';
import QuoteModal from './components/QuoteModal';
import { ArrowRight, Flame, Layers, ShieldCheck, QrCode, Cpu } from 'lucide-react';

export default function App() {
  // Sync page state with window hash for seamless back/forward browser navigation
  const getInitialPage = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const validPages = ['home', 'about', 'services', 'processes', 'quality', 'traceability', 'industries', 'components', 'contact'];
    return validPages.includes(hash) ? hash : 'home';
  };

  const [activePage, setActivePage] = useState(getInitialPage);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [activeProcessName, setActiveProcessName] = useState("Carburizing");

  useEffect(() => {
    const handleHashChange = () => {
      const page = getInitialPage();
      setActivePage(page);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    window.location.hash = pageId;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleOpenQuote = (processName = "Carburizing") => {
    setActiveProcessName(processName);
    setIsQuoteOpen(true);
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#F8FAFC] text-navy-900 selection:bg-heat-orange selection:text-white antialiased"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      {/* Top Fixed / Sticky Navigation */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenQuoteModal={() => handleOpenQuote("General Heat Treatment")}
      />

      {/* Main Content Area - Render Only The Active Page */}
      <main className="flex-grow">
        
        {/* ==================== 1. HOME PAGE ==================== */}
        {activePage === 'home' && (
          <div className="animate-fadeIn">
            {/* Hero Section with Animated Line Art Furnace */}
            <Hero
              onOpenQuoteModal={() => handleOpenQuote("General Heat Treatment")}
              onNavigate={handleNavigate}
            />

            {/* Technical Trust Strip */}
            <TrustStrip />

            {/* Why MATHEAT & Triad Highlight */}
            <WhyMatheat onOpenQuoteModal={handleOpenQuote} />

            {/* Quick Navigation Gateways to Key Engineering Pages */}
            <section className="py-8 bg-[#E5EBF2] bg-cad-grid border-b border-slate-300 w-full">
              <div className="w-full px-3 sm:px-6">
                <div className="text-center max-w-2xl mx-auto mb-6">
                  <span className="font-mono text-xs font-bold text-heat-orange tracking-widest uppercase block mb-1">
                    // EXPLORE MATHEAT CAPABILITIES
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
                    Industrial Heat Treatment Infrastructure
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Services */}
                  <div
                    onClick={() => handleNavigate('services')}
                    className="bg-white border-2 border-slate-400 hover:border-heat-orange border-t-4 border-t-navy-900 hover:border-t-heat-orange rounded-xl p-4 sm:p-5 cursor-pointer group shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
                  >
                    <div className="w-10 h-10 rounded bg-navy-950 text-heat-orange flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Flame className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 font-bold block uppercase">01 // 9 PROCESSES</span>
                    <h4 className="text-lg font-bold text-navy-900 mt-1 mb-1.5 group-hover:text-heat-orange transition-colors">
                      Industrial Services
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      Gas carburizing, carbonitriding, through-hardening, tempering, induction, and annealing with strict case depth control.
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-navy-900 group-hover:text-heat-orange transition-colors">
                      <span>VIEW SERVICES SPECIFICATIONS</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Card 2: Processes & Furnace Tech */}
                  <div
                    onClick={() => handleNavigate('processes')}
                    className="bg-white border-2 border-slate-400 hover:border-heat-orange border-t-4 border-t-navy-900 hover:border-t-heat-orange rounded-xl p-4 sm:p-5 cursor-pointer group shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
                  >
                    <div className="w-10 h-10 rounded bg-navy-950 text-heat-orange flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 font-bold block uppercase">02 // TELEMETRY & HUD</span>
                    <h4 className="text-lg font-bold text-navy-900 mt-1 mb-1.5 group-hover:text-heat-orange transition-colors">
                      10-Stage Process & Furnace
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      10-step metallurgical workflow with closed-loop oxygen probes, AMS 2750 pyrometry, and real-time 850°C cycle telemetry.
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-navy-900 group-hover:text-heat-orange transition-colors">
                      <span>EXPLORE PROCESS TIMELINE</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Card 3: Batch Traceability */}
                  <div
                    onClick={() => handleNavigate('traceability')}
                    className="bg-white border-2 border-slate-400 hover:border-heat-orange border-t-4 border-t-navy-900 hover:border-t-heat-orange rounded-xl p-4 sm:p-5 cursor-pointer group shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
                  >
                    <div className="w-10 h-10 rounded bg-navy-950 text-heat-orange flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 font-bold block uppercase">03 // QR AUDIT TRAIL</span>
                    <h4 className="text-lg font-bold text-navy-900 mt-1 mb-1.5 group-hover:text-heat-orange transition-colors">
                      Batch Traceability
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      "Every Batch Has A Story." Trace mill heat numbers, furnace logs, and certified hardness with our digital batch card simulator.
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-navy-900 group-hover:text-heat-orange transition-colors">
                      <span>OPEN BATCH SIMULATOR</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <CTASection onOpenQuoteModal={() => handleOpenQuote("General Heat Treatment")} />
          </div>
        )}

        {/* ==================== 2. ABOUT PAGE ==================== */}
        {activePage === 'about' && (
          <div className="animate-fadeIn">
            <AboutSection />
            <TechnicalSection />
            <CTASection onOpenQuoteModal={() => handleOpenQuote("Metallurgical Consultation")} />
          </div>
        )}

        {/* ==================== 3. SERVICES PAGE ==================== */}
        {activePage === 'services' && (
          <div className="animate-fadeIn">
            <ServicesSection onOpenQuoteModal={handleOpenQuote} />
            <CTASection onOpenQuoteModal={() => handleOpenQuote("Heat Treatment Services")} />
          </div>
        )}

        {/* ==================== 4. PROCESSES & TECHNOLOGY PAGE ==================== */}
        {activePage === 'processes' && (
          <div className="animate-fadeIn">
            <ProcessTimeline />
            <FurnaceVisualization />
            <CTASection onOpenQuoteModal={() => handleOpenQuote("Process Feasibility")} />
          </div>
        )}

        {/* ==================== 5. QUALITY PAGE ==================== */}
        {activePage === 'quality' && (
          <div className="animate-fadeIn">
            <QualitySection />
            <CTASection onOpenQuoteModal={() => handleOpenQuote("Quality Inspection")} />
          </div>
        )}

        {/* ==================== 6. TRACEABILITY PAGE ==================== */}
        {activePage === 'traceability' && (
          <div className="animate-fadeIn">
            <TraceabilitySection onOpenCertificateModal={() => setIsCertOpen(true)} />
            <CTASection onOpenQuoteModal={() => handleOpenQuote("Batch Traceability")} />
          </div>
        )}

        {/* ==================== 7. INDUSTRIES PAGE ==================== */}
        {activePage === 'industries' && (
          <div className="animate-fadeIn">
            <IndustriesSection onOpenQuoteModal={handleOpenQuote} />
            <CTASection onOpenQuoteModal={() => handleOpenQuote("Industrial Component")} />
          </div>
        )}

        {/* ==================== 8. COMPONENTS PAGE ==================== */}
        {activePage === 'components' && (
          <div className="animate-fadeIn">
            <ComponentGallery onOpenQuoteModal={handleOpenQuote} />
            <CTASection onOpenQuoteModal={() => handleOpenQuote("Component Heat Treatment")} />
          </div>
        )}

        {/* ==================== 9. CONTACT / RFQ PAGE ==================== */}
        {activePage === 'contact' && (
          <div className="animate-fadeIn">
            <ContactSection prefilledProcess={activeProcessName} />
          </div>
        )}

      </main>

      {/* Footer is rendered at the bottom of EVERY separate page! */}
      <Footer onNavigate={handleNavigate} />

      {/* Heat Treatment Certificate Modal */}
      <CertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        onOpenQuoteModal={() => {
          setIsCertOpen(false);
          setIsQuoteOpen(true);
        }}
      />

      {/* RFQ Quote Request Modal */}
      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        defaultProcess={activeProcessName}
      />
    </div>
  );
}

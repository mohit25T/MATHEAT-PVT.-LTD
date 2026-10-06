import React from 'react';
import { companyInfo } from '../data/companyInfo';
import { services } from '../data/services';
import { ShieldCheck, Phone, Mail, MapPin, ArrowUp, Flame } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
    } else {
      scrollToTop();
    }
  };

  return (
    <footer className="bg-navy-950 text-white relative border-t-2 border-navy-800 overflow-hidden">
      
      {/* Subtle Orange Line-Art Heat Wave Animation in Footer Top Border */}
      <div className="w-full h-1.5 bg-navy-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-heat-orange to-transparent w-full animate-heat-flow opacity-90"></div>
      </div>

      <div className="w-full px-3 sm:px-6 pt-8 pb-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 pb-6 border-b border-navy-800/80">
          
          {/* Col 1: Logo & Company Metallurgy Positioning */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/matheat_logo.png"
                alt="MATHEAT PVT. LTD."
                className="h-14 w-auto object-contain bg-white p-1.5 rounded cursor-pointer transition-transform hover:scale-[1.02]"
                onClick={() => handleNav("home")}
              />
            </div>
            
            <p className="text-base font-bold text-slate-200 font-mono tracking-tight leading-relaxed">
              {companyInfo.name}
            </p>

            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Specialized industrial heat treatment and metallurgical services engineered for uniform hardness, core toughness, dimensional precision, and 100% batch traceability.
            </p>

            <div className="pt-2 flex items-center gap-2 text-sm font-mono text-heat-orange font-bold">
              <Flame className="w-4 h-4" />
              <span>PRECISION HEAT TREATMENT // RAJKOT</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="lg:col-span-2 space-y-3 font-mono text-sm">
            <h4 className="text-white font-bold uppercase tracking-wider text-sm pb-1 border-b border-navy-800">
              EXPLORE
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li><button onClick={() => handleNav("home")} className="hover:text-heat-orange transition-colors">Home</button></li>
              <li><button onClick={() => handleNav("about")} className="hover:text-heat-orange transition-colors">About Us</button></li>
              <li><button onClick={() => handleNav("services")} className="hover:text-heat-orange transition-colors">Services</button></li>
              <li><button onClick={() => handleNav("processes")} className="hover:text-heat-orange transition-colors">Processes</button></li>
              <li><button onClick={() => handleNav("quality")} className="hover:text-heat-orange transition-colors">Quality Control</button></li>
              <li><button onClick={() => handleNav("traceability")} className="hover:text-heat-orange transition-colors">Batch Traceability</button></li>
              <li><button onClick={() => handleNav("industries")} className="hover:text-heat-orange transition-colors">Industries</button></li>
              <li><button onClick={() => handleNav("components")} className="hover:text-heat-orange transition-colors">Components</button></li>
              <li><button onClick={() => handleNav("contact")} className="hover:text-heat-orange transition-colors">Contact / RFQ</button></li>
            </ul>
          </div>

          {/* Col 3: Core Thermal Processes */}
          <div className="lg:col-span-3 space-y-3 font-mono text-sm">
            <h4 className="text-white font-bold uppercase tracking-wider text-sm pb-1 border-b border-navy-800">
              HEAT TREATMENT
            </h4>
            <ul className="space-y-2 text-slate-300">
              {services.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <button onClick={() => handleNav("services")} className="hover:text-heat-orange transition-colors truncate block text-left">
                    • {s.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Corporate Contact Details & Compliance */}
          <div className="lg:col-span-3 space-y-3 font-mono text-sm">
            <h4 className="text-white font-bold uppercase tracking-wider text-sm pb-1 border-b border-navy-800">
              PLANT LOCATION
            </h4>
            
            <div className="space-y-2.5 text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-heat-orange shrink-0 mt-0.5" />
                <span>
                  {companyInfo.name}<br />
                  [Factory Address]<br />
                  Rajkot, Gujarat, India
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-heat-orange shrink-0" />
                <span>[Phone]</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-heat-orange shrink-0" />
                <span>[Email]</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-2.5 rounded bg-navy-900 border border-navy-800 text-xs text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>CQI-9 & AMS 2750 Pyrometry Standards</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Strip */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-sm text-slate-400">
          <div>
            © {new Date().getFullYear()} MATHEAT PVT. LTD. All Rights Reserved.
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <span>ENGINEERED IN RAJKOT, GUJARAT</span>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-heat-orange hover:text-white transition-colors font-bold"
            >
              <span>BACK TO TOP</span>
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}

import React, { useState } from 'react';
import {
  FlaskConical,
  ShieldCheck,
  Plus,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const RecipesPage = () => {
  const [recipes, setRecipes] = useState([
    {
      code: 'RCP-EN31-6205',
      name: 'Standard Carburizing Cycle for EN31 Bearing Rings',
      materialGrade: 'EN31',
      revision: 'V1',
      targetTemp: 850,
      soakMinutes: 90,
      carbonPotential: 0.90,
      quenchMedium: 'OIL',
      quenchTemp: 60,
      temperingTemp: 180,
      temperingTime: 120,
      isApproved: true,
      approvedBy: 'Er. Rajesh Sharma (QC Manager)'
    },
    {
      code: 'RCP-20MNCR5-PIN',
      name: 'Deep Case Carburizing for Automotive 24T Pinions',
      materialGrade: '20MnCr5',
      revision: 'V1',
      targetTemp: 920,
      soakMinutes: 180,
      carbonPotential: 1.05,
      quenchMedium: 'OIL',
      quenchTemp: 65,
      temperingTemp: 190,
      temperingTime: 120,
      isApproved: true,
      approvedBy: 'Er. Rajesh Sharma (QC Manager)'
    },
    {
      code: 'RCP-4140-AXLE',
      name: 'Through Hardening & High-Temp Tempering for Axle Shafts',
      materialGrade: 'AISI 4140',
      revision: 'V1',
      targetTemp: 860,
      soakMinutes: 75,
      carbonPotential: 0.0,
      quenchMedium: 'POLYMER',
      quenchTemp: 40,
      temperingTemp: 550,
      temperingTime: 150,
      isApproved: true,
      approvedBy: 'Er. Rajesh Sharma (QC Manager)'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
        <div>
          <h1 className="text-base font-extrabold text-white flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-orange-500" />
            Approved Recipe Studio & Version Control (V1, V2...)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict metallurgical parameters: Target temperatures, soak times, atmosphere CP, quenching & tempering. Never overwritten post-approval!
          </p>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((r) => (
          <div key={r.code} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-mono text-xs font-bold text-orange-400">{r.code}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                Rev {r.revision}
              </span>
            </div>

            <div>
              <h2 className="text-sm font-bold text-white">{r.name}</h2>
              <span className="text-xs text-blue-400 font-mono">Grade: {r.materialGrade}</span>
            </div>

            {/* Cycle Parameters Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">Soaking Temp</span>
                <strong className="text-white">{r.targetTemp} °C</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Soaking Time</span>
                <strong className="text-white">{r.soakMinutes} min</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Atmosphere CP</span>
                <strong className="text-white">{r.carbonPotential > 0 ? `${r.carbonPotential}%` : 'Neutral'}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Quench Medium</span>
                <strong className="text-white">{r.quenchMedium} @ {r.quenchTemp}°C</strong>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 block">Tempering Cycle</span>
                <strong className="text-white">{r.temperingTemp} °C for {r.temperingTime} min</strong>
              </div>
            </div>

            {/* Approval Badge */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
                <ShieldCheck className="h-4 w-4" /> APPROVED & LOCKED
              </div>
              <span className="text-[10px] text-slate-500">By Lead Metallurgist</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

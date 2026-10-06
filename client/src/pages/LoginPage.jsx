import React, { useState } from 'react';
import { Flame, Lock, User, Eye, EyeOff, AlertCircle, Shield, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onLoginSuccess }) => {
  const { login, sessionNotice } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.password.trim()) {
      setError('Username and password are required.');
      return;
    }
    setLoading(true);
    try {
      await login(form.username.trim(), form.password);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans overflow-hidden">
      {/* ── LEFT PANEL: Brand Identity ── */}
      <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-r border-slate-800">
        {/* Decorative grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(251,146,60,0.6) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(251,146,60,0.6) 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Glowing orange orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-orange-500/5 blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full px-14 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-auto">
            <div className="p-2.5 rounded-xl bg-orange-600 shadow-lg shadow-orange-900/50">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-white font-black text-xl tracking-tight">MATHEAT</div>
              <div className="text-orange-400 text-[10px] font-bold uppercase tracking-[0.18em]">Pvt. Ltd.</div>
            </div>
          </div>

          {/* Hero text */}
          <div className="my-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-900/30 border border-orange-800/40 text-orange-400 text-[11px] font-bold uppercase tracking-widest mb-6">
              <Activity className="h-3 w-3" />
              Heat Treatment ERP + MES v2.0
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
              Industrial-Grade<br />
              <span className="text-orange-500">Operations Control</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              End-to-end manufacturing intelligence for heat treatment plants — furnace scheduling, CQI-9 quality control,
              NABL calibration lockouts, customer GSTIN verification, and real-time batch traceability.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-8">
              {['Furnace Telemetry', 'Job Work Orders', 'NABL Calibrations', 'GST Billing', 'QC Lab Portal', 'Batch Traceability'].map((f) => (
                <span
                  key={f}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700 text-slate-300 text-[11px] font-semibold"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="text-slate-600 text-[11px] font-semibold mt-auto flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-slate-600" />
            ISO 9001 · AMS 2750 · CQI-9 Compliant Manufacturing System
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="p-2 rounded-xl bg-orange-600">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-white font-black text-lg tracking-tight">MATHEAT ERP</div>
            <div className="text-orange-400 text-[10px] font-bold uppercase tracking-widest">Pvt. Ltd.</div>
          </div>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            {/* Card Header */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-800">
              <h2 className="text-white text-xl font-black tracking-tight mb-1">Sign In to ERP</h2>
              <p className="text-slate-500 text-xs font-semibold">
                Enter your plant credentials to access the control portal
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
              {/* Session Expired / Status Notice */}
              {sessionNotice && !error && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs font-semibold animate-in fade-in">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{sessionNotice}</span>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/50 border border-rose-900 text-rose-300 text-xs font-semibold">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    autoComplete="username"
                    autoFocus
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-semibold placeholder-slate-600 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/30 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-semibold placeholder-slate-600 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30 mt-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Sign In to ERP
                  </>
                )}
              </button>
            </form>
          </div>


          {/* Footer */}
          <p className="text-center text-slate-600 text-[11px] font-semibold mt-6">
            MATHEAT Pvt. Ltd. · Heat Treatment ERP + MES · Internal Use Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

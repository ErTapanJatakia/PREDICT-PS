/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PREDICT-PS: Header Component
 */

import React from 'react';
import { ShieldAlert, Lock, Cpu, FlaskConical } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-950 text-slate-100">
      {/* Top Banner: Prominent Research Prototype Disclaimer */}
      <div 
        role="alert" 
        className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 text-xs md:text-sm text-amber-200 flex items-center justify-between gap-3 font-mono"
      >
        <div className="flex items-center gap-2 max-w-5xl">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span>
            <strong>RESEARCH PROTOTYPE:</strong> Not a security certification. Academic study in progress investigating password predictability hypotheses.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-300/90 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
          <Lock className="w-3 h-3 text-emerald-400" aria-hidden="true" />
          <span>Phase 2: Local CSPRNG &amp; Patterns</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-emerald-950 border border-emerald-600/60 flex items-center justify-center text-emerald-400 shadow-sm">
                <FlaskConical className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>PREDICT-PS</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-normal bg-slate-800 text-slate-300 border border-slate-700">
                    v0.1.0-alpha
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  Password Predictability Research Workbench
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Runtime Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700/80 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span>Client-Local Only</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700/80 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>Zero Network Egress</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700/80 text-slate-300">
              <Lock className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
              <span>Zero Persistence</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

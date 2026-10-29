/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PREDICT-PS: Footer Component
 */

import React from 'react';
import { Shield, BookOpen, GitBranch } from 'lucide-react';
import { TabKey } from './NavTabs';

interface FooterProps {
  onNavigateTab: (tab: TabKey) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>PREDICT-PS Workbench</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Password Predictability Research Workbench investigating explainable pattern-feature fusion
              against statistical language baselines under strict zero-persistence client privacy.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Academic Integrity Notice</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Research prototype only. Not a commercial security certification or compliance auditor.
              All experimental findings are subject to independent peer validation on public disjoint splits.
            </p>
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="flex items-center gap-2 text-slate-200 font-semibold font-sans">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              <span>Phase Status</span>
            </div>
            <div className="text-slate-400">
              Current: <strong className="text-emerald-400">Phase 1 (Foundation Completed)</strong>
            </div>
            <div className="text-slate-500">
              Next Gate: Phase 2 Unbiased CSPRNG &amp; Pattern Extraction
            </div>
            <div className="pt-1 flex gap-2">
              <button
                onClick={() => onNavigateTab('overview')}
                className="text-slate-400 hover:text-slate-200 underline"
              >
                Roadmap
              </button>
              <span>•</span>
              <button
                onClick={() => onNavigateTab('methodology')}
                className="text-slate-400 hover:text-slate-200 underline"
              >
                Privacy Model
              </button>
              <span>•</span>
              <button
                onClick={() => onNavigateTab('audit')}
                className="text-slate-400 hover:text-slate-200 underline"
              >
                Audit Manifest
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>
            © 2026 PREDICT-PS Research Project. Released under Apache-2.0 License.
          </div>
          <div className="font-mono text-emerald-500/80">
            100% Browser-Local • Zero Server Egress • Zero Storage
          </div>
        </div>
      </div>
    </footer>
  );
};

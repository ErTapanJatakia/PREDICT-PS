/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PREDICT-PS: Overview & Roadmap View
 */

import React from 'react';
import {
  HelpCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Target,
  ArrowRight,
  Shield,
  Fingerprint,
} from 'lucide-react';
import { getResearchPhases, getResearchQuestions } from '../lib/foundation';
import { TabKey } from './NavTabs';

interface OverviewViewProps {
  onNavigateTab: (tab: TabKey) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigateTab }) => {
  const phases = getResearchPhases();
  const questions = getResearchQuestions();

  return (
    <div className="space-y-8">
      {/* Formal Research Hypothesis Box */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-950/80 border border-emerald-600/50 rounded-lg text-emerald-400 shrink-0">
            <Target className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Central Research Hypothesis
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Status: Hypothesis Under Test (No Claim of Novelty or Established Result)
              </span>
            </div>
            <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
              &ldquo;Explainable password-pattern features fused with a conventional character-level
              machine-learning model can improve identification of guessable human-selected passwords
              compared with simple rules, zxcvbn, and a character n-gram ML baseline, while preserving
              password privacy and acceptable computational cost.&rdquo;
            </p>
            <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
              <p className="font-semibold text-slate-300">Methodological Note on Scientific Integrity:</p>
              <p>
                PREDICT-PS is an empirical investigation platform. It does not assert superiority,
                uniqueness, or patent novelty. All claims remain tentative until verified against controlled
                test partitions using formal statistical metrics (PR-AUC, Macro-F1, False-Strong Rate) and
                ablation studies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Research Questions Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Formal Research Questions</h2>
            <p className="text-xs text-slate-400">Structured inquiry governing the Phase 1-6 experimental roadmap</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {questions.map((rq) => (
            <div
              key={rq.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-800 text-cyan-400 rounded border border-cyan-800/60">
                    {rq.code}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Inquiry Target</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-200">{rq.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Hypothesis:</strong> {rq.hypothesis}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] space-y-1.5 font-mono text-slate-400 bg-slate-950/50 p-2.5 rounded">
                <div>
                  <span className="text-slate-500">Method:</span>{' '}
                  <span className="text-slate-300">{rq.testMethodology}</span>
                </div>
                <div>
                  <span className="text-slate-500">Baselines:</span>{' '}
                  <span className="text-emerald-400/90">{rq.baselineComparison}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6-Phase Research Roadmap with Honest Statuses */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Project Roadmap & Milestone Verification</h2>
            <p className="text-xs text-slate-400">
              Clear distinction between completed foundational architecture and future planned experimental phases
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {phases.map((phase) => {
            const isCompleted = phase.status === 'completed';
            const isInProgress = phase.status === 'in-progress';

            return (
              <div
                key={phase.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-800/60 shadow-sm'
                    : isInProgress
                    ? 'bg-amber-950/20 border-amber-800/60'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-500 shrink-0" aria-hidden="true" />
                    )}
                    <div>
                      <span className="text-xs font-mono text-slate-400 mr-2">[{phase.codename}]</span>
                      <span className="text-sm font-semibold text-slate-200">{phase.title}</span>
                    </div>
                  </div>

                  <div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> Completed in Phase 1
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        <Clock className="w-3 h-3" /> Planned (Not Implemented)
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-3 ml-0 sm:ml-7">{phase.summary}</p>

                <div className="ml-0 sm:ml-7 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-800/80">
                  <div>
                    <span className="font-semibold text-slate-300 block mb-1">Key Deliverables:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                      {phase.deliverables.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-300 block mb-1">Privacy & Security Safeguards:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                      {phase.privacySafeguards.map((item, idx) => (
                        <li key={idx} className="text-slate-300/90">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Research Integrity & Anti-Pattern Principles */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 text-slate-200">
          <Shield className="w-5 h-5 text-cyan-400" aria-hidden="true" />
          <h2 className="text-base font-semibold">Scientific Integrity & Non-Negotiable Boundaries</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5">
            <span className="font-semibold text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> No Simulated Quantum Entropy Claims
            </span>
            <p className="text-slate-400">
              PRNG/CSPRNG generation relies on standard browser Web Cryptography APIs (<code>crypto.getRandomValues</code>).
              We explicitly reject labeling mathematical pseudo-random simulation as physical quantum randomness.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5" /> Zero Password Ingestion in Phase 1
            </span>
            <p className="text-slate-400">
              To guarantee zero leak surface in this foundation phase, no interactive password input fields are exposed.
              All planned generators and analyzers are detailed structurally before any active string handling begins.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5">
            <span className="font-semibold text-sky-400 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" /> No Fabricated Results or Metrics
            </span>
            <p className="text-slate-400">
              No simulated benchmark numbers or fake accuracy percentages are displayed. Baselines and comparative numbers
              will appear solely after empirical model weights and public dataset evaluation pipelines are executed.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zero-Cost Open Science Constraint
            </span>
            <p className="text-slate-400">
              Zero paid APIs, zero cloud database billing, and zero external backend reliance. The entire test suite and
              future ML baselines execute via open-source client-side WebAssembly / TypeScript runtime architectures.
            </p>
          </div>
        </div>

        {/* Quick Jump Buttons to Planned Sections */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('password-lab')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
          >
            <span>Inspect Phase 2 Password Lab Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigateTab('experiments')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
          >
            <span>Review Planned 4-Way Experiments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigateTab('methodology')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
          >
            <span>Examine Zero-Egress Privacy Guarantees</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};

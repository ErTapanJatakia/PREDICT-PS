/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PREDICT-PS: Experiments View (Placeholder & Experimental Protocol Specification)
 */

import React from 'react';
import {
  GitCompare,
  Cpu,
  Layers,
  Database,
  ShieldAlert,
  Info,
  CheckCircle2,
  Table,
  SlidersHorizontal,
} from 'lucide-react';
import { getBaselineSpecs } from '../lib/foundation';

export const ExperimentsPlaceholder: React.FC = () => {
  const baselines = getBaselineSpecs();

  return (
    <div className="space-y-8">
      {/* Planned Placeholder Status Box */}
      <div 
        role="region" 
        aria-label="Experimental Framework Notice"
        className="p-5 bg-sky-950/40 border border-sky-800/80 rounded-xl space-y-2"
      >
        <div className="flex items-center gap-2 text-sky-300 font-semibold text-sm">
          <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Placeholder View — Planned for Phases 3-5 Implementation</span>
        </div>
        <p className="text-xs text-sky-200/90 leading-relaxed">
          No experiments or baseline numbers exist yet. In accordance with scientific integrity guidelines,
          we do not display synthetic, mock, or fabricated benchmark results. Below is the formal
          experimental protocol, dataset governance specification, and 4-way comparative baseline design.
        </p>
      </div>

      {/* 4-Way Comparative Baseline Architecture */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-sky-400" aria-hidden="true" />
              <span>4-Way Comparative Baseline Architecture</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Target models to benchmark under identical, strictly controlled test splits
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            Controlled Benchmark
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {baselines.map((baseline) => (
            <div
              key={baseline.id}
              className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200">{baseline.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                  {baseline.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{baseline.description}</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-slate-800 text-slate-400">
                <div>
                  <span className="text-slate-500">Latency:</span>{' '}
                  <span className="text-slate-300">{baseline.computationalCost}</span>
                </div>
                <div>
                  <span className="text-slate-500">Explainability:</span>{' '}
                  <span className="text-cyan-400 capitalize">{baseline.explainability}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Privacy:</span>{' '}
                  <span className="text-emerald-400/90">{baseline.privacyProfile}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dataset Governance & Leakage Prevention Protocol */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-white">
          <Database className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          <h2 className="text-base font-semibold">Planned Dataset Governance & Leakage Prevention Protocol</h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          To ensure valid generalization and prevent the common pitfall of data leakage across frequency-dominated password corpuses, the experimental workbench mandates the following rules:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-lg space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>1. Corpus Deduplication</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              All training and test corpuses will undergo strict deduplication. Frequency weights will be retained as metadata rather than duplicate text instances to prevent identical strings across splits.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-lg space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>2. Strict Partition Separation</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Disjoint 70% Train, 15% Validation, and 15% Blind Test partitions. Zero overlap of character n-gram vocabularies or pattern dictionaries across training and evaluation sets.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-lg space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>3. Target Label Operationalization</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Target class defined operationally as: Guessable within 10⁶ (1 million) simulated offline attempts (using standard state-of-the-art cracking models like PCFG and Hashcat rules) vs High-Entropy resistant.
            </p>
          </div>
        </div>
      </section>

      {/* Planned Feature Ablation Matrix Design */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              <span>Planned Feature Ablation Matrix Design (Phase 6)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Isolating the contribution of each representation to verify hypothesis RQ2
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse border border-slate-800">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                <th className="p-3 border-r border-slate-800">Ablation Variant</th>
                <th className="p-3 border-r border-slate-800">Length/Rules</th>
                <th className="p-3 border-r border-slate-800">Char n-grams</th>
                <th className="p-3 border-r border-slate-800">Pattern Shapes</th>
                <th className="p-3 border-r border-slate-800">Keyboard Walks</th>
                <th className="p-3">Primary Evaluation Goal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-400">
              <tr className="hover:bg-slate-950/40">
                <td className="p-3 font-semibold text-slate-200 border-r border-slate-800">V1: Heuristics Only</td>
                <td className="p-3 text-emerald-400 border-r border-slate-800">✓ Enabled</td>
                <td className="p-3 text-slate-600 border-r border-slate-800">— Disabled</td>
                <td className="p-3 text-slate-600 border-r border-slate-800">— Disabled</td>
                <td className="p-3 text-slate-600 border-r border-slate-800">— Disabled</td>
                <td className="p-3 text-slate-300">Quantify baseline rule deficiency &amp; false-strong rate</td>
              </tr>
              <tr className="hover:bg-slate-950/40">
                <td className="p-3 font-semibold text-slate-200 border-r border-slate-800">V2: n-gram Markov Only</td>
                <td className="p-3 text-slate-600 border-r border-slate-800">— Disabled</td>
                <td className="p-3 text-emerald-400 border-r border-slate-800">✓ Enabled</td>
                <td className="p-3 text-slate-600 border-r border-slate-800">— Disabled</td>
                <td className="p-3 text-slate-600 border-r border-slate-800">— Disabled</td>
                <td className="p-3 text-slate-300">Measure pure statistical sequence log-likelihood power</td>
              </tr>
              <tr className="hover:bg-slate-950/40">
                <td className="p-3 font-semibold text-slate-200 border-r border-slate-800">V3: Patterns Only</td>
                <td className="p-3 text-slate-600 border-r border-slate-800">— Disabled</td>
                <td className="p-3 text-slate-600 border-r border-slate-800">— Disabled</td>
                <td className="p-3 text-emerald-400 border-r border-slate-800">✓ Enabled</td>
                <td className="p-3 text-emerald-400 border-r border-slate-800">✓ Enabled</td>
                <td className="p-3 text-slate-300">Isolate explainable structural token contributions</td>
              </tr>
              <tr className="hover:bg-slate-950/40 bg-emerald-950/10">
                <td className="p-3 font-bold text-emerald-300 border-r border-slate-800">V4: Full Fusion (Proposed)</td>
                <td className="p-3 text-emerald-400 border-r border-slate-800">✓ Enabled</td>
                <td className="p-3 text-emerald-400 border-r border-slate-800">✓ Enabled</td>
                <td className="p-3 text-emerald-400 border-r border-slate-800">✓ Enabled</td>
                <td className="p-3 text-emerald-400 border-r border-slate-800">✓ Enabled</td>
                <td className="p-3 text-emerald-300">Test representation complementarity (RQ2 hypothesis)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

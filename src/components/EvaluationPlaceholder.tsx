/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PREDICT-PS: Evaluation View (Placeholder & Metrics Simulation Sandbox)
 */

import React, { useState } from 'react';
import {
  BarChart3,
  Calculator,
  ShieldAlert,
  Info,
  CheckCircle2,
  TrendingDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getEvaluationMetricSpecs, calculateEvaluationMetrics } from '../lib/foundation';
import { ConfusionMatrixInput } from '../types/research';

export const EvaluationPlaceholder: React.FC = () => {
  const metricSpecs = getEvaluationMetricSpecs();

  // Interactive confusion matrix sandbox state
  const [matrix, setMatrix] = useState<ConfusionMatrixInput>({
    truePositives: 850,   // Guessable correctly detected
    falsePositives: 45,   // Strong mistakenly flagged as guessable
    trueNegatives: 955,   // Strong correctly recognized
    falseNegatives: 50,   // Guessable mistakenly classified as strong (Dangerous!)
  });

  const calculated = calculateEvaluationMetrics(matrix);

  const presets = [
    {
      label: 'Calibrated Balanced Model (Target)',
      matrix: { truePositives: 880, falsePositives: 40, trueNegatives: 960, falseNegatives: 20 },
      desc: 'Target Phase 6 performance: High Macro-F1 (>0.90) and suppressed False-Strong Rate (<2.5%).',
    },
    {
      label: 'Naive Rule-Checker Failure Mode',
      matrix: { truePositives: 520, falsePositives: 120, trueNegatives: 880, falseNegatives: 380 },
      desc: 'Typical heuristic rule engine failure: 380 guessable passwords passed through as strong (FSR = 42.2%!).',
    },
    {
      label: 'Over-Aggressive Conservative Filter',
      matrix: { truePositives: 895, falsePositives: 410, trueNegatives: 590, falseNegatives: 5 },
      desc: 'Low FSR, but heavy False-Weak rate (41% of strong credentials falsely flagged as weak).',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Planned Placeholder Status Box */}
      <div 
        role="region" 
        aria-label="Evaluation Framework Notice"
        className="p-5 bg-indigo-950/40 border border-indigo-800/80 rounded-xl space-y-2"
      >
        <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
          <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Placeholder View — Planned for Phase 6 Implementation</span>
        </div>
        <p className="text-xs text-indigo-200/90 leading-relaxed">
          The evaluation workbench will benchmark all four baseline models against rigorous statistical criteria.
          To maintain scientific integrity, <strong>no empirical test runs or fabricated scores are presented yet</strong>.
          Explore the formal metric definitions and the interactive confusion matrix mathematics simulator below.
        </p>
      </div>

      {/* Metric Specifications Grid */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" aria-hidden="true" />
            <span>Formal Mathematical Evaluation Criteria</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Key indicators selected for class-imbalanced credential distribution analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricSpecs.map((spec) => (
            <div
              key={spec.symbol}
              className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-200">{spec.name}</span>
                  <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-indigo-300 rounded border border-indigo-900">
                    {spec.symbol}
                  </span>
                </div>
                <div className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  {spec.formula}
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{spec.rationale}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono space-y-1">
                <div>
                  <span className="text-slate-500">Target:</span>{' '}
                  <span className="text-emerald-400">{spec.targetThreshold}</span>
                </div>
                <div className="text-slate-400 font-sans text-[11px]">{spec.importanceInCybersecurity}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Metric Response Simulator */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" aria-hidden="true" />
              <span>Interactive Metric Response &amp; Confusion Matrix Sandbox</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate mathematical trade-offs between False-Strong Rate and False-Weak Rate
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
            Pure Metric Simulator
          </span>
        </div>

        {/* Presets */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-slate-300">Preset Scenarios:</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMatrix(p.matrix)}
                className="text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition-colors space-y-1"
              >
                <div className="text-xs font-semibold text-indigo-300">{p.label}</div>
                <div className="text-[11px] text-slate-400">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <label htmlFor="tp-input" className="text-[11px] font-mono text-slate-400 block">
              True Positives (TP)
            </label>
            <input
              id="tp-input"
              type="number"
              min={0}
              value={matrix.truePositives}
              onChange={(e) => setMatrix({ ...matrix, truePositives: Math.max(0, Number(e.target.value)) })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-sm text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500">Correctly detected guessable</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <label htmlFor="fp-input" className="text-[11px] font-mono text-slate-400 block">
              False Positives (FP)
            </label>
            <input
              id="fp-input"
              type="number"
              min={0}
              value={matrix.falsePositives}
              onChange={(e) => setMatrix({ ...matrix, falsePositives: Math.max(0, Number(e.target.value)) })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-sm text-amber-400 font-mono focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-500">Strong flagged as weak</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <label htmlFor="tn-input" className="text-[11px] font-mono text-slate-400 block">
              True Negatives (TN)
            </label>
            <input
              id="tn-input"
              type="number"
              min={0}
              value={matrix.trueNegatives}
              onChange={(e) => setMatrix({ ...matrix, trueNegatives: Math.max(0, Number(e.target.value)) })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-sm text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
            />
            <span className="text-[10px] text-slate-500">Strong correctly accepted</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <label htmlFor="fn-input" className="text-[11px] font-mono text-red-400 font-semibold block">
              False Negatives (FN) ⚠️
            </label>
            <input
              id="fn-input"
              type="number"
              min={0}
              value={matrix.falseNegatives}
              onChange={(e) => setMatrix({ ...matrix, falseNegatives: Math.max(0, Number(e.target.value)) })}
              className="w-full bg-slate-900 border border-red-900 rounded px-2.5 py-1 text-sm text-red-400 font-mono focus:outline-none focus:border-red-500"
            />
            <span className="text-[10px] text-red-400/80 font-medium">Guessable accepted as strong!</span>
          </div>
        </div>

        {/* Calculated Results */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Derived Metric Calculations (N = {calculated.total.toLocaleString()} candidates)</span>
            <span className="text-emerald-400">Deterministic Mathematical Output</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className={`p-3 rounded-lg border ${
              calculated.falseStrongRate < 0.05 
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
                : 'bg-red-950/40 border-red-800 text-red-300'
            }`}>
              <div className="text-[11px] opacity-80">False-Strong Rate (FSR)</div>
              <div className="text-lg font-bold mt-1">
                {(calculated.falseStrongRate * 100).toFixed(2)}%
              </div>
              <div className="text-[10px] opacity-75 mt-0.5">
                {calculated.falseStrongRate < 0.05 ? '✓ Under 5% security budget' : '⚠️ Excessive dangerous misses'}
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-200">
              <div className="text-[11px] text-slate-400">Macro-F1 Score</div>
              <div className="text-lg font-bold text-indigo-400 mt-1">
                {calculated.macroF1.toFixed(3)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Balanced across both classes</div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-200">
              <div className="text-[11px] text-slate-400">Precision (PPV)</div>
              <div className="text-lg font-bold text-cyan-400 mt-1">
                {(calculated.precision * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Flagged that were truly guessable</div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-200">
              <div className="text-[11px] text-slate-400">Recall / Sensitivity</div>
              <div className="text-lg font-bold text-amber-400 mt-1">
                {(calculated.recall * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Total guessable caught</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

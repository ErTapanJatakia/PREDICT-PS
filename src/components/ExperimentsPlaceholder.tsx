/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PREDICT-PS: Experiments & Empirical Baselines Workbench
 * Phase 4 & Phase 4.1 Implementation: Research Integrity & Baseline Validation
 */

import React, { useState } from 'react';
import {
  GitCompare,
  Cpu,
  Layers,
  Database,
  ShieldAlert,
  Info,
  CheckCircle2,
  SlidersHorizontal,
  FileCode,
  Upload,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Activity,
  Gauge,
  BarChart3,
  Check,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Scale,
  Sparkles,
  Boxes,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { getBaselineSpecs, validatePhase4ArtifactSchema, validatePhase41ManifestSchema, validatePhase423AuditManifestSchema } from '../lib/foundation';
import {
  Phase4Artifact,
  Phase4PipelineStatus,
  Phase41Manifest,
  Phase41ExperimentResult,
  Phase42GeneralizationManifest,
  Phase42GeneralizationExperimentResult,
  Phase423AuditManifest,
  Phase423ExperimentResult
} from '../types/research';
import rawCanonicalArtifact from '../data/phase4_baseline_metrics.json';
import rawPhase41Manifest from '../data/phase4_1_experiments_manifest.json';
import rawGeneralizationManifest from '../data/phase4_2_generalization_manifest.json';
import rawPhase423AuditManifest from '../data/phase4_2_3_audit_manifest.json';

// Default canonical validation artifacts
const DEFAULT_VALIDATION_ARTIFACT: Phase4Artifact = rawCanonicalArtifact as unknown as Phase4Artifact;
const CANONICAL_PHASE41_MANIFEST: Phase41Manifest = rawPhase41Manifest as unknown as Phase41Manifest;
const CANONICAL_PHASE42_GENERALIZATION_MANIFEST: Phase42GeneralizationManifest = rawGeneralizationManifest as unknown as Phase42GeneralizationManifest;
const CANONICAL_PHASE423_AUDIT_MANIFEST: Phase423AuditManifest = rawPhase423AuditManifest as unknown as Phase423AuditManifest;

export const ExperimentsPlaceholder: React.FC = () => {
  const baselines = getBaselineSpecs();
  const [pipelineState, setPipelineState] = useState<Phase4PipelineStatus>('synthetic_pipeline_validation');
  const [activeArtifact, setActiveArtifact] = useState<Phase4Artifact>(DEFAULT_VALIDATION_ARTIFACT);
  const [manifestData, setManifestData] = useState<Phase41Manifest>(CANONICAL_PHASE41_MANIFEST);
  const [genManifestData, setGenManifestData] = useState<Phase42GeneralizationManifest>(CANONICAL_PHASE42_GENERALIZATION_MANIFEST);
  const [audit423ManifestData, setAudit423ManifestData] = useState<Phase423AuditManifest>(CANONICAL_PHASE423_AUDIT_MANIFEST);
  const [experimentTrack, setExperimentTrack] = useState<'phase423_audit' | 'generalization_audit' | 'ablation_matrix'>('phase423_audit');
  const [selectedExpId, setSelectedExpId] = useState<string>('exp_g9_combined_lexical_template_isolation');
  const [sweepThreshold, setSweepThreshold] = useState<number | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportErrors([]);
    setImportSuccess(false);

    try {
      const parsed = JSON.parse(importJsonText);
      const validation = validatePhase4ArtifactSchema(parsed);
      if (!validation.valid) {
        setImportErrors(validation.errors);
        return;
      }

      if (parsed.schema_version === 'predict_ps_phase4_1_v1') {
        setManifestData(parsed as Phase41Manifest);
      } else {
        setActiveArtifact(parsed as Phase4Artifact);
        setPipelineState(parsed.pipeline_status);
      }

      setImportSuccess(true);
      setTimeout(() => {
        setShowImportModal(false);
        setImportSuccess(false);
      }, 1200);
    } catch {
      setImportErrors(['Invalid JSON syntax. Please verify JSON format.']);
    }
  };

  const handleResetToValidation = () => {
    setActiveArtifact(DEFAULT_VALIDATION_ARTIFACT);
    setManifestData(CANONICAL_PHASE41_MANIFEST);
    setPipelineState('synthetic_pipeline_validation');
  };

  const handleSetNotTrained = () => {
    setPipelineState('not_trained');
  };

  const currentMetrics = activeArtifact.evaluation_metrics.test_split;
  const ablationList: Phase41ExperimentResult[] = Object.values(manifestData.experiments);
  const generalizationList: Phase42GeneralizationExperimentResult[] = Object.values(genManifestData.experiments);
  const audit423List: Phase423ExperimentResult[] = Object.values(audit423ManifestData.experiments);
  const activeList =
    experimentTrack === 'phase423_audit'
      ? audit423List
      : experimentTrack === 'generalization_audit'
      ? generalizationList
      : ablationList;
  const activeSelectedExp = activeList.find(e => e.experiment_id === selectedExpId) || activeList[0];

  return (
    <div className="space-y-8">
      {/* Phase 4 Header & Status Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PHASE 4 ACTIVE
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              PHASE 4.2.3 AUDIT ACTIVE
            </span>
            <span className="text-xs font-mono text-slate-400">
              Scientific Integrity, Robustness &amp; Reconciliation
            </span>
          </div>
          <h1 className="text-lg font-bold text-white mt-1">
            Character n-gram ML Baseline &amp; Research Integrity Workbench (Phase 4 / 4.2.3)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical n-gram TF-IDF + Logistic Regression benchmark, combined lexical-template isolation, generator artefact audit, and threshold robustness
          </p>
        </div>

        {/* State Toggle & Import Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              type="button"
              onClick={handleResetToValidation}
              className={`px-3 py-1 rounded transition-colors ${
                pipelineState === 'synthetic_pipeline_validation'
                  ? 'bg-sky-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Synthetic Validation
            </button>
            <button
              type="button"
              onClick={handleSetNotTrained}
              className={`px-3 py-1 rounded transition-colors ${
                pipelineState === 'not_trained'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Not Trained
            </button>
            {pipelineState === 'approved_research_evaluation' && (
              <span className="px-3 py-1 rounded bg-purple-600 text-white font-bold">
                Approved Research
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>Import Artifact</span>
          </button>
        </div>
      </div>

      {/* When in Not Trained State */}
      {pipelineState === 'not_trained' ? (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Terminal className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-semibold text-white">Pipeline Not Trained in Current Session</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No machine learning baseline model weights or evaluations are currently active. You can run the reproducible Python experiment pipeline locally or restore the canonical synthetic validation artifact.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={handleResetToValidation}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Load Synthetic Baseline Artifact</span>
            </button>
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              <span>Import Custom Experiment JSON</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* SECTION: Phase 4.2.3 — Combined Generalization, Audit & Robustness Suite  */}
          {/* ========================================================================= */}
          <section className="bg-slate-900 border border-indigo-900/40 rounded-xl p-6 space-y-6 relative overflow-hidden">
            {/* Track Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2 rounded-lg border border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400 px-2 font-semibold">Track Selector:</span>
                <button
                  type="button"
                  onClick={() => {
                    setExperimentTrack('phase423_audit');
                    setSelectedExpId('exp_g9_combined_lexical_template_isolation');
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                    experimentTrack === 'phase423_audit'
                      ? 'bg-indigo-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  Track C: Phase 4.2.3 Combined Isolation &amp; Threshold Audit (10 Experiments)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExperimentTrack('generalization_audit');
                    setSelectedExpId('exp_g1_random_split_baseline');
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                    experimentTrack === 'generalization_audit'
                      ? 'bg-indigo-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  Track B: Phase 4.2.2 Generalization &amp; Leakage Audit (8 Tracks)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExperimentTrack('ablation_matrix');
                    setSelectedExpId('exp1_original_ngram_baseline');
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                    experimentTrack === 'ablation_matrix'
                      ? 'bg-indigo-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  Track A: Phase 4.2 Baseline &amp; Shortcut Ablation (8 Experiments)
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-400 px-2">
                Showing: <span className="text-white font-semibold">{activeList.length} Experiments</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    {experimentTrack === 'phase423_audit'
                      ? 'PHASE 4.2.3 COMBINED ISOLATION & THRESHOLD AUDIT ACTIVE'
                      : experimentTrack === 'generalization_audit'
                      ? 'PHASE 4.2.2 GENERALIZATION AUDIT ACTIVE'
                      : 'PHASE 4.2 ABLATION MATRIX ACTIVE'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40">
                    Status: Canonical Run Verified (N=4,000, Holdout=1,000, Resamples=1,000)
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-400" />
                  <span>
                    {experimentTrack === 'phase423_audit'
                      ? 'Phase 4.2.3 — Combined Lexical-Template Isolation, Generator Audit & Threshold Robustness'
                      : experimentTrack === 'generalization_audit'
                      ? 'Phase 4.2.2 — Lexical Leakage, Template Generalization & Independent Generator Audit'
                      : 'Phase 4.2 — Statistical Correction, Artifact Synchronization & Integrity Gate'}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {experimentTrack === 'phase423_audit'
                    ? 'Dual-disjoint holdout (words & templates), pseudo-phonetic syllabic negative generator, threshold sensitivity sweeps, and degenerate null-decision diagnosis'
                    : experimentTrack === 'generalization_audit'
                    ? 'Rigorous audit of lexical word isolation, template-family holdout, and independent generator V2 under matched length (14) and composition'
                    : 'Controlled empirical ablation: Investigating synthetic-data shortcuts, dual length & composition matching, and out-of-distribution transfer'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500">Python:</span>{' '}
                  <span className="text-slate-200 font-semibold">{audit423ManifestData.environment.python_version}</span>
                </div>
                <span className="text-slate-700">•</span>
                <div>
                  <span className="text-slate-500">scikit-learn:</span>{' '}
                  <span className="text-emerald-400 font-semibold">{audit423ManifestData.environment.scikit_learn_version}</span>
                </div>
                <span className="text-slate-700">•</span>
                <div>
                  <span className="text-slate-500">Tests:</span>{' '}
                  <span className="text-sky-400 font-semibold">45/45 Py OK • 30/30 TS OK • 6/6 Rec OK</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Findings Alert Cards */}
            {experimentTrack === 'phase423_audit' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/40 rounded-lg space-y-1">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>1. Combined Lexical+Template Holdout</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Exp G9 simultaneously holds out dictionary root words (<strong className="text-white">206 train / 44 val / 44 test</strong>) AND template families (Prefix/Suffix in train, WordSymbols in val, PrefixSymbols in test). Achieves <strong className="text-emerald-300">98.50% Acc</strong>, <strong className="text-emerald-300">0.67% FSR</strong>, <strong className="text-emerald-300">0.9991 ROC-AUC</strong> at τ = 0.39.
                  </p>
                </div>

                <div className="p-3.5 bg-purple-950/20 border border-purple-800/40 rounded-lg space-y-1">
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>2. Syllabic Negatives (Exp G10)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    When negatives use pseudo-phonetic / syllabic consonant-vowel clusters (e.g. <code className="text-purple-300 font-mono">bapomilu</code>) instead of uniform character scrambles, ROC-AUC collapses from <strong className="text-white">0.9643</strong> down to <strong className="text-purple-300">0.6357</strong> and Acc falls to <strong className="text-purple-300">58.70%</strong>, revealing character n-gram reliance on transition noise.
                  </p>
                </div>

                <div className="p-3.5 bg-red-950/20 border border-red-800/40 rounded-lg space-y-1">
                  <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>3. Degenerate Null-Decision Regimes</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Under distribution shift (Exp G6 lexical collapse &amp; G8 template shift), the classifier assigns Label 0 to 100% of samples (<strong className="text-red-300">PPR = 0.0%</strong>, FSR = 100.0%). On balanced 50/50 test sets, this yields nominal <strong className="text-white">50.0% accuracy</strong> from null boundary collapse, <strong className="text-red-300 font-bold">NOT random guessing</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-sky-950/20 border border-sky-800/40 rounded-lg space-y-1">
                  <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>4. Sequence Transition Parity</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Jensen-Shannon transition divergence drops from <strong className="text-white">0.1395</strong> (uniform negatives) down to <strong className="text-sky-300">0.0822</strong> (syllabic negatives), closing the character-class transition entropy gap while maintaining <strong className="text-emerald-300">0.00% stem overlap</strong>.
                  </p>
                </div>
              </div>
            ) : experimentTrack === 'generalization_audit' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/40 rounded-lg space-y-1">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>1. Lexical Group Isolation</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Dictionary words partitioned strictly across splits: <strong className="text-white">207 train</strong>, <strong className="text-white">44 val</strong>, and <strong className="text-white">45 test</strong>. <strong className="text-emerald-300">0 shared words</strong> (zero lexical leakage verified).
                  </p>
                </div>

                <div className="p-3.5 bg-amber-950/20 border border-amber-800/40 rounded-lg space-y-1">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>2. Lexical Memorization Collapse</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Lexical-only diagnostic scores <strong className="text-amber-300">99.67%</strong> on random splits where words repeat, but collapses to <strong className="text-white">50.00% (ROC-AUC 0.5000)</strong> on lexical-disjoint splits, proving random splits induce word memorization shortcuts.
                  </p>
                </div>

                <div className="p-3.5 bg-indigo-950/20 border border-indigo-800/40 rounded-lg space-y-1">
                  <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>3. Positional Slot Breakdown</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Position-aware diagnostic achieves <strong className="text-indigo-300">99.50%</strong> on standard templates by memorizing uppercase/digit slots, but collapses to <strong className="text-white">50.00% (ROC-AUC 0.7158)</strong> when evaluated on held-out template families.
                  </p>
                </div>

                <div className="p-3.5 bg-red-950/20 border border-red-800/40 rounded-lg space-y-1">
                  <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
                    <span>4. Independent Generator V2</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Tested on novel phonetic compound stems with bracket/interleaved affix geometries (matched 14 chars), model accuracy drops to <strong className="text-red-300">75.00%</strong> and FSR surges to <strong className="text-red-400">49.20%</strong>, confirming generator dependence.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3.5 bg-amber-950/20 border border-amber-800/40 rounded-lg space-y-1">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>1. Length Shortcut</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    On unconstrained data, candidate length alone (Exp 5) yields <strong className="text-white">94.00% accuracy</strong> and <strong className="text-white">0.9896 ROC-AUC</strong> due to a <code className="text-amber-200">6.6 char</code> delta between positive (9.3) and negative (15.9) samples.
                  </p>
                </div>

                <div className="p-3.5 bg-amber-950/20 border border-amber-800/40 rounded-lg space-y-1">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>2. Composition Shortcut</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Coarse character-class counts alone (Exp 6) achieve <strong className="text-white">99.50% accuracy</strong>, demonstrating that unconstrained synthetic templates are trivially separable by character set frequencies.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/40 rounded-lg space-y-1">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>3. Dual-Control Subwords</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    When length (14) AND character counts (8 lower, 2 upper, 2 digits, 2 symbols) are strictly matched (Exp 7 &amp; 8), composition diagnostic collapses to <strong className="text-slate-300">50%</strong> while n-grams retain <strong className="text-emerald-300">100%</strong> on in-distribution subwords.
                  </p>
                </div>

                <div className="p-3.5 bg-red-950/20 border border-red-800/40 rounded-lg space-y-1">
                  <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
                    <span>4. OOD Transfer Collapse</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    When evaluated against novel pattern grammars (Exp 4 holdout: ISO dates, PINs, zigzag walks), False-Strong Rate surges to <strong className="text-red-300">71.20%</strong> and Recall drops to <strong className="text-white">28.80%</strong>. Validates hypothesis RQ2 for structural feature fusion.
                  </p>
                </div>
              </div>
            )}

            {/* 8-Experiment Comparative Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                  {experimentTrack === 'generalization_audit'
                    ? `Generalization & Leakage Audit Matrix (${activeList.length} Tracks)`
                    : `Controlled Empirical Ablation Matrix (${activeList.length} Experiments)`}
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Select an experiment row to inspect detailed diagnostics below
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                      <th className="p-2.5">Experiment</th>
                      <th className="p-2.5">Evaluation Scope</th>
                      <th className="p-2.5 text-red-400">FSR</th>
                      <th className="p-2.5 text-emerald-400">Macro-F1</th>
                      <th className="p-2.5 text-sky-400">PR-AUC</th>
                      <th className="p-2.5 text-cyan-400">ROC-AUC</th>
                      <th className="p-2.5 text-slate-300">Balanced Acc</th>
                      <th className="p-2.5 text-amber-400">Brier</th>
                      <th className="p-2.5">95% CI (F1)</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {activeList.map((exp) => {
                      const isSelected = selectedExpId === exp.experiment_id;
                      const f1Ci = exp.metrics.confidence_intervals_95?.macro_f1;
                      return (
                        <tr
                          key={exp.experiment_id}
                          onClick={() => setSelectedExpId(exp.experiment_id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-indigo-950/40 text-white font-semibold'
                              : 'hover:bg-slate-950/50'
                          }`}
                        >
                          <td className="p-2.5 flex items-center gap-2">
                            {isSelected ? (
                              <div className="w-2 h-2 rounded-full bg-indigo-400" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-slate-700" />
                            )}
                            <span>{exp.title}</span>
                          </td>
                          <td className="p-2.5 text-slate-400 text-[11px]">
                            {exp.experiment_id === 'exp4_independent_holdout_transfer'
                              ? 'Out-of-Distribution (Holdout)'
                              : exp.experiment_id.includes('diagnostic')
                              ? 'Shortcut Diagnostic'
                              : 'In-Distribution (Controlled)'}
                          </td>
                          <td className="p-2.5 font-bold font-mono text-red-400">
                            {(exp.metrics.false_strong_rate * 100).toFixed(2)}%
                          </td>
                          <td className="p-2.5 font-bold font-mono text-emerald-400">
                            {exp.metrics.macro_f1.toFixed(4)}
                          </td>
                          <td className="p-2.5 font-mono text-sky-400">
                            {exp.metrics.pr_auc.toFixed(4)}
                          </td>
                          <td className="p-2.5 font-mono text-cyan-400">
                            {exp.metrics.roc_auc.toFixed(4)}
                          </td>
                          <td className="p-2.5 font-mono text-slate-200">
                            {((exp.metrics.balanced_accuracy ?? exp.metrics.accuracy) * 100).toFixed(2)}%
                          </td>
                          <td className="p-2.5 font-mono text-amber-400">
                            {exp.metrics.brier_score.toFixed(4)}
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-400">
                            {f1Ci ? `[${f1Ci.lower_95.toFixed(3)}, ${f1Ci.upper_95.toFixed(3)}]` : 'N/A'}
                          </td>
                          <td className="p-2.5 text-right">
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {isSelected ? 'Viewing' : 'Inspect'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Experiment Deep Dive Card */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-sky-400 uppercase">
                      Selected Diagnostic Deep Dive:
                    </span>
                    <h4 className="text-sm font-bold text-white">{activeSelectedExp.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{activeSelectedExp.description}</p>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Fixed Threshold: <span className="text-emerald-400 font-bold">τ = {activeSelectedExp.threshold}</span> (Val Selected &amp; Fixed for Bootstrap)
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase">TP / FN Breakdown</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {activeSelectedExp.metrics.confusion_matrix.true_positives} TP /{' '}
                    <span className="text-red-400">{activeSelectedExp.metrics.confusion_matrix.false_negatives} FN</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    FSR = {(activeSelectedExp.metrics.false_strong_rate * 100).toFixed(2)}%
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase">TN / FP Breakdown</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {activeSelectedExp.metrics.confusion_matrix.true_negatives} TN /{' '}
                    <span className="text-amber-400">{activeSelectedExp.metrics.confusion_matrix.false_positives} FP</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    FWR = {(activeSelectedExp.metrics.false_weak_rate * 100).toFixed(2)}%
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase">Specificity &amp; NPV</div>
                  <div className="text-base font-bold text-cyan-400 mt-0.5">
                    {((activeSelectedExp.metrics.specificity ?? 1) * 100).toFixed(1)}% Spec
                  </div>
                  <div className="text-[10px] text-slate-400">
                    NPV = {((activeSelectedExp.metrics.negative_predictive_value ?? 1) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase">Calibration (ECE)</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">
                    {activeSelectedExp.metrics.calibration?.expected_calibration_error.toFixed(4) ?? 'N/A'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Brier = {activeSelectedExp.metrics.brier_score.toFixed(4)}
                  </div>
                </div>
              </div>

              {/* 95% Confidence Intervals Breakdown with Complete Resample Accounting */}
              {activeSelectedExp.metrics.confidence_intervals_95 && (
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
                  <div className="text-xs font-semibold text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-sky-400" />
                      <span>Empirical Bootstrap 95% Confidence Intervals (Percentile Method)</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300">
                      Evaluated at fixed τ = {activeSelectedExp.metrics.confidence_intervals_95.methodology.threshold_used ?? activeSelectedExp.threshold} • {activeSelectedExp.metrics.confidence_intervals_95.methodology.valid_resamples ?? 1000}/1000 Valid Resamples
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500">Accuracy CI:</span>{' '}
                      <span className="text-slate-200 font-bold">
                        [{(activeSelectedExp.metrics.confidence_intervals_95.accuracy.lower_95 * 100).toFixed(1)}%,{' '}
                        {(activeSelectedExp.metrics.confidence_intervals_95.accuracy.upper_95 * 100).toFixed(1)}%]
                      </span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500">Macro-F1 CI:</span>{' '}
                      <span className="text-emerald-400 font-bold">
                        [{activeSelectedExp.metrics.confidence_intervals_95.macro_f1.lower_95.toFixed(3)},{' '}
                        {activeSelectedExp.metrics.confidence_intervals_95.macro_f1.upper_95.toFixed(3)}]
                      </span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500">False-Strong CI:</span>{' '}
                      <span className="text-red-400 font-bold">
                        [{(activeSelectedExp.metrics.confidence_intervals_95.false_strong_rate.lower_95 * 100).toFixed(1)}%,{' '}
                        {(activeSelectedExp.metrics.confidence_intervals_95.false_strong_rate.upper_95 * 100).toFixed(1)}%]
                      </span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500">PR-AUC CI:</span>{' '}
                      <span className="text-sky-400 font-bold">
                        [{activeSelectedExp.metrics.confidence_intervals_95.pr_auc.lower_95.toFixed(3)},{' '}
                        {activeSelectedExp.metrics.confidence_intervals_95.pr_auc.upper_95.toFixed(3)}]
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    Methodological Note: Confidence intervals quantify statistical sampling variance on synthetic test partitions using the exact validation-selected threshold; they do not represent variance across human password populations.
                  </p>
                </div>
              )}

              {/* Threshold Robustness & Degenerate Regime Inspector */}
              {(activeSelectedExp as Phase423ExperimentResult).threshold_robustness && (() => {
                const rob = (activeSelectedExp as Phase423ExperimentResult).threshold_robustness!;
                const reg = rob.classification_regime;
                const metricsAtTau = rob.metrics_at_selected_threshold;
                const cm = metricsAtTau.confusion_matrix;
                const ppr = metricsAtTau.predicted_positive_rate;

                return (
                  <div className="p-4 bg-slate-950 border border-indigo-900/40 rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                          Threshold Robustness &amp; Decision Regime Analysis (τ_val = {rob.selected_validation_threshold})
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {reg.is_degenerate_all_negative ? (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-red-950/60 text-red-300 border border-red-700/60 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                            DEGENERATE NULL REGIME (PPR = 0.0%)
                          </span>
                        ) : reg.regime_type === 'balanced_classification' ? (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            BALANCED REGIME (PPR = {(ppr * 100).toFixed(1)}%)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-700/60 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            SKEWED REGIME (PPR = {(ppr * 100).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Decision Regime Explanation Alert */}
                    <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
                      reg.is_degenerate_all_negative
                        ? 'bg-red-950/30 border-red-800/40 text-red-200'
                        : reg.regime_type === 'balanced_classification'
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                        : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                    }`}>
                      <p className="font-semibold">{reg.explanation}</p>
                      <p className="text-[11px] mt-1 text-slate-400">
                        <strong>Ranking vs. Classification Invariant:</strong> {rob.ranking_vs_classification_summary.interpretation}
                      </p>
                    </div>

                    {/* Threshold Metric Summary & Full Confusion Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                        <div className="text-[10px] text-slate-500 uppercase">Predicted Positive Rate</div>
                        <div className="text-base font-bold text-white mt-0.5">{(ppr * 100).toFixed(1)}%</div>
                        <div className="text-[10px] text-slate-400">{cm.true_positives + cm.false_positives} of {cm.total} flagged weak</div>
                      </div>
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                        <div className="text-[10px] text-slate-500 uppercase">Sensitivity (Recall)</div>
                        <div className={`text-base font-bold mt-0.5 ${metricsAtTau.sensitivity > 0.8 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {(metricsAtTau.sensitivity * 100).toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-slate-400">TP / (TP + FN)</div>
                      </div>
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                        <div className="text-[10px] text-slate-500 uppercase">Specificity</div>
                        <div className="text-base font-bold text-cyan-400 mt-0.5">
                          {(metricsAtTau.specificity * 100).toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-slate-400">TN / (TN + FP)</div>
                      </div>
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                        <div className="text-[10px] text-slate-500 uppercase">False Strong Rate</div>
                        <div className={`text-base font-bold mt-0.5 ${metricsAtTau.false_strong_rate > 0.1 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {(metricsAtTau.false_strong_rate * 100).toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-slate-400">Critical missed weak</div>
                      </div>
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                        <div className="text-[10px] text-slate-500 uppercase">ROC-AUC / PR-AUC</div>
                        <div className="text-base font-bold text-purple-400 mt-0.5">
                          {metricsAtTau.roc_auc.toFixed(3)} / {metricsAtTau.pr_auc.toFixed(3)}
                        </div>
                        <div className="text-[10px] text-slate-400">Threshold-invariant</div>
                      </div>
                    </div>

                    {/* Threshold Sensitivity Sweep Table */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5 font-mono">
                          <TrendingDown className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Validation &amp; Test Metric Sweep Across Thresholds (τ ∈ [0.05, 0.95])</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Row with <span className="text-emerald-400 font-bold">★ Selected τ</span> corresponds to validation-selected threshold
                        </span>
                      </div>

                      <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-lg text-xs font-mono">
                        <table className="w-full text-left border-collapse">
                          <thead className="sticky top-0 bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                            <tr>
                              <th className="p-2">τ (Threshold)</th>
                              <th className="p-2">Val Macro-F1</th>
                              <th className="p-2">Val FSR</th>
                              <th className="p-2">Val PPR</th>
                              <th className="p-2 text-slate-200">Test Acc</th>
                              <th className="p-2 text-emerald-400">Test Macro-F1</th>
                              <th className="p-2 text-red-400">Test FSR</th>
                              <th className="p-2 text-sky-400">Test PPR</th>
                              <th className="p-2">Confusion (TP/FP/TN/FN)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80 text-slate-300 text-[11px]">
                            {rob.threshold_sweep_curve.map((pt) => (
                              <tr
                                key={pt.threshold}
                                className={pt.is_selected ? 'bg-indigo-950/50 font-bold text-white' : 'hover:bg-slate-900/40'}
                              >
                                <td className="p-2 font-bold flex items-center gap-1">
                                  {pt.is_selected && <span className="text-emerald-400">★</span>}
                                  <span>{pt.threshold.toFixed(2)}</span>
                                </td>
                                <td className="p-2 text-slate-400">{pt.val_macro_f1.toFixed(3)}</td>
                                <td className="p-2 text-slate-400">{(pt.val_fsr * 100).toFixed(1)}%</td>
                                <td className="p-2 text-slate-400">{(pt.val_ppr * 100).toFixed(1)}%</td>
                                <td className="p-2 font-semibold">{(pt.test_accuracy * 100).toFixed(1)}%</td>
                                <td className="p-2 text-emerald-400 font-semibold">{pt.test_macro_f1.toFixed(3)}</td>
                                <td className="p-2 text-red-400 font-semibold">{(pt.test_fsr * 100).toFixed(1)}%</td>
                                <td className="p-2 text-sky-400">{(pt.test_ppr * 100).toFixed(1)}%</td>
                                <td className="p-2 text-slate-400 text-[10px]">
                                  {pt.test_confusion_matrix.tp} / {pt.test_confusion_matrix.fp} / {pt.test_confusion_matrix.tn} / {pt.test_confusion_matrix.fn}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Dataset Composition & Partition Isolation Audit */}
            {experimentTrack === 'phase423_audit' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Combined Lexical and Template Isolation Card */}
                  <div className="p-4 bg-slate-950/80 border border-indigo-900/40 rounded-xl space-y-3">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <span>Combined Lexical &amp; Template Isolation (Exp G9)</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/40">
                        Dual Disjoint Verified
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px] font-mono text-slate-300">
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Lexical Roots Disjoint:</span>
                        <span className="text-emerald-400 font-bold">
                          {audit423ManifestData.combined_generalization_audit.combined_isolation_audit.counts.train_words} Train / {audit423ManifestData.combined_generalization_audit.combined_isolation_audit.counts.val_words} Val / {audit423ManifestData.combined_generalization_audit.combined_isolation_audit.counts.test_words} Test
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Shared Root Words:</span>
                        <span className="text-emerald-400 font-bold">
                          0 across Train ∩ Val ∩ Test
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Disjoint Positive Templates:</span>
                        <span className="text-sky-400 font-bold">
                          Train (2) vs Val (1) vs Test (1)
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Test Template Family:</span>
                        <span className="text-purple-300 font-bold">PrefixSymbols (Held-out)</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Matched Geometry:</span>
                        <span className="text-slate-200">14 chars • 8L / 2U / 2D / 2S</span>
                      </div>
                    </div>
                  </div>

                  {/* Sequence Transition & Stem Overlap Audit */}
                  <div className="p-4 bg-slate-950/80 border border-indigo-900/40 rounded-xl space-y-3">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                        <span>Generator Transition Divergence &amp; Stem Isolation</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                        0.00% Stem Overlap
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px] font-mono text-slate-300">
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Uniform Negatives JS Divergence:</span>
                        <span className="text-amber-400 font-bold">
                          D_JS = {audit423ManifestData.generator_artefact_audits.v2_uniform_audit.transition_divergence.jensen_shannon_divergence.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Syllabic Negatives JS Divergence:</span>
                        <span className="text-emerald-400 font-bold">
                          D_JS = {audit423ManifestData.generator_artefact_audits.v2b_syllabic_audit.transition_divergence.jensen_shannon_divergence.toFixed(4)} (-41% gap)
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Syllabic Cosine Similarity:</span>
                        <span className="text-sky-400 font-bold">
                          {audit423ManifestData.generator_artefact_audits.v2b_syllabic_audit.transition_divergence.cosine_similarity.toFixed(4)} (Parity)
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Dictionary Stem Leakage in Negatives:</span>
                        <span className="text-emerald-400 font-bold">0.00% (0 / 500 checked)</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Transfer Impact (Exp G10):</span>
                        <span className="text-red-400 font-bold">ROC-AUC collapses 0.964 → 0.636</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automated Manifest Reconciliation & Statistical Gate Badge */}
                <div className="p-3.5 bg-slate-950/90 border border-emerald-900/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-200 font-semibold">
                      Automated Manifest Reconciliation Gate:
                    </span>
                    <span className="text-emerald-400 font-bold">
                      6 / 6 Checks Verified (`python/verify_manifest_reconciliation.py`)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                      B = 1,000 Bootstraps at Fixed τ_val
                    </span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                      Zero Raw Passwords
                    </span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-emerald-300">
                      Synchronized Artifacts
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Length & Shortcut Diagnostics */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-emerald-400" />
                      <span>Dataset Composition &amp; Length Discrepancy</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      N = {manifestData.dataset_diagnostics.original_dataset.sample_count} Samples
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px] font-mono text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Original Pos Mean Length:</span>
                      <span className="text-amber-400 font-bold">
                        {manifestData.dataset_diagnostics.original_dataset.length_statistics.positive_class.mean} chars
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Original Neg Mean Length:</span>
                      <span className="text-sky-400 font-bold">
                        {manifestData.dataset_diagnostics.original_dataset.length_statistics.negative_class.mean} chars
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Original Length Delta (Shortcut):</span>
                      <span className="text-red-400 font-bold">
                        +{manifestData.dataset_diagnostics.original_dataset.length_statistics.length_discrepancy_delta} chars
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Controlled Exp 2 Length Delta:</span>
                      <span className="text-emerald-400 font-bold">
                        {manifestData.dataset_diagnostics.length_controlled_dataset.length_statistics.length_discrepancy_delta} chars (Eliminated)
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Alphabet Size / Distinct Chars:</span>
                      <span className="text-slate-200">
                        {manifestData.dataset_diagnostics.original_dataset.character_statistics.total_distinct_alphabet_size} unique symbols
                      </span>
                    </div>
                  </div>
                </div>

                {/* Leakage Audit */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Leakage Audit &amp; Split Separation</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                      Zero Leakage Verified
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px] font-mono text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Train ∩ Val Exact Duplicates:</span>
                      <span className="text-emerald-400 font-bold">
                        {manifestData.dataset_diagnostics.partition_isolation_audit.exact_cross_split_duplicates.train_val}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Train ∩ Test Exact Duplicates:</span>
                      <span className="text-emerald-400 font-bold">
                        {manifestData.dataset_diagnostics.partition_isolation_audit.exact_cross_split_duplicates.train_test}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Val ∩ Test Exact Duplicates:</span>
                      <span className="text-emerald-400 font-bold">
                        {manifestData.dataset_diagnostics.partition_isolation_audit.exact_cross_split_duplicates.val_test}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Case-Normalized Duplicates:</span>
                      <span className="text-emerald-400 font-bold">0 across all splits</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Target Label Independence:</span>
                      <span className="text-emerald-400 font-bold">Zero metadata in feature matrix</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* SECTION: Baseline Metrics Summary (Phase 4 Comparator) */}
          {/* ========================================================================= */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Original Baseline Metrics (Exp 1 Test Split, τ = {activeArtifact.evaluation_metrics.threshold ?? 0.5})</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                N = {activeArtifact.dataset_provenance.splits.test_count} Test Samples (15% Unseen Holdout)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Critical Security Metric: False-Strong Rate */}
              <div className="p-4 bg-slate-900 border border-red-900/40 rounded-xl space-y-1 relative overflow-hidden">
                <div className="text-[11px] font-mono font-medium text-red-400 flex items-center justify-between">
                  <span>False-Strong (FSR)</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {(currentMetrics.false_strong_rate * 100).toFixed(2)}%
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Dangerous miss rate: FN / (TP + FN)
                </p>
              </div>

              {/* Macro-F1 */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono font-medium text-slate-400">Macro-F1</div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {currentMetrics.macro_f1.toFixed(4)}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Balanced class harmonic mean
                </p>
              </div>

              {/* PR-AUC */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono font-medium text-slate-400">PR-AUC</div>
                <div className="text-2xl font-bold font-mono text-sky-400">
                  {currentMetrics.pr_auc.toFixed(4)}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Precision-Recall area
                </p>
              </div>

              {/* ROC-AUC */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono font-medium text-slate-400">ROC-AUC</div>
                <div className="text-2xl font-bold font-mono text-cyan-400">
                  {currentMetrics.roc_auc.toFixed(4)}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Ranking discrimination
                </p>
              </div>

              {/* Brier Score */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono font-medium text-slate-400">Brier Score</div>
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {currentMetrics.brier_score.toFixed(4)}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Probability calibration
                </p>
              </div>

              {/* Inference Latency */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono font-medium text-slate-400">Inference Latency</div>
                <div className="text-2xl font-bold font-mono text-purple-400">
                  {activeArtifact.computational_profile.inference_latency_microseconds.toFixed(1)} <span className="text-xs font-normal text-slate-400">µs</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Per-candidate eval time
                </p>
              </div>
            </div>
          </section>

          {/* Model Architecture & Confusion Matrix Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confusion Matrix Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>Confusion Matrix Breakdown (Holdout Test Split)</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Total = {currentMetrics.confusion_matrix.total}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                {/* True Positives */}
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg space-y-1">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase">
                    True Positives (TP)
                  </div>
                  <div className="text-xl font-bold text-white">
                    {currentMetrics.confusion_matrix.true_positives}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Predictable patterns correctly identified as guessable
                  </div>
                </div>

                {/* False Positives */}
                <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded-lg space-y-1">
                  <div className="text-[10px] text-amber-400 font-bold uppercase">
                    False Positives (FP)
                  </div>
                  <div className="text-xl font-bold text-white">
                    {currentMetrics.confusion_matrix.false_positives}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    High-entropy passwords falsely flagged (friction)
                  </div>
                </div>

                {/* False Negatives (Critical) */}
                <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-lg space-y-1">
                  <div className="text-[10px] text-red-400 font-bold uppercase flex items-center gap-1">
                    <span>False Negatives (FN)</span>
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                  </div>
                  <div className="text-xl font-bold text-red-200">
                    {currentMetrics.confusion_matrix.false_negatives}
                  </div>
                  <div className="text-[10px] text-red-300/80">
                    Guessable passwords missed as strong (Critical Failure)
                  </div>
                </div>

                {/* True Negatives */}
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    True Negatives (TN)
                  </div>
                  <div className="text-xl font-bold text-white">
                    {currentMetrics.confusion_matrix.true_negatives}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    High-entropy passwords correctly passed as resilient
                  </div>
                </div>
              </div>

              {/* Precision & Recall Summary */}
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500">Precision:</span>{' '}
                  <span className="text-slate-200 font-semibold">
                    {(currentMetrics.precision * 100).toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Recall:</span>{' '}
                  <span className="text-slate-200 font-semibold">
                    {(currentMetrics.recall * 100).toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Accuracy:</span>{' '}
                  <span className="text-slate-200 font-semibold">
                    {(currentMetrics.accuracy * 100).toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">False-Weak Rate:</span>{' '}
                  <span className="text-slate-200 font-semibold">
                    {(currentMetrics.false_weak_rate * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Model Hyperparameters & Computational Profile */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Pipeline Architecture &amp; Computational Profile</span>
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  scikit-learn
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-mono">Feature Extractor:</span>
                  <span className="text-slate-200 font-mono font-medium">
                    TfidfVectorizer(analyzer='char', ngrams={activeArtifact.model_architecture.ngram_range[0]}-{activeArtifact.model_architecture.ngram_range[1]})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-mono">Learned Vocabulary:</span>
                  <span className="text-sky-400 font-mono font-medium">
                    {activeArtifact.model_architecture.vocabulary_size.toLocaleString()} unique character n-grams
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-mono">Classifier:</span>
                  <span className="text-slate-200 font-mono font-medium">
                    LogisticRegression(C={activeArtifact.model_architecture.C}, solver='{activeArtifact.model_architecture.solver}')
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-mono">Training Duration:</span>
                  <span className="text-slate-200 font-mono font-medium">
                    {activeArtifact.computational_profile.train_duration_ms.toFixed(1)} ms (2,800 candidates)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-mono">Platform / Runtime:</span>
                  <span className="text-slate-200 font-mono font-medium">
                    Python {activeArtifact.computational_profile.python_version} on {activeArtifact.computational_profile.hardware_platform}
                  </span>
                </div>
              </div>

              {/* Data Safeguards */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5 text-xs">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Deduplication &amp; Partition Isolation Safeguards</span>
                </div>
                <ul className="text-slate-400 space-y-1 text-[11px] list-disc list-inside">
                  {activeArtifact.dataset_provenance.leakage_safeguards.map((safeguard, idx) => (
                    <li key={idx}>{safeguard}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 4-Way Comparative Baseline Architecture */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-sky-400" aria-hidden="true" />
              <span>4-Way Comparative Baseline Architecture</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical progression across heuristic, dictionary graph, statistical ML, and proposed feature fusion
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            Controlled Benchmarks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {baselines.map((baseline) => (
            <div
              key={baseline.id}
              className={`p-4 bg-slate-950/80 border rounded-xl space-y-3 transition-colors ${
                baseline.id === 'baseline-ngram'
                  ? 'border-sky-500/40 bg-sky-950/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200">{baseline.name}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                    baseline.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {baseline.status}
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

      {/* Dataset Governance & Zero-Breach Policy */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-white">
          <Database className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          <h2 className="text-base font-semibold">Dataset Governance &amp; Zero-Breach Policy</h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          To ensure scientific integrity and eliminate legal and ethical risks associated with leaked credentials, PREDICT-PS strictly prohibits raw breach corpora:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-lg space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>1. Zero Breach Dumps</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              No RockYou or credential dumps are downloaded or stored. Synthetic grammar generators model predictable human structures under controlled distributions.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-lg space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>2. Strict Partition Isolation</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Disjoint 70% Train, 15% Validation, and 15% Blind Test partitions. Zero overlap of character n-gram vocabularies or candidate strings across splits.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-lg space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>3. Target Label Operationalization</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Explicit binary ground truth: Predictable grammar templates (<code className="text-sky-300">1</code>) vs independently uniform high-entropy random sequences (<code className="text-emerald-300">0</code>).
            </p>
          </div>
        </div>
      </section>

      {/* Feature Ablation Matrix Design (Phase 6 Preview) */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              <span>Feature Ablation Matrix Design (Phases 5–6)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Isolating the individual and fused contribution of each representation to test hypothesis RQ2
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
              <tr className="hover:bg-slate-950/40 bg-sky-950/10">
                <td className="p-3 font-semibold text-sky-300 border-r border-slate-800">V2: n-gram Baseline (Phase 4)</td>
                <td className="p-3 text-slate-600 border-r border-slate-800">— Disabled</td>
                <td className="p-3 text-emerald-400 border-r border-slate-800">✓ Enabled (2-5)</td>
                <td className="p-3 text-slate-600 border-r border-slate-800">— Disabled</td>
                <td className="p-3 text-slate-600 border-r border-slate-800">— Disabled</td>
                <td className="p-3 text-sky-200">Measure pure statistical sequence log-likelihood power</td>
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
                <td className="p-3 font-bold text-emerald-300 border-r border-slate-800">V4: Full Fusion (Proposed Phase 5)</td>
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

      {/* Artifact Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-sky-400" />
                <span>Import Sanitized Phase 4 or 4.1 Artifact JSON</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Paste the JSON output produced by <code className="text-sky-300 font-mono">python3 python/run_experiments.py</code> or <code className="text-sky-300 font-mono">python3 python/export_artifact.py</code>. The artifact must strictly adhere to the <code className="text-sky-300 font-mono">predict_ps_phase4_v1</code> or <code className="text-sky-300 font-mono">predict_ps_phase4_1_v1</code> schema and must not contain raw password candidates.
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                rows={8}
                placeholder='{"schema_version": "predict_ps_phase4_1_v1", "manifest_type": "research_integrity_baseline_validation", ...}'
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
              />

              {importErrors.length > 0 && (
                <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg space-y-1">
                  <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Schema Validation Failed</span>
                  </div>
                  <ul className="text-xs text-red-300 list-disc list-inside">
                    {importErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Artifact successfully verified and loaded!</span>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Validate &amp; Load Artifact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

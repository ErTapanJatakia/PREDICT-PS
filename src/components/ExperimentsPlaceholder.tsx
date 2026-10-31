/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PREDICT-PS: Experiments & Empirical Baselines Workbench
 * Phase 4 Implementation: Reproducible Character n-gram ML Baseline
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
  ExternalLink
} from 'lucide-react';
import { getBaselineSpecs, validatePhase4ArtifactSchema } from '../lib/foundation';
import { Phase4Artifact, Phase4PipelineStatus } from '../types/research';
import rawCanonicalArtifact from '../data/phase4_baseline_metrics.json';

// Default canonical validation artifact produced by the reproducible Python baseline pipeline
const DEFAULT_VALIDATION_ARTIFACT: Phase4Artifact = rawCanonicalArtifact as Phase4Artifact;

export const ExperimentsPlaceholder: React.FC = () => {
  const baselines = getBaselineSpecs();
  const [pipelineState, setPipelineState] = useState<Phase4PipelineStatus>('synthetic_pipeline_validation');
  const [activeArtifact, setActiveArtifact] = useState<Phase4Artifact>(DEFAULT_VALIDATION_ARTIFACT);
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
      setActiveArtifact(parsed as Phase4Artifact);
      setPipelineState(parsed.pipeline_status);
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
    setPipelineState('synthetic_pipeline_validation');
  };

  const handleSetNotTrained = () => {
    setPipelineState('not_trained');
  };

  const currentMetrics = activeArtifact.evaluation_metrics.test_split;

  return (
    <div className="space-y-8">
      {/* Phase 4 Header & Status Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PHASE 4 ACTIVE
            </span>
            <span className="text-xs font-mono text-slate-400">
              ML Comparator Baseline
            </span>
          </div>
          <h1 className="text-lg font-bold text-white mt-1">
            Character n-gram ML Baseline (Phase 4)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical n-gram TF-IDF + Logistic Regression benchmark for comparative feature-fusion evaluation
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
          {/* Methodological Context & Caveats Banner */}
          <div className="p-4 bg-sky-950/30 border border-sky-800/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-sky-300 font-semibold text-xs">
              <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Phase 4 Baseline Objective & Synthetic Data Caveat</span>
            </div>
            <p className="text-xs text-sky-200/90 leading-relaxed">
              This character-level n-gram baseline is an empirical comparator for the PREDICT-PS research hypothesis (RQ1 & RQ2). It predicts whether a candidate exhibits predictable structural grammar (<code className="bg-sky-900/50 px-1 py-0.5 rounded text-sky-200 font-mono">1</code>) versus high-entropy uniform randomness (<code className="bg-sky-900/50 px-1 py-0.5 rounded text-sky-200 font-mono">0</code>). In strict accordance with research ethics, <strong className="text-white">no leaked breach dumps (e.g. RockYou)</strong> are used; the benchmark is evaluated on a synthetic grammar distribution with verified train/val/test split isolation.
            </p>
          </div>

          {/* Key Metrics Grid */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Test Split Evaluation Performance (τ = 0.5)</span>
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
                  Probability calibration (lower is better)
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
                  <span>Pipeline Architecture & Computational Profile</span>
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
                  <span>Deduplication & Partition Isolation Safeguards</span>
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

      {/* Dataset Governance & Leakage Prevention Protocol */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-white">
          <Database className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          <h2 className="text-base font-semibold">Dataset Governance & Zero-Breach Policy</h2>
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
                <span>Import Sanitized Phase 4 Artifact JSON</span>
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
              Paste the JSON output produced by <code className="text-sky-300 font-mono">python3 python/export_artifact.py</code>. The artifact must strictly adhere to the <code className="text-sky-300 font-mono">predict_ps_phase4_v1</code> schema and must not contain raw password candidates.
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                rows={8}
                placeholder='{"schema_version": "predict_ps_phase4_v1", "pipeline_status": "synthetic_pipeline_validation", ...}'
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

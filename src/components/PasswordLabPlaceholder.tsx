/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PREDICT-PS: Password Lab (Phase 3 Working Implementation)
 * Features:
 *  1. Browser-local unbiased CSPRNG password generation using window.crypto.getRandomValues()
 *  2. Perspective A: Explainable structural pattern analysis on test candidate strings
 *  3. Perspective B: Local zxcvbn-ts guessability baseline estimator (0-4 score, guess-count, tokens)
 *  4. Perspective C: NIST SP 800-63B-4 Password Guidance verifier assessment panel
 *  5. Interactive rejection-sampling theoretical bound inspector
 */

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Cpu,
  Binary,
  Layers,
  Info,
  ShieldCheck,
  Code2,
  Sliders,
  ChevronRight,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  FileSearch,
  CheckCircle2,
  Trash2,
  KeyRound,
  Scale,
  Gauge,
  BookOpen,
  XCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';
import {
  calculateUnbiasedSamplingThreshold,
  generateUnbiasedPassword,
  analyzeExplainablePatterns,
  buildUniqueCharset,
  evaluateZxcvbn,
  evaluateNistGuidance,
} from '../lib/foundation';
import {
  CharsetOptions,
  GeneratorResult,
  ExplainablePatternReport,
  ZxcvbnEvaluationResult,
  NistGuidanceEvaluation,
} from '../types/research';

type PerspectiveFilter = 'all' | 'structural' | 'zxcvbn' | 'nist';

export const PasswordLabPlaceholder: React.FC = () => {
  // --- 1. Password Generator State ---
  const [genLength, setGenLength] = useState<number>(16);
  const [charsets, setCharsets] = useState<CharsetOptions>({
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: true,
  });
  const [generatedResult, setGeneratedResult] = useState<GeneratorResult | null>(null);
  const [showGenerated, setShowGenerated] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [genError, setGenError] = useState<string | null>(null);

  // --- 2. Tripartite Password Analyzer State ---
  const [candidateInput, setCandidateInput] = useState<string>('');
  const [showCandidate, setShowCandidate] = useState<boolean>(true);
  const [patternReport, setPatternReport] = useState<ExplainablePatternReport | null>(null);
  const [zxcvbnResult, setZxcvbnResult] = useState<ZxcvbnEvaluationResult | null>(null);
  const [nistGuidance, setNistGuidance] = useState<NistGuidanceEvaluation | null>(null);
  const [activePerspective, setActivePerspective] = useState<PerspectiveFilter>('all');

  // --- 3. Educational Rejection-Sampling Bound Inspector State ---
  const [selectedCharsetSize, setSelectedCharsetSize] = useState<number>(62);
  const [activePreset, setActivePreset] = useState<string>('alphanumeric');

  const samplingData = calculateUnbiasedSamplingThreshold(selectedCharsetSize);

  const presets = [
    { id: 'digits', label: 'Numeric (0-9)', size: 10 },
    { id: 'hex', label: 'Hexadecimal (0-f)', size: 16 },
    { id: 'alpha-lower', label: 'Lower Alpha (a-z)', size: 26 },
    { id: 'alphanumeric', label: 'Alphanumeric (a-zA-Z0-9)', size: 62 },
    { id: 'base64', label: 'Base64 Safe (64)', size: 64 },
    { id: 'ascii-printable', label: 'Full ASCII (94 chars)', size: 94 },
  ];

  // Ephemeral memory cleanup: zeroize React state on unmount / tab leave
  useEffect(() => {
    return () => {
      setGeneratedResult(null);
      setCandidateInput('');
      setPatternReport(null);
      setZxcvbnResult(null);
      setNistGuidance(null);
    };
  }, []);

  // Compute live character set info for generator
  let liveCharset = '';
  let liveCharsetError: string | null = null;
  try {
    liveCharset = buildUniqueCharset(charsets);
  } catch (err) {
    liveCharsetError = err instanceof Error ? err.message : 'Invalid character set configuration.';
  }

  // Handle generation
  const handleGenerate = () => {
    setGenError(null);
    setCopySuccess(false);

    try {
      const result = generateUnbiasedPassword({
        length: genLength,
        charsets,
      });
      setGeneratedResult(result);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Password generation failed.');
      setGeneratedResult(null);
    }
  };

  const handleClearGenerated = () => {
    setGeneratedResult(null);
    setGenError(null);
    setCopySuccess(false);
  };

  const handleCopyGenerated = async () => {
    if (!generatedResult) return;
    try {
      await navigator.clipboard.writeText(generatedResult.password);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setCopySuccess(false);
    }
  };

  // Handle Tripartite Analysis (Structural + zxcvbn-ts + NIST SP 800-63B-4)
  const handleAnalyzeCandidate = (input: string) => {
    setCandidateInput(input);
    if (!input) {
      setPatternReport(null);
      setZxcvbnResult(null);
      setNistGuidance(null);
      return;
    }
    const report = analyzeExplainablePatterns(input);
    setPatternReport(report);

    const zxcvbnRes = evaluateZxcvbn(input);
    setZxcvbnResult(zxcvbnRes);

    const nistRes = evaluateNistGuidance(input);
    setNistGuidance(nistRes);
  };

  const handleClearCandidate = () => {
    setCandidateInput('');
    setPatternReport(null);
    setZxcvbnResult(null);
    setNistGuidance(null);
  };

  const handleSelectPreset = (preset: (typeof presets)[0]) => {
    setActivePreset(preset.id);
    setSelectedCharsetSize(preset.size);
  };

  // Score styling helper for zxcvbn
  const getZxcvbnScoreColor = (score: number) => {
    switch (score) {
      case 0:
        return {
          badge: 'bg-red-950 text-red-300 border-red-800',
          bar: 'bg-red-500',
          text: 'text-red-400',
        };
      case 1:
        return {
          badge: 'bg-orange-950 text-orange-300 border-orange-800',
          bar: 'bg-orange-500',
          text: 'text-orange-400',
        };
      case 2:
        return {
          badge: 'bg-amber-950 text-amber-300 border-amber-800',
          bar: 'bg-amber-500',
          text: 'text-amber-300',
        };
      case 3:
        return {
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
          bar: 'bg-emerald-500',
          text: 'text-emerald-400',
        };
      case 4:
        return {
          badge: 'bg-cyan-950 text-cyan-300 border-cyan-800',
          bar: 'bg-cyan-500',
          text: 'text-cyan-400',
        };
      default:
        return {
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          bar: 'bg-slate-600',
          text: 'text-slate-400',
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Phase 3 Active Notice */}
      <div
        role="region"
        aria-label="Phase 3 Status Notice"
        className="p-5 bg-sky-950/40 border border-sky-800/80 rounded-xl space-y-2"
      >
        <div className="flex items-center gap-2 text-sky-300 font-semibold text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-sky-400" aria-hidden="true" />
          <span>Phase 3 Active — Standard Baselines (zxcvbn-ts &amp; NIST SP 800-63B-4 Guidance)</span>
        </div>
        <p className="text-xs text-sky-200/90 leading-relaxed">
          The Password Lab features three clearly distinguished local evaluation perspectives: (A) transparent structural observations, (B) pre-bundled local zxcvbn-ts graph matching with zero breach calls, and (C) NIST SP 800-63B-4 verifier policy assessment. Operating strictly client-local with zero network egress and zero storage persistence.
        </p>
      </div>

      {/* SECTION 1: WORKING CSPRNG PASSWORD GENERATOR */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                Core Tool
              </span>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Secure Browser-Local Password Generator</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Powered exclusively by <code>window.crypto.getRandomValues()</code> with unbiased rejection sampling.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 w-fit">
            No Modulo Bias • Zero Math.random()
          </span>
        </div>

        {/* Generator Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Length Control */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <label htmlFor="gen-length-slider" className="font-semibold text-slate-200">
                Password Length: <span className="text-emerald-400 font-mono text-sm">{genLength} chars</span>
              </label>
              <span className="font-mono text-slate-400 text-[11px]">Range: 8 to 128</span>
            </div>
            <input
              id="gen-length-slider"
              type="range"
              min={8}
              max={128}
              value={genLength}
              onChange={(e) => setGenLength(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>8 (NIST MFA)</span>
              <span>15 (NIST Single)</span>
              <span>16 (Default)</span>
              <span>32 (Strong)</span>
              <span>64</span>
              <span>128</span>
            </div>
          </div>

          {/* Character Set Selection */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">Alphabet Subsets:</span>
              <span className="font-mono text-cyan-400 text-[11px]">
                {liveCharsetError ? '0 chars' : `${liveCharset.length} unique chars`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={charsets.lowercase}
                  onChange={(e) => setCharsets({ ...charsets, lowercase: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                />
                <span>Lowercase (a-z)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={charsets.uppercase}
                  onChange={(e) => setCharsets({ ...charsets, uppercase: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                />
                <span>Uppercase (A-Z)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={charsets.digits}
                  onChange={(e) => setCharsets({ ...charsets, digits: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                />
                <span>Digits (0-9)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={charsets.symbols}
                  onChange={(e) => setCharsets({ ...charsets, symbols: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                />
                <span>Symbols (!@#$...)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Validation Error Banner */}
        {liveCharsetError && (
          <div role="alert" className="p-3 bg-red-950/40 border border-red-800 text-red-300 rounded-lg text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{liveCharsetError}</span>
          </div>
        )}

        {genError && (
          <div role="alert" className="p-3 bg-red-950/40 border border-red-800 text-red-300 rounded-lg text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{genError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!!liveCharsetError}
            onClick={handleGenerate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Unbiased Password</span>
          </button>

          {generatedResult && (
            <button
              type="button"
              onClick={handleClearGenerated}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Generated</span>
            </button>
          )}
        </div>

        {/* Output Display */}
        {generatedResult && (
          <div className="space-y-4 pt-2">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Generated String (Transient In-Memory Only):</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGenerated(!showGenerated)}
                    className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-700"
                    aria-label={showGenerated ? 'Hide generated password' : 'Show generated password'}
                  >
                    {showGenerated ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showGenerated ? 'Mask' : 'Reveal'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyGenerated}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded bg-slate-900 border border-emerald-900"
                    aria-label="Copy generated password to clipboard"
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Password Value Container */}
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 break-all font-mono text-emerald-400 text-base sm:text-lg select-all tracking-wider">
                {showGenerated ? generatedResult.password : '•'.repeat(generatedResult.password.length)}
              </div>

              {/* Theoretical Shannon Entropy Metric & Disclaimer */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2 border-t border-slate-800/80">
                <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Alphabet Size (k)</div>
                  <div className="text-sm font-bold text-white mt-0.5">{generatedResult.charsetSize} chars</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Shannon Entropy/Char</div>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5">
                    {generatedResult.entropyPerChar.toFixed(3)} bits
                  </div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Total Theoretical Entropy</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {generatedResult.theoreticalEntropyBits.toFixed(1)} bits
                  </div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Rejection Overhead</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">
                    {(generatedResult.rejectionProbability * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-800/80 space-y-1">
                <p className="font-semibold text-slate-300">Methodological Note on Entropy Calculations:</p>
                <p>
                  The calculated {generatedResult.theoreticalEntropyBits.toFixed(1)} bits represent <em>theoretical Shannon entropy</em> based on log₂(k) × length under the assumption of independently uniform sampling. <strong>This theoretical calculation applies solely to algorithmic CSPRNG generation and must not be presented as a guessability guarantee for human-selected credentials.</strong>
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: TRIPARTITE LOCAL PASSWORD ANALYSIS WORKBENCH */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 font-semibold">
                Phase 3 Tripartite Analysis
              </span>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-indigo-400" />
                <span>Multi-Perspective Password Analysis Workbench</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Three distinct local perspectives: (A) Structural Observations, (B) zxcvbn-ts Baseline, and (C) NIST SP 800-63B-4 Policy Guidance.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 w-fit">
            100% Client-Local • Zero Egress
          </span>
        </div>

        {/* Security Warning Notice */}
        <div role="alert" className="p-3.5 bg-amber-950/30 border border-amber-800/80 rounded-lg text-xs text-amber-200/90 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-300 block">Security &amp; Privacy Advisory:</span>
            <p>
              All three analysis engines run 100% locally in your browser memory. However, to maintain optimal personal operational security, <strong>never enter a password currently in use for real-world production accounts</strong>. Use synthetic research candidates, generated strings, or historical test vectors.
            </p>
          </div>
        </div>

        {/* Candidate Input Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-300">
            <label htmlFor="candidate-analyzer-input" className="font-semibold text-slate-200">
              Test Candidate String:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCandidate(!showCandidate)}
                className="text-slate-400 hover:text-slate-200 text-[11px] font-mono flex items-center gap-1"
              >
                {showCandidate ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showCandidate ? 'Mask' : 'Reveal'}</span>
              </button>

              {candidateInput && (
                <button
                  type="button"
                  onClick={handleClearCandidate}
                  className="text-red-400 hover:text-red-300 text-[11px] font-mono flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <input
              id="candidate-analyzer-input"
              type={showCandidate ? 'text' : 'password'}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={candidateInput}
              onChange={(e) => handleAnalyzeCandidate(e.target.value)}
              placeholder="Type or paste a test candidate (e.g. Password123!, 123qwerty456, correct horse battery staple)"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Quick Sample Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">Load Research Samples:</span>
          <button
            type="button"
            onClick={() => handleAnalyzeCandidate('Password123!')}
            className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono"
          >
            Password123!
          </button>
          <button
            type="button"
            onClick={() => handleAnalyzeCandidate('123qwerty456')}
            className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono"
          >
            123qwerty456
          </button>
          <button
            type="button"
            onClick={() => handleAnalyzeCandidate('correct horse battery staple')}
            className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono"
          >
            correct horse battery staple
          </button>
          <button
            type="button"
            onClick={() => handleAnalyzeCandidate('aaaa1111bbbb')}
            className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono"
          >
            aaaa1111bbbb
          </button>
          {generatedResult && (
            <button
              type="button"
              onClick={() => handleAnalyzeCandidate(generatedResult.password)}
              className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-mono"
            >
              Analyze Generated Password
            </button>
          )}
        </div>

        {/* Tripartite Results Section */}
        {candidateInput.length > 0 && patternReport && zxcvbnResult && nistGuidance && (
          <div className="space-y-6 pt-3">
            {/* Tripartite Summary Strip */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-mono">
                Tripartite Cross-Perspective Summary
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Structural Summary Tile */}
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                    <span className="flex items-center gap-1.5">
                      <FileSearch className="w-3.5 h-3.5 text-indigo-400" />
                      Perspective A: Structural
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">{candidateInput.length} chars</span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    {patternReport.uniqueCharCount} unique chars • {[
                      patternReport.repeatedRuns.length > 0 ? `${patternReport.repeatedRuns.length} run` : null,
                      patternReport.sequentialRuns.length > 0 ? `${patternReport.sequentialRuns.length} seq` : null,
                      patternReport.keyboardWalks.length > 0 ? `${patternReport.keyboardWalks.length} walk` : null,
                    ].filter(Boolean).join(', ') || 'No simple runs'}
                  </div>
                </div>

                {/* zxcvbn Summary Tile */}
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                    <span className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      Perspective B: zxcvbn-ts
                    </span>
                    <span
                      className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        getZxcvbnScoreColor(zxcvbnResult.score).badge
                      }`}
                    >
                      Score {zxcvbnResult.score}/4
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    10<sup>{zxcvbnResult.guessesLog10}</sup> guesses • {zxcvbnResult.calcTimeMs.toFixed(1)}ms
                  </div>
                </div>

                {/* NIST Summary Tile */}
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-amber-400" />
                      Perspective C: NIST SP 800-63B-4
                    </span>
                    <span
                      className={`text-[11px] font-mono px-1.5 py-0.2 rounded border ${
                        nistGuidance.meetsSingleFactorMinLength
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : nistGuidance.meetsMfaMinLength
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-red-950 text-red-300 border-red-800'
                      }`}
                    >
                      {nistGuidance.meetsSingleFactorMinLength
                        ? '≥15 Chars (Pass)'
                        : nistGuidance.meetsMfaMinLength
                        ? '≥8 Chars (MFA Only)'
                        : '<8 Chars (Fail)'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 truncate font-mono">
                    {nistGuidance.meetsSingleFactorMinLength
                      ? 'Single-factor length compliant'
                      : nistGuidance.meetsMfaMinLength
                      ? 'MFA minimum only'
                      : 'Non-compliant length'}
                  </div>
                </div>
              </div>
            </div>

            {/* Perspective Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-400 font-mono mr-1">Perspective View:</span>
              <button
                type="button"
                onClick={() => setActivePerspective('all')}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                  activePerspective === 'all'
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                All 3 Perspectives
              </button>
              <button
                type="button"
                onClick={() => setActivePerspective('structural')}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                  activePerspective === 'structural'
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <FileSearch className="w-3.5 h-3.5 text-indigo-400" />
                <span>Perspective A: Structural</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePerspective('zxcvbn')}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                  activePerspective === 'zxcvbn'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>Perspective B: zxcvbn-ts</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePerspective('nist')}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                  activePerspective === 'nist'
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Perspective C: NIST SP 800-63B-4</span>
              </button>
            </div>

            {/* PERSPECTIVE A: EXPLAINABLE STRUCTURAL OBSERVATIONS */}
            {(activePerspective === 'all' || activePerspective === 'structural') && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                      Perspective A
                    </span>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <FileSearch className="w-4 h-4 text-indigo-400" />
                      <span>Transparent Structural Observations (Deterministic Features)</span>
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Length: {patternReport.candidateLength} • Unique: {patternReport.uniqueCharCount}
                  </span>
                </div>

                {/* Orthographic Character Composition */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Orthographic Character Composition:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                      <div className="text-slate-400 text-[10px]">Lowercase</div>
                      <div className="text-sm font-bold text-slate-100">{patternReport.composition.lowercase}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                      <div className="text-slate-400 text-[10px]">Uppercase</div>
                      <div className="text-sm font-bold text-slate-100">{patternReport.composition.uppercase}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                      <div className="text-slate-400 text-[10px]">Digits</div>
                      <div className="text-sm font-bold text-slate-100">{patternReport.composition.digits}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                      <div className="text-slate-400 text-[10px]">Symbols</div>
                      <div className="text-sm font-bold text-slate-100">{patternReport.composition.symbols}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                      <div className="text-slate-400 text-[10px]">Spaces</div>
                      <div className="text-sm font-bold text-slate-100">{patternReport.composition.whitespace}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                      <div className="text-slate-400 text-[10px]">Other/Unicode</div>
                      <div className="text-sm font-bold text-slate-100">{patternReport.composition.other}</div>
                    </div>
                  </div>
                </div>

                {/* Detected Structural Observations List */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-300 block">Factual Structural Observations:</span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {patternReport.structuralObservations.map((obs, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded border border-slate-800">
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Structural Token Flags */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div
                    className={`p-3 rounded-lg border ${
                      patternReport.repeatedRuns.length > 0 || patternReport.repeatedSubstrings.length > 0
                        ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold block mb-0.5">Repetitions:</span>
                    <span>
                      {patternReport.repeatedRuns.length > 0 || patternReport.repeatedSubstrings.length > 0
                        ? `${patternReport.repeatedRuns.length} run(s), ${patternReport.repeatedSubstrings.length} repeated substring(s)`
                        : 'None detected'}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-lg border ${
                      patternReport.sequentialRuns.length > 0
                        ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold block mb-0.5">Sequential Runs:</span>
                    <span>
                      {patternReport.sequentialRuns.length > 0
                        ? `${patternReport.sequentialRuns.length} sequence(s) (${patternReport.sequentialRuns.map((s) => s.sequence).join(', ')})`
                        : 'None detected'}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-lg border ${
                      patternReport.keyboardWalks.length > 0
                        ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold block mb-0.5">Keyboard Walks:</span>
                    <span>
                      {patternReport.keyboardWalks.length > 0
                        ? `${patternReport.keyboardWalks.length} walk(s) (${patternReport.keyboardWalks.map((k) => k.pattern).join(', ')})`
                        : 'None detected'}
                    </span>
                  </div>
                </div>

                {/* Perspective A Methodology Note */}
                <div className="text-[11px] text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-800/80 space-y-1">
                  <p className="font-semibold text-slate-300">Perspective A Methodological Note:</p>
                  <p>
                    These observations report purely factual, deterministic features (orthographic classes, runs, monotonic sequences, spatial keyboard adjacency). <strong>Perspective A outputs no synthetic score or unverified ML probability.</strong>
                  </p>
                </div>
              </div>
            )}

            {/* PERSPECTIVE B: ZXCVBN-TS GUESSABILITY BASELINE ESTIMATOR */}
            {(activePerspective === 'all' || activePerspective === 'zxcvbn') && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                      Perspective B
                    </span>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-cyan-400" />
                      <span>zxcvbn-ts Password Guessability Estimator (Core Baseline)</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">
                      Local Sync • Latency: {zxcvbnResult.calcTimeMs.toFixed(1)}ms
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                        getZxcvbnScoreColor(zxcvbnResult.score).badge
                      }`}
                    >
                      {zxcvbnResult.scoreLabel}
                    </span>
                  </div>
                </div>

                {/* zxcvbn Score Meter & Quantitative Metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                    <span>Guessability Score Meter:</span>
                    <span className="font-bold text-white">Score {zxcvbnResult.score} / 4</span>
                  </div>

                  {/* 5-Segment Score Bar */}
                  <div className="grid grid-cols-5 gap-1.5 h-2.5">
                    {[0, 1, 2, 3, 4].map((step) => {
                      const isActive = step <= zxcvbnResult.score;
                      const color = getZxcvbnScoreColor(zxcvbnResult.score);
                      return (
                        <div
                          key={step}
                          className={`rounded h-full transition-all ${
                            isActive ? color.bar : 'bg-slate-800'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>0: Very Weak</span>
                    <span>1: Weak</span>
                    <span>2: Fair</span>
                    <span>3: Strong</span>
                    <span>4: Very Strong</span>
                  </div>
                </div>

                {/* Key zxcvbn Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-slate-400 text-[10px]">Estimated Guesses</div>
                    <div className="text-sm font-bold text-cyan-400 mt-1">
                      {zxcvbnResult.guesses > 1e6
                        ? zxcvbnResult.guesses.toExponential(2)
                        : zxcvbnResult.guesses.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Total search steps</div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-slate-400 text-[10px]">guessesLog10</div>
                    <div className="text-sm font-bold text-white mt-1">
                      {zxcvbnResult.guessesLog10}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">log₁₀ scale order</div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-slate-400 text-[10px]">Matched Tokens</div>
                    <div className="text-sm font-bold text-indigo-400 mt-1">
                      {zxcvbnResult.matchedPatterns.length} segment(s)
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Parsed sub-patterns</div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-slate-400 text-[10px]">Client Execution Time</div>
                    <div className="text-sm font-bold text-emerald-400 mt-1">
                      {zxcvbnResult.calcTimeMs.toFixed(1)} ms
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Zero network latency</div>
                  </div>
                </div>

                {/* Feedback Warnings and Suggestions */}
                {(zxcvbnResult.warning || zxcvbnResult.suggestions.length > 0) && (
                  <div className="space-y-2">
                    {zxcvbnResult.warning && (
                      <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg text-xs text-amber-200 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          <strong>Warning:</strong> {zxcvbnResult.warning}
                        </span>
                      </div>
                    )}

                    {zxcvbnResult.suggestions.length > 0 && (
                      <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-300 space-y-1">
                        <span className="font-semibold text-slate-200 block text-[11px] font-mono">
                          zxcvbn Model Suggestions:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                          {zxcvbnResult.suggestions.map((sug, i) => (
                            <li key={i}>{sug}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Matched Token Sequences Table */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Dynamic Programming Token Matches (zxcvbn Sequence Decomposition):
                  </span>
                  {zxcvbnResult.matchedPatterns.length === 0 ? (
                    <div className="text-xs text-slate-400 p-2.5 bg-slate-900 rounded border border-slate-800">
                      No multi-character dictionary or spatial pattern matches detected. Evaluated as unconstrained bruteforce character sequence.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono border-collapse border border-slate-800">
                        <thead>
                          <tr className="bg-slate-900 text-slate-300 border-b border-slate-800">
                            <th className="p-2 border-r border-slate-800">Sub-token</th>
                            <th className="p-2 border-r border-slate-800">Matched Pattern Type</th>
                            <th className="p-2">Model Interpretation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {zxcvbnResult.matchedPatterns.map((match, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/50">
                              <td className="p-2 font-bold text-white border-r border-slate-800 break-all">
                                &apos;{match.token}&apos;
                              </td>
                              <td className="p-2 font-semibold text-cyan-400 border-r border-slate-800 capitalize">
                                {match.pattern}
                              </td>
                              <td className="p-2 text-slate-400">
                                {match.pattern === 'dictionary'
                                  ? 'Matched English/common dictionary list or surname'
                                  : match.pattern === 'spatial'
                                  ? 'Matched keyboard adjacency graph (e.g. QWERTY walk)'
                                  : match.pattern === 'repeat'
                                  ? 'Repeated character run or token pattern'
                                  : match.pattern === 'sequence'
                                  ? 'Sequential alphabetical, numeric, or keyboard run'
                                  : match.pattern === 'regex'
                                  ? 'Recognized common pattern (e.g. year/date regex)'
                                  : match.pattern === 'bruteforce'
                                  ? 'Unmatched character segment requiring combinatorial search'
                                  : `Matched ${match.pattern} heuristic`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Perspective B Methodology Note */}
                <div className="text-[11px] text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-800/80 space-y-1">
                  <p className="font-semibold text-slate-300">Perspective B Methodological Note &amp; Scientific Limitations:</p>
                  <p>
                    zxcvbn (Wheeler et al., via @zxcvbn-ts/core) is an empirical pattern-matching baseline using dynamic programming to find the lowest-entropy decomposition across static English and common dictionaries, keyboard adjacency graphs, and simple repetitions. <strong>Its output represents an estimated search-step count, NOT a formal security proof, calibrated crack probability, or real-world time guarantee.</strong> zxcvbn does not perform external breach database queries (zero HIBP lookups) in PREDICT-PS.
                  </p>
                </div>
              </div>
            )}

            {/* PERSPECTIVE C: NIST SP 800-63B-4 GUIDANCE PANEL */}
            {(activePerspective === 'all' || activePerspective === 'nist') && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                      Perspective C
                    </span>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <span>NIST SP 800-63B-4 Password Policy Guidance Panel</span>
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Official Reference: NIST SP 800-63B §5.1.1.2
                  </span>
                </div>

                {/* Important Distinction Banner */}
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold text-amber-300 block">
                      Scope Clarification: Policy Guidelines vs. Strength Prediction
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      NIST Special Publication 800-63B-4 (<em>Digital Identity Guidelines: Authentication and Lifecycle Management</em>) provides <strong>administrative guidance and compliance specifications for credential verifiers and identity providers</strong>. It is <strong>NOT a mathematical strength-prediction algorithm or continuous strength score</strong>.
                    </p>
                  </div>
                </div>

                {/* NIST SP 800-63B-4 Checklist */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-300 block font-mono">
                    NIST SP 800-63B-4 Section 5.1.1.2 Verifier Requirements Checklist:
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Requirement 1: Single Factor Length */}
                    <div
                      className={`p-3.5 rounded-lg border space-y-1.5 ${
                        nistGuidance.meetsSingleFactorMinLength
                          ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Single-Factor Min Length (≥15 Chars)</span>
                        {nistGuidance.meetsSingleFactorMinLength ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Meets Standard
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            <Clock className="w-3 h-3" /> Below (Current: {nistGuidance.candidateLength})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        NIST SP 800-63B-4 recommends minimum 15 characters for single-factor memorized secrets to withstand offline cracking without a second factor.
                      </p>
                    </div>

                    {/* Requirement 2: MFA Min Length */}
                    <div
                      className={`p-3.5 rounded-lg border space-y-1.5 ${
                        nistGuidance.meetsMfaMinLength
                          ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                          : 'bg-red-950/30 border-red-800 text-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">MFA Minimum Length (≥8 Chars)</span>
                        {nistGuidance.meetsMfaMinLength ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Meets Standard
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                            <XCircle className="w-3 h-3" /> Below Minimum ({nistGuidance.candidateLength}/8)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Mandates minimum 8 characters when the memorized secret is combined with a physical or cryptographic second authenticator.
                      </p>
                    </div>

                    {/* Requirement 3: Max Length Support */}
                    <div
                      className={`p-3.5 rounded-lg border space-y-1.5 ${
                        nistGuidance.withinMaxAllowedLength
                          ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                          : 'bg-amber-950/30 border-amber-800 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Max Length Capacity Support (≥64 Chars)</span>
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Supported
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Verifiers SHALL support memorized secrets of at least 64 characters in length to enable user passphrases.
                      </p>
                    </div>

                    {/* Requirement 4: Space Support */}
                    <div className="p-3.5 rounded-lg border bg-slate-900/70 border-slate-800 text-slate-300 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Space Character Support (Passphrases)</span>
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {nistGuidance.hasSpaceSupport ? 'Contains Spaces' : 'No Spaces'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Verifiers SHALL permit ASCII space characters so users can construct multi-word passphrases with natural spacing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* NIST Composition Rule Prohibition Notice */}
                <div className="p-3.5 bg-indigo-950/30 border border-indigo-800/80 rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>NIST Prohibition of Composition Rules:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {nistGuidance.compositionRuleNotice}
                  </p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Rather than enforcing artificial character class quotas, NIST emphasizes adequate minimum length and automated checking against known compromised credential lists.
                  </p>
                </div>

                {/* Compromised Credential Blocklist Check: Not Implemented (Client Boundary Disclosure) */}
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Compromised Credential Blocklist Check</span>
                    </div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 w-fit">
                      Not Implemented (Client Boundary Privacy)
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    <strong>NIST Requirement:</strong> Verifiers SHALL compare candidate secrets against compromised password corpuses (including breached dictionaries and dictionary variations).
                  </p>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    <strong>PREDICT-PS Architecture Boundary Disclosure:</strong> This check is intentionally <strong>not implemented</strong> in PREDICT-PS. Querying remote breach APIs (such as k-Anonymity HIBP endpoints) or transmitting candidate hashes would violate the workbench’s strict zero-network egress and credential-privacy invariants.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SECTION 3: PRIVACY & TRANSIENT MEMORY HYGIENE CARD */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          <span>Privacy &amp; Memory Hygiene Architecture</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5">
            <span className="font-semibold text-slate-200 block">1. Volatile In-Memory Lifecycle</span>
            <p className="text-slate-400">
              Candidate values exist strictly as transient variables in React component state. They are cleared immediately when the user presses &ldquo;Clear All&rdquo; and when navigating away from this tab (component unmount).
            </p>
          </div>
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5">
            <span className="font-semibold text-slate-200 block">2. Memory Limitations Disclosure</span>
            <p className="text-slate-400">
              JavaScript strings are immutable heap primitives in modern JavaScript engines (V8, SpiderMonkey) and cannot be reliably zeroized in physical RAM. Garbage collection is non-deterministic.
            </p>
          </div>
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5">
            <span className="font-semibold text-slate-200 block">3. Zero Storage &amp; Zero Network</span>
            <p className="text-slate-400">
              Neither generation nor analysis performs network I/O or accesses <code>localStorage</code>, <code>sessionStorage</code>, <code>cookies</code>, or <code>IndexedDB</code>. Do not rely on HTML autocomplete as a security guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: EDUCATIONAL REJECTION-SAMPLING BOUND INSPECTOR */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                Foundational Research Model
              </span>
              <h2 className="text-base font-semibold text-white">
                Rejection-Sampling Mathematical Model Inspector
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Verify how single-byte rejection sampling eliminates modulo bias across arbitrary alphabet sizes (<em>k</em>)
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/80 w-fit">
            Uniform Entropy Verification
          </span>
        </div>

        {/* Technical Explainer */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 text-xs text-slate-300 space-y-2 font-mono">
          <div className="text-sky-300 font-semibold flex items-center gap-1.5">
            <Binary className="w-4 h-4" />
            <span>Mathematical Formulation of Modulo Bias Elimination</span>
          </div>
          <p className="text-slate-400 font-sans">
            A single byte from <code>crypto.getRandomValues()</code> produces integers in the range [0, 255] (256 distinct values). If an alphabet has length <em>k</em> where <code>256 % k ≠ 0</code>, computing <code>byte % k</code> biases the first <code>256 % k</code> characters to occur with higher probability:
          </p>
          <div className="p-3 bg-slate-900 rounded border border-slate-800 text-cyan-300 font-mono text-sm">
            limit = 256 - (256 mod k)
            <div className="text-slate-400 text-xs mt-1 font-sans">
              Rule: Discard any random byte where <code>byte ≥ limit</code>, and draw another byte. Accepted bytes satisfy <code>byte &lt; limit</code>, guaranteeing perfectly uniform sampling.
            </div>
          </div>
        </div>

        {/* Interactive Math Simulator for Researchers */}
        <div className="border border-slate-800 bg-slate-950/50 rounded-lg p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                Interactive Rejection-Sampling Bound Inspector
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Pure Mathematical Model</span>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-colors ${
                  selectedCharsetSize === preset.size
                    ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Size Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <label htmlFor="charset-slider">
                Custom Charset Size (<em>k</em>): <strong className="text-emerald-400 font-mono">{selectedCharsetSize}</strong>
              </label>
              <span className="font-mono text-slate-400">Range: 2 to 256</span>
            </div>
            <input
              id="charset-slider"
              type="range"
              min={2}
              max={256}
              value={selectedCharsetSize}
              onChange={(e) => {
                setSelectedCharsetSize(Number(e.target.value));
                setActivePreset('custom');
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Metric Outputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <div className="text-slate-400 text-[11px]">Acceptance Bound (limit)</div>
              <div className="text-base font-bold text-white mt-1">
                &lt; {samplingData.maxValidByte}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">bytes [0 .. {samplingData.maxValidByte - 1}]</div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <div className="text-slate-400 text-[11px]">Discarded / 256</div>
              <div className="text-base font-bold text-amber-400 mt-1">
                {samplingData.discardedByteCount} bytes
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {(samplingData.rejectionProbability * 100).toFixed(2)}% rejection
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <div className="text-slate-400 text-[11px]">Shannon Entropy / Char</div>
              <div className="text-base font-bold text-cyan-400 mt-1">
                {samplingData.entropyBitsPerChar.toFixed(3)} bits
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">log₂(k)</div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <div className="text-slate-400 text-[11px]">Uniform Factor</div>
              <div className="text-base font-bold text-emerald-400 mt-1">
                {samplingData.isPowerOfTwo ? 'Exact 2ⁿ' : `${Math.floor(256 / selectedCharsetSize)}x multiples`}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {samplingData.isPowerOfTwo ? '0% Rejection Overhead' : 'Guaranteed Unbiased'}
              </div>
            </div>
          </div>

          {/* Code Implementation Reference */}
          <div className="text-xs bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-1.5 font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Active Rejection Sampling Algorithm (foundation.ts):</span>
            </div>
            <pre className="text-[11px] text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded">
{`while (password.length < length) {
  crypto.getRandomValues(buffer);
  for (let i = 0; i < buffer.length && password.length < length; i++) {
    const byte = buffer[i];
    if (byte < threshold.maxValidByte) {
      password += charset[byte % charsetSize]; // Perfectly uniform
    }
  }
}`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};

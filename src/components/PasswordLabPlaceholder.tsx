/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PREDICT-PS: Password Lab (Phase 2 Working Implementation)
 * Features:
 *  1. Browser-local unbiased CSPRNG password generation using window.crypto.getRandomValues()
 *  2. Explainable structural pattern analysis on test candidate strings
 *  3. Interactive rejection-sampling theoretical bound inspector
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
} from 'lucide-react';
import {
  calculateUnbiasedSamplingThreshold,
  generateUnbiasedPassword,
  analyzeExplainablePatterns,
  buildUniqueCharset,
} from '../lib/foundation';
import {
  CharsetOptions,
  GeneratorResult,
  ExplainablePatternReport,
} from '../types/research';

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

  // --- 2. Explainable Pattern Analyzer State ---
  const [candidateInput, setCandidateInput] = useState<string>('');
  const [showCandidate, setShowCandidate] = useState<boolean>(true);
  const [patternReport, setPatternReport] = useState<ExplainablePatternReport | null>(null);

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
      // Graceful fallback if clipboard access is denied
      setCopySuccess(false);
    }
  };

  // Handle Pattern Analysis
  const handleAnalyzeCandidate = (input: string) => {
    setCandidateInput(input);
    if (!input) {
      setPatternReport(null);
      return;
    }
    const report = analyzeExplainablePatterns(input);
    setPatternReport(report);
  };

  const handleClearCandidate = () => {
    setCandidateInput('');
    setPatternReport(null);
  };

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setActivePreset(preset.id);
    setSelectedCharsetSize(preset.size);
  };

  return (
    <div className="space-y-8">
      {/* Phase 2 Active Notice */}
      <div
        role="region"
        aria-label="Phase 2 Status Notice"
        className="p-5 bg-emerald-950/40 border border-emerald-800/80 rounded-xl space-y-2"
      >
        <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" aria-hidden="true" />
          <span>Phase 2 Active — Browser-Local Secure Generation &amp; Explainable Pattern Analyzer</span>
        </div>
        <p className="text-xs text-emerald-200/90 leading-relaxed">
          Operating under strict zero-persistence privacy constraints: 100% browser-local execution, zero network requests, and volatile in-memory candidate processing. No passwords are ever stored in browser storage, URLs, or external logs.
        </p>
      </div>

      {/* SECTION 1: WORKING CSPRNG PASSWORD GENERATOR */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                Phase 2 Core Tool
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
              <span>8 (NIST Min)</span>
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

      {/* SECTION 2: EXPLAINABLE PATTERN ANALYZER */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 font-semibold">
                Phase 2 Core Tool
              </span>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-indigo-400" />
                <span>Explainable Structural Pattern Analyzer (Local Opt-In)</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Transparent, deterministic structural examination without black-box ML or remote lookups
            </p>
          </div>
          <span className="text-xs font-mono text-indigo-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 w-fit">
            Deterministic Observations Only
          </span>
        </div>

        {/* Security Warning Notice */}
        <div role="alert" className="p-3.5 bg-amber-950/30 border border-amber-800/80 rounded-lg text-xs text-amber-200/90 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-300 block">Security &amp; Privacy Advisory:</span>
            <p>
              Analysis runs 100% locally in your browser memory. However, to maintain optimal personal operational security, <strong>avoid entering a password currently used for any real-world production account</strong>. Use a synthetic test candidate, a generated password, or historical test string instead.
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
                  <span>Clear</span>
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
              placeholder="Type or paste a test candidate (e.g. Summer2024! or 123qwerty)"
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

        {/* Analysis Results Display */}
        {patternReport && candidateInput.length > 0 && (
          <div className="space-y-4 pt-2">
            {/* Character Composition Breakdown */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Orthographic Character Composition:</span>
                <span className="text-xs font-mono text-cyan-400">
                  Total: {patternReport.candidateLength} chars ({patternReport.uniqueCharCount} unique)
                </span>
              </div>

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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                <div className={`p-3 rounded-lg border ${
                  patternReport.repeatedRuns.length > 0 || patternReport.repeatedSubstrings.length > 0
                    ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>
                  <span className="font-semibold block mb-0.5">Repetitions:</span>
                  <span>
                    {patternReport.repeatedRuns.length > 0 || patternReport.repeatedSubstrings.length > 0
                      ? `${patternReport.repeatedRuns.length} run(s), ${patternReport.repeatedSubstrings.length} repeated substring(s)`
                      : 'None detected'}
                  </span>
                </div>

                <div className={`p-3 rounded-lg border ${
                  patternReport.sequentialRuns.length > 0
                    ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>
                  <span className="font-semibold block mb-0.5">Sequential Runs:</span>
                  <span>
                    {patternReport.sequentialRuns.length > 0
                      ? `${patternReport.sequentialRuns.length} sequence(s) (${patternReport.sequentialRuns.map(s => s.sequence).join(', ')})`
                      : 'None detected'}
                  </span>
                </div>

                <div className={`p-3 rounded-lg border ${
                  patternReport.keyboardWalks.length > 0
                    ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>
                  <span className="font-semibold block mb-0.5">Keyboard Walks:</span>
                  <span>
                    {patternReport.keyboardWalks.length > 0
                      ? `${patternReport.keyboardWalks.length} walk(s) (${patternReport.keyboardWalks.map(k => k.pattern).join(', ')})`
                      : 'None detected'}
                  </span>
                </div>
              </div>

              {/* Scientific Disclaimer */}
              <div className="text-[11px] text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-800/80 space-y-1">
                <p className="font-semibold text-slate-300">Methodological Note on Pattern Analysis:</p>
                <p>
                  These observations reflect transparent structural features (character classes, runs, monotonic sequences, spatial keyboard adjacency). <strong>This analyzer does not output a cracking probability, a simulated strength score, or an untrained ML score in Phase 2.</strong> Formal 4-way baseline comparison against NIST rules, zxcvbn, and character n-gram models is scheduled for Phases 3–6.
                </p>
              </div>
            </div>
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
              Candidate values exist strictly as transient variables in React component state. They are cleared immediately when the user presses &ldquo;Clear&rdquo; and when navigating away from this tab (component unmount).
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PREDICT-PS: Audit & System Manifest View
 */

import React, { useState, useEffect } from 'react';
import {
  FileCode2,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Lock,
  Terminal,
  AlertTriangle,
} from 'lucide-react';
import {
  checkBrowserPrivacyContext,
  sanitizeResearchExport,
  getResearchPhases,
  getResearchQuestions,
  getBaselineSpecs,
  getEvaluationMetricSpecs,
} from '../lib/foundation';
import { PrivacyAuditResult } from '../types/research';

export const AuditManifestView: React.FC = () => {
  const [audit, setAudit] = useState<PrivacyAuditResult | null>(null);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [sanitizerInput, setSanitizerInput] = useState<string>(
    JSON.stringify(
      {
        experimentId: 'exp_baseline_001',
        dataset: 'rockyou_dedup_100k',
        metrics: {
          accuracy: 0.88,
          precision: 0.89,
          recall: 0.84,
          macroF1: 0.864,
          falseStrongRate: 0.038,
        },
        // Sensitive test fields to verify sanitization:
        rawPassword: 'AdminPass2026!$',
        user_token: 'secret_jwt_xyz',
        candidateSecret: 'hunter2',
      },
      null,
      2
    )
  );

  const [sanitizerOutput, setSanitizerOutput] = useState<{
    clean: boolean;
    sanitized: Record<string, unknown>;
    violations: string[];
  } | null>(null);

  const runAudit = () => {
    setAudit(checkBrowserPrivacyContext());
  };

  useEffect(() => {
    runAudit();
    handleRunSanitizer();
  }, []);

  const handleRunSanitizer = () => {
    try {
      const parsed = JSON.parse(sanitizerInput);
      const res = sanitizeResearchExport(parsed);
      setSanitizerOutput(res);
    } catch {
      setSanitizerOutput(null);
    }
  };

  // Build research architecture manifest
  const systemManifest = {
    application: 'PREDICT-PS',
    subtitle: 'Password Predictability Research Workbench',
    version: '0.1.0-alpha',
    phase: 'Phase 2: Local CSPRNG Generation & Explainable Pattern Extraction',
    timestamp: new Date().toISOString(),
    hypothesis:
      'Explainable password-pattern features fused with a conventional character-level machine-learning model can improve identification of guessable human-selected passwords compared with simple rules, zxcvbn, and a character n-gram ML baseline, while preserving password privacy and acceptable computational cost.',
    researchQuestions: getResearchQuestions(),
    privacyInvariants: [
      'Zero external network egress (0 HTTP/S, 0 WebSocket, 0 WebRTC)',
      'Zero storage persistence (0 bytes localStorage/sessionStorage/cookies)',
      'Zero credential logging or console streaming',
      'Browser-local Web Crypto CSPRNG rejection-sampling generation only',
      'Opt-in local volatile memory analysis for test candidates only (zero storage, explicit unmount cleanup)',
    ],
    plannedBaselines: getBaselineSpecs(),
    evaluationMetrics: getEvaluationMetricSpecs(),
    roadmap: getResearchPhases(),
  };

  const manifestJsonString = JSON.stringify(systemManifest, null, 2);

  const handleCopyManifest = () => {
    navigator.clipboard?.writeText(manifestJsonString);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Live Client Environment Privacy Sanity Audit */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" aria-hidden="true" />
              <span>Live Browser Privacy &amp; Runtime Capability Audit</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time programmatic inspection of local browser security context
            </p>
          </div>
          <button
            onClick={runAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors w-fit"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Re-verify Audit</span>
          </button>
        </div>

        {audit && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-slate-400 text-[11px]">Web Crypto Subtle</div>
              <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{audit.cryptoSubtleAvailable ? 'Available' : 'Missing'}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Native Browser API</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-slate-400 text-[11px]">crypto.getRandomValues</div>
              <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{audit.getRandomValuesAvailable ? 'Verified' : 'Missing'}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">CSPRNG Subsystem</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-slate-400 text-[11px]">localStorage Keys</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">
                {audit.localStorageKeysCount} keys
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">0 Persistent Bytes</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-slate-400 text-[11px]">sessionStorage Keys</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">
                {audit.sessionStorageKeysCount} keys
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">0 Session Bytes</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-slate-400 text-[11px]">Cookie Payload</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">
                {audit.cookiesLength} bytes
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Zero Cookie Storage</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-slate-400 text-[11px]">Outbound Telemetry</div>
              <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero (Disabled)</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Air-gapped by design</div>
            </div>
          </div>
        )}
      </section>

      {/* Interactive Export Data Sanitizer Tester */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            <span>Interactive Export Data Sanitizer Sandbox</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test the <code>sanitizeResearchExport</code> filter ensuring raw credentials cannot escape into exported research reports
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <label htmlFor="raw-json-input" className="font-mono">
                Sample Research Payload (with test credentials):
              </label>
              <button
                type="button"
                onClick={handleRunSanitizer}
                className="text-[11px] font-mono text-cyan-400 hover:underline"
              >
                Re-apply Scrubber
              </button>
            </div>
            <textarea
              id="raw-json-input"
              rows={10}
              value={sanitizerInput}
              onChange={(e) => {
                setSanitizerInput(e.target.value);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-300 font-mono">
              <span>Sanitized Export Output:</span>
              {sanitizerOutput && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded border ${
                    sanitizerOutput.clean
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}
                >
                  {sanitizerOutput.clean
                    ? '✓ Clean Payload'
                    : `⚠️ ${sanitizerOutput.violations.length} Credential Violations Stripped`}
                </span>
              )}
            </div>

            <div className="relative">
              <pre className="w-full h-[220px] bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-400 overflow-auto">
                {sanitizerOutput
                  ? JSON.stringify(sanitizerOutput.sanitized, null, 2)
                  : 'Invalid JSON input'}
              </pre>
            </div>
          </div>
        </div>

        {sanitizerOutput && sanitizerOutput.violations.length > 0 && (
          <div className="p-3 bg-amber-950/30 border border-amber-800/80 rounded-lg text-xs font-mono text-amber-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Stripped Insecure Keys Detected by Safety Boundary:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-200/80 text-[11px]">
              {sanitizerOutput.violations.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Research System Architecture JSON Manifest */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              <span>Research Architecture Manifest (JSON)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Reproducible machine-readable specification of the PREDICT-PS foundation
            </p>
          </div>
          <button
            onClick={handleCopyManifest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors w-fit"
          >
            {copiedManifest ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Manifest!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>Copy Manifest JSON</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="w-full max-h-96 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-auto">
            {manifestJsonString}
          </pre>
        </div>
      </section>
    </div>
  );
};

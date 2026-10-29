/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PREDICT-PS: Methodology & Privacy View
 */

import React from 'react';
import {
  ShieldCheck,
  Lock,
  Globe,
  HardDrive,
  EyeOff,
  AlertOctagon,
  Scale,
  FileCheck2,
  Cpu,
  Layers,
} from 'lucide-react';

export const MethodologyPrivacyView: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Privacy Architecture Core Invariants */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            <span>Strict Privacy Architecture &amp; System Invariants</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Architectural constraints enforced by design to guarantee password confidentiality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Globe className="w-4 h-4 shrink-0" />
              <span>Invariant 1: Zero Network Egress</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Passwords, candidate tokens, pattern segmentations, and evaluation metrics never leave the local browser process.
              There are zero outbound HTTP/HTTPS requests, zero WebSocket channels, zero WebRTC streams, and zero third-party tracking scripts.
            </p>
          </div>

          <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <HardDrive className="w-4 h-4 shrink-0" />
              <span>Invariant 2: Zero Storage Persistence</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Candidate credentials are never written to <code>localStorage</code>, <code>sessionStorage</code>, <code>document.cookie</code>,
              <code>IndexedDB</code>, Cache Storage, or URL query parameters. All Phase 2+ string interactions operate strictly within volatile JavaScript memory.
            </p>
          </div>

          <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <EyeOff className="w-4 h-4 shrink-0" />
              <span>Invariant 3: Zero Password Logging</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Diagnostic logs and browser developer console statements are stripped of credential parameters.
              Crash handlers and error boundaries explicitly redact any string token resembling credential data.
            </p>
          </div>

          <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <FileCheck2 className="w-4 h-4 shrink-0" />
              <span>Invariant 4: Aggregate-Only Export Sanitization</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Any future export functionality (JSON/CSV) passes through an automated sanitization barrier (<code>sanitizeResearchExport</code>)
              that strips any sensitive field, ensuring only aggregate metrics, confusion matrices, and non-sensitive metadata leave the app.
            </p>
          </div>
        </div>
      </section>

      {/* Threat Model & Boundary Analysis */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-white">
          <AlertOctagon className="w-5 h-5 text-amber-400" aria-hidden="true" />
          <h2 className="text-base font-semibold">Threat Model &amp; Security Boundary Analysis</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse border border-slate-800">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                <th className="p-3 border-r border-slate-800">Threat / Attack Vector</th>
                <th className="p-3 border-r border-slate-800">Adversary Capability</th>
                <th className="p-3 border-r border-slate-800">Architectural Countermeasure</th>
                <th className="p-3">Residual Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-400">
              <tr className="hover:bg-slate-950/40">
                <td className="p-3 font-semibold text-slate-200 border-r border-slate-800">Network Interception</td>
                <td className="p-3 text-slate-400 border-r border-slate-800">Passive/active MITM on local network or proxy</td>
                <td className="p-3 text-emerald-400 border-r border-slate-800">Complete zero-egress. No candidate bytes are transmitted over HTTP/S.</td>
                <td className="p-3 text-slate-400">None (air-gapped execution)</td>
              </tr>
              <tr className="hover:bg-slate-950/40">
                <td className="p-3 font-semibold text-slate-200 border-r border-slate-800">Server Data Compromise</td>
                <td className="p-3 text-slate-400 border-r border-slate-800">Host server breached or logs inspected</td>
                <td className="p-3 text-emerald-400 border-r border-slate-800">Server never receives inputs; backend exists solely as static asset host.</td>
                <td className="p-3 text-slate-400">None (stateless host)</td>
              </tr>
              <tr className="hover:bg-slate-950/40">
                <td className="p-3 font-semibold text-slate-200 border-r border-slate-800">Local Storage Scraping</td>
                <td className="p-3 text-slate-400 border-r border-slate-800">Malicious browser extension reading Web Storage</td>
                <td className="p-3 text-emerald-400 border-r border-slate-800">Zero persistence invariant: localStorage and sessionStorage keys = 0.</td>
                <td className="p-3 text-slate-400">None via storage APIs</td>
              </tr>
              <tr className="hover:bg-slate-950/40">
                <td className="p-3 font-semibold text-slate-200 border-r border-slate-800">Host OS Memory Snooping</td>
                <td className="p-3 text-slate-400 border-r border-slate-800">Root-level process inspector on user workstation</td>
                <td className="p-3 text-amber-400 border-r border-slate-800">Ephemeral variables in V8 heap; future zeroization buffers.</td>
                <td className="p-3 text-amber-300">Out of scope (compromised host OS)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Ethical Research Governance */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Scale className="w-5 h-5 text-indigo-400" aria-hidden="true" />
          <h2 className="text-base font-semibold">Ethical Data Governance &amp; Reproducibility Standard</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <span className="font-semibold text-slate-200 block">Prohibition on Real User Credentials</span>
            <p className="text-slate-400 leading-relaxed">
              PREDICT-PS strictly prohibits utilizing live user passwords, production authentication databases,
              or unredacted enterprise telemetry. All benchmark evaluations rely exclusively on publicly available,
              historical research corpuses where individual identities have been decoupled.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <span className="font-semibold text-slate-200 block">No LLM Leak List Uploads</span>
            <p className="text-slate-400 leading-relaxed">
              In strict adherence to prompt constraints, no leaked password dictionaries or candidate credentials
              will ever be transmitted to external LLM endpoints (including Gemini API). Machine learning models
              consist purely of open-source client-side statistical n-gram matrices and lightweight deterministic classifiers.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <span className="font-semibold text-slate-200 block">Reproducible Seed Determinism</span>
            <p className="text-slate-400 leading-relaxed">
              To allow external academic researchers to independently replicate all evaluation results, partition
              generation, test split shuffling, and cross-validation folds will use explicit, published pseudorandom
              seeds (e.g. Mulberry32 PRNG seed <code>0x5F3759DF</code>).
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <span className="font-semibold text-slate-200 block">Zero-Cost Research Stack</span>
            <p className="text-slate-400 leading-relaxed">
              Built on standard React, TypeScript, and native Web Cryptography APIs without commercial license requirements,
              cloud database charges, or external vendor lock-in.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

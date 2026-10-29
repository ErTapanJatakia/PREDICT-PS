# PREDICT-PS: Password Predictability Research Workbench

> **Phase 1: Secure Application Foundation & Research Architecture**  
> *Notice: Research Prototype — Not a security certification. Academic study in progress.*

---

## 1. Overview & Research Objective

PREDICT-PS investigates the central hypothesis:
> *"Whether explainable password-pattern features fused with a conventional character-level machine-learning model can improve identification of guessable human-selected passwords compared with simple rules, zxcvbn, and a character n-gram ML baseline, while preserving password privacy and acceptable computational cost."*

This is an **empirical hypothesis to test**, not an established result or claim of novelty or superiority.

---

## 2. Phase 1 Scope & Status

This repository contains **Phase 1 (Secure Foundation)** of a 6-phase research roadmap:

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | **Secure Application Foundation & Architecture** | **Completed** |
| Phase 2 | Browser-Local Unbiased CSPRNG Generation & Pattern Extraction | Planned (Not Implemented) |
| Phase 3 | Standard Baselines (NIST SP 800-63B Rules & zxcvbn-ts) | Planned (Not Implemented) |
| Phase 4 | Character n-gram Statistical ML Baseline | Planned (Not Implemented) |
| Phase 5 | Explainable Feature-Fusion Architecture | Planned (Not Implemented) |
| Phase 6 | Reproducible Evaluation Workbench & Ablation Matrix | Planned (Not Implemented) |

---

## 3. Strict Privacy Invariants

To guarantee password confidentiality by design:
1. **Zero Network Egress**: Zero remote API requests. Never transmits passwords or metadata to a server, Gemini API, or third-party endpoint.
2. **Zero Storage Persistence**: Never writes candidate passwords to `localStorage`, `sessionStorage`, `document.cookie`, `IndexedDB`, or URL parameters.
3. **Zero Password Logging**: Console logging and telemetry are prohibited.
4. **No Password Input in Phase 1**: Defense-in-depth policy to eliminate any risk of accidental browser autofill, password manager interception, or memory leakage prior to Phase 2 client isolation hardening.
5. **Export Sanitization**: The built-in `sanitizeResearchExport` filter automatically scrubs any sensitive or credential keys, permitting only aggregate metrics.

---

## 4. Zero-Cost & Open Science Constraints

- **No Paid APIs or Services**: Operates 100% on standard web technologies (React 19, TypeScript, Tailwind CSS, Web Cryptography API).
- **No Physical Quantum Claims**: Rejects pseudo-scientific labels; CSPRNG relies solely on standard browser `crypto.getRandomValues()`.
- **Reproducible Evaluation**: Future benchmarks mandate explicit random seeds, deduplicated public research corpuses, and formal metrics (PR-AUC, Macro-F1, False-Strong Rate, calibration, latency).

---

## 5. Architecture & File Structure

```
├── /index.html               # Entry point with academic metadata
├── /metadata.json            # AI Studio applet manifest
├── /src/
│   ├── /components/
│   │   ├── Header.tsx        # Title, subtitle, prominent disclaimer banner
│   │   ├── NavTabs.tsx       # Accessible tab navigation with honest status badges
│   │   ├── OverviewView.tsx  # Hypothesis, RQ1-RQ3, 6-phase roadmap
│   │   ├── PasswordLabPlaceholder.tsx  # Phase 2 CSPRNG math & pattern specs
│   │   ├── ExperimentsPlaceholder.tsx  # 4-way baseline plan & ablation matrix
│   │   ├── EvaluationPlaceholder.tsx   # Formal metrics & confusion matrix sandbox
│   │   ├── MethodologyPrivacyView.tsx  # Threat model, invariants, ethics
│   │   ├── AuditManifestView.tsx       # Live browser audit & JSON manifest
│   │   └── Footer.tsx        # Academic license and integrity notices
│   ├── /lib/
│   │   ├── foundation.ts     # Pure deterministic math & privacy logic
│   │   └── foundation.test.ts# Node:test unit test suite
│   ├── /types/
│   │   └── research.ts       # Formal TypeScript definitions
│   ├── App.tsx               # Main dashboard shell
│   ├── main.tsx              # React DOM mounting
│   └── index.css             # Tailwind CSS styles
```

---

## 6. How to Run & Verify

### Running Development Server
```bash
npm run dev
```
The server runs on `http://localhost:3000`.

### Running Pure Logic Unit Tests
```bash
npx --yes tsx --test src/lib/foundation.test.ts
```

### Compiling Application
```bash
npm run build
```
Or for type checking:
```bash
npm run lint
```

---

## 7. What is Not Yet Implemented (Future Phases)

- **Phase 2**: Unbiased CSPRNG password generation string generator & deterministic pattern tokenizer.
- **Phase 3**: NIST SP 800-63B rule validator and bundled zxcvbn-ts graph matching.
- **Phase 4**: Character n-gram transition matrix log-likelihood calculator.
- **Phase 5**: Fused structural pattern + n-gram vectorizer.
- **Phase 6**: Real dataset evaluation runs, PR-AUC calculations, and automated ablation experiments.

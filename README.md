# PREDICT-PS: Password Predictability Research Workbench

> **Phase 2: Browser-Local Unbiased CSPRNG Generation & Explainable Pattern Extraction**  
> *Notice: Research Prototype — Not a security certification. Academic study in progress.*

---

## 1. Overview & Research Objective

PREDICT-PS investigates the central hypothesis:
> *"Whether explainable password-pattern features fused with a conventional character-level machine-learning model can improve identification of guessable human-selected passwords compared with simple rules, zxcvbn, and a character n-gram ML baseline, while preserving password privacy and acceptable computational cost."*

This is an **empirical hypothesis to test**, not an established result or claim of novelty or superiority. Phase 2 provides the foundational generation and local structural observation tools; it does not test or validate the comparative ML hypothesis.

---

## 2. Roadmap & Implementation Status

This repository contains **Phase 1** and **Phase 2** of the 6-phase research roadmap:

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | **Secure Application Foundation & Architecture** | **Completed** |
| **Phase 2** | **Browser-Local Unbiased CSPRNG Generation & Pattern Extraction** | **Completed** |
| Phase 3 | Standard Baselines (NIST SP 800-63B Rules & zxcvbn-ts) | Planned (Not Implemented) |
| Phase 4 | Character n-gram Statistical ML Baseline | Planned (Not Implemented) |
| Phase 5 | Explainable Feature-Fusion Architecture | Planned (Not Implemented) |
| Phase 6 | Reproducible Evaluation Workbench & Ablation Matrix | Planned (Not Implemented) |

---

## 3. Phase 2 Implemented Features

### A. Secure Browser-Local CSPRNG Password Generator
- **Entropy Source**: Uses `window.crypto.getRandomValues()` exclusively. Never uses `Math.random()`.
- **Unbiased Rejection Sampling**: Mathematically eliminates modulo bias ($limit = 256 - (256 \pmod k)$).
- **Configurable Parameters**: Length (8–128 characters), character set subsets (lowercase, uppercase, digits, symbols) with strict deduplication.
- **Fail-Secure Architecture**: Explicitly throws and refuses execution if Web Crypto is unavailable; never falls back to a pseudo-random generator.
- **Controls**: Show/hide toggle, explicit-click copy button, and immediate memory clear action.
- **Entropy Disclosure**: Reports theoretical Shannon entropy ($\log_2(k) \times \text{length}$) with explicit scientific notice that this applies solely to algorithmic CSPRNG generation, not as a guessability metric for human credentials.

### B. Explainable Structural Pattern Analyzer
- **Opt-In Test Field**: Separate field with explicit advisory directing users not to input real account credentials.
- **Factual Structural Observations**:
  - Orthographic composition (lowercase, uppercase, digits, symbols, whitespace, other).
  - Repeated identical character runs (e.g. `'s' x 3`) and repeated substrings (e.g. `'abc' (2x)`).
  - Monotonic ascending and descending alphabetical and numeric sequences (e.g. `'12345'`, `'fedc'`).
  - Spatial keyboard-adjacency walks on standard QWERTY layout (horizontal rows, reverse rows, vertical columns).
- **Integrity Boundary**: Outputs deterministic structural descriptions only. Does not output crack probabilities, fake security scores, or untrained ML predictions.

---

## 4. Strict Privacy & Memory Boundaries

1. **Zero Network Egress**: Zero external API calls, zero telemetry, zero database connections, zero Gemini API calls, and zero third-party trackers.
2. **Zero Storage Persistence**: Never writes candidate passwords to `localStorage`, `sessionStorage`, `document.cookie`, `IndexedDB`, or URL query parameters.
3. **Transient Memory Management**: Generated and candidate values are kept transiently in component React state only. They are wiped upon pressing "Clear" and when unmounting or navigating away from the Password Lab tab.
4. **Memory Hygiene Disclosure**: Explicitly documents that JavaScript strings are immutable heap primitives in modern engines (V8, SpiderMonkey) and cannot be guaranteed to be zeroized immediately in physical RAM.
5. **Export Sanitization**: Built-in `sanitizeResearchExport()` filter automatically removes any credential or sensitive keys.

---

## 5. Architecture & File Structure

```
├── /index.html               # Entry point with academic metadata
├── /metadata.json            # AI Studio applet manifest
├── /src/
│   ├── /components/
│   │   ├── Header.tsx        # Title, subtitle, prominent disclaimer banner, Phase 2 badge
│   │   ├── NavTabs.tsx       # Accessible tab navigation with Phase 2 Active badge
│   │   ├── OverviewView.tsx  # Hypothesis, RQ1-RQ3, 6-phase roadmap
│   │   ├── PasswordLabPlaceholder.tsx  # Working Phase 2 generator, analyzer, and math inspector
│   │   ├── ExperimentsPlaceholder.tsx  # 4-way baseline plan & ablation matrix
│   │   ├── EvaluationPlaceholder.tsx   # Formal metrics & confusion matrix sandbox
│   │   ├── MethodologyPrivacyView.tsx  # Threat model, invariants, ethics
│   │   ├── AuditManifestView.tsx       # Live browser audit & JSON manifest
│   │   └── Footer.tsx        # Academic license and integrity notices
│   ├── /lib/
│   │   ├── foundation.ts     # Pure deterministic math, CSPRNG generator & pattern analyzer
│   │   └── foundation.test.ts# Node:test unit test suite (17 tests)
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

### Compiling Application & Linting
```bash
npm run lint
npm run build
```

---

## 7. What is Not Yet Implemented (Future Phases)

- **Phase 3**: NIST SP 800-63B rule validator and bundled zxcvbn-ts graph matching.
- **Phase 4**: Character n-gram transition matrix log-likelihood calculator.
- **Phase 5**: Fused structural pattern + n-gram vectorizer with explainable attribution.
- **Phase 6**: Real dataset evaluation runs, PR-AUC calculations, and automated ablation experiments.

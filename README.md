# PREDICT-PS: Password Predictability Research Workbench

> **Phase 4: Character n-gram ML Baseline (scikit-learn TF-IDF + Logistic Regression)**  
> *Notice: Research Prototype — Not a security certification. Academic study in progress.*

---

## 1. Overview & Research Objective

PREDICT-PS investigates the central hypothesis:
> *"Whether explainable password-pattern features fused with a conventional character-level machine-learning model can improve identification of guessable human-selected passwords compared with simple rules, zxcvbn, and a character n-gram ML baseline, while preserving password privacy and acceptable computational cost."*

This is an **empirical hypothesis to test**, not an established result or claim of novelty or superiority. Phase 4 implements the third comparative baseline: a conventional character-level TF-IDF n-gram (2–5) + Logistic Regression statistical machine-learning model, with a fully reproducible offline Python experiment pipeline and browser-based presentation interface.

---

## 2. Roadmap & Implementation Status

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | **Secure Application Foundation & Architecture** | **Completed** |
| **Phase 2** | **Browser-Local Unbiased CSPRNG Generation & Pattern Extraction** | **Completed** |
| **Phase 3** | **Standard Baselines (zxcvbn-ts & NIST SP 800-63B-4 Guidance)** | **Completed** |
| **Phase 4** | **Character n-gram Statistical ML Baseline (scikit-learn Pipeline)** | **Completed** |
| Phase 5 | Explainable Feature-Fusion Architecture | Planned (Not Implemented) |
| Phase 6 | Reproducible Evaluation Workbench & Ablation Matrix | Planned (Not Implemented) |

---

## 3. Tripartite Analysis Perspectives (Phase 3)

The Password Lab implements three distinct, local evaluation perspectives for any candidate password:

### Perspective A: Transparent Structural Observations (Deterministic Features)
- **Orthographic Composition**: Character counts for lowercase, uppercase, digits, symbols, spaces, and other/Unicode.
- **Repeated Character Runs & Substrings**: Detects contiguous identical characters (e.g. `'s' x 3`) and multi-character repeating chunks (e.g. `'abc' (2x)`).
- **Sequential Runs**: Detects ascending and descending alphabetical and numeric runs (e.g. `'12345'`, `'fedc'`).
- **Spatial Keyboard Adjacency Walks**: Detects contiguous keystrokes along horizontal rows, reverse rows, and vertical columns on standard QWERTY keyboards.
- **Integrity Boundary**: Purely deterministic observations. Outputs zero synthetic scores or uncalibrated probabilities.

### Perspective B: zxcvbn-ts Guessability Baseline (Wheeler et al.)
- **Local Synchronous Execution**: Uses pre-bundled static dictionaries (`@zxcvbn-ts/language-common`, `@zxcvbn-ts/language-en`) and spatial adjacency graphs.
- **Metrics Output**:
  - Score (0 to 4: Very Weak, Weak, Fair, Strong, Very Strong).
  - Search-step order: $\log_{10}(\text{guesses})$ and estimated raw guess count.
  - Feedback warnings and actionable suggestions.
  - Dynamic programming token match sequence breakdown (dictionary word, spatial keyboard walk, repeat, sequence, regex, brute force).
  - Local client execution latency ($\sim 1\text{ms}$).
- **Zero Cost & Zero Network Egress**: Bundled locally via npm (MIT license). Never makes external breach queries (zero HIBP lookups) or cloud calls.
- **Scientific Limitation**: Estimations are heuristic model approximations, NOT mathematical security proofs or crack-time guarantees.

### Perspective C: NIST SP 800-63B-4 Policy Guidance Panel
- **Sourced Reference**: NIST Special Publication 800-63B-4 (*Digital Identity Guidelines: Authentication and Lifecycle Management*, Section 5.1.1.2 Memorized Secret Authenticators).
- **Nature of Guidance**: Explicitly explained as administrative verifier policy requirements, **NOT an algorithmic strength-prediction metric or continuous score**.
- **Requirements Checklist**:
  - **Single-Factor Minimum Length**: Evaluates against the $\ge 15$ character recommendation for single-factor authenticators.
  - **Multi-Factor (MFA) Minimum Length**: Evaluates against the $\ge 8$ character mandate for multi-factor setups.
  - **Maximum Length Support**: Confirms system capacity to accept secrets up to at least 64 characters.
  - **Space Character Support**: Verifies support for multi-word passphrases with natural whitespace.
  - **Prohibition of Composition Rules**: Documents NIST's explicit ban on arbitrary character composition rules (e.g., requiring special characters or mixed case), which induce predictable human substitution patterns.
  - **Compromised Credential Blocklist Check**: Clearly marked **"Not Implemented (Client Boundary Privacy)"**. Discloses that while NIST requires checking passwords against breach corpuses, querying remote breach APIs in this client prototype would violate the zero-network egress and credential-privacy invariants.

---

## 4. CSPRNG Password Generator (Phase 2 Core Tool)

- **Entropy Source**: `window.crypto.getRandomValues()` exclusively. Never uses `Math.random()`.
- **Unbiased Rejection Sampling**: Mathematically eliminates modulo bias ($limit = 256 - (256 \pmod k)$).
- **Configurable Parameters**: Length (8–128 characters), character set subsets (lowercase, uppercase, digits, symbols) with strict deduplication.
- **Fail-Secure Architecture**: Throws and halts if Web Crypto is unavailable; never falls back to weak PRNGs.
- **Controls**: Show/hide toggle, explicit-click copy button, and immediate memory clear.
- **Theoretical Entropy Metric**: Reports theoretical Shannon entropy ($\log_2(k) \times \text{length}$) with notice that it applies solely to algorithmic CSPRNG generation, not human passwords.

---

## 5. Strict Privacy & Memory Boundaries

1. **Zero Network Egress**: Zero external API calls, zero telemetry, zero database connections, zero Gemini API calls, and zero third-party trackers.
2. **Zero Storage Persistence**: Never writes candidate passwords to `localStorage`, `sessionStorage`, `document.cookie`, `IndexedDB`, or URL query parameters.
3. **Transient Memory Management**: Generated and candidate values are kept transiently in component React state only. They are wiped upon pressing "Clear" and when unmounting or navigating away from the Password Lab tab.
4. **Memory Hygiene Disclosure**: Explicitly documents that JavaScript strings are immutable heap primitives in modern engines (V8, SpiderMonkey) and cannot be guaranteed to be zeroized immediately in physical RAM.
5. **Export Sanitization**: Built-in `sanitizeResearchExport()` filter automatically removes any credential or sensitive keys.

---

## 6. Architecture & File Structure

```
├── /index.html               # Entry point with academic metadata
├── /metadata.json            # AI Studio applet manifest
├── /src/
│   ├── /components/
│   │   ├── Header.tsx        # Title, subtitle, disclaimer banner, Phase 3 badge
│   │   ├── NavTabs.tsx       # Accessible tab navigation with Phase 3 Active badge
│   │   ├── OverviewView.tsx  # Hypothesis, RQ1-RQ3, 6-phase roadmap
│   │   ├── PasswordLabPlaceholder.tsx  # Working generator, tripartite analyzer, and math inspector
│   │   ├── ExperimentsPlaceholder.tsx  # 4-way baseline plan & ablation matrix
│   │   ├── EvaluationPlaceholder.tsx   # Formal metrics & confusion matrix sandbox
│   │   ├── MethodologyPrivacyView.tsx  # Threat model, invariants, ethics
│   │   ├── AuditManifestView.tsx       # Live browser audit & JSON manifest
│   │   └── Footer.tsx        # Academic license and integrity notices
│   ├── /lib/
│   │   ├── foundation.ts     # Pure deterministic math, CSPRNG, zxcvbn-ts & NIST evaluator
│   │   └── foundation.test.ts# Node:test unit test suite (22 tests)
│   ├── /types/
│   │   └── research.ts       # Formal TypeScript definitions
│   ├── App.tsx               # Main dashboard shell
│   ├── main.tsx              # React DOM mounting
│   └── index.css             # Tailwind CSS styles
```

---

## 7. How to Run & Verify

### Running Web Development Server
```bash
npm run dev
```
The server runs on `http://localhost:3000`.

### Running TypeScript Pure Logic Test Suite (24 tests)
```bash
npx --yes tsx --test src/lib/foundation.test.ts
```

### Running Python Baseline Pipeline & Test Suite (6 tests)
```bash
# Run unit test suite (schema, split isolation, zero leakage, convergence)
python3 -m unittest discover -s python/tests

# Run reproducible baseline experiment and export sanitized JSON artifact
python3 python/export_artifact.py src/data/phase4_baseline_metrics.json
```

### Compiling Application & Linting
```bash
npm run lint
npm run build
```

---

## 8. Third-Party Licenses & Academic Citations

- **scikit-learn**: Pedregosa et al., *Scikit-learn: Machine Learning in Python*, JMLR 12, pp. 2825-2830, 2011. BSD 3-Clause License.
- **zxcvbn-ts**: Wheeler, Daniel Lowery, et al. Distributed under the MIT License (`@zxcvbn-ts/core`, `@zxcvbn-ts/language-common`, `@zxcvbn-ts/language-en`).
- **NIST SP 800-63B-4**: National Institute of Standards and Technology. *Digital Identity Guidelines: Authentication and Lifecycle Management*, Section 5.1.1.2 Memorized Secret Authenticators (Public Domain).

---

## 9. What is Not Yet Implemented (Future Phases)

- **Phase 5**: Explainable Feature-Fusion Architecture (combining structural pattern descriptors with character n-grams).
- **Phase 6**: Reproducible Evaluation Workbench & Ablation Matrix across all 4 comparators.


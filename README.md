# PREDICT-PS: Password Predictability Research Workbench

> **Phase 4.1: Research Integrity & Baseline Validation**  
> *Notice: Research Prototype — Not a security certification. Academic study in progress.*

---

## 1. Overview & Research Objective

PREDICT-PS investigates the central hypothesis:
> *"Whether explainable password-pattern features fused with a conventional character-level machine-learning model can improve identification of guessable human-selected passwords compared with simple rules, zxcvbn, and a character n-gram ML baseline, while preserving password privacy and acceptable computational cost."*

This is an **empirical hypothesis to test**, not an established result or claim of novelty or superiority. 

Phase 4 implemented the character-level TF-IDF n-gram (2–5) + Logistic Regression statistical machine-learning baseline.

**Phase 4.1 (Research Integrity & Baseline Validation)** strengthens the scientific validity, reproducibility, and methodological integrity of Phase 4 through:
1. **Shortcut-Learning Diagnostics**: Investigating length bias and character composition artifacts in synthetic data.
2. **Controlled Empirical Ablation (6 Experiments)**: Testing models on length-controlled, charset-controlled, and out-of-distribution (OOD) novel grammar holdout datasets.
3. **Partition Isolation & Duplicate Auditing**: Formally proving 0 exact and 0 case-normalized duplicate leakage between train, validation, and test partitions.
4. **Statistical Rigor**: 95% bootstrap confidence intervals (1,000 resamples), Brier calibration scores, and 10-bin Expected Calibration Error (ECE) reliability diagrams.

---

## 2. Roadmap & Implementation Status

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | **Secure Application Foundation & Architecture** | **Completed** |
| **Phase 2** | **Browser-Local Unbiased CSPRNG Generation & Pattern Extraction** | **Completed** |
| **Phase 3** | **Standard Baselines (zxcvbn-ts & NIST SP 800-63B-4 Guidance)** | **Completed** |
| **Phase 4** | **Character n-gram Statistical ML Baseline (scikit-learn Pipeline)** | **Completed** |
| **Phase 4.1**| **Research Integrity & Baseline Validation (Ablation Matrix & Audits)**| **Completed** |
| Phase 5 | Explainable Feature-Fusion Architecture | Planned (Not Implemented) |
| Phase 6 | Reproducible Evaluation Workbench & Ablation Matrix | Planned (Not Implemented) |

---

## 3. Phase 4.1 Controlled Empirical Ablation Matrix (6 Experiments)

| Experiment | Purpose & Dataset Condition | Evaluation Split | FSR | Macro-F1 | PR-AUC | ROC-AUC | Balanced Acc | Brier | 95% CI (F1) |
|---|---|---|---|---|---|---|---|---|---|
| **Exp 1: Original Baseline** | TF-IDF n-grams (2–5) + LogisticRegression on standard synthetic data | In-Distribution Test | 0.00% | 1.0000 | 1.0000 | 1.0000 | 100.00% | 0.0402 | [1.000, 1.000] |
| **Exp 2: Length-Controlled** | Length held strictly to [12, 16] characters ($\Delta = 0.0$ chars) | Length-Controlled Test | 0.00% | 0.9983 | 1.0000 | 1.0000 | 99.83% | 0.0238 | [1.000, 1.000] |
| **Exp 3: Charset-Controlled** | All 4 character classes required (lower, upper, digit, symbol) | Charset-Controlled Test | 0.00% | 0.9867 | 1.0000 | 1.0000 | 98.67% | 0.0227 | [1.000, 1.000] |
| **Exp 4: Independent Holdout** | **OOD Transfer**: Exp 1 model evaluated against novel pattern grammars (seed 9999) | OOD Holdout Test | **71.20%** | **0.5891** | **0.8428** | **0.8108** | **64.00%** | **0.2663** | [0.408, 0.467] |
| **Exp 5: Length-Only Diagnostic**| LogisticRegression predicting solely from candidate string length | Shortcut Diagnostic | 2.00% | 0.9399 | 0.9854 | 0.9896 | 94.00% | 0.0390 | [0.921, 0.958] |
| **Exp 6: Composition Diagnostic**| LogisticRegression predicting from 6 character-class counts | Shortcut Diagnostic | 0.00% | 0.9950 | 1.0000 | 1.0000 | 99.50% | 0.0022 | [0.995, 1.000] |

### Key Scientific Findings:
1. **Shortcut Learning Exists (Exps 5 & 6)**: In the unconstrained synthetic dataset, positive samples have a mean length of 9.33 characters while negative samples have a mean length of 15.93 characters ($\Delta = 6.6$ chars). A model using *only length* achieves 94.00% accuracy, and one using *only character counts* achieves 99.50% accuracy.
2. **Subword Learning is Real (Exp 2)**: When candidate length is strictly matched between classes ($\Delta = 0.0$ chars in [12, 16]), the character n-gram model still achieves 99.83% Macro-F1 (100% accuracy), proving that it genuinely learns subwords and character sequences beyond pure length.
3. **Out-of-Distribution Transfer Fails (Exp 4)**: When evaluated without retraining against unseen structural grammars (ISO dates, PIN-padded names, reverse encased phrases, zigzag walks), the character n-gram model's **False-Strong Rate surges to 71.20%** and **Recall collapses to 28.80%**. This directly supports the central hypothesis (RQ2) that purely statistical n-grams overfit to specific dictionary subwords and fail on novel structures, motivating the proposed explainable pattern fusion in Phase 5.

---

## 4. Tripartite Analysis Perspectives (Phase 3)

The Password Lab implements three distinct, local evaluation perspectives for any candidate password:

### Perspective A: Transparent Structural Observations (Deterministic Features)
- **Orthographic Composition**: Character counts for lowercase, uppercase, digits, symbols, spaces, and other/Unicode.
- **Repeated Character Runs & Substrings**: Detects contiguous identical characters and multi-character repeating chunks.
- **Sequential Runs**: Detects ascending and descending alphabetical and numeric runs.
- **Spatial Keyboard Adjacency Walks**: Detects contiguous keystrokes along horizontal rows, reverse rows, and vertical columns on standard QWERTY keyboards.
- **Integrity Boundary**: Purely deterministic observations. Outputs zero synthetic scores or uncalibrated probabilities.

### Perspective B: zxcvbn-ts Guessability Baseline (Wheeler et al.)
- **Local Synchronous Execution**: Uses pre-bundled static dictionaries (`@zxcvbn-ts/language-common`, `@zxcvbn-ts/language-en`) and spatial adjacency graphs.
- **Zero Cost & Zero Network Egress**: Bundled locally via npm (MIT license). Never makes external breach queries (zero HIBP lookups) or cloud calls.
- **Scientific Limitation**: Estimations are heuristic model approximations, NOT mathematical security proofs or crack-time guarantees.

### Perspective C: NIST SP 800-63B-4 Policy Guidance Panel
- **Sourced Reference**: NIST SP 800-63B-4 (*Digital Identity Guidelines: Authentication and Lifecycle Management*, Section 5.1.1.2 Memorized Secret Authenticators).
- **Nature of Guidance**: Explicitly explained as administrative verifier policy requirements, **NOT an algorithmic strength-prediction metric or continuous score**.
- Evaluates against single-factor ($\ge 15$), MFA ($\ge 8$), max length ($\ge 64$), spaces, composition rule prohibitions, and documents zero remote breach API calls.

---

## 5. CSPRNG Password Generator (Phase 2 Core Tool)

- **Entropy Source**: `window.crypto.getRandomValues()` exclusively. Never uses `Math.random()`.
- **Unbiased Rejection Sampling**: Mathematically eliminates modulo bias ($limit = 256 - (256 \pmod k)$).
- **Configurable Parameters**: Length (8–128 characters), character set subsets (lowercase, uppercase, digits, symbols) with strict deduplication.
- **Fail-Secure Architecture**: Throws and halts if Web Crypto is unavailable; never falls back to weak PRNGs.

---

## 6. Strict Privacy & Memory Boundaries

1. **Zero Network Egress**: Zero external API calls, zero telemetry, zero database connections, zero Gemini API calls, and zero third-party trackers.
2. **Zero Storage Persistence**: Never writes candidate passwords to `localStorage`, `sessionStorage`, `document.cookie`, `IndexedDB`, or URL query parameters.
3. **Transient Memory Management**: Generated and candidate values are kept transiently in component React state only.
4. **Export Sanitization**: Built-in `sanitizeResearchExport()` filter and JSON schema validators (`predict_ps_phase4_v1` and `predict_ps_phase4_1_v1`) reject any raw password candidates or credential material.

---

## 7. How to Run & Verify

### Running Web Development Server
```bash
npm run dev
```
The server runs on `http://localhost:3000`.

### Running Python Unit Test Suite (23 Tests)
```bash
python3 -m unittest discover -s python/tests -v
```

### Running All 6 Experiments & Generating Manifest
```bash
python3 python/run_experiments.py
```
Outputs: `src/data/phase4_1_experiments_manifest.json` and `src/data/phase4_baseline_metrics.json`.

### Running TypeScript Pure Logic Test Suite (26 Tests)
```bash
npx --yes tsx --test src/lib/foundation.test.ts
```

### Compiling Application & Linting
```bash
npm run lint
npm run build
```

---

## 8. Third-Party Licenses & Academic Citations

- **scikit-learn**: Pedregosa et al., *Scikit-learn: Machine Learning in Python*, JMLR 12, pp. 2825-2830, 2011. BSD 3-Clause License.
- **NumPy**: Harris et al., *Array programming with NumPy*, Nature 585, pp. 357–362, 2020. BSD License.
- **SciPy**: Virtanen et al., *SciPy 1.0: Fundamental Algorithms for Scientific Computing in Python*, Nature Methods 17, pp. 261–272, 2020. BSD License.
- **zxcvbn-ts**: Wheeler, Daniel Lowery, et al. Distributed under the MIT License (`@zxcvbn-ts/core`, `@zxcvbn-ts/language-common`, `@zxcvbn-ts/language-en`).
- **NIST SP 800-63B-4**: National Institute of Standards and Technology. *Digital Identity Guidelines: Authentication and Lifecycle Management*, Section 5.1.1.2 Memorized Secret Authenticators (Public Domain).

---

## 9. Future Phases (Not Yet Implemented)

- **Phase 5**: Explainable Feature-Fusion Architecture (combining structural pattern descriptors with character n-grams).
- **Phase 6**: Reproducible Evaluation Workbench & Ablation Matrix across all 4 comparators.

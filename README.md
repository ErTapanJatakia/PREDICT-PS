# PREDICT-PS: Password Predictability Research Workbench

> **Phase 4.2: Statistical Correction, Artifact Synchronization & Research Integrity Gate**  
> *Notice: Research Prototype — Not a security certification. Academic study in progress.*

---

## 1. Overview & Research Objective

PREDICT-PS investigates the central hypothesis:
> *"Whether explainable password-pattern features fused with a conventional character-level machine-learning model can improve identification of guessable human-selected passwords compared with simple rules, zxcvbn, and a character n-gram ML baseline, while preserving password privacy and acceptable computational cost."*

This is an **empirical hypothesis to test**, not an established result or claim of novelty or superiority. 

Phase 4 implemented the character-level TF-IDF n-gram (2–5) + Logistic Regression statistical machine-learning baseline.

**Phase 4.2 (Statistical Correction, Artifact Synchronization & Research Integrity Gate)** strengthens the scientific validity, reproducibility, and methodological integrity through:
1. **Bootstrap Threshold Defect Correction**: Propagating the exact validation-selected decision threshold $\tau$ into `compute_bootstrap_confidence_intervals`. Every bootstrap resample is evaluated at this fixed threshold (never defaulting to 0.5 or re-optimizing on test splits), ensuring point estimates and confidence intervals evaluate the same classifier operating point.
2. **Resample Accounting**: Full tracking of `requested_resamples` (1,000), `valid_resamples`, `skipped_single_class_resamples`, and `valid_resamples_by_metric` for both ranking and classification metrics.
3. **Dual-Control Dataset & Neutralization (Exps 7 & 8)**: Jointly controlling BOTH candidate length (exact 14 characters) and character composition (8 lower, 2 upper, 2 digits, 2 symbols) across both positive and negative classes. Exp 8 demonstrates that a composition-only diagnostic model collapses to near-random guessing (55.50% Acc, 0.5725 ROC-AUC), proving composition shortcut neutralization.
4. **Independent Holdout Evaluation (Exp 4)**: Evaluating the frozen Exp 1 model and threshold $\tau_{orig}$ on unseen pattern templates (ISO dates, PIN-padded names, reverse encasing, zigzag walks) without retraining.
5. **Artifact Synchronization & Verification**: Canonical synchronization between `src/data/` and `python/` artifacts with 28 automated Python regression tests and 26 TypeScript tests.

---

## 2. Roadmap & Implementation Status

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | **Secure Application Foundation & Architecture** | **Completed** |
| **Phase 2** | **Browser-Local Unbiased CSPRNG Generation & Pattern Extraction** | **Completed** |
| **Phase 3** | **Standard Baselines (zxcvbn-ts & NIST SP 800-63B-4 Guidance)** | **Completed** |
| **Phase 4** | **Character n-gram Statistical ML Baseline (scikit-learn Pipeline)** | **Completed** |
| **Phase 4.1**| **Research Integrity & Baseline Validation (Ablation Matrix & Audits)**| **Completed** |
| **Phase 4.2**| **Statistical Correction, Artifact Synchronization & Integrity Gate** | **Completed** |
| Phase 5 | Explainable Feature-Fusion Architecture | Planned (Not Implemented) |
| Phase 6 | Reproducible Evaluation Workbench & Ablation Matrix | Planned (Not Implemented) |

---

## 3. Controlled Empirical Ablation Matrix (8 Experiments)

| Experiment | Purpose & Dataset Condition | Evaluation Split | FSR | Macro-F1 | PR-AUC | ROC-AUC | Balanced Acc | Brier | 95% CI (F1) |
|---|---|---|---|---|---|---|---|---|---|
| **Exp 1: Original Baseline** | TF-IDF n-grams (2–5) + LogisticRegression on standard synthetic data | In-Distribution Test | 0.00% | 1.0000 | 1.0000 | 1.0000 | 100.00% | 0.0402 | [1.000, 1.000] |
| **Exp 2: Length-Controlled** | Length held strictly to [12, 16] characters ($\Delta = 0.0$ chars) | Length-Controlled Test | 0.00% | 0.9983 | 1.0000 | 1.0000 | 99.83% | 0.0238 | [1.000, 1.000] |
| **Exp 3: Charset-Controlled** | All 4 character classes required (lower, upper, digit, symbol) | Charset-Controlled Test | 0.00% | 0.9867 | 1.0000 | 1.0000 | 98.67% | 0.0227 | [1.000, 1.000] |
| **Exp 4: Independent Holdout** | **OOD Transfer**: Exp 1 model evaluated against novel pattern grammars (seed 9999) | OOD Holdout Test | **71.20%** | **0.5891** | **0.8428** | **0.8108** | **64.00%** | **0.2663** | [0.408, 0.467] |
| **Exp 5: Length-Only Diagnostic**| LogisticRegression predicting solely from candidate string length | Shortcut Diagnostic | 2.00% | 0.9399 | 0.9854 | 0.9896 | 94.00% | 0.0390 | [0.921, 0.958] |
| **Exp 6: Composition Diagnostic**| LogisticRegression predicting from 6 character-class counts | Shortcut Diagnostic | 0.00% | 0.9950 | 1.0000 | 1.0000 | 99.50% | 0.0022 | [0.995, 1.000] |
| **Exp 7: Dual-Controlled Model** | TF-IDF n-grams on matched length (14) AND composition (8L/2U/2D/2S) | Dual-Controlled Test | 0.00% | 1.0000 | 1.0000 | 1.0000 | 100.00% | 0.0041 | [1.000, 1.000] |
| **Exp 8: Composition on Matched**| Composition diagnostic evaluated on Exp 7 matched dataset | Neutralization Test | 42.00%| **0.5539** | 0.5401 | **0.5725** | **55.50%** | 0.2483 | [0.505, 0.598] |

### Key Scientific Findings:
1. **Shortcut Learning Exists in Unconstrained Data (Exps 5 & 6)**: In the unconstrained synthetic dataset, positive samples have a mean length of 9.33 characters while negative samples have a mean length of 15.93 characters ($\Delta = 6.6$ chars). A model using *only length* achieves 94.00% accuracy, and one using *only character counts* achieves 99.50% accuracy.
2. **Subword Learning Persists Under Full Neutralization (Exp 7 vs Exp 8)**: When both length and character composition are held identical between classes (14 chars: 8 lower, 2 upper, 2 digits, 2 symbols), the composition model collapses to random chance (55.50% Acc, 0.5725 ROC-AUC, Exp 8), proving complete neutralization of the composition shortcut. Meanwhile, the character n-gram model still achieves 100.00% accuracy (Exp 7) by learning natural language subwords and character transitions (`baseball`, `security`, `matrix`).
3. **Out-of-Distribution Transfer Fails Severely (Exp 4)**: When evaluated without retraining against unseen structural grammars (ISO dates, PIN-padded names, reverse encased phrases, zigzag walks), the character n-gram model's **False-Strong Rate surges to 71.20%** and **Recall collapses to 28.80%**. This directly supports the central hypothesis (RQ2) that purely statistical n-grams overfit to specific dictionary subwords and fail on novel structures, motivating the proposed explainable pattern fusion in Phase 5.

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

### Running Python Unit Test Suite (28 Tests)
```bash
python3 -m unittest discover -s python/tests -v
```

### Running All 8 Experiments & Generating Manifest
```bash
python3 python/run_experiments.py
```
Outputs: `src/data/phase4_1_experiments_manifest.json` and `python/phase4_1_experiments_manifest.json`.

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

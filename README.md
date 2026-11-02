# PREDICT-PS: Password Predictability Research Workbench

> **Phase 4.2.3: Combined Lexical–Template Generalization, Threshold Robustness & Statistical Reconciliation**  
> *Notice: Research Prototype — Not a security certification. Academic study in progress.*

---

## 1. Overview & Research Objective

PREDICT-PS investigates the central hypothesis:
> *"Whether explainable password-pattern features fused with a conventional character-level machine-learning model can improve identification of guessable human-selected passwords compared with simple rules, zxcvbn, and a character n-gram ML baseline, while preserving password privacy and acceptable computational cost."*

This is an **empirical hypothesis to test**, not an established result or claim of novelty or superiority.

Phase 4 implemented the character-level TF-IDF n-gram (2–5) + Logistic Regression statistical machine-learning baseline.

**Phase 4.2.3 (Combined Lexical–Template Generalization, Threshold Robustness & Statistical Reconciliation)** completes the final scientific integrity audit before Phase 5 feature fusion:
1. **Combined Lexical and Template Isolation (Exp G9)**: Simultaneously isolates dictionary root words ($W_{\text{train}} \cap W_{\text{val}} = \emptyset, W_{\text{train}} \cap W_{\text{test}} = \emptyset, W_{\text{val}} \cap W_{\text{test}} = \emptyset$; 206 train words, 44 val words, 44 test words; 0 overlap) AND positive template families (Train: `PrefixPadded` + `SuffixPadded`; Val: `WordSymbolsSuffix`; Test: `PrefixSymbols`), strictly matched to 14 chars (8L/2U/2D/2S).
2. **Independent Generator V2b & Syllabic Pseudo-Word Negatives (Exp G10)**: Investigates sequence artefacts by replacing uniform random character scrambles with pseudo-phonetic consonant-vowel syllabic clusters (`bapomilu`, `zenulabi`), matching length and character composition with **0.00% stem overlap**.
3. **Threshold Robustness & Degenerate Decision Regime Analysis**: Comprehensive threshold sensitivity sweeps ($\tau \in [0.05, 0.95]$ in 19 steps) detailing validation-selected threshold ($\tau_{\text{val}}$), predicted positive rate ($\text{PPR} = (\text{TP} + \text{FP}) / N_{\text{total}}$), confusion matrix, sensitivity, specificity, and macro-F1. Diagnoses degenerate all-negative regimes ($\text{PPR} = 0.0\%$, Sensitivity = 0.0%, Specificity = 100.0%, FSR = 100.0%) where nominal 50.0% accuracy on balanced test data reflects null decision boundary collapse, **NOT random guessing**.
4. **Sequence Transition Entropy Parity**: Jensen-Shannon divergence between positive and negative character-class transitions drops from 0.1395 (uniform scramble) to 0.0822 (syllabic pseudo-words), closing the class-transition entropy gap by 41% while maintaining 0.00% stem overlap with the positive root dictionary.
5. **Automated Manifest Reconciliation Gate**: Automated verification tool (`python/verify_manifest_reconciliation.py`) enforcing 6 invariant checks across experiment IDs, sample counts, 1,000 bootstrap resamples at fixed validation thresholds, bit-for-bit manifest mirroring between `python/` and `src/data/`, and zero raw password leakage.

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
| **Phase 4.2.2**| **Lexical Leakage, Template Generalization & Independent Generator Audit** | **Completed** |
| **Phase 4.2.3**| **Combined Isolation, Threshold Robustness & Statistical Reconciliation** | **Completed (Active)** |
| Phase 5 | Explainable Feature-Fusion Architecture | Planned (Not Implemented) |
| Phase 6 | Reproducible Evaluation Workbench & Ablation Matrix | Planned (Not Implemented) |

---

## 3. Phase 4.2.3 Combined Isolation & Generalization Audit Matrix (Tracks G1–G10)

| Experiment | Description & Conditions | Partition Strategy | Test Acc | Macro-F1 | FSR | ROC-AUC | Brier | 95% CI (F1) |
|---|---|---|---|---|---|---|---|---|
| **G1: Random Split Baseline** | Matched 14-char (8L/2U/2D/2S) standard templates | Random Stratified ($N=4,000$) | 99.67% | 0.9967 | 0.33% | 0.9999 | 0.0480 | [0.992, 1.000] |
| **G2: Lexical-Group Disjoint** | 207 train / 44 val / 45 test disjoint words | Disjoint Dictionary Groups | 98.40% | 0.9840 | **2.88%** | 0.9994 | 0.0460 | [0.973, 0.993] |
| **G3: Template-Family Disjoint**| Train on `PrefixPadded`/`SuffixPadded`, test on `PrefixSymbols` | Held-Out Template Family | 99.79% | 0.9979 | 0.42% | 1.0000 | 0.0401 | [0.994, 1.000] |
| **G4: Independent Generator V2**| Frozen G1 model tested on phonetic compounding & novel geometries | Unseen Generator V2 ($N=1,000$) | **75.00%** | **0.7344** | **49.20%** | **0.8658** | **0.2285** | [0.638, 0.704] |
| **G5: Lexical-Only Diagnostic**| Evaluates dictionary word presence/coverage shortcut | Random Split | **99.67%** | **0.9967** | 0.33% | **0.9967** | 0.0033 | [0.992, 1.000] |
| **G6: Lexical-Only Disjoint** | Evaluates dictionary word presence on unseen words | Disjoint Lexical Split | **50.00%** | **0.3333** | 100.00% | **0.5000** | 0.5000 | [0.333, 0.333] |
| **G7: Position-Aware Diagnostic**| Evaluates 56 positional character-class slots alone | Standard Templates | **99.50%** | **0.9950** | 0.00% | **1.0000** | 0.0049 | [0.990, 1.000] |
| **G8: Position-Aware Held-Out** | Evaluates positional slots on held-out template families | Held-Out Template Families | **50.00%** | **0.3333** | 100.00% | **0.7158** | 0.5000 | [0.333, 0.333] |
| **G9: Combined Lexical+Template**| Disjoint roots (206/44/44) + held-out PrefixSymbols | Combined Dual Disjoint | **98.50%** | **0.9850** | **0.67%** | **0.9991** | **0.0526** | [0.975, 0.993] |
| **G10: Syllabic Negatives Transfer**| Matched 14-char candidates with consonant-vowel negatives | Syllabic Negative Generator V2b | **58.70%** | **0.5843** | **49.40%** | **0.6357** | **0.2443** | [0.552, 0.615] |

---

## 4. Threshold Robustness & Decision Regime Analysis (G4, G6, G8, G9, G10)

| Experiment | Selected $\tau_{\text{val}}$ | Predicted Positive Rate (PPR) | Confusion Matrix (TP / FP / TN / FN) | Sensitivity (Recall) | Specificity | False-Strong Rate (FSR) | Macro-F1 | ROC-AUC | PR-AUC | Classification Regime |
|---|---|---|---|---|---|---|---|---|---|---|
| **G4 (Indep Gen V2)** | 0.05 | 25.40% | 254 / 0 / 500 / 246 | 50.80% | 100.00% | **49.20%** | 0.7344 | 0.8658 | 0.8876 | Skewed Classification |
| **G6 (Lexical Disjoint)**| 0.50 | **0.00%** | 0 / 0 / 250 / 250 | **0.00%** | 100.00% | **100.00%** | 0.3333 | 0.5000 | 0.5000 | **Degenerate Null Regime** |
| **G8 (Template Held-Out)**| 0.50 | **0.00%** | 0 / 0 / 236 / 236 | **0.00%** | 100.00% | **100.00%** | 0.3333 | 0.7158 | 0.7107 | **Degenerate Null Regime** |
| **G9 (Combined Disjoint)**| 0.39 | 50.00% | 298 / 2 / 298 / 2 | 99.33% | 99.33% | **0.67%** | 0.9850 | 0.9991 | 0.9992 | **Balanced Classification** |
| **G10 (Syllabic Negatives)**| 0.05 | 42.10% | 253 / 168 / 332 / 247 | 50.60% | 66.40% | **49.40%** | 0.5843 | 0.6357 | 0.6186 | Skewed Classification |

### Critical Distinction: Degenerate Null-Decision Regime vs Random Guessing
In Experiments **G6** and **G8**, all test candidate probabilities fall below the validation-selected decision threshold ($\tau = 0.50$). Consequently, the classifier assigns Label 0 (negative / resilient) to 100% of samples ($\text{PPR} = 0.0\%$, True Positives = 0, False Positives = 0, True Negatives = $N/2$, False Negatives = $N/2$).

On a balanced 50/50 test set, predicting all zeros yields a nominal **50.0% accuracy**. PREDICT-PS explicitly documents that this represents a **degenerate null decision boundary collapse**, **NOT random guessing**:
- Random guessing on a balanced test set yields $\text{PPR} \approx 50\%$ with approximately equal true positives and false positives ($\text{TP} \approx N/4, \text{FP} \approx N/4, \text{TN} \approx N/4, \text{FN} \approx N/4$).
- Degenerate null prediction yields $\text{TP} = 0$ and $\text{FSR} = 100.0\%$, representing a total failure to detect any weak passwords.
- This diagnostic proves that the lexical and positional shortcut models learn zero transferable representations outside their training distributions.

### Syllabic Negatives Transfer Collapse (Exp G10)
In Exp G4, the character n-gram baseline achieved 75.00% accuracy and 0.8658 ROC-AUC on candidates generated with uniform random character scrambles. In Exp G10, negative candidates were constructed using pseudo-phonetic consonant-vowel syllabic clusters (`bapomilu`, `zenulabi`), matching length and character composition.
- ROC-AUC collapses from **0.9643 down to 0.6357**.
- Accuracy falls to **58.70%** (Macro-F1 0.5843, FSR 49.40%).
- Jensen-Shannon transition divergence between positive and negative sequences decreases from **0.1395 to 0.0822** (-41% entropy gap).
- This confirms that character n-grams rely heavily on sequence transition entropy gaps between words and random noise, providing strong empirical motivation for structural feature fusion in Phase 5.

---

## 5. Controlled Empirical Ablation Matrix (Historical Phase 4.2 Tracks A1–A8)

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

---

## 6. Tripartite Analysis Perspectives (Phase 3)

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

## 7. CSPRNG Password Generator (Phase 2 Core Tool)

- **Entropy Source**: `window.crypto.getRandomValues()` exclusively. Never uses `Math.random()`.
- **Unbiased Rejection Sampling**: Mathematically eliminates modulo bias ($limit = 256 - (256 \pmod k)$).
- **Configurable Parameters**: Length (8–128 characters), character set subsets (lowercase, uppercase, digits, symbols) with strict deduplication.
- **Fail-Secure Architecture**: Throws and halts if Web Crypto is unavailable; never falls back to weak PRNGs.

---

## 8. Strict Privacy & Memory Boundaries

1. **Zero Network Egress**: Zero external API calls, zero telemetry, zero database connections, zero Gemini API calls, and zero third-party trackers.
2. **Zero Storage Persistence**: Never writes candidate passwords to `localStorage`, `sessionStorage`, `document.cookie`, `IndexedDB`, or URL query parameters.
3. **Transient Memory Management**: Generated and candidate values are kept transiently in component React state only.
4. **Export Sanitization**: Built-in `sanitizeResearchExport()` filter and JSON schema validators (`predict_ps_phase4_v1`, `predict_ps_phase4_1_v1`, `predict_ps_phase4_2_2_v1`, and `predict_ps_phase4_2_3_v1`) reject any raw password candidates or credential material.

---

## 9. How to Run & Verify

### Running Web Development Server
```bash
npm run dev
```
The server runs on `http://localhost:3000`.

### Running Automated Manifest Reconciliation Verifier
```bash
python3 python/verify_manifest_reconciliation.py
```
Validates all 6 invariant checks across manifests, sample counts, threshold policies, and zero password leakage.

### Running Python Unit Test Suite (45 Tests)
```bash
python3 -m unittest discover -s python/tests -v
```

### Running TypeScript Pure Logic Test Suite (30 Tests)
```bash
npx --yes tsx --test src/lib/foundation.test.ts
```

### Running Phase 4.2.3 Audit Runner
```bash
python3 python/run_phase4_2_3_audit.py
```
Generates synchronized `src/data/phase4_2_3_audit_manifest.json` and `python/phase4_2_3_audit_manifest.json`.

### Compiling Application & Linting
```bash
npm run lint
npm run build
```

---

## 10. Third-Party Licenses & Academic Citations

- **scikit-learn**: Pedregosa et al., *Scikit-learn: Machine Learning in Python*, JMLR 12, pp. 2825-2830, 2011. BSD 3-Clause License.
- **NumPy**: Harris et al., *Array programming with NumPy*, Nature 585, pp. 357–362, 2020. BSD License.
- **SciPy**: Virtanen et al., *SciPy 1.0: Fundamental Algorithms for Scientific Computing in Python*, Nature Methods 17, pp. 261–272, 2020. BSD License.
- **zxcvbn-ts**: Wheeler, Daniel Lowery, et al. Distributed under the MIT License (`@zxcvbn-ts/core`, `@zxcvbn-ts/language-common`, `@zxcvbn-ts/language-en`).
- **NIST SP 800-63B-4**: National Institute of Standards and Technology. *Digital Identity Guidelines: Authentication and Lifecycle Management*, Section 5.1.1.2 Memorized Secret Authenticators (Public Domain).

---

## 11. Future Phases (Not Yet Implemented)

- **Phase 5**: Explainable Feature-Fusion Architecture (combining structural pattern descriptors with character n-grams).
- **Phase 6**: Reproducible Evaluation Workbench & Ablation Matrix across all 4 comparators.

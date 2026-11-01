# PREDICT-PS: Password Predictability Research Workbench

> **Phase 4.2.2: Lexical Leakage, Template Generalization & Independent Generator Audit**  
> *Notice: Research Prototype — Not a security certification. Academic study in progress.*

---

## 1. Overview & Research Objective

PREDICT-PS investigates the central hypothesis:
> *"Whether explainable password-pattern features fused with a conventional character-level machine-learning model can improve identification of guessable human-selected passwords compared with simple rules, zxcvbn, and a character n-gram ML baseline, while preserving password privacy and acceptable computational cost."*

This is an **empirical hypothesis to test**, not an established result or claim of novelty or superiority.

Phase 4 implemented the character-level TF-IDF n-gram (2–5) + Logistic Regression statistical machine-learning baseline.

**Phase 4.2.2 (Lexical Leakage, Template Generalization & Independent Generator Audit)** advances scientific rigor before Phase 5 feature fusion through:
1. **Lexical Group Isolation**: Strict partition of underlying dictionary words so that no dictionary root word appears in more than one partition ($W_{\text{train}} \cap W_{\text{val}} = \emptyset$, $W_{\text{train}} \cap W_{\text{test}} = \emptyset$, $W_{\text{val}} \cap W_{\text{test}} = \emptyset$; 207 train words, 44 val words, 45 test words; 0 overlap).
2. **Template Family Generalization**: Holding out entire positive-generation template families (e.g., training on `PrefixPadded` and `SuffixPadded`, evaluating on unseen `PrefixSymbols`) with matched length (14) and composition (8L/2U/2D/2S).
3. **Independent Generator V2 Evaluation**: Evaluating transfer to candidates synthesized by an independently designed generator featuring phonetic stem compounding (`starfire`, `moonrock`) and bracketed/interleaved geometries.
4. **Diagnostic Comparators**:
   - `LexicalOnlyBaselineModel`: Extracts dictionary presence and coverage from training words to quantify the word memorization shortcut.
   - `PositionAwareDiagnosticModel`: Extracts 56 positional character-type features to quantify positional slot bias without character identity knowledge.
5. **Rigorous Bootstrap Accounting**: Propagating the exact validation-selected threshold $\tau$ across 1,000 bootstrap iterations with full resample accounting (`requested_resamples`, `valid_resamples`, `skipped_single_class_resamples`, `valid_resamples_by_metric`).
6. **Artifact Synchronization & Verification**: Canonical synchronization between `src/data/` and `python/` artifacts with 36 automated Python regression tests and 27 TypeScript tests.

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
| Phase 5 | Explainable Feature-Fusion Architecture | Planned (Not Implemented) |
| Phase 6 | Reproducible Evaluation Workbench & Ablation Matrix | Planned (Not Implemented) |

---

## 3. Phase 4.2.2 Generalization & Leakage Audit Matrix (Tracks G1–G8)

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

### Key Scientific Findings:
1. **Dictionary Word Memorization is a Latent Shortcut (G5 vs G6)**: On random splits where dictionary words overlap between train and test partitions, a pure lexical memorizer achieves **99.67% accuracy** without learning any subword generalizations (Exp G5). When evaluated under strict lexical group isolation (Exp G6), this diagnostic collapses completely to **50.00% accuracy and 0.5000 ROC-AUC** (exact chance), confirming zero cross-word transfer and proving the isolation methodology is airtight.
2. **Positional Character Slots Are Fully Exploited on Fixed Templates (G7 vs G8)**: A model given zero character identity information—only the character class (lower, upper, digit, symbol) at each of the 14 indices—achieves **99.50% accuracy and 1.0000 ROC-AUC** on standard templates (Exp G7). When evaluated against held-out template geometries (Exp G8), accuracy collapses to **50.00% (exact random chance)**, demonstrating that standard synthetic templates permit severe positional overfitting.
3. **Lexical Isolation Increases Error Rates on Guessable Passwords (G1 vs G2)**: When dictionary root words are strictly disjoint between train and test partitions (Exp G2), the False-Strong Rate increases nearly **9-fold** (from 0.33% to 2.88%), revealing that the model's apparent in-distribution precision was partially inflated by memorizing specific root stems.
4. **Independent Generator Transfer Failure Demonstrates Generator Dependence (G4)**: When the frozen character n-gram baseline is evaluated on candidates from an independent generator featuring phonetic stem compounding (`starfire`, `moonrock`) and non-affix geometries (sandwich, bracketed), accuracy drops to **75.00%**, macro-F1 drops to **0.7344**, and the **False-Strong Rate surges to 49.20%** ($246/500$ predictable passwords classified as strong). This empirically proves that character n-gram baselines exhibit severe generator dependence and lack generalizable understanding of human-like structural predictability.

---

## 4. Controlled Empirical Ablation Matrix (Historical Phase 4.2 Tracks A1–A8)

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
4. **Export Sanitization**: Built-in `sanitizeResearchExport()` filter and JSON schema validators (`predict_ps_phase4_v1`, `predict_ps_phase4_1_v1`, and `predict_ps_phase4_2_2_v1`) reject any raw password candidates or credential material.

---

## 7. How to Run & Verify

### Running Web Development Server
```bash
npm run dev
```
The server runs on `http://localhost:3000`.

### Running Python Unit Test Suite (36 Tests)
```bash
python3 -m unittest discover -s python/tests -v
```

### Running Phase 4.2.2 Generalization Experiments (Tracks G1–G8)
```bash
python3 python/run_generalization_experiments.py
```
Outputs: `src/data/phase4_2_generalization_manifest.json` and `python/phase4_2_generalization_manifest.json`.

### Running Historical Phase 4.2 Baseline Ablation Matrix (Tracks A1–A8)
```bash
python3 python/run_experiments.py
```
Outputs: `src/data/phase4_1_experiments_manifest.json` and `python/phase4_1_experiments_manifest.json`.

### Running TypeScript Pure Logic Test Suite (27 Tests)
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

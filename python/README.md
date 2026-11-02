# PREDICT-PS Phase 4, 4.1, 4.2, 4.2.2 & 4.2.3: Research Integrity & Baseline Audit Pipeline

This directory contains the Python experiment, diagnostic, and evaluation pipeline for the **Character n-gram TF-IDF + Logistic Regression Baseline**, the **Phase 4.2 Controlled Ablation Matrix**, the **Phase 4.2.2 Generalization Audit Suite**, and the **Phase 4.2.3 Combined Lexical-Template Generalization, Threshold Robustness & Statistical Reconciliation Audit**.

## Research Objective

Phase 4 establishes an empirical character-level statistical machine learning baseline to predict whether candidate strings exhibit predictable structural patterns (`is_guessable_heuristic = 1`) versus high-entropy uniform randomness (`is_guessable_heuristic = 0`).

Phase 4.2.3 carries out the final scientific integrity gate before Phase 5 feature fusion:
1. **Combined Lexical and Template Isolation (Exp G9)**: Simultaneously isolates dictionary root words ($W_{\text{train}} \cap W_{\text{val}} = \emptyset, W_{\text{train}} \cap W_{\text{test}} = \emptyset, W_{\text{val}} \cap W_{\text{test}} = \emptyset$; 206 train words, 44 val words, 44 test words) AND positive template families (Train: `PrefixPadded` + `SuffixPadded`; Val: `WordSymbolsSuffix`; Test: `PrefixSymbols`), strictly matched to 14 chars (8L/2U/2D/2S).
2. **Independent Generator Sequence Artefacts Audit (Exp G10)**: Investigates character-class transition entropy gaps. Replaces uniform random negative scrambles with pseudo-phonetic syllabic consonant-vowel clusters (`bapomilu`, `zenulabi`), matching length and composition without dictionary stem overlap (0.00% overlap).
3. **Threshold Robustness & Degenerate Decision Regime Analysis**: Comprehensive threshold sensitivity sweeps ($\tau \in [0.05, 0.95]$ in 19 steps) on validation and test partitions. Accurately diagnoses degenerate all-negative regimes ($\text{PPR} = 0.0\%$, Sensitivity = 0.0%, FSR = 100.0%) where nominal 50.0% accuracy on balanced 50/50 test data reflects null decision boundary collapse, **NOT random guessing**.
4. **Automated Manifest Reconciliation Gate**: Verifies bit-for-bit mirroring between `python/phase4_2_3_audit_manifest.json` and `src/data/phase4_2_3_audit_manifest.json`, validates zero raw password candidates, and ensures strict $B=1,000$ empirical resamples at fixed validation threshold ($\tau_{\text{val}}$).

## Privacy & Safety Invariants

1. **Zero Breach Data**: No credential dumps (e.g., RockYou, leaked accounts) are used, downloaded, or permitted.
2. **Synthetic Generation**: Candidate samples are synthetically generated with explicit pattern category grammars and deterministic pseudo-random seeds.
3. **Zero Network Egress**: Training, validation, and diagnostics run 100% locally and offline. No remote APIs or cloud services are called.
4. **Sanitized Artifact Export**: Only statistical aggregates, confusion matrices, evaluation metrics, calibration curves, and model hyperparameters are exported. Raw password candidates are never written to exported manifests or logs.

## Pipeline Architecture

- `requirements.txt`: Documented dependencies (`scikit-learn>=1.3.0,<=1.8.0`, `numpy>=1.24.0,<=2.3.0`, `scipy>=1.11.0,<=1.16.0`).
- `dataset_generator.py`: Generates synthetic candidates across standard, controlled, and audit subsets:
  - Original 5 categories (sequential, dictionary suffix, repeated phrase, keyboard walk, high-entropy uniform).
  - Dual-Controlled matched subset: exact 14 characters, 8 lower, 2 upper, 2 digits, 2 symbols for both classes.
  - Template families: `TEMPLATE_SUFFIX_PADDED`, `TEMPLATE_PREFIX_PADDED`, `TEMPLATE_PREFIX_SYMBOLS`, `TEMPLATE_WORD_SYMBOLS_SUFFIX`, `TEMPLATE_UNIFORM_SCRAMBLE`.
  - Group-aware splitters: `split_dataset_by_lexical_group`, `split_dataset_by_template_family`, and `split_dataset_by_combined_lexical_and_template`.
  - Independent Generator V2 (`generate_independent_v2_matched_dataset`): 50 phonetic 4-letter stems compounded into 8-letter roots with uniform negatives.
  - Independent Generator V2b (`generate_independent_v2b_matched_dataset`): Matched 14-char candidates with pseudo-syllabic consonant-vowel negatives (`bapomilu`).
- `dataset_diagnostics.py`: Evaluates dataset composition, length aggregates, character-class frequencies, duplicate detection, cross-split partition isolation, positional class distributions, transition matrices ($4 \times 4$), and Jensen-Shannon transition divergence.
- `model_pipeline.py`:
  - `NgramBaselineModel`: Character TF-IDF n-grams (2–5) + Logistic Regression. Vectorizer fitted *exclusively* on train partition.
  - `LexicalOnlyBaselineModel`: Extracts dictionary presence and coverage from training words to quantify the word memorization shortcut.
  - `PositionAwareDiagnosticModel`: Extracts 56 positional character-type features to quantify positional slot bias.
  - `analyze_threshold_robustness`: Computes Predicted Positive Rate ($\text{PPR}$), full confusion matrix, classification regime classification (`degenerate_all_negative`, `degenerate_all_positive`, `balanced_classification`, `skewed_classification`), and 19-point threshold sweeps.
  - `compute_calibration_curve`: 10-bin reliability diagram and Expected Calibration Error (ECE).
  - `compute_bootstrap_confidence_intervals`: 95% percentile confidence intervals with 1,000 resamples and fixed threshold propagation.
  - `select_validation_threshold`: Threshold $\tau$ optimized on validation split to minimize False-Strong Rate (FSR) while maintaining precision $\ge 0.85$.
- `run_phase4_2_3_audit.py`: Canonical Phase 4.2.3 runner executing full combined isolation, generator sequence artefact audit, threshold robustness analysis, and dual manifest export.
- `verify_manifest_reconciliation.py`: Automated manifest reconciliation validator enforcing 6 invariant checks.
- `run_generalization_experiments.py`: Phase 4.2.2 runner executing Tracks G1–G8.
- `run_experiments.py`: Historical Phase 4.2 runner executing Tracks A1–A8.
- `tests/test_pipeline.py`: Comprehensive 45-test unit test suite covering baseline, ablations, leakage isolation, combined isolation, syllabic generators, threshold robustness, and zero stem overlap.

## Phase 4.2.3 Combined Isolation & Generalization Audit Matrix (Tracks G1–G10)

| Track | Description | Partition / Conditions | Test Acc | Macro-F1 | FSR | ROC-AUC | Brier |
|---|---|---|---|---|---|---|---|
| **G1** | Random Stratified Baseline | 14-char matched (8L/2U/2D/2S) | 99.67% | 0.9967 | 0.33% | 0.9999 | 0.0480 |
| **G2** | Lexical-Group-Disjoint Split | 207 train / 44 val / 45 test words | 98.40% | 0.9840 | **2.88%** | 0.9994 | 0.0460 |
| **G3** | Template-Family-Disjoint | Train on Prefix/Suffix; test on PrefixSymbols | 99.79% | 0.9979 | 0.42% | 1.0000 | 0.0401 |
| **G4** | Independent Generator V2 | Frozen G1 tested on phonetic compounding & uniform negs | **75.00%** | **0.7344** | **49.20%** | **0.8658** | **0.2285** |
| **G5** | Lexical-Only Diagnostic | Random split (word overlap permitted) | **99.67%** | **0.9967** | 0.33% | **0.9967** | 0.0033 |
| **G6** | Lexical-Only Disjoint | Disjoint lexical split (0 shared words; PPR = 0.0%) | **50.00%** | **0.3333** | 100.00% | **0.5000** | 0.5000 |
| **G7** | Position-Aware Diagnostic | Standard fixed-position templates | **99.50%** | **0.9950** | 0.00% | **1.0000** | 0.0049 |
| **G8** | Position-Aware Held-Out | Held-out template families (PPR = 0.0%) | **50.00%** | **0.3333** | 100.00% | **0.7158** | 0.5000 |
| **G9** | **Combined Lexical + Template** | Disjoint roots (206/44/44) + held-out PrefixSymbols | **98.50%** | **0.9850** | **0.67%** | **0.9991** | **0.0526** |
| **G10**| **Syllabic Negative Generator** | Matched 14-char candidates with consonant-vowel negatives | **58.70%** | **0.5843** | **49.40%** | **0.6357** | **0.2443** |

## Key Findings from Phase 4.2.3

1. **Combined Lexical and Template Invariance (Exp G9)**: Even when dictionary root words AND positive template geometries are simultaneously held out, the character n-gram baseline retains high in-grammar classification performance (98.50% Acc, 0.67% FSR, 0.9991 ROC-AUC at $\tau = 0.39$). This proves that character n-grams successfully generalize across dictionary word stems within the broader affine template structure.
2. **Syllabic Negative Generator Collapse (Exp G10)**: When uniform random noise negatives are replaced with pseudo-phonetic consonant-vowel syllabic clusters (`bapomilu`, `zenulabi`), ROC-AUC collapses from **0.9643 down to 0.6357** and accuracy falls to **58.70%** (FSR 49.40%). This confirms that a major component of the character n-gram model's apparent discriminative power was an artefact of distinguishing pronounceable words from high-entropy uniform character noise, rather than true password policy strength.
3. **Sequence Transition Parity**: Jensen-Shannon divergence between positive and negative character-class transitions drops from **0.1395** (uniform scramble) to **0.0822** (syllabic pseudo-words), reducing the sequence entropy gap by 41% while maintaining **0.00% stem overlap** with the positive root dictionary.
4. **Degenerate Null-Decision Regime Characterization (Exps G6 & G8)**: In both the lexical diagnostic on disjoint words (G6) and the positional diagnostic on novel templates (G8), all test candidate probabilities fall below the validation-selected decision threshold, yielding $\text{PPR} = 0.0\%$, Sensitivity = 0.0%, Specificity = 100.0%, and FSR = 100.0%. On a balanced 50/50 test set, assigning Label 0 to all instances mathematically results in 50.0% accuracy. PREDICT-PS explicitly documents that this represents a degenerate null decision boundary collapse, **NOT random guessing** (which would generate $\text{PPR} \approx 50\%$ with approximately equal true and false positive counts).

## Local Execution Instructions

### 1. Install Dependencies
```bash
pip install -r python/requirements.txt
```

### 2. Run Comprehensive Unit Test Suite (45 Tests)
```bash
python3 -m unittest discover -s python/tests -v
```

### 3. Run Phase 4.2.3 Combined Isolation & Threshold Robustness Audit (Tracks G1–G10)
```bash
python3 python/run_phase4_2_3_audit.py
```
Outputs: `src/data/phase4_2_3_audit_manifest.json` and `python/phase4_2_3_audit_manifest.json`.

### 4. Run Automated Manifest Reconciliation Verifier
```bash
python3 python/verify_manifest_reconciliation.py
```
Verifies all 6 scientific integrity invariant checks.

### 5. Run Historical Generalization Experiments (Tracks G1–G8)
```bash
python3 python/run_generalization_experiments.py
```

### 6. Run Historical Baseline Ablation Matrix (Tracks A1–A8)
```bash
python3 python/run_experiments.py
```

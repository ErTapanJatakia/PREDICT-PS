# PREDICT-PS Phase 4, 4.1, 4.2 & 4.2.2: Research Integrity & Generalization Audit Pipeline

This directory contains the Python experiment, diagnostic, and evaluation pipeline for the **Character n-gram TF-IDF + Logistic Regression Baseline**, the **Phase 4.2 Controlled Ablation Matrix**, and the **Phase 4.2.2 Lexical Leakage, Template Generalization & Independent Generator Audit Suite**.

## Research Objective

Phase 4 establishes an empirical character-level statistical machine learning baseline to predict whether candidate strings exhibit predictable structural patterns (`is_guessable_heuristic = 1`) versus high-entropy uniform randomness (`is_guessable_heuristic = 0`).

Phase 4.2.2 deepens scientific integrity by evaluating whether models exploit subtle lexical memorization or template-positional shortcuts rather than learning generalizable structural predictability:
1. **Lexical Group Isolation (Exp G2)**: Partitions dictionary words disjointly across train, val, and test splits ($W_{\text{train}} \cap W_{\text{val}} = \emptyset$, $W_{\text{train}} \cap W_{\text{test}} = \emptyset$, $W_{\text{val}} \cap W_{\text{test}} = \emptyset$). Zero shared words across partitions (207 train, 44 val, 45 test).
2. **Template Family Generalization (Exp G3)**: Holds out positive-generation template families (train on `PrefixPadded`, `SuffixPadded`; test on `PrefixSymbols`) with matched length (14) and composition (8L/2U/2D/2S).
3. **Independent Generator V2 Transfer (Exp G4)**: Evaluates the frozen baseline on candidates from an independently designed generator featuring phonetic stem compounding (`starfire`, `moonrock`) and non-affix geometries (bracketed, sandwich, interleaved).
4. **Lexical-Only Diagnostic Comparator (Exps G5 & G6)**: Measures dictionary word memorization shortcut on random split (99.67% Acc) vs lexical-disjoint split (collapses to 50.00% Acc, 0.5000 ROC-AUC).
5. **Position-Aware Diagnostic Comparator (Exps G7 & G8)**: Measures positional character-class slot bias without character identity (99.50% Acc on standard templates vs collapses to 50.00% Acc on held-out template families).
6. **Full Bootstrap Accounting**: Propagating fixed validation threshold $\tau$ across 1,000 resamples with full resample tracking.

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
  - Group-aware splitters: `split_dataset_by_lexical_group` (disjoint dictionary words) and `split_dataset_by_template_family` (held-out template families).
  - Independent Generator V2 (`generate_independent_v2_matched_dataset`): 50 phonetic 4-letter stems compounded into 8-letter roots, structured via sandwich, bracketed, and interleaved geometries, strictly matched to 14 chars (8L/2U/2D/2S).
- `dataset_diagnostics.py`: Evaluates dataset composition, length aggregates, character-class frequencies, duplicate detection, and cross-split partition isolation.
- `model_pipeline.py`:
  - `NgramBaselineModel`: Character TF-IDF n-grams (2–5) + Logistic Regression. Vectorizer fitted *exclusively* on train partition.
  - `LexicalOnlyBaselineModel`: Extracts dictionary presence and coverage from training words to quantify the word memorization shortcut.
  - `PositionAwareDiagnosticModel`: Extracts 56 positional character-type features to quantify positional slot bias.
  - `compute_calibration_curve`: 10-bin reliability diagram and Expected Calibration Error (ECE).
  - `compute_bootstrap_confidence_intervals`: 95% percentile confidence intervals with 1,000 resamples and fixed threshold propagation.
  - `select_validation_threshold`: Threshold $\tau$ optimized on validation split to minimize False-Strong Rate (FSR) while maintaining precision $\ge 0.85$.
- `run_generalization_experiments.py`: Unified Phase 4.2.2 runner executing Tracks G1–G8 and exporting canonical manifests.
- `run_experiments.py`: Historical Phase 4.2 runner executing Tracks A1–A8.
- `tests/test_pipeline.py`: Comprehensive 36-test unit test suite covering baseline, ablations, leakage isolation, template holdout, and independent generator matching.

## Phase 4.2.2 Generalization & Leakage Audit Matrix (Tracks G1–G8)

| Track | Description | Partition / Conditions | Test Acc | Macro-F1 | FSR | ROC-AUC | Brier |
|---|---|---|---|---|---|---|---|
| **G1** | Random Stratified Baseline | 14-char matched (8L/2U/2D/2S) | 99.67% | 0.9967 | 0.33% | 0.9999 | 0.0480 |
| **G2** | Lexical-Group-Disjoint Split | 207 train / 44 val / 45 test words | 98.40% | 0.9840 | **2.88%** | 0.9994 | 0.0460 |
| **G3** | Template-Family-Disjoint | Train on Prefix/Suffix; test on PrefixSymbols | 99.79% | 0.9979 | 0.42% | 1.0000 | 0.0401 |
| **G4** | Independent Generator V2 | Frozen G1 tested on phonetic compounding | **75.00%** | **0.7344** | **49.20%** | **0.8658** | **0.2285** |
| **G5** | Lexical-Only Diagnostic | Random split (word overlap permitted) | **99.67%** | **0.9967** | 0.33% | **0.9967** | 0.0033 |
| **G6** | Lexical-Only Disjoint | Disjoint lexical split (0 shared words) | **50.00%** | **0.3333** | 100.00% | **0.5000** | 0.5000 |
| **G7** | Position-Aware Diagnostic | Standard fixed-position templates | **99.50%** | **0.9950** | 0.00% | **1.0000** | 0.0049 |
| **G8** | Position-Aware Held-Out | Held-out template families | **50.00%** | **0.3333** | 100.00% | **0.7158** | 0.5000 |

## Local Execution Instructions

### 1. Install Dependencies
```bash
pip install -r python/requirements.txt
```

### 2. Run Test Suite (36 Tests)
```bash
python3 -m unittest discover -s python/tests -v
```

### 3. Run Phase 4.2.2 Generalization Experiments (Tracks G1–G8)
```bash
python3 python/run_generalization_experiments.py
```
Outputs: `src/data/phase4_2_generalization_manifest.json` and `python/phase4_2_generalization_manifest.json`.

### 4. Run Historical Phase 4.2 Ablation Matrix (Tracks A1–A8)
```bash
python3 python/run_experiments.py
```
Outputs: `src/data/phase4_1_experiments_manifest.json` and `python/phase4_1_experiments_manifest.json`.


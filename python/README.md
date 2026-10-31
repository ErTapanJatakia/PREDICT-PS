# PREDICT-PS Phase 4 & 4.1: Research Integrity & Baseline Validation Pipeline

This directory contains the Python experiment, diagnostic, and evaluation pipeline for the **Character n-gram TF-IDF + Logistic Regression Baseline** and the **Phase 4.1 Research Integrity & Baseline Validation Suite**.

## Research Objective

Phase 4 establishes an empirical character-level statistical machine learning baseline to predict whether candidate strings exhibit predictable structural patterns (`is_guessable_heuristic = 1`) versus high-entropy uniform randomness (`is_guessable_heuristic = 0`).

Phase 4.1 strengthens the scientific rigor, reproducibility, and methodological integrity of Phase 4 by:
1. **Auditing Synthetic Shortcuts**: Evaluating whether models exploit unconstrained dataset artifacts (length disparity, character composition) rather than true structural regularities.
2. **Measuring Out-of-Distribution (OOD) Transfer**: Quantifying generalization failure when evaluated against novel pattern grammars (ISO dates, PIN-padded names, reverse encased phrases, zigzag walks) without retraining.
3. **Partition Isolation**: Ensuring 0 exact and 0 case-normalized duplicate leakage across train, validation, and test splits.
4. **Statistical Reliability**: Computing 95% bootstrap confidence intervals (1,000 resamples), Brier calibration scores, and 10-bin Expected Calibration Error (ECE).

## Privacy & Safety Invariants

1. **Zero Breach Data**: No credential dumps (e.g., RockYou, leaked accounts) are used, downloaded, or permitted.
2. **Synthetic Generation**: Candidate samples are synthetically generated with explicit pattern category grammars and deterministic pseudo-random seeds.
3. **Zero Network Egress**: Training, validation, and diagnostics run 100% locally and offline. No remote APIs or cloud services are called.
4. **Sanitized Artifact Export**: Only statistical aggregates, confusion matrices, evaluation metrics, calibration curves, and model hyperparameters are exported. Raw password candidates are never written to exported manifests or logs.

## Pipeline Architecture

- `requirements.txt`: Documented dependencies (`scikit-learn>=1.3.0,<=1.8.0`, `numpy>=1.24.0,<=2.3.0`, `scipy>=1.11.0,<=1.16.0`).
- `dataset_generator.py`: Generates synthetic candidates across standard and controlled subsets:
  - Original 5 categories (sequential, dictionary suffix, repeated phrase, keyboard walk, high-entropy uniform).
  - Length-Controlled subset: matched range [12, 16] characters ($\Delta = 0.0$ chars).
  - Charset-Controlled subset: all 4 character classes required for both positive and negative classes.
  - Independent Holdout generator: seed 9999 with novel pattern families (ISO dates, PIN-padded names, reverse encasing, zigzag walks).
- `dataset_diagnostics.py`: Evaluates dataset composition, length aggregates, character-class frequencies, duplicate detection, and cross-split partition isolation.
- `model_pipeline.py`:
  - `NgramBaselineModel`: Character TF-IDF n-grams (2–5) + Logistic Regression. Vectorizer is fitted *exclusively* on the training partition.
  - `LengthOnlyBaselineModel`: Single-feature logistic model predicting purely from candidate string length.
  - `CompositionOnlyBaselineModel`: 6-feature logistic model predicting from coarse character-set counts.
  - `compute_calibration_curve`: 10-bin reliability diagram and Expected Calibration Error (ECE).
  - `compute_bootstrap_confidence_intervals`: 95% percentile confidence intervals with 1,000 resamples.
  - `select_validation_threshold`: Threshold $\tau$ optimized on validation split to minimize False-Strong Rate (FSR) while maintaining precision $\ge 0.85$.
- `run_experiments.py`: Unified experiment runner executing all 6 experiments, computing diagnostics, and exporting the canonical Phase 4.1 manifest (`src/data/phase4_1_experiments_manifest.json`).
- `export_artifact.py`: Legacy Phase 4 single-baseline exporter for backward compatibility.
- `tests/test_pipeline.py`: Comprehensive 23-test unit test suite covering all research integrity dimensions.

## Controlled Empirical Ablation Matrix (6 Experiments)

| Experiment | Description | Evaluation Split | Key Metric / Implication |
|---|---|---|---|
| **Exp 1: Original Baseline** | n-gram 2–5 TF-IDF + LogisticRegression | In-Distribution Test | Test Accuracy 100%, Macro-F1 1.0000, FSR 0.00%, Brier 0.0402 ($\tau = 0.35$). |
| **Exp 2: Length-Controlled** | Length held to [12, 16] chars ($\Delta = 0.0$) | Length-Controlled Test | Test Accuracy 100%, Macro-F1 0.9983. Confirms model learns subwords even without length cue. |
| **Exp 3: Charset-Controlled** | All 4 character classes required | Charset-Controlled Test | Test Accuracy 98.67%, Macro-F1 0.9867. Confirms resilience under forced complexity. |
| **Exp 4: Independent Holdout** | Transfer to novel grammars (seed 9999) | OOD Holdout Test | **FSR surges to 71.20%**, **Recall collapses to 28.80%**, Macro-F1 0.5891. Proves n-grams fail on unseen structural grammars; validates need for Phase 5 feature fusion. |
| **Exp 5: Length-Only Diagnostic** | Logistic Regression on string length only | In-Distribution Test | **94.00% Accuracy, 0.9896 ROC-AUC** with length alone ($\Delta = 6.6$ chars in unconstrained data). Confirms length shortcut. |
| **Exp 6: Composition Diagnostic** | Logistic Regression on 6 character counts | In-Distribution Test | **99.50% Accuracy, 1.0000 ROC-AUC** with character counts alone. Confirms character composition shortcut. |

## Local Execution Instructions

### 1. Install Dependencies
```bash
pip install -r python/requirements.txt
```

### 2. Run Test Suite (23 Tests)
```bash
python3 -m unittest discover -s python/tests -v
```

### 3. Run All 6 Experiments & Generate Manifest
```bash
python3 python/run_experiments.py
```
This updates both `src/data/phase4_1_experiments_manifest.json` and `src/data/phase4_baseline_metrics.json`.

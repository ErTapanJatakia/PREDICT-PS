# PREDICT-PS Phase 4, 4.1, 4.2, 4.2.2, 4.2.3 & 4.2.4: Research Integrity & Baseline Audit Pipeline

This directory contains the Python experiment, diagnostic, and evaluation pipeline for the **Character n-gram TF-IDF + Logistic Regression Baseline**, the **Phase 4.2 Controlled Ablation Matrix**, the **Phase 4.2.2 Generalization Audit Suite**, the **Phase 4.2.3 Combined Lexical-Template Audit**, and the **Phase 4.2.4 Factorial Matched-Control, Cluster-Aware Statistical Validation & Reproducibility Gate**.

## Research Objective

Phase 4 establishes an empirical character-level statistical machine learning baseline to predict whether candidate strings exhibit predictable structural patterns (`is_guessable_heuristic = 1`) versus high-entropy uniform randomness (`is_guessable_heuristic = 0`).

Phase 4.2.4 performs the final scientific integrity gate before Phase 5 feature fusion:
1. **Factorial Matched-Control Redesign (Exp G11)**: Completely decouples lexical status from template geometry. Positive candidates (dictionary roots) and negative candidates (pseudo-words) use identical template slots (`PrefixPadded`, `SuffixPadded`, `WordSymbolsSuffix`, `PrefixSymbols`), achieving 100% composition matching (8L/2U/2D/2S), 0.00% stem overlap, and **0.0000 positional divergence**. The Position-Only diagnostic model collapses to **50.00% accuracy and 0.5000 ROC-AUC** (random guessing), mathematically proving zero positional shortcut. Meanwhile, the character n-gram baseline retains **94.33% accuracy and 0.9880 ROC-AUC**, demonstrating genuine lexical transition discrimination.
2. **Cluster-Aware Grouped Bootstrap ($B=1,000$)**: Replaces naive candidate-level resampling with grouped bootstrap over root-word clusters (`cluster_id`), yielding wider, scientifically honest 95% CIs ($[90.5\%, 97.4\%]$ vs $[92.5\%, 96.2\%]$) to eliminate pseudo-replication bias.
3. **Residual Sequence-Artefact & Shannon Entropy Audit (Exp G12)**: 4-way comparison across dictionary roots (trigram entropy 11.25 bits), phonetic roots (10.78 bits), syllabic negatives (11.82 bits), and scrambled negatives (12.51 bits), establishing the linguistic entropy gradient underlying n-gram separation without structural shortcuts.
4. **Combined Lexical and Template Isolation (Exp G9)**: Simultaneously isolates dictionary root words and positive template families under matched 14-char conditions.
5. **Automated Manifest Reconciliation Gate**: 10-check automated verification tool (`python/verify_manifest_reconciliation.py`) enforcing schema validation (`predict_ps_phase4_2_4_v1`), zero raw password candidates, cluster-aware CIs, and bit-for-bit manifest synchronization.

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
  - Factorial matched-control generator (`generate_factorial_matched_control_dataset`): Paired template cycle ensuring identical template distributions ($P(\text{tmpl} \mid Y=1) = P(\text{tmpl} \mid Y=0)$) and 0.0000 positional divergence.
  - Multi-generator sequence entropy generator (`generate_g12_multi_generator_audit_dataset`).
- `dataset_diagnostics.py`: Evaluates dataset composition, length aggregates, character-class frequencies, duplicate detection, cross-split partition isolation, positional class distributions, transition matrices ($4 \times 4$), Jensen-Shannon transition divergence, factorial matched control audit, and Shannon unigram/bigram/trigram entropy.
- `model_pipeline.py`:
  - `NgramBaselineModel`: Character TF-IDF n-grams (2–5) + Logistic Regression. Vectorizer fitted *exclusively* on train partition.
  - `PositionOnlyDiagnosticModel`: Extracts positional character-type features to verify collapse under matched geometry.
  - `NgramWithoutLexicalDiagnosticModel`: Evaluates structural skeleton n-grams without lexical semantics.
  - `CombinedDiagnosticModel`: Fuses n-gram and positional features for control comparisons.
  - `compute_cluster_aware_bootstrap_confidence_intervals`: Grouped empirical percentile bootstrap over cluster IDs.
  - `analyze_threshold_robustness`: Computes Predicted Positive Rate ($\text{PPR}$), full confusion matrix, classification regime classification (`degenerate_all_negative`, `degenerate_all_positive`, `balanced_classification`, `skewed_classification`), and 19-point threshold sweeps.
  - `select_validation_threshold`: Threshold $\tau$ optimized on validation split to minimize False-Strong Rate (FSR) while maintaining precision $\ge 0.85$.
- `run_phase4_2_4_audit.py`: Canonical Phase 4.2.4 runner executing factorial matched control, sequence entropy audit, cluster-aware validation, and dual manifest export.
- `verify_manifest_reconciliation.py`: Automated manifest reconciliation validator enforcing 10 invariant checks.
- `tests/test_pipeline.py`: Comprehensive 55-test unit test suite covering baseline, ablations, leakage isolation, combined isolation, factorial matching parity, positional collapse, cluster-aware CIs, and zero password export.

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
| **G11**| **Factorial Matched-Control** | Decoupled template geometry (0.0000 positional divergence) | **94.33%** | **0.9433** | **2.33%** | **0.9880** | **0.0839** |
| **G12**| **Residual Sequence Entropy** | Multi-generator entropy gradient (dictionary/phonetic/syllabic/scrambled) | **94.30%** | **0.9429** | **0.60%** | **0.9938** | **0.0751** |

## Key Findings from Phase 4.2.4

1. **Factorial Matched Control Neutralizes Positional Shortcuts (Exp G11)**:
   Under paired template geometry, $P(\text{class at pos } i \mid Y=1) = P(\text{class at pos } i \mid Y=0)$ across all 14 positions (positional divergence = 0.0000). The Position-Only diagnostic model collapses to **50.00% accuracy and 0.5000 ROC-AUC** (random guessing), mathematically proving that positional template shortcuts are completely neutralized. Meanwhile, the n-gram baseline retains **94.33% accuracy and 0.9880 ROC-AUC**, demonstrating that genuine discrimination survives based on lexical transition probabilities alone.
2. **Cluster-Aware Grouped Bootstrap ($B=1,000$) Validates True Uncertainty**:
   Candidate-level percentile bootstrap for G11 yields 95% CI of $[92.5\%, 96.2\%]$ (width: 0.0367), whereas grouped resampling over root-word clusters (`cluster_id`) yields $[90.5\%, 97.4\%]$ (width: 0.0693, **+86% wider**). This rigorously prevents pseudo-replication and accounts for intra-cluster correlation across candidates generated from the same dictionary roots.
3. **Residual Sequence Entropy Gradient (Exp G12)**:
   Natural English dictionary roots exhibit lower trigram Shannon entropy (**11.25 bits**) than syllabic negatives (**11.82 bits**) and uniformly scrambled characters (**12.51 bits**). This entropy gradient explains the physical linguistic foundation of n-gram separability without relying on structural or template shortcuts.
4. **Combined Lexical and Template Invariance (Exp G9)**: Even when dictionary root words AND positive template geometries are simultaneously held out, the character n-gram baseline retains high in-grammar classification performance (98.50% Acc, 0.67% FSR, 0.9991 ROC-AUC at $\tau = 0.39$).

## Local Execution Instructions

### 1. Install Dependencies
```bash
pip install -r python/requirements.txt
```

### 2. Run Comprehensive Unit Test Suite (55 Tests)
```bash
python3 -m unittest discover -s python/tests -v
```

### 3. Run Phase 4.2.4 Factorial Matched-Control & Cluster-Aware Audit
```bash
python3 python/run_phase4_2_4_audit.py
```
Outputs: `src/data/phase4_2_4_audit_manifest.json` and `python/phase4_2_4_audit_manifest.json`.

### 4. Run Automated Manifest Reconciliation Verifier (10 Checks)
```bash
python3 python/verify_manifest_reconciliation.py
```
Verifies all 10 scientific integrity invariant checks.

### 5. Run Historical Generalization Experiments (Tracks G1–G8)
```bash
python3 python/run_generalization_experiments.py
```

### 6. Run Historical Baseline Ablation Matrix (Tracks A1–A8)
```bash
python3 python/run_experiments.py
```

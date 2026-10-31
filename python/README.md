# PREDICT-PS Phase 4: Character n-gram ML Baseline Pipeline

This directory contains the Python training and evaluation pipeline for the **Character n-gram TF-IDF + Logistic Regression Baseline** (Phase 4).

## Research Objective

Phase 4 establishes an empirical character-level statistical machine learning baseline to predict whether candidate strings exhibit predictable structural patterns (`is_guessable_heuristic = 1`) versus high-entropy uniform randomness (`is_guessable_heuristic = 0`).

This model serves as the **comparator** for future **Phase 5 Feature-Fusion experiments** (fusing explainable pattern features with character n-grams).

## Privacy & Safety Invariants

1. **Zero Breach Data**: No credential dumps (e.g. RockYou, LinkedIn dumps) are used, downloaded, or permitted.
2. **Synthetic Generation**: Candidate samples are synthetically generated with explicit pattern category grammars and reproducible pseudo-random seeds.
3. **Zero Egress**: Training and evaluation run entirely offline. No external APIs, Gemini calls, or cloud services are invoked.
4. **Sanitized Artifact Export**: Only statistical aggregates, confusion matrices, evaluation metrics, and model hyperparameters are exported. Raw password candidates are never written to exported artifacts or logs.

## Pipeline Architecture

- `dataset_generator.py`: Generates synthetic candidates across 5 explicit categories (dictionary affix, sequential, keyboard walk, repeat token, high-entropy uniform). Performs exact and case-normalized deduplication and stratified train/val/test splitting (70% / 15% / 15%).
- `dataset_manifest.json`: Documents dataset schema, provenance, class balance, and methodology limitations.
- `model_pipeline.py`: Configurable `NgramBaselineModel` using scikit-learn's `TfidfVectorizer(analyzer='char', ngram_range=(2, 5))` and `LogisticRegression(solver='lbfgs')`. Calculates Accuracy, Precision, Recall, Macro-F1, ROC-AUC, PR-AUC, Brier Score, False-Strong Rate (FSR), and inference latency.
- `export_artifact.py`: Executes end-to-end training and exports the sanitized artifact to `src/data/phase4_baseline_metrics.json`.
- `tests/test_pipeline.py`: Comprehensive test suite verifying split isolation, zero duplicate leakage across partitions, feature-target independence, and deterministic metric reproduction.

## Local Execution Instructions

### Prerequisites
- Python 3.9+
- Dependencies: `scikit-learn`, `numpy`, `pandas` (optional for tabular exploration)

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install free open-source dependencies
pip install scikit-learn numpy

# Run test suite
python3 -m unittest discover -s python/tests

# Run training and export sanitized artifact
python3 python/export_artifact.py
```

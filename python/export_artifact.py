#!/usr/bin/env python3
"""
PREDICT-PS Phase 4: Baseline Experiment Execution & Sanitized Artifact Export
Runs the full end-to-end character n-gram baseline pipeline and exports sanitized JSON
metrics into src/data/phase4_baseline_metrics.json for the web application.
Zero password material or candidate strings are written to the exported artifact.
"""

import json
import os
import sys
import platform
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(__file__))

from dataset_generator import generate_synthetic_dataset, split_dataset
from model_pipeline import NgramBaselineModel, evaluate_predictions


def run_and_export(output_path: str = "src/data/phase4_baseline_metrics.json"):
    print("[PREDICT-PS Phase 4] Generating synthetic dataset (seed=42, n=4000)...")
    candidates, labels, pattern_types = generate_synthetic_dataset(n_samples=4000, seed=42, positive_ratio=0.5)

    print("[PREDICT-PS Phase 4] Partitioning into isolated splits (70/15/15)...")
    splits = split_dataset(candidates, labels, pattern_types, train_ratio=0.70, val_ratio=0.15, seed=42)

    train_cands = splits["train"]["candidates"]
    train_lbls = splits["train"]["labels"]
    val_cands = splits["val"]["candidates"]
    val_lbls = splits["val"]["labels"]
    test_cands = splits["test"]["candidates"]
    test_lbls = splits["test"]["labels"]

    print(f"  Train: {len(train_cands)} ({sum(train_lbls)} positive, {len(train_lbls) - sum(train_lbls)} negative)")
    print(f"  Val:   {len(val_cands)} ({sum(val_lbls)} positive, {len(val_lbls) - sum(val_lbls)} negative)")
    print(f"  Test:  {len(test_cands)} ({sum(test_lbls)} positive, {len(test_lbls) - sum(test_lbls)} negative)")

    print("[PREDICT-PS Phase 4] Fitting character n-gram (2-5) TF-IDF + LogisticRegression baseline on train split...")
    model = NgramBaselineModel(ngram_range=(2, 5), min_df=2, sublinear_tf=True, C=1.0, max_iter=1000, random_state=42)
    train_duration_ms = model.fit(train_cands, train_lbls)
    print(f"  Training completed in {train_duration_ms:.2f} ms. Learned vocabulary size: {model.vocab_size} n-grams.")

    print("[PREDICT-PS Phase 4] Evaluating on val split...")
    val_probas = model.predict_proba(val_cands)
    val_preds = (val_probas >= 0.5).astype(int)
    val_metrics = evaluate_predictions(val_lbls, val_preds, val_probas)

    print("[PREDICT-PS Phase 4] Evaluating on unseen test split...")
    test_probas = model.predict_proba(test_cands)
    test_preds = (test_probas >= 0.5).astype(int)
    test_metrics = evaluate_predictions(test_lbls, test_preds, test_probas)

    print("[PREDICT-PS Phase 4] Benchmarking inference latency (microseconds/sample)...")
    latency_us = model.benchmark_inference_latency(test_cands, repetitions=5)
    print(f"  Mean latency: {latency_us:.2f} µs per candidate.")

    import sklearn
    import numpy as np

    artifact = {
        "schema_version": "predict_ps_phase4_v1",
        "pipeline_status": "synthetic_pipeline_validation",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "model_architecture": {
            "name": "Character n-gram TF-IDF + Logistic Regression",
            "type": "statistical-ml",
            "feature_extractor": "char_tfidf",
            "ngram_range": [2, 5],
            "min_df": 2,
            "sublinear_tf": True,
            "classifier": "LogisticRegression",
            "solver": "lbfgs",
            "C": 1.0,
            "max_iter": 1000,
            "random_state": 42,
            "vocabulary_size": model.vocab_size
        },
        "dataset_provenance": {
            "source": "In-process synthetic pattern generator (PRNG seed 42)",
            "data_policy": "Zero leaked breach corpora, zero external downloads, zero credential dumps",
            "total_samples": len(candidates),
            "splits": {
                "train_count": len(train_cands),
                "train_pos": sum(train_lbls),
                "train_neg": len(train_lbls) - sum(train_lbls),
                "val_count": len(val_cands),
                "val_pos": sum(val_lbls),
                "val_neg": len(val_lbls) - sum(val_lbls),
                "test_count": len(test_cands),
                "test_pos": sum(test_lbls),
                "test_neg": len(test_lbls) - sum(test_lbls)
            },
            "positive_label_definition": "1 = Predictable structural template (dictionary affix, sequential run, keyboard walk, repeat token)",
            "negative_label_definition": "0 = High-entropy uniform random string across 4 disjoint character sets",
            "leakage_safeguards": [
                "Strict exact and lowercase deduplication before split allocation",
                "Disjoint partition sets verified: train ∩ val = Ø, train ∩ test = Ø, val ∩ test = Ø",
                "TF-IDF vectorizer fitted exclusively on train partition"
            ]
        },
        "evaluation_metrics": {
            "threshold": 0.5,
            "test_split": test_metrics,
            "val_split": val_metrics
        },
        "computational_profile": {
            "train_duration_ms": round(train_duration_ms, 2),
            "inference_latency_microseconds": round(latency_us, 2),
            "hardware_platform": platform.platform(),
            "python_version": sys.version.split()[0],
            "dependencies": {
                "scikit_learn": sklearn.__version__,
                "numpy": np.__version__
            }
        },
        "limitations_and_caveats": [
            "Evaluated strictly on synthetic distribution designed to validate pipeline mechanics and comparative sensitivity.",
            "Synthetic patterns do not represent real-world human password choice complexity or targeted breach distributions.",
            "This model is a baseline comparator for Phase 5 feature-fusion experiments, not a standalone production strength estimator."
        ]
    }

    # Ensure parent directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(artifact, f, indent=2)

    # Also save in python directory
    with open("python/phase4_baseline_metrics.json", "w", encoding="utf-8") as f:
        json.dump(artifact, f, indent=2)

    print(f"\n[PREDICT-PS Phase 4] Successfully exported sanitized artifact to {output_path}")
    print(f"  Test Accuracy:     {test_metrics['accuracy'] * 100:.2f}%")
    print(f"  Test Precision:    {test_metrics['precision'] * 100:.2f}%")
    print(f"  Test Recall:       {test_metrics['recall'] * 100:.2f}%")
    print(f"  Test Macro-F1:     {test_metrics['macro_f1']:.4f}")
    print(f"  Test ROC-AUC:      {test_metrics['roc_auc']:.4f}")
    print(f"  Test PR-AUC:       {test_metrics['pr_auc']:.4f}")
    print(f"  False-Strong Rate: {test_metrics['false_strong_rate'] * 100:.2f}%")
    print(f"  Brier Score:       {test_metrics['brier_score']:.4f}")


if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "src/data/phase4_baseline_metrics.json"
    run_and_export(out_file)

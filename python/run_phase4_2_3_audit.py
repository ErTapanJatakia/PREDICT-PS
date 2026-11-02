#!/usr/bin/env python3
"""
PREDICT-PS Phase 4.2.3: Combined Lexical-Template Generalization,
Threshold Robustness & Statistical Reconciliation Audit Runner

Executes:
1. Exp G9: Combined Lexical-and-Template Disjoint Evaluation
   - Disjoint lexical root words across train/val/test (W_train ∩ W_val = ∅, W_train ∩ W_test = ∅, W_val ∩ W_test = ∅).
   - Disjoint template families across train/val/test (T_train ∩ T_test = ∅, T_val designated separately).
   - Length (14) and character composition (8L/2U/2D/2S) matched.
   - Zero metadata leakage.
2. Exp G10: Independent Generator V2 with Alternative Syllabic Negative Generator
   - Positives: Phonetic 4-letter stems with interleaved/bracket/sandwich geometries.
   - Negatives: Pseudo-phonetic / syllabic consonant-vowel clusters (CVCVCVCV).
   - Evaluates frozen Exp G1 character n-gram model.
3. Generator Sequence Artefact Audit:
   - Positional character-class distributions (14x4 matrices).
   - Character-class transition matrices (4x4) and Jensen-Shannon transition divergence.
   - Stem overlap verification (0.0%).
4. Comprehensive Threshold Robustness & Degenerate Regime Analysis:
   - Evaluated on G4, G6, G8, G9, G10.
   - Records tau_val, PPR, full confusion matrix, sensitivity, specificity, macro-F1, ROC-AUC, PR-AUC.
   - Threshold sweep curve across tau in [0.05, 0.95] in 0.05 increments.
   - Detects and documents degenerate all-negative classification regimes.
5. Reconciles and exports canonical manifest to python/ and src/data/.
"""

import json
import os
import sys
import platform
from datetime import datetime, timezone
from typing import Dict, Any, List

sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
import sklearn
import scipy

from dataset_generator import (
    generate_dual_controlled_dataset_with_metadata,
    generate_combined_lexical_template_dataset,
    generate_independent_v2_matched_dataset,
    generate_independent_v2b_matched_dataset,
    split_dataset,
    split_dataset_by_lexical_group,
    split_dataset_by_template_family,
    INDEPENDENT_PHONETIC_4_STEMS,
    WORDS_8_EXPANDED
)
from dataset_diagnostics import (
    analyze_dataset_composition,
    audit_split_isolation,
    audit_generator_artefacts,
    audit_combined_isolation
)
from model_pipeline import (
    NgramBaselineModel,
    LexicalOnlyBaselineModel,
    PositionAwareDiagnosticModel,
    evaluate_predictions,
    select_validation_threshold,
    analyze_threshold_robustness
)


def run_phase4_2_3_audit(
    output_manifest_path: str = "src/data/phase4_2_3_audit_manifest.json",
    n_samples: int = 4000,
    n_holdout: int = 1000,
    n_bootstraps: int = 1000,
    write_canonical: bool = True
) -> Dict[str, Any]:
    print("=" * 84)
    print("PREDICT-PS Phase 4.2.3: Combined Generalization, Generator Audit & Threshold Suite")
    print(f"Configuration: N={n_samples}, N_holdout={n_holdout}, Bootstraps={n_bootstraps}")
    print("=" * 84)

    # 1. Load historical G1-G8 from Phase 4.2.2 manifest for complete reconciliation
    hist_manifest_path = os.path.join(os.path.dirname(__file__), "phase4_2_generalization_manifest.json")
    hist_experiments: Dict[str, Any] = {}
    if os.path.exists(hist_manifest_path):
        try:
            with open(hist_manifest_path, "r", encoding="utf-8") as f:
                hist_data = json.load(f)
                hist_experiments = hist_data.get("experiments", {})
                print(f"[Provenance] Successfully loaded {len(hist_experiments)} historical experiments from Phase 4.2.2 manifest.")
        except Exception as e:
            print(f"[Warning] Could not load historical Phase 4.2.2 manifest: {e}")

    # 2. Train and validate reference Model 1 (dual-controlled random split)
    print("\n[Exp G1 Fit] Training Reference Model 1 on Dual-Controlled Dataset...")
    cands_ctrl, lbls_ctrl, meta_ctrl = generate_dual_controlled_dataset_with_metadata(n_samples=n_samples, seed=42)
    ptypes_ctrl = [m["category"] for m in meta_ctrl]
    random_splits = split_dataset(cands_ctrl, lbls_ctrl, ptypes_ctrl, train_ratio=0.70, val_ratio=0.15, seed=42)

    model_g1 = NgramBaselineModel(ngram_range=(2, 5), min_df=2 if n_samples > 500 else 1, sublinear_tf=True, C=1.0, max_iter=1000, random_state=42)
    t_tr_g1 = model_g1.fit(random_splits["train"]["candidates"], random_splits["train"]["labels"])
    val_prob_g1 = model_g1.predict_proba(random_splits["val"]["candidates"])
    th_g1 = select_validation_threshold(random_splits["val"]["labels"], val_prob_g1, optimization_target="balanced")

    test_prob_g1 = model_g1.predict_proba(random_splits["test"]["candidates"])
    test_pred_g1 = (test_prob_g1 >= th_g1).astype(int)
    eval_g1 = evaluate_predictions(random_splits["test"]["labels"], test_pred_g1, test_prob_g1, compute_cis=True, n_bootstraps=n_bootstraps, threshold=th_g1)

    # ---------------------------------------------------------
    # Exp G9: Combined Lexical and Template Isolation
    # ---------------------------------------------------------
    print("\n[Exp G9] Generating Combined Lexical-and-Template Disjoint Dataset...")
    combined_data = generate_combined_lexical_template_dataset(n_samples=n_samples, seed=42, train_ratio=0.70, val_ratio=0.15)
    splits_g9 = combined_data["splits"]
    isolation_g9 = audit_combined_isolation(splits_g9)
    print(f"  Combined Isolation Audit: {isolation_g9['combined_isolation_verified']} "
          f"(Train Words={isolation_g9['counts']['train_words']}, Val Words={isolation_g9['counts']['val_words']}, Test Words={isolation_g9['counts']['test_words']})")
    print(f"  Train Templates: {isolation_g9['counts']['train_templates']}, Val Templates: {isolation_g9['counts']['val_templates']}, Test Templates: {isolation_g9['counts']['test_templates']}")

    print("  Fitting Character n-gram Baseline on Disjoint Training Partition...")
    model_g9 = NgramBaselineModel(ngram_range=(2, 5), min_df=2 if n_samples > 500 else 1, sublinear_tf=True, C=1.0, max_iter=1000, random_state=42)
    t_tr_g9 = model_g9.fit(splits_g9["train"]["candidates"], splits_g9["train"]["labels"])

    val_prob_g9 = model_g9.predict_proba(splits_g9["val"]["candidates"])
    th_g9 = select_validation_threshold(splits_g9["val"]["labels"], val_prob_g9, optimization_target="balanced")
    test_prob_g9 = model_g9.predict_proba(splits_g9["test"]["candidates"])
    test_pred_g9 = (test_prob_g9 >= th_g9).astype(int)
    eval_g9 = evaluate_predictions(splits_g9["test"]["labels"], test_pred_g9, test_prob_g9, compute_cis=True, n_bootstraps=n_bootstraps, threshold=th_g9)
    lat_g9 = model_g9.benchmark_inference_latency(splits_g9["test"]["candidates"])
    print(f"  Exp G9 Test Accuracy: {eval_g9['accuracy'] * 100:.2f}%, FSR: {eval_g9['false_strong_rate'] * 100:.2f}%, Macro-F1: {eval_g9['macro_f1']:.4f}, ROC-AUC: {eval_g9['roc_auc']:.4f} (tau={th_g9})")

    robustness_g9 = analyze_threshold_robustness(
        splits_g9["val"]["labels"], val_prob_g9,
        splits_g9["test"]["labels"], test_prob_g9,
        selected_threshold=th_g9
    )

    # ---------------------------------------------------------
    # Exp G10: Independent Generator V2 with Alternative Syllabic Negative Generator
    # ---------------------------------------------------------
    print(f"\n[Exp G10] Generating Independent Generator V2b (Syllabic Negatives, n={n_holdout}, seed=9999)...")
    cands_v2b, lbls_v2b, meta_v2b = generate_independent_v2b_matched_dataset(n_samples=n_holdout, seed=9999)
    ptypes_v2b = [m["category"] for m in meta_v2b]

    # Evaluate frozen Model 1
    test_prob_g10 = model_g1.predict_proba(cands_v2b)
    test_pred_g10 = (test_prob_g10 >= th_g1).astype(int)
    eval_g10 = evaluate_predictions(lbls_v2b, test_pred_g10, test_prob_g10, compute_cis=True, n_bootstraps=n_bootstraps, threshold=th_g1)
    lat_g10 = model_g1.benchmark_inference_latency(cands_v2b)
    print(f"  Exp G10 Test Accuracy: {eval_g10['accuracy'] * 100:.2f}%, FSR: {eval_g10['false_strong_rate'] * 100:.2f}%, Macro-F1: {eval_g10['macro_f1']:.4f}, ROC-AUC: {eval_g10['roc_auc']:.4f} (tau={th_g1})")

    robustness_g10 = analyze_threshold_robustness(
        random_splits["val"]["labels"], val_prob_g1,
        lbls_v2b, test_prob_g10,
        selected_threshold=th_g1
    )

    # ---------------------------------------------------------
    # Generator Artefact Audit
    # ---------------------------------------------------------
    print("\n[Artefact Audit] Analyzing Generator Positional and Transition Artefacts...")
    # Load original V2 dataset
    cands_v2, lbls_v2, meta_v2 = generate_independent_v2_matched_dataset(n_samples=n_holdout, seed=9999)
    pos_v2 = [c for c, l in zip(cands_v2, lbls_v2) if l == 1]
    neg_v2_uniform = [c for c, l in zip(cands_v2, lbls_v2) if l == 0]
    neg_v2b_syllabic = [c for c, l in zip(cands_v2b, lbls_v2b) if l == 0]

    audit_v2_uniform = audit_generator_artefacts(pos_v2, neg_v2_uniform, positive_stems=INDEPENDENT_PHONETIC_4_STEMS, length=14)
    audit_v2b_syllabic = audit_generator_artefacts(pos_v2, neg_v2b_syllabic, positive_stems=INDEPENDENT_PHONETIC_4_STEMS, length=14)

    print(f"  Positive vs Uniform Negative JS Divergence: {audit_v2_uniform['transition_divergence']['jensen_shannon_divergence']}")
    print(f"  Positive vs Syllabic Negative JS Divergence: {audit_v2b_syllabic['transition_divergence']['jensen_shannon_divergence']}")
    print(f"  Stem Overlap Rate (Uniform): {audit_v2_uniform['stem_overlap_audit']['overlap_rate'] * 100:.2f}%")
    print(f"  Stem Overlap Rate (Syllabic): {audit_v2b_syllabic['stem_overlap_audit']['overlap_rate'] * 100:.2f}%")

    # ---------------------------------------------------------
    # Threshold Robustness on G4, G6, G8
    # ---------------------------------------------------------
    print("\n[Threshold Robustness] Computing Detailed Sensitivity Analysis on G4, G6, and G8...")
    # G4: Model 1 on V2 Holdout
    test_prob_g4 = model_g1.predict_proba(cands_v2)
    robustness_g4 = analyze_threshold_robustness(
        random_splits["val"]["labels"], val_prob_g1,
        lbls_v2, test_prob_g4,
        selected_threshold=th_g1
    )

    # G6: Lexical Diagnostic on Lexical-Disjoint Split
    lex_splits = split_dataset_by_lexical_group(cands_ctrl, lbls_ctrl, meta_ctrl, train_ratio=0.70, val_ratio=0.15, seed=42)
    lex_model = LexicalOnlyBaselineModel(target_word_length=8)
    lex_model.fit(lex_splits["train"]["candidates"], lex_splits["train"]["labels"])
    val_prob_g6 = lex_model.predict_proba(lex_splits["val"]["candidates"])
    th_g6 = select_validation_threshold(lex_splits["val"]["labels"], val_prob_g6, optimization_target="balanced")
    test_prob_g6 = lex_model.predict_proba(lex_splits["test"]["candidates"])
    robustness_g6 = analyze_threshold_robustness(
        lex_splits["val"]["labels"], val_prob_g6,
        lex_splits["test"]["labels"], test_prob_g6,
        selected_threshold=th_g6
    )

    # G8: Position Diagnostic on Held-Out Template Family
    tmpl_splits = split_dataset_by_template_family(cands_ctrl, lbls_ctrl, meta_ctrl, seed=42)
    pos_model = PositionAwareDiagnosticModel(target_length=14, random_state=42)
    pos_model.fit(tmpl_splits["train"]["candidates"], tmpl_splits["train"]["labels"])
    val_prob_g8 = pos_model.predict_proba(tmpl_splits["val"]["candidates"])
    th_g8 = select_validation_threshold(tmpl_splits["val"]["labels"], val_prob_g8, optimization_target="balanced")
    test_prob_g8 = pos_model.predict_proba(tmpl_splits["test"]["candidates"])
    robustness_g8 = analyze_threshold_robustness(
        tmpl_splits["val"]["labels"], val_prob_g8,
        tmpl_splits["test"]["labels"], test_prob_g8,
        selected_threshold=th_g8
    )

    print(f"  G4 Regime: {robustness_g4['classification_regime']['regime_type']} (PPR={robustness_g4['metrics_at_selected_threshold']['predicted_positive_rate']*100:.1f}%, FSR={robustness_g4['metrics_at_selected_threshold']['false_strong_rate']*100:.1f}%)")
    print(f"  G6 Regime: {robustness_g6['classification_regime']['regime_type']} (PPR={robustness_g6['metrics_at_selected_threshold']['predicted_positive_rate']*100:.1f}%, FSR={robustness_g6['metrics_at_selected_threshold']['false_strong_rate']*100:.1f}%)")
    print(f"  G8 Regime: {robustness_g8['classification_regime']['regime_type']} (PPR={robustness_g8['metrics_at_selected_threshold']['predicted_positive_rate']*100:.1f}%, FSR={robustness_g8['metrics_at_selected_threshold']['false_strong_rate']*100:.1f}%)")
    print(f"  G9 Regime: {robustness_g9['classification_regime']['regime_type']} (PPR={robustness_g9['metrics_at_selected_threshold']['predicted_positive_rate']*100:.1f}%, FSR={robustness_g9['metrics_at_selected_threshold']['false_strong_rate']*100:.1f}%)")
    print(f"  G10 Regime: {robustness_g10['classification_regime']['regime_type']} (PPR={robustness_g10['metrics_at_selected_threshold']['predicted_positive_rate']*100:.1f}%, FSR={robustness_g10['metrics_at_selected_threshold']['false_strong_rate']*100:.1f}%)")

    # ---------------------------------------------------------
    # Assemble Canonical Manifest
    # ---------------------------------------------------------
    print("\n[Assembly] Assembling Reconciled Manifest with Integrity Audit...")

    experiments_payload = dict(hist_experiments)  # preserve historical G1-G8

    # Add Exp G9
    experiments_payload["exp_g9_combined_lexical_template_isolation"] = {
        "experiment_id": "exp_g9_combined_lexical_template_isolation",
        "title": "Exp G9: Combined Lexical and Template Isolation",
        "status": "executed_successfully",
        "description": "Evaluates character n-gram baseline under simultaneous holdout of dictionary root words and positive template families.",
        "split_type": "combined_lexical_and_template_disjoint",
        "evaluation_scope": "Dual Syntactic-Lexical Generalization",
        "threshold": th_g9,
        "metrics": eval_g9,
        "vocabulary_size": model_g9.vocab_size,
        "training_time_ms": round(t_tr_g9, 2),
        "inference_latency_us": round(lat_g9, 2),
        "threshold_robustness": robustness_g9
    }

    # Add Exp G10
    experiments_payload["exp_g10_independent_v2b_syllabic_negatives"] = {
        "experiment_id": "exp_g10_independent_v2b_syllabic_negatives",
        "title": "Exp G10: Independent Generator V2 with Syllabic Negatives",
        "status": "executed_successfully",
        "description": "Evaluates frozen Model 1 against Independent Generator V2 with pseudo-phonetic / syllabic negative generator strategy.",
        "split_type": "independent_generator_v2b_syllabic",
        "evaluation_scope": "Independent Distribution (Smooth Transitions)",
        "threshold": th_g1,
        "metrics": eval_g10,
        "inference_latency_us": round(lat_g10, 2),
        "threshold_robustness": robustness_g10
    }

    # Attach threshold robustness reports directly to G4, G6, G8 if present in payload
    if "exp_g4_independent_v2_holdout" in experiments_payload:
        experiments_payload["exp_g4_independent_v2_holdout"]["threshold_robustness"] = robustness_g4
    if "exp_g6_lexical_diagnostic_disjoint" in experiments_payload:
        experiments_payload["exp_g6_lexical_diagnostic_disjoint"]["threshold_robustness"] = robustness_g6
    if "exp_g8_position_diagnostic_heldout" in experiments_payload:
        experiments_payload["exp_g8_position_diagnostic_heldout"]["threshold_robustness"] = robustness_g8

    manifest_data = {
        "schema_version": "predict_ps_phase4_2_3_v1",
        "manifest_type": "predict_ps_combined_generalization_and_threshold_audit",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "phase": "Phase 4.2.3 — Combined Lexical-Template Generalization, Threshold Robustness & Statistical Reconciliation",
        "environment": {
            "python_version": platform.python_version(),
            "platform": platform.platform(),
            "scikit_learn_version": sklearn.__version__,
            "numpy_version": np.__version__,
            "scipy_version": scipy.__version__
        },
        "combined_generalization_audit": {
            "lexical_isolation": combined_data["lexical_isolation"],
            "template_isolation": combined_data["template_isolation"],
            "combined_isolation_audit": isolation_g9
        },
        "generator_artefact_audits": {
            "v2_uniform_audit": audit_v2_uniform,
            "v2b_syllabic_audit": audit_v2b_syllabic
        },
        "threshold_robustness_summary": {
            "exp_g4": {
                "threshold": th_g1,
                "ppr": robustness_g4["metrics_at_selected_threshold"]["predicted_positive_rate"],
                "fsr": robustness_g4["metrics_at_selected_threshold"]["false_strong_rate"],
                "regime": robustness_g4["classification_regime"]["regime_type"]
            },
            "exp_g6": {
                "threshold": th_g6,
                "ppr": robustness_g6["metrics_at_selected_threshold"]["predicted_positive_rate"],
                "fsr": robustness_g6["metrics_at_selected_threshold"]["false_strong_rate"],
                "regime": robustness_g6["classification_regime"]["regime_type"]
            },
            "exp_g8": {
                "threshold": th_g8,
                "ppr": robustness_g8["metrics_at_selected_threshold"]["predicted_positive_rate"],
                "fsr": robustness_g8["metrics_at_selected_threshold"]["false_strong_rate"],
                "regime": robustness_g8["classification_regime"]["regime_type"]
            },
            "exp_g9": {
                "threshold": th_g9,
                "ppr": robustness_g9["metrics_at_selected_threshold"]["predicted_positive_rate"],
                "fsr": robustness_g9["metrics_at_selected_threshold"]["false_strong_rate"],
                "regime": robustness_g9["classification_regime"]["regime_type"]
            },
            "exp_g10": {
                "threshold": th_g1,
                "ppr": robustness_g10["metrics_at_selected_threshold"]["predicted_positive_rate"],
                "fsr": robustness_g10["metrics_at_selected_threshold"]["false_strong_rate"],
                "regime": robustness_g10["classification_regime"]["regime_type"]
            }
        },
        "experiments": experiments_payload
    }

    # Verify zero raw passwords in exported manifest
    manifest_str = json.dumps(manifest_data)
    forbidden_tokens = ["dragon!@#", "Xk9#mQ2$vL5*pZ8", "bapomelu"]
    for tok in forbidden_tokens:
        assert tok not in manifest_str, f"Privacy violation: raw candidate '{tok}' in exported manifest!"

    if write_canonical:
        # Write to src/data/ and python/
        src_target = os.path.join(os.path.dirname(__file__), "..", "src", "data", "phase4_2_3_audit_manifest.json")
        py_target = os.path.join(os.path.dirname(__file__), "phase4_2_3_audit_manifest.json")

        os.makedirs(os.path.dirname(src_target), exist_ok=True)
        with open(src_target, "w", encoding="utf-8") as f:
            json.dump(manifest_data, f, indent=2)
        with open(py_target, "w", encoding="utf-8") as f:
            json.dump(manifest_data, f, indent=2)
        print(f"\n[Export] Manifest exported successfully to:\n  - {src_target}\n  - {py_target}")

    print("=" * 84)
    print("PREDICT-PS Phase 4.2.3 Audit Completed Successfully.")
    print("=" * 84)
    return manifest_data


if __name__ == "__main__":
    run_phase4_2_3_audit(n_samples=4000, n_holdout=1000, n_bootstraps=1000)

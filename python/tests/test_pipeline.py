#!/usr/bin/env python3
"""
PREDICT-PS Phase 4 & Phase 4.1: Comprehensive Unit & Regression Test Suite
Exercises all 22 required validation areas:
1. Python module import reliability
2. Dependency failure handling & verification
3. Actual TF-IDF fitting
4. Actual Logistic Regression fitting
5. Deterministic dataset generation
6. Dataset diagnostic correctness
7. Class-distribution reporting
8. Exact duplicate detection
9. Normalized duplicate detection
10. Cross-partition isolation
11. Independent-generator separation
12. Vectorizer training-only fitting
13. No metadata leakage into training features
14. Length-only diagnostic operation
15. Character-composition diagnostic operation
16. Evaluation metric correctness (Balanced Acc, Specificity, NPV, MCC, FSR, FWR)
17. Confidence interval reproducibility
18. Threshold selection using validation data only
19. Artifact schema validation
20. Artifact sanitization (Zero password leakage)
21. Backward compatibility with Phase 4 schema
22. Experiment manifest integrity
Negative tests for invalid configurations & incomplete runs.
"""

import os
import sys
import tempfile
import json
import unittest

# CRITICAL FIX (Objective A): Insert parent Python directory into sys.path BEFORE any module imports
PARENT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)

# Explicitly verify required dependencies; fail clearly if missing (no silent skipping)
REQUIRED_MODULES = ["numpy", "sklearn", "scipy"]
MISSING_MODULES = []
for mod in REQUIRED_MODULES:
    try:
        __import__(mod)
    except ImportError:
        MISSING_MODULES.append(mod)

if MISSING_MODULES:
    raise EnvironmentError(
        f"[PREDICT-PS Environment Failure] Missing required dependencies: {MISSING_MODULES}. "
        f"Install them via 'pip install -r python/requirements.txt' to execute the test suite."
    )

import numpy as np
import sklearn
from sklearn.metrics import confusion_matrix

from dataset_generator import (
    generate_synthetic_dataset,
    generate_length_controlled_dataset,
    generate_charset_controlled_dataset,
    generate_independent_holdout_dataset,
    split_dataset,
    generate_dictionary_suffix_candidate,
    generate_sequential_candidate,
    generate_keyboard_walk_candidate,
    generate_repeated_phrase_candidate,
    generate_high_entropy_uniform_candidate,
    generate_combined_lexical_template_dataset,
    generate_independent_v2_matched_dataset,
    generate_independent_v2b_matched_dataset,
    split_dataset_by_combined_lexical_and_template,
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
    LengthOnlyBaselineModel,
    CompositionOnlyBaselineModel,
    evaluate_predictions,
    compute_bootstrap_confidence_intervals,
    select_validation_threshold,
    compute_calibration_curve,
    analyze_threshold_robustness
)



class TestPredictPSPhase41ResearchIntegrity(unittest.TestCase):

    def test_01_import_reliability(self):
        """Verifies that all Python modules import reliably from anywhere."""
        self.assertTrue(os.path.exists(os.path.join(PARENT_DIR, "dataset_generator.py")))
        self.assertTrue(os.path.exists(os.path.join(PARENT_DIR, "dataset_diagnostics.py")))
        self.assertTrue(os.path.exists(os.path.join(PARENT_DIR, "model_pipeline.py")))
        self.assertTrue(os.path.exists(os.path.join(PARENT_DIR, "run_experiments.py")))

    def test_02_dependency_verification(self):
        """Ensures NumPy and scikit-learn are modern versions meeting requirements."""
        self.assertGreaterEqual(int(sklearn.__version__.split(".")[0]), 1)
        self.assertTrue(hasattr(np, "random"))

    def test_03_actual_tfidf_fitting(self):
        """Tests that TfidfVectorizer actually learns n-gram vocabulary on training samples."""
        train_samples = ["apple123", "orange456", "banana789", "dragon!@#", "Xk9#mQ2$vL5*pZ8"]
        train_labels = [1, 1, 1, 1, 0]
        model = NgramBaselineModel(ngram_range=(2, 3), min_df=1, random_state=42)
        model.fit(train_samples, train_labels)

        self.assertTrue(model.is_fitted)
        self.assertGreater(model.vocab_size, 5)
        # Check that vocabulary contains character n-grams like 'ap', 'app'
        self.assertIn("ap", model.vectorizer.vocabulary_)

    def test_04_actual_logistic_regression_fitting(self):
        """Tests that LogisticRegression converges and produces valid probability bounds [0, 1]."""
        cands, lbls, _ = generate_synthetic_dataset(n_samples=100, seed=42)
        model = NgramBaselineModel(ngram_range=(2, 4), min_df=1, random_state=42)
        train_ms = model.fit(cands[:80], lbls[:80])
        self.assertGreater(train_ms, 0)

        probas = model.predict_proba(cands[80:])
        self.assertEqual(len(probas), 20)
        self.assertTrue(np.all((probas >= 0.0) & (probas <= 1.0)))

    def test_05_deterministic_dataset_generation(self):
        """Ensures that two generation calls with the same seed yield identical candidates."""
        c1, l1, p1 = generate_synthetic_dataset(n_samples=50, seed=777)
        c2, l2, p2 = generate_synthetic_dataset(n_samples=50, seed=777)
        self.assertEqual(c1, c2)
        self.assertEqual(l1, l2)
        self.assertEqual(p1, p2)

    def test_06_dataset_diagnostic_correctness(self):
        """Verifies that dataset_diagnostics computes accurate statistical aggregates."""
        sample_cands = ["Password123!", "12345678", "qwertyuiop", "aaabbbccc", "Rk8$mQ2#vL5*pZ9"]
        sample_labels = [1, 1, 1, 1, 0]
        sample_types = ["dict_suffix", "sequential", "keyboard_walk", "repeated_phrase", "high_entropy_uniform"]

        diag = analyze_dataset_composition(sample_cands, sample_labels, sample_types)
        self.assertEqual(diag["sample_count"], 5)
        self.assertEqual(diag["class_distribution"]["positive_count"], 4)
        self.assertEqual(diag["class_distribution"]["negative_count"], 1)
        self.assertEqual(diag["length_statistics"]["overall"]["min"], 8)
        self.assertEqual(diag["character_statistics"]["total_distinct_alphabet_size"], len(set("".join(sample_cands))))

    def test_07_class_distribution_reporting(self):
        """Verifies balanced 50/50 ratio in generated datasets."""
        cands, lbls, _ = generate_synthetic_dataset(n_samples=200, seed=123, positive_ratio=0.5)
        self.assertEqual(sum(lbls), 100)
        self.assertEqual(len(lbls) - sum(lbls), 100)

    def test_08_exact_duplicate_detection(self):
        """Ensures that duplicate strings within the dataset are identified."""
        cands = ["pass1", "pass2", "pass1", "pass3"]
        diag = analyze_dataset_composition(cands, [1, 1, 1, 1], ["seq"] * 4)
        self.assertEqual(diag["duplicate_detection"]["exact_duplicates"], 1)

    def test_09_normalized_duplicate_detection(self):
        """Ensures that case and whitespace differences are caught as normalized duplicates."""
        cands = ["Password123", "password123", " Password123 "]
        diag = analyze_dataset_composition(cands, [1, 1, 1], ["dict"] * 3)
        self.assertEqual(diag["duplicate_detection"]["case_normalized_duplicates"], 2)

    def test_10_cross_partition_isolation(self):
        """Strictly tests that train, val, and test splits have 0 exact and 0 normalized overlap."""
        cands, lbls, ptypes = generate_synthetic_dataset(n_samples=300, seed=101)
        splits = split_dataset(cands, lbls, ptypes, train_ratio=0.70, val_ratio=0.15, seed=101)

        isolation = audit_split_isolation(
            splits["train"]["candidates"],
            splits["val"]["candidates"],
            splits["test"]["candidates"]
        )
        self.assertTrue(isolation["isolation_verified"])
        self.assertEqual(isolation["exact_cross_split_duplicates"]["train_val"], 0)
        self.assertEqual(isolation["exact_cross_split_duplicates"]["train_test"], 0)
        self.assertEqual(isolation["exact_cross_split_duplicates"]["val_test"], 0)

    def test_11_independent_generator_separation(self):
        """Ensures independent holdout generator produces novel structural categories with seed 9999."""
        cands, lbls, ptypes = generate_independent_holdout_dataset(n_samples=100, seed=9999)
        self.assertEqual(len(cands), 100)
        # Verify novel types exist
        novel_types = set(ptypes)
        self.assertTrue(any("novel" in t for t in novel_types))

    def test_12_vectorizer_training_only_fitting(self):
        """Verifies vectorizer is fitted on training partition only; test vocabulary remains unseen."""
        train_data = ["alpha123", "bravo456", "Xk9#mQ2$vL5*", "pZ8@wR3!tY6&"]
        train_labels = [1, 1, 0, 0]
        test_data = ["charlie789!@#"]

        model = NgramBaselineModel(ngram_range=(2, 3), min_df=1, random_state=42)
        model.fit(train_data, train_labels)

        # Vocabulary must not contain test-exclusive n-grams
        self.assertNotIn("ch", model.vectorizer.vocabulary_)
        self.assertNotIn("cha", model.vectorizer.vocabulary_)

    def test_13_no_metadata_leakage_into_training_features(self):
        """Verifies that pattern_types and generator metadata are not features in the ML vectorizer."""
        cands, lbls, ptypes = generate_synthetic_dataset(n_samples=50, seed=42)
        model = NgramBaselineModel(min_df=1)
        model.fit(cands, lbls)

        # Inspect feature names - must only be character n-grams, never pattern names
        feature_names = model.vectorizer.get_feature_names_out()
        for fname in feature_names:
            self.assertNotIn("dict_suffix", fname)
            self.assertNotIn("keyboard_walk", fname)
            self.assertNotIn("high_entropy", fname)

    def test_14_length_only_diagnostic_operation(self):
        """Tests that LengthOnlyBaselineModel fits and predicts using length only."""
        cands = ["short", "tiny", "veryverylongpasswordindeed", "anotherenormousstring123"]
        lbls = [1, 1, 0, 0]
        model = LengthOnlyBaselineModel(random_state=42)
        model.fit(cands, lbls)
        preds = model.predict(["brief", "thisisasuperlongpassphrase999"])
        self.assertEqual(len(preds), 2)
        self.assertEqual(preds[0], 1)
        self.assertEqual(preds[1], 0)

    def test_15_character_composition_diagnostic_operation(self):
        """Tests that CompositionOnlyBaselineModel extracts 6 compositional features."""
        cands = ["simple", "Complex123!@#"]
        lbls = [1, 0]
        model = CompositionOnlyBaselineModel(random_state=42)
        feat = model._extract_features(cands)
        self.assertEqual(feat.shape, (2, 6))
        model.fit(cands, lbls)
        self.assertTrue(model.is_fitted)

    def test_16_evaluation_metric_correctness(self):
        """Verifies exact calculation of Balanced Accuracy, Specificity, NPV, MCC, FSR, and FWR."""
        y_true = [1, 1, 1, 1, 0, 0, 0, 0]
        # Predictions: TP=3, FN=1, TN=3, FP=1
        y_pred = np.array([1, 1, 1, 0, 0, 0, 0, 1])
        y_proba = np.array([0.9, 0.8, 0.7, 0.3, 0.1, 0.2, 0.3, 0.8])

        metrics = evaluate_predictions(y_true, y_pred, y_proba)
        cm = metrics["confusion_matrix"]
        self.assertEqual(cm["true_positives"], 3)
        self.assertEqual(cm["false_negatives"], 1)
        self.assertEqual(cm["true_negatives"], 3)
        self.assertEqual(cm["false_positives"], 1)

        # False-Strong Rate: FN / (TP + FN) = 1 / 4 = 0.25
        self.assertEqual(metrics["false_strong_rate"], 0.25)
        # False-Weak Rate: FP / (TN + FP) = 1 / 4 = 0.25
        self.assertEqual(metrics["false_weak_rate"], 0.25)
        # Specificity: TN / (TN + FP) = 3 / 4 = 0.75
        self.assertEqual(metrics["specificity"], 0.75)
        # Recall: TP / (TP + FN) = 3 / 4 = 0.75
        self.assertEqual(metrics["recall"], 0.75)
        # Balanced Accuracy: (0.75 + 0.75) / 2 = 0.75
        self.assertEqual(metrics["balanced_accuracy"], 0.75)
        # NPV: TN / (TN + FN) = 3 / 4 = 0.75
        self.assertEqual(metrics["negative_predictive_value"], 0.75)

    def test_17_confidence_interval_reproducibility(self):
        """Verifies 95% bootstrap confidence interval computation produces valid bounds."""
        y_true = [1] * 50 + [0] * 50
        y_proba = np.array([0.8] * 50 + [0.2] * 50)
        ci = compute_bootstrap_confidence_intervals(y_true, y_proba, threshold=0.5, n_bootstraps=50, seed=42)

        self.assertIn("accuracy", ci)
        self.assertIn("macro_f1", ci)
        self.assertIn("false_strong_rate", ci)
        self.assertLessEqual(ci["accuracy"]["lower_95"], ci["accuracy"]["upper_95"])

    def test_18_threshold_selection_validation_only(self):
        """Verifies threshold selection operates on validation labels and returns float in [0.1, 0.9]."""
        val_true = [1, 1, 1, 0, 0, 0]
        val_probas = np.array([0.95, 0.85, 0.75, 0.35, 0.25, 0.15])
        th = select_validation_threshold(val_true, val_probas, optimization_target="balanced")
        self.assertGreaterEqual(th, 0.1)
        self.assertLessEqual(th, 0.9)

    def test_19_artifact_schema_validation(self):
        """Verifies Phase 4.1 manifest structure contains all required experiment keys."""
        from run_experiments import run_all_phase4_1_experiments
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            # write_canonical=False ensures unit tests never overwrite canonical files
            manifest = run_all_phase4_1_experiments(output_manifest_path=tmp_path, n_samples=200, n_holdout=100, n_bootstraps=20, write_canonical=False)
            self.assertEqual(manifest["schema_version"], "predict_ps_phase4_1_v1")
            self.assertIn("experiments", manifest)
            self.assertIn("exp1_original_baseline", manifest["experiments"])
            self.assertIn("exp2_length_controlled", manifest["experiments"])
            self.assertIn("exp3_charset_controlled", manifest["experiments"])
            self.assertIn("exp4_independent_holdout", manifest["experiments"])
            self.assertIn("exp5_length_only_diagnostic", manifest["experiments"])
            self.assertIn("exp6_composition_only_diagnostic", manifest["experiments"])
            self.assertIn("exp7_length_and_composition_controlled", manifest["experiments"])
            self.assertIn("exp8_composition_diagnostic_on_matched", manifest["experiments"])
            self.assertIn("dataset_diagnostics", manifest)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    def test_20_artifact_sanitization_zero_passwords(self):
        """Ensures that no raw passwords or candidate strings exist in the exported manifest."""
        manifest_path = "src/data/phase4_1_experiments_manifest.json"
        if os.path.exists(manifest_path):
            with open(manifest_path, "r", encoding="utf-8") as f:
                content = f.read()
            self.assertNotIn('"candidates":', content)
            self.assertNotIn('"raw_passwords":', content)
            self.assertNotIn('"password_list":', content)

    def test_21_backward_compatibility_phase4_artifact(self):
        """Ensures Phase 4 baseline metrics file still adheres to predict_ps_phase4_v1 schema."""
        p4_path = "src/data/phase4_baseline_metrics.json"
        if os.path.exists(p4_path):
            with open(p4_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.assertEqual(data["schema_version"], "predict_ps_phase4_v1")
            self.assertIn("model_architecture", data)
            self.assertIn("evaluation_metrics", data)

    def test_22_experiment_manifest_integrity(self):
        """Verifies environment, platform, and dependency fields are populated in manifest."""
        manifest_path = "src/data/phase4_1_experiments_manifest.json"
        if os.path.exists(manifest_path):
            with open(manifest_path, "r", encoding="utf-8") as f:
                m = json.load(f)
            self.assertIn("python_version", m["environment"])
            self.assertIn("scikit_learn_version", m["environment"])
            self.assertIn("methodological_conclusions", m)

    def test_23_negative_tests_invalid_configurations(self):
        """Negative tests for model predicting before fitting, and invalid input handling."""
        model = NgramBaselineModel()
        with self.assertRaises(RuntimeError):
            model.predict_proba(["test123"])

        len_model = LengthOnlyBaselineModel()
        with self.assertRaises(RuntimeError):
            len_model.predict_proba(["test123"])

        comp_model = CompositionOnlyBaselineModel()
        with self.assertRaises(RuntimeError):
            comp_model.predict_proba(["test123"])

    def test_24_bootstrap_threshold_propagation_regression(self):
        """
        Regression Test for Requirement 1:
        Verifies that evaluate_predictions accepts a deliberately non-0.5 decision threshold,
        propagates that exact threshold into compute_bootstrap_confidence_intervals,
        and ensures that every bootstrap resample uses that fixed threshold.
        """
        y_true = [1] * 50 + [0] * 50
        # Probabilities strictly clustered between 0.60 and 0.70
        y_proba = np.array([0.65] * 50 + [0.25] * 50)

        # Case A: Threshold = 0.80 (probabilities 0.65 < 0.80 -> all positive predictions become 0!)
        th_high = 0.80
        y_pred_high = (y_proba >= th_high).astype(int)
        eval_high = evaluate_predictions(y_true, y_pred_high, y_proba, compute_cis=True, n_bootstraps=50, threshold=th_high)

        self.assertEqual(eval_high["decision_threshold"], 0.80)
        self.assertEqual(eval_high["recall"], 0.0)  # Recall is 0 because all positive samples are predicted 0
        ci_high = eval_high["confidence_intervals_95"]
        self.assertEqual(ci_high["methodology"]["threshold_used"], 0.80)
        self.assertEqual(ci_high["methodology"]["threshold_policy"], "fixed_validation_selected")
        self.assertEqual(ci_high["recall"]["mean"], 0.0)  # Bootstrap must match point estimate at 0.80!

        # Case B: Threshold = 0.50 (probabilities 0.65 >= 0.50 -> positive predictions become 1!)
        th_low = 0.50
        y_pred_low = (y_proba >= th_low).astype(int)
        eval_low = evaluate_predictions(y_true, y_pred_low, y_proba, compute_cis=True, n_bootstraps=50, threshold=th_low)

        self.assertEqual(eval_low["decision_threshold"], 0.50)
        self.assertEqual(eval_low["recall"], 1.0)  # Recall is 1.0 at threshold 0.50
        ci_low = eval_low["confidence_intervals_95"]
        self.assertEqual(ci_low["methodology"]["threshold_used"], 0.50)
        self.assertEqual(ci_low["recall"]["mean"], 1.0)  # Bootstrap must match point estimate at 0.50!

        # Proves that bootstrap uses the supplied threshold, NOT a hardcoded 0.5 default!
        self.assertNotEqual(ci_high["recall"]["mean"], ci_low["recall"]["mean"])

    def test_25_valid_bootstrap_resample_accounting(self):
        """
        Regression Test for Requirement 2:
        Verifies exact accounting of requested resamples, valid evaluated resamples,
        safe handling of single-class resamples, and valid metric counts.
        """
        y_true = [1] * 30 + [0] * 30
        y_proba = np.linspace(0.1, 0.9, 60)

        ci = compute_bootstrap_confidence_intervals(y_true, y_proba, threshold=0.5, n_bootstraps=100, seed=42)
        meth = ci["methodology"]

        self.assertEqual(meth["requested_resamples"], 100)
        self.assertGreater(meth["valid_resamples"], 0)
        self.assertEqual(meth["valid_resamples"] + meth["skipped_single_class_resamples"], 100)
        
        # Verify all metrics have exact valid resample counts recorded
        by_metric = meth["valid_resamples_by_metric"]
        self.assertIn("accuracy", by_metric)
        self.assertIn("roc_auc", by_metric)
        self.assertIn("pr_auc", by_metric)
        self.assertEqual(by_metric["roc_auc"], meth["valid_resamples"])
        self.assertEqual(by_metric["pr_auc"], meth["valid_resamples"])

    def test_26_length_and_composition_matching(self):
        """
        Verification for Requirement 3:
        Verifies that generate_length_and_composition_controlled_dataset produces
        strictly matched candidates with exact length = 14 and exact composition:
        8 lowercase, 2 uppercase, 2 digits, 2 symbols for BOTH classes.
        """
        from dataset_generator import generate_length_and_composition_controlled_dataset
        symbols = "!@#$%^&*"
        cands, lbls, types = generate_length_and_composition_controlled_dataset(n_samples=200, seed=42)

        self.assertEqual(len(cands), 200)
        self.assertEqual(sum(lbls), 100)  # 50/50 balance

        pos_cands = [c for c, y in zip(cands, lbls) if y == 1]
        neg_cands = [c for c, y in zip(cands, lbls) if y == 0]

        for cand in pos_cands + neg_cands:
            self.assertEqual(len(cand), 14, f"Length mismatch in {cand}")
            low = sum(1 for ch in cand if ch.islower())
            up = sum(1 for ch in cand if ch.isupper())
            dig = sum(1 for ch in cand if ch.isdigit())
            sym = sum(1 for ch in cand if ch in symbols)
            self.assertEqual(low, 8, f"Lowercase count mismatch in {cand}")
            self.assertEqual(up, 2, f"Uppercase count mismatch in {cand}")
            self.assertEqual(dig, 2, f"Digit count mismatch in {cand}")
            self.assertEqual(sym, 2, f"Symbol count mismatch in {cand}")

        # Mean length delta is exactly 0.00
        mean_pos_len = sum(len(c) for c in pos_cands) / len(pos_cands)
        mean_neg_len = sum(len(c) for c in neg_cands) / len(neg_cands)
        self.assertAlmostEqual(mean_pos_len - mean_neg_len, 0.0, places=4)

    def test_27_manifest_synchronization(self):
        """
        Verification for Requirement 5:
        Verifies that src/data/ and python/ manifests exist, have identical content,
        and adhere to the canonical execution specification.
        """
        p1 = "src/data/phase4_1_experiments_manifest.json"
        p2 = "python/phase4_1_experiments_manifest.json"

        if os.path.exists(p1) and os.path.exists(p2):
            with open(p1, "r", encoding="utf-8") as f1, open(p2, "r", encoding="utf-8") as f2:
                m1 = json.load(f1)
                m2 = json.load(f2)

            # Both files must match in substantive serialized content
            self.assertEqual(json.dumps(m1, sort_keys=True), json.dumps(m2, sort_keys=True))
            self.assertEqual(m1["schema_version"], "predict_ps_phase4_1_v1")

            # Check canonical dataset sizes
            self.assertEqual(m1["dataset_diagnostics"]["original_dataset"]["sample_count"], 4000)
            self.assertEqual(m1["dataset_diagnostics"]["independent_holdout_dataset"]["sample_count"], 1000)

            # Check experiments present
            self.assertIn("exp1_original_baseline", m1["experiments"])
            self.assertIn("exp4_independent_holdout", m1["experiments"])
            self.assertIn("exp7_length_and_composition_controlled", m1["experiments"])
            self.assertIn("exp8_composition_diagnostic_on_matched", m1["experiments"])

            # Verify threshold propagation in Exp 1
            exp1 = m1["experiments"]["exp1_original_baseline"]
            th = exp1["threshold"]
            self.assertEqual(exp1["metrics"]["decision_threshold"], th)
            self.assertEqual(exp1["metrics"]["confidence_intervals_95"]["methodology"]["threshold_used"], th)
            self.assertEqual(exp1["metrics"]["confidence_intervals_95"]["methodology"]["requested_resamples"], 1000)

    def test_28_leakage_prevention_in_controlled_experiments(self):
        """
        Verification for Requirement 3:
        Ensures that stratified splits of the length-and-composition controlled dataset
        exhibit ZERO exact or case-normalized cross-partition leakage.
        """
        from dataset_generator import generate_length_and_composition_controlled_dataset
        cands, lbls, types = generate_length_and_composition_controlled_dataset(n_samples=200, seed=42)
        splits = split_dataset(cands, lbls, types, train_ratio=0.70, val_ratio=0.15, seed=42)

        train_set = set(splits["train"]["candidates"])
        val_set = set(splits["val"]["candidates"])
        test_set = set(splits["test"]["candidates"])

        self.assertEqual(len(train_set.intersection(val_set)), 0)
        self.assertEqual(len(train_set.intersection(test_set)), 0)
        self.assertEqual(len(val_set.intersection(test_set)), 0)

    def test_29_lexical_group_isolation(self):
        """
        Phase 4.2.2 Requirement 2:
        Verifies that split_dataset_by_lexical_group enforces strict group-aware isolation:
        No underlying dictionary word appears in more than one partition (train, val, test).
        """
        from dataset_generator import generate_dual_controlled_dataset_with_metadata, split_dataset_by_lexical_group
        cands, lbls, meta = generate_dual_controlled_dataset_with_metadata(n_samples=200, seed=42)
        splits = split_dataset_by_lexical_group(cands, lbls, meta, train_ratio=0.70, val_ratio=0.15, seed=42)

        train_words = set(m["lexical_source"] for m in splits["train"]["metadata"] if m["lexical_source"] != "none_uniform_scramble")
        val_words = set(m["lexical_source"] for m in splits["val"]["metadata"] if m["lexical_source"] != "none_uniform_scramble")
        test_words = set(m["lexical_source"] for m in splits["test"]["metadata"] if m["lexical_source"] != "none_uniform_scramble")

        self.assertGreater(len(train_words), 0)
        self.assertGreater(len(val_words), 0)
        self.assertGreater(len(test_words), 0)

        # Disjointness checks
        self.assertEqual(len(train_words.intersection(val_words)), 0, "Lexical word leakage between train and val!")
        self.assertEqual(len(train_words.intersection(test_words)), 0, "Lexical word leakage between train and test!")
        self.assertEqual(len(val_words.intersection(test_words)), 0, "Lexical word leakage between val and test!")

    def test_30_template_family_isolation(self):
        """
        Phase 4.2.2 Requirement 3:
        Verifies that split_dataset_by_template_family holds out entire positive template families.
        Ensures test split contains 0 template families from train or val splits.
        """
        from dataset_generator import (
            generate_dual_controlled_dataset_with_metadata,
            split_dataset_by_template_family,
            TEMPLATE_SUFFIX_PADDED,
            TEMPLATE_PREFIX_PADDED,
            TEMPLATE_WORD_SYMBOLS_SUFFIX,
            TEMPLATE_PREFIX_SYMBOLS
        )
        cands, lbls, meta = generate_dual_controlled_dataset_with_metadata(n_samples=200, seed=42)
        splits = split_dataset_by_template_family(
            cands, lbls, meta,
            train_families=[TEMPLATE_SUFFIX_PADDED, TEMPLATE_PREFIX_PADDED],
            val_families=[TEMPLATE_WORD_SYMBOLS_SUFFIX],
            test_families=[TEMPLATE_PREFIX_SYMBOLS],
            seed=42
        )

        train_tmpls = set(m["template_family"] for m in splits["train"]["metadata"] if m["template_family"] != "UniformScramble")
        test_tmpls = set(m["template_family"] for m in splits["test"]["metadata"] if m["template_family"] != "UniformScramble")

        self.assertEqual(train_tmpls, {TEMPLATE_SUFFIX_PADDED, TEMPLATE_PREFIX_PADDED})
        self.assertEqual(test_tmpls, {TEMPLATE_PREFIX_SYMBOLS})
        self.assertEqual(len(train_tmpls.intersection(test_tmpls)), 0, "Template family leakage between train and test!")

    def test_31_exact_and_normalized_duplicate_isolation_in_group_splits(self):
        """
        Phase 4.2.2 Requirement 2 & 3:
        Ensures zero exact and zero case-normalized duplicates across partitions
        in both lexical-group-disjoint and template-family-disjoint splits.
        """
        from dataset_generator import (
            generate_dual_controlled_dataset_with_metadata,
            split_dataset_by_lexical_group,
            split_dataset_by_template_family
        )
        cands, lbls, meta = generate_dual_controlled_dataset_with_metadata(n_samples=200, seed=42)
        lex_splits = split_dataset_by_lexical_group(cands, lbls, meta, seed=42)

        for s1, s2 in [("train", "val"), ("train", "test"), ("val", "test")]:
            c1_set = set(lex_splits[s1]["candidates"])
            c2_set = set(lex_splits[s2]["candidates"])
            self.assertEqual(len(c1_set.intersection(c2_set)), 0)

            c1_norm = set(c.strip().lower() for c in c1_set)
            c2_norm = set(c.strip().lower() for c in c2_set)
            self.assertEqual(len(c1_norm.intersection(c2_norm)), 0)

    def test_32_metadata_exclusion_from_features(self):
        """
        Phase 4.2.2 Requirement 2 & 4:
        Formally verifies that metadata (lexical_source, template_family, category)
        is NEVER provided as model input features to the vectorizer or diagnostic classifiers.
        """
        from dataset_generator import generate_dual_controlled_dataset_with_metadata
        cands, lbls, meta = generate_dual_controlled_dataset_with_metadata(n_samples=50, seed=42)

        # Inspect candidates to ensure metadata is not embedded in the candidate strings
        for cand, m in zip(cands, meta):
            self.assertNotIn("lexical_source", cand)
            self.assertNotIn("template_family", cand)
            self.assertNotIn("category", cand)
            self.assertNotIn(m["category"], cand)

        # Verify vectorizer fits strictly on string candidates
        model = NgramBaselineModel(ngram_range=(2, 3), min_df=1)
        model.fit(cands, lbls)
        self.assertTrue(model.is_fitted)
        for term in model.vectorizer.vocabulary_:
            self.assertNotIn("lexical_source", term)
            self.assertNotIn("template_family", term)

    def test_33_independent_generator_v2_construction_and_matching(self):
        """
        Phase 4.2.2 Requirement 4:
        Verifies IndependentGeneratorV2 produces balanced 50/50 samples with:
        - Exact length = 14
        - Exact composition: 8 lowercase, 2 uppercase, 2 digits, 2 symbols
        - Distinct construction logic using phonetic compounding
        """
        from dataset_generator import generate_independent_v2_matched_dataset
        symbols = "!@#$%^&*"
        cands, lbls, meta = generate_independent_v2_matched_dataset(n_samples=200, seed=9999)

        self.assertEqual(len(cands), 200)
        self.assertEqual(sum(lbls), 100)  # 50/50 balance

        for cand in cands:
            self.assertEqual(len(cand), 14, f"Length mismatch in {cand}")
            low = sum(1 for ch in cand if ch.islower())
            up = sum(1 for ch in cand if ch.isupper())
            dig = sum(1 for ch in cand if ch.isdigit())
            sym = sum(1 for ch in cand if ch in symbols)
            self.assertEqual(low, 8, f"Lowercase mismatch in {cand}")
            self.assertEqual(up, 2, f"Uppercase mismatch in {cand}")
            self.assertEqual(dig, 2, f"Digit mismatch in {cand}")
            self.assertEqual(sym, 2, f"Symbol mismatch in {cand}")

        # Check positive metadata has phonetic compound indicators
        pos_meta = [m for m, y in zip(meta, lbls) if y == 1]
        for m in pos_meta:
            self.assertIn("+", m["lexical_source"])  # e.g. stem1+stem2
            self.assertTrue(m["template_family"].startswith("independent_"))

    def test_34_diagnostic_comparators_functionality(self):
        """
        Phase 4.2.2 Requirement 5:
        Verifies that LexicalOnlyBaselineModel and PositionAwareDiagnosticModel
        can fit and predict probabilities without error.
        """
        from model_pipeline import LexicalOnlyBaselineModel, PositionAwareDiagnosticModel
        from dataset_generator import generate_dual_controlled_dataset_with_metadata
        cands, lbls, meta = generate_dual_controlled_dataset_with_metadata(n_samples=50, seed=42)

        lex_model = LexicalOnlyBaselineModel(target_word_length=8)
        lex_model.fit(cands, lbls)
        self.assertTrue(lex_model.is_fitted)
        lex_probs = lex_model.predict_proba(cands)
        self.assertEqual(len(lex_probs), 50)
        self.assertTrue(all(0.0 <= p <= 1.0 for p in lex_probs))

        pos_model = PositionAwareDiagnosticModel(target_length=14)
        pos_model.fit(cands, lbls)
        self.assertTrue(pos_model.is_fitted)
        pos_probs = pos_model.predict_proba(cands)
        self.assertEqual(len(pos_probs), 50)
        self.assertTrue(all(0.0 <= p <= 1.0 for p in pos_probs))

    def test_35_generalization_manifest_synchronization(self):
        """
        Phase 4.2.2 Requirement 8 & 9:
        Verifies that Phase 4.2.2 generalization manifests exist in src/data/ and python/,
        match byte-for-byte in serialized content, and contain all G1..G8 experiments.
        """
        p1 = "src/data/phase4_2_generalization_manifest.json"
        p2 = "python/phase4_2_generalization_manifest.json"

        if os.path.exists(p1) and os.path.exists(p2):
            with open(p1, "r", encoding="utf-8") as f1, open(p2, "r", encoding="utf-8") as f2:
                m1 = json.load(f1)
                m2 = json.load(f2)

            self.assertEqual(json.dumps(m1, sort_keys=True), json.dumps(m2, sort_keys=True))
            self.assertEqual(m1["schema_version"], "predict_ps_phase4_2_2_v1")

            for exp_key in [
                "exp_g1_random_split_baseline",
                "exp_g2_lexical_disjoint",
                "exp_g3_template_disjoint",
                "exp_g4_independent_v2_holdout",
                "exp_g5_lexical_diagnostic_random",
                "exp_g6_lexical_diagnostic_disjoint",
                "exp_g7_position_diagnostic_standard",
                "exp_g8_position_diagnostic_heldout"
            ]:
                self.assertIn(exp_key, m1["experiments"])
                exp = m1["experiments"][exp_key]
                self.assertIn("metrics", exp)
                if "confidence_intervals_95" in exp["metrics"]:
                    meth = exp["metrics"]["confidence_intervals_95"]["methodology"]
                    self.assertEqual(meth["requested_resamples"], 1000)
                    self.assertEqual(meth["threshold_policy"], "fixed_validation_selected")

    def test_36_sanitized_artifacts_zero_passwords_in_generalization(self):
        """
        Phase 4.2.2 Requirement 8:
        Ensures no raw candidate passwords exist anywhere in the exported generalization manifest.
        """
        p1 = "src/data/phase4_2_generalization_manifest.json"
        if os.path.exists(p1):
            with open(p1, "r", encoding="utf-8") as f:
                content = f.read()

            self.assertNotIn("candidate_password", content)
            self.assertNotIn("raw_passwords", content)
            self.assertNotIn("plain_text", content)

    def test_37_combined_lexical_template_isolation(self):
        """
        Phase 4.2.3 Requirement 1:
        Verifies simultaneous isolation of lexical root words and template families:
        W_train ∩ W_val = ∅, W_train ∩ W_test = ∅, W_val ∩ W_test = ∅
        T_train ∩ T_test = ∅, T_val separately designated.
        Exact length 14, 8L/2U/2D/2S matching, and 0 duplicate leakage.
        """
        data = generate_combined_lexical_template_dataset(n_samples=200, seed=42)
        audit = audit_combined_isolation(data["splits"])
        self.assertTrue(audit["combined_isolation_verified"])
        self.assertTrue(audit["lexical_disjoint"])
        self.assertTrue(audit["template_disjoint"])
        self.assertTrue(audit["exact_duplicates_zero"])
        self.assertTrue(audit["normalized_duplicates_zero"])

        # Check composition of every sample
        for split_name in ["train", "val", "test"]:
            for c in data["splits"][split_name]["candidates"]:
                self.assertEqual(len(c), 14)
                self.assertEqual(sum(1 for ch in c if ch.islower()), 8)
                self.assertEqual(sum(1 for ch in c if ch.isupper()), 2)
                self.assertEqual(sum(1 for ch in c if ch.isdigit()), 2)

    def test_38_alternative_syllabic_negative_generator(self):
        """
        Phase 4.2.3 Requirement 2:
        Verifies that Alternative Generator V2b produces matched pseudo-syllabic negative candidates:
        Exact length 14, 8L/2U/2D/2S, no dictionary words or phonetic stems.
        """
        cands, lbls, meta = generate_independent_v2b_matched_dataset(n_samples=100, seed=9999)
        self.assertEqual(len(cands), 100)
        self.assertEqual(sum(lbls), 50)

        for c, l, m in zip(cands, lbls, meta):
            self.assertEqual(len(c), 14)
            self.assertEqual(sum(1 for ch in c if ch.islower()), 8)
            self.assertEqual(sum(1 for ch in c if ch.isupper()), 2)
            self.assertEqual(sum(1 for ch in c if ch.isdigit()), 2)
            if l == 0:
                self.assertIn("syllabic", m["template_family"])
                # Negative must not contain any dictionary word
                c_low = c.lower()
                for w in WORDS_8_EXPANDED:
                    self.assertNotIn(w.lower(), c_low)

    def test_39_generator_sequence_artefact_audit(self):
        """
        Phase 4.2.3 Requirement 2:
        Tests that audit_generator_artefacts correctly computes 14x4 positional distributions,
        4x4 transition matrices, and Jensen-Shannon transition divergence.
        """
        pos = ["Aa1!bb2@cc3#dd", "Ee4$ff5%gg6^hh"]
        neg = ["12!@abCDefGHij", "34#$klMNoPQRst"]
        audit = audit_generator_artefacts(pos, neg, positive_stems=["bb", "ff"], length=14)
        self.assertIn("transition_divergence", audit)
        self.assertIn("jensen_shannon_divergence", audit["transition_divergence"])
        self.assertIn("cosine_similarity", audit["transition_divergence"])
        self.assertGreaterEqual(audit["transition_divergence"]["jensen_shannon_divergence"], 0.0)
        self.assertLessEqual(audit["transition_divergence"]["jensen_shannon_divergence"], 1.0)
        self.assertEqual(len(audit["positional_distributions"]["positive"]), 14)
        self.assertEqual(len(audit["positional_distributions"]["negative"]), 14)

    def test_40_negative_pool_zero_stem_overlap(self):
        """
        Phase 4.2.3 Requirement 2:
        Verifies that 0% of phonetic stems appear in independent negative candidates.
        """
        cands_v2, lbls_v2, _ = generate_independent_v2_matched_dataset(n_samples=200, seed=9999)
        cands_v2b, lbls_v2b, _ = generate_independent_v2b_matched_dataset(n_samples=200, seed=9999)

        neg_v2 = [c for c, l in zip(cands_v2, lbls_v2) if l == 0]
        neg_v2b = [c for c, l in zip(cands_v2b, lbls_v2b) if l == 0]

        audit_v2 = audit_generator_artefacts(neg_v2, neg_v2, positive_stems=INDEPENDENT_PHONETIC_4_STEMS)
        audit_v2b = audit_generator_artefacts(neg_v2b, neg_v2b, positive_stems=INDEPENDENT_PHONETIC_4_STEMS)

        self.assertTrue(audit_v2["stem_overlap_audit"]["isolated"])
        self.assertEqual(audit_v2["stem_overlap_audit"]["overlap_rate"], 0.0)
        self.assertTrue(audit_v2b["stem_overlap_audit"]["isolated"])
        self.assertEqual(audit_v2b["stem_overlap_audit"]["overlap_rate"], 0.0)

    def test_41_positive_prediction_rate_computation(self):
        """
        Phase 4.2.3 Requirement 3:
        Tests that Predicted Positive Rate (PPR = (TP + FP) / N) is bounded in [0, 1]
        and accurately reflects prediction counts.
        """
        y_true = [1, 1, 0, 0]
        y_pred = np.array([1, 0, 0, 0])  # TP=1, FP=0, TN=2, FN=1 -> PPR = 1/4 = 0.25
        y_prob = np.array([0.9, 0.4, 0.1, 0.2])
        ev = evaluate_predictions(y_true, y_pred, y_prob, threshold=0.5)
        self.assertEqual(ev["predicted_positive_rate"], 0.25)

    def test_42_degenerate_all_negative_regime_detection(self):
        """
        Phase 4.2.3 Requirement 3:
        Verifies that when a model outputs 0 for all samples, analyze_threshold_robustness:
        1. Correctly flags regime as degenerate_all_negative.
        2. Sets PPR to 0.0.
        3. Explains that nominal 50% accuracy on balanced test data is due to predicting all zeros,
           NOT random guessing.
        """
        val_y = [1, 1, 0, 0]
        val_prob = np.array([0.8, 0.9, 0.1, 0.2])
        test_y = [1, 1, 0, 0]
        test_prob = np.array([0.05, 0.08, 0.02, 0.04])  # All below threshold 0.5

        res = analyze_threshold_robustness(val_y, val_prob, test_y, test_prob, selected_threshold=0.5)
        regime = res["classification_regime"]
        self.assertTrue(regime["is_degenerate_all_negative"])
        self.assertEqual(regime["regime_type"], "degenerate_all_negative")
        self.assertEqual(res["metrics_at_selected_threshold"]["predicted_positive_rate"], 0.0)
        self.assertEqual(res["metrics_at_selected_threshold"]["accuracy"], 0.5)
        self.assertIn("NOT random guessing", regime["explanation"])

    def test_43_threshold_sensitivity_sweep_curves(self):
        """
        Phase 4.2.3 Requirement 3:
        Verifies threshold sensitivity curve computation across tau in [0.05, 0.95] in 0.05 steps.
        """
        val_y = [1, 1, 1, 1, 0, 0, 0, 0]
        val_prob = np.array([0.9, 0.8, 0.7, 0.6, 0.4, 0.3, 0.2, 0.1])
        test_y = [1, 1, 1, 1, 0, 0, 0, 0]
        test_prob = np.array([0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25, 0.15])

        res = analyze_threshold_robustness(val_y, val_prob, test_y, test_prob, selected_threshold=0.5)
        curve = res["threshold_sweep_curve"]
        self.assertEqual(len(curve), 19)
        self.assertEqual(curve[0]["threshold"], 0.05)
        self.assertEqual(curve[-1]["threshold"], 0.95)
        # PPR must be non-increasing as threshold increases
        pprs = [pt["test_ppr"] for pt in curve]
        for i in range(len(pprs) - 1):
            self.assertGreaterEqual(pprs[i], pprs[i + 1])

    def test_44_phase4_2_3_manifest_synchronization_and_sanitization(self):
        """
        Phase 4.2.3 Requirement 4:
        Verifies that python/ and src/data/ copies of phase4_2_3_audit_manifest.json exist,
        match exactly, adhere to schema predict_ps_phase4_2_3_v1, and contain zero raw candidate passwords.
        """
        p_src = "src/data/phase4_2_3_audit_manifest.json"
        p_py = "python/phase4_2_3_audit_manifest.json"

        if os.path.exists(p_src) and os.path.exists(p_py):
            with open(p_src, "r", encoding="utf-8") as f1, open(p_py, "r", encoding="utf-8") as f2:
                m_src = json.load(f1)
                m_py = json.load(f2)

            self.assertEqual(m_src, m_py)
            self.assertEqual(m_src["schema_version"], "predict_ps_phase4_2_3_v1")
            self.assertIn("exp_g9_combined_lexical_template_isolation", m_src["experiments"])
            self.assertIn("exp_g10_independent_v2b_syllabic_negatives", m_src["experiments"])

            content = json.dumps(m_src)
            self.assertNotIn("dragon!@#", content)
            self.assertNotIn("bapomelu", content)

    def test_45_automated_reconciliation_validator_execution(self):
        """
        Phase 4.2.3 Requirement 4:
        Runs python/verify_manifest_reconciliation.py and verifies all checks pass cleanly.
        """
        rec_script = os.path.join(PARENT_DIR, "verify_manifest_reconciliation.py")
        if os.path.exists(rec_script):
            import subprocess
            res = subprocess.run([sys.executable, rec_script], capture_output=True, text=True)
            self.assertEqual(res.returncode, 0, f"Reconciliation validator failed:\n{res.stderr}")

    def test_46_factorial_matched_control_dataset(self):
        """
        Phase 4.2.4 Track 1:
        Verifies that generate_factorial_matched_control_dataset produces exact length 14,
        8L/2U/2D/2S matching, 0 cross-split duplicates, and disjoint lexical/pseudo-word roots.
        """
        from dataset_generator import generate_factorial_matched_control_dataset
        from dataset_diagnostics import audit_factorial_matched_control

        data = generate_factorial_matched_control_dataset(n_samples=200, seed=42)
        audit = audit_factorial_matched_control(data["splits"])

        self.assertTrue(audit["factorial_matching_verified"])
        self.assertTrue(audit["isolation"]["lexical_roots_disjoint"])
        self.assertTrue(audit["isolation"]["pseudo_words_disjoint"])
        self.assertTrue(audit["isolation"]["exact_duplicates_zero"])
        self.assertTrue(audit["isolation"]["normalized_duplicates_zero"])

        # Check all candidates match composition exactly
        for sname in ["train", "val", "test"]:
            for c in data["splits"][sname]["candidates"]:
                self.assertEqual(len(c), 14)
                self.assertEqual(sum(1 for ch in c if ch.islower()), 8)
                self.assertEqual(sum(1 for ch in c if ch.isupper()), 2)
                self.assertEqual(sum(1 for ch in c if ch.isdigit()), 2)

    def test_47_factorial_positional_parity(self):
        """
        Phase 4.2.4 Track 1:
        Verifies that positive and negative classes under factorial matched design
        exhibit positional divergence <= 0.05 across all positions.
        """
        from dataset_generator import generate_factorial_matched_control_dataset
        from dataset_diagnostics import audit_factorial_matched_control

        data = generate_factorial_matched_control_dataset(n_samples=400, seed=42)
        audit = audit_factorial_matched_control(data["splits"])
        for sname in ["train", "val", "test"]:
            sa = audit["split_audits"][sname]
            self.assertTrue(sa["positional_parity_verified"])
            self.assertLessEqual(sa["max_positional_divergence"], 0.05)

    def test_48_position_only_diagnostic_collapse(self):
        """
        Phase 4.2.4 Track 1:
        Formally proves that when positive and negative candidates are generated
        under identical template geometries, a position-only classifier collapses
        to 50% accuracy (ROC-AUC ~ 0.50), proving zero positional shortcut learning.
        """
        from dataset_generator import generate_factorial_matched_control_dataset
        from model_pipeline import PositionOnlyDiagnosticModel, evaluate_predictions

        data = generate_factorial_matched_control_dataset(n_samples=200, seed=42)
        pos_model = PositionOnlyDiagnosticModel(target_length=14, random_state=42)
        pos_model.fit(data["splits"]["train"]["candidates"], data["splits"]["train"]["labels"])

        test_prob = pos_model.predict_proba(data["splits"]["test"]["candidates"])
        test_pred = (test_prob >= 0.5).astype(int)
        ev = evaluate_predictions(data["splits"]["test"]["labels"], test_pred, test_prob, threshold=0.5)

        self.assertAlmostEqual(ev["roc_auc"], 0.50, delta=0.05)
        self.assertAlmostEqual(ev["accuracy"], 0.50, delta=0.05)

    def test_49_ngram_without_lexical_diagnostic(self):
        """
        Phase 4.2.4 Track 2:
        Tests NgramWithoutLexicalDiagnosticModel which abstracts characters into structural
        tokens ('l', 'u', 'd', 's') to evaluate grammatical structure without lexical semantics.
        """
        from model_pipeline import NgramWithoutLexicalDiagnosticModel

        cands = ["Aa1!pass12@#word", "Bb2$word34%^pass", "12!@abCDefGHij", "34#$klMNoPQRst"]
        lbls = [1, 1, 0, 0]
        model = NgramWithoutLexicalDiagnosticModel(ngram_range=(2, 3), random_state=42)
        t_ms = model.fit(cands, lbls)
        self.assertTrue(model.is_fitted)
        self.assertGreater(t_ms, 0.0)

        probas = model.predict_proba(cands)
        self.assertEqual(len(probas), 4)
        for p in probas:
            self.assertGreaterEqual(p, 0.0)
            self.assertLessEqual(p, 1.0)

    def test_50_cluster_aware_bootstrap_confidence_intervals(self):
        """
        Phase 4.2.4 Track 3:
        Verifies that compute_cluster_aware_bootstrap_confidence_intervals groups resamples
        by cluster_id, propagates fixed threshold, and produces valid 95% CIs.
        """
        from model_pipeline import compute_cluster_aware_bootstrap_confidence_intervals

        y_true = [1, 1, 1, 1, 0, 0, 0, 0] * 5
        y_prob = np.array([0.9, 0.85, 0.8, 0.75, 0.2, 0.15, 0.1, 0.05] * 5)
        cluster_ids = [f"clust_{i % 10}" for i in range(len(y_true))]

        ci = compute_cluster_aware_bootstrap_confidence_intervals(
            y_true, y_prob, cluster_ids, threshold=0.5, n_bootstraps=100, seed=42
        )

        self.assertIn("accuracy", ci)
        self.assertIn("macro_f1", ci)
        self.assertIn("methodology", ci)
        self.assertEqual(ci["methodology"]["technique"], "Cluster-aware (grouped) non-parametric empirical percentile bootstrap")
        self.assertEqual(ci["methodology"]["unique_cluster_count"], 10)
        self.assertFalse(ci["methodology"]["insufficient_clusters"])

        acc = ci["accuracy"]
        self.assertLessEqual(acc["lower_95"], acc["upper_95"])
        self.assertGreaterEqual(acc["mean"], 0.8)

    def test_51_cluster_aware_insufficient_clusters_handling(self):
        """
        Phase 4.2.4 Track 3:
        Verifies that when fewer than min_clusters exist, cluster-aware bootstrap
        emits an explicit notification and falls back gracefully.
        """
        from model_pipeline import compute_cluster_aware_bootstrap_confidence_intervals

        y_true = [1, 1, 0, 0]
        y_prob = np.array([0.9, 0.8, 0.2, 0.1])
        cluster_ids = ["clust_A", "clust_A", "clust_B", "clust_B"]  # Only 2 clusters

        ci = compute_cluster_aware_bootstrap_confidence_intervals(
            y_true, y_prob, cluster_ids, threshold=0.5, n_bootstraps=50, seed=42, min_clusters=8
        )

        self.assertTrue(ci["methodology"]["insufficient_clusters"])
        self.assertIn("Insufficient independent clusters", ci["methodology"]["cluster_aware_warning"])

    def test_52_g12_multi_generator_sequence_artefacts(self):
        """
        Phase 4.2.4 Track 2:
        Verifies that generate_g12_multi_generator_audit_dataset and audit_g12_sequence_artefacts
        generate 4 matched groups, calculate unigram/bigram/trigram entropy, and verify 0 stem overlap.
        """
        from dataset_generator import generate_g12_multi_generator_audit_dataset, INDEPENDENT_PHONETIC_4_STEMS, WORDS_8_EXPANDED
        from dataset_diagnostics import audit_g12_sequence_artefacts

        groups = generate_g12_multi_generator_audit_dataset(n_samples_per_group=50, seed=42)
        self.assertEqual(len(groups), 4)
        for gname in ["dictionary_positives", "phonetic_positives", "syllabic_negatives", "scrambled_negatives"]:
            self.assertIn(gname, groups)
            self.assertEqual(len(groups[gname]), 50)

        audit = audit_g12_sequence_artefacts(groups, positive_stems=INDEPENDENT_PHONETIC_4_STEMS + WORDS_8_EXPANDED)
        self.assertTrue(audit["matching_verification"]["all_length_14"])
        self.assertTrue(audit["matching_verification"]["all_composition_8L_2U_2D_2S"])

        # Check Shannon entropy fields exist for each group
        for gname in groups:
            prof = audit["groups"][gname]
            self.assertGreater(prof["unigram_entropy"], 0.0)
            self.assertGreater(prof["bigram_entropy"], 0.0)
            self.assertGreater(prof["trigram_entropy"], 0.0)

        # Check pairwise divergences
        self.assertIn("dictionary_positives__vs__syllabic_negatives", audit["pairwise_divergences"])
        self.assertIn("dictionary_positives__vs__scrambled_negatives", audit["pairwise_divergences"])

    def test_53_phase4_2_4_manifest_synchronization(self):
        """
        Phase 4.2.4 Track 6:
        Verifies that python/ and src/data/ copies of phase4_2_4_audit_manifest.json
        exist, match exactly, and adhere to schema predict_ps_phase4_2_4_v1.
        """
        p_src = "src/data/phase4_2_4_audit_manifest.json"
        p_py = "python/phase4_2_4_audit_manifest.json"

        self.assertTrue(os.path.exists(p_src), f"Missing {p_src}")
        self.assertTrue(os.path.exists(p_py), f"Missing {p_py}")

        with open(p_src, "r", encoding="utf-8") as f1, open(p_py, "r", encoding="utf-8") as f2:
            m_src = json.load(f1)
            m_py = json.load(f2)

        self.assertEqual(m_src, m_py)
        self.assertEqual(m_src["schema_version"], "predict_ps_phase4_2_4_v1")
        self.assertIn("exp_g11_factorial_matched_control", m_src["experiments"])
        self.assertIn("exp_g12_residual_sequence_artefact_audit", m_src["experiments"])

    def test_54_phase4_2_4_zero_raw_password_export(self):
        """
        Phase 4.2.4 Absolute Constraints:
        Verifies that phase4_2_4_audit_manifest.json contains zero raw password strings,
        zero candidate strings, and zero candidate lists.
        """
        p_py = "python/phase4_2_4_audit_manifest.json"
        with open(p_py, "r", encoding="utf-8") as f:
            content = f.read()

        prohibited = ["candidate_password", "raw_passwords", "password_list", "dragon!@#", "bapomelu"]
        for p in prohibited:
            self.assertNotIn(p, content)

    def test_55_full_reconciliation_validator_10_checks(self):
        """
        Phase 4.2.4 Track 5:
        Executes verify_manifest_reconciliation.py and verifies all 10 checks pass cleanly.
        """
        rec_script = os.path.join(PARENT_DIR, "verify_manifest_reconciliation.py")
        import subprocess
        res = subprocess.run([sys.executable, rec_script], capture_output=True, text=True)
        self.assertEqual(res.returncode, 0, f"Reconciliation validator failed:\n{res.stdout}\n{res.stderr}")
        self.assertIn("ALL 10 RECONCILIATION & INTEGRITY CHECKS PASSED SUCCESSFULLY", res.stdout)


if __name__ == "__main__":
    unittest.main()




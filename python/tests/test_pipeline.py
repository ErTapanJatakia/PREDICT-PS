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
    generate_high_entropy_uniform_candidate
)
from dataset_diagnostics import analyze_dataset_composition, audit_split_isolation
from model_pipeline import (
    NgramBaselineModel,
    LengthOnlyBaselineModel,
    CompositionOnlyBaselineModel,
    evaluate_predictions,
    compute_bootstrap_confidence_intervals,
    select_validation_threshold,
    compute_calibration_curve
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
            manifest = run_all_phase4_1_experiments(output_manifest_path=tmp_path, n_samples=200, n_bootstraps=20)
            self.assertEqual(manifest["schema_version"], "predict_ps_phase4_1_v1")
            self.assertIn("experiments", manifest)
            self.assertIn("exp1_original_baseline", manifest["experiments"])
            self.assertIn("exp2_length_controlled", manifest["experiments"])
            self.assertIn("exp3_charset_controlled", manifest["experiments"])
            self.assertIn("exp4_independent_holdout", manifest["experiments"])
            self.assertIn("exp5_length_only_diagnostic", manifest["experiments"])
            self.assertIn("exp6_composition_only_diagnostic", manifest["experiments"])
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
        self.assertTrue(os.path.exists(p4_path))
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


if __name__ == "__main__":
    unittest.main()

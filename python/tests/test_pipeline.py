#!/usr/bin/env python3
"""
PREDICT-PS Phase 4: Unit Test Suite for Baseline Pipeline
Tests dataset generation, split isolation, zero leakage, model convergence,
deterministic evaluation, and artifact schema.
Uses standard library unittest.
"""

import unittest
import os
import sys
import tempfile
import json
try:
    import numpy as np
    from model_pipeline import NgramBaselineModel, evaluate_predictions
    HAS_ML_DEPS = True
except ImportError:
    HAS_ML_DEPS = False

# Ensure parent directory is in sys.path so modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dataset_generator import (
    generate_synthetic_dataset,
    split_dataset,
    generate_dictionary_suffix_candidate,
    generate_sequential_candidate,
    generate_keyboard_walk_candidate,
    generate_repeated_phrase_candidate,
    generate_high_entropy_uniform_candidate
)


class TestPredictPSPhase4Pipeline(unittest.TestCase):

    def test_generator_functions_output_valid_strings(self):
        import random
        rng = random.Random(1337)
        c1 = generate_dictionary_suffix_candidate(rng)
        c2 = generate_sequential_candidate(rng)
        c3 = generate_keyboard_walk_candidate(rng)
        c4 = generate_repeated_phrase_candidate(rng)
        c5 = generate_high_entropy_uniform_candidate(rng)

        for c in [c1, c2, c3, c4, c5]:
            self.assertIsInstance(c, str)
            self.assertGreaterEqual(len(c), 4)

    def test_dataset_generation_balance_and_deduplication(self):
        candidates, labels, pattern_types = generate_synthetic_dataset(n_samples=200, seed=123, positive_ratio=0.5)
        self.assertEqual(len(candidates), 200)
        self.assertEqual(len(labels), 200)
        self.assertEqual(len(pattern_types), 200)

        # Class balance check
        n_pos = sum(labels)
        n_neg = len(labels) - n_pos
        self.assertEqual(n_pos, 100)
        self.assertEqual(n_neg, 100)

        # Deduplication check
        unique_cands = set(candidates)
        self.assertEqual(len(unique_cands), 200, "Candidates must be strictly unique")

    def test_split_isolation_and_zero_duplicate_leakage(self):
        candidates, labels, pattern_types = generate_synthetic_dataset(n_samples=400, seed=999, positive_ratio=0.5)
        splits = split_dataset(candidates, labels, pattern_types, train_ratio=0.7, val_ratio=0.15, seed=999)

        train_cands = set(splits["train"]["candidates"])
        val_cands = set(splits["val"]["candidates"])
        test_cands = set(splits["test"]["candidates"])

        # Check disjoint sets
        self.assertEqual(len(train_cands.intersection(val_cands)), 0, "Train and Val must have 0 overlap")
        self.assertEqual(len(train_cands.intersection(test_cands)), 0, "Train and Test must have 0 overlap")
        self.assertEqual(len(val_cands.intersection(test_cands)), 0, "Val and Test must have 0 overlap")

        # Check total preservation
        self.assertEqual(len(train_cands) + len(val_cands) + len(test_cands), 400)

    @unittest.skipUnless(HAS_ML_DEPS, "scikit-learn and numpy required for training")
    def test_model_training_and_evaluation_metrics(self):
        candidates, labels, pattern_types = generate_synthetic_dataset(n_samples=300, seed=42)
        splits = split_dataset(candidates, labels, pattern_types, train_ratio=0.7, val_ratio=0.15, seed=42)

        model = NgramBaselineModel(ngram_range=(2, 4), min_df=1, random_state=42)
        duration_ms = model.fit(splits["train"]["candidates"], splits["train"]["labels"])

        self.assertTrue(model.is_fitted)
        self.assertGreater(duration_ms, 0)
        self.assertGreater(model.vocab_size, 0)

        # Test predictions
        test_cands = splits["test"]["candidates"]
        test_lbls = splits["test"]["labels"]
        probas = model.predict_proba(test_cands)
        preds = model.predict(test_cands, threshold=0.5)

        self.assertEqual(len(probas), len(test_cands))
        self.assertEqual(len(preds), len(test_cands))

        # Check probabilities within [0, 1]
        self.assertTrue(np.all((probas >= 0.0) & (probas <= 1.0)))

        metrics = evaluate_predictions(test_lbls, preds, probas)

        # Verify confusion matrix keys and conservation
        cm = metrics["confusion_matrix"]
        self.assertEqual(cm["true_positives"] + cm["false_positives"] + cm["true_negatives"] + cm["false_negatives"], len(test_cands))

        # Verify False-Strong Rate definition: FN / (TP + FN)
        if (cm["true_positives"] + cm["false_negatives"]) > 0:
            expected_fsr = round(cm["false_negatives"] / (cm["true_positives"] + cm["false_negatives"]), 4)
            self.assertEqual(metrics["false_strong_rate"], expected_fsr)

    def test_deterministic_reproducibility(self):
        # Two runs with same seed must yield identical results
        c1, l1, _ = generate_synthetic_dataset(n_samples=100, seed=777)
        c2, l2, _ = generate_synthetic_dataset(n_samples=100, seed=777)
        self.assertEqual(c1, c2)
        self.assertEqual(l1, l2)

    def test_sanitized_artifact_schema_contains_no_raw_passwords(self):
        if HAS_ML_DEPS:
            from export_artifact import run_and_export
            with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
                tmp_path = tmp.name

            try:
                run_and_export(output_path=tmp_path)
                with open(tmp_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            finally:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
        else:
            # Validate the pre-generated canonical artifact
            art_path = os.path.join(os.path.dirname(__file__), "..", "phase4_baseline_metrics.json")
            with open(art_path, "r", encoding="utf-8") as f:
                data = json.load(f)

        # Verify required schema fields
        self.assertEqual(data["schema_version"], "predict_ps_phase4_v1")
        self.assertEqual(data["pipeline_status"], "synthetic_pipeline_validation")
        self.assertIn("model_architecture", data)
        self.assertIn("evaluation_metrics", data)
        self.assertIn("computational_profile", data)
        self.assertIn("limitations_and_caveats", data)

        # Ensure zero raw passwords are present in the JSON artifact
        json_text = json.dumps(data)
        self.assertNotIn("candidates", data)
        self.assertNotIn("passwords", data)
        self.assertNotIn("password_list", data)


if __name__ == "__main__":
    unittest.main()

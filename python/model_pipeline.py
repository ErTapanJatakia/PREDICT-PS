#!/usr/bin/env python3
"""
PREDICT-PS Phase 4 & Phase 4.1: Machine Learning Pipelines and Statistical Diagnostics
Includes:
1. NgramBaselineModel: Character n-gram TF-IDF (2-5) + Logistic Regression
2. LengthOnlyBaselineModel: Diagnostic classifier using candidate length only
3. CompositionOnlyBaselineModel: Diagnostic classifier using character composition counts
4. Extended evaluation metrics: Balanced Accuracy, Specificity, NPV, MCC, ECE, Reliability Bins
5. Bootstrap 95% Confidence Intervals (1000 resamples)
6. Validation-based decision threshold selection
"""

import time
import math
import re
from typing import Dict, Any, List, Tuple, Optional, Set
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    brier_score_loss,
    matthews_corrcoef,
    balanced_accuracy_score
)


class NgramBaselineModel:
    """
    Character-level TF-IDF n-gram + Logistic Regression Baseline for Password Predictability.
    Empirical comparator for future feature-fusion experiments (Phase 5).
    """

    def __init__(
        self,
        ngram_range: Tuple[int, int] = (2, 5),
        min_df: int = 2,
        sublinear_tf: bool = True,
        C: float = 1.0,
        max_iter: int = 1000,
        random_state: int = 42
    ):
        self.ngram_range = ngram_range
        self.min_df = min_df
        self.sublinear_tf = sublinear_tf
        self.C = C
        self.max_iter = max_iter
        self.random_state = random_state

        self.vectorizer = TfidfVectorizer(
            analyzer='char',
            ngram_range=self.ngram_range,
            min_df=self.min_df,
            sublinear_tf=self.sublinear_tf
        )
        self.classifier = LogisticRegression(
            C=self.C,
            max_iter=self.max_iter,
            random_state=self.random_state,
            solver='lbfgs'
        )
        self.is_fitted = False
        self.vocab_size = 0

    def fit(self, train_candidates: List[str], train_labels: List[int]) -> float:
        """
        Fits vectorizer and classifier strictly on the train partition.
        Returns training time in milliseconds.
        """
        start_time = time.perf_counter()
        X_train = self.vectorizer.fit_transform(train_candidates)
        self.classifier.fit(X_train, train_labels)
        train_duration_ms = (time.perf_counter() - start_time) * 1000.0
        self.is_fitted = True
        self.vocab_size = len(self.vectorizer.vocabulary_)
        return train_duration_ms

    def predict_proba(self, candidates: List[str]) -> np.ndarray:
        """Predict probabilities of candidates being guessable (positive class, 1)."""
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted. Call fit() before predict_proba().")
        X = self.vectorizer.transform(candidates)
        return self.classifier.predict_proba(X)[:, 1]

    def predict(self, candidates: List[str], threshold: float = 0.5) -> np.ndarray:
        """Predict binary labels using decision threshold tau."""
        probas = self.predict_proba(candidates)
        return (probas >= threshold).astype(int)

    def benchmark_inference_latency(self, candidates: List[str], repetitions: int = 3) -> float:
        """Measures mean inference latency per candidate in microseconds."""
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted.")
        _ = self.predict_proba(candidates[:min(100, len(candidates))])
        durations = []
        for _ in range(repetitions):
            t0 = time.perf_counter()
            _ = self.predict_proba(candidates)
            elapsed = time.perf_counter() - t0
            durations.append(elapsed)
        mean_sec = sum(durations) / len(durations)
        return (mean_sec / len(candidates)) * 1_000_000.0


class LengthOnlyBaselineModel:
    """
    Diagnostic Control Classifier: Predicts label using candidate string length alone.
    Demonstrates whether the dataset exhibits length-based shortcut learning.
    """

    def __init__(self, random_state: int = 42):
        self.classifier = LogisticRegression(random_state=random_state)
        self.is_fitted = False

    def _extract_features(self, candidates: List[str]) -> np.ndarray:
        return np.array([[len(c)] for c in candidates], dtype=float)

    def fit(self, train_candidates: List[str], train_labels: List[int]) -> float:
        t0 = time.perf_counter()
        X = self._extract_features(train_candidates)
        self.classifier.fit(X, train_labels)
        self.is_fitted = True
        return (time.perf_counter() - t0) * 1000.0

    def predict_proba(self, candidates: List[str]) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted.")
        X = self._extract_features(candidates)
        return self.classifier.predict_proba(X)[:, 1]

    def predict(self, candidates: List[str], threshold: float = 0.5) -> np.ndarray:
        return (self.predict_proba(candidates) >= threshold).astype(int)


class CompositionOnlyBaselineModel:
    """
    Diagnostic Control Classifier: Predicts label using simple character class counts:
    [length, lowercase_count, uppercase_count, digit_count, symbol_count, unique_chars].
    Demonstrates how much predictable signal is attributable to coarse character diversity.
    """

    def __init__(self, random_state: int = 42):
        self.classifier = LogisticRegression(random_state=random_state, max_iter=500)
        self.is_fitted = False

    def _extract_features(self, candidates: List[str]) -> np.ndarray:
        symbols = set("!@#$%^&*()_+-=[]{}|;:,.<>?/`~'\"\\")
        features = []
        for c in candidates:
            n = len(c)
            lower = sum(1 for ch in c if ch.islower())
            upper = sum(1 for ch in c if ch.isupper())
            digits = sum(1 for ch in c if ch.isdigit())
            syms = sum(1 for ch in c if ch in symbols)
            uniq = len(set(c))
            features.append([n, lower, upper, digits, syms, uniq])
        return np.array(features, dtype=float)

    def fit(self, train_candidates: List[str], train_labels: List[int]) -> float:
        t0 = time.perf_counter()
        X = self._extract_features(train_candidates)
        self.classifier.fit(X, train_labels)
        self.is_fitted = True
        return (time.perf_counter() - t0) * 1000.0

    def predict_proba(self, candidates: List[str]) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted.")
        X = self._extract_features(candidates)
        return self.classifier.predict_proba(X)[:, 1]

    def predict(self, candidates: List[str], threshold: float = 0.5) -> np.ndarray:
        return (self.predict_proba(candidates) >= threshold).astype(int)


class LexicalOnlyBaselineModel:
    """
    Diagnostic Control Classifier (Phase 4.2.2):
    Evaluates how much discrimination is achieved purely through dictionary-word recognition.
    Learns the set of 8-letter dictionary words exclusively from the training partition.
    Extracts lexical presence features:
    - exact_lexicon_match: binary flag if candidate contains any word in self.known_lexicon
    - longest_alpha_run: length of longest contiguous alphabetical character run
    - has_8_letter_alpha_run: binary flag indicating whether an 8-character alphabetic block exists
    Demonstrates whether high baseline accuracy is driven by memorized dictionary words.
    """

    def __init__(self, target_word_length: int = 8, random_state: int = 42):
        self.target_word_length = target_word_length
        self.random_state = random_state
        self.known_lexicon: Set[str] = set()
        self.classifier = LogisticRegression(random_state=random_state, max_iter=500)
        self.is_fitted = False

    def _extract_lexicon_features(self, candidates: List[str]) -> np.ndarray:
        features = []
        for c in candidates:
            c_lower = c.lower()
            # 1. Exact match of any training dictionary word
            matched = any(w in c_lower for w in self.known_lexicon) if self.known_lexicon else False
            # 2. Proportion of candidate covered by known training dictionary words
            chars_in_dict = 0
            for w in self.known_lexicon:
                if w in c_lower:
                    chars_in_dict += len(w)
            frac_in_dict = min(1.0, chars_in_dict / max(1, len(c_lower)))
            features.append([1.0 if matched else 0.0, frac_in_dict])
        return np.array(features, dtype=float)

    def fit(self, train_candidates: List[str], train_labels: List[int]) -> float:
        t0 = time.perf_counter()
        # Learn lexicon strictly from positive training samples
        self.known_lexicon = set()
        for cand, lbl in zip(train_candidates, train_labels):
            if lbl == 1:
                c_lower = cand.lower()
                for i in range(len(c_lower) - self.target_word_length + 1):
                    sub = c_lower[i:i + self.target_word_length]
                    if sub.isalpha():
                        self.known_lexicon.add(sub)
        X = self._extract_lexicon_features(train_candidates)
        self.classifier.fit(X, train_labels)
        self.is_fitted = True
        return (time.perf_counter() - t0) * 1000.0

    def predict_proba(self, candidates: List[str]) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted. Call fit() before predict_proba().")
        X = self._extract_lexicon_features(candidates)
        return self.classifier.predict_proba(X)[:, 1]

    def predict(self, candidates: List[str], threshold: float = 0.5) -> np.ndarray:
        return (self.predict_proba(candidates) >= threshold).astype(int)


class PositionAwareDiagnosticModel:
    """
    Diagnostic Control Classifier (Phase 4.2.2):
    Evaluates whether class differences can be predicted purely from character-position
    patterns (character class per position) without any lexical/character identity knowledge.
    For each position i in [0..target_length-1]:
    - is_lower, is_upper, is_digit, is_symbol (4 one-hot features per position).
    Total features: 4 * target_length (e.g. 56 features for length 14).
    """

    def __init__(self, target_length: int = 14, random_state: int = 42):
        self.target_length = target_length
        self.random_state = random_state
        self.classifier = LogisticRegression(random_state=random_state, max_iter=500)
        self.is_fitted = False

    def _extract_positional_features(self, candidates: List[str]) -> np.ndarray:
        symbols = set("!@#$%^&*()_+-=[]{}|;:,.<>?/`~'\"\\")
        features = []
        for c in candidates:
            row = []
            for i in range(self.target_length):
                if i < len(c):
                    ch = c[i]
                    is_low = 1.0 if ch.islower() else 0.0
                    is_up = 1.0 if ch.isupper() else 0.0
                    is_dig = 1.0 if ch.isdigit() else 0.0
                    is_sym = 1.0 if ch in symbols else 0.0
                else:
                    is_low, is_up, is_dig, is_sym = 0.0, 0.0, 0.0, 0.0
                row.extend([is_low, is_up, is_dig, is_sym])
            features.append(row)
        return np.array(features, dtype=float)

    def fit(self, train_candidates: List[str], train_labels: List[int]) -> float:
        t0 = time.perf_counter()
        X = self._extract_positional_features(train_candidates)
        self.classifier.fit(X, train_labels)
        self.is_fitted = True
        return (time.perf_counter() - t0) * 1000.0

    def predict_proba(self, candidates: List[str]) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted. Call fit() before predict_proba().")
        X = self._extract_positional_features(candidates)
        return self.classifier.predict_proba(X)[:, 1]

    def predict(self, candidates: List[str], threshold: float = 0.5) -> np.ndarray:
        return (self.predict_proba(candidates) >= threshold).astype(int)


def compute_calibration_curve(
    y_true: List[int],
    y_proba: np.ndarray,
    n_bins: int = 5
) -> Dict[str, Any]:
    """
    Computes reliability diagram bins and Expected Calibration Error (ECE).
    """
    y_true_arr = np.array(y_true)
    bin_edges = np.linspace(0.0, 1.0, n_bins + 1)
    bins_data = []
    ece = 0.0
    total_samples = len(y_true_arr)

    for i in range(n_bins):
        low, high = bin_edges[i], bin_edges[i + 1]
        if i == n_bins - 1:
            mask = (y_proba >= low) & (y_proba <= high)
        else:
            mask = (y_proba >= low) & (y_proba < high)

        bin_count = int(np.sum(mask))
        if bin_count > 0:
            bin_conf = float(np.mean(y_proba[mask]))
            bin_acc = float(np.mean(y_true_arr[mask]))
            abs_diff = abs(bin_acc - bin_conf)
            ece += (bin_count / total_samples) * abs_diff
        else:
            bin_conf = float((low + high) / 2.0)
            bin_acc = 0.0

        bins_data.append({
            "bin_index": i,
            "range": [round(low, 2), round(high, 2)],
            "count": bin_count,
            "confidence": round(bin_conf, 4),
            "empirical_accuracy": round(bin_acc, 4)
        })

    return {
        "n_bins": n_bins,
        "expected_calibration_error": round(ece, 4),
        "bins": bins_data,
        "calibration_caveat": (
            "Logistic regression predicted probabilities reflect model confidence on the synthetic feature space, "
            "not a calibrated empirical probability of real-world offline password cracking."
        )
    }


def _fast_roc_auc(y_true_binary: np.ndarray, y_score: np.ndarray) -> float:
    """Mann-Whitney U statistic calculation for exact fast ROC-AUC."""
    order = np.argsort(y_score)
    rank = np.empty_like(order)
    rank[order] = np.arange(len(y_score)) + 1
    pos_mask = (y_true_binary == 1)
    n_pos = int(np.sum(pos_mask))
    n_neg = len(y_true_binary) - n_pos
    if n_pos == 0 or n_neg == 0:
        return 0.5
    u = np.sum(rank[pos_mask]) - (n_pos * (n_pos + 1)) / 2.0
    return float(u / (n_pos * n_neg))


def compute_bootstrap_confidence_intervals(
    y_true: List[int],
    y_proba: np.ndarray,
    threshold: float = 0.5,
    n_bootstraps: int = 1000,
    seed: int = 42
) -> Dict[str, Any]:
    """
    Computes 95% bootstrap confidence intervals for key performance metrics.
    Uses empirical percentile method with fixed seed for exact reproducibility.
    Propagates fixed validation-selected threshold across every bootstrap resample.
    Evaluates ranking and classification metrics across all valid resamples.
    """
    rng = np.random.RandomState(seed)
    y_true_arr = np.array(y_true)
    n = len(y_true_arr)

    accs, precs, recs, f1s, fsrs, pr_aucs, roc_aucs = [], [], [], [], [], [], []
    skipped_single_class = 0

    for _ in range(n_bootstraps):
        idx = rng.randint(0, n, size=n)
        sample_true = y_true_arr[idx]
        sample_proba = y_proba[idx]

        n_pos = int(np.sum(sample_true == 1))
        n_neg = len(sample_true) - n_pos
        if n_pos == 0 or n_neg == 0:
            skipped_single_class += 1
            continue

        sample_pred = (sample_proba >= threshold).astype(int)

        tp = int(np.sum((sample_true == 1) & (sample_pred == 1)))
        tn = int(np.sum((sample_true == 0) & (sample_pred == 0)))
        fp = int(np.sum((sample_true == 0) & (sample_pred == 1)))
        fn = int(np.sum((sample_true == 1) & (sample_pred == 0)))

        accs.append((tp + tn) / n)
        precs.append(tp / (tp + fp) if (tp + fp) > 0 else 0.0)
        recs.append(tp / (tp + fn) if (tp + fn) > 0 else 0.0)
        
        f1_p = (2 * tp) / (2 * tp + fp + fn) if (2 * tp + fp + fn) > 0 else 0.0
        f1_n = (2 * tn) / (2 * tn + fp + fn) if (2 * tn + fp + fn) > 0 else 0.0
        f1s.append((f1_p + f1_n) / 2.0)

        fsr = (fn / (tp + fn)) if (tp + fn) > 0 else 0.0
        fsrs.append(fsr)

        # Ranking metrics computed on all valid two-class resamples
        roc_aucs.append(_fast_roc_auc(sample_true, sample_proba))
        try:
            pr_aucs.append(float(average_precision_score(sample_true, sample_proba)))
        except ValueError:
            pr_aucs.append(0.5)

    def get_ci(values: List[float]) -> Dict[str, float]:
        if not values:
            return {"lower_95": 0.0, "upper_95": 0.0, "mean": 0.0}
        return {
            "lower_95": round(float(np.percentile(values, 2.5)), 4),
            "upper_95": round(float(np.percentile(values, 97.5)), 4),
            "mean": round(float(np.mean(values)), 4)
        }

    return {
        "accuracy": get_ci(accs),
        "precision": get_ci(precs),
        "recall": get_ci(recs),
        "macro_f1": get_ci(f1s),
        "false_strong_rate": get_ci(fsrs),
        "pr_auc": get_ci(pr_aucs),
        "roc_auc": get_ci(roc_aucs),
        "methodology": {
            "technique": "Non-parametric empirical percentile bootstrap",
            "requested_resamples": n_bootstraps,
            "valid_resamples": len(accs),
            "skipped_single_class_resamples": skipped_single_class,
            "valid_resamples_by_metric": {
                "accuracy": len(accs),
                "precision": len(precs),
                "recall": len(recs),
                "macro_f1": len(f1s),
                "false_strong_rate": len(fsrs),
                "roc_auc": len(roc_aucs),
                "pr_auc": len(pr_aucs)
            },
            "seed": seed,
            "threshold_used": round(float(threshold), 3),
            "threshold_policy": "fixed_validation_selected",
            "confidence_level": 0.95,
            "note": "Confidence intervals quantify statistical sampling variance on synthetic test partitions; they do not represent real-world human password population variation."
        }
    }


def select_validation_threshold(
    val_y_true: List[int],
    val_probas: np.ndarray,
    optimization_target: str = "balanced"
) -> float:
    """
    Determines decision threshold tau using validation split ONLY.
    Never uses test data.
    """
    thresholds = np.linspace(0.1, 0.9, 81)
    best_th = 0.5
    best_score = -1.0

    for th in thresholds:
        preds = (val_probas >= th).astype(int)
        if optimization_target == "balanced":
            score = balanced_accuracy_score(val_y_true, preds)
        elif optimization_target == "f1":
            score = f1_score(val_y_true, preds, average='macro')
        else:
            # minimize FSR while maintaining precision > 0.85
            tn, fp, fn, tp = confusion_matrix(val_y_true, preds, labels=[0, 1]).ravel()
            fsr = fn / (tp + fn) if (tp + fn) > 0 else 1.0
            score = 1.0 - fsr

        if score > best_score:
            best_score = score
            best_th = th

    return round(float(best_th), 3)


def evaluate_predictions(
    y_true: List[int],
    y_pred: np.ndarray,
    y_proba: np.ndarray,
    compute_cis: bool = False,
    n_bootstraps: int = 1000,
    threshold: float = 0.5
) -> Dict[str, Any]:
    """
    Computes rigorous cybersecurity evaluation metrics:
    - Confusion Matrix (TP, FP, TN, FN, Total)
    - Accuracy, Balanced Accuracy, Precision, Recall, Specificity, NPV, Macro-F1, MCC
    - PR-AUC, ROC-AUC, Brier score
    - False-Strong Rate (FSR): FN / (TP + FN)
    - False-Weak Rate (FWR): FP / (TN + FP)
    - Class support and predicted-positive rate
    - Optional bootstrap 95% confidence intervals with fixed validation-selected threshold
    - Reliability & calibration curve diagnostics
    """
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    total = int(tp + fp + tn + fn)

    acc = float(accuracy_score(y_true, y_pred))
    bal_acc = float(balanced_accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1_macro = float(f1_score(y_true, y_pred, average='macro'))
    
    # Specificity = TN / (TN + FP)
    specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0
    # NPV = TN / (TN + FN)
    npv = float(tn / (tn + fn)) if (tn + fn) > 0 else 0.0
    # MCC
    mcc = float(matthews_corrcoef(y_true, y_pred))

    try:
        roc_auc = float(roc_auc_score(y_true, y_proba))
    except ValueError:
        roc_auc = 0.5

    try:
        pr_auc = float(average_precision_score(y_true, y_proba))
    except ValueError:
        pr_auc = 0.5

    brier = float(brier_score_loss(y_true, y_proba))

    # Security rates
    fsr = float(fn / (tp + fn)) if (tp + fn) > 0 else 0.0
    fwr = float(fp / (tn + fp)) if (tn + fp) > 0 else 0.0

    calibration = compute_calibration_curve(y_true, y_proba, n_bins=5)

    metrics = {
        "decision_threshold": round(float(threshold), 3),
        "confusion_matrix": {
            "true_positives": int(tp),
            "false_positives": int(fp),
            "true_negatives": int(tn),
            "false_negatives": int(fn),
            "total": total
        },
        "accuracy": round(acc, 4),
        "balanced_accuracy": round(bal_acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "specificity": round(specificity, 4),
        "negative_predictive_value": round(npv, 4),
        "macro_f1": round(f1_macro, 4),
        "matthews_correlation_coefficient": round(mcc, 4),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "brier_score": round(brier, 4),
        "false_strong_rate": round(fsr, 4),
        "false_weak_rate": round(fwr, 4),
        "support": {
            "positive_class": int(tp + fn),
            "negative_class": int(tn + fp)
        },
        "predicted_positive_rate": round(float((tp + fp) / total), 4) if total > 0 else 0.0,
        "calibration": calibration
    }

    if compute_cis:
        metrics["confidence_intervals_95"] = compute_bootstrap_confidence_intervals(
            y_true, y_proba, threshold=threshold, n_bootstraps=n_bootstraps
        )

    return metrics

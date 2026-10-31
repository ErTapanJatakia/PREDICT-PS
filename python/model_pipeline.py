#!/usr/bin/env python3
"""
PREDICT-PS Phase 4: Character n-gram TF-IDF + Logistic Regression Baseline
Trains and evaluates a character n-gram baseline model on isolated synthetic partitions.
Strict split isolation, reproducible seed, comprehensive security metrics.
"""

import time
import math
from typing import Dict, Any, List, Tuple
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
    brier_score_loss
)


class NgramBaselineModel:
    """
    Character-level TF-IDF n-gram + Logistic Regression Baseline for Password Predictability.
    Serves as the empirical comparator for future feature-fusion experiments (Phase 5).
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
        # Returns probability of class 1
        return self.classifier.predict_proba(X)[:, 1]

    def predict(self, candidates: List[str], threshold: float = 0.5) -> np.ndarray:
        """Predict binary labels using decision threshold tau."""
        probas = self.predict_proba(candidates)
        return (probas >= threshold).astype(int)

    def benchmark_inference_latency(self, candidates: List[str], repetitions: int = 3) -> float:
        """
        Measures mean inference latency per candidate in microseconds.
        """
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted.")
        
        # Warmup
        _ = self.predict_proba(candidates[:100])

        durations = []
        for _ in range(repetitions):
            t0 = time.perf_counter()
            _ = self.predict_proba(candidates)
            elapsed = time.perf_counter() - t0
            durations.append(elapsed)

        mean_duration_sec = sum(durations) / len(durations)
        microseconds_per_sample = (mean_duration_sec / len(candidates)) * 1_000_000.0
        return microseconds_per_sample


def evaluate_predictions(
    y_true: List[int],
    y_pred: np.ndarray,
    y_proba: np.ndarray
) -> Dict[str, Any]:
    """
    Computes rigorous cybersecurity evaluation metrics:
    - Precision, Recall, Macro-F1, Accuracy
    - PR-AUC, ROC-AUC, Brier score
    - False-Strong Rate (FSR): FN / (TP + FN)
    - Confusion Matrix breakdown
    """
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1_macro = float(f1_score(y_true, y_pred, average='macro'))
    roc_auc = float(roc_auc_score(y_true, y_proba))
    pr_auc = float(average_precision_score(y_true, y_proba))
    brier = float(brier_score_loss(y_true, y_proba))

    # False-Strong Rate: Predicts 0 (resistant/strong) when ground truth is 1 (guessable)
    # FSR = FN / (TP + FN) = 1 - Recall
    fsr = float(fn / (tp + fn)) if (tp + fn) > 0 else 0.0
    # False-Weak Rate: Predicts 1 (guessable) when ground truth is 0 (resistant)
    # FWR = FP / (TN + FP)
    fwr = float(fp / (tn + fp)) if (tn + fp) > 0 else 0.0

    return {
        "confusion_matrix": {
            "true_positives": int(tp),
            "false_positives": int(fp),
            "true_negatives": int(tn),
            "false_negatives": int(fn),
            "total": int(tp + fp + tn + fn)
        },
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "macro_f1": round(f1_macro, 4),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "brier_score": round(brier, 4),
        "false_strong_rate": round(fsr, 4),
        "false_weak_rate": round(fwr, 4)
    }

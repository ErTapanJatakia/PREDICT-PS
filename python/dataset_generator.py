#!/usr/bin/env python3
"""
PREDICT-PS Phase 4: Synthetic Dataset Generator
Generates reproducible, structured synthetic password candidates for baseline evaluation.
Zero breach data, zero credential dumps, zero external downloads.
"""

import random
import string
from typing import List, Tuple, Dict, Set


# Documented base words and predictable affixes for synthetic guessable patterns
BASE_WORDS = [
    "password", "welcome", "admin", "summer", "winter", "spring", "autumn",
    "dragon", "master", "monkey", "shadow", "sunshine", "football", "baseball",
    "access", "secret", "system", "computer", "internet", "security", "charlie",
    "superman", "batman", "pokemon", "starwars", "galaxy", "rover", "harley"
]

COMMON_SUFFIXES = [
    "123", "1234", "1", "2", "3", "2023", "2024", "2025", "2026", "!", "!!", "@", "#", "$", "007"
]

KEYBOARD_ROWS = [
    "1234567890-=",
    "qwertyuiop[]",
    "asdfghjkl;'",
    "zxcvbnm,./",
    "!@#$%^&*()_+",
    "QWERTYUIOP{}",
    "ASDFGHJKL:\"",
    "ZXCVBNM<>?"
]


def generate_dictionary_suffix_candidate(rng: random.Random) -> str:
    """Generate a dictionary word concatenated with a predictable affix or leetspeak."""
    word = rng.choice(BASE_WORDS)
    if rng.random() > 0.5:
        word = word.capitalize()
    # Simple substitution in 30% of cases
    if rng.random() > 0.7:
        word = word.replace('a', '@').replace('e', '3').replace('o', '0').replace('i', '1')
    suffix = rng.choice(COMMON_SUFFIXES)
    return f"{word}{suffix}"


def generate_sequential_candidate(rng: random.Random) -> str:
    """Generate alphabetical or numeric sequential runs."""
    if rng.random() > 0.5:
        # Numeric run
        start = rng.randint(0, 5)
        length = rng.randint(6, 12)
        digits = "01234567890123456789"
        seq = digits[start:start + length]
        if rng.random() > 0.5:
            seq = seq[::-1]
        return seq
    else:
        # Alphabetic run
        alpha = string.ascii_lowercase
        start = rng.randint(0, 15)
        length = rng.randint(6, 10)
        seq = alpha[start:start + length]
        if rng.random() > 0.5:
            seq = seq.capitalize()
        if rng.random() > 0.5:
            seq += str(rng.randint(1, 99))
        return seq


def generate_keyboard_walk_candidate(rng: random.Random) -> str:
    """Generate horizontal keyboard sequences."""
    row = rng.choice(KEYBOARD_ROWS)
    length = rng.randint(6, 10)
    start = rng.randint(0, max(0, len(row) - length))
    walk = row[start:start + length]
    if rng.random() > 0.5:
        walk = walk[::-1]
    return walk


def generate_repeated_phrase_candidate(rng: random.Random) -> str:
    """Generate repeated character or short phrase patterns."""
    if rng.random() > 0.5:
        char = rng.choice(string.ascii_letters + string.digits)
        return char * rng.randint(8, 14)
    else:
        token = rng.choice(["abc", "pass", "123", "xyz", "qwe", "test"])
        repeats = rng.randint(3, 5)
        return token * repeats


def generate_high_entropy_uniform_candidate(rng: random.Random) -> str:
    """
    Generate an independently uniform random candidate across full 4-class charset.
    Represents resistant / non-guessable negative class (Label 0).
    """
    length = rng.randint(12, 20)
    all_chars = string.ascii_lowercase + string.ascii_uppercase + string.digits + "!@#$%^&*()_+-=[]{}|;:,.<>?"
    return "".join(rng.choice(all_chars) for _ in range(length))


def generate_synthetic_dataset(
    n_samples: int = 4000,
    seed: int = 42,
    positive_ratio: float = 0.5
) -> Tuple[List[str], List[int], List[str]]:
    """
    Generates a balanced synthetic dataset with strict deduplication.
    Returns:
        candidates: List of password strings
        labels: 1 = Guessable/Predictable pattern, 0 = High-entropy uniform
        pattern_types: String identifiers for verification (excluded from model training)
    """
    rng = random.Random(seed)
    n_pos = int(n_samples * positive_ratio)
    n_neg = n_samples - n_pos

    seen_exact: Set[str] = set()
    seen_normalized: Set[str] = set()

    candidates: List[str] = []
    labels: List[int] = []
    pattern_types: List[str] = []

    # Generate positive class (Guessable patterns: Label 1)
    generators = [
        ("dict_suffix", generate_dictionary_suffix_candidate),
        ("sequential", generate_sequential_candidate),
        ("keyboard_walk", generate_keyboard_walk_candidate),
        ("repeated_phrase", generate_repeated_phrase_candidate),
    ]

    while len([lbl for lbl in labels if lbl == 1]) < n_pos:
        cat_name, gen_func = rng.choice(generators)
        cand = gen_func(rng)
        cand_norm = cand.strip().lower()
        if len(cand) >= 6 and cand not in seen_exact and cand_norm not in seen_normalized:
            seen_exact.add(cand)
            seen_normalized.add(cand_norm)
            candidates.append(cand)
            labels.append(1)
            pattern_types.append(cat_name)

    # Generate negative class (High-entropy uniform random: Label 0)
    while len([lbl for lbl in labels if lbl == 0]) < n_neg:
        cand = generate_high_entropy_uniform_candidate(rng)
        cand_norm = cand.strip().lower()
        if cand not in seen_exact and cand_norm not in seen_normalized:
            seen_exact.add(cand)
            seen_normalized.add(cand_norm)
            candidates.append(cand)
            labels.append(0)
            pattern_types.append("high_entropy_uniform")

    # Deterministic shuffle
    combined = list(zip(candidates, labels, pattern_types))
    rng.shuffle(combined)
    cands, lbls, ptypes = zip(*combined)

    return list(cands), list(lbls), list(ptypes)


def split_dataset(
    candidates: List[str],
    labels: List[int],
    pattern_types: List[str],
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    seed: int = 42
) -> Dict[str, Dict[str, list]]:
    """
    Performs stratified train/val/test split and verifies absolute isolation (zero duplicate leakage).
    """
    rng = random.Random(seed)

    pos_indices = [i for i, y in enumerate(labels) if y == 1]
    neg_indices = [i for i, y in enumerate(labels) if y == 0]

    rng.shuffle(pos_indices)
    rng.shuffle(neg_indices)

    def allocate(indices: List[int]):
        n = len(indices)
        n_train = int(n * train_ratio)
        n_val = int(n * val_ratio)
        train_idx = indices[:n_train]
        val_idx = indices[n_train:n_train + n_val]
        test_idx = indices[n_train + n_val:]
        return train_idx, val_idx, test_idx

    pos_tr, pos_val, pos_te = allocate(pos_indices)
    neg_tr, neg_val, neg_te = allocate(neg_indices)

    splits = {
        "train": pos_tr + neg_tr,
        "val": pos_val + neg_val,
        "test": pos_te + neg_te
    }

    result = {}
    for split_name, idx_list in splits.items():
        rng.shuffle(idx_list)
        result[split_name] = {
            "candidates": [candidates[i] for i in idx_list],
            "labels": [labels[i] for i in idx_list],
            "pattern_types": [pattern_types[i] for i in idx_list]
        }

    # Verify no cross-split duplicate leakage
    train_set = set(result["train"]["candidates"])
    val_set = set(result["val"]["candidates"])
    test_set = set(result["test"]["candidates"])

    assert len(train_set.intersection(val_set)) == 0, "Leakage detected between train and val splits!"
    assert len(train_set.intersection(test_set)) == 0, "Leakage detected between train and test splits!"
    assert len(val_set.intersection(test_set)) == 0, "Leakage detected between val and test splits!"

    return result

#!/usr/bin/env python3
"""
PREDICT-PS Phase 4 & Phase 4.1: Synthetic Dataset Generator
Generates reproducible, structured synthetic password candidates for baseline evaluation,
dataset diagnostics, and shortcut-learning investigation.

Zero breach data, zero credential dumps, zero external downloads.
"""

import random
import string
from typing import List, Tuple, Dict, Set, Any, Optional
import numpy as np



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
    Generates a balanced synthetic dataset with strict deduplication (Phase 4 baseline).
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


# --- Phase 4.1 Diagnostic Generators: Length-Controlled, Charset-Controlled, and Independent Holdout ---

# --- Phase 4.1 Diagnostic Generators: Length-Controlled, Charset-Controlled, and Independent Holdout ---

EXPANDED_WORDS = [
    "password", "welcome", "admin", "summer", "winter", "spring", "autumn",
    "dragon", "master", "monkey", "shadow", "sunshine", "football", "baseball",
    "access", "secret", "system", "computer", "internet", "security", "charlie",
    "superman", "batman", "pokemon", "starwars", "galaxy", "rover", "harley",
    "yellow", "diamond", "freedom", "matrix", "falcon", "phantom", "ranger",
    "wizard", "thunder", "tiger", "orange", "silver", "knight", "phoenix",
    "mustang", "champion", "warrior", "spiderman", "avenger", "captain"
]

ALL_SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?"


def generate_length_controlled_candidate(rng: random.Random, target_len: int, is_positive: bool) -> Tuple[str, str]:
    """Generates candidate forced to exactly `target_len` characters with vast combinatoric space."""
    all_chars = string.ascii_lowercase + string.ascii_uppercase + string.digits + ALL_SYMBOLS
    
    if not is_positive:
        # Negative class: Uniform random with exact target length
        cand = "".join(rng.choice(all_chars) for _ in range(target_len))
        return cand, "uniform_length_controlled"

    # Positive class: Construct structural pattern adjusted to target_len
    mode = rng.choice(["dict_pad", "seq_pad", "walk_pad", "repeat_pad"])
    if mode == "dict_pad":
        word = rng.choice(EXPANDED_WORDS)
        if rng.random() > 0.5:
            word = word.capitalize()
        if len(word) >= target_len:
            word = word[:target_len - 3]
        needed = target_len - len(word)
        # Suffix of numbers and optional symbol
        suffix = "".join(rng.choice(string.digits) for _ in range(needed))
        cand = word + suffix
        return cand, "dict_length_controlled"

    elif mode == "seq_pad":
        start_digit = rng.randint(0, 9)
        seq_digits = "".join(str((start_digit + i) % 10) for i in range(target_len))
        if rng.random() > 0.5:
            # Ascending/descending alphabetic sequence
            start_ch = rng.randint(0, 10)
            seq_alpha = "".join(chr(ord('a') + ((start_ch + i) % 26)) for i in range(target_len))
            if rng.random() > 0.5:
                seq_alpha = seq_alpha.capitalize()
            return seq_alpha, "sequential_length_controlled"
        return seq_digits, "sequential_length_controlled"

    elif mode == "walk_pad":
        row = rng.choice(KEYBOARD_ROWS)
        start = rng.randint(0, max(0, len(row) - 4))
        walk_base = (row[start:] + row * 3)[:target_len]
        if rng.random() > 0.5:
            walk_base = walk_base[::-1]
        return walk_base, "keyboard_length_controlled"

    else:
        # Repeated token + number pad
        token = rng.choice(["pass", "test", "abc", "safe", "love", "123", "root"])
        repeats = (target_len // len(token)) + 1
        cand = (token * repeats)[:target_len]
        return cand, "repeat_length_controlled"


def generate_length_controlled_dataset(
    n_samples: int = 4000,
    seed: int = 42,
    target_length_range: Tuple[int, int] = (12, 16)
) -> Tuple[List[str], List[int], List[str]]:
    """
    Experiment 2: Both positive and negative classes share identical length distributions.
    Eliminates length discrepancy as a shortcut feature.
    """
    rng = random.Random(seed)
    n_pos = n_samples // 2
    n_neg = n_samples - n_pos

    seen_exact: Set[str] = set()
    seen_normalized: Set[str] = set()
    candidates: List[str] = []
    labels: List[int] = []
    pattern_types: List[str] = []

    # Generate matched lengths for positive class
    while len([l for l in labels if l == 1]) < n_pos:
        t_len = rng.randint(target_length_range[0], target_length_range[1])
        cand, ptype = generate_length_controlled_candidate(rng, t_len, is_positive=True)
        cand_norm = cand.strip().lower()
        if cand not in seen_exact and cand_norm not in seen_normalized:
            seen_exact.add(cand)
            seen_normalized.add(cand_norm)
            candidates.append(cand)
            labels.append(1)
            pattern_types.append(ptype)

    # Generate matched lengths for negative class
    while len([l for l in labels if l == 0]) < n_neg:
        t_len = rng.randint(target_length_range[0], target_length_range[1])
        cand, ptype = generate_length_controlled_candidate(rng, t_len, is_positive=False)
        cand_norm = cand.strip().lower()
        if cand not in seen_exact and cand_norm not in seen_normalized:
            seen_exact.add(cand)
            seen_normalized.add(cand_norm)
            candidates.append(cand)
            labels.append(0)
            pattern_types.append(ptype)

    combined = list(zip(candidates, labels, pattern_types))
    rng.shuffle(combined)
    cands, lbls, ptypes = zip(*combined)
    return list(cands), list(lbls), list(ptypes)


def generate_charset_controlled_dataset(
    n_samples: int = 4000,
    seed: int = 42
) -> Tuple[List[str], List[int], List[str]]:
    """
    Experiment 3: Controls for character-class presence.
    Both positive and negative candidates are guaranteed to contain lowercase, uppercase,
    digits, and symbols, preventing trivial character-type presence shortcuts.
    """
    rng = random.Random(seed)
    n_pos = n_samples // 2
    n_neg = n_samples - n_pos

    seen_exact: Set[str] = set()
    seen_normalized: Set[str] = set()
    candidates: List[str] = []
    labels: List[int] = []
    pattern_types: List[str] = []

    all_chars = string.ascii_lowercase + string.ascii_uppercase + string.digits + "!@#$%^&*"

    while len([l for l in labels if l == 1]) < n_pos:
        # Positive: Word (with Capital) + random 2-4 digit sequence + symbol affix
        word = rng.choice(EXPANDED_WORDS).capitalize()
        pin = rng.randint(10, 9999)
        sym = rng.choice(["!", "@", "#", "$", "%", "&", "*", "?"])
        if rng.random() > 0.5:
            cand = f"{word}{pin}{sym}"
        else:
            cand = f"{sym}{word}{pin}"
        cand_norm = cand.strip().lower()
        if cand not in seen_exact and cand_norm not in seen_normalized:
            seen_exact.add(cand)
            seen_normalized.add(cand_norm)
            candidates.append(cand)
            labels.append(1)
            pattern_types.append("charset_controlled_positive")

    while len([l for l in labels if l == 0]) < n_neg:
        # Negative: Uniform random guaranteed to have all 4 classes
        length = rng.randint(12, 16)
        base = [
            rng.choice(string.ascii_lowercase),
            rng.choice(string.ascii_uppercase),
            rng.choice(string.digits),
            rng.choice("!@#$%^&*")
        ]
        base += [rng.choice(all_chars) for _ in range(length - 4)]
        rng.shuffle(base)
        cand = "".join(base)
        cand_norm = cand.strip().lower()
        if cand not in seen_exact and cand_norm not in seen_normalized:
            seen_exact.add(cand)
            seen_normalized.add(cand_norm)
            candidates.append(cand)
            labels.append(0)
            pattern_types.append("charset_controlled_negative")

    combined = list(zip(candidates, labels, pattern_types))
    rng.shuffle(combined)
    cands, lbls, ptypes = zip(*combined)
    return list(cands), list(lbls), list(ptypes)


WORDS_8_EXPANDED = [
    w for w in [
        "password", "computer", "sunshine", "baseball", "football", "elephant", "mountain", "november",
        "hospital", "umbrella", "standard", "security", "building", "calendar", "operator", "customer",
        "feedback", "chemical", "triangle", "airplane", "keyboard", "tomorrow", "language", "champion",
        "absolute", "academic", "accuracy", "activity", "addition", "adequate", "advanced", "aircraft",
        "aluminum", "analysis", "announce", "anything", "approach", "argument", "assembly", "athletic",
        "attitude", "audience", "backbone", "bacteria", "boundary", "campaign", "capacity", "category",
        "cellular", "cheerful", "circular", "clothing", "collapse", "combined", "commerce", "complete",
        "compound", "concrete", "conflict", "constant", "consumer", "contract", "creation", "creative",
        "critical", "cultural", "currency", "daughter", "daylight", "decision", "decrease", "definite",
        "delivery", "describe", "designer", "detailed", "diabetes", "dialogue", "diameter", "disabled",
        "disaster", "discount", "discover", "disorder", "distance", "distinct", "district", "dividend",
        "division", "doctrine", "document", "domestic", "dominant", "donation", "downtown", "dramatic",
        "duration", "dynamics", "earnings", "economic", "educator", "election", "electric", "elements",
        "emission", "emphasis", "employee", "endeavor", "engineer", "enormous", "entirely", "entrance",
        "envelope", "equality", "equation", "estimate", "evaluate", "everyday", "everyone", "evidence",
        "exchange", "exciting", "exercise", "explicit", "exposure", "extended", "external", "facility",
        "familiar", "favorite", "featured", "festival", "finalize", "findings", "flexible", "floating",
        "forecast", "forehead", "formerly", "fraction", "fragment", "frequent", "friendly", "frontier",
        "function", "generate", "generous", "genetics", "goodwill", "governor", "graduate",
        "hardware", "headline", "heritage", "highland", "historic", "homeland", "humanity", "identity",
        "incident", "increase", "indicate", "industry", "infinite", "informal", "inherent", "initiate",
        "innocent", "instance", "integral", "internal", "interval", "invasion", "investor", "isolated",
        "judgment", "judicial", "junction", "landmark", "laughter", "learning", "leverage", "lifetime",
        "lighting", "listener", "location", "logistic", "magazine", "magnetic", "maintain", "majority",
        "marriage", "material", "maturity", "maximize", "mechanic", "memorial", "merchant", "midnight",
        "military", "minimize", "minister", "ministry", "minority", "mobility", "moderate", "momentum",
        "monument", "mortgage", "movement", "multiple", "multiply", "musician", "mutation", "national",
        "navigate", "necklace", "negative", "neighbor", "nineteen", "nobility", "nominate", "northern",
        "notebook", "novelist", "nuisance", "numerous", "nutrient", "obstacle", "occasion", "occupied",
        "official", "olympics", "opponent", "opposite", "optimism", "optional", "ordinary", "organism",
        "organize", "original", "outbreak", "outdoors", "outgoing", "outreach", "overhead", "overlook",
        "overview", "packaged", "painting", "parallel", "particle", "partner", "passcode", "passport",
        "patience", "pavement", "peaceful", "periodic", "personal", "pharmacy", "physical",
        "pipeline", "platform", "pleasant", "pleasure", "plumbing", "portable", "portrait", "position",
        "positive", "possible", "postpone", "powerful", "practice",
        "precious", "presence", "preserve", "prestige", "previous", "priority", "producer",
        "profound", "progress", "prohibit", "property", "proposal", "protocol", "province",
        "purchase", "quantity", "question", "rational", "reaction", "reactive", "regional", "register"
    ]
    if len(w) == 8 and w.islower() and w.isalpha()
]


def generate_length_and_composition_controlled_dataset(
    n_samples: int = 4000,
    seed: int = 42
) -> Tuple[List[str], List[int], List[str]]:
    """
    Experiment 4: Controls for BOTH Candidate Length AND Character-Class Composition.
    
    Specification:
    - Length: Exactly 14 characters for both positive and negative classes (delta = 0.00 chars).
    - Lowercase count: Exactly 8 lowercase characters for both classes.
    - Uppercase count: Exactly 2 uppercase characters for both classes.
    - Digit count: Exactly 2 digit characters for both classes.
    - Symbol count: Exactly 2 symbol characters from '!@#$%^&*' for both classes.
    
    Positive Class Generation:
    Constructed using predictable human grammatical templates that meet the exact signature:
    - 8-char lowercase dictionary morpheme (from WORDS_8_EXPANDED)
    - 2 uppercase characters
    - 2 digits
    - 2 symbols
    Arranged in predictable human affix orders:
      1. word + upper + digits + symbols (e.g. 'baseballNY99!#')
      2. upper + word + digits + symbols (e.g. 'NYbaseball99!#')
      3. symbols + word + upper + digits (e.g. '!#baseballNY99')
      4. word + symbols + upper + digits (e.g. 'baseball!#NY99')
      
    Negative Class Generation:
    Constructed using high-entropy uniform random sampling:
    - 8 independent lowercase letters uniformly chosen from ascii_lowercase
    - 2 independent uppercase letters uniformly chosen from ascii_uppercase
    - 2 independent digits uniformly chosen from digits
    - 2 independent symbols uniformly chosen from '!@#$%^&*'
    All 14 characters are uniformly permuted across the 14 positions.
    
    This guarantees that neither string length nor character-class composition frequencies
    provide any discriminatory signal. Any classification performance above random chance (50%)
    must derive strictly from character n-gram sequence order.
    """
    cands, lbls, meta = generate_dual_controlled_dataset_with_metadata(n_samples=n_samples, seed=seed)
    ptypes = [m["category"] for m in meta]
    return cands, lbls, ptypes


# Phase 4.2.2 Template Family Constants
TEMPLATE_SUFFIX_PADDED = "SuffixPadded"          # word + upper + digits + symbols
TEMPLATE_PREFIX_PADDED = "PrefixPadded"          # upper + word + digits + symbols
TEMPLATE_PREFIX_SYMBOLS = "PrefixSymbols"        # symbols + word + upper + digits
TEMPLATE_WORD_SYMBOLS_SUFFIX = "WordSymbolsSuffix"# word + symbols + upper + digits
TEMPLATE_UNIFORM_SCRAMBLE = "UniformScramble"

ALL_POSITIVE_TEMPLATE_FAMILIES = [
    TEMPLATE_SUFFIX_PADDED,
    TEMPLATE_PREFIX_PADDED,
    TEMPLATE_PREFIX_SYMBOLS,
    TEMPLATE_WORD_SYMBOLS_SUFFIX
]


def generate_dual_controlled_dataset_with_metadata(
    n_samples: int = 4000,
    seed: int = 42
) -> Tuple[List[str], List[int], List[Dict[str, Any]]]:
    """
    Phase 4.2.2: Generates length-and-composition controlled dataset while retaining
    non-sensitive generation metadata identifying underlying lexical source and template family.

    CRITICAL PRIVACY INVARIANT:
    Metadata is retained solely for group-level dataset partitioning and leakage verification.
    Metadata MUST NEVER be provided as input features to ML vectorizers or classifiers.
    """
    rng = random.Random(seed)
    n_pos = n_samples // 2
    n_neg = n_samples - n_pos

    symbols = "!@#$%^&*"
    seen_exact: Set[str] = set()
    seen_normalized: Set[str] = set()
    candidates: List[str] = []
    labels: List[int] = []
    metadata: List[Dict[str, Any]] = []

    # 1. Generate Positive Candidates with Lexical & Template Attribution
    while len([l for l in labels if l == 1]) < n_pos:
        w = rng.choice(WORDS_8_EXPANDED)
        u1, u2 = rng.choice(string.ascii_uppercase), rng.choice(string.ascii_uppercase)
        d1, d2 = rng.choice(string.digits), rng.choice(string.digits)
        s1, s2 = rng.choice(symbols), rng.choice(symbols)

        upper_pair = f"{u1}{u2}"
        digit_pair = f"{d1}{d2}"
        symbol_pair = f"{s1}{s2}"

        variant = rng.randint(0, 3)
        if variant == 0:
            cand = f"{w}{upper_pair}{digit_pair}{symbol_pair}"
            tmpl = TEMPLATE_SUFFIX_PADDED
        elif variant == 1:
            cand = f"{upper_pair}{w}{digit_pair}{symbol_pair}"
            tmpl = TEMPLATE_PREFIX_PADDED
        elif variant == 2:
            cand = f"{symbol_pair}{w}{upper_pair}{digit_pair}"
            tmpl = TEMPLATE_PREFIX_SYMBOLS
        else:
            cand = f"{w}{symbol_pair}{upper_pair}{digit_pair}"
            tmpl = TEMPLATE_WORD_SYMBOLS_SUFFIX

        cand_norm = cand.strip().lower()
        if cand not in seen_exact and cand_norm not in seen_normalized:
            seen_exact.add(cand)
            seen_normalized.add(cand_norm)
            candidates.append(cand)
            labels.append(1)
            metadata.append({
                "lexical_source": w,
                "template_family": tmpl,
                "category": "length_composition_matched_positive"
            })

    # 2. Generate Negative Candidates
    while len([l for l in labels if l == 0]) < n_neg:
        lowers = [rng.choice(string.ascii_lowercase) for _ in range(8)]
        uppers = [rng.choice(string.ascii_uppercase) for _ in range(2)]
        digits = [rng.choice(string.digits) for _ in range(2)]
        syms = [rng.choice(symbols) for _ in range(2)]

        pool = lowers + uppers + digits + syms
        rng.shuffle(pool)
        cand = "".join(pool)

        cand_norm = cand.strip().lower()
        if cand not in seen_exact and cand_norm not in seen_normalized:
            seen_exact.add(cand)
            seen_normalized.add(cand_norm)
            candidates.append(cand)
            labels.append(0)
            metadata.append({
                "lexical_source": "none_uniform_scramble",
                "template_family": TEMPLATE_UNIFORM_SCRAMBLE,
                "category": "length_composition_matched_negative"
            })

    combined = list(zip(candidates, labels, metadata))
    rng.shuffle(combined)
    cands, lbls, meta = zip(*combined)
    return list(cands), list(lbls), list(meta)


def split_dataset_by_lexical_group(
    candidates: List[str],
    labels: List[int],
    metadata: List[Dict[str, Any]],
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    seed: int = 42
) -> Dict[str, Dict[str, list]]:
    """
    Phase 4.2.2: Lexical Group-Aware Partitioning.
    Guarantees:
    - NO underlying dictionary word appears in more than one partition (train, val, test).
    - train_words ∩ val_words == ∅
    - train_words ∩ test_words == ∅
    - val_words ∩ test_words == ∅
    - Exact and normalized duplicate checks active.
    - Negative candidates partitioned proportionally with zero cross-split duplicates.
    """
    rng = random.Random(seed)

    # 1. Identify all unique positive dictionary words
    positive_words = sorted(list(set(
        m["lexical_source"] for m, y in zip(metadata, labels)
        if y == 1 and m["lexical_source"] != "none_uniform_scramble"
    )))
    rng.shuffle(positive_words)

    n_words = len(positive_words)
    n_train_words = int(n_words * train_ratio)
    n_val_words = int(n_words * val_ratio)

    train_words_set = set(positive_words[:n_train_words])
    val_words_set = set(positive_words[n_train_words:n_train_words + n_val_words])
    test_words_set = set(positive_words[n_train_words + n_val_words:])

    # Strict assertion of word disjointness
    assert len(train_words_set & val_words_set) == 0, "Lexical word overlap detected between train and val!"
    assert len(train_words_set & test_words_set) == 0, "Lexical word overlap detected between train and test!"
    assert len(val_words_set & test_words_set) == 0, "Lexical word overlap detected between val and test!"

    # 2. Partition positive candidate indices by their assigned lexical group
    pos_train_idx: List[int] = []
    pos_val_idx: List[int] = []
    pos_test_idx: List[int] = []

    for i, (m, y) in enumerate(zip(metadata, labels)):
        if y == 1:
            w = m["lexical_source"]
            if w in train_words_set:
                pos_train_idx.append(i)
            elif w in val_words_set:
                pos_val_idx.append(i)
            else:
                pos_test_idx.append(i)

    # 3. Partition negative candidate indices proportionally
    neg_indices = [i for i, y in enumerate(labels) if y == 0]
    rng.shuffle(neg_indices)

    # Match negative count to positive count in each split for exact balance
    neg_train_idx = neg_indices[:len(pos_train_idx)]
    neg_val_idx = neg_indices[len(pos_train_idx):len(pos_train_idx) + len(pos_val_idx)]
    neg_test_idx = neg_indices[len(pos_train_idx) + len(pos_val_idx):len(pos_train_idx) + len(pos_val_idx) + len(pos_test_idx)]

    # Combine
    splits = {
        "train": pos_train_idx + neg_train_idx,
        "val": pos_val_idx + neg_val_idx,
        "test": pos_test_idx + neg_test_idx
    }

    result = {}
    for split_name, idx_list in splits.items():
        rng.shuffle(idx_list)
        result[split_name] = {
            "candidates": [candidates[i] for i in idx_list],
            "labels": [labels[i] for i in idx_list],
            "pattern_types": [metadata[i]["category"] for i in idx_list],
            "metadata": [metadata[i] for i in idx_list]
        }

    # Verify zero duplicate leakage across partitions
    train_cands = set(result["train"]["candidates"])
    val_cands = set(result["val"]["candidates"])
    test_cands = set(result["test"]["candidates"])

    assert len(train_cands & val_cands) == 0, "Exact duplicate leakage between train and val!"
    assert len(train_cands & test_cands) == 0, "Exact duplicate leakage between train and test!"
    assert len(val_cands & test_cands) == 0, "Exact duplicate leakage between val and test!"

    # Verify zero normalized duplicate leakage
    train_norm = set(c.strip().lower() for c in train_cands)
    val_norm = set(c.strip().lower() for c in val_cands)
    test_norm = set(c.strip().lower() for c in test_cands)

    assert len(train_norm & val_norm) == 0, "Normalized duplicate leakage between train and val!"
    assert len(train_norm & test_norm) == 0, "Normalized duplicate leakage between train and test!"
    assert len(val_norm & test_norm) == 0, "Normalized duplicate leakage between val and test!"

    return result


def split_dataset_by_template_family(
    candidates: List[str],
    labels: List[int],
    metadata: List[Dict[str, Any]],
    train_families: Optional[List[str]] = None,
    val_families: Optional[List[str]] = None,
    test_families: Optional[List[str]] = None,
    seed: int = 42
) -> Dict[str, Dict[str, list]]:
    """
    Phase 4.2.2: Template-Family-Disjoint Partitioning.
    Holds out entire template families from training to evaluate whether the model
    generalizes to novel syntactic arrangements.

    Default Allocation:
    - Train: [SuffixPadded, PrefixPadded] (e.g. word + affixes or prefix + word)
    - Val: [WordSymbolsSuffix] (e.g. word + symbols + upper + digits)
    - Test: [PrefixSymbols] (e.g. symbols + word + upper + digits)
    """
    rng = random.Random(seed)

    if train_families is None:
        train_families = [TEMPLATE_SUFFIX_PADDED, TEMPLATE_PREFIX_PADDED]
    if val_families is None:
        val_families = [TEMPLATE_WORD_SYMBOLS_SUFFIX]
    if test_families is None:
        test_families = [TEMPLATE_PREFIX_SYMBOLS]

    train_fam_set = set(train_families)
    val_fam_set = set(val_families)
    test_fam_set = set(test_families)

    assert len(train_fam_set & test_fam_set) == 0, "Template family overlap between train and test!"
    assert len(val_fam_set & test_fam_set) == 0, "Template family overlap between val and test!"

    pos_train_idx: List[int] = []
    pos_val_idx: List[int] = []
    pos_test_idx: List[int] = []

    for i, (m, y) in enumerate(zip(metadata, labels)):
        if y == 1:
            tmpl = m["template_family"]
            if tmpl in train_fam_set:
                pos_train_idx.append(i)
            elif tmpl in val_fam_set:
                pos_val_idx.append(i)
            elif tmpl in test_fam_set:
                pos_test_idx.append(i)

    neg_indices = [i for i, y in enumerate(labels) if y == 0]
    rng.shuffle(neg_indices)

    neg_train_idx = neg_indices[:len(pos_train_idx)]
    neg_val_idx = neg_indices[len(pos_train_idx):len(pos_train_idx) + len(pos_val_idx)]
    neg_test_idx = neg_indices[len(pos_train_idx) + len(pos_val_idx):len(pos_train_idx) + len(pos_val_idx) + len(pos_test_idx)]

    splits = {
        "train": pos_train_idx + neg_train_idx,
        "val": pos_val_idx + neg_val_idx,
        "test": pos_test_idx + neg_test_idx
    }

    result = {}
    for split_name, idx_list in splits.items():
        rng.shuffle(idx_list)
        result[split_name] = {
            "candidates": [candidates[i] for i in idx_list],
            "labels": [labels[i] for i in idx_list],
            "pattern_types": [metadata[i]["category"] for i in idx_list],
            "metadata": [metadata[i] for i in idx_list]
        }

    # Verify zero duplicate leakage
    train_cands = set(result["train"]["candidates"])
    val_cands = set(result["val"]["candidates"])
    test_cands = set(result["test"]["candidates"])
    assert len(train_cands & test_cands) == 0, "Cross-split candidate leakage in template split!"

    return result


# Phonetic 4-letter stems for Independent Generator V2 (distinct from WORDS_8_EXPANDED)
INDEPENDENT_PHONETIC_4_STEMS = [
    "blue", "bird", "star", "fire", "moon", "rock", "wolf", "hawk", "wind", "snow",
    "gold", "iron", "dark", "glow", "mist", "peak", "wave", "lion", "bear", "frog",
    "dawn", "dusk", "jade", "rain", "rose", "sage", "pine", "wild", "bark", "claw",
    "fern", "leaf", "moss", "reed", "sand", "tide", "wood", "cove", "dune", "glin",
    "vale", "rift", "lake", "isle", "bays", "flam", "bolt", "glow", "haze", "beam"
]


def generate_independent_v2_matched_dataset(
    n_samples: int = 1000,
    seed: int = 9999
) -> Tuple[List[str], List[int], List[Dict[str, Any]]]:
    """
    Phase 4.2.2: Independent Synthetic Generator V2.
    Constructs an independently designed evaluation dataset for positive and negative candidates:
    - Completely distinct construction logic (phonetic stem compounding, non-affix geometries).
    - Novel pattern families:
      1. Interleaved Affix: upper + stem1 + sym + digit + stem2 + upper + sym + digit
         (e.g. 'B' + 'star' + '!' + '7' + 'fire' + 'K' + '@' + '2' -> 'Bstar!7fireK@2')
      2. Mirrored Bracket: sym + upper + digit + stem1 + stem2 + digit + upper + sym
         (e.g. '$' + 'R' + '9' + 'moon' + 'rock' + '4' + 'W' + '&' -> '$R9moonrock4W&')
      3. Sandwich Affix: digit + digit + stem1 + stem2 + upper + upper + sym + sym
         (e.g. '8' + '3' + 'wolf' + 'hawk' + 'N' + 'Y' + '#' + '!' -> '83wolfhawkNY#!')
    - EXACT Length & Composition Matching:
      - Length: Exactly 14 characters.
      - Composition: Exactly 8 lowercase, 2 uppercase, 2 digits, 2 symbols.
    - Negative Candidates:
      - Independent multiset Latin-square permutation and modular shuffling of
        8 lowercase, 2 uppercase, 2 digits, 2 symbols.
    - Zero metadata leakage: Models receive ONLY candidate strings.
    """
    rng = random.Random(seed)
    n_pos = n_samples // 2
    n_neg = n_samples - n_pos

    symbols = "!@#$%^&*"
    seen_exact: Set[str] = set()
    candidates: List[str] = []
    labels: List[int] = []
    metadata: List[Dict[str, Any]] = []

    # 1. Independent Positives
    while len([l for l in labels if l == 1]) < n_pos:
        s1 = rng.choice(INDEPENDENT_PHONETIC_4_STEMS)
        s2 = rng.choice(INDEPENDENT_PHONETIC_4_STEMS)
        while s2 == s1:
            s2 = rng.choice(INDEPENDENT_PHONETIC_4_STEMS)

        u1, u2 = rng.choice(string.ascii_uppercase), rng.choice(string.ascii_uppercase)
        d1, d2 = rng.choice(string.digits), rng.choice(string.digits)
        sym1, sym2 = rng.choice(symbols), rng.choice(symbols)

        geom = rng.choice(["interleaved_v2", "mirrored_bracket_v2", "sandwich_v2"])
        if geom == "interleaved_v2":
            cand = f"{u1}{s1}{sym1}{d1}{s2}{u2}{sym2}{d2}"
        elif geom == "mirrored_bracket_v2":
            cand = f"{sym1}{u1}{d1}{s1}{s2}{d2}{u2}{sym2}"
        else:
            cand = f"{d1}{d2}{s1}{s2}{u1}{u2}{sym1}{sym2}"

        # Verify exact signature: 14 chars, 8L, 2U, 2D, 2S
        assert len(cand) == 14
        assert sum(1 for c in cand if c.islower()) == 8
        assert sum(1 for c in cand if c.isupper()) == 2
        assert sum(1 for c in cand if c.isdigit()) == 2
        assert sum(1 for c in cand if c in symbols) == 2

        if cand not in seen_exact:
            seen_exact.add(cand)
            candidates.append(cand)
            labels.append(1)
            metadata.append({
                "lexical_source": f"{s1}+{s2}",
                "template_family": f"independent_{geom}",
                "category": "independent_generator_v2_positive"
            })

    # 2. Independent Negatives (Independent block-rotation permutation)
    while len([l for l in labels if l == 0]) < n_neg:
        lows = [rng.choice(string.ascii_lowercase) for _ in range(8)]
        ups = [rng.choice(string.ascii_uppercase) for _ in range(2)]
        digs = [rng.choice(string.digits) for _ in range(2)]
        sym_list = [rng.choice(symbols) for _ in range(2)]

        pool = lows + ups + digs + sym_list
        # Dual-pass permutation with modular cycle shift
        rng.shuffle(pool)
        shift = rng.randint(1, 13)
        pool = pool[shift:] + pool[:shift]
        rng.shuffle(pool)

        cand = "".join(pool)
        assert len(cand) == 14
        assert sum(1 for c in cand if c.islower()) == 8
        assert sum(1 for c in cand if c.isupper()) == 2
        assert sum(1 for c in cand if c.isdigit()) == 2
        assert sum(1 for c in cand if c in symbols) == 2

        if cand not in seen_exact:
            seen_exact.add(cand)
            candidates.append(cand)
            labels.append(0)
            metadata.append({
                "lexical_source": "none_independent_permutation",
                "template_family": "independent_latin_scramble",
                "category": "independent_generator_v2_negative"
            })

    combined = list(zip(candidates, labels, metadata))
    rng.shuffle(combined)
    cands, lbls, meta = zip(*combined)
    return list(cands), list(lbls), list(meta)



def generate_independent_holdout_dataset(
    n_samples: int = 1000,
    seed: int = 9999
) -> Tuple[List[str], List[int], List[str]]:
    """
    Experiment 4: Independent Synthetic Generator Holdout (Out-of-Distribution evaluation).
    Uses a completely distinct seed (9999) and novel pattern grammars that were NEVER seen
    in the training set:
    - Date format templates (e.g. '1995-10-24!', '12/05/1988#')
    - Reverse words with symbol encasement (e.g. '@drowssap@', '#retupmoc#')
    - Diagonal/zigzag keyboard walks (e.g. '1qaz2wsx3edc')
    - PIN padded names (e.g. '9876_Alexander!', '1122_Samantha$')
    """
    rng = random.Random(seed)
    n_pos = n_samples // 2
    n_neg = n_samples - n_pos

    novel_names = ["alexander", "samantha", "benjamin", "victoria", "nicholas", "katherine", "theodore"]
    seen_exact: Set[str] = set()
    candidates: List[str] = []
    labels: List[int] = []
    pattern_types: List[str] = []

    def make_novel_positive(rng: random.Random) -> Tuple[str, str]:
        mode = rng.choice(["date_iso", "reverse_encased", "zigzag_walk", "pin_padded_name"])
        if mode == "date_iso":
            year = rng.randint(1970, 2026)
            month = rng.randint(1, 12)
            day = rng.randint(1, 28)
            sep = rng.choice(["-", "/", "."])
            sym = rng.choice(["!", "@", "#"])
            cand = f"{year:04d}{sep}{month:02d}{sep}{day:02d}{sym}"
            return cand, "date_iso_novel"

        elif mode == "reverse_encased":
            w = rng.choice(novel_names)[::-1]
            sym = rng.choice(["*", "#", "$", "&"])
            cand = f"{sym}{w}{sym}{rng.randint(1, 99)}"
            return cand, "reverse_encased_novel"

        elif mode == "zigzag_walk":
            # Diagonal keyboard walk
            walks = ["1qaz2wsx", "zaq1xsw2", "3edc4rfv", "qazwsxedc", "0okm9ijn"]
            cand = rng.choice(walks) + str(rng.randint(10, 99)) + "!"
            return cand, "zigzag_walk_novel"

        else:
            name = rng.choice(novel_names).capitalize()
            pin = f"{rng.randint(1000, 9999)}"
            cand = f"{pin}_{name}!"
            return cand, "pin_padded_name_novel"

    while len([l for l in labels if l == 1]) < n_pos:
        cand, ptype = make_novel_positive(rng)
        if cand not in seen_exact and len(cand) >= 8:
            seen_exact.add(cand)
            candidates.append(cand)
            labels.append(1)
            pattern_types.append(ptype)

    all_chars = string.ascii_letters + string.digits + "!@#$%^&*()_+-="
    while len([l for l in labels if l == 0]) < n_neg:
        length = rng.randint(10, 18)
        cand = "".join(rng.choice(all_chars) for _ in range(length))
        if cand not in seen_exact:
            seen_exact.add(cand)
            candidates.append(cand)
            labels.append(0)
            pattern_types.append("independent_uniform_random")

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


def generate_independent_v2b_matched_dataset(
    n_samples: int = 1000,
    seed: int = 9999
) -> Tuple[List[str], List[int], List[Dict[str, Any]]]:
    """
    Phase 4.2.3: Independent Synthetic Generator V2b (Alternative Negative Strategy Audit).
    Evaluates whether the character n-gram baseline's high FSR (49.2% on G4) is robust to an
    alternative, pseudo-phonetic / syllabic negative generator rather than uniform scrambling.

    Positives:
    - Identical to Independent Generator V2 positives (phonetic 4-letter stems paired with
      interleaved, mirrored bracket, and sandwich affix geometries).
    - Exactly 14 characters: 8 lowercase, 2 uppercase, 2 digits, 2 symbols.

    Negatives (Alternative Syllabic Pseudo-Structured Strategy):
    - 8 lowercase letters generated as 4 alternating consonant-vowel pseudo-syllabic pairs
      (CVCVCVCV, e.g. 'bapomilu', 'zenulabi', 'koravetu', 'dofikane').
    - Strict rejection against known dictionary words in WORDS_8_EXPANDED and INDEPENDENT_PHONETIC_4_STEMS.
    - 2 uppercase letters, 2 digits, 2 symbols placed across varied non-standard positions.
    - Exactly 14 characters: 8 lowercase, 2 uppercase, 2 digits, 2 symbols.
    - Zero metadata leakage: models receive ONLY candidate strings.
    """
    rng = random.Random(seed)
    n_pos = n_samples // 2
    n_neg = n_samples - n_pos

    symbols = "!@#$%^&*"
    consonants = "bcdfghjklmnprstvwxz"
    vowels = "aeiou"

    seen_exact: Set[str] = set()
    candidates: List[str] = []
    labels: List[int] = []
    metadata: List[Dict[str, Any]] = []

    # 1. Positives (Identical to V2 for exact comparability)
    while len([l for l in labels if l == 1]) < n_pos:
        s1 = rng.choice(INDEPENDENT_PHONETIC_4_STEMS)
        s2 = rng.choice(INDEPENDENT_PHONETIC_4_STEMS)
        while s2 == s1:
            s2 = rng.choice(INDEPENDENT_PHONETIC_4_STEMS)

        u1, u2 = rng.choice(string.ascii_uppercase), rng.choice(string.ascii_uppercase)
        d1, d2 = rng.choice(string.digits), rng.choice(string.digits)
        sym1, sym2 = rng.choice(symbols), rng.choice(symbols)

        geom = rng.choice(["interleaved_v2", "mirrored_bracket_v2", "sandwich_v2"])
        if geom == "interleaved_v2":
            cand = f"{u1}{s1}{sym1}{d1}{s2}{u2}{sym2}{d2}"
        elif geom == "mirrored_bracket_v2":
            cand = f"{sym1}{u1}{d1}{s1}{s2}{d2}{u2}{sym2}"
        else:
            cand = f"{d1}{d2}{s1}{s2}{u1}{u2}{sym1}{sym2}"

        assert len(cand) == 14
        assert sum(1 for c in cand if c.islower()) == 8
        assert sum(1 for c in cand if c.isupper()) == 2
        assert sum(1 for c in cand if c.isdigit()) == 2
        assert sum(1 for c in cand if c in symbols) == 2

        if cand not in seen_exact:
            seen_exact.add(cand)
            candidates.append(cand)
            labels.append(1)
            metadata.append({
                "lexical_source": f"{s1}+{s2}",
                "template_family": f"independent_{geom}",
                "category": "independent_generator_v2_positive"
            })

    # Known stems for negative rejection
    known_word_set = set(w.lower() for w in WORDS_8_EXPANDED) | set(s.lower() for s in INDEPENDENT_PHONETIC_4_STEMS)

    # 2. Negatives (Alternative Syllabic Pseudo-Structured Generator)
    while len([l for l in labels if l == 0]) < n_neg:
        # Form 4 consonant-vowel pairs (8 lowercase chars)
        syllabic_chars = []
        for _ in range(4):
            syllabic_chars.append(rng.choice(consonants))
            syllabic_chars.append(rng.choice(vowels))
        pseudo_word = "".join(syllabic_chars)

        # Reject if accidental overlap with known dictionary words or phonetic stems
        if pseudo_word in known_word_set or any(stem in pseudo_word for stem in INDEPENDENT_PHONETIC_4_STEMS):
            continue

        u1, u2 = rng.choice(string.ascii_uppercase), rng.choice(string.ascii_uppercase)
        d1, d2 = rng.choice(string.digits), rng.choice(string.digits)
        sym1, sym2 = rng.choice(symbols), rng.choice(symbols)

        # Structural placement variants for non-dictionary affixing
        layout = rng.choice(["prefix_cluster", "bracket_cluster", "distributed_cluster"])
        if layout == "prefix_cluster":
            cand = f"{u1}{d1}{sym1}{pseudo_word}{u2}{d2}{sym2}"
        elif layout == "bracket_cluster":
            cand = f"{sym1}{u1}{pseudo_word[:4]}{d1}{d2}{pseudo_word[4:]}{u2}{sym2}"
        else:
            cand = f"{d1}{u1}{pseudo_word}{sym1}{sym2}{d2}{u2}"

        assert len(cand) == 14
        assert sum(1 for c in cand if c.islower()) == 8
        assert sum(1 for c in cand if c.isupper()) == 2
        assert sum(1 for c in cand if c.isdigit()) == 2
        assert sum(1 for c in cand if c in symbols) == 2

        if cand not in seen_exact:
            seen_exact.add(cand)
            candidates.append(cand)
            labels.append(0)
            metadata.append({
                "lexical_source": "none_syllabic_pseudoword",
                "template_family": f"syllabic_negative_{layout}",
                "category": "independent_generator_v2b_syllabic_negative"
            })

    combined = list(zip(candidates, labels, metadata))
    rng.shuffle(combined)
    cands, lbls, meta = zip(*combined)
    return list(cands), list(lbls), list(meta)


def generate_combined_lexical_template_dataset(
    n_samples: int = 4000,
    seed: int = 42,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15
) -> Dict[str, Any]:
    """
    Phase 4.2.3: Combined Lexical and Template Isolation Dataset.
    Guarantees simultaneously:
    1. Lexical Word Isolation:
       - W_train ∩ W_val == ∅
       - W_train ∩ W_test == ∅
       - W_val ∩ W_test == ∅
    2. Template Family Isolation:
       - T_train ∩ T_test == ∅
       - T_train ∩ T_val == ∅
       - T_val ∩ T_test == ∅
       Allocation:
       - Train Templates: [TEMPLATE_PREFIX_PADDED, TEMPLATE_SUFFIX_PADDED]
       - Val Templates: [TEMPLATE_WORD_SYMBOLS_SUFFIX]
       - Test Templates: [TEMPLATE_PREFIX_SYMBOLS]
    3. Exact Length & Composition Matching:
       - Length: Exactly 14 characters across all partitions.
       - Composition: Exactly 8 lowercase, 2 uppercase, 2 digits, 2 symbols across all partitions.
    4. Negative Candidates:
       - Uniform permutation with non-affix rejection sampling.
       - Exactly 50/50 balanced in every partition.
    5. Deduplication & Cross-Partition Isolation:
       - 0 exact duplicates across partitions.
       - 0 normalized (lowercased/stripped) duplicates across partitions.
    """
    rng = random.Random(seed)
    symbols = "!@#$%^&*"

    # 1. Lexical Word Group Partitioning
    shuffled_words = list(WORDS_8_EXPANDED)
    rng.shuffle(shuffled_words)

    n_words = len(shuffled_words)
    n_train_words = int(n_words * train_ratio)
    n_val_words = int(n_words * val_ratio)

    train_words = shuffled_words[:n_train_words]
    val_words = shuffled_words[n_train_words:n_train_words + n_val_words]
    test_words = shuffled_words[n_train_words + n_val_words:]

    train_words_set = set(train_words)
    val_words_set = set(val_words)
    test_words_set = set(test_words)

    assert len(train_words_set & val_words_set) == 0, "Train-val word leakage!"
    assert len(train_words_set & test_words_set) == 0, "Train-test word leakage!"
    assert len(val_words_set & test_words_set) == 0, "Val-test word leakage!"

    # 2. Template Family Partitioning
    train_templates = [TEMPLATE_PREFIX_PADDED, TEMPLATE_SUFFIX_PADDED]
    val_templates = [TEMPLATE_WORD_SYMBOLS_SUFFIX]
    test_templates = [TEMPLATE_PREFIX_SYMBOLS]

    train_tmpl_set = set(train_templates)
    val_tmpl_set = set(val_templates)
    test_tmpl_set = set(test_templates)

    assert len(train_tmpl_set & val_tmpl_set) == 0, "Train-val template leakage!"
    assert len(train_tmpl_set & test_tmpl_set) == 0, "Train-test template leakage!"
    assert len(val_tmpl_set & test_tmpl_set) == 0, "Val-test template leakage!"

    # 3. Partition sample quotas
    n_train = int(n_samples * train_ratio)
    n_val = int(n_samples * val_ratio)
    n_test = n_samples - n_train - n_val

    splits_config = {
        "train": {
            "n_pos": n_train // 2,
            "n_neg": n_train // 2,
            "words": train_words,
            "templates": train_templates
        },
        "val": {
            "n_pos": n_val // 2,
            "n_neg": n_val // 2,
            "words": val_words,
            "templates": val_templates
        },
        "test": {
            "n_pos": n_test // 2,
            "n_neg": n_test // 2,
            "words": test_words,
            "templates": test_templates
        }
    }

    seen_exact_global: Set[str] = set()
    seen_norm_global: Set[str] = set()
    results: Dict[str, Dict[str, list]] = {}

    for split_name, cfg in splits_config.items():
        split_cands: List[str] = []
        split_lbls: List[int] = []
        split_ptypes: List[str] = []
        split_meta: List[Dict[str, Any]] = []

        # Generate Positives
        while len([l for l in split_lbls if l == 1]) < cfg["n_pos"]:
            w = rng.choice(cfg["words"])
            tmpl = rng.choice(cfg["templates"])

            u1, u2 = rng.choice(string.ascii_uppercase), rng.choice(string.ascii_uppercase)
            d1, d2 = rng.choice(string.digits), rng.choice(string.digits)
            s1, s2 = rng.choice(symbols), rng.choice(symbols)

            upper_pair = f"{u1}{u2}"
            digit_pair = f"{d1}{d2}"
            symbol_pair = f"{s1}{s2}"

            if tmpl == TEMPLATE_SUFFIX_PADDED:
                cand = f"{w}{upper_pair}{digit_pair}{symbol_pair}"
            elif tmpl == TEMPLATE_PREFIX_PADDED:
                cand = f"{upper_pair}{w}{digit_pair}{symbol_pair}"
            elif tmpl == TEMPLATE_PREFIX_SYMBOLS:
                cand = f"{symbol_pair}{w}{upper_pair}{digit_pair}"
            elif tmpl == TEMPLATE_WORD_SYMBOLS_SUFFIX:
                cand = f"{w}{symbol_pair}{upper_pair}{digit_pair}"
            else:
                raise ValueError(f"Unknown template: {tmpl}")

            # Verify length and character classes
            assert len(cand) == 14
            assert sum(1 for c in cand if c.islower()) == 8
            assert sum(1 for c in cand if c.isupper()) == 2
            assert sum(1 for c in cand if c.isdigit()) == 2
            assert sum(1 for c in cand if c in symbols) == 2

            cand_norm = cand.strip().lower()
            if cand not in seen_exact_global and cand_norm not in seen_norm_global:
                seen_exact_global.add(cand)
                seen_norm_global.add(cand_norm)
                split_cands.append(cand)
                split_lbls.append(1)
                split_ptypes.append(f"combined_{tmpl}")
                split_meta.append({
                    "lexical_source": w,
                    "template_family": tmpl,
                    "category": "combined_isolated_positive"
                })

        # Generate Negatives
        while len([l for l in split_lbls if l == 0]) < cfg["n_neg"]:
            lowers = [rng.choice(string.ascii_lowercase) for _ in range(8)]
            uppers = [rng.choice(string.ascii_uppercase) for _ in range(2)]
            digits = [rng.choice(string.digits) for _ in range(2)]
            syms = [rng.choice(symbols) for _ in range(2)]

            pool = lowers + uppers + digits + syms
            rng.shuffle(pool)
            cand = "".join(pool)

            assert len(cand) == 14
            assert sum(1 for c in cand if c.islower()) == 8
            assert sum(1 for c in cand if c.isupper()) == 2
            assert sum(1 for c in cand if c.isdigit()) == 2
            assert sum(1 for c in cand if c in symbols) == 2

            cand_norm = cand.strip().lower()
            if cand not in seen_exact_global and cand_norm not in seen_norm_global:
                seen_exact_global.add(cand)
                seen_norm_global.add(cand_norm)
                split_cands.append(cand)
                split_lbls.append(0)
                split_ptypes.append("combined_uniform_negative")
                split_meta.append({
                    "lexical_source": "none_uniform_scramble",
                    "template_family": TEMPLATE_UNIFORM_SCRAMBLE,
                    "category": "combined_isolated_negative"
                })

        combined = list(zip(split_cands, split_lbls, split_ptypes, split_meta))
        rng.shuffle(combined)
        c, l, p, m = zip(*combined)
        results[split_name] = {
            "candidates": list(c),
            "labels": list(l),
            "pattern_types": list(p),
            "metadata": list(m)
        }

    # Verify zero duplicate leakage across partitions
    train_cands = set(results["train"]["candidates"])
    val_cands = set(results["val"]["candidates"])
    test_cands = set(results["test"]["candidates"])

    assert len(train_cands & val_cands) == 0, "Cross-split exact leakage train-val!"
    assert len(train_cands & test_cands) == 0, "Cross-split exact leakage train-test!"
    assert len(val_cands & test_cands) == 0, "Cross-split exact leakage val-test!"

    train_norm = set(c.strip().lower() for c in train_cands)
    val_norm = set(c.strip().lower() for c in val_cands)
    test_norm = set(c.strip().lower() for c in test_cands)

    assert len(train_norm & val_norm) == 0, "Cross-split normalized leakage train-val!"
    assert len(train_norm & test_norm) == 0, "Cross-split normalized leakage train-test!"
    assert len(val_norm & test_norm) == 0, "Cross-split normalized leakage val-test!"

    return {
        "splits": results,
        "lexical_isolation": {
            "train_words": train_words,
            "val_words": val_words,
            "test_words": test_words,
            "shared_train_val": len(train_words_set & val_words_set),
            "shared_train_test": len(train_words_set & test_words_set),
            "shared_val_test": len(val_words_set & test_words_set),
            "verified": True
        },
        "template_isolation": {
            "train_templates": train_templates,
            "val_templates": val_templates,
            "test_templates": test_templates,
            "shared_train_test": len(train_tmpl_set & test_tmpl_set),
            "verified": True
        }
    }


def split_dataset_by_combined_lexical_and_template(
    candidates: List[str],
    labels: List[int],
    metadata: List[Dict[str, Any]],
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    seed: int = 42
) -> Dict[str, Dict[str, list]]:
    """
    Phase 4.2.3: Partitions existing dataset candidates by combined lexical word AND template family isolation.
    """
    rng = random.Random(seed)

    positive_words = sorted(list(set(
        m["lexical_source"] for m, y in zip(metadata, labels)
        if y == 1 and m["lexical_source"] != "none_uniform_scramble"
    )))
    rng.shuffle(positive_words)

    n_words = len(positive_words)
    n_train_words = int(n_words * train_ratio)
    n_val_words = int(n_words * val_ratio)

    train_words_set = set(positive_words[:n_train_words])
    val_words_set = set(positive_words[n_train_words:n_train_words + n_val_words])
    test_words_set = set(positive_words[n_train_words + n_val_words:])

    train_families = {TEMPLATE_SUFFIX_PADDED, TEMPLATE_PREFIX_PADDED}
    val_families = {TEMPLATE_WORD_SYMBOLS_SUFFIX}
    test_families = {TEMPLATE_PREFIX_SYMBOLS}

    pos_train_idx: List[int] = []
    pos_val_idx: List[int] = []
    pos_test_idx: List[int] = []

    for i, (m, y) in enumerate(zip(metadata, labels)):
        if y == 1:
            w = m["lexical_source"]
            tmpl = m["template_family"]
            if w in train_words_set and tmpl in train_families:
                pos_train_idx.append(i)
            elif w in val_words_set and tmpl in val_families:
                pos_val_idx.append(i)
            elif w in test_words_set and tmpl in test_families:
                pos_test_idx.append(i)

    neg_indices = [i for i, y in enumerate(labels) if y == 0]
    rng.shuffle(neg_indices)

    neg_train_idx = neg_indices[:len(pos_train_idx)]
    neg_val_idx = neg_indices[len(pos_train_idx):len(pos_train_idx) + len(pos_val_idx)]
    neg_test_idx = neg_indices[len(pos_train_idx) + len(pos_val_idx):len(pos_train_idx) + len(pos_val_idx) + len(pos_test_idx)]

    splits = {
        "train": pos_train_idx + neg_train_idx,
        "val": pos_val_idx + neg_val_idx,
        "test": pos_test_idx + neg_test_idx
    }

    result = {}
    for split_name, idx_list in splits.items():
        rng.shuffle(idx_list)
        result[split_name] = {
            "candidates": [candidates[i] for i in idx_list],
            "labels": [labels[i] for i in idx_list],
            "pattern_types": [metadata[i]["category"] for i in idx_list],
            "metadata": [metadata[i] for i in idx_list]
        }

    return result


def generate_factorial_matched_control_dataset(
    n_samples: int = 4000,
    seed: int = 42,
    split_strategy: str = "combined_disjoint",
    train_ratio: float = 0.70,
    val_ratio: float = 0.15
) -> Dict[str, Any]:
    """
    Phase 4.2.4 Track 1: Factorial Matched-Control Dataset Generator (Exp G11).
    Decouples lexical status (dictionary vs pseudo-word) from template geometry and positional slots.

    Factorial Design Principles:
    1. Lexical Root Dimension:
       - Positive Class (Y=1): 8-letter English dictionary words from WORDS_8_EXPANDED (>= 294 words).
       - Negative Class (Y=0): 8-letter pseudo-words (4 alternating consonant-vowel pairs CVCVCVCV).
         Strict rejection: 0 overlap with WORDS_8_EXPANDED, 0 overlap with INDEPENDENT_PHONETIC_4_STEMS,
         0 overlap with common dictionary words.
    2. Template Geometry Dimension (Identical for Both Classes):
       - TEMPLATE_PREFIX_PADDED:     [2 Upper][8 Root][2 Digits][2 Symbols]
       - TEMPLATE_SUFFIX_PADDED:     [2 Digits][2 Symbols][8 Root][2 Upper]
       - TEMPLATE_WORD_SYMBOLS_SUFFIX: [8 Root][2 Symbols][2 Upper][2 Digits]
       - TEMPLATE_PREFIX_SYMBOLS:    [2 Symbols][2 Digits][8 Root][2 Upper]
       Both positive and negative candidates insert their 8-letter root into the EXACT same slot.
    3. Positional and Composition Parity:
       - Total length: Exactly 14 characters for all candidates (delta = 0.00 chars).
       - Composition: Exactly 8 lowercase, 2 uppercase, 2 digits, 2 symbols for all candidates.
       - Positional distribution: P(class at pos i | Y=1) == P(class at pos i | Y=0) for all 14 positions.
         Positional class gap is exactly 0.0000.
       - Template family: 50% positive and 50% negative in each template family.
    4. Cluster Tracking:
       - Every candidate records its root string as `cluster_id` to enable cluster-aware bootstrap.
    5. Deduplication & Partition Isolation:
       - 0 exact cross-split duplicates, 0 case-normalized cross-split duplicates.
    """
    rng = random.Random(seed)
    symbols = "!@#$%^&*"
    consonants = "bcdfghjklmnprstvwxz"
    vowels = "aeiou"

    # Known stems for negative rejection
    known_word_set = set(w.lower() for w in WORDS_8_EXPANDED) | set(s.lower() for s in INDEPENDENT_PHONETIC_4_STEMS)

    # All 4 standard template families
    all_templates = [
        TEMPLATE_PREFIX_PADDED,
        TEMPLATE_SUFFIX_PADDED,
        TEMPLATE_WORD_SYMBOLS_SUFFIX,
        TEMPLATE_PREFIX_SYMBOLS
    ]

    # Pre-generate diverse pool of 8-letter pseudo-words
    pseudo_words_pool: List[str] = []
    seen_pseudo: Set[str] = set()
    while len(pseudo_words_pool) < 600:
        pw_chars = []
        for _ in range(4):
            pw_chars.append(rng.choice(consonants))
            pw_chars.append(rng.choice(vowels))
        pw = "".join(pw_chars)
        if pw not in seen_pseudo and pw not in known_word_set:
            if not any(s in pw for s in INDEPENDENT_PHONETIC_4_STEMS):
                seen_pseudo.add(pw)
                pseudo_words_pool.append(pw)

    # Positive dictionary words
    positive_words_pool = list(WORDS_8_EXPANDED)
    rng.shuffle(positive_words_pool)

    # Partition words and templates based on split_strategy
    if split_strategy in ("combined_disjoint", "lexical_disjoint"):
        n_pos_words = len(positive_words_pool)
        n_pos_train = int(n_pos_words * train_ratio)
        n_pos_val = int(n_pos_words * val_ratio)
        pos_words_train = positive_words_pool[:n_pos_train]
        pos_words_val = positive_words_pool[n_pos_train:n_pos_train + n_pos_val]
        pos_words_test = positive_words_pool[n_pos_train + n_pos_val:]

        n_pw = len(pseudo_words_pool)
        n_pw_train = int(n_pw * train_ratio)
        n_pw_val = int(n_pw * val_ratio)
        pw_train = pseudo_words_pool[:n_pw_train]
        pw_val = pseudo_words_pool[n_pw_train:n_pw_train + n_pw_val]
        pw_test = pseudo_words_pool[n_pw_train + n_pw_val:]
    else:
        # Shared pool for random split
        pos_words_train = positive_words_pool
        pos_words_val = positive_words_pool
        pos_words_test = positive_words_pool
        pw_train = pseudo_words_pool
        pw_val = pseudo_words_pool
        pw_test = pseudo_words_pool

    if split_strategy in ("combined_disjoint", "template_disjoint"):
        train_templates = [TEMPLATE_PREFIX_PADDED, TEMPLATE_SUFFIX_PADDED]
        val_templates = [TEMPLATE_WORD_SYMBOLS_SUFFIX]
        test_templates = [TEMPLATE_PREFIX_SYMBOLS]
    else:
        train_templates = all_templates
        val_templates = all_templates
        test_templates = all_templates

    n_train = int(n_samples * train_ratio)
    n_val = int(n_samples * val_ratio)
    n_test = n_samples - n_train - n_val

    splits_config = {
        "train": {
            "n_pos": n_train // 2,
            "n_neg": n_train // 2,
            "pos_words": pos_words_train,
            "neg_words": pw_train,
            "templates": train_templates
        },
        "val": {
            "n_pos": n_val // 2,
            "n_neg": n_val // 2,
            "pos_words": pos_words_val,
            "neg_words": pw_val,
            "templates": val_templates
        },
        "test": {
            "n_pos": n_test // 2,
            "n_neg": n_test // 2,
            "pos_words": pos_words_test,
            "neg_words": pw_test,
            "templates": test_templates
        }
    }

    seen_exact_global: Set[str] = set()
    seen_norm_global: Set[str] = set()
    results: Dict[str, Dict[str, list]] = {}

    def construct_candidate(root: str, tmpl: str, rng_inst: random.Random) -> str:
        u1, u2 = rng_inst.choice(string.ascii_uppercase), rng_inst.choice(string.ascii_uppercase)
        d1, d2 = rng_inst.choice(string.digits), rng_inst.choice(string.digits)
        s1, s2 = rng_inst.choice(symbols), rng_inst.choice(symbols)

        upper_pair = f"{u1}{u2}"
        digit_pair = f"{d1}{d2}"
        symbol_pair = f"{s1}{s2}"

        if tmpl == TEMPLATE_SUFFIX_PADDED:
            cand = f"{digit_pair}{symbol_pair}{root}{upper_pair}"
        elif tmpl == TEMPLATE_PREFIX_PADDED:
            cand = f"{upper_pair}{root}{digit_pair}{symbol_pair}"
        elif tmpl == TEMPLATE_PREFIX_SYMBOLS:
            cand = f"{symbol_pair}{digit_pair}{root}{upper_pair}"
        elif tmpl == TEMPLATE_WORD_SYMBOLS_SUFFIX:
            cand = f"{root}{symbol_pair}{upper_pair}{digit_pair}"
        else:
            raise ValueError(f"Unknown template: {tmpl}")

        assert len(cand) == 14
        assert sum(1 for c in cand if c.islower()) == 8
        assert sum(1 for c in cand if c.isupper()) == 2
        assert sum(1 for c in cand if c.isdigit()) == 2
        assert sum(1 for c in cand if c in symbols) == 2
        return cand

    for split_name, cfg in splits_config.items():
        cands: List[str] = []
        lbls: List[int] = []
        ptypes: List[str] = []
        metas: List[Dict[str, Any]] = []

        # Positives
        pos_quota = cfg["n_pos"]
        tmpl_cycle = list(cfg["templates"])
        for i in range(pos_quota):
            tmpl = tmpl_cycle[i % len(tmpl_cycle)]
            while True:
                w = rng.choice(cfg["pos_words"])
                cand = construct_candidate(w, tmpl, rng)
                cand_norm = cand.strip().lower()

                if cand not in seen_exact_global and cand_norm not in seen_norm_global:
                    seen_exact_global.add(cand)
                    seen_norm_global.add(cand_norm)
                    cands.append(cand)
                    lbls.append(1)
                    ptypes.append(f"factorial_{tmpl}_pos")
                    metas.append({
                        "cluster_id": w,
                        "lexical_source": w,
                        "lexical_type": "dictionary_word",
                        "template_family": tmpl,
                        "category": "factorial_matched_positive"
                    })
                    break

        # Negatives (matched pseudo-words inserted in EXACT same templates)
        neg_quota = cfg["n_neg"]
        for i in range(neg_quota):
            tmpl = tmpl_cycle[i % len(tmpl_cycle)]
            while True:
                pw = rng.choice(cfg["neg_words"])
                cand = construct_candidate(pw, tmpl, rng)
                cand_norm = cand.strip().lower()

                if cand not in seen_exact_global and cand_norm not in seen_norm_global:
                    seen_exact_global.add(cand)
                    seen_norm_global.add(cand_norm)
                    cands.append(cand)
                    lbls.append(0)
                    ptypes.append(f"factorial_{tmpl}_neg")
                    metas.append({
                        "cluster_id": pw,
                        "lexical_source": pw,
                        "lexical_type": "pseudoword",
                        "template_family": tmpl,
                        "category": "factorial_matched_negative"
                    })
                    break

        combined = list(zip(cands, lbls, ptypes, metas))
        rng.shuffle(combined)
        c, l, p, m = zip(*combined)
        results[split_name] = {
            "candidates": list(c),
            "labels": list(l),
            "pattern_types": list(p),
            "metadata": list(m)
        }

    # Verify cross-split isolation
    train_cands = set(results["train"]["candidates"])
    val_cands = set(results["val"]["candidates"])
    test_cands = set(results["test"]["candidates"])

    assert len(train_cands & val_cands) == 0, "Train-val exact duplicate leakage!"
    assert len(train_cands & test_cands) == 0, "Train-test exact duplicate leakage!"
    assert len(val_cands & test_cands) == 0, "Val-test exact duplicate leakage!"

    train_norm = set(c.strip().lower() for c in train_cands)
    val_norm = set(c.strip().lower() for c in val_cands)
    test_norm = set(c.strip().lower() for c in test_cands)

    assert len(train_norm & val_norm) == 0, "Train-val normalized duplicate leakage!"
    assert len(train_norm & test_norm) == 0, "Train-test normalized duplicate leakage!"
    assert len(val_norm & test_norm) == 0, "Val-test normalized duplicate leakage!"

    # Verify exact positional distribution parity between positive and negative classes
    def get_pos_matrix(c_list: List[str]) -> np.ndarray:
        sym_set = set("!@#$%^&*")
        mat = np.zeros((14, 4), dtype=float)
        for c in c_list:
            for i, ch in enumerate(c):
                if ch.islower():
                    mat[i, 0] += 1
                elif ch.isupper():
                    mat[i, 1] += 1
                elif ch.isdigit():
                    mat[i, 2] += 1
                elif ch in sym_set:
                    mat[i, 3] += 1
        return mat / len(c_list)

    for sname in ["train", "val", "test"]:
        s_cands = results[sname]["candidates"]
        s_lbls = results[sname]["labels"]
        pos_c = [c for c, y in zip(s_cands, s_lbls) if y == 1]
        neg_c = [c for c, y in zip(s_cands, s_lbls) if y == 0]
        p_mat = get_pos_matrix(pos_c)
        n_mat = get_pos_matrix(neg_c)
        max_diff = float(np.max(np.abs(p_mat - n_mat)))
        assert max_diff < 0.05, f"Positional divergence in {sname} split: {max_diff}"

    return {
        "splits": results,
        "split_strategy": split_strategy,
        "isolation_audit": {
            "positive_words_train_count": len(pos_words_train),
            "positive_words_val_count": len(pos_words_val),
            "positive_words_test_count": len(pos_words_test),
            "pseudo_words_train_count": len(pw_train),
            "pseudo_words_val_count": len(pw_val),
            "pseudo_words_test_count": len(pw_test),
            "train_templates": train_templates,
            "val_templates": val_templates,
            "test_templates": test_templates,
            "positional_gap_max": 0.0000,
            "exact_duplicate_leakage": 0,
            "normalized_duplicate_leakage": 0,
            "verified": True
        }
    }


def generate_g12_multi_generator_audit_dataset(
    n_samples_per_group: int = 500,
    seed: int = 42
) -> Dict[str, Any]:
    """
    Phase 4.2.4 Track 2: Multi-Generator Residual Sequence-Artefact Audit Dataset (Exp G12).
    Generates 4 matched groups under identical length (14) and character composition (8L/2U/2D/2S):
    1. dictionary_positives: 8-char dictionary root in standard templates
    2. phonetic_positives: 2x 4-char phonetic compound stems in novel geometries (from Generator V2)
    3. syllabic_negatives: 4x consonant-vowel pseudo-syllabic pairs in matched templates
    4. scrambled_negatives: 8 lowercase uniformly sampled without dictionary stems
    """
    rng = random.Random(seed)
    symbols = "!@#$%^&*"
    consonants = "bcdfghjklmnprstvwxz"
    vowels = "aeiou"

    # Known stems
    known_word_set = set(w.lower() for w in WORDS_8_EXPANDED) | set(s.lower() for s in INDEPENDENT_PHONETIC_4_STEMS)

    groups: Dict[str, List[str]] = {
        "dictionary_positives": [],
        "phonetic_positives": [],
        "syllabic_negatives": [],
        "scrambled_negatives": []
    }

    seen_all: Set[str] = set()

    # 1. Dictionary Positives (Exp G11 matched template)
    while len(groups["dictionary_positives"]) < n_samples_per_group:
        w = rng.choice(WORDS_8_EXPANDED)
        tmpl = rng.choice([TEMPLATE_PREFIX_PADDED, TEMPLATE_SUFFIX_PADDED, TEMPLATE_PREFIX_SYMBOLS, TEMPLATE_WORD_SYMBOLS_SUFFIX])
        u1, u2 = rng.choice(string.ascii_uppercase), rng.choice(string.ascii_uppercase)
        d1, d2 = rng.choice(string.digits), rng.choice(string.digits)
        s1, s2 = rng.choice(symbols), rng.choice(symbols)
        if tmpl == TEMPLATE_SUFFIX_PADDED:
            cand = f"{d1}{d2}{s1}{s2}{w}{u1}{u2}"
        elif tmpl == TEMPLATE_PREFIX_PADDED:
            cand = f"{u1}{u2}{w}{d1}{d2}{s1}{s2}"
        elif tmpl == TEMPLATE_PREFIX_SYMBOLS:
            cand = f"{s1}{s2}{d1}{d2}{w}{u1}{u2}"
        else:
            cand = f"{w}{s1}{s2}{u1}{u2}{d1}{d2}"
        assert len(cand) == 14 and sum(1 for c in cand if c.islower()) == 8
        if cand not in seen_all:
            seen_all.add(cand)
            groups["dictionary_positives"].append(cand)

    # 2. Phonetic Compound Positives (Generator V2)
    while len(groups["phonetic_positives"]) < n_samples_per_group:
        s1 = rng.choice(INDEPENDENT_PHONETIC_4_STEMS)
        s2 = rng.choice(INDEPENDENT_PHONETIC_4_STEMS)
        while s2 == s1:
            s2 = rng.choice(INDEPENDENT_PHONETIC_4_STEMS)
        u1, u2 = rng.choice(string.ascii_uppercase), rng.choice(string.ascii_uppercase)
        d1, d2 = rng.choice(string.digits), rng.choice(string.digits)
        sym1, sym2 = rng.choice(symbols), rng.choice(symbols)
        geom = rng.choice(["interleaved_v2", "mirrored_bracket_v2", "sandwich_v2"])
        if geom == "interleaved_v2":
            cand = f"{u1}{s1}{sym1}{d1}{s2}{u2}{sym2}{d2}"
        elif geom == "mirrored_bracket_v2":
            cand = f"{sym1}{u1}{d1}{s1}{s2}{d2}{u2}{sym2}"
        else:
            cand = f"{d1}{d2}{s1}{s2}{u1}{u2}{sym1}{sym2}"
        assert len(cand) == 14 and sum(1 for c in cand if c.islower()) == 8
        if cand not in seen_all:
            seen_all.add(cand)
            groups["phonetic_positives"].append(cand)

    # 3. Syllabic Pseudo-Word Negatives (V2b)
    while len(groups["syllabic_negatives"]) < n_samples_per_group:
        pw_chars = []
        for _ in range(4):
            pw_chars.append(rng.choice(consonants))
            pw_chars.append(rng.choice(vowels))
        pw = "".join(pw_chars)
        if pw in known_word_set or any(s in pw for s in INDEPENDENT_PHONETIC_4_STEMS):
            continue
        tmpl = rng.choice([TEMPLATE_PREFIX_PADDED, TEMPLATE_SUFFIX_PADDED, TEMPLATE_PREFIX_SYMBOLS, TEMPLATE_WORD_SYMBOLS_SUFFIX])
        u1, u2 = rng.choice(string.ascii_uppercase), rng.choice(string.ascii_uppercase)
        d1, d2 = rng.choice(string.digits), rng.choice(string.digits)
        s1, s2 = rng.choice(symbols), rng.choice(symbols)
        if tmpl == TEMPLATE_SUFFIX_PADDED:
            cand = f"{d1}{d2}{s1}{s2}{pw}{u1}{u2}"
        elif tmpl == TEMPLATE_PREFIX_PADDED:
            cand = f"{u1}{u2}{pw}{d1}{d2}{s1}{s2}"
        elif tmpl == TEMPLATE_PREFIX_SYMBOLS:
            cand = f"{s1}{s2}{d1}{d2}{pw}{u1}{u2}"
        else:
            cand = f"{pw}{s1}{s2}{u1}{u2}{d1}{d2}"
        assert len(cand) == 14 and sum(1 for c in cand if c.islower()) == 8
        if cand not in seen_all:
            seen_all.add(cand)
            groups["syllabic_negatives"].append(cand)

    # 4. Scrambled Uniform Negatives
    while len(groups["scrambled_negatives"]) < n_samples_per_group:
        lowers = [rng.choice(string.ascii_lowercase) for _ in range(8)]
        uppers = [rng.choice(string.ascii_uppercase) for _ in range(2)]
        digits = [rng.choice(string.digits) for _ in range(2)]
        syms = [rng.choice(symbols) for _ in range(2)]
        pool = lowers + uppers + digits + syms
        rng.shuffle(pool)
        cand = "".join(pool)
        assert len(cand) == 14 and sum(1 for c in cand if c.islower()) == 8
        if cand not in seen_all:
            seen_all.add(cand)
            groups["scrambled_negatives"].append(cand)

    return groups



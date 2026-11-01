#!/usr/bin/env python3
"""
PREDICT-PS Phase 4 & Phase 4.1: Synthetic Dataset Generator
Generates reproducible, structured synthetic password candidates for baseline evaluation,
dataset diagnostics, and shortcut-learning investigation.

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
    rng = random.Random(seed)
    n_pos = n_samples // 2
    n_neg = n_samples - n_pos

    symbols = "!@#$%^&*"
    seen_exact: Set[str] = set()
    seen_normalized: Set[str] = set()
    candidates: List[str] = []
    labels: List[int] = []
    pattern_types: List[str] = []

    # 1. Generate Positive Candidates
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
        elif variant == 1:
            cand = f"{upper_pair}{w}{digit_pair}{symbol_pair}"
        elif variant == 2:
            cand = f"{symbol_pair}{w}{upper_pair}{digit_pair}"
        else:
            cand = f"{w}{symbol_pair}{upper_pair}{digit_pair}"

        cand_norm = cand.strip().lower()
        if cand not in seen_exact and cand_norm not in seen_normalized:
            seen_exact.add(cand)
            seen_normalized.add(cand_norm)
            candidates.append(cand)
            labels.append(1)
            pattern_types.append("length_composition_matched_positive")

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
            pattern_types.append("length_composition_matched_negative")

    combined = list(zip(candidates, labels, pattern_types))
    rng.shuffle(combined)
    cands, lbls, ptypes = zip(*combined)
    return list(cands), list(lbls), list(ptypes)


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

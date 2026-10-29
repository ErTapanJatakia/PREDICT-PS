/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PREDICT-PS: Foundational Pure Logic and Research Specifications
 * Phase 1 Architecture
 */

import {
  ResearchPhase,
  ResearchQuestion,
  BaselineModelSpec,
  EvaluationMetricSpec,
  ConfusionMatrixInput,
  CalculatedMetrics,
  PrivacyAuditResult
} from '../types/research';

/**
 * Calculates the rejection-sampling bound to prevent modulo bias when sampling
 * an alphabet of size k using single bytes (0..255) from crypto.getRandomValues().
 */
export function calculateUnbiasedSamplingThreshold(charsetSize: number): {
  charsetSize: number;
  maxValidByte: number; // Values strictly less than this are accepted
  discardedByteCount: number;
  rejectionProbability: number;
  entropyBitsPerChar: number;
  isPowerOfTwo: boolean;
} {
  if (charsetSize <= 0 || !Number.isInteger(charsetSize)) {
    throw new Error('Charset size must be a positive integer.');
  }
  if (charsetSize > 256) {
    throw new Error('Single-byte sampling cannot support charsets larger than 256 characters.');
  }

  const remainder = 256 % charsetSize;
  const maxValidByte = 256 - remainder;
  const discardedByteCount = remainder;
  const rejectionProbability = discardedByteCount / 256;
  const entropyBitsPerChar = Math.log2(charsetSize);
  const isPowerOfTwo = (charsetSize & (charsetSize - 1)) === 0;

  return {
    charsetSize,
    maxValidByte,
    discardedByteCount,
    rejectionProbability,
    entropyBitsPerChar,
    isPowerOfTwo,
  };
}

/**
 * Calculates standard scientific classification metrics for password predictability research.
 * Positive Class = "Guessable / Human-Pattern Password"
 * Negative Class = "High-Entropy / Strong Password"
 * 
 * Critical Security Metric:
 * - False-Strong Rate (FSR): Rate at which guessable passwords are misclassified as strong (False Negatives)
 *   FSR = FN / (TP + FN)
 */
export function calculateEvaluationMetrics(matrix: ConfusionMatrixInput): CalculatedMetrics {
  const { truePositives: tp, falsePositives: fp, trueNegatives: tn, falseNegatives: fn } = matrix;

  if (tp < 0 || fp < 0 || tn < 0 || fn < 0) {
    throw new Error('Confusion matrix values must be non-negative.');
  }

  const total = tp + fp + tn + fn;
  if (total === 0) {
    return {
      total: 0,
      accuracy: 0,
      precision: 0,
      recall: 0,
      macroF1: 0,
      falseStrongRate: 0,
      falseWeakRate: 0,
    };
  }

  const accuracy = (tp + tn) / total;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  
  // Specificity (True Negative Rate for Strong class)
  const specificity = tn + fp > 0 ? tn / (tn + fp) : 0;
  const negPredictiveValue = tn + fn > 0 ? tn / (tn + fn) : 0;

  // F1 for positive class (Guessable)
  const f1Positive = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  // F1 for negative class (Strong)
  const f1Negative = specificity + negPredictiveValue > 0 
    ? (2 * specificity * negPredictiveValue) / (specificity + negPredictiveValue) 
    : 0;
  
  const macroF1 = (f1Positive + f1Negative) / 2;

  // False-Strong Rate = Missed Guessable Passwords = FN / (TP + FN)
  const falseStrongRate = tp + fn > 0 ? fn / (tp + fn) : 0;

  // False-Weak Rate = Strong Passwords Falsely Penalized = FP / (FP + TN)
  const falseWeakRate = fp + tn > 0 ? fp / (fp + tn) : 0;

  return {
    total,
    accuracy,
    precision,
    recall,
    macroF1,
    falseStrongRate,
    falseWeakRate,
  };
}

/**
 * Computes the Brier score (mean squared error of probabilistic predictions)
 * used to evaluate model probability calibration.
 * Lower is better (0.0 = perfect calibration).
 */
export function calculateBrierScore(predictions: Array<{ probability: number; label: number }>): number {
  if (predictions.length === 0) return 0;
  
  let sumSquaredError = 0;
  for (const item of predictions) {
    const p = Math.max(0, Math.min(1, item.probability));
    const y = item.label === 1 ? 1 : 0;
    sumSquaredError += Math.pow(p - y, 2);
  }
  
  return sumSquaredError / predictions.length;
}

/**
 * Strict privacy export sanitizer:
 * Prohibits any raw password strings, sensitive keys, or personal identifying tokens
 * from being included in exported research reports or logs.
 */
const BANNED_EXPORT_KEYWORDS = [
  'password',
  'pass',
  'pwd',
  'plaintext',
  'secret',
  'raw',
  'token',
  'credential',
  'hash',
  'salt',
  'user',
  'email',
  'auth',
  'key',
];

export function sanitizeResearchExport(data: Record<string, unknown>): {
  clean: boolean;
  sanitized: Record<string, unknown>;
  violations: string[];
} {
  const violations: string[] = [];
  const sanitized: Record<string, unknown> = {};

  function inspectAndClean(obj: unknown, path: string): unknown {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') {
      if (typeof obj === 'string' && obj.length > 500) {
        // Enforce max string length to prevent accidental payload dumps
        return `${obj.slice(0, 40)}...[TRUNCATED]`;
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item, index) => inspectAndClean(item, `${path}[${index}]`));
    }

    const cleanedObj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const lower = k.toLowerCase().trim();
      const currentPath = path ? `${path}.${k}` : k;

      const isBanned = BANNED_EXPORT_KEYWORDS.some((kw) => lower.includes(kw));

      if (isBanned) {
        violations.push(`Forbidden field detected: ${currentPath}`);
        continue; // Strip entirely
      }

      cleanedObj[k] = inspectAndClean(v, currentPath);
    }
    return cleanedObj;
  }

  const result = inspectAndClean(data, '') as Record<string, unknown>;
  Object.assign(sanitized, result);

  return {
    clean: violations.length === 0,
    sanitized,
    violations,
  };
}

/**
 * Live browser privacy audit helper
 */
export function checkBrowserPrivacyContext(): PrivacyAuditResult {
  const isBrowser = typeof window !== 'undefined';
  
  return {
    cryptoSubtleAvailable: isBrowser && !!window.crypto && !!window.crypto.subtle,
    getRandomValuesAvailable: isBrowser && !!window.crypto && typeof window.crypto.getRandomValues === 'function',
    localStorageKeysCount: isBrowser && window.localStorage ? window.localStorage.length : 0,
    sessionStorageKeysCount: isBrowser && window.sessionStorage ? window.sessionStorage.length : 0,
    cookiesLength: isBrowser && typeof document !== 'undefined' && document.cookie ? document.cookie.length : 0,
    indexedDBAvailable: isBrowser && !!window.indexedDB,
    telemetryActive: false, // Invariant: Zero external telemetry hooks exist in this codebase
    timestamp: new Date().toISOString(),
  };
}

/**
 * Returns the formal roadmap phases with honest statuses
 */
export function getResearchPhases(): ResearchPhase[] {
  return [
    {
      id: 1,
      codename: 'PHASE-1',
      title: 'Secure Foundation & Research Architecture',
      status: 'completed',
      summary: 'Establish the core application shell, strict privacy boundary invariants, technical specifications, and mathematical evaluation protocols.',
      deliverables: [
        'Accessible, high-contrast academic dashboard shell',
        'Visible non-certification research disclaimer',
        'Formal hypothesis and research question formulation',
        'Strict zero-persistence, zero-egress architecture documentation',
        'Unbiased CSPRNG rejection-sampling mathematical models',
        'Evaluation metrics formulation and export sanitization engine',
      ],
      privacySafeguards: [
        'Zero network requests outside local origin',
        'Zero localStorage / sessionStorage / cookie persistence',
        'Zero third-party telemetry, trackers, or external CDNs',
        'Strict rejection of password input fields in Phase 1',
      ],
      dependencies: [],
    },
    {
      id: 2,
      codename: 'PHASE-2',
      title: 'Browser-Local Generation & Explainable Pattern Extraction',
      status: 'planned',
      summary: 'Implement browser crypto.getRandomValues unbiased sampling and deterministic AST-like explainable pattern segmenters without remote calls.',
      deliverables: [
        'CSPRNG generator with verified modulo-bias rejection sampling',
        'Explainable pattern tokenizer (character-class runs, l33t substitution, repeat runs)',
        'Spatial keyboard pattern detection (QWERTY, Dvorak adjacency graph)',
        'Local in-memory transient analysis pipeline (zero storage)',
      ],
      privacySafeguards: [
        'Ephemeral in-memory lifecycle only (Garbage collected on component unmount)',
        'No clipboard auto-read or persistence',
        'No logging of candidate strings',
      ],
      dependencies: [1],
    },
    {
      id: 3,
      codename: 'PHASE-3',
      title: 'Standard Baselines (Rules & zxcvbn)',
      status: 'planned',
      summary: 'Integrate client-side NIST SP 800-63B heuristic rules and local zxcvbn entropy graph baseline for benchmark comparisons.',
      deliverables: [
        'Standard NIST length & dictionary heuristic baseline',
        'Deterministic local zxcvbn matching graph analyzer',
        'Execution latency profiling (<5ms budget)',
      ],
      privacySafeguards: [
        'Pre-compiled offline dictionary assets bundled locally',
        'Zero API breach checks (HIBP or remote lookups prohibited)',
      ],
      dependencies: [1, 2],
    },
    {
      id: 4,
      codename: 'PHASE-4',
      title: 'Character n-gram ML Baseline',
      status: 'planned',
      summary: 'Implement a character-level n-gram Markov language model running client-side as the statistical machine-learning baseline.',
      deliverables: [
        'Sparse character bi-gram and tri-gram transition matrix',
        'Log-likelihood predictability scoring module',
        'Offline pre-trained model weights (<100KB footprint)',
      ],
      privacySafeguards: [
        'Model trained only on public sanitized non-sensitive research corpuses',
        'Zero external inference endpoints',
      ],
      dependencies: [1, 3],
    },
    {
      id: 5,
      codename: 'PHASE-5',
      title: 'Explainable Feature-Fusion Architecture',
      status: 'planned',
      summary: 'Train and embed the fused model combining structural pattern descriptors with sparse character n-gram vectors.',
      deliverables: [
        'Hybrid feature extraction vectorizer',
        'Explainable feature contribution attribution (SHAP/coefficients breakdown)',
        'Fast client inference engine (<15ms per candidate)',
      ],
      privacySafeguards: [
        'Pure client-side inference',
        'No remote inference or LLM delegation',
      ],
      dependencies: [1, 3, 4],
    },
    {
      id: 6,
      codename: 'PHASE-6',
      title: 'Reproducible Evaluation Workbench & Ablation Matrix',
      status: 'planned',
      summary: 'Execute the empirical comparison across all baselines on documented benchmark subsets, measuring FSR, PR-AUC, calibration, and latency.',
      deliverables: [
        'Comparative performance matrix across all four methods',
        'Feature ablation studies (rules vs n-grams vs patterns vs fusion)',
        'Calibrated confidence scores & Brier reliability curves',
        'Sanitized research data export with zero sensitive content',
      ],
      privacySafeguards: [
        'Export validator rejects any raw string or sensitive metadata',
        'Deduplication and test-set contamination verification',
      ],
      dependencies: [1, 2, 3, 4, 5],
    },
  ];
}

/**
 * Formal Research Questions
 */
export function getResearchQuestions(): ResearchQuestion[] {
  return [
    {
      id: 'rq1',
      code: 'RQ1',
      title: 'Explainability vs Black-Box Predictive Fidelity',
      hypothesis: 'Explainable structural pattern features (character-class transitions, l33t mutations, keyboard spatial adjacency) provide competitive classification accuracy to dense neural models while maintaining interpretability for human security policy feedback.',
      testMethodology: 'Compare classification fidelity (PR-AUC, Macro-F1) of interpretable pattern tokenizers against statistical character models on public benchmark splits.',
      baselineComparison: 'NIST SP 800-63B heuristics vs Character n-gram Markov vs Pattern Features',
    },
    {
      id: 'rq2',
      code: 'RQ2',
      title: 'Representation Complementarity in Feature Fusion',
      hypothesis: 'Fusing deterministic structural pattern features with probabilistic character n-gram log-likelihoods significantly reduces the False-Strong Rate (FSR) compared with either representation alone.',
      testMethodology: 'Controlled ablation experiment holding dataset splits constant: evaluate (A) pattern features only, (B) n-grams only, and (C) fused representation.',
      baselineComparison: 'Ablation study over identical test partitions with bootstrap confidence intervals.',
    },
    {
      id: 'rq3',
      code: 'RQ3',
      title: 'Client-Side Privacy and Computational Feasibility',
      hypothesis: 'A fused explainable model can achieve sub-15ms client-side inference latency with a compressed footprint (<250KB) in standard browser runtimes without external telemetry or server offloading.',
      testMethodology: 'High-resolution performance profiling (Performance.now) across diverse browser environments, measuring memory ceiling and frame budget impact.',
      baselineComparison: 'zxcvbn execution profile vs Fused Model inference runtime.',
    },
  ];
}

/**
 * Baseline model specifications
 */
export function getBaselineSpecs(): BaselineModelSpec[] {
  return [
    {
      id: 'baseline-rules',
      name: 'NIST Heuristic Rule Engine',
      type: 'heuristic',
      description: 'Rule-based validation checking minimum length, character-set diversity, and standard trivial dictionary blacklist.',
      computationalCost: 'ultra-low (<1ms)',
      explainability: 'high',
      privacyProfile: '100% Client-side, static rule definitions',
      status: 'planned',
    },
    {
      id: 'baseline-zxcvbn',
      name: 'zxcvbn-ts Graph Matching',
      type: 'dictionary-graph',
      description: 'Standard open-source password strength estimator combining dictionary matching, l33t replacement, and shortest-path entropy estimation.',
      computationalCost: 'low (<10ms)',
      explainability: 'high',
      privacyProfile: '100% Client-side bundled frequency lists',
      status: 'planned',
    },
    {
      id: 'baseline-ngram',
      name: 'Character n-gram Statistical Model',
      type: 'statistical-ml',
      description: 'Character-level bi-gram / tri-gram Markov transition model estimating sequence log-probability to identify statistical human naming patterns.',
      computationalCost: 'low (<10ms)',
      explainability: 'moderate',
      privacyProfile: '100% Client-side sparse transition matrix',
      status: 'planned',
    },
    {
      id: 'proposed-fusion',
      name: 'PREDICT-PS Fused Explainable Model',
      type: 'fused-ml',
      description: 'Proposed architecture: fusion of structural pattern descriptors (runs, keyboard walks, l33t transforms) and character n-gram likelihoods with linear classification.',
      computationalCost: 'low (<15ms)',
      explainability: 'high',
      privacyProfile: '100% Client-side, zero network egress',
      status: 'planned',
    },
  ];
}

/**
 * Metric Specifications
 */
export function getEvaluationMetricSpecs(): EvaluationMetricSpec[] {
  return [
    {
      name: 'False-Strong Rate (FSR)',
      symbol: 'FSR',
      formula: 'FN / (TP + FN)',
      rationale: 'In password defense, certifying a guessable password as strong is catastrophic. FSR directly measures this dangerous miss rate.',
      targetThreshold: '< 0.05 (under 5% dangerous misses)',
      importanceInCybersecurity: 'Critical: Prevents false sense of security in end-users and authentication gateways.',
    },
    {
      name: 'Macro-Averaged F1 Score',
      symbol: 'Macro-F1',
      formula: '(F1_guessable + F1_strong) / 2',
      rationale: 'Password datasets suffer from severe class imbalance. Macro-F1 prevents the majority class from dominating the performance assessment.',
      targetThreshold: '> 0.88',
      importanceInCybersecurity: 'High: Ensures balanced discrimination across both guessable and robust credentials.',
    },
    {
      name: 'Precision-Recall AUC',
      symbol: 'PR-AUC',
      formula: '∫ Precision(R) dR',
      rationale: 'Preferred over ROC-AUC when positive instances (guessable credentials) exist in long-tail distributions.',
      targetThreshold: '> 0.90',
      importanceInCybersecurity: 'High: Evaluates model ranking quality across varying decision thresholds without distortion from true negatives.',
    },
    {
      name: 'Brier Calibration Score',
      symbol: 'BS',
      formula: '(1/N) ∑ (p_i - y_i)²',
      rationale: 'Measures whether predicted probabilities correspond to real empirical frequencies (e.g. an 80% score means 80% guessability).',
      targetThreshold: '< 0.10 (closer to 0 is superior)',
      importanceInCybersecurity: 'High: Calibrated probabilities enable reliable threshold selection in enterprise risk policies.',
    },
    {
      name: 'Evaluation Latency',
      symbol: 'Latency',
      formula: 't_end - t_start (ms)',
      rationale: 'Evaluation must execute synchronously within interactive typing loops (60fps budget = ~16ms).',
      targetThreshold: '< 15 ms / candidate',
      importanceInCybersecurity: 'High: Essential for practical adoption without UI lag or battery drain on mobile devices.',
    },
  ];
}

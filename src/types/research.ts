/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PREDICT-PS: Password Predictability Research Workbench
 * Phase 1: Foundational Types & Research Specifications
 */

export type PhaseStatus = 'completed' | 'in-progress' | 'planned';

export interface ResearchPhase {
  id: number;
  title: string;
  codename: string;
  status: PhaseStatus;
  summary: string;
  deliverables: string[];
  privacySafeguards: string[];
  dependencies: number[];
}

export interface ResearchQuestion {
  id: string;
  code: string;
  title: string;
  hypothesis: string;
  testMethodology: string;
  baselineComparison: string;
}

export interface BaselineModelSpec {
  id: string;
  name: string;
  type: 'heuristic' | 'dictionary-graph' | 'statistical-ml' | 'fused-ml';
  description: string;
  computationalCost: 'ultra-low (<1ms)' | 'low (<10ms)' | 'low (<15ms)' | 'moderate (<50ms)';
  explainability: 'high' | 'moderate' | 'low';
  privacyProfile: string;
  status: PhaseStatus;
}

export interface EvaluationMetricSpec {
  name: string;
  symbol: string;
  formula: string;
  rationale: string;
  targetThreshold: string;
  importanceInCybersecurity: string;
}

export interface PrivacyAuditResult {
  cryptoSubtleAvailable: boolean;
  getRandomValuesAvailable: boolean;
  localStorageKeysCount: number;
  sessionStorageKeysCount: number;
  cookiesLength: number;
  indexedDBAvailable: boolean;
  telemetryActive: boolean;
  timestamp: string;
}

export interface ConfusionMatrixInput {
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
}

export interface CalculatedMetrics {
  total: number;
  accuracy: number;
  precision: number;
  recall: number;
  macroF1: number;
  falseStrongRate: number; // Critical security metric: guessable classified as strong
  falseWeakRate: number;
}

export interface CharsetOptions {
  lowercase: boolean;
  uppercase: boolean;
  digits: boolean;
  symbols: boolean;
}

export interface GeneratorConfig {
  length: number;
  charsets: CharsetOptions;
}

export interface GeneratorResult {
  password: string;
  length: number;
  charset: string;
  charsetSize: number;
  theoreticalEntropyBits: number;
  entropyPerChar: number;
  maxValidByte: number;
  discardedByteCount: number;
  rejectionProbability: number;
}

export interface PatternClassComposition {
  lowercase: number;
  uppercase: number;
  digits: number;
  symbols: number;
  whitespace: number;
  other: number;
}

export interface RepeatedRun {
  char: string;
  count: number;
  startIndex: number;
}

export interface RepeatedSubstring {
  substring: string;
  occurrences: number;
}

export interface SequentialRun {
  sequence: string;
  type: 'alphabetic' | 'numeric';
  direction: 'ascending' | 'descending';
  startIndex: number;
}

export interface KeyboardWalk {
  pattern: string;
  rowName: string;
  direction: 'horizontal' | 'reverse' | 'vertical';
  startIndex: number;
}

export interface ExplainablePatternReport {
  candidateLength: number;
  composition: PatternClassComposition;
  uniqueCharCount: number;
  repeatedRuns: RepeatedRun[];
  repeatedSubstrings: RepeatedSubstring[];
  sequentialRuns: SequentialRun[];
  keyboardWalks: KeyboardWalk[];
  structuralObservations: string[];
}

export interface ZxcvbnEvaluationResult {
  score: 0 | 1 | 2 | 3 | 4;
  scoreLabel: string;
  guesses: number;
  guessesLog10: number;
  calcTimeMs: number;
  warning: string | null;
  suggestions: string[];
  matchedPatterns: Array<{
    pattern: string;
    token: string;
  }>;
}

export interface NistGuidanceEvaluation {
  candidateLength: number;
  meetsMfaMinLength: boolean; // >= 8 chars
  meetsSingleFactorMinLength: boolean; // >= 15 chars
  withinMaxAllowedLength: boolean; // <= 64+ chars
  hasSpaceSupport: boolean;
  blocklistCheckStatus: 'not-implemented-client-boundary';
  compositionRuleNotice: string;
  summaryGuidance: string;
}

export type Phase4PipelineStatus = 'not_trained' | 'synthetic_pipeline_validation' | 'approved_research_evaluation';

export interface Phase4ConfusionMatrix {
  true_positives: number;
  false_positives: number;
  true_negatives: number;
  false_negatives: number;
  total: number;
}

export interface Phase4Metrics {
  confusion_matrix: Phase4ConfusionMatrix;
  accuracy: number;
  precision: number;
  recall: number;
  macro_f1: number;
  roc_auc: number;
  pr_auc: number;
  brier_score: number;
  false_strong_rate: number;
  false_weak_rate: number;
}

export interface Phase4ModelArchitecture {
  name: string;
  type: string;
  feature_extractor: string;
  ngram_range: [number, number];
  min_df: number;
  sublinear_tf: boolean;
  classifier: string;
  solver: string;
  C: number;
  max_iter: number;
  random_state: number;
  vocabulary_size: number;
}

export interface Phase4DatasetProvenance {
  source: string;
  data_policy: string;
  total_samples: number;
  splits: {
    train_count: number;
    train_pos: number;
    train_neg: number;
    val_count: number;
    val_pos: number;
    val_neg: number;
    test_count: number;
    test_pos: number;
    test_neg: number;
  };
  positive_label_definition: string;
  negative_label_definition: string;
  leakage_safeguards: string[];
}

export interface Phase4ComputationalProfile {
  train_duration_ms: number;
  inference_latency_microseconds: number;
  hardware_platform: string;
  python_version: string;
  dependencies: {
    scikit_learn: string;
    numpy: string;
  };
}

export interface Phase4Artifact {
  schema_version: string;
  pipeline_status: Phase4PipelineStatus;
  timestamp_utc: string;
  model_architecture: Phase4ModelArchitecture;
  dataset_provenance: Phase4DatasetProvenance;
  evaluation_metrics: {
    threshold: number;
    test_split: Phase4Metrics;
    val_split?: Phase4Metrics;
  };
  computational_profile: Phase4ComputationalProfile;
  limitations_and_caveats: string[];
}

export interface MetricConfidenceInterval {
  lower_95: number;
  upper_95: number;
  mean: number;
}

export interface CalibrationBin {
  bin_index: number;
  range: [number, number];
  count: number;
  confidence: number;
  empirical_accuracy: number;
}

export interface CalibrationDiagnostics {
  n_bins: number;
  expected_calibration_error: number;
  bins: CalibrationBin[];
  calibration_caveat: string;
}

export interface Phase41Metrics extends Phase4Metrics {
  balanced_accuracy?: number;
  specificity?: number;
  negative_predictive_value?: number;
  matthews_correlation_coefficient?: number;
  support?: {
    positive_class: number;
    negative_class: number;
  };
  predicted_positive_rate?: number;
  confidence_intervals_95?: {
    accuracy: MetricConfidenceInterval;
    precision: MetricConfidenceInterval;
    recall: MetricConfidenceInterval;
    macro_f1: MetricConfidenceInterval;
    false_strong_rate: MetricConfidenceInterval;
    pr_auc: MetricConfidenceInterval;
    roc_auc: MetricConfidenceInterval;
    methodology: {
      technique: string;
      requested_resamples?: number;
      valid_resamples?: number;
      skipped_single_class_resamples?: number;
      valid_resamples_by_metric?: Record<string, number>;
      seed: number;
      threshold_used?: number;
      threshold_policy?: string;
      confidence_level?: number;
      resamples?: number;
      note: string;
    };
  };
  calibration?: CalibrationDiagnostics;
}

export interface LengthStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdev: number;
}

export interface Phase41DatasetDiagnostics {
  sample_count: number;
  class_distribution: {
    positive_count: number;
    negative_count: number;
    positive_ratio: number;
  };
  length_statistics: {
    overall: LengthStats;
    positive_class: LengthStats;
    negative_class: LengthStats;
    length_discrepancy_delta: number;
  };
  character_statistics: {
    mean_unique_chars_per_sample: number;
    total_distinct_alphabet_size: number;
    aggregate_composition: Record<string, number>;
    repeated_run_occurrences: number;
  };
  pattern_family_distribution: Record<string, number>;
  duplicate_detection: {
    exact_duplicates: number;
    case_normalized_duplicates: number;
    whitespace_normalized_duplicates: number;
  };
}

export interface Phase41IsolationAudit {
  isolation_verified: boolean;
  exact_cross_split_duplicates: {
    train_val: number;
    train_test: number;
    val_test: number;
  };
  case_normalized_cross_split_duplicates: {
    train_val: number;
    train_test: number;
    val_test: number;
  };
  near_duplicate_sample_matches: number;
  pattern_family_analysis: {
    train_families: string[];
    test_families: string[];
    shared_families: string[];
    methodological_implication: string;
  };
  leakage_safeguards_summary: string[];
}

export interface Phase41ExperimentResult {
  experiment_id: string;
  title: string;
  status: 'executed_successfully' | 'pipeline_validation' | 'failed' | 'not_run';
  description: string;
  threshold: number;
  metrics: Phase41Metrics;
  vocabulary_size?: number;
  training_time_ms?: number;
  inference_latency_us?: number;
  length_discrepancy_delta?: number;
  evaluation_partition?: string;
  transfer_finding?: string;
}

export interface Phase41Manifest {
  schema_version: 'predict_ps_phase4_1_v1';
  manifest_type: string;
  timestamp_utc: string;
  environment: {
    python_version: string;
    platform: string;
    scikit_learn_version: string;
    numpy_version: string;
    scipy_version: string;
  };
  dataset_diagnostics: {
    original_dataset: Phase41DatasetDiagnostics;
    length_controlled_dataset: Phase41DatasetDiagnostics;
    charset_controlled_dataset: Phase41DatasetDiagnostics;
    length_and_composition_controlled_dataset?: Phase41DatasetDiagnostics;
    independent_holdout_dataset: Phase41DatasetDiagnostics;
    partition_isolation_audit: Phase41IsolationAudit;
  };
  experiments: Record<string, Phase41ExperimentResult>;
  methodological_conclusions: string[];
  limitations: string[];
}

export interface Phase42GeneralizationAudits {
  lexical_group_isolation: {
    unique_positive_words_total: number;
    train_words_count: number;
    val_words_count: number;
    test_words_count: number;
    shared_train_val_words: number;
    shared_train_test_words: number;
    shared_val_test_words: number;
    lexical_isolation_verified: boolean;
  };
  template_family_isolation: {
    train_families: string[];
    val_families: string[];
    test_held_out_families: string[];
    shared_train_test_families: number;
    template_isolation_verified: boolean;
  };
  independent_generator_v2_provenance: {
    generator_type: string;
    construction_logic: string;
    length_matching: string;
    composition_matching: string;
    sample_count: number;
    seed: number;
    metadata_leakage_prevented: boolean;
  };
}

export interface Phase42GeneralizationExperimentResult extends Phase41ExperimentResult {
  split_type?: string;
  evaluation_scope?: string;
}

export interface Phase42GeneralizationManifest {
  schema_version: 'predict_ps_phase4_2_2_v1';
  manifest_type: string;
  timestamp_utc: string;
  phase: string;
  environment: {
    python_version: string;
    platform: string;
    scikit_learn_version: string;
    numpy_version: string;
    scipy_version: string;
  };
  generalization_audits: Phase42GeneralizationAudits;
  experiments: Record<string, Phase42GeneralizationExperimentResult>;
  methodological_conclusions: string[];
  limitations: string[];
}

export interface ThresholdSweepPoint {
  threshold: number;
  is_selected: boolean;
  val_accuracy: number;
  val_macro_f1: number;
  val_fsr: number;
  val_ppr: number;
  test_accuracy: number;
  test_balanced_accuracy: number;
  test_macro_f1: number;
  test_fsr: number;
  test_fwr: number;
  test_ppr: number;
  test_sensitivity: number;
  test_specificity: number;
  test_confusion_matrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
}

export interface ThresholdRobustnessReport {
  selected_validation_threshold: number;
  metrics_at_selected_threshold: {
    confusion_matrix: {
      true_positives: number;
      false_positives: number;
      true_negatives: number;
      false_negatives: number;
      total: number;
    };
    predicted_positive_rate: number;
    sensitivity: number;
    specificity: number;
    precision: number;
    recall: number;
    accuracy: number;
    balanced_accuracy: number;
    macro_f1: number;
    mcc: number;
    roc_auc: number;
    pr_auc: number;
    brier_score: number;
    false_strong_rate: number;
    false_weak_rate: number;
  };
  classification_regime: {
    regime_type: 'degenerate_all_negative' | 'degenerate_all_positive' | 'balanced_classification' | 'skewed_classification';
    is_degenerate_all_negative: boolean;
    is_degenerate_all_positive: boolean;
    explanation: string;
  };
  ranking_vs_classification_summary: {
    roc_auc: number;
    pr_auc: number;
    interpretation: string;
  };
  threshold_sweep_curve: ThresholdSweepPoint[];
}

export interface PositionalClassDistribution {
  position: number;
  p_lower: number;
  p_upper: number;
  p_digits: number;
  p_symbols: number;
}

export interface GeneratorArtefactAudit {
  candidate_counts: {
    positive_count: number;
    negative_count: number;
  };
  stem_overlap_audit: {
    stems_checked: number;
    negative_candidates_with_stems: number;
    overlap_rate: number;
    isolated: boolean;
  };
  transition_divergence: {
    jensen_shannon_divergence: number;
    cosine_similarity: number;
    interpretation: string;
  };
  positive_transition_matrix_4x4: number[][];
  negative_transition_matrix_4x4: number[][];
  positional_distributions: {
    positive: PositionalClassDistribution[];
    negative: PositionalClassDistribution[];
  };
}

export interface Phase423ExperimentResult extends Phase42GeneralizationExperimentResult {
  threshold_robustness?: ThresholdRobustnessReport;
}

export interface Phase423AuditManifest {
  schema_version: 'predict_ps_phase4_2_3_v1';
  manifest_type: string;
  timestamp_utc: string;
  phase: string;
  environment: {
    python_version: string;
    platform: string;
    scikit_learn_version: string;
    numpy_version: string;
    scipy_version: string;
  };
  combined_generalization_audit: {
    lexical_isolation: {
      train_words: string[];
      val_words: string[];
      test_words: string[];
      shared_train_val: number;
      shared_train_test: number;
      shared_val_test: number;
      verified: boolean;
    };
    template_isolation: {
      train_templates: string[];
      val_templates: string[];
      test_templates: string[];
      shared_train_test: number;
      verified: boolean;
    };
    combined_isolation_audit: {
      combined_isolation_verified: boolean;
      lexical_disjoint: boolean;
      template_disjoint: boolean;
      exact_duplicates_zero: boolean;
      normalized_duplicates_zero: boolean;
      counts: {
        train_words: number;
        val_words: number;
        test_words: number;
        train_templates: string[];
        val_templates: string[];
        test_templates: string[];
      };
    };
  };
  generator_artefact_audits: {
    v2_uniform_audit: GeneratorArtefactAudit;
    v2b_syllabic_audit: GeneratorArtefactAudit;
  };
  threshold_robustness_summary: Record<string, {
    threshold: number;
    ppr: number;
    fsr: number;
    regime: string;
  }>;
  experiments: Record<string, Phase423ExperimentResult>;
}

export interface ClusterAwareConfidenceIntervals {
  accuracy: MetricConfidenceInterval;
  precision: MetricConfidenceInterval;
  recall: MetricConfidenceInterval;
  macro_f1: MetricConfidenceInterval;
  false_strong_rate: MetricConfidenceInterval;
  pr_auc: MetricConfidenceInterval;
  roc_auc: MetricConfidenceInterval;
  methodology: {
    technique: string;
    requested_resamples: number;
    valid_resamples: number;
    skipped_single_class_resamples: number;
    unique_cluster_count?: number;
    total_candidates?: number;
    seed: number;
    threshold_used: number;
    threshold_policy: string;
    confidence_level: number;
    clustering_variable?: string;
    insufficient_clusters?: boolean;
    cluster_aware_warning?: string;
    note: string;
  };
}

export interface FactorialSplitAudit {
  sample_count: number;
  positive_count: number;
  negative_count: number;
  max_positional_divergence: number;
  positional_parity_verified: boolean;
  template_distribution_pos: Record<string, number>;
  template_distribution_neg: Record<string, number>;
}

export interface FactorialMatchedAudit {
  factorial_matching_verified: boolean;
  split_audits: {
    train: FactorialSplitAudit;
    val: FactorialSplitAudit;
    test: FactorialSplitAudit;
  };
  isolation: {
    lexical_roots_train_count: number;
    lexical_roots_val_count: number;
    lexical_roots_test_count: number;
    pseudo_words_train_count: number;
    pseudo_words_val_count: number;
    pseudo_words_test_count: number;
    lexical_roots_disjoint: boolean;
    pseudo_words_disjoint: boolean;
    exact_duplicates_zero: boolean;
    normalized_duplicates_zero: boolean;
  };
}

export interface ResidualSequenceGroupProfile {
  candidate_count: number;
  unigram_entropy: number;
  top_unigrams: string[];
  bigram_entropy: number;
  top_bigrams: string[];
  trigram_entropy: number;
  top_trigrams: string[];
  positional_distribution: PositionalClassDistribution[];
  transition_matrix_4x4: number[][];
}

export interface ResidualSequenceAudit {
  groups: Record<string, ResidualSequenceGroupProfile>;
  pairwise_divergences: Record<string, {
    jensen_shannon_divergence: number;
    cosine_similarity: number;
  }>;
  stem_overlaps: Record<string, {
    overlap_count: number;
    overlap_rate: number;
    isolated: boolean;
  }>;
  matching_verification: {
    all_length_14: boolean;
    all_composition_8L_2U_2D_2S: boolean;
  };
}

export interface Phase424AuditManifest {
  schema_version: 'predict_ps_phase4_2_4_v1';
  phase: string;
  generated_at: string;
  reproducibility: {
    deterministic_seed: number;
    system_platform: string;
    python_version: string;
    scikit_learn_version: string;
    numpy_version: string;
    scipy_version: string;
    zero_network_egress_guarantee: boolean;
    zero_raw_password_export_guarantee: boolean;
    inr_zero_cost_guarantee: boolean;
  };
  cluster_aware_bootstrap_summary: {
    technique: string;
    requested_resamples: number;
    cluster_aware_justification: string;
    comparison_table: Record<string, {
      candidate_level_acc_95_ci: [number, number];
      cluster_aware_acc_95_ci: [number, number];
      candidate_level_f1_95_ci: [number, number];
      cluster_aware_f1_95_ci: [number, number];
    }>;
  };
  threshold_robustness_audit: Record<string, {
    tau_val: number;
    test_accuracy: number;
    test_macro_f1: number;
    test_fsr: number;
    test_ppr: number;
    roc_auc: number;
    regime: string;
  }>;
  factorial_matched_audit: FactorialMatchedAudit;
  residual_sequence_audit: ResidualSequenceAudit;
  experiments: Record<string, any>;
  scientific_interpretation: {
    core_finding: string;
    residual_sequence_divergence: string;
    cluster_aware_variance: string;
    research_gate_recommendation: string;
  };
}



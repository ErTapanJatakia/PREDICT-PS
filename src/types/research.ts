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

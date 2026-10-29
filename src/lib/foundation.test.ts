/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PREDICT-PS: Unit Tests for Pure Logic Foundations
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateUnbiasedSamplingThreshold,
  calculateEvaluationMetrics,
  calculateBrierScore,
  sanitizeResearchExport,
  getResearchPhases,
  getResearchQuestions,
} from './foundation';

test('calculateUnbiasedSamplingThreshold: powers of 2 have zero rejection', () => {
  // For charsetSize = 16 (hex) or 64 (base64 subset)
  const hexSpec = calculateUnbiasedSamplingThreshold(16);
  assert.equal(hexSpec.maxValidByte, 256);
  assert.equal(hexSpec.discardedByteCount, 0);
  assert.equal(hexSpec.rejectionProbability, 0);
  assert.equal(hexSpec.isPowerOfTwo, true);
  assert.equal(hexSpec.entropyBitsPerChar, 4);

  const base64Spec = calculateUnbiasedSamplingThreshold(64);
  assert.equal(base64Spec.maxValidByte, 256);
  assert.equal(base64Spec.discardedByteCount, 0);
  assert.equal(base64Spec.rejectionProbability, 0);
  assert.equal(base64Spec.isPowerOfTwo, true);
  assert.equal(base64Spec.entropyBitsPerChar, 6);
});

test('calculateUnbiasedSamplingThreshold: alphanumeric (62 chars) avoids modulo bias', () => {
  // 256 % 62 = 8.
  // maxValidByte = 256 - 8 = 248.
  // Exactly 248 / 62 = 4 equal slices of 62.
  const alpha62 = calculateUnbiasedSamplingThreshold(62);
  assert.equal(alpha62.maxValidByte, 248);
  assert.equal(alpha62.discardedByteCount, 8);
  assert.equal(alpha62.rejectionProbability, 8 / 256);
  assert.equal(alpha62.isPowerOfTwo, false);
  assert.ok(Math.abs(alpha62.entropyBitsPerChar - 5.954) < 0.01);
});

test('calculateUnbiasedSamplingThreshold: full printable ASCII (94 chars)', () => {
  // 256 % 94 = 68.
  // maxValidByte = 256 - 68 = 188. (2 * 94 = 188).
  const ascii94 = calculateUnbiasedSamplingThreshold(94);
  assert.equal(ascii94.maxValidByte, 188);
  assert.equal(ascii94.discardedByteCount, 68);
  assert.equal(ascii94.rejectionProbability, 68 / 256);
});

test('calculateUnbiasedSamplingThreshold: throws on invalid inputs', () => {
  assert.throws(() => calculateUnbiasedSamplingThreshold(0));
  assert.throws(() => calculateUnbiasedSamplingThreshold(-5));
  assert.throws(() => calculateUnbiasedSamplingThreshold(257));
});

test('calculateEvaluationMetrics: correctly computes precision, recall, macro-F1 and FSR', () => {
  // Confusion matrix:
  // TP = 80, FP = 10, TN = 90, FN = 20
  // Total = 200
  const matrix = {
    truePositives: 80,
    falsePositives: 10,
    trueNegatives: 90,
    falseNegatives: 20,
  };

  const metrics = calculateEvaluationMetrics(matrix);
  assert.equal(metrics.total, 200);
  assert.equal(metrics.accuracy, (80 + 90) / 200); // 170/200 = 0.85
  assert.equal(metrics.precision, 80 / (80 + 10)); // 80/90 = 0.8888...
  assert.equal(metrics.recall, 80 / (80 + 20)); // 80/100 = 0.80
  
  // False Strong Rate = FN / (TP + FN) = 20 / 100 = 0.20
  assert.equal(metrics.falseStrongRate, 0.20);
  // False Weak Rate = FP / (FP + TN) = 10 / 100 = 0.10
  assert.equal(metrics.falseWeakRate, 0.10);
  assert.ok(metrics.macroF1 > 0.80 && metrics.macroF1 < 0.90);
});

test('calculateEvaluationMetrics: handles edge case with all zeros gracefully', () => {
  const zeroMatrix = { truePositives: 0, falsePositives: 0, trueNegatives: 0, falseNegatives: 0 };
  const metrics = calculateEvaluationMetrics(zeroMatrix);
  assert.equal(metrics.total, 0);
  assert.equal(metrics.macroF1, 0);
  assert.equal(metrics.falseStrongRate, 0);
});

test('calculateBrierScore: evaluates calibration correctly', () => {
  // Perfect prediction
  const perfect = [
    { probability: 1.0, label: 1 },
    { probability: 0.0, label: 0 },
  ];
  assert.equal(calculateBrierScore(perfect), 0);

  // Totally wrong prediction
  const inverted = [
    { probability: 0.0, label: 1 },
    { probability: 1.0, label: 0 },
  ];
  assert.equal(calculateBrierScore(inverted), 1);

  // Moderate uncertainty
  const moderate = [
    { probability: 0.8, label: 1 }, // (0.8 - 1)^2 = 0.04
    { probability: 0.2, label: 0 }, // (0.2 - 0)^2 = 0.04
  ];
  assert.ok(Math.abs(calculateBrierScore(moderate) - 0.04) < 0.0001);
});

test('sanitizeResearchExport: prevents password or credential leakage', () => {
  const dirtyReport = {
    experimentId: 'exp-001',
    timestamp: '2026-10-29T12:00:00Z',
    metrics: {
      macroF1: 0.89,
      falseStrongRate: 0.04,
    },
    // Malicious or accidental inclusions:
    rawPassword: 'SecretP@ssword123!',
    user_token: 'xyz987654321',
    passwordHash: '$2b$12$...',
    nestedDetails: {
      testedPassword: 'MyDogName2024!',
      algorithm: 'fusion-v1',
    },
  };

  const result = sanitizeResearchExport(dirtyReport);
  assert.equal(result.clean, false);
  assert.ok(result.violations.length >= 4);

  // Sanitized object must not have forbidden keys
  assert.equal((result.sanitized as any).rawPassword, undefined);
  assert.equal((result.sanitized as any).user_token, undefined);
  assert.equal((result.sanitized as any).passwordHash, undefined);
  assert.equal((result.sanitized.nestedDetails as any).testedPassword, undefined);
  assert.equal((result.sanitized.nestedDetails as any).algorithm, 'fusion-v1');
  assert.equal((result.sanitized.metrics as any).macroF1, 0.89);
});

test('getResearchPhases: honest statuses reflect Phase 1 completed, 2-6 planned', () => {
  const phases = getResearchPhases();
  assert.equal(phases.length, 6);
  assert.equal(phases[0].id, 1);
  assert.equal(phases[0].status, 'completed');

  for (let i = 1; i < phases.length; i++) {
    assert.equal(phases[i].status, 'planned');
  }
});

test('getResearchQuestions: verifies RQ1, RQ2, and RQ3 exist', () => {
  const questions = getResearchQuestions();
  assert.equal(questions.length, 3);
  assert.deepEqual(questions.map(q => q.code), ['RQ1', 'RQ2', 'RQ3']);
});

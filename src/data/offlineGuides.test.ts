import { describe, expect, it } from 'vitest';
import { OFFLINE_FIRST_AID_GUIDES } from './offlineGuides';

describe('OFFLINE_FIRST_AID_GUIDES', () => {
  it('is non-empty', () => {
    expect(OFFLINE_FIRST_AID_GUIDES.length).toBeGreaterThan(0);
  });

  it('has no duplicate guide ids', () => {
    const ids = OFFLINE_FIRST_AID_GUIDES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every guide has both English and Hindi text for every bilingual field', () => {
    for (const guide of OFFLINE_FIRST_AID_GUIDES) {
      expect(guide.title.trim()).not.toBe('');
      expect(guide.titleHi.trim()).not.toBe('');
      expect(guide.summary.trim()).not.toBe('');
      expect(guide.summaryHi.trim()).not.toBe('');
      expect(guide.immediateAction.trim()).not.toBe('');
      expect(guide.immediateActionHi.trim()).not.toBe('');
      expect(guide.campusAdvice.trim()).not.toBe('');
      expect(guide.campusAdviceHi.trim()).not.toBe('');
    }
  });

  it('every guide has a valid severity level', () => {
    for (const guide of OFFLINE_FIRST_AID_GUIDES) {
      expect(['CRITICAL', 'MODERATE', 'LOW']).toContain(guide.severity);
    }
  });

  it('every guide has at least one step, sequentially numbered from 1', () => {
    for (const guide of OFFLINE_FIRST_AID_GUIDES) {
      expect(guide.steps.length).toBeGreaterThan(0);
      const numbers = guide.steps.map((s) => s.stepNumber);
      expect(numbers).toEqual(numbers.slice().sort((a, b) => a - b));
      expect(numbers[0]).toBe(1);
    }
  });

  it('every step has bilingual title + instruction text', () => {
    for (const guide of OFFLINE_FIRST_AID_GUIDES) {
      for (const step of guide.steps) {
        expect(step.title.trim()).not.toBe('');
        expect(step.titleHi.trim()).not.toBe('');
        expect(step.instruction.trim()).not.toBe('');
        expect(step.instructionHi.trim()).not.toBe('');
      }
    }
  });

  it('warnings and warningsHi arrays are the same length for every guide', () => {
    for (const guide of OFFLINE_FIRST_AID_GUIDES) {
      expect(guide.warningsHi.length).toBe(guide.warnings.length);
    }
  });

  it('includes the core emergency categories campus staff expect', () => {
    const ids = OFFLINE_FIRST_AID_GUIDES.map((g) => g.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'cpr-cardiac',
        'severe-bleeding',
        'burns-chemical',
        'fracture-sprain',
        'electric-shock',
        'heat-exhaustion',
        'choking-heimlich',
        'bites-stings',
      ])
    );
  });
});

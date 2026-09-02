import { describe, expect, it } from 'vitest';
import { findOfflineMatch } from './offlineTriageMatcher';
import { OFFLINE_FIRST_AID_GUIDES } from '../data/offlineGuides';

function guideId(text: string) {
  // campusProtocol is built as `${guide.campusAdvice} Location reported: ...`
  // so we match the result back to a guide by comparing campusAdvice prefix.
  const result = findOfflineMatch(text, 'Test Location');
  const guide = OFFLINE_FIRST_AID_GUIDES.find((g) => result.campusProtocol.startsWith(g.campusAdvice));
  return guide?.id;
}

describe('findOfflineMatch', () => {
  it('defaults to the CPR guide when no keywords match', () => {
    expect(guideId('the sky is blue today')).toBe(OFFLINE_FIRST_AID_GUIDES[0].id);
  });

  it.each([
    ['burn', 'burns-chemical'],
    ['chemical splash on skin', 'burns-chemical'],
    ['acid spill', 'burns-chemical'],
    ['जल गया हाथ', 'burns-chemical'],
    ['heavy bleeding from cut', 'severe-bleeding'],
    ['lots of blood', 'severe-bleeding'],
    ['खून बह रहा है', 'severe-bleeding'],
    ['suspected fracture in leg', 'fracture-sprain'],
    ['ankle sprain', 'fracture-sprain'],
    ['finger crushed in door', 'fracture-sprain'],
    ['hand smashed under weight', 'fracture-sprain'],
    ['हड्डी टूट गई', 'fracture-sprain'],
    ['उंगली कुचल गई', 'fracture-sprain'],
    ['electric shock from wire', 'electric-shock'],
    ['high voltage current', 'electric-shock'],
    ['बिजली का झटका', 'electric-shock'],
    ['feeling dizzy in heat', 'heat-exhaustion'],
    ['fainted after sun exposure', 'heat-exhaustion'],
    ['बेहोश हो गया', 'heat-exhaustion'],
    ['choking on food', 'choking-heimlich'],
    ['cannot breathe properly', 'choking-heimlich'],
    ['सांस नहीं ले पा रहा', 'choking-heimlich'],
    ['dog bite on leg', 'bites-stings'],
    ['bee sting on arm', 'bites-stings'],
    ['कुत्ते ने काट लिया', 'bites-stings'],
  ])('routes "%s" to the %s guide', (text, expectedId) => {
    expect(guideId(text)).toBe(expectedId);
  });

  it('matching is case-insensitive', () => {
    expect(guideId('SEVERE BURN ON HAND')).toBe('burns-chemical');
  });

  it('handles empty text without throwing, falling back to the default guide', () => {
    expect(() => findOfflineMatch('', 'Library')).not.toThrow();
    expect(guideId('')).toBe(OFFLINE_FIRST_AID_GUIDES[0].id);
  });

  it('embeds the reported location into both English and Hindi campus protocol text', () => {
    const result = findOfflineMatch('burn on arm', 'Hostel Block C');
    expect(result.campusProtocol).toContain('Hostel Block C');
    expect(result.campusProtocolHi).toContain('Hostel Block C');
  });

  it('recommends an ambulance only for CRITICAL severity guides', () => {
    const bleeding = findOfflineMatch('severe bleeding cut', 'Lab');
    const sprain = findOfflineMatch('mild ankle sprain', 'Field');

    const bleedingGuide = OFFLINE_FIRST_AID_GUIDES.find((g) => g.id === 'severe-bleeding')!;
    const sprainGuide = OFFLINE_FIRST_AID_GUIDES.find((g) => g.id === 'fracture-sprain')!;

    expect(bleeding.callAmbulanceRecommended).toBe(bleedingGuide.severity === 'CRITICAL');
    expect(sprain.callAmbulanceRecommended).toBe(sprainGuide.severity === 'CRITICAL');
  });

  it('preserves step ordering and critical flags from the matched guide', () => {
    const result = findOfflineMatch('choking on food', 'Cafeteria');
    const guide = OFFLINE_FIRST_AID_GUIDES.find((g) => g.id === 'choking-heimlich')!;

    expect(result.steps.map((s) => s.stepNumber)).toEqual(guide.steps.map((s) => s.stepNumber));
    expect(result.steps.map((s) => s.isCritical)).toEqual(guide.steps.map((s) => s.isCritical));
  });

  it('always returns exactly the three baseline vital signs', () => {
    const result = findOfflineMatch('anything', 'Anywhere');
    expect(result.vitalSignsToCheck).toEqual(['Consciousness', 'Breathing Rate', 'Pulse']);
  });
});

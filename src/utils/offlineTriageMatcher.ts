import { OFFLINE_FIRST_AID_GUIDES } from '../data/offlineGuides';
import { TriageResult } from '../types';

/**
 * Rule-based keyword matcher used when the device is offline or the Gemini
 * API is unreachable. Kept as a small pure function (no React, no fetch) so
 * it can be exhaustively unit tested independently of the UI — this is the
 * safety net users fall back on during real emergencies, so its behavior
 * matters as much as the AI path.
 */
export function findOfflineMatch(text: string, location: string): TriageResult {
  const q = (text || '').toLowerCase();
  let guide = OFFLINE_FIRST_AID_GUIDES[0]; // default CPR

  // NOTE: electric-shock is checked before burns-chemical because the Hindi
  // word for electricity/shock ("बिजली") contains "जल" (ज+ल) as a
  // substring, which would otherwise false-positive match the burns
  // keyword check below and misroute a shock report to the burns guide.
  if (q.includes('shock') || q.includes('electric') || q.includes('current') || q.includes('करंट') || q.includes('बिजली')) {
    guide = OFFLINE_FIRST_AID_GUIDES.find((g) => g.id === 'electric-shock') || guide;
  } else if (q.includes('burn') || q.includes('acid') || q.includes('chemical') || q.includes('जल') || q.includes('आग')) {
    guide = OFFLINE_FIRST_AID_GUIDES.find((g) => g.id === 'burns-chemical') || guide;
  } else if (q.includes('bleed') || q.includes('cut') || q.includes('blood') || q.includes('खून') || q.includes('घाव')) {
    guide = OFFLINE_FIRST_AID_GUIDES.find((g) => g.id === 'severe-bleeding') || guide;
  } else if (q.includes('fracture') || q.includes('sprain') || q.includes('bone') || q.includes('crush') || q.includes('smash') || q.includes('मोच') || q.includes('हड्डी') || q.includes('कुचल')) {
    guide = OFFLINE_FIRST_AID_GUIDES.find((g) => g.id === 'fracture-sprain') || guide;
  } else if (q.includes('heat') || q.includes('faint') || q.includes('dizzy') || q.includes('धूप') || q.includes('चक्कर') || q.includes('बेहोश')) {
    guide = OFFLINE_FIRST_AID_GUIDES.find((g) => g.id === 'heat-exhaustion') || guide;
  } else if (q.includes('chok') || q.includes('breathe') || q.includes('सांस') || q.includes('गले')) {
    guide = OFFLINE_FIRST_AID_GUIDES.find((g) => g.id === 'choking-heimlich') || guide;
  } else if (q.includes('bite') || q.includes('sting') || q.includes('dog') || q.includes('bee') || q.includes('काट') || q.includes('डंक')) {
    guide = OFFLINE_FIRST_AID_GUIDES.find((g) => g.id === 'bites-stings') || guide;
  }

  return {
    severity: guide.severity,
    title: guide.title,
    titleHi: guide.titleHi,
    summary: guide.summary,
    summaryHi: guide.summaryHi,
    immediateAction: guide.immediateAction,
    immediateActionHi: guide.immediateActionHi,
    steps: guide.steps.map((s) => ({
      stepNumber: s.stepNumber,
      title: s.title,
      titleHi: s.titleHi,
      instruction: s.instruction,
      instructionHi: s.instructionHi,
      isCritical: s.isCritical,
    })),
    warnings: guide.warnings,
    warningsHi: guide.warningsHi,
    campusProtocol: `${guide.campusAdvice} Location reported: ${location}.`,
    campusProtocolHi: `${guide.campusAdviceHi} रिपोर्ट किया गया स्थान: ${location}.`,
    vitalSignsToCheck: ['Consciousness', 'Breathing Rate', 'Pulse'],
    callAmbulanceRecommended: guide.severity === 'CRITICAL',
  };
}

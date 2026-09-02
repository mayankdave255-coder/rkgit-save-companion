export type Language = 'en' | 'hi';

export type SeverityLevel = 'CRITICAL' | 'MODERATE' | 'LOW';

export interface TriageStep {
  stepNumber: number;
  title: string;
  instruction: string;
  titleHi: string;
  instructionHi: string;
  isCritical?: boolean;
  completed?: boolean;
}

export interface TriageResult {
  severity: SeverityLevel;
  title: string;
  titleHi: string;
  summary: string;
  summaryHi: string;
  immediateAction: string;
  immediateActionHi: string;
  steps: TriageStep[];
  warnings: string[];
  warningsHi: string[];
  campusProtocol: string;
  campusProtocolHi: string;
  vitalSignsToCheck: string[];
  callAmbulanceRecommended: boolean;
  timestamp?: number;
  attachedImage?: string;
  inputDescription?: string;
  location?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  nameHi: string;
  role: string;
  roleHi: string;
  phone: string;
  ext?: string;
  category: 'security' | 'medical' | 'police' | 'women' | 'fire' | 'admin';
  icon: string;
  badge?: string;
  badgeHi?: string;
  available: string;
  availableHi: string;
}

export interface OfflineGuide {
  id: string;
  title: string;
  titleHi: string;
  category: string;
  categoryHi: string;
  severity: SeverityLevel;
  iconName: string;
  summary: string;
  summaryHi: string;
  immediateAction: string;
  immediateActionHi: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    titleHi: string;
    instruction: string;
    instructionHi: string;
    isCritical?: boolean;
  }>;
  warnings: string[];
  warningsHi: string[];
  campusAdvice: string;
  campusAdviceHi: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  nameHi: string;
  zone: string;
}

export type TriageSource = 'ai' | 'offline';

export interface GeoCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface SOSAlertRecord {
  coords: GeoCoords | null;
  locationLabel: string;
  mapsUrl: string | null;
  notifiedContactIds: string[];
}

export interface IncidentHistoryEntry {
  id: string;
  timestamp: number;
  language: Language;
  kind: 'triage' | 'sos';
  triageSource?: TriageSource;
  triage?: TriageResult;
  sos?: SOSAlertRecord;
}

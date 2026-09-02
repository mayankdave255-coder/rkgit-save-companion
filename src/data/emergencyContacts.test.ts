import { describe, expect, it } from 'vitest';
import { RKGIT_CAMPUS_LOCATIONS, RKGIT_EMERGENCY_CONTACTS } from './emergencyContacts';

const VALID_CATEGORIES = ['security', 'medical', 'police', 'women', 'fire', 'admin'];

describe('RKGIT_EMERGENCY_CONTACTS', () => {
  it('is non-empty', () => {
    expect(RKGIT_EMERGENCY_CONTACTS.length).toBeGreaterThan(0);
  });

  it('has no duplicate contact ids', () => {
    const ids = RKGIT_EMERGENCY_CONTACTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every contact has a plausible dialable phone number', () => {
    for (const contact of RKGIT_EMERGENCY_CONTACTS) {
      // Real dispatch numbers, e.g. +911202788224 or short codes like 108/112.
      expect(contact.phone).toMatch(/^\+?\d{3,15}$/);
    }
  });

  it('every contact has a valid category', () => {
    for (const contact of RKGIT_EMERGENCY_CONTACTS) {
      expect(VALID_CATEGORIES).toContain(contact.category);
    }
  });

  it('every contact has bilingual name and role text', () => {
    for (const contact of RKGIT_EMERGENCY_CONTACTS) {
      expect(contact.name.trim()).not.toBe('');
      expect(contact.nameHi.trim()).not.toBe('');
      expect(contact.role.trim()).not.toBe('');
      expect(contact.roleHi.trim()).not.toBe('');
    }
  });

  it('includes the critical campus security and ambulance dispatch lines', () => {
    const ids = RKGIT_EMERGENCY_CONTACTS.map((c) => c.id);
    expect(ids).toContain('rkgit-security');
  });
});

describe('RKGIT_CAMPUS_LOCATIONS', () => {
  it('is non-empty', () => {
    expect(RKGIT_CAMPUS_LOCATIONS.length).toBeGreaterThan(0);
  });

  it('has no duplicate location ids', () => {
    const ids = RKGIT_CAMPUS_LOCATIONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every location has bilingual name text and a zone', () => {
    for (const loc of RKGIT_CAMPUS_LOCATIONS) {
      expect(loc.name.trim()).not.toBe('');
      expect(loc.nameHi.trim()).not.toBe('');
      expect(loc.zone.trim()).not.toBe('');
    }
  });
});

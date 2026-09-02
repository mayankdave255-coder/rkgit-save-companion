import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useIncidentHistory } from './useIncidentHistory';
import { IncidentHistoryEntry } from '../types';

const STORAGE_KEY = 'rkgit_safe_incident_history';

function makeEntry(id: string, overrides: Partial<IncidentHistoryEntry> = {}): IncidentHistoryEntry {
  return {
    id,
    timestamp: Date.now(),
    language: 'en',
    kind: 'sos',
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('useIncidentHistory', () => {
  it('starts empty when localStorage has nothing saved', () => {
    const { result } = renderHook(() => useIncidentHistory());
    expect(result.current.entries).toEqual([]);
  });

  it('loads previously persisted entries on mount', () => {
    const saved = [makeEntry('a'), makeEntry('b')];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    const { result } = renderHook(() => useIncidentHistory());
    expect(result.current.entries).toHaveLength(2);
  });

  it('ignores corrupted localStorage data instead of throwing', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not valid json');
    const { result } = renderHook(() => useIncidentHistory());
    expect(result.current.entries).toEqual([]);
  });

  it('ignores non-array localStorage data', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: 'an array' }));
    const { result } = renderHook(() => useIncidentHistory());
    expect(result.current.entries).toEqual([]);
  });

  it('adds new entries to the front of the list', () => {
    const { result } = renderHook(() => useIncidentHistory());

    act(() => result.current.addEntry(makeEntry('first')));
    act(() => result.current.addEntry(makeEntry('second')));

    expect(result.current.entries.map((e) => e.id)).toEqual(['second', 'first']);
  });

  it('persists new entries to localStorage', () => {
    const { result } = renderHook(() => useIncidentHistory());
    act(() => result.current.addEntry(makeEntry('persisted')));

    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed[0].id).toBe('persisted');
  });

  it('removes an entry by id', () => {
    const { result } = renderHook(() => useIncidentHistory());
    act(() => result.current.addEntry(makeEntry('keep')));
    act(() => result.current.addEntry(makeEntry('remove-me')));

    act(() => result.current.removeEntry('remove-me'));

    expect(result.current.entries.map((e) => e.id)).toEqual(['keep']);
  });

  it('clears all entries', () => {
    const { result } = renderHook(() => useIncidentHistory());
    act(() => result.current.addEntry(makeEntry('a')));
    act(() => result.current.addEntry(makeEntry('b')));

    act(() => result.current.clearAll());

    expect(result.current.entries).toEqual([]);
  });

  it('caps stored history at 50 entries, keeping the most recent', () => {
    const { result } = renderHook(() => useIncidentHistory());

    act(() => {
      for (let i = 0; i < 55; i++) {
        result.current.addEntry(makeEntry(`entry-${i}`));
      }
    });

    expect(result.current.entries).toHaveLength(50);
    // Most recently added should be first, oldest 5 should have been dropped.
    expect(result.current.entries[0].id).toBe('entry-54');
    expect(result.current.entries.map((e) => e.id)).not.toContain('entry-0');
  });
});

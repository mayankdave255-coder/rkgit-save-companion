import { useCallback, useEffect, useState } from 'react';
import { IncidentHistoryEntry } from '../types';

const STORAGE_KEY = 'rkgit_safe_incident_history';
const MAX_ENTRIES = 50;

function loadHistory(): IncidentHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as IncidentHistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(entries: IncidentHistoryEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // Storage full or unavailable — fail silently, history is a convenience feature.
  }
}

export function useIncidentHistory() {
  const [entries, setEntries] = useState<IncidentHistoryEntry[]>(() => loadHistory());

  useEffect(() => {
    saveHistory(entries);
  }, [entries]);

  const addEntry = useCallback((entry: IncidentHistoryEntry) => {
    setEntries((prev) => [entry, ...prev].slice(0, MAX_ENTRIES));
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setEntries([]);
  }, []);

  return {
    entries,
    addEntry,
    removeEntry,
    clearAll,
  };
}

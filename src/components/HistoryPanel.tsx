import React, { useState } from 'react';
import {
  History,
  Trash2,
  Siren,
  Sparkles,
  WifiOff,
  ChevronDown,
  MapPin,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Inbox,
} from 'lucide-react';
import { Language, IncidentHistoryEntry, SeverityLevel } from '../types';

interface HistoryPanelProps {
  language: Language;
  entries: IncidentHistoryEntry[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onViewTriage: (entry: IncidentHistoryEntry) => void;
}

function formatRelativeTime(timestamp: number, language: Language): string {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return language === 'hi' ? 'अभी-अभी' : 'Just now';
  if (diffMin < 60) return language === 'hi' ? `${diffMin} मिनट पहले` : `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return language === 'hi' ? `${diffHr} घंटे पहले` : `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return language === 'hi' ? `${diffDay} दिन पहले` : `${diffDay}d ago`;
}

const severityDot: Record<SeverityLevel, string> = {
  CRITICAL: 'bg-red-500',
  MODERATE: 'bg-amber-500',
  LOW: 'bg-emerald-500',
};

const severityIcon: Record<SeverityLevel, React.ReactNode> = {
  CRITICAL: <AlertOctagon className="w-3.5 h-3.5 text-red-400" />,
  MODERATE: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  LOW: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  language,
  entries,
  onRemove,
  onClearAll,
  onViewTriage,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)] p-10 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-slate-500">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-200">
          {language === 'hi' ? 'अभी तक कोई घटना दर्ज नहीं' : 'No incidents logged yet'}
        </h3>
        <p className="text-xs text-slate-400 font-medium max-w-sm">
          {language === 'hi'
            ? 'आपके ट्राइएज परिणाम और एसओएस अलर्ट यहां स्वतः सहेजे जाएंगे — यह डेटा केवल आपके डिवाइस पर रहता है।'
            : 'Your AI triage results and SOS alerts will be saved here automatically. This data stays only on your device.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 sm:p-5 rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2.5">
          <History className="w-5 h-5 text-red-500" />
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-100">
              {language === 'hi' ? 'घटना इतिहास' : 'Incident History'}
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              {language === 'hi'
                ? `${entries.length} रिकॉर्ड • केवल इस डिवाइस पर संग्रहित`
                : `${entries.length} record${entries.length === 1 ? '' : 's'} • stored only on this device`}
            </p>
          </div>
        </div>
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 text-xs font-bold border-2 border-slate-700 hover:border-red-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.6)] transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'सभी हटाएं' : 'Clear All'}</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {entries.map((entry) => {
          const isExpanded = expandedId === entry.id;
          return (
            <div
              key={entry.id}
              className="rounded-2xl bg-slate-900 border-2 border-slate-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                className="w-full p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-950/60 transition text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center flex-shrink-0 ${
                      entry.kind === 'sos'
                        ? 'bg-red-950 border-red-800 text-red-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    {entry.kind === 'sos' ? (
                      <Siren className="w-4 h-4" />
                    ) : entry.triageSource === 'ai' ? (
                      <Sparkles className="w-4 h-4 text-red-400" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-100 truncate">
                        {entry.kind === 'sos'
                          ? language === 'hi'
                            ? 'एसओएस अलर्ट भेजा गया'
                            : 'SOS Alert Triggered'
                          : language === 'hi'
                          ? entry.triage?.titleHi
                          : entry.triage?.title}
                      </h4>
                      {entry.kind === 'triage' && entry.triage && (
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${severityDot[entry.triage.severity]}`} />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {formatRelativeTime(entry.timestamp, language)}
                      {entry.kind === 'triage' && entry.triageSource === 'offline' && (
                        <span className="ml-1.5 text-amber-400">
                          {language === 'hi' ? '(ऑफ़लाइन)' : '(offline)'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {entry.kind === 'triage' && entry.triage && severityIcon[entry.triage.severity]}
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t-2 border-slate-800 space-y-3">
                  {entry.kind === 'sos' && entry.sos && (
                    <>
                      <div className="flex items-start gap-2 text-xs text-slate-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>{entry.sos.locationLabel}</span>
                      </div>
                      {entry.sos.mapsUrl && (
                        <a
                          href={entry.sos.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs font-bold text-blue-400 hover:underline"
                        >
                          {language === 'hi' ? 'मानचित्र पर देखें →' : 'View on map →'}
                        </a>
                      )}
                      <p className="text-[11px] text-slate-500">
                        {language === 'hi'
                          ? `${entry.sos.notifiedContactIds.length} संपर्कों को सूचित किया गया`
                          : `${entry.sos.notifiedContactIds.length} contacts notified`}
                      </p>
                    </>
                  )}

                  {entry.kind === 'triage' && entry.triage && (
                    <>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">
                        {language === 'hi' ? entry.triage.summaryHi : entry.triage.summary}
                      </p>
                      <button
                        onClick={() => onViewTriage(entry)}
                        className="text-xs font-black text-red-400 hover:text-red-300 transition"
                      >
                        {language === 'hi' ? 'पूरी रिपोर्ट देखें →' : 'View full report →'}
                      </button>
                    </>
                  )}

                  <div className="pt-2 border-t border-slate-800/70 flex justify-end">
                    <button
                      onClick={() => onRemove(entry.id)}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{language === 'hi' ? 'रिकॉर्ड हटाएं' : 'Delete record'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

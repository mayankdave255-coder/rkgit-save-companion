import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TabBar, AppTab } from './components/TabBar';
import { TriageForm } from './components/TriageForm';
import { TriageResultCard } from './components/TriageResultCard';
import { OfflineGuidesSection } from './components/OfflineGuidesSection';
import { CampusSafetyStatus } from './components/CampusSafetyStatus';
import { SafetyTranslator } from './components/SafetyTranslator';
import { HistoryPanel } from './components/HistoryPanel';
import { QuickDialModal } from './components/QuickDialModal';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { SOSButton } from './components/SOSButton';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useIncidentHistory } from './hooks/useIncidentHistory';
import { Language, TriageResult, IncidentHistoryEntry, SOSAlertRecord } from './types';
import { findOfflineMatch } from './utils/offlineTriageMatcher';
import { WifiOff, AlertCircle } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rkgit_safe_lang');
      if (saved === 'hi' || saved === 'en') return saved;
    }
    return 'en';
  });

  const isOnline = useOnlineStatus();
  const [activeTab, setActiveTab] = useState<AppTab>('triage');
  const [isQuickDialOpen, setIsQuickDialOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { entries: historyEntries, addEntry, removeEntry, clearAll } = useIncidentHistory();

  useEffect(() => {
    localStorage.setItem('rkgit_safe_lang', language);
  }, [language]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const saveTriageToHistory = (result: TriageResult, source: 'ai' | 'offline') => {
    const entry: IncidentHistoryEntry = {
      id: `triage_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      language,
      kind: 'triage',
      triageSource: source,
      triage: result,
    };
    addEntry(entry);
  };

  const handleAnalyze = async (payload: {
    text: string;
    image?: string;
    location: string;
    victimAge: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    // If completely offline or API unreachable, use intelligent offline matcher
    if (!navigator.onLine) {
      setTimeout(() => {
        const fallback = findOfflineMatch(payload.text, payload.location);
        setTriageResult(fallback);
        saveTriageToHistory(fallback, 'offline');
        setIsLoading(false);
      }, 400);
      return;
    }

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: TriageResult = await response.json();
      setTriageResult(data);
      saveTriageToHistory(data, 'ai');
    } catch (err: unknown) {
      console.warn('Online triage request error, switching to local offline engine:', err);
      // Graceful fallback to verified offline rule engine
      const fallback = findOfflineMatch(payload.text, payload.location);
      setTriageResult(fallback);
      saveTriageToHistory(fallback, 'offline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTriageResult(null);
    setAttachedImage(null);
  };

  const handleViewHistoryTriage = (entry: IncidentHistoryEntry) => {
    if (entry.triage) {
      setTriageResult(entry.triage);
      setActiveTab('triage');
    }
  };

  const handleSOSSent = (record: SOSAlertRecord) => {
    const entry: IncidentHistoryEntry = {
      id: `sos_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      language,
      kind: 'sos',
      sos: record,
    };
    addEntry(entry);
  };

  return (
    <div className="min-h-screen bg-[#060c16] text-slate-100 flex flex-col font-sans selection:bg-red-900 selection:text-red-100">
      {/* Top Navigation */}
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        isOnline={isOnline}
        onOpenQuickDial={() => setIsQuickDialOpen(true)}
      />

      {/* Section Tab Bar */}
      <TabBar
        language={language}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        historyCount={historyEntries.length}
      />

      {/* Offline Mode Alert Ribbon */}
      {!isOnline && (
        <div className="bg-amber-950/90 border-b-2 border-amber-800 px-4 py-2.5 text-amber-200 text-xs flex items-center justify-between gap-3 sticky top-28 z-20">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="font-medium">
              <strong className="font-black text-amber-300">
                {language === 'hi' ? 'ऑफ़लाइन मोड सक्रिय:' : 'Offline Mode Active:'}
              </strong>{' '}
              {language === 'hi'
                ? 'स्थानीय कैश्ड फर्स्ट-एड प्रोटोकॉल एवं त्वरित सुरक्षा डायल 100% कार्यशील हैं।'
                : 'Local cached first-aid protocols & campus emergency dispatch dialers remain 100% operational without internet.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 pb-28">
        {/* Error Notification if any */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-950/80 border-2 border-red-800 text-red-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="font-bold">{errorMessage}</span>
          </div>
        )}

        {activeTab === 'triage' && (
          <section id="emergency-triage-section">
            {triageResult ? (
              <TriageResultCard
                result={triageResult}
                language={language}
                onReset={handleReset}
                onOpenQuickDial={() => setIsQuickDialOpen(true)}
              />
            ) : (
              <TriageForm
                language={language}
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                onOpenCamera={() => setIsCameraOpen(true)}
                attachedImage={attachedImage}
                onClearImage={() => setAttachedImage(null)}
                isOnline={isOnline}
              />
            )}
          </section>
        )}

        {activeTab === 'guides' && (
          <section id="offline-guides-section">
            <OfflineGuidesSection language={language} onOpenQuickDial={() => setIsQuickDialOpen(true)} />
          </section>
        )}

        {activeTab === 'safety' && (
          <section id="campus-infrastructure-section" className="space-y-6">
            <CampusSafetyStatus language={language} onOpenQuickDial={() => setIsQuickDialOpen(true)} />
            <SafetyTranslator language={language} isOnline={isOnline} />
          </section>
        )}

        {activeTab === 'history' && (
          <section id="history-section">
            <HistoryPanel
              language={language}
              entries={historyEntries}
              onRemove={removeEntry}
              onClearAll={clearAll}
              onViewTriage={handleViewHistoryTriage}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-cyan-500/10 bg-[#060c16] py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
            <span className="font-extrabold text-slate-300">RKGIT Safe Companion PWA</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {language === 'hi'
              ? 'राज कुमार गोयल इंस्टीट्यूट ऑफ टेक्नोलॉजी • दिल्ली-मेरठ रोड, गाजियाबाद'
              : 'Raj Kumar Goel Institute of Technology • 5th KM Stone, Delhi-Meerut Rd, Ghaziabad'}
          </p>
          <button
            onClick={() => setIsQuickDialOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#0a1524]/85 hover:bg-slate-800 text-red-400 font-bold border-2 border-cyan-500/20 active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
          >
            {language === 'hi' ? 'आपातकालीन सहायता' : 'Campus Emergency Contacts'}
          </button>
        </div>
      </footer>

      {/* Global Floating SOS */}
      <SOSButton language={language} onSOSSent={handleSOSSent} />

      {/* Modals */}
      <QuickDialModal
        isOpen={isQuickDialOpen}
        onClose={() => setIsQuickDialOpen(false)}
        language={language}
      />

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => setAttachedImage(img)}
        language={language}
      />
    </div>
  );
}

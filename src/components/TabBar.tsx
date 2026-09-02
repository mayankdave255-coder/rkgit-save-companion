import React from 'react';
import { Sparkles, BookOpen, Shield, History } from 'lucide-react';
import { Language } from '../types';

export type AppTab = 'triage' | 'guides' | 'safety' | 'history';

interface TabBarProps {
  language: Language;
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  historyCount: number;
}

export const TabBar: React.FC<TabBarProps> = ({ language, activeTab, onChangeTab, historyCount }) => {
  const tabs: { id: AppTab; label: string; labelHi: string; icon: React.ReactNode }[] = [
    { id: 'triage', label: 'AI Triage', labelHi: 'एआई ट्राइएज', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'guides', label: 'Guides', labelHi: 'गाइड्स', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'safety', label: 'Safety Hub', labelHi: 'सुरक्षा हब', icon: <Shield className="w-4 h-4" /> },
    { id: 'history', label: 'History', labelHi: 'इतिहास', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <nav className="sticky top-16 z-30 w-full border-b-2 border-cyan-500/20 bg-[#060c16]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex items-center gap-1.5 px-3.5 sm:px-4 py-3 text-xs sm:text-sm font-black whitespace-nowrap transition-colors cursor-pointer ${
                isActive ? 'text-cyan-300 hud-glow-text' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{language === 'hi' ? tab.labelHi : tab.label}</span>
              {tab.id === 'history' && historyCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-black bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
                  {historyCount}
                </span>
              )}
              {isActive && (
                <span className="absolute left-2 right-2 -bottom-0.5 h-[3px] rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

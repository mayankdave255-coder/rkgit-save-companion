import React from 'react';
import { PhoneCall, Wifi, WifiOff, Globe, Shield } from 'lucide-react';
import { Language } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isOnline: boolean;
  onOpenQuickDial: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  isOnline,
  onOpenQuickDial,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/25 bg-[#060c16]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-800 border border-cyan-300 flex-shrink-0 shadow-[0_0_16px_-2px_rgba(34,211,238,0.7)]">
            <Shield className="w-5 h-5 text-[#04121a]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#060c16]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-hud font-extrabold text-slate-100 text-base sm:text-lg tracking-tight">
                RKGIT <span className="text-cyan-400 hud-glow-text">Safe</span>
              </h1>
              <span className="hidden xs:inline-block px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
                AI ACTIVE
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 hidden sm:block">
              {language === 'hi' ? 'परिसर स्वास्थ्य एवं सुरक्षा साथी' : 'Campus Health & Safety Companion'}
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connectivity Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border-2 ${
              isOnline
                ? 'bg-[#0a1524]/85 border-cyan-500/20 text-slate-200'
                : 'bg-amber-950 border-amber-700 text-amber-300'
            }`}
            title={isOnline ? 'Online (Gemini Cloud Triage Active)' : 'Offline Mode (Local Cached Guides Active)'}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <Wifi className="w-3.5 h-3.5 text-emerald-400 hidden sm:inline" />
                <span className="text-[11px] hidden md:inline">Online</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">
                  {language === 'hi' ? 'ऑफ़लाइन' : 'Offline'}
                </span>
              </>
            )}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-[#0a1524]/85 rounded-xl p-1 border-2 border-cyan-500/20">
            <button
              id="lang-btn-en"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition cursor-pointer ${
                language === 'en'
                  ? 'hud-btn-primary'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              id="lang-btn-hi"
              onClick={() => onLanguageChange('hi')}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition cursor-pointer flex items-center gap-1 ${
                language === 'hi'
                  ? 'hud-btn-primary'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3 h-3" />
              हिन्दी
            </button>
          </div>

          {/* In-app Install Button */}
          <PWAInstallButton language={language} />

          {/* Emergency Quick Dial Trigger */}
          <button
            id="btn-emergency-quick-dial"
            onClick={onOpenQuickDial}
            className="hud-btn-danger flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl active:translate-x-0.5 active:translate-y-0.5 text-xs font-black transition-all cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
            <span className="tracking-wide">
              {language === 'hi' ? 'आपातकाल SOS' : 'SOS DIAL'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

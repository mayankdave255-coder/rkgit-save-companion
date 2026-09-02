import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';

interface PWAInstallButtonProps {
  language: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border-2 border-emerald-800/80 text-emerald-400 text-xs font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.6)]">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>{language === 'hi' ? 'ऐप सक्रिय' : 'PWA Active'}</span>
      </div>
    );
  }

  if (isInstallable) {
    return (
      <button
        id="btn-install-pwa"
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-500 active:translate-x-0.5 active:translate-y-0.5 border-2 border-red-400 px-3.5 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] transition cursor-pointer"
        title={language === 'hi' ? 'फोन पर ऐप इंस्टॉल करें' : 'Install PWA for fast offline access'}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{language === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="btn-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:translate-x-0.5 active:translate-y-0.5 border-2 border-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] px-3 py-1.5 text-xs font-bold text-slate-200 transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-red-400" />
          <span>{language === 'hi' ? 'iOS पर जोड़ें' : 'Add to Home'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-slate-700 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.95)] text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-red-500" />
                  <h3 className="font-extrabold text-slate-100 text-sm">
                    {language === 'hi' ? 'iPhone पर इंस्टॉल करें' : 'Install on iPhone / Safari'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs text-slate-300 font-medium">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-xl bg-red-950 border-2 border-red-800 text-red-400 flex items-center justify-center text-xs font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]">1</span>
                  <p>{language === 'hi' ? 'Safari में नीचे दिए गए Share (शेयर) बटन पर टैप करें।' : 'Tap the Share button in the Safari bottom bar.'}</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-xl bg-red-950 border-2 border-red-800 text-red-400 flex items-center justify-center text-xs font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]">2</span>
                  <p>{language === 'hi' ? 'नीचे स्क्रॉल करें और "Add to Home Screen" चुनें।' : 'Scroll down and tap "Add to Home Screen".'}</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-xl bg-red-950 border-2 border-red-800 text-red-400 flex items-center justify-center text-xs font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]">3</span>
                  <p>{language === 'hi' ? 'ऊपरी दाएं कोने में "Add" पर टैप करें।' : 'Tap "Add" in the top right corner.'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-800 hover:bg-slate-700 active:translate-x-0.5 active:translate-y-0.5 py-2.5 text-xs font-extrabold text-slate-200 border-2 border-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] transition cursor-pointer"
              >
                {language === 'hi' ? 'समझ गया' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

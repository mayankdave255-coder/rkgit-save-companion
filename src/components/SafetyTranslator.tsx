import React, { useState } from 'react';
import { Languages, ArrowLeftRight, Loader2, Copy, Check } from 'lucide-react';
import { Language } from '../types';

interface SafetyTranslatorProps {
  language: Language;
  isOnline: boolean;
}

export const SafetyTranslator: React.FC<SafetyTranslatorProps> = ({ language, isOnline }) => {
  const [sourceText, setSourceText] = useState('');
  const [targetLang, setTargetLang] = useState<'en' | 'hi'>(language === 'hi' ? 'en' : 'hi');
  const [translated, setTranslated] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setTranslated('');
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceText, targetLang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Translation failed.');
      setTranslated(data.translatedText || '');
    } catch (err) {
      setErrorMsg(
        language === 'hi'
          ? 'अनुवाद विफल हुआ। कृपया इंटरनेट कनेक्शन जांचें।'
          : 'Translation failed. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translated) return;
    navigator.clipboard.writeText(translated);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-3xl bg-[#0a1524]/85 border-2 border-cyan-500/20 p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-950/70 border-2 border-blue-800/60 flex items-center justify-center text-blue-400 flex-shrink-0">
          <Languages className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-100">
            {language === 'hi' ? 'सुरक्षा चेतावनी अनुवादक' : 'Safety Warning Translator'}
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            {language === 'hi'
              ? 'किसी भी सुरक्षा नोटिस या चेतावनी को तुरंत हिन्दी/अंग्रेज़ी में अनुवाद करें'
              : 'Instantly translate any safety notice or warning between English and Hindi'}
          </p>
        </div>
      </div>

      <textarea
        rows={3}
        value={sourceText}
        onChange={(e) => setSourceText(e.target.value)}
        placeholder={
          language === 'hi'
            ? 'जैसे: यह लैब केवल पीपीई किट पहनकर प्रवेश करें...'
            : 'e.g., Wet floor — corridor closed near Chemistry Lab until further notice...'
        }
        className="w-full bg-[#060c16] border-2 border-cyan-500/20 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={() => setTargetLang((prev) => (prev === 'hi' ? 'en' : 'hi'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#060c16] border-2 border-cyan-500/20 text-xs font-bold text-slate-300 hover:border-blue-600 transition cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
          <span>
            {language === 'hi'
              ? `लक्ष्य भाषा: ${targetLang === 'hi' ? 'हिन्दी' : 'अंग्रेज़ी'}`
              : `Target: ${targetLang === 'hi' ? 'Hindi' : 'English'}`}
          </span>
        </button>

        <button
          onClick={handleTranslate}
          disabled={!sourceText.trim() || isLoading || !isOnline}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:translate-x-0.5 active:translate-y-0.5 text-white text-xs font-black border-2 border-blue-400 transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
          <span>
            {!isOnline
              ? (language === 'hi' ? 'ऑफ़लाइन अनुपलब्ध' : 'Unavailable Offline')
              : (language === 'hi' ? 'अनुवाद करें' : 'Translate')}
          </span>
        </button>
      </div>

      {errorMsg && <p className="text-xs text-amber-300 font-medium">{errorMsg}</p>}

      {translated && (
        <div className="p-4 rounded-2xl bg-blue-950/30 border-2 border-blue-800/60 flex items-start justify-between gap-3">
          <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">{translated}</p>
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-[#0a1524]/85 hover:bg-slate-800 border-2 border-cyan-500/25 text-slate-300 flex-shrink-0 transition"
            title="Copy translation"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};

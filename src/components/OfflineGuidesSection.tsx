import React, { useState } from 'react';
import {
  HeartPulse,
  Droplet,
  Flame,
  Bone,
  Zap,
  Sun,
  AlertCircle,
  ShieldAlert,
  Search,
  BookOpen,
  ChevronRight,
  X,
  Volume2,
  VolumeX,
  AlertTriangle,
  MapPin,
  Check,
} from 'lucide-react';
import { Language, OfflineGuide } from '../types';
import { OFFLINE_FIRST_AID_GUIDES } from '../data/offlineGuides';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface OfflineGuidesSectionProps {
  language: Language;
  onOpenQuickDial: () => void;
}

export const OfflineGuidesSection: React.FC<OfflineGuidesSectionProps> = ({
  language,
  onOpenQuickDial,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<OfflineGuide | null>(null);
  const { isPlaying, playSequence, stop } = useSpeechSynthesis();

  const getGuideIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-rose-500" />;
      case 'Droplet':
        return <Droplet className="w-5 h-5 text-red-500" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'Bone':
        return <Bone className="w-5 h-5 text-amber-500" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'AlertCircle':
        return <AlertCircle className="w-5 h-5 text-purple-400" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
    }
  };

  const filteredGuides = OFFLINE_FIRST_AID_GUIDES.filter((g) => {
    const q = searchTerm.toLowerCase();
    return (
      g.title.toLowerCase().includes(q) ||
      g.titleHi.includes(q) ||
      g.summary.toLowerCase().includes(q) ||
      g.summaryHi.includes(q) ||
      g.category.toLowerCase().includes(q)
    );
  });

  const handleReadGuide = () => {
    if (!selectedGuide) return;
    if (isPlaying) {
      stop();
    } else {
      const texts = selectedGuide.steps.map((s) =>
        language === 'hi'
          ? `कदम ${s.stepNumber}: ${s.titleHi}. ${s.instructionHi}`
          : `Step ${s.stepNumber}: ${s.title}. ${s.instruction}`
      );
      playSequence(texts, language);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-500" />
            <h2 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
              {language === 'hi' ? 'ऑफ़लाइन प्राथमिक उपचार गाइड (Pre-Cached)' : 'Offline First-Aid Emergency Guides'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {language === 'hi'
              ? 'इंटरनेट न होने पर भी 100% उपलब्ध — तुरंत चरणबद्ध निर्देश'
              : 'Available 100% offline — verified instant first-aid protocols'}
          </p>
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'hi' ? 'गाइड खोजें (CPR, कट, जलन)...' : 'Search guides (CPR, burn, cut)...'}
            className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl pl-10 pr-3.5 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.6)] transition"
          />
        </div>
      </div>

      {/* Guides Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredGuides.map((guide) => (
          <div
            key={guide.id}
            onClick={() => setSelectedGuide(guide)}
            className="p-5 rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:border-red-500/70 hover:shadow-[6px_6px_0px_0px_rgba(239,68,68,0.35)] hover:-translate-y-1 transition-all flex flex-col justify-between gap-3.5 cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-950 border-2 border-slate-800 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.6)] group-hover:border-red-500/50 transition">
                  {getGuideIcon(guide.iconName)}
                </div>
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-slate-950 text-slate-300 border-2 border-slate-800 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.6)]">
                  {language === 'hi' ? guide.categoryHi : guide.category}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-100 group-hover:text-red-400 transition leading-snug">
                {language === 'hi' ? guide.titleHi : guide.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 font-medium">
                {language === 'hi' ? guide.summaryHi : guide.summary}
              </p>
            </div>

            <div className="pt-2.5 border-t-2 border-slate-800/80 flex items-center justify-between text-xs text-red-400 font-extrabold">
              <span>{language === 'hi' ? 'प्रोटोकॉल देखें' : 'View Protocol'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal for Selected Offline Guide */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.95)] overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border-b-2 border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-950 border-2 border-slate-800 flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                  {getGuideIcon(selectedGuide.iconName)}
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-red-950 text-red-400 border border-red-800 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]">
                    {language === 'hi' ? selectedGuide.categoryHi : selectedGuide.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-100 mt-1">
                    {language === 'hi' ? selectedGuide.titleHi : selectedGuide.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  stop();
                  setSelectedGuide(null);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Scroll Area */}
            <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
              {/* Voice Read Button & 10s Immediate Action */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <button
                  onClick={handleReadGuide}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer border-2 ${
                    isPlaying
                      ? 'bg-red-600 border-red-400 text-white animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-400" />}
                  <span>{isPlaying ? (language === 'hi' ? 'रोकें' : 'Stop') : (language === 'hi' ? 'आवाज़ में सुनें' : 'Read Aloud')}</span>
                </button>

                <span className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {language === 'hi' ? 'ऑफ़लाइन लोड किया गया' : 'Offline Verified Standard'}
                </span>
              </div>

              {/* Immediate Action */}
              <div className="p-4 rounded-2xl bg-red-950/40 border-2 border-red-800/80 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)] space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-red-400">
                  {language === 'hi' ? '🚨 तत्काल कार्रवाई:' : '🚨 IMMEDIATE ACTION:'}
                </h4>
                <p className="text-xs sm:text-sm font-bold text-slate-100">
                  {language === 'hi' ? selectedGuide.immediateActionHi : selectedGuide.immediateAction}
                </p>
              </div>

              {/* Steps List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                  {language === 'hi' ? 'चरणबद्ध प्राथमिक चिकित्सा:' : 'STEP-BY-STEP FIRST AID:'}
                </h4>
                <div className="space-y-3">
                  {selectedGuide.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)] flex items-start gap-3.5"
                    >
                      <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-red-950 border-2 border-red-800 text-red-400 flex items-center justify-center text-xs font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]">
                        {step.stepNumber}
                      </span>
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-100">
                          {language === 'hi' ? step.titleHi : step.title}
                        </h5>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                          {language === 'hi' ? step.instructionHi : step.instruction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warnings */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border-2 border-amber-800/80 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)] space-y-2">
                <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{language === 'hi' ? 'सावधानी — यह बिल्कुल न करें:' : 'DO NOT DO THIS (WARNINGS):'}</span>
                </h4>
                <ul className="space-y-1 text-xs text-amber-200/90 pl-5 list-disc font-medium">
                  {(language === 'hi' ? selectedGuide.warningsHi : selectedGuide.warnings).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>

              {/* Campus Advice */}
              <div className="p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>{language === 'hi' ? 'आरकेजीआईटी परिसर सहायता:' : 'RKGIT Campus Guidance:'}</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {language === 'hi' ? selectedGuide.campusAdviceHi : selectedGuide.campusAdvice}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t-2 border-slate-800 flex items-center justify-between">
              <button
                onClick={onOpenQuickDial}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:translate-x-0.5 active:translate-y-0.5 text-white text-xs font-bold border-2 border-red-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)] transition cursor-pointer"
              >
                <span>{language === 'hi' ? 'सुरक्षा को कॉल करें' : 'Call Campus Security'}</span>
              </button>
              <button
                onClick={() => {
                  stop();
                  setSelectedGuide(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border-2 border-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:bg-slate-700 cursor-pointer"
              >
                {language === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

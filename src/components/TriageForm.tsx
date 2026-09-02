import React, { useState } from 'react';
import {
  Camera,
  Mic,
  MicOff,
  Sparkles,
  MapPin,
  Image as ImageIcon,
  X,
  Zap,
  AlertTriangle,
  Beaker,
  Activity,
  Flame,
  UserRound,
} from 'lucide-react';
import { Language } from '../types';
import { RKGIT_CAMPUS_LOCATIONS } from '../data/emergencyContacts';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface TriageFormProps {
  language: Language;
  onAnalyze: (payload: {
    text: string;
    image?: string;
    location: string;
    victimAge: string;
  }) => Promise<void>;
  isLoading: boolean;
  onOpenCamera: () => void;
  attachedImage: string | null;
  onClearImage: () => void;
  isOnline: boolean;
}

export const TriageForm: React.FC<TriageFormProps> = ({
  language,
  onAnalyze,
  isLoading,
  onOpenCamera,
  attachedImage,
  onClearImage,
  isOnline,
}) => {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('ab1');
  const [victimAge, setVictimAge] = useState('Student (~20 yrs)');
  const { isSupported: isVoiceSupported, isRecording, start, stop } = useSpeechRecognition(language);

  const toggleRecording = () => {
    if (!isVoiceSupported) {
      alert(
        language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है।'
          : 'Voice speech recognition is not supported on this browser.'
      );
      return;
    }

    if (isRecording) {
      stop();
    } else {
      start((transcript) => {
        setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
      });
    }
  };

  const handlePresetSelect = (presetText: string, presetLocation: string) => {
    setDescription(presetText);
    setLocation(presetLocation);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !attachedImage) return;

    onAnalyze({
      text: description,
      image: attachedImage || undefined,
      location: RKGIT_CAMPUS_LOCATIONS.find((l) => l.id === location)?.name || location,
      victimAge,
    });
  };

  const presets = [
    {
      label: language === 'hi' ? 'रसायन लैब एसिड छींटे' : 'Lab Acid Splash',
      icon: <Beaker className="w-3.5 h-3.5 text-amber-400" />,
      text: language === 'hi' ? 'केमिस्ट्री लैब में हाथ पर सल्फ्यूरिक एसिड गिरा है, जलन और लालिमा हो रही है।' : 'Accidental sulfuric acid splash on forearm in Chemistry lab, intense burning and redness.',
      loc: 'chem_lab',
    },
    {
      label: language === 'hi' ? 'खेल मैदान मोच/फ्रैक्चर' : 'Sports Ankle Fracture',
      icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />,
      text: language === 'hi' ? 'फुटबॉल मैदान में पैर मुड़ गया, टखने में तेज दर्द, गंभीर सूजन और मरीज खड़ा नहीं हो पा रहा है।' : 'Severe twisted ankle during football match, rapid swelling, intense pain and unable to bear weight.',
      loc: 'sports',
    },
    {
      label: language === 'hi' ? 'वर्कशॉप करंट/जलना' : 'Electrical Workshop Shock',
      icon: <Zap className="w-3.5 h-3.5 text-yellow-400" />,
      text: language === 'hi' ? 'मैकेनिकल वर्कशॉप में वेल्डिंग मशीन से बिजली का झटका लगा, उंगलियों पर जलने का निशान है।' : 'Electric shock from high voltage welding machine in Mechanical workshop, minor burns on fingers, dazed state.',
      loc: 'mech_ws',
    },
    {
      label: language === 'hi' ? 'धूप से चक्कर/बेहोशी' : 'Hostel Heat Fainting',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
      text: language === 'hi' ? 'गर्मी के कारण छात्र हॉस्टल के पास चक्कर खाकर गिर पड़ा, पसीना आ रहा है और होश धीमा है।' : 'Student collapsed outside hostel due to extreme heat and dehydration, shallow breathing and pale skin.',
      loc: 'bh1',
    },
  ];

  return (
    <div className="rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)] overflow-hidden h-full flex flex-col justify-between">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border-b-2 border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border-2 border-red-500/50 flex items-center justify-center text-red-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-100 flex items-center gap-2">
              {language === 'hi' ? 'एआई आपातकालीन ट्राइएज (Multimodal)' : 'Gemini Multimodal Emergency Triage'}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {language === 'hi'
                ? 'फ़ोटो लें या लक्षण बताएं — तुरंत प्राथमिक उपचार प्रोटोकॉल पाएं'
                : 'Capture injury photo or describe symptoms for real-time first-aid'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Quick Scenario Preset Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wide uppercase">
              {language === 'hi' ? '⚡ त्वरित परीक्षण परिदृश्य (Sample Presets):' : '⚡ Quick Test Scenarios (Fast Presets):'}
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(p.text, p.loc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border-2 border-slate-800 hover:border-red-500 text-slate-300 hover:text-white text-xs font-bold whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,0.6)] hover:shadow-[3px_3px_0px_0px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  {p.icon}
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Location Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>{language === 'hi' ? 'आरकेजीआईटी परिसर स्थान' : 'RKGIT Campus Location'}</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-200 focus:outline-none focus:border-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] transition"
              >
                {RKGIT_CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {language === 'hi' ? loc.nameHi : loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Victim Details */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <UserRound className="w-3.5 h-3.5 text-red-400" />
                <span>{language === 'hi' ? 'पीड़ित का विवरण' : 'Victim Profile'}</span>
              </label>
              <input
                type="text"
                value={victimAge}
                onChange={(e) => setVictimAge(e.target.value)}
                placeholder="e.g. Student (20 yrs) / Faculty / Worker"
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-200 focus:outline-none focus:border-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] transition"
              />
            </div>
          </div>

          {/* Multimodal Photo Attachment Preview Box */}
          {attachedImage && (
            <div className="relative rounded-2xl border-2 border-red-700/80 bg-slate-950 p-3 flex items-center justify-between gap-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-800 bg-black flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.6)]">
                  <img
                    src={attachedImage}
                    alt="Injury thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-100 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-red-400" />
                    <span>{language === 'hi' ? 'चोट/खतरे की फ़ोटो संलग्न है' : 'Multimodal Image Attached'}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {language === 'hi' ? 'Gemini 3.7 विजुअल ट्राइएज हेतु तैयार' : 'Ready for visual diagnosis by Gemini 3.7'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClearImage}
                className="p-2 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-700 transition cursor-pointer"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Symptom Description & Mic Input */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-300 mb-1">
              {language === 'hi'
                ? 'आपातकालीन लक्षण / चोट का विवरण:'
                : 'Symptom / Incident Description:'}
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'जैसे: केमिस्ट्री लैब में एसिड गिरा, सांस लेने में तकलीफ, हाथ में कट लग गया...'
                    : 'e.g., Burn from acid splash in lab, deep bleeding cut from machine, student fainting...'
                }
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-3.5 pr-22 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] transition resize-none"
              />
              {isRecording && (
                <div className="absolute left-3.5 bottom-3 flex items-center gap-2 pointer-events-none">
                  <div className="flex items-end gap-0.5 h-4">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className="w-1 bg-red-500 rounded-full animate-[pulse_0.9s_ease-in-out_infinite]"
                        style={{ height: `${6 + (i % 3) * 4}px`, animationDelay: `${i * 0.12}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-wide">
                    {language === 'hi' ? 'सुन रहा है...' : 'Listening...'}
                  </span>
                </div>
              )}
              {/* Action buttons inside textarea */}
              <div className="absolute right-2.5 bottom-3 flex items-center gap-1.5">
                {/* Mic Voice Intake */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
                    isRecording
                      ? 'bg-red-600 border-red-400 text-white animate-pulse shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.6)]'
                  }`}
                  title={isRecording ? 'Listening (Click to stop)' : 'Voice input (Speak symptom)'}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Camera Trigger */}
                <button
                  type="button"
                  onClick={onOpenCamera}
                  className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
                    attachedImage
                      ? 'bg-red-950 border-red-700 text-red-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.6)]'
                  }`}
                  title="Capture or upload photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          id="btn-evaluate-triage"
          type="submit"
          disabled={isLoading || (!description.trim() && !attachedImage)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:translate-x-0.5 active:translate-y-0.5 text-white text-sm font-black border-2 border-red-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer mt-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>
                {language === 'hi'
                  ? 'Gemini एआई द्वारा विश्लेषण जारी...'
                  : 'Analyzing with Gemini Triage AI...'}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>
                {language === 'hi'
                  ? 'प्राथमिक उपचार विश्लेषण प्राप्त करें'
                  : 'Evaluate & Generate First-Aid Protocol'}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

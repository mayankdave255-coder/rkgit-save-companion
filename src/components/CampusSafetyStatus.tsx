import React from 'react';
import { Shield, MapPin, Hospital, Phone, HeartPulse, Clock, Navigation } from 'lucide-react';
import { Language } from '../types';

interface CampusSafetyStatusProps {
  language: Language;
  onOpenQuickDial: () => void;
}

export const CampusSafetyStatus: React.FC<CampusSafetyStatusProps> = ({
  language,
  onOpenQuickDial,
}) => {
  return (
    <div className="rounded-3xl bg-slate-900 border-2 border-slate-800 p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)] space-y-4 h-full flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border-2 border-red-500/40 flex items-center justify-center text-red-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-100">
              {language === 'hi' ? 'आरकेजीआईटी सुरक्षा एवं चिकित्सा अवसंरचना' : 'RKGIT Campus Safety & Medical Hub'}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {language === 'hi'
                ? 'गाजियाबाद परिसर आपातकालीन संसाधन एवं निकटतम अस्पताल'
                : 'Ghaziabad campus first responders & nearest tertiary trauma links'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenQuickDial}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:translate-x-0.5 active:translate-y-0.5 text-slate-200 text-xs font-bold self-start sm:self-center border-2 border-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] transition-all cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5 text-red-400" />
          <span>{language === 'hi' ? 'त्वरित डायल' : 'Quick Dispatch'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 flex-1">
        {/* On-Campus Dispensary */}
        <div className="p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)] hover:border-red-500/50 hover:-translate-y-0.5 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-950/70 border-2 border-red-800/60 text-red-400 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.6)]">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">
                {language === 'hi' ? 'परिसर औषधालय (Dispensary)' : 'On-Campus Dispensary'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'hi' ? 'एडमिन ब्लॉक भूतल (कमरा 12)' : 'Admin Block Ground Fl. (Room 12)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-800/40">
            <Clock className="w-3 h-3" />
            <span>{language === 'hi' ? '24x7 ऑन-कॉल नर्सिंग एवं ऑक्सीजन' : '24x7 On-Call Nurse & O2 Kit'}</span>
          </div>
        </div>

        {/* Security Gates */}
        <div className="p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)] hover:border-slate-700 hover:-translate-y-0.5 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border-2 border-slate-800 text-red-400 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.6)]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">
                {language === 'hi' ? 'सुरक्षा नियंत्रण बूथ' : 'Main Gate Security Post'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'hi' ? '5वां किमी स्टोन मुख्य द्वार' : '5th KM Stone Entrance Control'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-300 font-bold bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            <MapPin className="w-3 h-3 text-red-400" />
            <span>Ext. 224 / 225 • Barrier Dispatch</span>
          </div>
        </div>

        {/* Nearest External Hospital */}
        <div className="p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)] hover:border-blue-500/50 hover:-translate-y-0.5 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950/70 border-2 border-blue-800/60 text-blue-400 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.6)]">
              <Hospital className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">
                {language === 'hi' ? 'संजय नगर संयुक्त अस्पताल' : 'Sanjay Nagar Govt Hospital'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'hi' ? 'सेक्टर 23, गाजियाबाद (3.5 किमी)' : 'Sector 23, Ghaziabad (3.5 KM)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-blue-300 font-bold bg-blue-950/40 px-2 py-1 rounded-lg border border-blue-800/40">
            <Navigation className="w-3 h-3" />
            <span>Trauma Center • 108 Emergency</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  PhoneCall,
  ShieldAlert,
  HeartPulse,
  Radio,
  Users,
  Flame,
  Building2,
  Copy,
  Check,
  MapPin,
  Share2,
  Stethoscope,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { Language, EmergencyContact } from '../types';
import { RKGIT_EMERGENCY_CONTACTS } from '../data/emergencyContacts';

interface QuickDialModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const QuickDialModal: React.FC<QuickDialModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedLocation, setCopiedLocation] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const campusAddress = 'Raj Kumar Goel Institute of Technology (RKGIT), 5th KM Stone, Delhi-Meerut Road, Ghaziabad, UP 201003 (GPS: 28.7041° N, 77.4589° E)';

  const handleShareLocation = () => {
    const text = `🚨 EMERGENCY ALERT FROM RKGIT CAMPUS:\nLocation: ${campusAddress}\nImmediate Assistance Required!`;
    if (navigator.share) {
      navigator.share({
        title: 'RKGIT Campus Emergency SOS',
        text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedLocation(true);
      setTimeout(() => setCopiedLocation(false), 2500);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-rose-400" />;
      case 'Stethoscope':
        return <Stethoscope className="w-5 h-5 text-blue-400" />;
      case 'Radio':
        return <Radio className="w-5 h-5 text-amber-400" />;
      case 'Truck':
        return <Truck className="w-5 h-5 text-emerald-400" />;
      case 'Users':
        return <Users className="w-5 h-5 text-purple-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-slate-300" />;
      default:
        return <PhoneCall className="w-5 h-5 text-red-400" />;
    }
  };

  const filteredContacts = selectedCategory === 'all'
    ? RKGIT_EMERGENCY_CONTACTS
    : RKGIT_EMERGENCY_CONTACTS.filter((c) => c.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0a1524]/85 border-2 border-cyan-500/25 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border-b-2 border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-600/20 border-2 border-red-500/40 flex items-center justify-center text-red-400">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                {language === 'hi' ? 'आरकेजीआईटी त्वरित आपातकालीन नंबर' : 'RKGIT Security & Emergency Quick-Dial'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {language === 'hi' ? 'एक टैप से सीधे कॉल करें या लोकेशन साझा करें' : 'One-tap direct dial to campus dispatch & state services'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-2 border-cyan-500/25 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location Dispatch Banner */}
        <div className="m-4 p-3.5 rounded-2xl bg-red-950/40 border-2 border-red-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-black text-red-200 uppercase tracking-wide">
                {language === 'hi' ? 'परिसर का पता (एंबुलेंस/सुरक्षा हेतु):' : 'Campus Location for First Responders:'}
              </p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                RKGIT, 5th KM Stone, Delhi-Meerut Rd, Ghaziabad (28.7041° N, 77.4589° E)
              </p>
            </div>
          </div>
          <button
            onClick={handleShareLocation}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:translate-x-0.5 active:translate-y-0.5 text-white text-xs font-extrabold border-2 border-red-400 transition flex-shrink-0 cursor-pointer"
          >
            {copiedLocation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'कॉपी हो गया!' : 'Copied Alert!'}</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'लोकेशन शेयर करें' : 'Share SOS GPS'}</span>
              </>
            )}
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-4 pb-3 border-b-2 border-cyan-500/20 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: language === 'hi' ? 'सभी नंबर' : 'All Contacts' },
            { id: 'security', label: language === 'hi' ? 'सुरक्षा' : 'Security' },
            { id: 'medical', label: language === 'hi' ? 'स्वास्थ्य' : 'Medical' },
            { id: 'police', label: language === 'hi' ? 'पुलिस 112' : 'Police' },
            { id: 'women', label: language === 'hi' ? 'महिला सुरक्षा' : 'Women Cell' },
            { id: 'fire', label: language === 'hi' ? 'दमकल' : 'Fire 101' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border-2 ${
                selectedCategory === cat.id
                  ? 'bg-red-600 border-red-400 text-white'
                  : 'bg-[#060c16] border-cyan-500/20 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Contacts Grid */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[50vh]">
          {filteredContacts.map((contact: EmergencyContact) => (
            <div
              key={contact.id}
              className="p-4 rounded-2xl bg-[#060c16] border-2 border-cyan-500/20 hover:border-cyan-500/25 hover:-translate-y-0.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0a1524]/85 border-2 border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  {getIcon(contact.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-extrabold text-slate-100">
                      {language === 'hi' ? contact.nameHi : contact.name}
                    </h3>
                    {(contact.badge || contact.badgeHi) && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-red-950 border border-red-800 text-red-300">
                        {language === 'hi' ? contact.badgeHi : contact.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    {language === 'hi' ? contact.roleHi : contact.role}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {language === 'hi' ? contact.availableHi : contact.available}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <button
                  onClick={() => handleCopy(contact.phone, contact.id)}
                  className="p-2.5 rounded-xl bg-[#0a1524]/85 hover:bg-slate-800 text-slate-300 hover:text-white border-2 border-cyan-500/25 active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
                  title={language === 'hi' ? 'नंबर कॉपी करें' : 'Copy number'}
                >
                  {copiedId === contact.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:translate-x-0.5 active:translate-y-0.5 text-white text-xs font-black border-2 border-red-400 transition cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{contact.phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-[#060c16] border-t-2 border-cyan-500/20 flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span>RKGIT Emergency Dispatch • Ghaziabad, UP</span>
          <span className="text-red-400">In critical danger dial 112 / 108</span>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import {
  Siren,
  X,
  MapPin,
  PhoneCall,
  MessageCircle,
  CheckCircle2,
  Loader2,
  Navigation,
  ShieldAlert,
  HeartPulse,
} from 'lucide-react';
import { Language, SOSAlertRecord } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { RKGIT_EMERGENCY_CONTACTS } from '../data/emergencyContacts';

interface SOSButtonProps {
  language: Language;
  onSOSSent: (record: SOSAlertRecord) => void;
}

const HOLD_DURATION_MS = 1800;
const CAMPUS_FALLBACK_ADDRESS =
  'Raj Kumar Goel Institute of Technology (RKGIT), 5th KM Stone, Delhi-Meerut Road, Ghaziabad, UP 201003';

export const SOSButton: React.FC<SOSButtonProps> = ({ language, onSOSSent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [sentRecord, setSentRecord] = useState<SOSAlertRecord | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const { coords, error, isLoading, requestLocation, clear } = useGeolocation();

  const holdIntervalRef = useRef<number | null>(null);
  const holdStartRef = useRef<number>(0);

  const primaryContacts = RKGIT_EMERGENCY_CONTACTS.filter((c) =>
    ['rkgit-security', 'rkgit-dispensary', 'govt-ambulance'].includes(c.id)
  );

  useEffect(() => {
    if (isOpen && !sentRecord) {
      requestLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const stopHold = () => {
    if (holdIntervalRef.current) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldProgress(0);
  };

  const startHold = () => {
    if (isDispatching || sentRecord) return;
    holdStartRef.current = Date.now();
    holdIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setHoldProgress(pct);
      if (pct >= 100) {
        stopHold();
        dispatchAlert();
      }
    }, 30);
  };

  const dispatchAlert = async () => {
    setIsDispatching(true);

    const mapsUrl = coords
      ? `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
      : null;
    const locationLabel = coords
      ? `Live GPS (±${Math.round(coords.accuracy)}m)`
      : CAMPUS_FALLBACK_ADDRESS;

    const record: SOSAlertRecord = {
      coords,
      locationLabel,
      mapsUrl,
      notifiedContactIds: primaryContacts.map((c) => c.id),
    };

    // Best-effort server log — real deployments would wire this to an SMS/push gateway.
    try {
      await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch {
      // Offline or server unavailable — the on-device call/SMS/WhatsApp actions below still work.
    }

    setSentRecord(record);
    setIsDispatching(false);
    onSOSSent(record);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSentRecord(null);
    stopHold();
    clear();
  };

  const buildMessage = () => {
    const locPart = sentRecord?.mapsUrl
      ? `My live location: ${sentRecord.mapsUrl}`
      : `My location: ${CAMPUS_FALLBACK_ADDRESS}`;
    return `RKGIT SOS EMERGENCY ALERT: I need immediate help. ${locPart}`;
  };

  const smsHref = (phone: string) => `sms:${phone}?body=${encodeURIComponent(buildMessage())}`;
  const whatsappHref = () => `https://wa.me/?text=${encodeURIComponent(buildMessage())}`;

  return (
    <>
      {/* Floating SOS trigger */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Send SOS Emergency Alert"
        className="fixed z-40 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-4 sm:right-6 flex items-center gap-2 pl-3.5 pr-4 py-3.5 rounded-full bg-red-600 hover:bg-red-500 active:translate-y-0.5 text-white border-2 border-red-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] transition-all cursor-pointer"
      >
        <span className="relative flex items-center justify-center w-6 h-6">
          <span className="absolute inline-flex h-full w-full rounded-full bg-white/40 animate-ping" />
          <Siren className="w-5 h-5 relative" />
        </span>
        <span className="text-xs font-black tracking-wide">
          {language === 'hi' ? 'एसओएस' : 'SOS'}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-red-700/70 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.95)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/90 via-slate-900 to-slate-900 border-b-2 border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-600/20 border-2 border-red-500/50 flex items-center justify-center text-red-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                  <Siren className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-100">
                    {language === 'hi' ? 'आपातकालीन एसओएस अलर्ट' : 'Emergency SOS Alert'}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    {language === 'hi'
                      ? 'लाइव लोकेशन के साथ आपातकालीन संपर्कों को सतर्क करें'
                      : 'Alert designated contacts with your live location'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-2 border-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              {!sentRecord ? (
                <>
                  {/* Location status */}
                  <div className="p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-200">
                      <MapPin className="w-4 h-4 text-red-400" />
                      <span>{language === 'hi' ? 'स्थान की स्थिति' : 'Location Status'}</span>
                    </div>
                    {isLoading && (
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                        <span>{language === 'hi' ? 'लाइव जीपीएस प्राप्त कर रहा है...' : 'Fetching your live GPS position...'}</span>
                      </div>
                    )}
                    {!isLoading && coords && (
                      <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold">
                        <Navigation className="w-4 h-4" />
                        <span>
                          {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)} (±{Math.round(coords.accuracy)}m)
                        </span>
                      </div>
                    )}
                    {!isLoading && !coords && (
                      <p className="text-xs text-amber-300 font-medium">
                        {error
                          ? error
                          : language === 'hi'
                          ? 'रजिस्टर्ड परिसर पता उपयोग किया जाएगा।'
                          : 'Registered campus address will be shared instead.'}
                      </p>
                    )}
                  </div>

                  {/* Hold to confirm */}
                  <div className="p-5 rounded-2xl bg-red-950/30 border-2 border-red-800/70 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)] flex flex-col items-center gap-3">
                    <p className="text-xs text-center text-red-200 font-bold">
                      {language === 'hi'
                        ? 'भेजने के लिए बटन को 2 सेकंड दबाए रखें (गलती से चालू होने से बचाव हेतु)'
                        : 'Press and hold for 2 seconds to send (prevents accidental triggers)'}
                    </p>
                    <button
                      onPointerDown={startHold}
                      onPointerUp={stopHold}
                      onPointerLeave={stopHold}
                      disabled={isDispatching}
                      className="relative w-28 h-28 rounded-full flex items-center justify-center select-none touch-none cursor-pointer"
                    >
                      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#450a0a" strokeWidth="8" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 45}
                          strokeDashoffset={2 * Math.PI * 45 * (1 - holdProgress / 100)}
                          style={{ transition: 'stroke-dashoffset 30ms linear' }}
                        />
                      </svg>
                      <div className="w-20 h-20 rounded-full bg-red-600 border-4 border-red-400 flex flex-col items-center justify-center text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]">
                        {isDispatching ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <>
                            <Siren className="w-6 h-6" />
                            <span className="text-[10px] font-black mt-0.5">
                              {language === 'hi' ? 'दबाएं' : 'HOLD'}
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Sent confirmation */}
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border-2 border-emerald-700/80 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)] flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-emerald-300 uppercase tracking-wide">
                        {language === 'hi' ? 'अलर्ट तैयार है!' : 'Alert Ready!'}
                      </p>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">
                        {language === 'hi'
                          ? 'नीचे दिए गए संपर्कों को तुरंत कॉल करें या लोकेशन भेजें।'
                          : 'Now tap below to call or send your location to campus responders.'}
                      </p>
                    </div>
                  </div>

                  {sentRecord.mapsUrl && (
                    <a
                      href={sentRecord.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950 border-2 border-slate-800 text-xs font-bold text-blue-300 hover:border-blue-600 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,0.6)]"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{language === 'hi' ? 'मानचित्र पर मेरा स्थान देखें' : 'View my live location on Google Maps'}</span>
                    </a>
                  )}

                  <div className="space-y-2.5">
                    {primaryContacts.map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.6)] flex items-center justify-between gap-2 flex-wrap"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center flex-shrink-0 text-red-400">
                            {c.category === 'medical' ? <HeartPulse className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                          </div>
                          <p className="text-xs font-bold text-slate-100 truncate">
                            {language === 'hi' ? c.nameHi : c.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <a
                            href={`tel:${c.phone}`}
                            className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white border-2 border-red-400 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)] transition"
                            title="Call"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={smsHref(c.phone)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-slate-700 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)] transition"
                            title="SMS with location"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  <a
                    href={whatsappHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black border-2 border-emerald-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)] transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{language === 'hi' ? 'व्हाट्सएप पर लोकेशन शेयर करें' : 'Share location via WhatsApp'}</span>
                  </a>

                  <button
                    onClick={handleClose}
                    className="w-full p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border-2 border-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] transition"
                  >
                    {language === 'hi' ? 'बंद करें' : 'Close'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

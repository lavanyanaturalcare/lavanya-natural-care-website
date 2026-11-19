import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, EyeOff, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { getConsentStatus, recordConsent, revokeAllConsents } from '../services/crmService';
import { SupportedLanguage } from '../data/productKnowledge';

interface AIConsentBannerProps {
  language: SupportedLanguage;
  onConsentChange?: (granted: boolean) => void;
  onOpenPrivacyModal?: () => void;
}

export const AIConsentBanner: React.FC<AIConsentBannerProps> = ({
  language,
  onConsentChange,
  onOpenPrivacyModal
}) => {
  const [hasDecided, setHasDecided] = useState<boolean | null>(null);
  const [isConsented, setIsConsented] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const checkConsent = async () => {
      const stored = localStorage.getItem('lavanya_consent_ai_chat_storage');
      if (stored !== null) {
        const granted = stored === 'true';
        setHasDecided(true);
        setIsConsented(granted);
        onConsentChange?.(granted);
      } else {
        setHasDecided(false);
      }
    };
    checkConsent();
  }, []);

  const handleGrant = async () => {
    setIsUpdating(true);
    await recordConsent('ai_chat_storage', true);
    setIsConsented(true);
    setHasDecided(true);
    setIsUpdating(false);
    onConsentChange?.(true);
  };

  const handleDecline = async () => {
    setIsUpdating(true);
    await recordConsent('ai_chat_storage', false);
    setIsConsented(false);
    setHasDecided(true);
    setIsUpdating(false);
    onConsentChange?.(false);
  };

  const handleResetChoice = () => {
    setHasDecided(false);
  };

  const content = {
    en: {
      title: 'Your Privacy Matters at Lavanya Natural Care',
      desc: 'Would you like us to save your skincare preferences & AI routine so you can review them on your next visit? Conversations are private, never used for external AI training, and no payment details are ever collected.',
      saveBtn: 'Save My Routine',
      guestBtn: 'Continue as Private Guest',
      statusConsented: 'Privacy: Routine Saved & Protected',
      statusGuest: 'Privacy: Ephemeral Guest (Zero Chat Saved)',
      manage: 'Manage',
      retentionBadge: '90-Day Auto-Purge Policy'
    },
    hi: {
      title: 'लावण्या नेचुरल केयर में आपकी गोपनीयता सर्वोपरि है',
      desc: 'क्या आप चाहते हैं कि आपकी त्वचा प्राथमिकताएँ और दिनचर्या सुरक्षित सहेजी जाएं? बातचीत निजी है, किसी तीसरे पक्ष के मॉडल प्रशिक्षण के लिए उपयोग नहीं होती और कोई भुगतान विवरण एकत्र नहीं किया जाता।',
      saveBtn: 'मेरी दिनचर्या सहेजें',
      guestBtn: 'अतिथि के रूप में जारी रखें',
      statusConsented: 'गोपनीयता: दिनचर्या सुरक्षित सहेजी गई',
      statusGuest: 'गोपनीयता: निजी अतिथि (कोई चैट सहेजी नहीं)',
      manage: 'बदलें',
      retentionBadge: '९० दिनों में स्वतः हटाने की नीति'
    },
    gu: {
      title: 'લાવણ્ય નેચરલ કેરમાં તમારી ગોપનીયતા અગ્રતા છે',
      desc: 'શું તમે તમારી સ્કીનકેર ભલામણો અને ચેટ સાચવવા માંગો છો જેથી ફરીથી જોઈ શકો? વાતચીત ખાનગી છે, મોડેલ ટ્રેનિંગ માટે વપરાતી નથી અને કોઈ બેંક/કાર્ડ માહિતી લેવાતી નથી.',
      saveBtn: 'મારી દિનચર્યા સાચવો',
      guestBtn: 'પ્રાઈવેટ ગેસ્ટ તરીકે ચાલુ રાખો',
      statusConsented: 'ગોપનીયતા: દિનચર્યા સુરક્ષિત સચવાયેલી',
      statusGuest: 'ગોપનીયતા: પ્રાઈવેટ ગેસ્ટ (ચેટ સેવ થતી નથી)',
      manage: 'બદલો',
      retentionBadge: '૯૦ દિવસમાં ઓટો-ડિલીટ પોલિસી'
    }
  }[language];

  // Collapsed Minimal Badge when user has already made a decision
  if (hasDecided) {
    return (
      <div className="bg-cream-50/80 border border-botanical-200/50 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-botanical-900 shadow-sm backdrop-blur-sm mb-4">
        <div className="flex items-center gap-2">
          {isConsented ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <EyeOff className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span className="font-medium">
            {isConsented ? content.statusConsented : content.statusGuest}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-botanical-100/60 text-[10px] text-botanical-800">
            {content.retentionBadge}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChoice}
            className="text-[11px] font-semibold text-botanical-700 hover:text-botanical-950 underline decoration-botanical-300 transition-colors"
          >
            {content.manage}
          </button>
          {onOpenPrivacyModal && (
            <button
              onClick={onOpenPrivacyModal}
              className="text-[11px] font-medium text-warmgray-500 hover:text-botanical-800 transition-colors"
              title="Data rights & forget me"
            >
              Privacy Options
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full Initial Transparent Consent Card
  return (
    <div className="bg-white/95 border-2 border-botanical-200 rounded-2xl p-4 sm:p-5 shadow-md mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-botanical-50 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
      
      <div className="flex items-start gap-3 relative z-10">
        <div className="w-10 h-10 rounded-full bg-botanical-100 flex items-center justify-center shrink-0 text-botanical-800 mt-0.5">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-serif font-bold text-sm sm:text-base text-botanical-950">
              {content.title}
            </h4>
            <span className="text-[10px] uppercase tracking-wider font-semibold bg-gold-50 text-gold-800 border border-gold-200 px-2 py-0.5 rounded-full">
              DPDP / GDPR
            </span>
          </div>
          <p className="text-xs sm:text-sm text-warmgray-700 leading-relaxed">
            {content.desc}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleGrant}
              disabled={isUpdating}
              className="px-4 py-2 rounded-xl bg-botanical-900 text-white font-medium text-xs sm:text-sm hover:bg-botanical-800 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              {content.saveBtn}
            </button>
            <button
              onClick={handleDecline}
              disabled={isUpdating}
              className="px-4 py-2 rounded-xl border border-warmgray-300 text-botanical-900 bg-warmgray-50/50 hover:bg-warmgray-100 font-medium text-xs sm:text-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <EyeOff className="w-4 h-4 text-warmgray-500" />
              {content.guestBtn}
            </button>
            {onOpenPrivacyModal && (
              <button
                onClick={onOpenPrivacyModal}
                className="text-xs text-warmgray-500 hover:text-botanical-800 underline ml-auto py-1"
              >
                Data Rights & Erasure
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

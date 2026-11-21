// =====================================================================
// ONZNATURAL — Cookie Consent Banner (DPDP Act 2023 & GDPR Compliant)
// Allows visitors to Accept, Reject, or Customize tracking preferences.
// =====================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Shield, Check, X, Settings2 } from 'lucide-react';
import {
  getCookiePreferences,
  saveCookiePreferences,
  CookiePreferences
} from '../utils/analytics';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    const existing = getCookiePreferences();
    if (!existing) {
      // Delay slightly for smooth entry
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    } else {
      setAnalyticsConsent(existing.analytics);
      setMarketingConsent(existing.marketing);
    }

    // Listen for custom trigger to open settings (from Footer or Cookie Policy)
    const handleOpenSettings = () => {
      const current = getCookiePreferences();
      setAnalyticsConsent(Boolean(current?.analytics));
      setMarketingConsent(Boolean(current?.marketing));
      setIsCustomizing(true);
      setIsVisible(true);
    };

    window.addEventListener('openCookieSettings', handleOpenSettings);
    return () => window.removeEventListener('openCookieSettings', handleOpenSettings);
  }, []);

  const handleAcceptAll = () => {
    saveCookiePreferences({ analytics: true, marketing: true });
    setIsVisible(false);
    setIsCustomizing(false);
  };

  const handleRejectNonEssential = () => {
    saveCookiePreferences({ analytics: false, marketing: false });
    setIsVisible(false);
    setIsCustomizing(false);
  };

  const handleSaveCustom = () => {
    saveCookiePreferences({ analytics: analyticsConsent, marketing: marketingConsent });
    setIsVisible(false);
    setIsCustomizing(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Preferences"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"
    >
      <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl border border-sand-300 p-5 sm:p-6 text-primary-950 pointer-events-auto animate-fadeIn">
        {!isCustomizing ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-900 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-base sm:text-lg text-primary-950">
                  Your Privacy &amp; Botanical Experience
                </h3>
                <p className="text-xs sm:text-sm text-sand-800 leading-relaxed max-w-2xl">
                  We use cookies to ensure essential shopping cart functions and, with your consent, to understand how visitors engage with our handcrafted skincare. We never sell your personal data. Read our{' '}
                  <Link to="/cookie-policy" className="text-primary-900 font-semibold underline hover:text-accent-700">
                    Cookie Policy
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" className="text-primary-900 font-semibold underline hover:text-accent-700">
                    DPDP Privacy Notice
                  </Link>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="flex-1 md:flex-initial px-4 py-2.5 min-h-[44px] rounded-xl border border-sand-300 text-sand-800 text-xs sm:text-sm font-semibold hover:bg-sand-100 transition-colors"
              >
                Essential Only
              </button>
              <button
                type="button"
                onClick={() => setIsCustomizing(true)}
                className="px-3.5 py-2.5 min-h-[44px] rounded-xl border border-sand-300 text-sand-700 hover:text-primary-950 text-xs sm:text-sm font-semibold hover:bg-sand-100 transition-colors inline-flex items-center gap-1.5"
                title="Customize cookie choices"
              >
                <Settings2 className="w-4 h-4" />
                <span className="hidden sm:inline">Preferences</span>
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 md:flex-initial btn-primary px-5 py-2.5 min-h-[44px] rounded-xl text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-sand-200 pb-3">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-accent-700" />
                <h3 className="font-serif font-bold text-base sm:text-lg text-primary-950">
                  Customize Cookie Preferences
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizing(false)}
                className="p-2 text-sand-600 hover:text-primary-950 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close preferences"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              {/* Category 1: Essential */}
              <div className="p-3.5 rounded-xl bg-sand-100/70 border border-sand-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary-950">Strictly Necessary</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Always Active
                  </span>
                </div>
                <p className="text-sand-700 leading-relaxed">
                  Required for core storefront navigation, shopping bag persistence, and checkout security.
                </p>
              </div>

              {/* Category 2: Analytics */}
              <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary-950">Performance &amp; Analytics</span>
                  <input
                    type="checkbox"
                    id="consent-analytics"
                    checked={analyticsConsent}
                    onChange={(e) => setAnalyticsConsent(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-900 focus:ring-accent-600 cursor-pointer"
                  />
                </div>
                <label htmlFor="consent-analytics" className="text-sand-700 block leading-relaxed cursor-pointer">
                  Anonymized page views and interactions (Google Analytics 4) to improve our botanical formulations.
                </label>
              </div>

              {/* Category 3: Marketing */}
              <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary-950">Marketing &amp; Social</span>
                  <input
                    type="checkbox"
                    id="consent-marketing"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-900 focus:ring-accent-600 cursor-pointer"
                  />
                </div>
                <label htmlFor="consent-marketing" className="text-sand-700 block leading-relaxed cursor-pointer">
                  Helps us deliver updates and promotions across WhatsApp and social channels with your consent.
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomizing(false)}
                className="px-4 py-2 min-h-[44px] rounded-xl text-xs font-semibold text-sand-700 hover:text-primary-950"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="btn-primary px-5 py-2.5 min-h-[44px] rounded-xl text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

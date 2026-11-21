// =====================================================================
// ONZNATURAL — Privacy-First Analytics Loader (DPDP Act 2023 Compliant)
// Google Analytics 4 is initialized ONLY after explicit user consent.
// =====================================================================

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

const COOKIE_PREFERENCES_KEY = 'onznatural_cookie_consent';
const GA_MEASUREMENT_ID = 'G-WJ7WGB7PWX';

export const getCookiePreferences = (): CookiePreferences | null => {
  try {
    const raw = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
};

export const saveCookiePreferences = (prefs: { analytics: boolean; marketing: boolean }): CookiePreferences => {
  const fullPrefs: CookiePreferences = {
    essential: true, // Always required for cart, auth, and store operation
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    decidedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(fullPrefs));
  } catch (err) {}

  if (fullPrefs.analytics) {
    loadGoogleAnalytics();
  }

  return fullPrefs;
};

export const hasUserDecidedCookies = (): boolean => {
  return getCookiePreferences() !== null;
};

export const isAnalyticsConsented = (): boolean => {
  const prefs = getCookiePreferences();
  return Boolean(prefs?.analytics);
};

export const loadGoogleAnalytics = (): void => {
  if (typeof window === 'undefined') return;

  // Prevent duplicate script injection
  if (document.getElementById('ga-gtag-script')) return;

  try {
    const script = document.createElement('script');
    script.id = 'ga-gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: true
    });

    console.info('[Analytics] Google Analytics 4 initialized with explicit user consent.');
  } catch (err) {
    console.warn('[Analytics] Failed to initialize GA4:', err);
  }
};

export const initializeConsentAwareAnalytics = (): void => {
  if (isAnalyticsConsented()) {
    loadGoogleAnalytics();
  }
};

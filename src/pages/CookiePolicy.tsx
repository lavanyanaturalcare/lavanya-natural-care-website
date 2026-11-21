// =====================================================================
// ONZNATURAL — Cookie Policy Page (DPDP Act 2023 Compliant)
// Handcrafted Botanical Care • Vadodara, Gujarat
// =====================================================================

import React from 'react';
import { Cookie, Shield, CheckCircle2, Sliders, ExternalLink } from 'lucide-react';
import { SEO } from '../components/SEO';

export const CookiePolicy: React.FC = () => {
  const handleOpenSettings = () => {
    window.dispatchEvent(new CustomEvent('openCookieSettings'));
  };

  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <SEO
        title="Cookie Policy | ONZNATURAL"
        description="Learn how ONZNATURAL uses cookies and manages your tracking preferences for handcrafted botanical skincare orders in Vadodara and across India."
        canonical="https://onznatural.com/cookie-policy"
      />

      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-accent-700 font-bold bg-accent-100/60 px-3.5 py-1.5 rounded-full border border-accent-300">
          Transparency &amp; Privacy
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-950">
          Cookie Policy
        </h1>
        <p className="text-sand-700 text-sm sm:text-base max-w-2xl mx-auto">
          Last updated: November 2026. Aligned with India's Digital Personal Data Protection (DPDP) Act 2023.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-sand-200 shadow-sm space-y-8 text-sand-800 text-sm leading-relaxed">
        {/* Manage Preferences CTA Card */}
        <div className="p-5 rounded-2xl bg-sand-50 border border-sand-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-900 text-white flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-primary-950">Manage Your Cookie Preferences</h3>
              <p className="text-xs text-sand-700">Change or withdraw your consent anytime with one click.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenSettings}
            className="btn-primary px-4 py-2.5 min-h-[44px] rounded-xl text-white text-xs font-bold shadow-sm whitespace-nowrap cursor-pointer hover:shadow-md transition-all"
          >
            Open Cookie Settings
          </button>
        </div>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your computer or mobile device when you browse websites. They help the website remember your actions and preferences (such as shopping bag items, login sessions, and display options) over a period of time, so you do not have to keep re-entering them whenever you come back to the site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-bold text-primary-950">2. Categories of Cookies We Use</h2>

          {/* Essential */}
          <div className="p-4 rounded-xl bg-sand-50/70 border border-sand-200 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-primary-950 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Strictly Necessary Cookies (Essential)</span>
              </h3>
              <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Always Required
              </span>
            </div>
            <p className="text-xs text-sand-700 leading-relaxed">
              These cookies are essential for you to browse the ONZNATURAL website and use its features, such as adding handcrafted soaps to your bag, authenticating your account, and checking out. Because the website cannot function properly without them, they cannot be switched off in our systems.
            </p>
          </div>

          {/* Analytics */}
          <div className="p-4 rounded-xl bg-sand-50/70 border border-sand-200 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-primary-950 flex items-center gap-2">
                <Cookie className="w-4 h-4 text-accent-700" />
                <span>Performance &amp; Analytics Cookies</span>
              </h3>
              <span className="text-[10px] uppercase font-bold text-sand-800 bg-sand-200 px-2 py-0.5 rounded-full">
                Requires Consent
              </span>
            </div>
            <p className="text-xs text-sand-700 leading-relaxed">
              With your explicit consent, we load Google Analytics 4 (GA4) with IP anonymization enabled. These cookies collect aggregated, anonymous information about how visitors navigate our site, which products (e.g. Neem &amp; Tulsi or Kesuda Palash soap) are popular, and where users experience friction, helping us continuously refine our botanical formulations and user experience.
            </p>
          </div>

          {/* Marketing */}
          <div className="p-4 rounded-xl bg-sand-50/70 border border-sand-200 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-primary-950 flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent-700" />
                <span>Marketing &amp; Social Cookies</span>
              </h3>
              <span className="text-[10px] uppercase font-bold text-sand-800 bg-sand-200 px-2 py-0.5 rounded-full">
                Requires Consent
              </span>
            </div>
            <p className="text-xs text-sand-700 leading-relaxed">
              These cookies may be used to measure the effectiveness of our seasonal announcements and social campaigns (such as festival bundles). We do not serve third-party behavioural ad networks or sell your profile to data brokers.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">3. Specific Cookies Deployed</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-sand-300 text-primary-950 bg-sand-100/50">
                  <th className="py-2.5 px-3 font-bold">Cookie Name</th>
                  <th className="py-2.5 px-3 font-bold">Provider</th>
                  <th className="py-2.5 px-3 font-bold">Purpose</th>
                  <th className="py-2.5 px-3 font-bold">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200 text-sand-800">
                <tr>
                  <td className="py-2.5 px-3 font-mono">onznatural_wishlist</td>
                  <td className="py-2.5 px-3">ONZNATURAL</td>
                  <td className="py-2.5 px-3">Stores saved handcrafted skincare items locally.</td>
                  <td className="py-2.5 px-3">Persistent (Local)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono">onznatural_cookie_consent</td>
                  <td className="py-2.5 px-3">ONZNATURAL</td>
                  <td className="py-2.5 px-3">Remembers your cookie preferences across sessions.</td>
                  <td className="py-2.5 px-3">1 Year</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono">sb-*-auth-token</td>
                  <td className="py-2.5 px-3">Supabase</td>
                  <td className="py-2.5 px-3">Maintains secure customer and administrator sign-in.</td>
                  <td className="py-2.5 px-3">Session</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono">_ga, _ga_*</td>
                  <td className="py-2.5 px-3">Google (GA4)</td>
                  <td className="py-2.5 px-3">Aggregated traffic analysis (only with user consent).</td>
                  <td className="py-2.5 px-3">2 Years</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">4. How to Control Cookies in Your Browser</h2>
          <p>
            You can configure your web browser to delete existing cookies and block new ones. Please note that disabling essential cookies may impact your ability to place orders or sign in.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Google Chrome:</strong> Settings &gt; Privacy and security &gt; Third-party cookies</li>
            <li><strong>Mozilla Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
            <li><strong>Apple Safari:</strong> Settings &gt; Safari &gt; Advanced &gt; Block All Cookies</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-sand-200">
          <h2 className="font-serif text-2xl font-bold text-primary-950">5. Questions &amp; Grievances</h2>
          <p>
            For any queries regarding our cookie practices or your data protection rights under the DPDP Act 2023, contact our Data Grievance Officer:
          </p>
          <div className="bg-sand-50 p-4 rounded-xl border border-sand-300 text-xs text-primary-950 space-y-1">
            <p className="font-bold">ONZNATURAL — Data Grievance Office</p>
            <p>FF-22 Pujar Complex, Subhanpura, Vadodara, Gujarat 390023, India</p>
            <p>Email: <a href="mailto:care@onznatural.com" className="text-primary-900 underline font-semibold">care@onznatural.com</a> | WhatsApp: <a href="https://wa.me/919726739515" className="text-primary-900 underline font-semibold">+91 97267 39515</a></p>
          </div>
        </section>
      </div>
    </div>
  );
};

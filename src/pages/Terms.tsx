// =====================================================================
// ONZNATURAL — Terms & Conditions (Indian E-Commerce Compliant)
// Handcrafted Botanical Care • Vadodara, Gujarat
// =====================================================================

import React from 'react';
import { FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SEO } from '../components/SEO';

export const Terms: React.FC = () => {
  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <SEO
        title="Terms & Conditions | ONZNATURAL"
        description="Terms of service, pricing, and small-batch handcrafted product disclosures for ONZNATURAL in Vadodara, Gujarat."
        canonical="https://onznatural.com/terms"
      />

      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-accent-700 font-bold bg-accent-100/60 px-3.5 py-1.5 rounded-full border border-accent-300">
          Legal &amp; Operational
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-950">
          Terms &amp; Conditions
        </h1>
        <p className="text-sand-700 text-sm sm:text-base max-w-2xl mx-auto">
          Last updated: November 2026. Governing your use of our storefront and handcrafted orders.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-sand-200 shadow-sm space-y-8 text-sand-800 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">1. Electronic Record &amp; Acceptance</h2>
          <p>
            This document is an electronic record generated in accordance with the Information Technology Act, 2000 and rules thereunder as applicable, and the amended provisions pertaining to electronic records in various statutes. By accessing <a href="https://onznatural.com" className="text-primary-900 underline font-semibold">https://onznatural.com</a>, placing orders via UPI or WhatsApp, or using our AI Skincare Consultant, you agree to be bound by these Terms and Conditions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">2. Handcrafted Small-Batch Variations</h2>
          <p>
            All soaps, body lotions, and botanical items at ONZNATURAL are handcrafted in small artisanal batches using natural plant oils, raw unrefined butters, and real botanical extracts (such as Kesuda/Palash flowers, Neem, Tulsi, Kokum, and Turmeric). As a result:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Slight variations in color, natural marbling pattern, and botanical scent intensity are authentic hallmarks of genuine cold-process soapmaking, not defects.</li>
            <li>Bar weights are approximately 100 grams at packaging; natural cure evaporation may cause slight weight differences over time.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">3. Botanical Skincare &amp; Patch Test Advisory</h2>
          <div className="p-4 rounded-xl bg-sand-50 border border-sand-300 text-xs space-y-2">
            <p className="font-bold text-primary-950 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Important Health Advisory &amp; Patch Test Notice:</span>
            </p>
            <p className="text-sand-800">
              Our products are intended for general cosmetic cleansing, hydration, and botanical comfort. They are not medical products and do not diagnose, treat, or cure dermatological conditions. Because natural plant oils and essential oils can cause sensitivity in rare cases, we advise performing a 24-hour patch test on your inner arm before first use.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">4. Pricing, Orders &amp; Cancellations</h2>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
            <li><strong>Prices:</strong> All prices are in Indian National Rupees (INR) and inclusive of all applicable taxes.</li>
            <li><strong>Order Confirmation:</strong> An order is confirmed once payment via UPI is verified or WhatsApp confirmation is acknowledged by our workshop staff.</li>
            <li><strong>Cancellations:</strong> You may cancel your order at zero charge at any time before dispatch. Once dispatched with our courier partner, returns follow our Return &amp; Refund Policy.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">5. Governing Law &amp; Exclusive Jurisdiction</h2>
          <p>
            These terms and any disputes arising out of your purchases from ONZNATURAL are governed exclusively by the laws of India, with jurisdiction vested strictly in the competent courts of <strong>Vadodara, Gujarat</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};

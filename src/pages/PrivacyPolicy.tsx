// =====================================================================
// ONZNATURAL — Comprehensive DPDP Act 2023 Privacy Policy
// Handcrafted Botanical Care • Vadodara, Gujarat
// =====================================================================

import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, Trash2, Mail, CheckCircle2, AlertCircle, Phone, MapPin } from 'lucide-react';
import { SEO } from '../components/SEO';
import { PrivacyDataModal } from '../components/PrivacyDataModal';

export const PrivacyPolicy: React.FC = () => {
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <SEO
        title="Privacy Policy (DPDP Act 2023) | ONZNATURAL"
        description="ONZNATURAL customer privacy notice and personal data rights under the Indian Digital Personal Data Protection (DPDP) Act 2023."
        canonical="https://onznatural.com/privacy-policy"
      />

      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-accent-700 font-bold bg-accent-100/60 px-3.5 py-1.5 rounded-full border border-accent-300">
          DPDP Act 2023 Compliance Notice
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-950">
          Privacy Policy
        </h1>
        <p className="text-sand-700 text-sm sm:text-base max-w-2xl mx-auto">
          Last updated: November 2026. Your privacy and trust are sacred to our handcrafted botanical workshop.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-sand-200 shadow-sm space-y-8 text-sand-800 text-sm leading-relaxed">
        {/* Quick Action: Data Rights & Erasure */}
        <div className="p-5 rounded-2xl bg-sand-50 border border-sand-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-900 text-white flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-primary-950">Data Access &amp; Erasure Rights</h3>
              <p className="text-xs text-sand-700">Exercise your DPDP rights to inspect, revoke consent, or delete your records.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDataModalOpen(true)}
            className="btn-primary px-4 py-2.5 min-h-[44px] rounded-xl text-white text-xs font-bold shadow-sm whitespace-nowrap cursor-pointer hover:shadow-md transition-all"
          >
            Manage Data &amp; Deletion
          </button>
        </div>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">1. Introduction &amp; Data Fiduciary</h2>
          <p>
            This Privacy Notice is published in compliance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong> of India.
          </p>
          <p>
            The Data Fiduciary responsible for your personal data is:
          </p>
          <div className="bg-sand-50 p-4 rounded-xl border border-sand-200 text-xs font-medium text-primary-950">
            <strong>ONZNATURAL</strong> (Handcrafted Botanical Skincare)<br />
            FF-22 Pujar Complex, Subhanpura, Vadodara, Gujarat 390023, India<br />
            Email: <a href="mailto:care@onznatural.com" className="text-primary-900 underline">care@onznatural.com</a> | Phone: +91 97267 39515
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">2. Personal Data We Collect</h2>
          <p>
            We adhere strictly to the principle of <em>Data Minimisation</em>. We collect only what is strictly necessary to formulate and dispatch our artisan botanical care:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
            <li>
              <strong>Order &amp; Fulfilment Information:</strong> Name, delivery address, pincode, phone number, and WhatsApp contact to coordinate shipments from Vadodara across India.
            </li>
            <li>
              <strong>Account Authentication:</strong> Email address and cryptographically hashed passwords when you choose to create an account for tracking routine orders.
            </li>
            <li>
              <strong>Ayurvedic &amp; Skincare Preferences:</strong> Skin type selections or concerns submitted during consultations with our Botanical AI Consultant, processed strictly with your prior consent.
            </li>
            <li>
              <strong>Technical Logs:</strong> Anonymised device type, browser metadata, and essential security cookies necessary for fraud prevention, rate-limiting, and storefront stability.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">3. Lawful Grounds for Processing</h2>
          <p>
            We process your personal data under the following legal bases:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Consent:</strong> Explicitly obtained for newsletter updates, cookie tracking, and AI routine saving.</li>
            <li><strong>Contractual Performance:</strong> Necessary to package, dispatch, invoice, and deliver products you order.</li>
            <li><strong>Legal Obligation:</strong> Complying with tax and invoice retention laws under Indian law (GST regulations).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">4. Payment Safety &amp; Cardholder Data Protection</h2>
          <p>
            <strong>Your financial safety is absolute:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>We do <strong>not</strong> collect, process, or store credit card numbers, debit card numbers, CVVs, or internet banking passwords on our servers.</li>
            <li>All UPI payments (Google Pay, PhonePe, Paytm, BHIM) occur via secure app deep-links directly between your bank and our verified merchant account.</li>
            <li>Cash on Delivery (COD) transactions require payment only upon physical receipt of your package.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">5. Your Statutory Rights (DPDP Act 2023)</h2>
          <p>
            As a Data Principal under Indian law, you possess enforceable rights regarding your personal information:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200">
              <h4 className="font-bold text-primary-950 text-xs mb-1">Right to Access</h4>
              <p className="text-[11px] text-sand-700">Request a complete summary of your personal data processed by ONZNATURAL.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200">
              <h4 className="font-bold text-primary-950 text-xs mb-1">Right to Correction &amp; Erasure</h4>
              <p className="text-[11px] text-sand-700">Request correction of inaccurate data or permanent deletion of your profile.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200">
              <h4 className="font-bold text-primary-950 text-xs mb-1">Right of Grievance Redressal</h4>
              <p className="text-[11px] text-sand-700">Submit grievances directly to our Grievance Officer, resolved within 30 days.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200">
              <h4 className="font-bold text-primary-950 text-xs mb-1">Right to Nominate</h4>
              <p className="text-[11px] text-sand-700">Designate an individual to exercise your rights in the event of death or incapacity.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">6. Data Retention &amp; Security Safeguards</h2>
          <p>
            We store data using industry-standard PostgreSQL with Row Level Security (RLS), TLS 1.3 encryption in transit, and bcrypt password hashing. Data is retained only for the duration required to complete orders and fulfill tax reporting requirements (typically 7 years for GST invoices), after which personal identifiers are permanently purged.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-sand-200">
          <h2 className="font-serif text-2xl font-bold text-primary-950">7. Data Grievance Officer</h2>
          <p>
            In accordance with Section 12 of the DPDP Act 2023, you may contact our designated Grievance Officer:
          </p>
          <div className="bg-sand-50 p-4 rounded-xl border border-sand-300 text-xs text-primary-950 space-y-1">
            <p className="font-bold">Grievance Redressal Officer — ONZNATURAL</p>
            <p>FF-22 Pujar Complex, Subhanpura, Vadodara, Gujarat 390023, India</p>
            <p>Email: <a href="mailto:care@onznatural.com" className="text-primary-900 underline font-semibold">care@onznatural.com</a> (Subject: "Data Grievance / DPDP Request")</p>
            <p>Response Timeline: Within 48 hours acknowledgment, full resolution within 30 days.</p>
          </div>
        </section>
      </div>

      <PrivacyDataModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />
    </div>
  );
};

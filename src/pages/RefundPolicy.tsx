// =====================================================================
// ONZNATURAL — Return & Refund Policy (Indian E-Commerce Compliant)
// Handcrafted Botanical Care • Vadodara, Gujarat
// =====================================================================

import React from 'react';
import { ShieldAlert, RefreshCw, CheckCircle2, MessageCircle, Clock } from 'lucide-react';
import { SEO } from '../components/SEO';
import { WhatsAppButton } from '../components/WhatsAppButton';

export const RefundPolicy: React.FC = () => {
  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <SEO
        title="Return & Refund Policy | ONZNATURAL"
        description="Return and refund terms for handcrafted botanical skincare by ONZNATURAL, Vadodara, Gujarat. Clear timelines and customer assurance."
        canonical="https://onznatural.com/refund-policy"
      />

      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-accent-700 font-bold bg-accent-100/60 px-3.5 py-1.5 rounded-full border border-accent-300">
          Customer Assurance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-950">
          Return, Replacement &amp; Refund Policy
        </h1>
        <p className="text-sand-700 text-sm sm:text-base max-w-2xl mx-auto">
          We stand with complete integrity behind the purity, safety, and craftsmanship of our artisan skincare.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-sand-200 shadow-sm space-y-8 text-sand-800 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">1. Hygiene &amp; Personal Care Integrity</h2>
          <p>
            Due to the handcrafted nature and personal hygiene classification of our cold-process botanical soaps, body lotions, and skincare, <strong>we cannot accept returns of opened, unsealed, tested, or used products</strong>. This strict policy ensures every customer receives unopened, pristine skincare direct from our curing racks.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">2. Transit Damage or Incorrect Deliveries</h2>
          <p>
            If your package is damaged during courier transit, or if you receive an item different from what you ordered, we guarantee an <strong>immediate free replacement or full refund</strong>:
          </p>
          <div className="p-4 rounded-xl bg-sand-50 border border-sand-300 space-y-2 text-xs">
            <p className="font-bold text-primary-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Simple 3-Step Replacement Process:</span>
            </p>
            <ol className="list-decimal pl-4 space-y-1.5 text-sand-700">
              <li>Message us on WhatsApp at <strong>+91 97267 39515</strong> or email <strong>care@onznatural.com</strong> within <strong>48 hours</strong> of parcel delivery.</li>
              <li>Share a clear photo or short unboxing video showing the outer shipping box and the damaged product.</li>
              <li>Our workshop will dispatch a fresh replacement within 24 hours at zero extra charge, or process a full refund to your original payment method.</li>
            </ol>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">3. Refund Timelines</h2>
          <p>
            Once approved, refunds are credited back to your original payment method (UPI, bank account, or card) within <strong>3 to 5 business days</strong>. For Cash on Delivery (COD) orders, refunds are issued directly via UPI (GPay/PhonePe/Paytm).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-primary-950">4. Cancellations Prior to Dispatch</h2>
          <p>
            You may cancel any order before it is dispatched by messaging us on WhatsApp or emailing <code>care@onznatural.com</code>. Once the parcel is handed over to the courier partner, cancellations cannot be processed.
          </p>
        </section>

        <div className="pt-4 border-t border-sand-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-sand-600">
            Have questions regarding an existing order? Reach our customer desk:
          </p>
          <WhatsAppButton label="Contact Support on WhatsApp" className="text-xs py-2.5 px-4" />
        </div>
      </div>
    </div>
  );
};

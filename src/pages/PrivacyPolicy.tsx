import React from 'react';
import { Lock, Eye, ShieldCheck, Mail } from 'lucide-react';
import { SEO } from '../components/SEO';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <SEO
        title="Privacy Policy | ONZNATURAL"
        description="Learn how ONZNATURAL protects and respects customer privacy and personal data for orders in Vadodara and across India."
      />

      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-gold-700 font-bold bg-gold-100/60 px-3.5 py-1.5 rounded-full border border-gold-300">
          Privacy & Security
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-botanical-950">
          Privacy Policy
        </h1>
        <p className="text-warmgray-600 text-sm sm:text-base max-w-2xl mx-auto">
          Last updated: November 2026. Your privacy is paramount to ONZNATURAL.
        </p>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 space-y-8 text-warmgray-700 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-botanical-950">1. Information We Collect</h2>
          <p>
            When you place an order, make an inquiry on WhatsApp, or consult our AI Skincare Consultant, we collect only the minimum information necessary to serve you:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Contact details:</strong> Name, WhatsApp phone number, and delivery address to dispatch orders.</li>
            <li><strong>Order details:</strong> Selected handcrafted products, quantities, and payment confirmation.</li>
            <li><strong>Skincare preferences:</strong> Skin type selections or concerns submitted to the AI consultant (stored temporarily in browser session storage only).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-botanical-950">2. How We Use Your Information</h2>
          <p>
            We use your data solely to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Process, pack, and deliver your natural skincare orders.</li>
            <li>Communicate order status and tracking updates directly on WhatsApp or phone.</li>
            <li>Respond to ingredient queries and customer support requests.</li>
          </ul>
          <p className="font-semibold text-botanical-900">
            We will never sell, rent, or trade your personal information to third-party marketing companies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-botanical-950">3. Payment Security</h2>
          <p>
            Payments made via UPI (GPay, PhonePe, Paytm, BHIM) are processed through your own trusted banking applications directly to our verified merchant account. We do not store or have access to your bank passwords, debit/credit card PINs, or UPI security credentials.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-botanical-950">4. Contacting Us About Privacy</h2>
          <p>
            For any questions or requests regarding your personal data, you can reach us at:
          </p>
          <p className="text-xs bg-cream-50 p-4 rounded-xl border border-cream-200 font-medium text-botanical-950">
            ONZNATURAL<br />
            FF-22 Pujar Complex, Subhanpura, Vadodara, Gujarat 390023, India<br />
            Email: care@onznatural.com | Phone: +91 97267 39515
          </p>
        </section>
      </div>
    </div>
  );
};

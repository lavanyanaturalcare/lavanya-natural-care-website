import React from 'react';
import { ShieldAlert, RefreshCw, CheckCircle2, MessageCircle } from 'lucide-react';
import { SEO } from '../components/SEO';
import { WhatsAppButton } from '../components/WhatsAppButton';

export const RefundPolicy: React.FC = () => {
  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <SEO
        title="Return & Refund Policy | ONZNATURAL"
        description="Return and refund terms for handcrafted botanical skincare by ONZNATURAL, Vadodara, Gujarat."
      />

      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-gold-700 font-bold bg-gold-100/60 px-3.5 py-1.5 rounded-full border border-gold-300">
          Customer Assurance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-botanical-950">
          Return, Replacement & Refund Policy
        </h1>
        <p className="text-warmgray-600 text-sm sm:text-base max-w-2xl mx-auto">
          We stand by the purity, quality, and craftsmanship of our natural soaps. Here is how we handle returns and replacements.
        </p>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 space-y-8 text-warmgray-700 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-botanical-950">1. Hygiene & Personal Care Notice</h2>
          <p>
            Due to the handcrafted, natural, and personal hygiene nature of our skincare products (soaps, body washes, creams, and lip balms), <strong>we cannot accept returns of opened, tested, or used items</strong>. This ensures the safety and purity of products for all our customers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-botanical-950">2. Damaged, Defective, or Incorrect Deliveries</h2>
          <p>
            If your package arrives physically damaged during transit, or if you receive an incorrect product, we will issue an <strong>immediate free replacement or full refund</strong>.
          </p>
          <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 space-y-2 text-xs">
            <p className="font-bold text-botanical-950">To request a replacement:</p>
            <ol className="list-decimal pl-4 space-y-1 text-warmgray-700">
              <li>Contact us on WhatsApp at <strong>+91 97267 39515</strong> within <strong>48 hours</strong> of parcel delivery.</li>
              <li>Share a clear photo or short video showing the outer shipping box and the damaged product.</li>
              <li>Our team will dispatch a replacement within 24 hours at zero additional cost, or initiate a direct UPI/bank refund.</li>
            </ol>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-botanical-950">3. Refund Processing Timeline</h2>
          <p>
            Once approved, refunds are credited back to your original payment method (UPI, bank account, or card) within <strong>3 to 5 business days</strong>. For Cash on Delivery orders, refunds are issued directly via UPI (GPay/PhonePe/Paytm).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-botanical-950">4. Cancellations</h2>
          <p>
            You may cancel any order before it is dispatched by messaging us on WhatsApp or emailing <code>care@onznatural.com</code>. Once the parcel is handed over to the courier partner, cancellations cannot be processed.
          </p>
        </section>

        <div className="pt-4 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-warmgray-500">
            Have questions regarding an order? Reach our customer support desk:
          </p>
          <WhatsAppButton label="Contact Support on WhatsApp" className="text-xs py-2.5 px-4" />
        </div>
      </div>
    </div>
  );
};

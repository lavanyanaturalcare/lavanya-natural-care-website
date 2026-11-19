import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';
import { SEO } from '../components/SEO';

export const Terms: React.FC = () => {
  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <SEO
        title="Terms & Conditions | Lavanya Natural Care"
        description="Terms of service, pricing, and small-batch handcrafted product disclosures for Lavanya Natural Care in Vadodara, Gujarat."
      />

      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-gold-700 font-bold bg-gold-100/60 px-3.5 py-1.5 rounded-full border border-gold-300">
          Legal & Operational
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-botanical-950">
          Terms & Conditions
        </h1>
        <p className="text-warmgray-600 text-sm sm:text-base max-w-2xl mx-auto">
          Please review the terms that govern the use of our website and purchase of Lavanya Natural Care products.
        </p>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 space-y-8 text-warmgray-700 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-botanical-950">1. Handcrafted Small-Batch Variations</h2>
          <p>
            All soaps and skincare items at Lavanya Natural Care are handcrafted in small batches using natural plant oils, raw unrefined butters, and real botanical extracts (such as Kesuda petals, Neem, and Turmeric). As a result:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Slight variations in color, natural marbling, and scent intensity are natural hallmarks of authentic artisan soapmaking and not product defects.</li>
            <li>Bar weights are approximately 100 grams; slight weight shifts may occur as water evaporates during natural curing.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-botanical-950">2. Botanical Skincare & Health Disclaimer</h2>
          <p>
            Lavanya Natural Care products are designed for general cosmetic cleansing and botanical skincare comfort.
          </p>
          <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 text-xs space-y-2">
            <p className="font-bold text-botanical-950">Important Health Advisory:</p>
            <p>
              Our products are not intended to diagnose, treat, cure, or prevent any medical or dermatological condition. If you have known allergies to specific plant oils (e.g. coconut, essential oils), please check the ingredient list on each product page and perform a 24-hour patch test before full use.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-botanical-950">3. Pricing & Taxes</h2>
          <p>
            All product prices listed on our website are in Indian Rupees (INR) and are inclusive of all applicable taxes. Shipping charges, where applicable, are calculated and clearly displayed prior to order confirmation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-botanical-950">4. Governing Law & Jurisdiction</h2>
          <p>
            These terms and all orders placed through Lavanya Natural Care are governed by and construed in accordance with the laws of India, under the exclusive jurisdiction of the competent courts in <strong>Vadodara, Gujarat</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};

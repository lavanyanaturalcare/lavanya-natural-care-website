import React from 'react';
import { Truck, Clock, MapPin, ShieldCheck, HelpCircle } from 'lucide-react';
import { SEO } from '../components/SEO';
import { WhatsAppButton } from '../components/WhatsAppButton';

export const ShippingDelivery: React.FC = () => {
  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <SEO
        title="Shipping & Delivery Policy | ONZNATURAL"
        description="Delivery timelines, packaging, and shipping rates for handcrafted soaps across Vadodara, Gujarat, and pan-India by ONZNATURAL."
      />

      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-gold-700 font-bold bg-gold-100/60 px-3.5 py-1.5 rounded-full border border-gold-300">
          Delivery Information
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-botanical-950">
          Shipping & Delivery Policy
        </h1>
        <p className="text-warmgray-600 text-sm sm:text-base max-w-2xl mx-auto">
          We handcraft our soaps in small batches in Vadodara, Gujarat and dispatch every order with plastic-free, eco-conscious protective packaging.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-2 text-center">
          <MapPin className="w-8 h-8 text-botanical-800 mx-auto" />
          <h2 className="font-serif text-lg font-bold text-botanical-950">Vadodara Local</h2>
          <p className="text-xs text-warmgray-600">
            Same-day or next-day delivery across Vadodara. Local pickup available at Subhanpura.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-2 text-center">
          <Truck className="w-8 h-8 text-botanical-800 mx-auto" />
          <h2 className="font-serif text-lg font-bold text-botanical-950">Pan-India Shipping</h2>
          <p className="text-xs text-warmgray-600">
            Delivered in 3 to 6 business days via trusted express courier partners (Delhivery, DTDC, India Post).
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-2 text-center">
          <ShieldCheck className="w-8 h-8 text-botanical-800 mx-auto" />
          <h2 className="font-serif text-lg font-bold text-botanical-950">Safe Eco Packaging</h2>
          <p className="text-xs text-warmgray-600">
            Recyclable paper wraps and cushioned boxes to protect cured soap bars in transit.
          </p>
        </div>
      </div>

      {/* Policy Details Content */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 space-y-8 text-warmgray-700 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-botanical-950">1. Order Processing Timeline</h2>
          <p>
            Because each ONZNATURAL bar is naturally cured and hand-cut, orders are inspected and packed within <strong>24 to 48 hours</strong> of order confirmation. You will receive tracking details via WhatsApp or SMS as soon as your shipment is dispatched.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-botanical-950">2. Delivery Charges</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Vadodara City:</strong> Flat ₹40 local courier / direct delivery.</li>
            <li><strong>Rest of Gujarat &amp; All Indian States:</strong> Flat ₹50 express courier shipping.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-botanical-950">3. Cash on Delivery (COD)</h2>
          <p>
            Cash on Delivery is supported for all orders. For high-value COD orders, our customer care team will make a quick verification call or WhatsApp message before dispatch.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-botanical-950">4. Tracking Your Order</h2>
          <p>
            Once dispatched, a tracking link will be sent to your WhatsApp number. If you have any questions regarding your parcel, please contact our support desk directly:
          </p>
          <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-botanical-950 text-xs">WhatsApp Order Tracking Desk</p>
              <p className="text-xs text-warmgray-600">+91 97267 39515 (Mon - Sat, 10 AM - 7 PM)</p>
            </div>
            <WhatsAppButton label="Track via WhatsApp" className="text-xs py-2.5 px-4" />
          </div>
        </section>
      </div>
    </div>
  );
};

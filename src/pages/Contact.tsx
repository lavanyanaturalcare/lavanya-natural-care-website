import React from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { socialAccounts } from '../data/social';

export const Contact: React.FC = () => {
  return (
    <div className="py-12 md:py-20 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-700 block">
          Get In Touch
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-botanical-950">
          Contact Lavanya Natural Care
        </h1>
        <p className="text-warmgray-600 text-base leading-relaxed">
          We would love to assist you with product inquiries, order placement, or custom gifting inquiries.
        </p>
      </div>

      {/* Main Contact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-sm space-y-6">
            <h3 className="font-serif text-2xl font-bold text-botanical-950">
              Direct Reach & Orders
            </h3>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-botanical-100 text-botanical-800 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-warmgray-500 font-semibold uppercase block">Phone / Mobile</span>
                  <a href="tel:+919726739515" className="font-semibold text-botanical-900 text-base hover:text-gold-700 transition-colors">
                    +91 97267 39515
                  </a>
                  <span className="text-xs text-warmgray-500 block mt-0.5">Click to call directly</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 text-[#1e9b4c] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-warmgray-500 font-semibold uppercase block">WhatsApp Business</span>
                  <a
                    href="https://wa.me/919726739515?text=Hello%20Lavanya%20Natural%20Care!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#1e9b4c] text-base hover:underline"
                  >
                    +91 97267 39515
                  </a>
                  <span className="text-xs text-warmgray-500 block mt-0.5">Instant messaging & orders</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-botanical-100 text-botanical-800 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-warmgray-500 font-semibold uppercase block">Email Address</span>
                  <a href="mailto:lavanyanaturalcare@gmail.com" className="font-semibold text-botanical-900 text-base hover:text-gold-700 transition-colors">
                    lavanyanaturalcare@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-botanical-100 text-botanical-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-warmgray-500 font-semibold uppercase block">Store / Workshop Address</span>
                  <p className="font-semibold text-botanical-900 leading-snug">
                    FF-22 Pujar Complex, Subhanpura, Vadodara, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-botanical-100 text-botanical-800 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-warmgray-500 font-semibold uppercase block">Working Hours</span>
                  <p className="font-semibold text-botanical-900">Monday – Saturday: 10:00 AM – 7:00 PM</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-cream-100 flex flex-col gap-3">
              <a
                href="tel:+919726739515"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-botanical-800 text-botanical-900 font-semibold text-sm hover:bg-botanical-800 hover:text-white transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now (+91 97267 39515)</span>
              </a>
              <WhatsAppButton
                label="Chat on WhatsApp Now"
                className="py-3.5 justify-center"
              />
            </div>
          </div>

          {/* Social Accounts */}
          <div className="bg-botanical-900 text-cream-50 p-6 sm:p-8 rounded-3xl space-y-4 border border-botanical-800">
            <h4 className="font-serif text-xl font-bold text-cream-50">Follow Lavanya Natural Care</h4>
            <p className="text-xs text-warmgray-300">
              Connect with our official channels for handcrafted soapmaking, skincare insights, and product updates.
            </p>
            <div className="space-y-3 pt-2">
              {socialAccounts.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-botanical-950/60 border border-botanical-800 hover:border-gold-500/50 transition-colors text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <social.icon className="w-4 h-4 text-gold-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-cream-100 block">{social.name}</span>
                      <span className="text-[11px] text-warmgray-400">{social.handle}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-botanical-800 text-gold-400 group-hover:bg-gold-500 group-hover:text-botanical-950 transition-colors text-[11px] font-semibold">
                    Follow
                  </span>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Embedded Interactive Google Map */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-botanical-950">
              Location & Workshop
            </h3>
            <p className="text-xs sm:text-sm text-warmgray-600">
              FF-22 Pujar Complex, Subhanpura, Vadodara, Gujarat, India.
            </p>
          </div>

          <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-cream-200 shadow-inner bg-cream-50">
            <iframe
              title="Lavanya Natural Care Vadodara Map Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3690.963428987114!2d73.1534293!3d22.3172081!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc8b0a1d48c8b%3A0x6b14f6b1e626e257!2sSubhanpura%2C%20Vadodara%2C%20Gujarat%20390023!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="p-4 rounded-xl bg-cream-50 border border-cream-100 flex items-center gap-3 text-xs text-botanical-900 font-medium">
            <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
            <span>Visiting us? Call us prior at +91 97267 39515 to confirm workshop availability.</span>
          </div>
        </div>

      </div>

    </div>
  );
};

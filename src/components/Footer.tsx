import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { socialAccounts } from '../data/social';
import { useProductCatalog } from '../context/ProductContext';

export const Footer: React.FC = () => {
  const { products } = useProductCatalog();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-950 text-sand-100 pt-16 pb-12 border-t border-primary-900 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-primary-900/80">
          
          {/* Brand Info & Typographic Wordmark */}
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-block group hover:opacity-95 transition-opacity focus:outline-none"
              aria-label="ONZNATURAL Home"
            >
              <span className="font-serif text-2xl font-bold tracking-widest text-white block leading-tight">
                ONZNATURAL
              </span>
              <span className="text-[9px] tracking-[0.25em] text-accent-400 font-semibold uppercase block mt-1">
                Handcrafted Botanical Care
              </span>
            </Link>

            <p className="text-sand-300 text-sm leading-relaxed">
              Artisanal cold-process soaps, rich botanical body lotions, and herbal face care. Formulated with authentic plant oils, flower infusions, and Ayurvedic botanicals in Vadodara, Gujarat.
            </p>

            <div className="pt-2 space-y-2">
              <span className="text-xs text-accent-400 font-semibold uppercase tracking-wider block">
                Follow ONZNATURAL
              </span>
              <div className="flex items-center gap-3">
                {socialAccounts.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow ONZNATURAL on ${social.name}`}
                    className="w-9 h-9 rounded-full bg-primary-900 border border-primary-800 flex items-center justify-center text-sand-200 hover:text-accent-400 hover:border-accent-500/50 transition-all duration-200"
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-semibold text-accent-400 tracking-wide uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-sand-300">
              <li>
                <Link to="/" className="hover:text-accent-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500/60" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-accent-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500/60" />
                  <span>Product Collection ({products.length} Items)</span>
                </Link>
              </li>
              <li>
                <Link to="/ai-consultant" className="hover:text-accent-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500/60" />
                  <span>AI Botanical Consultant</span>
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-accent-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500/60" />
                  <span>Botanical Guides &amp; Blog</span>
                </Link>
              </li>
              <li>
                <Link to="/ingredients" className="hover:text-accent-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500/60" />
                  <span>Verified Ingredients</span>
                </Link>
              </li>
              <li>
                <Link to="/process" className="hover:text-accent-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500/60" />
                  <span>6-Step Cold Process</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accent-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500/60" />
                  <span>About Our Workshop</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-semibold text-accent-400 tracking-wide uppercase">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-sand-300">
              <li>
                <Link to="/account" className="hover:text-accent-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500/60" />
                  <span>My Account</span>
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-accent-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500/60" />
                  <span>Saved Botanicals</span>
                </Link>
              </li>
              <li>
                <Link to="/shipping-delivery" className="hover:text-accent-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500/60" />
                  <span>Shipping &amp; Delivery Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-accent-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500/60" />
                  <span>Return &amp; Refund Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-accent-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500/60" />
                  <span>Privacy Policy (DPDP Act)</span>
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="hover:text-accent-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500/60" />
                  <span>Cookie Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-accent-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500/60" />
                  <span>Terms &amp; Conditions</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))}
                  className="hover:text-accent-400 transition-colors inline-flex items-center gap-1.5 text-xs text-sand-300 hover:underline cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500/60" />
                  <span>Cookie Preferences</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-semibold text-accent-400 tracking-wide uppercase">
              Workshop Contact
            </h4>
            <ul className="space-y-3.5 text-sm text-sand-300">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-accent-400 shrink-0 mt-1" />
                <div>
                  <a
                    href="tel:+919726739515"
                    className="hover:text-accent-400 transition-colors font-semibold block text-white"
                    aria-label="Call ONZNATURAL at +91 97267 39515"
                  >
                    +91 97267 39515
                  </a>
                  <span className="text-xs text-sand-400">Mon - Sat (10:00 AM - 7:00 PM IST)</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-accent-400 shrink-0 mt-1" />
                <a
                  href="mailto:care@onznatural.com"
                  className="hover:text-accent-400 transition-colors break-all"
                  aria-label="Email ONZNATURAL at care@onznatural.com"
                >
                  care@onznatural.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-accent-400 shrink-0 mt-1" />
                <a
                  href="https://maps.google.com/?q=Subhanpura+Vadodara+Gujarat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-400 transition-colors text-xs leading-relaxed"
                >
                  FF-22 Pujar Complex, Subhanpura, Vadodara, Gujarat 390023, India
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with Dynamic Copyright & Admin link */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-sand-400 gap-4">
          <p>© {currentYear} ONZNATURAL. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <p className="text-sand-300">
              Handcrafted with Care &amp; Integrity • Vadodara, Gujarat
            </p>
            <span className="text-sand-600">•</span>
            <Link to="/admin" className="hover:text-accent-400 transition-colors text-sand-400">
              Owner Dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

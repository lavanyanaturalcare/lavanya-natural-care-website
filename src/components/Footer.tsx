import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Leaf, ArrowRight } from 'lucide-react';
import { socialAccounts } from '../data/social';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const categories = [
    { name: 'Handmade Cold Process Soap', path: '/products' },
    { name: 'Face & Body Wash', path: '/products' },
    { name: 'Hand Wash', path: '/products' },
    { name: 'Face Care & Creams', path: '/products' },
    { name: 'Body Care & Lotions', path: '/products' },
    { name: 'Nourishing Lip Care', path: '/products' }
  ];

  return (
    <footer className="bg-botanical-950 text-cream-100 pt-16 pb-12 border-t border-botanical-800 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-botanical-800/60">
          
          {/* Brand Info & Clickable Logo */}
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 group hover:opacity-95 transition-opacity focus:outline-none"
              aria-label="Lavanya Natural Care Home"
            >
              <div className="w-10 h-10 rounded-full bg-botanical-800 flex items-center justify-center text-gold-400 group-hover:bg-botanical-900 transition-colors shadow-sm">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-cream-50 block leading-tight">
                  LAVANYA
                </span>
                <span className="text-[10px] tracking-[0.25em] text-gold-400 font-semibold uppercase block">
                  Natural Care
                </span>
              </div>
            </Link>

            <p className="text-warmgray-400 text-sm leading-relaxed">
              Handcrafted pure cold process soaps and natural botanical skincare. Formulated with authentic plant oils, flower infusions, and Ayurvedic herbs in Vadodara, India.
            </p>

            <div className="pt-2 space-y-2">
              <span className="text-xs text-gold-400 font-semibold uppercase tracking-wider block">
                Follow Lavanya Natural Care
              </span>
              <div className="flex items-center gap-3">
                {socialAccounts.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow Lavanya on ${social.name}`}
                    className="w-9 h-9 rounded-full bg-botanical-900 border border-botanical-800 flex items-center justify-center text-cream-200 hover:text-gold-400 hover:border-gold-500/50 transition-all duration-200"
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-gold-400 tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-warmgray-300">
              <li>
                <Link to="/" className="hover:text-gold-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-gold-500/60" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-gold-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-gold-500/60" />
                  <span>Product Showcase</span>
                </Link>
              </li>
              <li>
                <Link to="/ingredients" className="hover:text-gold-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-gold-500/60" />
                  <span>Our Ingredients</span>
                </Link>
              </li>
              <li>
                <Link to="/process" className="hover:text-gold-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-gold-500/60" />
                  <span>6-Step Cold Process</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-gold-500/60" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-400 transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-gold-500/60" />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Categories (Clickable) */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-gold-400 tracking-wide">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-warmgray-300">
              {categories.map((cat, idx) => (
                <li key={idx}>
                  <Link
                    to={cat.path}
                    className="hover:text-gold-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-gold-500/60" />
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details (Clickable Phone & Email) */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-gold-400 tracking-wide">
              Contact Us
            </h4>
            <ul className="space-y-3.5 text-sm text-warmgray-300">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gold-400 shrink-0 mt-1" />
                <div>
                  <a
                    href="tel:+919726739515"
                    className="hover:text-gold-400 transition-colors font-semibold block text-cream-50"
                    aria-label="Call Lavanya Natural Care at +91 97267 39515"
                  >
                    +91 97267 39515
                  </a>
                  <span className="text-xs text-warmgray-400">Mon - Sat (10:00 AM - 7:00 PM)</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gold-400 shrink-0 mt-1" />
                <a
                  href="mailto:lavanyanaturalcare@gmail.com"
                  className="hover:text-gold-400 transition-colors break-all"
                  aria-label="Email Lavanya Natural Care at lavanyanaturalcare@gmail.com"
                >
                  lavanyanaturalcare@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-1" />
                <a
                  href="https://maps.google.com/?q=Subhanpura+Vadodara+Gujarat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-400 transition-colors text-xs leading-relaxed"
                >
                  FF-22 Pujar Complex, Subhanpura, Vadodara, Gujarat 390023, India
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with Dynamic Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-warmgray-500 gap-4">
          <p>© {currentYear} Lavanya Natural Care. All rights reserved.</p>
          <p className="text-warmgray-400">
            Handcrafted with Care &amp; Integrity • Vadodara, Gujarat
          </p>
        </div>
      </div>
    </footer>
  );
};

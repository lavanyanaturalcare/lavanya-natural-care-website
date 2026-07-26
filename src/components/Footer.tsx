import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Leaf } from 'lucide-react';
import { socialAccounts } from '../data/social';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-botanical-950 text-cream-100 pt-16 pb-12 border-t border-botanical-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-botanical-800/60">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-botanical-800 flex items-center justify-center text-gold-400">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-cream-50 block leading-tight">
                  LAVANYA
                </span>
                <span className="text-[10px] tracking-[0.2em] text-gold-400 font-semibold uppercase block">
                  Natural Care
                </span>
              </div>
            </div>
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
                    aria-label={social.name}
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
                <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-gold-400 transition-colors">Product Showcase</Link>
              </li>
              <li>
                <Link to="/ingredients" className="hover:text-gold-400 transition-colors">Our Ingredients</Link>
              </li>
              <li>
                <Link to="/process" className="hover:text-gold-400 transition-colors">6-Step Cold Process</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold-400 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-400 transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-gold-400 tracking-wide">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-warmgray-300">
              <li>Handmade Cold Process Soap</li>
              <li>Face & Body Wash</li>
              <li>Hand Wash</li>
              <li>Face Care</li>
              <li>Body Care & Lotions</li>
              <li>Lip Care</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-gold-400 tracking-wide">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm text-warmgray-300">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gold-400 shrink-0 mt-1" />
                <div>
                  <a href="tel:+919726739515" className="hover:text-gold-400 transition-colors font-medium block">
                    +91 97267 39515
                  </a>
                  <span className="text-xs text-warmgray-500">Available Mon - Sat</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gold-400 shrink-0 mt-1" />
                <a href="mailto:lavanyanaturalcare@gmail.com" className="hover:text-gold-400 transition-colors">
                  lavanyanaturalcare@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-1" />
                <span>FF-22 Pujar Complex, Subhanpura, Vadodara, India</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-warmgray-500 gap-4">
          <p>© {new Date().getFullYear()} Lavanya Natural Care. All rights reserved.</p>
          <p className="text-warmgray-400">
            Handcrafted with Care & Integrity • Vadodara, Gujarat
          </p>
        </div>
      </div>
    </footer>
  );
};

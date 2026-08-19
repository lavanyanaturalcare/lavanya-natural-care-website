import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, MessageCircle, Menu, X, Leaf, Gift, Sparkles, ArrowRight } from 'lucide-react';
import { socialAccounts } from '../data/social';
import { isCampaignActive } from '../data/campaign';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Festive Combos 🎁', path: '/customize-combo', isFestive: true },
    { name: 'Ingredients', path: '/ingredients' },
    { name: 'Process', path: '/process' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path || (path === '/customize-combo' && location.pathname.startsWith('/customize-combo'));

  return (
    <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-cream-200 shadow-sm transition-all duration-200">
      
      {/* Top Banner with Raksha Bandhan Announcement & Contact */}
      <div className="bg-gradient-to-r from-botanical-950 via-botanical-900 to-[#A03D1A] text-cream-50 text-xs py-2 px-4 border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          {/* Campaign Top Announcement */}
          {isCampaignActive() ? (
            <Link
              to="/customize-combo"
              className="flex items-center gap-2 group hover:text-gold-300 transition-colors text-center sm:text-left"
            >
              <span className="bg-[#C85A32] text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs animate-pulse">
                Special Offer
              </span>
              <span className="font-semibold text-xs text-cream-100">
                Raksha Bandhan Gifting Combos (19–28 Aug) • Save up to 25%
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-gold-400 font-bold text-xs underline underline-offset-2">
                Customize Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <a href="tel:+919726739515" className="flex items-center gap-1.5 hover:text-gold-400 transition-colors">
                <Phone className="w-3.5 h-3.5 text-gold-400" />
                <span>+91 97267 39515</span>
              </a>
              <span className="text-botanical-600 hidden sm:inline">|</span>
              <span className="hidden sm:inline text-cream-100/90">FF-22 Pujar Complex, Subhanpura, Vadodara</span>
            </div>
          )}

          {/* Social Icons & Contact */}
          <div className="flex items-center gap-4">
            <a href="tel:+919726739515" className="hidden lg:flex items-center gap-1.5 hover:text-gold-400 transition-colors">
              <Phone className="w-3 h-3 text-gold-400" />
              <span>+91 97267 39515</span>
            </a>
            <span className="text-botanical-600 hidden lg:inline">|</span>
            <div className="flex items-center gap-2">
              <span className="text-cream-200 text-[11px] uppercase tracking-wider font-semibold">Follow:</span>
              <div className="flex items-center gap-2.5">
                {socialAccounts.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="hover:text-gold-400 transition-colors"
                  >
                    <social.icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-full bg-botanical-800 flex items-center justify-center text-gold-400 group-hover:bg-botanical-900 transition-colors shadow-sm">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-2xl font-bold tracking-tight text-botanical-900 block leading-tight">
              LAVANYA
            </span>
            <span className="text-[10px] tracking-[0.25em] text-gold-700 font-semibold uppercase block">
              Natural Care
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-semibold tracking-wide transition-all relative py-1 flex items-center gap-1.5 ${
                link.isFestive
                  ? 'px-3 py-1 rounded-full bg-[#C85A32]/10 border border-[#C85A32]/30 text-[#A03D1A] font-bold hover:bg-[#C85A32]/20'
                  : isActive(link.path)
                    ? 'text-botanical-900 font-bold'
                    : 'text-warmgray-600 hover:text-botanical-800'
              }`}
            >
              <span>{link.name}</span>
              {isActive(link.path) && !link.isFestive && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold-500 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Action Buttons: Phone & WhatsApp */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/customize-combo"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C85A32] text-white text-xs font-bold hover:bg-[#b04823] transition-all shadow-xs"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Rakhi Offers</span>
          </Link>
          <a
            href="tel:+919726739515"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-botanical-800 text-botanical-900 text-xs font-semibold hover:bg-botanical-800 hover:text-white transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
          <a
            href="https://wa.me/919726739515?text=Hello%20Lavanya%20Natural%20Care!"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp-3d flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-botanical-900 hover:bg-cream-100 rounded-lg"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-cream-50 border-b border-cream-200 px-4 pt-3 pb-6 space-y-4 animate-fadeIn">
          
          {/* Prominent Festive Banner in Mobile Drawer */}
          {isCampaignActive() && (
            <Link
              to="/customize-combo"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-botanical-900 to-[#C85A32] text-white shadow-md border border-gold-400/30"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-gold-300" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gold-300">
                    Raksha Bandhan Special
                  </span>
                </div>
                <span className="font-serif text-base font-bold block">
                  Customize 3 Festive Combos
                </span>
                <span className="text-[11px] text-cream-200 block">
                  Save up to 25% • 19 – 28 Aug 2026
                </span>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-white text-botanical-950 font-bold text-xs shrink-0 shadow-xs">
                View &rarr;
              </span>
            </Link>
          )}

          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${
                  link.isFestive
                    ? 'bg-[#C85A32]/10 text-[#A03D1A] font-bold border border-[#C85A32]/30'
                    : isActive(link.path)
                      ? 'bg-botanical-800 text-cream-50'
                      : 'text-warmgray-900 hover:bg-cream-100'
                }`}
              >
                <span>{link.name}</span>
                {link.isFestive && (
                  <span className="text-xs bg-[#C85A32] text-white px-2 py-0.5 rounded-full font-bold">
                    Save 25%
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-cream-200 space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Follow Us</span>
              <div className="flex items-center gap-3">
                {socialAccounts.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="p-2 rounded-lg bg-cream-100 text-botanical-900 hover:text-gold-700 transition-colors"
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <a
              href="tel:+919726739515"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-botanical-800 text-botanical-900 font-semibold text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Call +91 97267 39515</span>
            </a>
            <a
              href="https://wa.me/919726739515?text=Hello%20Lavanya%20Natural%20Care!"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-3d flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-semibold text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

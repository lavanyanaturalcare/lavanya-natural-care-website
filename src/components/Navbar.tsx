import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, MessageCircle, Menu, X, Leaf, Mail } from 'lucide-react';
import { socialAccounts } from '../data/social';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Ingredients', path: '/ingredients' },
    { name: 'Process', path: '/process' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-cream-200 shadow-sm transition-all duration-200 w-full overflow-x-clip">
      
      {/* Top Utility Bar with Contact Info & Social Links */}
      <div className="bg-gradient-to-r from-botanical-950 via-botanical-900 to-botanical-950 text-cream-50 text-xs py-2 px-4 border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          {/* Contact Details (Clickable) */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-start">
            <a
              href="tel:+919726739515"
              className="flex items-center gap-1.5 hover:text-gold-400 transition-colors focus:outline-none"
              aria-label="Call Lavanya Natural Care at +91 97267 39515"
            >
              <Phone className="w-3.5 h-3.5 text-gold-400 shrink-0" />
              <span className="font-semibold">+91 97267 39515</span>
            </a>
            <span className="text-botanical-600 hidden sm:inline">|</span>
            <a
              href="mailto:lavanyanaturalcare@gmail.com"
              className="hidden md:flex items-center gap-1.5 hover:text-gold-400 transition-colors focus:outline-none"
              aria-label="Email Lavanya Natural Care at lavanyanaturalcare@gmail.com"
            >
              <Mail className="w-3.5 h-3.5 text-gold-400 shrink-0" />
              <span>lavanyanaturalcare@gmail.com</span>
            </a>
            <span className="text-botanical-600 hidden lg:inline">|</span>
            <span className="hidden lg:inline text-cream-100/90 truncate">
              FF-22 Pujar Complex, Subhanpura, Vadodara
            </span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-cream-200 text-[11px] uppercase tracking-wider font-semibold">Follow:</span>
              <div className="flex items-center gap-2.5">
                {socialAccounts.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow Lavanya on ${social.name}`}
                    className="hover:text-gold-400 transition-colors focus:outline-none"
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
        
        {/* Brand Logo (Clickable) */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus:outline-none"
          aria-label="Lavanya Natural Care - Handcrafted Cold Process Soap"
        >
          <div className="w-10 h-10 rounded-full bg-botanical-800 flex items-center justify-center text-gold-400 group-hover:bg-botanical-900 transition-colors shadow-sm shrink-0">
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
        <nav className="hidden md:flex items-center gap-6 lg:gap-7" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-semibold tracking-wide transition-all relative py-1 flex items-center gap-1.5 focus:outline-none ${
                isActive(link.path)
                  ? 'text-botanical-900 font-bold'
                  : 'text-warmgray-600 hover:text-botanical-800'
              }`}
            >
              <span>{link.name}</span>
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold-500 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons: Phone & WhatsApp */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="tel:+919726739515"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-botanical-800 text-botanical-900 text-xs font-semibold hover:bg-botanical-800 hover:text-white transition-all shadow-xs"
            aria-label="Call +91 97267 39515"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
          <a
            href="https://wa.me/919726739515?text=Hello%20Lavanya%20Natural%20Care!"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp-3d flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm"
            aria-label="Chat with Lavanya Natural Care on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Mobile Menu Button (Accessible Hamburger) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2.5 text-botanical-900 hover:bg-cream-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500"
          aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation (Accessible & Optimized) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-cream-50 border-b border-cream-200 px-4 pt-2 pb-6 space-y-4 animate-fadeIn shadow-lg">
          
          <div className="flex flex-col space-y-1.5" role="menu">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${
                  isActive(link.path)
                    ? 'bg-botanical-800 text-cream-50 shadow-sm'
                    : 'text-warmgray-900 hover:bg-cream-100'
                }`}
                role="menuitem"
              >
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-cream-200 space-y-3">
            {/* Social Links Row */}
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Follow Us</span>
              <div className="flex items-center gap-2.5">
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

            {/* Direct Call Button */}
            <a
              href="tel:+919726739515"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 border-botanical-800 text-botanical-900 font-semibold text-sm active:bg-botanical-800 active:text-white transition-all shadow-xs"
            >
              <Phone className="w-4 h-4 text-botanical-800" />
              <span>Call +91 97267 39515</span>
            </a>

            {/* Direct WhatsApp Button */}
            <a
              href="https://wa.me/919726739515?text=Hello%20Lavanya%20Natural%20Care!"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-3d flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-semibold text-sm shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>

            {/* Direct Email Link */}
            <div className="text-center pt-1">
              <a
                href="mailto:lavanyanaturalcare@gmail.com"
                className="text-xs text-warmgray-600 hover:text-botanical-900 font-medium inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-gold-700" />
                <span>lavanyanaturalcare@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

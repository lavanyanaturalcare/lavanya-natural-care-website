import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, MessageCircle, Menu, X, Mail, Sparkles, Heart, User } from 'lucide-react';
import { socialAccounts } from '../data/social';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { getWishlist } from '../services/crmService';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check auth & wishlist
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setCurrentUser(user);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(session?.user || null);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    getWishlist().then(ids => setWishlistCount(ids.length));
  }, [location.pathname]);

  const navLinks: { name: string; path: string; isAi?: boolean }[] = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'AI Consultant', path: '/ai-consultant', isAi: true },
    { name: 'Guides', path: '/blog' },
    { name: 'Ingredients', path: '/ingredients' },
    { name: 'Process', path: '/process' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-sand-50/95 backdrop-blur-md border-b border-sand-200 shadow-sm transition-all duration-200 w-full overflow-x-clip">
      
      {/* Promotional & Welcome Offer Bar */}
      <div className="bg-gradient-to-r from-botanical-950 via-botanical-900 to-botanical-950 text-cream-50 text-[11px] py-1.5 px-3 border-b border-gold-500/20 text-center font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-gold-300 font-bold">
            <Sparkles className="w-3 h-3 text-gold-400" />
            <span>Welcome Offer:</span>
          </span>
          <span>Get <strong>10% OFF</strong> on your first order with code <code className="bg-gold-500/20 text-gold-200 px-1.5 py-0.5 rounded border border-gold-400/30 font-mono font-bold tracking-wider">WELCOME10</code></span>
          <span className="text-gold-400/50 hidden sm:inline">•</span>
          <span className="text-cream-200 hidden sm:inline">🚚 Express Pan-India Courier Delivery</span>
          <span className="text-gold-400/50 hidden md:inline">•</span>
          <span className="text-cream-200 hidden md:inline">🌱 100% Handcrafted in Vadodara</span>
        </div>
      </div>

      {/* Top Utility Bar */}
      <div className="bg-primary-950 text-sand-100 text-xs py-2 px-4 border-b border-accent-600/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          {/* Contact Details */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-start">
            <a
              href="tel:+919726739515"
              className="flex items-center gap-1.5 hover:text-accent-400 transition-colors focus:outline-none"
              aria-label="Call ONZNATURAL at +91 97267 39515"
            >
              <Phone className="w-3.5 h-3.5 text-accent-400 shrink-0" />
              <span className="font-semibold">+91 97267 39515</span>
            </a>
            <span className="text-primary-700 hidden sm:inline">|</span>
            <a
              href="mailto:care@onznatural.com"
              className="hidden md:flex items-center gap-1.5 hover:text-accent-400 transition-colors focus:outline-none"
              aria-label="Email ONZNATURAL at care@onznatural.com"
            >
              <Mail className="w-3.5 h-3.5 text-accent-400 shrink-0" />
              <span>care@onznatural.com</span>
            </a>
            <span className="text-primary-700 hidden lg:inline">|</span>
            <span className="hidden lg:inline text-sand-300 truncate">
              FF-22 Pujar Complex, Subhanpura, Vadodara, Gujarat
            </span>
          </div>

          {/* Social Icons & Account link */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sand-400 text-[11px] uppercase tracking-wider font-semibold">Follow:</span>
              <div className="flex items-center gap-2.5">
                {socialAccounts.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow ONZNATURAL on ${social.name}`}
                    className="hover:text-accent-400 transition-colors focus:outline-none"
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
        
        {/* Brand Typographic Wordmark */}
        <Link
          to="/"
          className="group focus:outline-none flex flex-col"
          aria-label="ONZNATURAL - Handcrafted Botanical Care"
        >
          <span className="font-serif text-2xl sm:text-3xl font-bold tracking-widest text-primary-950 block leading-none">
            ONZNATURAL
          </span>
          <span className="text-[9px] tracking-[0.25em] text-accent-700 font-semibold uppercase block mt-1">
            Handcrafted Botanical Care
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-semibold tracking-wide transition-all relative py-1 flex items-center gap-1.5 focus:outline-none ${
                isActive(link.path)
                  ? 'text-primary-950 font-bold'
                  : 'text-sand-800 hover:text-primary-900'
              }`}
            >
              <span>{link.name}</span>
              {link.isAi && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-accent-400/20 text-primary-950 text-[10px] font-bold tracking-tight border border-accent-600/30">
                  <Sparkles className="w-2.5 h-2.5 text-accent-700" />
                  <span>AI</span>
                </span>
              )}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-600 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions: Wishlist, Account, WhatsApp */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Wishlist Icon */}
          <Link
            to="/wishlist"
            className="relative p-2 rounded-xl text-primary-950 hover:bg-sand-200 transition-colors"
            title="Saved Botanicals"
          >
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Account / Sign In */}
          <Link
            to={currentUser ? "/account" : "/login"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sand-300 text-primary-950 text-xs font-semibold hover:bg-sand-200 transition-all shadow-xs"
          >
            <User className="w-3.5 h-3.5" />
            <span>{currentUser ? 'Account' : 'Sign In'}</span>
          </Link>

          {/* WhatsApp Order */}
          <a
            href="https://wa.me/919726739515?text=Hello%20ONZNATURAL!"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp-3d flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm"
            aria-label="Chat with ONZNATURAL on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Mobile Controls */}
        <div className="flex lg:hidden items-center gap-1 sm:gap-2">
          <Link
            to="/wishlist"
            className="relative p-2.5 text-primary-950 hover:bg-sand-200 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-accent-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to={currentUser ? "/account" : "/login"}
            className="p-2.5 text-primary-950 hover:bg-sand-200 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
            title={currentUser ? "My Account" : "Sign In"}
          >
            <User className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 text-primary-950 hover:bg-sand-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-accent-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FDFBF7] border-b border-sand-300 px-4 pt-3 pb-6 space-y-4 animate-fadeIn shadow-xl">
          <div className="flex flex-col space-y-1.5" role="menu">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm sm:text-base font-bold transition-all flex items-center justify-between min-h-[44px] ${
                  isActive(link.path)
                    ? 'bg-primary-950 text-white shadow-sm'
                    : 'text-primary-950 hover:bg-sand-200 active:bg-sand-300'
                }`}
                role="menuitem"
              >
                <span className="flex items-center gap-2">
                  <span>{link.name}</span>
                  {link.isAi && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-400/20 text-primary-950 text-[10px] font-bold border border-accent-600/30">
                      <Sparkles className="w-2.5 h-2.5 text-accent-700" />
                      <span>Gemini AI</span>
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-sand-200 space-y-3">
            {/* Account Link in Mobile */}
            <Link
              to={currentUser ? "/account" : "/login"}
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-secondary-outline flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-colors shadow-xs"
            >
              <User className="w-4 h-4" />
              <span>{currentUser ? 'My Account' : 'Sign In / Register'}</span>
            </Link>

            {/* Direct Call Button */}
            <a
              href="tel:+919726739515"
              className="btn-secondary-outline flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all shadow-xs"
            >
              <Phone className="w-4 h-4 text-primary-900" />
              <span>Call +91 97267 39515</span>
            </a>

            {/* Direct WhatsApp Button */}
            <a
              href="https://wa.me/919726739515?text=Hello%20ONZNATURAL!"
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
                href="mailto:care@onznatural.com"
                className="text-xs text-sand-700 hover:text-primary-950 font-medium inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-accent-700" />
                <span>care@onznatural.com</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

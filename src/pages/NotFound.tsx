import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Sparkles, MessageCircle, ShoppingBag } from 'lucide-react';
import { SEO } from '../components/SEO';
import { WhatsAppButton } from '../components/WhatsAppButton';

export const NotFound: React.FC = () => {
  return (
    <div className="py-20 md:py-28 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
      <SEO
        title="404 - Page Not Found | Lavanya Natural Care"
        description="The page you are looking for could not be found. Explore our handcrafted cold-process soaps and botanical skincare collection."
      />

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-botanical-100 text-botanical-800 text-xs font-semibold uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-gold-600" />
        <span>Error 404 • Page Not Found</span>
      </div>

      <div className="space-y-3">
        <h1 className="font-serif text-6xl sm:text-8xl font-bold text-botanical-950">
          404
        </h1>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-botanical-900">
          The Botanical Purity You Seek Cannot Be Found
        </h2>
        <p className="text-warmgray-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
          The page you requested may have been moved, renamed, or is temporarily unavailable. Let us help you return to our pure natural skincare collection.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl btn-botanical-3d text-white font-semibold text-sm shadow-md"
        >
          <Home className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
        <Link
          to="/products"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-botanical-800 text-botanical-900 font-semibold text-sm hover:bg-botanical-800 hover:text-white transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse All Products</span>
        </Link>
        <WhatsAppButton
          label="Inquire on WhatsApp"
          className="w-full sm:w-auto py-3.5"
        />
      </div>

      <div className="pt-8 border-t border-cream-200">
        <p className="text-xs text-warmgray-500">
          Need immediate assistance? Call us directly at{' '}
          <a href="tel:+919726739515" className="text-botanical-900 font-semibold hover:underline">
            +91 97267 39515
          </a>
          {' '}or email{' '}
          <a href="mailto:lavanyanaturalcare@gmail.com" className="text-botanical-900 font-semibold hover:underline">
            lavanyanaturalcare@gmail.com
          </a>.
        </p>
      </div>
    </div>
  );
};

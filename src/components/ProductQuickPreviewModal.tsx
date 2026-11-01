import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Eye } from 'lucide-react';
import { Product } from '../types';
import { WhatsAppButton } from './WhatsAppButton';

interface ProductQuickPreviewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductQuickPreviewModal: React.FC<ProductQuickPreviewModalProps> = ({
  product,
  onClose
}) => {
  useEffect(() => {
    if (!product) return;

    // Prevent background scrolling while preview is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Close on Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-botanical-950/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-cream-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Preview Tag and Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-cream-100">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-800 text-xs font-bold uppercase tracking-wider border border-gold-400/40">
              <Eye className="w-3.5 h-3.5 text-gold-700" />
              <span>Quick Preview</span>
            </span>
            <span className="text-xs font-semibold text-warmgray-500 uppercase tracking-wider">
              {product.category}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-warmgray-400 hover:text-botanical-950 hover:bg-cream-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500"
            aria-label="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Preview Body Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          {/* Image Stage */}
          <div className="sm:col-span-5 bg-cream-50 rounded-2xl p-4 border border-cream-200 flex items-center justify-center relative min-h-[220px]">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-56 w-auto object-contain"
            />
            <span className="absolute bottom-2 left-2 text-[10px] text-warmgray-500 font-medium bg-white/90 px-2 py-0.5 rounded-md border border-cream-200">
              {product.netWeightOrVol}
            </span>
          </div>

          {/* Details */}
          <div className="sm:col-span-7 space-y-3">
            <h2 id="preview-title" className="font-serif text-2xl sm:text-3xl font-bold text-botanical-950">
              {product.name}
            </h2>

            <p className="text-xs sm:text-sm text-warmgray-600 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Price Pill */}
            <div className="flex items-baseline gap-2 py-2">
              <span className="font-serif text-3xl font-bold text-botanical-950">
                ₹{product.mrp}
              </span>
              <span className="text-xs text-warmgray-500 font-medium">
                (Inclusive of all taxes)
              </span>
            </div>

            {/* Key Benefits */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-gold-700 uppercase tracking-wider block">
                Key Highlights
              </span>
              {product.threeMainBenefits.map((b, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-botanical-900 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-600 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-xl bg-cream-50 border border-cream-100 text-center text-[11px] text-warmgray-700">
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-botanical-800 shrink-0" />
            <span>100% Plant Oils</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-botanical-800 shrink-0" />
            <span>Glycerin Preserved</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="font-semibold text-botanical-900">Vadodara Handcrafted</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <WhatsAppButton
            productName={product.name}
            mrp={product.mrp}
            className="w-full sm:w-1/2 py-3.5 justify-center text-sm font-bold shadow-md"
            label="Order on WhatsApp"
          />
          <Link
            to={`/products/${product.id}`}
            onClick={onClose}
            className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl btn-botanical-3d text-white font-semibold text-sm shadow-sm"
          >
            <span>View Full Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

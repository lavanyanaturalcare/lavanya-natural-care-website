import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Eye, Heart } from 'lucide-react';
import { Product } from '../types';
import { WhatsAppButton } from './WhatsAppButton';
import { ProductQuickPreviewModal } from './ProductQuickPreviewModal';
import { isInWishlist, toggleWishlist, trackProductInterest } from '../services/crmService';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    isInWishlist(product.id).then(setInWishlist);
  }, [product.id]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = await toggleWishlist(product.id);
    setInWishlist(newState);
  };

  const handleOpenPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    trackProductInterest(product.id, 'quick_preview');
    setIsPreviewOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-sand-200 p-6 sm:p-7 flex flex-col justify-between group relative shadow-sm hover:shadow-md transition-shadow">
        <div>
          {/* Category Tag & Wishlist Toggle */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-semibold text-primary-950 bg-sand-100 border border-sand-200 px-3 py-1 rounded-full uppercase tracking-wider">
              {product.category}
            </span>
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`p-2 rounded-full transition-colors ${
                inWishlist
                  ? 'text-red-600 bg-red-50'
                  : 'text-sand-500 hover:text-red-600 hover:bg-sand-100'
              }`}
              title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-label="Wishlist toggle"
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Product Image Stage with Dedicated Preview Button */}
          <div className="relative mb-5 group/stage">
            <button
              type="button"
              onClick={handleOpenPreview}
              className="absolute top-3 right-3 z-30 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-950 text-white text-xs font-bold shadow-md hover:bg-accent-700 transition-all transform hover:scale-105 active:scale-95 focus:outline-none cursor-pointer border border-primary-900/40"
              title={`Quick Preview for ${product.name}`}
              aria-label={`Quick Preview for ${product.name}`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>

            <Link
              to={`/products/${product.id}`}
              onClick={() => trackProductInterest(product.id, 'view_details')}
              className="block relative group/img focus:outline-none rounded-2xl"
              aria-label={`View full details for ${product.name}`}
            >
              <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden p-4 bg-sand-50 border border-sand-200 flex items-center justify-center relative">
                <img
                  src={product.image}
                  alt={`${product.name} - Handcrafted Botanical Care by ONZNATURAL Vadodara`}
                  loading="lazy"
                  width={300}
                  height={300}
                  className="w-full h-full object-contain max-h-64 transition-transform duration-500 group-hover/img:scale-105 z-10"
                />
              </div>
            </Link>
          </div>

          {/* Product Title */}
          <Link
            to={`/products/${product.id}`}
            onClick={() => trackProductInterest(product.id, 'view_details')}
            className="focus:outline-none"
          >
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-primary-950 hover:text-accent-700 transition-colors mb-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-sand-700 text-xs sm:text-sm mb-5 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* 3 Main Benefits List */}
          <div className="space-y-2 mb-6 bg-sand-50 p-3.5 rounded-2xl border border-sand-200">
            <span className="text-[10px] font-bold text-accent-700 uppercase tracking-widest block mb-1">
              Key Botanical Benefits
            </span>
            {product.threeMainBenefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2 text-xs text-primary-950 leading-snug">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-700 shrink-0 mt-0.5" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          {/* Net Weight & Price MRP Banner */}
          <div className="flex items-baseline justify-between pt-3 border-t border-sand-200 mb-5">
            <div>
              <span className="text-[10px] text-sand-600 uppercase tracking-wider block font-medium">Net Weight / Vol</span>
              <span className="text-xs font-semibold text-primary-950">{product.netWeightOrVol}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-sand-600 uppercase tracking-wider block font-medium">MRP (Incl. Taxes)</span>
              <span className="font-serif text-2xl font-bold text-primary-950">₹{product.mrp}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative z-20">
            <Link
              to={`/products/${product.id}`}
              onClick={() => trackProductInterest(product.id, 'view_details')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-sand-100 hover:bg-primary-950 hover:text-white text-primary-950 font-bold text-xs text-center border-2 border-primary-900/30 transition-all shadow-xs"
            >
              <span>View Details</span>
            </Link>
            <WhatsAppButton
              productName={product.name}
              mrp={product.mrp}
              className="w-full justify-center py-2.5 text-xs cursor-pointer font-bold"
            />
          </div>
        </div>
      </div>

      {/* Instant Quick Preview Modal */}
      <ProductQuickPreviewModal
        product={isPreviewOpen ? product : null}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  );
};

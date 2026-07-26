import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Eye } from 'lucide-react';
import { Product } from '../types';
import { WhatsAppButton } from './WhatsAppButton';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="card-3d rounded-3xl border border-cream-200/80 p-7 sm:p-8 flex flex-col justify-between group">
      <div>
        {/* Category Tag */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold text-botanical-900 bg-botanical-50/90 border border-botanical-100/80 px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
            {product.category}
          </span>
          <span className="text-xs text-warmgray-500 font-medium">
            {product.netWeightOrVol}
          </span>
        </div>

        {/* Product Image on 3D Platform Stage */}
        <Link to={`/products/${product.id}`} className="block relative group/img mb-6">
          <div className="product-platform w-full h-72 sm:h-80 rounded-2xl overflow-hidden p-6 border border-cream-200/60 flex items-center justify-center relative">
            
            {/* Product Image */}
            <img
              src={product.image}
              alt={`${product.name} - Lavanya Natural Care`}
              loading="lazy"
              className="w-full h-full object-contain max-h-72 transition-transform duration-500 group-hover/img:scale-105 group-hover/img:-translate-y-1.5 z-10"
            />

            {/* Soft Ground Shadow Platform */}
            <div className="product-platform-shadow" />

            {/* Quick View Hover Overlay */}
            <div className="absolute inset-0 bg-botanical-950/10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
              <span className="bg-white/90 text-botanical-950 text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1.5 transform translate-y-2 group-hover/img:translate-y-0 transition-transform border border-gold-300/40">
                <Eye className="w-3.5 h-3.5" /> Quick View
              </span>
            </div>
          </div>
        </Link>

        {/* Product Title */}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-serif text-2xl font-bold text-botanical-950 hover:text-gold-700 transition-colors mb-2.5 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-warmgray-600 text-sm mb-6 line-clamp-2 leading-relaxed font-normal">
          {product.shortDescription}
        </p>

        {/* 3 Main Benefits List */}
        <div className="space-y-2.5 mb-7 bg-cream-50/90 p-4 sm:p-4.5 rounded-2xl border border-cream-200/60 shadow-xs">
          <span className="text-[11px] font-bold text-gold-700 uppercase tracking-widest block mb-1">Key Botanical Benefits</span>
          {product.threeMainBenefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-botanical-950 leading-snug">
              <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
              <span className="font-medium">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        {/* Net Weight & Price MRP Banner */}
        <div className="flex items-baseline justify-between pt-4 border-t border-cream-100 mb-6">
          <div>
            <span className="text-[11px] text-warmgray-500 uppercase tracking-wider block font-medium">Net Vol / Weight</span>
            <span className="text-sm font-semibold text-botanical-900">{product.netWeightOrVol}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-warmgray-500 uppercase tracking-wider block font-semibold">MRP (Incl. Taxes)</span>
            <span className="font-serif text-3xl font-bold text-botanical-950">₹{product.mrp}</span>
          </div>
        </div>

        {/* Action Buttons with 3D Depth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to={`/products/${product.id}`}
            className="btn-botanical-3d inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-white font-semibold text-sm text-center"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <WhatsAppButton
            productName={product.name}
            mrp={product.mrp}
            className="w-full justify-center py-3.5 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

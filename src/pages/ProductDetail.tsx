import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Phone, ShieldCheck, Sparkles, Truck, Package, MessageCircle, ChevronRight } from 'lucide-react';
import { productsData } from '../data/products';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { ProductCard } from '../components/ProductCard';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const product = productsData.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
        <h2 className="font-serif text-3xl font-bold text-botanical-950">Product Not Found</h2>
        <p className="text-warmgray-600">The product you are looking for does not exist or has been moved.</p>
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-botanical-800 text-white font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Showcase</span>
        </button>
      </div>
    );
  }

  const [selectedImage, setSelectedImage] = useState<string>(product.image);

  const allImages = [product.image, ...(product.additionalImages || [])];

  const relatedProducts = productsData
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  // How to use guide based on category
  const getHowToUseGuide = (category: string) => {
    if (category.includes('Soap')) {
      return 'Lather the soap bar between wet palms. Apply gently onto face and body in circular motions. Rinse thoroughly with water and place the soap bar on a well-draining dish to dry between uses.';
    } else if (category.includes('Wash')) {
      return 'Dispense a small amount onto wet hands or a loofah. Work into a rich lather and cleanse body or face gently. Rinse thoroughly with clean water.';
    } else if (category.includes('Cream') || category.includes('Lotion')) {
      return 'Take a small portion onto your fingertips and massage smoothly onto freshly cleansed skin until absorbed. Use daily after bath for best results.';
    } else {
      return 'Apply evenly onto lips as needed throughout the day to keep lips soft, smooth, and protected against dryness.';
    }
  };

  return (
    <div className="py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs sm:text-sm text-warmgray-500">
        <Link to="/" className="hover:text-botanical-900 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-botanical-900 transition-colors">Products</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-botanical-950 font-semibold truncate">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start bg-white p-6 sm:p-10 lg:p-12 rounded-3xl border border-cream-200 shadow-sm">
        
        {/* Product Image Display & Variants */}
        <div className="lg:col-span-6 space-y-4">
          <div className="w-full h-96 sm:h-[460px] bg-cream-50 rounded-2xl overflow-hidden p-8 border border-cream-100 flex items-center justify-center relative">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-contain max-h-[420px]"
            />
            <span className="absolute top-4 left-4 bg-botanical-900 text-gold-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              {product.category}
            </span>
          </div>

          {allImages.length > 1 && (
            <div className="flex items-center gap-3 pt-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 p-1.5 bg-cream-50 transition-all ${
                    selectedImage === img ? 'border-botanical-800 scale-105 shadow-sm' : 'border-cream-200 hover:border-cream-400'
                  }`}
                >
                  <img src={img} alt={`Variant ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-botanical-950 mb-3">
              {product.name}
            </h1>
            <p className="text-warmgray-600 text-sm sm:text-base leading-relaxed">
              {product.fullDescription}
            </p>
          </div>

          {/* Pricing & Net Volume Card */}
          <div className="p-5 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs text-warmgray-500 font-medium block">Net Weight / Volume</span>
              <span className="text-sm font-bold text-botanical-950">{product.netWeightOrVol}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-warmgray-500 uppercase tracking-wider block font-semibold">MRP (Inclusive of all taxes)</span>
              <span className="font-serif text-3xl font-bold text-botanical-950">₹{product.mrp}</span>
            </div>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="space-y-3 pt-2">
            <WhatsAppButton
              productName={product.name}
              mrp={product.mrp}
              className="w-full py-4 text-base justify-center shadow-md font-bold"
              label="Order Product via WhatsApp"
            />
            <a
              href="tel:+919726739515"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-botanical-800 text-botanical-900 font-semibold text-sm hover:bg-botanical-800 hover:text-white transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call Us: +91 97267 39515</span>
            </a>
          </div>

          {/* Benefits Checklist */}
          <div className="space-y-3 pt-4 border-t border-cream-100">
            <h3 className="font-serif text-xl font-bold text-botanical-950">Product Benefits</h3>
            <ul className="space-y-2.5">
              {product.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-warmgray-800 leading-snug">
                  <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* How to Use Block */}
          <div className="space-y-2 pt-4 border-t border-cream-100">
            <h3 className="font-serif text-xl font-bold text-botanical-950">How to Use</h3>
            <p className="text-xs sm:text-sm text-warmgray-700 leading-relaxed bg-cream-50/80 p-4 rounded-2xl border border-cream-100">
              {getHowToUseGuide(product.category)}
            </p>
          </div>

          {/* Full Ingredients List */}
          <div className="space-y-2 pt-4 border-t border-cream-100">
            <h3 className="font-serif text-xl font-bold text-botanical-950">Full Ingredients</h3>
            <p className="text-xs sm:text-sm text-warmgray-800 leading-relaxed bg-cream-50 p-4 rounded-2xl border border-cream-100 font-mono">
              {product.ingredients}
            </p>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cream-100 text-xs text-warmgray-700">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-botanical-800 shrink-0" />
              <span>100% Cold Processed</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-botanical-800 shrink-0" />
              <span>Glycerin Retained</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4.5 h-4.5 text-botanical-800 shrink-0" />
              <span>Eco-Conscious Packaging</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4.5 h-4.5 text-botanical-800 shrink-0" />
              <span>Vadodara Artisanal Craft</span>
            </div>
          </div>

        </div>

      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-8 pt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-botanical-950">
              Related Skincare Products
            </h2>
            <Link to="/products" className="text-xs font-semibold text-botanical-900 hover:text-gold-700">
              View All Products &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Order Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-200 p-3 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-warmgray-500 block uppercase tracking-wider font-semibold">{product.name}</span>
          <span className="font-serif text-xl font-bold text-botanical-950">₹{product.mrp}</span>
        </div>
        <a
          href={`https://wa.me/919726739515?text=${encodeURIComponent(`Hello! I would like to order ${product.name} (₹${product.mrp}).`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold shadow-md"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Order on WhatsApp</span>
        </a>
      </div>

    </div>
  );
};

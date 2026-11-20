import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Phone, ShieldCheck, Sparkles, Truck, Package, MessageCircle, ChevronRight, CreditCard, Heart } from 'lucide-react';
import { useProductCatalog } from '../context/ProductContext';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';
import { OrderModal } from '../components/OrderModal';
import { isInWishlist, toggleWishlist, trackProductInterest } from '../services/crmService';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, products } = useProductCatalog();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  const product = getProductById(id || '');

  useEffect(() => {
    if (product) {
      isInWishlist(product.id).then(setInWishlist);
      trackProductInterest(product.id, 'view_details');
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
        <SEO
          title="Product Not Found | ONZNATURAL"
          description="The requested handcrafted botanical skincare product could not be found."
          canonical="https://onznatural.com/products"
        />
        <h2 className="font-serif text-3xl font-bold text-primary-950">Product Not Found</h2>
        <p className="text-sand-700">The product you are looking for does not exist or has been moved.</p>
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-900 text-white font-semibold text-sm hover:bg-primary-950 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Showcase</span>
        </button>
      </div>
    );
  }

  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const allImages = [product.image, ...(product.additionalImages || [])];

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleToggleWishlist = async () => {
    const newState = await toggleWishlist(product.id);
    setInWishlist(newState);
  };

  const getHowToUseGuide = (category: string) => {
    if (category.includes('Soap')) {
      return 'Lather the soap bar between wet palms. Apply gently onto face and body in circular motions. Rinse thoroughly with water and place the soap bar on a well-draining dish to dry between uses.';
    } else if (category.includes('Wash')) {
      return 'Dispense a coin-sized amount onto wet palms or a loofah. Work into a gentle botanical lather and cleanse body or face gently. Rinse clean with fresh water.';
    } else if (category.includes('Cream') || category.includes('Lotion')) {
      return 'Take a small portion onto your fingertips and massage smoothly onto freshly cleansed, slightly damp skin until absorbed. Use daily after bath for best results.';
    } else {
      return 'Apply evenly onto lips as needed throughout the day to keep lips soft, smooth, and protected against dryness.';
    }
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: `https://onznatural.com${product.image.startsWith('/') ? '' : '/'}${product.image}`,
    description: product.fullDescription,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'ONZNATURAL'
    },
    offers: {
      '@type': 'Offer',
      url: `https://onznatural.com/products/${product.id}`,
      priceCurrency: 'INR',
      price: product.mrp,
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'ONZNATURAL'
      }
    },
    category: product.category
  };

  return (
    <div className="py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 w-full overflow-x-clip pb-24 lg:pb-16">
      <SEO
        title={`${product.name} (₹${product.mrp}) | ONZNATURAL`}
        description={product.shortDescription || product.fullDescription.slice(0, 155)}
        image={product.image}
        canonical={`https://onznatural.com/products/${product.id}`}
        schema={productSchema}
      />
      
      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs sm:text-sm text-sand-600">
        <Link to="/" className="hover:text-primary-950 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-primary-950 transition-colors">Products</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-primary-950 font-semibold truncate">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start bg-white p-6 sm:p-10 lg:p-12 rounded-3xl border border-sand-200 shadow-sm">
        
        {/* Product Image Display & Variants */}
        <div className="lg:col-span-6 space-y-4">
          <div className="w-full h-96 sm:h-[460px] bg-sand-50 rounded-2xl overflow-hidden p-8 border border-sand-200 flex items-center justify-center relative">
            <img
              src={selectedImage}
              alt={`${product.name} packaging - ONZNATURAL Handcrafted Care Vadodara`}
              className="w-full h-full object-contain max-h-[420px]"
              width={420}
              height={420}
              fetchPriority="high"
            />
            <span className="absolute top-4 left-4 bg-primary-900 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              {product.category}
            </span>
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`absolute top-4 right-4 p-2.5 rounded-full shadow-sm transition-colors ${
                inWishlist ? 'bg-red-50 text-red-600' : 'bg-white/90 text-sand-600 hover:text-red-600'
              }`}
              title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          {allImages.length > 1 && (
            <div className="flex items-center gap-3 pt-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 p-1.5 bg-sand-50 transition-all ${
                    selectedImage === img ? 'border-primary-900 scale-105 shadow-sm' : 'border-sand-200 hover:border-sand-400'
                  }`}
                  aria-label={`View photo variant ${idx + 1} of ${product.name}`}
                >
                  <img
                    src={img}
                    alt={`${product.name} photo angle ${idx + 1}`}
                    width={80}
                    height={80}
                    loading="lazy"
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-950 mb-3">
              {product.name}
            </h1>
            <p className="text-sand-800 text-sm sm:text-base leading-relaxed">
              {product.fullDescription}
            </p>
          </div>

          {/* Pricing & Net Volume Card */}
          <div className="p-5 rounded-2xl bg-sand-50 border border-sand-200 grid grid-cols-2 sm:grid-cols-3 gap-4 shadow-xs">
            <div>
              <span className="text-xs text-sand-600 font-medium block">Net Weight / Volume</span>
              <span className="text-sm font-bold text-primary-950">{product.netWeightOrVol}</span>
            </div>
            {product.skinType && (
              <div>
                <span className="text-xs text-sand-600 font-medium block">Recommended For</span>
                <span className="text-xs font-semibold text-primary-950 bg-sand-200 border border-sand-300 px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                  {product.skinType}
                </span>
              </div>
            )}
            <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
              <span className="text-xs text-sand-600 uppercase tracking-wider block font-semibold">MRP (Incl. all taxes)</span>
              <span className="font-serif text-3xl font-bold text-primary-950">₹{product.mrp}</span>
            </div>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  trackProductInterest(product.id, 'order_intent');
                  setIsOrderModalOpen(true);
                }}
                className="w-full py-4 rounded-xl bg-primary-950 hover:bg-primary-900 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <CreditCard className="w-5 h-5 text-accent-400" />
                <span>Buy Now (UPI / COD)</span>
              </button>

              <WhatsAppButton
                productName={product.name}
                mrp={product.mrp}
                className="w-full py-4 text-sm sm:text-base justify-center shadow-md font-bold"
                label="Order via WhatsApp"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="tel:+919726739515"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border-2 border-primary-950 text-primary-950 font-bold text-xs sm:text-sm hover:bg-sand-100 transition-all shadow-xs"
              >
                <Phone className="w-4 h-4 text-primary-900" />
                <span>Call: +91 97267 39515</span>
              </a>

              <Link
                to="/ai-consultant"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-sand-100 hover:bg-sand-200 border-2 border-primary-900/30 text-primary-950 font-bold text-xs sm:text-sm transition-all shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-accent-700" />
                <span>Ask AI About This Product</span>
              </Link>
            </div>
          </div>

          {/* Benefits Checklist */}
          <div className="space-y-3 pt-4 border-t border-sand-200">
            <h3 className="font-serif text-xl font-bold text-primary-950">Product Benefits</h3>
            <ul className="space-y-2.5">
              {product.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-sand-800 leading-snug">
                  <CheckCircle2 className="w-4 h-4 text-accent-700 shrink-0 mt-0.5" />
                  <span className="font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* How to Use Block */}
          <div className="space-y-2 pt-4 border-t border-sand-200">
            <h3 className="font-serif text-xl font-bold text-primary-950">How to Use</h3>
            <p className="text-xs sm:text-sm text-sand-800 leading-relaxed bg-sand-50 p-4 rounded-2xl border border-sand-200">
              {getHowToUseGuide(product.category)}
            </p>
          </div>

          {/* Full Ingredients List */}
          <div className="space-y-2 pt-4 border-t border-sand-200">
            <h3 className="font-serif text-xl font-bold text-primary-950">Full Ingredients</h3>
            <p className="text-xs sm:text-sm text-sand-800 leading-relaxed bg-sand-50 p-4 rounded-2xl border border-sand-200 font-mono">
              {product.ingredients}
            </p>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-sand-200 text-xs text-sand-700">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-primary-900 shrink-0" />
              <span>100% Plant-Based Oils</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-accent-700 shrink-0" />
              <span>Natural Glycerin Retained</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4.5 h-4.5 text-primary-900 shrink-0" />
              <span>Eco-Conscious Packaging</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4.5 h-4.5 text-primary-900 shrink-0" />
              <span>Vadodara Artisanal Craft</span>
            </div>
          </div>

        </div>

      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-8 pt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary-950">
              Related Botanical Care
            </h2>
            <Link to="/products" className="text-xs font-semibold text-primary-900 hover:text-accent-700">
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-sand-200 px-3.5 py-2.5 flex items-center justify-between shadow-2xl safe-area-bottom">
        <div>
          <span className="text-[10px] text-sand-600 block uppercase tracking-wider font-semibold truncate max-w-[110px]">{product.name}</span>
          <span className="font-serif text-lg font-bold text-primary-950">₹{product.mrp}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              trackProductInterest(product.id, 'order_intent');
              setIsOrderModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-primary-900 text-white text-xs font-bold shadow-sm active:scale-95 transition-transform"
          >
            Buy (UPI/COD)
          </button>
          <a
            href={`https://api.whatsapp.com/send?phone=919726739515&text=${encodeURIComponent(`Hello! I would like to order ${product.name} (₹${product.mrp}) from ONZNATURAL. Please provide delivery details.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="btn-whatsapp-3d flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-bold shadow-md active:scale-95 transition-transform cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Interactive Order / Buy Modal */}
      <OrderModal
        product={isOrderModalOpen ? product : null}
        onClose={() => setIsOrderModalOpen(false)}
      />

    </div>
  );
};

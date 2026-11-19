import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Phone, ShieldCheck, Sparkles, Truck, Package, MessageCircle, ChevronRight, CreditCard } from 'lucide-react';
import { productsData } from '../data/products';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';
import { OrderModal } from '../components/OrderModal';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const product = productsData.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
        <SEO
          title="Product Not Found | Lavanya Natural Care"
          description="The requested handcrafted skincare product could not be found."
        />
        <h2 className="font-serif text-3xl font-bold text-botanical-950">Product Not Found</h2>
        <p className="text-warmgray-600">The product you are looking for does not exist or has been moved.</p>
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-botanical-800 text-white font-semibold text-sm hover:bg-botanical-900 transition-colors shadow-sm"
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

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: `https://lavanyanatural.in${product.image.startsWith('/') ? '' : '/'}${product.image}`,
    description: product.fullDescription,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Lavanya Natural Care'
    },
    offers: {
      '@type': 'Offer',
      url: `https://lavanyanatural.in/products/${product.id}`,
      priceCurrency: 'INR',
      price: product.mrp,
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Lavanya Natural Care'
      }
    },
    category: product.category
  };

  return (
    <div className="py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 w-full overflow-x-clip pb-24 lg:pb-16">
      <SEO
        title={`${product.name} (₹${product.mrp}) | Lavanya Natural Care`}
        description={product.shortDescription || product.fullDescription.slice(0, 155)}
        image={product.image}
        schema={productSchema}
      />
      
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
              alt={`${product.name} handmade cold process bar - Lavanya Natural Care Vadodara`}
              className="w-full h-full object-contain max-h-[420px]"
              width={420}
              height={420}
              fetchPriority="high"
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
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-botanical-950 mb-3">
              {product.name}
            </h1>
            <p className="text-warmgray-600 text-sm sm:text-base leading-relaxed">
              {product.fullDescription}
            </p>
          </div>

          {/* Pricing & Net Volume Card */}
          <div className="p-5 rounded-2xl bg-cream-50 border border-cream-200 grid grid-cols-2 sm:grid-cols-3 gap-4 shadow-xs">
            <div>
              <span className="text-xs text-warmgray-500 font-medium block">Net Weight / Volume</span>
              <span className="text-sm font-bold text-botanical-950">{product.netWeightOrVol}</span>
            </div>
            {product.skinType && (
              <div>
                <span className="text-xs text-warmgray-500 font-medium block">Recommended For</span>
                <span className="text-xs font-semibold text-botanical-900 bg-botanical-100/90 border border-botanical-200/80 px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                  {product.skinType}
                </span>
              </div>
            )}
            <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
              <span className="text-xs text-warmgray-500 uppercase tracking-wider block font-semibold">MRP (Incl. all taxes)</span>
              <span className="font-serif text-3xl font-bold text-botanical-950">₹{product.mrp}</span>
            </div>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(true)}
                className="btn-botanical-3d w-full py-4 rounded-xl text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md cursor-pointer hover:shadow-lg transition-all"
              >
                <CreditCard className="w-5 h-5 text-gold-400" />
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
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-botanical-800 text-botanical-900 font-semibold text-xs sm:text-sm hover:bg-botanical-800 hover:text-white transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Call: +91 97267 39515</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('open-lavanya-ai-assistant', {
                      detail: {
                        initialPrompt: `Is ${product.name} suitable for my skin type? What are the cold-process benefits of its key ingredients (${product.ingredients})?`
                      }
                    })
                  );
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-cream-100 hover:bg-gold-100/60 border border-gold-400/40 text-botanical-950 font-bold text-xs sm:text-sm transition-all shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-gold-600" />
                <span>Ask AI About This Soap</span>
              </button>
            </div>
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-cream-200 px-3.5 py-2.5 flex items-center justify-between shadow-2xl safe-area-bottom">
        <div>
          <span className="text-[10px] text-warmgray-500 block uppercase tracking-wider font-semibold truncate max-w-[110px]">{product.name}</span>
          <span className="font-serif text-lg font-bold text-botanical-950">₹{product.mrp}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOrderModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-botanical-800 text-white text-xs font-bold shadow-sm active:scale-95 transition-transform"
          >
            Buy (UPI/COD)
          </button>
          <a
            href={`https://api.whatsapp.com/send?phone=919726739515&text=${encodeURIComponent(`Hello! I would like to order ${product.name} (₹${product.mrp}) from Lavanya Natural Care. Please provide delivery details.`)}`}
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

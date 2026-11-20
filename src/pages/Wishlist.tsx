import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, toggleWishlist } from '../services/crmService';
import { VERIFIED_PRODUCTS } from '../data/productKnowledge';
import { SEO } from '../components/SEO';
import { Heart, Trash2, ArrowRight, ExternalLink } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWishlist().then(ids => {
      setWishlistIds(ids);
      setLoading(false);
    });
  }, []);

  const handleRemove = async (productId: string) => {
    await toggleWishlist(productId);
    const updated = await getWishlist();
    setWishlistIds(updated);
  };

  const savedProducts = VERIFIED_PRODUCTS.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-sand-50 py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="My Wishlist | ONZNATURAL"
        description="View your saved handcrafted cold-process soaps, body lotions, and botanical skincare from ONZNATURAL."
        canonical="https://onznatural.com/wishlist"
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-semibold tracking-widest text-accent-700 block mb-2">
            Your Personal Selection
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-primary-950">
            Saved Botanicals
          </h1>
          <p className="mt-2 text-sm text-sand-800">
            Handcrafted in small batches with retained vegetable glycerin and pure botanical oils
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-primary-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-sand-700">Loading saved items...</p>
          </div>
        ) : savedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-sand-200 max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-sand-100 flex items-center justify-center mx-auto mb-4 text-sand-400">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif font-medium text-primary-950 mb-2">
              Your wishlist is currently empty
            </h2>
            <p className="text-xs text-sand-700 mb-6 leading-relaxed">
              Explore our artisanal cold-process soaps, rich body lotions, and herbal face care to save your favorites.
            </p>
            <Link
              to="/products"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-xs font-bold transition-colors shadow-sm"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProducts.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="relative aspect-square bg-sand-100 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm text-sand-600 hover:text-red-700 transition-colors shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary-950/80 text-white backdrop-blur-sm">
                      {p.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-primary-950 mb-1">
                      {p.name}
                    </h3>
                    <p className="text-xs text-sand-700 line-clamp-2 mb-3">
                      {p.shortDescription || p.fullDescription}
                    </p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-base font-bold text-primary-900">
                        ₹{p.mrp}
                      </span>
                      <span className="text-xs text-sand-600">
                        / {p.netWeightOrVol}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-sand-100 flex items-center gap-2">
                    <Link
                      to={`/product/${p.id}`}
                      className="btn-secondary-outline flex-1 py-2 px-3 rounded-xl text-center text-xs font-bold transition-colors"
                    >
                      View Details
                    </Link>
                    <a
                      href={`https://wa.me/919726739515?text=${encodeURIComponent(`Hello ONZNATURAL, I would like to order ${p.name} (₹${p.mrp}, ${p.netWeightOrVol}).`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex-1 py-2 px-3 rounded-xl text-white text-center text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Order</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

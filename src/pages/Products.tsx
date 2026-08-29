import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Sparkles, Gift, ArrowRight, Check } from 'lucide-react';
import { productsData } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { RAKSHA_BANDHAN_CAMPAIGN, isCampaignActive } from '../data/campaign';

export const Products: React.FC = () => {
  const campaignActive = isCampaignActive();

  const allCategories = [
    'All Products',
    '🎁 Festive Combos',
    'Handmade Cold Process Soap',
    'Face & Body Wash',
    'Hand Wash',
    'Face Care',
    'Body Care',
    'Lip Care'
  ] as const;

  const categories = useMemo(() => {
    return campaignActive ? allCategories : allCategories.filter(c => c !== '🎁 Festive Combos');
  }, [campaignActive]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProducts = useMemo(() => {
    return productsData.filter((product) => {
      const matchesCategory = 
        selectedCategory === 'All Products' || 
        selectedCategory === '🎁 Festive Combos' ||
        product.category === selectedCategory;

      const matchesSearch = searchQuery.trim() === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.ingredients.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Group products by category for 'All Products' view when no search query
  const categoryGroups = useMemo(() => {
    return [
      { title: 'Handmade Cold Process Soap', items: filteredProducts.filter(p => p.category === 'Handmade Cold Process Soap') },
      { title: 'Face & Body Wash', items: filteredProducts.filter(p => p.category === 'Face & Body Wash') },
      { title: 'Hand Wash', items: filteredProducts.filter(p => p.category === 'Hand Wash') },
      { title: 'Face Care', items: filteredProducts.filter(p => p.category === 'Face Care') },
      { title: 'Body Care', items: filteredProducts.filter(p => p.category === 'Body Care') },
      { title: 'Lip Care', items: filteredProducts.filter(p => p.category === 'Lip Care') }
    ].filter(group => group.items.length > 0);
  }, [filteredProducts]);

  return (
    <div className="py-12 md:py-20 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-botanical-100 text-botanical-800 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
          <span>Pure Botanical Care</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-botanical-950">
          Handcrafted Product Showcase
        </h1>
        <p className="text-warmgray-600 text-base leading-relaxed">
          Explore our complete collection of handcrafted cold-process soaps, liquid washes, creams, and lotions. Select any item to view complete details or order directly via WhatsApp.
        </p>
      </div>

      {/* Prominent Festive Combos Spotlight Banner */}
      {isCampaignActive() && (
        <div className="bg-gradient-to-r from-botanical-950 via-botanical-900 to-[#9A3916] text-white rounded-3xl p-6 sm:p-8 md:p-10 border-2 border-gold-400/40 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-gold-300 text-xs font-bold uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5" />
              <span>Raksha Bandhan Special Offer • 19–28 August 2026</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-cream-50 leading-tight">
              Looking for Festive Gift Combos?
            </h2>
            <p className="text-xs sm:text-sm text-cream-200 max-w-xl">
              Save up to 25% on our 3 exclusive customizable gifting boxes. Choose your favorite soaps, body wash, and lip balm variants.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
            <Link
              to="/customize-combo"
              className="w-full sm:w-auto px-7 py-4 rounded-xl btn-botanical-3d text-white font-bold text-sm shadow-md hover:scale-105 transition-all text-center flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4 text-gold-400" />
              <span>Customize Your Combo Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Controls Bar: Category Tabs & Search Bar */}
      <div className="space-y-6">
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-warmgray-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, herb, or ingredient..."
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-cream-200 rounded-2xl text-sm font-medium text-warmgray-900 focus:outline-none focus:ring-2 focus:ring-botanical-800 focus:border-transparent shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 text-warmgray-400 hover:text-warmgray-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills with Count Badges */}
        <div className="flex items-center justify-center flex-wrap gap-2.5">
          {categories.map((category) => {
            const isFestive = category === '🎁 Festive Combos';
            const isSelected = selectedCategory === category;

            const count = category === 'All Products'
              ? productsData.length
              : category === '🎁 Festive Combos'
                ? RAKSHA_BANDHAN_CAMPAIGN.combos.length
                : productsData.filter((p) => p.category === category).length;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  isFestive && isSelected
                    ? 'bg-[#C85A32] text-white shadow-sm ring-2 ring-gold-400'
                    : isFestive
                      ? 'bg-[#C85A32]/10 border border-[#C85A32]/40 text-[#A03D1A] font-bold hover:bg-[#C85A32]/20'
                      : isSelected
                        ? 'bg-botanical-800 text-cream-50 shadow-sm'
                        : 'bg-white text-warmgray-700 border border-cream-200 hover:border-gold-400'
                }`}
              >
                <span>{category}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-cream-100 text-warmgray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* When Festive Combos Category is Clicked */}
      {selectedCategory === '🎁 Festive Combos' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-gold-700 uppercase tracking-wider">
              19 – 28 August 2026 Special
            </span>
            <h2 className="font-serif text-3xl font-bold text-botanical-950">
              Raksha Bandhan Gifting Combos
            </h2>
            <p className="text-xs sm:text-sm text-warmgray-600">
              Select any combo below to customize with your favorite soap variants and place your direct order on WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {RAKSHA_BANDHAN_CAMPAIGN.combos.map((combo) => (
              <div
                key={combo.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-cream-200 hover:border-gold-400 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between relative"
              >
                <div className="absolute top-4 right-4 bg-[#C85A32] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs uppercase tracking-wider">
                  {combo.discountLabel}
                </div>

                <div>
                  <span className="text-xs font-bold text-gold-700 uppercase tracking-wider block mb-1">
                    Combo 0{combo.number}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-botanical-950 mb-1">
                    {combo.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#A03D1A] uppercase tracking-wider mb-4">
                    {combo.tagline}
                  </p>

                  <div className="w-full h-44 rounded-2xl overflow-hidden bg-cream-50 p-3 mb-6 border border-cream-100 flex items-center justify-center">
                    <img src={combo.image} alt={combo.title} className="w-full h-full object-contain" />
                  </div>

                  <ul className="space-y-2 mb-6 text-xs text-warmgray-700">
                    {combo.sampleItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-botanical-800 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-cream-100">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-[11px] text-warmgray-500 line-through block font-medium">MRP ₹{combo.mrp}</span>
                      <span className="font-serif text-3xl font-bold text-botanical-950">₹{combo.specialPrice}</span>
                    </div>
                    <span className="bg-botanical-50 text-botanical-800 border border-botanical-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                      SAVE ₹{combo.saving}
                    </span>
                  </div>

                  <Link
                    to={`/customize-combo/${combo.id}`}
                    className="w-full py-3.5 rounded-xl btn-botanical-3d text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm text-center"
                  >
                    <span>Customize This Combo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Products Grid when not strictly on Festive Combos category */}
      {selectedCategory !== '🎁 Festive Combos' && (
        <>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-cream-200 max-w-md mx-auto p-8 space-y-4">
              <Sparkles className="w-8 h-8 text-warmgray-400 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-botanical-950">No Products Found</h3>
              <p className="text-xs text-warmgray-600">
                We couldn't find any products matching "{searchQuery}". Try searching for Neem, Kesuda, Ubtan, or Hibiscus.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All Products'); }}
                className="px-5 py-2 rounded-xl bg-botanical-800 text-white text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : selectedCategory === 'All Products' && !searchQuery ? (
            // Grouped By Category Display
            <div className="space-y-16">
              {categoryGroups.map((group) => (
                <div key={group.title} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-cream-200 pb-3">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-botanical-950">
                      {group.title}
                    </h2>
                    <span className="text-xs font-semibold text-warmgray-500">
                      {group.items.length} Product{group.items.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {group.items.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Flat Grid for Specific Category or Active Search
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-warmgray-600 px-1">
                <span>Showing {filteredProducts.length} product{filteredProducts.length > 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};

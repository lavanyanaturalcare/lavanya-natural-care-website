import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, CheckCircle2, ArrowRight, Search, X } from 'lucide-react';
import { ingredientsData } from '../data/ingredients';
import { SEO } from '../components/SEO';

export const Ingredients: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredIngredients = useMemo(() => {
    if (!searchQuery.trim()) return ingredientsData;
    const query = searchQuery.toLowerCase();
    return ingredientsData.filter(
      (ing) =>
        ing.name.toLowerCase().includes(query) ||
        (ing.hindiName && ing.hindiName.toLowerCase().includes(query)) ||
        ing.description.toLowerCase().includes(query) ||
        ing.benefits.some((b) => b.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  return (
    <div className="py-12 md:py-20 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-x-clip">
      <SEO
        title="Pure Botanical Ingredients & Ayurvedic Herbs | Lavanya Natural Care"
        description="Learn about the pure ingredients in Lavanya Natural Care soaps: Kesuda (Palash), Neem, Tulsi, Ubtan, Kokum Butter, Hibiscus, Lavender, and pure cold-pressed plant oils."
      />
      
      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-botanical-100 text-botanical-800 text-xs font-semibold uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5 text-botanical-600" />
          <span>Pure Botanical Education</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-botanical-950">
          Our Pure Botanical Ingredients
        </h1>
        <p className="text-warmgray-600 text-base leading-relaxed">
          We use cold-pressed vegetable oils, Ayurvedic herbs, and fresh flower infusions. Discover what goes inside every Lavanya product.
        </p>
      </div>

      {/* Ingredient Search Bar */}
      <div className="max-w-md mx-auto relative">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-warmgray-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ingredients by name or benefit (e.g. Neem, Cooling, Glow)..."
            className="w-full pl-12 pr-10 py-3.5 bg-white border border-cream-200 rounded-2xl text-sm font-medium text-warmgray-900 focus:outline-none focus:ring-2 focus:ring-botanical-800 focus:border-transparent shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 p-1 text-warmgray-400 hover:text-warmgray-700 rounded-full"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Ingredient Grid */}
      {filteredIngredients.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 space-y-4 max-w-lg mx-auto">
          <h3 className="font-serif text-2xl font-bold text-botanical-950">No Ingredients Found</h3>
          <p className="text-warmgray-600 text-sm">
            No botanical ingredients match your search query "{searchQuery}".
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-6 py-2.5 rounded-xl bg-botanical-800 text-white font-semibold text-xs"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredIngredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="card-3d rounded-3xl p-7 sm:p-8 border border-cream-200/80 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* Ingredient Image on Soft Platform */}
                <div className="w-full h-56 sm:h-64 bg-cream-50 rounded-2xl overflow-hidden p-3 border border-cream-100/80 flex items-center justify-center relative group">
                  <img
                    src={ingredient.image}
                    alt={ingredient.name}
                    loading="lazy"
                    className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-bold text-botanical-950">
                    {ingredient.name}
                  </h3>
                  {ingredient.hindiName && (
                    <span className="text-xs text-gold-700 font-semibold block mt-0.5">
                      {ingredient.hindiName}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-warmgray-600 leading-relaxed">
                  {ingredient.description}
                </p>

                {/* Benefits */}
                <div className="space-y-2 pt-2 border-t border-cream-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-700 block">
                    Botanical Benefits
                  </span>
                  <ul className="space-y-1.5">
                    {ingredient.benefits.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-warmgray-800 leading-snug">
                        <CheckCircle2 className="w-3.5 h-3.5 text-gold-600 shrink-0 mt-0.5" />
                        <span className="font-medium">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Products using this ingredient */}
              <div className="pt-4 border-t border-cream-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-warmgray-500 block">
                  Found In Products:
                </span>
                <div className="flex flex-wrap gap-2">
                  {ingredient.usedInProducts.map((p) => (
                    <Link
                      key={p.id}
                      to={`/products/${p.id}`}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-cream-100 text-botanical-900 font-semibold hover:bg-botanical-800 hover:text-white transition-colors"
                    >
                      <span>{p.name}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Explore Products Call to Action */}
      <div className="bg-botanical-950 text-cream-50 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 border border-botanical-800">
        <Leaf className="w-10 h-10 text-gold-400 mx-auto" />
        <h2 className="font-serif text-3xl sm:text-4xl font-bold">
          Experience These Pure Botanicals
        </h2>
        <p className="text-warmgray-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Every bar of soap and bottle of wash is packed with these fresh herbs and cold-pressed oils. Handcrafted locally in Vadodara.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl btn-botanical-3d text-white font-bold text-sm shadow-md"
          >
            <span>Browse All 13 Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-cream-200 text-cream-50 font-semibold text-sm hover:bg-cream-50 hover:text-botanical-950 transition-all"
          >
            <span>Have Ingredient Questions?</span>
          </Link>
        </div>
      </div>

    </div>
  );
};

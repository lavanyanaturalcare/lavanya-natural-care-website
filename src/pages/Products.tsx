import React, { useState, useMemo } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { productsData } from '../data/products';
import { ProductCard } from '../components/ProductCard';

export const Products: React.FC = () => {
  const categories = [
    'All Products',
    'Handmade Cold Process Soap',
    'Face & Body Wash',
    'Hand Wash',
    'Face Care',
    'Body Care',
    'Lip Care'
  ] as const;

  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProducts = useMemo(() => {
    return productsData.filter((product) => {
      const matchesCategory = selectedCategory === 'All Products' || product.category === selectedCategory;
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
                className="absolute right-3.5 p-1 text-warmgray-400 hover:text-warmgray-700 rounded-full"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2 md:gap-3 py-2 border-y border-cream-200">
          {categories.map((cat) => {
            const count = cat === 'All Products' 
              ? productsData.length 
              : productsData.filter(p => p.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-botanical-800 text-cream-50 shadow-sm'
                    : 'bg-white text-warmgray-700 hover:bg-cream-100 border border-cream-200'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedCategory === cat ? 'bg-botanical-900 text-gold-400' : 'bg-cream-100 text-warmgray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Categorized Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 space-y-4 max-w-lg mx-auto">
          <h3 className="font-serif text-2xl font-bold text-botanical-950">No Products Found</h3>
          <p className="text-warmgray-600 text-sm">
            We couldn't find any products matching "{searchQuery}". Try searching for terms like "Neem", "Kesuda", "Soap", or "Cream".
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All Products'); }}
            className="px-6 py-2.5 rounded-xl bg-botanical-800 text-white font-semibold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : selectedCategory === 'All Products' && !searchQuery ? (
        <div className="space-y-20">
          {categoryGroups.map((group) => (
            <section key={group.title} className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-botanical-950 shrink-0">
                  {group.title}
                </h2>
                <div className="h-px bg-cream-300 w-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {group.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};

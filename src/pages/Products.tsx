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
      const matchesCategory = 
        selectedCategory === 'All Products' || 
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
            const isSelected = selectedCategory === category;

            const count = category === 'All Products'
              ? productsData.length
              : productsData.filter((p) => p.category === category).length;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  isSelected
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

      {/* Main Products Grid */}
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

    </div>
  );
};

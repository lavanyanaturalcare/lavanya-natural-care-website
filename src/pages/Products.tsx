import React, { useState, useMemo } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { useProductCatalog } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';

export const Products: React.FC = () => {
  const categories = [
    'All Products',
    'Handmade Cold Process Soap',
    'Body Care & Lotions',
    'Body & Face Creams',
    'Face & Body Wash',
    'Hand Wash',
    'Lip Care'
  ] as const;

  const { products } = useProductCatalog();
  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = 
        selectedCategory === 'All Products' || 
        (selectedCategory === 'Body Care & Lotions' ? product.category === 'Body Care' :
         selectedCategory === 'Body & Face Creams' ? product.category === 'Face Care' :
         (product.category as string) === selectedCategory);

      const matchesSearch = searchQuery.trim() === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.ingredients.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="py-12 md:py-20 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-x-clip">
      <SEO
        title="Handcrafted Botanical Soaps & Care (16 Items) | ONZNATURAL"
        description="Explore ONZNATURAL's 16 handcrafted cold-process soaps, botanical body lotions, creams, and face washes made with pure plant oils in Vadodara, Gujarat."
        canonical="https://onznatural.com/products"
      />
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand-200 text-primary-950 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-accent-700" />
          <span>ONZNATURAL Verified Botanical Collection</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary-950">
          Handcrafted Product Collection
        </h1>
        <p className="text-sand-800 text-base leading-relaxed">
          Explore all 16 artisanal cold-process soaps, rich botanical body lotions, creams, and washes. Handcrafted with authentic plant oils and flower infusions in Vadodara, Gujarat.
        </p>
      </div>

      {/* Controls Bar: Category Tabs & Search Bar */}
      <div className="space-y-6">
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-sand-500 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, herb, or ingredient..."
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-sand-300 rounded-2xl text-sm font-medium text-primary-950 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 text-sand-500 hover:text-sand-800 p-1"
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
              ? products.length
              : products.filter((p) => {
                  if (category === 'Body Care & Lotions') return p.category === 'Body Care';
                  if (category === 'Body & Face Creams') return p.category === 'Face Care';
                  return (p.category as string) === category;
                }).length;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-primary-950 text-white shadow-md border-2 border-primary-950'
                    : 'bg-white text-primary-950 border-2 border-sand-300 hover:border-primary-900 hover:bg-sand-100 shadow-xs'
                }`}
              >
                <span>{category}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  isSelected
                    ? 'bg-white/25 text-white'
                    : 'bg-sand-200 text-primary-950'
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
        <div className="text-center py-16 bg-white rounded-3xl border border-sand-200 max-w-md mx-auto p-8 space-y-4">
          <Sparkles className="w-8 h-8 text-sand-500 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-primary-950">No Products Found</h3>
          <p className="text-xs text-sand-700">
            We couldn't find any products matching "{searchQuery}". Try searching for Neem, Kesuda, Aparajita, or Ubtan.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All Products'); }}
            className="px-5 py-2 rounded-xl bg-primary-900 text-white text-xs font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-sand-700 px-1">
            <span>Showing {filteredProducts.length} handcrafted product{filteredProducts.length > 1 ? 's' : ''}</span>
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

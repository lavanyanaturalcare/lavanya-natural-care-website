import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Shield, Award, Sparkles, CheckCircle2, MessageCircle, Phone } from 'lucide-react';
import { productsData } from '../data/products';
import { ingredientsData } from '../data/ingredients';
import { processSteps } from '../data/process';
import { socialAccounts } from '../data/social';
import { ProductCard } from '../components/ProductCard';
import { WhatsAppButton } from '../components/WhatsAppButton';

export const Home: React.FC = () => {
  const featuredProducts = productsData.filter((p) => p.isFeatured).slice(0, 4);

  return (
    <div className="space-y-20 md:space-y-28 pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream-100 via-cream-50 to-white py-16 md:py-24 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-botanical-100 text-botanical-800 text-xs font-semibold uppercase tracking-wider">
                <Leaf className="w-3.5 h-3.5 text-botanical-600" />
                <span>100% Handcrafted Cold Process Skincare</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-botanical-950 leading-[1.15]">
                Pure Botanical Care, <br />
                <span className="italic font-normal text-botanical-800">Handcrafted with Care</span>
              </h1>

              <p className="text-warmgray-600 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Discover authentic Indian cold-process soaps and gentle plant-based skincare. Infused with pure flower water, botanical oils, and Ayurvedic herbs in small batches in Vadodara.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-botanical-800 hover:bg-botanical-900 text-cream-50 font-semibold text-sm shadow-md hover:shadow-lg transition-all text-center"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <WhatsAppButton
                  variant="outline"
                  label="Inquire on WhatsApp"
                  className="py-4"
                />
              </div>

              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-cream-200 text-xs sm:text-sm text-warmgray-700">
                <div>
                  <span className="block font-serif text-xl font-bold text-botanical-900">100%</span>
                  <span className="text-warmgray-500">Natural Ingredients</span>
                </div>
                <div>
                  <span className="block font-serif text-xl font-bold text-botanical-900">Cold Process</span>
                  <span className="text-warmgray-500">Glycerin Preserved</span>
                </div>
                <div>
                  <span className="block font-serif text-xl font-bold text-botanical-900">Small Batch</span>
                  <span className="text-warmgray-500">Artisanal Quality</span>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white/90 bg-cream-100 animate-float-slow">
                <img
                  src="/assets/use-for-making-website/our Collection.png"
                  alt="Lavanya Natural Care Collection"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Floating Layered Badge */}
              <div className="absolute -bottom-6 -left-6 glass-card p-4 rounded-2xl hidden sm:flex items-center gap-3.5 max-w-xs shadow-xl animate-float-slow" style={{ animationDelay: '-3s' }}>
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-700 flex items-center justify-center shrink-0 border border-gold-400/40">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-botanical-950 block">Vadodara Handcrafted</span>
                  <span className="text-warmgray-600 font-medium">100% Glycerin Retained</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* About Lavanya Summary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-cream-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-700">
              About Lavanya Natural Care
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-botanical-950">
              Simplicity & Purity in Every Bar
            </h2>
            <p className="text-warmgray-600 leading-relaxed text-sm sm:text-base">
              At Lavanya Natural Care, we believe skincare should be as honest as nature itself. We formulate our cold-process soaps and liquid washes using time-honored traditional techniques that retain all naturally generated plant glycerin.
            </p>
            <p className="text-warmgray-600 leading-relaxed text-sm sm:text-base">
              From fresh Kesuda (Palash) flower infusions to purifying Neem and Tulsi, every ingredient is chosen with intention to nourish your skin gently every day.
            </p>
            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-botanical-800 font-semibold text-sm hover:text-gold-700 transition-colors"
              >
                <span>Read Our Full Brand Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden shadow-md border border-cream-200">
              <img
                src="/assets/use-for-making-website/soaps image.webp"
                alt="Handcrafted Soap Bars"
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-700 block mb-1">
              Curated Favorites
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-botanical-950">
              Featured Skincare Products
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-botanical-800 text-botanical-900 font-semibold text-sm hover:bg-botanical-800 hover:text-white transition-colors"
          >
            <span>View All 12 Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-botanical-900 text-cream-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400 block mb-2">
              Our Core Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream-50">
              Why Choose Lavanya Natural Care?
            </h2>
            <p className="text-warmgray-300 text-sm mt-3">
              We eliminate harsh detergents, artificial hardening agents, and filler chemicals to give your skin genuine plant nourishment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-botanical-950/60 p-6 rounded-2xl border border-botanical-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-botanical-800 text-gold-400 mx-auto flex items-center justify-center">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-cream-50">100% Plant Oils</h3>
              <p className="text-xs text-warmgray-400 leading-relaxed">
                Formulated exclusively with pure cold-pressed Coconut, Mahua, Castor, Sunflower, and Olive oils.
              </p>
            </div>

            <div className="bg-botanical-950/60 p-6 rounded-2xl border border-botanical-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-botanical-800 text-gold-400 mx-auto flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-cream-50">Glycerin Preserved</h3>
              <p className="text-xs text-warmgray-400 leading-relaxed">
                Traditional cold process method retains 100% natural vegetable glycerin for soft, non-drying baths.
              </p>
            </div>

            <div className="bg-botanical-950/60 p-6 rounded-2xl border border-botanical-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-botanical-800 text-gold-400 mx-auto flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-cream-50">Zero Harmful Chemicals</h3>
              <p className="text-xs text-warmgray-400 leading-relaxed">
                Free from synthetic sulfates (SLS/SLES), parabens, phthalates, and artificial foaming boosters.
              </p>
            </div>

            <div className="bg-botanical-950/60 p-6 rounded-2xl border border-botanical-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-botanical-800 text-gold-400 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-cream-50">Fresh Small Batches</h3>
              <p className="text-xs text-warmgray-400 leading-relaxed">
                Handcrafted locally in Vadodara to guarantee peak ingredient freshness and quality consistency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Ingredients Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-700 block mb-1">
            Nature's Treasures
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-botanical-950">
            Our Hero Ingredients
          </h2>
          <p className="text-warmgray-600 text-sm mt-2">
            Explore authentic Indian botanicals infused directly into our soaps and creams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ingredientsData.slice(0, 3).map((ing) => (
            <div key={ing.id} className="card-3d p-7 rounded-3xl border border-cream-200/80 space-y-4">
              <div className="h-48 bg-cream-50 rounded-2xl overflow-hidden p-2 flex items-center justify-center border border-cream-100/80">
                <img
                  src={ing.image}
                  alt={ing.name}
                  className="h-full object-cover rounded-xl"
                />
              </div>
              <h3 className="font-serif text-xl font-bold text-botanical-950">{ing.name}</h3>
              <p className="text-xs text-warmgray-600 leading-relaxed line-clamp-3 font-normal">{ing.description}</p>
              <div className="space-y-1.5 pt-2">
                {ing.benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-botanical-900 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/ingredients"
            className="inline-flex items-center gap-2 text-botanical-900 font-semibold text-sm hover:text-gold-700 transition-colors"
          >
            <span>Explore All Botanical Ingredients</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Our Process Preview */}
      <section className="bg-cream-100/70 py-16 border-y border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-700 block mb-1">
              Handcrafted Method
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-botanical-950">
              The 6-Step Cold Process
            </h2>
            <p className="text-warmgray-600 text-sm mt-2">
              From raw flower selection to 6-week cure, discover how we make every soap bar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processSteps.slice(0, 3).map((step) => (
              <div key={step.stepNumber} className="bg-white p-6 rounded-2xl border border-cream-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-botanical-800 text-cream-50 font-serif font-bold text-sm flex items-center justify-center">
                    {step.stepNumber}
                  </span>
                  <span className="text-xs text-gold-700 font-semibold uppercase tracking-wider">Step 0{step.stepNumber}</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-botanical-900">{step.title}</h3>
                <p className="text-xs text-warmgray-600 leading-relaxed">{step.shortSummary}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/process"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-botanical-800 text-white font-semibold text-sm hover:bg-botanical-900 transition-colors"
            >
              <span>View Full 6-Step Process Page</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Follow Us On Social Media */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-700 block mb-1">
            Stay Connected
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-botanical-950">
            Follow Us On Social Media
          </h2>
          <p className="text-warmgray-600 text-sm mt-2">
            Join our online community for behind-the-scenes artisanal soapmaking, natural ingredient highlights, and skincare tips.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {socialAccounts.map((account) => (
            <div
              key={account.name}
              className="bg-white rounded-3xl p-6 border border-cream-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-botanical-900 text-gold-400 flex items-center justify-center">
                  <account.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-botanical-950">{account.name}</h3>
                  <span className="text-xs font-semibold text-gold-700 block">{account.handle}</span>
                </div>
                <p className="text-xs text-warmgray-600 leading-relaxed">
                  {account.description}
                </p>
              </div>

              <a
                href={account.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-botanical-800 text-white font-semibold text-xs hover:bg-botanical-900 transition-colors shadow-sm"
              >
                <span>Follow on {account.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

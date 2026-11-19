import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Shield, Award, Sparkles, CheckCircle2, Phone, Bot, Star, ChevronDown, ChevronUp, ShieldCheck, Mail, MessageCircle, MapPin } from 'lucide-react';
import { productsData } from '../data/products';
import { ingredientsData } from '../data/ingredients';
import { processSteps } from '../data/process';
import { socialAccounts } from '../data/social';
import { ProductCard } from '../components/ProductCard';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { SEO } from '../components/SEO';

export const Home: React.FC = () => {
  const featuredProducts = productsData.filter((p) => p.isFeatured).slice(0, 4);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [vipContact, setVipContact] = useState('');
  const [vipSuccess, setVipSuccess] = useState(false);

  const handleVipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipContact.trim()) return;
    const url = `https://api.whatsapp.com/send?phone=919726739515&text=${encodeURIComponent(`Hello Lavanya Natural Care! I would like to join your VIP Skincare Club for 10% off my first order. My contact: ${vipContact}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setVipSuccess(true);
  };

  const faqs = [
    {
      q: 'What makes cold process soap different from commercial soaps?',
      a: 'Most commercial soaps are synthetic detergent bars that remove natural glycerin to sell to cosmetics corporations. Our cold-process soaps in Vadodara are cured naturally for 4 to 6 weeks, retaining 100% of their natural plant glycerin and unrefined Kokum butter. This leaves your skin deeply moisturized and never stripped or tight.'
    },
    {
      q: 'Which soap is best for oily, blemish-prone, or acne-prone skin?',
      a: 'Our Neem Tulsi Cold Process Soap and Charcoal Rice Soap are ideal. Neem and Tulsi provide purifying botanical action to clear clogged pores, while activated coconut charcoal draws out excess sebum without triggering rebound oiliness.'
    },
    {
      q: 'Which soap is recommended for dry, sensitive, or sunburned skin?',
      a: 'Kesuda (Palash) Soap and Ubtan Luxury Soap are specially handcrafted for sensitive and dry skin. Kesuda flowers have been used in Gujarat for generations to soothe heat rashes, while Ubtan combines whole milk, turmeric, and besan for comforting nourishment.'
    },
    {
      q: 'What is the shelf life and proper storage of cold process soap?',
      a: 'Our soaps have a natural shelf life of 18 to 24 months. Because they are handcrafted without chemical hardeners, we recommend placing them on a well-draining soap dish between baths so they dry completely and last longer.'
    },
    {
      q: 'How long does shipping take to Vadodara and across India?',
      a: 'Local orders within Vadodara are delivered within 24 to 48 hours (same-day or next-day delivery). Orders across Gujarat and other Indian states are dispatched via express courier partners and arrive in 3 to 6 business days. Real-time tracking is provided via WhatsApp.'
    },
    {
      q: 'Do you accept Cash on Delivery (COD) and UPI payments?',
      a: 'Yes! We accept Instant UPI (Google Pay, PhonePe, Paytm to 9726739515@upi), Cash on Delivery (COD), and direct 1-click WhatsApp orders. Our team verifies every order with you on WhatsApp for complete peace of mind.'
    }
  ];

  const testimonials = [
    {
      name: 'Pooja Patel',
      location: 'Vadodara, Gujarat',
      skinType: 'Oily & Blemish-Prone Skin',
      rating: 5,
      review: 'The Neem Tulsi soap is a game-changer for Vadodara’s humid weather! My skin feels thoroughly clean and refreshed without any of the harsh, dry tightness from commercial soap. Quick local delivery too.',
      product: 'Neem Tulsi Soap'
    },
    {
      name: 'Ananya Sharma',
      location: 'Mumbai, Maharashtra',
      skinType: 'Sensitive & Prickly Heat',
      rating: 5,
      review: 'I bought the Kesuda Soap for my summer heat rashes after learning about Palash flowers. It completely calmed my skin irritation. The creamy lather and natural botanical touch are wonderful.',
      product: 'Kesuda Soap'
    },
    {
      name: 'Dr. Rajesh Shah',
      location: 'Ahmedabad, Gujarat',
      skinType: 'Normal to Dry Skin',
      rating: 5,
      review: 'As someone conscious about synthetic additives, I appreciate that Lavanya retains 100% natural glycerin. The Ubtan soap provides gentle exfoliation and leaves skin visibly soft. Truly authentic craft.',
      product: 'Ubtan Soap'
    },
    {
      name: 'Meera Desai',
      location: 'Surat, Gujarat',
      skinType: 'Dry & Sensitive Skin',
      rating: 5,
      review: 'The Rice Aloe Face Cream and Lavender body lotion absorb instantly without any heavy stickiness. Fast dispatch in eco-friendly packaging. Proud to support Gujarat’s handcrafted artisans.',
      product: 'Rice Aloe Face Cream'
    }
  ];

  return (
    <div className="space-y-16 md:space-y-24 pb-16 w-full overflow-x-clip">
      <SEO
        title="Lavanya Natural Care | Handmade Cold Process Soap, Vadodara"
        description="Handcrafted cold process soaps & botanical skincare made in Vadodara with pure plant oils & Ayurvedic herbs. 100% natural, gentle, and toxin-free."
      />
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream-100 via-cream-50 to-white py-16 md:py-24 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-botanical-100 text-botanical-800 text-xs font-semibold uppercase tracking-wider shadow-xs">
                  <Leaf className="w-3.5 h-3.5 text-botanical-600" />
                  <span>100% Handcrafted Cold Process Skincare</span>
                </div>
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
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl btn-botanical-3d text-white font-bold text-sm shadow-md hover:shadow-lg transition-all text-center"
                >
                  <span>Explore All Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/process"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-botanical-800 text-botanical-900 font-semibold text-sm hover:bg-cream-100 transition-colors text-center"
                >
                  <span>Our Cold Process</span>
                  <ArrowRight className="w-4 h-4 text-gold-700" />
                </Link>
                
                <WhatsAppButton
                  variant="outline"
                  label="WhatsApp Inquiry"
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

      {/* Verified Trust Badges Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-botanical-50 text-botanical-800 mx-auto flex items-center justify-center border border-botanical-200">
              <Leaf className="w-5 h-5 text-botanical-700" />
            </div>
            <h3 className="font-serif text-sm font-bold text-botanical-950">Handmade in Small Batches</h3>
            <p className="text-[11px] text-warmgray-500">Vadodara, Gujarat artisanal craft</p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-botanical-50 text-botanical-800 mx-auto flex items-center justify-center border border-botanical-200">
              <Sparkles className="w-5 h-5 text-gold-600" />
            </div>
            <h3 className="font-serif text-sm font-bold text-botanical-950">Pure Plant Oils</h3>
            <p className="text-[11px] text-warmgray-500">Coconut, Mahua &amp; Kokum Butter</p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-botanical-50 text-botanical-800 mx-auto flex items-center justify-center border border-botanical-200">
              <ShieldCheck className="w-5 h-5 text-botanical-700" />
            </div>
            <h3 className="font-serif text-sm font-bold text-botanical-950">No Synthetic Fragrance</h3>
            <p className="text-[11px] text-warmgray-500">Zero SLS, parabens or harsh detergents</p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-botanical-50 text-botanical-800 mx-auto flex items-center justify-center border border-botanical-200">
              <Award className="w-5 h-5 text-gold-600" />
            </div>
            <h3 className="font-serif text-sm font-bold text-botanical-950">Glycerin Retained</h3>
            <p className="text-[11px] text-warmgray-500">Deep moisture barrier protection</p>
          </div>

          <div className="col-span-2 md:col-span-1 space-y-2">
            <div className="w-10 h-10 rounded-full bg-botanical-50 text-botanical-800 mx-auto flex items-center justify-center border border-botanical-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-serif text-sm font-bold text-botanical-950">100% Vegetarian</h3>
            <p className="text-[11px] text-warmgray-500">Cruelty-free &amp; ethically sourced</p>
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
            <span>View All 13 Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Gemini AI Skincare Consultant Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-botanical-950 via-botanical-900 to-botanical-950 text-cream-50 p-8 sm:p-12 border border-gold-500/30 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/30 text-gold-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>New AI Feature • Powered by Google Gemini</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream-50">
                Not Sure Which Cold Process Soap Suits Your Skin?
              </h2>
              <p className="text-cream-200 text-sm sm:text-base leading-relaxed max-w-2xl">
                Take our 30-second Ayurvedic Skincare Quiz or chat directly with our botanical consultant. Gemini analyzes your skin type, climate, and concerns to build your custom morning & evening routine.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/ai-consultant"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-botanical-950 font-bold text-sm shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Free AI Skin Diagnostic</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/ai-consultant"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-white/20 text-cream-100 hover:bg-white/10 font-semibold text-sm transition-all"
                >
                  <Bot className="w-4 h-4 text-gold-400" />
                  <span>Chat with Botanical AI</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center space-y-3 max-w-xs">
                <div className="w-12 h-12 rounded-2xl bg-gold-400/20 border border-gold-400/30 text-gold-400 mx-auto flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-cream-50">Ayurvedic AI Match</h3>
                <p className="text-xs text-cream-200/80 leading-relaxed">
                  Grounded in authentic Indian botanicals: Kesuda, Neem, Tulsi, Hibiscus, Ubtan & Kokum Butter.
                </p>
              </div>
            </div>
          </div>
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

      {/* Customer Reviews & Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1 text-gold-600">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current text-gold-500" />
            ))}
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-700 block">
            Real Customer Experiences
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-botanical-950">
            Loved Across Gujarat &amp; India
          </h2>
          <p className="text-warmgray-600 text-sm">
            Read verified customer feedback on our small-batch cold process soaps and herbal skincare.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-cream-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-gold-500">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>

                <p className="text-xs text-warmgray-700 leading-relaxed italic">
                  "{t.review}"
                </p>
              </div>

              <div className="pt-3 border-t border-cream-100 flex items-center gap-3">
                {/* Photo Placeholder Slot */}
                <div className="w-10 h-10 rounded-full bg-botanical-100 text-botanical-900 font-serif font-bold text-sm flex items-center justify-center shrink-0 border border-botanical-200">
                  {t.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-botanical-950 truncate">{t.name}</span>
                    <span title="Verified Customer" className="inline-flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </span>
                  </div>
                  <span className="text-[10px] text-warmgray-500 block truncate">{t.location}</span>
                  <span className="text-[10px] text-gold-700 font-semibold block">{t.product}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-700 block">
            Got Questions?
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-botanical-950">
            Frequently Asked Questions
          </h2>
          <p className="text-warmgray-600 text-sm">
            Everything you need to know about our ingredients, soap curing, delivery, and orders.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-cream-200 shadow-xs overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif text-base sm:text-lg font-bold text-botanical-950 hover:text-gold-700 transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gold-700 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-warmgray-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-warmgray-600 leading-relaxed border-t border-cream-100">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Vadodara Local Delivery & Shipping Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cream-100/80 rounded-3xl p-8 sm:p-10 border border-cream-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-gold-700 uppercase tracking-wider block">
              Fast Dispatch
            </span>
            <h3 className="font-serif text-2xl font-bold text-botanical-950">
              Vadodara Local &amp; Pan-India Delivery
            </h3>
            <p className="text-xs text-warmgray-600 leading-relaxed">
              Same-day or next-day delivery across Vadodara. Express door delivery across Gujarat and all Indian states within 3–6 business days.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-200 text-center space-y-1.5 shadow-xs">
            <MapPin className="w-6 h-6 text-botanical-800 mx-auto" />
            <h4 className="font-serif font-bold text-sm text-botanical-950">Artisan Studio Address</h4>
            <p className="text-xs text-warmgray-600">
              FF-22 Pujar Complex, Subhanpura, Vadodara, Gujarat 390023
            </p>
            <p className="text-[11px] text-gold-700 font-semibold">Local Pickup Available</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-200 text-center space-y-2 shadow-xs">
            <Phone className="w-6 h-6 text-botanical-800 mx-auto" />
            <h4 className="font-serif font-bold text-sm text-botanical-950">Order By Phone / WhatsApp</h4>
            <a
              href="tel:+919726739515"
              className="font-bold text-sm text-botanical-900 hover:text-gold-700 block transition-colors"
            >
              +91 97267 39515
            </a>
            <WhatsAppButton label="Order via WhatsApp" className="text-xs py-2 w-full justify-center" />
          </div>
        </div>
      </section>

      {/* VIP Club / WhatsApp Offer Signup */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-botanical-900 text-cream-50 rounded-3xl p-8 sm:p-10 border border-botanical-800 text-center space-y-4">
          <span className="text-xs uppercase tracking-widest text-gold-400 font-bold bg-botanical-950/60 px-3.5 py-1.5 rounded-full border border-gold-500/30 inline-block">
            Join the Botanical Circle
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold">
            Get 10% Off Your First Order
          </h2>
          <p className="text-xs sm:text-sm text-warmgray-300 max-w-lg mx-auto leading-relaxed">
            Sign up with your WhatsApp number or email to receive seasonal soap release notifications, Ayurvedic skincare tips, and a 10% discount on your first order.
          </p>

          <form onSubmit={handleVipSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2">
            <input
              type="text"
              placeholder="Enter your WhatsApp number or email"
              value={vipContact}
              onChange={(e) => setVipContact(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-xs bg-white text-warmgray-900 border border-cream-300 focus:outline-none focus:ring-2 focus:ring-gold-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gold-500 text-botanical-950 font-bold text-xs hover:bg-gold-400 transition-colors shadow-md shrink-0 cursor-pointer"
            >
              Claim 10% Off
            </button>
          </form>

          {vipSuccess && (
            <p className="text-xs text-emerald-400 font-semibold animate-fadeIn">
              ✓ Opening WhatsApp to confirm your 10% welcome coupon!
            </p>
          )}
        </div>
      </section>

      {/* Brand Craft Guarantee Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-botanical-950 text-cream-50 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 border border-botanical-800">
          <Leaf className="w-10 h-10 text-gold-400 mx-auto" />
          <h2 className="font-serif text-3xl sm:text-4xl font-bold">
            Handcrafted Fresh in Small Batches
          </h2>
          <p className="text-warmgray-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            We take pride in absolute transparency and craftsmanship. Every product you order is made with pure plant oils and real flower infusions without synthetic shortcuts.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+919726739515"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-cream-200 text-cream-50 font-semibold text-sm hover:bg-cream-50 hover:text-botanical-950 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call Us: +91 97267 39515</span>
            </a>
            <WhatsAppButton
              label="Order via WhatsApp"
              className="py-3"
            />
          </div>
        </div>
      </section>

    </div>
  );
};

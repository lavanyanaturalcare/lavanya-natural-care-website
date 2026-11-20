import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Shield, Award, Sparkles, CheckCircle2, Phone, Bot, Star, ChevronDown, ChevronUp, ShieldCheck, MapPin } from 'lucide-react';
import { productsData } from '../data/products';
import { ingredientsData } from '../data/ingredients';
import { processSteps } from '../data/process';
import { socialAccounts } from '../data/social';
import { ProductCard } from '../components/ProductCard';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { SEO } from '../components/SEO';

export const Home: React.FC = () => {
  const featuredProducts = productsData.filter((p) => p.isFeatured).slice(0, 8);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [vipContact, setVipContact] = useState('');
  const [vipSuccess, setVipSuccess] = useState(false);

  const handleVipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipContact.trim()) return;
    const url = `https://api.whatsapp.com/send?phone=919726739515&text=${encodeURIComponent(`Hello ONZNATURAL! I would like to join your VIP Skincare Circle for 10% off my first order. My contact: ${vipContact}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setVipSuccess(true);
  };

  const faqs = [
    {
      q: 'What makes ONZNATURAL cold-process soap different from commercial soaps?',
      a: 'Most commercial soaps are synthetic detergent bars (syndet) that strip natural glycerin to sell to industrial cosmetics companies. Our ONZNATURAL bars are cured naturally for 4 to 6 weeks, retaining 100% of their natural plant glycerin and rich Kokum butter. This leaves your skin deeply moisturized and never dry or stripped.'
    },
    {
      q: 'Which products are best for oily, blemish-prone skin?',
      a: 'Our Neem & Tulsi Soap (₹99, 100g) and Charcoal Rice Soap (₹99, 100g) are ideal. Neem and Tulsi provide purifying herbal action to clear clogged pores, while activated charcoal and rice extract draw out excess sebum without triggering rebound oiliness.'
    },
    {
      q: 'Which products are recommended for sensitive or sun-exposed summer skin?',
      a: 'Kesuda Palash Soap (₹99, 100g), Kesuda Body Lotion (₹599, 150ml), and Kesuda Palash Body Cream (₹399, 100g) are specially crafted for sensitive and heat-stressed skin. Kesuda flowers (Flame of the Forest) have been celebrated in Gujarat for generations to soothe prickly heat and redness.'
    },
    {
      q: 'What is the shelf life and proper care for cold process soaps?',
      a: 'Our artisanal bars have a natural shelf life of 18 to 24 months. Because they are handcrafted without synthetic chemical hardeners, we recommend placing them on a well-draining wooden or slotted soap dish between showers so they dry completely and last longer.'
    },
    {
      q: 'How long does shipping take to Vadodara and across India?',
      a: 'Local orders within Vadodara are delivered within 24 to 48 hours (same-day or next-day local delivery). Orders across Gujarat and other Indian states are dispatched via express courier partners and arrive in 3 to 6 business days. Real-time tracking is provided via WhatsApp.'
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
      review: 'The Neem Tulsi soap is a game-changer for Vadodara’s humid weather! My skin feels thoroughly clean and refreshed without any of the harsh tightness from commercial soap. Quick local delivery too.',
      product: 'Neem & Tulsi Soap'
    },
    {
      name: 'Ananya Sharma',
      location: 'Mumbai, Maharashtra',
      skinType: 'Sensitive & Prickly Heat',
      rating: 5,
      review: 'I bought the Kesuda Palash Soap for summer heat rashes after learning about Palash flowers. It completely calmed my skin irritation. The creamy lather and subtle herbal touch are wonderful.',
      product: 'Kesuda Palash Soap'
    },
    {
      name: 'Dr. Rajesh Shah',
      location: 'Ahmedabad, Gujarat',
      skinType: 'Dry & Sensitive Skin',
      rating: 5,
      review: 'As someone conscious about synthetic additives, I appreciate that ONZNATURAL retains 100% natural plant glycerin. The Ubtan soap provides gentle exfoliation and leaves skin visibly soft.',
      product: 'Ubtan Soap'
    },
    {
      name: 'Meera Desai',
      location: 'Surat, Gujarat',
      skinType: 'Normal to Dry Skin',
      rating: 5,
      review: 'The Aparajita Body Lotion and Rice Aloe Face Cream absorb instantly without any heavy stickiness. Fast dispatch in eco-friendly packaging. Proud to support Gujarat’s handcrafted artisans.',
      product: 'Aparajita Body Lotion'
    }
  ];

  return (
    <div className="space-y-16 md:space-y-24 pb-16 w-full overflow-x-clip">
      <SEO
        title="ONZNATURAL | Handcrafted Botanical Care, Vadodara"
        description="Handcrafted cold process soaps & botanical skincare made in Vadodara with pure plant oils & Ayurvedic herbs. 100% natural, gentle, and toxin-free."
        canonical="https://onznatural.com/"
      />
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sand-100 via-sand-50 to-white py-16 md:py-24 border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 text-primary-900 text-xs font-semibold uppercase tracking-wider shadow-xs">
                  <Leaf className="w-3.5 h-3.5 text-primary-700" />
                  <span>100% Handcrafted Botanical Care</span>
                </div>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-950 leading-[1.15]">
                Pure Botanical Care, <br />
                <span className="italic font-normal text-primary-900">Handcrafted with Care</span>
              </h1>

              <p className="text-sand-800 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Discover authentic Indian cold-process soaps, rich botanical body lotions, and gentle plant-based skincare. Infused with pure flower infusions, nourishing oils, and Ayurvedic botanicals in small batches in Vadodara.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-primary-900 hover:bg-primary-950 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all text-center"
                >
                  <span>Explore All 16 Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/process"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-primary-900 text-primary-950 font-semibold text-sm hover:bg-sand-100 transition-colors text-center"
                >
                  <span>Our Cold Process</span>
                  <ArrowRight className="w-4 h-4 text-accent-700" />
                </Link>
                
                <WhatsAppButton
                  variant="outline"
                  label="WhatsApp Inquiry"
                  className="py-4"
                />
              </div>

              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-sand-200 text-xs sm:text-sm text-sand-800">
                <div>
                  <span className="block font-serif text-xl font-bold text-primary-950">100%</span>
                  <span className="text-sand-600">Plant-Based Oils</span>
                </div>
                <div>
                  <span className="block font-serif text-xl font-bold text-primary-950">Cold Process</span>
                  <span className="text-sand-600">Glycerin Retained</span>
                </div>
                <div>
                  <span className="block font-serif text-xl font-bold text-primary-950">Small Batch</span>
                  <span className="text-sand-600">Vadodara Artisan</span>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-sand-100">
                <img
                  src="/images/products/kesuda-palash-soap.webp"
                  alt="ONZNATURAL Kesuda Palash Handcrafted Soap Packaging"
                  className="w-full h-auto object-cover aspect-square"
                />
              </div>

              {/* Floating Layered Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl hidden sm:flex items-center gap-3.5 max-w-xs shadow-xl border border-sand-200">
                <div className="w-10 h-10 rounded-xl bg-accent-100 text-accent-800 flex items-center justify-center shrink-0 border border-accent-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-primary-950 block">Vadodara Handcrafted</span>
                  <span className="text-sand-700 font-medium">100% Glycerin Retained</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Verified Trust Badges Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-sand-100 text-primary-900 mx-auto flex items-center justify-center border border-sand-200">
              <Leaf className="w-5 h-5 text-primary-800" />
            </div>
            <h3 className="font-serif text-sm font-bold text-primary-950">Handmade in Small Batches</h3>
            <p className="text-[11px] text-sand-600">Vadodara, Gujarat artisanal craft</p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-sand-100 text-primary-900 mx-auto flex items-center justify-center border border-sand-200">
              <Sparkles className="w-5 h-5 text-accent-700" />
            </div>
            <h3 className="font-serif text-sm font-bold text-primary-950">Pure Plant Oils</h3>
            <p className="text-[11px] text-sand-600">Coconut, Mahua &amp; Kokum Butter</p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-sand-100 text-primary-900 mx-auto flex items-center justify-center border border-sand-200">
              <ShieldCheck className="w-5 h-5 text-primary-800" />
            </div>
            <h3 className="font-serif text-sm font-bold text-primary-950">No Synthetic Fragrance</h3>
            <p className="text-[11px] text-sand-600">Zero SLS, parabens or harsh detergents</p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-sand-100 text-primary-900 mx-auto flex items-center justify-center border border-sand-200">
              <Award className="w-5 h-5 text-accent-700" />
            </div>
            <h3 className="font-serif text-sm font-bold text-primary-950">Glycerin Retained</h3>
            <p className="text-[11px] text-sand-600">Deep moisture barrier protection</p>
          </div>

          <div className="col-span-2 md:col-span-1 space-y-2">
            <div className="w-10 h-10 rounded-full bg-sand-100 text-primary-900 mx-auto flex items-center justify-center border border-sand-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="font-serif text-sm font-bold text-primary-950">100% Vegetarian</h3>
            <p className="text-[11px] text-sand-600">Cruelty-free &amp; ethically sourced</p>
          </div>
        </div>
      </section>

      {/* About ONZNATURAL Summary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sand-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-700">
              About ONZNATURAL
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-950">
              Simplicity & Purity in Every Batch
            </h2>
            <p className="text-sand-800 leading-relaxed text-sm sm:text-base">
              At ONZNATURAL, we believe skincare should be as honest as nature itself. We formulate our cold-process soaps, rich body lotions, and creams using traditional techniques that preserve all naturally generated plant glycerin.
            </p>
            <p className="text-sand-800 leading-relaxed text-sm sm:text-base">
              From fresh Kesuda (Palash) flower infusions to purifying Neem and Tulsi, Butterfly Pea (Aparajita), and Kokum butter, every ingredient is chosen with intention to nourish your skin gently every day.
            </p>
            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-primary-900 font-semibold text-sm hover:text-accent-700 transition-colors"
              >
                <span>Read Our Full Workshop Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden shadow-md border border-sand-200">
              <img
                src="/images/products/hibiscus-soap.webp"
                alt="ONZNATURAL Handcrafted Hibiscus Soap"
                className="w-full h-72 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-700 block mb-1">
              Curated Favorites
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-950">
              Featured Botanical Care
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary-900 text-primary-950 font-semibold text-sm hover:bg-primary-900 hover:text-white transition-colors"
          >
            <span>View All 16 Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* AI Skincare Consultant Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-primary-950 text-sand-50 p-8 sm:p-12 border border-accent-600/30 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/20 border border-accent-400/30 text-accent-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                <span>ONZNATURAL Botanical AI</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Not Sure Which Botanical Care Suits Your Skin?
              </h2>
              <p className="text-sand-200 text-sm sm:text-base leading-relaxed max-w-2xl">
                Take our 30-second Ayurvedic Skincare Quiz or chat directly with our botanical consultant. Our AI analyzes your skin type, climate, and sensitivity to build your custom morning & evening routine.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/ai-consultant"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-accent-600 hover:bg-accent-500 text-white font-bold text-sm shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Free AI Skin Diagnostic</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/ai-consultant"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-white/20 text-sand-100 hover:bg-white/10 font-semibold text-sm transition-all"
                >
                  <Bot className="w-4 h-4 text-accent-400" />
                  <span>Chat with Botanical AI</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center space-y-3 max-w-xs">
                <div className="w-12 h-12 rounded-2xl bg-accent-400/20 border border-accent-400/30 text-accent-400 mx-auto flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-white">Ayurvedic AI Match</h3>
                <p className="text-xs text-sand-300 leading-relaxed">
                  Grounded strictly in verified botanicals: Kesuda, Neem, Tulsi, Hibiscus, Aparajita, Ubtan & Kokum Butter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-primary-900 text-sand-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-400 block mb-2">
              Our Core Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Why Choose ONZNATURAL?
            </h2>
            <p className="text-sand-300 text-sm mt-3">
              We eliminate harsh detergents, artificial hardening agents, and filler chemicals to give your skin genuine plant nourishment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-primary-950/60 p-6 rounded-2xl border border-primary-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary-800 text-accent-400 mx-auto flex items-center justify-center">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-white">100% Plant Oils</h3>
              <p className="text-xs text-sand-300 leading-relaxed">
                Formulated exclusively with pure cold-pressed Coconut, Mahua, Castor, Sunflower, and Olive oils.
              </p>
            </div>

            <div className="bg-primary-950/60 p-6 rounded-2xl border border-primary-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary-800 text-accent-400 mx-auto flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-white">Glycerin Preserved</h3>
              <p className="text-xs text-sand-300 leading-relaxed">
                Traditional cold process method retains 100% natural vegetable glycerin for soft, non-drying baths.
              </p>
            </div>

            <div className="bg-primary-950/60 p-6 rounded-2xl border border-primary-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary-800 text-accent-400 mx-auto flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-white">Zero Harmful Chemicals</h3>
              <p className="text-xs text-sand-300 leading-relaxed">
                Free from synthetic sulfates (SLS/SLES), parabens, phthalates, and artificial foaming boosters.
              </p>
            </div>

            <div className="bg-primary-950/60 p-6 rounded-2xl border border-primary-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary-800 text-accent-400 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-white">Fresh Small Batches</h3>
              <p className="text-xs text-sand-300 leading-relaxed">
                Handcrafted locally in Vadodara to guarantee peak ingredient freshness and quality consistency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Ingredients Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-700 block mb-1">
            Nature's Treasures
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-950">
            Our Hero Ingredients
          </h2>
          <p className="text-sand-700 text-sm mt-2">
            Explore authentic Indian botanicals infused directly into our soaps, lotions, and creams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ingredientsData.slice(0, 3).map((ing) => (
            <div key={ing.id} className="bg-white p-7 rounded-3xl border border-sand-200 shadow-sm space-y-4">
              <div className="h-48 bg-sand-100 rounded-2xl overflow-hidden p-2 flex items-center justify-center border border-sand-200">
                <img
                  src={ing.image}
                  alt={ing.name}
                  className="h-full object-cover rounded-xl"
                />
              </div>
              <h3 className="font-serif text-xl font-bold text-primary-950">{ing.name}</h3>
              <p className="text-xs text-sand-700 leading-relaxed line-clamp-3 font-normal">{ing.description}</p>
              <div className="space-y-1.5 pt-2">
                {ing.benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-primary-950 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-700 shrink-0" />
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
            className="inline-flex items-center gap-2 text-primary-900 font-semibold text-sm hover:text-accent-700 transition-colors"
          >
            <span>Explore All Botanical Ingredients</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Our Process Preview */}
      <section className="bg-sand-100/70 py-16 border-y border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-700 block mb-1">
              Handcrafted Method
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-950">
              The 6-Step Cold Process
            </h2>
            <p className="text-sand-700 text-sm mt-2">
              From raw botanical selection to 6-week cure, discover how we make every soap bar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processSteps.slice(0, 3).map((step) => (
              <div key={step.stepNumber} className="bg-white p-6 rounded-2xl border border-sand-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-primary-900 text-white font-serif font-bold text-sm flex items-center justify-center">
                    {step.stepNumber}
                  </span>
                  <span className="text-xs text-accent-700 font-semibold uppercase tracking-wider">Step 0{step.stepNumber}</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-primary-950">{step.title}</h3>
                <p className="text-xs text-sand-700 leading-relaxed">{step.shortSummary}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/process"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-900 text-white font-semibold text-sm hover:bg-primary-950 transition-colors"
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
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-700 block mb-1">
            Stay Connected
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-950">
            Follow Us On Social Media
          </h2>
          <p className="text-sand-700 text-sm mt-2">
            Join our online community for behind-the-scenes artisanal crafting, botanical highlights, and skincare advice.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {socialAccounts.map((account) => (
            <div
              key={account.name}
              className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-900 text-accent-400 flex items-center justify-center">
                  <account.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-primary-950">{account.name}</h3>
                  <span className="text-xs font-semibold text-accent-700 block">{account.handle}</span>
                </div>
                <p className="text-xs text-sand-700 leading-relaxed">
                  {account.description}
                </p>
              </div>

              <a
                href={account.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary-900 text-white font-semibold text-xs hover:bg-primary-950 transition-colors shadow-sm"
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
          <div className="inline-flex items-center gap-1 text-accent-600">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current text-accent-500" />
            ))}
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-700 block">
            Real Customer Experiences
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-950">
            Loved Across Gujarat &amp; India
          </h2>
          <p className="text-sand-700 text-sm">
            Verified feedback on our small-batch cold process soaps and herbal lotions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-accent-600">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>

                <p className="text-xs text-sand-800 leading-relaxed italic">
                  "{t.review}"
                </p>
              </div>

              <div className="pt-3 border-t border-sand-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-950 font-serif font-bold text-sm flex items-center justify-center shrink-0 border border-primary-200">
                  {t.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-primary-950 truncate">{t.name}</span>
                    <span title="Verified Customer" className="inline-flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    </span>
                  </div>
                  <span className="text-[10px] text-sand-600 block truncate">{t.location}</span>
                  <span className="text-[10px] text-accent-700 font-semibold block">{t.product}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-700 block">
            Got Questions?
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-950">
            Frequently Asked Questions
          </h2>
          <p className="text-sand-700 text-sm">
            Everything you need to know about our ingredients, soap curing, delivery, and orders.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-sand-200 shadow-xs overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif text-base sm:text-lg font-bold text-primary-950 hover:text-accent-700 transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-accent-700 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-sand-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-sand-700 leading-relaxed border-t border-sand-100">
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
        <div className="bg-sand-100 rounded-3xl p-8 sm:p-10 border border-sand-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-accent-700 uppercase tracking-wider block">
              Fast Dispatch
            </span>
            <h3 className="font-serif text-2xl font-bold text-primary-950">
              Vadodara Local &amp; Pan-India Delivery
            </h3>
            <p className="text-xs text-sand-700 leading-relaxed">
              Same-day or next-day delivery across Vadodara. Express door delivery across Gujarat and all Indian states within 3–6 business days.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sand-200 text-center space-y-1.5 shadow-xs">
            <MapPin className="w-6 h-6 text-primary-900 mx-auto" />
            <h4 className="font-serif font-bold text-sm text-primary-950">Artisan Studio Address</h4>
            <p className="text-xs text-sand-700">
              FF-22 Pujar Complex, Subhanpura, Vadodara, Gujarat 390023
            </p>
            <p className="text-[11px] text-accent-700 font-semibold">Local Pickup Available</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sand-200 text-center space-y-2 shadow-xs">
            <Phone className="w-6 h-6 text-primary-900 mx-auto" />
            <h4 className="font-serif font-bold text-sm text-primary-950">Order By Phone / WhatsApp</h4>
            <a
              href="tel:+919726739515"
              className="font-bold text-sm text-primary-900 hover:text-accent-700 block transition-colors"
            >
              +91 97267 39515
            </a>
            <WhatsAppButton label="Order via WhatsApp" className="text-xs py-2 w-full justify-center" />
          </div>
        </div>
      </section>

      {/* VIP Club / WhatsApp Offer Signup */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary-950 text-sand-50 rounded-3xl p-8 sm:p-10 border border-primary-900 text-center space-y-4">
          <span className="text-xs uppercase tracking-widest text-accent-400 font-bold bg-primary-900/80 px-3.5 py-1.5 rounded-full border border-accent-500/30 inline-block">
            Join the Botanical Circle
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Get 10% Off Your First Order
          </h2>
          <p className="text-xs sm:text-sm text-sand-300 max-w-lg mx-auto leading-relaxed">
            Sign up with your WhatsApp number or email to receive seasonal soap release notifications, Ayurvedic skincare tips, and a 10% discount on your first order.
          </p>

          <form onSubmit={handleVipSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2">
            <input
              type="text"
              placeholder="Enter your WhatsApp number or email"
              value={vipContact}
              onChange={(e) => setVipContact(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-xs bg-white text-primary-950 border border-sand-300 focus:outline-none focus:ring-2 focus:ring-accent-600"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-accent-600 text-white font-bold text-xs hover:bg-accent-500 transition-colors shadow-md shrink-0 cursor-pointer"
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
        <div className="bg-primary-950 text-sand-50 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 border border-primary-900">
          <Leaf className="w-10 h-10 text-accent-400 mx-auto" />
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Handcrafted Fresh in Small Batches
          </h2>
          <p className="text-sand-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            We take pride in absolute transparency and craftsmanship. Every product you order is made with pure plant oils and real flower infusions without synthetic shortcuts.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+919726739515"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-sand-300 text-white font-semibold text-sm hover:bg-white hover:text-primary-950 transition-all"
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

import React from 'react';
import { Leaf, Heart, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { WhatsAppButton } from '../components/WhatsAppButton';

export const About: React.FC = () => {
  return (
    <div className="py-12 md:py-20 space-y-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-botanical-100 text-botanical-800 text-xs font-semibold uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 text-botanical-600" />
          <span>Our Brand Journey</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-botanical-950">
          The Story Behind Lavanya Natural Care
        </h1>
        <p className="text-warmgray-600 text-base leading-relaxed">
          Crafting honest, botanical skincare products rooted in traditional cold process wisdom in Vadodara, Gujarat.
        </p>
      </div>

      {/* Brand Story & Philosophy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white p-8 sm:p-12 rounded-3xl border border-cream-200 shadow-sm">
        <div className="lg:col-span-6 space-y-5">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-700 block">
            Why We Started
          </span>
          <h2 className="font-serif text-3xl font-bold text-botanical-950">
            Returning to Genuine Plant Skincare
          </h2>
          <p className="text-warmgray-600 text-sm sm:text-base leading-relaxed">
            Lavanya Natural Care was founded with a simple realization: modern commercial skincare products have become heavily dependent on synthetic chemicals, harsh sulfates, artificial hardeners, and stripped glycerin.
          </p>
          <p className="text-warmgray-600 text-sm sm:text-base leading-relaxed">
            We wanted to return to the authentic purity of cold-process soapmaking—where pure vegetable oils (Coconut, Mahua, Castor, Sunflower) are slowly saponified with natural herbs like Neem, Tulsi, Kesuda (Palash), and Ubtan.
          </p>
        </div>
        <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-cream-200 shadow-md">
          <img
            src="/assets/use-for-making-website/our Collection.png"
            alt="Lavanya Handmade Collection"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Mission & Vision Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-botanical-900 text-cream-50 p-8 sm:p-10 rounded-3xl space-y-4 border border-botanical-800">
          <div className="w-12 h-12 rounded-2xl bg-botanical-800 text-gold-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold">Our Mission</h3>
          <p className="text-warmgray-300 text-sm leading-relaxed">
            To formulate 100% natural, handcrafted cold-process soaps and gentle plant-based skincare that nourish the skin while honoring Indian botanical heritage.
          </p>
        </div>

        <div className="bg-cream-100 p-8 sm:p-10 rounded-3xl space-y-4 border border-cream-200">
          <div className="w-12 h-12 rounded-2xl bg-botanical-800 text-cream-50 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-botanical-950">Our Vision</h3>
          <p className="text-warmgray-700 text-sm leading-relaxed">
            To become Vadodara's most trusted handcrafted botanical skincare brand, recognized for uncompromised purity, full ingredient transparency, and personal customer care.
          </p>
        </div>
      </div>

      {/* 4 Pillars of Natural Philosophy */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-serif text-3xl font-bold text-botanical-950">
            Our Natural Philosophy
          </h2>
          <p className="text-warmgray-600 text-sm">
            Uncompromising standards in every product we make.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-cream-200 text-center space-y-2">
            <Leaf className="w-8 h-8 text-botanical-800 mx-auto" />
            <h4 className="font-serif font-bold text-lg text-botanical-900">100% Plant Based</h4>
            <p className="text-xs text-warmgray-600">Cold pressed vegetable oils and pure botanical infusions.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-cream-200 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-botanical-800 mx-auto" />
            <h4 className="font-serif font-bold text-lg text-botanical-900">No Harmful Additives</h4>
            <p className="text-xs text-warmgray-600">Zero parabens, SLS, silicones, or synthetic hardeners.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-cream-200 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-botanical-800 mx-auto" />
            <h4 className="font-serif font-bold text-lg text-botanical-900">Glycerin Intact</h4>
            <p className="text-xs text-warmgray-600">100% natural vegetable glycerin created during curing is preserved.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-cream-200 text-center space-y-2">
            <Heart className="w-8 h-8 text-botanical-800 mx-auto" />
            <h4 className="font-serif font-bold text-lg text-botanical-900">Handcrafted Local</h4>
            <p className="text-xs text-warmgray-600">Made in small artisanal batches in Subhanpura, Vadodara.</p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-botanical-950 text-cream-50 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
        <h2 className="font-serif text-3xl font-bold">Have Questions About Our Products?</h2>
        <p className="text-warmgray-300 text-sm max-w-xl mx-auto">
          We love speaking directly with our customers to help you pick the best soap or lotion for your skin type.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <WhatsAppButton label="Chat with Us on WhatsApp" className="py-3.5" />
          <a
            href="tel:+919726739515"
            className="px-6 py-3.5 rounded-xl border border-cream-200 text-cream-50 font-semibold text-sm hover:bg-cream-50 hover:text-botanical-950 transition-all"
          >
            Call +91 97267 39515
          </a>
        </div>
      </div>

    </div>
  );
};

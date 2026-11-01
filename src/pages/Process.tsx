import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Sparkles, HeartHandshake, Clock, ShieldCheck, PackageCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { processSteps } from '../data/process';
import { SEO } from '../components/SEO';

export const Process: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Leaf': return Leaf;
      case 'Sparkles': return Sparkles;
      case 'HeartHandshake': return HeartHandshake;
      case 'Clock': return Clock;
      case 'ShieldCheck': return ShieldCheck;
      case 'PackageCheck': return PackageCheck;
      default: return Leaf;
    }
  };

  return (
    <div className="py-12 md:py-20 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-x-clip">
      <SEO
        title="6-Step Handcrafted Cold Process Method | Lavanya Natural Care"
        description="Discover how Lavanya Natural Care makes authentic cold-process soap in Vadodara: oil blending, low-temperature lye mix, slow mold pour, wooden cutting, and 6-week slow curing."
      />
      
      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-botanical-100 text-botanical-800 text-xs font-semibold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-botanical-600" />
          <span>Artisanal Craftsmanship</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-botanical-950">
          Our Handcrafted Cold Process Method
        </h1>
        <p className="text-warmgray-600 text-base leading-relaxed">
          Unlike industrial synthetic detergent bars, we use the slow, traditional cold process saponification method that naturally generates and preserves 100% pure plant glycerin.
        </p>
      </div>

      {/* 6-Step Visual Timeline Layout with Vertical Connector */}
      <div className="relative max-w-4xl mx-auto space-y-12">
        
        {/* Vertical Timeline Guide Line */}
        <div className="hidden md:block absolute top-8 bottom-8 left-1/2 -translate-x-1/2 w-0.5 bg-cream-300 pointer-events-none" />

        {processSteps.map((step, idx) => {
          const StepIcon = getIcon(step.iconName);

          return (
            <div
              key={step.stepNumber}
              className="bg-white rounded-3xl p-8 sm:p-10 border border-cream-200 shadow-sm flex flex-col md:flex-row gap-8 items-start relative z-10 hover:shadow-md transition-all duration-300 hover:border-gold-400/60"
            >
              {/* Step Number Badge & Icon */}
              <div className="flex flex-col items-center justify-center shrink-0 space-y-2 mx-auto md:mx-0">
                <div className="w-16 h-16 rounded-2xl bg-botanical-900 text-gold-400 flex items-center justify-center shadow-md border-2 border-white">
                  <StepIcon className="w-8 h-8" />
                </div>
                <span className="text-xs font-serif font-bold tracking-widest text-gold-700 uppercase">
                  Step 0{step.stepNumber}
                </span>
              </div>

              {/* Step Content */}
              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-botanical-950">
                    {step.title}
                  </h3>
                  <p className="text-xs font-semibold text-gold-700 uppercase tracking-wide mt-1">
                    {step.shortSummary}
                  </p>
                </div>

                <p className="text-warmgray-600 text-sm leading-relaxed">
                  {step.detailedDescription}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-cream-100">
                  {step.keyHighlights.map((highlight, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2 text-xs text-botanical-900 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Packaging Banner Image */}
      <div className="bg-cream-100 rounded-3xl p-8 sm:p-12 border border-cream-200 max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-8 shadow-sm">
        <div className="sm:w-1/2 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
            Packaging Perfection
          </span>
          <h3 className="font-serif text-2xl font-bold text-botanical-950">
            Hand-Wrapped Soap Packaging
          </h3>
          <p className="text-xs sm:text-sm text-warmgray-600 leading-relaxed">
            Our soaps are individually wrapped with care in eco-friendly packaging that maintains aromatic essential oils and protects freshness.
          </p>
        </div>
        <div className="sm:w-1/2 rounded-2xl overflow-hidden shadow-md border border-cream-200">
          <img
            src="/assets/packaging/soap packaging.jpeg"
            alt="Handcrafted Soap Packaging"
            className="w-full h-56 object-cover"
          />
        </div>
      </div>

      {/* Process CTA */}
      <div className="bg-botanical-950 text-cream-50 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 border border-botanical-800">
        <Sparkles className="w-10 h-10 text-gold-400 mx-auto" />
        <h2 className="font-serif text-3xl sm:text-4xl font-bold">
          Ready to Experience the Cold Process Difference?
        </h2>
        <p className="text-warmgray-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Feel the soothing difference of 100% natural glycerin retention on your skin.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl btn-botanical-3d text-white font-bold text-sm shadow-md"
          >
            <span>Explore All 13 Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-cream-200 text-cream-50 font-semibold text-sm hover:bg-cream-50 hover:text-botanical-950 transition-all"
          >
            <span>Contact Workshop</span>
          </Link>
        </div>
      </div>

    </div>
  );
};

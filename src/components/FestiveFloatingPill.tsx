import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gift, Sparkles, ArrowRight } from 'lucide-react';
import { isCampaignActive } from '../data/campaign';

export const FestiveFloatingPill: React.FC = () => {
  const location = useLocation();

  // If already on customize-combo page or campaign is inactive, don't show the floating pill
  if (!isCampaignActive() || location.pathname.startsWith('/customize-combo')) {
    return null;
  }

  return (
    <aside aria-label="Festive promotion" className="fixed bottom-6 left-6 z-40 animate-bounce-subtle">
      <Link
        to="/customize-combo"
        className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-botanical-900 to-[#C85A32] text-white shadow-2xl border border-gold-400/40 hover:scale-105 transition-all duration-300 ring-4 ring-gold-400/20"
      >
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-gold-300 shrink-0 group-hover:rotate-12 transition-transform">
          <Gift className="w-4 h-4" />
        </div>
        <div className="text-left leading-tight hidden sm:block">
          <span className="text-[10px] uppercase font-bold text-gold-300 block tracking-wider">
            Raksha Bandhan Special
          </span>
          <span className="text-xs font-bold text-white block">
            Customize Combos (Save 25%)
          </span>
        </div>
        <div className="text-left leading-tight sm:hidden">
          <span className="text-xs font-bold text-white block">
            🎁 Rakhi Combos (Save 25%)
          </span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-gold-300 group-hover:translate-x-1 transition-transform" />
      </Link>
    </aside>
  );
};

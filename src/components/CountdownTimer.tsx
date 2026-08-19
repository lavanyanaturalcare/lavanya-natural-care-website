import React, { useState, useEffect } from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { RAKSHA_BANDHAN_CAMPAIGN, isCampaignActive } from '../data/campaign';

interface CountdownTimerProps {
  variant?: 'luxury-banner' | 'compact' | 'sidebar';
  className?: string;
  showLabel?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  variant = 'luxury-banner', 
  className = '',
  showLabel = true
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(RAKSHA_BANDHAN_CAMPAIGN.endDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isExpired || !timeLeft || !isCampaignActive()) {
    return null;
  }

  // Compact Variant (e.g. For Header / Navbar / Pills)
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-botanical-950/90 text-gold-300 border border-gold-500/30 text-[11px] sm:text-xs font-mono shadow-xs ${className}`}>
        <Clock className="w-3 h-3 text-[#C85A32] animate-pulse" />
        <span className="font-semibold text-[10px] sm:text-[11px] text-cream-100">Ends in:</span>
        <span className="font-bold text-white tracking-tight">{timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
    );
  }

  // Sidebar Variant (For Sticky Order Summary)
  if (variant === 'sidebar') {
    return (
      <div className={`p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-botanical-950 to-botanical-900 text-cream-50 border border-gold-500/30 shadow-md space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] animate-ping inline-block" />
            Offer Ending Soon
          </span>
          <span className="text-[10px] text-warmgray-400 font-medium">28 Aug 2026</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div className="bg-white/10 rounded-xl py-1.5 px-0.5 border border-white/10">
            <span className="font-serif text-base sm:text-lg font-bold text-white block">{timeLeft.days}</span>
            <span className="text-[8px] sm:text-[9px] uppercase font-bold text-gold-300 tracking-wider">Days</span>
          </div>
          <div className="bg-white/10 rounded-xl py-1.5 px-0.5 border border-white/10">
            <span className="font-serif text-base sm:text-lg font-bold text-white block">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-[8px] sm:text-[9px] uppercase font-bold text-gold-300 tracking-wider">Hrs</span>
          </div>
          <div className="bg-white/10 rounded-xl py-1.5 px-0.5 border border-white/10">
            <span className="font-serif text-base sm:text-lg font-bold text-white block">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-[8px] sm:text-[9px] uppercase font-bold text-gold-300 tracking-wider">Min</span>
          </div>
          <div className="bg-white/10 rounded-xl py-1.5 px-0.5 border border-white/10">
            <span className="font-serif text-base sm:text-lg font-bold text-[#C85A32] block">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-[8px] sm:text-[9px] uppercase font-bold text-gold-300 tracking-wider">Sec</span>
          </div>
        </div>
      </div>
    );
  }

  // Luxury Banner Variant (Main Section & Hero Pages)
  return (
    <div className={`flex flex-col items-center justify-center space-y-2.5 sm:space-y-3.5 max-w-full px-2 ${className}`}>
      
      {showLabel && (
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-white/90 border border-gold-400/50 shadow-xs backdrop-blur-xs max-w-full text-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#C85A32] animate-ping shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-bold text-botanical-950 uppercase tracking-[0.14em] sm:tracking-[0.18em] truncate">
            Limited Festive Window • Offer Ends In
          </span>
        </div>
      )}

      {/* Luxury 3D Segmented Countdown Display */}
      <div className="p-2 sm:p-3.5 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white via-[#FCFAF5] to-cream-100/90 border border-gold-400/40 sm:border-2 shadow-lg sm:shadow-xl flex items-center justify-center gap-1 sm:gap-3 relative overflow-hidden max-w-full">
        
        {/* Subtle top gold shimmer highlight line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-80" />

        {/* Days Box */}
        <div className="flex flex-col items-center justify-center bg-white min-w-[50px] sm:min-w-[70px] py-1.5 sm:py-3 px-1 sm:px-2 rounded-xl sm:rounded-2xl border border-cream-200 shadow-xs relative overflow-hidden">
          <span className="font-serif text-2xl sm:text-4xl font-extrabold text-botanical-950 block leading-tight tracking-tight">
            {timeLeft.days}
          </span>
          <span className="text-[8px] sm:text-[10px] font-bold text-gold-700 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
            Days
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-botanical-800" />
        </div>

        <span className="font-serif text-lg sm:text-2xl font-bold text-gold-600 self-center mb-2 sm:mb-4">:</span>

        {/* Hours Box */}
        <div className="flex flex-col items-center justify-center bg-white min-w-[50px] sm:min-w-[70px] py-1.5 sm:py-3 px-1 sm:px-2 rounded-xl sm:rounded-2xl border border-cream-200 shadow-xs relative overflow-hidden">
          <span className="font-serif text-2xl sm:text-4xl font-extrabold text-botanical-950 block leading-tight tracking-tight">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[8px] sm:text-[10px] font-bold text-gold-700 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
            Hours
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-botanical-800" />
        </div>

        <span className="font-serif text-lg sm:text-2xl font-bold text-gold-600 self-center mb-2 sm:mb-4">:</span>

        {/* Minutes Box */}
        <div className="flex flex-col items-center justify-center bg-white min-w-[50px] sm:min-w-[70px] py-1.5 sm:py-3 px-1 sm:px-2 rounded-xl sm:rounded-2xl border border-cream-200 shadow-xs relative overflow-hidden">
          <span className="font-serif text-2xl sm:text-4xl font-extrabold text-botanical-950 block leading-tight tracking-tight">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[8px] sm:text-[10px] font-bold text-gold-700 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
            Mins
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-botanical-800" />
        </div>

        <span className="font-serif text-lg sm:text-2xl font-bold text-gold-600 self-center mb-2 sm:mb-4">:</span>

        {/* Seconds Box with Terracotta Festive Accent */}
        <div className="flex flex-col items-center justify-center bg-white min-w-[50px] sm:min-w-[70px] py-1.5 sm:py-3 px-1 sm:px-2 rounded-xl sm:rounded-2xl border border-cream-200 shadow-xs relative overflow-hidden">
          <span className="font-serif text-2xl sm:text-4xl font-extrabold text-[#C85A32] block leading-tight tracking-tight">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[8px] sm:text-[10px] font-bold text-[#A03D1A] uppercase tracking-[0.15em] sm:tracking-[0.2em]">
            Secs
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C85A32]" />
        </div>

      </div>

      <span className="text-[10px] sm:text-[11px] text-warmgray-500 font-medium text-center">
        Campaign closes 28 August 2026 at 11:59 PM IST
      </span>
    </div>
  );
};

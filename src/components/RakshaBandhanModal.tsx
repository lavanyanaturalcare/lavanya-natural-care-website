import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Gift, Sparkles, ArrowRight, Leaf, Check } from 'lucide-react';
import { RAKSHA_BANDHAN_CAMPAIGN, isCampaignActive } from '../data/campaign';

export const RakshaBandhanModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only show if campaign is active
    if (!isCampaignActive()) return;

    // Check if user has already seen or dismissed the modal in this session
    const hasSeenModal = sessionStorage.getItem('lavanya_rakhi_popup_seen_2026');
    if (!hasSeenModal) {
      // Small graceful entrance delay (600ms) for smooth visual experience
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Close handler with session storage
  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('lavanya_rakhi_popup_seen_2026', 'true');
  };

  // Navigate to dedicated customize combo page
  const handleShopOffer = (comboId?: string) => {
    handleClose();
    if (comboId) {
      navigate(`/customize-combo/${comboId}`);
    } else {
      navigate('/customize-combo');
    }
  };

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rakhi-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-botanical-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto"
    >
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={handleClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#FDFBF7] rounded-3xl border-2 border-gold-400/40 shadow-2xl overflow-hidden z-10 my-auto animate-scaleUp max-h-[90vh] flex flex-col">
        
        {/* Top Terracotta Festive Rakhi Thread Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-gold-500 via-[#C85A32] to-gold-500 shrink-0" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close Raksha Bandhan offer modal"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-cream-100 hover:bg-cream-200 text-botanical-950 flex items-center justify-center transition-all duration-200 border border-cream-300 focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 lg:p-10 space-y-6 overflow-y-auto">
          
          {/* Official Logo & Header */}
          <div className="text-center space-y-3">
            {/* Official Logo */}
            <div className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-botanical-800 flex items-center justify-center text-gold-400 shadow-xs">
                <Leaf className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <span className="font-serif text-xl font-bold tracking-tight text-botanical-900 block leading-tight">
                  LAVANYA
                </span>
                <span className="text-[9px] tracking-[0.25em] text-gold-700 font-semibold uppercase block">
                  Natural Care
                </span>
              </div>
            </div>

            {/* Campaign Headline */}
            <div className="space-y-1 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C85A32]/10 border border-[#C85A32]/30 text-[#A03D1A] text-[11px] font-bold uppercase tracking-wider">
                <Gift className="w-3 h-3" />
                <span>Raksha Bandhan Special • {RAKSHA_BANDHAN_CAMPAIGN.validityDisplay}</span>
              </div>

              <h2 id="rakhi-modal-title" className="font-serif text-3xl sm:text-4xl font-bold text-botanical-950 leading-tight">
                RAKSHA BANDHAN <br />
                <span className="gold-gradient-text">SPECIAL OFFER</span>
              </h2>

              <p className="font-serif text-base italic text-gold-700">
                “{RAKSHA_BANDHAN_CAMPAIGN.tagline}”
              </p>
            </div>

            <p className="text-warmgray-600 text-xs sm:text-sm max-w-md mx-auto">
              {RAKSHA_BANDHAN_CAMPAIGN.hook}
            </p>
          </div>

          {/* 3 Combo Highlights in Modal */}
          <div className="space-y-3 pt-2">
            {RAKSHA_BANDHAN_CAMPAIGN.combos.map((combo) => (
              <div
                key={combo.id}
                onClick={() => handleShopOffer(combo.id)}
                className="cursor-pointer bg-white p-4 sm:p-5 rounded-2xl border border-cream-200 shadow-xs hover:border-gold-500 hover:shadow-md transition-all flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-cream-50 p-1 border border-cream-100 shrink-0 flex items-center justify-center">
                    <img src={combo.image} alt={combo.title} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-botanical-950 font-serif">
                        {combo.title}
                      </span>
                      <span className="bg-[#C85A32] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        {combo.discountLabel}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#A03D1A] font-semibold block mt-0.5">
                      {combo.tagline}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-warmgray-400 line-through block font-medium">₹{combo.mrp}</span>
                  <span className="font-serif text-xl font-bold text-botanical-950">₹{combo.specialPrice}</span>
                  <span className="text-[10px] text-botanical-700 font-bold block">Save ₹{combo.saving}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => handleShopOffer()}
              className="w-full sm:flex-1 py-3.5 rounded-xl btn-botanical-3d text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-transform"
            >
              <span>CUSTOMIZE & SHOP COMBOS</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleShopOffer()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-botanical-800 text-botanical-900 font-semibold text-xs hover:bg-cream-100 transition-colors"
            >
              VIEW ALL COMBOS
            </button>
          </div>

          {/* Footnote */}
          <div className="text-center pt-1 border-t border-cream-200 text-[11px] text-warmgray-500">
            Valid only 19 – 28 August 2026 • Mix & match available variants • Direct WhatsApp delivery
          </div>

        </div>

      </div>
    </div>
  );
};

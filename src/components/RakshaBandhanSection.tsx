import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Gift, Check, Clock, ShieldCheck, Heart, MessageCircle, ArrowRight, Plus, Minus, Tag, ExternalLink } from 'lucide-react';
import { RAKSHA_BANDHAN_CAMPAIGN, ComboOffer, isCampaignActive, generateWhatsAppOrderUrl } from '../data/campaign';
import { ComboVisual } from './ComboVisual';

export const RakshaBandhanSection: React.FC = () => {
  const [activeComboId, setActiveComboId] = useState<string>('combo-1');
  const [selectedSoaps, setSelectedSoaps] = useState<{ [key: string]: number }>({
    'Neem Tulsi Soap': 1,
    'Ubtan Soap': 1,
    'Charcoal & Rice Soap': 1,
    'Kesuda Soap': 1,
    'Hibiscus Soap': 1
  });
  const [selectedBodyWash, setSelectedBodyWash] = useState<string>('Kesuda');

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
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

  const activeCombo = RAKSHA_BANDHAN_CAMPAIGN.combos.find((c) => c.id === activeComboId) || RAKSHA_BANDHAN_CAMPAIGN.combos[0];

  // Reset soap count when switching combo and smooth scroll to builder
  const handleComboSwitch = (combo: ComboOffer) => {
    setActiveComboId(combo.id);
    if (combo.rules.requiredSoaps === 5) {
      setSelectedSoaps({
        'Neem Tulsi Soap': 1,
        'Ubtan Soap': 1,
        'Charcoal & Rice Soap': 1,
        'Kesuda Soap': 1,
        'Hibiscus Soap': 1
      });
    } else if (combo.rules.requiredSoaps === 2) {
      setSelectedSoaps({
        'Neem Tulsi Soap': 1,
        'Kesuda Soap': 1
      });
    }

    // Auto smooth scroll down to interactive builder immediately
    setTimeout(() => {
      const builderElement = document.getElementById('raksha-bandhan-builder');
      if (builderElement) {
        builderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const totalSelectedSoaps = Object.values(selectedSoaps).reduce((sum, val) => sum + val, 0);
  const isSoapRequirementMet = totalSelectedSoaps === activeCombo.rules.requiredSoaps;
  const isComboComplete = isSoapRequirementMet;

  const handleAddSoap = (soapName: string) => {
    if (totalSelectedSoaps >= activeCombo.rules.requiredSoaps) return;
    setSelectedSoaps((prev) => ({
      ...prev,
      [soapName]: (prev[soapName] || 0) + 1
    }));
  };

  const handleRemoveSoap = (soapName: string) => {
    if (!selectedSoaps[soapName] || selectedSoaps[soapName] <= 0) return;
    setSelectedSoaps((prev) => {
      const updated = { ...prev };
      if (updated[soapName] === 1) {
        delete updated[soapName];
      } else {
        updated[soapName] -= 1;
      }
      return updated;
    });
  };

  // Build flattened array of selected soaps for WhatsApp message
  const getSelectedSoapList = (): string[] => {
    const list: string[] = [];
    Object.entries(selectedSoaps).forEach(([soap, count]) => {
      for (let i = 0; i < count; i++) {
        list.push(soap);
      }
    });
    return list;
  };

  const whatsAppUrl = generateWhatsAppOrderUrl(activeCombo, getSelectedSoapList(), selectedBodyWash);

  // If campaign is explicitly disabled, do not render
  if (!RAKSHA_BANDHAN_CAMPAIGN.isEnabled && !isCampaignActive()) {
    return null;
  }

  return (
    <section id="raksha-bandhan-offer" className="scroll-mt-24 py-16 md:py-24 bg-gradient-to-b from-cream-100/90 via-[#FDF9F2] to-cream-50 relative overflow-hidden border-y border-cream-300/70">
      
      {/* Decorative Subtle Festive Rakhi Thread Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-1 bg-gradient-to-r from-transparent via-[#C85A32] to-transparent opacity-60" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#C85A32]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Campaign Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C85A32]/10 border border-[#C85A32]/30 text-[#A03D1A] text-xs font-bold uppercase tracking-wider shadow-xs">
            <Gift className="w-3.5 h-3.5" />
            <span>{RAKSHA_BANDHAN_CAMPAIGN.badgeText} • {RAKSHA_BANDHAN_CAMPAIGN.validityDisplay}</span>
          </div>

          <div className="space-y-2">
            <span className="font-serif text-lg md:text-xl italic font-normal text-gold-700 block">
              “{RAKSHA_BANDHAN_CAMPAIGN.tagline}”
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-botanical-950 leading-tight">
              Raksha Bandhan <br className="hidden sm:inline" />
              <span className="gold-gradient-text">Special Offer</span>
            </h2>
          </div>

          <p className="text-warmgray-700 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {RAKSHA_BANDHAN_CAMPAIGN.hook} Handcrafted cold-process combinations curated for heartfelt festive gifting.
          </p>

          {/* Countdown Timer */}
          {!isExpired && timeLeft && (
            <div className="pt-4 flex flex-col items-center justify-center space-y-2">
              <span className="text-xs font-bold text-warmgray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>OFFER ENDS IN</span>
              </span>
              <div className="flex items-center gap-3 text-botanical-950 font-serif">
                <div className="bg-white px-3.5 py-2 rounded-xl border border-cream-200 shadow-xs min-w-[58px] text-center">
                  <span className="text-2xl font-bold block">{timeLeft.days}</span>
                  <span className="text-[10px] text-warmgray-500 uppercase tracking-wider font-sans font-semibold">Days</span>
                </div>
                <span className="text-lg font-bold text-gold-600">:</span>
                <div className="bg-white px-3.5 py-2 rounded-xl border border-cream-200 shadow-xs min-w-[58px] text-center">
                  <span className="text-2xl font-bold block">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[10px] text-warmgray-500 uppercase tracking-wider font-sans font-semibold">Hours</span>
                </div>
                <span className="text-lg font-bold text-gold-600">:</span>
                <div className="bg-white px-3.5 py-2 rounded-xl border border-cream-200 shadow-xs min-w-[58px] text-center">
                  <span className="text-2xl font-bold block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[10px] text-warmgray-500 uppercase tracking-wider font-sans font-semibold">Mins</span>
                </div>
                <span className="text-lg font-bold text-gold-600">:</span>
                <div className="bg-white px-3.5 py-2 rounded-xl border border-cream-200 shadow-xs min-w-[58px] text-center">
                  <span className="text-2xl font-bold text-[#C85A32] block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[10px] text-warmgray-500 uppercase tracking-wider font-sans font-semibold">Secs</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 3 Combo Cards Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {RAKSHA_BANDHAN_CAMPAIGN.combos.map((combo) => {
            const isSelected = activeComboId === combo.id;

            return (
              <div
                key={combo.id}
                onClick={() => handleComboSwitch(combo)}
                className={`cursor-pointer rounded-3xl p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between relative border-2 ${
                  isSelected
                    ? 'bg-white border-botanical-800 shadow-xl scale-[1.02] ring-4 ring-gold-400/20'
                    : 'bg-white/80 border-cream-200/90 hover:border-gold-400 hover:bg-white shadow-sm hover:shadow-md'
                }`}
              >
                {/* Discount Badge */}
                <div className="absolute top-4 right-4 bg-[#C85A32] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs uppercase tracking-wider">
                  {combo.discountLabel}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-botanical-800 text-gold-400 text-xs font-serif font-bold flex items-center justify-center">
                      {combo.number}
                    </span>
                    <span className="text-xs font-bold text-gold-700 uppercase tracking-wider">
                      Combo 0{combo.number}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-botanical-950 mb-1 leading-snug">
                    {combo.title}
                  </h3>

                  <p className="text-xs font-semibold text-[#A03D1A] uppercase tracking-wider mb-4">
                    {combo.tagline}
                  </p>

                  {/* Product Visual using Authentic Product Photographs */}
                  <ComboVisual comboNumber={combo.number} className="mb-6" />

                  {/* Items Included */}
                  <ul className="space-y-2 mb-6 text-xs sm:text-sm text-warmgray-700">
                    {combo.sampleItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-botanical-800 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price Display */}
                <div className="pt-4 border-t border-cream-100">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-[11px] text-warmgray-500 line-through block font-medium">
                        MRP ₹{combo.mrp}
                      </span>
                      <span className="font-serif text-3xl font-bold text-botanical-950">
                        ₹{combo.specialPrice}
                      </span>
                    </div>
                    <span className="bg-botanical-50 text-botanical-800 border border-botanical-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                      SAVE ₹{combo.saving}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'btn-botanical-3d text-white'
                          : 'border border-botanical-800 text-botanical-900 hover:bg-botanical-800 hover:text-white'
                      }`}
                    >
                      <span>{isSelected ? 'Currently Customizing Below' : 'Customize This Combo'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      to={`/customize-combo/${combo.id}`}
                      className="w-full py-2.5 rounded-xl bg-cream-100/80 hover:bg-cream-200 text-botanical-950 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors border border-cream-300"
                    >
                      <span>Open Full Dedicated Page</span>
                      <ExternalLink className="w-3 h-3 text-gold-700" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Interactive Customization Builder with auto-scroll anchor */}
        <div id="raksha-bandhan-builder" className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border-2 border-gold-400/40 shadow-xl space-y-8 relative">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-gold-600" />
                <span className="text-xs font-bold text-gold-700 uppercase tracking-wider">
                  Interactive Combo Builder • Combo {activeCombo.number}
                </span>
              </div>
              <h3 className="font-serif text-3xl font-bold text-botanical-950">
                Customize Your {activeCombo.title}
              </h3>
              <p className="text-xs sm:text-sm text-warmgray-600 mt-1">
                Choose your favorite natural soaps and body wash variants below.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              <div className="text-left sm:text-right">
                <span className="text-xs text-warmgray-500 uppercase block font-semibold">Special Festive Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-warmgray-400 line-through font-medium">₹{activeCombo.mrp}</span>
                  <span className="font-serif text-3xl font-bold text-botanical-950">₹{activeCombo.specialPrice}</span>
                </div>
              </div>

              <Link
                to={`/customize-combo/${activeCombo.id}`}
                className="px-4 py-2.5 rounded-xl border border-botanical-800 text-botanical-950 hover:bg-botanical-800 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Full Page View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Step 1: Soap Customization */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-xl font-bold text-botanical-950">
                  Select Your Soaps ({activeCombo.rules.requiredSoaps} Required)
                </h4>
                <p className="text-xs text-warmgray-600">
                  Choose any combination of our handcrafted cold-process soaps.
                </p>
              </div>

              <div className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                isSoapRequirementMet
                  ? 'bg-botanical-800 text-white'
                  : 'bg-cream-100 text-warmgray-800 border border-cream-300'
              }`}>
                Selected: {totalSelectedSoaps} / {activeCombo.rules.requiredSoaps}
              </div>
            </div>

            {/* Soap Variants Counter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {RAKSHA_BANDHAN_CAMPAIGN.allowedSoaps.map((soap) => {
                const count = selectedSoaps[soap.name] || 0;

                return (
                  <div
                    key={soap.id}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between items-center text-center space-y-3 ${
                      count > 0
                        ? 'bg-cream-50/90 border-botanical-800 shadow-xs'
                        : 'bg-white border-cream-200 hover:border-cream-300'
                    }`}
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-white p-2 border border-cream-100 flex items-center justify-center">
                      <img src={soap.image} alt={soap.name} className="w-full h-full object-contain" />
                    </div>

                    <div>
                      <h5 className="font-serif text-base font-bold text-botanical-950 leading-tight">
                        {soap.name}
                      </h5>
                      <span className="text-[10px] text-warmgray-500 font-medium">100g Bar</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveSoap(soap.name)}
                        disabled={count <= 0}
                        aria-label={`Decrease ${soap.name}`}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          count > 0
                            ? 'bg-cream-200 hover:bg-cream-300 text-botanical-900'
                            : 'bg-cream-100 text-warmgray-300 cursor-not-allowed'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="font-serif text-lg font-bold text-botanical-950 w-5 text-center">
                        {count}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAddSoap(soap.name)}
                        disabled={totalSelectedSoaps >= activeCombo.rules.requiredSoaps}
                        aria-label={`Increase ${soap.name}`}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          totalSelectedSoaps < activeCombo.rules.requiredSoaps
                            ? 'bg-botanical-800 hover:bg-botanical-900 text-white shadow-xs'
                            : 'bg-cream-100 text-warmgray-300 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Body Wash Variant Selection (For Combo 2 & 3) */}
          {activeCombo.rules.requiresBodyWash && (
            <div className="space-y-4 pt-6 border-t border-cream-200">
              <div>
                <h4 className="font-serif text-xl font-bold text-botanical-950">
                  Select Face & Body Wash (300ml)
                </h4>
                <p className="text-xs text-warmgray-600">
                  Select your preferred natural flower/herb liquid cleanser variant.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {RAKSHA_BANDHAN_CAMPAIGN.allowedBodyWashes.map((bw) => {
                  const isSelected = selectedBodyWash === bw.name;

                  return (
                    <div
                      key={bw.id}
                      onClick={() => setSelectedBodyWash(bw.name)}
                      className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex items-center gap-4 ${
                        isSelected
                          ? 'bg-cream-50 border-botanical-800 shadow-sm'
                          : 'bg-white border-cream-200 hover:border-cream-300'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white p-1 border border-cream-100 flex items-center justify-center shrink-0">
                        <img src={bw.image} alt={bw.fullName} className="w-full h-full object-contain" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-serif text-lg font-bold text-botanical-950">
                            {bw.fullName}
                          </h5>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-botanical-800 bg-botanical-800 text-white' : 'border-cream-300'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                        <span className="text-xs text-warmgray-600">300ml Gentle Liquid Cleanser</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lip Balm Status (For Combo 2) */}
          {activeCombo.rules.includesLipBalm && (
            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white p-1 border border-cream-100 flex items-center justify-center">
                  <img src={RAKSHA_BANDHAN_CAMPAIGN.lipBalm.image} alt="Lip Balm" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h5 className="font-serif text-base font-bold text-botanical-950">
                    {RAKSHA_BANDHAN_CAMPAIGN.lipBalm.name}
                  </h5>
                  <span className="text-xs text-gold-700 font-semibold">Festive Gifting Add-on</span>
                </div>
              </div>
              <span className="bg-botanical-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Included Free
              </span>
            </div>
          )}

          {/* Final Summary & Order on WhatsApp Action */}
          <div className="bg-botanical-950 text-cream-50 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 border border-botanical-800">
            <div className="space-y-2 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <Tag className="w-4 h-4 text-gold-400" />
                <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">
                  {isComboComplete ? '✓ Your Combo is Ready!' : `Please select ${activeCombo.rules.requiredSoaps - totalSelectedSoaps} more soap(s)`}
                </span>
              </div>
              <h4 className="font-serif text-2xl sm:text-3xl font-bold">
                {activeCombo.title} • ₹{activeCombo.specialPrice}
              </h4>
              <p className="text-xs text-warmgray-300">
                Selected: {getSelectedSoapList().join(', ') || 'None'}
                {activeCombo.rules.requiresBodyWash && ` • Body Wash: ${selectedBodyWash}`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <a
                href={isComboComplete ? whatsAppUrl : '#'}
                target={isComboComplete ? "_blank" : "_self"}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!isComboComplete) {
                    e.preventDefault();
                    alert(`Please select exactly ${activeCombo.rules.requiredSoaps} soaps to complete your combo.`);
                  }
                }}
                className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isComboComplete
                    ? 'btn-whatsapp-3d text-white cursor-pointer hover:scale-105'
                    : 'bg-warmgray-700 text-warmgray-400 cursor-not-allowed opacity-70'
                }`}
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>ORDER ON WHATSAPP</span>
              </a>
            </div>
          </div>

        </div>

        {/* Marketing / Benefit Section */}
        <div className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="font-serif text-3xl font-bold text-botanical-950">
              Why Gift Lavanya This Raksha Bandhan?
            </h3>
            <p className="text-xs sm:text-sm text-warmgray-600 mt-1">
              Curated natural-care combinations at special festive prices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {RAKSHA_BANDHAN_CAMPAIGN.benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-botanical-100 text-botanical-800 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-botanical-950">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white/60 p-6 rounded-2xl border border-cream-200 text-xs text-warmgray-600 space-y-2 max-w-4xl mx-auto">
          <span className="font-bold text-botanical-950 uppercase tracking-wider block">
            Campaign Terms & Conditions:
          </span>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-warmgray-600">
            {RAKSHA_BANDHAN_CAMPAIGN.terms.map((term, tIdx) => (
              <li key={tIdx}>{term}</li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
};

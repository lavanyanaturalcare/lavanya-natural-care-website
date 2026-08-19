import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Gift, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Minus, 
  MessageCircle, 
  Phone, 
  ShieldCheck, 
  Heart, 
  ChevronRight, 
  Clock, 
  Tag, 
  Info,
  Package,
  RotateCcw,
  Zap
} from 'lucide-react';
import { RAKSHA_BANDHAN_CAMPAIGN, ComboOffer, isCampaignActive, generateWhatsAppOrderUrl } from '../data/campaign';
import { ComboVisual } from '../components/ComboVisual';
import { CountdownTimer } from '../components/CountdownTimer';

export const CustomizeCombo: React.FC = () => {
  const { comboId } = useParams<{ comboId?: string }>();
  const navigate = useNavigate();

  // Find initial combo from URL param or default to combo-1
  const initialComboId = (comboId && RAKSHA_BANDHAN_CAMPAIGN.combos.some(c => c.id === comboId))
    ? comboId
    : 'combo-1';

  const [activeComboId, setActiveComboId] = useState<string>(initialComboId);
  const [selectedSoaps, setSelectedSoaps] = useState<{ [key: string]: number }>({
    'Neem Tulsi Soap': 1,
    'Ubtan Soap': 1,
    'Charcoal & Rice Soap': 1,
    'Kesuda Soap': 1,
    'Hibiscus Soap': 1
  });
  const [selectedBodyWash, setSelectedBodyWash] = useState<string>('Kesuda');

  // Sync state if URL parameter changes
  useEffect(() => {
    if (comboId && RAKSHA_BANDHAN_CAMPAIGN.combos.some(c => c.id === comboId)) {
      handleComboSwitch(comboId);
    }
  }, [comboId]);

  const activeCombo = RAKSHA_BANDHAN_CAMPAIGN.combos.find((c) => c.id === activeComboId) || RAKSHA_BANDHAN_CAMPAIGN.combos[0];

  const handleComboSwitch = (id: string) => {
    setActiveComboId(id);
    const targetCombo = RAKSHA_BANDHAN_CAMPAIGN.combos.find(c => c.id === id);
    if (!targetCombo) return;

    if (targetCombo.rules.requiredSoaps === 5) {
      setSelectedSoaps({
        'Neem Tulsi Soap': 1,
        'Ubtan Soap': 1,
        'Charcoal & Rice Soap': 1,
        'Kesuda Soap': 1,
        'Hibiscus Soap': 1
      });
    } else if (targetCombo.rules.requiredSoaps === 2) {
      setSelectedSoaps({
        'Neem Tulsi Soap': 1,
        'Kesuda Soap': 1
      });
    }

    // Auto smooth scroll down to Step 2 in seconds
    setTimeout(() => {
      const step2 = document.getElementById('customize-step-2');
      if (step2) {
        step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const totalSelectedSoaps = Object.values(selectedSoaps).reduce((sum, val) => sum + val, 0);
  const remainingSoaps = activeCombo.rules.requiredSoaps - totalSelectedSoaps;
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

  // Quick Preset Handlers for convenience
  const applyPreset = (preset: 'all5' | 'purifying' | 'glow' | 'cooling') => {
    if (activeCombo.rules.requiredSoaps === 5) {
      if (preset === 'all5') {
        setSelectedSoaps({
          'Neem Tulsi Soap': 1,
          'Ubtan Soap': 1,
          'Charcoal & Rice Soap': 1,
          'Kesuda Soap': 1,
          'Hibiscus Soap': 1
        });
      } else if (preset === 'purifying') {
        setSelectedSoaps({
          'Neem Tulsi Soap': 2,
          'Charcoal & Rice Soap': 2,
          'Kesuda Soap': 1
        });
      } else if (preset === 'glow') {
        setSelectedSoaps({
          'Ubtan Soap': 2,
          'Hibiscus Soap': 2,
          'Kesuda Soap': 1
        });
      }
    } else if (activeCombo.rules.requiredSoaps === 2) {
      if (preset === 'cooling') {
        setSelectedSoaps({
          'Kesuda Soap': 1,
          'Neem Tulsi Soap': 1
        });
        setSelectedBodyWash('Kesuda');
      } else if (preset === 'glow') {
        setSelectedSoaps({
          'Ubtan Soap': 1,
          'Hibiscus Soap': 1
        });
      }
    }

    // Auto smooth scroll down to Step 2
    setTimeout(() => {
      const step2 = document.getElementById('customize-step-2');
      if (step2) {
        step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
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

  // Detailed soap info map for rich descriptions in customizer
  const soapDetails: { [key: string]: { description: string; benefits: string[] } } = {
    'Neem Tulsi Soap': {
      description: 'Purifying cold process soap with pure Neem oil, Tulsi leaves, and Kokum butter.',
      benefits: ['Purifies skin & controls excess oil', 'Rich in botanical antioxidants']
    },
    'Ubtan Soap': {
      description: 'Traditional Ayurvedic royal formulation with Besan, Haldi, Milk, and Multani Mitti.',
      benefits: ['Gentle natural exfoliation', 'Promotes bright, radiant complexion']
    },
    'Charcoal & Rice Soap': {
      description: 'Deep pore cleansing activated charcoal paired with smoothing rice powder.',
      benefits: ['Draws out deep impurities & pollution', 'Smooths rough texture naturally']
    },
    'Kesuda Soap': {
      description: 'Cooling Palash (Kesuda) flower petals infused with nourishing plant butters.',
      benefits: ['Soothes skin exposed to heat & sun', 'Retains 100% natural glycerin']
    },
    'Hibiscus Soap': {
      description: 'Antioxidant powerhouse formulated with vibrant Hibiscus flower extract.',
      benefits: ['Improves appearance of dull skin', 'Maintains soft, velvety moisture']
    }
  };

  return (
    <div className="py-8 sm:py-12 md:py-16 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 pb-36 lg:pb-16">
      
      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-warmgray-500">
        <Link to="/" className="hover:text-botanical-900 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <Link to="/products" className="hover:text-botanical-900 transition-colors">Products</Link>
        <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span className="text-botanical-950 font-semibold truncate">Raksha Bandhan Combos</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-cream-100 via-[#FDF9F2] to-cream-100 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 border border-cream-300 shadow-sm relative overflow-hidden text-center space-y-3 sm:space-y-4">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#C85A32]/10 border border-[#C85A32]/30 text-[#A03D1A] text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-xs">
          <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>{RAKSHA_BANDHAN_CAMPAIGN.campaignName} • {RAKSHA_BANDHAN_CAMPAIGN.validityDisplay}</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-botanical-950 leading-tight">
          Customize Your Raksha Bandhan Combo
        </h1>

        <p className="text-warmgray-700 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
          {RAKSHA_BANDHAN_CAMPAIGN.tagline} — Personalize your natural skincare gifting box by choosing your favorite handcrafted soap and wash variants below.
        </p>

        {/* Luxury Countdown Timer in Header */}
        <div className="pt-2">
          <CountdownTimer variant="luxury-banner" showLabel={false} />
        </div>
      </div>

      {/* Step 1: Select Combo Offer Tier */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-700 block">Step 01</span>
            <h2 className="font-serif text-xl sm:text-3xl font-bold text-botanical-950">
              Select Your Combo Tier
            </h2>
          </div>
          <span className="text-xs text-warmgray-500 hidden sm:inline font-medium">Click any combo to customize</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {RAKSHA_BANDHAN_CAMPAIGN.combos.map((combo) => {
            const isSelected = activeComboId === combo.id;

            return (
              <div
                key={combo.id}
                onClick={() => handleComboSwitch(combo.id)}
                className={`cursor-pointer rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-300 relative border-2 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-botanical-800 shadow-xl scale-[1.01] ring-4 ring-gold-400/20'
                    : 'bg-white/80 border-cream-200 hover:border-gold-400 hover:bg-white shadow-xs'
                }`}
              >
                {/* Discount Badge */}
                <div className="absolute top-3.5 right-3.5 bg-[#C85A32] text-white text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-xs uppercase tracking-wider">
                  {combo.discountLabel}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-botanical-800 text-gold-400 text-[11px] font-serif font-bold flex items-center justify-center">
                      {combo.number}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-gold-700 uppercase tracking-wider">
                      Combo 0{combo.number}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-botanical-950 mb-1 leading-snug">
                    {combo.title}
                  </h3>

                  <p className="text-[11px] sm:text-xs text-[#A03D1A] font-semibold uppercase tracking-wider mb-3">
                    {combo.tagline}
                  </p>

                  <ComboVisual comboNumber={combo.number} size="sm" className="mb-3" />
                </div>

                <div className="pt-3 border-t border-cream-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] sm:text-[11px] text-warmgray-500 line-through block font-medium">MRP ₹{combo.mrp}</span>
                    <span className="font-serif text-xl sm:text-2xl font-bold text-botanical-950">₹{combo.specialPrice}</span>
                  </div>
                  <span className="text-[11px] sm:text-xs bg-botanical-50 text-botanical-800 border border-botanical-200 font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg">
                    SAVE ₹{combo.saving}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Builder Grid: Customizer (Left) + Sticky Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Soap & Body Wash Customizer */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-10">
          
          {/* Soap Customization Section */}
          <div id="customize-step-2" className="scroll-mt-24 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-cream-200 shadow-sm space-y-4 sm:space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-cream-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gold-700 block">Step 02</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-botanical-950">
                  Select {activeCombo.rules.requiredSoaps} Soap Variants
                </h3>
                <p className="text-xs sm:text-sm text-warmgray-600">
                  Mix and match any of our handcrafted cold-process soaps.
                </p>
              </div>

              <div className={`self-start sm:self-auto px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                isSoapRequirementMet
                  ? 'bg-botanical-800 text-white shadow-xs'
                  : 'bg-cream-100 text-warmgray-800 border border-cream-300'
              }`}>
                {isSoapRequirementMet ? '✓ All Soaps Selected' : `Selected: ${totalSelectedSoaps} / ${activeCombo.rules.requiredSoaps}`}
              </div>
            </div>

            {/* Quick 1-Click Preset Options */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-botanical-950 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-gold-600" />
                <span>1-Click Presets:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {activeCombo.rules.requiredSoaps === 5 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => applyPreset('all5')}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-cream-300 hover:border-botanical-800 text-[11px] sm:text-xs font-medium text-botanical-950 shadow-xs hover:bg-cream-100 transition-all active:scale-95"
                    >
                      ✨ 1 of Each (All 5)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('purifying')}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-cream-300 hover:border-botanical-800 text-[11px] sm:text-xs font-medium text-botanical-950 shadow-xs hover:bg-cream-100 transition-all active:scale-95"
                    >
                      🌿 Purifying Pack
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('glow')}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-cream-300 hover:border-botanical-800 text-[11px] sm:text-xs font-medium text-botanical-950 shadow-xs hover:bg-cream-100 transition-all active:scale-95"
                    >
                      🌸 Royal Glow Pack
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => applyPreset('cooling')}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-cream-300 hover:border-botanical-800 text-[11px] sm:text-xs font-medium text-botanical-950 shadow-xs hover:bg-cream-100 transition-all active:scale-95"
                    >
                      🌿 Neem Tulsi + Kesuda
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('glow')}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-cream-300 hover:border-botanical-800 text-[11px] sm:text-xs font-medium text-botanical-950 shadow-xs hover:bg-cream-100 transition-all active:scale-95"
                    >
                      🌸 Ubtan + Hibiscus
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Soap Items List with Mobile-Friendly Horizontal Rows */}
            <div className="space-y-3 sm:space-y-4">
              {RAKSHA_BANDHAN_CAMPAIGN.allowedSoaps.map((soap) => {
                const count = selectedSoaps[soap.name] || 0;
                const details = soapDetails[soap.name];

                return (
                  <div
                    key={soap.id}
                    className={`rounded-2xl p-3 sm:p-5 border-2 transition-all flex items-center justify-between gap-3 sm:gap-4 ${
                      count > 0
                        ? 'bg-cream-50/90 border-botanical-800 shadow-xs'
                        : 'bg-white border-cream-200 hover:border-cream-300'
                    }`}
                  >
                    {/* Soap Image & Details */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white p-1 sm:p-1.5 border border-cream-100 shrink-0 flex items-center justify-center">
                        <img src={soap.image} alt={soap.name} className="w-full h-full object-contain" />
                      </div>

                      <div className="space-y-0.5 sm:space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-serif text-base sm:text-xl font-bold text-botanical-950 truncate">
                            {soap.name}
                          </h4>
                          <span className="text-[9px] sm:text-[10px] text-warmgray-500 bg-cream-100 px-1.5 py-0.2 rounded font-semibold">
                            100g
                          </span>
                        </div>

                        {details && (
                          <p className="text-[11px] sm:text-xs text-warmgray-600 leading-snug line-clamp-1 sm:line-clamp-2">
                            {details.description}
                          </p>
                        )}

                        {details && (
                          <div className="hidden sm:flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
                            {details.benefits.map((b, bIdx) => (
                              <span key={bIdx} className="text-[11px] text-botanical-900 flex items-center gap-1 font-medium">
                                <CheckCircle2 className="w-3 h-3 text-gold-600 shrink-0" />
                                {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Touch-Friendly Finger Buttons (38px touch zone) */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 bg-white p-1 sm:p-1.5 rounded-xl border border-cream-200 shadow-xs">
                      <button
                        type="button"
                        onClick={() => handleRemoveSoap(soap.name)}
                        disabled={count <= 0}
                        aria-label={`Decrease ${soap.name}`}
                        className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 ${
                          count > 0
                            ? 'bg-cream-100 hover:bg-cream-200 text-botanical-900'
                            : 'bg-cream-50 text-warmgray-300 cursor-not-allowed'
                        }`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="font-serif text-base sm:text-lg font-bold text-botanical-950 w-5 sm:w-6 text-center">
                        {count}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAddSoap(soap.name)}
                        disabled={totalSelectedSoaps >= activeCombo.rules.requiredSoaps}
                        aria-label={`Increase ${soap.name}`}
                        className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 ${
                          totalSelectedSoaps < activeCombo.rules.requiredSoaps
                            ? 'bg-botanical-800 hover:bg-botanical-900 text-white shadow-xs'
                            : 'bg-cream-100 text-warmgray-300 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Body Wash Customization Section (For Combo 2 & 3) */}
          {activeCombo.rules.requiresBodyWash && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-cream-200 shadow-sm space-y-4 sm:space-y-6">
              <div className="pb-3 border-b border-cream-100">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-700 block">Step 03</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-botanical-950">
                  Select Face & Body Wash (300ml)
                </h3>
                <p className="text-xs sm:text-sm text-warmgray-600">
                  Choose 1 gentle plant-based liquid cleanser variant for your combo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                {RAKSHA_BANDHAN_CAMPAIGN.allowedBodyWashes.map((bw) => {
                  const isSelected = selectedBodyWash === bw.name;

                  return (
                    <div
                      key={bw.id}
                      onClick={() => setSelectedBodyWash(bw.name)}
                      className={`cursor-pointer rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 transition-all flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-cream-50/90 border-botanical-800 shadow-sm ring-2 ring-botanical-800/10'
                          : 'bg-white border-cream-200 hover:border-cream-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-white p-1 border border-cream-100 shrink-0 flex items-center justify-center">
                          <img src={bw.image} alt={bw.fullName} className="w-full h-full object-contain" />
                        </div>

                        <div className="space-y-0.5">
                          <h4 className="font-serif text-base sm:text-lg font-bold text-botanical-950 leading-snug">
                            {bw.fullName}
                          </h4>
                          <span className="text-[11px] sm:text-xs text-warmgray-600 block line-clamp-2">
                            {bw.name === 'Kesuda' 
                              ? 'Infused with cooling Palash flower water for soothing cleansing.'
                              : 'Infused with pure Neem and Tulsi for gentle purifying care.'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-cream-100">
                        <span className="text-xs font-semibold text-botanical-900">
                          {isSelected ? '✓ Selected Variant' : 'Click to Select'}
                        </span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-botanical-800 bg-botanical-800 text-white' : 'border-cream-300'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lip Balm Spotlight (For Combo 2) */}
          {activeCombo.rules.includesLipBalm && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-cream-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-cream-50 p-1.5 border border-cream-100 flex items-center justify-center shrink-0">
                  <img src={RAKSHA_BANDHAN_CAMPAIGN.lipBalm.image} alt="Lip Balm" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gold-700 uppercase tracking-widest block">Festive Add-on</span>
                  <h4 className="font-serif text-base sm:text-xl font-bold text-botanical-950">
                    {RAKSHA_BANDHAN_CAMPAIGN.lipBalm.name}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-warmgray-600">
                    Made with nourishing Almond Oil, Coconut Oil, Shea Butter, and Beeswax.
                  </p>
                </div>
              </div>

              <span className="bg-botanical-800 text-white text-[11px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xs shrink-0">
                Included Free in Combo 2
              </span>
            </div>
          )}

          {/* Festive Eco-Packaging Highlight */}
          <div className="bg-cream-100/70 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-cream-300 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-botanical-800 text-gold-400 flex items-center justify-center shrink-0 shadow-xs">
              <Package className="w-6 h-6" />
            </div>
            <div className="space-y-0.5 text-center sm:text-left">
              <h4 className="font-serif text-base sm:text-lg font-bold text-botanical-950">
                Festive Eco-Conscious Gift Packaging
              </h4>
              <p className="text-[11px] sm:text-xs text-warmgray-700 leading-relaxed">
                Every Raksha Bandhan combo comes hand-wrapped in eco-friendly packaging designed to protect botanical aroma, preserve freshness, and make gifting effortless.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Order Summary Card (Desktop) */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-gold-400/40 shadow-xl space-y-5">
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gold-700 uppercase tracking-wider">
                  Combo 0{activeCombo.number}
                </span>
                <span className="bg-[#C85A32] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {activeCombo.discountLabel}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-botanical-950">
                {activeCombo.title}
              </h3>
            </div>

            {/* Sidebar Countdown Timer */}
            <CountdownTimer variant="sidebar" />

            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-warmgray-600">
                <span>Standard MRP:</span>
                <span className="line-through font-semibold">₹{activeCombo.mrp}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-botanical-800 font-semibold">
                <span>Festive Discount:</span>
                <span>- ₹{activeCombo.saving} ({activeCombo.discountLabel})</span>
              </div>
              <div className="pt-2 border-t border-cream-200 flex items-baseline justify-between">
                <span className="text-xs font-bold text-botanical-950 uppercase">Special Combo Price:</span>
                <span className="font-serif text-3xl font-bold text-botanical-950">₹{activeCombo.specialPrice}</span>
              </div>
            </div>

            {/* Selected Items Breakdown List */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-botanical-950 block">
                Selected Products Checklist:
              </span>

              <ul className="space-y-2 text-xs">
                {Object.entries(selectedSoaps).map(([soap, count]) => (
                  <li key={soap} className="flex items-center justify-between p-2 rounded-xl bg-cream-50 border border-cream-100">
                    <span className="font-medium text-warmgray-800">{soap}</span>
                    <span className="font-bold text-botanical-900 bg-white px-2 py-0.5 rounded-md border border-cream-200">
                      × {count}
                    </span>
                  </li>
                ))}

                {activeCombo.rules.requiresBodyWash && (
                  <li className="flex items-center justify-between p-2 rounded-xl bg-cream-50 border border-cream-100">
                    <span className="font-medium text-warmgray-800">Body Wash ({selectedBodyWash})</span>
                    <span className="font-bold text-botanical-900 bg-white px-2 py-0.5 rounded-md border border-cream-200">
                      × 1
                    </span>
                  </li>
                )}

                {activeCombo.rules.includesLipBalm && (
                  <li className="flex items-center justify-between p-2 rounded-xl bg-cream-50 border border-cream-100">
                    <span className="font-medium text-warmgray-800">Natural Lip Balm (10g)</span>
                    <span className="font-bold text-botanical-800 bg-white px-2 py-0.5 rounded-md border border-cream-200">
                      Free
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Validation & WhatsApp Order Button */}
            <div className="space-y-3 pt-2">
              {!isComboComplete ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Please select <strong>{remainingSoaps}</strong> more soap(s) to complete your combo.
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Your combo is customized and ready to order!</span>
                </div>
              )}

              <a
                href={isComboComplete ? whatsAppUrl : '#'}
                target={isComboComplete ? "_blank" : "_self"}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!isComboComplete) {
                    e.preventDefault();
                    alert(`Please select exactly ${activeCombo.rules.requiredSoaps} soaps before ordering.`);
                  }
                }}
                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isComboComplete
                    ? 'btn-whatsapp-3d text-white cursor-pointer hover:scale-[1.02]'
                    : 'bg-warmgray-300 text-warmgray-500 cursor-not-allowed'
                }`}
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>ORDER ON WHATSAPP</span>
              </a>

              <a
                href="tel:+919726739515"
                className="w-full py-3 rounded-xl border border-botanical-800 text-botanical-900 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-cream-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call to Inquire (+91 97267 39515)</span>
              </a>
            </div>

            {/* Gifting Guarantee */}
            <div className="pt-4 border-t border-cream-100 text-[11px] text-warmgray-500 space-y-1 text-center">
              <p>Offer valid 19 – 28 August 2026 • Direct Delivery</p>
              <p>100% Handcrafted Cold Process • Vadodara, India</p>
            </div>

          </div>
        </div>

      </div>

      {/* High-Contrast Sticky Bottom Bar on Mobile Screens */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-lg border-t border-cream-300 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className={`text-[10px] font-bold block truncate ${
            isComboComplete ? 'text-emerald-700' : 'text-amber-700'
          }`}>
            {isComboComplete ? '✓ Ready to Order' : `Select ${remainingSoaps} more soap(s)`}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-warmgray-400 line-through">₹{activeCombo.mrp}</span>
            <span className="font-serif text-xl font-bold text-botanical-950">₹{activeCombo.specialPrice}</span>
          </div>
        </div>

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
          className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all shrink-0 active:scale-95 ${
            isComboComplete
              ? 'btn-whatsapp-3d text-white'
              : 'bg-warmgray-300 text-warmgray-500 cursor-not-allowed opacity-80'
          }`}
        >
          <MessageCircle className="w-4 h-4 fill-current shrink-0" />
          <span>ORDER ON WHATSAPP</span>
        </a>
      </div>

    </div>
  );
};

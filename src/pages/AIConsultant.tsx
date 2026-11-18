import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Leaf, 
  Send, 
  Camera, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  MessageCircle, 
  Sliders, 
  Bot, 
  Key, 
  ShieldCheck, 
  Flower2, 
  Sun, 
  Droplets, 
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { ApiKeyModal } from '../components/ApiKeyModal';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { productsData } from '../data/products';
import { Product } from '../types';
import { 
  SkinType, 
  SkinConcern, 
  ClimateSeason, 
  SkincareQuizAnswers, 
  ConsultationResult, 
  ChatMessage 
} from '../types/ai';
import { 
  generateSkincareConsultation, 
  askLavanyaAI, 
  analyzeSkinOrLabelImage, 
  hasGeminiApiKey,
  getGeminiApiKey 
} from '../services/geminiService';

export const AIConsultant: React.FC = () => {
  // Navigation Tabs: 'quiz' | 'chat' | 'scanner'
  const [activeTab, setActiveTab] = useState<'quiz' | 'chat' | 'scanner'>('quiz');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    setHasKey(hasGeminiApiKey());
  }, [isKeyModalOpen]);

  // ===============================
  // TAB 1: QUIZ STATE & LOGIC
  // ===============================
  const [quizAnswers, setQuizAnswers] = useState<SkincareQuizAnswers>({
    skinType: 'oily',
    primaryConcern: 'acne_blemishes',
    climateSeason: 'summer_heat',
    routinePreference: 'comprehensive',
    notes: ''
  });

  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizResult, setQuizResult] = useState<ConsultationResult | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);

  const skinTypeOptions: { type: SkinType; label: string; desc: string; icon: string }[] = [
    { type: 'oily', label: 'Oily & Blemish-Prone', desc: 'Shiny T-zone, enlarged pores, prone to breakouts', icon: '🍃' },
    { type: 'dry', label: 'Dry & Tight', desc: 'Flaky patches, dullness, tight feeling after washing', icon: '🌾' },
    { type: 'combination', label: 'Combination', desc: 'Oily forehead and nose, normal or dry cheeks', icon: '⚖️' },
    { type: 'sensitive', label: 'Sensitive & Reactive', desc: 'Prone to redness, itching, stinging, or heat rash', icon: '🌸' },
    { type: 'normal', label: 'Normal & Balanced', desc: 'Generally comfortable without excessive oil or dryness', icon: '✨' },
    { type: 'mature', label: 'Mature & Dry', desc: 'Fine lines, loss of firmness, needs rich botanical nourishment', icon: '🌿' }
  ];

  const primaryConcernOptions: { concern: SkinConcern; label: string; desc: string }[] = [
    { concern: 'acne_blemishes', label: 'Pimples & Blemishes', desc: 'Neem & Tulsi purification needed' },
    { concern: 'tan_pigmentation', label: 'Sun Tan & Dark Spots', desc: 'Ubtan & Besan botanical glow' },
    { concern: 'heat_rash', label: 'Heat Rash & Redness', desc: 'Kesuda / Palash soothing therapy' },
    { concern: 'dryness_flakiness', label: 'Dryness & Moisture Loss', desc: 'Kokum Butter & cold process glycerin' },
    { concern: 'dullness', label: 'Dull & Tired Complexion', desc: 'Hibiscus AHA & Rice extract' },
    { concern: 'excess_oil', label: 'Excess Sebum & Blackheads', desc: 'Activated Charcoal & Rice gentle polish' }
  ];

  const seasonOptions: { season: ClimateSeason; label: string; desc: string; icon: string }[] = [
    { season: 'summer_heat', label: 'Summer Heat', desc: 'Intense sun, sweating, heat rashes', icon: '☀️' },
    { season: 'monsoon_humidity', label: 'Monsoon Humidity', desc: 'Dampness, sticky skin, clogged pores', icon: '🌧️' },
    { season: 'winter_dry', label: 'Winter Dryness', desc: 'Cold air, dryness, chapped lips', icon: '❄️' },
    { season: 'moderate', label: 'Moderate Climate', desc: 'Balanced temperate weather', icon: '🌤️' }
  ];

  const handleRunQuiz = async () => {
    setIsQuizLoading(true);
    setQuizError(null);
    try {
      const result = await generateSkincareConsultation(quizAnswers);
      setQuizResult(result);
    } catch (err: any) {
      setQuizError(err.message || 'Failed to generate consultation.');
    } finally {
      setIsQuizLoading(false);
    }
  };

  // ===============================
  // TAB 2: LIVE CHAT STATE & LOGIC
  // ===============================
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Namaste! 🙏 I am your **Lavanya Botanical Skincare AI**, trained on Ayurvedic principles and the science of handcrafted cold process soaps.\n\nHow can I help you today? You can ask about our cold-process soaps, botanical face washes, ingredients like Kesuda or Neem, or ask for a routine tailored to your skin!',
      timestamp: new Date(),
      recommendedProductIds: ['neem-tulsi-soap', 'kesuda-soap', 'ubtan-soap']
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Which soap is best for summer heat rash and itching?',
    'Why do cold-process soaps retain glycerin compared to commercial bars?',
    'What natural routine clears acne marks and dark spots?',
    'Is Kesuda (Palash) soap gentle enough for sensitive baby skin?',
    'How does Kokum Butter benefit dry skin in winter?'
  ];

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendChat = async (queryText?: string) => {
    const textToSend = queryText || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await askLavanyaAI(userMsg.text, history);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: new Date(),
        recommendedProductIds: response.recommendedProductIds
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `⚠️ Error contacting Gemini API: ${err.message || 'Please check your connection or API key.'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // ===============================
  // TAB 3: SCANNER STATE & LOGIC
  // ===============================
  const [scannerImage, setScannerImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [scannerContext, setScannerContext] = useState('');
  const [isScannerLoading, setIsScannerLoading] = useState(false);
  const [scannerResult, setScannerResult] = useState<{ analysis: string; recommendedProductIds: string[] } | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setScannerError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setScannerImage({
        data: base64Data,
        mimeType: file.type,
        preview: result
      });
      setScannerResult(null);
      setScannerError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async () => {
    if (!scannerImage || isScannerLoading) return;
    setIsScannerLoading(true);
    setScannerError(null);

    try {
      const res = await analyzeSkinOrLabelImage(scannerImage, scannerContext.trim() || undefined);
      setScannerResult(res);
    } catch (err: any) {
      setScannerError(err.message || 'Failed to analyze image.');
    } finally {
      setIsScannerLoading(false);
    }
  };

  return (
    <div className="py-8 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 w-full overflow-x-clip pb-24">
      <SEO
        title="Lavanya AI Botanical Skincare Advisor | Handcrafted Regimens"
        description="Experience personalized Ayurvedic skincare consultations, routine diagnostics, and ingredient scans powered by Google Gemini and Lavanya Natural Care."
      />

      {/* Top Banner / Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-botanical-950 via-botanical-900 to-botanical-950 text-cream-50 p-6 sm:p-10 lg:p-12 shadow-xl border border-gold-500/20 overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-botanical-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/30 text-gold-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Powered by Google Gemini API</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-cream-50 tracking-tight">
              Lavanya Botanical Skincare AI
            </h1>

            <p className="text-cream-200 text-sm sm:text-base leading-relaxed">
              Personalized Ayurvedic diagnostics, cold-process soap recommendations, and botanical ingredient analysis tailored to your skin’s unique nature.
            </p>
          </div>

          {/* Model Status & API Key Pill */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-cream-100 border border-white/20 text-xs font-semibold backdrop-blur-md transition-all shadow-sm"
              title="Configure Gemini API Key"
            >
              <Key className="w-4 h-4 text-gold-400" />
              <span>{hasKey ? 'Gemini API: Connected' : 'Demo Mode (Add Key)'}</span>
              <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-center border-b border-cream-200 pb-2">
        <div className="inline-flex p-1.5 rounded-2xl bg-cream-100 border border-cream-200 shadow-xs max-w-full overflow-x-auto">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'quiz'
                ? 'bg-botanical-800 text-white shadow-md'
                : 'text-warmgray-600 hover:text-botanical-950 hover:bg-cream-50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Prakriti & Skincare Diagnostic</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-botanical-800 text-white shadow-md'
                : 'text-warmgray-600 hover:text-botanical-950 hover:bg-cream-50'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Live Skincare AI Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'scanner'
                ? 'bg-botanical-800 text-white shadow-md'
                : 'text-warmgray-600 hover:text-botanical-950 hover:bg-cream-50'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Visual Skin & Label Scanner</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PRAKRITI & SKINCARE DIAGNOSTIC QUIZ               */}
      {/* ========================================================= */}
      {activeTab === 'quiz' && (
        <div className="space-y-10 animate-fadeIn">
          {/* Diagnostic Question Steps */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-cream-200 shadow-sm space-y-8">
            {/* Step 1: Skin Type */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-botanical-100 text-botanical-800 text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-botanical-950">
                  What is your primary Skin Type?
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {skinTypeOptions.map((opt) => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setQuizAnswers({ ...quizAnswers, skinType: opt.type })}
                    className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                      quizAnswers.skinType === opt.type
                        ? 'border-botanical-800 bg-botanical-50/60 shadow-sm ring-1 ring-botanical-800/30'
                        : 'border-cream-200 hover:border-cream-300 bg-cream-50/30'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{opt.icon}</span>
                    <div className="space-y-0.5">
                      <div className="text-xs sm:text-sm font-bold text-botanical-950">{opt.label}</div>
                      <div className="text-[11px] text-warmgray-500 leading-snug">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Primary Skin Concern */}
            <div className="space-y-4 pt-6 border-t border-cream-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-botanical-100 text-botanical-800 text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-botanical-950">
                  What is your main skincare concern right now?
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {primaryConcernOptions.map((opt) => (
                  <button
                    key={opt.concern}
                    type="button"
                    onClick={() => setQuizAnswers({ ...quizAnswers, primaryConcern: opt.concern })}
                    className={`text-left p-4 rounded-2xl border-2 transition-all space-y-1 ${
                      quizAnswers.primaryConcern === opt.concern
                        ? 'border-botanical-800 bg-botanical-50/60 shadow-sm ring-1 ring-botanical-800/30'
                        : 'border-cream-200 hover:border-cream-300 bg-cream-50/30'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold text-botanical-950">{opt.label}</div>
                    <div className="text-[11px] text-warmgray-500">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Current Climate & Season */}
            <div className="space-y-4 pt-6 border-t border-cream-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-botanical-100 text-botanical-800 text-xs font-bold flex items-center justify-center">3</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-botanical-950">
                  What is the current season or climate in your city?
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {seasonOptions.map((opt) => (
                  <button
                    key={opt.season}
                    type="button"
                    onClick={() => setQuizAnswers({ ...quizAnswers, climateSeason: opt.season })}
                    className={`text-center p-3.5 rounded-2xl border-2 transition-all space-y-1 ${
                      quizAnswers.climateSeason === opt.season
                        ? 'border-botanical-800 bg-botanical-50/60 shadow-sm ring-1 ring-botanical-800/30'
                        : 'border-cream-200 hover:border-cream-300 bg-cream-50/30'
                    }`}
                  >
                    <div className="text-2xl">{opt.icon}</div>
                    <div className="text-xs font-bold text-botanical-950">{opt.label}</div>
                    <div className="text-[10px] text-warmgray-500">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t border-cream-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-warmgray-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-botanical-700 shrink-0" />
                <span>Ayurvedic formulations handcrafted in Vadodara, Gujarat.</span>
              </div>

              <button
                type="button"
                onClick={handleRunQuiz}
                disabled={isQuizLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-botanical-800 text-white font-bold text-sm hover:bg-botanical-900 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isQuizLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-gold-400" />
                    <span>Analyzing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-gold-400" />
                    <span>Generate My Ayurvedic Prescription</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {quizError && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              {quizError}
            </div>
          )}

          {/* Consultation Result Presentation */}
          {quizResult && (
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-cream-200 shadow-md space-y-10 animate-fadeIn">
              {/* Result Header */}
              <div className="border-b border-cream-200 pb-6 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-botanical-100 text-botanical-800 text-xs font-semibold uppercase tracking-wider">
                  <Flower2 className="w-3.5 h-3.5 text-botanical-700" />
                  <span>Personalized Ayurvedic Skincare Regimen</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-botanical-950">
                  Your Botanical Diagnosis & Care Plan
                </h2>
                <p className="text-warmgray-700 text-sm sm:text-base leading-relaxed bg-cream-50 p-5 rounded-2xl border border-cream-100">
                  <strong>Prakriti & Skin Balance:</strong> {quizResult.prakritiSkinAnalysis}
                </p>
              </div>

              {/* Ayurvedic Wisdom on Cold Process Soap */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-botanical-900 to-botanical-950 text-cream-50 space-y-2.5">
                <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Why Handcrafted Cold Process Soap Makes the Difference</span>
                </div>
                <p className="text-xs sm:text-sm text-cream-100/90 leading-relaxed">
                  {quizResult.ayurvedicWisdom}
                </p>
              </div>

              {/* Recommended Routine Steps */}
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-botanical-950">
                  Your Daily & Weekly Botanical Regimen
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizResult.routine.map((step, idx) => (
                    <div 
                      key={idx}
                      className="p-5 rounded-2xl border border-cream-200 bg-cream-50/50 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gold-700 bg-gold-400/20 px-2.5 py-1 rounded-full">
                            Step {idx + 1}: {step.step}
                          </span>
                        </div>
                        <h4 className="font-serif text-xl font-bold text-botanical-950">
                          {step.productName}
                        </h4>
                        <p className="text-xs text-warmgray-700 leading-relaxed">
                          {step.whyThisProduct}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-cream-200/60 space-y-2">
                        <div className="text-[11px] text-warmgray-600">
                          <strong>Botanicals:</strong> {step.keyIngredients.join(', ')}
                        </div>
                        <div className="text-[11px] text-botanical-900 font-medium bg-white p-2.5 rounded-xl border border-cream-100">
                          <strong>How to apply:</strong> {step.howToUse}
                        </div>
                        {step.recommendedProductId && (
                          <Link
                            to={`/products/${step.recommendedProductId}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-botanical-800 hover:text-gold-700 pt-1"
                          >
                            <span>View Product Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Products Showcase */}
              {quizResult.recommendedProducts.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-cream-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-2xl font-bold text-botanical-950">
                      Recommended Products for Your Regimen
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizResult.recommendedProducts.map((prod) => (
                      <div 
                        key={prod.id} 
                        className="bg-white rounded-2xl border border-cream-200 p-4 space-y-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
                      >
                        <div className="space-y-2">
                          <div className="w-full h-44 bg-cream-50 rounded-xl overflow-hidden p-3 flex items-center justify-center">
                            <img src={prod.image} alt={prod.name} className="h-full object-contain" />
                          </div>
                          <span className="text-[10px] uppercase font-bold text-warmgray-500 tracking-wider">
                            {prod.category}
                          </span>
                          <h4 className="font-serif text-lg font-bold text-botanical-950 leading-tight">
                            {prod.name}
                          </h4>
                          <p className="text-xs text-warmgray-600 line-clamp-2">
                            {prod.shortDescription}
                          </p>
                        </div>

                        <div className="space-y-2.5 pt-2 border-t border-cream-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-warmgray-500">{prod.netWeightOrVol}</span>
                            <span className="font-serif text-xl font-bold text-botanical-950">₹{prod.mrp}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              to={`/products/${prod.id}`}
                              className="py-2 rounded-xl text-center border border-botanical-800 text-botanical-900 text-xs font-semibold hover:bg-cream-100 transition-colors"
                            >
                              Details
                            </Link>
                            <WhatsAppButton
                              productName={prod.name}
                              mrp={prod.mrp}
                              label="Order"
                              className="py-2 text-xs font-bold justify-center"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle & Seasonal Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-cream-100">
                <div className="p-5 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
                  <h4 className="font-serif text-lg font-bold text-botanical-950 flex items-center gap-2">
                    <Sun className="w-4 h-4 text-gold-600" />
                    <span>Seasonal Skincare Advice</span>
                  </h4>
                  <p className="text-xs text-warmgray-700 leading-relaxed">
                    {quizResult.seasonalAdvice}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
                  <h4 className="font-serif text-lg font-bold text-botanical-950 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-botanical-700" />
                    <span>Ayurvedic Lifestyle Habits</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-warmgray-700">
                    {quizResult.lifestyleTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-gold-600 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* WhatsApp Prescription Order Button */}
              <div className="pt-2 text-center">
                <a
                  href={`https://wa.me/919726739515?text=${encodeURIComponent(
                    `Hello Lavanya Natural Care! I took your AI Skincare Quiz for ${quizAnswers.skinType} skin and would like to order my recommended botanical routine: ${quizResult.routine.map(r => r.productName).join(', ')}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#25D366] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Order Complete Routine via WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: LIVE SKINCARE & INGREDIENT AI CHAT                */}
      {/* ========================================================= */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-cream-200 shadow-sm overflow-hidden flex flex-col h-[700px] animate-fadeIn">
          {/* Chat Window Header */}
          <div className="bg-cream-100/80 px-6 py-4 border-b border-cream-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-botanical-800 text-gold-400 flex items-center justify-center font-bold shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-botanical-950 leading-tight">
                  Lavanya Skincare Assistant
                </h3>
                <span className="text-[11px] text-warmgray-500">
                  {hasKey ? 'Gemini 4 Hydrogen • Online' : 'Demo Mode (Add API Key for live AI)'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="text-xs font-semibold text-botanical-800 hover:text-gold-700 flex items-center gap-1"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-cream-50/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.role === 'user'
                      ? 'bg-gold-500 text-botanical-950'
                      : 'bg-botanical-800 text-gold-400'
                  }`}
                >
                  {msg.role === 'user' ? 'You' : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl space-y-3 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-botanical-800 text-white rounded-tr-none'
                      : 'bg-white border border-cream-200 text-warmgray-900 rounded-tl-none shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Render linked products if recommended */}
                  {msg.recommendedProductIds && msg.recommendedProductIds.length > 0 && (
                    <div className="pt-2 border-t border-cream-100 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-gold-700 tracking-wider block">
                        Recommended Lavanya Products:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.recommendedProductIds.map((pid) => {
                          const prod = productsData.find(p => p.id === pid);
                          if (!prod) return null;
                          return (
                            <Link
                              key={pid}
                              to={`/products/${pid}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-100 hover:bg-gold-100/60 border border-cream-300 text-botanical-950 font-semibold text-xs transition-colors"
                            >
                              <Leaf className="w-3 h-3 text-botanical-700" />
                              <span>{prod.name} (₹{prod.mrp})</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex gap-3 max-w-xl mr-auto items-center text-xs text-warmgray-500">
                <div className="w-8 h-8 rounded-full bg-botanical-800 text-gold-400 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white border border-cream-200 p-3 rounded-2xl rounded-tl-none shadow-xs">
                  <span>Consulting Ayurvedic botanical knowledge...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Suggested Quick Prompt Chips */}
          <div className="p-3 bg-white border-t border-cream-200 overflow-x-auto whitespace-nowrap flex gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChat(q)}
                disabled={isChatLoading}
                className="px-3 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 text-warmgray-700 text-xs transition-colors border border-cream-200 shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="p-3 sm:p-4 bg-white border-t border-cream-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about skin concerns, cold process soap, ingredients..."
              className="flex-1 px-4 py-3 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-botanical-800/20 focus:border-botanical-800 text-xs sm:text-sm"
              disabled={isChatLoading}
            />

            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="p-3 rounded-xl bg-botanical-800 text-white hover:bg-botanical-900 transition-colors disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: MULTIMODAL VISUAL SKIN & LABEL SCANNER             */}
      {/* ========================================================= */}
      {activeTab === 'scanner' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-cream-200 shadow-sm space-y-8 animate-fadeIn">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-botanical-100 text-botanical-800 text-xs font-semibold uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5 text-botanical-700" />
              <span>Multimodal Gemini Vision</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-botanical-950">
              Visual Skin & Cosmetic Label Scanner
            </h2>
            <p className="text-xs sm:text-sm text-warmgray-600 leading-relaxed">
              Upload a clear photo of your skin concern (e.g. sun tan, dryness, redness) or snap a picture of a commercial cosmetic ingredient list. Gemini Vision analyzes the botanical needs and explains why pure cold process soap provides healthier care.
            </p>
          </div>

          {/* Upload Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-cream-300 hover:border-botanical-800 rounded-2xl p-8 text-center cursor-pointer bg-cream-50/50 hover:bg-cream-100/50 transition-all space-y-3 flex flex-col items-center justify-center min-h-[260px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {scannerImage ? (
                <div className="space-y-3 w-full">
                  <img
                    src={scannerImage.preview}
                    alt="Uploaded preview"
                    className="max-h-48 mx-auto rounded-xl object-contain border border-cream-200 shadow-sm"
                  />
                  <span className="text-xs text-botanical-800 font-semibold block">
                    Click to choose a different photo
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-botanical-100 flex items-center justify-center text-botanical-800">
                    <Upload className="w-6 h-6 text-botanical-700" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-botanical-950 block">
                      Upload Skin Photo or Ingredient Label
                    </span>
                    <span className="text-xs text-warmgray-500">
                      Supports JPG, PNG, WEBP from your phone camera or gallery
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Context & Actions */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-warmgray-700 mb-1.5">
                  Optional Note or Question
                </label>
                <textarea
                  value={scannerContext}
                  onChange={(e) => setScannerContext(e.target.value)}
                  placeholder="e.g., 'Is my current face wash causing dry irritation?' or 'Recommend a cold process soap for this tan.'"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-botanical-800/20 focus:border-botanical-800 text-xs sm:text-sm"
                />
              </div>

              <button
                type="button"
                onClick={handleAnalyzeImage}
                disabled={!scannerImage || isScannerLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-botanical-800 text-white font-bold text-sm hover:bg-botanical-900 transition-all shadow-md disabled:opacity-40"
              >
                {isScannerLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-gold-400" />
                    <span>Analyzing Image with Gemini Vision...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-gold-400" />
                    <span>Analyze Botanical Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {scannerError && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              {scannerError}
            </div>
          )}

          {/* Scanner Result Card */}
          {scannerResult && (
            <div className="p-6 sm:p-8 rounded-2xl bg-cream-50 border border-cream-200 space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold text-botanical-950">
                  Gemini Botanical Vision Analysis
                </h3>
                <div className="text-xs sm:text-sm text-warmgray-800 leading-relaxed whitespace-pre-wrap">
                  {scannerResult.analysis}
                </div>
              </div>

              {scannerResult.recommendedProductIds.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-cream-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-botanical-950">
                    Recommended Natural Match:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {scannerResult.recommendedProductIds.map((pid) => {
                      const prod = productsData.find(p => p.id === pid);
                      if (!prod) return null;
                      return (
                        <div key={pid} className="bg-white p-3.5 rounded-xl border border-cream-200 space-y-2 shadow-xs">
                          <img src={prod.image} alt={prod.name} className="h-28 w-full object-contain" />
                          <h5 className="font-serif text-base font-bold text-botanical-950 truncate">{prod.name}</h5>
                          <span className="text-xs font-serif font-bold text-botanical-900 block">₹{prod.mrp}</span>
                          <Link
                            to={`/products/${pid}`}
                            className="block text-center py-1.5 rounded-lg border border-botanical-800 text-botanical-900 text-xs font-semibold hover:bg-cream-100"
                          >
                            View Soap
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={() => setHasKey(hasGeminiApiKey())}
      />
    </div>
  );
};

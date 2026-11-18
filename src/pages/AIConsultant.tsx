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
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  Scale,
  Globe,
  Info
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { ApiKeyModal } from '../components/ApiKeyModal';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { 
  VERIFIED_PRODUCTS, 
  VERIFIED_BOTANICALS, 
  SupportedLanguage, 
  I18N, 
  VerifiedProductKnowledge 
} from '../data/productKnowledge';
import { Product } from '../types';
import { 
  SkinType, 
  SkinConcern, 
  ClimateSeason, 
  KnownSensitivity,
  SkincareQuizAnswers, 
  ConsultationResult, 
  ChatMessage 
} from '../types/ai';
import { 
  generateSkincareConsultation, 
  askLavanyaAI, 
  compareProductsWithAI,
  analyzeSkinOrLabelImage, 
  hasGeminiApiKey 
} from '../services/geminiService';

export const AIConsultant: React.FC = () => {
  // Multilingual State: 'en' | 'hi' | 'gu'
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const t = I18N[language];

  // Navigation Tabs: 'quiz' | 'chat' | 'compare' | 'scanner'
  const [activeTab, setActiveTab] = useState<'quiz' | 'chat' | 'compare' | 'scanner'>('quiz');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    setHasKey(hasGeminiApiKey());
  }, [isKeyModalOpen]);

  // ===============================
  // TAB 1: GUIDED QUIZ STATE & LOGIC
  // ===============================
  const [quizAnswers, setQuizAnswers] = useState<SkincareQuizAnswers>({
    skinType: 'oily',
    primaryConcern: 'acne_blemishes',
    knownSensitivity: 'none',
    climateSeason: 'summer_heat',
    routinePreference: 'comprehensive',
    notes: '',
    language: 'en'
  });

  // Keep quizAnswers language in sync
  useEffect(() => {
    setQuizAnswers(prev => ({ ...prev, language }));
  }, [language]);

  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizResult, setQuizResult] = useState<ConsultationResult | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);

  const skinTypeOptions: { type: SkinType; label: { en: string; hi: string; gu: string }; desc: { en: string; hi: string; gu: string }; icon: string }[] = [
    { 
      type: 'oily', 
      label: { en: 'Oily & Blemish-Prone', hi: 'तैलीय एवं मुँहासे-प्रवण', gu: 'તેલી અને ખીલ-પ્રવૃત્તિ' }, 
      desc: { en: 'Shiny T-zone, enlarged pores, sebum balance needed', hi: 'अतिरिक्त तेल, तैलीय चमक, रोमछिद्र संतुलन की आवश्यकता', gu: 'વધારે પડતું તેલ, ચમક અને સંતુલનની જરૂર' }, 
      icon: '🍃' 
    },
    { 
      type: 'dry', 
      label: { en: 'Dry & Tight', hi: 'शुष्क एवं खिंची हुई त्वचा', gu: 'સૂકી અને ખેંચાણવાળી ત્વચા' }, 
      desc: { en: 'Flaky patches, tight feeling after washing', hi: 'धोने के बाद रूखापन, त्वचा में खिंचाव', gu: 'ધોયા પછી ખેંચાણ અને નરમાઈની જરૂર' }, 
      icon: '🌾' 
    },
    { 
      type: 'combination', 
      label: { en: 'Combination', hi: 'मिश्रित त्वचा (Combination)', gu: 'મિશ્રિત ત્વચા (Combination)' }, 
      desc: { en: 'Oily T-zone, normal or dry cheeks', hi: 'टी-ज़ोन तैलीय, गाल सामान्य या रूखे', gu: 'કપાળ-નાક તેલી, ગાલ સામાન્ય' }, 
      icon: '⚖️' 
    },
    { 
      type: 'sensitive', 
      label: { en: 'Sensitive & Reactive', hi: 'संवेदनशील एवं कोमल', gu: 'સંવેદનશીલ અને નાજુક' }, 
      desc: { en: 'Prone to heat rash, stinging, or redness', hi: 'घमौरियों, लालिमा व खुजली की संभावना', gu: 'ગરમીની અળાઈ કે લાલાશ થવાની શક્યતા' }, 
      icon: '🌸' 
    },
    { 
      type: 'normal', 
      label: { en: 'Normal & Balanced', hi: 'सामान्य एवं संतुलित', gu: 'સામાન્ય અને સંતુલિત' }, 
      desc: { en: 'Comfortable balance without extreme oil or dryness', hi: 'संतुलित त्वचा, न अधिक तेल न रूखापन', gu: 'સંતુલિત, ન વધુ તેલ ન સૂકાપણું' }, 
      icon: '✨' 
    },
    { 
      type: 'mature', 
      label: { en: 'Mature & Dry', hi: 'परिपक्व त्वचा (Mature)', gu: 'પુખ્ત ત્વચા (Mature)' }, 
      desc: { en: 'Needs rich plant butter barrier nourishment', hi: 'गहरी पोषण व कोकम बटर की आवश्यकता', gu: 'કોકમ બટર અને ઊંડા પોષણની જરૂર' }, 
      icon: '🌿' 
    }
  ];

  const primaryConcernOptions: { concern: SkinConcern; label: { en: string; hi: string; gu: string }; desc: { en: string; hi: string; gu: string } }[] = [
    { 
      concern: 'acne_blemishes', 
      label: { en: 'Pimples & Blemishes', hi: 'मुँहासे एवं फुंसियाँ', gu: 'ખીલ અને ડાઘ' }, 
      desc: { en: 'Neem & Tulsi botanical purification', hi: 'नीम एवं तुलसी द्वारा प्राकृतिक शुद्धि', gu: 'લીમડો અને તુલસી દ્વારા કુદરતી શુદ્ધિ' } 
    },
    { 
      concern: 'tan_pigmentation', 
      label: { en: 'Sun Tan & Dark Spots', hi: 'धूप से टैनिंग व काले धब्बे', gu: 'સૂર્ય ટેનિંગ અને કાળા ડાઘ' }, 
      desc: { en: 'Ubtan & Besan traditional golden glow', hi: 'उबटन एवं हल्दी-बेसन का प्राकृतिक निखार', gu: 'ઉબટન અને હળદર-ચણાનો કુદરતી નિખાર' } 
    },
    { 
      concern: 'heat_rash', 
      label: { en: 'Heat Rash & Redness', hi: 'घमौरियाँ एवं त्वचा जलन', gu: 'ગરમીની અળાઈ અને બળતરા' }, 
      desc: { en: 'Kesuda / Palash flower cooling therapy', hi: 'केसूड़ा / पलाश की शीतलता', gu: 'કેસૂડાં ફૂલની કુદરતી ઠંડક' } 
    },
    { 
      concern: 'dryness_flakiness', 
      label: { en: 'Dryness & Tightness', hi: 'रूखापन व नमी की कमी', gu: 'સૂકાપણું અને ખેંચાણ' }, 
      desc: { en: 'Kokum Butter & cold process glycerin', hi: 'कोकम बटर एवं प्राकृतिक ग्लिसरीन', gu: 'કોકમ બટર અને નેચરલ ગ્લિસરિન' } 
    },
    { 
      concern: 'dullness', 
      label: { en: 'Dull & Tired Complexion', hi: 'बेजान व थकी हुई त्वचा', gu: 'નિસ્તેજ ત્વચા' }, 
      desc: { en: 'Hibiscus plant AHA & Rice extract', hi: 'गुड़हल का फूल व चावल का अर्क', gu: 'જાસૂદ ફૂલ અને ચોખાનો અર્ક' } 
    },
    { 
      concern: 'excess_oil', 
      label: { en: 'Excess Sebum & Blackheads', hi: 'अत्यधिक तेल व ब्लैकहेड्स', gu: 'વધારે પડતું તેલ અને બ્લેકહેડ્સ' }, 
      desc: { en: 'Activated Bamboo Charcoal polish', hi: 'ऐक्टिवेटेड चारकोल द्वारा गहरी सफाई', gu: 'સક્રિય ચારકોલ દ્વારા ઊંડી સફાઈ' } 
    }
  ];

  const sensitivityOptions: { sensitivity: KnownSensitivity; label: { en: string; hi: string; gu: string } }[] = [
    { sensitivity: 'none', label: { en: 'No Known Allergies', hi: 'कोई ज्ञात एलर्जी नहीं', gu: 'કોઈ જાણીતી એલર્જી નથી' } },
    { sensitivity: 'essential_oils', label: { en: 'Sensitive to Strong Essential Oils', hi: 'तीव्र सुगंधित तेलों से संवेदनशीलता', gu: 'તીવ્ર સુગંધિત તેલથી એલર્જી' } },
    { sensitivity: 'nut_almond', label: { en: 'Nut / Almond Oil Sensitivity', hi: 'बादाम / नट तेल संवेदनशीलता', gu: 'બદામના તેલથી એલર્જી' } },
    { sensitivity: 'milk_dairy', label: { en: 'Milk / Dairy Sensitivity (Avoid Ubtan)', hi: 'दूध / डेयरी से संवेदनशीलता (उबटन न लें)', gu: 'દૂધ / ડેરી સંવેદનશીલતા (ઉબટન ટાળો)' } },
    { sensitivity: 'fragrance_scents', label: { en: 'Prefer Fragrance-Free (Pure Unscented)', hi: 'सुगंध-मुक्त प्राथमिकता', gu: 'સુગંધ-મુક્ત પસંદગી' } },
    { sensitivity: 'reactive_allergies', label: { en: 'Highly Reactive / Irritation-Prone', hi: 'अत्यधिक संवेदनशील / तुरंत लाल होने वाली त्वचा', gu: 'ખૂબ જ સંવેદનશીલ ત્વચા' } }
  ];

  const seasonOptions: { season: ClimateSeason; label: { en: string; hi: string; gu: string }; desc: { en: string; hi: string; gu: string }; icon: string }[] = [
    { 
      season: 'summer_heat', 
      label: { en: 'Summer Heat', hi: 'तीखी गर्मी', gu: 'તીવ્ર ઉનાળો' }, 
      desc: { en: 'Sweating & heat rashes', hi: 'पसीना व घमौरियाँ', gu: 'પરસેવો અને અળાઈ' }, 
      icon: '☀️' 
    },
    { 
      season: 'monsoon_humidity', 
      label: { en: 'Monsoon Humidity', hi: 'बरसात / उमस', gu: 'ચોમાસું / ભેજ' }, 
      desc: { en: 'Sticky climate & clogged pores', hi: 'चिपचिपापन व बंद रोमछिद्र', gu: 'ચીકાશ અને ભેજ' }, 
      icon: '🌧️' 
    },
    { 
      season: 'winter_dry', 
      label: { en: 'Winter Dryness', hi: 'सर्दियों का रूखापन', gu: 'શિયાળાની શુષ્કતા' }, 
      desc: { en: 'Cold winds & dry tight skin', hi: 'ठंडी हवा व खिंची त्वचा', gu: 'ઠંડી હવા અને ખેંચાણ' }, 
      icon: '❄️' 
    },
    { 
      season: 'moderate', 
      label: { en: 'Moderate Climate', hi: 'अनुकूल मौसम', gu: 'સામાન્ય વાતાવરણ' }, 
      desc: { en: 'Balanced pleasant climate', hi: 'संतुलित सुहावना मौसम', gu: 'સમશીતોષ્ણ વાતાવરણ' }, 
      icon: '🌤️' 
    }
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
      text: t.chat.welcome,
      timestamp: new Date(),
      recommendedProductIds: ['neem-tulsi-soap', 'kesuda-soap', 'ubtan-soap']
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Suggested prompt pills by language
  const suggestedQuestions = {
    en: [
      'Which soap is best for summer heat rash and itching?',
      'Why do cold-process soaps retain glycerin compared to commercial bars?',
      'What natural routine clears acne marks and dark spots?',
      'Is Kesuda (Palash) soap gentle enough for sensitive baby skin?',
      'What are the cold process benefits of Kokum Butter?'
    ],
    hi: [
      'गर्मी और घमौरियों के लिए कौन सा साबुन सबसे अच्छा है?',
      'कोल्ड प्रोसेस साबुन से ग्लिसरीन कैसे सुरक्षित रहता है?',
      'मुँहासों और दाग-धब्बों के लिए आयुर्वेदिक दिनचर्या क्या है?',
      'क्या केसूड़ा साबुन संवेदनशील त्वचा के लिए सुरक्षित है?',
      'कोकम बटर त्वचा को किस प्रकार पोषण देता है?'
    ],
    gu: [
      'ઉનાળામાં ગરમીની અળાઈ અને બળતરા માટે કયો સાબુ સારો?',
      'કોલ્ડ પ્રોસેસ સાબુમાં ગ્લિસરિન કેવી રીતે સચવાય છે?',
      'ખીલ અને કાળા ડાઘ માટે કુદરતી આયુર્વેદિક કેર જણાવો.',
      'શું કેસૂડાં સાબુ નાજુક ત્વચા માટે વાપરી શકાય?',
      'કોકમ બટર અને કુદરતી તેલના ફાયદા શું છે?'
    ]
  }[language];

  // Update initial welcome message when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: t.chat.welcome,
          timestamp: new Date(),
          recommendedProductIds: ['neem-tulsi-soap', 'kesuda-soap', 'ubtan-soap']
        }
      ]);
    }
  }, [language]);

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
      const response = await askLavanyaAI(userMsg.text, history, language);

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
        text: `⚠️ ${language === 'hi' ? 'त्रुटि' : language === 'gu' ? 'ભૂલ' : 'Notice'}: ${err.message || 'Please check your connection.'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleResetChat = () => {
    if (window.confirm(t.chat.resetConfirm)) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: t.chat.welcome,
          timestamp: new Date(),
          recommendedProductIds: ['neem-tulsi-soap', 'kesuda-soap', 'ubtan-soap']
        }
      ]);
    }
  };

  // ===============================
  // TAB 3: PRODUCT COMPARISON STATE
  // ===============================
  const [compareId1, setCompareId1] = useState<string>('kesuda-soap');
  const [compareId2, setCompareId2] = useState<string>('neem-tulsi-soap');
  const [compareAnalysis, setCompareAnalysis] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const product1 = VERIFIED_PRODUCTS.find(p => p.id === compareId1) || VERIFIED_PRODUCTS[0];
  const product2 = VERIFIED_PRODUCTS.find(p => p.id === compareId2) || VERIFIED_PRODUCTS[1];

  const handleRunComparison = async () => {
    if (compareId1 === compareId2) {
      setCompareAnalysis(language === 'hi' ? 'कृपया तुलना करने के लिए दो अलग-अलग उत्पाद चुनें।' : language === 'gu' ? 'કૃપા કરી સરખામણી કરવા માટે બે અલગ પ્રોડક્ટ પસંદ કરો.' : 'Please select two different products to compare.');
      return;
    }
    setIsComparing(true);
    setCompareAnalysis(null);
    try {
      const result = await compareProductsWithAI(compareId1, compareId2, language);
      setCompareAnalysis(result);
    } catch (err: any) {
      setCompareAnalysis('Failed to compare products.');
    } finally {
      setIsComparing(false);
    }
  };

  // ===============================
  // TAB 4: VISUAL SCANNER STATE
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
      const res = await analyzeSkinOrLabelImage(scannerImage, scannerContext.trim(), language);
      setScannerResult(res);
    } catch (err: any) {
      setScannerError(err.message || 'Failed to analyze image.');
    } finally {
      setIsScannerLoading(false);
    }
  };

  return (
    <div className="py-8 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full overflow-x-clip pb-24">
      <SEO
        title={`${t.aiAdvisorTitle} | ${t.brandName}`}
        description="Experience verified Ayurvedic skincare consultations, guided preference quizzes, and side-by-side product comparisons powered by Google Gemini and Lavanya Natural Care."
      />

      {/* Top Banner with Language Selector & Security Badge */}
      <div className="relative rounded-3xl bg-gradient-to-br from-botanical-950 via-botanical-900 to-botanical-950 text-cream-50 p-6 sm:p-10 shadow-xl border border-gold-500/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-botanical-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/30 text-gold-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>Google Gemini 4 Hydrogen AI</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cream-200 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>13 Verified Products Grounded</span>
              </div>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-cream-50 tracking-tight">
              {t.aiAdvisorTitle}
            </h1>

            <p className="text-cream-200 text-sm sm:text-base leading-relaxed">
              {t.aiAdvisorSubtitle}
            </p>
          </div>

          {/* Action Row: Language Toggle + Key Manager */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
            {/* Language Switcher */}
            <div className="inline-flex p-1 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
              {(['en', 'hi', 'gu'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    language === lang
                      ? 'bg-gold-500 text-botanical-950 shadow-sm'
                      : 'text-cream-200 hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'ગુજરાતી'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-cream-100 border border-white/20 text-xs font-semibold backdrop-blur-md transition-all shadow-sm"
              title="Configure Gemini API Key"
            >
              <Key className="w-4 h-4 text-gold-400" />
              <span>{hasKey ? 'Gemini: Active' : 'Demo Mode (Add Key)'}</span>
              <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Phase 4 Safety & Medical Disclaimer Alert */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-warmgray-900 flex items-start gap-3.5 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs leading-relaxed text-warmgray-800">
          <div className="font-bold text-botanical-950 uppercase tracking-wide text-[11px] flex items-center gap-2">
            <span>{t.safetyDisclaimerTitle}</span>
          </div>
          <p>{t.safetyDisclaimerText}</p>
          <p className="font-bold text-amber-900 pt-0.5">{t.patchTestReminder}</p>
        </div>
      </div>

      {/* Navigation Tabs (Quiz | Chat | Compare | Scanner) */}
      <div className="flex items-center justify-center border-b border-cream-200 pb-2">
        <div className="inline-flex p-1.5 rounded-2xl bg-cream-100 border border-cream-200 shadow-xs max-w-full overflow-x-auto">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'quiz'
                ? 'bg-botanical-800 text-white shadow-md'
                : 'text-warmgray-600 hover:text-botanical-950 hover:bg-cream-50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{t.tabs.quiz}</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-botanical-800 text-white shadow-md'
                : 'text-warmgray-600 hover:text-botanical-950 hover:bg-cream-50'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{t.tabs.chat}</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'compare'
                ? 'bg-botanical-800 text-white shadow-md'
                : 'text-warmgray-600 hover:text-botanical-950 hover:bg-cream-50'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{t.tabs.compare}</span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'scanner'
                ? 'bg-botanical-800 text-white shadow-md'
                : 'text-warmgray-600 hover:text-botanical-950 hover:bg-cream-50'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t.tabs.scanner}</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: GUIDED PREFERENCE QUIZ                             */}
      {/* ========================================================= */}
      {activeTab === 'quiz' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-cream-200 shadow-sm space-y-8">
            <div className="space-y-1 border-b border-cream-100 pb-4">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-botanical-950">
                {t.quiz.heading}
              </h2>
              <p className="text-xs sm:text-sm text-warmgray-600">
                {t.quiz.subheading}
              </p>
            </div>

            {/* Step 1: Skin Type */}
            <div className="space-y-3">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-botanical-950">
                {t.quiz.step1}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                      <div className="text-xs sm:text-sm font-bold text-botanical-950">{opt.label[language]}</div>
                      <div className="text-[11px] text-warmgray-500 leading-snug">{opt.desc[language]}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Primary Concern */}
            <div className="space-y-3 pt-4 border-t border-cream-100">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-botanical-950">
                {t.quiz.step2}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                    <div className="text-xs sm:text-sm font-bold text-botanical-950">{opt.label[language]}</div>
                    <div className="text-[11px] text-warmgray-500">{opt.desc[language]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Known Sensitivities / Allergies */}
            <div className="space-y-3 pt-4 border-t border-cream-100">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-botanical-950">
                {t.quiz.step3}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {sensitivityOptions.map((opt) => (
                  <button
                    key={opt.sensitivity}
                    type="button"
                    onClick={() => setQuizAnswers({ ...quizAnswers, knownSensitivity: opt.sensitivity })}
                    className={`text-left p-3 rounded-xl border transition-all text-xs font-semibold ${
                      quizAnswers.knownSensitivity === opt.sensitivity
                        ? 'border-botanical-800 bg-botanical-100 text-botanical-950 font-bold'
                        : 'border-cream-200 text-warmgray-700 hover:bg-cream-100'
                    }`}
                  >
                    {opt.label[language]}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Climate / Season */}
            <div className="space-y-3 pt-4 border-t border-cream-100">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-botanical-950">
                {t.quiz.step4}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {seasonOptions.map((opt) => (
                  <button
                    key={opt.season}
                    type="button"
                    onClick={() => setQuizAnswers({ ...quizAnswers, climateSeason: opt.season })}
                    className={`text-center p-3 rounded-2xl border-2 transition-all space-y-1 ${
                      quizAnswers.climateSeason === opt.season
                        ? 'border-botanical-800 bg-botanical-50/60 shadow-sm ring-1 ring-botanical-800/30'
                        : 'border-cream-200 hover:border-cream-300 bg-cream-50/30'
                    }`}
                  >
                    <div className="text-2xl">{opt.icon}</div>
                    <div className="text-xs font-bold text-botanical-950">{opt.label[language]}</div>
                    <div className="text-[10px] text-warmgray-500">{opt.desc[language]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-6 border-t border-cream-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-warmgray-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-botanical-700 shrink-0" />
                <span>100% natural, vegetarian & handcrafted in Vadodara, Gujarat.</span>
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
                    <span>{t.quiz.generatingBtn}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-gold-400" />
                    <span>{t.quiz.generateBtn}</span>
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
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-cream-200 shadow-md space-y-8 animate-fadeIn">
              <div className="border-b border-cream-200 pb-6 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-botanical-100 text-botanical-800 text-xs font-semibold uppercase tracking-wider">
                  <Flower2 className="w-3.5 h-3.5 text-botanical-700" />
                  <span>{t.quiz.resultHeading}</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-botanical-950">
                  {t.quiz.prakritiHeading}
                </h3>
                <p className="text-warmgray-700 text-sm sm:text-base leading-relaxed bg-cream-50 p-5 rounded-2xl border border-cream-100">
                  {quizResult.prakritiSkinAnalysis}
                </p>
              </div>

              {/* Cold Process Saponification Wisdom */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-botanical-900 to-botanical-950 text-cream-50 space-y-2">
                <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>{t.quiz.coldProcessAdvantage}</span>
                </div>
                <p className="text-xs sm:text-sm text-cream-100/90 leading-relaxed">
                  {quizResult.ayurvedicWisdom}
                </p>
              </div>

              {/* Routine Steps */}
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-botanical-950">
                  {t.quiz.routineHeading}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizResult.routine.map((step, idx) => (
                    <div 
                      key={idx}
                      className="p-5 rounded-2xl border border-cream-200 bg-cream-50/50 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gold-700 bg-gold-400/20 px-2.5 py-1 rounded-full inline-block">
                          Step {idx + 1}: {step.step}
                        </span>
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
                          <strong>Application:</strong> {step.howToUse}
                        </div>
                        {step.recommendedProductId && (
                          <Link
                            to={`/products/${step.recommendedProductId}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-botanical-800 hover:text-gold-700 pt-1"
                          >
                            <span>View Product Page</span>
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
                  <h3 className="font-serif text-2xl font-bold text-botanical-950">
                    Recommended Lavanya Products
                  </h3>
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

              {/* Patch Test Warning Callout */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{quizResult.patchTestWarning}</span>
              </div>

              {/* Order via WhatsApp */}
              <div className="pt-2 text-center">
                <a
                  href={`https://wa.me/919726739515?text=${encodeURIComponent(
                    `Hello Lavanya Natural Care! I took your Ayurvedic Skincare Quiz and would like to order my recommended routine: ${quizResult.routine.map(r => r.productName).join(', ')}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#25D366] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{t.quiz.orderWhatsApp}</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CONVERSATIONAL SKINCARE ASSISTANT                  */}
      {/* ========================================================= */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-cream-200 shadow-sm overflow-hidden flex flex-col h-[700px] animate-fadeIn">
          {/* Chat Window Header with Reset Button */}
          <div className="bg-cream-100/80 px-6 py-4 border-b border-cream-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-botanical-800 text-gold-400 flex items-center justify-center font-bold shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-botanical-950 leading-tight">
                  {t.aiAdvisorTitle}
                </h3>
                <span className="text-[11px] text-warmgray-500">
                  {hasKey ? 'Gemini 4 Hydrogen • Live' : 'Demo Mode (Add API Key for live AI)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetChat}
                className="px-3 py-1.5 rounded-xl border border-cream-300 text-xs font-semibold text-warmgray-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
                title={t.chat.reset}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.chat.reset}</span>
              </button>

              <button
                onClick={() => setIsKeyModalOpen(true)}
                className="p-1.5 rounded-xl border border-cream-300 text-warmgray-600 hover:text-botanical-900 transition-colors"
                title="Settings"
              >
                <Key className="w-3.5 h-3.5" />
              </button>
            </div>
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
                        {t.chat.matchingProducts}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.recommendedProductIds.map((pid) => {
                          const prod = VERIFIED_PRODUCTS.find(p => p.id === pid);
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
                  <span>{t.chat.thinking}</span>
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
              placeholder={t.chat.placeholder}
              className="flex-1 px-4 py-3 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-botanical-800/20 focus:border-botanical-800 text-xs sm:text-sm"
              disabled={isChatLoading}
            />

            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="p-3 rounded-xl bg-botanical-800 text-white hover:bg-botanical-900 transition-colors disabled:opacity-40"
              aria-label={t.chat.send}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PRODUCT COMPARISON (SIDE-BY-SIDE)                 */}
      {/* ========================================================= */}
      {activeTab === 'compare' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-cream-200 shadow-sm space-y-8 animate-fadeIn">
          <div className="space-y-1 border-b border-cream-100 pb-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-botanical-950">
              {t.compare.heading}
            </h2>
            <p className="text-xs sm:text-sm text-warmgray-600">
              {t.compare.subheading}
            </p>
          </div>

          {/* Selectors for 2 Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-botanical-950">
                {t.compare.selectProduct1}
              </label>
              <select
                value={compareId1}
                onChange={(e) => setCompareId1(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50/50 text-xs sm:text-sm font-semibold focus:outline-none focus:border-botanical-800"
              >
                {VERIFIED_PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.mrp} - {p.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-botanical-950">
                {t.compare.selectProduct2}
              </label>
              <select
                value={compareId2}
                onChange={(e) => setCompareId2(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50/50 text-xs sm:text-sm font-semibold focus:outline-none focus:border-botanical-800"
              >
                {VERIFIED_PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.mrp} - {p.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleRunComparison}
              disabled={isComparing}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-botanical-800 text-white font-bold text-xs sm:text-sm hover:bg-botanical-900 transition-all shadow-md disabled:opacity-40"
            >
              {isComparing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-gold-400" />
                  <span>Comparing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4 text-gold-400" />
                  <span>Compare Both Products with AI</span>
                </>
              )}
            </button>
          </div>

          {/* Side-by-Side Comparison Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-cream-100">
            {/* Product 1 Card */}
            <div className="p-6 rounded-2xl border border-cream-200 bg-cream-50/40 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-44 bg-white rounded-xl p-3 flex items-center justify-center border border-cream-200">
                  <img src={product1.image} alt={product1.name} className="h-full object-contain" />
                </div>
                <span className="text-[10px] uppercase font-bold text-warmgray-500 tracking-wider">
                  {product1.category}
                </span>
                <h4 className="font-serif text-2xl font-bold text-botanical-950">
                  {product1.name}
                </h4>
                <div className="flex items-center justify-between text-xs py-2 border-y border-cream-200">
                  <span className="text-warmgray-600 font-medium">{product1.netWeightOrVol}</span>
                  <span className="font-serif text-2xl font-bold text-botanical-950">₹{product1.mrp}</span>
                </div>
                <div className="space-y-1.5 text-xs text-warmgray-700">
                  <strong className="block text-botanical-950">{t.compare.fullIngredients}:</strong>
                  <p className="p-2.5 bg-white rounded-xl border border-cream-100 font-mono text-[11px]">
                    {product1.ingredients}
                  </p>
                </div>
                <div className="space-y-1.5 text-xs text-warmgray-700">
                  <strong className="block text-botanical-950">{t.compare.primaryBenefits}:</strong>
                  <ul className="space-y-1 list-disc list-inside">
                    {product1.benefits.slice(0, 3).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-cream-200 flex items-center gap-2">
                <Link
                  to={`/products/${product1.id}`}
                  className="flex-1 py-2.5 text-center rounded-xl border border-botanical-800 text-botanical-900 text-xs font-semibold hover:bg-cream-100 transition-colors"
                >
                  View Details
                </Link>
                <WhatsAppButton
                  productName={product1.name}
                  mrp={product1.mrp}
                  label={t.compare.orderThisOnWhatsApp}
                  className="py-2.5 text-xs font-bold"
                />
              </div>
            </div>

            {/* Product 2 Card */}
            <div className="p-6 rounded-2xl border border-cream-200 bg-cream-50/40 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-44 bg-white rounded-xl p-3 flex items-center justify-center border border-cream-200">
                  <img src={product2.image} alt={product2.name} className="h-full object-contain" />
                </div>
                <span className="text-[10px] uppercase font-bold text-warmgray-500 tracking-wider">
                  {product2.category}
                </span>
                <h4 className="font-serif text-2xl font-bold text-botanical-950">
                  {product2.name}
                </h4>
                <div className="flex items-center justify-between text-xs py-2 border-y border-cream-200">
                  <span className="text-warmgray-600 font-medium">{product2.netWeightOrVol}</span>
                  <span className="font-serif text-2xl font-bold text-botanical-950">₹{product2.mrp}</span>
                </div>
                <div className="space-y-1.5 text-xs text-warmgray-700">
                  <strong className="block text-botanical-950">{t.compare.fullIngredients}:</strong>
                  <p className="p-2.5 bg-white rounded-xl border border-cream-100 font-mono text-[11px]">
                    {product2.ingredients}
                  </p>
                </div>
                <div className="space-y-1.5 text-xs text-warmgray-700">
                  <strong className="block text-botanical-950">{t.compare.primaryBenefits}:</strong>
                  <ul className="space-y-1 list-disc list-inside">
                    {product2.benefits.slice(0, 3).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-cream-200 flex items-center gap-2">
                <Link
                  to={`/products/${product2.id}`}
                  className="flex-1 py-2.5 text-center rounded-xl border border-botanical-800 text-botanical-900 text-xs font-semibold hover:bg-cream-100 transition-colors"
                >
                  View Details
                </Link>
                <WhatsAppButton
                  productName={product2.name}
                  mrp={product2.mrp}
                  label={t.compare.orderThisOnWhatsApp}
                  className="py-2.5 text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* AI Comparison Synthesis */}
          {compareAnalysis && (
            <div className="p-6 rounded-2xl bg-cream-100 border border-cream-300 space-y-2 animate-fadeIn">
              <h4 className="font-serif text-xl font-bold text-botanical-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-600" />
                <span>Gemini Botanical Comparison Verdict</span>
              </h4>
              <div className="text-xs sm:text-sm text-warmgray-800 leading-relaxed whitespace-pre-wrap">
                {compareAnalysis}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: MULTIMODAL VISUAL SCANNER                          */}
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
                      const prod = VERIFIED_PRODUCTS.find(p => p.id === pid);
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

      {/* Phase 5: Privacy Controls Footer Banner */}
      <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-warmgray-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-botanical-800 shrink-0" />
          <span className="font-bold text-botanical-950">{t.privacy.badge}:</span>
          <span>{t.privacy.text}</span>
        </div>
        <span className="text-[11px] text-warmgray-500 font-mono">Vadodara, Gujarat • Artisanal Cold Process</span>
      </div>

      {/* Floating Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={() => setHasKey(hasGeminiApiKey())}
      />
    </div>
  );
};

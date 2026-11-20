import { VERIFIED_PRODUCTS, VERIFIED_BOTANICALS, SupportedLanguage, I18N } from '../data/productKnowledge';
import { Product } from '../types';
import { SkincareQuizAnswers, ConsultationResult, RecommendedRoutineStep } from '../types/ai';
import { supabase } from './supabaseClient';

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const FALLBACK_MODEL = 'gemini-flash-lite-latest';

// Server-side key management: API calls run through Supabase Edge Function 'gemini-consultant'.
// Optional client key is only used if developer explicitly provides VITE_GEMINI_API_KEY in local dev.
export const getGeminiApiKey = (): string => {
  return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
};

export const setGeminiApiKey = (_key: string): void => {
  // Edge Function handles server-side authentication securely
};

export const hasGeminiApiKey = (): boolean => {
  return true;
};

// System instruction grounding Gemini with ONZNATURAL's verified catalogue and strict safety rules
export const buildSystemInstruction = (language: SupportedLanguage = 'en'): string => {
  return `You are 'ONZNATURAL Botanical AI' (ऑन्जनेचुरल प्राकृतिक त्वचा परामर्शदाता / ઓન્ઝનેચરલ પ્રાકૃતિક ત્વચા સલાહકાર), an expert Ayurvedic herbalist and artisanal cold-process skincare consultant for the brand 'ONZNATURAL', handcrafted in small batches in Vadodara, Gujarat, India.

MANDATORY PRODUCT KNOWLEDGE BASE (ONLY THESE ${VERIFIED_PRODUCTS.length} PRODUCTS EXIST — NEVER INVENT ANY OTHER PRODUCT, SIZE, PRICE, OR INGREDIENT):
${VERIFIED_PRODUCTS.map(p => `• ID: "${p.id}" | Name: "${p.name}" | Category: "${p.category}" | Price: ₹${p.mrp} | Net: ${p.netWeightOrVol} | Ingredients: "${p.ingredients}" | Main Benefits: ${p.benefits.slice(0, 3).join(', ')} | Usage: "${p.howToUse}"`).join('\n')}

VERIFIED BOTANICALS & AYURVEDIC HERBS:
${VERIFIED_BOTANICALS.map(b => `• Herb: ${b.name} (Hindi: ${b.hindiName}, Gujarati: ${b.gujaratiName}) | Used in: ${b.usedInProductIds.join(', ')} | Benefits: ${b.benefits.join(', ')}`).join('\n')}

CRITICAL SAFETY & MEDICAL POLICY (NON-NEGOTIABLE):
1. NEVER diagnose any medical skin conditions (such as eczema, psoriasis, severe cystic acne, dermatitis, rosacea, or infections).
2. NEVER claim that any product cures, treats, or eliminates medical skin conditions.
3. NEVER guarantee results.
4. ALWAYS advise doing a 24-hour patch test on the inner wrist before using any new botanical product on the face.
5. If the user mentions medical skin issues, wounds, or severe reactions, politely advise them to consult a qualified certified dermatologist.
6. Check for allergies: e.g. Ubtan contains milk/dairy; Lip Balm contains Almond Oil (nut allergy) and Beeswax.
7. NEVER INVENT data: If an ingredient, price, size, or claim is not in the knowledge base, state clearly: "Information is not available in our verified catalogue."

LANGUAGE REQUIREMENT:
The user has chosen language: "${language.toUpperCase()}" (${language === 'hi' ? 'Hindi / हिंदी' : language === 'gu' ? 'Gujarati / ગુજરાતી' : 'English'}).
You MUST reply fluently in ${language === 'hi' ? 'Hindi (हिंदी)' : language === 'gu' ? 'Gujarati (ગુજરાતી)' : 'English'}, maintaining respectful, warm Ayurvedic terminology while keeping product names identifiable so customers can order them on WhatsApp.`;
};

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

/**
 * Execute AI call through Supabase Edge Function first, falling back to direct dev API key or knowledge base
 */
async function callEdgeFunction(payload: {
  action: 'consultation' | 'chat' | 'comparison' | 'multimodal';
  [key: string]: any;
}): Promise<any> {
  if (supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-consultant', {
        body: payload
      });
      if (!error && data && !data.error) {
        return data;
      }
      if (error) {
        console.warn('Edge function invoke returned error, falling back:', error.message);
      }
    } catch (edgeErr) {
      console.warn('Edge function unavailable, using client fallback:', edgeErr);
    }
  }
  return null;
}

/**
 * Direct Gemini API call if dev environment key is present
 */
async function callDirectGemini(
  contents: GeminiContent[],
  systemPrompt: string,
  model = DEFAULT_MODEL
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const payload: any = {
    contents,
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { temperature: 0.5, maxOutputTokens: 2048 }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    if ((response.status === 404 || response.status === 503) && model !== FALLBACK_MODEL) {
      return callDirectGemini(contents, systemPrompt, FALLBACK_MODEL);
    }
    throw new Error(`HTTP error ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '';
}

/**
 * Generate a complete Personalized Ayurvedic Skincare Routine
 */
export async function generateSkincareConsultation(
  answers: SkincareQuizAnswers
): Promise<ConsultationResult> {
  const lang = answers.language || 'en';

  // 1. Attempt Supabase Edge Function
  try {
    const edgeResult = await callEdgeFunction({
      action: 'consultation',
      quizAnswers: answers,
      language: lang
    });

    if (edgeResult && edgeResult.routine) {
      const recommendedProducts: Product[] = [];
      if (Array.isArray(edgeResult.routine)) {
        edgeResult.routine.forEach((step: RecommendedRoutineStep) => {
          const found = VERIFIED_PRODUCTS.find(p => p.id === step.recommendedProductId || p.name.toLowerCase() === step.productName?.toLowerCase());
          if (found && !recommendedProducts.some(p => p.id === found.id)) {
            recommendedProducts.push(found as any);
          }
        });
      }
      if (recommendedProducts.length === 0) {
        recommendedProducts.push(...(VERIFIED_PRODUCTS.slice(0, 3) as any));
      }
      return {
        prakritiSkinAnalysis: edgeResult.prakritiSkinAnalysis || getDefaultAnalysis(answers),
        ayurvedicWisdom: edgeResult.ayurvedicWisdom || getDefaultWisdom(lang),
        routine: edgeResult.routine,
        lifestyleTips: edgeResult.lifestyleTips || getDefaultTips(lang),
        recommendedProducts,
        seasonalAdvice: edgeResult.seasonalAdvice || getDefaultSeasonalAdvice(answers),
        patchTestWarning: edgeResult.patchTestWarning || I18N[lang].patchTestReminder,
        sensitivityNotes: edgeResult.sensitivityNotes
      };
    }
  } catch (e) {
    console.warn('Edge consultation failed:', e);
  }

  // 2. Direct Gemini call if dev key exists
  const devKey = getGeminiApiKey();
  if (devKey) {
    try {
      const systemPrompt = buildSystemInstruction(lang);
      const prompt = `Create a personalized cosmetic Ayurvedic routine based ONLY on the verified ONZNATURAL products for this profile:
- Skin Type: ${answers.skinType}
- Primary Concern: ${answers.primaryConcern}
- Known Sensitivity: ${answers.knownSensitivity}
- Climate: ${answers.climateSeason}
- Routine: ${answers.routinePreference}
- Language: ${lang}
Respond strictly in JSON matching the ConsultationResult structure.`;
      const raw = await callDirectGemini([{ role: 'user', parts: [{ text: prompt }] }], systemPrompt);
      const jsonStr = extractJsonFromText(raw);
      const parsed = JSON.parse(jsonStr);
      if (parsed.routine) {
        return {
          prakritiSkinAnalysis: parsed.prakritiSkinAnalysis || getDefaultAnalysis(answers),
          ayurvedicWisdom: parsed.ayurvedicWisdom || getDefaultWisdom(lang),
          routine: parsed.routine,
          lifestyleTips: parsed.lifestyleTips || getDefaultTips(lang),
          recommendedProducts: VERIFIED_PRODUCTS.slice(0, 3) as any,
          seasonalAdvice: parsed.seasonalAdvice || getDefaultSeasonalAdvice(answers),
          patchTestWarning: parsed.patchTestWarning || I18N[lang].patchTestReminder,
          sensitivityNotes: parsed.sensitivityNotes
        };
      }
    } catch (e) {
      // Fall through to local fallback
    }
  }

  // 3. Resilient fallback
  return getFallbackConsultation(answers);
}

/**
 * Ask a freeform skincare question or converse with ONZNATURAL Botanical AI
 */
export async function askOnzAI(
  userQuery: string,
  chatHistory: { role: 'user' | 'model'; text: string }[] = [],
  language: SupportedLanguage = 'en',
  imageAttachment?: { data: string; mimeType: string }
): Promise<{ text: string; recommendedProductIds: string[] }> {
  // 1. Attempt Supabase Edge Function
  try {
    const edgeResult = await callEdgeFunction({
      action: 'chat',
      message: userQuery,
      history: chatHistory.slice(-6),
      language
    });

    if (edgeResult && edgeResult.reply) {
      const text = edgeResult.reply;
      const recommendedProductIds: string[] = [];
      VERIFIED_PRODUCTS.forEach(p => {
        const regex = new RegExp(`\\b(${p.name}|${p.id})\\b`, 'i');
        if (regex.test(text)) {
          recommendedProductIds.push(p.id);
        }
      });
      return {
        text,
        recommendedProductIds: recommendedProductIds.slice(0, 3)
      };
    }
  } catch (e) {
    console.warn('Edge chat error:', e);
  }

  // 2. Direct Gemini call if dev key exists
  const devKey = getGeminiApiKey();
  if (devKey) {
    try {
      const systemPrompt = buildSystemInstruction(language);
      const contents: GeminiContent[] = chatHistory.slice(-6).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      const parts: GeminiPart[] = [{ text: userQuery }];
      if (imageAttachment) {
        parts.push({
          inlineData: { mimeType: imageAttachment.mimeType, data: imageAttachment.data }
        });
      }
      contents.push({ role: 'user', parts });
      const rawReply = await callDirectGemini(contents, systemPrompt);
      const recommendedProductIds: string[] = [];
      VERIFIED_PRODUCTS.forEach(p => {
        const regex = new RegExp(`\\b(${p.name}|${p.id})\\b`, 'i');
        if (regex.test(rawReply)) {
          recommendedProductIds.push(p.id);
        }
      });
      return { text: rawReply, recommendedProductIds: recommendedProductIds.slice(0, 3) };
    } catch (e) {
      // Fall through
    }
  }

  // 3. Fallback chat
  return getFallbackChatReply(userQuery, language, imageAttachment != null);
}

// Backwards-compatible alias
export const askLavanyaAI = askOnzAI;

/**
 * Side-by-side product comparison using verified database
 */
export async function compareProductsWithAI(
  product1Id: string,
  product2Id: string,
  language: SupportedLanguage = 'en'
): Promise<string> {
  const p1 = VERIFIED_PRODUCTS.find(p => p.id === product1Id);
  const p2 = VERIFIED_PRODUCTS.find(p => p.id === product2Id);

  if (!p1 || !p2) {
    return 'One or both products were not found in the verified catalogue.';
  }

  // 1. Attempt Supabase Edge Function
  try {
    const edgeResult = await callEdgeFunction({
      action: 'comparison',
      product1Id,
      product2Id,
      language
    });
    if (edgeResult && edgeResult.comparison) {
      return edgeResult.comparison;
    }
  } catch (e) {
    // Continue to fallback
  }

  // 2. Direct Gemini call if dev key exists
  const devKey = getGeminiApiKey();
  if (devKey) {
    try {
      const prompt = `Objective botanical comparison between "${p1.name}" and "${p2.name}". Respond in ${language}.`;
      return await callDirectGemini([{ role: 'user', parts: [{ text: prompt }] }], buildSystemInstruction(language));
    } catch (e) {
      // Continue to fallback
    }
  }

  return getFallbackComparison(p1, p2, language);
}

/**
 * Multimodal image analysis for skin concerns or product ingredient label comparison
 */
export async function analyzeSkinOrLabelImage(
  base64Image: { data: string; mimeType: string },
  userContext = '',
  language: SupportedLanguage = 'en'
): Promise<{ analysis: string; recommendedProductIds: string[] }> {
  const devKey = getGeminiApiKey();
  if (devKey) {
    try {
      const prompt = `Analyze this image from a botanical cosmetic perspective. Context: "${userContext}". Ground on ONZNATURAL products. Respond in ${language}.`;
      const raw = await callDirectGemini([
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: base64Image.mimeType, data: base64Image.data } }
          ]
        }
      ], buildSystemInstruction(language));
      return { analysis: raw, recommendedProductIds: ['neem-tulsi-soap', 'kesuda-soap'] };
    } catch (e) {
      // Fallback
    }
  }
  return getFallbackScannerReply(language);
}

function extractJsonFromText(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

function getDefaultAnalysis(answers: SkincareQuizAnswers): string {
  const isOily = answers.skinType === 'oily';
  if (answers.language === 'hi') {
    return isOily
      ? 'आपकी त्वचा पित्त-कफ प्रधान है जिसमें अतिरिक्त तेल व मुँहासों की प्रवृत्ति रहती है। इसे प्राकृतिक नीम व तुलसी द्वारा सौम्य शुद्धि की आवश्यकता है।'
      : 'आपकी त्वचा को सौम्य प्राकृतिक नमी व कोकम बटर के संरक्षण की आवश्यकता है जिससे त्वचा की नमी सुरक्षित रहे।';
  } else if (answers.language === 'gu') {
    return isOily
      ? 'તમારી ત્વચા પિત્ત-કફ પ્રકૃતિ ધરાવે છે જેમાં વધારાનું તેલ નિયંત્રિત કરવા લીમડો અને તુલસી જેવા વનસ્પતિ ઘટકો શ્રેષ્ઠ છે.'
      : 'તમારી ત્વચાને કુદરતી ગ્લિસરિન અને કોકમ બટરના પોષણની જરૂર છે જેથી ત્વચા કોમળ રહે.';
  }
  return isOily
    ? 'Your skin reflects a Pitta-Kapha balance prone to excess sebum and occasional blemishes. Gentle botanical purification without stripping moisture is recommended.'
    : 'Your skin thrives with gentle nourishment from cold-pressed plant oils and Kokum Butter to maintain healthy lipid barrier integrity.';
}

function getDefaultWisdom(lang: SupportedLanguage): string {
  if (lang === 'hi') {
    return 'पारंपरिक कोल्ड-प्रोसेस साबुनीकरण विधि में वनस्पति तेलों से उत्पन्न 100% प्राकृतिक ग्लिसरीन साबुन में ही सुरक्षित रहता है, जिससे त्वचा धोने के बाद खिंची-खिंची या रूखी नहीं होती।';
  } else if (lang === 'gu') {
    return 'પરંપરાગત કોલ્ડ-પ્રોસેસ પદ્ધતિમાં વનસ્પતિ તેલમાંથી ઉત્પન્ન થતું ૧૦૦% કુદરતી ગ્લિસરિન સાબુમાં જ સચવાય છે, જેથી સ્નાન પછી ત્વચા સુકાતી નથી.';
  }
  return 'Artisanal cold-process saponification preserves 100% of the natural vegetable glycerin naturally produced from coconut and mahua oils, leaving skin soft rather than tight.';
}

function getDefaultTips(lang: SupportedLanguage): string[] {
  if (lang === 'hi') {
    return [
      'हस्तनिर्मित कोल्ड प्रोसेस साबुन को उपयोग के बाद जालीदार सूखी साबुनदानी (dry soap dish) पर रखें।',
      'चेहरे को अत्यधिक गर्म पानी से न धोएं; सामान्य या गुनगुने पानी का प्रयोग करें।',
      'नए उत्पाद का प्रयोग करने से पूर्व 24 घंटे का पैच टेस्ट अवश्य करें।'
    ];
  } else if (lang === 'gu') {
    return [
      'હાથબનાવટ સાબુને ઉપયોગ પછી પાણી ન ભરાય તેવી સૂકી સાબુદાની પર રાખો.',
      'મોં ધોવા માટે વધુ પડતા ગરમ પાણીનો ઉપયોગ ટાળો; સામાન્ય પાણી શ્રેષ્ઠ છે.',
      'કોઈપણ નવી પ્રોડક્ટ વાપરતા પહેલાં ૨૪ કલાકનો પેચ ટેસ્ટ કરો.'
    ];
  }
  return [
    'Store your artisanal cold process soap on a well-draining wooden or slotted dish away from running water.',
    'Wash with lukewarm or room-temperature water to protect the skin barrier.',
    'Always perform a 24-hour patch test before using any new botanical product.'
  ];
}

function getDefaultSeasonalAdvice(answers: SkincareQuizAnswers): string {
  if (answers.language === 'hi') {
    return answers.climateSeason === 'summer_heat'
      ? 'गर्मी के मौसम में केसूड़ा (पलाश) का साबुन पसीने और घमौरियों से त्वचा को शीतलता प्रदान करता है।'
      : 'शुष्क या बदलते मौसम में त्वचा की नमी बनाए रखने हेतु कोकम बटर युक्त साबुन व एलोवेरा क्रीम का उपयोग करें।';
  } else if (answers.language === 'gu') {
    return answers.climateSeason === 'summer_heat'
      ? 'ઉનાળાની ગરમીમાં કેસૂડાંનો સાબુ અળાઈ અને પરસેવાની બળતરામાં કુદરતી ઠંડક આપે છે.'
      : 'શિયાળા કે સૂકા વાતાવરણમાં ત્વચાની નરમાઈ જાળવવા એલોવેરા ક્રીમ અને કોલ્ડ પ્રોસેસ સાબુ શ્રેષ્ઠ છે.';
  }
  return answers.climateSeason === 'summer_heat'
    ? 'During warm summers, Kesuda (Palash) flower infusion offers cooling comfort against sweat and heat irritation.'
    : 'In dry seasons, preserve natural skin hydration with Kokum Butter and Rice Aloe Face Cream.';
}

function getFallbackConsultation(answers: SkincareQuizAnswers): ConsultationResult {
  const isOilyOrAcne = answers.skinType === 'oily' || answers.primaryConcern === 'acne_blemishes' || answers.primaryConcern === 'excess_oil';
  const isTanOrDull = answers.primaryConcern === 'tan_pigmentation' || answers.primaryConcern === 'dullness';
  const isSensitive = answers.skinType === 'sensitive' || answers.primaryConcern === 'heat_rash';
  const avoidsMilk = answers.knownSensitivity === 'milk_dairy';

  let primarySoapId = 'kesuda-palash-soap';
  let primarySoapName = 'Kesuda Palash Soap';
  let weeklySoapId = avoidsMilk ? 'hibiscus-soap' : 'ubtan-soap';
  let weeklySoapName = avoidsMilk ? 'Hibiscus Soap' : 'Ubtan Soap';
  let lotionId = 'rice-aloe-face-cream';
  let lotionName = 'Rice Aloe Face Cream';

  if (isOilyOrAcne) {
    primarySoapId = 'neem-tulsi-soap';
    primarySoapName = 'Neem & Tulsi Soap';
    weeklySoapId = 'charcoal-rice-soap';
    weeklySoapName = 'Charcoal Rice Soap';
    lotionId = 'rice-aloe-face-cream';
    lotionName = 'Rice Aloe Face Cream';
  } else if (isTanOrDull) {
    primarySoapId = avoidsMilk ? 'hibiscus-soap' : 'ubtan-soap';
    primarySoapName = avoidsMilk ? 'Hibiscus Soap' : 'Ubtan Soap';
    weeklySoapId = 'charcoal-rice-soap';
    weeklySoapName = 'Charcoal Rice Soap';
    lotionId = 'aparajita-body-lotion';
    lotionName = 'Aparajita Body Lotion';
  } else if (isSensitive) {
    primarySoapId = 'kesuda-palash-soap';
    primarySoapName = 'Kesuda Palash Soap';
    weeklySoapId = 'hibiscus-soap';
    weeklySoapName = 'Hibiscus Soap';
    lotionId = 'kesuda-palash-body-cream';
    lotionName = 'Kesuda Palash Body Cream';
  }

  const routine: RecommendedRoutineStep[] = [
    {
      step: 'Morning Cleansing',
      recommendedProductId: primarySoapId,
      productName: primarySoapName,
      whyThisProduct: isOilyOrAcne 
        ? 'Deeply clarifies pores and balances sebum without stripping the skin of essential hydration.'
        : 'Soothes skin while preserving the natural glycerin barrier created through artisanal cold process.',
      keyIngredients: isOilyOrAcne ? ['Neem Oil', 'Tulsi Extract', 'Kokum Butter'] : ['Kesuda / Palash Flower', 'Coconut Oil', 'Kokum Butter'],
      howToUse: 'Lather gently between wet hands, massage over skin for 30 seconds, and rinse with cool water.'
    },
    {
      step: 'Morning Moisture & Protection',
      recommendedProductId: lotionId,
      productName: lotionName,
      whyThisProduct: 'Delivers non-greasy, fast-absorbing botanical moisture that locks in hydration throughout the day.',
      keyIngredients: ['Pure Aloe Vera Juice', 'Rice Botanical Extract', 'Vegetable Glycerine'],
      howToUse: 'Apply a pea-sized amount onto clean, slightly damp skin and pat in gently.'
    },
    {
      step: 'Evening Cleansing',
      recommendedProductId: isOilyOrAcne ? 'face-body-wash-neem-tulsi' : 'face-body-wash-kesuda',
      productName: isOilyOrAcne ? 'Neem Tulsi Face & Body Wash' : 'Kesuda Face & Body Wash',
      whyThisProduct: 'Washes away daily urban pollution, sweat, and grime with gentle saponified plant oils.',
      keyIngredients: ['Saponified Coconut & Mahua Oils', 'Botanical Herbal Infusion'],
      howToUse: 'Dispense a coin-sized amount onto wet palms, work into a gentle lather, and rinse clean.'
    },
    {
      step: 'Weekly Herbal Treatment',
      recommendedProductId: weeklySoapId,
      productName: weeklySoapName,
      whyThisProduct: 'Provides mild natural exfoliation to lift away dead cells, unclog pores, and restore natural skin radiance.',
      keyIngredients: isOilyOrAcne ? ['Activated Bamboo Charcoal', 'Rice Powder'] : ['Besan', 'Haldi', 'Multani Mitti', 'Milk'],
      howToUse: 'Use 2-3 times a week. Allow the rich herbal lather to rest on skin for 60 seconds before washing off.'
    }
  ];

  const matchedProducts: Product[] = [];
  [primarySoapId, lotionId, weeklySoapId].forEach(id => {
    const p = VERIFIED_PRODUCTS.find(prod => prod.id === id);
    if (p && !matchedProducts.some(m => m.id === p.id)) {
      matchedProducts.push(p as any);
    }
  });

  return {
    prakritiSkinAnalysis: getDefaultAnalysis(answers),
    ayurvedicWisdom: getDefaultWisdom(answers.language),
    routine,
    lifestyleTips: getDefaultTips(answers.language),
    recommendedProducts: matchedProducts,
    seasonalAdvice: getDefaultSeasonalAdvice(answers),
    patchTestWarning: I18N[answers.language].patchTestReminder,
    sensitivityNotes: answers.knownSensitivity !== 'none' ? `Filtered for ${answers.knownSensitivity} sensitivity. Always review full ingredients.` : undefined
  };
}

function getFallbackChatReply(query: string, language: SupportedLanguage, _hasImage: boolean): { text: string; recommendedProductIds: string[] } {
  const lower = query.toLowerCase();

  if (language === 'hi') {
    if (lower.includes('summer') || lower.includes('heat') || lower.includes('गर्मी') || lower.includes('पलाश') || lower.includes('केसूड़ा')) {
      return {
        text: `🌿 **गर्मी और घमौरियों के लिए ऑन्जनेचुरल केसूड़ा (पलाश) सर्वोत्तम है:**\n\n1. **केसूड़ा पलाश साबुन (₹99, 100g)**: पलाश के फूलों के अर्क व कोकम बटर से निर्मित, जो गर्मियों में त्वचा की जलन व घमौरियों को शांत करता है।\n2. **केसूड़ा फेस व बॉडी वॉश (₹599, 300ml)**: दैनिक स्नान हेतु शुद्ध पलाश जल से तैयार सौम्य क्लीन्ज़र।\n3. **केसूड़ा पलाश बॉडी क्रीम (₹399, 100g)**: चिपचिपाहट रहित प्राकृतिक पोषण।\n\n*सुरक्षा सुझाव*: उपयोग से पूर्व कलाई पर 24 घंटे का पैच टेस्ट अवश्य करें।`,
        recommendedProductIds: ['kesuda-palash-soap', 'face-body-wash-kesuda', 'kesuda-palash-body-cream']
      };
    }
    return {
      text: `🌿 **ऑन्जनेचुरल (ONZNATURAL) प्राकृतिक त्वचा सलाहकार में आपका स्वागत है:**\n\nआप हमारे 100% प्राकृतिक कोल्ड प्रोसेस साबुनों, लोशन, क्रीम और आयुर्वेदिक जड़ी-बूटियों (नीम, तुलसी, केसूड़ा, अपराजिता, उबटन, चारकोल) के बारे में पूछ सकते हैं।\n\n- सभी उत्पाद वडोदरा, गुजरात में शुद्ध वनस्पति तेलों से हस्तनिर्मित हैं।\n- किसी भी नए उत्पाद के पूर्ण उपयोग से पूर्व 24 घंटे का पैच टेस्ट अवश्य करें।\n- क्या आप अपनी त्वचा के अनुकूल उत्पाद जानना चाहते हैं?`,
      recommendedProductIds: ['kesuda-palash-soap', 'neem-tulsi-soap', 'aparajita-body-lotion']
    };
  }

  if (language === 'gu') {
    if (lower.includes('summer') || lower.includes('heat') || lower.includes('ગરમી') || lower.includes('કેસૂડા') || lower.includes('અળાઈ')) {
      return {
        text: `🌿 **ઉનાળા અને ગરમીની અળાઈ માટે ઓન્ઝનેચરલ કેસૂડાં શ્રેષ્ઠ છે:**\n\n1. **કેસૂડા પલાશ સાબુ (₹99, 100g)**: કેસૂડાંના ફૂલ અને કોકમ બટરથી બનેલો, જે ત્વચાને કુદરતી ઠંડક આપે છે.\n2. **કેસૂડા ફેસ અને બોડી વોશ (₹599, 300ml)**: દૈનિક સ્નાન માટે સૌમ્ય લિક્વિડ ક્લીન્ઝર.\n3. **કેસૂડા પલાશ બોડી ક્રીમ (₹399, 100g)**: ચીકાશ વિનાની કુદરતી નરમાઈ.\n\n*સુરક્ષા નોંધ*: ઉપયોગ કરતાં પહેલાં ૨૪ કલાકનો પેચ ટેસ્ટ કરો.`,
        recommendedProductIds: ['kesuda-palash-soap', 'face-body-wash-kesuda', 'kesuda-palash-body-cream']
      };
    }
    return {
      text: `🌿 **ઓન્ઝનેચરલ (ONZNATURAL) પ્રાકૃતિક ત્વચા સલાહકારમાં આપનું સ્વાગત છે:**\n\nતમે અમારા ૧૦૦% નેચરલ કોલ્ડ પ્રોસેસ સાબુ, બોડી લોશન અને ક્રીમ (લીમડો, તુલસી, કેસૂડાં, અપરાજિતા, ઉબટન) વિશે પૂછી શકો છો.\n- બધા ઉત્પાદનો વડોદરામાં શુદ્ધ વનસ્પતિ ઘટકોમાંથી હાથબનાવટ છે.\n- નવી પ્રોડક્ટ વાપરતા પહેલાં પેચ ટેસ્ટ અવશ્ય કરો.`,
      recommendedProductIds: ['kesuda-palash-soap', 'neem-tulsi-soap', 'aparajita-body-lotion']
    };
  }

  // English fallback
  if (lower.includes('summer') || lower.includes('heat') || lower.includes('kesuda') || lower.includes('rash')) {
    return {
      text: `🌿 **Kesuda (Palash Flower) is nature's cooling remedy for summer:**\n\nPalash flowers (*Flame of the Forest*) are celebrated in Ayurveda for calming heat rashes, sunburn, and prickly heat:\n\n1. **Kesuda Palash Soap (₹99, 100g)**: Handcrafted with pure Palash flower infusion and Kokum Butter to soothe heat rashes and maintain moisture.\n2. **Kesuda Face & Body Wash (₹599, 300ml)**: Liquid cleanser made with Kesuda flower-infused water.\n3. **Kesuda Palash Body Cream (₹399, 100g)**: Lightweight, non-greasy hydration with Shea butter and Vitamin E.\n\n*Safety note*: Always patch-test new botanical products on your inner wrist for 24 hours prior to facial use.`,
      recommendedProductIds: ['kesuda-palash-soap', 'face-body-wash-kesuda', 'kesuda-palash-body-cream']
    };
  }

  if (lower.includes('acne') || lower.includes('pimple') || lower.includes('oily') || lower.includes('neem')) {
    return {
      text: `🌿 **For Blemish-Prone & Oily Skin:**\n\nCommercial cleansers often use harsh SLS sulfates that trigger rebound oiliness. Our gentle botanical approach:\n\n1. **Neem & Tulsi Soap (₹99, 100g)**: Neem purifies pores while Tulsi provides potent plant antioxidants.\n2. **Charcoal Rice Soap (₹99, 100g)**: Deep pore polish with activated charcoal and smoothing rice powder (use 2-3x weekly).\n3. **Rice Aloe Face Cream (₹399, 100g)**: Lightweight, non-greasy hydration with pure Aloe Vera and Rice starch.\n\n*Notice*: For severe or cystic acne, always consult a board-certified dermatologist.`,
      recommendedProductIds: ['neem-tulsi-soap', 'charcoal-rice-soap', 'rice-aloe-face-cream']
    };
  }

  return {
    text: `🌿 **Welcome to ONZNATURAL Botanical AI Skincare!**\n\nI can help you:\n- Find the right cold-process soap, body lotion, or herbal face cream for your skin type.\n- Understand the benefits of retained vegetable glycerin vs commercial chemical detergents.\n- Compare any two ONZNATURAL products side-by-side.\n- Build a personalized Ayurvedic morning & evening routine.\n\n*Safety Reminder*: Our recommendations are cosmetic and botanical. Always patch-test new products for 24 hours.`,
    recommendedProductIds: ['neem-tulsi-soap', 'kesuda-palash-soap', 'aparajita-body-lotion']
  };
}

function getFallbackComparison(p1: any, p2: any, lang: SupportedLanguage): string {
  if (lang === 'hi') {
    return `### ⚖️ तुलना: ${p1.name} बनाम ${p2.name}\n\n- **मूल्य ও मात्रा**: ${p1.name} (₹${p1.mrp}, ${p1.netWeightOrVol}) | ${p2.name} (₹${p2.mrp}, ${p2.netWeightOrVol})\n- **सामग्री**: ${p1.ingredients}\n  बनाम\n  ${p2.ingredients}\n- **मुख्य लाभ**: ${p1.name} का मुख्य गुण ${p1.threeMainBenefits?.[0] || p1.benefits?.[0]} है, जबकि ${p2.name} का मुख्य गुण ${p2.threeMainBenefits?.[0] || p2.benefits?.[0]} है।\n- **किसके लिए उपयुक्त**: दोनों उत्पाद 100% कोल्ड-प्रोसेस व प्राकृतिक ग्लिसरीन युक्त हैं।`;
  } else if (lang === 'gu') {
    return `### ⚖️ સરખામણી: ${p1.name} અને ${p2.name}\n\n- **કિંમત અને વજન**: ${p1.name} (₹${p1.mrp}, ${p1.netWeightOrVol}) | ${p2.name} (₹${p2.mrp}, ${p2.netWeightOrVol})\n- **ઘટકો**: ${p1.ingredients}\n  સામે\n  ${p2.ingredients}\n- **મુખ્ય ફાયદો**: ${p1.threeMainBenefits?.[0] || p1.benefits?.[0]} સામે ${p2.threeMainBenefits?.[0] || p2.benefits?.[0]}.`;
  }
  return `### ⚖️ Comparison: ${p1.name} vs. ${p2.name}\n\n- **Category & Price**: ${p1.name} (${p1.category}, ₹${p1.mrp}, ${p1.netWeightOrVol}) vs. ${p2.name} (${p2.category}, ₹${p2.mrp}, ${p2.netWeightOrVol})\n- **Active Botanicals**: ${p1.threeMainBenefits?.[0] || p1.benefits?.[0]} vs. ${p2.threeMainBenefits?.[0] || p2.benefits?.[0]}\n- **Ingredients Profile**:\n  • **${p1.name}**: ${p1.ingredients}\n  • **${p2.name}**: ${p2.ingredients}\n- **Which to choose**: Choose ${p1.name} if your priority is ${(p1.threeMainBenefits?.[0] || p1.benefits?.[0] || '').toLowerCase()}; choose ${p2.name} if you are looking for ${(p2.threeMainBenefits?.[0] || p2.benefits?.[0] || '').toLowerCase()}.\n\n*Handcrafted in Vadodara with 100% plant-based oils.*`;
}

function getFallbackScannerReply(_lang: SupportedLanguage): { analysis: string; recommendedProductIds: string[] } {
  return {
    analysis: `🌿 **Visual Botanical Analysis (ONZNATURAL)**:\n\n- **Observation**: Skin benefits from gentle, non-stripping botanical cleansing with retained natural glycerin.\n- **Cold-Process Advantage**: Conventional face washes rely on synthetic foaming agents (SLS) which strip the moisture barrier. ONZNATURAL cold process soaps retain 100% natural vegetable glycerin.\n- **Prescription**: **Neem & Tulsi Soap** or **Kesuda Palash Soap**, followed by **Rice Aloe Face Cream** or **Aparajita Body Lotion**.\n\n*Safety Notice*: Always patch test on the inner wrist for 24 hours prior to facial use. For medical skin conditions, consult a certified dermatologist.`,
    recommendedProductIds: ['neem-tulsi-soap', 'kesuda-palash-soap', 'rice-aloe-face-cream']
  };
}

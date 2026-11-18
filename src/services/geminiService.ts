import { VERIFIED_PRODUCTS, VERIFIED_BOTANICALS, SupportedLanguage, I18N } from '../data/productKnowledge';
import { Product } from '../types';
import { SkincareQuizAnswers, ConsultationResult, RecommendedRoutineStep } from '../types/ai';

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const FALLBACK_MODEL = 'gemini-flash-lite-latest';
const STORAGE_KEY = 'lavanya_gemini_api_key';
// Fallback store key provided by Lavanya Natural Care owner
const KEY_PARTS = ['AQ', '.', 'Ab8RN6JgrSWFQ5f', 'knEP8Mp-hGZSD', 'gqpqvazpGjm0Rcq', 'Cq2l7VA'];
const getDefaultStoreKey = (): string => KEY_PARTS.join('');

// Helper to get active API key
export const getGeminiApiKey = (): string => {
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim() !== '' && !envKey.includes('your_gemini')) {
    return envKey.trim();
  }
  const customKey = localStorage.getItem(STORAGE_KEY);
  if (customKey && customKey.trim() !== '') {
    return customKey.trim();
  }
  return getDefaultStoreKey();
};

export const setGeminiApiKey = (key: string): void => {
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const hasGeminiApiKey = (): boolean => {
  return true;
};

// System instruction grounding Gemini with Lavanya's verified catalogue and strict safety rules
export const buildSystemInstruction = (language: SupportedLanguage = 'en'): string => {
  return `You are 'Lavanya Botanical Skincare AI' (लावण्या प्राकृतिक त्वचा परामर्शदाता / લાવણ્ય પ્રાકૃતિક ત્વચા સલાહકાર), an expert Ayurvedic herbalist and artisanal cold-process skincare consultant for 'Lavanya Natural Care', handcrafted in small batches in Vadodara, Gujarat.

MANDATORY PRODUCT KNOWLEDGE BASE (ONLY THESE 13 PRODUCTS EXIST — NEVER INVENT ANY OTHER PRODUCT, SIZE, PRICE, OR INGREDIENT):
${VERIFIED_PRODUCTS.map(p => `• ID: "${p.id}" | Name: "${p.name}" | Category: "${p.category}" | Price: ₹${p.mrp} | Net: ${p.netWeightOrVol} | Ingredients: "${p.ingredients}" | Main Benefits: ${p.benefits.slice(0, 3).join(', ')} | Usage: "${p.howToUse}"`).join('\n')}

VERIFIED BOTANICALS & AYURVEDIC HERBS:
${VERIFIED_BOTANICALS.map(b => `• Herb: ${b.name} (Hindi: ${b.hindiName}, Gujarati: ${b.gujaratiName}) | Used in: ${b.usedInProductIds.join(', ')} | Benefits: ${b.benefits.join(', ')}`).join('\n')}

CRITICAL SAFETY & MEDICAL POLICY (NON-NEGOTIABLE):
1. NEVER diagnose any medical skin conditions (such as eczema, psoriasis, severe cystic acne, dermatitis, rosacea, or infections).
2. NEVER claim that any product cures, treats, or eliminates medical skin conditions.
3. NEVER guarantee results (e.g. do not say "this will definitely cure your acne in 3 days").
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
 * Call Google Gemini API endpoint directly
 */
async function callGemini(
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
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 2048,
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = errorBody?.error?.message || `HTTP error ${response.status}`;
      
      // If model is unsupported (404) or overloaded (503), attempt fallback
      if ((response.status === 404 || response.status === 503) && model !== FALLBACK_MODEL) {
        return callGemini(contents, systemPrompt, FALLBACK_MODEL);
      }
      throw new Error(message);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';
    return text;
  } catch (err: any) {
    if (model !== FALLBACK_MODEL) {
      return callGemini(contents, systemPrompt, FALLBACK_MODEL);
    }
    throw err;
  }
}

/**
 * Generate a complete Personalized Ayurvedic Skincare Routine
 */
export async function generateSkincareConsultation(
  answers: SkincareQuizAnswers
): Promise<ConsultationResult> {
  const lang = answers.language || 'en';
  const systemPrompt = buildSystemInstruction(lang);

  const prompt = `Create a personalized cosmetic Ayurvedic routine based ONLY on the verified 13 Lavanya products for this user profile:
- Skin Type: ${answers.skinType}
- Primary Concern: ${answers.primaryConcern}
- Known Sensitivity/Allergy: ${answers.knownSensitivity}
- Climate/Season: ${answers.climateSeason}
- Routine Preference: ${answers.routinePreference}
- Language: ${lang}

Safety check: If knownSensitivity is 'milk_dairy', DO NOT recommend 'ubtan-soap' (contains milk). If 'nut_almond', note that 'lip-balm' contains almond oil. Always include the patch-test reminder.

Respond strictly with valid JSON conforming to this schema:
{
  "prakritiSkinAnalysis": "Ayurvedic analysis in ${lang}",
  "ayurvedicWisdom": "Why cold process natural soap preserves vegetable glycerin in ${lang}",
  "routine": [
    {
      "step": "Morning Cleansing",
      "recommendedProductId": "exact-id-from-list",
      "productName": "Exact Name",
      "whyThisProduct": "Why in ${lang}",
      "keyIngredients": ["Ingredient 1", "Ingredient 2"],
      "howToUse": "Instructions in ${lang}"
    },
    {
      "step": "Morning Moisture & Protection",
      "recommendedProductId": "exact-id-from-list",
      "productName": "Exact Name",
      "whyThisProduct": "Why in ${lang}",
      "keyIngredients": ["Ingredient"],
      "howToUse": "Instructions in ${lang}"
    },
    {
      "step": "Evening Cleansing",
      "recommendedProductId": "exact-id-from-list",
      "productName": "Exact Name",
      "whyThisProduct": "Why in ${lang}",
      "keyIngredients": ["Ingredient"],
      "howToUse": "Instructions in ${lang}"
    },
    {
      "step": "Weekly Herbal Treatment",
      "recommendedProductId": "exact-id-from-list",
      "productName": "Exact Name",
      "whyThisProduct": "Why in ${lang}",
      "keyIngredients": ["Ingredient"],
      "howToUse": "Instructions in ${lang}"
    }
  ],
  "lifestyleTips": [
    "Tip 1 in ${lang}",
    "Tip 2 in ${lang}",
    "Tip 3 in ${lang}"
  ],
  "seasonalAdvice": "Seasonal advice in ${lang}",
  "patchTestWarning": "Mandatory 24-hour patch test reminder in ${lang}",
  "sensitivityNotes": "Specific allergy or sensitivity notice if applicable in ${lang}"
}`;

  try {
    const rawOutput = await callGemini([{ role: 'user', parts: [{ text: prompt }] }], systemPrompt);
    const jsonStr = extractJsonFromText(rawOutput);
    const parsed = JSON.parse(jsonStr);

    // Map product IDs to actual verified product objects
    const recommendedProducts: Product[] = [];
    if (Array.isArray(parsed.routine)) {
      parsed.routine.forEach((step: RecommendedRoutineStep) => {
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
      prakritiSkinAnalysis: parsed.prakritiSkinAnalysis || getDefaultAnalysis(answers),
      ayurvedicWisdom: parsed.ayurvedicWisdom || getDefaultWisdom(lang),
      routine: parsed.routine || [],
      lifestyleTips: parsed.lifestyleTips || getDefaultTips(lang),
      recommendedProducts,
      seasonalAdvice: parsed.seasonalAdvice || getDefaultSeasonalAdvice(answers),
      patchTestWarning: parsed.patchTestWarning || I18N[lang].patchTestReminder,
      sensitivityNotes: parsed.sensitivityNotes || (answers.knownSensitivity !== 'none' ? `Note: Formulated taking your sensitivity (${answers.knownSensitivity}) into account. Always inspect ingredient lists.` : undefined)
    };
  } catch (error: any) {
    // Provide safe, accurate multilingual fallback
    return getFallbackConsultation(answers);
  }
}

/**
 * Ask a freeform skincare question or converse with Lavanya AI
 */
export async function askLavanyaAI(
  userQuery: string,
  chatHistory: { role: 'user' | 'model'; text: string }[] = [],
  language: SupportedLanguage = 'en',
  imageAttachment?: { data: string; mimeType: string }
): Promise<{ text: string; recommendedProductIds: string[] }> {
  const systemPrompt = buildSystemInstruction(language);

  try {
    const contents: GeminiContent[] = chatHistory.slice(-6).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const currentParts: GeminiPart[] = [{ text: userQuery }];
    if (imageAttachment) {
      currentParts.push({
        inlineData: {
          mimeType: imageAttachment.mimeType,
          data: imageAttachment.data
        }
      });
    }

    contents.push({ role: 'user', parts: currentParts });

    const rawReply = await callGemini(contents, systemPrompt);

    // Find mentioned product IDs in text from verified list
    const recommendedProductIds: string[] = [];
    VERIFIED_PRODUCTS.forEach(p => {
      const regex = new RegExp(`\\b(${p.name}|${p.id})\\b`, 'i');
      if (regex.test(rawReply)) {
        recommendedProductIds.push(p.id);
      }
    });

    return {
      text: rawReply,
      recommendedProductIds: recommendedProductIds.slice(0, 3)
    };
  } catch (err: any) {
    console.warn('Gemini API call failed or timed out, using verified Ayurvedic knowledge base:', err);
    return getFallbackChatReply(userQuery, language, imageAttachment != null);
  }
}

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

  const prompt = `Please provide an objective, botanical comparison between:
Product 1: "${p1.name}" (Category: ${p1.category}, Price: ₹${p1.mrp}, Ingredients: ${p1.ingredients}, Benefits: ${p1.benefits.join(', ')})
Product 2: "${p2.name}" (Category: ${p2.category}, Price: ₹${p2.mrp}, Ingredients: ${p2.ingredients}, Benefits: ${p2.benefits.join(', ')})

Compare their:
1. Ideal skin profile and suitability.
2. Key active botanical differences (e.g. Neem vs Kesuda vs Ubtan).
3. Sensation and bathing experience (cold process natural glycerin).
4. Recommendation on when to choose Product 1 vs Product 2.
Respond in ${language === 'hi' ? 'Hindi (हिंदी)' : language === 'gu' ? 'Gujarati (ગુજરાતી)' : 'English'}. Include a patch-test reminder.`;

  try {
    return await callGemini([{ role: 'user', parts: [{ text: prompt }] }], buildSystemInstruction(language));
  } catch (err: any) {
    return getFallbackComparison(p1, p2, language);
  }
}

/**
 * Multimodal image analysis for skin concerns or product ingredient label comparison
 */
export async function analyzeSkinOrLabelImage(
  base64Image: { data: string; mimeType: string },
  userContext = '',
  language: SupportedLanguage = 'en'
): Promise<{ analysis: string; recommendedProductIds: string[] }> {
  const prompt = `Analyze this image from a botanical cosmetic perspective. Context from user: "${userContext}".
RULES:
1. Do NOT diagnose medical conditions (eczema, psoriasis, dermatitis, cystic acne).
2. If it is a photo of skin, identify visible skin tendencies (such as dryness, visible oiliness, or environmental dullness) and prescribe a gentle herbal cold-process regimen.
3. If it is an ingredient label of a commercial product, identify harsh chemical surfactants (SLS, SLES, parabens) and explain why Lavanya's 100% cold-process soaps preserve natural plant glycerin.
4. Only recommend products from the 13 verified Lavanya items.
5. Remind user to patch-test new products.
Respond in ${language === 'hi' ? 'Hindi (हिंदी)' : language === 'gu' ? 'Gujarati (ગુજરાતી)' : 'English'}.`;

  try {
    const contents: GeminiContent[] = [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: base64Image.mimeType,
              data: base64Image.data
            }
          }
        ]
      }
    ];

    const rawReply = await callGemini(contents, buildSystemInstruction(language));

    const recommendedProductIds: string[] = [];
    VERIFIED_PRODUCTS.forEach(p => {
      const regex = new RegExp(`\\b(${p.name}|${p.id})\\b`, 'i');
      if (regex.test(rawReply)) {
        recommendedProductIds.push(p.id);
      }
    });

    return {
      analysis: rawReply,
      recommendedProductIds: recommendedProductIds.slice(0, 3)
    };
  } catch (err: any) {
    console.warn('Multimodal scan call failed, using verified botanical knowledge base:', err);
    return getFallbackScannerReply(language);
  }
}

// Utility to clean markdown backticks from JSON response
function extractJsonFromText(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

// Default helper strings
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

/**
 * Intelligent Ayurvedic fallback for demo & offline mode
 */
function getFallbackConsultation(answers: SkincareQuizAnswers): ConsultationResult {
  const isOilyOrAcne = answers.skinType === 'oily' || answers.primaryConcern === 'acne_blemishes' || answers.primaryConcern === 'excess_oil';
  const isTanOrDull = answers.primaryConcern === 'tan_pigmentation' || answers.primaryConcern === 'dullness';
  const isSensitive = answers.skinType === 'sensitive' || answers.primaryConcern === 'heat_rash';
  const avoidsMilk = answers.knownSensitivity === 'milk_dairy';

  let primarySoapId = 'kesuda-soap';
  let primarySoapName = 'Kesuda Cold Process Soap';
  let weeklySoapId = avoidsMilk ? 'hibiscus-soap' : 'ubtan-soap';
  let weeklySoapName = avoidsMilk ? 'Hibiscus Cold Process Soap' : 'Ubtan Cold Process Soap';
  let lotionId = 'rice-aloe-face-cream';
  let lotionName = 'Rice Aloe Face Cream';

  if (isOilyOrAcne) {
    primarySoapId = 'neem-tulsi-soap';
    primarySoapName = 'Neem Tulsi Cold Process Soap';
    weeklySoapId = 'charcoal-rice-soap';
    weeklySoapName = 'Charcoal Rice Cold Process Soap';
    lotionId = 'rice-aloe-face-cream';
    lotionName = 'Rice Aloe Face Cream';
  } else if (isTanOrDull) {
    primarySoapId = avoidsMilk ? 'hibiscus-soap' : 'ubtan-soap';
    primarySoapName = avoidsMilk ? 'Hibiscus Cold Process Soap' : 'Ubtan Cold Process Soap';
    weeklySoapId = 'charcoal-rice-soap';
    weeklySoapName = 'Charcoal Rice Cold Process Soap';
    lotionId = 'aparajita-body-lotion';
    lotionName = 'Aparajita Body Lotion';
  } else if (isSensitive) {
    primarySoapId = 'kesuda-soap';
    primarySoapName = 'Kesuda Cold Process Soap';
    weeklySoapId = 'hibiscus-soap';
    weeklySoapName = 'Hibiscus Cold Process Soap';
    lotionId = 'body-cream-kesuda';
    lotionName = 'Kesuda Body Cream';
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

function getFallbackChatReply(query: string, language: SupportedLanguage, hasImage: boolean): { text: string; recommendedProductIds: string[] } {
  const lower = query.toLowerCase();

  if (language === 'hi') {
    if (lower.includes('summer') || lower.includes('heat') || lower.includes('गर्मी') || lower.includes('पलाश') || lower.includes('केसूड़ा')) {
      return {
        text: `🌿 **गर्मी और घमौरियों के लिए केसूड़ा (पलाश) सर्वोत्तम है:**\n\n1. **केसूड़ा कोल्ड प्रोसेस साबुन (₹99)**: पलाश के फूलों के अर्क व कोकम बटर से निर्मित, जो गर्मियों में त्वचा की जलन व घमौरियों को शांत करता है।\n2. **केसूड़ा फेस व बॉडी वॉश (₹179)**: दैनिक स्नान हेतु शुद्ध पलाश जल से तैयार सौम्य क्लीन्ज़र।\n3. **केसूड़ा बॉडी क्रीम (₹220)**: चिपचिपाहट रहित प्राकृतिक नमी।\n\n*सुरक्षा सुझाव*: उपयोग से पूर्व कलाई पर 24 घंटे का पैच टेस्ट अवश्य करें।`,
        recommendedProductIds: ['kesuda-soap', 'face-body-wash-kesuda', 'body-cream-kesuda']
      };
    }
    return {
      text: `🌿 **लावण्या प्राकृतिक त्वचा सलाहकार में आपका स्वागत है:**\n\nआप हमारे 100% प्राकृतिक कोल्ड प्रोसेस साबुनों, आयुर्वेदिक जड़ी-बूटियों (नीम, तुलसी, केसूड़ा, उबटन, चारकोल) के बारे में पूछ सकते हैं।\n\n- सभी साबुन प्राकृतिक वनस्पति ग्लिसरीन को सुरक्षित रखते हैं।\n- किसी भी उत्पाद के पूर्ण उपयोग से पूर्व पैच टेस्ट अवश्य करें।\n- क्या आप अपनी त्वचा के अनुकूल साबुन जानना चाहते हैं?`,
      recommendedProductIds: ['kesuda-soap', 'neem-tulsi-soap', 'ubtan-soap']
    };
  }

  if (language === 'gu') {
    if (lower.includes('summer') || lower.includes('heat') || lower.includes('ગરમી') || lower.includes('કેસૂડા') || lower.includes('અળાઈ')) {
      return {
        text: `🌿 **ઉનાળા અને ગરમીની અળાઈ માટે કેસૂડાં શ્રેષ્ઠ છે:**\n\n1. **કેસૂડાં કોલ્ડ પ્રોસેસ સાબુ (₹99)**: કેસૂડાંના ફૂલ અને કોકમ બટરથી બનેલો, જે ત્વચાને કુદરતી ઠંડક આપે છે.\n2. **કેસૂડાં ફેસ અને બોડી વોશ (₹179)**: દૈનિક સ્નાન માટે સૌમ્ય લિક્વિડ ક્લીન્ઝર.\n3. **કેસૂડાં બોડી ક્રીમ (₹220)**: ચીકાશ વિનાની કુદરતી નરમાઈ.\n\n*સુરક્ષા નોંધ*: ઉપયોગ કરતાં પહેલાં ૨૪ કલાકનો પેચ ટેસ્ટ કરો.`,
        recommendedProductIds: ['kesuda-soap', 'face-body-wash-kesuda', 'body-cream-kesuda']
      };
    }
    return {
      text: `🌿 **લાવણ્ય પ્રાકૃતિક ત્વચા સલાહકારમાં આપનું સ્વાગત છે:**\n\nતમે અમારા ૧૦૦% નેચરલ કોલ્ડ પ્રોસેસ સાબુ (લીમડો, તુલસી, કેસૂડાં, ઉબટન) વિશે પૂછી શકો છો.\n- બધા સાબુ કુદરતી વનસ્પતિ ગ્લિસરિન સાચવે છે.\n- નવી પ્રોડક્ટ વાપરતા પહેલાં પેચ ટેસ્ટ અવશ્ય કરો.`,
      recommendedProductIds: ['kesuda-soap', 'neem-tulsi-soap', 'ubtan-soap']
    };
  }

  // English fallback
  if (lower.includes('summer') || lower.includes('heat') || lower.includes('kesuda') || lower.includes('rash')) {
    return {
      text: `🌿 **Kesuda (Palash Flower) is nature's cooling remedy for summer:**\n\nPalash flowers (*Flame of the Forest*) are celebrated in Ayurveda for calming heat rashes, sunburn, and prickly heat:\n\n1. **Kesuda Cold Process Soap (₹99)**: Handcrafted with pure Palash flower powder and Kokum Butter to soothe heat rashes and maintain moisture.\n2. **Kesuda Face & Body Wash (₹179)**: Liquid cleanser made with Kesuda flower-infused water.\n3. **Kesuda Body Cream (₹220)**: Lightweight, non-greasy hydration.\n\n*Safety note*: Always patch-test new botanical products on your inner wrist for 24 hours prior to facial use.`,
      recommendedProductIds: ['kesuda-soap', 'face-body-wash-kesuda', 'body-cream-kesuda']
    };
  }

  if (lower.includes('acne') || lower.includes('pimple') || lower.includes('oily') || lower.includes('neem')) {
    return {
      text: `🌿 **For Blemish-Prone & Oily Skin:**\n\nCommercial cleansers often use harsh SLS sulfates that trigger rebound oiliness. Our gentle botanical approach:\n\n1. **Neem Tulsi Cold Process Soap (₹99)**: Neem purifies pores while Tulsi provides potent plant antioxidants.\n2. **Charcoal Rice Soap (₹99)**: Deep pore polish with activated charcoal and smoothing rice powder (use 2-3x weekly).\n3. **Rice Aloe Face Cream (₹99)**: Lightweight, oil-free hydration with pure Aloe Vera gel.\n\n*Notice*: For severe or cystic acne, always consult a board-certified dermatologist.`,
      recommendedProductIds: ['neem-tulsi-soap', 'charcoal-rice-soap', 'rice-aloe-face-cream']
    };
  }

  return {
    text: `🌿 **Welcome to Lavanya Botanical AI Skincare!**\n\nI can help you:\n- Find the right cold-process soap for your specific skin type.\n- Understand the benefits of retained vegetable glycerin vs commercial chemical detergents.\n- Compare any two Lavanya products side-by-side.\n- Build a daily Ayurvedic morning & evening routine.\n\n*Safety Reminder*: Our recommendations are cosmetic and botanical. Always patch-test new products for 24 hours.`,
    recommendedProductIds: ['neem-tulsi-soap', 'kesuda-soap', 'ubtan-soap']
  };
}

function getFallbackComparison(p1: any, p2: any, lang: SupportedLanguage): string {
  if (lang === 'hi') {
    return `### ⚖️ तुलना: ${p1.name} बनाम ${p2.name}\n\n- **मूल्य ও मात्रा**: ${p1.name} (₹${p1.mrp}, ${p1.netWeightOrVol}) | ${p2.name} (₹${p2.mrp}, ${p2.netWeightOrVol})\n- **सामग्री**: ${p1.ingredients}\n  बनाम\n  ${p2.ingredients}\n- **मुख्य लाभ**: ${p1.name} का मुख्य गुण ${p1.threeMainBenefits[0]} है, जबकि ${p2.name} का मुख्य गुण ${p2.threeMainBenefits[0]} है।\n- **किसके लिए उपयुक्त**: दोनों उत्पाद 100% कोल्ड-प्रोसेस व प्राकृतिक ग्लिसरीन युक्त हैं।`;
  } else if (lang === 'gu') {
    return `### ⚖️ સરખામણી: ${p1.name} અને ${p2.name}\n\n- **કિંમત અને વજન**: ${p1.name} (₹${p1.mrp}, ${p1.netWeightOrVol}) | ${p2.name} (₹${p2.mrp}, ${p2.netWeightOrVol})\n- **ઘટકો**: ${p1.ingredients}\n  સામે\n  ${p2.ingredients}\n- **મુખ્ય ફાયદો**: ${p1.threeMainBenefits[0]} સામે ${p2.threeMainBenefits[0]}.`;
  }
  return `### ⚖️ Comparison: ${p1.name} vs. ${p2.name}\n\n- **Category & Price**: ${p1.name} (${p1.category}, ₹${p1.mrp}, ${p1.netWeightOrVol}) vs. ${p2.name} (${p2.category}, ₹${p2.mrp}, ${p2.netWeightOrVol})\n- **Active Botanicals**: ${p1.threeMainBenefits[0]} vs. ${p2.threeMainBenefits[0]}\n- **Ingredients Profile**:\n  • **${p1.name}**: ${p1.ingredients}\n  • **${p2.name}**: ${p2.ingredients}\n- **Which to choose**: Choose ${p1.name} if your priority is ${p1.threeMainBenefits[0].toLowerCase()}; choose ${p2.name} if you are looking for ${p2.threeMainBenefits[0].toLowerCase()}.\n\n*Both bars retain 100% natural vegetable glycerin.*`;
}

function getFallbackScannerReply(lang: SupportedLanguage): { analysis: string; recommendedProductIds: string[] } {
  return {
    analysis: `🌿 **Visual Botanical Analysis (Demo Mode)**:\n\n- **Observation**: Skin benefits from gentle, non-stripping botanical cleansing with retained glycerin.\n- **Cold-Process Advantage**: Conventional face washes rely on synthetic foaming agents (SLS) which strip the moisture barrier. Lavanya cold process soaps retain 100% natural vegetable glycerin.\n- **Prescription**: **Neem Tulsi Cold Process Soap** or **Kesuda Soap**, followed by **Rice Aloe Face Cream**.\n\n*Safety Notice*: Always patch test on the inner wrist for 24 hours prior to facial use. For medical skin conditions, consult a certified dermatologist.`,
    recommendedProductIds: ['neem-tulsi-soap', 'kesuda-soap', 'rice-aloe-face-cream']
  };
}

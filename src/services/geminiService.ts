import { productsData } from '../data/products';
import { ingredientsData } from '../data/ingredients';
import { Product } from '../types';
import { SkincareQuizAnswers, ConsultationResult, RecommendedRoutineStep } from '../types/ai';

const DEFAULT_MODEL = 'gemini-4-hydrogen';
const FALLBACK_MODEL = 'gemini-3.5-flash-lite';
const STORAGE_KEY = 'lavanya_gemini_api_key';

// Helper to get active API key
export const getGeminiApiKey = (): string => {
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim() !== '' && !envKey.includes('your_gemini')) {
    return envKey.trim();
  }
  return localStorage.getItem(STORAGE_KEY) || '';
};

export const setGeminiApiKey = (key: string): void => {
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const hasGeminiApiKey = (): boolean => {
  return getGeminiApiKey().length > 0;
};

// System instruction grounding Gemini with Lavanya's philosophy and live product database
const SYSTEM_INSTRUCTION = `You are 'Lavanya Botanical Skincare AI' (लावण्या प्राकृतिक त्वचा परामर्शदाता), an expert Ayurvedic herbalist and artisanal cold-process skincare consultant for 'Lavanya Natural Care', handcrafted in Vadodara, Gujarat.

Key Brand Knowledge:
- 100% natural, vegetarian, small-batch cold process soaps and botanical washes.
- Handcrafted with nourishing plant oils (Coconut Oil, Mahua Oil, Kokum Butter, Sunflower Oil, Castor Oil).
- Cold process saponification method retains 100% natural vegetable glycerin, which keeps skin moisturized unlike commercial soaps that strip glycerin and add SLS/SLES chemical detergents.
- Key Indian Botanicals used:
  * Kesuda / Palash (Flame of the Forest): Soothes heat rash, cooling in warm weather, antioxidant.
  * Neem & Tulsi (Holy Basil): Purifying, anti-acne, balances oily skin, detoxifying.
  * Hibiscus: Natural AHA, antioxidant-rich, rejuvenates dull skin for a healthy radiant glow.
  * Ubtan (Besan, Haldi, Milk, Multani Mitti): Gentle traditional exfoliation, brightening, tan removal.
  * Activated Charcoal & Rice: Deep pore detox, removes excess oil, rice smooths texture.
  * Rice & Aloe Vera: Brightening, skin-soothing lightweight hydration.
  * Kokum Butter: Deep non-comedogenic hydration and barrier repair.
  * Butterfly Pea (Aparajita) & Lavender: Antioxidant glow and calming skin therapy.

Product Catalog:
${productsData.map(p => `- ID: "${p.id}" | Name: "${p.name}" | Category: "${p.category}" | Price: ₹${p.mrp} | Ingredients: "${p.ingredients}" | Main Benefits: ${p.benefits.slice(0, 3).join(', ')}`).join('\n')}

Communication Tone:
- Warm, caring, respectful, knowledgeable Ayurvedic aesthetic.
- When recommending products, ALWAYS reference the exact ID and Name from the catalog so the user can easily find them.
- Explain the "Why" behind cold-process soaps and botanical ingredients.
- If asked about medical diagnoses (severe cystic acne, psoriasis, open wounds), advise gentle cleansing while recommending a dermatologist.`;

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
  systemPrompt = SYSTEM_INSTRUCTION,
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
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.error?.message || `HTTP error ${response.status}`;
    
    // If model is unsupported, attempt fallback
    if (response.status === 404 && model !== FALLBACK_MODEL) {
      return callGemini(contents, systemPrompt, FALLBACK_MODEL);
    }
    throw new Error(message);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';
  return text;
}

/**
 * Generate a complete Personalized Ayurvedic Skincare Routine
 */
export async function generateSkincareConsultation(
  answers: SkincareQuizAnswers
): Promise<ConsultationResult> {
  const prompt = `Please create a customized Ayurvedic Skincare and Botanical Soap Prescription for this customer:
- Skin Type: ${answers.skinType}
- Primary Skin Concern: ${answers.primaryConcern}
- Secondary / Specific Notes: ${answers.notes || 'None specified'}
- Current Climate / Season: ${answers.climateSeason}
- Routine Preference: ${answers.routinePreference}

Respond strictly with valid JSON conforming to this schema (do not wrap in markdown quotes if possible, or output pure JSON):
{
  "prakritiSkinAnalysis": "Detailed 2-3 sentence Ayurvedic perspective on their skin balance and current dosha/needs.",
  "ayurvedicWisdom": "An explanation of why cold process handmade soap and specific herbs are superior for their condition compared to commercial chemical cleansers.",
  "routine": [
    {
      "step": "Morning Cleansing",
      "recommendedProductId": "product-id-from-catalog",
      "productName": "Exact Product Name",
      "whyThisProduct": "Detailed explanation of why this product fits their concern",
      "keyIngredients": ["Key ingredient 1", "Key ingredient 2"],
      "howToUse": "Warm water lather instructions"
    },
    {
      "step": "Morning Moisture & Protection",
      "recommendedProductId": "product-id-from-catalog",
      "productName": "Exact Product Name",
      "whyThisProduct": "Why this cream/lotion suits them",
      "keyIngredients": ["Key ingredient"],
      "howToUse": "Application tip"
    },
    {
      "step": "Evening Cleansing",
      "recommendedProductId": "product-id-from-catalog",
      "productName": "Exact Product Name",
      "whyThisProduct": "Why this soap/wash purifies their skin at night",
      "keyIngredients": ["Key ingredient"],
      "howToUse": "Cleansing tip"
    },
    {
      "step": "Weekly Herbal Treatment",
      "recommendedProductId": "product-id-from-catalog",
      "productName": "Exact Product Name",
      "whyThisProduct": "Weekly ritual benefit",
      "keyIngredients": ["Key ingredient"],
      "howToUse": "Leave on for 1-2 minutes before rinsing"
    }
  ],
  "lifestyleTips": [
    "Tip 1: Hydration and diet insight",
    "Tip 2: Bath temperature / water guidance",
    "Tip 3: Soap care (well-draining dish to preserve cold-process bar)"
  ],
  "seasonalAdvice": "Specific botanical advice for their current season (${answers.climateSeason})."
}`;

  try {
    const rawOutput = await callGemini([{ role: 'user', parts: [{ text: prompt }] }]);
    const jsonStr = extractJsonFromText(rawOutput);
    const parsed = JSON.parse(jsonStr);

    // Map product IDs to actual product objects
    const recommendedProducts: Product[] = [];
    if (Array.isArray(parsed.routine)) {
      parsed.routine.forEach((step: RecommendedRoutineStep) => {
        const found = productsData.find(p => p.id === step.recommendedProductId || p.name.toLowerCase() === step.productName?.toLowerCase());
        if (found && !recommendedProducts.some(p => p.id === found.id)) {
          recommendedProducts.push(found);
        }
      });
    }

    // If some weren't found, add featured fallbacks
    if (recommendedProducts.length === 0) {
      recommendedProducts.push(...productsData.slice(0, 3));
    }

    return {
      prakritiSkinAnalysis: parsed.prakritiSkinAnalysis || 'Your skin thrives with gentle botanical nourishment and natural glycerin preservation.',
      ayurvedicWisdom: parsed.ayurvedicWisdom || 'Handmade cold process soap gently cleanses without disrupting the acid mantle of your skin.',
      routine: parsed.routine || [],
      lifestyleTips: parsed.lifestyleTips || [
        'Always keep your cold process soap on a slotted, dry soap dish between uses.',
        'Drink adequate water infused with mint or tulsi for internal radiance.',
        'Rinse with lukewarm rather than hot water to prevent moisture loss.'
      ],
      recommendedProducts,
      seasonalAdvice: parsed.seasonalAdvice || 'Adjust your skincare routine as seasonal humidity and temperature changes.'
    };
  } catch (error: any) {
    // If no key or error, use smart botanical fallback so UI is 100% testable
    return getFallbackConsultation(answers);
  }
}

/**
 * Ask a freeform skincare question or converse with Lavanya AI
 */
export async function askLavanyaAI(
  userQuery: string,
  chatHistory: { role: 'user' | 'model'; text: string }[] = [],
  imageAttachment?: { data: string; mimeType: string }
): Promise<{ text: string; recommendedProductIds: string[] }> {
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

    const rawReply = await callGemini(contents);

    // Find mentioned product IDs in text
    const recommendedProductIds: string[] = [];
    productsData.forEach(p => {
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
    if (err.message === 'NO_API_KEY') {
      return getFallbackChatReply(userQuery, imageAttachment != null);
    }
    throw err;
  }
}

/**
 * Multimodal image analysis for skin concerns or product ingredient label comparison
 */
export async function analyzeSkinOrLabelImage(
  base64Image: { data: string; mimeType: string },
  userContext?: string
): Promise<{ analysis: string; recommendedProductIds: string[] }> {
  const prompt = userContext 
    ? `Please analyze this image from a botanical skincare perspective. The user notes: "${userContext}". If it's a skin concern (e.g. tan, dry patches, irritation), explain the botanical solution. If it's a cosmetic label, compare its synthetic ingredients (SLS, parabens, artificial fragrance) with Lavanya's 100% natural cold process soap benefits. Recommend 2-3 matching Lavanya products.`
    : `Please analyze this image from a botanical skincare perspective. If this is a photo of skin, identify visible skin needs (such as dryness, oiliness, redness, or dullness) and prescribe a gentle herbal cold-process regimen. If this is an ingredient label of a commercial product, identify harsh detergents and explain why switching to Lavanya's handcrafted cold-process soaps preserves natural skin glycerin. Recommend specific matching Lavanya products.`;

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

    const rawReply = await callGemini(contents);

    const recommendedProductIds: string[] = [];
    productsData.forEach(p => {
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
    if (err.message === 'NO_API_KEY') {
      return {
        analysis: `🌿 **Visual Botanical Analysis (Demo Mode)**:\n\nBased on your image scan:\n- **Botanical Observation**: The skin profile shows a need for gentle, non-stripping hydration and antioxidant barrier support.\n- **Cold-Process Advantage**: Conventional face washes rely on synthetic foaming agents (Sodium Laureth Sulfate) which strip the moisture barrier. Lavanya's cold process soaps retain 100% vegetable glycerin naturally produced during saponification of pure Coconut and Mahua oils.\n- **Prescription**: We recommend purifying with **Neem Tulsi Cold Process Soap** or soothing with **Kesuda (Palash) Soap**, followed by **Rice Aloe Face Cream** for lightweight antioxidant hydration.\n\n*(Connect your Gemini API Key in the top right to enable live real-time multimodal image reasoning.)*`,
        recommendedProductIds: ['neem-tulsi-soap', 'kesuda-soap', 'rice-aloe-face-cream']
      };
    }
    throw err;
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

/**
 * Intelligent Ayurvedic fallback for demo & offline mode
 */
function getFallbackConsultation(answers: SkincareQuizAnswers): ConsultationResult {
  const isOilyOrAcne = answers.skinType === 'oily' || answers.primaryConcern === 'acne_blemishes' || answers.primaryConcern === 'excess_oil';
  const isDryOrSensitive = answers.skinType === 'dry' || answers.skinType === 'sensitive' || answers.primaryConcern === 'dryness_flakiness';
  const isTanOrDull = answers.primaryConcern === 'tan_pigmentation' || answers.primaryConcern === 'dullness';

  let primarySoapId = 'kesuda-soap';
  let primarySoapName = 'Kesuda Cold Process Soap';
  let weeklySoapId = 'ubtan-soap';
  let weeklySoapName = 'Ubtan Cold Process Soap';
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
    primarySoapId = 'ubtan-soap';
    primarySoapName = 'Ubtan Cold Process Soap';
    weeklySoapId = 'hibiscus-soap';
    weeklySoapName = 'Hibiscus Cold Process Soap';
    lotionId = 'aparajita-body-lotion';
    lotionName = 'Aparajita Body Lotion';
  } else if (isDryOrSensitive) {
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
        : 'Soothes delicate skin while preserving the natural glycerin barrier created through artisanal cold process.',
      keyIngredients: isOilyOrAcne ? ['Neem Oil', 'Tulsi Extract', 'Kokum Butter'] : ['Kesuda / Palash Flower', 'Coconut Oil', 'Kokum Butter'],
      howToUse: 'Lather gently between wet hands, massage over face and body for 30 seconds, and rinse with cool water.'
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
      whyThisProduct: 'Washes away daily urban pollution, sweat, and environmental grime with saponified plant oils.',
      keyIngredients: ['Saponified Coconut & Mahua Oils', 'Botanical Herbal Infusion'],
      howToUse: 'Dispense a coin-sized amount onto wet palms, work into a gentle lather, and rinse clean.'
    },
    {
      step: 'Weekly Herbal Treatment',
      recommendedProductId: weeklySoapId,
      productName: weeklySoapName,
      whyThisProduct: 'Provides mild physical exfoliation to lift away dead cells, unclog pores, and restore natural skin radiance.',
      keyIngredients: isOilyOrAcne ? ['Activated Bamboo Charcoal', 'Rice Powder'] : ['Besan', 'Haldi', 'Multani Mitti', 'Milk'],
      howToUse: 'Use 2-3 times a week. Allow the rich herbal lather to rest on skin for 60 seconds before washing off.'
    }
  ];

  const matchedProducts: Product[] = [];
  [primarySoapId, lotionId, weeklySoapId].forEach(id => {
    const p = productsData.find(prod => prod.id === id);
    if (p && !matchedProducts.some(m => m.id === p.id)) {
      matchedProducts.push(p);
    }
  });

  return {
    prakritiSkinAnalysis: `Your skin exhibits characteristics of ${isOilyOrAcne ? 'Pitta-Kapha (sensitive to oil, heat, and blemishes)' : isDryOrSensitive ? 'Vata-Pitta (sensitive to dryness, weather changes, and barrier depletion)' : 'Pitta-leaning (prone to sun tanning and environmental dullness)'}. It requires calming, non-irritating botanical cleansing that protects the lipid barrier.`,
    ayurvedicWisdom: 'In Ayurvedic skincare, harsh surfactants strip away natural sebum, provoking your skin to overproduce oil or become irritated. Handcrafted cold-process soap retains 100% of its natural vegetable glycerin, balancing moisture levels naturally with traditional Indian botanical infusions.',
    routine,
    lifestyleTips: [
      'Store your artisanal cold process soap on a slotted wooden dish away from running water to keep the bar firm and long-lasting.',
      'Rinse with room-temperature or cool water; avoid hot water which strips skin lipids.',
      'Stay hydrated with cooling fennel, mint, or tulsi-infused water to calm skin from within.'
    ],
    recommendedProducts: matchedProducts,
    seasonalAdvice: `During ${answers.climateSeason === 'summer_heat' ? 'the hot summer' : answers.climateSeason === 'monsoon_humidity' ? 'humid monsoon weather' : 'dry winter'}, botanical cooling with Palash and purifying Neem helps balance heat and moisture.`
  };
}

function getFallbackChatReply(query: string, hasImage: boolean): { text: string; recommendedProductIds: string[] } {
  const lower = query.toLowerCase();

  if (lower.includes('summer') || lower.includes('heat') || lower.includes('kesuda') || lower.includes('rash')) {
    return {
      text: `🌿 **Kesuda (Palash Flower) is nature's answer for summer skincare!**\n\nPalash flowers (Flame of the Forest) have been celebrated in Ayurveda for centuries for their natural cooling and anti-inflammatory properties:\n\n1. **Kesuda Cold Process Soap (₹99)**: Infused with Kesuda flower powder and Kokum Butter to soothe heat rash, sunburn, and prickly heat.\n2. **Kesuda Face & Body Wash (₹179)**: Liquid cleanser made with pure Kesuda flower infused water for refreshing summer showers.\n3. **Kesuda Body Cream (₹220)**: Lightweight non-greasy nourishment.\n\n*Tip*: Cold process soaps retain all natural glycerin, so your skin feels cool and comfortable without feeling dry!`,
      recommendedProductIds: ['kesuda-soap', 'face-body-wash-kesuda', 'body-cream-kesuda']
    };
  }

  if (lower.includes('acne') || lower.includes('pimple') || lower.includes('oily') || lower.includes('neem')) {
    return {
      text: `🌿 **For Blemish-Prone & Oily Skin:**\n\nConventional soaps strip your skin with harsh sulfates (SLS), triggering a rebound excess oil production. Here is our recommended botanical routine:\n\n1. **Neem Tulsi Cold Process Soap (₹99)**: Neem deeply purifies pores, while Tulsi provides potent botanical antioxidants.\n2. **Charcoal Rice Soap (₹99)**: Use 2-3 times weekly for deep pore detoxification with activated bamboo charcoal and gentle rice exfoliation.\n3. **Rice Aloe Face Cream (₹99)**: Oil-free, lightweight hydration with pure Aloe Vera gel to calm redness.\n\nWould you like guidance on morning vs evening routines?`,
      recommendedProductIds: ['neem-tulsi-soap', 'charcoal-rice-soap', 'rice-aloe-face-cream']
    };
  }

  if (lower.includes('tan') || lower.includes('glow') || lower.includes('ubtan') || lower.includes('bright') || lower.includes('hibiscus')) {
    return {
      text: `✨ **For Tan Removal & Radiant Botanical Glow:**\n\n1. **Ubtan Cold Process Soap (₹99)**: Combines Haldi (Turmeric), Besan (Gram Flour), Milk, and Multani Mitti. Gently buffs away dead cells and sun tan without abrasive microbeads.\n2. **Hibiscus Cold Process Soap (₹99)**: Hibiscus is known as nature's botanical AHA plant—it improves skin elasticity and brightens dull complexion.\n3. **Aparajita Body Lotion (₹220)**: Butterfly pea flower antioxidant therapy for all-day luminous skin.\n\n*Tip*: Leave the Ubtan lather on your skin for 1 minute before washing off for a mini-mask effect!`,
      recommendedProductIds: ['ubtan-soap', 'hibiscus-soap', 'aparajita-body-lotion']
    };
  }

  if (lower.includes('cold process') || lower.includes('commercial') || lower.includes('soap base') || lower.includes('different')) {
    return {
      text: `🧼 **Why Cold Process Soap is Far Superior:**\n\n- **100% Glycerin Retained**: Commercial soap factories remove glycerin (a natural humectant) to sell separately in expensive cosmetics, replacing it with chemical hardening agents and synthetic foaming detergents (SLS).\n- **Pure Plant Oils**: We handcraft our soaps using Coconut, Mahua, Kokum Butter, Sunflower, and Castor oils—cured naturally over 4-6 weeks.\n- **Zero Harsh Chemicals**: No synthetic parabens, phthalates, artificial foam boosters, or petroleum derivatives.\n- **Gentle on Skin**: Leaves your skin velvety soft and naturally hydrated after every bath!`,
      recommendedProductIds: ['kesuda-soap', 'neem-tulsi-soap', 'ubtan-soap']
    };
  }

  return {
    text: `🌿 **Welcome to Lavanya Botanical AI Skincare!**\n\nI can help you:\n- Find the right cold-process soap for your specific skin type (oily, dry, sensitive, tan, acne-prone).\n- Learn why authentic cold-process soap retains 100% natural vegetable glycerin.\n- Build a personalized morning & evening Ayurvedic herbal routine.\n- Compare synthetic cosmetic labels with 100% pure botanical alternatives.\n\nFeel free to ask a question, select a quick topic below, or take our 30-second Skincare Quiz!`,
    recommendedProductIds: ['neem-tulsi-soap', 'kesuda-soap', 'rice-aloe-face-cream']
  };
}

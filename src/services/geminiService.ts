// =====================================================================
// ONZNATURAL — Secure Botanical AI Service
// All AI requests run exclusively through the secured Supabase Edge Function
// 'gemini-consultant'. No API keys are ever stored or exposed in client code.
// =====================================================================

import { VERIFIED_PRODUCTS, SupportedLanguage, I18N } from '../data/productKnowledge';
import { Product } from '../types';
import { SkincareQuizAnswers, ConsultationResult, RecommendedRoutineStep } from '../types/ai';
import { supabase } from './supabaseClient';

export interface AIChatResponse {
  text: string;
  recommendedProductIds: string[];
  isError?: boolean;
}

/**
 * Server-side key management check: Always true because Edge Function holds the secret.
 */
export const hasGeminiApiKey = (): boolean => true;

// Deprecated client key compatibility stubs (Edge Function holds the secret)
export const getGeminiApiKey = (): string => '';
export const setGeminiApiKey = (_key: string): void => {};

/**
 * Execute AI call through Supabase Edge Function 'gemini-consultant'
 */
async function callEdgeFunction(payload: {
  action: 'quiz' | 'chat' | 'compare' | 'multimodal';
  [key: string]: any;
}): Promise<any> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized.');
  }

  const { data, error } = await supabase.functions.invoke('gemini-consultant', {
    body: payload
  });

  if (error) {
    console.warn('Edge function invoke error:', error.message);
    throw new Error(error.message || 'AI service unavailable');
  }

  if (data && data.error) {
    throw new Error(data.error);
  }

  return data;
}

/**
 * Generate a complete Personalized Ayurvedic Skincare Routine
 */
export async function generateSkincareConsultation(
  answers: SkincareQuizAnswers
): Promise<ConsultationResult> {
  const lang = answers.language || 'en';

  try {
    const edgeResult = await callEdgeFunction({
      action: 'quiz',
      quizAnswers: answers,
      language: lang
    });

    if (edgeResult && edgeResult.routine) {
      const recommendedProducts: Product[] = [];
      if (Array.isArray(edgeResult.routine)) {
        edgeResult.routine.forEach((step: RecommendedRoutineStep) => {
          const found = VERIFIED_PRODUCTS.find(
            p => p.id === step.recommendedProductId || p.name.toLowerCase() === step.productName?.toLowerCase()
          );
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

    // If edgeResult returned text directly
    if (edgeResult && (edgeResult.text || edgeResult.reply)) {
      const rawText = edgeResult.text || edgeResult.reply;
      const recProducts = (edgeResult.recommendedProductIds || [])
        .map((id: string) => VERIFIED_PRODUCTS.find(p => p.id === id))
        .filter(Boolean) as Product[];

      return {
        prakritiSkinAnalysis: rawText,
        ayurvedicWisdom: getDefaultWisdom(lang),
        routine: [
          {
            step: 'Morning Cleansing',
            stepTitleLocalized: lang === 'hi' ? 'प्राकृतिक शुद्धि' : lang === 'gu' ? 'કુદરતી સફાઈ' : 'Botanical Cleansing',
            productName: recProducts[0]?.name || 'Neem & Tulsi Soap',
            recommendedProductId: recProducts[0]?.id || 'neem-tulsi-soap',
            whyThisProduct: 'Formulated with cold process botanical oils for gentle barrier preservation.',
            keyIngredients: ['Cold Pressed Coconut Oil', 'Neem Leaves', 'Tulsi Extract'],
            howToUse: 'Use daily with lukewarm water. Allow bar to dry on a slotted dish.'
          }
        ],
        lifestyleTips: getDefaultTips(lang),
        recommendedProducts: recProducts.length > 0 ? recProducts : (VERIFIED_PRODUCTS.slice(0, 3) as any),
        seasonalAdvice: getDefaultSeasonalAdvice(answers),
        patchTestWarning: I18N[lang].patchTestReminder
      };
    }
  } catch (err: any) {
    console.warn('Edge consultation failed:', err);
    throw new Error(
      lang === 'hi'
        ? 'आयुर्वेदिक AI परामर्शदाता वर्तमान में व्यस्त है। कृपया कुछ पलों बाद पुनः प्रयास करें या सीधे व्हाट्सएप पर परामर्श लें।'
        : lang === 'gu'
        ? 'આયુર્વેદિક AI સલાહકાર હાલમાં ઉપલબ્ધ નથી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો અથવા સીધા વોટ્સએપ પર સંપર્ક કરો.'
        : 'Our Ayurvedic AI advisor is temporarily undergoing scheduled maintenance. Please try again shortly or chat with our Vadodara team on WhatsApp (+91 97267 39515).'
    );
  }

  throw new Error('Unable to generate skincare routine.');
}

/**
 * Converse with ONZNATURAL Botanical AI
 */
export async function askOnzAI(
  userQuery: string,
  chatHistory: { role: 'user' | 'model'; text: string }[] = [],
  language: SupportedLanguage = 'en'
): Promise<AIChatResponse> {
  try {
    const edgeResult = await callEdgeFunction({
      action: 'chat',
      message: userQuery,
      history: chatHistory.slice(-8),
      language
    });

    if (edgeResult && (edgeResult.text || edgeResult.reply)) {
      const text = edgeResult.text || edgeResult.reply;
      let recommendedProductIds: string[] = edgeResult.recommendedProductIds || [];

      if (recommendedProductIds.length === 0) {
        VERIFIED_PRODUCTS.forEach(p => {
          const regex = new RegExp(`\\b(${p.name}|${p.id})\\b`, 'i');
          if (regex.test(text)) {
            recommendedProductIds.push(p.id);
          }
        });
      }

      return {
        text,
        recommendedProductIds: recommendedProductIds.slice(0, 3)
      };
    }
  } catch (err: any) {
    console.warn('Edge chat error:', err);
    const errorText =
      language === 'hi'
        ? 'क्षमा करें, हमारा बॉटनिकल AI परामर्शदाता क्षणिक रूप से उपलब्ध नहीं है। कृपया कुछ पलों बाद पुनः प्रयास करें या हमारी वडोदरा टीम से सीधे व्हाट्सएप (+91 97267 39515) पर सहायता प्राप्त करें।'
        : language === 'gu'
        ? 'માફ કરશો, અમારો વનસ્પતિ AI સલાહકાર ક્ષણભર માટે ઉપલબ્ધ નથી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો અથવા અમારી વડોદરા ટીમનો વોટ્સએપ (+91 97267 39515) પર સંપર્ક કરો.'
        : 'Our Botanical AI advisor is temporarily unavailable. Please try again shortly or connect directly with our Vadodara artisans on WhatsApp at +91 97267 39515.';

    return {
      text: errorText,
      recommendedProductIds: [],
      isError: true
    };
  }

  return {
    text: 'Please check your connection and try again.',
    recommendedProductIds: [],
    isError: true
  };
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

  try {
    const edgeResult = await callEdgeFunction({
      action: 'compare',
      product1Id,
      product2Id,
      language
    });

    if (edgeResult && (edgeResult.text || edgeResult.comparison)) {
      return edgeResult.text || edgeResult.comparison;
    }
  } catch (e) {
    console.warn('Edge comparison unavailable, providing verified botanical comparison.');
  }

  // Factual comparison grounded directly in verified database properties
  const isHi = language === 'hi';
  const isGu = language === 'gu';

  const heading = isHi
    ? `तुलना: ${p1.name} बनाम ${p2.name}`
    : isGu
    ? `સરખામણી: ${p1.name} વિરુદ્ધ ${p2.name}`
    : `Botanical Comparison: ${p1.name} vs ${p2.name}`;

  return `${heading}

• ${p1.name} (₹${p1.mrp} / ${p1.netWeightOrVol}):
  - ${isHi ? 'श्रेणी' : isGu ? 'કેટેગરી' : 'Category'}: ${p1.category}
  - ${isHi ? 'मुख्य तत्व' : isGu ? 'મુખ્ય ઘટકો' : 'Key Actives'}: ${p1.ingredients}
  - ${isHi ? 'लाभ' : isGu ? 'લાભો' : 'Benefits'}: ${p1.benefits.slice(0, 3).join(', ')}

• ${p2.name} (₹${p2.mrp} / ${p2.netWeightOrVol}):
  - ${isHi ? 'श्रेणी' : isGu ? 'કેટેગરી' : 'Category'}: ${p2.category}
  - ${isHi ? 'मुख्य तत्व' : isGu ? 'મુખ્ય ઘટકો' : 'Key Actives'}: ${p2.ingredients}
  - ${isHi ? 'लाभ' : isGu ? 'લાભો' : 'Benefits'}: ${p2.benefits.slice(0, 3).join(', ')}

${isHi ? 'दोनों उत्पाद वडोदरा में शुद्ध वनस्पति तेलों द्वारा हस्तनिर्मित हैं।' : isGu ? 'બંને ઉત્પાદનો વડોદરામાં શુદ્ધ વનસ્પતિ તેલમાંથી હાથબનાવટ છે.' : 'Both artisanal formulas are crafted in small batches in Vadodara without synthetic sulfates or artificial fragrance.'}`;
}

/**
 * Multimodal image analysis for skin concerns or product ingredient label comparison
 */
export async function analyzeSkinOrLabelImage(
  base64Image: { data: string; mimeType: string },
  userContext = '',
  language: SupportedLanguage = 'en'
): Promise<{ analysis: string; recommendedProductIds: string[] }> {
  try {
    const edgeResult = await callEdgeFunction({
      action: 'multimodal',
      image: base64Image,
      context: userContext,
      language
    });

    if (edgeResult && (edgeResult.text || edgeResult.analysis)) {
      return {
        analysis: edgeResult.text || edgeResult.analysis,
        recommendedProductIds: edgeResult.recommendedProductIds || []
      };
    }
  } catch (err: any) {
    console.warn('Edge multimodal error:', err);
    throw new Error(
      language === 'hi'
        ? 'छवि विश्लेषण सेवा वर्तमान में व्यस्त है। कृपया थोड़ी देर बाद पुनः प्रयास करें।'
        : language === 'gu'
        ? 'ઇમેજ વિશ્લેષણ સેવા હાલમાં ઉપલબ્ધ નથી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.'
        : 'Botanical image analysis is temporarily unavailable. Please try again shortly.'
    );
  }

  throw new Error('Image analysis failed.');
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

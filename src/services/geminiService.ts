// =====================================================================
// ONZNATURAL — High-Performance Botanical Skincare AI Service
// Powered by Server-Side Supabase Edge Function (gemini-consultant)
// Zero client-side API keys; falls back gracefully to deterministic engine
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
 * Check if server-side Edge Function AI service is configured
 */
export const hasGeminiApiKey = (): boolean => {
  return Boolean(supabase);
};

/**
 * Extract recommended product IDs from AI response text
 */
function extractProductIds(text: string): { cleanedText: string; ids: string[] } {
  let ids: string[] = [];
  let cleanedText = text;

  // Pattern: [RECOMMENDED: id1, id2] or [RECOMMENDED_IDS: "id1", "id2"]
  const tagRegex = /\[RECOMMENDED(?:_IDS)?:\s*([^\]]+)\]/i;
  const match = text.match(tagRegex);

  if (match) {
    const rawIds = match[1].split(',').map(s => s.replace(/["']/g, '').trim().toLowerCase());
    ids = rawIds.filter(id => VERIFIED_PRODUCTS.some(p => p.id === id));
    cleanedText = text.replace(tagRegex, '').trim();
  }

  // Fallback: If no tag found, scan text for product names or IDs
  if (ids.length === 0) {
    VERIFIED_PRODUCTS.forEach(p => {
      const nameRegex = new RegExp(`\\b${p.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      const idRegex = new RegExp(`\\b${p.id}\\b`, 'i');
      if (nameRegex.test(cleanedText) || idRegex.test(cleanedText)) {
        if (!ids.includes(p.id)) {
          ids.push(p.id);
        }
      }
    });
  }

  return { cleanedText, ids: ids.slice(0, 3) };
}

// =====================================================================
// 1. CONVERSATIONAL AI CHAT (askOnzAI)
// =====================================================================

export async function askOnzAI(
  userQuery: string,
  chatHistory: { role: 'user' | 'model'; text: string }[] = [],
  language: SupportedLanguage = 'en'
): Promise<AIChatResponse> {
  const trimmed = userQuery.trim();
  if (!trimmed) {
    return {
      text: language === 'hi' 
        ? 'कृपया अपना प्रश्न लिखें ताकि मैं आपकी त्वचा के अनुसार परामर्श दे सकूँ।' 
        : language === 'gu'
        ? 'કૃપા કરીને તમારો પ્રશ્ન પૂછો જેથી હું તમારી ત્વચા મુજબ સલાહ આપી શકું.'
        : 'Please ask a skincare question so I can recommend the right botanical ritual for you.',
      recommendedProductIds: []
    };
  }

  // Call secure server-side Supabase Edge Function
  if (supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-consultant', {
        body: {
          action: 'chat',
          message: trimmed,
          history: chatHistory.slice(-6),
          language
        }
      });
      if (!error && data && (data.text || data.reply)) {
        const text = data.text || data.reply;
        const { cleanedText, ids } = extractProductIds(text);
        const mergedIds = ids.length > 0 ? ids : (Array.isArray(data.recommendedProductIds) ? data.recommendedProductIds : []);
        return {
          text: cleanedText,
          recommendedProductIds: mergedIds.length > 0 ? mergedIds : getRelevantProductIdsForQuery(trimmed)
        };
      }
    } catch (e) {
      console.warn('Edge function AI chat unavailable; using verified local Ayurvedic engine.');
    }
  }

  // Resilient Local Ayurvedic Skincare Engine (Grounded strictly in verified catalogue)
  return generateLocalAyurvedicChatReply(trimmed, language);
}

// Backwards-compatible alias
export const askLavanyaAI = askOnzAI;

// =====================================================================
// 2. GUIDED SKINCARE QUIZ CONSULTATION (generateSkincareConsultation)
// =====================================================================

export async function generateSkincareConsultation(
  answers: SkincareQuizAnswers
): Promise<ConsultationResult> {
  const lang = answers.language || 'en';

  if (supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-consultant', {
        body: {
          action: 'quiz',
          quizAnswers: answers,
          language: lang
        }
      });

      if (!error && data && (data.text || data.reply)) {
        const rawText = data.text || data.reply;
        // Extract JSON if Edge Function returned structured JSON, otherwise use local deterministic builder enriched with server reply
        try {
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const recommendedProducts: Product[] = [];
            if (Array.isArray(parsed.routine)) {
              parsed.routine.forEach((step: RecommendedRoutineStep) => {
                const found = VERIFIED_PRODUCTS.find(
                  p => p.id === step.recommendedProductId || p.name.toLowerCase() === step.productName?.toLowerCase()
                );
                if (found && !recommendedProducts.some(p => p.id === found.id)) {
                  recommendedProducts.push(found as any);
                }
              });
            }
            if (recommendedProducts.length === 0) {
              recommendedProducts.push(...getMatchingProductsForQuiz(answers));
            }
            return {
              prakritiSkinAnalysis: parsed.prakritiSkinAnalysis || getDefaultAnalysis(answers),
              ayurvedicWisdom: parsed.ayurvedicWisdom || getDefaultWisdom(lang),
              routine: Array.isArray(parsed.routine) && parsed.routine.length > 0 ? parsed.routine : getDefaultRoutine(answers),
              lifestyleTips: Array.isArray(parsed.lifestyleTips) && parsed.lifestyleTips.length > 0 ? parsed.lifestyleTips : getDefaultTips(lang),
              recommendedProducts,
              seasonalAdvice: parsed.seasonalAdvice || getDefaultSeasonalAdvice(answers),
              patchTestWarning: parsed.patchTestWarning || I18N[lang].patchTestReminder,
              sensitivityNotes: answers.knownSensitivity !== 'none' ? getSensitivityNotice(answers.knownSensitivity, lang) : undefined
            };
          }
        } catch (parseErr) {
          // Proceed with deterministic routine enriched with server analysis text
          const fallback = buildLocalConsultationResult(answers);
          const { cleanedText } = extractProductIds(rawText);
          if (cleanedText.length > 40) {
            fallback.ayurvedicWisdom = cleanedText;
          }
          return fallback;
        }
      }
    } catch (err: any) {
      console.warn('Edge function consultation fallback to deterministic Ayurvedic engine.');
    }
  }

  return buildLocalConsultationResult(answers);
}

// =====================================================================
// 3. PRODUCT COMPARISON (compareProductsWithAI)
// =====================================================================

export async function compareProductsWithAI(
  product1Id: string,
  product2Id: string,
  language: SupportedLanguage = 'en'
): Promise<string> {
  const p1 = VERIFIED_PRODUCTS.find(p => p.id === product1Id);
  const p2 = VERIFIED_PRODUCTS.find(p => p.id === product2Id);

  if (!p1 || !p2) {
    return language === 'hi'
      ? 'तुलना के लिए चुने गए उत्पाद हमारी सूची में नहीं मिले।'
      : language === 'gu'
      ? 'સરખામણી માટે પસંદ કરેલી પ્રોડક્ટ મળી નથી.'
      : 'One or both products were not found in the verified catalogue.';
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-consultant', {
        body: {
          action: 'compare',
          product1Id,
          product2Id,
          language
        }
      });
      if (!error && data && (data.text || data.reply)) {
        const { cleanedText } = extractProductIds(data.text || data.reply);
        if (cleanedText.length > 20) return cleanedText;
      }
    } catch (e) {
      console.warn('Edge function comparison fell back to verified factual catalogue comparison.');
    }
  }

  return buildLocalProductComparison(p1, p2, language);
}

// =====================================================================
// 4. MULTIMODAL IMAGE & LABEL ANALYSIS (analyzeSkinOrLabelImage)
// =====================================================================

export async function analyzeSkinOrLabelImage(
  base64Image: { data: string; mimeType: string },
  userContext = '',
  language: SupportedLanguage = 'en'
): Promise<{ analysis: string; recommendedProductIds: string[] }> {
  if (supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-consultant', {
        body: {
          action: 'image',
          message: userContext,
          image: base64Image,
          language
        }
      });

      if (!error && data && (data.text || data.reply)) {
        const { cleanedText, ids } = extractProductIds(data.text || data.reply);
        const mergedIds = ids.length > 0 ? ids : (Array.isArray(data.recommendedProductIds) ? data.recommendedProductIds : []);
        return {
          analysis: cleanedText,
          recommendedProductIds: mergedIds.length > 0 ? mergedIds : ['neem-tulsi-soap', 'kesuda-palash-soap']
        };
      }
    } catch (err: any) {
      console.warn('Edge function multimodal analysis fell back to local botanical advisory.');
    }
  }

  return getLocalImageAnalysisFallback(userContext, language);
}

// =====================================================================
// INTELLIGENT LOCAL AYURVEDIC ENGINE (FALLBACK & ZERO-FAILURE HANDLER)
// =====================================================================

function getRelevantProductIdsForQuery(query: string): string[] {
  const q = query.toLowerCase();
  const ids: string[] = [];

  if (q.includes('pimples') || q.includes('acne') || q.includes('oily') || q.includes('कील') || q.includes('ખીલ') || q.includes('neem') || q.includes('tulsi')) {
    ids.push('neem-tulsi-soap', 'face-body-wash-neem-tulsi');
  }
  if (q.includes('heat') || q.includes('rash') || q.includes('summer') || q.includes('घमौरी') || q.includes('અળાઈ') || q.includes('kesuda') || q.includes('palash')) {
    ids.push('kesuda-palash-soap', 'kesuda-body-lotion', 'face-body-wash-kesuda');
  }
  if (q.includes('tan') || q.includes('glow') || q.includes('bright') || q.includes('turmeric') || q.includes('टैन') || q.includes('ટૅન') || q.includes('ubtan')) {
    ids.push('ubtan-soap', 'rice-aloe-face-cream');
  }
  if (q.includes('dry') || q.includes('winter') || q.includes('flaky') || q.includes('सूखा') || q.includes('સૂકી') || q.includes('lotion') || q.includes('cream')) {
    ids.push('rice-aloe-face-cream', 'lavender-body-lotion', 'aparajita-body-cream');
  }
  if (q.includes('soap') || q.includes('glycerin') || q.includes('cold process') || q.includes('साबुन') || q.includes('સાબુ')) {
    ids.push('neem-tulsi-soap', 'kesuda-palash-soap', 'ubtan-soap');
  }

  return ids.length > 0 ? ids.slice(0, 3) : ['neem-tulsi-soap', 'kesuda-palash-soap', 'rice-aloe-face-cream'];
}

function generateLocalAyurvedicChatReply(
  query: string,
  lang: SupportedLanguage
): AIChatResponse {
  const q = query.toLowerCase();

  // 1. Heat Rash / Summer / Itching
  if (q.includes('heat') || q.includes('rash') || q.includes('summer') || q.includes('itching') || q.includes('घमौर') || q.includes('अळाई') || q.includes('ખંજવાળ') || q.includes('kesuda')) {
    if (lang === 'hi') {
      return {
        text: 'गर्मी और घमौरियों के लिए ONZNATURAL का केसूड़ा (पलाश) साबुन सर्वोत्तम है। पलाश के फूलों का पारंपरिक अर्क त्वचा के पित्त दोष को शांत कर प्राकृतिक शीतलता प्रदान करता है। कोल्ड-प्रोसेस साबुनीकरण से इसमें प्राकृतिक ग्लिसरीन सुरक्षित रहता है, जिससे त्वचा में खिंचाव या जलन नहीं होती।\n\nउपयोग विधि: दिन में दो बार गुनगुने या सामान्य जल से स्नान करें और साबुन को जालीदार सूखी साबुनदानी पर रखें।',
        recommendedProductIds: ['kesuda-palash-soap', 'kesuda-body-lotion', 'face-body-wash-kesuda']
      };
    } else if (lang === 'gu') {
      return {
        text: 'ઉનાળાની ગરમી, અળાઈ અને ખંજવાળ માટે ONZNATURAL કેસૂડાં (પલાશ) સાબુ અતિ ઉત્તમ છે. ખાખરાના ફૂલોનો અર્ક શરીરની ગરમી ઘટાડી ત્વચાને કુદરતી ઠંડક આપે છે. વડોદરામાં હાથબનાવટ આ સાબુમાં શુદ્ધ વનસ્પતિ ગ્લિસરિન સચવાય છે, જેથી સ્નાન પછી ત્વચા સુકાતી નથી.\n\nકેસૂડાં સાબુ સાથે સ્નાન કરો અને સાબુને પાણી ન ભરાય તેવી સાબુદાની પર રાખો.',
        recommendedProductIds: ['kesuda-palash-soap', 'kesuda-body-lotion', 'face-body-wash-kesuda']
      };
    }
    return {
      text: 'For summer heat rash, prickly heat, and sun-induced irritation, our handcrafted Kesuda (Palash Flower) Soap is the ideal Ayurvedic remedy. Palash blossoms have been revered in Gujarat for centuries for calming aggravated Pitta and delivering soothing botanical cooling. Handcrafted in Vadodara with cold-pressed coconut oil, it retains 100% natural vegetable glycerin to restore comfort without dryness.\n\nTip: Store your cold-process bar on a slotted soap dish away from direct shower spray to maximize longevity.',
      recommendedProductIds: ['kesuda-palash-soap', 'kesuda-body-lotion', 'face-body-wash-kesuda']
    };
  }

  // 2. Acne, Pimples, Blemishes, Oily Skin
  if (q.includes('acne') || q.includes('pimple') || q.includes('oil') || q.includes('blemish') || q.includes('मुँहासे') || q.includes('पिंपल') || q.includes('ખીલ') || q.includes('neem')) {
    if (lang === 'hi') {
      return {
        text: 'मुँहासों और तैलीय त्वचा के लिए हमारा नीम और तुलसी कोल्ड प्रोसेस साबुन सबसे प्रभावी है। नीम के जीवाणुरोधी तत्व बंद रोमछिद्रों को गहराई से शुद्ध करते हैं, जबकि तुलसी अतिरिक्त सीबम को संतुलित करती है। इसके पश्चात प्राकृतिक नमी हेतु राइस एवं एलोवेरा फेस क्रीम की हल्की परत लगाएं।\n\nसफाई के बाद साबुनदानी पर रखें और नए प्रयोग से पूर्व 24 घंटे का पैच टेस्ट अवश्य करें।',
        recommendedProductIds: ['neem-tulsi-soap', 'face-body-wash-neem-tulsi', 'rice-aloe-face-cream']
      };
    } else if (lang === 'gu') {
      return {
        text: 'ખીલ, તેલી ત્વચા અને કાળા ડાઘ માટે ONZNATURAL લીમડો અને તુલસી સાબુ સૌથી શ્રેષ્ઠ છે. કડવો લીમડો ત્વચાના છિદ્રોની ઊંડી સફાઈ કરે છે અને તુલસી વધારાના તેલને નિયંત્રિત કરે છે. શુદ્ધ કોલ્ડ-પ્રોસેસ પદ્ધતિથી બનતો હોવાથી ત્વચા કુદરતી રીતે કોમળ રહે છે.\n\nચહેરો ધોયા પછી રાઈસ એલોવેરા ફેસ ક્રીમ વાપરી શકાય છે.',
        recommendedProductIds: ['neem-tulsi-soap', 'face-body-wash-neem-tulsi', 'rice-aloe-face-cream']
      };
    }
    return {
      text: 'For active blemishes, enlarged pores, and excess sebum, our Neem & Tulsi Cold Process Soap provides deep Ayurvedic purification. Pure cold-pressed neem oil clarifies clogged pores and balances Kapha-Pitta excess, while organic Tulsi neutralizes oxidative stress. Unlike harsh commercial soaps, retained vegetable glycerin ensures your skin barrier remains supple rather than stripped.\n\nFollow with a light layer of Rice & Aloe Vera Face Cream for balanced, non-greasy hydration.',
      recommendedProductIds: ['neem-tulsi-soap', 'face-body-wash-neem-tulsi', 'rice-aloe-face-cream']
    };
  }

  // 3. Tan, Pigmentation, Bridal Glow
  if (q.includes('tan') || q.includes('glow') || q.includes('pigment') || q.includes('bright') || q.includes('ubtan') || q.includes('टैन') || q.includes('निखार') || q.includes('ચમક')) {
    if (lang === 'hi') {
      return {
        text: 'धूप से टैनिंग और सुस्त त्वचा में प्राकृतिक निखार लाने के लिए शाही उबटन साबुन (Royal Ubtan Soap) और गुड़हल (Hibiscus) साबुन अत्यंत लाभकारी हैं। बेसन और कस्तूरी हल्दी मृत कोशिकाओं को सौम्यता से हटाते हैं, जबकि दूध और मुल्तानी मिट्टी त्वचा को मखमली मुलायम बनाते हैं।\n\nचेहरे और शरीर पर हल्के हाथों से झाग बनाकर 1 मिनट रखें, फिर ताजे पानी से धो लें।',
        recommendedProductIds: ['ubtan-soap', 'hibiscus-soap', 'rice-aloe-face-cream']
      };
    } else if (lang === 'gu') {
      return {
        text: 'સૂર્યપ્રકાશથી થતા કાળાશ (ટેનિંગ) અને નિસ્તેજ ત્વચામાં કુદરતી તેજ લાવવા અમારો શાહી ઉબટન સાબુ અને જાસૂદ (Hibiscus) સાબુ ઉત્તમ છે. ચણાનો લોટ, હળદર, દૂધ અને મુલતાની માટીથી ભરપૂર આ સાબુ ત્વચાને કુદરતી સુવર્ણ નિખાર આપે છે.\n\nહળવા હાથે ફીણ કરી મોં-શરીર પર લગાવી ધોઈ લો.',
        recommendedProductIds: ['ubtan-soap', 'hibiscus-soap', 'rice-aloe-face-cream']
      };
    }
    return {
      text: 'To clear sun tanning and reveal a luminous, even complexion, our Royal Ubtan Soap and Hibiscus Soap offer time-tested Ayurvedic exfoliation. Pure besan and haldi buff away oxidized surface cells, while cold-pressed kokum butter and milk fats leave skin soft with a healthy golden glow.\n\nComplete the ritual with Rice & Aloe Vera Face Cream to lock in brightness.',
      recommendedProductIds: ['ubtan-soap', 'hibiscus-soap', 'rice-aloe-face-cream']
    };
  }

  // 4. Dry Skin, Barrier Repair, Winter
  if (q.includes('dry') || q.includes('tight') || q.includes('flak') || q.includes('moistur') || q.includes('रूखी') || q.includes('સુકી') || q.includes('lotion')) {
    if (lang === 'hi') {
      return {
        text: 'रूखी और खिंची हुई त्वचा (वात दोष) को गहरे वनस्पति पोषण की आवश्यकता होती है। इसके लिए हमारा राइस एवं एलोवेरा फेस क्रीम और लैवेंडर बॉडी लोशन सर्वोत्तम है। हमारे सभी कोल्ड प्रोसेस साबुनों में कोकम बटर और प्राकृतिक ग्लिसरीन होने से धोने के बाद भी त्वचा नरम रहती है।\n\nस्नान के तुरंत बाद हल्की नम त्वचा पर लोशन लगाएं।',
        recommendedProductIds: ['rice-aloe-face-cream', 'lavender-body-lotion', 'aparajita-body-cream']
      };
    } else if (lang === 'gu') {
      return {
        text: 'સૂકી અને ખેંચાણવાળી ત્વચા માટે ONZNATURAL રાઈસ એલોવેરા ફેસ ક્રીમ અને લવંડર બોડી લોશન શ્રેષ્ઠ પોષણ પૂરું પાડે છે. કોકમ બટર અને શુદ્ધ નાળિયેર તેલ ત્વચાના મોઇશ્ચર બેરિયરને મજબૂત રાખે છે.\n\nસ્નાન કર્યા પછી તરત જ ભીની ત્વચા પર બોડી લોશન લગાવો.',
        recommendedProductIds: ['rice-aloe-face-cream', 'lavender-body-lotion', 'aparajita-body-cream']
      };
    }
    return {
      text: 'For dry, tight, or flaky skin (Vata imbalance), our rich barrier-protecting formulas restore essential lipids. The Rice & Aloe Vera Face Cream hydrates deeply without greasiness, while pure Lavender Body Lotion soothes the whole body. Because our artisanal soaps retain 100% natural vegetable glycerin, they never cause the stripping tightness common with store-bought bars.\n\nApply moisturizer immediately over damp skin after bathing to seal in hydration.',
      recommendedProductIds: ['rice-aloe-face-cream', 'lavender-body-lotion', 'aparajita-body-cream']
    };
  }

  // 5. Default General Botanical Advice
  if (lang === 'hi') {
    return {
      text: 'नमस्ते! ONZNATURAL में आपका स्वागत है। वडोदरा में शुद्ध वनस्पति तेलों (नारियल, महुआ, अरंडी) व कोकम बटर से धीमी गति से हस्तनिर्मित हमारे कोल्ड-प्रोसेस साबुन 100% प्राकृतिक ग्लिसरीन को सुरक्षित रखते हैं। हमारे सभी उत्पाद सल्फेट, पैराबेन और कृत्रिम सुगंध से पूर्णतः मुक्त हैं।\n\nआप अपनी त्वचा का प्रकार (तैलीय, रूखा, संवेदनशील) या विशिष्ट चिंता (मुँहासे, घमौरियाँ, टैनिंग) साझा कर सकते हैं ताकि मैं आपके लिए उपयुक्त उत्पाद का सुझाव दे सकूँ।',
      recommendedProductIds: ['kesuda-palash-soap', 'neem-tulsi-soap', 'rice-aloe-face-cream']
    };
  } else if (lang === 'gu') {
    return {
      text: 'નમસ્તે! ONZNATURAL માં આપનું સ્વાગત છે. વડોદરામાં શુદ્ધ વનસ્પતિ તેલ અને કોકમ બટર દ્વારા પરંપરાગત કોલ્ડ-પ્રોસેસ પદ્ધતિથી તૈયાર અમારા સાબુ ૧૦૦% કુદરતી ગ્લિસરિન જાળવી રાખે છે. તે સલ્ફેટ, પેરાબેન કે રસાયણો રહિત છે.\n\nતમારી ત્વચાનો પ્રકાર (તેલી, સૂકી, નાજુક) અથવા સમસ્યા (ખીલ, અળાઈ, કાળાશ) જણાવો જેથી શ્રેષ્ઠ આયુર્વેદિક કેર સૂચવી શકું.',
      recommendedProductIds: ['kesuda-palash-soap', 'neem-tulsi-soap', 'rice-aloe-face-cream']
    };
  }

  return {
    text: 'Namaste! Welcome to ONZNATURAL. Handcrafted in artisanal small batches in Vadodara, Gujarat, our botanical skincare uses slow cold-process saponification to retain 100% of the skin-softening vegetable glycerin naturally formed from coconut, mahua, and castor oils. Every formula is free of synthetic sulfates, parabens, phthalates, and harsh detergents.\n\nPlease let me know your skin type or concerns (e.g. blemishes, heat rash, dry skin, tan reduction) and I will prepare a personalized botanical routine for you.',
    recommendedProductIds: ['kesuda-palash-soap', 'neem-tulsi-soap', 'rice-aloe-face-cream']
  };
}

function getMatchingProductsForQuiz(answers: SkincareQuizAnswers): Product[] {
  const ids: string[] = [];
  if (answers.skinType === 'oily' || answers.primaryConcern === 'acne_blemishes') {
    ids.push('neem-tulsi-soap', 'rice-aloe-face-cream', 'charcoal-rice-soap');
  } else if (answers.primaryConcern === 'heat_rash' || answers.climateSeason === 'summer_heat') {
    ids.push('kesuda-palash-soap', 'kesuda-body-lotion', 'face-body-wash-kesuda');
  } else if (answers.primaryConcern === 'tan_pigmentation') {
    ids.push('ubtan-soap', 'hibiscus-soap', 'rice-aloe-face-cream');
  } else {
    ids.push('kesuda-palash-soap', 'rice-aloe-face-cream', 'lavender-body-lotion');
  }

  const result = ids.map(id => VERIFIED_PRODUCTS.find(p => p.id === id)).filter(Boolean) as Product[];
  return result.length > 0 ? result : (VERIFIED_PRODUCTS.slice(0, 3) as any);
}

function buildLocalConsultationResult(answers: SkincareQuizAnswers): ConsultationResult {
  const lang = answers.language || 'en';
  const products = getMatchingProductsForQuiz(answers);
  const routine = getDefaultRoutine(answers);

  return {
    prakritiSkinAnalysis: getDefaultAnalysis(answers),
    ayurvedicWisdom: getDefaultWisdom(lang),
    routine,
    lifestyleTips: getDefaultTips(lang),
    recommendedProducts: products,
    seasonalAdvice: getDefaultSeasonalAdvice(answers),
    patchTestWarning: I18N[lang].patchTestReminder,
    sensitivityNotes: answers.knownSensitivity !== 'none' ? getSensitivityNotice(answers.knownSensitivity, lang) : undefined
  };
}

function getDefaultRoutine(answers: SkincareQuizAnswers): RecommendedRoutineStep[] {
  const isHi = answers.language === 'hi';
  const isGu = answers.language === 'gu';

  const cleanserId = (answers.skinType === 'oily' || answers.primaryConcern === 'acne_blemishes')
    ? 'neem-tulsi-soap'
    : (answers.primaryConcern === 'heat_rash' || answers.climateSeason === 'summer_heat')
    ? 'kesuda-palash-soap'
    : answers.primaryConcern === 'tan_pigmentation'
    ? 'ubtan-soap'
    : 'kesuda-palash-soap';

  const cleanser = VERIFIED_PRODUCTS.find(p => p.id === cleanserId) || VERIFIED_PRODUCTS[0];

  return [
    {
      step: 'Morning Cleansing',
      stepTitleLocalized: isHi ? 'प्रातःकालीन सौम्य शुद्धि' : isGu ? 'સવારની કુદરતી સફાઈ' : 'Morning Botanical Cleansing',
      recommendedProductId: cleanser.id,
      productName: cleanser.name,
      whyThisProduct: isHi
        ? 'कोल्ड-प्रोसेस ग्लिसरीन युक्त साबुन त्वचा के प्राकृतिक सुरक्षात्मक सीबम को छीने बिना सौम्य शुद्धि करता है।'
        : isGu
        ? 'કોલ્ડ-પ્રોસેસ પદ્ધતિમાં કુદરતી ગ્લિસરિન સચવાતું હોવાથી ત્વચા ધોયા પછી ખેંચાતી કે સુકાતી નથી.'
        : 'Slow-cured cold process bar preserves 100% natural glycerin to purify without stripping the barrier.',
      keyIngredients: cleanser.ingredients.split(',').map(s => s.trim()).slice(0, 3),
      howToUse: isHi
        ? 'गुनगुने पानी से हाथों में झाग बनाएं, चेहरे व शरीर पर हल्के से लगाएं और धो लें। सूखी साबुनदानी पर रखें।'
        : isGu
        ? 'સામાન્ય પાણીથી ફીણ બનાવી મોં-શરીર પર લગાવી ધોઈ લો. સૂકી સાબુદાની પર રાખો.'
        : 'Lather between damp palms with lukewarm water. Cleanse gently, rinse well, and let dry on a slotted dish.'
    },
    {
      step: 'Morning Moisture & Protection',
      stepTitleLocalized: isHi ? 'प्रातःकालीन पोषण एवं सुरक्षा' : isGu ? 'સવારનું પોષણ અને રક્ષણ' : 'Morning Barrier Moisture',
      recommendedProductId: 'rice-aloe-face-cream',
      productName: 'Rice & Aloe Vera Face Cream',
      whyThisProduct: isHi
        ? 'एलोवेरा और चावल का अर्क चिपचिपाहट के बिना गहरी नमी व प्राकृतिक चमक प्रदान करता है।'
        : isGu
        ? 'ચોખાનો અર્ક અને એલોવેરા ત્વચાને ચીકાશ વગર નરમાઈ અને કુદરતી તેજ આપે છે.'
        : 'Lightweight botanical hydration enriched with Aloe Vera and Rice Extract for calm barrier balance.',
      keyIngredients: ['Pure Aloe Vera', 'Rice Powder Extract', 'Kokum Butter'],
      howToUse: isHi
        ? 'थोड़ी मात्रा में उंगलियों पर लें और चेहरे व गर्दन पर ऊपर की ओर हल्के हाथों से मसाज करें।'
        : isGu
        ? 'થોડી ક્રીમ લઈ ચહેરા અને ગરદન પર હળવા હાથે લગાવો.'
        : 'Dot a pea-sized amount over face and neck, pressing gently upwards until absorbed.'
    },
    {
      step: 'Evening Nourishment',
      stepTitleLocalized: isHi ? 'सायंकालीन प्राकृतिक विश्राम' : isGu ? 'સાંજનું કુદરતી પોષણ' : 'Evening Botanical Recovery',
      recommendedProductId: answers.routinePreference === 'comprehensive' ? 'lavender-body-lotion' : 'lip-balm',
      productName: answers.routinePreference === 'comprehensive' ? 'Lavender Body Lotion' : 'Nourishing Lip Balm',
      whyThisProduct: isHi
        ? 'रात्रि विश्राम के दौरान त्वचा की नमी को पुनर्स्थापित करता है।'
        : isGu
        ? 'રાત્રિ દરમિયાન ત્વચાને કુદરતી પોષણ આપી કોમળ બનાવે છે.'
        : 'Soothes daily stress and seals in overnight lipid recovery.',
      keyIngredients: ['Plant Oils', 'Kokum Butter', 'Botanical Actives'],
      howToUse: isHi
        ? 'सोने से पूर्व साफ त्वचा पर लगाएं।'
        : isGu
        ? 'સૂતા પહેલાં સાફ ત્વચા પર લગાવો.'
        : 'Smooth gently over clean skin before resting.'
    }
  ];
}

function getDefaultAnalysis(answers: SkincareQuizAnswers): string {
  const isOily = answers.skinType === 'oily';
  if (answers.language === 'hi') {
    return isOily
      ? 'आपकी त्वचा पित्त-कफ प्रधान है जिसमें अतिरिक्त तेल व मुँहासों की प्रवृत्ति रहती है। इसे प्राकृतिक नीम व तुलसी द्वारा सौम्य शुद्धि और राइस-एलोवेरा के हल्के पोषण की आवश्यकता है।'
      : 'आपकी त्वचा को सौम्य प्राकृतिक नमी व कोकम बटर के संरक्षण की आवश्यकता है जिससे वात दोष शांत रहे और प्राकृतिक ग्लिसरीन सुरक्षित रहे।';
  } else if (answers.language === 'gu') {
    return isOily
      ? 'તમારી ત્વચા પિત્ત-કફ પ્રકૃતિ ધરાવે છે જેમાં વધારાનું તેલ નિયંત્રિત કરવા લીમડો અને તુલસી જેવા વનસ્પતિ ઘટકો શ્રેષ્ઠ છે.'
      : 'તમારી ત્વચાને કુદરતી ગ્લિસરિન અને કોકમ બટરના પોષણની જરૂર છે જેથી વાયુ દોષ શાંત રહે અને ત્વચા કોમળ રહે.';
  }
  return isOily
    ? 'Your skin reflects a Pitta-Kapha balance prone to excess sebum and surface heat. Gentle botanical clarification with Neem & Tulsi preserves barrier lipids without over-drying.'
    : 'Your skin thrives with nourishing plant butters and slow-cured vegetable glycerin to soothe Vata tendencies and maintain deep moisture integrity.';
}

function getDefaultWisdom(lang: SupportedLanguage): string {
  if (lang === 'hi') {
    return 'पारंपरिक कोल्ड-प्रोसेस साबुनीकरण विधि में वनस्पति तेलों (नारियल, महुआ, अरंडी) से उत्पन्न 100% प्राकृतिक ग्लिसरीन साबुन में ही सुरक्षित रहता है, जिससे त्वचा धोने के बाद खिंची-खिंची या रूखी नहीं होती।';
  } else if (lang === 'gu') {
    return 'પરંપરાગત કોલ્ડ-પ્રોસેસ પદ્ધતિમાં વનસ્પતિ તેલમાંથી ઉત્પન્ન થતું ૧૦૦% કુદરતી ગ્લિસરિન સાબુમાં જ સચવાય છે, જેથી સ્નાન પછી ત્વચા સુકાતી નથી.';
  }
  return 'Artisanal cold-process saponification preserves 100% of the natural vegetable glycerin naturally produced from coconut and mahua oils, leaving skin soft rather than stripped.';
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
    'Wash with lukewarm or room-temperature water to protect your lipid barrier.',
    'Always perform a 24-hour patch test before using any new botanical product.'
  ];
}

function getDefaultSeasonalAdvice(answers: SkincareQuizAnswers): string {
  if (answers.language === 'hi') {
    return answers.climateSeason === 'summer_heat'
      ? 'गर्मी के मौसम में केसूड़ा (पलाश) का साबुन पसीने और घमौरियों से त्वचा को प्राकृतिक शीतलता प्रदान करता है।'
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

function getSensitivityNotice(sens: string, lang: SupportedLanguage): string {
  if (lang === 'hi') {
    return `संवेदनशीलता सूचना (${sens}): कृपया पूर्ण उपयोग से 24 घंटे पूर्व अपनी कलाई पर पैच टेस्ट अवश्य करें।`;
  } else if (lang === 'gu') {
    return `સંવેદનશીલતા નોંધ (${sens}): ઉપયોગ કરતાં પહેલાં ૨૪ કલાકનો કાંડા પર પેચ ટેસ્ટ અવશ્ય કરો.`;
  }
  return `Sensitivity Note (${sens}): Formulated purely with gentle botanicals. Always perform a 24-hour patch test on the inner wrist prior to facial use.`;
}

function buildLocalProductComparison(p1: any, p2: any, language: SupportedLanguage): string {
  const isHi = language === 'hi';
  const isGu = language === 'gu';

  const heading = isHi
    ? `तुलनात्मक समीक्षा: ${p1.name} बनाम ${p2.name}`
    : isGu
    ? `સરખામણી સમીક્ષા: ${p1.name} વિરુદ્ધ ${p2.name}`
    : `Botanical Comparison: ${p1.name} vs ${p2.name}`;

  return `${heading}

• ${p1.name} (₹${p1.mrp} / ${p1.netWeightOrVol}):
  - ${isHi ? 'श्रेणी' : isGu ? 'કેટેગરી' : 'Category'}: ${p1.category}
  - ${isHi ? 'मुख्य सक्रिय तत्व' : isGu ? 'મુખ્ય સક્રિય ઘટકો' : 'Key Actives'}: ${p1.ingredients}
  - ${isHi ? 'प्राथमिक लाभ' : isGu ? 'મુખ્ય ફાયદા' : 'Key Benefits'}: ${p1.benefits.slice(0, 3).join(', ')}

• ${p2.name} (₹${p2.mrp} / ${p2.netWeightOrVol}):
  - ${isHi ? 'श्रेणी' : isGu ? 'કેટેગરી' : 'Category'}: ${p2.category}
  - ${isHi ? 'मुख्य सक्रिय तत्व' : isGu ? 'મુખ્ય સક્રિય ઘટકો' : 'Key Actives'}: ${p2.ingredients}
  - ${isHi ? 'प्राथमिक लाभ' : isGu ? 'મુખ્ય ફાયદા' : 'Key Benefits'}: ${p2.benefits.slice(0, 3).join(', ')}

${isHi 
  ? 'दोनों उत्पाद वडोदरा में शुद्ध वनस्पति तेलों द्वारा धीमी गति से हस्तनिर्मित हैं और इनमें 100% प्राकृतिक ग्लिसरीन सुरक्षित रहता है।' 
  : isGu 
  ? 'બંને ઉત્પાદનો વડોદરામાં શુદ્ધ વનસ્પતિ તેલ અને કોકમ બટર દ્વારા હાથબનાવટ છે અને ૧૦૦% કુદરતી ગ્લિસરિન જાળવી રાખે છે.' 
  : 'Both formulas are crafted in small artisanal batches in Vadodara, Gujarat using traditional cold-process methods with zero synthetic sulfates or parabens.'}`;
}

function getLocalImageAnalysisFallback(context: string, lang: SupportedLanguage): { analysis: string; recommendedProductIds: string[] } {
  if (lang === 'hi') {
    return {
      analysis: 'छवि विश्लेषण के आधार पर: यदि यह संघटक लेबल है, तो इसमें वाणिज्यिक सल्फेट (SLS) या सिंथेटिक डिटर्जेंट हो सकते हैं जो त्वचा से प्राकृतिक नमी छीन लेते हैं। ONZNATURAL के कोल्ड-प्रोसेस साबुन 100% वनस्पति ग्लिसरीन युक्त होते हैं जो त्वचा के सुरक्षात्मक स्तर की रक्षा करते हैं। त्वचा पर नए उत्पाद के उपयोग से पूर्व 24 घंटे का पैच टेस्ट करें।',
      recommendedProductIds: ['kesuda-palash-soap', 'neem-tulsi-soap']
    };
  } else if (lang === 'gu') {
    return {
      analysis: 'ઇમેજ વિશ્લેષણ: જો આ ઘટકોનું લેબલ હોય, તો વ્યવસાયિક સાબુમાં રહેલા કઠોર રસાયણો ત્વચાની કુદરતી નમી છીનવી લે છે. ONZNATURAL ના હાથબનાવટ સાબુ કુદરતી ગ્લિસરિન જાળવી રાખે છે જેથી ત્વચા સુરક્ષિત રહે. કોઈપણ નવી પ્રોડક્ટ વાપરતા પહેલાં ૨૪ કલાકનો પેચ ટેસ્ટ અવશ્ય કરો.',
      recommendedProductIds: ['kesuda-palash-soap', 'neem-tulsi-soap']
    };
  }
  return {
    analysis: 'Image botanical evaluation: Commercial formulations often contain synthetic sulfates (SLS/SLES) and harsh foam boosters that strip essential lipids. ONZNATURAL cold-process bars preserve 100% natural vegetable glycerin with cold-pressed coconut oil, mahua oil, and kokum butter for gentle barrier restoration. Always perform a 24-hour wrist patch test before use.',
    recommendedProductIds: ['kesuda-palash-soap', 'neem-tulsi-soap']
  };
}

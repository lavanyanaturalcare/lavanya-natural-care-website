import { productsData } from './products';
import { ingredientsData } from './ingredients';
import { Product, Ingredient } from '../types';

export type SupportedLanguage = 'en' | 'hi' | 'gu';

export interface VerifiedProductKnowledge {
  id: string;
  name: string;
  hindiName?: string;
  gujaratiName?: string;
  category: Product['category'];
  mrp: number;
  discountPrice?: number;
  netWeightOrVol: string;
  image: string;
  shortDescription: string;
  fullDescription: string;
  ingredients: string;
  benefits: string[];
  threeMainBenefits: [string, string, string];
  howToUse: string;
  isFeatured?: boolean;
}

export interface VerifiedIngredientKnowledge {
  id: string;
  name: string;
  hindiName: string;
  gujaratiName: string;
  description: string;
  benefits: string[];
  usedInProductIds: string[];
}

export const VERIFIED_BOTANICALS: VerifiedIngredientKnowledge[] = [
  {
    id: 'kesuda',
    name: 'Kesuda / Palash (Flame of the Forest)',
    hindiName: 'केसूड़ा / पलाश',
    gujaratiName: 'કેસૂડાં / પલાશ (ખાખરો)',
    description: 'Revered Indian botanical known for natural cooling, soothing heat rash, and calming irritated skin in warm weather.',
    benefits: ['Soothes heat rashes and sunburns', 'Naturally cooling for hot and humid climates', 'Rich in botanical antioxidants'],
    usedInProductIds: ['kesuda-soap', 'face-body-wash-kesuda', 'body-cream-kesuda']
  },
  {
    id: 'neem',
    name: 'Neem Oil & Leaves',
    hindiName: 'नीम',
    gujaratiName: 'લીમડો (કડવો લીમડો)',
    description: 'Ayurveda’s legendary purifying tree known for deep pore cleansing, clarifying excess sebum, and balancing blemish-prone skin.',
    benefits: ['Deeply purifies and clarifies clogged pores', 'Helps balance excess oil and pimples', 'Protects against environmental grime'],
    usedInProductIds: ['neem-tulsi-soap', 'face-body-wash-neem-tulsi']
  },
  {
    id: 'tulsi',
    name: 'Tulsi (Holy Basil)',
    hindiName: 'तुलसी',
    gujaratiName: 'તુલસી (પવિત્ર તુલસી)',
    description: 'Antioxidant-rich botanical that revitalizes dull skin, fights oxidative stress, and leaves skin fresh and energized.',
    benefits: ['Antioxidant botanical protection', 'Revitalizes tired and dull complexion', 'Keeps skin fresh and refreshed'],
    usedInProductIds: ['neem-tulsi-soap', 'face-body-wash-neem-tulsi']
  },
  {
    id: 'hibiscus',
    name: 'Hibiscus Flower Powder',
    hindiName: 'गुड़हल का फूल',
    gujaratiName: 'જાસૂદ ફૂલ',
    description: 'Packed with natural organic alpha-hydroxy acids (AHAs) and plant antioxidants for firm, smooth, and glowing skin.',
    benefits: ['Natural plant AHA gentle exfoliation', 'Revitalizes dull complexions for radiant glow', 'Maintains skin elasticity'],
    usedInProductIds: ['hibiscus-soap']
  },
  {
    id: 'rice',
    name: 'Rice Powder & Extract',
    hindiName: 'चावल का आटा / अर्क',
    gujaratiName: 'ચોખાનો લોટ / અર્ક',
    description: 'Time-tested Asian beauty secret for gentle micro-exfoliation, refining rough texture, and luminous radiance.',
    benefits: ['Ultra-gentle non-abrasive micro-polishing', 'Brightens uneven tone and dull spots', 'Softens texture naturally'],
    usedInProductIds: ['rice-aloe-face-cream', 'charcoal-rice-soap']
  },
  {
    id: 'aloe-vera',
    name: 'Pure Aloe Vera Gel & Juice',
    hindiName: 'घृतकुमारी (एलोवेरा)',
    gujaratiName: 'કુંવારપાઠું (એલોવેરા)',
    description: 'Delivers lightweight, soothing hydration without greasiness, calming redness and locking in moisture.',
    benefits: ['Deep, oil-free hydration', 'Cools and calms sensitive skin', 'Maintains natural moisture barrier'],
    usedInProductIds: ['rice-aloe-face-cream']
  },
  {
    id: 'charcoal',
    name: 'Activated Bamboo Charcoal',
    hindiName: 'ऐक्टिवेटेड चारकोल',
    gujaratiName: 'સક્રિય ચારકોલ (કોલસો)',
    description: 'Porosity-rich activated charcoal acts like a natural magnet to pull dirt, urban pollution, and excess sebum from pores.',
    benefits: ['Draws out deep-seated pore impurities', 'Balances excess oiliness and blackheads', 'Leaves skin squeaky-clean yet soft'],
    usedInProductIds: ['charcoal-rice-soap']
  },
  {
    id: 'ubtan-blend',
    name: 'Royal Ubtan (Besan, Haldi, Milk & Multani Mitti)',
    hindiName: 'शाही उबटन (बेसन, हल्दी, दूध, मुल्तानी मिट्टी)',
    gujaratiName: 'શાહી ઉબટન (ચણાનો લોટ, હળદર, દૂધ, મુલતાની માટી)',
    description: 'Iconic traditional Indian bridal skincare blend providing mild exfoliation, tan removal, and radiant golden botanical glow.',
    benefits: ['Besan gently buffs away dead surface cells', 'Haldi (turmeric) promotes bright, even glow', 'Milk and Multani Mitti leave skin velvety soft'],
    usedInProductIds: ['ubtan-soap']
  },
  {
    id: 'aparajita',
    name: 'Aparajita (Butterfly Pea Flower)',
    hindiName: 'अपराजिता (शंखपुष्पी)',
    gujaratiName: 'અપરાજિતા (ગરણી / વાદળી ફૂલ)',
    description: 'Vibrant indigo flower rich in proanthocyanidins and flavonoids that support natural skin radiance and elasticity.',
    benefits: ['Intense botanical antioxidant shield', 'Rejuvenates tired-looking skin', 'Maintains long-lasting softness'],
    usedInProductIds: ['aparajita-body-lotion']
  },
  {
    id: 'kokum-butter',
    name: 'Kokum Butter & Plant Oils',
    hindiName: 'कोकम बटर एवं शुद्ध वनस्पति तेल',
    gujaratiName: 'કોકમ બટર અને શુદ્ધ વનસ્પતિ તેલ',
    description: 'Cold-pressed Coconut, Mahua, Castor, Sunflower, and Kokum Butter form the nourishing cold-process base of all Lavanya soaps.',
    benefits: ['Retains 100% natural vegetable glycerin', 'Non-comedogenic barrier nourishment', 'Produces rich, creamy natural lather'],
    usedInProductIds: ['neem-tulsi-soap', 'kesuda-soap', 'hibiscus-soap', 'ubtan-soap', 'charcoal-rice-soap']
  },
  {
    id: 'lemon',
    name: 'Cold Pressed Lemon Essential Oil',
    hindiName: 'नींबू का शुद्ध तेल',
    gujaratiName: 'લીંબુનું શુદ્ધ તેલ',
    description: 'Fresh, crisp citrus essential oil that provides natural hand cleansing and invigorating freshness.',
    benefits: ['Refreshing natural citrus aroma', 'Gentle clarifying action without dryness', 'Leaves hands clean and soft'],
    usedInProductIds: ['hand-wash-lemon']
  },
  {
    id: 'lavender',
    name: 'Pure French Lavender Essential Oil',
    hindiName: 'शुद्ध लैवेंडर तेल',
    gujaratiName: 'શુદ્ધ લવંડર તેલ',
    description: 'Aromatherapeutic lavender oil that soothes the senses while softening body skin and relieving dryness.',
    benefits: ['Relaxing tranquil scent', 'Deeply hydrates dry body skin', 'Absorbs quickly without sticky residue'],
    usedInProductIds: ['lavender-body-lotion']
  }
];

// Helper to get how-to-use text based on product category
const getVerifiedHowToUse = (category: string, name: string): string => {
  if (category === 'Handmade Cold Process Soap') {
    return 'Lather the soap bar between wet palms. Gently apply onto wet face and body in circular motions. Rinse thoroughly with cool or lukewarm water. Store on a well-draining soap dish to preserve the bar.';
  } else if (category === 'Face & Body Wash' || category === 'Hand Wash') {
    return 'Dispense 1-2 pumps onto wet hands or a natural loofah. Massage gently into a rich creamy lather over skin. Rinse thoroughly with clean water.';
  } else if (category === 'Face Care') {
    return 'Take a pea-sized amount onto clean fingertips. Gently dot across face and neck, then massage upward in light circular strokes until absorbed. Use twice daily.';
  } else if (category === 'Body Care') {
    return 'Smooth liberally over clean body skin immediately after shower or bath to seal in natural moisture. Reapply as needed throughout the day.';
  } else {
    return 'Glide gently over dry lips as needed throughout the day and before sleep to maintain soft, protected lips.';
  }
};

// Consolidated verified product list
export const VERIFIED_PRODUCTS: VerifiedProductKnowledge[] = productsData.map(p => ({
  id: p.id,
  name: p.name,
  category: p.category,
  mrp: p.mrp,
  discountPrice: p.discountPrice,
  netWeightOrVol: p.netWeightOrVol,
  image: p.image,
  shortDescription: p.shortDescription,
  fullDescription: p.fullDescription,
  ingredients: p.ingredients,
  benefits: p.benefits,
  threeMainBenefits: p.threeMainBenefits,
  howToUse: p.howToUse || getVerifiedHowToUse(p.category, p.name),
  isFeatured: p.isFeatured
}));

// Strictly check if product exists
export const getVerifiedProductById = (id: string): VerifiedProductKnowledge | undefined => {
  return VERIFIED_PRODUCTS.find(p => p.id === id);
};

// Multilingual UI & Safety Translations
export const I18N = {
  en: {
    brandName: 'ONZNATURAL',
    aiAdvisorTitle: 'ONZNATURAL Botanical AI',
    aiAdvisorSubtitle: 'Grounded Ayurvedic Regimens & Cold Process Skincare Advisor',
    safetyDisclaimerTitle: 'Botanical Skincare Notice & Safety',
    safetyDisclaimerText: 'ONZNATURAL provides artisanal cosmetic skincare handcrafted with cold-process botanical oils and traditional herbs. Our AI assistant offers general cosmetic and routine guidance based strictly on our verified product catalogue. It does not provide medical diagnoses, treatment, or cures for dermatological diseases. Always perform a 24-hour patch test before using any new botanical product and consult a certified dermatologist for persistent skin conditions.',
    patchTestReminder: 'Mandatory: Always patch test on the inner wrist 24 hours prior to full facial use.',
    tabs: {
      quiz: 'Guided Skincare Quiz',
      chat: 'Conversational Skincare Assistant',
      compare: 'Product Comparison',
      scanner: 'Visual Label & Skin Scan'
    },
    quiz: {
      heading: 'Discover Your Botanical Match',
      subheading: 'Answer 4 simple questions for an Ayurvedic routine tailored to your skin preferences.',
      step1: '1. Select Your Skin Type',
      step2: '2. Select Your Primary Concern',
      step3: '3. Known Sensitivities / Allergies',
      step4: '4. Current Climate / Season',
      generateBtn: 'Generate My Botanical Regimen',
      generatingBtn: 'Formulating with Botanical Intelligence...',
      resultHeading: 'Your Verified Botanical Care Plan',
      prakritiHeading: 'Skin Balance & Herbal Insights',
      coldProcessAdvantage: 'The Artisanal Cold-Process Advantage',
      routineHeading: 'Your Custom Regimen (Verified Products)',
      lifestyleTips: 'Botanical Lifestyle & Care Tips',
      orderWhatsApp: 'Order Complete Regimen via WhatsApp',
      sensitivityNotice: 'Sensitivity Notice:'
    },
    chat: {
      welcome: 'Namaste! 🙏 I am your ONZNATURAL Botanical AI Skincare Consultant. How can I assist you today? You can ask about our cold-process soaps, body lotions, body creams, liquid washes, Ayurvedic herbs (Kesuda, Neem, Tulsi, Ubtan, Aparajita), or compare products.',
      placeholder: 'Ask about soaps, lotions, ingredients, routines, skin types...',
      send: 'Send',
      reset: 'Clear Chat',
      resetConfirm: 'Are you sure you want to clear your conversation history?',
      thinking: 'Consulting verified ONZNATURAL catalogue...',
      suggestedHeading: 'Suggested Questions:',
      matchingProducts: 'Matching ONZNATURAL Products:'
    },
    compare: {
      heading: 'Side-by-Side Product Comparison',
      subheading: 'Compare ingredients, benefits, prices, and skin suitability between any two verified ONZNATURAL products.',
      selectProduct1: 'Select First Product',
      selectProduct2: 'Select Second Product',
      price: 'Price (MRP)',
      volume: 'Net Weight / Volume',
      category: 'Category',
      keyActives: 'Key Botanical Actives',
      fullIngredients: 'Full Ingredients',
      primaryBenefits: 'Primary Benefits',
      howToUse: 'How to Use',
      orderThisOnWhatsApp: 'Order via WhatsApp'
    },
    privacy: {
      badge: '100% Privacy Protected',
      text: 'No personal health data is shared with third parties. Conversations are governed by your selected privacy preferences.'
    }
  },
  hi: {
    brandName: 'ऑन्जनेचुरल (ONZNATURAL)',
    aiAdvisorTitle: 'ऑन्जनेचुरल प्राकृतिक त्वचा परामर्शदाता AI',
    aiAdvisorSubtitle: 'प्रामाणिक आयुर्वेदिक देखभाल एवं कोल्ड-प्रोसेस साबुन सलाहकार',
    safetyDisclaimerTitle: 'आयुर्वेदिक त्वचा देखभाल सूचना एवं सुरक्षा',
    safetyDisclaimerText: 'ऑन्जनेचुरल (ONZNATURAL) विशुद्ध कोल्ड-प्रोसेस तेलों और जड़ी-बूटियों से हस्तनिर्मित प्रसाधन प्रदान करता है। यह AI परामर्शदाता केवल हमारे वास्तविक उत्पादों के आधार पर सौंदर्य और दैनिक उपयोग की सलाह देता है। यह किसी चिकित्सीय रोग (एक्जिमा, सोरायसिस, सिस्टिक एक्ने) का निदान या उपचार नहीं करता। किसी भी नए उत्पाद के उपयोग से पूर्व 24 घंटे का पैच टेस्ट अवश्य करें तथा गंभीर समस्याओं हेतु त्वचा विशेषज्ञ (Dermatologist) से परामर्श लें।',
    patchTestReminder: 'अनिवार्य: चेहरे पर उपयोग से पूर्व कलाई के भीतरी भाग पर 24 घंटे का पैच टेस्ट अवश्य करें।',
    tabs: {
      quiz: 'त्वचा प्राथमिक प्रश्नोत्तरी',
      chat: 'AI त्वचा परामर्श चैट',
      compare: 'उत्पाद तुलना (Comparison)',
      scanner: 'लेबल व त्वचा स्कैनर'
    },
    quiz: {
      heading: 'अपनी त्वचा के अनुकूल प्राकृतिक उत्पाद खोजें',
      subheading: 'अपनी त्वचा की प्रकृति अनुसार 4 सरल प्रश्नों के उत्तर दें।',
      step1: '1. अपनी त्वचा का प्रकार चुनें',
      step2: '2. अपनी मुख्य त्वचा संबंधी प्राथमिकता',
      step3: '3. ज्ञात संवेदनशीलता या एलर्जी',
      step4: '4. आपके शहर का मौसम / जलवायु',
      generateBtn: 'मेरी आयुर्वेदिक दिनचर्या तैयार करें',
      generatingBtn: 'आयुर्वेदिक विश्लेषण जारी है...',
      resultHeading: 'आपकी प्रमाणित आयुर्वेदिक दिनचर्या',
      prakritiHeading: 'त्वचा संतुलन एवं प्राकृतिक विश्लेषण',
      coldProcessAdvantage: 'कोल्ड-प्रोसेस ग्लिसरीन का विशेष लाभ',
      routineHeading: 'दैनिक एवं साप्ताहिक देखभाल योजना',
      lifestyleTips: 'आयुर्वेदिक जीवनशैली एवं साबुन रख-रखाव सुझाव',
      orderWhatsApp: 'व्हाट्सएप पर संपूर्ण दिनचर्या ऑर्डर करें',
      sensitivityNotice: 'संवेदनशीलता सूचना:'
    },
    chat: {
      welcome: 'नमस्ते! 🙏 मैं आपका ऑन्जनेचुरल (ONZNATURAL) प्राकृतिक त्वचा सलाहकार AI हूँ। मैं आपकी क्या सहायता कर सकता हूँ? आप हमारे हस्तनिर्मित कोल्ड-प्रोसेस साबुन, बॉडी लोशन, केसूड़ा, नीम, तुलसी, उबटन आदि के लाभों के बारे में पूछ सकते हैं।',
      placeholder: 'साबुन, सामग्री, दिनचर्या या त्वचा संबंधी प्रश्न पूछें...',
      send: 'भेजें',
      reset: 'चैट साफ़ करें',
      resetConfirm: 'क्या आप वार्तालाप इतिहास साफ़ करना चाहते हैं?',
      thinking: 'आयुर्वेदिक उत्पाद ज्ञानकोष से परामर्श ले रहे हैं...',
      suggestedHeading: 'सुझाए गए प्रश्न:',
      matchingProducts: 'अनुकूल ऑन्जनेचुरल उत्पाद:'
    },
    compare: {
      heading: 'दो उत्पादों की आमने-सामने तुलना',
      subheading: 'किसी भी दो ऑन्जनेचुरल उत्पादों की सामग्री, लाभ, मूल्य एवं उपयोग विधि की तुलना करें।',
      selectProduct1: 'पहला उत्पाद चुनें',
      selectProduct2: 'दूसरा उत्पाद चुनें',
      price: 'मूल्य (MRP)',
      volume: 'मात्रा / वजन',
      category: 'श्रेणी',
      keyActives: 'मुख्य वानस्पतिक तत्व',
      fullIngredients: 'पूर्ण सामग्री सूची',
      primaryBenefits: 'मुख्य लाभ',
      howToUse: 'उपयोग विधि',
      orderThisOnWhatsApp: 'व्हाट्सएप पर ऑर्डर करें'
    },
    privacy: {
      badge: '100% गोपनीयता सुरक्षित',
      text: 'आपकी कोई भी निजी स्वास्थ्य संबंधी जानकारी बाहरी पक्षों के साथ साझा नहीं की जाती।'
    }
  },
  gu: {
    brandName: 'ઓન્ઝનેચરલ (ONZNATURAL)',
    aiAdvisorTitle: 'ઓન્ઝનેચરલ પ્રાકૃતિક ત્વચા સલાહકાર AI',
    aiAdvisorSubtitle: 'આયુર્વેદિક કેર અને કોલ્ડ-પ્રોસેસ સાબુ માર્ગદર્શિકા',
    safetyDisclaimerTitle: 'આયુર્વેદિક ત્વચા સંભાળ સૂચના અને સુરક્ષા',
    safetyDisclaimerText: 'ઓન્ઝનેચરલ (ONZNATURAL) શુદ્ધ કોલ્ડ-પ્રોસેસ તેલ અને વનસ્પતિઓમાંથી હાથબનાવટ સૌંદર્ય પ્રસાધનો પ્રદાન કરે છે. આ AI સલાહકાર ફક્ત અમારા વાસ્તવિક ઉત્પાદનો પર આધારિત સૌંદર્ય માર્ગદર્શન આપે છે. તે કોઈપણ તબીબી રોગનું નિદાન કે ઈલાજ કરતું નથી. કોઈપણ નવી વનસ્પતિ ઉત્પાદન વાપરતા પહેલા 24 કલાકનો પેચ ટેસ્ટ અવશ્ય કરો અને ગંભીર ત્વચા સમસ્યાઓ માટે ત્વચારોગ નિષ્ણાત (Dermatologist) નો સંપર્ક કરો.',
    patchTestReminder: 'ફરજિયાત: મોં પર ઉપયોગ કરતાં પહેલાં કાંડાના અંદરના ભાગ પર 24 કલાકનો પેચ ટેસ્ટ કરો.',
    tabs: {
      quiz: 'ત્વચા સંભાળ પ્રશ્નોત્તરી',
      chat: 'AI ત્વચા સંભાળ ચેટ',
      compare: 'ઉત્પાદન સરખામણી (Comparison)',
      scanner: 'લેબલ અને ત્વચા સ્કેનર'
    },
    quiz: {
      heading: 'તમારી ત્વચા અનુસાર આયુર્વેદિક સાબુ પસંદ કરો',
      subheading: 'તમારી ત્વચા માટે શ્રેષ્ઠ આયુર્વેદિક નિયમિત સંભાળ મેળવવા 4 સરળ પ્રશ્નોના ઉત્તર આપો.',
      step1: '1. તમારી ત્વચાનો પ્રકાર પસંદ કરો',
      step2: '2. તમારી મુખ્ય ત્વચા ચિંતા',
      step3: '3. એલર્જી અથવા સંવેદનશીલતા',
      step4: '4. વર્તમાન ઋતુ / વાતાવરણ',
      generateBtn: 'મારી આયુર્વેદિક સંભાળ બનાવો',
      generatingBtn: 'આયુર્વેદિક વિશ્લેષણ ચાલુ છે...',
      resultHeading: 'તમારી પ્રમાણિત આયુર્વેદિક સંભાળ યોજના',
      prakritiHeading: 'ત્વચા પ્રકૃતિ અને કુદરતી સંતુલન',
      coldProcessAdvantage: 'હાથબનાવટ કોલ્ડ-પ્રોસેસ ગ્લિસરિનનો ફાયદો',
      routineHeading: 'દૈનિક અને સાપ્તાહિક સંભાળ પદ્ધતિ',
      lifestyleTips: 'આયુર્વેદિક જીવનશૈલી અને સાબુ જાળવણી ટિપ્સ',
      orderWhatsApp: 'વોટ્સએપ પર આખી યોજના ઓર્ડર કરો',
      sensitivityNotice: 'સંવેદનશીલતા નોંધ:'
    },
    chat: {
      welcome: 'નમસ્તે! 🙏 હું તમારો ઓન્ઝનેચરલ (ONZNATURAL) પ્રાકૃતિક ત્વચા સલાહકાર AI છું. હું તમને કેવી રીતે મદદ કરી શકું? તમે અમારા કોલ્ડ-પ્રોસેસ સાબુ, લોશન, કેસૂડાં, લીમડો, તુલસી, ઉબટન અથવા ઉત્પાદનોની સરખામણી વિશે પૂછી શકો છો.',
      placeholder: 'સાબુ, ઘટકો, પદ્ધતિ કે ત્વચા વિશે પૂછો...',
      send: 'મોકલો',
      reset: 'ચેટ સાફ કરો',
      resetConfirm: 'શું તમે વાતચીતનો ઇતિહાસ સાફ કરવા માંગો છો?',
      thinking: 'આયુર્વેદિક ઉત્પાદન માહિતી ચકાસી રહ્યા છીએ...',
      suggestedHeading: 'સૂચવેલા પ્રશ્નો:',
      matchingProducts: 'યોગ્ય ઓન્ઝનેચરલ ઉત્પાદનો:'
    },
    compare: {
      heading: 'બે ઉત્પાદનોની સરખામણી',
      subheading: 'કોઈપણ બે ઓન્ઝનેચરલ ઉત્પાદનોના ઘટકો, ફાયદા, કિંમત અને ઉપયોગ પદ્ધતિ સરખાવો.',
      selectProduct1: 'પ્રથમ ઉત્પાદન પસંદ કરો',
      selectProduct2: 'બીજું ઉત્પાદન પસંદ કરો',
      price: 'કિંમત (MRP)',
      volume: 'વજન / માત્રા',
      category: 'શ્રેણી',
      keyActives: 'મુખ્ય વનસ્પતિ ઘટકો',
      fullIngredients: 'સંપૂર્ણ ઘટકોની યાદી',
      primaryBenefits: 'મુખ્ય ફાયદાઓ',
      howToUse: 'ઉપયોગ કરવાની રીત',
      orderThisOnWhatsApp: 'વોટ્સએપ પર ઓર્ડર કરો'
    },
    privacy: {
      badge: '100% ગોપનીયતા સુરક્ષિત',
      text: 'તમારી કોઈપણ વ્યક્તિગત માહિતી બાહ્ય પક્ષો સાથે વહેંચવામાં આવતી નથી.'
    }
  }
};

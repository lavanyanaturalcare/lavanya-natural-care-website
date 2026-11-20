import { Product } from '../types';

export const productsData: Product[] = [
  // ==========================================
  // HANDMADE COLD PROCESS SOAPS (100g / ₹99)
  // ==========================================
  {
    id: 'neem-tulsi-soap',
    name: 'Neem & Tulsi Soap',
    category: 'Handmade Cold Process Soap',
    shortDescription: 'Purifying handcrafted luxury cold process soap infused with Neem & Tulsi for clear, refreshed skin.',
    fullDescription: 'Neem & Tulsi Cold Process Soap is handcrafted in small batches using nourishing plant oils and Kokum Butter. Neem is traditionally valued in Ayurvedic skincare for its purifying qualities, while Tulsi (Holy Basil) delivers an antioxidant-rich refreshing botanical sensation. Naturally retains pure vegetable glycerin to leave skin soft and deeply moisturized.',
    benefits: [
      'Gently cleanses skin removing dirt, excess sebum, and environmental impurities',
      'Neem is traditionally used for its clarifying and blemish-supporting properties',
      'Tulsi (Holy Basil) offers revitalizing, antioxidant-rich botanical protection',
      'Naturally retained glycerin helps protect the skin barrier against moisture loss',
      'Creates a rich, creamy lather without synthetic foaming agents or sulfates',
      'Especially refreshing for warm weather and blemish-prone complexions'
    ],
    threeMainBenefits: [
      'Gently purifies blemishes, dirt & excess oil',
      'Antioxidant-rich organic Neem and Tulsi herbs',
      'Cold-process retained glycerin prevents dryness'
    ],
    ingredients: 'Coconut Oil, Mahua Oil, Neem Oil, Kokum Butter, Sunflower Oil, Castor Oil, Saponified with Lye. Additives: Neem & Tulsi Leaf Powder, Natural Clay.',
    netWeightOrVol: '100 gm / 3.52 oz',
    mrp: 99,
    image: '/images/products/neem-tulsi-soap.webp',
    additionalImages: ['/images/products/neem-tulsi-soap.webp'],
    skinType: 'Oily, Combination & Blemish-Prone Skin',
    howToUse: 'Lather between wet palms or with a washcloth. Massage gently over face and body, then rinse thoroughly with cool or lukewarm water. Keep on a draining soap dish.',
    isFeatured: true
  },
  {
    id: 'kesuda-palash-soap',
    name: 'Kesuda Palash Soap',
    category: 'Handmade Cold Process Soap',
    shortDescription: 'Soothing cold process soap enriched with Palash (Kesuda) flowers and Kokum Butter for sun-exposed skin.',
    fullDescription: 'Kesuda Palash Cold Process Soap is handcrafted with wild-harvested Palash flowers, nourishing plant oils, and Kokum Butter. In Indian botanical tradition, Kesuda is revered for cooling summer heat rashes, soothing sensitive redness, and leaving skin refreshed and velvety soft without tightness.',
    benefits: [
      'Handcrafted using nourishing plant oils and unrefined Kokum Butter',
      'Gently cleanses while producing a rich, silky botanical lather',
      'Kesuda (Flame of the Forest) is traditionally valued for soothing prickly heat and irritation',
      'Leaves skin revitalized, supple, and comfortably cool in warm climates',
      'Artisanal cold process curing retains 100% natural glycerin'
    ],
    threeMainBenefits: [
      'Soothes summer prickly heat and sun-exposed redness',
      'Retained vegetable glycerin prevents moisture loss',
      'Rich, creamy lather with unrefined Kokum Butter'
    ],
    ingredients: 'Coconut Oil, Mahua Oil, Kokum Butter, Sunflower Oil, Castor Oil, Essential Oil, Saponified with Lye. Additives: Kesuda (Palash) Flower Infusion & Powder.',
    netWeightOrVol: '100 gm / 3.52 oz',
    mrp: 99,
    image: '/images/products/kesuda-palash-soap.webp',
    additionalImages: ['/images/products/kesuda-palash-soap.webp'],
    skinType: 'Sensitive, Sun-Exposed, Prickly Heat & Normal Skin',
    howToUse: 'Work into a gentle lather with water. Glide over body during bath or shower, focusing on heat-prone areas. Rinse cleanly with water.',
    isFeatured: true
  },
  {
    id: 'hibiscus-soap',
    name: 'Hibiscus Soap',
    category: 'Handmade Cold Process Soap',
    shortDescription: 'Antioxidant-packed botanical cold process soap with natural AHAs for smooth, radiant skin.',
    fullDescription: 'Hibiscus Cold Process Soap harnesses the power of the "Botox plant" of Ayurveda. Naturally rich in gentle botanical AHAs and antioxidants, it sloughs off dull surface cells while Kokum Butter and plant oils deeply nourish and revive elasticity for a radiant complexion.',
    benefits: [
      'Gently cleanses while supporting natural skin renewal',
      'Rich in natural plant antioxidants to promote a fresh, youthful glow',
      'Helps refine rough texture and revive tired, dull-looking skin',
      'Retained cold-process vegetable glycerin preserves optimal moisture balance',
      'Gentle plant oils produce a velvety, conditioning foam'
    ],
    threeMainBenefits: [
      'Natural plant AHAs promote luminous, renewed skin',
      'Revives dull complexions with antioxidant nutrients',
      'Deeply conditions with pure Kokum Butter'
    ],
    ingredients: 'Coconut Oil, Mahua Oil, Kokum Butter, Sunflower Oil, Castor Oil, Essential Oil, Saponified with Lye. Additives: Hibiscus Flower Powder, Natural Clay.',
    netWeightOrVol: '100 gm / 3.52 oz',
    mrp: 99,
    image: '/images/products/hibiscus-soap.webp',
    additionalImages: ['/images/products/hibiscus-soap.webp'],
    skinType: 'Normal to Dry, Mature & Dull Skin',
    howToUse: 'Lather in hands with lukewarm water. Massage onto face and body in circular motions. Rinse thoroughly and pat dry.',
    isFeatured: true
  },
  {
    id: 'ubtan-soap',
    name: 'Ubtan Soap',
    category: 'Handmade Cold Process Soap',
    shortDescription: 'Traditional bridal herbal soap with Besan, Turmeric, Milk, and Multani Mitti for natural tan removal.',
    fullDescription: 'Ubtan Cold Process Soap unites the sacred herbs of Indian beauty rituals: gram flour (Besan), wild Kasturi turmeric, wholesome milk, and Fuller\'s Earth (Multani Mitti). It provides mild, non-stripping exfoliation to fade sun tan and restore an even, luminous bridal glow.',
    benefits: [
      'Gently exfoliates dead skin cells, excess sebum, and daily pollutants',
      'Besan (gram flour) delivers ultra-fine polishing without micro-tears',
      'Turmeric (Haldi) visibly brightens uneven tone and sun tan',
      'Milk proteins and Multani Mitti leave skin smooth, supple, and refined',
      'Preserves the skin\'s natural protective lipid barrier'
    ],
    threeMainBenefits: [
      'Gentle daily micro-exfoliation with fine Besan',
      'Kasturi Turmeric restores a radiant, even glow',
      'Milk & Multani Mitti soften texture without dryness'
    ],
    ingredients: 'Coconut Oil, Mahua Oil, Sunflower Oil, Castor Oil, Essential Oil, Saponified with Lye. Additives: Besan (Gram Flour), Haldi (Turmeric), Pure Milk, Multani Mitti.',
    netWeightOrVol: '100 gm / 3.52 oz',
    mrp: 99,
    image: '/images/products/ubtan-soap.webp',
    additionalImages: ['/images/products/ubtan-soap.webp'],
    skinType: 'All Skin Types, Sun-Tanned & Uneven Skin Tone',
    howToUse: 'Wet bar and create a rich lather. Massage over tanned areas of face, neck, and body. Leave on for 60 seconds before rinsing for enhanced herbal absorption.',
    isFeatured: true
  },
  {
    id: 'charcoal-rice-soap',
    name: 'Charcoal Rice Soap',
    category: 'Handmade Cold Process Soap',
    shortDescription: 'Deep pore cleansing Activated Charcoal and Rice soap for clarified, smooth skin.',
    fullDescription: 'Charcoal Rice Cold Process Soap pairs the detoxifying power of activated bamboo charcoal with finely milled rice powder. Charcoal draws out deep-seated grime, blackhead-causing sebum, and environmental smog, while rice powder smooths skin texture.',
    benefits: [
      'Deep pore clarifying: Activated charcoal magnetically draws out trapped impurities',
      'Gentle smoothing: Milled rice powder gently buffs away dead surface roughness',
      'Visibly clarifies congested, oily T-zones without drying out skin',
      'Cold-process vegetable oils ensure skin stays soft, clean, and balanced'
    ],
    threeMainBenefits: [
      'Activated Charcoal purges deep pore impurities',
      'Rice powder smooths and refines rough texture',
      'Balanced cold process oils prevent dry, tight skin'
    ],
    ingredients: 'Coconut Oil, Mahua Oil, Kokum Butter, Sunflower Oil, Castor Oil, Essential Oil, Saponified with Lye. Additives: Activated Bamboo Charcoal, Milled Rice Powder.',
    netWeightOrVol: '100 gm / 3.52 oz',
    mrp: 99,
    image: '/images/products/charcoal-rice-soap.webp',
    additionalImages: ['/images/products/charcoal-rice-soap.webp'],
    skinType: 'Oily, Congested & Normal Skin',
    howToUse: 'Lather with water until a dark grey foam forms. Gently work over oily or blemish-prone zones. Rinse thoroughly with cool water.',
    isFeatured: false
  },

  // ==========================================
  // BODY LOTIONS (150 ml / ₹599)
  // ==========================================
  {
    id: 'aparajita-body-lotion',
    name: 'Aparajita Body Lotion',
    category: 'Body Care',
    shortDescription: 'Antioxidant-rich handcrafted body lotion infused with Butterfly Pea (Aparajita) flower.',
    fullDescription: 'Aparajita Body Lotion features wild-harvested Butterfly Pea flower extract, celebrated for its high anthocyanin antioxidant content. Blended with plant-derived emollients and cold-pressed botanical oils, it shields body skin against oxidative dullness while delivering all-day velvety softness without greasiness.',
    benefits: [
      'Aparajita (Butterfly Pea) provides deep antioxidant defense against environmental stress',
      'Helps revive dull, fatigued skin for a supple, luminous appearance',
      'Lightweight, fast-absorbing texture hydrates deeply without heavy residue',
      'Fortifies the skin\'s natural moisture barrier for 24-hour hydration',
      'Non-comedogenic and plant-based, suitable for daily post-shower hydration'
    ],
    threeMainBenefits: [
      'Butterfly Pea flower delivers potent antioxidants',
      'Fast-absorbing hydration leaves zero oily sheen',
      'Restores skin softness and luminous tone'
    ],
    ingredients: 'Aparajita (Butterfly Pea) Flower Extract, Sunflower Seed Oil, Rice Bran Oil, Shea Butter, Vegetable Glycerin, Purified Water, Plant-based Emulsifying Wax.',
    netWeightOrVol: '150 ml',
    mrp: 599,
    image: '/images/products/aparajita-body-lotion.webp',
    additionalImages: ['/images/products/aparajita-body-lotion.webp'],
    skinType: 'Normal, Dry & Sun-Exposed Skin',
    howToUse: 'Dispense 2-3 pumps onto clean, towel-dried skin after bathing. Massage in long upward strokes until absorbed.',
    isFeatured: true
  },
  {
    id: 'lavender-body-lotion',
    name: 'Lavender Body Lotion',
    category: 'Body Care',
    shortDescription: 'Calming aromatherapy body lotion with pure French Lavender essential oil.',
    fullDescription: 'Lavender Body Lotion is formulated with cold-pressed French lavender essential oil, botanical squalane, and plant emollients to soothe dry, stressed skin while creating a tranquil, aromatic evening ritual.',
    benefits: [
      'Provides lightweight, long-lasting daily hydration for thirsty skin',
      'Aromatherapeutic lavender scent calms the mind and promotes restful comfort',
      'Absorbs quickly into skin without leaving an oily or sticky film',
      'Soothes mild skin irritations, tightness, and seasonal dryness',
      'Suitable for both morning radiance and evening relaxation'
    ],
    threeMainBenefits: [
      'French Lavender essential oil soothes skin & senses',
      'Lightweight, non-greasy all-day moisture lock',
      'Leaves skin silky, smooth, and delicately scented'
    ],
    ingredients: 'French Lavender Essential Oil, Cold-Pressed Almond Oil, Sunflower Seed Oil, Shea Butter, Vegetable Glycerin, Purified Water, Plant Emulsifiers.',
    netWeightOrVol: '150 ml',
    mrp: 599,
    image: '/images/products/lavender-body-lotion.webp',
    additionalImages: ['/images/products/lavender-body-lotion.webp'],
    skinType: 'All Skin Types, Normal to Dry',
    howToUse: 'Smooth generously over entire body, especially arms, elbows, and legs before bedtime for calming hydration.',
    isFeatured: false
  },
  {
    id: 'honey-almond-body-lotion',
    name: 'Honey Almond Body Lotion',
    category: 'Body Care',
    shortDescription: 'Deeply nourishing botanical lotion with Honey and Sweet Almond extracts for dry skin.',
    fullDescription: 'Honey & Almond Body Lotion brings together pure humectant honey and cold-pressed sweet almond oil to deeply moisturize, soften rough patches, and give dry body skin a healthy, supple radiance.',
    benefits: [
      'Honey acts as a natural humectant, drawing moisture deep into the epidermal layers',
      'Cold-pressed Sweet Almond oil is rich in Vitamin E, restoring silky softness',
      'Soothes rough elbows, knees, and dry-prone winter skin',
      'Silky, non-sticky formula absorbs effortlessly into the skin',
      'Provides a warm, delicate honey-almond botanical scent'
    ],
    threeMainBenefits: [
      'Natural honey draws and locks in moisture',
      'Sweet Almond oil nourishes with Vitamin E',
      'Softens dry skin for a radiant, supple finish'
    ],
    ingredients: 'Pure Honey Extract, Sweet Almond Oil, Shea Butter, Sunflower Oil, Vegetable Glycerin, Purified Water, Plant-based Conditioning Wax.',
    netWeightOrVol: '150 ml',
    mrp: 599,
    image: '/images/products/honey-almond-body-lotion.webp',
    additionalImages: ['/images/products/honey-almond-body-lotion.webp'],
    skinType: 'Dry, Very Dry & Rough Skin',
    howToUse: 'Apply daily after showering or whenever skin feels tight or dry. Massage thoroughly until completely absorbed.',
    isFeatured: true
  },
  {
    id: 'kesuda-body-lotion',
    name: 'Kesuda Body Lotion',
    category: 'Body Care',
    shortDescription: 'Refreshing, cooling body lotion infused with wild Kesudo (Palash) flower extract.',
    fullDescription: 'Kesuda Body Lotion is enriched with the cooling botanical goodness of Kesuda (Palash) flowers. Specially formulated for warm, sunny climates, it instantly quenches heat-stressed skin, reduces surface discomfort, and restores radiant hydration without heaviness.',
    benefits: [
      'Palash flower infusion calms skin exposed to hot summer sun',
      'Provides featherlight, non-greasy daily hydration',
      'Quickly absorbs to leave skin feeling comfortably cool and hydrated',
      'Maintains healthy skin tone and guards against heat-induced flakiness',
      'Suitable for all skin types, including sensitive skin'
    ],
    threeMainBenefits: [
      'Cools and revitalizes heat-stressed skin',
      'Featherlight hydration without greasy residue',
      'Enriched with wild Palash flower nutrients'
    ],
    ingredients: 'Kesuda (Palash) Flower Infusion, Sunflower Seed Oil, Shea Butter, Vegetable Glycerin, Purified Water, Plant-based Emulsifiers.',
    netWeightOrVol: '150 ml',
    mrp: 599,
    image: '/images/products/kesuda-body-lotion.webp',
    additionalImages: ['/images/products/kesuda-body-lotion.webp'],
    skinType: 'Normal, Heat-Sensitive & Sun-Exposed Skin',
    howToUse: 'Smooth over body every morning after bath. Re-apply on sun-exposed arms and legs for soothing relief.',
    isFeatured: false
  },

  // ==========================================
  // BODY CREAMS (100 gm / ₹399)
  // ==========================================
  {
    id: 'aparajita-body-cream',
    name: 'Aparajita Body Cream',
    category: 'Body Care',
    shortDescription: 'Rich, antioxidant-dense botanical body cream with Butterfly Pea and Shea Butter.',
    fullDescription: 'Aparajita Body Cream combines distilled Butterfly Pea flower infusion with nourishing sunflower oil, rice bran oil, and pure shea butter. It envelopes the skin in intensive, cushiony moisture to keep body skin soft, supple, and radiant.',
    benefits: [
      'Intense, buttery nourishment for persistent dryness and dry patches',
      'Butterfly Pea (Aparajita) flower protects with concentrated antioxidants',
      'Shea butter and rice bran oil lock in natural moisture all day',
      'Leaves skin velvety smooth with a youthful, conditioned finish',
      'Rich yet non-greasy consistency melts smoothly on skin'
    ],
    threeMainBenefits: [
      'Intensive buttery moisture with pure Shea Butter',
      'Aparajita flower provides antioxidant nourishment',
      'Restores velvety softness to rough, dry skin'
    ],
    ingredients: 'Aparajita Flower Distilled Water, Sunflower Oil, Rice Bran Oil, Shea Butter, Vegetable Glycerin, Plant-based Emulsifying Wax.',
    netWeightOrVol: '100 gm',
    mrp: 399,
    image: '/images/products/aparajita-body-cream.webp',
    additionalImages: ['/images/products/aparajita-body-cream.webp'],
    skinType: 'Dry to Extremely Dry Skin',
    howToUse: 'Scoop a small quantity and warm between palms. Massage into dry body areas like elbows, heels, and legs.',
    isFeatured: false
  },
  {
    id: 'kesuda-palash-body-cream',
    name: 'Kesuda Palash Natural Body Cream',
    category: 'Body Care',
    shortDescription: 'Soothing Ayurvedic body cream with Kesuda extract, Shea Butter, and Vitamin E.',
    fullDescription: 'Kesuda Palash Natural Body Cream absorbs effortlessly to revive dry or dull skin, leaving a silky, comfortable finish that lasts all day without leaving a heavy feel. Enriched with wild Kesuda extract and Vitamin E to soothe and protect.',
    benefits: [
      'Effortlessly absorbs into the skin for day-long comfort and hydration',
      'Kesuda extract calms irritated, sun-stressed, or red skin',
      'Shea butter and Vitamin E replenish the protective lipid barrier',
      'Leaves skin silky, soft, and visibly radiant with zero greasy residue',
      'Ideal everyday body cream for sensitive, climate-affected skin'
    ],
    threeMainBenefits: [
      'Absorbs effortlessly to revive dry or dull skin',
      'Kesuda extract & Vitamin E soothe sensitivity',
      'Silky, non-greasy all-day comfortable hydration'
    ],
    ingredients: 'Kesuda (Palash) Extract, Shea Butter, Vitamin E, Sunflower Seed Oil, Vegetable Glycerin, Purified Water, Plant-based Wax.',
    netWeightOrVol: '100 gm',
    mrp: 399,
    image: '/images/products/kesuda-palash-body-cream.webp',
    additionalImages: ['/images/products/kesuda-palash-body-cream.webp'],
    skinType: 'Dry, Sensitive, Rough & Dull Skin',
    howToUse: 'Massage gently all over the body, paying extra attention to areas needing soothing moisture.',
    isFeatured: true
  },
  {
    id: 'honey-almond-body-cream',
    name: 'Honey Almond Body Cream',
    category: 'Body Care',
    shortDescription: 'Nourishing body cream enriched with Honey, Almond, and Shea Butter.',
    fullDescription: 'Nourishing body cream enriched with the natural goodness of honey and cold-pressed almond oil. Deeply moisturizes, softens, and leaves skin smooth, supple, and radiant with a velvety, non-greasy shield.',
    benefits: [
      'Deeply moisturizes parched skin with natural humectant honey',
      'Sweet Almond oil and Shea Butter provide essential fatty acids',
      'Softens and smooths rough, flaking skin textures',
      'Leaves body skin glowing, supple, and comfortably nourished',
      'Delicate, comforting botanical fragrance from natural ingredients'
    ],
    threeMainBenefits: [
      'Enriched with pure Honey & Sweet Almond oil',
      'Deeply moisturizes, softens, and replenishes',
      'Velvety finish leaves skin radiant and smooth'
    ],
    ingredients: 'Honey Extract, Sweet Almond Oil, Shea Butter, Sunflower Oil, Vegetable Glycerin, Purified Water, Plant-based Emulsifiers.',
    netWeightOrVol: '100 gm',
    mrp: 399,
    image: '/images/products/honey-almond-body-cream.webp',
    additionalImages: ['/images/products/honey-almond-body-cream.webp'],
    skinType: 'Dry, Very Dry & Rough Body Skin',
    howToUse: 'Apply a generous dollop all over clean body. Gently massage until absorbed.',
    isFeatured: false
  },

  // ==========================================
  // FACE & BODY WASHES (300 ml / ₹599)
  // ==========================================
  {
    id: 'face-body-wash-neem-tulsi',
    name: 'Neem Tulsi Face & Body Wash',
    category: 'Face & Body Wash',
    shortDescription: 'Refreshing plant-based liquid cleanser infused with Neem & Tulsi for daily purification.',
    fullDescription: 'Neem & Tulsi Face & Body Wash is an artisanal liquid botanical cleanser handcrafted with saponified vegetable oils and concentrated herbal infusions. It gently purges daily sweat, dirt, and excess oil without stripping your natural protective lipids.',
    benefits: [
      'Gentle everyday cleansing: washes away dirt, sweat, and excess sebum',
      'Neem actively supports skin clarity and blemish control',
      'Tulsi (Holy Basil) energizes tired skin with botanical antioxidants',
      'Maintains natural moisture balance with rich vegetable glycerin',
      'Produces a gentle, non-stripping creamy foam free of SLS/SLES'
    ],
    threeMainBenefits: [
      'Gentle everyday cleanse removes dirt & excess oil',
      'Pure Neem & Tulsi herbs clarify and soothe',
      'Vegetable glycerin prevents tightness after bathing'
    ],
    ingredients: 'Neem-Tulsi Infused Water, Saponified Oils of Coconut, Mahua, Sunflower & Castor, Pure Neem Oil, Vegetable Glycerin, Natural Essential Oil.',
    netWeightOrVol: '300 ml',
    mrp: 599,
    image: '/images/products/neem-tulsi-face-body-wash.webp',
    additionalImages: ['/images/products/neem-tulsi-face-body-wash.webp'],
    skinType: 'Oily, Combination & Acne-Prone Skin',
    howToUse: 'Pump onto wet hands or a loofah. Lather generously over face and body. Rinse clean with fresh water.',
    isFeatured: true
  },
  {
    id: 'face-body-wash-kesuda',
    name: 'Kesuda Face & Body Wash',
    category: 'Face & Body Wash',
    shortDescription: 'Hydrating Kesudo (Palash) flower liquid body wash for soft, freshly cooled skin.',
    fullDescription: 'Kesuda Face & Body Wash is crafted with distilled Kesuda flower infused water and saponified plant oils. It delivers a calming, luxurious bath experience that soothes heat-stressed skin while maintaining optimal hydration.',
    benefits: [
      'Gently cleanses skin while preserving natural moisture and softness',
      'Kesudo (Palash) flower essence keeps skin cool and refreshed in hot climates',
      'Reduces surface redness and prickly heat discomfort during bathing',
      '100% free of synthetic detergents, parabens, and sulfates',
      'Suitable for daily face and body use across the entire family'
    ],
    threeMainBenefits: [
      'Kesudo (Palash) flower water cools & revives',
      'Leaves skin silky, soft, and refreshed',
      'Plant-based saponified oils create a gentle lather'
    ],
    ingredients: 'Kesuda Flower Infused Water, Saponified Oils of Coconut, Mahua, Sunflower & Castor, Vegetable Glycerin, Natural Essential Oil.',
    netWeightOrVol: '300 ml',
    mrp: 599,
    image: '/images/products/kesuda-face-body-wash.webp',
    additionalImages: ['/images/products/kesuda-face-body-wash.webp'],
    skinType: 'Normal, Sensitive & Heat-Sensitive Skin',
    howToUse: 'Apply to wet skin during bath. Work into a cooling, aromatic lather. Rinse with cool or warm water.',
    isFeatured: false
  },

  // ==========================================
  // HAND WASH (300 ml / ₹599)
  // ==========================================
  {
    id: 'hand-wash-lemon',
    name: 'Lemon Hand Wash',
    category: 'Hand Wash',
    shortDescription: 'Nourishing plant-based liquid hand wash with fresh cold-pressed Lemon essential oil.',
    fullDescription: 'Lemon Hand Wash is made with saponified vegetable oils and cold-pressed Lemon Essential Oil. It cleanses hands effectively by removing stubborn grease, food odors, and dirt while replenishing moisture so frequent handwashing never leaves hands dry or cracked.',
    benefits: [
      'Gently removes dirt, germs, and daily impurities from hands',
      'Crafted from saponified plant oils, avoiding harsh synthetic foaming agents',
      'Keeps hands feeling soft, supple, and comfortable all day',
      'Natural cold-pressed lemon essential oil neutralizes odors and uplifts the senses',
      'High vegetable glycerin content prevents dry, cracked skin'
    ],
    threeMainBenefits: [
      'Plant-based cleansing removes dirt & food odors',
      'High vegetable glycerin protects against dryness',
      'Refreshing natural lemon aroma energizes hands'
    ],
    ingredients: 'Saponified Oils of Coconut, Mahua, Sunflower & Castor, Vegetable Glycerin, Cold-Pressed Lemon Essential Oil.',
    netWeightOrVol: '300 ml',
    mrp: 599,
    image: '/images/products/lemon-hand-wash.webp',
    additionalImages: ['/images/products/lemon-hand-wash.webp'],
    skinType: 'All Skin Types (Frequent Daily Handwashing)',
    howToUse: 'Dispense 1 pump onto wet hands. Rub palms, backs of hands, and fingertips together for 20 seconds. Rinse clean with water.',
    isFeatured: false
  },

  // ==========================================
  // FACE CREAM (100 gm / ₹399)
  // ==========================================
  {
    id: 'rice-aloe-face-cream',
    name: 'Rice Aloe Face Cream',
    category: 'Face Care',
    shortDescription: 'Nourishing daily face cream combining traditional Rice extract, Aloe Vera, and Jojoba Oil.',
    fullDescription: 'Rice Aloe Face Cream combines the soothing comfort of Aloe Vera with the brightening heritage of Rice and Jojoba Oil to keep facial skin soft, supple, and radiant without feeling greasy. Absorbs smoothly for a velvety daytime or nighttime finish.',
    benefits: [
      'Keeps facial skin soft, smooth, and comfortably moisturized all day',
      'Pure Aloe Vera soothes environmental irritation and cools redness',
      'Rice starch helps improve the appearance of dull, tired skin for a luminous tone',
      'Jojoba oil mimics natural skin sebum to balance hydration without pore-clogging',
      'Lightweight, breathable formula wears beautifully under sunscreen or makeup'
    ],
    threeMainBenefits: [
      'Rice extract & Aloe Vera soothe and brighten',
      'Jojoba oil balances moisture without feeling greasy',
      'Softens and smooths skin texture naturally'
    ],
    ingredients: 'Aloe Vera Juice, Rice Starch & Extract, Jojoba Oil, Sunflower Oil, Vegetable Glycerin, Plant-based Emulsifiers.',
    netWeightOrVol: '100 gm',
    mrp: 399,
    image: '/images/products/rice-aloe-face-cream.webp',
    additionalImages: ['/images/products/rice-aloe-face-cream.webp'],
    skinType: 'Dry, Normal, Combination & Sensitive Facial Skin',
    howToUse: 'After cleansing, take a small amount on fingertips. Gently dot across forehead, cheeks, and neck, then smooth in upward circular motions.',
    isFeatured: true
  },

  // ==========================================
  // LIP CARE (10 g / ₹70)
  // ==========================================
  {
    id: 'lip-balm',
    name: 'Natural Lip Balm',
    category: 'Lip Care',
    shortDescription: 'Nourishing botanical lip balm with natural oils, Shea butter, and pure Beeswax.',
    fullDescription: 'Natural Lip Balm shields delicate lips from dryness, chapping, and cold winds using nourishing Almond Oil, Coconut Oil, unrefined Shea Butter, and pure Beeswax. Forms an invisible, protective comfort barrier to keep lips soft all day.',
    benefits: [
      'Deeply moisturizes and comforts dry, chapped lips',
      'Forms a protective botanical barrier that seals in hydration',
      'Leaves lips smooth, supple, and visibly nourished',
      'Free from petroleum jelly, mineral oil, or synthetic chemicals',
      'Compact, pocket-friendly jar for on-the-go nourishment'
    ],
    threeMainBenefits: [
      'Pure Coconut Oil, Almond Oil & Shea Butter',
      'Protective natural beeswax seals in moisture',
      'Prevents chapping and keeps lips soft all day'
    ],
    ingredients: 'Coconut Oil, Pure Beeswax, Sweet Almond Oil, Shea Butter, Castor Oil, Natural Mixed Fruit Flavor Oil.',
    netWeightOrVol: '10 g',
    mrp: 70,
    image: '/assets/products/lip-balm.webp',
    additionalImages: ['/assets/products/lip-balm.webp'],
    skinType: 'Dry, Chapped & Sensitive Lips',
    howToUse: 'Smooth a small amount onto lips with clean fingertips as needed throughout the day and before sleep.',
    isFeatured: false
  }
];

// =====================================================================
// ONZNATURAL — Database Catalogue Synchronization & Seeder
// Seeds/Upserts all 17 verified products into Supabase PostgreSQL
// =====================================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fyhacouitykpbvylxwtz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGFjb3VpdHlrcGJ2eWx4d3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwNzAwOTcsImV4cCI6MjExMDY0NjA5N30.HMdp_onPpqgkuWAvg1DHgV3VuHdYDlMe47VPERoi3dc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PRODUCTS_TO_SEED = [
  {
    id: 'neem-tulsi-soap',
    name: 'Neem & Tulsi Soap',
    category: 'Handmade Cold Process Soap',
    net_weight_or_vol: '100 gm / 3.52 oz',
    mrp: 99,
    discount_price: 89,
    stock_quantity: 65,
    availability_status: 'in_stock',
    short_description: 'Purifying handcrafted luxury cold process soap infused with Neem & Tulsi for clear, refreshed skin.',
    full_description: 'Neem & Tulsi Cold Process Soap is handcrafted in small batches using nourishing plant oils and Kokum Butter. Neem is traditionally valued in Ayurvedic skincare for its purifying qualities, while Tulsi (Holy Basil) delivers an antioxidant-rich refreshing botanical sensation. Naturally retains pure vegetable glycerin to leave skin soft and deeply moisturized.',
    ingredients: 'Coconut Oil, Mahua Oil, Neem Oil, Kokum Butter, Sunflower Oil, Castor Oil, Saponified with Lye. Additives: Neem & Tulsi Leaf Powder, Natural Clay.',
    benefits: [
      'Gently cleanses skin removing dirt, excess sebum, and environmental impurities',
      'Neem is traditionally used for its clarifying and blemish-supporting properties',
      'Tulsi (Holy Basil) offers revitalizing, antioxidant-rich botanical protection',
      'Naturally retained glycerin helps protect the skin barrier against moisture loss'
    ],
    image: '/images/products/neem-tulsi-soap.webp'
  },
  {
    id: 'kesuda-palash-soap',
    name: 'Kesuda Palash Soap',
    category: 'Handmade Cold Process Soap',
    net_weight_or_vol: '100 gm / 3.52 oz',
    mrp: 99,
    discount_price: 89,
    stock_quantity: 80,
    availability_status: 'in_stock',
    short_description: 'Soothing cold process soap enriched with Palash (Kesuda) flowers and Kokum Butter for sun-exposed skin.',
    full_description: 'Kesuda Palash Cold Process Soap is handcrafted with wild-harvested Palash flowers, nourishing plant oils, and Kokum Butter. In Indian botanical tradition, Kesuda is revered for cooling summer heat rashes, soothing sensitive redness, and leaving skin refreshed and velvety soft without tightness.',
    ingredients: 'Coconut Oil, Mahua Oil, Kokum Butter, Sunflower Oil, Castor Oil, Essential Oil, Saponified with Lye. Additives: Kesuda (Palash) Flower Infusion & Powder.',
    benefits: [
      'Handcrafted using nourishing plant oils and unrefined Kokum Butter',
      'Gently cleanses while producing a rich, silky botanical lather',
      'Kesuda (Flame of the Forest) is traditionally valued for soothing prickly heat and irritation',
      'Artisanal cold process curing retains 100% natural glycerin'
    ],
    image: '/images/products/kesuda-palash-soap.webp'
  },
  {
    id: 'hibiscus-soap',
    name: 'Hibiscus Soap',
    category: 'Handmade Cold Process Soap',
    net_weight_or_vol: '100 gm / 3.52 oz',
    mrp: 99,
    discount_price: 89,
    stock_quantity: 50,
    availability_status: 'in_stock',
    short_description: 'Antioxidant-packed botanical cold process soap with natural AHAs for smooth, radiant skin.',
    full_description: 'Hibiscus Cold Process Soap harnesses the power of the botanical AHA properties of hibiscus flowers. It sloughs off dull surface cells while Kokum Butter and plant oils deeply nourish and revive elasticity for a radiant complexion.',
    ingredients: 'Coconut Oil, Mahua Oil, Kokum Butter, Sunflower Oil, Castor Oil, Essential Oil, Saponified with Lye. Additives: Hibiscus Flower Powder, Natural Clay.',
    benefits: [
      'Gently cleanses while supporting natural skin renewal',
      'Rich in natural plant antioxidants to promote a fresh, youthful glow',
      'Retained cold-process vegetable glycerin preserves optimal moisture balance'
    ],
    image: '/images/products/hibiscus-soap.webp'
  },
  {
    id: 'ubtan-soap',
    name: 'Ubtan Soap',
    category: 'Handmade Cold Process Soap',
    net_weight_or_vol: '100 gm / 3.52 oz',
    mrp: 99,
    discount_price: 89,
    stock_quantity: 45,
    availability_status: 'in_stock',
    short_description: 'Traditional bridal herbal soap with Besan, Turmeric, Milk, and Multani Mitti for natural tan removal.',
    full_description: 'Ubtan Cold Process Soap unites the sacred herbs of Indian beauty rituals: gram flour (Besan), wild Kasturi turmeric, wholesome milk, and Fuller\'s Earth (Multani Mitti). It provides mild, non-stripping exfoliation to fade sun tan and restore an even, luminous bridal glow.',
    ingredients: 'Coconut Oil, Mahua Oil, Kokum Butter, Sunflower Oil, Castor Oil, Essential Oil, Saponified with Lye. Additives: Besan (Gram Flour), Turmeric, Milk, Multani Mitti.',
    benefits: [
      'Gently exfoliates dead skin cells, excess sebum, and daily pollutants',
      'Besan delivers ultra-fine polishing without micro-tears',
      'Turmeric visibly brightens uneven tone and sun tan',
      'Preserves the skin\'s natural protective lipid barrier'
    ],
    image: '/images/products/ubtan-soap.webp'
  },
  {
    id: 'charcoal-rice-soap',
    name: 'Activated Charcoal & Rice Soap',
    category: 'Handmade Cold Process Soap',
    net_weight_or_vol: '100 gm / 3.52 oz',
    mrp: 99,
    discount_price: 89,
    stock_quantity: 35,
    availability_status: 'in_stock',
    short_description: 'Deep pore detox cold process bar with activated bamboo charcoal and fine rice powder micro-polishing.',
    full_description: 'Crafted with premium Activated Bamboo Charcoal and micro-milled Rice Powder. Draws out embedded impurities, excess oil, and environmental grime while rice powder smooths uneven texture.',
    ingredients: 'Coconut Oil, Mahua Oil, Kokum Butter, Sunflower Oil, Castor Oil, Saponified with Lye. Additives: Activated Bamboo Charcoal Powder, Rice Powder.',
    benefits: [
      'Activated charcoal acts like a magnet for deep pore dirt',
      'Rice powder micro-polishes without scratching the surface',
      'Retains 100% natural vegetable glycerin'
    ],
    image: '/images/products/charcoal-rice-soap.webp'
  },
  {
    id: 'aparajita-body-lotion',
    name: 'Aparajita Body Lotion',
    category: 'Body Care',
    net_weight_or_vol: '200 ml / 6.76 fl oz',
    mrp: 299,
    discount_price: 269,
    stock_quantity: 40,
    availability_status: 'in_stock',
    short_description: 'Silky botanical body lotion infused with antioxidant-rich Butterfly Pea (Aparajita) and Kokum Butter.',
    full_description: 'A luxurious everyday body lotion formulated with blue Aparajita flower extract, pure plant oils, and Kokum butter. Absorbs rapidly into dry skin to deliver long-lasting velvety hydration.',
    ingredients: 'Purified Water, Kokum Butter, Sweet Almond Oil, Coconut Oil, Emulsifying Wax, Aparajita (Clitoria Ternatea) Extract, Vegetable Glycerin, Mild Preservative.',
    benefits: [
      'Provides 24-hour lightweight hydration without greasiness',
      'Aparajita flower extract delivers rich proanthocyanidin antioxidants',
      'Restores velvety softness to dry elbows, knees, and legs'
    ],
    image: '/images/products/aparajita-body-lotion.webp'
  },
  {
    id: 'lavender-body-lotion',
    name: 'Lavender Body Lotion',
    category: 'Body Care',
    net_weight_or_vol: '200 ml / 6.76 fl oz',
    mrp: 299,
    discount_price: 269,
    stock_quantity: 42,
    availability_status: 'in_stock',
    short_description: 'Calming aromatherapeutic lavender body lotion with pure French lavender essential oil and shea butter.',
    full_description: 'Infused with calming French lavender essential oil and rich botanical butters. Relaxes the senses while providing soothing hydration for dry, tight skin.',
    ingredients: 'Purified Water, Shea Butter, Kokum Butter, Sunflower Oil, Pure Lavender Essential Oil, Vegetable Glycerin, Emulsifying Wax, Mild Preservative.',
    benefits: [
      'Soothes the mind and body with natural aromatherapeutic lavender',
      'Deeply nourishes dry, flaky skin',
      'Non-sticky quick absorbing formula'
    ],
    image: '/images/products/lavender-body-lotion.webp'
  },
  {
    id: 'honey-almond-body-lotion',
    name: 'Honey & Almond Body Lotion',
    category: 'Body Care',
    net_weight_or_vol: '200 ml / 6.76 fl oz',
    mrp: 299,
    discount_price: 269,
    stock_quantity: 38,
    availability_status: 'in_stock',
    short_description: 'Deeply nourishing botanical lotion with sweet almond oil and forest honey for dry skin.',
    full_description: 'Nourishes dry skin with pure cold-pressed Sweet Almond oil and natural forest Honey. Seals in essential lipids for radiant, soft skin all day.',
    ingredients: 'Purified Water, Sweet Almond Oil, Forest Honey, Kokum Butter, Coconut Oil, Vegetable Glycerin, Mild Preservative.',
    benefits: [
      'Rich in vitamin E from sweet almond oil',
      'Honey humectant seals moisture into the skin barrier',
      'Leaves skin supple with a mild natural warm scent'
    ],
    image: '/images/products/honey-almond-body-lotion.webp'
  },
  {
    id: 'kesuda-body-lotion',
    name: 'Kesuda Body Lotion',
    category: 'Body Care',
    net_weight_or_vol: '200 ml / 6.76 fl oz',
    mrp: 299,
    discount_price: 269,
    stock_quantity: 48,
    availability_status: 'in_stock',
    short_description: 'Cooling, soothing lotion with wild Palash flower extract for heat-sensitive and sun-exposed skin.',
    full_description: 'Specifically crafted for warm weather and sensitive skin prone to redness. Delivers refreshing botanical cooling and prevents trans-epidermal moisture loss.',
    ingredients: 'Purified Water, Kesuda (Palash) Flower Infusion, Kokum Butter, Coconut Oil, Aloe Vera Gel, Vegetable Glycerin, Mild Preservative.',
    benefits: [
      'Instant calming comfort for heat rashes and sun-exposed redness',
      'Lightweight cooling hydration for summer and humid climates',
      'Soothes sensitive, reactive skin without synthetic cooling agents'
    ],
    image: '/images/products/kesuda-body-lotion.webp'
  },
  {
    id: 'aparajita-body-cream',
    name: 'Aparajita Body Cream',
    category: 'Body Care',
    net_weight_or_vol: '100 gm / 3.52 oz',
    mrp: 249,
    discount_price: 219,
    stock_quantity: 30,
    availability_status: 'in_stock',
    short_description: 'Rich, concentrated plant butter cream with Aparajita flower extract for ultra-dry areas.',
    full_description: 'A dense, intensely nourishing botanical cream with raw Kokum butter and Aparajita flower infusion. Provides deep barrier repair for rough heels, elbows, and very dry skin.',
    ingredients: 'Raw Kokum Butter, Coconut Oil, Aparajita Extract, Sweet Almond Oil, Beeswax, Vegetable Glycerin, Mild Preservative.',
    benefits: [
      'Intense lipid replenishment for rough, cracked skin',
      'High concentration of unrefined kokum butter',
      'Antioxidant shield against environmental dryness'
    ],
    image: '/images/products/aparajita-body-cream.webp'
  },
  {
    id: 'kesuda-palash-body-cream',
    name: 'Kesuda Palash Body Cream',
    category: 'Body Care',
    net_weight_or_vol: '100 gm / 3.52 oz',
    mrp: 249,
    discount_price: 219,
    stock_quantity: 32,
    availability_status: 'in_stock',
    short_description: 'Deeply soothing concentrated body cream with Kesuda flower extract for irritated skin.',
    full_description: 'A rich soothing cream crafted with wild-harvested Kesuda flowers and nourishing plant butters. Calms irritated dry skin patches and heat irritation.',
    ingredients: 'Kokum Butter, Kesuda (Palash) Flower Extract, Sunflower Oil, Coconut Oil, Vegetable Glycerin, Mild Preservative.',
    benefits: [
      'Soothes persistent dry heat rashes and chafed skin',
      'Rich protective butter shield for compromised barriers',
      'Completely free of artificial colorants and chemical fragrances'
    ],
    image: '/images/products/kesuda-palash-body-cream.webp'
  },
  {
    id: 'honey-almond-body-cream',
    name: 'Honey & Almond Body Cream',
    category: 'Body Care',
    net_weight_or_vol: '100 gm / 3.52 oz',
    mrp: 249,
    discount_price: 219,
    stock_quantity: 28,
    availability_status: 'in_stock',
    short_description: 'Ultra-rich butter cream packed with almond oil, honey, and kokum butter for winter dryness.',
    full_description: 'A deeply conditioning herbal butter cream combining pure Forest Honey, Sweet Almond Oil, and Kokum Butter. Melts into dry skin to deliver intense moisture.',
    ingredients: 'Kokum Butter, Sweet Almond Oil, Forest Honey, Coconut Oil, Castor Oil, Vegetable Glycerin, Mild Preservative.',
    benefits: [
      'Dense hydration for winter skin and severe dry patches',
      'Deeply conditions with natural vitamin E and honey humectants',
      'Long-lasting lipid protection against harsh winds'
    ],
    image: '/images/products/honey-almond-body-cream.webp'
  },
  {
    id: 'face-body-wash-neem-tulsi',
    name: 'Neem & Tulsi Face & Body Wash',
    category: 'Face & Body Wash',
    net_weight_or_vol: '200 ml / 6.76 fl oz',
    mrp: 249,
    discount_price: 219,
    stock_quantity: 45,
    availability_status: 'in_stock',
    short_description: 'Gentle sulfate-free liquid cleanser with pure Neem and Tulsi extracts for acne-prone skin.',
    full_description: 'A botanical liquid face and body wash formulated with saponified coconut oil, neem, and holy basil. Cleanses pores deeply without synthetic SLS or skin-stripping surfactants.',
    ingredients: 'Purified Water, Saponified Coconut Oil, Neem Leaf Extract, Tulsi Extract, Vegetable Glycerin, Kokum Butter, Mild Preservative.',
    benefits: [
      '100% sulfate-free gentle liquid cleansing',
      'Clarifies acne blemishes on face, chest, and back',
      'Maintains comfortable pH balance'
    ],
    image: '/images/products/face-body-wash-neem-tulsi.webp'
  },
  {
    id: 'face-body-wash-kesuda',
    name: 'Kesuda Face & Body Wash',
    category: 'Face & Body Wash',
    net_weight_or_vol: '200 ml / 6.76 fl oz',
    mrp: 249,
    discount_price: 219,
    stock_quantity: 50,
    availability_status: 'in_stock',
    short_description: 'Cooling liquid botanical cleanser with Palash flowers for sensitive, heat-irritated skin.',
    full_description: 'A soothing liquid wash crafted with fresh Kesuda flower infusion. Gently washes away sweat and grime while calming heat sensitivity.',
    ingredients: 'Purified Water, Saponified Coconut Oil, Kesuda (Palash) Flower Infusion, Vegetable Glycerin, Kokum Butter, Mild Preservative.',
    benefits: [
      'Gently cleanses without synthetic detergents or parabens',
      'Cools summer heat and calms skin irritation',
      'Produces a light, refreshing botanical foam'
    ],
    image: '/images/products/face-body-wash-kesuda.webp'
  },
  {
    id: 'hand-wash-lemon',
    name: 'Fresh Lemon Hand Wash',
    category: 'Hand Wash',
    net_weight_or_vol: '250 ml / 8.45 fl oz',
    mrp: 149,
    discount_price: 129,
    stock_quantity: 60,
    availability_status: 'in_stock',
    short_description: 'Artisanal botanical hand wash infused with pure cold-pressed lemon essential oil.',
    full_description: 'Crafted with cold-pressed lemon essential oil and coconut oil derivatives. Washes hands clean without stripping moisture or causing post-wash dryness.',
    ingredients: 'Purified Water, Saponified Coconut Oil, Cold Pressed Lemon Essential Oil, Vegetable Glycerin, Mild Preservative.',
    benefits: [
      'Removes grease, food odors, and grime naturally',
      'Cold pressed lemon oil leaves hands clean and refreshed',
      'Glycerin-rich base keeps hands soft after repeated washes'
    ],
    image: '/images/products/hand-wash-lemon.webp'
  },
  {
    id: 'rice-aloe-face-cream',
    name: 'Rice & Aloe Vera Face Cream',
    category: 'Face Care',
    net_weight_or_vol: '50 gm / 1.76 oz',
    mrp: 249,
    discount_price: 219,
    stock_quantity: 55,
    availability_status: 'in_stock',
    short_description: 'Lightweight botanical face cream with organic Aloe Vera, Rice powder extract, and Kokum butter.',
    full_description: 'A weightless, non-comedogenic daily face cream that balances oiliness while infusing deep hydration. Pure Aloe Vera soothes redness while fine Rice extract refines skin texture.',
    ingredients: 'Organic Aloe Vera Gel, Rice Powder Extract, Kokum Butter, Sweet Almond Oil, Vegetable Glycerin, Mild Preservative.',
    benefits: [
      'Ultra-light non-greasy hydration suitable for all skin types',
      'Rice extract naturally brightens and refines skin texture',
      'Aloe vera calms sun irritation and balances redness'
    ],
    image: '/images/products/rice-aloe-face-cream.webp'
  },
  {
    id: 'lip-balm',
    name: 'Botanical Nourishing Lip Balm',
    category: 'Lip Care',
    net_weight_or_vol: '10 gm / 0.35 oz',
    mrp: 89,
    discount_price: 69,
    stock_quantity: 90,
    availability_status: 'in_stock',
    short_description: 'Handcrafted cold-pressed plant butter lip balm for soft, protected lips with zero mineral oil.',
    full_description: 'Crafted with unrefined Kokum butter, cold-pressed Castor oil, and pure Beeswax. Glides smoothly to heal chapped, dry lips without petroleum jelly.',
    ingredients: 'Kokum Butter, Cold Pressed Castor Oil, Beeswax, Coconut Oil, Sweet Almond Oil, Natural Vitamin E.',
    benefits: [
      '100% natural, petroleum-free, and mineral oil-free',
      'Kokum butter seals in moisture to heal chapped lips',
      'Provides a natural, healthy soft sheen'
    ],
    image: '/images/products/lip-balm.webp'
  }
];

async function seedProducts() {
  console.log(`Starting synchronization of ${PRODUCTS_TO_SEED.length} verified products to Supabase...`);

  for (const p of PRODUCTS_TO_SEED) {
    const { error } = await supabase.from('products').upsert({
      id: p.id,
      name: p.name,
      category: p.category,
      net_weight_or_vol: p.net_weight_or_vol,
      mrp: p.mrp,
      discount_price: p.discount_price,
      stock_quantity: p.stock_quantity,
      availability_status: p.availability_status,
      short_description: p.short_description,
      full_description: p.full_description,
      ingredients: p.ingredients,
      benefits: p.benefits,
      image: p.image,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    if (error) {
      console.error(`Error syncing ${p.id}:`, error.message);
    } else {
      console.log(`✓ Synchronized ${p.id} (MRP: ₹${p.mrp}, Stock: ${p.stock_quantity}, Status: ${p.availability_status})`);
    }
  }

  const { data: countData, error: countErr } = await supabase.from('products').select('id, name, mrp, stock_quantity, availability_status');
  if (countErr) {
    console.error('Count query error:', countErr.message);
  } else {
    console.log(`\n🎉 Total products now in Supabase products table: ${countData.length}`);
  }
}

seedProducts().catch(console.error);

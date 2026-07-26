import { Ingredient } from '../types';

export const ingredientsData: Ingredient[] = [
  {
    id: 'kesuda',
    name: 'Kesuda / Palash Flower',
    hindiName: 'केसूड़ा / पलाश',
    image: '/assets/ingredients/kesuda.jpg',
    description: 'Kesuda (Flame of the Forest) is a revered Indian botanical traditionally known for cooling, soothing, and revitalizing skin, especially in warm weather.',
    benefits: [
      'Soothes skin exposed to heat and sunlight',
      'Helps maintain a fresh, healthy-looking complexion',
      'Provides natural soothing botanical infusions'
    ],
    usedInProducts: [
      { id: 'kesuda-soap', name: 'Kesuda Cold Process Soap' },
      { id: 'face-body-wash-kesuda', name: 'Kesuda Face & Body Wash' },
      { id: 'body-cream-kesuda', name: 'Kesuda Body Cream' }
    ]
  },
  {
    id: 'neem',
    name: 'Neem Oil & Leaves',
    hindiName: 'नीम',
    image: '/assets/ingredients/neem.jpg',
    description: 'Neem is Ayurveda’s legendary purifying herb, renowned for deep skin support, balancing excess oil, and protecting against environmental impurities.',
    benefits: [
      'Deeply purifies and cleanses skin pores',
      'Helps balance oily and blemish-prone complexions',
      'Soothes skin irritations and maintains clarity'
    ],
    usedInProducts: [
      { id: 'neem-tulsi-soap', name: 'Neem Tulsi Cold Process Soap' },
      { id: 'face-body-wash-neem-tulsi', name: 'Neem Tulsi Face & Body Wash' }
    ]
  },
  {
    id: 'tulsi',
    name: 'Tulsi (Holy Basil)',
    hindiName: 'तुलसी',
    image: '/assets/ingredients/tulsi.jpg',
    description: 'Tulsi is rich in botanical antioxidants that revitalize dull skin, fight environmental stress, and leave the skin feeling fresh and energized.',
    benefits: [
      'Rich in natural antioxidants for skin radiance',
      'Leaves skin feeling fresh, clean, and energized',
      'Protects skin from daily urban environmental fatigue'
    ],
    usedInProducts: [
      { id: 'neem-tulsi-soap', name: 'Neem Tulsi Cold Process Soap' },
      { id: 'face-body-wash-neem-tulsi', name: 'Neem Tulsi Face & Body Wash' }
    ]
  },
  {
    id: 'hibiscus',
    name: 'Hibiscus Flower Powder',
    hindiName: 'गुडहल का फूल',
    image: '/assets/ingredients/hibiscus.jpg',
    description: 'Known as the "Botox plant" of nature, Hibiscus is packed with natural AHA organic acids and antioxidants for firm, glowing skin.',
    benefits: [
      'Rich in botanical antioxidants',
      'Improves skin tone uniformity',
      'Supports soft, supple texture'
    ],
    usedInProducts: [
      { id: 'hibiscus-soap', name: 'Hibiscus Cold Process Soap' }
    ]
  },
  {
    id: 'rice',
    name: 'Rice Extract & Powder',
    hindiName: 'चावल का आटा / अर्क',
    image: '/assets/ingredients/rice.jpg',
    description: 'Rice has been used for centuries across Asia for gentle skin exfoliation, softening texture, and promoting a luminous, brighter complexion.',
    benefits: [
      'Provides ultra-gentle micro-exfoliation',
      'Enhances natural skin luminosity and brightness',
      'Smooths rough skin texture naturally'
    ],
    usedInProducts: [
      { id: 'rice-aloe-face-cream', name: 'Rice Aloe Face Cream' },
      { id: 'charcoal-rice-soap', name: 'Charcoal Rice Cold Process Soap' }
    ]
  },
  {
    id: 'aloe-vera',
    name: 'Aloe Vera Gel & Juice',
    hindiName: 'घृतकुमारी (एलोवेरा)',
    image: '/assets/ingredients/aloe-vera.jpg',
    description: 'Pure Aloe Vera delivers lightweight, cooling hydration that calms sensitive skin and locks in natural moisture without feeling heavy.',
    benefits: [
      'Delivers deep, oil-free hydration',
      'Instantly calms and soothes delicate skin',
      'Helps maintain soft, supple elasticity'
    ],
    usedInProducts: [
      { id: 'rice-aloe-face-cream', name: 'Rice Aloe Face Cream' }
    ]
  },
  {
    id: 'charcoal',
    name: 'Activated Charcoal',
    hindiName: 'ऐक्टिवेटेड चारकोल',
    image: '/assets/ingredients/charcoal.jpg',
    description: 'Activated Charcoal acts as a natural magnet to draw out deep-seated dirt, pollution, and excess sebum from skin pores.',
    benefits: [
      'Draws out surface impurities and excess oil',
      'Deeply clarifies clogged pores',
      'Leaves skin clean, smooth, and refreshed'
    ],
    usedInProducts: [
      { id: 'charcoal-rice-soap', name: 'Charcoal Rice Cold Process Soap' }
    ]
  },
  {
    id: 'ubtan-blend',
    name: 'Ubtan Blend (Besan, Haldi, Milk & Multani Mitti)',
    hindiName: 'उबटन मिश्रण (बेसन, हल्दी, दूध)',
    image: '/assets/ingredients/ubtan.jpg',
    description: 'The iconic royal Indian skin treatment blending Besan (chickpea flour), Haldi (turmeric), Milk, and Multani Mitti for unmatched glow.',
    benefits: [
      'Besan offers natural exfoliation without harshness',
      'Turmeric (Haldi) imparts a golden botanical radiance',
      'Milk and Multani Mitti deeply nourish and refine'
    ],
    usedInProducts: [
      { id: 'ubtan-soap', name: 'Ubtan Cold Process Soap' }
    ]
  },
  {
    id: 'aparajita',
    name: 'Aparajita (Butterfly Pea)',
    hindiName: 'अपराजिता (शंखपुष्पी / बटरफ्लाई पी)',
    image: '/assets/ingredients/aparajita.jpg',
    description: 'Aparajita is a vibrant blue flower celebrated in traditional wellness for its intense antioxidant profile that protects against dullness.',
    benefits: [
      'Protects against free-radical damage',
      'Supports bright, healthy-looking skin',
      'Natural botanical antioxidant powerhouse'
    ],
    usedInProducts: [
      { id: 'aparajita-body-lotion', name: 'Aparajita Body Lotion' }
    ]
  },
  {
    id: 'kokum-butter',
    name: 'Kokum Butter & Botanical Oils',
    hindiName: 'कोकम बटर एवं वनस्पति तेल',
    image: '/assets/ingredients/kokum.jpg',
    description: 'Cold-pressed Coconut, Mahua, Castor, Sunflower, and Kokum Butter form the nourishing foundation of all our handcrafted cold process bars.',
    benefits: [
      'Preserves natural plant glycerin during saponification',
      'Deeply moisturizes without synthetic waxes',
      'Produces a dense, creamy, luxurious lather'
    ],
    usedInProducts: [
      { id: 'neem-tulsi-soap', name: 'Neem Tulsi Cold Process Soap' },
      { id: 'kesuda-soap', name: 'Kesuda Cold Process Soap' },
      { id: 'hibiscus-soap', name: 'Hibiscus Cold Process Soap' },
      { id: 'ubtan-soap', name: 'Ubtan Cold Process Soap' },
      { id: 'charcoal-rice-soap', name: 'Charcoal Rice Cold Process Soap' }
    ]
  },
  {
    id: 'lemon',
    name: 'Cold Pressed Lemon Oil',
    hindiName: 'नींबू आवश्यक तेल',
    image: '/assets/ingredients/lemon.jpg',
    description: 'Cold-pressed Lemon essential oil provides a crisp, energizing citrus aroma while offering natural cleansing and clarifying properties.',
    benefits: [
      'Natural invigorating citrus aroma',
      'Gently clarifies hands without harshness',
      'Leaves skin fresh and energized'
    ],
    usedInProducts: [
      { id: 'hand-wash-lemon', name: 'Lemon Hand Wash' }
    ]
  },
  {
    id: 'lavender',
    name: 'Pure Lavender Essential Oil',
    hindiName: 'लैवेंडर तेल',
    image: '/assets/ingredients/lavender.jpg',
    description: 'Calming French Lavender oil calms both senses and skin, making self-care routines deeply relaxing and tranquil.',
    benefits: [
      'Provides a soothing aromatherapeutic scent',
      'Soothes daily stress on body skin',
      'Hydrates and softens dry complexions'
    ],
    usedInProducts: [
      { id: 'lavender-body-lotion', name: 'Lavender Body Lotion' }
    ]
  }
];

export interface SoapVariant {
  id: string;
  name: string;
  image: string;
  category: string;
}

export interface BodyWashVariant {
  id: string;
  name: string;
  fullName: string;
  image: string;
}

export interface ComboOffer {
  id: string;
  number: number;
  title: string;
  tagline: string;
  subtitle?: string;
  mrp: number;
  specialPrice: number;
  saving: number;
  discountLabel: string; // e.g. "10% OFF", "25% OFF", "SAVE ₹100"
  image: string;
  rules: {
    requiredSoaps: number;
    requiresBodyWash: boolean;
    includesLipBalm: boolean;
  };
  sampleItems: string[];
}

export interface CampaignConfig {
  campaignName: string;
  badgeText: string;
  tagline: string;
  hook: string;
  startDate: string; // ISO format
  endDate: string; // ISO format
  validityDisplay: string;
  contactPhone: string;
  websiteUrl: string;
  isEnabled: boolean;
  allowedSoaps: SoapVariant[];
  allowedBodyWashes: BodyWashVariant[];
  lipBalm: {
    name: string;
    image: string;
    weight: string;
  };
  combos: ComboOffer[];
  benefits: string[];
  terms: string[];
}

export const RAKSHA_BANDHAN_CAMPAIGN: CampaignConfig = {
  campaignName: "RAKSHA BANDHAN SPECIAL OFFER",
  badgeText: "Festive Gifting 2026",
  tagline: "Gift Natural. Gift With Love.",
  hook: "Celebrate the bond. Gift a little everyday care.",
  startDate: "2026-08-19T00:00:00+05:30",
  endDate: "2026-08-28T23:59:59+05:30",
  validityDisplay: "19 – 28 AUGUST 2026",
  contactPhone: "+91 97267 39515",
  websiteUrl: "https://lavanyanatural.in/",
  isEnabled: true,

  allowedSoaps: [
    {
      id: "neem-tulsi-soap",
      name: "Neem Tulsi Soap",
      image: "/assets/products/neem-tulsi-soap.png",
      category: "Cold Process Soap"
    },
    {
      id: "ubtan-soap",
      name: "Ubtan Soap",
      image: "/assets/products/ubtan-soap.PNG",
      category: "Cold Process Soap"
    },
    {
      id: "charcoal-rice-soap",
      name: "Charcoal & Rice Soap",
      image: "/assets/products/charcoal-rice-soap.PNG",
      category: "Cold Process Soap"
    },
    {
      id: "kesuda-soap",
      name: "Kesuda Soap",
      image: "/assets/products/kesuda-soap.PNG",
      category: "Cold Process Soap"
    },
    {
      id: "hibiscus-soap",
      name: "Hibiscus Soap",
      image: "/assets/products/hibiscus-soap.PNG",
      category: "Cold Process Soap"
    }
  ],

  allowedBodyWashes: [
    {
      id: "kesuda",
      name: "Kesuda",
      fullName: "Kesuda Face & Body Wash (300ml)",
      image: "/assets/products/face-body-wash-kesuda.webp"
    },
    {
      id: "neem-tulsi",
      name: "Neem & Tulsi",
      fullName: "Neem & Tulsi Face & Body Wash (300ml)",
      image: "/assets/products/face-body-wash-neem-tulsi.webp"
    }
  ],

  lipBalm: {
    name: "Natural Lip Balm (10g)",
    image: "/assets/products/lip-balm.webp",
    weight: "10g"
  },

  combos: [
    {
      id: "combo-1",
      number: 1,
      title: "5 SOAP COLLECTION",
      tagline: "CHOOSE ANY 5 SOAP VARIANTS",
      mrp: 500,
      specialPrice: 450,
      saving: 50,
      discountLabel: "10% OFF",
      image: "/assets/use-for-making-website/soaps image.webp",
      rules: {
        requiredSoaps: 5,
        requiresBodyWash: false,
        includesLipBalm: false
      },
      sampleItems: [
        "Neem Tulsi Soap",
        "Ubtan Soap",
        "Charcoal & Rice Soap",
        "Kesuda Soap",
        "Hibiscus Soap"
      ]
    },
    {
      id: "combo-2",
      number: 2,
      title: "2 SOAP + 1 BODY WASH + 1 LIP BALM",
      tagline: "MAKE IT YOUR WAY",
      subtitle: "Choose your favourite soap variants and Face & Body Wash.",
      mrp: 530,
      specialPrice: 399,
      saving: 131,
      discountLabel: "25% OFF",
      image: "/assets/products/face-body-wash-kesuda.webp",
      rules: {
        requiredSoaps: 2,
        requiresBodyWash: true,
        includesLipBalm: true
      },
      sampleItems: [
        "Choose any 2 Handcrafted Soaps",
        "1 Face & Body Wash (Kesuda OR Neem & Tulsi)",
        "1 Natural Lip Balm (Included Free)"
      ]
    },
    {
      id: "combo-3",
      number: 3,
      title: "2 SOAP + 1 BODY WASH",
      tagline: "CHOOSE YOUR FAVOURITES",
      subtitle: "Choose any 2 soap variants and your choice of Face & Body Wash.",
      mrp: 460,
      specialPrice: 360,
      saving: 100,
      discountLabel: "SAVE ₹100", // IMPORTANT: Do NOT display 20% OFF
      image: "/assets/products/face-body-wash-neem-tulsi.webp",
      rules: {
        requiredSoaps: 2,
        requiresBodyWash: true,
        includesLipBalm: false
      },
      sampleItems: [
        "Choose any 2 Handcrafted Soaps",
        "1 Face & Body Wash (Kesuda OR Neem & Tulsi)"
      ]
    }
  ],

  benefits: [
    "Thoughtful gifting, made naturally.",
    "Choose the products and variants you love.",
    "More choice. Better value.",
    "Perfect for Raksha Bandhan gifting.",
    "Curated natural-care combinations at special festive prices.",
    "Make your gift personal with our mix-and-match options."
  ],

  terms: [
    "Offer valid only during the stated campaign period (19 – 28 August 2026).",
    "Combo customization is subject to available variant stock.",
    "No return.",
    "No refund."
  ]
};

// Check if campaign is active based on current time
export const isCampaignActive = (): boolean => {
  if (!RAKSHA_BANDHAN_CAMPAIGN.isEnabled) return false;
  const now = new Date().getTime();
  const start = new Date(RAKSHA_BANDHAN_CAMPAIGN.startDate).getTime();
  const end = new Date(RAKSHA_BANDHAN_CAMPAIGN.endDate).getTime();
  return now >= start && now <= end;
};

// Generate pre-filled WhatsApp message for selected combo
export const generateWhatsAppOrderUrl = (
  combo: ComboOffer,
  selectedSoaps: string[],
  selectedBodyWash: string
): string => {
  const phone = "919726739515";

  let soapLines = "";
  selectedSoaps.forEach((soap, index) => {
    soapLines += `Soap ${index + 1}: ${soap}\n`;
  });

  let bodyWashLine = "";
  if (combo.rules.requiresBodyWash && selectedBodyWash) {
    bodyWashLine = `Face & Body Wash: ${selectedBodyWash}\n`;
  }

  let lipBalmLine = "";
  if (combo.rules.includesLipBalm) {
    lipBalmLine = `Lip Balm: Included\n`;
  }

  const message = `Hello Lavanya Natural Care,\nI would like to order the Raksha Bandhan Special Offer.\n\nCombo: ${combo.title}\n${soapLines}${bodyWashLine}${lipBalmLine}Combo Price: ₹${combo.specialPrice}`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

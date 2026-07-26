export interface Product {
  id: string;
  name: string;
  category: 'Handmade Cold Process Soap' | 'Face & Body Wash' | 'Hand Wash' | 'Face Care' | 'Body Care' | 'Lip Care';
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  threeMainBenefits: [string, string, string];
  ingredients: string;
  netWeightOrVol: string;
  mrp: number;
  image: string;
  additionalImages?: string[];
  howToUse?: string;
  isFeatured?: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  hindiName?: string;
  image: string;
  benefits: string[];
  usedInProducts: {
    id: string;
    name: string;
  }[];
  description: string;
}

export interface ProcessStep {
  stepNumber: number;
  title: string;
  shortSummary: string;
  detailedDescription: string;
  iconName: string;
  keyHighlights: string[];
}

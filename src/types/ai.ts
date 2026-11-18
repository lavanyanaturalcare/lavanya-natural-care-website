import { Product } from './index';

export type SkinType = 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal' | 'mature';

export type SkinConcern = 
  | 'acne_blemishes'
  | 'tan_pigmentation'
  | 'excess_oil'
  | 'dryness_flakiness'
  | 'heat_rash'
  | 'dullness'
  | 'sensitive_redness';

export type ClimateSeason = 'summer_heat' | 'monsoon_humidity' | 'winter_dry' | 'moderate';

export interface SkincareQuizAnswers {
  skinType: SkinType;
  primaryConcern: SkinConcern;
  secondaryConcern?: string;
  climateSeason: ClimateSeason;
  routinePreference: 'simple' | 'comprehensive';
  notes?: string;
}

export interface RecommendedRoutineStep {
  step: 'Morning Cleansing' | 'Morning Moisture & Protection' | 'Evening Cleansing' | 'Evening Nourishment' | 'Weekly Herbal Treatment';
  recommendedProductId: string;
  productName: string;
  whyThisProduct: string;
  keyIngredients: string[];
  howToUse: string;
}

export interface ConsultationResult {
  prakritiSkinAnalysis: string;
  ayurvedicWisdom: string;
  routine: RecommendedRoutineStep[];
  lifestyleTips: string[];
  recommendedProducts: Product[];
  seasonalAdvice: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  imagePreview?: string;
  recommendedProductIds?: string[];
}

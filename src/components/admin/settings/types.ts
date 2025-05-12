
export interface PricingPlan {
  id: string;
  name: string;
  monthly_price: number;
  annual_price: number;
  tagline_en: string;
  tagline_es: string;
  is_highlighted: boolean;
  created_at: string;
  updated_at: string;
  button_text_en?: string;
  button_text_es?: string;
}

export interface Feature {
  id: string;
  plan_id: string;
  text_en: string;
  text_es: string;
  included: boolean;
  display_order: number;
  created_at?: string;
}

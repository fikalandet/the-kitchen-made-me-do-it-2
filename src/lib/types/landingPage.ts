export interface TextStyle {
  text: string;
  font: 'Poppins' | 'Lobster';
  style: 'normal' | 'bold' | 'italic' | 'underline';
  size: 'xs' | 's' | 'm' | 'l' | 'xl';
  alignment: 'left' | 'center' | 'right';
  color: string;
}

export interface TextLines {
  lines: string[];
  rotate: boolean;
  interval_seconds: number;
  placement: 'after_heading' | 'below_heading';
}

export interface CTAButton {
  text: string;
  link: string;
  color: string;
  text_color?: string;
}

export interface HeroContent {
  heading: TextStyle;
  intro: TextStyle;
  cta: CTAButton;
  text_lines?: TextLines;
  image?: string;
  layout?: 'fullwidth' | 'image_left' | 'image_right';
  height?: 'low' | 'medium' | 'high';
  overlay_color?: string;
  overlay_opacity?: number;
}

export interface NavigationCard {
  title: TextStyle;
  subtitle?: TextStyle;
  icon?: string;
  image?: string;
  background_color: string;
  text_color: string;
  use_image_cover?: boolean;
  cover_image?: string;
  overlay_color?: string;
  overlay_opacity?: number;
  target_section: string;
}

export interface NavigationCardsContent {
  cards: NavigationCard[];
}

export interface BenefitCard {
  icon?: string;
  image?: string;
  title: TextStyle;
  text: TextStyle;
  background_color?: string;
  text_color?: string;
}

export interface BenefitCategory {
  name: TextStyle;
  intro?: TextStyle;
  background_color?: string;
  cards: BenefitCard[];
}

export interface BenefitsContent {
  section_id?: string;
  heading: TextStyle;
  intro?: TextStyle;
  categories: BenefitCategory[];
}

export interface Step {
  icon: string;
  title: string;
  text: string;
}

export interface StepsContent {
  section_id?: string;
  heading: TextStyle;
  steps: Step[];
}

export interface Story {
  image?: string;
  name: string;
  age?: string;
  city?: string;
  subtitle?: TextStyle;
  description: TextStyle;
}

export interface StoriesContent {
  section_id?: string;
  heading: TextStyle;
  intro?: TextStyle;
  stories: Story[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQContent {
  heading: TextStyle;
  questions: FAQItem[];
  link_text?: string;
  link_url?: string;
}

export interface CTAContent {
  heading: TextStyle;
  text: TextStyle;
  cta: CTAButton;
  text_lines?: TextLines;
}

export interface TrustCard {
  icon: string;
  title: string;
  text: string;
}

export interface TrustContent {
  heading: TextStyle;
  cards: TrustCard[];
}

export type SectionContent =
  | HeroContent
  | NavigationCardsContent
  | BenefitsContent
  | StepsContent
  | StoriesContent
  | FAQContent
  | CTAContent
  | TrustContent;

export interface LandingPageSection {
  id: string;
  landing_page_id: string;
  section_type:
    | 'hero'
    | 'navigation_cards'
    | 'benefits'
    | 'steps'
    | 'stories'
    | 'faq'
    | 'cta'
    | 'trust';
  section_order: number;
  is_visible: boolean;
  background_type: 'none' | 'color' | 'image';
  background_color: string | null;
  background_image: string | null;
  content: SectionContent;
  created_at: string;
  updated_at: string;
}

export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  sections?: LandingPageSection[];
}

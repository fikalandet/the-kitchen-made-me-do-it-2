export interface TextStyle {
  text: string;
  font: 'Poppins' | 'Lobster';
  style: 'normal' | 'bold' | 'italic' | 'underline';
  size: 'xs' | 's' | 'm' | 'l' | 'xl';
  alignment: 'left' | 'center' | 'right';
  color: string;
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
}

export interface NavigationCard {
  title: string;
  icon: string;
  target_section: string;
}

export interface NavigationCardsContent {
  cards: NavigationCard[];
}

export interface BenefitCard {
  icon: string;
  title: string;
  text: string;
}

export interface BenefitsContent {
  section_id?: string;
  heading: TextStyle;
  intro?: TextStyle;
  cards: BenefitCard[];
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
  name: string;
  description: string;
  story: string;
  image?: string;
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

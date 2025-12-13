import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LandingPage as LandingPageType, LandingPageSection } from '../lib/types/landingPage';
import { HeroSection } from '../components/landing/HeroSection';
import { NavigationCardsSection } from '../components/landing/NavigationCardsSection';
import { BenefitsSection } from '../components/landing/BenefitsSection';
import { StepsSection } from '../components/landing/StepsSection';
import { StoriesSection } from '../components/landing/StoriesSection';
import { FAQSection } from '../components/landing/FAQSection';
import { CTASection } from '../components/landing/CTASection';

export function LandingPage() {
  const params = useParams<{ slug?: string }>();
  const [page, setPage] = useState<LandingPageType | null>(null);
  const [sections, setSections] = useState<LandingPageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug || window.location.pathname.split('/').pop() || 'bli-kock';

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      const { data: pageData, error: pageError } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (pageError) throw pageError;

      if (!pageData) {
        setError('Sidan kunde inte hittas');
        return;
      }

      setPage(pageData);

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('landing_page_sections')
        .select('*')
        .eq('landing_page_id', pageData.id)
        .eq('is_visible', true)
        .order('section_order', { ascending: true });

      if (sectionsError) throw sectionsError;

      setSections(sectionsData || []);
    } catch (err) {
      console.error('Error fetching landing page:', err);
      setError('Ett fel uppstod när sidan skulle laddas');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (section: LandingPageSection) => {
    const backgroundColor = section.background_type === 'color'
      ? section.background_color || undefined
      : undefined;

    switch (section.section_type) {
      case 'hero':
        return (
          <HeroSection
            key={section.id}
            content={section.content as any}
            backgroundColor={backgroundColor}
          />
        );
      case 'navigation_cards':
        return (
          <NavigationCardsSection
            key={section.id}
            content={section.content as any}
            backgroundColor={backgroundColor}
          />
        );
      case 'benefits':
        return (
          <BenefitsSection
            key={section.id}
            content={section.content as any}
            backgroundColor={backgroundColor}
          />
        );
      case 'steps':
        return (
          <StepsSection
            key={section.id}
            content={section.content as any}
            backgroundColor={backgroundColor}
          />
        );
      case 'stories':
        return (
          <StoriesSection
            key={section.id}
            content={section.content as any}
            backgroundColor={backgroundColor}
          />
        );
      case 'faq':
        return (
          <FAQSection
            key={section.id}
            content={section.content as any}
            backgroundColor={backgroundColor}
          />
        );
      case 'cta':
        return (
          <CTASection
            key={section.id}
            content={section.content as any}
            backgroundColor={backgroundColor}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f6f2e0' }}>
        <p className="text-gray-600">Laddar...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f6f2e0' }}>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sidan hittades inte</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {sections.map((section) => renderSection(section))}
    </div>
  );
}

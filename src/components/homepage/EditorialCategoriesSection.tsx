import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { EmptyState } from './EmptyState';

interface EditorialCategoriesSettings {
  backgroundColor?: string;
  backgroundOpacity?: number;
  sectionPaddingTop?: number;
  sectionPaddingBottom?: number;
  heading?: string;
  headingFont?: string;
  headingFontSize?: number;
  headingColor?: string;
  headingBold?: boolean;
  headingItalic?: boolean;
  headingAlignment?: 'left' | 'center';
  headingEmojiPrefix?: string;
  headingEmojiSuffix?: string;
  subtitleTexts?: string[];
  subtitleRotationInterval?: number;
  subtitlePlacement?: 'inline' | 'below';
  subtitleFont?: string;
  subtitleFontSize?: number;
  subtitleColor?: string;
  subtitleBold?: boolean;
  subtitleItalic?: boolean;
  ctaText?: string;
  ctaLinkType?: 'internal' | 'external';
  ctaLink?: string;
  ctaColor?: string;
  ctaPlacement?: 'left' | 'center' | 'right';
  [key: string]: any;
}

interface EditorialCategoriesSectionProps {
  settings: EditorialCategoriesSettings;
}

interface EditorialCategory {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  cta_text: string;
  is_featured: boolean;
  background_color: string;
  display_order: number;
}

export function EditorialCategoriesSection({ settings }: EditorialCategoriesSectionProps) {
  const [categories, setCategories] = useState<EditorialCategory[]>([]);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const subtitleTexts = settings.subtitleTexts || [];
    if (subtitleTexts.length <= 1) return;

    const rotationInterval = settings.subtitleRotationInterval || 10000;
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentSubtitleIndex((prev) => (prev + 1) % subtitleTexts.length);
        setFadeIn(true);
      }, 300);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [settings.subtitleTexts, settings.subtitleRotationInterval]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('editorial_categories')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const renderHeading = () => {
    const subtitleTexts = settings.subtitleTexts || [];
    const headingFontClass = settings.headingFont === 'lobster' ? 'font-lobster' : '';
    const headingFontFamily =
      settings.headingFont === 'serif' ? 'serif' :
      settings.headingFont === 'sans' ? 'sans-serif' :
      undefined;

    const subtitleFontClass = settings.subtitleFont === 'lobster' ? 'font-lobster' : '';
    const subtitleFontFamily =
      settings.subtitleFont === 'serif' ? 'serif' :
      settings.subtitleFont === 'sans' ? 'sans-serif' :
      undefined;

    return (
      <div
        className={`mb-8 ${
          settings.headingAlignment === 'center' || !settings.headingAlignment
            ? 'text-center'
            : 'text-left'
        }`}
      >
        {settings.subtitlePlacement === 'inline' || !settings.subtitlePlacement ? (
          <div className={`flex items-center gap-3 ${settings.headingAlignment === 'center' || !settings.headingAlignment ? 'justify-center' : ''}`}>
            {settings.headingEmojiPrefix && <span className="text-3xl">{settings.headingEmojiPrefix}</span>}
            <h2
              className={`text-3xl ${headingFontClass} ${settings.headingBold ? 'font-bold' : ''} ${settings.headingItalic ? 'italic' : ''}`}
              style={{
                fontFamily: headingFontFamily,
                fontSize: `${settings.headingFontSize || 32}px`,
                color: settings.headingColor || '#374151'
              }}
            >
              {settings.heading || 'Upptäck våra teman'}
            </h2>
            {settings.headingEmojiSuffix && <span className="text-3xl">{settings.headingEmojiSuffix}</span>}
            {subtitleTexts.length > 0 && subtitleTexts[0] && (
              <>
                <span className="text-gray-400 text-2xl">|</span>
                <div className="min-h-[24px] flex items-center">
                  <p
                    className={`transition-opacity duration-300 ${subtitleFontClass} ${settings.subtitleBold ? 'font-bold' : ''} ${settings.subtitleItalic ? 'italic' : ''}`}
                    style={{
                      opacity: fadeIn ? 1 : 0,
                      fontFamily: subtitleFontFamily,
                      fontSize: `${settings.subtitleFontSize || 16}px`,
                      color: settings.subtitleColor || '#6b7280'
                    }}
                  >
                    {subtitleTexts[currentSubtitleIndex]}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div>
            <div className={`flex items-center gap-3 ${settings.headingAlignment === 'center' || !settings.headingAlignment ? 'justify-center' : ''}`}>
              {settings.headingEmojiPrefix && <span className="text-3xl">{settings.headingEmojiPrefix}</span>}
              <h2
                className={`text-3xl ${headingFontClass} ${settings.headingBold ? 'font-bold' : ''} ${settings.headingItalic ? 'italic' : ''}`}
                style={{
                  fontFamily: headingFontFamily,
                  fontSize: `${settings.headingFontSize || 32}px`,
                  color: settings.headingColor || '#374151'
                }}
              >
                {settings.heading || 'Upptäck våra teman'}
              </h2>
              {settings.headingEmojiSuffix && <span className="text-3xl">{settings.headingEmojiSuffix}</span>}
            </div>
            {subtitleTexts.length > 0 && subtitleTexts[currentSubtitleIndex] && (
              <div className={`min-h-[24px] flex items-center mt-2 ${settings.headingAlignment === 'center' || !settings.headingAlignment ? 'justify-center' : ''}`}>
                <p
                  className={`transition-opacity duration-300 ${subtitleFontClass} ${settings.subtitleBold ? 'font-bold' : ''} ${settings.subtitleItalic ? 'italic' : ''}`}
                  style={{
                    opacity: fadeIn ? 1 : 0,
                    fontFamily: subtitleFontFamily,
                    fontSize: `${settings.subtitleFontSize || 16}px`,
                    color: settings.subtitleColor || '#6b7280'
                  }}
                >
                  {subtitleTexts[currentSubtitleIndex]}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <section
      className="px-4"
      style={{
        backgroundColor: settings.backgroundColor || '#ffffff',
        opacity: (settings.backgroundOpacity || 100) / 100,
        paddingTop: `${settings.sectionPaddingTop || 12}rem`,
        paddingBottom: `${settings.sectionPaddingBottom || 12}rem`
      }}
    >
      <div className="max-w-7xl mx-auto">
        {renderHeading()}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/redaktion/${category.slug}`}
              className={`rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow ${
                category.is_featured ? 'md:col-span-2' : ''
              }`}
              style={{ backgroundColor: category.background_color }}
            >
              {category.image_url && (
                <div className={`relative overflow-hidden ${category.is_featured ? 'h-96' : 'h-48'}`}>
                  <img
                    src={category.image_url}
                    alt={category.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {category.is_featured && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-400 text-white rounded-full text-sm font-medium">
                      Featured
                    </div>
                  )}
                </div>
              )}
              <div className="p-6">
                <h3 className={`font-bold text-gray-900 mb-2 ${category.is_featured ? 'text-2xl' : 'text-xl'}`}>
                  {category.title}
                </h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="inline-flex items-center gap-2 text-[#a1c798] hover:text-[#8fb386] font-medium transition-colors">
                  {category.cta_text}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {settings.ctaText && settings.ctaLink && (
          <div
            className={`flex ${
              settings.ctaPlacement === 'center' || !settings.ctaPlacement
                ? 'justify-center'
                : settings.ctaPlacement === 'right'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            {settings.ctaLinkType === 'internal' ? (
              <Link
                to={settings.ctaLink}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: settings.ctaColor || '#a1c798' }}
              >
                {settings.ctaText}
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <a
                href={settings.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: settings.ctaColor || '#a1c798' }}
              >
                {settings.ctaText}
                <ArrowRight className="w-5 h-5" />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

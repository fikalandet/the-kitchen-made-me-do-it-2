import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface ChefSpotlightSettings {
  backgroundColor?: string;
  heading?: string;
  headingFont?: string;
  headingFontSize?: number;
  headingBold?: boolean;
  headingItalic?: boolean;
  headingAlignment?: 'left' | 'center';
  headingColor?: string;
  subtitleTexts?: string[];
  subtitleRotationInterval?: number;
  subtitlePlacement?: 'inline' | 'below';
  subtitleColor?: string;
  featuredChefId?: string;
  mainImageUrl?: string;
  mainImageWidth?: 'full' | 'large' | 'medium';
  smallImageUrl?: string;
  smallImagePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  smallImageBorderColor?: string;
  smallImageBorderWidth?: number;
  imageShape?: 'rounded';
  curiosaItems?: Array<{ question: string; answer: string }>;
  curiosaFont?: string;
  curiosaFontSize?: number;
  curiosaBold?: boolean;
  curiosaItalic?: boolean;
  curiosaBgColor?: string;
  curiosaBorderColor?: string;
  curiosaBorderWidth?: number;
  curiosaOpacity?: number;
  curiosaWidth?: number;
  curiosaHeight?: number;
  curiosaPlacement?: 'below-image' | 'beside-article';
  articleTitle?: string;
  articleIngress?: string;
  articleBody?: string;
  articleFont?: string;
  articleFontSize?: number;
  articleBold?: boolean;
  articleItalic?: boolean;
  articleAlignment?: 'left' | 'center' | 'right';
  quoteText?: string;
  quoteFont?: string;
  quoteFontSize?: number;
  quoteBold?: boolean;
  quoteItalic?: boolean;
  quoteColor?: string;
  quoteAlignment?: 'left' | 'center' | 'right';
  quotePosition?: 'after-article' | 'after-curiosa' | 'before-cta';
  ctaText?: string;
  ctaColor?: string;
  ctaTextColor?: string;
  ctaFont?: string;
  ctaBold?: boolean;
  ctaSize?: 'small' | 'medium' | 'large';
  ctaAlignment?: 'left' | 'center' | 'right';
  ctaOpacity?: number;
}

interface Chef {
  id: string;
  display_name: string;
  bio?: string;
  city?: string;
  rating?: number;
  membership_level?: string;
  avatar_url?: string;
}

interface ChefSpotlightSectionProps {
  settings?: ChefSpotlightSettings;
}

const getFontFamily = (font?: string) => {
  if (!font) return undefined;
  const fontMap: Record<string, string> = {
    'poppins': 'Poppins, sans-serif',
    'poppins-light': 'Poppins, sans-serif',
    'poppins-medium': 'Poppins, sans-serif',
    'poppins-semibold': 'Poppins, sans-serif',
    'poppins-bold': 'Poppins, sans-serif',
    'lobster': 'Lobster, cursive',
    'sans': 'sans-serif',
    'serif': 'serif',
    'georgia': 'Georgia, serif',
    'playfair': 'Playfair Display, serif'
  };
  return fontMap[font] || undefined;
};

const getFontWeight = (font?: string, bold?: boolean) => {
  if (bold) return 700;
  const weightMap: Record<string, number> = {
    'poppins-light': 300,
    'poppins': 400,
    'poppins-medium': 500,
    'poppins-semibold': 600,
    'poppins-bold': 700
  };
  return font ? weightMap[font] : undefined;
};

const getSmallImagePosition = (position?: string) => {
  const positionMap: Record<string, React.CSSProperties> = {
    'top-left': { top: '1rem', left: '1rem' },
    'top-right': { top: '1rem', right: '1rem' },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    'bottom-left': { bottom: '1rem', left: '1rem' },
    'bottom-right': { bottom: '1rem', right: '1rem' }
  };
  return positionMap[position || 'top-left'] || positionMap['top-left'];
};

export const ChefSpotlightSection: React.FC<ChefSpotlightSectionProps> = ({ settings = {} }) => {
  const [chef, setChef] = useState<Chef | null>(null);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    if (settings.featuredChefId) {
      fetchChef();
    }
  }, [settings.featuredChefId]);

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

  const fetchChef = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, city, membership_level, bio')
        .eq('id', settings.featuredChefId)
        .maybeSingle();

      if (error) throw error;
      if (data) setChef(data);
    } catch (err) {
      console.error('Error fetching chef:', err);
    }
  };

  if (!settings.featuredChefId) {
    return null;
  }

  const subtitleTexts = settings.subtitleTexts || [];
  const curiosaItems = settings.curiosaItems || [];

  const renderQuote = () => {
    if (!settings.quoteText) return null;

    return (
      <blockquote
        className={`mb-12 py-6 ${
          settings.quoteFont === 'lobster' ? 'font-lobster' : ''
        } ${settings.quoteBold ? 'font-bold' : ''} ${settings.quoteItalic !== false ? 'italic' : ''}`}
        style={{
          fontFamily: getFontFamily(settings.quoteFont),
          fontWeight: getFontWeight(settings.quoteFont, settings.quoteBold),
          fontSize: `${settings.quoteFontSize || 24}px`,
          color: settings.quoteColor || '#4b5563',
          textAlign: settings.quoteAlignment || 'center'
        }}
      >
        "{settings.quoteText}"
      </blockquote>
    );
  };

  const renderCuriosa = () => {
    if (curiosaItems.length === 0 || !curiosaItems.some(item => item.question)) return null;

    return (
      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: settings.curiosaBgColor || '#f6f2e0',
          borderColor: settings.curiosaBorderColor || '#a1c798',
          borderWidth: `${settings.curiosaBorderWidth || 2}px`,
          borderStyle: 'solid',
          opacity: (settings.curiosaOpacity || 100) / 100,
          width: `${settings.curiosaWidth || 100}%`
        }}
      >
        <h4 className="text-xl font-bold text-gray-800 mb-4">Kuriosa</h4>
        <div className="space-y-3">
          {curiosaItems.map((item, index) => (
            item.question && (
              <div key={index}>
                <p
                  className={`text-gray-700 ${settings.curiosaBold ? 'font-bold' : 'font-semibold'} ${settings.curiosaItalic ? 'italic' : ''}`}
                  style={{
                    fontFamily: getFontFamily(settings.curiosaFont),
                    fontSize: `${settings.curiosaFontSize || 14}px`
                  }}
                >
                  {item.question}:
                </p>
                <p
                  className="text-gray-600"
                  style={{
                    fontFamily: getFontFamily(settings.curiosaFont),
                    fontSize: `${settings.curiosaFontSize || 14}px`
                  }}
                >
                  {item.answer || ''}
                </p>
              </div>
            )
          ))}
        </div>
      </div>
    );
  };

  return (
    <section
      className="py-8 px-4"
      style={{ backgroundColor: settings.backgroundColor || '#ffffff' }}
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={`mb-12 ${
            settings.headingAlignment === 'center' || !settings.headingAlignment
              ? 'text-center'
              : 'text-left'
          }`}
        >
          {settings.subtitlePlacement === 'inline' || !settings.subtitlePlacement ? (
            <div className={`flex items-center gap-3 ${settings.headingAlignment === 'center' || !settings.headingAlignment ? 'justify-center' : ''}`}>
              <h2
                className={`${
                  settings.headingFont === 'lobster' ? 'font-lobster' : ''
                } ${settings.headingBold ? 'font-bold' : ''} ${settings.headingItalic ? 'italic' : ''}`}
                style={{
                  fontFamily: getFontFamily(settings.headingFont),
                  fontSize: `${settings.headingFontSize || 36}px`,
                  color: settings.headingColor || '#374151'
                }}
              >
                {settings.heading || 'Kock i fokus'}
              </h2>
              {subtitleTexts.length > 0 && subtitleTexts[0] && (
                <>
                  <span className="text-gray-400 text-2xl">|</span>
                  <p
                    className="transition-opacity duration-300"
                    style={{
                      opacity: fadeIn ? 1 : 0,
                      color: settings.subtitleColor || '#374151'
                    }}
                  >
                    {subtitleTexts[currentSubtitleIndex]}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div>
              <h2
                className={`${
                  settings.headingFont === 'lobster' ? 'font-lobster' : ''
                } ${settings.headingBold ? 'font-bold' : ''} ${settings.headingItalic ? 'italic' : ''}`}
                style={{
                  fontFamily: getFontFamily(settings.headingFont),
                  fontSize: `${settings.headingFontSize || 36}px`,
                  color: settings.headingColor || '#374151'
                }}
              >
                {settings.heading || 'Kock i fokus'}
              </h2>
              {subtitleTexts.length > 0 && subtitleTexts[0] && (
                <p
                  className="transition-opacity duration-300 mt-2"
                  style={{
                    opacity: fadeIn ? 1 : 0,
                    color: settings.subtitleColor || '#374151'
                  }}
                >
                  {subtitleTexts[currentSubtitleIndex]}
                </p>
              )}
            </div>
          )}
        </div>

        <div className={`mb-12 ${settings.curiosaPlacement === 'beside-article' ? 'grid md:grid-cols-2 gap-8' : ''}`}>
          <div className="relative">
            {settings.mainImageUrl ? (
              <div className="relative">
                <img
                  src={settings.mainImageUrl}
                  alt="Huvudbild"
                  className={`w-full h-96 object-cover ${
                    settings.imageShape === 'rounded' || !settings.imageShape ? 'rounded-2xl' : ''
                  }`}
                />
                {settings.smallImageUrl && (
                  <img
                    src={settings.smallImageUrl}
                    alt="Liten bild"
                    className="absolute w-32 h-32 object-cover rounded-xl shadow-lg"
                    style={{
                      ...getSmallImagePosition(settings.smallImagePosition),
                      border: `${settings.smallImageBorderWidth || 4}px solid ${settings.smallImageBorderColor || '#ffffff'}`
                    }}
                  />
                )}
                {chef?.avatar_url && (
                  <img
                    src={chef.avatar_url}
                    alt={chef.display_name}
                    className="absolute bottom-4 left-4 w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                )}
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                Ingen bild tillgänglig
              </div>
            )}

            {settings.curiosaPlacement === 'below-image' && (
              <div className="mt-8">
                {renderCuriosa()}
              </div>
            )}
          </div>

          <div>
            {settings.articleTitle && (
              <h3
                className={`mb-4 ${
                  (settings as any).articleTitleFont === 'lobster' ? 'font-lobster' : ''
                } ${(settings as any).articleTitleBold ? 'font-bold' : ''}`}
                style={{
                  fontFamily: getFontFamily((settings as any).articleTitleFont || settings.articleFont),
                  fontSize: `${(settings as any).articleTitleSize || 24}px`,
                  textAlign: (settings as any).articleTitleAlign || settings.articleAlignment || 'left'
                }}
              >
                {settings.articleTitle}
              </h3>
            )}
            {settings.articleIngress && (
              <p
                className={`mb-4 ${
                  (settings as any).articleIngressFont === 'lobster' ? 'font-lobster' : ''
                } ${(settings as any).articleIngressBold ? 'font-bold' : ''}`}
                style={{
                  fontFamily: getFontFamily((settings as any).articleIngressFont || settings.articleFont),
                  fontSize: `${(settings as any).articleIngressSize || 16}px`,
                  textAlign: (settings as any).articleIngressAlign || settings.articleAlignment || 'left'
                }}
              >
                {settings.articleIngress}
              </p>
            )}
            {settings.articleBody && (
              <p
                className={`text-gray-600 ${
                  (settings as any).articleBodyFont === 'lobster' ? 'font-lobster' : ''
                } ${(settings as any).articleBodyBold || settings.articleBold ? 'font-bold' : ''} ${settings.articleItalic ? 'italic' : ''}`}
                style={{
                  fontFamily: getFontFamily((settings as any).articleBodyFont || settings.articleFont),
                  fontSize: `${(settings as any).articleBodySize || settings.articleFontSize || 14}px`,
                  textAlign: settings.articleAlignment || 'left'
                }}
              >
                {settings.articleBody}
              </p>
            )}

            {settings.quotePosition === 'after-article' && renderQuote()}

            {settings.curiosaPlacement === 'beside-article' && (
              <div className="mt-6">
                {renderCuriosa()}
              </div>
            )}
          </div>
        </div>

        {settings.quotePosition === 'after-curiosa' && settings.curiosaPlacement === 'below-image' && renderQuote()}

        {settings.quotePosition === 'before-cta' && renderQuote()}

        {settings.ctaText && (
          <div
            className="flex"
            style={{
              justifyContent:
                settings.ctaAlignment === 'left' ? 'flex-start' :
                settings.ctaAlignment === 'right' ? 'flex-end' :
                'center'
            }}
          >
            <a
              href={chef ? `/chef/${chef.id}` : '#'}
              className={`rounded-xl font-medium transition-all hover:shadow-lg ${
                settings.ctaSize === 'small' ? 'px-4 py-2 text-sm' :
                settings.ctaSize === 'large' ? 'px-8 py-4 text-lg' :
                'px-6 py-3 text-base'
              } ${settings.ctaFont === 'lobster' ? 'font-lobster' : ''} ${
                settings.ctaBold ? 'font-bold' : ''
              }`}
              style={{
                backgroundColor: settings.ctaColor || '#56c5c5',
                color: settings.ctaTextColor || '#ffffff',
                opacity: (settings.ctaOpacity || 100) / 100,
                fontFamily: getFontFamily(settings.ctaFont),
                display: 'inline-block'
              }}
            >
              {settings.ctaText}
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

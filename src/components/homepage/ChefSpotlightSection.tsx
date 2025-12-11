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
  mainImageWaveStyle?: 'none' | 'wave1' | 'wave2' | 'wave3';
  smallImageUrl?: string;
  smallImagePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  smallImageBorderColor?: string;
  smallImageBorderWidth?: number;
  imageShape?: 'rounded';
  curiosaItems?: Array<{ question: string; answer: string }>;
  curiosaLayout?: 'single' | 'double';
  curiosaItemLayout?: 'inline' | 'stacked';
  curiosaTitle?: string;
  curiosaTitleFont?: string;
  curiosaTitleSize?: number;
  curiosaTitleBold?: boolean;
  curiosaTitleItalic?: boolean;
  curiosaTitleAlignment?: 'left' | 'center' | 'right';
  curiosaTitleColor?: string;
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
  cta1Text?: string;
  cta1Color?: string;
  cta1TextColor?: string;
  cta1Font?: string;
  cta1Bold?: boolean;
  cta1Size?: 'small' | 'medium' | 'large';
  cta1Alignment?: 'left' | 'center' | 'right';
  cta1Opacity?: number;
  cta1Link?: string;
  cta1LinkType?: 'chef' | 'internal' | 'external';
  cta2Text?: string;
  cta2Color?: string;
  cta2TextColor?: string;
  cta2Font?: string;
  cta2Bold?: boolean;
  cta2Size?: 'small' | 'medium' | 'large';
  cta2Alignment?: 'left' | 'center' | 'right';
  cta2Opacity?: number;
  cta2Link?: string;
  cta2LinkType?: 'chef' | 'internal' | 'external';
  spacingHeaderToImage?: number;
  spacingImageToContent?: number;
  spacingCuriosaToArticle?: number;
  spacingContentToQuote?: number;
  spacingQuoteToButtons?: number;
  spacingBetweenButtons?: number;
  smallImageSize?: number;
  smallImageRotation?: number;
  articleTitleFont?: string;
  articleTitleSize?: number;
  articleTitleAlign?: 'left' | 'center' | 'right';
  articleTitleBold?: boolean;
  articleIngressFont?: string;
  articleIngressSize?: number;
  articleIngressAlign?: 'left' | 'center' | 'right';
  articleIngressBold?: boolean;
  articleBodyFont?: string;
  articleBodySize?: number;
  articleBodyBold?: boolean;
  curiosaTextColor?: string;
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

    const isDoubleLayout = settings.curiosaLayout === 'double';
    const isStackedLayout = settings.curiosaItemLayout === 'stacked';
    const halfPoint = Math.ceil(curiosaItems.length / 2);
    const column1Items = isDoubleLayout ? curiosaItems.slice(0, halfPoint) : curiosaItems;
    const column2Items = isDoubleLayout ? curiosaItems.slice(halfPoint) : [];

    const renderItem = (item: { question: string; answer: string }, index: number) => {
      if (!item.question) return null;

      if (isStackedLayout) {
        return (
          <div key={index} className="mb-3">
            <p
              className={`${settings.curiosaBold ? 'font-bold' : 'font-semibold'} ${settings.curiosaItalic ? 'italic' : ''}`}
              style={{
                fontFamily: getFontFamily(settings.curiosaFont),
                fontSize: `${settings.curiosaFontSize || 14}px`,
                color: settings.curiosaTitleColor || '#374151'
              }}
            >
              {item.question}
            </p>
            <p
              className="mt-1"
              style={{
                fontFamily: getFontFamily(settings.curiosaFont),
                fontSize: `${settings.curiosaFontSize || 14}px`,
                color: (settings as any).curiosaTextColor || '#4b5563'
              }}
            >
              {item.answer || ''}
            </p>
          </div>
        );
      }

      return (
        <p
          key={index}
          className="mb-2"
          style={{
            fontFamily: getFontFamily(settings.curiosaFont),
            fontSize: `${settings.curiosaFontSize || 14}px`
          }}
        >
          <span
            className={`${settings.curiosaBold ? 'font-bold' : 'font-semibold'} ${settings.curiosaItalic ? 'italic' : ''}`}
            style={{
              color: settings.curiosaTitleColor || '#374151'
            }}
          >
            {item.question}:
          </span>{' '}
          <span
            style={{
              color: (settings as any).curiosaTextColor || '#4b5563'
            }}
          >
            {item.answer || ''}
          </span>
        </p>
      );
    };

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
        <h4
          className={`mb-4 ${settings.curiosaTitleFont === 'lobster' ? 'font-lobster' : ''} ${
            settings.curiosaTitleBold ? 'font-bold' : 'font-semibold'
          } ${settings.curiosaTitleItalic ? 'italic' : ''}`}
          style={{
            fontFamily: getFontFamily(settings.curiosaTitleFont),
            fontSize: `${settings.curiosaTitleSize || 20}px`,
            textAlign: settings.curiosaTitleAlignment || 'left',
            color: settings.curiosaTitleColor || '#1f2937'
          }}
        >
          {settings.curiosaTitle || 'Kuriosa'}
        </h4>
        <div className={`${isDoubleLayout ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}`}>
          <div className={`${isDoubleLayout ? 'pr-6 md:border-r border-gray-400' : ''}`}>
            {column1Items.map((item, index) => renderItem(item, index))}
          </div>
          {isDoubleLayout && column2Items.length > 0 && (
            <div>
              {column2Items.map((item, index) => renderItem(item, index + halfPoint))}
            </div>
          )}
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
          className={`${
            settings.headingAlignment === 'center' || !settings.headingAlignment
              ? 'text-center'
              : 'text-left'
          }`}
          style={{ marginBottom: `${settings.spacingHeaderToImage || 48}px` }}
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
                {settings.mainImageWaveStyle && settings.mainImageWaveStyle !== 'none' && (
                  <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                    <svg
                      viewBox="0 0 1440 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-auto"
                      preserveAspectRatio="none"
                      style={{ display: 'block' }}
                    >
                      <path
                        d={
                          settings.mainImageWaveStyle === 'wave1'
                            ? 'M0,50 C240,20 480,80 720,50 C960,20 1200,80 1440,50 L1440,100 L0,100 Z'
                            : settings.mainImageWaveStyle === 'wave2'
                            ? 'M0,30 C360,70 720,0 1080,40 C1260,60 1350,50 1440,60 L1440,100 L0,100 Z'
                            : 'M0,60 C240,30 480,70 720,40 C960,10 1200,60 1440,30 L1440,100 L0,100 Z'
                        }
                        fill={settings.backgroundColor || '#ffffff'}
                      />
                    </svg>
                  </div>
                )}
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
              <div style={{ marginTop: `${settings.spacingImageToContent || 32}px` }}>
                {renderCuriosa()}
              </div>
            )}
          </div>

          <div style={{ marginTop: settings.curiosaPlacement === 'beside-article' ? `${settings.spacingCuriosaToArticle || 24}px` : undefined }}>
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
              <div style={{ marginTop: `${settings.spacingCuriosaToArticle || 24}px` }}>
                {renderCuriosa()}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: `${settings.spacingContentToQuote || 48}px` }}>
          {settings.quotePosition === 'after-curiosa' && settings.curiosaPlacement === 'below-image' && renderQuote()}
        </div>

        <div style={{ marginBottom: `${settings.spacingQuoteToButtons || 48}px` }}>
          {settings.quotePosition === 'before-cta' && renderQuote()}
        </div>

        <div className="flex flex-wrap" style={{ gap: `${settings.spacingBetweenButtons || 16}px` }}>
          {settings.cta1Text && (
            <div
              className="flex"
              style={{
                justifyContent:
                  settings.cta1Alignment === 'left' ? 'flex-start' :
                  settings.cta1Alignment === 'right' ? 'flex-end' :
                  'center',
                flex: settings.cta2Text ? '1' : 'auto'
              }}
            >
              <a
                href={
                  settings.cta1LinkType === 'chef' ? (chef ? `/chef/${chef.id}` : '#') :
                  settings.cta1LinkType === 'internal' ? (settings.cta1Link || '#') :
                  settings.cta1LinkType === 'external' ? (settings.cta1Link || '#') :
                  (chef ? `/chef/${chef.id}` : '#')
                }
                target={settings.cta1LinkType === 'external' ? '_blank' : undefined}
                rel={settings.cta1LinkType === 'external' ? 'noopener noreferrer' : undefined}
                className={`rounded-xl font-medium transition-all hover:shadow-lg ${
                  settings.cta1Size === 'small' ? 'px-4 py-2 text-sm' :
                  settings.cta1Size === 'large' ? 'px-8 py-4 text-lg' :
                  'px-6 py-3 text-base'
                } ${settings.cta1Font === 'lobster' ? 'font-lobster' : ''} ${
                  settings.cta1Bold ? 'font-bold' : ''
                }`}
                style={{
                  backgroundColor: settings.cta1Color || '#56c5c5',
                  color: settings.cta1TextColor || '#ffffff',
                  opacity: (settings.cta1Opacity || 100) / 100,
                  fontFamily: getFontFamily(settings.cta1Font),
                  display: 'inline-block'
                }}
              >
                {settings.cta1Text}
              </a>
            </div>
          )}

          {settings.cta2Text && (
            <div
              className="flex"
              style={{
                justifyContent:
                  settings.cta2Alignment === 'left' ? 'flex-start' :
                  settings.cta2Alignment === 'right' ? 'flex-end' :
                  'center',
                flex: settings.cta1Text ? '1' : 'auto'
              }}
            >
              <a
                href={
                  settings.cta2LinkType === 'chef' ? (chef ? `/chef/${chef.id}` : '#') :
                  settings.cta2LinkType === 'internal' ? (settings.cta2Link || '#') :
                  settings.cta2LinkType === 'external' ? (settings.cta2Link || '#') :
                  (chef ? `/chef/${chef.id}` : '#')
                }
                target={settings.cta2LinkType === 'external' ? '_blank' : undefined}
                rel={settings.cta2LinkType === 'external' ? 'noopener noreferrer' : undefined}
                className={`rounded-xl font-medium transition-all hover:shadow-lg ${
                  settings.cta2Size === 'small' ? 'px-4 py-2 text-sm' :
                  settings.cta2Size === 'large' ? 'px-8 py-4 text-lg' :
                  'px-6 py-3 text-base'
                } ${settings.cta2Font === 'lobster' ? 'font-lobster' : ''} ${
                  settings.cta2Bold ? 'font-bold' : ''
                }`}
                style={{
                  backgroundColor: settings.cta2Color || '#a1c798',
                  color: settings.cta2TextColor || '#ffffff',
                  opacity: (settings.cta2Opacity || 100) / 100,
                  fontFamily: getFontFamily(settings.cta2Font),
                  display: 'inline-block'
                }}
              >
                {settings.cta2Text}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

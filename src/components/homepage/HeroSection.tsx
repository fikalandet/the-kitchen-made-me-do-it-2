import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface HeroCardData {
  id: string;
  heading: string;
  text: string;
  imageUrl: string;
  imageAlt: string;
  cardBackgroundColor?: string;
  headingStyle?: {
    fontFamily?: string;
    fontSize?: string;
    bold?: boolean;
    textColor?: string;
    backgroundColor?: string;
    backgroundOpacity?: number;
    lineHeight?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
  textStyle?: {
    fontFamily?: string;
    fontSize?: string;
    bold?: boolean;
    textColor?: string;
    backgroundColor?: string;
    backgroundOpacity?: number;
    lineHeight?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
  horizontalPosition?: 'left' | 'center' | 'right';
  verticalPosition?: 'top' | 'center' | 'bottom';
  headingTextSpacing?: number;
  ctaLabel?: string;
  ctaLinkType?: 'internal' | 'external';
  ctaUrl?: string;
  ctaStyle?: {
    fontFamily?: string;
    fontSize?: string;
    textColor?: string;
    backgroundColor?: string;
    backgroundOpacity?: number;
    hoverBackgroundColor?: string;
    borderRadius?: string;
  };
}

interface HeroSettings {
  totalCards?: number;
  cardsPerRow?: number;
  sectionHeading?: string;
  sectionHeadingSize?: string;
  sectionSubheading?: string;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  paddingTop?: string;
  paddingBottom?: string;
  cards?: HeroCardData[];
}

export const HeroSection = () => {
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  const fetchHeroSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_sections')
        .select('settings, visible')
        .eq('slug', 'hero')
        .eq('visible', true)
        .maybeSingle();

      if (error) throw error;

      if (data && data.settings) {
        setSettings(data.settings as HeroSettings);
      }
    } catch (err) {
      console.error('Error fetching hero settings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!settings || !settings.cards || settings.cards.length === 0) {
    return null;
  }

  const getFontFamily = (font?: string) => {
    const fonts: Record<string, string> = {
      poppins: 'Poppins, sans-serif',
      lobster: 'Lobster, cursive',
      roboto: 'Roboto, sans-serif',
      open_sans: 'Open Sans, sans-serif',
      lato: 'Lato, sans-serif',
      playfair: 'Playfair Display, serif',
      montserrat: 'Montserrat, sans-serif',
      handwritten: 'cursive',
      default: 'system-ui, sans-serif'
    };
    return fonts[font || 'default'] || fonts.default;
  };

  const hexToRgba = (hex: string, opacity: number = 100) => {
    if (hex === 'transparent') return 'transparent';

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    const alpha = opacity / 100;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getGridColumns = () => {
    const cols = settings.cardsPerRow || 3;
    if (cols === 1) return 'grid-cols-1';
    if (cols === 2) return 'grid-cols-1 md:grid-cols-2';
    if (cols === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  };

  const getTextPositionStyle = (horizontalPos?: string, verticalPos?: string) => {
    const horizontal = horizontalPos === 'center' ? 'center' : horizontalPos === 'right' ? 'flex-end' : 'flex-start';
    const vertical = verticalPos === 'top' ? 'flex-start' : verticalPos === 'bottom' ? 'flex-end' : 'center';

    return { justifyContent: horizontal, alignItems: vertical };
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: settings.backgroundColor || '#a1c798',
    backgroundImage: settings.backgroundImageUrl ? `url(${settings.backgroundImageUrl})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    paddingTop: settings.paddingTop || '40px',
    paddingBottom: settings.paddingBottom || '40px'
  };

  return (
    <section className="px-4" style={sectionStyle}>
      <div className="max-w-6xl mx-auto">
        {settings.sectionHeading && (
          <div className="text-center mb-4">
            <h2
              className="font-lobster text-black font-bold mb-2"
              style={{
                fontSize:
                  settings.sectionHeadingSize === 'sm' ? '1.5rem' :
                  settings.sectionHeadingSize === 'md' ? '2rem' :
                  settings.sectionHeadingSize === 'xl' ? '3rem' :
                  settings.sectionHeadingSize === '2xl' ? '4rem' :
                  '2.5rem'
              }}
            >
              {settings.sectionHeading}
            </h2>
            {settings.sectionSubheading && (
              <p className="text-gray-700">
                {settings.sectionSubheading}
              </p>
            )}
          </div>
        )}

        <div className={`grid ${getGridColumns()} gap-4`}>
          {settings.cards.map((card) => {
            const headingStyle = card.headingStyle || {};
            const textStyle = card.textStyle || {};
            const ctaStyle = card.ctaStyle || {};
            const positionStyle = getTextPositionStyle(card.horizontalPosition, card.verticalPosition);

            return (
              <div
                key={card.id}
                className="rounded-2xl overflow-hidden transition-all hover:shadow-2xl hover:scale-105 text-center relative"
                style={{
                  backgroundColor: card.cardBackgroundColor || '#ffffff',
                  backgroundImage: card.imageUrl ? `url(${card.imageUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: '200px'
                }}
              >
                <div
                  className="p-6 h-full flex flex-col"
                  style={positionStyle as React.CSSProperties}
                >
                  {card.heading && (
                    <div
                      style={{
                        backgroundColor: headingStyle.backgroundColor && headingStyle.backgroundColor !== 'transparent'
                          ? hexToRgba(headingStyle.backgroundColor, headingStyle.backgroundOpacity || 100)
                          : 'transparent',
                        color: headingStyle.textColor || '#000000',
                        fontWeight: headingStyle.bold ? '700' : '400',
                        fontSize: headingStyle.fontSize === 'sm' ? '0.875rem' :
                                 headingStyle.fontSize === 'lg' ? '1.25rem' :
                                 headingStyle.fontSize === 'xl' ? '1.5rem' : '1rem',
                        fontFamily: getFontFamily(headingStyle.fontFamily),
                        lineHeight: headingStyle.lineHeight || '1.5',
                        textAlign: headingStyle.textAlign || 'left',
                        padding: headingStyle.backgroundColor && headingStyle.backgroundColor !== 'transparent' ? '0.5rem 0.75rem' : '0',
                        display: 'inline-block',
                        width: headingStyle.textAlign === 'center' ? 'auto' : '100%',
                        whiteSpace: headingStyle.textAlign === 'center' ? 'pre-line' : 'normal',
                        marginBottom: `${card.headingTextSpacing || 8}px`
                      }}
                    >
                      {card.heading}
                    </div>
                  )}

                  {card.text && (
                    <div
                      className="mb-2"
                      style={{
                        backgroundColor: textStyle.backgroundColor && textStyle.backgroundColor !== 'transparent'
                          ? hexToRgba(textStyle.backgroundColor, textStyle.backgroundOpacity || 100)
                          : 'transparent',
                        color: textStyle.textColor || '#000000',
                        fontWeight: textStyle.bold ? '700' : '400',
                        fontSize: textStyle.fontSize === 'sm' ? '0.75rem' :
                                 textStyle.fontSize === 'lg' ? '1rem' :
                                 textStyle.fontSize === 'xl' ? '1.25rem' : '0.875rem',
                        fontFamily: getFontFamily(textStyle.fontFamily),
                        lineHeight: textStyle.lineHeight || '1.5',
                        textAlign: textStyle.textAlign || 'left',
                        padding: textStyle.backgroundColor && textStyle.backgroundColor !== 'transparent' ? '0.5rem 0.75rem' : '0',
                        display: 'inline-block',
                        width: textStyle.textAlign === 'center' ? 'auto' : '100%',
                        whiteSpace: textStyle.textAlign === 'center' ? 'pre-line' : 'normal'
                      }}
                    >
                      {card.text}
                    </div>
                  )}

                  {card.ctaLabel && card.ctaUrl && (
                    <div className="mt-auto" style={{ alignSelf: positionStyle.alignItems }}>
                      {card.ctaLinkType === 'internal' ? (
                        <Link
                          to={card.ctaUrl}
                          className="rounded transition-colors inline-block"
                          style={{
                            backgroundColor: hexToRgba(ctaStyle.backgroundColor || '#56c5c5', ctaStyle.backgroundOpacity || 100),
                            color: ctaStyle.textColor || '#ffffff',
                            fontSize: ctaStyle.fontSize === 'sm' ? '0.875rem' :
                                     ctaStyle.fontSize === 'lg' ? '1.125rem' :
                                     ctaStyle.fontSize === 'xl' ? '1.25rem' : '1rem',
                            padding: '0.625rem 1.5rem',
                            fontFamily: getFontFamily(ctaStyle.fontFamily),
                            borderRadius: ctaStyle.borderRadius || '8px',
                            textDecoration: 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (ctaStyle.hoverBackgroundColor) {
                              e.currentTarget.style.backgroundColor = ctaStyle.hoverBackgroundColor;
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = hexToRgba(ctaStyle.backgroundColor || '#56c5c5', ctaStyle.backgroundOpacity || 100);
                          }}
                        >
                          {card.ctaLabel}
                        </Link>
                      ) : (
                        <a
                          href={card.ctaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded transition-colors inline-block"
                          style={{
                            backgroundColor: hexToRgba(ctaStyle.backgroundColor || '#56c5c5', ctaStyle.backgroundOpacity || 100),
                            color: ctaStyle.textColor || '#ffffff',
                            fontSize: ctaStyle.fontSize === 'sm' ? '0.875rem' :
                                     ctaStyle.fontSize === 'lg' ? '1.125rem' :
                                     ctaStyle.fontSize === 'xl' ? '1.25rem' : '1rem',
                            padding: '0.625rem 1.5rem',
                            fontFamily: getFontFamily(ctaStyle.fontFamily),
                            borderRadius: ctaStyle.borderRadius || '8px',
                            textDecoration: 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (ctaStyle.hoverBackgroundColor) {
                              e.currentTarget.style.backgroundColor = ctaStyle.hoverBackgroundColor;
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = hexToRgba(ctaStyle.backgroundColor || '#56c5c5', ctaStyle.backgroundOpacity || 100);
                          }}
                        >
                          {card.ctaLabel}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

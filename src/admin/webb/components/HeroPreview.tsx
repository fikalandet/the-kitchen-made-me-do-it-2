import { Link } from 'react-router-dom';
import { HeroSettings, HeroCardData } from './HeroEditor';

interface HeroPreviewProps {
  settings: HeroSettings;
}

export default function HeroPreview({ settings }: HeroPreviewProps) {
  const cards = settings.cards || [];

  if (cards.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-12 text-center text-gray-500">
        Lägg till hero-kort för att se preview.
      </div>
    );
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

  const getGridColumns = () => {
    const cols = settings.cardsPerRow || 3;
    if (cols === 1) return 'grid-cols-1';
    if (cols === 2) return 'grid-cols-1 md:grid-cols-2';
    if (cols === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  };

  const getTextPositionStyle = (position?: string) => {
    if (position === 'center') return { justifyContent: 'center', alignItems: 'center', textAlign: 'center' as const };
    if (position === 'right') return { justifyContent: 'flex-end', alignItems: 'flex-end', textAlign: 'right' as const };
    return { justifyContent: 'flex-start', alignItems: 'flex-start', textAlign: 'left' as const };
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
    <div className="rounded-lg overflow-hidden shadow-md">
      <div className="px-4" style={sectionStyle}>
        <div className="max-w-6xl mx-auto">
          {settings.sectionHeading && (
            <div className="text-center mb-4">
              <h2 className="font-lobster text-3xl md:text-4xl text-black font-bold mb-2">
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
            {cards.map((card: HeroCardData) => {
              const textStyle = card.textStyle || {};
              const ctaStyle = card.ctaStyle || {};
              const positionStyle = getTextPositionStyle(textStyle.position);

              return (
                <div
                  key={card.id}
                  className="rounded-2xl overflow-hidden transition-all hover:shadow-2xl hover:scale-105 text-center relative"
                  style={{
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
                        className="mb-2"
                        style={{
                          backgroundColor: textStyle.backgroundColor && textStyle.backgroundColor !== 'transparent'
                            ? textStyle.backgroundColor
                            : 'transparent',
                          color: textStyle.textColor || '#000000',
                          fontWeight: textStyle.bold ? '700' : '400',
                          fontSize: textStyle.fontSize === 'sm' ? '0.875rem' :
                                   textStyle.fontSize === 'lg' ? '1.25rem' :
                                   textStyle.fontSize === 'xl' ? '1.5rem' : '1rem',
                          fontFamily: getFontFamily(textStyle.fontFamily),
                          lineHeight: textStyle.lineHeight || '1.5',
                          textAlign: textStyle.textAlign || 'left',
                          padding: textStyle.backgroundColor && textStyle.backgroundColor !== 'transparent' ? '0.5rem 0.75rem' : '0',
                          display: 'inline-block',
                          whiteSpace: textStyle.textAlign === 'center' ? 'pre-line' : 'normal'
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
                            ? textStyle.backgroundColor
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
                          whiteSpace: textStyle.textAlign === 'center' ? 'pre-line' : 'normal'
                        }}
                      >
                        {card.text}
                      </div>
                    )}

                    {card.ctaLabel && card.ctaUrl && (
                      <div className="mt-auto" style={{ alignSelf: positionStyle.alignItems }}>
                        <div
                          className="rounded transition-colors inline-block cursor-pointer"
                          style={{
                            backgroundColor: ctaStyle.backgroundColor || '#56c5c5',
                            color: ctaStyle.textColor || '#ffffff',
                            fontSize: ctaStyle.fontSize === 'sm' ? '0.875rem' :
                                     ctaStyle.fontSize === 'lg' ? '1.125rem' :
                                     ctaStyle.fontSize === 'xl' ? '1.25rem' : '1rem',
                            padding: '0.625rem 1.5rem',
                            fontFamily: getFontFamily(ctaStyle.fontFamily),
                            borderRadius: ctaStyle.borderRadius || '8px',
                            textDecoration: 'none'
                          }}
                        >
                          {card.ctaLabel}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

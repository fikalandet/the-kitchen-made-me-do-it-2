import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Heart, Star, Crown, Moon, TrendingUp, Users, Lightbulb, Coffee, Zap, Sparkles, Sun, Cloud, Smile, Frown, Meh, ThumbsUp } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  'home': Home,
  'heart': Heart,
  'star': Star,
  'crown': Crown,
  'moon': Moon,
  'trending-up': TrendingUp,
  'users': Users,
  'lightbulb': Lightbulb,
  'coffee': Coffee,
  'zap': Zap,
  'sparkles': Sparkles,
  'sun': Sun,
  'cloud': Cloud,
  'smile': Smile,
  'frown': Frown,
  'meh': Meh,
  'thumbs-up': ThumbsUp
};

interface BecomeChefBenefit {
  id: string;
  icon_key: string;
  text: string;
}

interface BecomeChefSectionProps {
  settings: {
    backgroundColor?: string;
    heading?: string;
    headingFont?: string;
    headingBold?: boolean;
    headingAlignment?: 'left' | 'center';
    headingColor?: string;
    subtitleTexts?: string[];
    subtitleRotationInterval?: number;
    subtitlePlacement?: 'inline' | 'below';
    subtitleColor?: string;
    contentBox?: {
      bgColor?: string;
      width?: number;
      opacity?: number;
      borderRadius?: number;
    };
    innerTitle?: string;
    innerTitleFont?: string;
    innerTitleBold?: boolean;
    innerTitleSize?: number;
    innerTitleColor?: string;
    innerTitleAlignment?: 'left' | 'center' | 'right';
    description?: string;
    descriptionFont?: string;
    descriptionBold?: boolean;
    descriptionSize?: number;
    descriptionColor?: string;
    descriptionAlignment?: 'left' | 'center' | 'right';
    titleDescriptionGap?: number;
    image?: {
      url?: string;
      position?: 'none' | 'left' | 'right';
      hasBorder?: boolean;
      borderColor?: string;
      borderWidth?: number;
      borderRadius?: 'small' | 'large';
    };
    cta?: {
      label?: string;
      linkType?: 'internal' | 'external';
      internalRoute?: string;
      externalUrl?: string;
      bgColor?: string;
      textColor?: string;
      font?: string;
      bold?: boolean;
      italic?: boolean;
      uppercase?: boolean;
      size?: number;
      centered?: boolean;
    };
    benefits?: BecomeChefBenefit[];
    benefitsPerRow?: number;
  };
}

export function BecomeChefSection({ settings }: BecomeChefSectionProps) {
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const subtitleTexts = settings.subtitleTexts || ['Dela din passion för matlagning och tjäna pengar på det du älskar'];
  const rotationInterval = settings.subtitleRotationInterval || 10000;
  const contentBox = settings.contentBox || {};
  const image = settings.image || {};
  const cta = settings.cta || {};
  const benefits = settings.benefits || [];
  const benefitsPerRow = settings.benefitsPerRow || 3;

  useEffect(() => {
    if (subtitleTexts.length <= 1) return;

    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentSubtitleIndex((prev) => (prev + 1) % subtitleTexts.length);
        setFadeIn(true);
      }, 300);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [subtitleTexts.length, rotationInterval]);

  const headingFontClass = settings.headingFont === 'lobster' ? 'font-lobster' : '';
  const headingFontFamily =
    settings.headingFont === 'serif' ? 'serif' :
    settings.headingFont === 'sans' ? 'sans-serif' :
    undefined;

  const innerTitleFontClass = settings.innerTitleFont === 'lobster' ? 'font-lobster' : settings.innerTitleFont === 'poppins' ? 'font-poppins' : '';
  const innerTitleFontFamily =
    settings.innerTitleFont === 'serif' ? 'serif' :
    settings.innerTitleFont === 'sans' ? 'sans-serif' :
    settings.innerTitleFont === 'poppins' ? 'Poppins' :
    undefined;

  const descFontFamily =
    settings.descriptionFont === 'serif' ? 'serif' :
    settings.descriptionFont === 'lobster' ? 'Lobster' :
    settings.descriptionFont === 'poppins' ? 'Poppins' :
    'sans-serif';

  const ctaFontFamily =
    cta.font === 'serif' ? 'serif' :
    cta.font === 'lobster' ? 'Lobster' :
    cta.font === 'poppins' ? 'Poppins' :
    'sans-serif';

  const innerTitleAlignment =
    settings.innerTitleAlignment === 'center' ? 'text-center' :
    settings.innerTitleAlignment === 'right' ? 'text-right' :
    'text-left';

  const descAlignment =
    settings.descriptionAlignment === 'center' ? 'text-center' :
    settings.descriptionAlignment === 'right' ? 'text-right' :
    'text-left';

  const gridColsClass =
    benefitsPerRow === 2 ? 'grid-cols-1 md:grid-cols-2' :
    benefitsPerRow === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  const getLinkHref = () => {
    if (cta.linkType === 'external') return cta.externalUrl || '#';
    return cta.internalRoute || '#';
  };

  const isExternalLink = cta.linkType === 'external';

  return (
    <section className="py-16 px-4" style={{ backgroundColor: settings.backgroundColor || '#a1c798' }}>
      <div className={`mb-8 px-4 ${settings.headingAlignment === 'center' ? 'text-center' : 'text-left'}`}>
        {settings.subtitlePlacement === 'inline' || !settings.subtitlePlacement ? (
          <div className={`flex items-center gap-3 ${settings.headingAlignment === 'center' ? 'justify-center' : ''}`}>
            <h2
              className={`text-3xl md:text-4xl ${headingFontClass} ${
                settings.headingBold ? 'font-bold' : ''
              }`}
              style={{
                fontFamily: headingFontFamily,
                color: settings.headingColor || '#374151'
              }}
            >
              {settings.heading || 'Bli en Kitchen-kock'}
            </h2>
            {subtitleTexts.length > 0 && subtitleTexts[0] && (
              <>
                <span className="text-gray-400 text-2xl hidden md:inline">|</span>
                <div className="min-h-[24px] flex items-center">
                  <p
                    className="transition-opacity duration-300 text-sm md:text-base"
                    style={{
                      opacity: fadeIn ? 1 : 0,
                      color: settings.subtitleColor || '#6b7280'
                    }}
                  >
                    {subtitleTexts[currentSubtitleIndex] || subtitleTexts[0]}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div>
            <h2
              className={`text-3xl md:text-4xl ${headingFontClass} ${
                settings.headingBold ? 'font-bold' : ''
              }`}
              style={{
                fontFamily: headingFontFamily,
                color: settings.headingColor || '#374151'
              }}
            >
              {settings.heading || 'Bli en Kitchen-kock'}
            </h2>
            {subtitleTexts.length > 0 && subtitleTexts[0] && (
              <div className="min-h-[24px] flex items-center mt-2">
                <p
                  className="transition-opacity duration-300 text-sm md:text-base"
                  style={{
                    opacity: fadeIn ? 1 : 0,
                    color: settings.subtitleColor || '#6b7280'
                  }}
                >
                  {subtitleTexts[currentSubtitleIndex] || subtitleTexts[0]}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mx-auto" style={{ maxWidth: `${contentBox.width || 100}%` }}>
        <div
          className="p-8 md:p-12 shadow-lg"
          style={{
            backgroundColor: contentBox.bgColor || '#f6f2e0',
            opacity: (contentBox.opacity || 100) / 100,
            borderRadius: `${contentBox.borderRadius || 16}px`
          }}
        >
          {settings.innerTitle && (
            <h3
              className={`${innerTitleFontClass} ${
                settings.innerTitleBold ? 'font-bold' : ''
              } ${innerTitleAlignment}`}
              style={{
                fontSize: `${settings.innerTitleSize || 32}px`,
                fontFamily: innerTitleFontFamily,
                color: settings.innerTitleColor || '#374151',
                marginBottom: `${settings.titleDescriptionGap || 24}px`
              }}
            >
              {settings.innerTitle}
            </h3>
          )}

          <div className={image.position !== 'none' && image.url ? 'grid md:grid-cols-2 gap-8 items-center' : ''}>
            {image.position === 'left' && image.url && (
              <div>
                <img
                  src={image.url}
                  alt={settings.heading || 'Bli en Kitchen-kock'}
                  className="w-full"
                  style={{
                    border: image.hasBorder ? `${image.borderWidth || 4}px solid ${image.borderColor || '#56c5c5'}` : 'none',
                    borderRadius: image.hasBorder ? (image.borderRadius === 'large' ? '24px' : '12px') : '0'
                  }}
                />
              </div>
            )}

            <div className={image.position === 'none' || !image.url ? (cta.centered ? 'text-center' : descAlignment) : ''}>
              {settings.description && (
                <p
                  className={`mb-8 ${descAlignment}`}
                  style={{
                    fontSize: `${settings.descriptionSize || 18}px`,
                    fontFamily: descFontFamily,
                    fontWeight: settings.descriptionBold ? 'bold' : 'normal',
                    color: settings.descriptionColor || '#374151'
                  }}
                >
                  {settings.description}
                </p>
              )}

              <div className={cta.centered ? 'text-center' : ''}>
                {cta.label && (getLinkHref() !== '#') && (
                  isExternalLink ? (
                    <a
                      href={getLinkHref()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-3 rounded-full transition-all hover:shadow-lg hover:opacity-90 inline-block"
                      style={{
                        backgroundColor: cta.bgColor || '#56c5c5',
                        color: cta.textColor || '#ffffff',
                        fontSize: `${cta.size || 16}px`,
                        fontFamily: ctaFontFamily,
                        fontWeight: cta.bold ? 'bold' : 'normal',
                        fontStyle: cta.italic ? 'italic' : 'normal',
                        textTransform: cta.uppercase ? 'uppercase' : 'none'
                      }}
                    >
                      {cta.label}
                    </a>
                  ) : (
                    <Link
                      to={getLinkHref()}
                      className="px-8 py-3 rounded-full transition-all hover:shadow-lg hover:opacity-90 inline-block"
                      style={{
                        backgroundColor: cta.bgColor || '#56c5c5',
                        color: cta.textColor || '#ffffff',
                        fontSize: `${cta.size || 16}px`,
                        fontFamily: ctaFontFamily,
                        fontWeight: cta.bold ? 'bold' : 'normal',
                        fontStyle: cta.italic ? 'italic' : 'normal',
                        textTransform: cta.uppercase ? 'uppercase' : 'none'
                      }}
                    >
                      {cta.label}
                    </Link>
                  )
                )}
              </div>
            </div>

            {image.position === 'right' && image.url && (
              <div>
                <img
                  src={image.url}
                  alt={settings.heading || 'Bli en Kitchen-kock'}
                  className="w-full"
                  style={{
                    border: image.hasBorder ? `${image.borderWidth || 4}px solid ${image.borderColor || '#56c5c5'}` : 'none',
                    borderRadius: image.hasBorder ? (image.borderRadius === 'large' ? '24px' : '12px') : '0'
                  }}
                />
              </div>
            )}
          </div>

          {benefits.length > 0 && (
            <div className={`grid ${gridColsClass} gap-6 mt-12`}>
              {benefits.map((benefit) => {
                const IconComponent = ICON_MAP[benefit.icon_key];
                return (
                  <div key={benefit.id} className="text-center">
                    {IconComponent ? (
                      <IconComponent className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                    ) : (
                      <div className="w-12 h-12 mx-auto mb-3" />
                    )}
                    <p className="text-sm text-gray-700">{benefit.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

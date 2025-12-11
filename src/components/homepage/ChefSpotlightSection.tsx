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
  smallImagePosition?: 'left' | 'right';
  imageShape?: 'rounded' | 'wavy-top' | 'wavy-bottom' | 'diagonal' | 'wavy-diagonal';
  curiosaItems?: Array<{ question: string; answer: string }>;
  curiosaFont?: string;
  curiosaBold?: boolean;
  curiosaItalic?: boolean;
  curiosaBgColor?: string;
  curiosaBorderColor?: string;
  curiosaBorderWidth?: number;
  curiosaOpacity?: number;
  curiosaShape?: 'rounded' | 'wavy' | 'diagonal';
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

  return (
    <section
      className="py-16 px-4"
      style={{ backgroundColor: settings.backgroundColor || '#ffffff' }}
    >
      <div className="max-w-6xl mx-auto">
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
                  fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
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
                  fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
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

        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
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
                    className={`absolute ${
                      settings.smallImagePosition === 'right' ? 'right-4' : 'left-4'
                    } top-4 w-32 h-32 object-cover rounded-xl shadow-lg`}
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
          </div>

          <div>
            {settings.articleTitle && (
              <h3
                className={`mb-4 ${
                  settings.articleFont === 'lobster' ? 'font-lobster' : ''
                } ${settings.articleBold ? 'font-bold' : ''} ${settings.articleItalic ? 'italic' : ''}`}
                style={{
                  fontFamily: settings.articleFont === 'serif' ? 'serif' : settings.articleFont === 'sans' ? 'sans-serif' : undefined,
                  fontSize: `${(settings.articleFontSize || 16) * 1.5}px`,
                  textAlign: settings.articleAlignment || 'left'
                }}
              >
                {settings.articleTitle}
              </h3>
            )}
            {settings.articleIngress && (
              <p
                className={`mb-4 ${
                  settings.articleFont === 'lobster' ? 'font-lobster' : ''
                } ${settings.articleBold ? 'font-bold' : ''} ${settings.articleItalic ? 'italic' : ''}`}
                style={{
                  fontFamily: settings.articleFont === 'serif' ? 'serif' : settings.articleFont === 'sans' ? 'sans-serif' : undefined,
                  fontSize: `${(settings.articleFontSize || 16) * 1.1}px`,
                  textAlign: settings.articleAlignment || 'left'
                }}
              >
                {settings.articleIngress}
              </p>
            )}
            {settings.articleBody && (
              <p
                className={`text-gray-600 ${
                  settings.articleFont === 'lobster' ? 'font-lobster' : ''
                } ${settings.articleBold ? 'font-bold' : ''} ${settings.articleItalic ? 'italic' : ''}`}
                style={{
                  fontFamily: settings.articleFont === 'serif' ? 'serif' : settings.articleFont === 'sans' ? 'sans-serif' : undefined,
                  fontSize: `${settings.articleFontSize || 16}px`,
                  textAlign: settings.articleAlignment || 'left'
                }}
              >
                {settings.articleBody}
              </p>
            )}
          </div>
        </div>

        {curiosaItems.length > 0 && curiosaItems.some(item => item.question) && (
          <div
            className="p-6 rounded-xl mb-12"
            style={{
              backgroundColor: settings.curiosaBgColor || '#f6f2e0',
              borderColor: settings.curiosaBorderColor || '#a1c798',
              borderWidth: `${settings.curiosaBorderWidth || 2}px`,
              borderStyle: 'solid',
              opacity: (settings.curiosaOpacity || 100) / 100
            }}
          >
            <h4 className="text-xl font-bold text-gray-800 mb-4">Kuriosa</h4>
            <div className="space-y-3">
              {curiosaItems.map((item, index) => (
                item.question && (
                  <div key={index}>
                    <p
                      className={`font-semibold text-gray-700 ${
                        settings.curiosaBold ? 'font-bold' : ''
                      } ${settings.curiosaItalic ? 'italic' : ''}`}
                      style={{
                        fontFamily: settings.curiosaFont === 'lobster' ? 'Lobster' : settings.curiosaFont === 'serif' ? 'serif' : 'sans-serif'
                      }}
                    >
                      {item.question}:
                    </p>
                    <p className="text-gray-600">{item.answer || ''}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {settings.quoteText && (
          <blockquote
            className={`mb-12 py-6 ${
              settings.quoteFont === 'lobster' ? 'font-lobster' : ''
            } ${settings.quoteBold ? 'font-bold' : ''} ${settings.quoteItalic !== false ? 'italic' : ''}`}
            style={{
              fontFamily: settings.quoteFont === 'serif' ? 'serif' : settings.quoteFont === 'sans' ? 'sans-serif' : undefined,
              fontSize: `${settings.quoteFontSize || 24}px`,
              color: settings.quoteColor || '#4b5563',
              textAlign: settings.quoteAlignment || 'center'
            }}
          >
            "{settings.quoteText}"
          </blockquote>
        )}

        {settings.ctaText && chef && (
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
              href={`/chef/${chef.id}`}
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
                fontFamily: settings.ctaFont === 'serif' ? 'serif' : settings.ctaFont === 'sans' ? 'sans-serif' : undefined,
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

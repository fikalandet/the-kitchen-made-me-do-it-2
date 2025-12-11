import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface TestimonialsSettings {
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
  introHeading?: string;
  introHeadingFont?: string;
  introHeadingSize?: number;
  introHeadingBold?: boolean;
  introHeadingItalic?: boolean;
  introHeadingAlign?: 'left' | 'center' | 'right';
  introText?: string;
  introTextFont?: string;
  introTextSize?: number;
  introTextBold?: boolean;
  introTextItalic?: boolean;
  introTextAlign?: 'left' | 'center' | 'right';
  testimonialsPerRow?: number;
  testimonialStarSize?: number;
  testimonialStarColor?: string;
  testimonialQuoteFont?: string;
  testimonials?: Array<{
    id?: string;
    name: string;
    location?: string;
    rating: number;
    comment: string;
    image_url?: string;
  }>;
  [key: string]: any;
}

interface TestimonialsSectionProps {
  settings: TestimonialsSettings;
}

export function TestimonialsSection({ settings }: TestimonialsSectionProps) {
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

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

  const subtitleTexts = settings.subtitleTexts || [];
  const testimonials = settings.testimonials || [];

  if (testimonials.length === 0) {
    return null;
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div
      className="w-full"
      style={{
        backgroundColor: (() => {
          const hex = settings.backgroundColor || '#ffffff';
          const opacity = (settings.backgroundOpacity || 100) / 100;
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        })(),
        paddingTop: `${settings.sectionPaddingTop || 48}px`,
        paddingBottom: `${settings.sectionPaddingBottom || 48}px`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`mb-8 ${
            settings.headingAlignment === 'center' || !settings.headingAlignment
              ? 'text-center'
              : 'text-left'
          }`}
        >
          <h2
            className={`${settings.headingBold ? 'font-bold' : 'font-semibold'} ${
              settings.headingItalic ? 'italic' : ''
            } ${settings.headingFont === 'lobster' ? 'font-lobster' : ''}`}
            style={{
              fontSize: `${settings.headingFontSize || 36}px`,
              color: settings.headingColor || '#1f2937',
              fontFamily: settings.headingFont === 'poppins' ? 'Poppins' :
                          settings.headingFont === 'lobster' ? 'Lobster' :
                          settings.headingFont === 'serif' ? 'serif' :
                          'sans-serif'
            }}
          >
            {settings.headingEmojiPrefix && <span className="mr-2">{settings.headingEmojiPrefix}</span>}
            {settings.heading || 'Vad våra kunder säger'}
            {settings.headingEmojiSuffix && <span className="ml-2">{settings.headingEmojiSuffix}</span>}
          </h2>

          {subtitleTexts.length > 0 && subtitleTexts[0] && (
            <p
              className={`${
                settings.subtitlePlacement === 'inline' ? 'inline-block ml-2' : 'block mt-2'
              } ${settings.subtitleBold ? 'font-bold' : ''} ${
                settings.subtitleItalic ? 'italic' : ''
              } ${settings.subtitleFont === 'lobster' ? 'font-lobster' : ''} transition-opacity duration-300`}
              style={{
                fontSize: `${settings.subtitleFontSize || 18}px`,
                color: settings.subtitleColor || '#6b7280',
                opacity: fadeIn ? 1 : 0,
                fontFamily: settings.subtitleFont === 'poppins' ? 'Poppins' :
                            settings.subtitleFont === 'lobster' ? 'Lobster' :
                            settings.subtitleFont === 'serif' ? 'serif' :
                            'sans-serif'
              }}
            >
              {subtitleTexts[currentSubtitleIndex]}
            </p>
          )}
        </div>

        {(settings.introHeading || settings.introText) && (
          <div className="mb-12 max-w-3xl mx-auto">
            {settings.introHeading && (
              <h3
                className={`mb-4 ${settings.introHeadingBold ? 'font-bold' : 'font-semibold'} ${
                  settings.introHeadingItalic ? 'italic' : ''
                }`}
                style={{
                  fontSize: `${settings.introHeadingSize || 24}px`,
                  textAlign: settings.introHeadingAlign || 'center',
                  fontFamily: settings.introHeadingFont === 'poppins' ? 'Poppins' :
                              settings.introHeadingFont === 'lobster' ? 'Lobster' :
                              settings.introHeadingFont === 'serif' ? 'serif' :
                              'sans-serif'
                }}
              >
                {settings.introHeading}
              </h3>
            )}
            {settings.introText && (
              <p
                className={`text-gray-600 ${settings.introTextBold ? 'font-bold' : ''} ${
                  settings.introTextItalic ? 'italic' : ''
                }`}
                style={{
                  fontSize: `${settings.introTextSize || 16}px`,
                  textAlign: settings.introTextAlign || 'center',
                  fontFamily: settings.introTextFont === 'poppins' ? 'Poppins' :
                              settings.introTextFont === 'lobster' ? 'Lobster' :
                              settings.introTextFont === 'serif' ? 'serif' :
                              'sans-serif'
                }}
              >
                {settings.introText}
              </p>
            )}
          </div>
        )}

        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${
              settings.testimonialsPerRow === 1 ? '100%' :
              settings.testimonialsPerRow === 2 ? '400px' :
              settings.testimonialsPerRow === 4 ? '250px' :
              '300px'
            }, 1fr))`
          }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id || index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                {testimonial.image_url ? (
                  <img
                    src={testimonial.image_url}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                    {getInitials(testimonial.name)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  {testimonial.location && (
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="fill-current"
                    style={{
                      width: `${settings.testimonialStarSize || 20}px`,
                      height: `${settings.testimonialStarSize || 20}px`,
                      color: i < testimonial.rating ? settings.testimonialStarColor || '#fbbf24' : '#e5e7eb'
                    }}
                  />
                ))}
              </div>

              <p
                className="text-gray-700 leading-relaxed"
                style={{
                  fontFamily: settings.testimonialQuoteFont === 'poppins' ? 'Poppins' :
                              settings.testimonialQuoteFont === 'lobster' ? 'Lobster' :
                              settings.testimonialQuoteFont === 'serif' ? 'serif' :
                              'sans-serif'
                }}
              >
                {testimonial.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

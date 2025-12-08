import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SlideData {
  id: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  alt: string;
  text?: string;
  textStyle?: {
    fontFamily?: string;
    fontSize?: string;
    bold?: boolean;
    textColor?: string;
    backgroundColor?: string;
    verticalAlign?: 'top' | 'center' | 'bottom';
    horizontalAlign?: 'left' | 'center' | 'right';
    textAlign?: 'left' | 'center' | 'right';
  };
  ctaLabel?: string;
  ctaUrl?: string;
  ctaStyle?: {
    fontFamily?: string;
    fontSize?: string;
    textColor?: string;
    backgroundColor?: string;
    size?: string;
    position?: string;
  };
}

interface BildspelSettings {
  autoplay?: boolean;
  autoplaySpeedMs?: number;
  navigationType?: 'arrows' | 'dots' | 'arrows_and_dots' | 'none';
  slidesPerView?: number;
  height?: number;
  slides?: SlideData[];
}

const defaultImages = [
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1410236/pexels-photo-1410236.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

export const ImageCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [settings, setSettings] = useState<BildspelSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const slides = settings?.slides || [];
  const hasSlides = slides.length > 0;
  const autoplay = settings?.autoplay !== false;
  const autoplaySpeed = settings?.autoplaySpeedMs || 5000;
  const height = settings?.height || 400;
  const navigationType = settings?.navigationType || 'arrows_and_dots';
  const slidesPerView = settings?.slidesPerView || 1;

  useEffect(() => {
    fetchBildspelSettings();
  }, []);

  useEffect(() => {
    if (!autoplay || !hasSlides) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, slides.length - slidesPerView);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, autoplaySpeed);

    return () => clearInterval(timer);
  }, [autoplay, autoplaySpeed, hasSlides, slides.length, slidesPerView]);

  const fetchBildspelSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_sections')
        .select('settings')
        .eq('slug', 'bildspel')
        .maybeSingle();

      if (data?.settings) {
        setSettings(data.settings as BildspelSettings);
      }
    } catch (err) {
      console.error('Error fetching bildspel settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      const totalSlides = hasSlides ? slides.length : defaultImages.length;
      const maxIndex = Math.max(0, totalSlides - slidesPerView);
      return prev > 0 ? prev - 1 : maxIndex;
    });
  };

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const totalSlides = hasSlides ? slides.length : defaultImages.length;
      const maxIndex = Math.max(0, totalSlides - slidesPerView);
      return prev >= maxIndex ? 0 : prev + 1;
    });
  };

  const hexToRgba = (hex?: string, opacity: number = 100) => {
    if (!hex || hex === 'transparent') return 'transparent';

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

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

  const getTextPosition = (v?: string, h?: string, customPos?: { x: number; y: number }) => {
    if (customPos) {
      return { left: `${customPos.x}%`, top: `${customPos.y}%`, transform: 'translate(-50%, -50%)' };
    }
    const vertical = v === 'top' ? 'top-4' : v === 'center' ? 'top-1/2 -translate-y-1/2' : 'bottom-4';
    const horizontal = h === 'center' ? 'left-1/2 -translate-x-1/2' : h === 'right' ? 'right-4' : 'left-4';
    return `${vertical} ${horizontal}`;
  };

  const getCtaPosition = (position?: string, customPos?: { x: number; y: number }) => {
    if (customPos) {
      return { left: `${customPos.x}%`, top: `${customPos.y}%`, transform: 'translate(-50%, -50%)' };
    }
    switch (position) {
      case 'top-left': return 'top-4 left-4';
      case 'top-center': return 'top-4 left-1/2 -translate-x-1/2';
      case 'top-right': return 'top-4 right-4';
      case 'center-left': return 'top-1/2 left-4 -translate-y-1/2';
      case 'center-center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'center-right': return 'top-1/2 right-4 -translate-y-1/2';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-center': return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'bottom-right': return 'bottom-4 right-4';
      default: return 'bottom-4 right-4';
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-gray-100 flex items-center justify-center" style={{ height: `${height}px` }}>
        <p className="text-gray-500">Laddar bildspel...</p>
      </div>
    );
  }

  const slideWidthPercent = 100 / slidesPerView;
  const displaySlides = hasSlides ? slides : defaultImages.map((url, idx) => ({
    id: `default-${idx}`,
    mediaType: 'image' as const,
    mediaUrl: url,
    alt: `Slide ${idx + 1}`
  }));

  const showArrows = navigationType === 'arrows' || navigationType === 'arrows_and_dots';
  const showDots = navigationType === 'dots' || navigationType === 'arrows_and_dots';

  return (
    <div className="relative w-full overflow-hidden group" style={{ height: `${height}px` }}>
      <div
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * slideWidthPercent}%)` }}
      >
        {displaySlides.map((slide, index) => (
          <div
            key={slide.id}
            className="h-full flex-shrink-0 relative"
            style={{ width: `${slideWidthPercent}%` }}
          >
            {slide.mediaType === 'video' && slide.mediaUrl ? (
              <video
                src={slide.mediaUrl}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={slide.mediaUrl}
                alt={slide.alt || `Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
            )}

            {slide.text && (
              <div
                className={slide.textStyle?.customPosition ? 'absolute' : `absolute ${getTextPosition(slide.textStyle?.verticalAlign, slide.textStyle?.horizontalAlign)}`}
                style={
                  slide.textStyle?.customPosition
                    ? {
                        maxWidth: '80%',
                        left: `${slide.textStyle.customPosition.x}%`,
                        top: `${slide.textStyle.customPosition.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }
                    : { maxWidth: '80%' }
                }
              >
                <div
                  className="rounded"
                  style={{
                    backgroundColor: slide.textStyle?.backgroundColor && slide.textStyle.backgroundColor !== 'transparent'
                      ? hexToRgba(slide.textStyle.backgroundColor, slide.textStyle.backgroundOpacity ?? 100)
                      : 'transparent',
                    color: slide.textStyle?.textColor || '#000000',
                    fontWeight: slide.textStyle?.bold ? '700' : '400',
                    fontSize: slide.textStyle?.fontSize === 'sm' ? '0.75rem' :
                             slide.textStyle?.fontSize === 'lg' ? '1.125rem' :
                             slide.textStyle?.fontSize === 'xl' ? '1.5rem' : '1rem',
                    fontFamily: getFontFamily(slide.textStyle?.fontFamily),
                    textAlign: slide.textStyle?.textAlign as any || 'left',
                    padding: slide.textStyle?.backgroundColor && slide.textStyle.backgroundColor !== 'transparent' ? '0.5rem 0.75rem' : '0',
                    display: 'inline-block',
                    whiteSpace: slide.text.includes('\n') ? 'pre-line' : 'nowrap'
                  }}
                >
                  {slide.text}
                </div>
              </div>
            )}

            {slide.ctaLabel && (
              <div
                className={slide.ctaStyle?.customPosition ? 'absolute' : `absolute ${getCtaPosition(slide.ctaStyle?.position)}`}
                style={
                  slide.ctaStyle?.customPosition
                    ? {
                        left: `${slide.ctaStyle.customPosition.x}%`,
                        top: `${slide.ctaStyle.customPosition.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }
                    : undefined
                }
              >
                <a
                  href={slide.ctaUrl || '#'}
                  className="rounded-lg transition-colors inline-block"
                  style={{
                    backgroundColor: slide.ctaStyle?.backgroundColor || '#56c5c5',
                    color: slide.ctaStyle?.textColor || '#ffffff',
                    fontWeight: slide.ctaStyle?.bold ? '700' : '500',
                    fontSize: slide.ctaStyle?.fontSize === 'sm' ? '0.875rem' :
                             slide.ctaStyle?.fontSize === 'lg' ? '1.125rem' :
                             slide.ctaStyle?.fontSize === 'xl' ? '1.25rem' : '1rem',
                    padding: slide.ctaStyle?.size === 'sm' ? '0.5rem 1rem' :
                            slide.ctaStyle?.size === 'lg' ? '0.75rem 2rem' :
                            slide.ctaStyle?.size === 'xl' ? '1rem 2.5rem' : '0.625rem 1.5rem',
                    fontFamily: getFontFamily(slide.ctaStyle?.fontFamily)
                  }}
                >
                  {slide.ctaLabel}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {showArrows && displaySlides.length > slidesPerView && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} className="text-gray-800" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight size={24} className="text-gray-800" />
          </button>
        </>
      )}

      {showDots && displaySlides.length > slidesPerView && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {Array.from({ length: Math.max(0, displaySlides.length - slidesPerView + 1) }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white bg-opacity-50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

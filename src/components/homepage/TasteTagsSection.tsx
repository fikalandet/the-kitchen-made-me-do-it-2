import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Zap } from 'lucide-react';

interface TasteTagsSettings {
  heading?: string;
  headingFont?: string;
  headingFontSize?: number;
  headingColor?: string;
  headingBold?: boolean;
  headingAlignment?: 'left' | 'center';
  subtitleTexts?: string[];
  subtitleRotationInterval?: number;
  subtitlePlacement?: 'inline' | 'below';
  subtitleFont?: string;
  subtitleFontSize?: number;
  subtitleColor?: string;
  subtitleBold?: boolean;
  subtitleItalic?: boolean;
  backgroundColor?: string;
  flowVisibleCount?: number;
  imageShape?: 'round' | 'rounded-square';
  imageBorderEnabled?: boolean;
  imageBorderColor?: string;
  imageBorderWidth?: number;
  labelBackgroundColor?: string;
  labelOpacity?: number;
  labelBorderRadius?: string;
  labelPlacement?: 'horizontal' | 'diagonal-left' | 'diagonal-right';
  labelWidth?: string;
  labelHeight?: string;
  labelAngle?: number;
  labelTextFont?: string;
  labelTextColor?: string;
  labelTextBold?: boolean;
  labelTextItalic?: boolean;
  labelTextSize?: number;
  buttonBackgroundColor?: string;
  buttonOpacity?: number;
  buttonText?: string;
  buttonTextFont?: string;
  buttonTextColor?: string;
  buttonTextBold?: boolean;
  buttonTextItalic?: boolean;
  buttonTextSize?: number;
}

interface TasteTagsSectionProps {
  settings: TasteTagsSettings;
}

interface TasteLabelDish {
  id: string;
  product_id: string;
  taste_label_text: string;
  is_boosted: boolean;
  products?: {
    id: string;
    name: string;
    image_url?: string;
    price?: number;
  };
}

export function TasteTagsSection({ settings }: TasteTagsSectionProps) {
  const [dishes, setDishes] = useState<TasteLabelDish[]>([]);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    fetchDishes();
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

  const fetchDishes = async () => {
    try {
      const { data, error } = await supabase
        .from('taste_label_dishes')
        .select(`
          *,
          products (
            id,
            name,
            image_url,
            price
          )
        `)
        .eq('is_removed_by_admin', false)
        .order('is_boosted', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(settings.flowVisibleCount || 12);

      if (error) throw error;
      setDishes(data || []);
    } catch (err) {
      console.error('Error fetching taste label dishes:', err);
    }
  };

  const hexToRgba = (hex: string, opacity: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return hex;
  };

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

  if (dishes.length === 0) {
    return null;
  }

  const borderRadiusMap = {
    light: '8px',
    medium: '16px',
    pill: '9999px'
  };
  const labelBorderRadius = borderRadiusMap[settings.labelBorderRadius as keyof typeof borderRadiusMap] || '16px';

  const imageRadius = settings.imageShape === 'rounded-square' ? '12px' : '50%';

  const labelRotation = settings.labelAngle ?? 0;

  return (
    <section
      className="py-12 px-4"
      style={{
        backgroundColor: settings.backgroundColor || '#ffffff'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={`mb-8 ${
            settings.headingAlignment === 'center' || !settings.headingAlignment
              ? 'text-center'
              : 'text-left'
          }`}
        >
          {settings.subtitlePlacement === 'inline' || !settings.subtitlePlacement ? (
            <div className={`flex items-center gap-3 ${settings.headingAlignment === 'center' || !settings.headingAlignment ? 'justify-center' : ''}`}>
              <h2
                className={`text-3xl ${headingFontClass} ${settings.headingBold ? 'font-bold' : ''}`}
                style={{
                  fontFamily: headingFontFamily,
                  fontSize: `${settings.headingFontSize || 32}px`,
                  color: settings.headingColor || '#374151'
                }}
              >
                {settings.heading || 'Smaketiketter'}
              </h2>
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
              <h2
                className={`text-3xl ${headingFontClass} ${settings.headingBold ? 'font-bold' : ''}`}
                style={{
                  fontFamily: headingFontFamily,
                  fontSize: `${settings.headingFontSize || 32}px`,
                  color: settings.headingColor || '#374151'
                }}
              >
                {settings.heading || 'Smaketiketter'}
              </h2>
              {subtitleTexts.length > 0 && subtitleTexts[currentSubtitleIndex] && (
                <div className="min-h-[24px] flex items-center mt-2">
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

        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {dishes.map((dish) => (
              <div
                key={dish.id}
                className="flex-shrink-0 text-center group cursor-pointer transition-all duration-150 ease-in-out hover:-translate-y-1 hover:shadow-lg"
                style={{ width: '160px' }}
                onClick={() => {
                  if (dish.products?.id) {
                    console.log('Navigate to product:', dish.products.id);
                  }
                }}
              >
                <div className="relative w-40 h-40 mx-auto mb-3 bg-gray-100">
                  <div
                    className="w-full h-full overflow-hidden"
                    style={{
                      borderRadius: imageRadius,
                      border: settings.imageBorderEnabled
                        ? `${settings.imageBorderWidth || 2}px solid ${settings.imageBorderColor || '#a1c798'}`
                        : 'none'
                    }}
                  >
                    {dish.products?.image_url ? (
                      <img
                        src={dish.products.image_url}
                        alt={dish.products.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                  </div>

                  <div
                    className="absolute flex items-center justify-center overflow-hidden"
                    style={{
                      top: '50%',
                      left: '50%',
                      width: settings.labelWidth || '80%',
                      height: settings.labelHeight || '32px',
                      transform: `translate(-50%, -50%) rotate(${labelRotation}deg)`,
                      backgroundColor: hexToRgba(settings.labelBackgroundColor || '#a1c798', (settings.labelOpacity || 80) / 100),
                      borderRadius: labelBorderRadius
                    }}
                  >
                    <p
                      className={`text-xs px-2 truncate ${
                        settings.labelTextFont === 'lobster' ? 'font-lobster' : ''
                      } ${settings.labelTextBold ? 'font-bold' : ''} ${
                        settings.labelTextItalic ? 'italic' : ''
                      }`}
                      style={{
                        fontFamily:
                          settings.labelTextFont === 'serif'
                            ? 'serif'
                            : settings.labelTextFont === 'sans'
                            ? 'sans-serif'
                            : undefined,
                        fontSize: `${settings.labelTextSize || 14}px`,
                        color: settings.labelTextColor || '#ffffff'
                      }}
                    >
                      {dish.taste_label_text}
                    </p>
                  </div>

                  {dish.is_boosted && (
                    <div className="absolute top-2 right-2 bg-yellow-400 rounded-full p-1.5 shadow-md">
                      <Zap className="w-4 h-4 text-white fill-current" />
                    </div>
                  )}
                </div>
                <button
                  className="text-sm px-4 py-2 rounded-full transition-colors shadow-sm mx-auto block"
                  style={{
                    backgroundColor: hexToRgba(settings.buttonBackgroundColor || '#a1c798', (settings.buttonOpacity || 100) / 100),
                    color: settings.buttonTextColor || '#ffffff',
                    fontFamily:
                      settings.buttonTextFont === 'serif'
                        ? 'serif'
                        : settings.buttonTextFont === 'sans'
                        ? 'sans-serif'
                        : undefined,
                    fontSize: `${settings.buttonTextSize || 14}px`,
                    fontWeight: settings.buttonTextBold ? 'bold' : 'normal',
                    fontStyle: settings.buttonTextItalic ? 'italic' : 'normal'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dish.products?.id) {
                      console.log('Order/View product:', dish.products.id);
                    }
                  }}
                >
                  {settings.buttonText || 'Se mer'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

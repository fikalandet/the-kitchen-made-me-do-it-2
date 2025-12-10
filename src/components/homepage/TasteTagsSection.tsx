import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { EmptyState } from './EmptyState';
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
        .limit(12);

      if (error) throw error;
      setDishes(data || []);
    } catch (err) {
      console.error('Error fetching taste label dishes:', err);
    }
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
                className="flex-shrink-0 text-center group cursor-pointer"
                style={{ width: '160px' }}
                onClick={() => {
                  if (dish.products?.id) {
                    console.log('Navigate to product:', dish.products.id);
                  }
                }}
              >
                <div className="relative w-40 h-40 mx-auto mb-3 rounded-full overflow-hidden bg-gray-100 shadow-md group-hover:shadow-xl transition-shadow">
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
                  {dish.is_boosted && (
                    <div className="absolute top-2 right-2 bg-yellow-400 rounded-full p-1.5 shadow-md">
                      <Zap className="w-4 h-4 text-white fill-current" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 italic mb-2 px-2 line-clamp-2 min-h-[40px]">
                  "{dish.taste_label_text}"
                </p>
                <button
                  className="text-sm px-4 py-2 bg-[#a1c798] text-white rounded-full hover:bg-[#8fb386] transition-colors shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dish.products?.id) {
                      console.log('Order/View product:', dish.products.id);
                    }
                  }}
                >
                  Se mer
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

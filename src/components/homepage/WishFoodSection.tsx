import { useState, useEffect } from 'react';
import { Heart, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { EmptyState } from './EmptyState';

interface WishFoodSettings {
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
  mainImagePosition?: 'left' | 'right';
  mainImageType?: 'image' | 'color';
  mainImageUrl?: string;
  mainImageBackgroundColor?: string;
  mainImageTitle?: string;
  mainImageTitleFont?: string;
  mainImageTitleSize?: number;
  mainImageTitleColor?: string;
  mainImageTitleBold?: boolean;
  mainImageTitleItalic?: boolean;
  mainImageText?: string;
  mainImageTextFont?: string;
  mainImageTextSize?: number;
  mainImageTextColor?: string;
  mainImageTextBold?: boolean;
  mainImageTextItalic?: boolean;
  mainImageTextPosition?: 'top' | 'center' | 'bottom';
  mainImageTextAlign?: 'left' | 'center' | 'right';
  mainImageTextBackgroundEnabled?: boolean;
  mainImageTextBackgroundColor?: string;
  mainImageTextBackgroundOpacity?: number;
  mainImageButtonText?: string;
  mainImageButtonBackgroundColor?: string;
  mainImageButtonTextColor?: string;
  inputFieldWidth?: 'short' | 'medium' | 'long';
  customerCardsLayout?: 'grid' | 'list';
  customerCardsMaxCount?: number;
  backgroundColor?: string;
}

interface WishFoodSectionProps {
  settings: WishFoodSettings;
}

interface FoodWish {
  id: string;
  dish_name: string;
  description: string;
  likes_count: number;
  customer_id: string;
  created_at: string;
}

export function WishFoodSection({ settings }: WishFoodSectionProps) {
  const { user } = useAuth();
  const [wishes, setWishes] = useState<FoodWish[]>([]);
  const [newWish, setNewWish] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchWishes();
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

  const fetchWishes = async () => {
    try {
      const { data, error } = await supabase
        .from('food_wishes')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(settings.customerCardsMaxCount || 10);

      if (error) throw error;
      setWishes(data || []);
    } catch (err) {
      console.error('Error fetching wishes:', err);
    }
  };

  const handleSubmitWish = async () => {
    if (!user || !newWish.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('food_wishes')
        .insert({
          customer_id: user.id,
          dish_name: newWish.trim(),
          status: 'pending'
        });

      if (error) throw error;

      setNewWish('');
      fetchWishes();
    } catch (err) {
      console.error('Error submitting wish:', err);
      alert('Kunde inte skicka önskning. Försök igen.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (wishId: string) => {
    if (!user) {
      alert('Du måste vara inloggad för att gilla');
      return;
    }

    try {
      const { error } = await supabase
        .from('food_wish_likes')
        .insert({
          wish_id: wishId,
          chef_id: user.id
        });

      if (error) {
        if (error.code === '23505') {
          await supabase
            .from('food_wish_likes')
            .delete()
            .eq('wish_id', wishId)
            .eq('chef_id', user.id);
        } else {
          throw error;
        }
      }

      fetchWishes();
    } catch (err) {
      console.error('Error toggling like:', err);
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

  const pageSize = 9;
  const totalPages = Math.ceil(wishes.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentWishes = wishes.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
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
                {settings.heading || 'Önska käk'}
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
                {settings.heading || 'Önska käk'}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div
            className={`relative rounded-lg overflow-hidden min-h-[500px] ${
              settings.mainImagePosition === 'right' ? 'order-2' : ''
            }`}
            style={{
              backgroundImage:
                settings.mainImageType === 'image' || !settings.mainImageType
                  ? settings.mainImageUrl
                    ? `url(${settings.mainImageUrl})`
                    : 'linear-gradient(135deg, #a1c798 0%, #8fb386 100%)'
                  : 'none',
              backgroundColor:
                settings.mainImageType === 'color'
                  ? settings.mainImageBackgroundColor || '#a1c798'
                  : 'transparent',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div
              className={`relative w-full h-full flex ${
                settings.mainImageTextPosition === 'top' || !settings.mainImageTextPosition
                  ? 'items-start'
                  : settings.mainImageTextPosition === 'bottom'
                  ? 'items-end'
                  : 'items-center'
              } ${
                settings.mainImageTextAlign === 'left'
                  ? 'justify-start'
                  : settings.mainImageTextAlign === 'right'
                  ? 'justify-end'
                  : 'justify-center'
              } p-8`}
            >
              {settings.mainImageTextBackgroundEnabled && (
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    backgroundColor: hexToRgba(
                      settings.mainImageTextBackgroundColor || '#ffffff',
                      (settings.mainImageTextBackgroundOpacity || 80) / 100
                    )
                  }}
                />
              )}
              <div className={`relative w-full max-w-md ${settings.mainImageTextAlign === 'center' || !settings.mainImageTextAlign ? 'text-center' : settings.mainImageTextAlign === 'right' ? 'text-right' : 'text-left'}`}>
                <div className={`space-y-4 ${settings.mainImageTextAlign === 'center' || !settings.mainImageTextAlign ? 'flex flex-col items-center' : ''}`}>
                  {settings.mainImageTitle && (
                    <h3
                      className={`${
                        settings.mainImageTitleFont === 'lobster' ? 'font-lobster' : ''
                      } ${settings.mainImageTitleBold ? 'font-bold' : ''} ${
                        settings.mainImageTitleItalic ? 'italic' : ''
                      }`}
                      style={{
                        fontFamily:
                          settings.mainImageTitleFont === 'serif'
                            ? 'serif'
                            : settings.mainImageTitleFont === 'sans'
                            ? 'sans-serif'
                            : undefined,
                        fontSize: `${settings.mainImageTitleSize || 24}px`,
                        color: settings.mainImageTitleColor || '#ffffff'
                      }}
                    >
                      {settings.mainImageTitle}
                    </h3>
                  )}
                  {settings.mainImageText && (
                    <p
                      className={`${
                        settings.mainImageTextFont === 'lobster' ? 'font-lobster' : ''
                      } ${settings.mainImageTextBold ? 'font-bold' : ''} ${
                        settings.mainImageTextItalic ? 'italic' : ''
                      }`}
                      style={{
                        fontFamily:
                          settings.mainImageTextFont === 'serif'
                            ? 'serif'
                            : settings.mainImageTextFont === 'sans'
                            ? 'sans-serif'
                            : undefined,
                        fontSize: `${settings.mainImageTextSize || 16}px`,
                        color: settings.mainImageTextColor || '#ffffff'
                      }}
                    >
                      {settings.mainImageText}
                    </p>
                  )}
                  <input
                    type="text"
                    value={newWish}
                    onChange={(e) => setNewWish(e.target.value)}
                    placeholder="Skriv in ditt önskemål"
                    className={`px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent text-lg ${
                      settings.inputFieldWidth === 'short'
                        ? 'w-1/2'
                        : settings.inputFieldWidth === 'long'
                        ? 'w-full'
                        : 'w-3/4'
                    }`}
                  />
                  <button
                    onClick={handleSubmitWish}
                    disabled={loading || !newWish.trim()}
                    className="px-6 py-3 rounded-lg font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: settings.mainImageButtonBackgroundColor || '#a1c798',
                      color: settings.mainImageButtonTextColor || '#ffffff'
                    }}
                  >
                    {loading ? 'Skickar...' : settings.mainImageButtonText || 'Skicka önskning'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`flex flex-col ${
              settings.mainImagePosition === 'right' ? 'order-1' : ''
            }`}
          >
            {wishes.length > 0 ? (
              <div className="relative">
                <div
                  className={`${
                    settings.customerCardsLayout === 'list'
                      ? 'space-y-3'
                      : 'grid grid-cols-3 gap-3'
                  } min-h-[500px]`}
                >
                  {currentWishes.map((wish) => (
                    <div
                      key={wish.id}
                      className="bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-shadow flex flex-col justify-between"
                      style={{ aspectRatio: '2 / 1' }}
                    >
                      <div>
                        <p className="text-xs font-medium text-gray-900 mb-1 line-clamp-2">{wish.dish_name}</p>
                        {wish.description && (
                          <p className="text-xs text-gray-600 mb-1 line-clamp-2">{wish.description}</p>
                        )}
                        <p className="text-xs text-gray-500">Önskat av användare</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => handleLike(wish.id)}
                            className="flex items-center gap-1 text-gray-600 hover:text-[#a1c798] transition-colors text-xs"
                          >
                            <Heart className="w-3 h-3" />
                            <span>{wish.likes_count}</span>
                          </button>
                          <button className="flex items-center gap-1 text-gray-600 hover:text-[#a1c798] transition-colors text-xs">
                            <MessageCircle className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full">
                            Snart...
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 0}
                      className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <span className="text-sm text-gray-600">
                      {currentPage + 1} / {totalPages}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages - 1}
                      className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[500px]">
                <EmptyState text="Inga önskningar ännu. Var först med att önska en rätt!" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

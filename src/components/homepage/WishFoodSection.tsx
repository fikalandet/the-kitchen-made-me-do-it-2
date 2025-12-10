import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { EmptyState } from './EmptyState';

interface WishFoodSettings {
  heading?: string;
  headingFont?: string;
  headingFontSize?: number;
  headingColor?: string;
  headingBold?: boolean;
  headingItalic?: boolean;
  subtitle?: string;
  subtitleFont?: string;
  subtitleFontSize?: number;
  subtitleColor?: string;
  subtitleBold?: boolean;
  subtitleItalic?: boolean;
  subtitleTexts?: string[];
  subtitleRotationInterval?: number;
  textPosition?: 'top' | 'center' | 'bottom';
  textAlign?: 'left' | 'center' | 'right';
  backgroundType?: 'color' | 'image' | 'image-overlay';
  backgroundColor?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textBackgroundColor?: string;
  textBackgroundOpacity?: number;
  textBackgroundEnabled?: boolean;
  leftColumnImage?: string;
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
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

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
        .order('created_at', { ascending: false });

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
          description: newDescription.trim() || null,
          status: 'pending'
        });

      if (error) throw error;

      setNewWish('');
      setNewDescription('');
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
  const rotationInterval = settings.subtitleRotationInterval || 10000;

  return (
    <section
      className="relative py-12 px-4"
      style={{
        backgroundColor: settings.backgroundColor || '#ffffff',
        backgroundImage: (settings.backgroundType === 'image' || settings.backgroundType === 'image-overlay') && settings.backgroundImage ? `url(${settings.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {settings.backgroundType === 'image-overlay' && settings.backgroundImage && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: settings.overlayColor || '#000000',
            opacity: (settings.overlayOpacity || 30) / 100
          }}
        />
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8 text-center">
          <h2
            className={`${settings.headingFont === 'lobster' ? 'font-lobster' : ''} ${settings.headingBold ? 'font-bold' : ''} ${settings.headingItalic ? 'italic' : ''}`}
            style={{
              fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
              fontSize: `${settings.headingFontSize || 32}px`,
              color: settings.headingColor || '#374151'
            }}
          >
            {settings.heading || 'Önska käk'}
          </h2>
          {subtitleTexts.length > 0 && subtitleTexts[0] && (
            <div className="min-h-[24px] flex items-center justify-center mt-2">
              <p
                className={`transition-opacity duration-300 ${settings.subtitleFont === 'lobster' ? 'font-lobster' : ''} ${settings.subtitleBold ? 'font-bold' : ''} ${settings.subtitleItalic ? 'italic' : ''}`}
                style={{
                  opacity: fadeIn ? 1 : 0,
                  fontFamily: settings.subtitleFont === 'serif' ? 'serif' : settings.subtitleFont === 'sans' ? 'sans-serif' : undefined,
                  fontSize: `${settings.subtitleFontSize || 16}px`,
                  color: settings.subtitleColor || '#6b7280'
                }}
              >
                {subtitleTexts[currentSubtitleIndex]}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div
            className="relative rounded-lg overflow-hidden min-h-[500px] flex"
            style={{
              backgroundImage: settings.leftColumnImage ? `url(${settings.leftColumnImage})` : 'linear-gradient(135deg, #a1c798 0%, #8fb386 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div
              className={`w-full flex ${
                settings.textPosition === 'top' ? 'items-start' :
                settings.textPosition === 'bottom' ? 'items-end' :
                'items-center'
              } ${
                settings.textAlign === 'left' ? 'justify-start' :
                settings.textAlign === 'right' ? 'justify-end' :
                'justify-center'
              } p-8`}
            >
              <div
                className={`w-full max-w-md ${settings.textBackgroundEnabled ? 'p-6 rounded-lg' : ''}`}
                style={{
                  backgroundColor: settings.textBackgroundEnabled ? settings.textBackgroundColor || '#ffffff' : 'transparent',
                  opacity: settings.textBackgroundEnabled ? (settings.textBackgroundOpacity || 80) / 100 : 1
                }}
              >
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newWish}
                    onChange={(e) => setNewWish(e.target.value)}
                    placeholder="Skriv in ditt önskemål"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent text-lg"
                  />
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Eventuell kommentar (valfritt)"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                  />
                  <button
                    onClick={handleSubmitWish}
                    disabled={loading || !newWish.trim()}
                    className="w-full px-6 py-3 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb386] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? 'Skickar...' : 'Skicka önskning'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            {wishes.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {wishes.map((wish) => (
                  <div key={wish.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{wish.dish_name}</h3>
                    {wish.description && (
                      <p className="text-gray-600 mb-4">{wish.description}</p>
                    )}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleLike(wish.id)}
                        className="flex items-center gap-2 text-gray-600 hover:text-[#a1c798] transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                        <span>{wish.likes_count}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-[#a1c798] transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span>Kommentera</span>
                      </button>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">Kockarnas kommentarer:</p>
                      <div className="flex flex-wrap gap-2">
                        <div className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                          Kommer snart...
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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

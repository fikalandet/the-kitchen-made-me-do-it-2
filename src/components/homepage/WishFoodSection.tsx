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

  useEffect(() => {
    fetchWishes();
  }, []);

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
        <div
          className={`mb-8 flex ${
            settings.textPosition === 'top' ? 'items-start' :
            settings.textPosition === 'bottom' ? 'items-end' :
            'items-center'
          } ${
            settings.textAlign === 'left' ? 'justify-start' :
            settings.textAlign === 'right' ? 'justify-end' :
            'justify-center'
          }`}
        >
          <div
            className={`${settings.textBackgroundEnabled ? 'p-6 rounded-lg' : ''}`}
            style={{
              backgroundColor: settings.textBackgroundEnabled ? settings.textBackgroundColor || '#ffffff' : 'transparent',
              opacity: settings.textBackgroundEnabled ? (settings.textBackgroundOpacity || 80) / 100 : 1
            }}
          >
            <h2
              className={`${settings.headingFont === 'lobster' ? 'font-lobster' : ''} ${settings.headingBold ? 'font-bold' : ''} ${settings.headingItalic ? 'italic' : ''}`}
              style={{
                fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
                fontSize: `${settings.headingFontSize || 32}px`,
                color: settings.headingColor || '#374151',
                textAlign: settings.textAlign || 'center'
              }}
            >
              {settings.heading || 'Önska käk'}
            </h2>
            {settings.subtitle && (
              <p
                className={`mt-2 ${settings.subtitleFont === 'lobster' ? 'font-lobster' : ''} ${settings.subtitleBold ? 'font-bold' : ''} ${settings.subtitleItalic ? 'italic' : ''}`}
                style={{
                  fontFamily: settings.subtitleFont === 'serif' ? 'serif' : settings.subtitleFont === 'sans' ? 'sans-serif' : undefined,
                  fontSize: `${settings.subtitleFontSize || 16}px`,
                  color: settings.subtitleColor || '#6b7280',
                  textAlign: settings.textAlign || 'center'
                }}
              >
                {settings.subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={newWish}
              onChange={(e) => setNewWish(e.target.value)}
              placeholder="Skriv in ditt önskemål"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent text-lg"
            />
            <button
              onClick={handleSubmitWish}
              disabled={loading || !newWish.trim()}
              className="px-6 py-3 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb386] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap"
            >
              {loading ? 'Skickar...' : 'Skicka önskning'}
            </button>
          </div>
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Eventuell kommentar (valfritt)"
            rows={2}
            className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
          />
        </div>

        {wishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Inga önskningar ännu. Var först med att önska en rätt!" />
        )}
      </div>
    </section>
  );
}

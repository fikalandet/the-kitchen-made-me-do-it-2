import { useState, useEffect } from 'react';
import { LiveDishCard } from './LiveDishCard';
import { EmptyState } from './EmptyState';

interface TjuvkikSectionProps {
  settings?: {
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
    cardsPerRow?: number;
  };
  dishes: any[];
}

export function TjuvkikSection({ settings, dishes }: TjuvkikSectionProps) {
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const mockLiveDishes = [
    {
      id: 'live-mock-1',
      name: 'Krämig risotto med svamp',
      chef_name: 'Maria Karlsson',
      chef_avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=200',
      price: 149,
      image_url: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.8,
      cook_date: new Date().toISOString(),
      cook_times: ['18:00', '19:00'],
      portions_left: 3,
      pickup_available: true,
      delivery_available: true,
      delivery_fee: 49
    },
    {
      id: 'live-mock-2',
      name: 'Grillad lax med grönsaker',
      chef_name: 'Erik Andersson',
      chef_avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
      price: 169,
      image_url: 'https://images.pexels.com/photos/842142/pexels-photo-842142.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.9,
      cook_date: new Date().toISOString(),
      cook_times: ['17:30', '18:30'],
      portions_left: 8,
      pickup_available: true,
      delivery_available: true,
      delivery_fee: 49
    },
    {
      id: 'live-mock-3',
      name: 'Klassisk lasagne',
      chef_name: 'Sofia Lindgren',
      chef_avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
      price: 139,
      image_url: 'https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.7,
      cook_date: new Date().toISOString(),
      cook_times: ['18:00'],
      portions_left: 12,
      pickup_available: true,
      delivery_available: false
    },
    {
      id: 'live-mock-4',
      name: 'Thailändsk currygryta',
      chef_name: 'Johan Berg',
      chef_avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=200',
      price: 129,
      image_url: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.6,
      cook_date: new Date().toISOString(),
      cook_times: ['17:00', '18:00', '19:00'],
      portions_left: 15,
      pickup_available: true,
      delivery_available: true,
      delivery_fee: 39
    }
  ];

  const displayDishes = dishes && dishes.length > 0 ? dishes : mockLiveDishes;

  const dishesWithImages = displayDishes.filter(
    dish => dish?.image_url && dish.image_url.trim() !== ''
  );

  const isProduction = import.meta.env.MODE === 'production';
  const showSection = dishesWithImages.length > 0 || !isProduction;

  if (!showSection) {
    return null;
  }

  const subtitleTexts = settings?.subtitleTexts || ['Se vad som lagas live just nu'];
  const rotationInterval = settings?.subtitleRotationInterval || 10000;
  const cardsPerRow = settings?.cardsPerRow || 4;
  const subtitlePlacement = settings?.subtitlePlacement || 'inline';

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

  const headingFontClass = settings?.headingFont === 'lobster' ? 'font-lobster' : '';
  const headingFontFamily =
    settings?.headingFont === 'serif' ? 'serif' :
    settings?.headingFont === 'sans' ? 'sans-serif' :
    undefined;

  const gridColsClass =
    cardsPerRow === 1 ? 'grid-cols-1' :
    cardsPerRow === 2 ? 'grid-cols-1 md:grid-cols-2' :
    cardsPerRow === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
    cardsPerRow === 5 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5' :
    cardsPerRow === 6 ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6' :
    cardsPerRow === 7 ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-7' :
    cardsPerRow === 8 ? 'grid-cols-1 md:grid-cols-4 lg:grid-cols-8' :
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

  return (
    <section className="py-8 px-4" style={{ backgroundColor: settings?.backgroundColor || '#ffffff' }}>
      <div className="max-w-7xl mx-auto">
        <div
          className={`mb-6 ${
            settings?.headingAlignment === 'center' ? 'text-center' : 'text-left'
          }`}
        >
          {subtitlePlacement === 'inline' ? (
            <div className={`flex items-center gap-3 ${settings?.headingAlignment === 'center' ? 'justify-center' : ''}`}>
              <h2
                className={`text-3xl ${headingFontClass} ${
                  settings?.headingBold ? 'font-bold' : ''
                }`}
                style={{
                  fontFamily: headingFontFamily,
                  color: settings?.headingColor || '#374151'
                }}
              >
                {settings?.heading || 'Tjuvkik i köket'}
              </h2>
              {subtitleTexts.length > 0 && subtitleTexts[0] && (
                <>
                  <span className="text-gray-400 text-2xl">|</span>
                  <div className="min-h-[24px] flex items-center">
                    <p
                      className="transition-opacity duration-300"
                      style={{
                        opacity: fadeIn ? 1 : 0,
                        color: settings?.subtitleColor || '#374151'
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
                className={`text-3xl ${headingFontClass} ${
                  settings?.headingBold ? 'font-bold' : ''
                }`}
                style={{
                  fontFamily: headingFontFamily,
                  color: settings?.headingColor || '#374151'
                }}
              >
                {settings?.heading || 'Tjuvkik i köket'}
              </h2>
              {subtitleTexts.length > 0 && subtitleTexts[currentSubtitleIndex] && (
                <div className="min-h-[24px] flex items-center mt-2">
                  <p
                    className="transition-opacity duration-300"
                    style={{
                      opacity: fadeIn ? 1 : 0,
                      color: settings?.subtitleColor || '#374151'
                    }}
                  >
                    {subtitleTexts[currentSubtitleIndex]}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {dishesWithImages.length > 0 ? (
          <div className={`grid ${gridColsClass} gap-6`}>
            {dishesWithImages.map((dish) => (
              <LiveDishCard
                key={dish.id}
                id={dish.id}
                name={dish.name}
                chef_name={dish.chef_name}
                chef_avatar={dish.chef_avatar}
                price={dish.price}
                image_url={dish.image_url}
                rating={dish.rating}
                cook_date={dish.cook_date}
                cook_times={dish.cook_times}
                portions_left={dish.portions_left}
                subscription_seats_left={dish.subscription_seats_left}
                pickup_available={dish.pickup_available}
                delivery_available={dish.delivery_available}
                delivery_fee={dish.delivery_fee}
              />
            ))}
          </div>
        ) : (
          <EmptyState text="Inget här ännu" />
        )}
      </div>
    </section>
  );
}

import { useState, useEffect } from 'react';
import { RushCard } from '../CardKit/variants/RushCard';
import { EmptyState } from './EmptyState';
import { transformChef, createCommonProps } from '../../lib/adapters/cardKitAdapters';

interface BrattomkakSectionProps {
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
    cardsPerRow?: number;
  };
  dishes: any[];
}

export function BrattomkakSection({ settings, dishes }: BrattomkakSectionProps) {
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const mockBrattomDishes = [
    {
      id: 'brattom-mock-1',
      name: 'Express-pasta carbonara',
      price: 129,
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      seller_id: 'mock-chef',
      available: true,
      created_at: new Date().toISOString(),
      pickup_enabled: true,
      delivery_enabled: true,
      is_brattomkak: true,
      brattomkak_delivery_minutes: 30
    },
    {
      id: 'brattom-mock-2',
      name: 'Snabb buddha bowl',
      price: 119,
      image_url: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800',
      seller_id: 'mock-chef',
      available: true,
      created_at: new Date().toISOString(),
      pickup_enabled: true,
      delivery_enabled: true,
      is_brattomkak: true,
      brattomkak_delivery_minutes: 25
    },
    {
      id: 'brattom-mock-3',
      name: 'Snabb wok med kyckling',
      price: 139,
      image_url: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800',
      seller_id: 'mock-chef',
      available: true,
      created_at: new Date().toISOString(),
      pickup_enabled: true,
      delivery_enabled: true,
      is_brattomkak: true,
      brattomkak_delivery_minutes: 35
    },
    {
      id: 'brattom-mock-4',
      name: 'Express-sushi',
      price: 159,
      image_url: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=800',
      seller_id: 'mock-chef',
      available: true,
      created_at: new Date().toISOString(),
      pickup_enabled: true,
      delivery_enabled: true,
      is_brattomkak: true,
      brattomkak_delivery_minutes: 40
    }
  ];

  const displayDishes = dishes && dishes.length > 0 ? dishes : mockBrattomDishes;

  const dishesWithImages = displayDishes.filter(
    dish => dish?.image_url && dish.image_url.trim() !== ''
  );

  const isProduction = import.meta.env.MODE === 'production';
  const showSection = dishesWithImages.length > 0 || !isProduction;

  if (!showSection) {
    return null;
  }

  const subtitleTexts = settings.subtitleTexts || ['Snabb leverans för hungriga magar'];
  const rotationInterval = settings.subtitleRotationInterval || 10000;
  const cardsPerRow = settings.cardsPerRow || 4;
  const subtitlePlacement = settings.subtitlePlacement || 'inline';

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
    <section className="py-8 px-4" style={{ backgroundColor: settings.backgroundColor || '#ffffff' }}>
      <div className="max-w-7xl mx-auto">
        <div
          className={`mb-6 ${
            settings.headingAlignment === 'center' ? 'text-center' : 'text-left'
          }`}
        >
          {subtitlePlacement === 'inline' ? (
            <div className={`flex items-center gap-3 ${settings.headingAlignment === 'center' ? 'justify-center' : ''}`}>
              <h2
                className={`text-3xl ${headingFontClass} ${
                  settings.headingBold ? 'font-bold' : ''
                }`}
                style={{
                  fontFamily: headingFontFamily,
                  color: settings.headingColor || '#374151'
                }}
              >
                {settings.heading || 'Bråttomkäk'}
              </h2>
              {subtitleTexts.length > 0 && subtitleTexts[0] && (
                <>
                  <span className="text-gray-400 text-2xl">|</span>
                  <div className="min-h-[24px] flex items-center">
                    <p
                      className="transition-opacity duration-300"
                      style={{
                        opacity: fadeIn ? 1 : 0,
                        color: settings.subtitleColor || '#374151'
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
                  settings.headingBold ? 'font-bold' : ''
                }`}
                style={{
                  fontFamily: headingFontFamily,
                  color: settings.headingColor || '#374151'
                }}
              >
                {settings.heading || 'Bråttomkäk'}
              </h2>
              {subtitleTexts.length > 0 && subtitleTexts[currentSubtitleIndex] && (
                <div className="min-h-[24px] flex items-center mt-2">
                  <p
                    className="transition-opacity duration-300"
                    style={{
                      opacity: fadeIn ? 1 : 0,
                      color: settings.subtitleColor || '#374151'
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
            {dishesWithImages.map((dish, idx) => {
              const chef = transformChef({ id: dish.seller_id || 'mock-chef', display_name: 'Kock' });
              const commonProps = createCommonProps(dish, chef, {
                onShare: () => console.log('Share:', dish.id),
                onFavToggle: () => console.log('Favorite toggle:', dish.id),
                isFaved: false,
                onInfo: () => console.log('Info:', dish.id),
                onPrimary: () => console.log('Buy:', dish.id),
              });
              return (
                <RushCard
                  key={dish.id || idx}
                  {...commonProps}
                  availability={{
                    frozenCount: 0,
                    preOrder: false,
                    subscribe: false
                  }}
                  shortDate={false}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState text="Inget här ännu" />
        )}
      </div>
    </section>
  );
}

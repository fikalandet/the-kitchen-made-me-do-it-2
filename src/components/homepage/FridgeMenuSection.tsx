import { useState, useEffect } from 'react';
import { EmptyState } from './EmptyState';
import { BundleCard } from '../CardKit/variants/BundleCard';
import { transformChef } from '../../lib/adapters/cardKitAdapters';

interface FridgeMenuSectionProps {
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
    layout?: 'horizontal' | 'grid';
  };
  products: any[];
}

export function FridgeMenuSection({ settings, products }: FridgeMenuSectionProps) {
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const mockFridgeProducts = [
    {
      id: 'fridge-mock-1',
      name: 'Italiensk matlådekasse',
      title: 'Italiensk matlådekasse',
      description: 'Fem färdiga italienska middagar för hela veckan',
      price: 899,
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      seller_id: 'mock-chef',
      type: 'meal_box',
      available: true,
      pickup_enabled: true,
      delivery_enabled: true,
      pickup_hours: '15:00-18:00',
      delivery_hours: '17:00-20:00'
    },
    {
      id: 'fridge-mock-2',
      name: 'Laga-själv sushi-kit',
      title: 'Laga-själv sushi-kit',
      description: 'Allt du behöver för att göra sushi hemma - ingredienser och instruktioner',
      price: 449,
      image_url: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=800',
      seller_id: 'mock-chef',
      type: 'cooking_kit',
      available: true,
      pickup_enabled: true,
      delivery_enabled: true,
      pickup_hours: '10:00-19:00',
      delivery_hours: '12:00-20:00'
    },
    {
      id: 'fridge-mock-3',
      name: 'Vegansk matlådekasse',
      title: 'Vegansk matlådekasse',
      description: 'Hälsosamma och goda veganska rätter, färdiga att äta',
      price: 799,
      image_url: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800',
      seller_id: 'mock-chef',
      type: 'meal_box',
      available: true,
      pickup_enabled: true,
      delivery_enabled: false,
      pickup_hours: '14:00-17:00'
    },
    {
      id: 'fridge-mock-4',
      name: 'Veckolunch-prenumeration',
      title: 'Veckolunch-prenumeration',
      description: 'Få färdiga lunchrätter levererade varje måndag',
      price: 1299,
      image_url: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800',
      seller_id: 'mock-chef',
      type: 'subscription',
      available: true,
      pickup_enabled: false,
      delivery_enabled: true,
      delivery_hours: 'Måndagar 08:00-10:00'
    }
  ];

  const displayProducts = products && products.length > 0 ? products : mockFridgeProducts;

  const subtitleTexts = settings.subtitleTexts || ['Matlådekassar, laga-själv-kit och prenumerationer'];
  const rotationInterval = settings.subtitleRotationInterval || 10000;
  const cardsPerRow = settings.cardsPerRow || 4;
  const subtitlePlacement = settings.subtitlePlacement || 'inline';
  const layout = settings.layout || 'horizontal';

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
                {settings.heading || 'Kylskåpsmeny'}
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
                {settings.heading || 'Kylskåpsmeny'}
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

        {displayProducts.length > 0 ? (
          layout === 'grid' ? (
            <div className={`grid ${gridColsClass} gap-6`}>
              {displayProducts.map((product, idx) => {
                const chef = transformChef({ id: product.seller_id || 'mock-chef', display_name: 'Kock' });
                const productType =
                  product.type === 'subscription' || (product.name || product.title || '').toLowerCase().includes('prenumeration')
                    ? 'Prenumeration'
                    : product.type === 'cooking_kit' || (product.name || product.title || '').toLowerCase().includes('laga-själv')
                    ? 'Laga-själv-kit'
                    : 'Matlådekasse';
                return (
                  <BundleCard
                    key={product.id || idx}
                    id={product.id || `fridge-${idx}`}
                    imageUrl={product.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'}
                    hasGallery={false}
                    title={product.name || product.title || 'Produkt'}
                    description={product.description || ''}
                    price={{ currency: 'SEK', price: product.price || 0 }}
                    chef={chef}
                    productType={productType}
                    logistics={{
                      pickup: {
                        enabled: product.pickup_enabled ?? false,
                        hours: product.pickup_hours,
                      },
                      delivery: {
                        enabled: product.delivery_enabled ?? false,
                        hours: product.delivery_hours,
                      },
                    }}
                    availability={{
                      frozenCount: 0,
                      preOrder: true,
                      subscribe: chef.membership === 'gold',
                    }}
                    gp={60}
                    onShare={() => console.log('Share:', product.id)}
                    onFavToggle={() => console.log('Favorite toggle:', product.id)}
                    isFaved={false}
                    onInfo={() => console.log('Info:', product.id)}
                    onPrimary={() => console.log('Buy:', product.id)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {displayProducts.map((product, idx) => {
                const chef = transformChef({ id: product.seller_id || 'mock-chef', display_name: 'Kock' });
                const productType =
                  product.type === 'subscription' || (product.name || product.title || '').toLowerCase().includes('prenumeration')
                    ? 'Prenumeration'
                    : product.type === 'cooking_kit' || (product.name || product.title || '').toLowerCase().includes('laga-själv')
                    ? 'Laga-själv-kit'
                    : 'Matlådekasse';
                return (
                  <BundleCard
                    key={product.id || idx}
                    id={product.id || `fridge-${idx}`}
                    imageUrl={product.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'}
                    hasGallery={false}
                    title={product.name || product.title || 'Produkt'}
                    description={product.description || ''}
                    price={{ currency: 'SEK', price: product.price || 0 }}
                    chef={chef}
                    productType={productType}
                    logistics={{
                      pickup: {
                        enabled: product.pickup_enabled ?? false,
                        hours: product.pickup_hours,
                      },
                      delivery: {
                        enabled: product.delivery_enabled ?? false,
                        hours: product.delivery_hours,
                      },
                    }}
                    availability={{
                      frozenCount: 0,
                      preOrder: true,
                      subscribe: chef.membership === 'gold',
                    }}
                    gp={60}
                    onShare={() => console.log('Share:', product.id)}
                    onFavToggle={() => console.log('Favorite toggle:', product.id)}
                    isFaved={false}
                    onInfo={() => console.log('Info:', product.id)}
                    onPrimary={() => console.log('Buy:', product.id)}
                  />
                );
              })}
            </div>
          )
        ) : (
          <EmptyState text="Inget här ännu" />
        )}
      </div>
    </section>
  );
}

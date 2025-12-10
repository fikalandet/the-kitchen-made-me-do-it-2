import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { EmptyState } from './EmptyState';
import { TestEatCard } from '../CardKit/variants/TestEatCard';
import { transformChef, createCommonProps } from '../../lib/adapters/cardKitAdapters';

interface TestEatSettings {
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

interface TestEatSectionProps {
  settings: TestEatSettings;
}

interface TestProduct {
  id: string;
  product_id: string;
  chef_id: string;
  test_price: number;
  total_spots: number;
  spots_remaining: number;
  active: boolean;
  products: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    seller_id: string;
  };
}

export function TestEatSection({ settings }: TestEatSectionProps) {
  const [testProducts, setTestProducts] = useState<TestProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestProducts();
  }, []);

  const fetchTestProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('test_eat_products')
        .select(`
          *,
          products (
            id,
            name,
            description,
            image_url,
            seller_id
          )
        `)
        .eq('active', true)
        .gt('spots_remaining', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestProducts(data || []);
    } catch (err) {
      console.error('Error fetching test products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSpot = async (testProductId: string) => {
    alert('Bokning av testkäka kommer snart!');
  };

  const mockTestProducts = [
    {
      id: 'test-mock-1',
      name: 'Ny vegansk lasagne',
      description: 'Hjälp oss att testa vår nya veganska lasagne',
      image_url: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800',
      test_price: 49,
      total_spots: 20,
      spots_remaining: 15,
      seller_id: 'mock-chef'
    },
    {
      id: 'test-mock-2',
      name: 'Hemlagad ramen',
      description: 'Ny ramenrecept att testa',
      image_url: 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=800',
      test_price: 59,
      total_spots: 15,
      spots_remaining: 8,
      seller_id: 'mock-chef'
    },
    {
      id: 'test-mock-3',
      name: 'Fusion tacos',
      description: 'Asiatisk-mexikansk fusion',
      image_url: 'https://images.pexels.com/photos/4958792/pexels-photo-4958792.jpeg?auto=compress&cs=tinysrgb&w=800',
      test_price: 39,
      total_spots: 25,
      spots_remaining: 20,
      seller_id: 'mock-chef'
    }
  ];

  const displayProducts = testProducts.length > 0
    ? testProducts.map(tp => ({
        ...tp.products,
        test_price: tp.test_price,
        total_spots: tp.total_spots,
        spots_remaining: tp.spots_remaining,
        test_product_id: tp.id
      }))
    : mockTestProducts;

  const isProduction = import.meta.env.MODE === 'production';
  const showSection = displayProducts.length > 0 || !isProduction;

  if (!showSection) {
    return null;
  }

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
              {settings.heading || 'Testkäka & Tyck till'}
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

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((product, idx) => {
              const chef = transformChef({ id: product.seller_id, display_name: 'Kock' });
              const commonProps = createCommonProps(product, chef, {
                onShare: () => console.log('Share:', product.id),
                onFavToggle: () => console.log('Favorite toggle:', product.id),
                isFaved: false,
                onInfo: () => console.log('Info:', product.id),
                onPrimary: () => handleBookSpot(product.test_product_id || product.id),
              });
              return (
                <TestEatCard
                  key={product.id}
                  {...commonProps}
                  testPrice={product.test_price}
                  totalSpots={product.total_spots}
                  spotsRemaining={product.spots_remaining}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState text="Inga testkäk-produkter just nu" />
        )}
      </div>
    </section>
  );
}

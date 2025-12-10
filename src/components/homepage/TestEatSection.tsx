import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { EmptyState } from './EmptyState';

interface TestEatSettings {
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
  testCardsLayout?: 'grid-2' | 'grid-3';
  testCardsMaxCount?: number;
  backgroundColor?: string;
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
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    fetchTestProducts();
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
        .order('created_at', { ascending: false })
        .limit(settings.testCardsMaxCount || 6);

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
      product_id: 'mock-1',
      chef_id: 'mock-chef',
      test_price: 49,
      total_spots: 20,
      spots_remaining: 15,
      active: true,
      products: {
        id: 'mock-1',
        name: 'Vegansk lasagne',
        description: 'Test vår nya veganska lasagne',
        image_url: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=400',
        seller_id: 'mock-chef'
      }
    },
    {
      id: 'test-mock-2',
      product_id: 'mock-2',
      chef_id: 'mock-chef',
      test_price: 59,
      total_spots: 15,
      spots_remaining: 8,
      active: true,
      products: {
        id: 'mock-2',
        name: 'Hemlagad ramen',
        description: 'Ny ramenrecept att testa',
        image_url: 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=400',
        seller_id: 'mock-chef'
      }
    },
    {
      id: 'test-mock-3',
      product_id: 'mock-3',
      chef_id: 'mock-chef',
      test_price: 39,
      total_spots: 25,
      spots_remaining: 20,
      active: true,
      products: {
        id: 'mock-3',
        name: 'Fusion tacos',
        description: 'Asiatisk-mexikansk fusion',
        image_url: 'https://images.pexels.com/photos/4958792/pexels-photo-4958792.jpeg?auto=compress&cs=tinysrgb&w=400',
        seller_id: 'mock-chef'
      }
    }
  ];

  const displayProducts = testProducts.length > 0 ? testProducts : mockTestProducts;

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

  const isProduction = import.meta.env.MODE === 'production';
  const showSection = displayProducts.length > 0 || !isProduction;

  if (!showSection) {
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
                {settings.heading || 'Testkäka & Tyck till'}
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
                {settings.heading || 'Testkäka & Tyck till'}
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
                  {settings.mainImageButtonText && (
                    <button
                      className="px-6 py-3 rounded-lg font-medium transition-opacity"
                      style={{
                        backgroundColor: settings.mainImageButtonBackgroundColor || '#a1c798',
                        color: settings.mainImageButtonTextColor || '#ffffff'
                      }}
                    >
                      {settings.mainImageButtonText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`flex flex-col ${
              settings.mainImagePosition === 'right' ? 'order-1' : ''
            }`}
          >
            {displayProducts.length > 0 ? (
              <div
                className={`${
                  settings.testCardsLayout === 'grid-3'
                    ? 'grid grid-cols-2 gap-4'
                    : 'grid grid-cols-1 gap-4'
                } min-h-[500px]`}
              >
                {displayProducts.slice(0, settings.testCardsMaxCount || 6).map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={product.products.image_url}
                      alt={product.products.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="text-base font-semibold text-gray-900 mb-1">{product.products.name}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.products.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base font-bold text-[#a1c798]">{product.test_price} kr</span>
                        <span className="text-sm text-gray-500">
                          {product.spots_remaining}/{product.total_spots} platser
                        </span>
                      </div>
                      <button
                        onClick={() => handleBookSpot(product.id)}
                        className="w-full px-4 py-2 bg-[#a1c798] text-white text-sm rounded-lg hover:bg-[#8fb386] transition-colors"
                      >
                        Tjinga plats
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[500px]">
                <EmptyState text="Inga testkäk-produkter just nu" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect } from 'react';
import { EmptyState } from './EmptyState';

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

        {products.length > 0 ? (
          layout === 'grid' ? (
            <div className={`grid ${gridColsClass} gap-6`}>
              {products.map((product, idx) => (
                <div key={product.id || idx} className="bg-white rounded-lg p-4 shadow">
                  <div className="h-48 bg-gray-200 rounded mb-3 overflow-hidden">
                    {product.image_url && (
                      <img src={product.image_url} alt={product.name || product.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name || product.title}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  )}
                  <p className="text-lg font-bold text-[#56c5c5]">{product.price} kr</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {products.map((product, idx) => (
                <div key={product.id || idx} className="bg-white rounded-lg p-4 shadow flex-shrink-0 w-64">
                  <div className="h-48 bg-gray-200 rounded mb-3 overflow-hidden">
                    {product.image_url && (
                      <img src={product.image_url} alt={product.name || product.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name || product.title}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  )}
                  <p className="text-lg font-bold text-[#56c5c5]">{product.price} kr</p>
                </div>
              ))}
            </div>
          )
        ) : (
          <EmptyState text="Inget här ännu" />
        )}
      </div>
    </section>
  );
}

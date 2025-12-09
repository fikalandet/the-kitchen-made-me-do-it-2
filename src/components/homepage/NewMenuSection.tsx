import { useState, useEffect } from 'react';
import { PopularNewMoodCard } from '../CardKit/variants/PopularNewMoodCard';
import { EmptyState } from './EmptyState';
import { transformChef, createCommonProps } from '../../lib/adapters/cardKitAdapters';

interface NewMenuSectionProps {
  settings: {
    backgroundColor?: string;
    heading?: string;
    headingFont?: string;
    headingBold?: boolean;
    headingAlignment?: 'left' | 'center';
    subtitleTexts?: string[];
    subtitleRotationInterval?: number;
    subtitlePlacement?: 'inline' | 'below';
    cardsPerRow?: number;
  };
  dishes: any[];
}

export function NewMenuSection({ settings, dishes }: NewMenuSectionProps) {
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const subtitleTexts = settings.subtitleTexts || ['Senaste tillskotten'];
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
                className={`text-3xl text-gray-800 ${headingFontClass} ${
                  settings.headingBold ? 'font-bold' : ''
                }`}
                style={{ fontFamily: headingFontFamily }}
              >
                {settings.heading || 'Nytt på menyn'}
              </h2>
              {subtitleTexts.length > 0 && subtitleTexts[0] && (
                <>
                  <span className="text-gray-400 text-2xl">|</span>
                  <div className="min-h-[24px] flex items-center">
                    <p
                      className="text-gray-700 transition-opacity duration-300"
                      style={{ opacity: fadeIn ? 1 : 0 }}
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
                className={`text-3xl text-gray-800 ${headingFontClass} ${
                  settings.headingBold ? 'font-bold' : ''
                }`}
                style={{ fontFamily: headingFontFamily }}
              >
                {settings.heading || 'Nytt på menyn'}
              </h2>
              {subtitleTexts.length > 0 && subtitleTexts[currentSubtitleIndex] && (
                <div className="min-h-[24px] flex items-center mt-2">
                  <p
                    className="text-gray-700 transition-opacity duration-300"
                    style={{ opacity: fadeIn ? 1 : 0 }}
                  >
                    {subtitleTexts[currentSubtitleIndex]}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {dishes.length > 0 ? (
          <div className={`grid ${gridColsClass} gap-6`}>
            {dishes.map((dish, idx) => {
              const chef = transformChef({ id: dish.seller_id, display_name: 'Kock' });
              const commonProps = createCommonProps(dish, chef, {
                onShare: () => console.log('Share:', dish.id),
                onFavToggle: () => console.log('Favorite toggle:', dish.id),
                isFaved: false,
                onInfo: () => console.log('Info:', dish.id),
                onPrimary: () => console.log('Buy:', dish.id),
              });
              return <PopularNewMoodCard key={dish.id || idx} {...commonProps} variant="new" />;
            })}
          </div>
        ) : (
          <EmptyState text="Inget här ännu" />
        )}
      </div>
    </section>
  );
}

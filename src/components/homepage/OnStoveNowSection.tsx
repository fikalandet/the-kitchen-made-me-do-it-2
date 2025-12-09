import { useState, useEffect } from 'react';
import { OnStoveNowCard } from '../CardKit/variants/OnStoveNowCard';
import { EmptyState } from './EmptyState';
import { transformChef, transformToOnStoveNowProps } from '../../lib/adapters/cardKitAdapters';

const getTextColorForBackground = (bgColor: string): string => {
  const colorMap: { [key: string]: string } = {
    '#000000': '#ffffff',
    '#f6f2e0': '#000000',
    '#ffffff': '#000000',
    '#56c5c5': '#ffffff',
    '#a1c798': '#000000',
  };

  return colorMap[bgColor.toLowerCase()] || '#000000';
};

interface OnStoveNowSectionProps {
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
    showWeekAheadText?: boolean;
    dayButtons?: {
      defaultColor?: string;
      hoverColor?: string;
      activeColor?: string;
    };
  };
  liveDishes: any[];
  liveChefs: { [key: string]: any };
}

export function OnStoveNowSection({ settings, liveDishes, liveChefs }: OnStoveNowSectionProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const subtitleTexts = settings.subtitleTexts || ['Just nu i en stekpanna nära dig'];
  const rotationInterval = settings.subtitleRotationInterval || 10000;
  const cardsPerRow = settings.cardsPerRow || 4;
  const showWeekAheadText = settings.showWeekAheadText !== false;
  const subtitlePlacement = settings.subtitlePlacement || 'inline';
  const dayButtons = settings.dayButtons || {
    defaultColor: '#ffffff',
    hoverColor: '#f3f4f6',
    activeColor: '#56c5c5',
  };

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

  const filteredDishes = liveDishes.filter(schedule => schedule.cook_date === selectedDate);

  const dishesWithImages = filteredDishes.filter(
    schedule => schedule.product?.image_url && schedule.product.image_url.trim() !== ''
  );

  const isProduction = import.meta.env.MODE === 'production';
  const showSection = dishesWithImages.length > 0 || !isProduction;

  if (!showSection) {
    return null;
  }

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
                {settings.heading || 'På spisen nu'}
              </h2>
              {subtitleTexts.length > 0 && subtitleTexts[currentSubtitleIndex] && (
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
                      {subtitleTexts[currentSubtitleIndex]}
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
                {settings.heading || 'På spisen nu'}
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

        <div className="mb-4 space-y-3">
          {showWeekAheadText && (
            <p className="text-sm text-gray-600">Visar max en vecka framåt</p>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i);
              const dateStr = date.toISOString().split('T')[0];
              const dayName = date.toLocaleDateString('sv-SE', { weekday: 'short' });
              const isSelected = selectedDate === dateStr;

              const hoverBgColor = dayButtons.hoverColor || '#f3f4f6';
              const hoverTextColor = getTextColorForBackground(hoverBgColor);
              const defaultBgColor = dayButtons.defaultColor || '#ffffff';
              const defaultTextColor = getTextColorForBackground(defaultBgColor);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isSelected ? dayButtons.activeColor : defaultBgColor,
                    color: isSelected ? '#ffffff' : defaultTextColor,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = hoverBgColor;
                      e.currentTarget.style.color = hoverTextColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = defaultBgColor;
                      e.currentTarget.style.color = defaultTextColor;
                    }
                  }}
                >
                  {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {dishesWithImages.length > 0 ? (
          <div className={`grid ${gridColsClass} gap-6`}>
            {dishesWithImages.map((schedule) => {
              const chef = transformChef(liveChefs[schedule.product?.seller_id]);
              const props = transformToOnStoveNowProps(schedule, chef, {
                onShare: () => console.log('Share:', schedule.product?.id),
                onFavToggle: () => console.log('Favorite toggle:', schedule.product?.id),
                isFaved: false,
                onInfo: () => console.log('Info:', schedule.product?.id),
                onPrimary: () => console.log('Buy:', schedule.product?.id),
              });
              return <OnStoveNowCard key={schedule.product?.id} {...props} rating={{ value: 4.7, count: 18 }} />;
            })}
          </div>
        ) : (
          <EmptyState text="Inget här ännu" />
        )}
      </div>
    </section>
  );
}

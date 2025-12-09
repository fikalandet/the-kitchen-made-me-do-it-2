import { useState, useEffect } from 'react';
import { ContestCard } from './ContestCard';
import { EmptyState } from './EmptyState';

interface ContestsSectionProps {
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
    layout?: 'cards-only' | 'image-third' | 'image-half';
    featuredImage?: string;
  };
  contests: any[];
}

export function ContestsSection({ settings, contests }: ContestsSectionProps) {
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const mockContests = [
    {
      id: 'contest-mock-1',
      title: 'Bästa hempizzan',
      description: 'Visa din bästa pizza-kreation',
      deadline_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      image_url: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=800',
      prize: 'Pizzaugn värd 5000 kr'
    },
    {
      id: 'contest-mock-2',
      title: 'Kreativa sushi-rullar',
      description: 'Tävla om vem som gör mest kreativ sushi',
      deadline_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      image_url: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=800',
      prize: 'Sushi-kit värt 2000 kr'
    },
    {
      id: 'contest-mock-3',
      title: 'Godaste desserter',
      description: 'Tävla med din söta kreation',
      deadline_at: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      image_url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=800',
      prize: 'Köksredskap värt 3000 kr'
    },
    {
      id: 'contest-mock-4',
      title: 'Vegansk innovation',
      description: 'Visa din bästa veganska rätt',
      deadline_at: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
      image_url: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800',
      prize: 'Presentkort värt 2500 kr'
    }
  ];

  const displayContests = contests && contests.length > 0 ? contests : mockContests;

  const contestsWithImages = displayContests.filter(
    contest => contest?.image_url && contest.image_url.trim() !== ''
  );

  const isProduction = import.meta.env.MODE === 'production';
  const showSection = contestsWithImages.length > 0 || !isProduction;

  if (!showSection) {
    return null;
  }

  const subtitleTexts = settings?.subtitleTexts || ['Tävla och vinn fina priser'];
  const rotationInterval = settings?.subtitleRotationInterval || 10000;
  const cardsPerRow = settings?.cardsPerRow || 4;
  const subtitlePlacement = settings?.subtitlePlacement || 'inline';
  const layout = settings?.layout || 'cards-only';
  const featuredImage = settings?.featuredImage;

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
                {settings?.heading || 'Tävlingar'}
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
                {settings?.heading || 'Tävlingar'}
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

        {contestsWithImages.length > 0 ? (
          layout === 'cards-only' || !featuredImage ? (
            <div className={`grid ${gridColsClass} gap-6`}>
              {contestsWithImages.map((contest) => (
                <ContestCard key={contest.id} {...contest} />
              ))}
            </div>
          ) : (
            <div
              className={`flex flex-col lg:flex-row gap-6 ${
                layout === 'image-third' ? 'lg:gap-8' : ''
              }`}
            >
              <div
                className={`rounded-lg overflow-hidden flex-shrink-0 ${
                  layout === 'image-third' ? 'lg:w-1/3' : 'lg:w-1/2'
                }`}
              >
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="w-full h-full object-cover min-h-[300px]"
                />
              </div>
              <div className="flex-1">
                <div
                  className="grid gap-6"
                  style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))'
                  }}
                >
                  {contestsWithImages.map((contest) => (
                    <ContestCard key={contest.id} {...contest} />
                  ))}
                </div>
              </div>
            </div>
          )
        ) : (
          <EmptyState text="Inget här ännu" />
        )}
      </div>
    </section>
  );
}

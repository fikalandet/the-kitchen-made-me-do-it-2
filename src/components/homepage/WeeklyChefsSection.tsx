import { useState, useEffect } from 'react';
import { ChefOfWeekCard } from '../CardKit/variants/ChefOfWeekCard';
import { EmptyState } from './EmptyState';

interface WeeklyChefsSectionProps {
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
    featuredChefs?: Array<{ chefId: string; comment: string }>;
    cardsPerRow?: number;
    cardBackgroundColor?: string;
    cardNameColor?: string;
    cardCommentColor?: string;
    chefImageSize?: number;
    chefImageShape?: 'round' | 'square';
    chefImagePlacement?: 'left' | 'center' | 'right';
  };
  chefs: any[];
}

export function WeeklyChefsSection({ settings, chefs }: WeeklyChefsSectionProps) {
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const mockWeeklyChefs = [
    {
      id: 'chef-mock-1',
      display_name: 'Anna Svensson',
      avatar_url: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=200',
      city: 'Stockholm',
      kitchen_open_status: 'open',
      kitchenComment: 'Känd för sina fantastiska pastarätter med en modern twist'
    },
    {
      id: 'chef-mock-2',
      display_name: 'Erik Johansson',
      avatar_url: 'https://images.pexels.com/photos/4253320/pexels-photo-4253320.jpeg?auto=compress&cs=tinysrgb&w=200',
      city: 'Göteborg',
      kitchen_open_status: 'soon',
      kitchenComment: 'Mästare på vegetariska rätter som får köttalskare att ändra sig'
    },
    {
      id: 'chef-mock-3',
      display_name: 'Sofia Lindberg',
      avatar_url: 'https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg?auto=compress&cs=tinysrgb&w=200',
      city: 'Malmö',
      kitchen_open_status: 'open',
      kitchenComment: 'Specialiserad på asiatisk fusion med lokala råvaror'
    }
  ];

  const subtitleTexts = settings.subtitleTexts || ['Hetare än chili, och har fler följare än din grannes surdegsblogg'];
  const rotationInterval = settings.subtitleRotationInterval || 10000;
  const cardsPerRow = settings.cardsPerRow || 3;
  const subtitlePlacement = settings.subtitlePlacement || 'inline';
  const featuredChefs = settings.featuredChefs || [];

  const filteredChefs = chefs.filter(chef =>
    featuredChefs.some(fc => fc.chefId === chef.id)
  );

  const chefsWithComments = filteredChefs.map(chef => {
    const featuredChef = featuredChefs.find(fc => fc.chefId === chef.id);
    return {
      ...chef,
      kitchenComment: featuredChef?.comment || ''
    };
  });

  const displayChefs = chefsWithComments.length > 0 ? chefsWithComments : mockWeeklyChefs;

  const isProduction = import.meta.env.MODE === 'production';
  const showSection = displayChefs.length > 0 || !isProduction;

  if (!showSection) {
    return null;
  }

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
    cardsPerRow === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
    cardsPerRow === 5 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5' :
    cardsPerRow === 6 ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6' :
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

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
                {settings.heading || 'Veckans kockar'}
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
                {settings.heading || 'Veckans kockar'}
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

        {displayChefs.length > 0 ? (
          <div className={`grid ${gridColsClass} gap-6`}>
            {displayChefs.map((chef) => (
              <ChefOfWeekCard
                key={chef.id}
                kitchenName={chef.display_name || 'Okänd kock'}
                adminComment={chef.kitchenComment || ''}
                chef={{
                  id: chef.id,
                  name: chef.display_name || 'Okänd kock',
                  avatarUrl: chef.avatar_url || 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=200',
                  openStatus: chef.kitchen_open_status || 'closed',
                  membership: 'free'
                }}
                imageShape={settings.chefImageShape || 'round'}
                imageSize={settings.chefImageSize || 112}
                imagePlacement={settings.chefImagePlacement || 'center'}
                cardBackgroundColor={settings.cardBackgroundColor}
                cardNameColor={settings.cardNameColor}
                cardCommentColor={settings.cardCommentColor}
                onVisitKitchen={() => console.log('Visit kitchen:', chef.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState text="Inga kockar valda" />
        )}
      </div>
    </section>
  );
}

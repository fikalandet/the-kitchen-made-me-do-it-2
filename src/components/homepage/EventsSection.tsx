import { useState, useEffect } from 'react';
import { EventCard } from '../CardKit/variants/EventCard';
import { EmptyState } from './EmptyState';
import { transformChef } from '../../lib/adapters/cardKitAdapters';

interface EventsSectionProps {
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
  events: any[];
}

export function EventsSection({ settings, events }: EventsSectionProps) {
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const mockEvents = [
    {
      id: 'event-mock-1',
      title: 'Matlagningskurs: Italiensk pasta',
      description: 'Lär dig laga autentisk pasta från grunden',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '18:00',
      venue: 'Köket',
      city: 'Stockholm',
      price: { price: 499, currency: 'SEK' },
      seats: 12,
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      chef: { id: 'mock-chef', display_name: 'Kock' }
    },
    {
      id: 'event-mock-2',
      title: 'Sushi-workshop',
      description: 'Perfekt sushi-rullar för alla nivåer',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '19:00',
      venue: 'Köket',
      city: 'Göteborg',
      price: { price: 599, currency: 'SEK' },
      seats: 10,
      image_url: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=800',
      chef: { id: 'mock-chef', display_name: 'Kock' }
    },
    {
      id: 'event-mock-3',
      title: 'Grillfest i trädgården',
      description: 'Smaka goda grillrätter och mingla',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '17:00',
      venue: 'Utomhus',
      city: 'Malmö',
      price: { price: 399, currency: 'SEK' },
      seats: 25,
      image_url: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=800',
      chef: { id: 'mock-chef', display_name: 'Kock' }
    },
    {
      id: 'event-mock-4',
      title: 'Bakning: Sourdough-bröd',
      description: 'Från deg till färdigt bröd',
      date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00',
      venue: 'Bageri',
      city: 'Uppsala',
      price: { price: 449, currency: 'SEK' },
      seats: 8,
      image_url: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=800',
      chef: { id: 'mock-chef', display_name: 'Kock' }
    }
  ];

  const displayEvents = events && events.length > 0 ? events : mockEvents;

  const eventsWithImages = displayEvents.filter(
    event => event?.image_url && event.image_url.trim() !== ''
  );

  const isProduction = import.meta.env.MODE === 'production';
  const showSection = eventsWithImages.length > 0 || !isProduction;

  if (!showSection) {
    return null;
  }

  const subtitleTexts = settings.subtitleTexts || ['Mat, mingel och nya kunskaper'];
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
                {settings.heading || 'Evenemang'}
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
                {settings.heading || 'Evenemang'}
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

        {eventsWithImages.length > 0 ? (
          <div className={`grid ${gridColsClass} gap-6`}>
            {eventsWithImages.map((event, idx) => {
              const chef = transformChef(event.chef || { id: 'mock-chef', display_name: 'Kock' });
              return (
                <EventCard
                  key={event.id || idx}
                  id={event.id}
                  imageUrl={event.image_url}
                  title={event.title}
                  chef={chef}
                  description={event.description}
                  price={event.price}
                  seats={event.seats}
                  city={event.city}
                  venue={event.venue}
                  address={event.address}
                  date={event.date}
                  time={event.time}
                  onShare={() => console.log('Share:', event.id)}
                  onFavToggle={() => console.log('Favorite toggle:', event.id)}
                  isFaved={false}
                  onComment={() => console.log('Comment:', event.id)}
                  onAttending={(status) => console.log('Attending:', status)}
                  attendingStatus={null}
                  attendingCounts={{ yes: 0, maybe: 0 }}
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

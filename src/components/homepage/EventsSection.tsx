import React from 'react';
import { SectionWrapper } from './SectionWrapper';
import { EventCard } from './EventCard';
import { EmptyState } from './EmptyState';

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  location: string;
  price: number;
  image_url?: string;
  attending_count?: number;
}

interface EventsSectionProps {
  events: Event[];
}

export const EventsSection: React.FC<EventsSectionProps> = ({ events }) => {
  return (
    <SectionWrapper title="Evenemang" subtitle="Kommande matevenemang">
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      ) : (
        <EmptyState text="Inget här ännu" />
      )}
    </SectionWrapper>
  );
};

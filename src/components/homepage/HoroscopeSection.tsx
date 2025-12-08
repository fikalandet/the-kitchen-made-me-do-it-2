import React from 'react';
import { HoroscopeCard } from './HoroscopeCard';
import { EmptyState } from './EmptyState';

interface Horoscope {
  sign: string;
  symbol: string;
  prediction: string;
}

interface HoroscopeSectionProps {
  horoscopes: Horoscope[];
}

export const HoroscopeSection: React.FC<HoroscopeSectionProps> = ({ horoscopes }) => {
  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 text-center">
          <h2 className="font-lobster text-3xl text-gray-800 mb-1">Horoskop</h2>
          <p className="text-gray-700">Klicka för att vända och läsa ditt horoskop</p>
        </div>
        {horoscopes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {horoscopes.map((horoscope, index) => (
              <HoroscopeCard key={index} {...horoscope} />
            ))}
          </div>
        ) : (
          <EmptyState text="Inget här ännu" />
        )}
      </div>
    </section>
  );
};

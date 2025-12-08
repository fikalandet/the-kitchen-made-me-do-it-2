import React from 'react';
import { SectionWrapper } from './SectionWrapper';
import { DishCard } from './DishCard';
import { EmptyState } from './EmptyState';

interface Dish {
  id: string;
  name: string;
  price: number;
  image_url?: string;
}

interface MoodDishesSectionProps {
  dishes: Dish[];
}

export const MoodDishesSection: React.FC<MoodDishesSectionProps> = ({ dishes }) => {
  return (
    <SectionWrapper title="Humörkäk" subtitle="Rätter baserade på ditt humör" showFilter>
      {dishes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dishes.map((dish) => (
            <DishCard
              key={dish.id}
              id={dish.id}
              name={dish.name}
              chef_name="Kock"
              price={dish.price || 0}
              image_url={dish.image_url}
            />
          ))}
        </div>
      ) : (
        <EmptyState text="Inget här ännu" />
      )}
    </SectionWrapper>
  );
};

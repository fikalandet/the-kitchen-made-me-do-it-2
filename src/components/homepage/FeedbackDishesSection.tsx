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

interface FeedbackDishesSectionProps {
  dishes: Dish[];
}

export const FeedbackDishesSection: React.FC<FeedbackDishesSectionProps> = ({ dishes }) => {
  return (
    <SectionWrapper title="Testkäka & Tyck till" subtitle="Prova nya rätter och ge feedback">
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
